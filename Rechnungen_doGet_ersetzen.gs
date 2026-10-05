// T.S. SERVICELEISTUNGEN – ROBUSTE RECHNUNGS-API
// Diese doGet()-Version erkennt die Spalten über die Überschriften und fällt
// bei unbekannten Tabellenstrukturen auf die bisherigen Spalten A:G zurück.
function doGet(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('Rechnungen');
    if (!sheet) throw new Error('Das Tabellenblatt "Rechnungen" wurde nicht gefunden.');

    const lastRow = sheet.getLastRow();
    const lastCol = Math.max(sheet.getLastColumn(), 7);
    const year = Number((e && e.parameter && e.parameter.year) || new Date().getFullYear());
    const currentMonth = new Date().getMonth() + 1;
    const monthly = Array.from({length: 12}, () => 0);
    const rows = [];

    if (lastRow >= 2) {
      const raw = sheet.getRange(1, 1, lastRow, lastCol).getValues();
      const headers = raw[0].map(v => normalizeHeader(v));
      const findCol = aliases => {
        for (const alias of aliases) {
          const i = headers.indexOf(normalizeHeader(alias));
          if (i >= 0) return i;
        }
        for (let i = 0; i < headers.length; i++) {
          if (aliases.some(a => headers[i].includes(normalizeHeader(a)))) return i;
        }
        return -1;
      };

      const cDate = findCol(['Datum','Rechnungsdatum','Rechnung Datum','Date','Invoice Date']);
      const cNo = findCol(['Rechnungsnummer','Rechnungnummer','Rechnung Nr','Rechnungs-Nr','Nr','Nummer']);
      const cCustomer = findCol(['Kunde','Kundenname','Customer','Name']);
      const cDesc = findCol(['Beschreibung','Leistung','Description','Betreff']);
      const cGross = findCol(['Bruttobetrag','Brutto','Gesamtbetrag brutto','Gesamt brutto','Betrag','Gesamt','Summe']);
      const cSource = findCol(['Quelldatei','PDF','Datei','Link','Quelle']);
      const cStatus = findCol(['Status','Zahlungsstatus']);

      raw.slice(1).forEach(r => {
        const dateValue = r[cDate >= 0 ? cDate : 0];
        const invoiceNumber = String(r[cNo >= 0 ? cNo : 1] || '').trim();
        const customer = String(r[cCustomer >= 0 ? cCustomer : 2] || '').trim();
        const description = String(r[cDesc >= 0 ? cDesc : 3] || '').trim();
        const gross = parseMoney(r[cGross >= 0 ? cGross : 4]);
        const source = String(r[cSource >= 0 ? cSource : 5] || '').trim();
        const status = String(r[cStatus >= 0 ? cStatus : 6] || '').trim();
        const parsedDate = parseSheetDate(dateValue);
        if (!parsedDate && !invoiceNumber && !customer && !description && !gross) return;

        const dateText = parsedDate
          ? Utilities.formatDate(parsedDate, Session.getScriptTimeZone(), 'dd.MM.yyyy')
          : String(dateValue || '');

        if (parsedDate && parsedDate.getFullYear() === year && parsedDate.getMonth() >= 0 && parsedDate.getMonth() < 12) {
          monthly[parsedDate.getMonth()] += gross;
        }

        rows.push({
          rechnungsdatum: dateText,
          rechnungsnummer: invoiceNumber,
          kunde: customer,
          beschreibung: description,
          bruttobetrag: gross,
          quelldatei: source,
          status: status
        });
      });
    }

    const yearGross = monthly.reduce((sum, value) => sum + value, 0);
    const monthGross = monthly[currentMonth - 1] || 0;

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
    return ContentService.createTextOutput(JSON.stringify({ok:false,error:String(err.message || err)})).setMimeType(ContentService.MimeType.JSON);
  }
}

function normalizeHeader(value) {
  return String(value || '').toLowerCase().trim()
    .replace(/[ä]/g,'a').replace(/[ö]/g,'o').replace(/[ü]/g,'u').replace(/[ß]/g,'ss')
    .replace(/[^a-z0-9]+/g,'');
}

function parseSheetDate(value) {
  if (value instanceof Date && !isNaN(value)) return value;
  const s = String(value || '').trim();
  let m = s.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (m) return new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
  m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  const d = new Date(s);
  return isNaN(d) ? null : d;
}

function parseMoney(value) {
  if (typeof value === 'number') return isFinite(value) ? value : 0;
  let s = String(value || '').trim();
  if (!s) return 0;
  s = s.replace(/€/g,'').replace(/\s/g,'');
  if (s.includes(',') && s.includes('.')) s = s.replace(/\./g,'').replace(',','.');
  else if (s.includes(',')) s = s.replace(',','.');
  const n = Number(s.replace(/[^0-9+\-.]/g,''));
  return isFinite(n) ? n : 0;
}

function round2(n) { return Math.round(Number(n || 0) * 100) / 100; }
