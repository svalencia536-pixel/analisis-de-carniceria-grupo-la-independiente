# Proyecto: Aplicativo de Control de Porcionamiento — Grupo La Independiente

Aplicativo web autónomo (un solo archivo HTML, sin backend) para controlar el
porcionamiento de proteínas en los restaurantes del Grupo La Independiente.
Registra cortes por proteína, calcula rendimiento, mermas, costo por gramo y
valor de la pérdida, y consolida todo por período.

## Archivos
- `index.html` — el aplicativo completo (HTML + CSS + JS en un solo archivo).
- `CONSOLIDADO_PORCIONAMIENTO_LA_INDEPENDIENTE.xlsx` — plantilla Excel del consolidado
  con fórmulas vivas (referencia de estructura de columnas).

## Marca y contexto
- Marca: **Grupo La Independiente** (antes se llamó Rojo Madrid; ya migrado).
- Restaurantes / puntos de servicio (6): Rojo Madrid, Gigi, Kinto Elemento,
  Palo de Mango, Lola, Zaitún. (Rojo Madrid es un concepto del grupo, no la marca.)
- Elaborado por: JAIVER JIMENEZ (analista de porcionamiento) + lista editable.

## Lógica de cálculo (NO cambiar sin avisar — replica el Excel real)
- Gramos iniciales = kilos × 1000
- Valor factura = precio/kl × kilos
- Costo por gramo = valor factura ÷ gramos porcionados útiles (cantidad final)
- Costo por unidad de un corte = costo/gramo × peso del corte
- Subtotal productivo = gramos finales × costo/gramo
- Pérdida (g) = merma + desperdicio + diferencia no identificada
- Diferencia no identificada = gramos iniciales − productivos − merma − desperdicio
- % Rendimiento = gramos finales ÷ gramos iniciales
- % Pérdida = pérdida ÷ gramos iniciales
- Valor de la pérdida = pérdida (g) × costo/gramo
- Estado vs. estándar: verde si rendimiento ≥ rend. mínimo; amarillo si está
  hasta 3 puntos por debajo; rojo si cae más.

## Estructura del aplicativo (pestañas)
Menú lateral izquierdo (en móvil pasa arriba):
1. **Nuevo análisis** — encabezado, matriz de cortes autocargada, pérdidas,
   variación de horas, conciliación de factura, resultado. Botones de imprimir,
   descargar PDF (una hoja) y compartir (Web Share API).
2. **Consolidado** — todos los análisis con gramaje y valor de pérdida, totales.
3. **Estándares** — niveles aceptables de pérdida por producto.
4. **Matriz cortes** — catálogo editable de cortes por proteína.
5. **Panel** — KPIs de rendimiento, subtotal, valor pérdida, gramos perdidos.
6. **Configuración** — gestión de personal de corte, proveedores y restaurantes.
7. **Exportar** — PDF, Excel (con hojas Resumen, Consolidado, Detalle cortes) y correo.

## Comportamientos clave
- **Consecutivo #**: automático y no editable, se asigna según secuencia
  (mayor consecutivo guardado + 1, formato 0001). Se reajusta al borrar.
- **Matriz de cortes**: al seleccionar la proteína se cargan sus cortes típicos
  (marcados "auto") + 2 filas manuales vacías. Se puede agregar cortes manuales.
- **Impresión**: imprime la pestaña activa en una sola hoja A4; oculta menú y botones.
- Proveedor y "Elaborado por" son listas desplegables (solo selección).
- Control de temperatura: ELIMINADO (no reincorporar).

## Estado actual de los datos en el código
- `catalogo` (objeto JS): 29 proteínas / 93 cortes, extraídos de las planillas
  reales de GIGI, KINTO y LOLA (2026). Peso 1 = corte que se registra en gramos
  sueltos (recortes, insumos para sushi/cevichería).
- `CAT_VER`: versión del catálogo/estándares. Al publicar datos nuevos hay que
  subirla; lo guardado en localStorage con una versión anterior se descarta para
  que no pise al código. Los análisis del usuario NO se pierden.
- `estandares` (array): 10 productos con desperdicio/merma/no identificada.
  Los nombres deben coincidir exactamente con las claves de `catalogo`.
- `personas`, `proveedores`, `restaurantes`: listas iniciales mínimas, se editan
  en la pestaña Configuración.

## PENDIENTES
1. ~~Persistencia local~~ ✅ HECHO. Guarda en localStorage (clave
   `porcionamiento_la_independiente_v1`): análisis, aId, personas, proveedores,
   restaurantes, estandares y catalogo. Se persiste tras cada cambio y se carga
   al arrancar. Hay botón "Borrar datos" en Configuración. Si localStorage no
   está disponible (p.ej. vista previa embebida), lo detecta y avisa; funciona
   al abrir el HTML directamente en el navegador.
2. ~~Ajustar matriz de cortes~~ ✅ HECHO (2026-08-03) con las planillas reales de
   GIGI, KINTO y LOLA. Falta cruzar con las planillas de los otros puntos
   (Palo de Mango, Zaitún, Rojo Madrid) cuando Sergio las comparta.
3. **Listas reales** de personal de corte y proveedores del grupo. Sergio no
   tiene la lista todavía; el aplicativo funciona igual y se editan en
   Configuración.
4. Revisar si el "Anexo Informe.xlsx" (correo de Miguel Pereira) tiene una
   estructura de consolidado distinta a replicar.

## Convenciones
- Todo en español, tono operativo.
- Identidad visual: acentos en rojo (#B01B2E).
- Moneda: pesos colombianos, formato es-CO.
- Mantener el archivo autónomo (sin dependencias de build); las librerías de
  PDF/Excel se cargan por CDN (jsPDF, jspdf-autotable, SheetJS).
