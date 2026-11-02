ALTER TABLE public."TipoCambio"
    ALTER COLUMN tipo_cambio TYPE numeric(10, 3)
    USING round(tipo_cambio, 3);