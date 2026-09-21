/**
 * Respaldo en Drive del aplicativo de porcionamiento de proteinas.
 *
 * Recibe cada analisis que se guarda en el aplicativo y lo escribe en UN libro
 * de Google del grupo, con tres hojas:
 *   - Panel           indicadores con filtro de fechas y restaurante
 *   - Consolidado     una fila por analisis, igual al reporte del aplicativo,
 *                     con segmentador por restaurante
 *   - Detalle cortes  una fila por corte porcionado, con segmentador
 *
 * El aplicativo sigue guardando en el equipo como siempre. Esto es un respaldo
 * y una forma de revisar todo desde el correo del grupo, sin ir a cada PC.
 * Es el mismo esquema del registro de produccion de las fichas tecnicas.
 *
 * ---------------------------------------------------------------------------
 * COMO SE MONTA (una sola vez, con la cuenta del grupo)
 *
 *   1. En script.google.com: Nuevo proyecto. Borrar lo que trae, pegar este
 *      archivo y guardar.
 *   2. Arriba elegir montarTodo y Ejecutar. Pide permisos: aceptarlos.
 *      Crea la carpeta y el libro EN ESTA CUENTA, arma las hojas y comparte la
 *      carpeta con COMPARTIR_CON. Se puede correr otra vez sin miedo: lo que
 *      ya existe lo reutiliza y los datos no se tocan.
 *   3. Implementar > Nueva implementacion > Aplicacion web,
 *      ejecutar como Yo, acceso Cualquier usuario. Copiar la direccion que
 *      termina en /exec: esa es la que va en el aplicativo.
 *
 * COMO SE ACTUALIZA
 *   Implementar > Gestionar implementaciones > el lapiz > Version: Nueva.
 *   Si solo se guarda, la direccion sigue sirviendo la version vieja.
 *
 * TODO EL ARCHIVO ES ASCII A PROPOSITO. Los textos con tilde van escritos como
 * codigos (\u00e1 es a con tilde): un caracter con tilde pegado a mano se puede
 * partir al copiar y Apps Script solo responde "Invalid or unexpected token".
 * ---------------------------------------------------------------------------
 */

/* La misma clave que lleva el aplicativo. Si no coinciden, no se escribe. */
var CLAVE = 'PORCIONAMIENTO-GLI-2026';

/* La carpeta del Drive del grupo donde vive el libro. Va por identificador y
   no por nombre A PROPOSITO: asi se le puede cambiar el nombre, o moverla de
   sitio, sin que nada deje de funcionar. Si se deja vacio, el script crea una
   carpeta llamada NOMBRE_CARPETA. */
var CARPETA_ID = '1Wj3xuMvv1YFJzHz876I07Ea8-LGbQLhI';
var NOMBRE_CARPETA = 'PORCIONAMIENTO DE PROTEINAS - DESDE LA APP';
var NOMBRE_LIBRO = 'PORCIONAMIENTO DE PROTEINAS - GRUPO LA INDEPENDIENTE';

/* Con quien se comparte la carpeta, como editor. La cuenta del grupo es la
   duena; aqui va quien administra los costos hoy. */
var COMPARTIR_CON = ['svalencia536@gmail.com'];

var ZONA = 'America/Bogota';
var PROP_LIBRO = 'LIBRO_ID';
var PROP_CARPETA = 'CARPETA_ID';

/* Identidad visual del aplicativo */
var ROJO = '#B01B2E';
var ROJO_OSCURO = '#7D1220';
var ROSADO = '#F7F2F3';
var LINEA = '#E3D9DB';
var TEXTO = '#1E2229';
var GRIS = '#6B7280';

var HOJA_PANEL = 'Panel';
var HOJA_CONS = 'Consolidado';
var HOJA_DET = 'Detalle cortes';
var HOJA_LISTAS = 'Listas';

/* Las filas 1 y 2 llevan el titulo y el segmentador; los titulos de columna
   van en la 3 y los datos empiezan en la 4. */
var FILA_ENC = 3;
var FILA_DATOS = 4;

/* Consolidado: una fila por analisis. Las 14 primeras columnas siguen el
   reporte Consolidado del aplicativo, en el mismo orden. Despues va el
   detalle. El Panel lee por posicion (Col1, Col2...): si se agrega una
   columna, va AL FINAL. */
