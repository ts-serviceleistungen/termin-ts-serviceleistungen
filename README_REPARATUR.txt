T.S. SERVICELEISTUNGEN – FINALER REPARATURSTAND 05.10.2026

WICHTIG
=======
1. Alle Dateien aus diesem Paket ins GitHub-Projekt übernehmen.
2. Den Ordner "assets" komplett mit hochladen.
3. Die neue "admin.html", "admin.css" und "admin.js" ersetzen.
4. "index.html", request.css, app.js und datenschutz.html aus dem Paket übernehmen.
5. Die Supabase-Datenbank NICHT löschen oder neu anlegen.
6. Rechnungen_doGet_ersetzen.gs gehört in das bestehende Google-Apps-Script für die Rechnungen.
   Nur die doGet-/Hilfsfunktionen aktualisieren; Import-/Upload-Funktionen des bestehenden Scripts bleiben bestehen.

ADMIN-DESIGN
============
Der Admin-Bereich verwendet jetzt den hochgeladenen Original-Entwurf als Hero:
- BMW M3
- T.S. Serviceleistungen Logo
- Drohne
- Thomas / Administrator
- gold/weißes Karten-Design

Der BMW/Design-Hero ist ausschließlich im Admin-Bereich.
Die öffentliche Anfrage-Seite bekommt KEINEN BMW-Hero.

FINANZEN
========
Die Monatsübersicht wird unabhängig von der Rechnungs-API aufgebaut.
Belege werden direkt aus Supabase nach Jahr/Monat summiert.
Die Rechnungs-API unterstützt jetzt deutsche Datumsformate (TT.MM.JJJJ) und ISO-Daten
und liefert monatliche Einnahmen.
