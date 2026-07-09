// ============================================================
// RASALAPELI — MOCK DATA
// Firestore-yhteensopiva rakenne. Muokkaa tarinoita, kuvia ja
// koordinaatteja täällä. Myöhemmin siirrät tämän Firestoreen.
// ============================================================

// ERA = aikakauden visuaalinen teema
// 'historical' → seepia  (1935–1950)
// 'postwar'    → mustavalko (1950–1965)
// 'growth'     → lämmin 70-luku (1965–1985)
// 'modern'     → täysväri (1985→)
export type Era = 'historical' | 'postwar' | 'growth' | 'modern';

// ── TIMELINE ────────────────────────────────────────────────
export const timelineCollection = [
  {
    id: "birth-vikke",
    year: 1935,
    title: "Isä-Viken syntymä",
    era: "historical" as Era,
    location: "Ranua, Lappi",
    mapCoords: { lat: 65.98, lng: 26.53 }, // Ranua sijainti kartalla
    description: "Viljo 'Vikke' syntyi vuonna 1935 Ranualla, Lapissa. Pohjoisessa maailmassa, jossa arki oli kovaa mutta yhteisöllisyys luja. Hänen lapsuutensa muovasi miehen, joka myöhemmin rakentaisi kodin koko suurelle perheelleen.",
    image: null, // Lisää: "ranua_vikke_lapsuus.jpg"
  },
  {
    id: "birth-ella",
    year: 1941,
    title: "Äiti-Ellan syntymä",
    era: "historical" as Era,
    location: "Karelia",
    mapCoords: { lat: 61.05, lng: 28.18 },
    description: "Ella syntyi sota-aikana 1941. Maailma oli mullistuksessa, mutta elämä jatkui. Ellan lapsuus leimattiin sotavuosien arjella, joka kasvatti sitkeyttä ja yhteisöllisyyttä — ominaisuuksia, joita hän myöhemmin välitti kahdeksalle lapselleen.",
    image: null,
  },
  {
    id: "meeting",
    year: 1959,
    title: "Ellan ja Viken kohtaaminen",
    era: "postwar" as Era,
    location: "Lappeenranta",
    mapCoords: { lat: 61.05, lng: 28.18 },
    description: "Nuoret Ella ja Vikke kohtasivat ensimmäisen kerran. Rakkaus leimahti nopeasti ja syttyi pysyväksi. Heidän yhteinen tarinansa alkoi — tarina, josta kasvaisi kahdeksan lapsen suuri perhe.",
    image: null,
  },
  {
    id: "move-rasala",
    year: 1968,
    title: "Muutto Rasalaan",
    era: "growth" as Era,
    location: "Rasala, Lappeenranta",
    mapCoords: { lat: 61.07, lng: 28.12 },
    description: "Perhe muutti Rasalaan, Lappeenrantaan, isolle 3500m² tontille. Alkoi rakentaminen — ei vain talon, vaan kodin. Tupa valmistui lopullisesti Hessun ristiäisiin suuren remontin päätteeksi. Myös vanha navetta kuului pihapiiriin ja on monessa muistossa läsnä.",
    image: null,
  },
  {
    id: "grilli",
    year: 1977,
    title: "Isän muuraama grilli",
    era: "growth" as Era,
    location: "Rasala, kotitontti",
    mapCoords: { lat: 61.07, lng: 28.12 },
    description: "Isä muurasi kalliolle grillin Kotosen Pentin antamien neuvojen avulla, ja Ville toimi muuraustöissä apupoikana. Äiti ei pitänyt grillistä visuaalisesti — hän myöhemmin jopa inhosi sitä. Silti hän ei koskaan antanut purkaa sitä. Se oli yksi isän viimeisistä kädenjäljistä. Grillillä paistettiin makkaraa, ja yhtenä kesänä se toimi Heikin 'räksänpoikasten vankilana'.",
    image: null, // Lisää: "isan_grilli_1978.jpg"
    people: ["Vikke", "Ville", "Heikki"],
  },
  {
    id: "limsakori",
    year: 1978,
    title: "Juhannuksen limsakori",
    era: "growth" as Era,
    location: "Rasala / Matikaisen mökki",
    mapCoords: { lat: 61.07, lng: 28.12 },
    description: "Juhannukseen kuului olennaisesti 24 pullon limsakorin osto. Kori sisälsi Jaffaa, Asterixia ja Sittisuuta — ja jokainen lapsi sai tarkalleen kolme pulloa. Juhannusta vietettiin toisinaan myös Matikaisen mökillä ja Mustolan kanavan alueella, josta Emman soitto kuului aikoinaan Rasalaan asti.",
    image: null,
    people: ["kaikki lapset"],
  },
  {
    id: "yleisurheilukisat",
    year: 1980,
    title: "Yleisurheilukisat pihapiirissä",
    era: "growth" as Era,
    location: "Rasala, kotitontti",
    mapCoords: { lat: 61.07, lng: 28.12 },
    description: "Ville järjesti Rasalassa yleisurheilukilpailuja nuoremmille sisaruksille (Makesta Hannuun — Hessu ei ollut vielä mukana). Kisoihin osallistuivat joskus myös Heli ja Tiina. Make tunnettiin kestävyydestään (jaksoi juosta Lankisen Lempin mökille ja takaisin), Pepe leuanvedosta ja Saku Ilmanen siitä, että hän 'marisi eniten'. Tulokset kirjattiin Yleisurheilu Raketti -kirjan taulukoihin.",
    image: null,
    people: ["Ville", "Make", "Pepe", "Hannu", "Heikki", "Heli", "Tiina"],
  },
  {
    id: "sukukokous-2026",
    year: 2026,
    title: "Sukukokous — Koko Suku Koolla!",
    era: "modern" as Era,
    location: "Lappeenrannan Rauhanyhdistys",
    mapCoords: { lat: 61.05, lng: 28.18 },
    description: "25.7.2026 kokoontuu yli 100 suvun jäsentä yhteen. Tarjolla Katrin reseptin mukainen lohikeitto (60 litraa!), lastenlastenlapset kuuntelemassa tarinoita ja Villen valokuvaesitys vuosilta 1974–2014. Ellan ja Viken tarina jatkuu.",
    image: null,
  },
];

