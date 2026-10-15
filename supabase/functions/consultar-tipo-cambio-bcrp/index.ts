
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";


// =========================================================
// CONFIGURACIÓN DEL BCRP
// =========================================================

// Tipo de cambio interbancario de venta, fin de período.
const BCRP_SERIE = "PN01215PM";

const BCRP_BASE_URL =
    "https://estadisticas.bcrp.gob.pe/estadisticas/series/api";


// =========================================================
// CONFIGURACIÓN CORS
// =========================================================

// Permite las solicitudes desde el frontend de SCGCA.
const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
};


// =========================================================
// FUNCIÓN PARA GENERAR RESPUESTAS JSON
// =========================================================

/**
 * Construye respuestas JSON con los encabezados CORS.
 * Permite controlar el código HTTP y el contenido devuelto.
 */
function respuesta(
    body: Record<string, unknown>,
    status = 200,
) {
    return new Response(JSON.stringify(body), {
        status,
        headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
        },
    });
}


// =========================================================
// NORMALIZAR EL NOMBRE DEL MES DEVUELTO POR EL BCRP
// =========================================================

/**
 * Convierte la abreviatura del mes devuelta por el BCRP
 * en su número correspondiente.
 *
 * Ejemplos:
 * "Sep.2026" -> 9
 * "Oct.2026" -> 10
 */
function obtenerMesBCRP(nombre: string): number | null {
    const meses: Record<string, number> = {
        ene: 1,
        feb: 2,
        mar: 3,
        abr: 4,
        may: 5,
        jun: 6,
        jul: 7,
        ago: 8,
        sep: 9,
        oct: 10,
        nov: 11,
        dic: 12,
    };

    const coincidencia = nombre
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .match(/^([a-z]+)\.?\s*(\d{4})$/);

    if (!coincidencia) {
        return null;
    }

    return meses[coincidencia[1]] ?? null;
}


// =========================================================
// RESPUESTA CONTROLADA: PERÍODO NO DISPONIBLE
// =========================================================

/**
 * Devuelve un resultado válido para la aplicación cuando
 * el BCRP todavía no publica el tipo de cambio solicitado.
 *
 * Se utiliza HTTP 200 para que el frontend pueda procesar
 * disponible: false sin recibir un error HTTP genérico.
 *
 * No inserta ni modifica registros en la base de datos.
 */
function respuestaPeriodoNoDisponible(
    anho: number,
    mes: number,
    periodo: string,
) {
    return respuesta({
        disponible: false,
        anho,
        mes,
        periodo,
        mensaje:
            `El tipo de cambio de ${String(mes).padStart(2, "0")}/${anho} ` +
            "aún no está disponible en el BCRP. Intenta nuevamente más adelante.",
    });
}


// =========================================================
// EDGE FUNCTION
// =========================================================

