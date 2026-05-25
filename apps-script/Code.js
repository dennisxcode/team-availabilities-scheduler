const SS_ID = '1ZMjDN-vsFDabM4MzVnz-VzvpG9wKLxICaC8nkqNMQS4';
const SHEET_NAME = 'Sheet1';

function getSheet_() {
  return SpreadsheetApp.openById(SS_ID).getSheetByName(SHEET_NAME);
}

// Normalize a week value (string or Date cell) → "YYYY-MM-DD"
function normWeek_(v) {
  if (v == null || v === '') return '';
  if (Object.prototype.toString.call(v) === '[object Date]') {
    const y = v.getFullYear();
    const m = String(v.getMonth() + 1).padStart(2, '0');
    const d = String(v.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + d;
  }
  const s = String(v).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const d = new Date(s);
  if (!isNaN(d.getTime())) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + dd;
  }
  return s;
}

function jsonOut_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// GET → return all rows; week column normalized to YYYY-MM-DD strings
function doGet(e) {
  const sheet = getSheet_();
  const data = sheet.getDataRange().getValues();
  const out = data.map(function (r) {
    const copy = r.slice();
    if (copy[1]) copy[1] = normWeek_(copy[1]);
    return copy;
  });
  return jsonOut_(out);
}

// POST handler — two payload shapes:
//   { name, row }                → upsert row matching (name, row[1])
//   { rows: [...], weekKey }     → bulk reset: delete rows for weekKey, append new ones
function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    const sheet = getSheet_();

    // One-off cleanup: walk top-down, keep the LAST occurrence of each (name, week),
    // delete earlier duplicates. Idempotent.
    if (payload.action === 'dedupe') {
      const data = sheet.getDataRange().getValues();
      const lastIdx = {};
      for (let i = 0; i < data.length; i++) {
        const k = String(data[i][0]).trim() + '|' + normWeek_(data[i][1]);
        lastIdx[k] = i;
      }
      let removed = 0;
      for (let i = data.length - 1; i >= 0; i--) {
        const k = String(data[i][0]).trim() + '|' + normWeek_(data[i][1]);
        if (lastIdx[k] !== i) {
          sheet.deleteRow(i + 1);
          removed++;
        }
      }
      return jsonOut_({ ok: true, mode: 'dedupe', removed: removed });
    }

    // Bulk reset for one week (NOT the whole sheet)
    if (Array.isArray(payload.rows) && payload.weekKey) {
      const targetWeek = normWeek_(payload.weekKey);
      const data = sheet.getDataRange().getValues();
      for (let i = data.length - 1; i >= 0; i--) {
        if (normWeek_(data[i][1]) === targetWeek) {
          sheet.deleteRow(i + 1);
        }
      }
      payload.rows.forEach(function (r) {
        const copy = r.slice();
        copy[1] = targetWeek;
        sheet.appendRow(copy);
      });
      return jsonOut_({ ok: true, mode: 'bulk', week: targetWeek });
    }

    // Single upsert — delete any existing (name, week) rows then append.
    // Self-healing: duplicates never accumulate.
    const name = String(payload.name).trim();
    const row = payload.row.slice();
    const week = normWeek_(row[1]);
    row[1] = week;

    const data = sheet.getDataRange().getValues();
    let removedDup = 0;
    for (let i = data.length - 1; i >= 0; i--) {
      if (String(data[i][0]).trim() === name && normWeek_(data[i][1]) === week) {
        sheet.deleteRow(i + 1);
        removedDup++;
      }
    }
    sheet.appendRow(row);

    return jsonOut_({ ok: true, mode: 'upsert', name: name, week: week, replaced: removedDup });
  } catch (err) {
    return jsonOut_({ ok: false, error: err.toString() });
  }
}
