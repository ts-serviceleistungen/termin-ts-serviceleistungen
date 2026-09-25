/**
 * T.S. Serviceleistungen – Beleg / Rechnung Upload
 *
 * Zielordner: 06_Belege/2026
 * Es werden KEINE Monatsordner angelegt.
 *
 * Diese Datei ist für das bestehende Google-Apps-Script-Web-App-Projekt gedacht.
 * Code.gs mit der bestehenden doGet()-Logik kann bestehen bleiben.
 */

const BELEG_JAHRESORDNER_ID = '1oV9kgtQ7iI380RJy5Qqj5JqXjCjXzptv';

function doPost(e) {
  try {
    const raw = (e && e.parameter && e.parameter.payload)
      ? e.parameter.payload
      : ((e && e.postData && e.postData.contents) || '');

    if (!raw) {
      return belegJson({ok:false, error:'Keine Daten empfangen.'});
    }

    const data = JSON.parse(raw);
    const action = String(data.action || 'uploadBeleg');

    if (action !== 'uploadBeleg' && action !== 'upload') {
      return belegJson({ok:false, error:'Unbekannte Aktion.'});
    }

    if (!data.base64) {
      return belegJson({ok:false, error:'Keine Datei empfangen.'});
    }

    const folder = DriveApp.getFolderById(BELEG_JAHRESORDNER_ID);
    const fileName = belegSafeFileName(data.fileName || ('Beleg_' + new Date().getTime()));
    const mimeType = data.mimeType || 'application/octet-stream';
    const bytes = Utilities.base64Decode(String(data.base64).replace(/^data:[^,]+,/, ''));
    const blob = Utilities.newBlob(bytes, mimeType, fileName);
    const file = folder.createFile(blob);

    return belegJson({
      ok:true,
      fileId:file.getId(),
      fileName:file.getName(),
      url:file.getUrl(),
      folderId:folder.getId(),
      folderName:folder.getName()
    });
  } catch (err) {
    return belegJson({ok:false, error:String(err)});
  }
}

function belegSafeFileName(name) {
  return String(name || 'Beleg')
    .replace(/[\\/:*?"<>|]/g, '-')
    .replace(/[\r\n]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 180) || 'Beleg';
}

function belegJson(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
