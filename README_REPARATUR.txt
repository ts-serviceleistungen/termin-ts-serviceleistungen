T.S. SERVICELEISTUNGEN – REPARATURSTAND 05.10.2026

1. Anfrage-App
- Neues responsives Design.
- BMW-M3-Hero aus dem vorhandenen T.S.-Design als Bildreferenz.
- Serviceauswahl jetzt 6 Bereiche: Fahrzeugpflege, Gartenarbeiten, Foto & Drohnenfotografie, Ersatzteilanfrage, Reifenanfrage, Zubehörmontage.
- Formularfelder sauber responsive.
- Datenschutz-Link funktioniert über datenschutz.html.
- Privacy-Consent und Fahrzeugfotos bleiben erhalten.
- Termin-/Dauerlogik aus dem zuletzt gespeicherten app.js wurde übernommen.

2. Admin
- Neues Admin-Layout im zuletzt gewünschten Gold/Weiß/Schwarz-Stil.
- BMW-M3-Hero wieder integriert.
- Belege werden nicht mehr im Dashboard auf 0 zurückgesetzt.
- Belege werden weiterhin aus Supabase `receipts` geladen.
- Rechnungen werden über die vorhandene Google-Rechnungs-API geladen.
- Zusätzliche Rechnungsansicht vorbereitet.

3. WICHTIG – Rechnungen
Die bisherige Google-API lieferte zuletzt nur `bruttoGesamt`. Deshalb konnte die App keine einzelnen Rechnungszeilen anzeigen.
Die Datei `Rechnungen_doGet_ersetzen.gs` enthält eine erweiterte `doGet(e)`-Version. Nur diese Funktion im bestehenden Google-Apps-Script ersetzen und danach die Web-App-Bereitstellung aktualisieren.
Die bestehende Rechnungsimport-Logik bleibt erhalten.

4. Daten
Es werden keine Belege oder Rechnungen gelöscht. Die Reparatur ändert die Oberfläche und das Auslesen.
