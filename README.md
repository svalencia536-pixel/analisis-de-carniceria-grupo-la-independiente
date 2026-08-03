# Aplicativo de Control de Porcionamiento — Grupo La Independiente

Aplicativo web autónomo (un solo archivo HTML, sin backend ni instalación) para
controlar el porcionamiento de proteínas en los restaurantes del Grupo La Independiente.

## Contenido de la carpeta
- `index.html` — el aplicativo completo. Ábrelo con doble clic en tu navegador.
- `CLAUDE.md` — contexto del proyecto para Claude Code (lo lee al arrancar).
- `CONSOLIDADO_PORCIONAMIENTO_LA_INDEPENDIENTE.xlsx` — plantilla Excel del consolidado.
- `README.md` — este archivo.

## Cómo usarlo (sin programar)
Doble clic en `index.html` y se abre en el navegador. Los datos se guardan solos
en ese navegador/equipo. Para respaldar, usa la pestaña Exportar (PDF/Excel).

## Cómo seguir mejorándolo con Claude Code
1. Instala Claude Code (ver la guía que te pasé).
2. Abre esta carpeta con Claude Code.
3. Escríbele: "Lee el CLAUDE.md y continuemos con los pendientes".

## Pendientes principales
- Ajustar la matriz de cortes con el archivo real de cortes por proteína.
- Cargar las listas reales de personal de corte y proveedores (pestaña Configuración).
- Revisar el "Anexo Informe.xlsx" del correo de Miguel Pereira.

## Notas técnicas
- Sin dependencias de build. Las librerías de PDF/Excel se cargan por CDN
  (jsPDF, jspdf-autotable, SheetJS), así que la primera vez necesita internet.
- La persistencia usa localStorage; funciona al abrir el HTML directamente en
  el navegador (no en vistas previas embebidas).
