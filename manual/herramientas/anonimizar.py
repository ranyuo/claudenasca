import json, sys, random
# Uso: python3 anonimizar.py estado.json estado-demo.json
# Reemplaza la identidad institucional, el personal, los becarios y las noticias por datos ficticios.
src, dst = sys.argv[1], sys.argv[2]
d = json.load(open(src, encoding='utf-8'))
random.seed(7)
i = d['config']['inst']
i.update({"nombre":"Instituto de Educación Superior Tecnológico Público “Demostración”",
 "nombreCorto":"IESTP “Demostración”","siglaBanner":"IESTP DEMOSTRACIÓN","logoSigla":"DEMO",
 "slogan":"Formación tecnológica de calidad","lema":"Portal institucional — entorno de demostración",
 "direccion":"Av. Principal N.º 100, Distrito, Provincia, Región","telefono":"(056) 000-000",
 "correo":"informes@demo.edu.pe","ruc":"20000000001","codigoModular":"0000000",
 "fechaCreacion":"1990-01-01","normaCreacion":"Norma de creación de ejemplo.","logo":"",
 "descripcion":"Institución ficticia usada para elaborar el manual de uso de la plataforma."})
# Responsable del Libro de reclamaciones y datos de Mesa de partes (se cargan directamente:
# ver la incidencia de configuración documentada en el manual, capítulo 07).
d['config'].setdefault('lr', {}).update({"responsable":"Rosa Mendoza Soto","cargo":"Jefa de la Unidad de Bienestar y Empleabilidad",
  "correo":"reclamaciones@demo.edu.pe","areaInicial":"MP"})
d['config'].setdefault('mpv', {}).update({"correo":"mesadepartes@demo.edu.pe","telefono":"(056) 000-000","prefijo":"MPV-DEMO"})
for k in ('correoContacto','correoReclamos'):
    if k in d['config']: d['config'][k] = 'atencion@demo.edu.pe'
NOM = ["Ana","Luis","María","Jorge","Rosa","Carlos","Lucía","Pedro","Elena","Miguel","Sofía","Raúl","Carmen","Diego","Julia","Víctor"]
APE = ["Quispe Ramos","Flores Díaz","Torres Vega","Huamán Cruz","Rojas Paredes","Mendoza Soto","Castillo Ruiz","Vargas León","Chávez Rivas","Salazar Núñez"]
def fake(o):
    o['nombres'] = random.choice(NOM); o['apellidos'] = random.choice(APE)
for p in d.get('personas', []):
    fake(p); p['foto'] = ''; p['correo'] = 'docente@demo.edu.pe' if p.get('correo') else ''; p['telefono'] = ''
    if 'nombrePublicado' in p: p['nombrePublicado'] = f"{p['nombres']} {p['apellidos']}"
for b in d.get('becarios', []):
    fake(b); b['dni'] = str(random.randint(10000000, 99999999))
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
      "destacada":n==1,"estado":e,"autor":"Oficina de Imagen Institucional","fuente":"","creadoPor":"admin.demo","modPor":"admin.demo"})
    news.append(x)
d['noticias'] = news
json.dump(d, open(dst,'w',encoding='utf-8'), ensure_ascii=False)
print('ok', len(d['personas']), len(d['becarios']))
