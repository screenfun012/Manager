# Aplikacija za Praćenje Potrošnog Materijala

Moderno web rešenje za upravljanje i praćenje potrošnog materijala, inspirisano Excel template-om "AVGUST RAZDUZENJE_novi template.xlsx".

## 🚀 Funkcionalnosti

- **Pregled Materijala**: Organizovano po kategorijama (POTROSNI MATERIJAL, ZASTITNA OPREMA, MESINGANE CETKE, HIGIJENA, AMBALAZA, ALAT)
- **Dnevno Praćenje**: Unos količina za svaki radni dan u mesecu
- **Excel Import/Export**: Učitavanje postojećih Excel fajlova i izvoz podataka
- **Dodavanje Novih Materijala**: Jednostavno dodavanje novih stavki u sistem
- **Automatski Kalkulacije**: Sumiranje po kategorijama i datumu
- **Responsive Design**: Moderna i intuitivna korisnička interfejs

## 🛠️ Tehnologije

- **Frontend**: React 18
- **Styling**: CSS3 sa modernim dizajnom
- **Excel Processing**: SheetJS (xlsx)
- **Icons**: Lucide React
- **Date Handling**: date-fns

## 📦 Instalacija

1. **Klonirajte repozitorijum**:
   ```bash
   git clone <repository-url>
   cd potrosni-materijal-app
   ```

2. **Instalirajte zavisnosti**:
   ```bash
   npm install
   ```

3. **Pokrenite aplikaciju**:
   ```bash
   npm start
   ```

4. **Otvorite u browseru**: `http://localhost:3000`

## 📊 Kako Koristiti

### 1. Pregled Materijala
- Aplikacija prikazuje sve materijale organizovane po kategorijama
- Svaki materijal ima kolone za svaki radni dan u mesecu
- Automatski se računaju ukupne količine po kategorijama

### 2. Unos Količina
- Kliknite na bilo koju ćeliju u tabeli za unos količine
- Unesite broj i pritisnite Enter ili kliknite na Save ikonu
- Količine se automatski sumiraju u UKUPNO kolonu

### 3. Dodavanje Novog Materijala
- Kliknite na "Dodaj Materijal" dugme
- Popunite formu sa kategorijom i nazivom
- Novi materijal se automatski dodaje u odgovarajuću kategoriju

### 4. Učitavanje Excel Fajla
- Prevucite Excel fajl u upload zonu ili kliknite za odabir
- Podržani formati: .xlsx, .xls
- Fajl se automatski obrađuje i podaci se učitavaju

### 5. Izvoz Podataka
- Kliknite na "Izvezi Excel" za preuzimanje trenutnih podataka
- Podaci se izvode u Excel format sa istom strukturom

## 🗂️ Struktura Podataka

Aplikacija koristi sledeću strukturu podataka:

```javascript
{
  id: 1,
  category: 'POTROSNI MATERIJAL',
  name: 'nitro razredjivac pentico',
  quantities: {
    '01.08.': 5,
    '04.08.': 6,
    '05.08.': 5,
    // ... ostali datumi
  },
  total: 16
}
```

## 📅 Datumi

- Aplikacija automatski generiše radne dane za izabrani mesec
- Vikendi se automatski preskaču
- Datumi se formatiraju kao "DD.MM." (npr. "01.08.")

## 🎨 Dizajn

- **Moderna UI/UX**: Gradient pozadine, senke, hover efekti
- **Responsive**: Prilagođava se različitim veličinama ekrana
- **Intuitivna navigacija**: Jasno označene akcije i dugmad
- **Konsistentan stil**: Jedinstveni dizajn kroz celu aplikaciju

## 🔧 Konfiguracija

### Promena Meseca/Godine
U `App.js` fajlu možete promeniti:
```javascript
const [selectedMonth, setSelectedMonth] = useState('08'); // 08 = Avgust
const [selectedYear, setSelectedYear] = useState('2024');
```

### Dodavanje Novih Kategorija
U `sampleCategories` nizu dodajte nove kategorije:
```javascript
const sampleCategories = [
  'POTROSNI MATERIJAL',
  'ZASTITNA OPREMA',
  'NOVA_KATEGORIJA', // Dodajte ovde
  // ...
];
```

## 📱 Responsive Design

Aplikacija je optimizovana za:
- **Desktop**: Puna funkcionalnost sa svim kolonama
- **Tablet**: Prilagođena tabela sa horizontalnim scroll-om
- **Mobile**: Vertikalni prikaz sa optimizovanim dugmadima

## 🚀 Deployment

Za produkciju:

```bash
npm run build
```

Build folder možete deployovati na bilo koji statički hosting servis.

## 🤝 Doprinosi

1. Fork repozitorijuma
2. Kreirajte feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit promene (`git commit -m 'Add some AmazingFeature'`)
4. Push na branch (`git push origin feature/AmazingFeature`)
5. Otvorite Pull Request

## 📄 Licenca

Ovaj projekat je otvorenog koda i dostupan pod MIT licencom.

## 📞 Podrška

Za pitanja ili probleme, otvorite issue na GitHub-u ili kontaktirajte development tim.

---

**Napomena**: Ova aplikacija je demo verzija namenjena testiranju i implementaciji novih funkcionalnosti.
