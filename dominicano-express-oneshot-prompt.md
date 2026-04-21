# ONE-SHOT AGENT PROMPT — Dominicano Express GmbH Website Rebuild

> **Zielpublikum dieses Prompts:** Coding-/Design-Agent (Claude Code, OpenClaw, v0, Cursor, Bolt o. ä.)
> **Ziel:** Komplette Überarbeitung der Website `dominicanoexpress.com` — mehrsprachig (ES/DE/EN), konversionsoptimiert, vertrauenswürdig, SEO- & CH-rechtskonform.
> **Modus:** Dieses Dokument ist selbsterklärend. Der Agent hat alles, was er braucht: Kontext, bestehende Inhalte, konkrete Verbesserungen, vollständige mehrsprachige Texte, Design-System, technische Specs, Akzeptanzkriterien.

---

## 0. ROLLE & MISSION

Du bist **Senior Fullstack Engineer + Conversion-Copywriter + Brand Designer** in einer Person. Du baust eine moderne, vertrauensbildende Logistik-Website für ein KMU, das See-Container zwischen der Schweiz und der Dominikanischen Republik verschifft. Zielgruppe: Dominikanische Diaspora in der Schweiz, deren Familien/Partner in der CH, sowie B2B-Partner (Autónomos, Sammelstellen).

**Leitprinzip:** *Maximales Vertrauen + minimale Reibung.* Jede Sektion muss eine konkrete Frage des Besuchers beantworten und ihn einen Schritt näher zur Buchung / zum WhatsApp-Kontakt führen.

---

## 1. UNTERNEHMENS-DATEN (VERIFIZIERT AUS BESTEHENDER SITE)

| Feld | Wert |
|---|---|
| Firmenname | Dominicano Express GmbH |
| Adresse | Tannenstrasse 98, Embrach, Schweiz |
| Telefon / WhatsApp | +41 79 199 93 93 |
| Domain | dominicanoexpress.com |
| Rechtsform | GmbH (Schweiz) |
| Branche | See-Fracht / Logistik (CH ↔ DO) |
| Erfahrung | >20 Jahre laut Selbstaussage |
| Frequenz | Monatliche Container |
| Service-Modell | Door-to-Door, „Full Package" |

**⚠️ FEHLENDE PFLICHTANGABEN (muss der Agent als `TODO_CLIENT`-Platzhalter markieren, damit der Kunde ergänzt):**
- UID-/CHE-Nummer (zwingend für Schweizer Impressum)
- Handelsregister-Nummer
- Vertretungsberechtigte Person(en) / Geschäftsführung
- E-Mail-Adresse
- Offizielle Öffnungszeiten
- Allfällige Versicherungspartner / Reederei-Partner

---

## 2. CURRENT-STATE AUDIT (BESTANDSAUFNAHME)

### 2.1 Technische Basis
- Gebaut auf **GoDaddy Website Builder** (`img1.wsimg.com` = Tell). Limitiert in SEO, Performance, Schema-Markup.
- Cookie-Banner generisch, keine echte Consent-Logik.
- reCAPTCHA eingebunden, aber keine Privacy Policy / Datenschutzerklärung auf der Site.
- Impressum-Seite **praktisch leer** — nur Überschrift „Dominicano Express". **Grober UWG/OR-Verstoss in der Schweiz.**

### 2.2 Inhaltliche Probleme
- **Nur Spanisch.** Keine DE/EN-Version, obwohl Sitz in CH.
- **Stock-Videos von Getty Images** (sichtbar an URL `media.gettyimages.com`) — generisch, vertrauensschädigend.
- **Leere Galerie** (5 Platzhalter-GIFs).
- **Dreifach wiederholte H1**: „Dominicano Express GmbHDominicano Express GmbHDominicano Express GmbH" — sieht wie Template-Bug aus.
- **Keine Preise**, kein Rechner, kein Tarif-PDF.
- **Tracking versprochen, aber nicht implementiert** (Werbeaussage ohne Einlösung).
- **Keine Trust-Elemente**: Keine Testimonials, keine Google-Bewertungen, keine Partner-Logos, keine Fotos vom realen Betrieb.
- **Öffnungszeiten-Widget defekt**: Zeigt nur „Today — Closed" ohne Kontext.
- **Produkt-Seite:** Überschriften-Chaos (z. B. Karte „JUMBO" hat Sub-Title „MEDIANA"; Karte „MEGA" hat Sub-Title „MAXI"). Copy-Paste-Fehler.
- **Kontakt-Formular** hat `Attach Files` mitten im Newsletter-Signup — semantisch vermischt.

### 2.3 SEO-Stand
- Kein Schema.org / LocalBusiness / Service Markup.
- Meta-Tags vermutlich Default des Baukastens.
- Keine Übersetzungen, kein `hreflang`.
- Dünne Inhalte — kein Blog, keine FAQ, keine Prozess-Erklärung.

