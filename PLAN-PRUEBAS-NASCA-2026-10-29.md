# Plan de pruebas integral · Portal y Intranet IESTP Nasca · 29/10/2026

Sitio: `https://nasca.aplicacion.io` · Intranet: `https://nasca.aplicacion.io/#/admin`
Cuenta base: `nasca` (Administrador). La contraseña no se registra en este documento.

## 1. Objetivo y alcance

Verificar de punta a punta el portal público y la intranet:

1. Recorrer **todas** las páginas públicas y **todos** los módulos de la intranet.
2. Registrar **al menos 5 registros por módulo** con alta, consulta, edición, publicación y baja (CRUD).
3. Crear **un usuario por cada perfil** (11 perfiles) y comprobar que cada uno ve y hace solo lo que le corresponde.
4. Comprobar que lo creado en la intranet aparece en el portal público, y que lo enviado desde el portal llega a la intranet.

Fuera de alcance: pruebas de carga o estrés, pruebas de penetración intrusivas y envío real de correos.

## 2. Reglas de los datos de prueba

- Todo registro lleva el prefijo **`QA30`** en el título o nombre (por ejemplo, `QA30-03 Noticia de prueba`). Así se distingue de los QA29 que ya existen y de los datos reales.
- DNI ficticios en el rango `99000001`–`99000099`. Correos `qa30.<perfil>@portal.invalid`. Teléfonos `999000xxx`.
- Los usuarios de prueba se llaman `qa30_<perfil>` y usan una contraseña de 12 o más caracteres (regla del sistema: mínimo 12, máximo 72 bytes).
- **Antes de empezar:** sacar una copia de seguridad desde *Copias de seguridad* y descargarla.
- **Al terminar:** eliminar o desactivar todos los registros `QA30` y `QA29`, y los usuarios `qa30_*`. Si quedan restos, restaurar la copia.

## 3. Ambiente y herramientas

- Chromium y Playwright con scripts automatizados. Cada caso guarda una captura en `evidencias/qa30/`.
- Resoluciones: escritorio 1440 px y móvil 375 px.
- Resultados por caso: **OK / FALLA / BLOQUEADO**, con evidencia y pasos para reproducir.

## 4. Fase A · Portal público (sin sesión)

| # | Página | Qué se prueba |
|---|---|---|
| A1 | Inicio `#/` | Carrusel, accesos rápidos, noticias, eventos, programas, pie de página y buscador (superior y lateral) |
| A2 | Nosotros (7 páginas): presentación, reseña, misión y visión, organización, reconocimientos, plana jerárquica, plana docente, campus e informes | Contenido cargado, imágenes, enlaces internos y PDF |
| A3 | Programas (8) y `#/programas` | Ficha, brochure y malla en PDF, docentes vinculados |
| A4 | Admisión, Matrícula, Becas | Cronogramas, requisitos, documentos descargables |
| A5 | Transparencia (6): documentos de gestión, inversiones, licenciamiento, TUPA, estadísticas, convocatorias | Listados, filtros, descargas, paginación |
| A6 | Noticias y Eventos | Listado, detalle, paginación, fechas |
| A7 | Preguntas frecuentes, términos, privacidad, mapa del sitio | Sin enlaces rotos (se recorre el mapa completo) |
| A8 | Buscador | Términos con resultado, sin resultado, con tildes y con caracteres especiales (`<script>`, `' OR 1=1`) |
| A9 | Biblioteca virtual (enlace externo) | Abre bibliotecalatina en una pestaña nueva |
| A10 | Suscripción al boletín | Correo válido, inválido, sin aceptar términos |
| A11 | Accesibilidad y diseño | Móvil 375 px sin desplazamiento horizontal, menú hamburguesa, foco con teclado, textos alternativos de imágenes |
| A12 | Contador de visitas | Navegar por 5 páginas y comprobar que el panel suma visitas (hoy marca 0) |

### Formularios públicos (5 envíos cada uno)

| # | Formulario | Casos (5 o más) | Se verifica en la intranet |
|---|---|---|---|
| F1 | Contáctanos | 3 válidos, 1 sin campos obligatorios, 1 con captcha incorrecto | *Mensajes de contacto* |
| F2 | Libro de reclamaciones | 2 reclamos, 2 quejas, 1 inválido; luego consultar con el código `RCL-…` | *Libro de reclamaciones*: plazos y cambio de estado |
| F3 | Mesa de partes virtual | 4 expedientes con adjunto PDF, 1 con archivo no permitido o demasiado grande; generar el cargo | *Mesa de partes* |
| F4 | Consulta de certificados | 3 códigos válidos (creados en B), 1 inexistente, 1 vacío | — |
| F5 | Bolsa laboral | Registro de empresa y postulación de estudiante (ver fase C) | *Bolsa laboral* |

## 5. Fase B · Intranet como Administrador (CRUD de 5 registros por módulo)