var COLS_CONS = [
  /* A-N  como el reporte del aplicativo */
  'Fecha', 'Folio', 'Restaurante', 'Producto', 'Proveedor', 'Precio kilo',
  'Inicial (g)', 'Final (g)', 'P\u00e9rdida (g)', '% Rendimiento', 'Costo por gramo',
  'Subtotal productivo', 'Valor p\u00e9rdida', 'Estado',
  /* O-AD  detalle */
  'Factura', 'Kilos', 'Merma (g)', 'Desperdicio (g)', 'No identificada (g)',
  '% P\u00e9rdida', 'Valor factura', 'Rendimiento m\u00ednimo', 'Elaborado por',
  'Hora inicio', 'Hora final', 'Duraci\u00f3n', 'Operaciones',
  'Registrado', 'Id', 'Vigencia'
];
var FMT_CONS = [
  'dd/mm/yyyy', '@', '@', '@', '@', '$#,##0',
  '#,##0', '#,##0', '#,##0', '0.0%', '$#,##0.00',
  '$#,##0', '$#,##0', '@',
  '@', '#,##0.00', '#,##0', '#,##0', '#,##0',
  '0.0%', '$#,##0', '0.0%', '@',
  '@', '@', '@', '0',
  'dd/mm/yyyy hh:mm', '@', '@'
];
var ANCHO_CONS = [90, 60, 115, 200, 210, 90,
                  80, 80, 80, 95, 95,
                  115, 105, 110,
                  95, 70, 85, 105, 120,
                  85, 110, 120, 140,
                  85, 85, 85, 90,
                  125, 110, 85];
var COL_ESTADO_CONS = 14;   /* N */
var COL_ID_CONS = 29;       /* AC */
var COL_VIG_CONS = 30;      /* AD */

var COLS_DET = [
  'Fecha', 'Folio', 'Restaurante', 'Producto', 'Corte', 'Tipo',
  'Peso (g)', 'Cantidad', 'Gramos', 'Costo unidad', 'Costo total',
  '% Participaci\u00f3n', 'Id', 'Vigencia'
];
var FMT_DET = ['dd/mm/yyyy', '@', '@', '@', '@', '@', '#,##0', '#,##0', '#,##0',
               '$#,##0.00', '$#,##0.00', '0.00%', '@', '@'];
var ANCHO_DET = [90, 60, 115, 180, 240, 170, 75, 80, 90, 105, 115, 115, 110, 85];
var COL_ID_DET = 13;
var COL_VIG_DET = 14;

/* Columna del restaurante en las dos tablas: la usa el segmentador. */
var COL_RESTAURANTE = 3;


/* ---------------------------------------------------------------------------
   Utilidades
   --------------------------------------------------------------------------- */

function responder(objeto) {
  return ContentService.createTextOutput(JSON.stringify(objeto))
      .setMimeType(ContentService.MimeType.JSON);
}

function libro() {
  var id = PropertiesService.getScriptProperties().getProperty(PROP_LIBRO);
  if (!id) throw new Error('Falta correr montarTodo en el editor del script.');
  return SpreadsheetApp.openById(id);
}

function hoja(nombre) {
  var h = libro().getSheetByName(nombre);
  if (!h) throw new Error('No existe la hoja ' + nombre + '. Corre montarTodo otra vez.');
  return h;
}

/* "2026-09-14" -> fecha de verdad, a mediodia para que la zona horaria no la
   corra al dia anterior. */
function comoFecha(texto) {
  var s = String(texto == null ? '' : texto);
  if (s.length >= 10 && s.charAt(4) === '-' && s.charAt(7) === '-') {
    return new Date(Number(s.substring(0, 4)), Number(s.substring(5, 7)) - 1,
                    Number(s.substring(8, 10)), 12, 0, 0);
  }
  return s;
}

function num(v) {
  var n = Number(v);
  return isFinite(n) ? n : 0;
}

function txt(v) {
  return String(v == null ? '' : v);
}

/* Filas de datos que tienen ese id. */
function filasConId(h, colId, id) {
  var ultima = h.getLastRow();
  if (ultima < FILA_DATOS) return [];
  var ids = h.getRange(FILA_DATOS, colId, ultima - FILA_DATOS + 1, 1).getValues();
  var salida = [];
  for (var i = 0; i < ids.length; i++) {
    if (String(ids[i][0]) === String(id)) salida.push(i + FILA_DATOS);
  }
  return salida;
}

/* Primera fila libre despues de los datos. */
function filaLibre(h) {
  return Math.max(h.getLastRow() + 1, FILA_DATOS);
}


