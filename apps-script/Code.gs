/**
 * SIAR: menerima data arsip dari aplikasi dan menuliskannya ke sheet "Arsip".
 * Dipasang di spreadsheet DATA HOSTING RECORD ARSIP (Extensions > Apps Script).
 * TOKEN harus sama dengan SHEET_TOKEN di index.html.
 */
var TOKEN = 'eqAArJWTDo57KOczn01vdjR-3JWJ16W_';
var NAMA_SHEET = 'Arsip';

function out_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function safe_(v) {
  // Cegah teks yang diawali = + - @ dibaca sebagai rumus.
  if (typeof v === 'string' && /^[=+\-@]/.test(v)) return "'" + v;
  return v;
}

function doGet() {
  return out_({ ok: true, info: 'SIAR sinkron aktif' });
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(25000);
  try {
    var d = JSON.parse(e.postData.contents);
    if (d.token !== TOKEN) return out_({ ok: false, error: 'token' });
    var head = d.header, rows = d.rows || [];
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sh = ss.getSheetByName(NAMA_SHEET) || ss.insertSheet(NAMA_SHEET);
    sh.clearContents();
    var all = [head].concat(rows.map(function (r) { return r.map(safe_); }));
    sh.getRange(1, 1, all.length, head.length).setValues(all);
    sh.getRange(1, 1, 1, head.length).setFontWeight('bold').setBackground('#1F4E5F').setFontColor('#FFFFFF');
    sh.setFrozenRows(1);
    (d.dateCols || []).forEach(function (c) {
      if (rows.length) sh.getRange(2, c, rows.length, 1).setNumberFormat('dd/mm/yyyy');
    });
    sh.setColumnWidth(2, 380);
    return out_({ ok: true, rows: rows.length });
  } catch (err) {
    return out_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}