---

## 3. TARGET-STATE (VISION)

Eine **dreisprachige** (ES als Default, DE und EN umschaltbar), performante, SEO-starke, vertrauensbildende Single-Page-Website mit zusätzlicher `Productos`-Detail-Page, optionalem `Blog`/`FAQ` und rechtskonformem Impressum/Datenschutz.

### 3.1 Kernziele (in dieser Reihenfolge)
1. **Conversion**: WhatsApp-Anfrage oder Formular-Lead
2. **Trust**: Glaubhaft machen, dass Ware sicher ankommt
3. **Klarheit**: Preisidee, Prozess, Zeitrahmen auf einen Blick
4. **SEO**: Ranken für „envío Suiza República Dominicana", „Paket in die Dominikanische Republik schicken", „shipping Switzerland Dominican Republic"
5. **Rechtssicherheit**: CH-Impressum, Datenschutz (revDSG + DSGVO), Cookies

### 3.2 Primäre Conversion-Pfade
- **Pfad A (warm):** Hero → „WhatsApp senden" (1 Klick → `wa.me/41791999393`)
- **Pfad B (evaluierend):** Hero → Prozess → Preise → Formular
- **Pfad C (B2B):** Hero → Sektion „Afiliación Autónomos" → Formular mit Typ=Partner

---

## 4. INFORMATIONSARCHITEKTUR (NEU)

```
/                          → Landing (Single Long-Scroll, konversionsoptimiert)
/productos                 → Produkt-Katalog (Cajas, Barriles, Embalaje)
/proceso                   → Wie es funktioniert (5 Schritte + FAQ)
/precios                   → Transparente Preistabelle + Volumenrechner
/afiliacion                → Partnerprogramm für Autónomos (B2B)
/faq                       → Häufige Fragen (Zoll, Versicherung, Verbotenes)
/blog                      → (optional, für SEO-Longtail, Phase 2)
/contacto                  → Kontakt + Standort + Öffnungszeiten
/impressum                 → CH-konformes Impressum
/datenschutz               → DSGVO + revDSG
/agb                       → Allgemeine Geschäftsbedingungen
/tracking                  → Sendungsverfolgung (Platzhalter, wenn nicht vorhanden)
```

**Sprach-Routing via URL-Präfix:**
- `/` = ES (Default)
- `/de/...` = Deutsch
- `/en/...` = English
- `hreflang`-Tags auf jeder Seite.

---

## 5. CONTENT-INVENTAR (BESTEHEND) + NEUE MEHRSPRACHIGE VERSIONEN

> Alle bestehenden Original-Inhalte werden hier 1:1 übernommen und dann in DE/EN übersetzt + konversionsoptimiert nachgebessert.

### 5.1 BRAND / META

| Key | ES (original, leicht geschliffen) | DE | EN |
|---|---|---|---|
| `brand.name` | Dominicano Express GmbH | Dominicano Express GmbH | Dominicano Express GmbH |
| `brand.tagline` | Tu enlace marítimo entre Suiza y República Dominicana | Ihre See-Fracht-Verbindung zwischen der Schweiz und der Dominikanischen Republik | Your maritime link between Switzerland and the Dominican Republic |
| `brand.short_desc` | Envíos puerta a puerta, mensuales y confiables — de 🇨🇭 a 🇩🇴 | Monatliche Tür-zu-Tür-Sendungen von der Schweiz in die Dominikanische Republik | Monthly door-to-door shipments from Switzerland to the Dominican Republic |

### 5.2 HERO-SEKTION

**ES:**
- Eyebrow: `Empresa familiar · Más de 20 años de experiencia`
- H1: `Tu mercancía, de Suiza a la puerta de tu familia en República Dominicana.`
- Sub: `Envíos marítimos mensuales, puerta a puerta, con tracking, seguro incluido y sin complicaciones.`
- CTA primario: `Cotiza por WhatsApp` → `wa.me/41791999393`
- CTA secundario: `Ver precios` → `/precios`
- Trust-Strip unter dem Fold: `📦 Contenedores mensuales · 🛡️ Seguro incluido · 📍 Puerta a puerta en toda RD · 🇨🇭 Recogida en toda Suiza`

**DE:**
- Eyebrow: `Familienunternehmen · Über 20 Jahre Erfahrung`
- H1: `Ihre Sendung — von der Schweiz direkt an die Haustür Ihrer Familie in der Dominikanischen Republik.`
- Sub: `Monatliche See-Fracht, Tür zu Tür, mit Tracking, inklusive Versicherung — ohne Umwege.`
- CTA primär: `Offerte via WhatsApp`
- CTA sekundär: `Preise ansehen`
- Trust-Strip: `📦 Monatliche Container · 🛡️ Versicherung inklusive · 📍 Hauszustellung in ganz DO · 🇨🇭 Abholung in der ganzen Schweiz`