Para cada módulo, el ciclo estándar es:
**crear 5 → listar, buscar y filtrar → ver detalle → editar 1 → publicar o despublicar → revisar en el portal → eliminar 1 → revisar auditoría.**
Además se prueban validaciones: campos vacíos, longitudes máximas, fechas incoherentes y archivos inválidos.

| # | Módulo | Registros (5 o más) y casos especiales |
|---|---|---|
| B1 | Inicio (panel) | Cambiar entre 7, 30 y 90 días, *Exportar resumen*, salud del portal (identificar el control que falla de 8) |
| B2 | Aprobaciones | Aprobar 3 y rechazar 2 contenidos enviados por perfiles sin permiso de publicación (documentos, admisión, convocatorias) |
| B3 | Páginas institucionales | 5 páginas con imagen; editar slug; ver en `#/paginas/<slug>` |
| B4 | Portada | 5 diapositivas del carrusel; reordenar; ocultar 1 |
| B5 | Noticias | 5 noticias con categoría e imagen; 1 programada a futuro; 1 en borrador |
| B6 | Eventos | 5 eventos (pasado, hoy, futuro); revisar la agenda pública |
| B7 | Plana jerárquica | 5 cargos con foto |
| B8 | Plana docente | 5 docentes |
| B9 | CV Docente | 5 CV vinculados a los docentes de B8 |
| B10 | Campus y locales | 5 locales con mapa o imagen |
| B11 | Programas de estudio | Editar 5 programas existentes (brochure y malla PDF); crear 1 de prueba y eliminarlo |
| B12 | Maestro de alumnos | 5 alumnos (DNI ficticio), estados regular, egresado y titulado |
| B13 | Programación de horarios | 5 sesiones; forzar 1 cruce de horario y comprobar que lo detecta; publicar el horario |
| B14 | Egresados destacados | 5 egresados con testimonio |
| B15 | Admisión | 5 registros (cronograma, vacantes, requisitos), pasan por Aprobaciones |
| B16 | Matrícula | 5 registros |
| B17 | Becas | 5 becarios, periodos y tipos de beca |
| B18 | Certificación modular | 5 certificados para los alumnos de B12; código consultable en F4 |
| B19 | Grados y títulos | 5 títulos |
| B20 | Verificación de documentos | 5 documentos verificables |
| B21 | Documentos de gestión | 5 documentos PDF de distintos tipos |
| B22 | TUPA | 5 conceptos con monto y requisitos |
| B23 | Estadísticas | 5 indicadores; revisar gráficos públicos |
| B24 | Licenciamiento | 5 registros |
| B25 | Inversiones | 5 registros con montos |
| B26 | Convocatorias | 5 convocatorias (abierta, cerrada, con resultados) |
| B27 | Mensajes de contacto | Atender los 5 de F1: leer, responder y archivar |
| B28 | Libro de reclamaciones | Avanzar los 5 de F2 por *recibido → en atención → atendido*; revisar plazos |
| B29 | Mesa de partes | Derivar y atender los 5 de F3; descargar el cargo |
| B30 | Bolsa laboral | 5 empresas, 5 ofertas; validar y rechazar |
| B31 | Enlaces y servicios | 5 enlaces |
| B32 | Servicios complementarios | 5 servicios |
| B33 | Configuración | Cambiar datos institucionales y revertirlos |
| B34 | Configuración académica | 5 unidades didácticas, ambientes, módulos y áreas |
| B35 | Temas y apariencia | Cambiar tema y colores, revisar el portal, revertir |
| B36 | Usuarios y roles | Ver fase C |
| B37 | Auditoría | Cada acción de B y C aparece con usuario, rol y detalle; filtro por fechas; exportar CSV |
| B38 | Copias de seguridad | Crear y descargar una copia; restaurar solo si se aprueba expresamente |
| B39 | Sesión | Cerrar sesión, expiración por 30 min de inactividad, contraseña incorrecta, bloqueo tras varios intentos |

## 6. Fase C · Perfiles y permisos (11 usuarios)

Crear un usuario por perfil desde *Usuarios y roles*. Los perfiles con vínculo necesitan el registro creado en B:

| Usuario | Perfil | Vínculo obligatorio | Módulos que **debe** ver |
|---|---|---|---|
| `qa30_imagen` | Imagen institucional | — | Panel, noticias, eventos, portada, páginas, enlaces, locales, temas |
| `qa30_secretaria` | Secretaría académica | — | Admisión, matrícula, becas, estadísticas, docentes, jerárquica, certificados, egresados, alumnos, horarios, certificación, títulos |
| `qa30_coordinador` | Coordinador de programa | Programa (por ejemplo, Contabilidad) | Programas, egresados, alumnos, horarios; **solo de su programa** |
| `qa30_transparencia` | Transparencia / administración | — | Documentos, TUPA, inversiones, licenciamiento, convocatorias, servicios |
| `qa30_atencion` | Atención al ciudadano | — | Mensajes, reclamos, mesa de partes, bolsa; **no publica** |
| `qa30_directivo` | Directivo | — | Estadísticas, reclamos, expedientes y módulos académicos; **no publica** |
| `qa30_docente` | Docente | Docente de B8 | Panel, horarios, su CV |
| `qa30_estudiante` | Estudiante | Alumno de B12 | Horarios, certificados, bolsa (postular) |
| `qa30_egresado` | Egresado | Alumno egresado de B12 | Certificados, títulos, bolsa |
| `qa30_empresa` | Empresa | Empresa de B30 | Bolsa (publicar ofertas) |
| `qa30_admin2` | Administrador | — | Todo; se comprueba que no puede desactivar a `nasca` |