/* ---------------------------------------------------------------------------
   Recepcion
   --------------------------------------------------------------------------- */

function doPost(e) {
  var candado = LockService.getScriptLock();
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return responder({ ok: false, error: 'No llego nada' });
    }
    var datos = JSON.parse(e.postData.contents);
    if (datos.clave !== CLAVE) {
      return responder({ ok: false, error: 'Clave incorrecta' });
    }
    /* Dos equipos pueden enviar a la vez: se escribe de a uno para que las
       filas de un analisis no queden intercaladas con las de otro. */
    candado.waitLock(20000);

    if (datos.modo === 'analisis') return guardarAnalisis(datos);
    if (datos.modo === 'anular') return anularAnalisis(datos);
    return responder({ ok: false, error: 'Modo desconocido: ' + datos.modo });
  } catch (err) {
    return responder({ ok: false, error: String(err) });
  } finally {
    try { candado.releaseLock(); } catch (e2) { /* no estaba tomado */ }
  }
}

function guardarAnalisis(datos) {
  var a = datos.analisis || {};
  var id = txt(a.id);
  if (!id) return responder({ ok: false, error: 'El analisis venia sin id' });

  var cons = hoja(HOJA_CONS);
  /* Si ya llego antes (un reintento despues de un corte de internet), no se
     escribe dos veces: se responde bien para que el aplicativo lo de por
     enviado. */
  if (filasConId(cons, COL_ID_CONS, id).length) {
    return responder({ ok: true, id: id, duplicado: true });
  }

  /* Mismo orden que COLS_CONS */
  var fila = [
    comoFecha(a.fecha), "'" + txt(a.consec), txt(a.rest), txt(a.prod), txt(a.prov),
    num(a.precio),
    num(a.gIni), num(a.prodG), num(a.perdida), num(a.rend), num(a.cpg),
    num(a.subtotal), num(a.costoPerd), txt(a.estado),
    "'" + txt(a.fact), num(a.kl), num(a.merma), num(a.desp), num(a.difid),
    num(a.pperd), num(a.valorFac), a.rendMin == null || a.rendMin === '' ? '' : num(a.rendMin),
    txt(a.elab),
    txt(a.hi), txt(a.hf), txt(a.dur), a.ops == null || a.ops === '' ? '' : num(a.ops),
    new Date(), id, 'VIGENTE'
  ];
  cons.getRange(filaLibre(cons), 1, 1, fila.length).setValues([fila]);

  var cortes = datos.cortes || [];
  if (cortes.length) {
    var det = hoja(HOJA_DET);
    var bloque = [];
    for (var i = 0; i < cortes.length; i++) {
      var c = cortes[i];
      bloque.push([
        comoFecha(a.fecha), "'" + txt(a.consec), txt(a.rest), txt(a.prod),
        txt(c.nombre), txt(c.tipo), num(c.peso), num(c.cant), num(c.gramos),
        num(c.cu), num(c.ct), num(c.part), id, 'VIGENTE'
      ]);
    }
    det.getRange(filaLibre(det), 1, bloque.length, bloque[0].length).setValues(bloque);
  }
  return responder({ ok: true, id: id, cortes: cortes.length });
}

/* Un analisis borrado en el aplicativo NO se borra aqui: se marca ANULADO.
   Asi queda la huella para control, y el Panel lo deja por fuera. */
function anularAnalisis(datos) {
  var id = txt(datos.id);
  var total = 0;
  var pares = [[HOJA_CONS, COL_ID_CONS, COL_VIG_CONS], [HOJA_DET, COL_ID_DET, COL_VIG_DET]];
  for (var p = 0; p < pares.length; p++) {
    var h = hoja(pares[p][0]);
    var filas = filasConId(h, pares[p][1], id);
    for (var i = 0; i < filas.length; i++) {
      h.getRange(filas[i], pares[p][2]).setValue('ANULADO');
      total++;
    }
  }
  return responder({ ok: true, id: id, anuladas: total });
}

/* Abrir la direccion en el navegador dice si quedo bien desplegado. */
function doGet() {
  try {
    var l = libro();
    return responder({
      ok: true,
      mensaje: 'Respaldo de porcionamiento funcionando.',
      cuenta: Session.getEffectiveUser().getEmail(),
      libro: l.getName(),
      analisis: Math.max(0, l.getSheetByName(HOJA_CONS).getLastRow() - FILA_ENC)
    });
  } catch (err) {
    return responder({ ok: false, error: String(err) });
  }
}