**EN:**
- Eyebrow: `Family-owned · 20+ years of experience`
- H1: `Your goods — from Switzerland straight to your family's doorstep in the Dominican Republic.`
- Sub: `Monthly ocean freight, door to door, with tracking and insurance included — no hassle.`
- CTA primary: `Get a quote on WhatsApp`
- CTA secondary: `See pricing`
- Trust-Strip: `📦 Monthly containers · 🛡️ Insurance included · 📍 Door-to-door across DR · 🇨🇭 Pickup anywhere in Switzerland`

### 5.3 ÜBER UNS

**ES (original, überarbeitet):**
> Dominicano Express GmbH es una empresa familiar especializada en envíos marítimos entre Suiza 🇨🇭 y la República Dominicana 🇩🇴. Con más de 20 años de experiencia en el sector logístico, ofrecemos soluciones de transporte puerta a puerta, confiables, eficientes y profesionalmente estructuradas. Combinamos experiencia práctica con procesos organizados para garantizar a nuestros clientes un servicio seguro, ágil y sin complicaciones.

**DE:**
> Dominicano Express GmbH ist ein Familienunternehmen mit Fokus auf See-Fracht zwischen der Schweiz 🇨🇭 und der Dominikanischen Republik 🇩🇴. Mit über 20 Jahren Erfahrung bieten wir zuverlässige, effiziente Tür-zu-Tür-Lösungen, die professionell strukturiert sind. Wir verbinden gelebte Praxis mit klaren Prozessen — damit Ihre Sendung sicher, schnell und sorgenfrei ankommt.

**EN:**
> Dominicano Express GmbH is a family-run company specialising in ocean freight between Switzerland 🇨🇭 and the Dominican Republic 🇩🇴. With more than 20 years in the logistics industry, we deliver reliable, efficient, professionally managed door-to-door services. We combine hands-on experience with organised processes so your shipment arrives safely, swiftly and without friction.

### 5.4 SO FUNKTIONIERT ES (5 Schritte — NEU)

| # | ES | DE | EN |
|---|---|---|---|
| 1 | **Solicita tu caja o barril** — Escríbenos por WhatsApp. Te asesoramos según lo que quieras enviar. | **Kiste oder Fass bestellen** — Schreiben Sie uns auf WhatsApp. Wir beraten Sie je nach Sendung. | **Request your box or barrel** — Message us on WhatsApp. We advise you based on what you're sending. |
| 2 | **Entrega gratuita en Suiza** — Te llevamos las cajas o barriles vacíos a tu dirección. | **Gratis-Lieferung in der Schweiz** — Wir bringen die leeren Kisten oder Fässer zu Ihnen. | **Free delivery in Switzerland** — We drop off the empty boxes or barrels at your address. |
| 3 | **Tú empacas a tu ritmo** — Tómate el tiempo que necesites para preparar tu envío. | **In Ruhe packen** — Sie nehmen sich die Zeit, die Sie brauchen. | **Pack at your own pace** — Take the time you need to prepare your shipment. |
| 4 | **Recogemos y enviamos** — Pasamos a recoger, nos ocupamos de aduanas y logística marítima. | **Abholung & Versand** — Wir holen ab und kümmern uns um Zoll und Seefracht. | **Pickup & shipping** — We collect and handle customs and ocean freight. |
| 5 | **Entrega a domicilio en RD** — Llevamos tu mercancía directamente a la puerta del destinatario. | **Hauszustellung in DO** — Direkt an die Haustür des Empfängers in der Dom. Rep. | **Home delivery in DR** — Straight to the recipient's door in the Dominican Republic. |

**Hinweis an den Agent:** Diese 5 Schritte als horizontale Timeline oder vertikale Stepper darstellen. Jeder Schritt mit eigenem Icon (Truck, Box, Clock, Ship, Home).

### 5.5 PRODUKTE — CAJAS (aus `/productos` übernommen & bereinigt)

> ⚠️ Die bestehende Produkt-Seite hat **Copy-Paste-Fehler in den Überschriften** (JUMBO hat Untertitel MEDIANA, MEGA hat Untertitel MAXI). Unten die bereinigte, korrekte Version.

