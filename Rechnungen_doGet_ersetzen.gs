// T.S. SERVICELEISTUNGEN – ERWEITERTE RECHNUNGS-API
// Diesen Block als doGet(e) in dein bestehendes Rechnungs-Google-Apps-Script einsetzen.
// Die vorhandenen Import-Funktionen müssen NICHT ersetzt werden.

function doGet(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('Rechnungen');
    if (!sheet) throw new Error('Das Tabellenblatt "Rechnungen" wurde nicht gefunden.');

    const last = sheet.getLastRow();
    const rows = [];
    const monthly = Array.from({length: 12}, () => 0);
    const year = Number((e && e.parameter && e.parameter.year) || new Date().getFullYear());
    const month = new Date().getMonth() + 1;

    if (last >= 2) {
      const values = sheet.getRange(2, 1, last - 1, Math.max(6, sheet.getLastColumn())).getValues();
      values.forEach(r => {
        const dateValue = r[0];
        const date = dateValue instanceof Date
          ? Utilities.formatDate(dateValue, Session.getScriptTimeZone(), 'dd.MM.yyyy')
          : String(dateValue || '');
        const invoiceNumber = String(r[1] || '').trim();
        const customer = String(r[2] || '').trim();
        const description = String(r[3] || '').trim();
        const gross = parseMoney(r[4]);
        const source = String(r[5] || '').trim();
        const status = String(r[6] || '').trim();

        if (!invoiceNumber && !customer && !description && !gross) return;

        let y = null, m = null;
        if (dateValue instanceof Date) {
          y = dateValue.getFullYear();
          m = dateValue.getMonth() + 1;
        }

        if (y === year) {
          monthly[m - 1] += gross;
        }

        rows.push({
          rechnungsdatum: date,
          rechnungsnummer: invoiceNumber,
          kunde: customer,
          beschreibung: description,
          bruttobetrag: gross,
          quelldatei: source,
          status: status
        });
      });
    }

    const yearRows = rows.filter(r => {
      const parts = String(r.rechnungsdatum || '').split('.');
      return parts.length === 3 && Number(parts[2]) === year;
    });

    // Wenn das Datum im Sheet als Text gespeichert wurde, bleibt die Jahres-/Monatssumme
    // zusätzlich robust über die vorhandenen Date-Werte berechenbar.
    let yearGross = 0;
    let monthGross = 0;
    if (last >= 2) {
      const raw = sheet.getRange(2, 1, last - 1, 5).getValues();
      raw.forEach(r => {
        const d = r[0];
        const gross = parseMoney(r[4]);
        if (d instanceof Date && d.getFullYear() === year) {
          yearGross += gross;
          if (d.getMonth() + 1 === month) monthGross += gross;
        }
      });
    }

    // Fallback für den Fall, dass die Datumswerte als Text im Format TT.MM.JJJJ stehen.
    if (!yearGross && yearRows.length) {
      yearGross = yearRows.reduce((s, r) => s + Number(r.bruttobetrag || 0), 0);
      monthGross = yearRows.filter(r => String(r.rechnungsdatum).slice(3, 5) === String(month).padStart(2, '0'))
        .reduce((s, r) => s + Number(r.bruttobetrag || 0), 0);
    }

    return ContentService.createTextOutput(JSON.stringify({
      ok: true,
      bruttoGesamt: round2(yearGross),
      bruttoGesamtJahr: round2(yearGross),
      bruttoGesamtMonat: round2(monthGross),
      monatlich: monthly.map(round2),
      rechnungen: rows.reverse(),
      aktualisiert: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      ok: false,
      error: err.message
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function parseMoney(value) {
  if (typeof value === 'number') return isFinite(value) ? value : 0;
  let s = String(value || '').trim();
  if (!s) return 0;
  s = s.replace(/€/g, '').replace(/\s/g, '');
  if (s.includes(',') && s.includes('.')) s = s.replace(/\./g, '').replace(',', '.');
  else if (s.includes(',')) s = s.replace(',', '.');
  const n = Number(s);
  return isFinite(n) ? n : 0;
}

function round2(n) {
  return Math.round(Number(n || 0) * 100) / 100;
}
