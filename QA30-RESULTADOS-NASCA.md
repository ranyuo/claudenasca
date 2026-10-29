# QA30 · Resultados de pruebas · Portal e Intranet IESTP Nasca · 29/10/2026

Sitio probado: `https://nasca.aplicacion.io` (producción). Plan: [PLAN-PRUEBAS-NASCA-2026-10-29.md](PLAN-PRUEBAS-NASCA-2026-10-29.md).
Detalle caso por caso: [evidencias/qa30/resultados-detalle.md](evidencias/qa30/resultados-detalle.md) · Capturas y JSON: `evidencias/qa30/` · Scripts: `tests/qa30/`.

## 1. Resumen

| Fase | Casos | OK | Falla | Revisar | Bloqueado | N/A |
|---|---|---|---|---|---|---|
| A · Portal público y formularios | 76 | 74 | 1 | 1 | – | – |
| B · CRUD de la intranet y flujos de atención | 154 | 133 | 3 | 10 | 2 | 6 |
| C · Perfiles y permisos (11 usuarios) | 120 | 114 | 1 | 5 | – | – |
| D · Seguridad básica | 18 | 12 | 2 | 4 | – | – |
| **Total** | **368** | **333 (90 %)** | **7** | **20** | **2** | **6** |

- **Respaldo previo:** se creó un respaldo completo en el servidor (ID `8bd878fcc8f2665b8112e6de096240a8`, en *Copias de seguridad*). También se descargó una copia, que no se guarda en el repositorio porque contiene datos personales.
- **Registros creados:** unos 230 registros de prueba `QA30` (179 siguen activos), además de 11 usuarios `qa30_*`, 3 mensajes de contacto, 4 reclamos y 4 expedientes de mesa de partes.
- **Se probó desde la interfaz real:**
  - En el portal: los formularios con captcha.
  - En la intranet: el editor de cada módulo, con el botón "Guardar cambios" o "Registrar".
- **Se verificó directamente en el servidor:**
  - Que cada cambio quedó guardado, consultando la API.
  - Los permisos de cada perfil, con llamadas directas a la API.

## 2. Hallazgos priorizados

### 🔴 Críticos

**H1. Un segundo administrador puede desactivar la cuenta principal `nasca`.**
- **Qué pasó:** con `qa30_admin2` (rol Administrador) se envió un cambio de estado de `nasca` a *Inactivo* y el servidor respondió HTTP 200. La sesión de `nasca` se cerró y la cuenta ya no podía entrar ("Usuario o contraseña incorrectos").
- **Contradicción:** `MEJORA-USUARIOS-ROLES.md` declara la "protección de la cuenta administradora".
- **Estado actual:** la cuenta se **reactivó de inmediato** desde `qa30_admin2` y `nasca` vuelve a entrar.
- **Recomendación:** en `Accounts.php`, impedir desactivar, degradar o cambiar la contraseña de la cuenta principal salvo desde ella misma, e impedir que quede el sistema sin ningún administrador activo.

**H2. Las áreas receptoras de producción son datos de prueba y no se pueden editar.**
- **Qué pasa:** Mesa de partes y Libro de reclamaciones solo tienen las áreas `QAAREA1`–`QAAREA3`: "Área QA29 1–3", responsable "QA29", correos `qa-area1@example.test`.
- **Impacto:** esas áreas aparecen en los formularios públicos ("Área donde ocurrió el hecho", "Área de destino") y reciben todas las derivaciones. En *Libro de reclamaciones › Responsable y plazos*, el área inicial también es de QA29.
- **Por qué no se puede corregir:** el botón **"Editar áreas"** (`#/admin/expedientes/areas`) lleva a *Configuración académica*, que no tiene editor de áreas.
- **Recomendación:** restaurar el editor de áreas y tipos de trámite, y cargar las áreas reales con sus correos `@istpnasca.edu.pe`.

### 🟠 Altos

**H3. El panel muestra 0 visitas aunque el servidor las registra.**
- **Qué pasa:** la tabla `pisco_visits` tiene 338 visitas del día, y los registros públicos responden 200, pero *Inicio › Visitas al portal* muestra 0.
- **Causa:** está en H4. La respuesta del guardado automático trae `visitas: []` y `portalMerge` sobrescribe `DB.visitas`.

**H4. Cada ingreso de un administrador guarda un cambio que nadie hizo.**
- **Qué pasa:** al cargar la intranet, el navegador envía `PUT /api/portal` con `academico.cfg.director = "MAG. PILAR ELENA QUINCHO ESPINOZA "` (con un espacio al final).
- **Causa:** `HOST.inst()` usa `fullName()` sin recortar el espacio, y el servidor (`Rules.php`) sí lo recorta, así que la diferencia nunca desaparece.
- **Impacto:** genera una escritura y un registro de auditoría en cada ingreso, sube la versión de los datos y puede provocar conflictos ("Otra persona guardó cambios") entre dos administradores.
- **Recomendación:** aplicar `trim()` en el cliente y, en `Portal.php`, devolver `visitas` en la respuesta normalizada (o no reemplazarlas en `portalMerge`).

