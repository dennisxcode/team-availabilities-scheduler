// ── Robotics Squad Scheduler — Apps Script backend ──
// Paste this into your existing Apps Script project (script.google.com),
// replacing the current code, then click Deploy → Manage deployments → edit
// the active deployment → New version → Deploy. The script URL stays the same.

const SHEET_ID = '1ZMjDN-vsFDabM4MzVnz-VzvpG9wKLxICaC8nkqNMQS4';

function getSheet_() {
  return SpreadsheetApp.openById(SHEET_ID).getSheets()[0];
}

// Normalize a week value (string or Date) → "YYYY-MM-DD"
function normWeek_(v) {
  if (v == null || v === '') return '';
  if (v instanceof Date) {
    const y = v.getFullYear();
    const m = String(v.getMonth() + 1).padStart(2, '0');
    const d = String(v.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  const s = String(v).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const d = new Date(s);
  if (!isNaN(d.getTime())) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${dd}`;
  }
  return s;
}

function jsonOut_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// GET → return all rows as JSON (skips header row)
function doGet(e) {
  const sheet = getSheet_();
  const data = sheet.getDataRange().getValues();
  // Force the week column (col B / index 1) to a normalized YYYY-MM-DD string
  const out = data.map(r => {
    const copy = r.slice();
    if (copy[1]) copy[1] = normWeek_(copy[1]);
    return copy;
  });
  return jsonOut_(out);
}

// POST handler — two shapes:
//   { name, row }                  → upsert single row matching (name, row[1])
//   { rows: [...], weekKey }       → bulk reset: delete rows for weekKey, append fresh ones
function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const sheet = getSheet_();

    // Bulk reset
    if (Array.isArray(body.rows) && body.weekKey) {
      const targetWeek = normWeek_(body.weekKey);
      const data = sheet.getDataRange().getValues();
      // Walk bottom-up so deleting rows doesn't shift indexes we still need
      for (let i = data.length - 1; i >= 1; i--) {
        if (normWeek_(data[i][1]) === targetWeek) {
          sheet.deleteRow(i + 1);
        }
      }
      body.rows.forEach(r => {
        const copy = r.slice();
        copy[1] = targetWeek;
        sheet.appendRow(copy);
      });
      return jsonOut_({ ok: true, mode: 'bulk', week: targetWeek });
    }

    // Single upsert — match by NAME + WEEK
    const name = String(body.name).trim();
    const row = body.row.slice();
    const week = normWeek_(row[1]);
    row[1] = week;

    const data = sheet.getDataRange().getValues();
    let foundRow = -1;
    for (let i = 1; i < data.length; i++) {
      if (String(data[i][0]).trim() === name && normWeek_(data[i][1]) === week) {
        foundRow = i + 1; // 1-indexed
        break;
      }
    }

    if (foundRow > 0) {
      sheet.getRange(foundRow, 1, 1, row.length).setValues([row]);
    } else {
      sheet.appendRow(row);
    }

    return jsonOut_({ ok: true, mode: foundRow > 0 ? 'update' : 'insert', name, week });
  } catch (err) {
    return jsonOut_({ ok: false, error: err.toString() });
  }
}
