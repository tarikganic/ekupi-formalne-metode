# eKupi.ba Automatizovani Testovi

## Seminarski rad iz predmeta: Formalne Metode

**Fakultet informacijskih tehnologija - Univerzitet "Džemal Bijedić"**

### Članovi grupe:

- Enida Baljić (IB250257)
- Ibrahim Hodžić (IB210082)
- Tarik Ganić (IB210116)

### Asistent:

mr. Ahmet Mulalić

---

## Opis projekta

Ovaj projekat sadrži automatizovane testove za web aplikaciju **eKupi.ba** korištenjem:

- **Selenium WebDriver** - za automatizaciju browser-a
- **JavaScript** - programski jezik
- **Mocha** - testing framework

## Struktura projekta

```
ekupi-tests/
├── helpers/
│   └── testSetup.js          # Zajednički setup/teardown modul
├── tests/
│   ├── TC01_pretragaProizvoda.spec.js
│   ├── TC02_filtriranjeRezultata.spec.js
│   ├── TC03_pregledDetaljaProizvoda.spec.js
│   ├── TC04_dodavanjeUKorpu.spec.js
│   ├── TC05_promjenaKolicineKorpa.spec.js      # BVA testovi
│   ├── TC06_uklanjanjeIzKorpe.spec.js
│   ├── TC07_prijavaKorisnika.spec.js
│   ├── TC08_azuriranjePodataka.spec.js
│   ├── TC09_povijestNarudzbi.spec.js
│   └── TC10_navigacijaKategorije.spec.js
├── screenshots/              # Screenshotovi grešaka
├── package.json
└── README.md
```
## Preduvjeti

1. **Node.js** (v16 ili novije)
2. **Google Chrome** browser
3. **ChromeDriver** (kompatibilan sa verzijom Chrome-a)

## Instalacija

```bash

# Instaliraj dependencies
npm install
```

## Pokretanje testova

```bash
# Pokreni sve testove
npm test

# Pokreni pojedinačni test
npm run test:tc01    # Pretraga proizvoda
npm run test:tc02    # Filtriranje
npm run test:tc03    # Detalji proizvoda
npm run test:tc04    # Dodavanje u korpu
npm run test:tc05    # BVA testovi količine
npm run test:tc06    # Uklanjanje iz korpe
npm run test:tc07    # Prijava
npm run test:tc08    # Azuriranje podataka
npm run test:tc09    # Povijest narudzbi
npm run test:tc10    # Navigacija
```

## Konfiguracijski podaci

Testni kredencijali (definirani u `helpers/testSetup.js`):

- Email: `visevaj332@icousd.com`
- Lozinka: `SRrGciwbfg8!tnx`

## Važne napomene

1. **Setup/Teardown**: Zajednički helper modul (`testSetup.js`) sadrži:

   - Inicijalizaciju WebDriver-a
   - Zatvaranje browser-a
   - Helper funkcije za čekanje elemenata
   - Funkcije za screenshot na grešku

2. **Asertacije**: Svaki test ima jasne `assert` provjere koje određuju prolaz/pad testa.

3. **Screenshot na grešku**: Pri svakoj grešci automatski se snima screenshot u `screenshots/` folder.

## Greške i problemi

Ako test ne prolazi, provjerite:

1. Da li je Chrome browser instaliran
2. Da li je ChromeDriver kompatibilan sa verzijom Chrome-a
3. Da li je eKupi.ba dostupan
4. Network connectivity

## Licenca

Ovaj projekat je kreiran isključivo u edukativne svrhe za potrebe seminarskog rada.
