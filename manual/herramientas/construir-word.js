// Genera la versión resumida del manual en Word (.docx) a partir de contenido-resumen/*.md.
// Uso: node construir-word.js [ficha]   (por defecto: ica) → salida/manual-<ficha>-resumen.docx
// Requiere haber ejecutado antes `node construir.js <ficha> --resumen` (crea salida/img/ comprimidas).
const fs = require('fs');
const path = require('path');
const { marked } = require('marked');
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, ImageRun, Table, TableRow, TableCell, WidthType,
  ShadingType, AlignmentType, LineRuleType, BorderStyle, LevelFormat, PageBreak, Footer, Header, PageNumber, TableOfContents,
} = require('docx');

const RAIZ = path.resolve(__dirname, '..');
const fichaId = process.argv[2] || 'ica';
const ficha = JSON.parse(fs.readFileSync(path.join(RAIZ, 'instituciones', fichaId + '.json'), 'utf8'));
const IMG = path.join(RAIZ, 'salida', 'img');
const FUENTE = 'Calibri';
const AZUL = '0B1D3F', AZUL2 = '0F6FB5', GRIS = '5A6577', LINEA = 'D8DEE8', FILA = 'F1F4F9';
const ANCHO = 9638; // A4 con márgenes de 2 cm, en DXA

const reemplazar = s => s.replace(/\{\{inst\.(\w+)\}\}/g, (_, k) => ficha[k] ?? '');
const decode = s => s.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');

// Texto en línea de marked → TextRun (negrita, cursiva, código, enlaces)
function runs(tokens, estilo = {}) {
  const out = [];
  for (const t of tokens || []) {
    if (t.type === 'strong') out.push(...runs(t.tokens, { ...estilo, bold: true }));
    else if (t.type === 'em') out.push(...runs(t.tokens, { ...estilo, italics: true }));
    else if (t.type === 'codespan') out.push(new TextRun({ text: decode(t.text), font: 'Consolas', size: 17, ...estilo }));
    else if (t.type === 'link') out.push(...runs(t.tokens, { ...estilo, color: AZUL2 }));
    else if (t.type === 'br') out.push(new TextRun({ break: 1 }));
    else if (t.tokens) out.push(...runs(t.tokens, estilo));
    else out.push(new TextRun({ text: decode(t.text ?? t.raw ?? ''), ...estilo }));
  }
  return out;
}

let nFig = 0;
function imagen(href, alt) {
  const f = path.join(IMG, path.basename(href));
  if (!fs.existsSync(f)) { console.warn('  ! falta imagen', f); return []; }
  const buf = fs.readFileSync(f);
  // Dimensiones JPEG (marcador SOF)
  let w = 1400, h = 870;
  for (let i = 2; i < buf.length;) {
    if (buf[i] !== 0xFF) break;
    const m = buf[i + 1], len = buf.readUInt16BE(i + 2);
    if (m >= 0xC0 && m <= 0xC3) { h = buf.readUInt16BE(i + 5); w = buf.readUInt16BE(i + 7); break; }
    i += 2 + len;
  }
  const maxW = 640, maxH = 480; // px a 96 ppp (≈ 16,9 × 12,7 cm)
  const k = Math.min(maxW / w, maxH / h);
  nFig++;
  return [
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 120, after: 40, line: 240, lineRule: LineRuleType.AUTO }, keepNext: true,
      children: [new ImageRun({ type: 'jpg', data: buf, transformation: { width: Math.round(w * k), height: Math.round(h * k) }, altText: { title: alt, description: alt, name: path.basename(href) } })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 120 },
      children: [new TextRun({ text: `Figura ${nFig}. `, bold: true, size: 17, color: GRIS }), new TextRun({ text: decode(alt), size: 17, color: GRIS })] }),
  ];
}

function tabla(t) {
  const n = t.header.length;
  const primera = (t.header[0].text || '').trim();
  const pesos = n === 3 ? (/^N\.?º?$/.test(primera) ? [9, 36, 55] : [22, 46, 32]) : n === 2 ? [30, 70] : Array(n).fill(100 / n);
  const anchos = pesos.map(p => Math.round(ANCHO * p / 100));
  anchos[anchos.length - 1] += ANCHO - anchos.reduce((a, b) => a + b, 0);
  const borde = { style: BorderStyle.SINGLE, size: 4, color: LINEA };
  const celda = (tokens, i, cab, par) => new TableCell({
    width: { size: anchos[i], type: WidthType.DXA },
    shading: cab ? { type: ShadingType.CLEAR, fill: AZUL, color: 'auto' } : par ? { type: ShadingType.CLEAR, fill: FILA, color: 'auto' } : undefined,
    margins: { top: 50, bottom: 50, left: 90, right: 90 },
    borders: { top: borde, bottom: borde, left: borde, right: borde },
    children: [new Paragraph({ children: runs(tokens, cab ? { bold: true, color: 'FFFFFF', size: 18 } : { size: 18 }) })],
  });
  return new Table({
    width: { size: ANCHO, type: WidthType.DXA }, columnWidths: anchos,
    rows: [
      new TableRow({ tableHeader: true, cantSplit: true, children: t.header.map((h, i) => celda(h.tokens, i, true)) }),
      ...t.rows.map((r, j) => new TableRow({ cantSplit: true, children: r.map((c, i) => celda(c.tokens, i, false, j % 2 === 1)) })),
    ],
  });
}