#### MEDIANA — Caja Mediana 70×50×50 cm
- **ES:** Nuestra caja Mediana está fabricada con el cartón más resistente de toda nuestra línea. Es una caja robusta, fuerte y preparada especialmente para soportar envíos marítimos de larga distancia y mercancía de alto peso. Gracias a la calidad superior de su cartón, ofrece una excelente protección para ropa, zapatos, utensilios, alimentos secos, artículos delicados y pertenencias personales. También resiste muy bien la humedad y mantiene su forma durante todo el trayecto.
- **DE:** Unsere Mediana-Box ist aus dem robustesten Karton unseres Sortiments gefertigt. Stabil, belastbar und speziell für lange Seefrachtwege und schweres Transportgut ausgelegt. Ideal für Kleider, Schuhe, Haushaltswaren, trockene Lebensmittel, empfindliche Artikel und persönliche Gegenstände. Feuchtigkeitsresistent und formstabil über die gesamte Strecke.
- **EN:** Our Mediana box is made from the most durable cardboard in our range. Sturdy, heavy-duty and built for long-distance sea freight and heavier loads. Excellent protection for clothing, shoes, household items, dry food, fragile goods and personal belongings. Stands up to humidity and keeps its shape throughout the journey.

#### JUMBO
- **ES:** La caja Jumbo cuenta con un cartón de muy alta resistencia, muy similar al de la caja Mediana, lo que la convierte en una excelente opción para clientes que desean enviar una mayor cantidad de mercancía sin perder seguridad. Ideal para artículos pesados o voluminosos. Su material robusto ayuda a proteger el contenido y a mantener la caja firme incluso en condiciones de humedad o manejo constante.
- **DE:** Die Jumbo-Box ist aus hochwiderstandsfähigem Karton, vergleichbar mit der Mediana — ideal für grössere Sendungen ohne Sicherheitsverlust. Perfekt für schwere oder voluminöse Artikel. Das robuste Material schützt den Inhalt und gibt der Box Halt, auch bei Feuchtigkeit und intensiver Handhabung.
- **EN:** The Jumbo box uses high-strength cardboard similar to the Mediana — perfect for larger shipments without compromising on safety. Ideal for heavy or bulky items. The sturdy material protects the contents and keeps the box firm even under humidity and heavy handling.

#### MAXI
- **ES:** Nuestra caja Maxi está diseñada para clientes que necesitan más espacio. Aunque su cartón es un poco más ligero que el de la Mediana y la Jumbo, sigue siendo resistente y adecuado para el transporte marítimo. Su principal ventaja es la capacidad: permite enviar más ropa, artículos del hogar, juguetes, zapatos y mercancía variada en una sola caja. Recomendamos distribuir bien el peso.
- **DE:** Die Maxi-Box ist für Kund:innen, die mehr Volumen brauchen. Der Karton ist etwas leichter als bei Mediana und Jumbo, bleibt aber seefrachttauglich. Grösster Vorteil: Kapazität — mehr Kleider, Haushaltsartikel, Spielzeug, Schuhe und gemischte Ware in einer Box. Wir empfehlen, das Gewicht gut zu verteilen.
- **EN:** The Maxi box is built for customers who need more space. Its cardboard is slightly lighter than the Mediana and Jumbo, but still ocean-freight ready. Its biggest advantage is capacity — more clothing, household items, toys, shoes and mixed goods per box. We recommend distributing weight evenly.

#### MEGA
- **ES:** La caja Mega es una de nuestras opciones más grandes y espaciosas, ideal para enviar grandes cantidades o artículos voluminosos. Su cartón es ligeramente más ligero que el de las cajas Mediana y Jumbo, ya que está pensada principalmente para ofrecer mayor capacidad. Aun así, es resistente para envíos marítimos: ropa, electrodomésticos pequeños, utensilios, textiles y artículos de gran volumen viajan seguros.
- **DE:** Die Mega-Box ist eine unserer grössten Optionen — ideal für grosse Mengen oder voluminöse Artikel. Der Karton ist etwas leichter, da die Priorität auf Volumen liegt. Trotzdem seefracht-robust: Kleider, Kleingeräte, Haushaltsware, Textilien und voluminöse Artikel reisen sicher.
- **EN:** The Mega box is one of our largest options — perfect for big volumes or bulky items. Cardboard is slightly lighter since the priority is capacity. Still ocean-freight tough: clothes, small appliances, utensils, textiles and high-volume goods travel safely.

### 5.6 PRODUKTE — BARRILES