// ── KARTAN SIJAINNIT (RASALA-TOURNEE) ─────────────────────────
export const mapLocationsCollection = {
  village: [
    {
      id: "nevalaisen-monttu",
      title: "Nevalaisen monttu",
      era: "growth" as Era,
      description: "Lapsuuden tärkein paikka. Täällä käytiin uimassa, luistelemassa ja 'vähän pamauttelemassakin'. Monttu oli oma maailmansa, joka kutsui seikkailuun.",
      image: null,
      lat: 61.052,
      lng: 28.325,
      people: ["kaikki lapset"],
    },
    {
      id: "karhusjarvi",
      title: "Karhusjärvi",
      era: "growth" as Era,
      description: "Karhusjärvellä käytiin sekä uimassa että kalastamassa. Lähellä sijaitsi myös Kolmiomittaustorni, joka oli yleinen retkikohde koko perheelle.",
      image: null,
      lat: 61.050,
      lng: 28.300,
      people: [],
    },
    {
      id: "myyran-maki",
      title: "Myyrän mäki",
      era: "growth" as Era,
      description: "Tämä mäki jäi pysyvästi Pepen mieleen. Hän laski sen alas pyörällä täyttä vauhtia — ja törmäsi autoon. Onneksi kaikki päättyi hyvin, mutta muisto säilyi.",
      image: null,
      lat: 61.054,
      lng: 28.310,
      people: ["Pepe"],
    },
    {
      id: "romokallio",
      title: "Likurin mäki / Romokallio",
      era: "growth" as Era,
      description: "Perheen oma mökki sijaitsi Romokalliolla. Kallio kuvautuu pystysuorina jyrkänteinä ja lohkareina — seikkailijan unelmana. Suon oikeasta nimestä oli erimielisyyttä: Heimalan Hessun mukaan oikea nimi oli Likosuo, mistä juontui mäen nimi Likurin mäki.",
      image: null,
      lat: 61.045,
      lng: 28.340,
      people: [],
    },
    {
      id: "lipilaisen-kauppa",
      title: "Lipiäisen kauppa",
      era: "growth" as Era,
      description: "Lähikauppa, joka oli tärkeä arjen solmukohta. Tänne juostiin kauppareissuille.",
      image: null,
      lat: 61.060,
      lng: 28.300,
    },
    {
      id: "kotitontti",
      title: "Pajarilantie 388 (Kotitontti)",
      era: "growth" as Era,
      description: "Ellan ja Viken 3500m² kodin tontti Rasalassa. Tästä alkoi suvun juurtuminen Karjalaan. Klikkaa avataksesi pihakartan!",
      image: null,
      lat: 61.0515,
      lng: 28.3150,
      isHome: true,
    },
  ],
  yard: [
    {
      id: "paarakennus",
      title: "Päärakennus",
      era: "growth" as Era,
      description: "Täällä asui koko 10-henkinen perhe. Tupa valmistui lopullisesti Hessun ristiäisiin suuren remontin päätteeksi. Sydämenä toimi keittiö ja iso hella, jonka ympärillä arki pyöri.",
      image: null,
      x: 40,
      y: 40,
    },
    {
      id: "isan-grilli",
      title: "Isän grilli",
      era: "growth" as Era,
      description: "Isä muurasi grillin 1975–79 Kotosen Pentin neuvoilla, Ville apupoikana. Äiti inhosi sitä visuaalisesti — mutta ei koskaan antanut purkaa. Se oli isän viimeinen kädenjälki. Yhtenä kesänä grilli toimi Heikin 'räksänpoikasten vankilana'.",
      image: null,
      x: 70,
      y: 55,
      people: ["Vikke", "Ville", "Heikki"],
    },
    {
      id: "vanha-vene-kallio",
      title: "Vanha laho vene / Kallio",
      era: "growth" as Era,
      description: "Kalliolla sijaitsi vanha, laho vene, joka toimi lasten leikkipaikkana. Hannu ja Veijo sotkivat sitä ja ympäristöä pikkumökistä löydetyillä Matikaisten vanhoilla maaleilla — mistä äiti ei pitänyt yhtään.",
      image: null,
      x: 20,
      y: 30,
      people: ["Hannu", "Veijo"],
    },
    {
      id: "pikkumokki",
      title: "Pikkumökki",
      era: "growth" as Era,
      description: "Pikkumökissä säilytettiin vanhoja romuja ja maaleja. Pojat toimivat siellä 'muurarimestareina' — Make aloitti savupiipun muuraamisen, joka ei koskaan edennyt katon läpi asti. Maken puulistoista saatiin jalkapallomaali.",
      image: null,
      x: 25,
      y: 70,
      people: ["Make", "pojat"],
    },
    {
      id: "viljelypalsta",
      title: "Viljelypalsta & Vuohet",
      era: "growth" as Era,
      description: "Rasalassa elettiin osittain omavaraisesti. Sipulintalkoot, perunanlaitto, vuohet — arki oli täynnä töitä. Hessu oli tunnettu siitä, että hän teki hommia (harvoin tosin) ne vaatteet päällä mitkä sattui olemaan — eli pyhävaatteet.",
      image: null,
      x: 80,
      y: 75,
      people: ["Hessu", "kaikki"],
    },
    {
      id: "vanha-navetta",
      title: "Vanha navetta",
      era: "growth" as Era,
      description: "Ennen suurta remonttia pihassa oli vanha navetta, joka nousee muistoissa esiin. Se oli osa Rasalan alkuperäistä pihapiiriä ja merkittävä osa lapsuuden maisemaa.",
      image: null,
      x: 55,
      y: 80,
    },
  ],
};

