# Manual de uso del Portal Institucional IEST

Manual estándar de la plataforma (portal web + intranet) que comparten las implementaciones de Marcona, Nasca, Chincha, Federico Uranga y las demás instituciones. Un solo texto sirve para todas; lo que cambia por institución (nombre, dominio, logo) se toma de una **ficha** en `instituciones/`.

> **Estado:** manual completo. Un capítulo por cada módulo de la intranet, en el orden del menú, más la introducción y un glosario.

## Estructura

```
manual/
├── README.md                 este archivo
├── plantilla-modulo.md       plantilla obligatoria para cada capítulo de módulo
├── contenido/                un capítulo por módulo, numerado en el orden del menú
│   ├── 00-introduccion.md        acceso, panel, roles y convenciones
│   ├── 01 … 36                   un archivo por módulo (01-inicio-aprobaciones.md … 36-copias-seguridad.md)
│   └── 37-glosario-faq.md        glosario y preguntas frecuentes
├── contenido-resumen/        versión resumida (~55 páginas): lo esencial de cada módulo
├── img/                      capturas generadas automáticamente (no editar a mano)
├── instituciones/            ficha de cada implementación (nombre, dominio, versión)
├── herramientas/
│   ├── preparar-demo.sh      instala una copia LOCAL del portal con datos ficticios
│   ├── anonimizar.py         reemplaza identidad, personal y becarios por datos ficticios
│   ├── capturas.js           ejecuta las escenas y toma las capturas numeradas
│   ├── lib.js                utilidades comunes (navegar, marcar con números, fotografiar)
│   ├── escenas/              una escena de captura por capítulo (NN-nombre.js)
│   └── construir.js          genera el manual en HTML y PDF
└── salida/                   manuales generados (HTML, PDF e imágenes comprimidas)
```

## Volúmenes previstos

| Volumen | Lectores | Contenido |
|---|---|---|
| A. Manual del Administrador | Administrador y soporte | Los 38 módulos, configuración y seguridad |
| B. Guías rápidas por rol | Imagen institucional, Secretaría académica, Coordinador, Transparencia, Atención al ciudadano, Directivo, Docente, Estudiante, Egresado, Empresa | Solo los módulos que ve cada rol |
| C. Guía del ciudadano | Público, postulantes, empresas | Servicios en línea del portal |

Las guías B y C se arman reutilizando las secciones del volumen A; no se redactan dos veces.

## Reglas de redacción

1. Cada módulo sigue `plantilla-modulo.md`, con sus secciones en el mismo orden.
2. Se escribe en segunda persona y en imperativo: «Pulsa **Guardar cambios**». Los nombres de botones, pestañas y campos van en **negrita** y se copian tal como aparecen en pantalla.
3. Cada captura lleva números rojos (①②③) y, debajo, una tabla que explica cada número.
4. Los flujos con estados llevan un diagrama (bloque `mermaid`).
5. No se incluyen datos personales reales. Todas las capturas salen de la instalación de prueba del IESTP “Ica”, la institución de referencia, con datos ficticios.
6. Los errores de la plataforma que se detecten al documentar se registran en un recuadro **Incidencia** dentro del capítulo y se reportan para su corrección.

## Cómo regenerar las capturas y el manual

Requisitos: PHP 8.2 o posterior, MariaDB o MySQL local, Node 18 o posterior con Playwright y Chromium.

Si es la primera vez, instala las dependencias:

```bash
cd manual/herramientas && npm install
```

Crea o reinicia la instalación de demostración en `http://127.0.0.1:8080`:

```bash
./preparar-demo.sh
```

Toma todas las capturas. También se puede tomar un solo capítulo pasando su prefijo, por ejemplo `node capturas.js 26-`. Los capítulos 10, 11, 16, 17 y 18 dependen entre sí y deben ejecutarse en ese orden:

```bash
node capturas.js
```

Genera el manual general (institución de referencia: IESTP “Ica”):

```bash
node construir.js ica
```

Versión resumida (unas 55 páginas): `node construir.js ica --resumen` → `salida/manual-ica-resumen.pdf`.

Para la edición de una institución concreta, usa su ficha, por ejemplo `node construir.js marcona`. El resultado queda en `salida/manual-<ficha>.html` y `salida/manual-<ficha>.pdf`.

`capturas.js` **se niega a correr contra un dominio que no sea local**. Crea y modifica registros, así que nunca debe apuntar a un portal en producción.

## Cuándo actualizar

Cada vez que se publique una versión nueva de la plataforma: se reinicia la demo, se vuelven a tomar las capturas y se revisan los capítulos de los módulos que cambiaron. La versión de la plataforma y la fecha figuran en la portada del manual.
