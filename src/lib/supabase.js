import { createClient } from '@supabase/supabase-js'

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  'http://127.0.0.1:54321'

const supabaseKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  'development-anon-key'

if (
  !import.meta.env.VITE_SUPABASE_URL ||
  (!import.meta.env.VITE_SUPABASE_ANON_KEY &&
    !import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY)
) {
  console.warn(
    'Supabase no está configurado. Define VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY (o VITE_SUPABASE_PUBLISHABLE_KEY) en un archivo .env para habilitar autenticación y datos.',
  )
}

export const supabase = createClient(
  supabaseUrl,
  supabaseKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  },
)