// ── SALAPOLIISIPELI ─────────────────────────────────────────
export const quizCollection = [
  {
    id: 1,
    question: "Minä vuonna isä-Vikke syntyi?",
    hint: "Katso Aikamatka-osiosta ensimmäinen tapahtuma.",
    options: ["1931", "1935", "1941", "1945"],
    correctAnswer: "1935",
  },
  {
    id: 2,
    question: "Kuinka monta pulloa oli juhannuksen limsakorissa?",
    hint: "Jokainen kahdeksasta lapsesta sai tarkalleen kolme pulloa.",
    options: ["16", "20", "24", "30"],
    correctAnswer: "24",
  },
  {
    id: 3,
    question: "Mikä paikka oli lasten tärkein uimapaikka?",
    hint: "Katso Rasalan kylän karttaa.",
    options: ["Karhusjärvi", "Nevalaisen monttu", "Mustolan lammet", "Romokallio"],
    correctAnswer: "Nevalaisen monttu",
  },
  {
    id: 4,
    question: "Kuka laski Myyrän mäen alas pyörällä ja törmäsi autoon?",
    hint: "Hän oli tunnettu myös leuanvedostaan kilpailuissa.",
    options: ["Make", "Hannu", "Ville", "Pepe"],
    correctAnswer: "Pepe",
  },
  {
    id: 5,
    question: "Miksi äiti ei antanut purkaa rumaa grillilläkin?",
    hint: "Mieti, kuka grillin muurasi ja mitä hänelle tapahtui.",
    options: [
      "Se oli liian suuri purkaa",
      "Se oli isän viimeinen kädenjälki",
      "Äiti piti siitä salaa",
      "Kaupunki ei antanut lupaa",
    ],
    correctAnswer: "Se oli isän viimeinen kädenjälki",
  },
  {
    id: 6,
    question: "Kuinka monta lasta Ellalla ja Vikellä oli?",
    hint: "Katso Aikamatkan Suurperhe-kohtaa.",
    options: ["5", "6", "7", "8"],
    correctAnswer: "8",
  },
  {
    id: 7,
    question: "Mitä limppareja juhannuksen limsakorissa oli?",
    hint: "Kolme eri merkkiä, kaikki tunnettuja.",
    options: [
      "Cola, Fanta, Sprite",
      "Jaffa, Asterix, Sittisuuta",
      "Pommac, Tonic, Jaffa",
      "Zingo, Pommac, Cola",
    ],
    correctAnswer: "Jaffa, Asterix, Sittisuuta",
  },
  {
    id: 8,
    question: "Milloin Rasalan sukukokous järjestetään?",
    hint: "Katso etusivun tapahtumakorttia.",
    options: ["5.7.2026", "25.7.2026", "5.8.2026", "25.8.2026"],
    correctAnswer: "25.7.2026",
  },
];

