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
- Valor de la pérdida = pérdida (g) × costo/gramo **absorbido**.
  DIVERGENCIA DELIBERADA (decidida por Sergio el 2026-08-03): las planillas de
  Excel valoran la pérdida al precio de compra (precio kl ÷ 1000), lo que da una
  cifra menor. El aplicativo usa el costo absorbido a propósito. Las planillas
  son hojas de trabajo con fórmulas vivas, no la referencia a replicar en esto.
  NO "corregir" para que coincida con el Excel.
- **Cortes de costo fijo** (constante `COSTO_FIJO`, decidido por Sergio el
  2026-09-14): RECORTE DE PULPO y RECORTE Y CABEZA DE PULPO cuestan $1 fijo
  (unidad y total). Siguen contando en gramos porcionados, rendimiento y
  participación, pero no absorben factura: costo/gramo = (valor factura −
  costos fijos) ÷ (gramos porcionados − gramos de costo fijo), y el subtotal
  productivo es la suma de los costos por corte. Solo aplica a esos dos.
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
- `CAT_VER` (hoy 4): versión de `catalogo`, `estandares`, `personas` y
  `proveedores`. Al publicar datos nuevos hay que subirla; lo guardado en
  localStorage con una versión anterior se descarta para que no pise al código.
  Los análisis del usuario NO se pierden, pero sí las ediciones a esas listas.
- `personas`: personal de corte real del grupo (5). Aparecen en "Elaborado por".
- `proveedores`: 15, consolidados de las planillas de KINTO, LOLA y GIGI
  (hoja "Hoja3" = producto→proveedor, columna Proveedor de "PORCIONAMIENTOS" y
  el campo "PROVEEDOR / FACTURA :" de las hojas de análisis). Se unificaron
  variantes del mismo nombre: ATLANTIC = ATLANTIC FS S.A.S., CASTROMAR =
  CASTROMAR ALIMENTOS S.A.S., LA FAENA = LA FAENA ALIMENTOS S.A.S.
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
3. ~~Listas reales~~ ✅ HECHO (2026-08-03). Personal de corte: ARLINTON,
   MARISELA BROCHERO, NOE GARCIA, YAISI, YAMELIS. Proveedores: 15 consolidados
   de las planillas. Ambas se siguen editando en Configuración.
4. Revisar si el "Anexo Informe.xlsx" (correo de Miguel Pereira) tiene una
   estructura de consolidado distinta a replicar.

## Respaldo en Drive (2026-09-17)
- `drive/Porcionamiento - script de Google.gs`: Apps Script que recibe cada
  análisis y lo escribe en el libro del grupo (hojas **Panel**, **Consolidado**
  con segmentador por restaurante, y **Detalle cortes**). Mismo esquema que el
  registro de producción de fichas técnicas. ARCHIVO ASCII: las tildes van como
  `á`; no pegar caracteres acentuados, rompen Apps Script al copiar.
- En las hojas de datos: título en filas 1-2, encabezados en la 3, datos desde
  la 4 (`FILA_ENC` / `FILA_DATOS`). Las 14 primeras columnas del Consolidado
  replican el reporte del aplicativo; el resto va después. Si se agrega una
  columna va AL FINAL: el Panel lee por posición (Col1, Col2...).
- En `index.html`: `DRIVE_URL` (vacío = respaldo apagado, el aplicativo funciona
  igual), `DRIVE_CLAVE`, y una cola en localStorage (`porcionamiento_cola_drive_v1`)
  que reintenta al abrir, al volver el internet y cada 5 minutos. Cada análisis
  lleva `uid` y se marca `drive:true` al confirmarse; borrar uno ya enviado manda
  anularlo (en la hoja queda ANULADO, no se borra). Botón "Respaldar lo que
  falte" en Consolidado para subir lo viejo.
- El respaldo NO funciona dentro del visor de Artifacts: bloquea las peticiones
  a servidores externos. Sí funciona en Railway y con el archivo abierto en el
  navegador.

## Convenciones
- Todo en español, tono operativo.
- Identidad visual: acentos en rojo (#B01B2E).
- Moneda: pesos colombianos, formato es-CO.
- Mantener el archivo autónomo (sin dependencias de build); las librerías de
  PDF/Excel se cargan por CDN (jsPDF, jspdf-autotable, SheetJS).
