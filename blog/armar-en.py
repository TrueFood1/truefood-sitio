#!/usr/bin/env python3
"""English blog built from its reviewed Markdown sources; uses the ES parser."""
import runpy,html,re,json,datetime,argparse
from pathlib import Path
b=runpy.run_path(str(Path(__file__).with_name('armar.py')))
root=Path(__file__).resolve().parent.parent
parser=argparse.ArgumentParser();parser.add_argument('--solo-articulos',action='store_true');args=parser.parse_args()
folder=root/'blog/articulos-en'; out=root/'en/blog';out.mkdir(parents=True,exist_ok=True)
source_map=json.loads((folder/'equivalencias.json').read_text())
template=(root/'blog/plantillas/pagina-en.html').read_text()
items=[]
for f in sorted(folder.glob('*.md')):
 a=b['leer_articulo'](f)
 if a['borrador']:continue
 items.append(a)
 # Reuse the escaping and rendering of ES, then localize structural strings.
 es=source_map[a['nombre']]
 t=template.replace('{{es_url}}','../../blog/'+es+'.html').replace('{{raiz}}','../../')
 h=b['pagina_articulo'](t,a)
 h=h.replace('href="../blog.html"','href="../blog.html"')
 h=h.replace('href="../" aria-label="True Food, home"','href="../../en/" aria-label="True Food, home"')
 # Body image paths are relative to the site root in source.
 h=h.replace('src="../assets/', 'src="../../assets/') if 'src="../assets/' in h else h

 h=h.replace('https://truefoodcr.com/blog/'+a['nombre'],'https://truefoodcr.com/en/blog/'+a['nombre'])
 h=h.replace('Todos los art&iacute;culos','All articles').replace('aria-label="Ruta"','aria-label="Breadcrumb"')
 date=a['fecha'].strftime('%B %d, %Y').replace(' 0',' ')
 h=h.replace(b['fecha_larga'](a['fecha']),date)
 h=h.replace('</head>',f'<link rel="alternate" hreflang="es" href="https://truefoodcr.com/blog/{es}.html">\n<link rel="alternate" hreflang="en" href="https://truefoodcr.com/en/blog/{a["nombre"]}.html">\n</head>')
 (out/(a['nombre']+'.html')).write_text(h)
 # Keep language switch in ES source-generated HTML paired to the article.
 p=root/'blog'/(es+'.html')
 if p.exists():
  s=p.read_text().replace('href="../en/" lang="en" hreflang="en"','href="../en/blog/'+a['nombre']+'.html" lang="en" hreflang="en"')
  s=s.replace('</head>',f'<link rel="alternate" hreflang="en" href="https://truefoodcr.com/en/blog/{a["nombre"]}.html">\n</head>')
  p.write_text(s)
if True:
 items.sort(key=lambda a:(a['fecha'],a['nombre']),reverse=True)
 h=b['pagina_lista'](template.replace('{{es_url}}','../blog.html').replace('{{raiz}}','../'),items)
 h=h.replace('href="blog/','href="blog/').replace('src="assets/','src="../assets/')

 h=h.replace('href="./" aria-label="True Food, home"','href="./" aria-label="True Food, home"')
 h=h.replace('https://truefoodcr.com/blog.html','https://truefoodcr.com/en/blog.html')
 h=h.replace('Recetas, ideas y lo que vamos aprendiendo sobre comer delicioso, saludable y Gluten Free.','Recipes, ideas and what we learn about eating delicious, healthy and Gluten Free.')
 h=h.replace('Recetas, ideas y novedades de True Food: delicioso, saludable y Gluten Free.','Recipes, ideas and news from True Food: delicious, healthy and Gluten Free.')
 for a in items:h=h.replace(b['fecha_larga'](a['fecha']),a['fecha'].strftime('%B %d, %Y').replace(' 0',' '))
 (root/'en/blog.html').write_text(h)
# Pair the ES blog index with EN too, including branch previews.
p=root/'blog.html'
if p.exists():
 s=p.read_text().replace('href="en/" lang="en" hreflang="en"','href="en/blog.html" lang="en" hreflang="en"')
 p.write_text(s)
print('English blog built:' ,len(items),'articles')
