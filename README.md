# Portal IESTP Nasca

Archivos para publicar en Hostinger. Solo contiene las dos carpetas del sitio:

- `portal-private/`: código PHP, vistas y datos. Va **fuera** de `public_html`, al mismo nivel.
- `public_html/`: raíz pública del dominio, con la página, la intranet, el CSS, el JavaScript y las imágenes.

**No incluye** (y no debe sobrescribirse en el servidor):
- `portal-private/config.php`
- `portal-private/backups/`
- `portal-private/install.lock`

No hay cambios de base de datos.

## Cómo publicar

1. **Respaldo:** en la intranet, *Copias de seguridad › Crear respaldo completo* y descárgalo.
2. **Descarga el código:** en GitHub, *Code › Download ZIP*.
3. **Sube el ZIP** con hPanel › Administrador de archivos a la carpeta que **contiene** `portal-private/` y `public_html/`, un nivel arriba de `public_html`.
4. **Extrae y sobrescribe:** clic derecho › *Extraer* y acepta **sobrescribir**. GitHub mete todo dentro de una carpeta (`claudenasca-main/`); mueve `portal-private/` y `public_html/` desde ahí y reemplaza las existentes.
   - **No borres las carpetas del servidor antes**: así se conservan `config.php`, `backups/` e `install.lock`.
5. **Borra lo que sobra** en el servidor, si todavía existe:
   - `public_html/install.php`, `actualizar.php` y `recuperar.php`.
   - `public_html/assets/chincha/`, que el portal no usa.
6. **Permisos:** `public_html/assets/cache/` debe tener permisos **755**.
7. **Comprueba:** abre el sitio con **Ctrl+F5** y entra a la intranet.

## Dónde se edita

- **CSS y JavaScript del portal:** `public_html/assets/app/` (`portal.css` y `portal-1.js` a `portal-4.js`).
- **Armazón de la página:** `portal-private/views/portal.php`.

El historial de pruebas, informes y herramientas de desarrollo sigue disponible en el historial de Git (commit `14bef9b`).