**H5. `actualizar.php` y `recuperar.php` siguen publicados (HTTP 200).**
Están protegidos por `install_key`, pero sus propias pantallas piden eliminarlos tras usarlos. Recomendación: borrarlos desde hPanel. `install.php` ya responde 410.

### 🟡 Medios y bajos

**H6. Hay datos de prueba visibles en producción.**
- **QA29:** 156 registros activos, entre ellos 3 noticias, 3 eventos y 3 "páginas adicionales" que aparecen en el menú y la portada, y 11 usuarios `qa29-*`.
- **QA30:** se agregan 179 registros de esta prueba (ver §5).

**H7. Varios módulos no permiten eliminar, solo despublicar.**
Afecta a Programas, Páginas, Admisión, Matrícula, Enlaces, Tipos de beca y Periodos de beca (`softDelete:false`). Es una decisión de diseño válida, pero impide limpiar los datos de prueba: solo pueden quedar en borrador o inactivos.

**H8. La empresa ve el DNI completo del postulante.**
Es correcto que vea a quien postuló a su oferta, pero conviene evaluar si necesita el DNI completo.

**H9. Faltan algunas cabeceras de seguridad.**
- No se envía `Strict-Transport-Security`.
- La CSP es mínima: solo `upgrade-insecure-requests`.
- `X-Powered-By` expone la versión de PHP.

**H10. Mensajes de error poco precisos en Mesa de partes.**
- Un archivo PHP renombrado a `.pdf` se rechaza bien, pero el usuario ve un mensaje genérico y duplicado: "No se pudo registrar el documento. Intente nuevamente".
- La salud del portal marca 7 de 8 controles: revisar el control pendiente en *Inicio*.

**H11. El buscador de la auditoría no busca en el detalle.**
Solo busca por usuario, acción, entidad e identificador, así que no encuentra registros por su título.

## 3. Resultados por fase

### Fase A · Portal público
- **Recorrido:** 51 rutas públicas, todas con contenido, sin errores de JavaScript ni imágenes rotas.
- **Celular (375 px):** sin desplazamiento horizontal y el menú hamburguesa funciona.
- **Buscador:** funciona, incluso con tildes. `<script>` y `' OR 1=1` se tratan como texto.
- **Contacto:** 3 envíos válidos registrados. Se rechazan los campos obligatorios vacíos y el captcha incorrecto.
- **Libro de reclamaciones:**
  - Se registraron 4 casos (2 reclamos y 2 quejas): RCL-2026-00005 a 00008, uno con PDF adjunto.
  - Se rechaza el registro inválido.
  - La consulta pública por código y documento muestra el estado, y no muestra nada con un documento incorrecto o un código inexistente.
- **Mesa de partes:** 4 expedientes registrados (MPV-IESTPN-2026-000005 a 000008), uno de persona jurídica. Se rechazan `.php` y un PHP disfrazado de `.pdf`.

### Fase B · Intranet como administrador
Los 26 módulos de contenido pasaron el ciclo **crear 5 → editar → eliminar → verificar en el servidor → verificar en el portal**:
- Contenidos: Noticias, Categorías, Eventos, Páginas, Portada (diapositivas), Enlaces.
- Nosotros: Plana jerárquica, Plana docente, Campus y locales, Reconocimientos.
- Académico: Programas, Egresados, Admisión, Matrícula, Becarios, Periodos y Tipos de beca.
- Transparencia: Inversiones, Convocatorias, Documentos, Tipos de documento, TUPA, Servicios.
- Verificación: Certificados.

En el portal:
- Los publicados aparecen en los datos públicos.
- **Ningún** borrador ni eliminado se filtra al público.

Gestión académica:

| Módulo | Resultado |
|---|---|
| Maestro de alumnos | 5/5, editar y eliminar OK |
| Unidades didácticas | 5/5, editar y eliminar OK |
| Ambientes | 5/5, editar y eliminar OK |
| Carga docente | 5/5, editar y eliminar OK |
| Módulos formativos | 5/5, editar y eliminar OK |
| Historial (notas) | 5/5, editar y eliminar OK |
| Empresas | 5/5, editar y eliminar OK; valida el dígito verificador del RUC |
| Ofertas laborales | 5/5, editar y eliminar OK; rechaza fechas límite pasadas |
| Grados y títulos | 5/5, editar y eliminar OK; rechaza título duplicado y fecha de titulación anterior a la culminación |
| Certificación modular | 3 creadas; las demás las bloquea correctamente la regla "el estudiante ya tiene registrado este módulo" |
| Áreas y tipos de trámite | Sin pantalla accesible (H2) |

Flujos de atención:
- **Mensajes:** al abrirlos pasan a *Leído* y el HTML se muestra escapado.
- **Reclamos:**
  - Derivar, poner *En atención*, responder y marcar *Atendido* funciona.
  - La consulta pública muestra la respuesta.
  - La hoja de reclamación se descarga en PDF.
