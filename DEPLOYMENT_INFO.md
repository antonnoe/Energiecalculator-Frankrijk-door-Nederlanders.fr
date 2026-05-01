# Deployment Info - Consolidated HTML

## Overzicht
Dit repository bevat nu een enkele, standalone HTML file die de volledige Energie- & Kostencalculator Frankrijk bevat.

## Bestanden

### Hoofdbestand
- **index.html** (41KB, 534 regels)
  - Bevat alle CSS inline (70 regels)
  - Bevat alle JavaScript inline (441 regels)
  - Gebruikt React 18, React-DOM 18, en Babel via CDN
  - Gebruikt Google Fonts (Inter) voor typografie

### Backup Map
- **backup_oud/**
  - `README.txt` - Uitleg over de backup
  - `index.html` - Origineel HTML skelet (939 bytes)
  - `style.css` - Originele stylesheet (1.2KB)
  - `script.js` - Originele JavaScript (9.2KB, incompleet)

## Hoe te gebruiken

### Lokaal testen
Open `index.html` direct in een moderne browser (Chrome, Firefox, Safari, Edge).

### Deployment opties
1. **GitHub Pages**: Push naar main/master branch en activeer GitHub Pages
2. **Netlify**: Drag & drop de index.html
3. **Vercel**: Deploy de repository
4. **Eigen server**: Upload index.html naar webroot

## Technische details

### Dependencies (CDN)
- React 18 (development build)
- React-DOM 18 (development build)
- Babel Standalone (voor JSX transformatie)
- Google Fonts (Inter family)

### Browser vereisten
- Moderne browser met ES6+ support
- JavaScript moet ingeschakeld zijn
- Geen IE11 support

### Features
✅ Complete energie calculator voor Frankrijk
✅ Berekening van verwarmingskosten
✅ Warm water berekening
✅ Zonnepanelen calculator
✅ Apparaten verbruik
✅ PDF export functionaliteit
✅ Responsive design
✅ Tooltips en help teksten

## Changelog

### 2024-10-04
- Geconsolideerd naar single-file HTML
- Backup gemaakt van originele bestanden
- Complete calculator functionaliteit van fix-pdf-and-validation branch geïntegreerd

## Support
Voor vragen of problemen, open een issue in de GitHub repository.