- **ES:** Los barriles de Dominicano Express son una excelente opción para enviar mercancías de gran volumen de forma segura y organizada. Disponemos de barriles resistentes de **120L, 150L, 220L** y zafacones de **150L y 240L**, ideales para ropa, zapatos, utensilios del hogar, alimentos secos, herramientas, piezas y mucho más. Fabricados con materiales fuertes y duraderos, soportan peso, humedad y el manejo durante el transporte marítimo. Gracias a su estructura robusta y tapa segura, protegen mejor sus pertenencias durante todo el trayecto desde Suiza hasta República Dominicana. Recomendados para clientes que necesitan aprovechar al máximo el espacio y enviar grandes cantidades en un solo envío.
- **DE:** Unsere Fässer sind die Top-Wahl für grosse Volumen — sicher und organisiert. Verfügbar in **120L, 150L, 220L** sowie Zafacones in **150L und 240L**, ideal für Kleider, Schuhe, Haushaltswaren, trockene Lebensmittel, Werkzeuge, Ersatzteile und mehr. Robuste Materialien halten Gewicht, Feuchtigkeit und intensive Handhabung stand. Die stabile Struktur und der sichere Deckel schützen Ihre Ware auf der gesamten Strecke von der Schweiz in die Dominikanische Republik. Empfohlen für alle, die maximalen Raum ausnutzen und in einer Sendung viel verschicken wollen.
- **EN:** Our barrels are the best choice for large volumes — secure and organised. Available in **120L, 150L, 220L** sizes plus zafacones in **150L and 240L**, ideal for clothing, shoes, household items, dry food, tools, parts and more. Strong, durable materials handle weight, humidity and heavy handling. The sturdy build and tight lid protect your belongings along the entire journey from Switzerland to the Dominican Republic. Recommended for anyone maximising space and sending large quantities in a single shipment.

### 5.7 AFILIACIÓN / PARTNERPROGRAMM

**ES (original, geschliffen):**
> **Afiliación de Autónomos** — Convierte tu trabajo en un negocio más rentable, estructurado y escalable junto a Dominicano Express GmbH.
>
> Si eres autónomo o tienes una empresa de recogidas o envíos, esta es tu oportunidad de integrarte a una estructura logística consolidada. No trabajas solo: estás respaldado por un sistema probado que ya funciona.
>
> **Con nosotros obtienes:**
> - Precios optimizados para mayor margen de ganancia
> - Seguro de mercancía incluido — menor riesgo operativo
> - Tracking en tiempo real para control total
> - Trazabilidad completa, desde la recogida hasta la entrega final
> - Soporte directo y continuo
>
> Trabajamos con un modelo **"full package"**: transporte, aduana, distribución y gestión completa están incluidos. Tú captas y mueves mercancía — nosotros nos encargamos del resto.

**DE:**
> **Partnerprogramm für Selbstständige** — Machen Sie aus Ihrer Tätigkeit ein profitableres, strukturiertes und skalierbares Geschäft — an der Seite von Dominicano Express GmbH.
>
> Sie sind selbstständig oder betreiben ein Abhol-/Versandunternehmen? Dann ist das Ihre Chance, sich einer etablierten Logistikstruktur anzuschliessen. Sie arbeiten nicht allein — ein erprobtes, funktionierendes System steht hinter Ihnen.
>
> **Was Sie bei uns bekommen:**
> - Optimierte Tarife für höhere Margen
> - Warenversicherung inklusive — weniger Betriebsrisiko
> - Echtzeit-Tracking für volle Kontrolle
> - Lückenlose Sendungsverfolgung, von Abholung bis Zustellung
> - Direkter, kontinuierlicher Support
>
> Wir arbeiten im **„Full-Package"-Modell**: Transport, Zoll, Verteilung und Gesamtabwicklung sind inklusive. Sie akquirieren und bewegen Ware — wir machen den Rest.

**EN:**
> **Affiliate Programme for Self-Employed Operators** — Turn your work into a more profitable, structured, scalable business — together with Dominicano Express GmbH.
>
> If you're self-employed or run a pickup/shipping operation, this is your chance to plug into an established logistics structure. You don't work alone — a proven, functioning system backs you up.
>
> **What you get with us:**
> - Optimised rates for higher margins
> - Cargo insurance included — lower operational risk
> - Real-time tracking for full control
> - End-to-end traceability, from pickup to final delivery
> - Direct, ongoing support
>
> We operate a **"full package"** model: transport, customs, distribution and total handling are included. You win and move the goods — we handle the rest.

### 5.8 VERTRAUENS-SEKTION (NEU, PLATZHALTER FÜR CLIENT-INPUT)

```
[Trust-Row 1 — Stats]
- 20+ Jahre Erfahrung
- XX+ zufriedene Kunden (TODO_CLIENT)
- XXX+ Container verschifft (TODO_CLIENT)
- 12 Abfahrten pro Jahr

[Trust-Row 2 — Testimonials]
- 3–6 echte Kunden-Stimmen mit Foto + Vorname + Stadt (z. B. „Maria, Zürich")
- TODO_CLIENT: Der Kunde liefert Testimonials; bis dahin Platzhalter-Schema.

[Trust-Row 3 — Partner/Badges]
- Google-Bewertungs-Badge (TODO_CLIENT: Google Business Profile verknüpfen)
- Reederei-Partner-Logos (TODO_CLIENT)
- Zoll-/Behörden-Referenzen (TODO_CLIENT)
- Swiss-Made-Badge / „Registered in Embrach ZH"
```

### 5.9 FAQ (NEU — minimum 10 Fragen, DE/ES/EN)

Verpflichtende Fragen (Agent ergänzt Antworten plausibel; TODO_CLIENT-Flag, wo echte Kundenangaben nötig sind):