Pruebas por cada perfil:

1. **Ingreso** con la contraseña correcta; ingreso con la contraseña incorrecta; cuenta desactivada (debe ser rechazada).
2. **Menú:** solo aparecen sus módulos.
3. **Acceso directo por URL** a un módulo ajeno (por ejemplo, `#/admin/usuarios` como estudiante). Debe denegarse.
4. **Llamada directa a la API** de un módulo ajeno con la sesión del perfil. El servidor PHP debe responder 403, aunque se fuerce la petición.
5. **Acción permitida:** crear o editar 1 registro en su módulo.
6. **Publicación:** los perfiles sin permiso (atención, directivo) o los módulos con aprobación (documentos, admisión, convocatorias) quedan **pendientes en Aprobaciones** y el administrador los aprueba en B2.
7. **Ámbito propio:** el coordinador no ve alumnos de otro programa; el docente solo ve su horario; la empresa solo ve sus ofertas; el estudiante solo ve sus certificados.
8. **Datos sensibles:** el DNI solo es visible para los perfiles con `viewDni` (admin, secretaría, atención, directivo).
9. **Cambio de rol:** el administrador cambia el rol de `qa30_imagen` a transparencia. La sesión abierta debe cerrarse y al volver debe ver el nuevo menú.
10. **Editor de roles** (`/roles.php`): quitar un módulo a un perfil, verificar el efecto, y luego *Restaurar permisos originales*.
11. **Escalamiento:** un perfil no administrador intenta crear un usuario administrador. Debe rechazarse.

### Flujos de punta a punta entre perfiles

- **Bolsa laboral:** la empresa publica 5 ofertas → atención las valida → el estudiante y el egresado postulan → la empresa ve las postulaciones → la oferta aparece en el portal.
- **Certificación:** secretaría crea alumno → certificado → título → el egresado lo ve en su intranet → cualquier visitante lo verifica en F4.
- **Reclamos:** un visitante registra el reclamo → atención lo atiende → el directivo lo consulta → el visitante consulta el estado con su código.
- **Contenidos:** transparencia sube 5 documentos → quedan en Aprobaciones → el administrador aprueba 3 y rechaza 2 → solo los 3 se ven en el portal.

## 7. Fase D · Seguridad básica y robustez (no intrusiva)

- Protección CSRF: un POST sin token debe ser rechazado.
- XSS: guardar `<script>alert(1)</script>` en un título y comprobar que se muestra como texto.
- Subida de archivos: `.php`, `.exe`, archivo renombrado como `.pdf` y archivo por encima del límite. Deben rechazarse.
- Los archivos de instalación o mantenimiento (`install.php`, `actualizar.php`, `recuperar.php`) **no deben estar accesibles** en producción.
- Cabeceras HTTPS y cookies de sesión con `Secure`, `HttpOnly` y `SameSite`.
- Ediciones simultáneas: dos sesiones editan el mismo registro y el sistema debe detectar el conflicto.

## 8. Criterios de aceptación

- 100 % de las páginas públicas cargan sin errores de consola ni enlaces rotos.
- Cada módulo tiene 5 o más registros creados y su ciclo CRUD completo en estado OK.
- Los 11 perfiles respetan su matriz de permisos tanto en la interfaz como en el servidor (cero accesos indebidos).
- Ningún hallazgo crítico (pérdida de datos, acceso indebido, XSS) queda abierto.

## 9. Entregables

1. `QA30-RESULTADOS-NASCA.md` con una tabla por fase (caso, resultado, evidencia).
2. Capturas en `evidencias/qa30/`.
3. Lista de hallazgos priorizados (crítico, alto, medio, bajo) con pasos para reproducir.
4. Scripts Playwright reutilizables en `tests/qa30-*.cjs` para repetir las pruebas.
5. Confirmación de la limpieza de los datos `QA30` y `QA29`.

## 10. Orden de ejecución y estimación

| Paso | Fase | Dependencias |
|---|---|---|
| 0 | Respaldo | — |
| 1 | A: recorrido público y formularios F1–F3 | — |
| 2 | B: CRUD como administrador | Necesario para C y F4 |
| 3 | C: perfiles, permisos y flujos de punta a punta | Usa datos de B |
| 4 | F4, D: seguridad | Usa datos de B |
| 5 | Informe y limpieza | — |

Volumen aproximado: unos 40 módulos × 5 registros ≈ **200 registros**, más 11 usuarios, 25 envíos públicos y unos 150 casos de verificación.
