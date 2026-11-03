import json, sys, random
# Uso: python3 anonimizar.py estado.json estado-demo.json
# Reemplaza la identidad institucional, el personal, los becarios y las noticias por datos ficticios.
src, dst = sys.argv[1], sys.argv[2]
d = json.load(open(src, encoding='utf-8'))
random.seed(7)
i = d['config']['inst']
i.update({"nombre":"Instituto de Educación Superior Tecnológico Público “Ica”",
 "nombreCorto":"IESTP “Ica”","siglaBanner":"IESTP ICA","logoSigla":"ICA",
 "slogan":"Formación tecnológica de calidad","lema":"Formación tecnológica para el desarrollo de Ica",
 "direccion":"Av. Principal N.º 100, Ica, Ica","telefono":"(056) 000-000",
 "correo":"informes@ica.aplicacion.io","ruc":"20000000001","codigoModular":"0000000",
 "fechaCreacion":"1990-01-01","normaCreacion":"Norma de creación de referencia (dato ficticio).","logo":"",
 "descripcion":"Institución de referencia usada para elaborar el manual de uso de la plataforma. Los datos son ficticios."})
# Responsable del Libro de reclamaciones y datos de Mesa de partes (se cargan directamente:
# ver la incidencia de configuración documentada en el manual, capítulo 26).
d['config'].setdefault('lr', {}).update({"responsable":"Rosa Mendoza Soto","cargo":"Jefa de la Unidad de Bienestar y Empleabilidad",
  "correo":"reclamaciones@ica.aplicacion.io","areaInicial":"MP"})
d['config'].setdefault('mpv', {}).update({"correo":"mesadepartes@ica.aplicacion.io","telefono":"(056) 000-000","prefijo":"MPV-ICA"})
for k in ('correoContacto','correoReclamos'):
    if k in d['config']: d['config'][k] = 'atencion@ica.aplicacion.io'
NOM = ["Ana","Luis","María","Jorge","Rosa","Carlos","Lucía","Pedro","Elena","Miguel","Sofía","Raúl","Carmen","Diego","Julia","Víctor"]
APE = ["Quispe Ramos","Flores Díaz","Torres Vega","Huamán Cruz","Rojas Paredes","Mendoza Soto","Castillo Ruiz","Vargas León","Chávez Rivas","Salazar Núñez"]
def fake(o):
    o['nombres'] = random.choice(NOM); o['apellidos'] = random.choice(APE)
for p in d.get('personas', []):
    fake(p); p['foto'] = ''; p['correo'] = 'docente@ica.aplicacion.io' if p.get('correo') else ''; p['telefono'] = ''
    if 'nombrePublicado' in p: p['nombrePublicado'] = f"{p['nombres']} {p['apellidos']}"
for b in d.get('becarios', []):
    fake(b); b['dni'] = str(random.randint(10000000, 99999999))
# Áreas receptoras (Mesa de partes y derivaciones): responsables y correos ficticios.
for n, ar in enumerate(d.get('academico', {}).get('areas', [])):
    ar['resp'] = random.choice(NOM) + ' ' + random.choice(APE)
    ar['correo'] = (ar.get('cod') or f'area{n}').lower() + '@ica.aplicacion.io'
for j in d.get('jerarquica', []):
    for k in ('nombre','nombres'):
        if k in j and j[k]: j[k] = random.choice(NOM)+' '+random.choice(APE)
    if 'foto' in j: j['foto'] = ''
d['categoriasNoticia'] = [
 {"id":"cat-inst","nombre":"Institucional","slug":"institucional","orden":1,"estado":"Activo"},
 {"id":"cat-acad","nombre":"Académico","slug":"academico","orden":2,"estado":"Activo"},
 {"id":"cat-com","nombre":"Comunicados","slug":"comunicados","orden":3,"estado":"Activo"}]
base = d['noticias'][0]
demo = [("Inicio del semestre académico 2026-II","cat-acad","2026-08-17","Publicada","Se da la bienvenida a los estudiantes al nuevo semestre académico."),
        ("Ceremonia de aniversario institucional","cat-inst","2026-09-20","Publicada","La comunidad educativa celebró un nuevo aniversario con actividades culturales."),
        ("Comunicado: horario de atención en feriado","cat-com","2026-10-07","Publicada","Se informa el horario de atención de la mesa de partes durante el feriado."),
        ("Feria de proyectos tecnológicos","cat-acad","2026-10-25","Borrador","Los estudiantes presentarán sus proyectos de innovación tecnológica.")]
news = []
for n,(t,c,f,e,r) in enumerate(demo,1):
    x = dict(base); x.update({"id":f"demo-noticia-{n}","titulo":t,"slug":t.lower().replace(' ','-').replace(':','').replace('é','e').replace('ó','o').replace('í','i').replace('á','a'),
      "categoriaId":c,"fecha":f+"T09:00:00-05:00","resumen":r,"contenido":f"<p>{r}</p>","imagen":"","video":"","adjuntos":[],
      "destacada":n==1,"estado":e,"autor":"Oficina de Imagen Institucional","fuente":"","creadoPor":"admin.ica","modPor":"admin.ica"})
    news.append(x)
d['noticias'] = news
# Restos de la institución de origen en textos (SEO, WhatsApp, ventana emergente, carrusel, páginas…):
# se reemplazan por la institución de referencia. No se tocan rutas de archivos ni URL.
import re as _re
def _limpiar(o):
    if isinstance(o, dict): return {k: _limpiar(v) for k, v in o.items()}
    if isinstance(o, list): return [_limpiar(v) for v in o]
    if isinstance(o, str) and not o.startswith(('/assets', 'http', 'data:')):
        o = o.replace('istpnasca.edu.pe', 'ica.aplicacion.io')
        o = _re.sub(r'\bNASCA\b', 'ICA', o)
        o = _re.sub(r'\bNasca\b', 'Ica', o)
    return o
d = _limpiar(d)
c = d['config']
c.setdefault('redes', {})['facebook'] = ''
for sv in d.get('servicios', []):
    if sv.get('responsable') and not sv['responsable'].startswith('Confirmar'):
        sv['responsable'] = random.choice(NOM) + ' ' + random.choice(APE)
if isinstance(d.get('tupaDocs'), dict) and d['tupaDocs'].get('referencia'):
    d['tupaDocs']['referencia'] = d['tupaDocs']['referencia'].replace('IESTP-N/', 'IESTP-ICA/')
for k in ('seo', 'popup'):
    if isinstance(c.get(k), dict) and 'nasca' in str(c[k].get('imagen', '')): c[k]['imagen'] = ''
json.dump(d, open(dst,'w',encoding='utf-8'), ensure_ascii=False)
print('ok', len(d['personas']), len(d['becarios']))