1. **Wie lange dauert der Transit CH → DO?** *(Platzhalter: ca. 25–35 Tage Seefracht + Zoll + Zustellung. TODO_CLIENT zur Verifizierung.)*
2. **Was darf ich NICHT senden?** *(Waffen, Munition, Drogen, verderbliche Lebensmittel, Flüssigkeiten in Glas ohne Schutz, lebende Tiere, Edelmetalle/Bargeld, Medikamente ohne Verschreibung etc.)*
3. **Ist meine Ware versichert?** *(Ja — Standard-Warenversicherung inklusive; Höhe TODO_CLIENT.)*
4. **Wie wird der Preis berechnet?** *(Nach Volumen/Kisten-/Fassgrösse; Pauschal oder nach Destination. TODO_CLIENT.)*
5. **Muss der Empfänger Zollgebühren zahlen?** *(Erklärung DR-Zoll, Freimengen — TODO_CLIENT verifizieren.)*
6. **Wie verfolge ich meine Sendung?** *(WhatsApp-Updates + Tracking-Link sobald Container verladen.)*
7. **Kann ich in der ganzen Schweiz abholen lassen?** *(Ja — Abholung in allen Kantonen.)*
8. **Wird in der ganzen Dominikanischen Republik zugestellt?** *(Ja — Santo Domingo, Santiago, alle Provinzen; Inseln & abgelegene Gebiete TODO_CLIENT.)*
9. **Wie bezahle ich?** *(TWINT, Banküberweisung, Bar bei Abholung — TODO_CLIENT.)*
10. **Was passiert bei Verlust oder Schaden?** *(Reklamationsprozess, Fristen, Versicherungsabwicklung — TODO_CLIENT.)*
11. **Kann ich auch B2B / im Partnermodell arbeiten?** *(Ja — siehe Afiliación-Seite.)*
12. **Versandet ihr auch Fahrzeuge / Motorräder / Elektronik?** *(TODO_CLIENT.)*

Jede FAQ-Antwort in **ES / DE / EN**.

### 5.10 KONTAKT-SEKTION

- WhatsApp-Button (primär): `wa.me/41791999393`
- Telefon: `+41 79 199 93 93`
- E-Mail: `TODO_CLIENT@dominicanoexpress.com`
- Adresse: `Tannenstrasse 98, 8424 Embrach, Schweiz` (PLZ prüfen — TODO_CLIENT)
- Google-Maps-Embed (mit Consent-Layer!)
- Öffnungszeiten korrekt ausformuliert statt „Today Closed"
- Social: Facebook / Instagram / TikTok — TODO_CLIENT Links

---

## 6. DESIGN-SYSTEM

### 6.1 Brand-Tonalität
- **Warm, familiär, professionell.** Keine corporate Kälte, kein Karibik-Klischee (keine Palmen-Stereotype).
- Dominikanische Akzente dezent: Flaggen-Farben als Akzent, spanische Wendungen in Microcopy erlaubt.

### 6.2 Farb-Palette (Vorschlag, vom Agent umsetzbar)

```
--do-primary:      #00205B   /* Deep navy — Seriosität, Ozean, Flagge DO */
--do-accent:       #CE1126   /* Caribbean red — Flagge DO, CTA-Farbe */
--do-swiss:        #DA291C   /* Swiss red für CH-Akzente */
--do-cream:        #FDF8F0   /* Warmer Hintergrund */
--do-ink:          #0C1021   /* Haupttext */
--do-muted:        #6B7280   /* Sekundärtext */
--do-success:      #10B981   /* „Enviado", „Zugestellt" */
--do-border:       #E5E7EB
```

### 6.3 Typografie
- **Headings:** `Geist`, `Inter Tight`, oder `Plus Jakarta Sans` — bold, tight tracking
- **Body:** `Inter` oder `Geist` Regular, 16–18px Base, Line-Height 1.6
- **Numerische Werte (Preise, Volumen):** Tabular Nums erzwingen

