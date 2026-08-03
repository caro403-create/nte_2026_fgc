# Desplegar NTE en Vercel

Web y backend en un solo proyecto, gratis y con HTTPS. La rama de producción es
**`branch_caro`**.

## Qué se despliega

| Parte | Dónde vive | Qué la sirve en producción |
|---|---|---|
| La web (React + Vite) | `src/`, `public/` | Archivos estáticos generados en `dist/` |
| Proxy de Earth Engine y FIRMS | `api/` | Funciones serverless de Vercel |
| Base de datos y login | Supabase | Ya está hospedado aparte |

En local el backend es `npm run server` (Express en el puerto 3001) y usa
exactamente los mismos módulos de `api/_lib`, así que no hay dos versiones que
se puedan desincronizar.

## Pasos

### 1. Subir la rama a GitHub

```bash
git add -A
git commit -m "feat: logo, documentos oficiales y despliegue en Vercel"
git push origin branch_caro
```

### 2. Crear el proyecto en Vercel

1. Entrar a [vercel.com](https://vercel.com) con la cuenta de GitHub.
2. **Add New → Project** y elegir este repositorio.
3. Vercel detecta Vite solo. No hay que tocar el comando de build ni el
   directorio de salida: ya vienen fijados en `vercel.json`.
4. **No hacer deploy todavía** — primero las variables (paso 3).

### 3. Variables de entorno

En **Settings → Environment Variables**, marcando los tres entornos
(Production, Preview, Development), copiar los valores del `.env` local:

| Variable | Para qué |
|---|---|
| `VITE_SUPABASE_URL` | Cliente: base de datos y autenticación |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Cliente: clave pública de Supabase |
| `VITE_OWM_KEY` | Cliente: capas de OpenWeatherMap |
| `VITE_FIRMS_KEY` | Cliente: consultas a FIRMS desde el navegador |
| `VITE_GEE_SERVICE_ACCOUNT_EMAIL` | **Servidor**: cuenta de servicio de Earth Engine |
| `VITE_GEE_PRIVATE_KEY` | **Servidor**: clave privada, en una línea con `\n` |

`VITE_API_URL` se deja **sin definir**: en Vercel las rutas `/api` viven en el
mismo dominio que la web.

> La clave privada de GEE se pega tal cual está en el `.env`, con los saltos de
> línea escritos como `\n`. Las funciones ya la desescapan.

### 4. Fijar `branch_caro` como rama de producción

**Settings → Git → Production Branch** → escribir `branch_caro` → Save.

Sin este paso Vercel publicaría `main` en el dominio principal y `branch_caro`
quedaría como una vista previa con otra URL.

### 5. Desplegar

**Deployments → Redeploy** (o cualquier `git push origin branch_caro`).

Queda en `https://<nombre-del-proyecto>.vercel.app`. Desde ahí, cada push a
`branch_caro` vuelve a publicar solo.

## Comprobar que quedó bien

1. La portada carga y los dos QR se ven bajo el hero.
2. **Ahora** (observatorio) → activar una capa de Earth Engine: si se dibuja, las
   funciones serverless están leyendo bien las credenciales.
3. Los focos de NASA FIRMS aparecen en el mapa.
4. Cambiar el idioma ES/EN y recargar.
5. Escanear los dos QR desde un celular ajeno a la red local.

Si una capa no carga: **Vercel → Deployments → el despliegue → Functions**, ahí
salen los errores de `api/gee/layer/[type]`.

## Los QR y los PDF

Los cuatro archivos van en `public/docs/` con estos nombres exactos, y se suben
al repo como cualquier otro archivo:

- `NTE_Solucion_Completa_ES.pdf`
- `NTE_Complete_Solution_EN.pdf`
- `qr-solucion-es.png`
- `qr-solution-en.png`

Los QR deben apuntar a la URL final, por ejemplo
`https://<proyecto>.vercel.app/docs/NTE_Solucion_Completa_ES.pdf`. Conviene
generarlos **después** del primer despliegue, cuando ya se sabe el dominio.

## Dominio propio (opcional)

**Settings → Domains → Add**. Vercel da los registros DNS y el certificado HTTPS
se emite solo. Un `.com` cuesta ~US$10–15 al año en cualquier registrador; el
hosting sigue gratis.

## Cosas que conviene saber

- **Plan Hobby de Vercel**: gratis y permanente, para proyectos sin fines
  comerciales. Este califica.
- **Supabase gratis**: pausa los proyectos tras ~1 semana sin actividad. Basta
  con entrar de vez en cuando, o revisarlo antes de la presentación.
- **Duración de las funciones**: `vercel.json` las deja en 60 s, porque Earth
  Engine a veces tarda. Las respuestas se cachean una hora en el borde, así que
  el segundo visitante ya no espera.
- **Hostinger**: no tiene plan gratuito permanente (desde ~US$3/mes) y su
  hosting compartido no ejecuta Node, así que el backend necesitaría un VPS
  aparte. Por eso se eligió Vercel.
