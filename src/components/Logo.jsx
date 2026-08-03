/**
 * Marca Kawsay.
 *
 * Es el emblema circular del logo —el fuego entre los árboles, con el anillo
 * dorado— recortado del archivo original en `public/kawsay/logo.png`. Se usa
 * en la cabecera y en el pie; el logotipo completo, con la palabra KAWSAY
 * debajo, vive en la sección de Saberes que explica el nombre.
 *
 * Se sirve como imagen y no como SVG porque el emblema es una ilustración
 * pintada, no un trazado geométrico: redibujarla a mano la desvirtuaría.
 */
export default function Logo({ className = 'w-9 h-9' }) {
  return (
    <img
      src="/kawsay/emblem.png"
      alt=""
      aria-hidden="true"
      className={`${className} rounded-full object-cover`}
    />
  );
}
