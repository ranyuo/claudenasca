# Correcciones y optimización QA30 · 29/10/2026

Correcciones de código para los hallazgos de [QA30-RESULTADOS-NASCA.md](QA30-RESULTADOS-NASCA.md) y optimización de la carga del portal.

## Correcciones

| Hallazgo | Cambio | Archivo |
|---|---|---|
| H1 · Otro administrador podía desactivar `nasca` | La cuenta administradora principal (la más antigua) solo cambia su estado, rol o contraseña desde su propia sesión. Otro administrador recibe un error 403. Los datos no críticos (nombre, correo) siguen siendo editables. | `portal-private/Accounts.php` |
| H4 · Guardado no solicitado en cada ingreso | El nombre del director se arma con la misma regla en el navegador y en el servidor: se colapsan los espacios repetidos, se usa solo un director publicado y, si no hay ninguno, se conserva el valor actual. | `portal-private/views/portal.php` (`fullName`, `HOST.inst`), `portal-private/Rules.php` |
| H3 · El panel mostraba 0 visitas | La respuesta del guardado incluye las visitas de `pisco_visits`, igual que la carga inicial (método `visitCounts()`). | `portal-private/Portal.php` |
| H2 · No había forma de editar las áreas | "Editar áreas" abre `#/admin/expedientes/areas/editar`, con el editor de **áreas receptoras** y **tipos de trámite**. Antes llevaba a Configuración académica, que no tiene esa opción. | `portal-private/views/portal.php` (`mpvAreasEdit`, `V.mesaCfg`) |
| H10 · Error genérico al subir un archivo inválido | Mesa de partes muestra el motivo real que da el servidor, por ejemplo "El contenido del archivo no coincide con un formato permitido". | `portal-private/views/portal.php` |
| H9 · Cabeceras de seguridad | Se agregan `Strict-Transport-Security` (solo con HTTPS) y `Permissions-Policy`, y se quita `X-Powered-By`. | `portal-private/bootstrap.php` |
| H11 · El buscador de auditoría no buscaba en el detalle | El buscador también busca en el detalle de cada registro. | `public_html/auditoria.php` |

## Optimización de la carga

Medido con los datos públicos reales de `nasca.aplicacion.io`:

| | Antes | Ahora |
|---|---|---|
| HTML de cada visita (comprimido) | ≈ 811 KB, sin caché | ≈ 43 KB |
| CSS + JavaScript del portal | 292 KB comprimidos, incrustados y reenviados en cada visita | 5 archivos versionados que se descargan una vez y quedan en caché |
| Imágenes en base64 (logo ×2, foto, noticias) | ≈ 650 KB dentro de los datos | Archivos `/assets/cache/<hash>.png`, en caché por 1 año |

1. **CSS y JavaScript estáticos fuera de la vista.**
   - `portal-private/views/portal.php` pasó de 1 MB a 2 KB y ahora solo contiene el armazón y los datos.
   - El código está en `public_html/assets/app/`: `portal.css` y `portal-1.js` a `portal-4.js`, en el mismo orden que antes.
   - `portal_asset()` agrega `?v=<fecha de modificación>`, así cada actualización obliga al navegador a descargar la versión nueva. También se aplica a `portal-server.js`.
   - **El código del portal ahora se edita en `public_html/assets/app/`.**
2. **Imágenes incrustadas para visitantes.**
   - Para un visitante sin sesión, las imágenes `data:image/...` de más de 8 KB se escriben una vez en `public_html/assets/cache/` (nombre = hash SHA-256 del contenido, tipo verificado con Fileinfo) y se envían como URL.
   - Tras cargar la página, `portal-server.js` vuelve a convertirlas a `data:` en memoria, porque los PDF las necesitan así.
   - Con sesión iniciada los datos no cambian, así que la edición funciona igual.
   - Si la carpeta no se puede escribir, se mantiene el comportamiento anterior.
3. `.htaccess` en `assets/app/` y `assets/cache/`: caché de un año (`immutable`).

## Verificación

| Prueba | Resultado |
|---|---|
| `php tests/qa30-correcciones.php` (nueva) | 19/19. Con el `Accounts.php` anterior falla en "Otro administrador no puede desactivar la cuenta principal" |
| Batería del proyecto (`run`, `parity`, `nasca-import`, `functional-fixes`, `migration`…) | Sin cambios respecto de la línea base. Las pruebas que ya fallaban antes de estos cambios fallan igual: dependen del orden o de datos sembrados por otras pruebas |
| `node tests/nasca-content.cjs`, `tests/qa/scoped-ids-and-schedules.cjs` | Aprobadas; adaptadas para leer `public_html/assets/app/` |
| `tests/qa30/local-verificacion.cjs` (Chromium + PHP local + MariaDB) | 13/13: portal sin errores, archivos versionados, logo en caché y rehidratado, el administrador entra sin guardados automáticos, visitas reales en el panel, editor de áreas (crear y eliminar), mensaje real en Mesa de partes y 38 módulos de la intranet sin errores |

## Cómo subir a Hostinger

1. Respalda archivos y base de datos desde *Copias de seguridad* o hPanel.
2. Sube y reemplaza estos archivos:
   - `portal-private/`: `Accounts.php`, `Portal.php`, `Rules.php`, `bootstrap.php` y `views/portal.php`.
   - `public_html/`: `portal-server.js`, `auditoria.php` y la carpeta **nueva** `assets/app/` (con su `.htaccess`).
3. Crea `public_html/assets/cache/` con el `.htaccess` incluido, y comprueba que PHP pueda escribir en ella. Si no puede, el portal funciona igual, pero sin esa optimización de imágenes.
4. No ejecutes `actualizar.php`: no hay cambios de esquema.
5. **Borra `public_html/actualizar.php` y `public_html/recuperar.php`** (H5).
6. Comprueba lo siguiente:
   - Que el portal cargue.
   - En *Mesa de partes › Áreas receptoras › Editar áreas*, reemplaza las áreas QA29 por las reales (H2).
   - Que *Inicio* muestre las visitas.
