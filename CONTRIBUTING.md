# Doprinos projektu

Hvala vam što razmišljate o doprinosu projektu Potrošni Materijal! 

## 🚀 Kako doprineti

### 1. Fork repository

Kliknite na "Fork" dugme u gornjem desnom uglu GitHub stranice.

### 2. Klonirajte svoj fork

```bash
git clone https://github.com/your-username/potrosni-materijal.git
cd potrosni-materijal
```

### 3. Kreirajte feature branch

```bash
git checkout -b feature/your-feature-name
```

### 4. Napravite izmene

- **Kod**: Dodajte nove funkcionalnosti ili popravite bugove
- **Dokumentacija**: Poboljšajte README ili dodajte komentare
- **Testovi**: Dodajte testove za nove funkcionalnosti

### 5. Commit izmene

```bash
git add .
git commit -m "Add: opis vaše izmene"
```

### 6. Push na GitHub

```bash
git push origin feature/your-feature-name
```

### 7. Kreirajte Pull Request

Idite na GitHub i kliknite "New Pull Request".

## 📋 Pravila za kod

### Struktura koda

- **Koristite camelCase** za JavaScript varijable
- **Koristite PascalCase** za React komponente
- **Dodajte komentare** za složene logike
- **Koristite semantička imena** za funkcije i varijable

### React konvencije

```javascript
// ✅ Dobro
const MaterialCard = ({ material, onEdit }) => {
  return (
    <div className="material-card">
      <h3>{material.name}</h3>
      <button onClick={() => onEdit(material.id)}>
        Edit
      </button>
    </div>
  );
};

// ❌ Loše
const mc = (props) => {
  return <div><h3>{props.m.name}</h3></div>;
};
```

### CSS/Styling

- **Koristite inline styles** za dinamičke stilove
- **Koristite CSS klase** za statičke stilove
- **Koristite Lucide ikone** umesto emoji-ja

## 🐛 Prijavljivanje bugova

### Kada prijaviti bug

- Aplikacija se krahira
- Funkcionalnost ne radi kako treba
- UI se ne prikazuje ispravno
- Performance problemi

### Kako prijaviti bug

1. **Opišite problem** - Šta se dešava?
2. **Koraci za reprodukciju** - Kako da reprodukujem problem?
3. **Očekivano ponašanje** - Šta bi trebalo da se desi?
4. **Screenshots** - Ako je moguće
5. **Sistem informacije** - macOS verzija, Node.js verzija

### Template za bug report

```markdown
## Bug Report

**Opis problema:**
[Kratak opis problema]

**Koraci za reprodukciju:**
1. Idite na '...'
2. Kliknite na '...'
3. Vidite grešku

**Očekivano ponašanje:**
[Šta bi trebalo da se desi]

**Screenshots:**
[Ako je moguće, dodajte screenshot]

**Sistem:**
- macOS: [verzija]
- Node.js: [verzija]
- Aplikacija: [verzija]
```

## ✨ Predlaganje novih funkcionalnosti

### Kako predložiti feature

1. **Proverite postojeće issues** - Možda je već predloženo
2. **Kreirajte novi issue** sa labelom "enhancement"
3. **Opišite funkcionalnost** - Šta želite da se doda?
4. **Objasnite korist** - Zašto bi ovo bilo korisno?

### Template za feature request

```markdown
## Feature Request

**Funkcionalnost:**
[Opis funkcionalnosti]

**Problem koji rešava:**
[Zašto je ovo potrebno?]

**Predlog rešenja:**
[Kako bi to trebalo da radi?]

**Alternativna rešenja:**
[Ostale opcije koje ste razmotrili]
```

## 🧪 Testiranje

### Lokalno testiranje

```bash
# Pokrenite aplikaciju
./build-complete-app.sh

# Testirajte funkcionalnosti
# - Dodavanje materijala
# - Zaduživanje radnika
# - Dashboard pregled
# - Kalendar
# - Izvoz podataka
```

### Checklist za testiranje

- [ ] Aplikacija se pokreće bez grešaka
- [ ] Backend server se automatski pokreće
- [ ] Sve tabovi rade
- [ ] Dodavanje materijala radi
- [ ] Zaduživanje radnika radi
- [ ] Dashboard prikazuje zaduženja
- [ ] Kalendar prikazuje datume
- [ ] Izvoz podataka radi
- [ ] Admin panel radi

## 📝 Dokumentacija

### Kada ažurirati dokumentaciju

- Dodavanje novih funkcionalnosti
- Promena postojećih funkcionalnosti
- Ispravka grešaka u dokumentaciji
- Dodavanje novih instrukcija

### Tipovi dokumentacije

- **README.md** - Glavna dokumentacija
- **INSTALL.md** - Instrukcije za instalaciju
- **CONTRIBUTING.md** - Ovaj fajl
- **Komentari u kodu** - Inline dokumentacija

## 🏷️ Labeling

### Labels za issues

- **bug** - Greška u kodu
- **enhancement** - Nova funkcionalnost
- **documentation** - Dokumentacija
- **question** - Pitanje
- **help wanted** - Potrebna pomoć
- **good first issue** - Dobro za početnike

### Labels za PRs

- **ready for review** - Spreman za pregled
- **work in progress** - U toku
- **needs testing** - Potrebno testiranje
- **breaking change** - Ruši postojeću funkcionalnost

## 🤝 Code Review

### Kada review-ovati kod

- **Funkcionalnost** - Da li radi kako treba?
- **Kvalitet koda** - Da li je čist i čitljiv?
- **Performance** - Da li je efikasno?
- **Bezbednost** - Da li ima sigurnosnih problema?

### Kako review-ovati

1. **Proverite funkcionalnost** - Testirajte izmene
2. **Proverite kod** - Da li je čist i čitljiv?
3. **Ostavite komentare** - Konstruktivni feedback
4. **Approve ili request changes** - Na kraju

## 📞 Komunikacija

### Gde komunicirati

- **GitHub Issues** - Za bugove i feature requests
- **GitHub Discussions** - Za opšta pitanja
- **Pull Request komentari** - Za code review

### Pravila komunikacije

- **Budi poštovan** - Konstruktivni komentari
- **Budi jasan** - Jasno objašnjavaj
- **Budi strpljiv** - Odgovori mogu doći sa zakašnjenjem

## 🎯 Roadmap

### Kratkoročni ciljevi

- [ ] Poboljšanje UI/UX
- [ ] Dodavanje novih funkcionalnosti
- [ ] Optimizacija performance-a
- [ ] Poboljšanje dokumentacije

### Dugoročni ciljevi

- [ ] Podrška za Windows
- [ ] Cloud sync
- [ ] Mobile aplikacija
- [ ] API za integracije

---

**Hvala vam na doprinosu! 🎉**