/* ---------------------------------------------------------------------------
   Montaje
   --------------------------------------------------------------------------- */

function carpetaDelGrupo() {
  var props = PropertiesService.getScriptProperties();
  if (CARPETA_ID) {
    var fija = DriveApp.getFolderById(CARPETA_ID);
    props.setProperty(PROP_CARPETA, fija.getId());
    return fija;
  }
  var id = props.getProperty(PROP_CARPETA);
  if (id) {
    try { return DriveApp.getFolderById(id); } catch (err) { /* se busca abajo */ }
  }
  var halladas = DriveApp.getFoldersByName(NOMBRE_CARPETA);
  var carpeta = halladas.hasNext() ? halladas.next() : DriveApp.createFolder(NOMBRE_CARPETA);
  props.setProperty(PROP_CARPETA, carpeta.getId());
  return carpeta;
}

function libroDelGrupo(carpeta) {
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty(PROP_LIBRO);
  if (id) {
    try { return { libro: SpreadsheetApp.openById(id), nuevo: false }; } catch (err) { /* abajo */ }
  }
  var halladas = carpeta.getFilesByName(NOMBRE_LIBRO);
  while (halladas.hasNext()) {
    var f = halladas.next();
    if (f.getMimeType() === MimeType.GOOGLE_SHEETS) {
      props.setProperty(PROP_LIBRO, f.getId());
      return { libro: SpreadsheetApp.openById(f.getId()), nuevo: false };
    }
  }
  var l = SpreadsheetApp.create(NOMBRE_LIBRO);
  DriveApp.getFileById(l.getId()).moveTo(carpeta);
  props.setProperty(PROP_LIBRO, l.getId());
  return { libro: l, nuevo: true };
}

function hojaNueva(l, nombre, posicion) {
  return l.getSheetByName(nombre) || l.insertSheet(nombre, posicion);
}

/* Segmentador por restaurante, arriba de la tabla. Se quita y se vuelve a
   poner para que correr montarTodo dos veces no deje dos. */
function segmentador(h, n) {
  var viejos = h.getSlicers();
  for (var i = 0; i < viejos.length; i++) viejos[i].remove();
  var rango = h.getRange(FILA_ENC, 1, h.getMaxRows() - FILA_ENC + 1, n);
  var s = h.insertSlicer(rango, 1, 4, 0, 2);
  try {
    s.setColumnFilterCriteria(COL_RESTAURANTE, null);
  } catch (err) {
    s.setColumnFilterCriteria(COL_RESTAURANTE,
        SpreadsheetApp.newFilterCriteria().setHiddenValues([]).build());
  }
  s.setTitle('Restaurante');
  // Solo estetica: si Google cambia algo aqui, el segmentador igual queda.
  try {
    s.setTitleTextStyle(SpreadsheetApp.newTextStyle()
        .setForegroundColor(ROJO).setBold(true).build());
  } catch (err) { /* sigue sin color */ }
  try { s.setBackgroundColor('#FFFFFF'); } catch (err) { /* opcional */ }
  try { s.setApplyToPivotTables(false); } catch (err) { /* opcional */ }
}

/* Tabla de datos: titulo, segmentador, encabezado rojo, filas fijas, bandas,
   formatos y anchos. Solo toca la presentacion; nunca los datos. */
