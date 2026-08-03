/**
 * Mantiene despierto el proyecto de Supabase.
 *
 * El plan gratuito pausa un proyecto tras ~7 días sin peticiones a su API, y
 * despausarlo es manual. Un cron diario de Vercel (ver `vercel.json`) llama a
 * esta función, que hace una consulta mínima de solo lectura: eso cuenta como
 * actividad y el proyecto nunca llega a los 7 días.
 *
 * Se usa `fetch` contra la API REST en vez del cliente de Supabase para no
 * arrastrar una dependencia a la función; con `head` y `count` no se
 * transfiere ninguna fila, solo el total en una cabecera.
 */
// Se prueban varias tablas en orden: si alguna se renombra o todavía no se ha
// aplicado su migración, el ping no se cae en silencio y sigue con la siguiente.
const TABLES = ['alerts', 'community_posts', 'community_likes'];

export default async function handler(req, res) {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    return res.status(500).json({ ok: false, error: 'Faltan las variables de Supabase' });
  }

  // El cron no debe servirse desde caché: si Vercel devolviera una respuesta
  // guardada, Supabase no vería la petición y el ping no serviría de nada.
  res.setHeader('Cache-Control', 'no-store');

  const tried = [];
  for (const table of TABLES) {
    try {
      const response = await fetch(`${url}/rest/v1/${table}?select=id&limit=1`, {
        headers: { apikey: key, Authorization: `Bearer ${key}` },
      });

      if (response.ok) {
        return res.status(200).json({ ok: true, table, at: new Date().toISOString() });
      }
      tried.push(`${table}: ${response.status}`);
    } catch (error) {
      tried.push(`${table}: ${error.message}`);
    }
  }

  console.error('[keepalive] ninguna tabla respondió:', tried.join(' · '));
  return res.status(500).json({ ok: false, tried });
}
