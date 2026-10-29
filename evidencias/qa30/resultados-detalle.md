
### Fase A · 76 casos · REVISAR: 1 · OK: 74 · FALLA: 1

| Resultado | Caso | Detalle |
|---|---|---|
| REVISAR | Archivos publicados (imágenes, PDF) accesibles 88/132 | Los 44 restantes devolvieron HTTP 429 (límite de peticiones del hosting), no 404. |
| OK | Buscador "admisión" | 6 enlaces en resultados |
| OK | Buscador "contabilidad" | 7 enlaces en resultados |
| OK | Buscador "enfermeria" | 6 enlaces en resultados |
| OK | Buscador "xyzqwe123" | sin resultados |
| OK | Buscador "<script>alert(1)</script>" | sin resultados |
| OK | Buscador "' OR 1=1 --" | 13 enlaces en resultados |
| OK | Boletín rechaza correo inválido |  |
| OK | Registro de visitas (POST /api/visitas) | respuestas: [200,200,200,200,200] |
| FALLA | Panel muestra visitas registradas | El servidor tiene 338 visitas hoy (pisco_visits) pero el panel muestra 0: la respuesta del guardado automático trae visitas vacías y las sobrescribe. |
| OK | Consulta pública reclamo RCL-2026-00005 doc 99000011 | muestra estado |
| OK | Consulta pública reclamo RCL-2026-00007 doc 99000013 | muestra estado |
| OK | Consulta pública reclamo RCL-2026-00005 doc 11111111 | documento incorrecto: no muestra datos |
| OK | Consulta pública reclamo RCL-2099-99999 doc 99000011 | código inexistente: no muestra datos |
| OK | Mesa de partes expediente 1 con PDF | registrado MPV-IESTPN-2026-000005 |
| OK | Mesa de partes expediente 2 con PDF | registrado MPV-IESTPN-2026-000006 |
| OK | Mesa de partes expediente 3 con PDF | registrado MPV-IESTPN-2026-000007 |
| OK | Mesa de partes expediente 4 persona jurídica | registrado DOC-2026-000001 ·  · 201 {"file":{"fileId":"fdc386d2f69d6157034ee5d6315e3915","url":"\/index.php?route=api%2Farchivo\u0026id=fdc386d2f69d6157034ee5d6315e3915","original":"qa30-documento // 201 {"record":{"nomb |
| OK | Mesa de partes archivo .php no permitido | rechazado · “qa30-script.php”: formato .php no permitido. Formatos: PDF, DOC, DOCX, XLS, XLSX, JPG, JPEG, PNG. / Revise los campos marcados en rojo. / R ·  |
| OK | Mesa de partes PHP renombrado a .pdf | rechazado · No se pudo registrar el documento. Intente nuevamente. / No se pudo registrar el documento. Intente nuevamente. · 422 {"message":"El contenido del archivo no coincide con un formato permitido."} |
| OK | Mesa de partes PDF de 25 MB | rechazado ·  ·  |
| OK | Ruta #/ (Instituto de Educación Superior Tecnológ) |  |
| OK | Ruta #/nosotros/presentacion (Presentación) |  |
| OK | Ruta #/nosotros/resena-historica (Reseña Histórica) |  |
| OK | Ruta #/nosotros/mision-vision (Misión, Visión y Valores) |  |
| OK | Ruta #/nosotros/organizacion (Organización Institucional) |  |
| OK | Ruta #/nosotros/reconocimientos (Reconocimientos) |  |
| OK | Ruta #/nosotros/plana-jerarquica (EQUIPO DIRECTIVO) |  |
| OK | Ruta #/nosotros/plana-docente (PLANA DOCENTE 2026) |  |
| OK | Ruta #/nosotros/campus-e-informes (Campus e Informes) |  |
| OK | Ruta #/programas/contabilidad (Contabilidad) |  |
| OK | Ruta #/programas/enfermeria-tecnica (Enfermería Técnica) |  |
| OK | Ruta #/programas/guia-oficial-de-turismo (Guía Oficial de Turismo) |  |
| OK | Ruta #/programas/produccion-agropecuaria (Producción Agropecuaria) |  |
| OK | Ruta #/programas/arquitectura-de-plataformas-y-tic (Arquitectura de Plataformas y Servicios ) |  |
| OK | Ruta #/programas/electricidad-industrial (Electricidad Industrial) |  |
| OK | Ruta #/programas/electronica-industrial (Electrónica Industrial) |  |
| OK | Ruta #/programas/mecatronica-automotriz (Mecatrónica Automotriz) |  |
| OK | Ruta #/programas (Programas de Estudio) |  |
| OK | Ruta #/admision (Admisión Nasca 2026: documentos y result) |  |
| OK | Ruta #/matricula (Matrícula sintética — QA29 3 · QA29 revi) |  |
| OK | Ruta #/becas (Consulta de Beneficiarios de Becas) |  |
| OK | Ruta #/transparencia/documentos-gestion (Documentos de Gestión) |  |
| OK | Ruta #/transparencia/inversiones (Inversiones y Recursos Económicos) |  |
| OK | Ruta #/transparencia/licenciamiento (Licenciamiento) |  |
| OK | Ruta #/transparencia/tupa (Texto Único de Procedimientos Administra) |  |
| OK | Ruta #/transparencia/estadisticas (Estadísticas institucionales) |  |
| OK | Ruta #/transparencia/convocatorias (Convocatorias) |  |
| OK | Ruta #/servicios (Servicios en línea) |  |
| OK | Ruta #/servicios/mesa-de-partes (Mesa de Partes Virtual) |  |
| OK | Ruta #/servicios/libro-de-reclamaciones (Libro de Reclamaciones) |  |
| OK | Ruta #/servicios/consulta-certificados (Consulta de certificados) |  |
| OK | Ruta #/servicios/bolsa-laboral (Bolsa Laboral) |  |
| OK | Ruta #/servicios/complementarios (Servicios Complementarios) |  |
| OK | Ruta #/eventos (Agenda de eventos) |  |
| OK | Ruta #/preguntas-frecuentes (Preguntas Frecuentes) |  |
| OK | Ruta #/paginas/qa29-pagina-1 (QA29 1 Página adicional · QA29 revisión ) |  |
| OK | Ruta #/paginas/qa29-pagina-2 (QA29 2 Página adicional · QA29 revisión ) |  |
| OK | Ruta #/paginas/qa29-pagina-3 (Página adicional — QA29 3 · QA29 revisió) |  |
| OK | Ruta #/noticias (Noticias) |  |
| OK | Ruta #/contacto (Contáctanos) |  |
| OK | Ruta #/buscar (Buscar en el sitio) | Sin término de búsqueda la página queda vacía, comportamiento esperado. |
| OK | Ruta #/politica-de-privacidad (Política de Privacidad) |  |
| OK | Ruta #/terminos-de-uso (Términos de Uso) |  |
| OK | Ruta #/mapa-del-sitio (Mapa del sitio) |  |
| OK | Ruta #/noticias/qa29-noticia-1 (QA29 1 Noticia de control de calidad · Q) |  |
| OK | Ruta #/noticias/qa29-noticia-2 (QA29 2 Noticia de control de calidad · Q) |  |
| OK | Ruta #/noticias/qa29-noticia-3 (Noticia de control de calidad — QA29 3 ·) |  |
| OK | Ruta #/noticias/cronograma-de-proceso-de-encargatura-de-gestion-pedagogica-2027 (Cronograma de Proceso de Encargatura de ) |  |
| OK | Ruta #/noticias/resultado-final-del-proceso-contrato-docente-regulares-iestp-nasca-2026 (RESULTADO FINAL DEL PROCESO CONTRATO DOC) |  |
| OK | Ruta #/noticias/resultado-preliminar-de-evaluacion-curricular-de-contrato-docente-2026-rvm-226-2020-minedu-contabilidad (RESULTADO PRELIMINAR DE EVALUACIÓN CURRI) |  |
| OK | Ruta #/noticias/resultado-preliminar-de-licitacion-de-quiosco-2026-2 (Resultado Preliminar de licitación de Qu) |  |
| OK | Total rutas públicas recorridas | 51 |
| OK | Documentos/archivos enlazados descargables (0/0) |  |
| OK | Móvil 375 px sin desplazamiento horizontal |  |
| OK | Menú hamburguesa móvil abre |  |

### Fase B · 154 casos · OK: 133 · REVISAR: 10 · N/A: 6 · BLOQUEADO: 2 · FALLA: 3

| Resultado | Caso | Detalle |
|---|---|---|
| OK | estudiantes (académico): crear 5 registros | 5/5 registrados |
| OK | estudiantes (académico): editar registro | texto modificado y guardado |
| OK | estudiantes (académico): eliminar registro | 5 → 4 filas QA30 |
| OK | titulos (académico): crear 5 registros | 5/5 registrados |
| OK | modulos (académico): crear 5 registros | 5/5 registrados |
| OK | modulos (académico): editar registro | texto modificado y guardado |
| OK | modulos (académico): eliminar registro | 5 → 4 filas QA30 |
| REVISAR | certs (académico): crear 5 registros | 3 certificaciones QA30 creadas en total (1 + 2 en reintentos; 1 eliminada en la prueba). Los demás intentos los bloquea correctamente la validación 'El estudiante ya tiene registrado este módulo'; el script no logró comb |
| OK | certs (académico): editar registro | guardado sin cambio de texto |
| OK | certs (académico): eliminar registro | 4 → 3 filas QA30 |
| OK | notas (académico): crear 5 registros | 5/5 registrados |
| OK | notas (académico): editar registro | texto modificado y guardado |
| OK | notas (académico): eliminar registro | 5 → 4 filas QA30 |
| N/A | empresas: crear 5 registros | Reemplazado por 'empresas (académico)': 5/5 tras ubicar la pestaña y usar RUC con dígito verificador válido. |
| OK | ofertas (académico): crear 5 registros | 5/5 registrados |
| N/A | uds: crear 5 registros | Reemplazado por 'uds (académico)': 5/5 en Horarios › Configuración. |
| N/A | ambientes: crear 5 registros | Reemplazado por 'ambientes (académico)': 5/5. |
| OK | docentes: crear 5 registros | 5/5 guardados en servidor |
| BLOQUEADO | areas: crear 5 registros | No existe editor de áreas accesible: 'Editar áreas' lleva a Configuración académica sin esa opción. |
| BLOQUEADO | tramites: crear 5 registros | Igual que áreas: el catálogo de tipos de trámite de la Mesa de partes académica no tiene pantalla accesible en la intranet. |
| N/A | ofertas: crear 5 registros | Reemplazado por 'ofertas (académico)': 5/5 con fecha límite futura. |
| OK | uds (académico): crear 5 registros | 5/5 registrados |
| OK | uds (académico): editar registro | texto modificado y guardado |
| OK | uds (académico): eliminar registro | 5 → 4 filas QA30 |
| OK | ambientes (académico): crear 5 registros | 5/5 registrados |
| OK | ambientes (académico): editar registro | texto modificado y guardado |
| OK | ambientes (académico): eliminar registro | 5 → 4 filas QA30 |
| OK | docentes (académico): crear 5 registros | 5/5 registrados |
| OK | empresas (académico): crear 5 registros | 5/5 registrados |
| OK | ofertas (académico): editar registro | texto modificado y guardado |
| OK | ofertas (académico): eliminar registro | 5 → 4 filas QA30 |
| OK | empresas (académico): editar registro | texto modificado y guardado |
| OK | empresas (académico): eliminar registro | 5 → 4 filas QA30 |
| OK | docentes (académico): editar registro | guardado sin cambio de texto |
| OK | docentes (académico): eliminar registro | 4 → 3 filas QA30 |
| OK | Mensajes QA30 recibidos en intranet | 3 mensajes |
| OK | Mensajes: abrir detalle cambia estado a leído | Leído, Leído |
| OK | Mensajes: HTML/script del visitante se muestra escapado | Revisado en código: el mensaje se muestra con esc(); el <b> detectado es el resaltado de no leídos (falso positivo del script). |
| OK | Reclamos: derivar, poner en atención y responder (3 casos) | RCL-2026-00008:Atendido@QAAREA1:4h · RCL-2026-00007:Atendido@QAAREA1:4h · RCL-2026-00006:En atención@QAAREA1:3h |
| OK | Consulta pública muestra "Atendido" y la respuesta | estado y respuesta visibles |
| OK | Reclamos: descarga de hoja de reclamación (PDF) | Hoja_RCL-2026-00008.pdf |
| OK | Mesa de partes: descarga de cargo de recepción (PDF) | cargo_MPV-IESTPN-2026-000005.pdf |
| OK | Mesa de partes: derivar y cambiar estado (4 expedientes) | MPV-IESTPN-2026-000008:En proceso@QAAREA1 · MPV-IESTPN-2026-000007:Observado@QAAREA2 · MPV-IESTPN-2026-000006:Atendido@QAAREA3 · MPV-IESTPN-2026-000005:Archivado@QAAREA3 |
| OK | Aprobaciones: bandeja accesible | Inicio › Aprobaciones Aprobaciones pendientes Contenidos enviados por los responsables de área que requieren aprobación del Administrador antes de publicarse. P |
| OK | Panel: filtros 7/30/90 días y exportar resumen | resumen_panel_2026-10-29.csv |
| REVISAR | Panel: salud del portal | Salud del portal 7 de 8 controles 88% Proceso de admisión vigente publicado Programas con brochure y malla en PDF Enlaces de servicios con URL UIT registrada para el año del TUPA Reclamos sin notificaciones fallidas Noti |
| OK | Auditoría registra las acciones QA30 | 1231 registros hoy; 29 de usuarios qa30_*. El buscador no busca en el detalle, por eso 'QA30' no encuentra títulos. |
| OK | Auditoría: exportar CSV | auditoria-20261029-164432.csv |
| OK | catnoticias: crear 5 registros | 5/5 guardados en servidor |
| OK | catnoticias: editar registro | campo nombre = QA30-01 catnoticias editado QA30 |
| OK | catnoticias: eliminar registro | papelera |
| OK | eventos: crear 5 registros | 5/5 guardados en servidor |
| OK | eventos: editar registro | campo titulo = QA30-01 eventos editado QA30 |
| OK | eventos: eliminar registro | papelera |
| OK | inversiones: crear 5 registros | 5/5 guardados en servidor |
| OK | inversiones: editar registro | campo titulo = QA30-01 inversiones editado QA30 |
| OK | inversiones: eliminar registro | papelera |
| OK | convocatorias: crear 5 registros | 5/5 guardados en servidor |
| OK | convocatorias: editar registro | campo titulo = QA30-01 convocatorias editado QA30 |
| OK | convocatorias: eliminar registro | papelera |
| OK | documentos: crear 5 registros | 5/5 guardados en servidor |
| OK | documentos: editar registro | campo nombre = QA30-01 documentos editado QA30 |
| OK | documentos: eliminar registro | papelera |
| OK | tiposdoc: crear 5 registros | 5/5 guardados en servidor |
| OK | tiposdoc: editar registro | campo nombre = QA30-01 tiposdoc editado QA30 |
| OK | tiposdoc: eliminar registro | papelera |
| OK | tupa: crear 5 registros | 5/5 guardados en servidor |
| OK | tupa: editar registro | campo denominacion = QA30-01 tupa editado QA30 |
| OK | tupa: eliminar registro | papelera |
| OK | jerarquica: crear 5 registros | 5/5 guardados en servidor |
| OK | jerarquica: editar registro | campo cargo = QA30-01 jerarquica editado QA30 |
| OK | jerarquica: eliminar registro | papelera |
| OK | locales: crear 5 registros | 5/5 guardados en servidor |
| OK | locales: editar registro | campo nombre = QA30-01 locales editado QA30 |
| OK | locales: eliminar registro | papelera |
| OK | reconocimientos: crear 5 registros | 5/5 guardados en servidor |
| OK | reconocimientos: editar registro | campo titulo = QA30-01 reconocimientos editado QA30 |
| OK | reconocimientos: eliminar registro | papelera |
| OK | programas: crear 5 registros | 5/5 guardados en servidor |
| OK | programas: editar registro | campo titulo = QA30-01 programas editado QA30 |
| OK | programas: eliminar registro | Por diseño el módulo no permite eliminar (softDelete:false); solo despublicar/inactivar. |
| OK | egresados: crear 5 registros | 5/5 guardados en servidor |
| OK | egresados: editar registro | campo nombres = QA30-01 egresados editado QA30 |
| OK | egresados: eliminar registro | papelera |
| OK | certificados: crear 5 registros | 5/5 guardados en servidor |
| OK | certificados: editar registro | campo nombres = QA30-01 certificados editado QA30 |
| OK | certificados: eliminar registro | papelera |
| OK | becas: crear 5 registros | 5/5 guardados en servidor |
| OK | becas: editar registro | campo nombres = QA30-01 becas editado QA30 |
| OK | becas: eliminar registro | papelera |
| OK | becasper: crear 5 registros | 5/5 guardados en servidor |
| N/A | becasper: editar registro | El periodo de becas no tiene campo de texto (solo año/periodo); no aplica. |
| OK | becastipos: crear 5 registros | 5/5 guardados en servidor |
| OK | becastipos: editar registro | campo nombre = QA30-01 becastipos editado QA30 |
| OK | becastipos: eliminar registro | Por diseño el módulo no permite eliminar (softDelete:false); solo despublicar/inactivar. |
| OK | enlaces: crear 5 registros | 5/5 guardados en servidor |
| OK | enlaces: editar registro | campo nombre = QA30-01 enlaces editado QA30 |
| OK | enlaces: eliminar registro | Por diseño el módulo no permite eliminar (softDelete:false); solo despublicar/inactivar. |
| OK | servicios: crear 5 registros | 5/5 guardados en servidor |
| OK | servicios: editar registro | campo nombre = QA30-01 servicios editado QA30 |
| OK | servicios: eliminar registro | papelera |
| OK | slides: crear 5 registros | 5/5 guardados en servidor |
| OK | slides: editar registro | campo titulo = QA30-01 slides editado QA30 |
| OK | slides: eliminar registro | papelera |
| OK | paginas: crear 5 registros | 5/5 guardados en servidor |
| OK | paginas: editar registro | campo titulo = QA30-01 paginas editado QA30 |
| OK | paginas: eliminar registro | Por diseño el módulo no permite eliminar (softDelete:false); solo despublicar/inactivar. |
| OK | admision: crear 5 registros | 5/5 guardados en servidor |
| OK | admision: editar registro | campo titulo = QA30-01 admision editado QA30 |
| OK | matricula: crear 5 registros | 5/5 guardados en servidor |
| OK | matricula: editar registro | campo titulo = QA30-01 matricula editado QA30 |
| OK | matricula: eliminar registro | Por diseño el módulo no permite eliminar (softDelete:false); solo despublicar/inactivar. |
| N/A | docentes: editar registro | Limitación del script: editó el campo 'título académico' (máx. corto) en lugar del nombre; la validación de longitud funcionó. |
| OK | docentes: eliminar registro | papelera |
| OK | becasper: eliminar registro | Por diseño el módulo no permite eliminar (softDelete:false); solo despublicar/inactivar. |
| OK | admision: eliminar registro | Por diseño el módulo no permite eliminar (softDelete:false); solo despublicar/inactivar. |
| OK | noticias: crear 5 registros | 5/5 guardados en servidor |
| OK | noticias: editar registro | campo titulo = QA30-01 noticias editado QA30 |
| OK | noticias: eliminar registro | Verificado aparte (del-noticia.cjs): enviada a papelera. |
| OK | noticias: publicación en portal | 3 publicados → 3 en datos públicos, render: visible; 2 borrador/eliminado → 0 filtrados al público |
| OK | catnoticias: publicación en portal | 4 publicados → 4 en datos públicos, render: visible; 1 borrador/eliminado → 0 filtrados al público |
| OK | eventos: publicación en portal | 3 publicados → 3 en datos públicos, render: visible; 2 borrador/eliminado → 0 filtrados al público |
| OK | inversiones: publicación en portal | 3 publicados → 3 en datos públicos, render: visible; 2 borrador/eliminado → 0 filtrados al público |
| OK | convocatorias: publicación en portal | 3 publicados → 3 en datos públicos, render: visible; 2 borrador/eliminado → 0 filtrados al público |
| REVISAR | documentos: publicación en portal | Los publicados sí llegan a los datos públicos y los borradores no; la página no los muestra en la primera vista por filtros de la propia página (vigente, periodo, paginación, carrusel). Ej.: /programas indica 'Ofrecemos  |
| OK | tiposdoc: publicación en portal | 4 publicados → 4 en datos públicos, render: visible; 1 borrador/eliminado → 0 filtrados al público |
| REVISAR | tupa: publicación en portal | Los publicados sí llegan a los datos públicos y los borradores no; la página no los muestra en la primera vista por filtros de la propia página (vigente, periodo, paginación, carrusel). Ej.: /programas indica 'Ofrecemos  |
| OK | jerarquica: publicación en portal | 4 publicados → 4 en datos públicos, render: visible; 1 borrador/eliminado → 0 filtrados al público |
| OK | docentes: publicación en portal | 3 publicados → 3 en datos públicos, render: visible; 2 borrador/eliminado → 0 filtrados al público |
| OK | locales: publicación en portal | 3 publicados → 3 en datos públicos, render: visible; 2 borrador/eliminado → 0 filtrados al público |
| OK | reconocimientos: publicación en portal | 3 publicados → 3 en datos públicos, render: visible; 2 borrador/eliminado → 0 filtrados al público |
| REVISAR | programas: publicación en portal | Los publicados sí llegan a los datos públicos y los borradores no; la página no los muestra en la primera vista por filtros de la propia página (vigente, periodo, paginación, carrusel). Ej.: /programas indica 'Ofrecemos  |
| REVISAR | becas: publicación en portal | Los publicados sí llegan a los datos públicos y los borradores no; la página no los muestra en la primera vista por filtros de la propia página (vigente, periodo, paginación, carrusel). Ej.: /programas indica 'Ofrecemos  |
| OK | becastipos: publicación en portal | 5 publicados → 5 en datos públicos, render: visible; 0 borrador/eliminado → 0 filtrados al público |
| OK | servicios: publicación en portal | 3 publicados → 3 en datos públicos, render: visible; 2 borrador/eliminado → 0 filtrados al público |
| REVISAR | slides: publicación en portal | Los publicados sí llegan a los datos públicos y los borradores no; la página no los muestra en la primera vista por filtros de la propia página (vigente, periodo, paginación, carrusel). Ej.: /programas indica 'Ofrecemos  |
| REVISAR | admision: publicación en portal | Los publicados sí llegan a los datos públicos y los borradores no; la página no los muestra en la primera vista por filtros de la propia página (vigente, periodo, paginación, carrusel). Ej.: /programas indica 'Ofrecemos  |
| REVISAR | matricula: publicación en portal | Los publicados sí llegan a los datos públicos y los borradores no; la página no los muestra en la primera vista por filtros de la propia página (vigente, periodo, paginación, carrusel). Ej.: /programas indica 'Ofrecemos  |
| REVISAR | enlaces: publicación en portal | Los publicados sí llegan a los datos públicos y los borradores no; la página no los muestra en la primera vista por filtros de la propia página (vigente, periodo, paginación, carrusel). Ej.: /programas indica 'Ofrecemos  |
| OK | paginas: publicación en portal | 3 publicados → 3 en datos públicos, render: visible; 2 borrador/eliminado → 0 filtrados al público |
| OK | egresados: publicación en portal | 3 publicados → 3 en datos públicos, render: n/a; 2 borrador/eliminado → 0 filtrados al público |
| OK | certificados: publicación en portal | Correcto: los certificados no se publican en bloque; solo se consultan por código. |
| OK | Títulos: alumno egresado 1 para titular |  |
| OK | Títulos: alumno egresado 2 para titular |  |
| OK | Títulos: alumno egresado 3 para titular |  |
| OK | Títulos: alumno egresado 4 para titular |  |
| OK | Títulos: alumno egresado 5 para titular |  |
| OK | Títulos: rechaza título duplicado y fecha incoherente | Este egresado ya tiene un título registrado. / Debe ser posterior a la fecha de culminación. |
| OK | titulos (académico): editar registro |  |
| OK | titulos (académico): eliminar registro |  |
| OK | Títulos: página pública de consulta carga |  |
| FALLA | Guardado automático al ingresar el administrador | Cada ingreso envía un cambio no solicitado: academico.cfg.director recibe un espacio final ('…ESPINOZA ') que el servidor vuelve a recortar; genera escrituras y auditoría innecesarias. |
| FALLA | Áreas receptoras de Mesa de partes / Libro de reclamaciones | Solo existen áreas de prueba QAAREA1–3 (Área QA29, correos @example.test); aparecen en los formularios públicos y reciben las derivaciones. |
| FALLA | Enlace 'Editar áreas' | Lleva a Configuración académica, que no tiene editor de áreas: no hay forma de corregir las áreas desde la intranet. |

### Fase C · 120 casos · OK: 114 · REVISAR: 5 · FALLA: 1

| Resultado | Caso | Detalle |
|---|---|---|
| OK | Vínculos disponibles | {"docente":"doc:930000","estudiante":"est:3317635313059786","egresado":"est:2227983297995665","empresa":"emp:1","programa":"cont"} |
| OK | Crear usuario qa30_imagen (Imagen institucional) |  |
| OK | Crear usuario qa30_secretaria (Secretaría académica) |  |
| OK | Crear usuario qa30_coordinador (Coordinador de programa) |  |
| OK | Crear usuario qa30_transparencia (Transparencia / administración) |  |
| OK | Crear usuario qa30_atencion (Atención al ciudadano) |  |
| OK | Crear usuario qa30_directivo (Directivo) |  |
| OK | Crear usuario qa30_docente (Docente) |  |
| OK | Crear usuario qa30_estudiante (Estudiante) |  |
| OK | Crear usuario qa30_egresado (Egresado) |  |
| OK | Crear usuario qa30_empresa (Empresa) |  |
| OK | Crear usuario qa30_admin2 (Administrador) |  |
| OK | Contraseña de menos de 12 caracteres rechazada |  |
| OK | imagen: ingreso | {"rol":"imagen","u":"qa30_imagen"} |
| OK | imagen: menú según permisos | menú: dashboard, paginas, portada, noticias, eventos, locales, enlaces, temas |
| OK | imagen: URL directa #/admin/usuarios | denegado/redirigido |
| OK | imagen: URL directa #/admin/config | denegado/redirigido |
| OK | imagen: URL directa #/admin/auditoria | denegado/redirigido |
| OK | imagen: URL directa #/admin/reclamos | denegado/redirigido |
| OK | imagen: datos entregados por el servidor | {"usuarios":1,"reclamos":0,"expedientes":0,"mensajes":0,"estudiantes":0,"postulaciones":0,"certs":0,"dniVisibles":0} |
| OK | imagen: API — modificar noticia (permitido) | HTTP 200  |
| OK | imagen: intento de crear cuenta administradora | HTTP 403 No tienes permiso para gestionar cuentas. |
| OK | secretaria: ingreso | {"rol":"secretaria","u":"qa30_secretaria"} |
| OK | secretaria: menú según permisos | menú: dashboard, jerarquica, docentes, cvdocente, ix-alumnos, ix-horarios, egresados, admision, matricula, becas, ix-certificados, ix-titulos, certificados, estadisticas |
| OK | secretaria: URL directa #/admin/usuarios | denegado/redirigido |
| OK | secretaria: URL directa #/admin/config | denegado/redirigido |
| OK | secretaria: URL directa #/admin/auditoria | denegado/redirigido |
| OK | secretaria: URL directa #/admin/noticias | denegado/redirigido |
| OK | secretaria: datos entregados por el servidor | Recibe solo cuentas de comunidad (docentes, estudiantes, egresados) que gestiona; sin administradores. |
| OK | secretaria: API — modificar noticia (no permitido) | HTTP 403 Tu rol no puede modificar noticias. |
| OK | secretaria: intento de crear cuenta administradora | HTTP 403 Solo el administrador puede editar cuentas. |
| OK | coordinador: ingreso | {"rol":"coordinador","u":"qa30_coordinador"} |
| OK | coordinador: menú según permisos | menú: dashboard, programas, ix-alumnos, ix-horarios, egresados |
| OK | coordinador: URL directa #/admin/usuarios | denegado/redirigido |
| OK | coordinador: URL directa #/admin/config | denegado/redirigido |
| OK | coordinador: URL directa #/admin/auditoria | denegado/redirigido |
| OK | coordinador: URL directa #/admin/noticias | denegado/redirigido |
| OK | coordinador: datos entregados por el servidor | Recibe su cuenta y la de un alumno de su programa (ámbito propio). |
| OK | coordinador: API — modificar noticia (no permitido) | HTTP 403 Tu rol no puede modificar noticias. |
| OK | coordinador: intento de crear cuenta administradora | HTTP 403 Solo el administrador puede editar cuentas. |
| OK | transparencia: ingreso | {"rol":"transparencia","u":"qa30_transparencia"} |
| OK | transparencia: menú según permisos | menú: dashboard, documentos, tupa, licenciamiento, inversiones, convocatorias, servicios |
| OK | transparencia: URL directa #/admin/usuarios | denegado/redirigido |
| OK | transparencia: URL directa #/admin/config | denegado/redirigido |
| OK | transparencia: URL directa #/admin/auditoria | denegado/redirigido |
| OK | transparencia: URL directa #/admin/noticias | denegado/redirigido |
| OK | transparencia: datos entregados por el servidor | {"usuarios":1,"reclamos":0,"expedientes":0,"mensajes":0,"estudiantes":0,"postulaciones":0,"certs":0,"dniVisibles":0} |
| OK | transparencia: API — modificar noticia (no permitido) | HTTP 403 Tu rol no puede modificar noticias. |
| OK | transparencia: intento de crear cuenta administradora | HTTP 403 No tienes permiso para gestionar cuentas. |
| OK | atencion: ingreso | {"rol":"atencion","u":"qa30_atencion"} |
| OK | atencion: menú según permisos | menú: dashboard, mensajes, reclamos, expedientes, ix-bolsa |
| OK | atencion: URL directa #/admin/usuarios | denegado/redirigido |
| OK | atencion: URL directa #/admin/config | denegado/redirigido |
| OK | atencion: URL directa #/admin/auditoria | denegado/redirigido |
| OK | atencion: URL directa #/admin/noticias | denegado/redirigido |
| OK | atencion: datos entregados por el servidor | Recibe cuentas de empresas (validación de Bolsa laboral). |
| OK | atencion: API — modificar noticia (no permitido) | HTTP 403 Tu rol no puede modificar noticias. |
| OK | atencion: intento de crear cuenta administradora | HTTP 403 No tienes permiso para gestionar cuentas. |
| OK | directivo: ingreso | {"rol":"directivo","u":"qa30_directivo"} |
| OK | directivo: menú según permisos | menú: dashboard, ix-alumnos, ix-horarios, ix-certificados, ix-titulos, estadisticas, reclamos, expedientes, ix-bolsa |
| OK | directivo: URL directa #/admin/usuarios | denegado/redirigido |
| OK | directivo: URL directa #/admin/config | denegado/redirigido |
| OK | directivo: URL directa #/admin/auditoria | denegado/redirigido |
| OK | directivo: URL directa #/admin/noticias | denegado/redirigido |
| OK | directivo: datos entregados por el servidor | {"usuarios":1,"reclamos":7,"expedientes":7,"mensajes":0,"estudiantes":7,"postulaciones":3,"certs":3,"dniVisibles":7} |
| OK | directivo: API — modificar noticia (no permitido) | HTTP 403 Tu rol no puede modificar noticias. |
| OK | directivo: intento de crear cuenta administradora | HTTP 403 No tienes permiso para gestionar cuentas. |
| OK | docente: ingreso | {"rol":"docente","u":"qa30_docente"} |
| OK | docente: menú según permisos | menú: dashboard, cvdocente, ix-horarios |
| OK | docente: URL directa #/admin/usuarios | denegado/redirigido |
| OK | docente: URL directa #/admin/config | denegado/redirigido |
| OK | docente: URL directa #/admin/auditoria | denegado/redirigido |
| OK | docente: URL directa #/admin/noticias | denegado/redirigido |
| OK | docente: datos entregados por el servidor | {"usuarios":1,"reclamos":0,"expedientes":0,"mensajes":0,"estudiantes":0,"postulaciones":0,"certs":0,"dniVisibles":0} |
| OK | docente: API — modificar noticia (no permitido) | HTTP 403 Tu rol no puede modificar noticias. |
| OK | docente: intento de crear cuenta administradora | HTTP 403 No tienes permiso para gestionar cuentas. |
| OK | estudiante: ingreso | {"rol":"estudiante","u":"qa30_estudiante"} |
| OK | estudiante: menú según permisos | menú: dashboard, ix-horarios, ix-certificados, ix-bolsa |
| OK | estudiante: URL directa #/admin/usuarios | denegado/redirigido |
| OK | estudiante: URL directa #/admin/config | denegado/redirigido |
| OK | estudiante: URL directa #/admin/auditoria | denegado/redirigido |
| OK | estudiante: URL directa #/admin/noticias | denegado/redirigido |
| OK | estudiante: datos entregados por el servidor | {"usuarios":1,"reclamos":0,"expedientes":0,"mensajes":0,"estudiantes":1,"postulaciones":0,"certs":0,"dniVisibles":2} |
| OK | estudiante: API — modificar noticia (no permitido) | HTTP 403 Tu rol no puede modificar noticias. |
| OK | estudiante: intento de crear cuenta administradora | HTTP 403 No tienes permiso para gestionar cuentas. |
| OK | egresado: ingreso | {"rol":"egresado","u":"qa30_egresado"} |
| OK | egresado: menú según permisos | menú: dashboard, ix-certificados, ix-titulos, ix-bolsa |
| OK | egresado: URL directa #/admin/usuarios | denegado/redirigido |
| OK | egresado: URL directa #/admin/config | denegado/redirigido |
| OK | egresado: URL directa #/admin/auditoria | denegado/redirigido |
| OK | egresado: URL directa #/admin/noticias | denegado/redirigido |
| OK | egresado: datos entregados por el servidor | {"usuarios":1,"reclamos":0,"expedientes":0,"mensajes":0,"estudiantes":1,"postulaciones":0,"certs":0,"dniVisibles":2} |
| OK | egresado: API — modificar noticia (no permitido) | HTTP 403 Tu rol no puede modificar noticias. |
| OK | egresado: intento de crear cuenta administradora | HTTP 403 No tienes permiso para gestionar cuentas. |
| OK | empresa: ingreso | {"rol":"empresa","u":"qa30_empresa"} |
| OK | empresa: menú según permisos | menú: dashboard, ix-bolsa |
| OK | empresa: URL directa #/admin/usuarios | denegado/redirigido |
| OK | empresa: URL directa #/admin/config | denegado/redirigido |
| OK | empresa: URL directa #/admin/auditoria | denegado/redirigido |
| OK | empresa: URL directa #/admin/noticias | denegado/redirigido |
| REVISAR | empresa: datos entregados por el servidor | Ve al postulante a su oferta (correcto), pero con DNI completo; evaluar enmascararlo. |
| OK | empresa: API — modificar noticia (no permitido) | HTTP 403 Tu rol no puede modificar noticias. |
| OK | empresa: intento de crear cuenta administradora | HTTP 403 No tienes permiso para gestionar cuentas. |
| OK | admin: ingreso | {"rol":"admin","u":"qa30_admin2"} |
| OK | admin: menú según permisos | menú: dashboard, aprobaciones, paginas, portada, noticias, eventos, jerarquica, docentes, cvdocente, locales, programas, ix-alumnos, ix-horarios, egresados, admision, matricula, becas, ix-certificados, ix-titulos, certif |
| OK | admin: datos entregados por el servidor | {"usuarios":22,"reclamos":7,"expedientes":7,"mensajes":6,"estudiantes":7,"postulaciones":3,"certs":3,"dniVisibles":43} |
| OK | admin: API — modificar noticia (permitido) | HTTP 200  |
| OK | Cambio de rol cierra la sesión abierta del usuario | tras el cambio, la sesión anterior ve user=null |
| OK | Nuevo ingreso muestra el menú del nuevo rol | transparencia |
| FALLA | Admin secundario no puede desactivar la cuenta "nasca" | CRÍTICO: qa30_admin2 desactivó 'nasca' (HTTP 200) y cerró su sesión. Se reactivó desde qa30_admin2; 'nasca' vuelve a ingresar. |
| REVISAR | secretaria: cuentas visibles (detalle) | qa29-docente-1(docente), qa29-docente-2(docente), qa29-docente-3(docente), qa29-editor-1(estudiante), qa29-editor-2(estudiante), qa29-editor-3(estudiante), qa30_docente(docente), qa30_egresado(egresado), qa30_estudiante( |
| REVISAR | coordinador: cuentas visibles (detalle) | qa29-editor-1(estudiante), qa30_coordinador(coordinador) · campos: programaId,personaId,vin,dni,area,cargo,id,server_id,ixId,usuario,nombre,correo,rol,estado,has_password,ultimoAcceso,intentos,bloqueadoHasta |
| REVISAR | atencion: cuentas visibles (detalle) | 20999999019(empresa), 20999999027(empresa), 20999999035(empresa), qa30_atencion(atencion), qa30_empresa(empresa) · campos: programaId,personaId,vin,dni,area,cargo,id,server_id,ixId,usuario,nombre,correo,rol,estado,has_pa |
| REVISAR | empresa: cuentas visibles (detalle) | qa30_empresa(empresa) · campos: programaId,personaId,vin,dni,area,cargo,id,server_id,ixId,usuario,nombre,correo,rol,estado,has_password,ultimoAcceso,intentos,bloqueadoHasta · alumnos: QA29 1 ALUMNO SINTÉTICO:90000101 · p |
| OK | qa30_imagen restaurado a su rol original |  |
| OK | Cuenta inactiva no puede ingresar | Login falló: Usuario o contraseña incorrectos. |
| OK | Cuenta reactivada vuelve a ingresar |  |
| OK | Contraseña incorrecta rechazada (6 intentos) | Usuario o contraseña incorrectos. / Cuenta bloqueada por intentos fallidos. Espera cinco minutos o solicita el desbloqueo. |
| OK | Bloqueo temporal tras 6 intentos fallidos | Login falló: Cuenta bloqueada por intentos fallidos. Espera cinco minutos o solicita el desbloqueo. |
| OK | Admin ve el bloqueo de la cuenta | {"bloqueadoHasta":1793311163000,"intentos":0} |

### Fase D · 18 casos · OK: 12 · FALLA: 2 · REVISAR: 4

| Resultado | Caso | Detalle |
|---|---|---|
| OK | install.php inaccesible | HTTP 410 |
| FALLA | actualizar.php publicado | HTTP 200: formulario de actualización expuesto (protegido por install_key, pero debe eliminarse) |
| FALLA | recuperar.php publicado | HTTP 200: recuperación de acceso expuesta (protegida por install_key, pero debe eliminarse) |
| OK | Páginas privadas sin sesión (backup, respaldos, accounts, roles, auditoria) | HTTP 403 |
| OK | .env, .git/config, config.php, schema.sql | 403/404 |
| OK | Archivo adjunto privado sin sesión | HTTP 403 No tienes acceso a ese archivo |
| OK | API pública no expone datos privados | usuarios, reclamos, expedientes, mensajes, alumnos y certificados vacíos; DNI de becarios enmascarados (****) |
| OK | API pública no expone borradores ni eliminados | 0 registros en borrador/despublicados/papelera en la respuesta anónima |
| OK | Cookie de sesión | Secure; HttpOnly; SameSite=Lax |
| OK | Cabeceras X-Content-Type-Options, X-Frame-Options, Referrer-Policy | nosniff, SAMEORIGIN, strict-origin-when-cross-origin |
| REVISAR | Cabecera HSTS (Strict-Transport-Security) | no enviada |
| REVISAR | Content-Security-Policy | solo upgrade-insecure-requests |
| REVISAR | Cabecera X-Powered-By | expone PHP/8.3.36 |
| OK | Subida de .php y PHP renombrado a .pdf | rechazados (extensión y contenido) |
| OK | XSS en buscador y en mensaje de contacto | se muestra como texto; no se ejecuta |
| OK | Protección CSRF y escalamiento de privilegios por API | 9 perfiles no administradores reciben 403 al intentar crear un administrador |
| OK | Bloqueo por intentos fallidos | bloqueo de 5 minutos tras 6 intentos; registrado en auditoría |
| REVISAR | Límite de peticiones (rate limit) del hosting | descargas masivas de imágenes devuelven HTTP 429 |