function armarTabla(h, titulo, columnas, formatos, anchos) {
  var n = columnas.length;
  if (h.getMaxColumns() < n) h.insertColumnsAfter(h.getMaxColumns(), n - h.getMaxColumns());
  if (h.getMaxColumns() > n) h.deleteColumns(n + 1, h.getMaxColumns() - n);
  if (h.getMaxRows() < 1000) h.insertRowsAfter(h.getMaxRows(), 1000 - h.getMaxRows());
  if (h.getFilter()) h.getFilter().remove();

  h.getRange(1, 1, h.getMaxRows(), n).setFontFamily('Calibri').setFontSize(10);

  /* Titulo en las filas 1 y 2 */
  var sup = h.getRange(1, 1, 2, n);
  sup.breakApart();
  sup.setBackground('#FFFFFF');
  h.getRange(1, 1, 1, 3).merge().setValue(titulo)
      .setFontSize(15).setFontWeight('bold').setFontColor(ROJO).setVerticalAlignment('bottom');
  h.getRange(2, 1, 1, 3).merge()
      .setValue('Grupo La Independiente \u00b7 filtra con el segmentador de restaurante')
      .setFontSize(9).setFontColor(GRIS).setVerticalAlignment('top');
  h.setRowHeight(1, 34);
  h.setRowHeight(2, 40);
  h.getRange(2, 1, 1, n)
      .setBorder(null, null, true, null, null, null, ROJO, SpreadsheetApp.BorderStyle.SOLID_MEDIUM);

  /* Encabezado */
  h.getRange(FILA_ENC, 1, 1, n).setValues([columnas])
      .setBackground(ROJO).setFontColor('#FFFFFF').setFontWeight('bold')
      .setVerticalAlignment('middle').setHorizontalAlignment('center').setWrap(true);
  h.setRowHeight(FILA_ENC, 38);
  h.setFrozenRows(FILA_ENC);

  var filasDatos = h.getMaxRows() - FILA_DATOS + 1;
  for (var i = 0; i < n; i++) {
    h.getRange(FILA_DATOS, i + 1, filasDatos, 1).setNumberFormat(formatos[i]);
    h.setColumnWidth(i + 1, anchos[i]);
  }

  var bandas = h.getBandings();
  for (var b = 0; b < bandas.length; b++) bandas[b].remove();
  h.getRange(FILA_ENC, 1, h.getMaxRows() - FILA_ENC + 1, n)
      .applyRowBanding(SpreadsheetApp.BandingTheme.LIGHT_GREY, true, false)
      .setHeaderRowColor(ROJO).setFirstRowColor('#FFFFFF').setSecondRowColor(ROSADO);

  segmentador(h, n);
  h.setTabColor(ROJO_OSCURO);
}

