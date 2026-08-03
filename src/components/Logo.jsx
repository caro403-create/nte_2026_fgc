/**
 * Marca NTE — Sistema de Defensa Activa.
 *
 * Un escudo (la defensa) con un nodo sensor y sus dos ondas de detección
 * (lo activo). Se dibuja en `currentColor`, así que el mismo componente sirve
 * sobre el encabezado claro y sobre el oscuro sin duplicar el trazado.
 *
 * La versión maciza de la pestaña vive en `public/favicon.svg`: a 16 px un
 * contorno se pierde, por eso ahí la silueta va rellena.
 */
export default function Logo({ className = 'w-5 h-5' }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {/* Escudo */}
      <path
        d="M32 6.5 L54.5 15.7 V33 c0 13.4-9.2 22.2-22.5 27 C18.7 55.2 9.5 46.4 9.5 33 V15.7 Z"
        strokeWidth="4.5"
      />
      {/* Ondas del nodo */}
      <path d="M21.7 34.6 A11 11 0 0 1 42.3 34.6" strokeWidth="4.2" />
      <path d="M15.6 32.4 A17.5 17.5 0 0 1 48.4 32.4" strokeWidth="4.2" opacity="0.55" />
      {/* Nodo sensor */}
      <circle cx="32" cy="38.6" r="3.6" fill="currentColor" stroke="none" />
    </svg>
  );
}
