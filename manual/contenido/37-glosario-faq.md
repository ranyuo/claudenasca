# 37 · Glosario y preguntas frecuentes

## Glosario

| Término | Significado en la plataforma |
|---|---|
| **Administrador** | Rol con acceso a todos los módulos. Es el único que aprueba, elimina definitivamente, gestiona cuentas, revisa la auditoría y hace copias de seguridad. |
| **Aprobación** | Revisión del administrador antes de publicar. Se aplica a **Documentos de gestión**, **Admisión** y **Convocatorias** cuando los envía otro rol. El contenido queda **En revisión** hasta que el administrador pulsa **Aprobar y publicar** o **Devolver** en el módulo **Aprobaciones**. |
| **Archivada** | Estado de una noticia que deja de mostrarse en el portal, pero se conserva en la intranet. |
| **Auditoría** | Registro de las acciones hechas en la plataforma: ingresos, intentos fallidos, cambios, eliminaciones, exportaciones y respaldos. Ver capítulo 35. |
| **Bloqueo de cuenta** | Tras 5 intentos fallidos seguidos de acceso, la cuenta no puede ingresar durante 5 minutos, salvo que el administrador la desbloquee. |
| **Borrador** | Estado de un registro guardado que todavía no se ve en el portal. Si un rol sin permiso de publicar elige un estado publicado, el registro se guarda como borrador. |
| **Código de seguimiento** | Código que recibe el ciudadano al registrar un trámite o un reclamo, para consultar su estado en el portal. |
| **Código de verificación** | Código de 16 caracteres de la constancia de un reclamo. Sirve en lugar del DNI para consultar el caso y validar la constancia. |
| **Comunidad (cuenta de la)** | Cuentas de **Docente**, **Estudiante**, **Egresado** y **Empresa**. Están vinculadas a su registro académico y solo ven sus propios datos. |
| **Contraseña temporal** | Contraseña asignada por el administrador o generada por el sistema. Debe cambiarse en el primer ingreso. |
| **Copia portable (.piscobak)** | Archivo de copia de seguridad que incluye contenido, cuentas, archivos y visitas, y que se puede restaurar desde la plataforma. Ver capítulo 36. |
| **Cron (tarea programada)** | Tarea del hosting que ejecuta `portal-private/cron.php` para crear las copias diarias. |
| **CSV** | Archivo de texto con columnas separadas (en la plataforma, por punto y coma) que se abre en Excel. Lo generan los botones de exportación. |
| **Despublicada** | Estado de un registro que estuvo publicado y se retiró del portal sin eliminarlo. |
| **Destacada** | Marca que da más visibilidad a una noticia en el portal. |
| **Eliminación definitiva** | Borrado sin retorno de un registro que estaba en la papelera. Solo la hace el administrador. |
| **En revisión** | Estado de un contenido que espera la aprobación del administrador. |
| **Hoja de reclamación** | Constancia en PDF de un reclamo o una queja, con código QR. |
| **Intranet** | Zona privada de la plataforma (`{{inst.dominio}}/#/admin`), donde el personal gestiona el contenido y los servicios. |
| **Libro de Reclamaciones** | Servicio para registrar reclamos y quejas sobre el servicio educativo. Ver capítulo 26. |
| **Mesa de Partes Virtual (MPV)** | Servicio para presentar documentos y trámites en línea. Cada expediente recibe un número con el prefijo configurado por la institución, el año y un correlativo de seis dígitos (por ejemplo, MPV-ICA-2026-000001), además de un número de documento DOC-AAAA-NNNNNN. |
| **Módulo** | Cada sección de la intranet (Noticias, TUPA, Mesa de partes, etc.). Los módulos visibles dependen del rol. |
| **Papelera** | Lugar donde quedan los registros eliminados. Desde ahí se pueden **restaurar**. Se abre con **Ver papelera** en el listado del módulo. |
| **Parámetro protegido** | Dato de configuración sensible, como el correo receptor del Libro de Reclamaciones. Solo lo cambia el administrador. |
| **Portal** | Sitio web público de la institución (`{{inst.dominio}}`). |
| **Programada** | Etiqueta de un contenido **Publicado** con fecha futura: se mostrará solo cuando llegue esa fecha y hora. |
| **Publicada / Publicado** | Estado de un registro visible en el portal. |
| **RCL** | Prefijo del código de seguimiento del Libro de Reclamaciones: RCL-AAAA-NNNNN (año y correlativo de cinco dígitos). |
| **Respaldo** | Copia de seguridad. Puede ser **manual**, **programado** o **previo-restauracion**. |
| **Restaurar** | 1) Recuperar un registro desde la papelera. 2) Reemplazar los datos del portal por una copia de seguridad (solo el administrador). |
| **Rol** | Perfil de una cuenta. Define qué módulos ve y qué puede hacer. La plataforma tiene 11 roles. Ver capítulo 34. |
| **Sesión** | Periodo en que una cuenta está dentro de la intranet. Se cierra con **Salir** o tras 30 minutos sin actividad. |
| **SEO** | Datos (título y descripción) que usan los buscadores, como Google, para mostrar el portal. Se configuran en el capítulo 31. |
| **Slug (URL amigable)** | Parte final de la dirección de una página o noticia, generada a partir del título, sin tildes ni espacios. Ejemplo: `taller-de-primeros-auxilios-para-la-comunidad`. |
| **TUPA** | Texto Único de Procedimientos Administrativos: lista oficial de los trámites de la institución, con sus requisitos, plazos y costos. |
| **UIT** | Unidad Impositiva Tributaria. Valor anual en soles que fija el Estado. La plataforma muestra cada monto del TUPA también como porcentaje (% UIT) de la UIT de su año. Se registra en **TUPA** › **UIT y documentos**. |
| **Vínculo** | Relación de una cuenta con un alumno, un docente, una empresa o un programa. Determina qué datos ve la cuenta. |

