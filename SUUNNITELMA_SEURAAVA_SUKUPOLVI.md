# Arkkitehtuurisuunnitelma: Seuraavan sukupolven perheet, Yksityisyys & Hallintapaneeli

Tämä on kokonaisvaltainen arkkitehtuurisuunnitelma Rasalan Kuvapankin jatkokehitykselle. Suunnitelmaan on integroitu seuraavan sukupolven perhekuvien hallinta, tiukkarajainen yksityisyyssuoja, tietokantakustannusten minimointi sekä **hallintapaneelin ja käyttäjähallinnan uudistukset**.

Muutokset on luokiteltu vaadittavan työmäärän ja arkkitehtuurisen laajuuden mukaan:
- 🟢 **[Pieni muutos]** (Nopea toteuttaa, vähän riskejä, suuri hyöty)
- 🟡 **[Keskisuuri muutos]** (Vaatii uutta logiikkaa, käyttöliittymäkomponentteja tai tietokantasääntöjä)
- 🔴 **[Valtava muutos]** (Merkittävä arkkitehtuurinen remontti ja roolihierarkia)

---

## 1. Käyttöoikeudet, Yksityisyys ja Perhehaarat

Jotta jokainen perhe voi hallita ja katsella vain omia tai yhteisiä kuviaan, luodaan kolmitasoinen tietosuoja:

### 1.1 Kuvan näkyvyystaso (Image Visibility Metadata)
- **Kirjaustapa:** 🟢 **[Pieni muutos]**
- **Logiikka:** Jokaiselle kuvalle määritellään tietokannassa näkyvyys: `public` (yhteinen sukukuva, jonka kaikki näkevät) tai `restricted` + `branch: "heikin_perhe"` (yksityinen kuva, jonka vain kyseisen perhehaaran jäsenet näkevät).

### 1.2 Käyttäjien perhehaarakartta (User Profile Mapping)
- **Kirjaustapa:** 🟡 **[Keskisuuri muutos]**
- **Logiikka:** Luodaan Firestoreen `users`-kokoelma, johon tallennetaan tieto siitä, kuka käyttäjä kuuluu mihinkin perheeseen (esim. `allowedBranches: ["heikin_perhe"]`).

### 1.3 Tietokannan turvasäännöt (Firestore Security Rules)
- **Kirjaustapa:** 🟡 **[Keskisuuri muutos]** *(Pääsyhallinnan ydin!)*
- **Logiikka:** Kirjoitetaan Firebasen palvelimelle turvasäännöt, jotka estävät luvattomien kuvien lataamisen rajapinnasta, vaikka joku yrittäisi ohittaa käyttöliittymän selaimen kehitystyökaluilla.

---

## 2. Hallintapaneelin kehitys & Perheiden hallinta (UUSI KOKONAISUUS)

Koska suvussa on kymmeniä tai satoja jäseniä, pääylläpitäjän (Super Admin) työtaakkaa kevennetään ja hallintatyökalut tuodaan nykypäivään:

### 2.1 Perhehaarojen ja sukujen hallinta (Branch Management UI)
- **Kirjaustapa:** 🟡 **[Keskisuuri muutos]**
- **Logiikka:** Hallintapaneeliin (`AdminPanel.tsx`) lisätään uusi "Perhehaarat ja Suvut" -välilehti. 
- **Toiminnallisuus:** 
  - Ylläpitäjä voi luoda uusia perhehaaroja (esim. *"Matin ja Leenan lapset"*, *"Villen perhe"*).
  - Käyttäjiä voidaan raahata tai liittää valikosta oikeisiin perhehaaroihin.
  - Perhehaaroille voidaan määrittää kuvauksia tai oletustageja.

### 2.2 Perheen omat vetäjät / Aliylläpitäjät (Delegated Family Admin)
- **Kirjaustapa:** 🔴 **[Valtava muutos]**
- **Logiikka:** Luodaan roolihierarkia: **Pääylläpitäjä (Super Admin)** vs **Perheen vetäjä (Branch Admin)**.
- **Toiminnallisuus:** Sen sijaan että yksi ihminen hallinnoi koko 100 hengen sukua, jokaiselle perhehaaralle voidaan nimetä oma vastuuhenkilö. Perheen vetäjä näkee hallintapaneelista vain oman perheensä jäsenet ja kuvat: hän voi hyväksyä uusia perheenjäseniä, muokata perheensä kuvia ja poistaa virheelisiä latauksia.