let listaId = 0;
function bloques(tokens) {
  const out = [];
  for (const t of tokens) {
    if (t.type === 'heading') {
      const nivel = { 1: HeadingLevel.HEADING_1, 2: HeadingLevel.HEADING_2, 3: HeadingLevel.HEADING_3 }[t.depth] || HeadingLevel.HEADING_3;
      out.push(new Paragraph({ heading: nivel, children: runs(t.tokens) }));
    } else if (t.type === 'paragraph') {
      const img = (t.tokens || []).find(x => x.type === 'image');
      if (img && t.tokens.filter(x => x.type !== 'text' || x.text.trim()).length === 1) out.push(...imagen(img.href, img.text));
      else out.push(new Paragraph({ spacing: { after: 100 }, children: runs(t.tokens) }));
    } else if (t.type === 'list') {
      const ref = t.ordered ? `num-${listaId++}` : 'vinetas';
      for (const it of t.items) {
        const inline = it.tokens.flatMap(x => x.type === 'text' || x.type === 'paragraph' ? (x.tokens || [x]) : []);
        out.push(new Paragraph({ numbering: { reference: ref, level: 0 }, spacing: { after: 40 }, children: runs(inline) }));
      }
      out.push(new Paragraph({ spacing: { after: 60 }, children: [] }));
    } else if (t.type === 'table') {
      out.push(tabla(t), new Paragraph({ spacing: { after: 100 }, children: [] }));
    } else if (t.type === 'blockquote') {
      out.push(...bloques(t.tokens));
    } else if (t.type === 'code') {
      out.push(new Paragraph({ children: [new TextRun({ text: t.text, font: 'Consolas', size: 17 })] }));
    }
  }
  return out;
}

const capitulos = fs.readdirSync(path.join(RAIZ, 'contenido-resumen')).filter(f => /^\d+.*\.md$/.test(f)).sort();
const cuerpo = [];
capitulos.forEach((f, i) => {
  const md = reemplazar(fs.readFileSync(path.join(RAIZ, 'contenido-resumen', f), 'utf8'));
  const hijos = bloques(marked.lexer(md));
  cuerpo.push(...hijos);
});
const nListas = listaId;

const hoy = new Date().toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'America/Lima' });
const portada = [
  new Paragraph({ spacing: { before: 2400, after: 200 }, children: [new TextRun({ text: 'MANUAL DE USO · VERSIÓN RESUMIDA', bold: true, size: 20, color: 'B8860B' })] }),
  new Paragraph({ spacing: { after: 160 }, children: [new TextRun({ text: 'Portal institucional e intranet', bold: true, size: 56, color: AZUL, font: FUENTE })] }),
  new Paragraph({ spacing: { after: 600 }, children: [new TextRun({ text: ficha.nombre, size: 28, color: GRIS })] }),
  ...[['Sitio', ficha.dominio], ['Plataforma', ficha.versionPlataforma], ['Edición', 'Lo esencial de cada módulo en una o dos páginas'], ['Fecha', hoy]]
    .map(([k, v]) => new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: k + ': ', bold: true, color: AZUL }), new TextRun({ text: v })] })),
  new Paragraph({ spacing: { before: 600 }, children: [new TextRun({ text: (ficha.nota || '') + ' Las capturas se tomaron en una instalación de prueba con datos ficticios.', size: 18, color: GRIS, italics: true })] }),
  new Paragraph({ children: [new PageBreak()] }),
  new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun('Contenido')] }),
  new TableOfContents('Contenido', { hyperlink: true, headingStyleRange: '1-1' }),
  new Paragraph({ spacing: { before: 120 }, children: [new TextRun({ text: 'Si el índice aparece vacío, haz clic derecho sobre él y elige «Actualizar campos».', size: 16, color: GRIS, italics: true })] }),
  new Paragraph({ children: [new PageBreak()] }),
];

const doc = new Document({
  creator: 'Manual del portal', title: `Manual de uso (resumido) · ${ficha.nombreCorto}`,
  features: { updateFields: true },
  styles: {
    default: { document: { run: { font: FUENTE, size: 20 }, paragraph: { spacing: { line: 264, lineRule: LineRuleType.AUTO } } } },
    paragraphStyles: [
      { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { font: FUENTE, size: 34, bold: true, color: AZUL },
        paragraph: { spacing: { before: 360, after: 140 }, keepNext: true, outlineLevel: 0, border: { bottom: { style: BorderStyle.SINGLE, size: 18, color: 'F2B705', space: 4 } } } },
      { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { font: FUENTE, size: 26, bold: true, color: AZUL }, paragraph: { spacing: { before: 200, after: 80 }, keepNext: true, outlineLevel: 1 } },
      { id: 'Heading3', name: 'Heading 3', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { font: FUENTE, size: 22, bold: true, color: AZUL2 }, paragraph: { spacing: { before: 160, after: 60 }, keepNext: true, outlineLevel: 2 } },
    ],
  },
  numbering: {
    config: [
      { reference: 'vinetas', levels: [{ level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 400, hanging: 260 } } } }] },
      ...Array.from({ length: nListas }, (_, i) => ({ reference: `num-${i}`, levels: [{ level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 400, hanging: 300 } } } }] })),
    ],
  },
  sections: [{
    properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1134, bottom: 1134, left: 1134, right: 1134 } } },
    headers: { default: new Header({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: `Manual de uso · ${ficha.nombreCorto}`, size: 16, color: GRIS })] })] }) },
    footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ children: ['Página ', PageNumber.CURRENT, ' de ', PageNumber.TOTAL_PAGES], size: 16, color: GRIS })] })] }) },
    children: [...portada, ...cuerpo],
  }],
});

const salida = path.join(RAIZ, 'salida', `manual-${fichaId}-resumen.docx`);
Packer.toBuffer(doc).then(b => { fs.writeFileSync(salida, b); console.log(`Listo: salida/${path.basename(salida)} (${capitulos.length} capítulos, ${nFig} figuras)`); });