// ── SUKUKOKOUS ───────────────────────────────────────────────
export const reunionData = {
  date: "Lauantai 25.7.2026",
  venue: "Lappeenrannan Rauhanyhdistys (ry)",
  guestCount: "100+",
  budget: "n. 650–750 €",
  costPerFamily: "n. 100 € / sisarus",
  food: [
    {
      meal: "Lounas",
      description: "Katrin reseptin mukainen lohikeitto",
      details: "60 litraa keittoa • 12 kg lohta • 20 kg perunaa",
      icon: "🍲",
    },
    {
      meal: "Päiväkahvit",
      description: "Kahvi + hedelmät",
      details: "Nuoriso tuo nyyttärinä herkut, makeat leivonnaiset kotitekoisia",
      icon: "☕",
    },
    {
      meal: "Alkuilta",
      description: "Salaatti ja juustosarvia",
      icon: "🥗",
    },
  ],
  responsibilities: [
    { name: "Hannu & Helena", role: "Pääkoordinaattorit", icon: "🎯" },
    { name: "Make & Heikki", role: "Juontajat", icon: "🎤" },
    { name: "Pepe & Hannu", role: "Aktiviteetit", icon: "🎮" },
    { name: "Outi", role: "Majoitusjärjestelyt", icon: "🏨" },
    { name: "Tiina", role: "Ruokavuorolistat", icon: "📋" },
    { name: "Ville", role: "Valokuvaesitys 1974–2014", icon: "📸" },
  ],
  grandchildrenWishes: [
    "Suvun historia ja juuret — erityisesti Viken lapsuus Ranualla",
    "Ellan ja Viken nuoruustarinat",
    "Hauskoja 'tappauksia' Rasalasta — paljon!",
    "Sisarusten lapsuusmuistot",
    "Lastenlasten omat muistot isovanhemmistaan",
    "Moottoripyörät 🏍️",
    "Sisarusten nykyhetki ja fiilis",
  ],
};