### 2.3 Salasanan nollaus ja käyttäjätuki hallintapaneelista (Password Reset Tools)
- **Kirjaustapa:** 🟢 **[Pieni muutos]**
- **Ongelma:** Joskus sukulainen (tai ylläpitäjä itse) unohtaa salasanansa tai kohtaa teknisiä ongelmia mobiilikirjautumisessa, eikä osaa käyttää kirjautumisruudun palautuslinkkiä.
- **Ratkaisu:** Lisätään hallintapaneelin käyttäjälistaan jokaisen käyttäjän kohdalle napakymppi-painike: **"Lähetä salasanan palautuslinkki"**.
- **Toteutus:** Painike kutsuu suoraan Firebasen valmista `sendPasswordResetEmail(auth, email)` -funktiota. Ylläpitäjä voi yhdellä klikkauksella lähettää turvallisen nollauslinkin suoraan sukulaisen sähköpostiin. Lisäksi Admin voi samalta välilehdeltä päivittää omat kirjautumistietonsa turvallisesti.

---

## 3. Vaikutus tietokantahakuihin ja kustannuksiin

### 3.1 Kohdennetut haut (Mandatory `where` queries)
- **Kirjaustapa:** 🟡 **[Keskisuuri muutos]**
- **Logiikka:** Koska turvasäännöt kieltävät koko tietokannan raakahaut, ohjelman on haettava erikseen yhteiset kuvat (`where("visibility", "==", "public")`) ja oman perheen kuvat (`where("branch", "==", omaPerhe)`). **Tämä laskee Firestore-lukukerrat ja laskun automaattisesti murto-osaan**, koska lataamme vain murto-osan kannasta!

### 3.2 Globaali istuntomuisti (Session State / Cache)
- **Kirjaustapa:** 🟢 **[Pieni muutos]**
- **Logiikka:** Siirretään haetut kuvat sovelluksen ylätason muistiin. Valikoissa seilaaminen maksaa **0 ylimääräistä lukukertaa**, koska kuvia ei ladata uudelleen selaimen muistista katseltaessa.

### 3.3 Sivutus ja ääretön vieritys (Infinite Scroll)
- **Kirjaustapa:** 🔴 **[Valtava muutos]**
- **Logiikka:** Kun kuvamäärä kasvaa tuhatluvuille, kohdennettuunkin hakuun lisätään sivutus: ladataan ensin 30 kuvaa ja vierityksen myötä haetaan seuraavat 30 (`startAfter`).

---

## 4. Kaistanleveyden optimointi (Egress)

### 4.1 Pienoiskuva-arkkitehtuuri (Thumbnails)
- **Kirjaustapa:** 🟡 **[Keskisuuri muutos]**
- **Logiikka:** Luodaan uusia kuvia ladattaessa automaattisesti 300px pienoiskuva (`thumbUrl`) ruudukkoa varten ja 1920px kuva (`url`) katselua varten. Säästää 90 % mobiilidatasta.

### 4.2 Selainvälimuistin pakotus (Cache-Control)
- **Kirjaustapa:** 🟢 **[Pieni muutos]**
- **Logiikka:** Asetetaan kuville pitkä vanhenemisaika Storageen (`max-age=31536000`). Kerran ladattu kuva ei kuluta enää koskaan verkkodataa uudelleen.

---

## Suositeltu etenemisjärjestys (Marssijärjestys)

Kun hallintapaneeli ja salasanojen nollaus on mukana, loogisin toteutusjärjestys on seuraava:

1. **Vaihe 1: Nopeasti maaliin - Kustannukset & Käyttäjätuki (🟢 Pienet muutokset)**
   - Toteutetaan **Globaali istuntomuisti (3.2)**, **Cache-Control (4.2)** ja **Salasanan nollaus hallintapaneelista (2.3)**.
   - *Tulos:* Turhat tietokantahaut loppuvat heti, ja ylläpitäjä pystyy auttamaan salasanansa unohtaneita sukulaisia yhdellä klikkauksella.
2. **Vaihe 2: Yksityisyys, Perhehaarat ja Turvasäännöt (🟡 Keskisuuret muutokset)**
   - Rakennetaan hallintapaneelin **Perhehaarojen hallinta (2.1)** ja kytketään käyttäjille perheet.
   - Otetaan käyttöön **Kuvan näkyvyystaso (1.1)**, **Kohdennetut haut (3.1)** ja **Turvasäännöt (1.3)**.
   - *Tulos:* Seuraava sukupolvi voi ladata kuvia turvallisesti vain omalle perheelleen ja suodatus tapahtuu tehokkaasti Firebasessa.
3. **Vaihe 3: Suuren mittakaavan hierarkia ja skaalautuvuus (🟡 Keskisuuri & 🔴 Valtavat muutokset)**
   - Rakennetaan **Pienoiskuva-arkkitehtuuri (4.1)** uutta dataa varten.
   - Luodaan **Perheen omat vetäjät / Aliylläpitäjät (2.2)** ja lopulta **Ääretön vieritys (3.3)** silloin, kun arkiston koko alkaa vaatia sitä.