### 6.4 Komponenten (minimum)
- Sticky Header mit Sprach-Switch (ES/DE/EN) & WhatsApp-Float-Button (rechts unten, alle Seiten)
- Hero mit echtem Video/Foto-Hintergrund (TODO_CLIENT-Assets) + dezentem Dark-Overlay
- Prozess-Stepper (5 Schritte, horizontal Desktop / vertikal Mobile)
- Produkt-Karten (Cajas + Barriles) mit Foto, Massen, Material, CTA
- Preis-Tabelle (oder Platzhalter „Offerte via WhatsApp")
- Volumenrechner (optional, Phase 2)
- Testimonial-Slider
- Trust-Strip (Stats)
- FAQ-Accordion
- Mehrsprachiges Kontaktformular mit Lead-Typ-Selector (Privat / Partner)
- Cookie-Consent-Banner (Accept/Reject/Settings — nicht nur „Accept")
- Footer mit vollständigen Legal-Links + UID + Impressum

### 6.5 Motion & Micro-Interactions
- Scroll-Fade-in dezent, keine Partikel-Effekte, keine „cyberpunk"-Optik
- Hover-States auf allen Buttons/Karten
- Prefers-reduced-motion respektieren

---

## 7. TECHNISCHE SPECS

### 7.1 Stack-Empfehlung
- **Framework:** Next.js 15 (App Router) + TypeScript
- **Styling:** Tailwind CSS v4
- **UI-Primitives:** shadcn/ui
- **i18n:** `next-intl` oder `next-international` (ES/DE/EN)
- **Forms:** React Hook Form + Zod-Validation
- **Content:** MDX oder Sanity/Payload-CMS (damit der Kunde Texte selber pflegen kann)
- **Hosting:** Vercel
- **E-Mail-Versand:** Resend (Kontakt-Formular)
- **Analytics:** Plausible (privacy-first) oder Umami
- **Map:** Leaflet + OSM (privacy-friendly statt Google)

### 7.2 Performance-Budget
- LCP < 2.0s (Mobile 4G)
- CLS < 0.05
- Total JS < 200 KB gzipped initial
- Bilder: AVIF + WebP, Lazy Loading, `next/image`
- Fonts: selfhosted, `font-display: swap`

### 7.3 SEO
- Schema.org: `LocalBusiness` + `Service` + `FAQPage` + `BreadcrumbList`
- `hreflang` alternate Tags für ES/DE/EN auf jeder Seite
- Meta-Title/-Description pro Seite, pro Sprache
- XML-Sitemap mit Sprach-Varianten
- `robots.txt`
- Open Graph + Twitter Cards
- Strukturierte Produkte mit `Product`-Schema (für Cajas/Barriles)

**Meta-Title-Vorlagen:**
- ES: `Envíos Suiza → República Dominicana | Dominicano Express GmbH`
- DE: `Versand Schweiz → Dominikanische Republik | Dominicano Express GmbH`
- EN: `Shipping Switzerland → Dominican Republic | Dominicano Express GmbH`

### 7.4 Accessibility
- WCAG 2.2 AA
- Tastatur-Navigation komplett
- Kontrast 4.5:1 minimum
- `aria-label` auf allen Icon-Buttons (insbesondere Sprach-Switch, WhatsApp-Button)
- Alle Bilder mit sinnvollem `alt` in der jeweiligen Sprache

### 7.5 Rechtliche Compliance (Schweiz)
- **Impressum (Art. 3 UWG):** Firma, Adresse, UID, Handelsregister, Kontakt, vertretungsberechtigte Person
- **Datenschutz:** revDSG (Schweiz) + DSGVO (EU-Besucher) — Cookie-Kategorien, Auftragsverarbeiter-Liste, Betroffenenrechte, Kontakt DSB
- **Cookies:** Opt-in für nicht-essenzielle Cookies (Consent-Manager)
- **Widerrufs-/AGB-Seite**
- reCAPTCHA nur mit aktivem Consent laden

---

## 8. ASSET-ANFORDERUNGEN (vom Kunden zu liefern — TODO_CLIENT)

| # | Asset | Pflicht | Notiz |
|---|---|---|---|
| 1 | Hochauflösendes Logo (SVG + PNG) | ✅ | aktuelles ist pixelig |
| 2 | 8–15 echte Fotos vom Betrieb | ✅ | Lager Embrach, Container-Beladung, Team, Lieferungen in DO |
| 3 | 1 Hero-Video (10–20s) | ⭕ | Team beim Arbeiten oder Container-Timelapse |
| 4 | Testimonials (3–6) | ✅ | Text + Foto + Vorname + Stadt + Einwilligung |
| 5 | Produktfotos Cajas & Barriles | ✅ | auf neutralem Hintergrund, freigestellt |
| 6 | Kunden-/Partner-Liste | ⭕ | Falls vorhanden |
| 7 | Preisliste (auch ungefähr) | ✅ | kritisch für Conversion |
| 8 | UID / Handelsregister | ✅ | rechtlich zwingend |
| 9 | Google Business Profile | ✅ | Bewertungen aktivieren |
| 10 | Social-Media-Links | ⭕ | FB/IG/TikTok |

---

## 9. AKZEPTANZKRITERIEN (Definition of Done)

Die neue Website ist fertig, wenn **ALLE** folgenden Punkte erfüllt sind:

- [ ] Drei Sprachen (ES/DE/EN) komplett übersetzt, per Sprach-Switch umschaltbar, `hreflang` korrekt
- [ ] Alle Seiten aus der IA (Abschnitt 4) implementiert
- [ ] Alle Inhalte aus Abschnitt 5 übernommen (bereinigte Versionen, keine Copy-Paste-Fehler)
- [ ] 5-Schritt-Prozess als visueller Stepper
- [ ] WhatsApp-Float-Button auf jeder Seite (rechts unten)
- [ ] Google Lighthouse: Performance ≥ 90, SEO ≥ 95, Accessibility ≥ 95, Best Practices ≥ 95
- [ ] Schema.org LocalBusiness + Service + FAQPage implementiert und mit Rich Results Test validiert
- [ ] Impressum mit `TODO_CLIENT`-Markern überall dort, wo Kundenangaben fehlen
- [ ] Datenschutzerklärung revDSG + DSGVO-konform
- [ ] Cookie-Consent mit echtem Opt-in
- [ ] Kontaktformular mit Resend + Zod-Validierung + Spam-Schutz (honeypot + Rate-Limit)
- [ ] Mobile-First, getestet auf 360×640 bis 1920×1080
- [ ] Keine Getty-/Stock-Platzhalter mehr sichtbar — wo Kundenfotos fehlen: schlichte, mit CSS generierte Illustrationen oder klar als Platzhalter markiert
- [ ] Alle Produkt-Karten mit korrekten Titeln (kein „JUMBO → MEDIANA"-Bug)
- [ ] Legal-Links im Footer: Impressum / Datenschutz / AGB
- [ ] README mit Deploy-Instruktionen + Env-Variablen

---

## 10. OUTPUT DES AGENTS

Liefere ein komplettes Repository mit:

```
/
├── README.md                    # Setup, Deploy, Env-Vars, TODO_CLIENT-Liste
├── .env.example
├── next.config.js
├── tailwind.config.ts
├── app/
│   ├── [locale]/
│   │   ├── page.tsx             # Landing
│   │   ├── productos/page.tsx
│   │   ├── proceso/page.tsx
│   │   ├── precios/page.tsx
│   │   ├── afiliacion/page.tsx
│   │   ├── faq/page.tsx
│   │   ├── contacto/page.tsx
│   │   ├── impressum/page.tsx
│   │   ├── datenschutz/page.tsx
│   │   └── agb/page.tsx
│   ├── api/contact/route.ts
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── Hero.tsx
│   ├── ProcessStepper.tsx
│   ├── ProductCard.tsx
│   ├── PricingTable.tsx
│   ├── Testimonials.tsx
│   ├── FAQAccordion.tsx
│   ├── ContactForm.tsx
│   ├── LanguageSwitch.tsx
│   ├── WhatsAppFloat.tsx
│   ├── CookieConsent.tsx
│   ├── Header.tsx
│   └── Footer.tsx
├── content/
│   ├── es/*.mdx
│   ├── de/*.mdx
│   └── en/*.mdx
├── messages/
│   ├── es.json
│   ├── de.json
│   └── en.json
├── public/
│   ├── logo.svg
│   └── placeholders/
└── lib/
    ├── schema.ts               # Zod-Schemas für Forms
    ├── seo.ts                  # Meta-Generator
    └── i18n.ts
```

**Commit-Historie:** Mindestens 8 semantische Commits (feat/, chore/, fix/, docs/), damit der Code-Review nachvollziehbar ist.

**Am Ende:** Eine `HANDOVER.md` für den Kunden mit:
- Wie bearbeite ich Texte?
- Wie füge ich ein Testimonial hinzu?
- Wie aktualisiere ich Preise?
- Wie deploye ich auf Vercel?
- Liste aller `TODO_CLIENT`-Einträge mit Anleitung.

---

## 11. NICHT-ZIELE (WAS DU NICHT TUN SOLLST)

- ❌ Keine Animation-Overkills, keine Scroll-Hijacking-Effekte
- ❌ Kein generischer Stock-Content, keine KI-generierten Fake-Testimonials
- ❌ Keine Palmen/Strand-Karibik-Klischees
- ❌ Keine versteckten Kosten / Dark Patterns
- ❌ Kein Google Analytics ohne Consent
- ❌ Keine Erfindungen: wenn ein Fakt fehlt (Preis, Zeitraum, UID), setze `TODO_CLIENT` und mache den Platzhalter sichtbar
- ❌ Keine ungenehmigte Verwendung fremder Logos/Markenzeichen

---

## 12. START-KOMMANDO

> Lies dieses Dokument vollständig. Erstelle einen Umsetzungsplan (max. 15 Bullet-Points) in einem `PLAN.md`. Warte NICHT auf meine Freigabe — starte sofort mit dem Scaffold und arbeite alle Seiten sequenziell ab. Markiere jeden `TODO_CLIENT`-Punkt klar im Code UND in der `HANDOVER.md`. Am Ende: Deploy auf Vercel Preview und liefere mir die URL + einen Zusammenfassungs-Report mit Lighthouse-Scores.

**Go.**