## Preguntas frecuentes

### Acceso y contraseñas

**La intranet me sacó y me pide iniciar sesión otra vez.**
La sesión se cierra tras **30 minutos sin actividad**. La intranet muestra «Su sesión se cerró tras 30 minutos de inactividad. Ingrese nuevamente.». También se cierra cuando el administrador cambia tu rol, tu contraseña o los permisos de tu rol, y después de restaurar una copia de seguridad. Vuelve a iniciar sesión. Si estabas escribiendo un texto largo, cópialo antes de recargar.

**Al guardar aparece «La sesión caducó. Recarga la página e inténtalo de nuevo.».**
La página llevaba mucho tiempo abierta y su clave de seguridad venció. Copia lo que escribiste, recarga la página y vuelve a guardar.

**Mi cuenta está bloqueada.**
Fallaste la contraseña **5 veces seguidas**. Espera **5 minutos** y vuelve a intentarlo, o pide al administrador que la desbloquee desde **Usuarios y roles** (capítulo 34).

**Olvidé mi contraseña.**
La plataforma no envía contraseñas por correo. Pide al administrador que te asigne una contraseña temporal. En tu siguiente ingreso, la plataforma te pedirá cambiarla.

**Al ingresar me lleva a «Cuentas del portal» y no me deja usar la intranet.**
Tu contraseña es temporal. Cámbiala en **Cambiar mi contraseña**: escribe la temporal, la nueva (mínimo 12 caracteres) y repítela. Luego pulsa **Ir a la intranet →**.

**Escribo bien mi contraseña y dice «Usuario o contraseña incorrectos.».**
Revisa que el teclado no tenga activadas las mayúsculas. Si el problema sigue, es posible que tu cuenta esté **inactiva**: consulta al administrador.

**Aparece «Demasiados intentos. Espera unos minutos antes de continuar.».**
Se hicieron demasiadas solicitudes seguidas desde tu equipo o tu red. Espera uno o dos minutos.

### Permisos

**No veo un módulo que necesito.**
Tu rol no lo incluye o el administrador lo desactivó para tu rol. Revisa la matriz del capítulo 34 y pide al administrador el cambio de rol que corresponda.

**Aparece «Acceso denegado».**
Abriste la ruta de un módulo que tu rol no tiene. Pulsa **Volver al inicio**.

**Elegí «Publicado» y el registro quedó en borrador o en revisión.**
Tu rol no tiene permiso para publicar (queda en **Borrador**) o el módulo requiere aprobación del administrador (queda **En revisión**). El administrador lo publica desde **Aprobaciones**.

**No veo el DNI completo de las personas.**
Solo los roles con la atribución **Ver DNI completo** lo ven. Los demás lo ven enmascarado (capítulo 34).

### Contenido del portal

**Guardé un contenido, pero no se ve en el portal.**
Revisa, en este orden:

1. **Estado:** debe ser **Publicada** o **Publicado**. **Borrador**, **En revisión**, **Despublicada** y **Archivada** no se muestran.
2. **Fecha:** si la fecha de publicación es futura, el contenido figura como **Programada** y aparecerá en esa fecha y hora.
3. **Papelera:** un registro eliminado no se ve. Restáuralo desde **Ver papelera**.
4. **Periodo o vigencia:** algunos contenidos solo se muestran si están vigentes (por ejemplo, el periodo de matrícula marcado como **Periodo vigente** o la ventana emergente dentro de sus fechas).
5. **Navegador:** recarga la página del portal para ver la versión más reciente.

**Al guardar aparece «Otra persona guardó cambios. Copia tu trabajo y recarga la página.».**
Otra persona guardó cambios en la plataforma mientras tenías el formulario abierto. Copia tu texto, recarga la página y vuelve a aplicar tus cambios.

**Eliminé algo por error.**
Entra al módulo, pulsa **Ver papelera** y **Restaurar**. Si el administrador lo eliminó definitivamente, solo se recupera restaurando una copia de seguridad (capítulo 36), lo que afecta a todo el portal.

**La imagen no se sube o tarda mucho.**
Las imágenes aceptan JPG, PNG o WEBP hasta 15 MB y se comprimen automáticamente. Los PDF aceptan hasta 20 MB. Reduce el tamaño del archivo si supera esos límites.

### Servicios al ciudadano

**Los ciudadanos dicen que no recibieron el correo de respuesta.**
En la versión actual, el envío automático de correos está desactivado: las notificaciones figuran como **Omitido**. El ciudadano debe consultar su caso en el portal con su código (capítulo 26 y capítulo de Mesa de partes).

**Un ciudadano perdió su código de seguimiento.**
Búscalo en la bandeja del módulo por nombre o documento y comunícaselo por un canal oficial.

### Seguridad y respaldos

**¿Cómo sé quién cambió algo?**
Revisa la **Auditoría** (capítulo 35): filtra por módulo, usuario o fechas.

**¿Cada cuánto se hacen copias de seguridad?**
Solo si el administrador activó los **Respaldos diarios** y soporte técnico configuró la tarea programada del hosting. Comprueba la **Última copia programada** en la pantalla de respaldos (capítulo 36).
