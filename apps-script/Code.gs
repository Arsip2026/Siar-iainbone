/**
 * SIAR: menerima data arsip dari aplikasi dan menuliskannya ke sheet "Arsip".
 * Dipasang di spreadsheet DATA HOSTING RECORD ARSIP (Extensions > Apps Script).
 * TOKEN harus sama dengan SHEET_TOKEN di index.html.
 */
var TOKEN = 'eqAArJWTDo57KOczn01vdjR-3JWJ16W_';
var NAMA_SHEET = 'Arsip';
var ID_SPREADSHEET = '1nyQtnwcBo-MH1u-20wg6e7hTOSR0WpZEF9KQ4SLnkj4';
var BACKUP_MAKS = 10; // jumlah sheet cadangan yang disimpan

function out_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function safe_(v) {
  // Cegah teks yang diawali = + - @ dibaca sebagai rumus.
  if (typeof v === 'string' && /^[=+\-@]/.test(v)) return "'" + v;
  return v;
}

// Salin sheet Arsip ke sheet "Cadangan <tanggal jam>" sebelum ditimpa, lalu hapus cadangan yang terlalu lama.
function cadangkan_(ss, sh) {
  var nama = 'Cadangan ' + Utilities.formatDate(new Date(), ss.getSpreadsheetTimeZone(), 'yyyy-MM-dd HH.mm.ss');
  var c = sh.copyTo(ss);
  c.setName(nama);
  c.setTabColor('#999999');
  var semua = ss.getSheets().map(function (x) { return x.getName(); })
    .filter(function (n) { return n.indexOf('Cadangan ') === 0; }).sort();
  while (semua.length > BACKUP_MAKS) {
    ss.deleteSheet(ss.getSheetByName(semua.shift()));
  }
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
    var ss = SpreadsheetApp.openById(ID_SPREADSHEET);
    var sh = ss.getSheetByName(NAMA_SHEET) || ss.insertSheet(NAMA_SHEET);
    // Cadangkan bila data berkurang drastis (reset atau hapus massal).
    var ada = Math.max(0, sh.getLastRow() - 1);
    if (ada > 0 && (rows.length === 0 || rows.length < ada * 0.5)) cadangkan_(ss, sh);
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
