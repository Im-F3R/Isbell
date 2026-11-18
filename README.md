# Isbell Centro Estético — sitio web

Sitio web de 14 páginas hecho con HTML, CSS y JavaScript, sin dependencias ni proceso de compilación.

## Páginas

| # | Archivo | Página |
|---|---|---|
| 1 | `index.html` | Inicio |
| 2 | `servicios.html` | Catálogo con búsqueda, filtros y orden |
| 3 | `categoria.html?c=facial` | Categoría (`facial`, `masajes`, `experiencias`, `nutricion`) |
| 4 | `buscar.html?q=masaje` | Resultados de búsqueda |
| 5 | `servicio.html?id=masaje-relajante` | Detalle del servicio |
| 6 | `experiencias.html` | Experiencias de bienestar |
| 7 | `reservar.html` | Agenda: servicio, calendario y horarios |
| 8 | `datos.html` | Datos del cliente, modalidad de pago y condiciones |
| 9 | `confirmacion.html?codigo=…` | Confirmación de la cita |
| 10 | `acceso.html` | Iniciar sesión / crear cuenta |
| 11 | `mi-cuenta.html` | Perfil y configuración |
| 12 | `mis-citas.html` | Citas: filtrar, reprogramar y cancelar |
| 13 | `nosotros.html` | Nosotros |
| 14 | `ayuda.html` | Preguntas frecuentes, políticas, contacto y mapa |

## Cómo editar el contenido

Casi todo se cambia en **`assets/js/data.js`**:

- **Servicios**: nombre, precio (`null` = «Consultar precio»), duración, descripción, beneficios e imágenes.
- **Negocio**: WhatsApp, dirección, horario y redes sociales.
- **Agenda**: días laborables y horarios disponibles (los actuales son ilustrativos).
- **Pagos**: activa solo los métodos que el centro apruebe.

El encabezado y el pie de página son iguales en todas las páginas y se generan en `assets/js/app.js`.
Los estilos (paleta, tipografías y componentes) están en `assets/css/styles.css`.

## Cómo funcionan las reservas en esta versión

- No hay servidor. Las citas y las cuentas se guardan en el navegador de cada visitante (`localStorage`).
- La agenda evita que se reserve dos veces el mismo horario **en ese navegador**, pero el centro todavía no ve las reservas automáticamente.
- Al terminar, la clienta envía su solicitud por WhatsApp con un mensaje ya escrito, y el personal confirma la cita. Por eso las citas quedan como «Pendiente».
- Para tener disponibilidad real compartida, confirmación automática, pagos en línea o un panel para el personal, hace falta un servidor y una base de datos (por ejemplo Firebase o Supabase). Ver «Versión con reservas automatizadas» en los lineamientos.

## Ver el sitio

Abre `index.html` en el navegador, o publícalo gratis en GitHub Pages, Netlify o Vercel.
