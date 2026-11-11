# T.S. Serviceleistungen – Produktfahrplan

## Zielbild: zwei Betriebsarten

1. **Eigenbetrieb T.S. Serviceleistungen** – die bestehende Installation mit den betrieblichen Daten, Leistungen, Preisen, Kalendern und Vorlagen.
2. **Kundeninstallation / Produktversion** – eine getrennte Installation je Unternehmen, bis ein belastbares Mandantenmodell mit geprüfter Datenisolation bereitsteht.

## Bereits im Bestand vorhanden (vor Ausbau verifizieren)

- Öffentliche Anfrageformulare und mehrere Anfragebereiche
- Supabase Auth für die Administration
- Anfragen, Statuswechsel und Terminbestätigung
- Fahrzeugpflege-Dauerberechnung und Kalenderblockierung
- Kundenstamm, Angebots- und Rechnungsübersichten
- Beleg- und Finanzübersichten
- PWA-Grundlage

## In diesem Änderungssatz

- Bestandskundenansicht zeigt zusätzlich die zugehörigen Anfragen.
- Anfragezuordnung erfolgt nur über exakt übereinstimmende, normalisierte E-Mail-Adressen.
- Anfrageeinträge öffnen die vorhandenen Detailansichten; es wird kein neues Datenbankschema benötigt.
- Kundenansicht lädt die Anfragen vor dem Rendern frisch nach.

## Nächste technische Ausbaustufen

1. **Sicherheit:** RLS-Policies aller exponierten Tabellen und Storage-Buckets prüfen; Authentifizierungs- und Rollenmodell dokumentieren; keine Service-Role-Schlüssel im Browser.
2. **Betriebsstabilität:** Fehlerprotokollierung, Benachrichtigungsstatus, Wiederholungsmechanismus und nachvollziehbare Kalender-Synchronisierung.
3. **Datenqualität:** stabile Kunden-ID-Verknüpfung für Anfragen, Angebote und Rechnungen; Dublettenprüfung und sichere Zusammenführung.
4. **Produktkonfiguration:** Leistungen, Formularfelder, Farben, Logo, E-Mail-Texte, Arbeitszeiten und Statuswerte je Installation konfigurierbar machen.
5. **Produktisierung:** getrennte Kundenprojekte und getrennte Datenbanken/Storage-Bereiche als sichere Startarchitektur; erst später gegebenenfalls gemeinsames Multi-Tenant-System.
6. **Kommerzialisierung:** Einrichtungsprozess, Lizenz-/Aboverwaltung, Support- und Übergabemodell sowie Datenschutz-/Auftragsverarbeitungsunterlagen.

## Sicherheitsgrenze

Die bestehende Installation ist keine nachgewiesene Multi-Tenant-SaaS-Plattform. Diese Änderung aktiviert keine Mandantenfähigkeit und verändert keine Datenbank-Policies. Vor dem Verkauf an mehrere Unternehmen müssen Datenisolation, Berechtigungen, Backups, Löschkonzept und Auftragsverarbeitung separat geprüft und getestet werden.