Deno.serve(async (req: Request) => {

    // -----------------------------------------------------
    // 1. GESTIONAR LAS SOLICITUDES CORS
    // -----------------------------------------------------

    if (req.method === "OPTIONS") {
        return new Response("ok", {
            headers: corsHeaders,
        });
    }

    // -----------------------------------------------------
    // 2. VALIDAR EL MÉTODO HTTP
    // -----------------------------------------------------

    if (req.method !== "POST") {
        return respuesta(
            { error: "Método no permitido." },
            405,
        );
    }

    try {

        // =================================================
        // 3. VALIDAR CONFIGURACIÓN Y AUTENTICACIÓN
        // =================================================

        const supabaseUrl = Deno.env.get("SUPABASE_URL");
        const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
        const authorization = req.headers.get("Authorization");

        if (
            !supabaseUrl ||
            !supabaseAnonKey ||
            !authorization
        ) {
            console.error(
                "[BCRP] Falta configuración o encabezado de autorización.",
            );

            return respuesta(
                {
                    error:
                        "Falta la configuración o autenticación de Supabase.",
                },
                401,
            );
        }

        // Utilizar la sesión del usuario que realiza la solicitud.
        const supabase = createClient(
            supabaseUrl,
            supabaseAnonKey,
            {
                global: {
                    headers: {
                        Authorization: authorization,
                    },
                },
                auth: {
                    persistSession: false,
                    autoRefreshToken: false,
                },
            },
        );

        // Validar el token contra Supabase Auth.
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            console.error(
                "[BCRP] Error de autenticación:",
                authError?.message,
            );

            return respuesta(
                {
                    error:
                        "La sesión no es válida. Inicia sesión nuevamente.",
                },
                401,
            );
        }


        // =================================================
        // 4. VALIDAR EL PERFIL Y EL PERMISO ADMIN
        // =================================================

        const { data: perfil, error: perfilError } = await supabase
            .from("usuarios")
            .select("estado, permiso:permiso(nombre)")
            .eq("auth_user_id", user.id)
            .maybeSingle();

        if (perfilError || !perfil) {
            console.error(
                "[BCRP] Error verificando perfil:",
                perfilError,
            );

            return respuesta(
                {
                    error:
                        "No se encontró un perfil autorizado en SCGCA.",
                },
                403,
            );
        }

        // Obtener el nombre del permiso, contemplando una relación
        // que pueda ser devuelta como objeto o como arreglo.
        const permisoNombre = Array.isArray(perfil.permiso)
            ? perfil.permiso[0]?.nombre
            : perfil.permiso?.nombre;

        const usuarioActivo =
            String(perfil.estado).toUpperCase() === "ACTIVO";

        const usuarioAdmin =
            String(permisoNombre).toUpperCase() === "ADMIN";

        if (!usuarioActivo || !usuarioAdmin) {
            return respuesta(
                {
                    error:
                        "Solo un usuario activo con permiso ADMIN puede consultar esta información.",
                },
                403,
            );
        }


        // =================================================
        // 5. VALIDAR EL PERÍODO SOLICITADO
        // =================================================

        let body: Record<string, unknown>;

        try {
            body = await req.json();
        } catch {
            return respuesta(
                {
                    error:
                        "El cuerpo de la solicitud no es JSON válido.",
                },
                400,
            );
        }

        const anho = Number(body.anho);
        const mes = Number(body.mes);

        if (
            !Number.isInteger(anho) ||
            !Number.isInteger(mes) ||
            anho < 2000 ||
            anho > 2100 ||
            mes < 1 ||
            mes > 12
        ) {
            return respuesta(
                {
                    error: "El año o mes solicitado no es válido.",
                },
                400,
            );
        }


        // =================================================
        // 6. OBTENER EL ÚLTIMO PERÍODO DEL HISTÓRICO
        // =================================================

        const { data: ultimo, error: ultimoError } = await supabase
            .from("TipoCambio")
            .select("anho, mes")
            .order("anho", { ascending: false })
            .order("mes", { ascending: false })
            .limit(1)
            .maybeSingle();

        if (ultimoError) {
            console.error(
                "[BCRP] Error consultando histórico:",
                ultimoError,
            );

            return respuesta(
                {
                    error:
                        "No se pudo validar el histórico. Verifica los permisos de lectura de TipoCambio.",
                },
                403,
            );
        }

        if (!ultimo) {
            return respuesta(
                {
                    error:
                        "El histórico está vacío. Debes cargar los períodos iniciales antes de consultar el siguiente mes.",
                },
                409,
            );
        }


        // =================================================
        // 7. VALIDAR LA CORRELATIVIDAD MENSUAL
        // =================================================

        // Calcular el siguiente período permitido.
        const siguienteAnho = ultimo.mes === 12
            ? ultimo.anho + 1
            : ultimo.anho;

        const siguienteMes = ultimo.mes === 12
            ? 1
            : ultimo.mes + 1;

        // Impedir consultas de períodos anteriores, posteriores
        // o distintos al siguiente mes del histórico.
        if (
            anho !== siguienteAnho ||
            mes !== siguienteMes
        ) {
            return respuesta(
                {
                    error:
                        `El siguiente período permitido es ${siguienteAnho}-${String(siguienteMes).padStart(2, "0")}.`,
                    anho: siguienteAnho,
                    mes: siguienteMes,
                },
                409,
            );
        }


        // =================================================
        // 8. CONSULTAR EL BCRP
        // =================================================

        const periodo =
            `${anho}-${String(mes).padStart(2, "0")}`;

        const url =
            `${BCRP_BASE_URL}/${BCRP_SERIE}/json/${periodo}/${periodo}`;

        console.log("[BCRP] Serie:", BCRP_SERIE);
        console.log("[BCRP] Período solicitado:", periodo);

        // La consulta externa tiene un tiempo límite para evitar
        // que la solicitud quede esperando indefinidamente.
        const controller = new AbortController();
        const timeout = setTimeout(
            () => controller.abort(),
            15000,
        );

        let bcrpResponse: Response;

        try {
            bcrpResponse = await fetch(url, {
                signal: controller.signal,
            });
        } catch (fetchError) {
            console.error(
                "[BCRP] Error de conexión:",
                fetchError,
            );

            return respuesta(
                {
                    error:
                        "No se pudo conectar con el servicio del BCRP. Intenta nuevamente más tarde.",
                    periodo,
                },
                502,
            );
        } finally {
            clearTimeout(timeout);
        }

        // Un error HTTP de la fuente externa no equivale
        // a un período sin publicar.
        if (!bcrpResponse.ok) {
            console.error(
                "[BCRP] Error HTTP:",
                bcrpResponse.status,
            );

            return respuesta(
                {
                    error:
                        "El servicio del BCRP respondió con un error. Intenta nuevamente más tarde.",
                    periodo,
                },
                502,
            );
        }


        // =================================================
        // 9. PROCESAR LA RESPUESTA DEL BCRP
        //
        // Los períodos se encuentran en bcrpData.periods,
        // no dentro de bcrpData.config.series[0].
        // =================================================

        let bcrpData: {
            config?: {
                series?: Array<{
                    name?: string;
                }>;
            };
            periods?: Array<{
                name?: string;
                values?: unknown[];
            }>;
        };

        try {
            bcrpData = await bcrpResponse.json();
        } catch (parseError) {
            console.error(
                "[BCRP] Respuesta JSON inválida:",
                parseError,
            );

            return respuesta(
                {
                    error:
                        "El BCRP devolvió una respuesta que no se pudo procesar.",
                    periodo,
                },
                502,
            );
        }

        console.log(
            "[BCRP] Respuesta recibida:",
            JSON.stringify(bcrpData),
        );

        const series = bcrpData?.config?.series;
        const periods = bcrpData?.periods;

        // Verificar que el servicio devuelva la serie solicitada.
        if (
            !Array.isArray(series) ||
            series.length === 0
        ) {
            console.error(
                "[BCRP] No se encontró la serie esperada.",
            );

            return respuesta(
                {
                    error:
                        "El BCRP no devolvió la información de la serie solicitada.",
                    periodo,
                },
                502,
            );
        }

        // Confirmar que la serie sea de fin de período,
        // interbancario y venta.
        const nombreSerie = String(
            series[0]?.name ?? "",
        )
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase();

        if (
            !nombreSerie.includes("fin de periodo") ||
            !nombreSerie.includes("interbancario") ||
            !nombreSerie.includes("venta")
        ) {
            console.error(
                "[BCRP] Nombre de serie inesperado:",
                series[0]?.name,
            );

            return respuesta(
                {
                    error:
                        "La respuesta del BCRP no corresponde a la serie de fin de período interbancario de venta.",
                    periodo,
                },
                502,
            );
        }


        // =================================================
        // 10. VALIDAR SI EL PERÍODO ESTÁ PUBLICADO
        // =================================================

        // Si el BCRP no devuelve períodos, el dato todavía
        // puede no estar disponible para el mes solicitado.
        if (
            !Array.isArray(periods) ||
            periods.length === 0
        ) {
            console.warn(
                "[BCRP] No hay períodos publicados para:",
                periodo,
            );

            return respuestaPeriodoNoDisponible(
                anho,
                mes,
                periodo,
            );
        }

        // Buscar exactamente el mes y el año solicitados.
        const periodData = periods.find(
            (item) => {
                const nombre = String(item?.name ?? "");

                const coincidencia = nombre
                    .trim()
                    .match(/^([a-záéíóú]+)\.?\s*(\d{4})$/i);

                if (!coincidencia) {
                    return false;
                }

                const mesEncontrado =
                    obtenerMesBCRP(nombre);

                const anhoEncontrado =
                    Number(coincidencia[2]);

                return (
                    mesEncontrado === mes &&
                    anhoEncontrado === anho
                );
            },
        );

        if (!periodData) {
            console.warn(
                "[BCRP] Período solicitado todavía no disponible:",
                periodo,
                periods.map((item) => item?.name),
            );

            return respuestaPeriodoNoDisponible(
                anho,
                mes,
                periodo,
            );
        }


        // =================================================
        // 11. VALIDAR EL VALOR PUBLICADO
        // =================================================

        const rawValue = periodData?.values?.[0];
        const valorTexto = String(rawValue ?? "").trim();

        // El BCRP puede devolver el período sin un valor numérico.
        if (
            !valorTexto ||
            valorTexto === "-" ||
            valorTexto === "—"
        ) {
            console.warn(
                "[BCRP] El período no tiene un valor publicado:",
                periodo,
            );

            return respuestaPeriodoNoDisponible(
                anho,
                mes,
                periodo,
            );
        }

        const tipoCambio = Number(valorTexto);

        if (
            !Number.isFinite(tipoCambio) ||
            tipoCambio <= 0
        ) {
            console.error(
                "[BCRP] Valor inválido:",
                rawValue,
            );

            return respuesta(
                {
                    error:
                        `El BCRP devolvió un valor inválido para ${periodo}.`,
                    periodo,
                },
                502,
            );
        }


        // =================================================
        // 12. DEVOLVER LA PROPUESTA AL ADMINISTRADOR
        //
        // No se inserta ni modifica la tabla TipoCambio.
        // El registro requiere confirmación manual en SCGCA.
        // =================================================

        console.log(
            "[BCRP] Consulta exitosa:",
            {
                periodo,
                tipoCambio,
                serie: BCRP_SERIE,
            },
        );

        return respuesta({
            disponible: true,
            anho,
            mes,
            tipo_cambio: tipoCambio,
            fuente: "BCRP",
            serie: BCRP_SERIE,
            descripcion:
                "Tipo de cambio interbancario de venta, fin de período",
            periodo,
            consultado_en: new Date().toISOString(),
            requiere_confirmacion_admin: true,
        });

    } catch (error) {

        // Registrar el detalle técnico en Supabase,
        // sin exponer información sensible al frontend.
        console.error(
            "[BCRP] Error inesperado:",
            error,
        );

        return respuesta(
            {
                error:
                    "Ocurrió un error inesperado al consultar el tipo de cambio. Intenta nuevamente.",
            },
            500,
        );
    }
});
