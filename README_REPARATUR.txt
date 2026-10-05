T.S. SERVICELEISTUNGEN – REPARATUR 05.10.2026

Diese Version behebt die aktuellen Probleme im ADMIN-Bereich:

1. BMW-/Hero-Bild
   - Das Admin-Hero-Bild ist jetzt direkt in admin.html eingebettet.
   - Dadurch kann es auf GitHub Pages nicht mehr wegen eines fehlenden assets-Pfades als kaputtes Bild erscheinen.
   - Das BMW-/Drone-/T.S.-Design bleibt ausschließlich im ADMIN.
   - Die öffentliche Anfrage-Seite bleibt ohne BMW-Hero.

2. Logos
   - Die vorhandenen Logo-Assets bleiben im Ordner assets erhalten.
   - Das sichtbare Hero-Design ist zusätzlich direkt eingebettet, damit Logo und Hero zuverlässig erscheinen.

3. Monatliche Einnahmen
   - In admin.js wurde ein Fehler mit dem Element financialYearLabel2 behoben.
   - Die Datumsparser waren doppelt escaped und konnten TT.MM.JJJJ nicht korrekt erkennen. Das wurde behoben.
   - Die Rechnungs-API wird ausdrücklich mit ?year=2026 abgefragt.
   - Das Dashboard zeigt jetzt 12 Monatszeilen sowie eine monatliche Balkenauswertung Einnahmen/Ausgaben.
   - Gewinn = Einnahmen aus Rechnungen – Brutto-Ausgaben aus Belegen.

4. Dashboard-Zurück-Button
   - Auf Terminanfragen, Rechnungen und Belege gibt es jetzt einen sichtbaren „← Dashboard“-Button.

5. Google Apps Script
   - Rechnungen_doGet_ersetzen.gs enthält die korrigierte doGet-Version.
   - WICHTIG: Diese doGet-Version muss in das bestehende Rechnungs-Google-Apps-Script übernommen und als neue Web-App-Version bereitgestellt werden.
   - Die bisherige URL bleibt gleich, sofern das bestehende Script weiterverwendet wird.

DATEIEN
- admin.html
- admin.css
- admin.js
- index.html
- request.css
- app.js
- config.js
- datenschutz.html
- assets/*
- Rechnungen_doGet_ersetzen.gs

EMPFOHLENE REIHENFOLGE
1. ZIP entpacken.
2. Die Dateien in dein bestehendes GitHub-Pages-Projekt übernehmen.
3. Im Google Apps Script die doGet-Funktion durch die mitgelieferte Version ersetzen.
4. Neue Bereitstellung/Version der Web-App veröffentlichen.
5. Website mit Strg+F5 neu laden.