- **Mesa de partes:** derivar y cambiar el estado funciona (En proceso, Observado, Atendido, Archivado), y el cargo se descarga en PDF.
- **Panel:** los filtros de 7, 30 y 90 días funcionan y *Exportar resumen* descarga un CSV.
- **Auditoría:** registró 1231 acciones en el día y el historial se exporta a CSV.

### Fase C · Perfiles
Se creó un usuario `qa30_*` por cada perfil: Imagen, Secretaría, Coordinador, Transparencia, Atención, Directivo, Docente, Estudiante, Egresado, Empresa y Administrador. Con cada uno se verificó:
- **Ingreso y menú:** entra y el menú coincide exactamente con los módulos del perfil.
- **Acceso por URL:** entrar directamente a `#/admin/usuarios`, `config`, `auditoria` o a un módulo ajeno queda denegado.
- **Escritura por API en un módulo ajeno:** HTTP 403 ("Tu rol no puede modificar noticias"). Los perfiles autorizados sí pueden.
- **Escalamiento:** al intentar crear una cuenta de administrador, los 9 perfiles no administradores reciben HTTP 403.
- **Datos que entrega el servidor:** cada perfil recibe solo lo que le corresponde.
  - Estudiante y egresado: solo su propia ficha.
  - Docente, Imagen y Transparencia: ningún dato de alumnos.
  - Secretaría: las cuentas de la comunidad que gestiona.
  - Atención al ciudadano: las empresas.

Controles de cuentas:
- La contraseña de menos de 12 caracteres se rechaza.
- **Cambio de rol:** al cambiarlo, la sesión abierta del usuario se cierra y, al volver a entrar, ve el menú del nuevo rol.
- **Cuenta inactiva:** no puede entrar, y al reactivarla vuelve a entrar.
- **Intentos fallidos:** tras 6 intentos con la contraseña incorrecta, la cuenta se bloquea 5 minutos. Queda registrado en la auditoría y es visible para el administrador.
- ❌ **H1:** un segundo administrador pudo desactivar a `nasca`.

### Fase D · Seguridad básica (no intrusiva)
- **Páginas privadas:** sin sesión responden 403 (respaldos, cuentas, roles, auditoría, `backup.php`).
- **Archivos sensibles:** `.env`, `.git` y `config.php` no son accesibles.
- **Adjuntos:** los privados no se pueden descargar sin sesión.
- **Cookie de sesión:** `Secure; HttpOnly; SameSite=Lax`.
- **Cabeceras:** se envían `nosniff`, `SAMEORIGIN` y `Referrer-Policy`.
- **API pública:** no expone usuarios, reclamos, expedientes, mensajes ni alumnos, y los DNI de becarios salen enmascarados.
- **Pendientes:** H5 y H9.

## 4. Limitaciones de esta prueba
- No se probó **restaurar** un respaldo en producción; queda pendiente de tu decisión.
- No se probó el envío real de correos: el sistema tiene el correo marcado como pendiente.
- No se hicieron pruebas de carga ni de penetración intrusivas.
- Las fallas iniciales de algunos módulos venían de los datos que generaba el script, no del sitio:
  - años o códigos que ya existían;
  - fechas pasadas;
  - RUC sin dígito verificador válido;
  - días de disponibilidad sin marcar.

  Se corrigió el script y se repitieron. Esos rechazos confirman que las validaciones del sitio funcionan.

## 5. Datos de prueba que quedaron en el sitio (pendiente de limpieza)

| Origen | Registros activos | Dónde |
|---|---|---|
| QA30 (esta prueba) | 179 + 11 usuarios `qa30_*` (contraseña de prueba compartida por separado) | Todos los módulos; textos con prefijo `QA30-0n`, DNI `9900xxxx`–`9905xxxx`, correos `@portal.invalid` |
| QA29 (pruebas anteriores) | 156 + 11 usuarios `qa29-*` | Incluye noticias, eventos y páginas visibles en el portal y las áreas `QAAREA` (H2) |

El inventario completo está en `evidencias/qa30/inventario-datos-prueba.json`. Para limpiar hay dos caminos:
- **Eliminar o despublicar los registros con prefijo `QA30` y `QA29`.** En los módulos sin opción de eliminar (H7), solo se pueden despublicar.
- **Restaurar el respaldo `8bd878fcc8f2665b8112e6de096240a8`.** Deja el sitio como estaba antes de QA30, pero también deshace cualquier cambio real hecho después.

## 6. Cómo repetir las pruebas
Los scripts toman las credenciales de variables de entorno; ninguna contraseña queda en los archivos:

```bash
cd tests/qa30
QA30_PASS='<clave de nasca>' QA30_USER_PASS='<clave usuarios qa30>' node fase-a-recorrido.cjs
```

Orden: `backup` → `fase-a-*` → `fase-b-crud` → `fase-b-academico` → `fase-b-titulos` → `fase-b-atencion` → `fase-b-publico` → `fase-c-perfiles` → `fase-c-resto` → `informe` (consolida `resultados-detalle.md`).
