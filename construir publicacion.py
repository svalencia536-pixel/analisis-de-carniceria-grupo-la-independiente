"""Arma la version publicable del aplicativo.

El hosting de Artifacts bloquea cualquier peticion a un servidor externo, asi que
las tres librerias que el index.html carga por CDN (jsPDF, jspdf-autotable y
SheetJS) se incrustan dentro del archivo. El resultado es un solo HTML que
funciona sin internet. El diseno y la logica del aplicativo no se tocan.

Uso:  python "construir publicacion.py"
Salida: publicacion/index.html
"""
import os
import re
import sys
import urllib.request

BASE = os.path.dirname(os.path.abspath(__file__))
ENTRADA = os.path.join(BASE, 'index.html')
SALIDA = os.path.join(BASE, 'publicacion', 'index.html')
CACHE = os.path.join(BASE, 'publicacion', 'lib')

LIBRERIAS = [
    ('jspdf.umd.min.js',
     'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'),
    ('jspdf.plugin.autotable.min.js',
     'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/'
     'jspdf.plugin.autotable.min.js'),
    # Build "mini": escribe .xlsx igual que el completo, pero sin las tablas de
    # codigos de pagina heredados. El completo que sirve el CDN trae miles de
    # caracteres de reemplazo (U+FFFD) que el hosting rechaza.
    ('xlsx.mini.min.js',
     'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.mini.min.js'),
]


def traer(nombre, url):
    """Devuelve el codigo de la libreria, descargandola solo la primera vez."""
    ruta = os.path.join(CACHE, nombre)
    if not os.path.exists(ruta):
        os.makedirs(CACHE, exist_ok=True)
        print(f'  descargando {nombre}...')
        urllib.request.urlretrieve(url, ruta)
    with open(ruta, encoding='utf8') as fh:
        # Un "</script" dentro del codigo cerraria la etiqueta antes de tiempo.
        return fh.read().replace('</script', r'<\/script')


def main():
    with open(ENTRADA, encoding='utf8') as fh:
        html = fh.read()

    estilo = re.search(r'<style>.*?</style>', html, re.S)
    cuerpo = re.search(r'<body>(.*)</body>', html, re.S)
    if not estilo or not cuerpo:
        sys.exit('No se encontro el <style> o el <body> en index.html')

    # El envoltorio de Artifacts ya aporta doctype, html, head y body.
    partes = ['<title>Análisis de Porcionamiento · Grupo La Independiente</title>',
              estilo.group(0)]
    for nombre, url in LIBRERIAS:
        partes.append(f'<script>/* {nombre} */\n{traer(nombre, url)}\n</script>')
    partes.append(cuerpo.group(1).strip())

    salida = '\n'.join(partes)
    # El hosting rechaza el archivo si algun caracter llego corrupto.
    if '�' in salida:
        sys.exit(f'{salida.count(chr(0xfffd))} caracteres corruptos (U+FFFD). '
                 'Borra publicacion/lib y vuelve a construir.')

    os.makedirs(os.path.dirname(SALIDA), exist_ok=True)
    with open(SALIDA, 'w', encoding='utf8') as fh:
        fh.write(salida)

    print(f'OK -> {SALIDA}  ({os.path.getsize(SALIDA) / 1024:.0f} KB)')


if __name__ == '__main__':
    main()