/* Estado vs. estandar y vigencia con color, igual que en el aplicativo. */
function coloresConsolidado(h) {
  var filas = h.getMaxRows() - FILA_DATOS + 1;
  var estado = h.getRange(FILA_DATOS, COL_ESTADO_CONS, filas, 1);
  var vigencia = h.getRange(FILA_DATOS, COL_VIG_CONS, filas, 1);
  h.setConditionalFormatRules([
    SpreadsheetApp.newConditionalFormatRule().whenTextStartsWith('OK')
      .setBackground('#E2EFDA').setFontColor('#1E6B3A').setRanges([estado]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenTextStartsWith('L\u00edmite')
      .setBackground('#FFF3CD').setFontColor('#8A6100').setRanges([estado]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenTextStartsWith('Bajo')
      .setBackground('#F8D7DA').setFontColor('#A61B1B').setRanges([estado]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo('ANULADO')
      .setBackground('#EDEDED').setFontColor(GRIS).setRanges([vigencia]).build()
  ]);
}

function montarTodo() {
  var carpeta = carpetaDelGrupo();
  var r = libroDelGrupo(carpeta);
  var l = r.libro;
  /* Las formulas se escriben con comas: con el libro en es_CO (punto y coma)
     Google no las entiende y salen #ERROR!. Se arma en en_US y al final se
     pasa a es_CO; las formulas ya guardadas se ven con punto y coma solas. */
  l.setSpreadsheetLocale('en_US');
  SpreadsheetApp.flush();
  l.setSpreadsheetTimeZone(ZONA);

  var panel = hojaNueva(l, HOJA_PANEL, 0);
  var cons = hojaNueva(l, HOJA_CONS, 1);
  var det = hojaNueva(l, HOJA_DET, 2);
  var listas = hojaNueva(l, HOJA_LISTAS, 3);

  /* La hoja que trae un libro nuevo sobra */
  var nombres = ['Hoja 1', 'Hoja1', 'Sheet1'];
  for (var k = 0; k < nombres.length; k++) {
    var sobrante = l.getSheetByName(nombres[k]);
    if (sobrante && l.getSheets().length > 1) l.deleteSheet(sobrante);
  }

  armarTabla(cons, 'Consolidado de porcionamiento', COLS_CONS, FMT_CONS, ANCHO_CONS);
  coloresConsolidado(cons);
  armarTabla(det, 'Detalle de cortes porcionados', COLS_DET, FMT_DET, ANCHO_DET);

  listas.clear();
  listas.getRange('A1').setValue('Todos');
  listas.getRange('A2').setFormula('=IFERROR(SORT(UNIQUE(FILTER(' + HOJA_CONS + '!C' +
      FILA_DATOS + ':C,' + HOJA_CONS + '!C' + FILA_DATOS + ':C<>""))),"")');
  listas.hideSheet();

  armarPanel(panel);
  SpreadsheetApp.flush();
  l.setSpreadsheetLocale('es_CO');
  l.setActiveSheet(panel);

  var informe = [];
  informe.push('Cuenta duena: ' + Session.getEffectiveUser().getEmail());
  informe.push((r.nuevo ? 'CREADO ' : 'ya estaba ') + l.getName() + '  ' + l.getUrl());
  for (var i = 0; i < COMPARTIR_CON.length; i++) {
    try {
      carpeta.addEditor(COMPARTIR_CON[i]);
      informe.push('Carpeta compartida con ' + COMPARTIR_CON[i] + ' como editor');
    } catch (err) {
      informe.push('NO SE PUDO compartir con ' + COMPARTIR_CON[i] + ': ' + String(err));
    }
  }
  informe.push('Carpeta: ' + carpeta.getUrl());
  Logger.log(informe.join('\n'));
  return informe;
}


/* ---------------------------------------------------------------------------
   Panel
   ---------------------------------------------------------------------------
   Todo son formulas: se actualiza solo con cada analisis que llega. Los
   filtros de C6, E6 y G6 los cambia quien lo consulta.
   Se puede volver a armar con repararPanel sin tocar los datos.

   Columnas del Consolidado que usa:
     A fecha  C restaurante  D producto  G inicial  H final  I perdida
     J % rendimiento  L subtotal  M valor perdida  N estado  U valor factura
     V rendimiento minimo  W elaborado por  AB registrado  AD vigencia */

function repararPanel() {
  var l = libro();
  l.setSpreadsheetLocale('en_US');   /* ver montarTodo */
  SpreadsheetApp.flush();
  armarPanel(hoja(HOJA_PANEL));
  SpreadsheetApp.flush();
  l.setSpreadsheetLocale('es_CO');
}

/* Los analisis vigentes dentro del periodo y el restaurante elegidos. */
function datosFiltrados() {
  var C = HOJA_CONS + '!';
  var f = FILA_DATOS;
  return 'FILTER(' + C + 'A' + f + ':AD,' +
    C + 'AD' + f + ':AD="VIGENTE",' +
    C + 'A' + f + ':A>=$C$6,' +
    C + 'A' + f + ':A<=$E$6,' +
    '(($G$6="Todos")+(' + C + 'C' + f + ':C=$G$6))>0)';
}

/* Criterios para SUMIFS y COUNTIFS con el mismo filtro. */
function criterios() {
  var C = HOJA_CONS + '!';
  return C + 'AD:AD,"VIGENTE",' +
    C + 'A:A,">="&$C$6,' +
    C + 'A:A,"<="&$E$6,' +
    C + 'C:C,IF($G$6="Todos","*",$G$6)';
}

function tarjeta(h, fila, col, titulo, formula, formato) {
  h.getRange(fila, col, 1, 2).merge().setValue(titulo)
      .setFontSize(9).setFontColor(GRIS).setFontWeight('bold')
      .setBackground('#FFFFFF').setHorizontalAlignment('left').setVerticalAlignment('bottom');
  h.getRange(fila + 1, col, 1, 2).merge().setFormula(formula).setNumberFormat(formato)
      .setFontSize(20).setFontWeight('bold').setFontColor(TEXTO).setBackground('#FFFFFF')
      .setHorizontalAlignment('left').setVerticalAlignment('top');
  h.getRange(fila, col, 2, 2)
      .setBorder(true, true, true, true, false, false, LINEA, SpreadsheetApp.BorderStyle.SOLID);
  h.getRange(fila, col, 2, 1)
      .setBorder(null, true, null, null, null, null, ROJO, SpreadsheetApp.BorderStyle.SOLID_THICK);
}

function titulo(h, fila, texto) {
  h.getRange(fila, 2, 1, 8).merge().setValue(texto)
      .setFontSize(12).setFontWeight('bold').setFontColor(ROJO)
      .setBorder(null, null, true, null, null, null, ROJO, SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
  h.setRowHeight(fila, 30);
}

/* Encabezado rojo y formatos de una tabla que llena QUERY. */
function tablaQuery(h, fila, filas, formatos) {
  h.getRange(fila, 2, 1, formatos.length)
      .setBackground(ROJO).setFontColor('#FFFFFF').setFontWeight('bold').setFontSize(10);
  for (var i = 0; i < formatos.length; i++) {
    h.getRange(fila + 1, 2 + i, filas, 1).setNumberFormat(formatos[i]);
  }
  h.getRange(fila, 2, filas + 1, formatos.length).setBackground('#FFFFFF')
      .setBorder(true, true, true, true, false, true, LINEA, SpreadsheetApp.BorderStyle.SOLID);
  h.getRange(fila, 2, 1, formatos.length).setBackground(ROJO);
}

function filtroCaja(h, a1) {
  h.getRange(a1).setBackground('#FFFFFF')
      .setBorder(true, true, true, true, null, null, LINEA, SpreadsheetApp.BorderStyle.SOLID);
}

function armarPanel(h) {
  h.clear();
  h.clearConditionalFormatRules();
  var unidas = h.getRange(1, 1, h.getMaxRows(), h.getMaxColumns()).getMergedRanges();
  for (var m = 0; m < unidas.length; m++) unidas[m].breakApart();
  if (h.getMaxColumns() > 10) h.deleteColumns(11, h.getMaxColumns() - 10);
  if (h.getMaxColumns() < 10) h.insertColumnsAfter(h.getMaxColumns(), 10 - h.getMaxColumns());
  if (h.getMaxRows() < 80) h.insertRowsAfter(h.getMaxRows(), 80 - h.getMaxRows());

  h.setHiddenGridlines(true);
  h.getRange(1, 1, h.getMaxRows(), 10).setFontFamily('Calibri').setFontSize(10)
      .setFontColor(TEXTO).setBackground('#FAF8F8');
  h.setColumnWidth(1, 24);
  for (var c = 2; c <= 9; c++) h.setColumnWidth(c, 128);
  h.setColumnWidth(10, 24);
  h.setTabColor(ROJO);

  /* Encabezado institucional */
  h.getRange('B2:I2').merge().setValue('GRUPO LA INDEPENDIENTE')
      .setBackground(ROJO).setFontColor('#FFFFFF').setFontSize(18).setFontWeight('bold')
      .setHorizontalAlignment('center').setVerticalAlignment('middle');
  h.setRowHeight(2, 44);
  h.getRange('B3:I3').merge()
      .setValue('Panel de porcionamiento de prote\u00ednas')
      .setBackground(ROJO_OSCURO).setFontColor('#FFFFFF').setFontSize(11)
      .setHorizontalAlignment('center').setVerticalAlignment('middle');
  h.setRowHeight(3, 26);

  /* Filtros */
  h.getRange('B6').setValue('Desde').setFontWeight('bold').setHorizontalAlignment('right');
  h.getRange('C6').setFormula('=EOMONTH(TODAY(),-1)+1').setNumberFormat('dd/mm/yyyy');
  h.getRange('D6').setValue('Hasta').setFontWeight('bold').setHorizontalAlignment('right');
  h.getRange('E6').setFormula('=TODAY()').setNumberFormat('dd/mm/yyyy');
  h.getRange('F6').setValue('Restaurante').setFontWeight('bold').setHorizontalAlignment('right');
  h.getRange('G6:H6').merge().setValue('Todos');
  h.getRange('G6').setDataValidation(SpreadsheetApp.newDataValidation()
      .requireValueInRange(libro().getSheetByName(HOJA_LISTAS).getRange('A1:A40'), true)
      .setAllowInvalid(false).build());
  h.getRange('C6').setDataValidation(SpreadsheetApp.newDataValidation().requireDate().build());
  h.getRange('E6').setDataValidation(SpreadsheetApp.newDataValidation().requireDate().build());
  filtroCaja(h, 'C6'); filtroCaja(h, 'E6'); filtroCaja(h, 'G6:H6');

  /* Indicadores */
  var K = criterios();
  var S = function (col) { return 'SUMIFS(' + HOJA_CONS + '!' + col + ':' + col + ',' + K + ')'; };
  tarjeta(h, 9, 2, 'AN\u00c1LISIS', '=COUNTIFS(' + K + ')', '#,##0');
  tarjeta(h, 9, 4, 'KILOS RECIBIDOS', '=' + S('G') + '/1000', '#,##0.0');
  tarjeta(h, 9, 6, 'RENDIMIENTO', '=IFERROR(' + S('H') + '/' + S('G') + ',0)', '0.00%');
  tarjeta(h, 9, 8, 'P\u00c9RDIDA', '=IFERROR(' + S('I') + '/' + S('G') + ',0)', '0.00%');
  tarjeta(h, 12, 2, 'VALOR FACTURAS', '=' + S('U'), '$#,##0');
  tarjeta(h, 12, 4, 'SUBTOTAL PRODUCTIVO', '=' + S('L'), '$#,##0');
  tarjeta(h, 12, 6, 'VALOR P\u00c9RDIDA', '=' + S('M'), '$#,##0');
  tarjeta(h, 12, 8, 'BAJO EST\u00c1NDAR', '=COUNTIFS(' + K + ',' + HOJA_CONS + '!N:N,"Bajo*")', '#,##0');
  h.getRange('F13:I13').setFontColor(ROJO);
  h.setRowHeight(9, 22); h.setRowHeight(10, 36);
  h.setRowHeight(12, 22); h.setRowHeight(13, 36);

  var D = datosFiltrados();
  var SIN = '"Sin an\u00e1lisis en el periodo elegido"';

  /* Por restaurante:  Col3 rest, Col7 inicial, Col8 final, Col9 perdida, Col13 valor perdida */
  titulo(h, 16, 'Resultado por restaurante');
  h.getRange('B17').setFormula('=IFERROR(QUERY(' + D + ',' +
    '"select Col3, count(Col1), sum(Col7)/1000, sum(Col8)/sum(Col7), sum(Col9)/sum(Col7), sum(Col13) ' +
    'group by Col3 order by sum(Col13) desc ' +
    'label Col3 \'Restaurante\', count(Col1) \'An\u00e1lisis\', sum(Col7)/1000 \'Kilos\', ' +
    'sum(Col8)/sum(Col7) \'Rendimiento\', sum(Col9)/sum(Col7) \'P\u00e9rdida\', ' +
    'sum(Col13) \'Valor p\u00e9rdida\'",0),' + SIN + ')');
  tablaQuery(h, 17, 9, ['@', '#,##0', '#,##0.0', '0.00%', '0.00%', '$#,##0']);

  /* Productos con menor rendimiento:  Col4 producto, Col22 rendimiento minimo */
  titulo(h, 29, 'Productos con menor rendimiento');
  h.getRange('B30').setFormula('=IFERROR(QUERY(' + D + ',' +
    '"select Col4, count(Col1), sum(Col7)/1000, sum(Col8)/sum(Col7), avg(Col22), sum(Col13) ' +
    'group by Col4 order by sum(Col8)/sum(Col7) asc limit 15 ' +
    'label Col4 \'Producto\', count(Col1) \'An\u00e1lisis\', sum(Col7)/1000 \'Kilos\', ' +
    'sum(Col8)/sum(Col7) \'Rendimiento\', avg(Col22) \'Rend. m\u00ednimo\', ' +
    'sum(Col13) \'Valor p\u00e9rdida\'",0),' + SIN + ')');
  tablaQuery(h, 30, 15, ['@', '#,##0', '#,##0.0', '0.00%', '0.00%', '$#,##0']);

  /* Ultimos recibidos:  Col10 % rendimiento, Col14 estado, Col23 elaboro, Col28 registrado */
  titulo(h, 48, '\u00daltimos an\u00e1lisis recibidos');
  h.getRange('B49').setFormula('=IFERROR(QUERY(' + D + ',' +
    '"select Col1, Col3, Col4, Col10, Col14, Col13, Col23 order by Col28 desc limit 15 ' +
    'label Col1 \'Fecha\', Col3 \'Restaurante\', Col4 \'Producto\', Col10 \'Rendimiento\', ' +
    'Col14 \'Estado\', Col13 \'Valor p\u00e9rdida\', Col23 \'Elabor\u00f3\'",0),' + SIN + ')');
  tablaQuery(h, 49, 15, ['dd/mm/yyyy', '@', '@', '0.0%', '@', '$#,##0', '@']);

  var est = h.getRange('F50:F64');
  h.setConditionalFormatRules([
    /* rinde por debajo del minimo del estandar */
    SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied('=AND(ISNUMBER($E31),ISNUMBER($F31),$E31<$F31)')
      .setFontColor('#A61B1B').setBold(true).setRanges([h.getRange('E31:E45')]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenTextStartsWith('Bajo')
      .setBackground('#F8D7DA').setFontColor('#A61B1B').setRanges([est]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenTextStartsWith('L\u00edmite')
      .setBackground('#FFF3CD').setFontColor('#8A6100').setRanges([est]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenTextStartsWith('OK')
      .setBackground('#E2EFDA').setFontColor('#1E6B3A').setRanges([est]).build()
  ]);

  h.setFrozenRows(7);
}
