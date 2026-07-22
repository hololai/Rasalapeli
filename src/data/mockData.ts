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
    question: "Kuka sotki kalliolla olleen vanhan veneen ja sen ympäristön Matikaisten vanhoilla maaleilla?",
    hint: "Kaksi poikaa, joista toinen myöhemmin rakensi pihalle muun muassa jalkapallomaalin.",
    options: ["Make ja Pepe", "Hannu ja Veijo", "Ville ja Hessu", "Heli ja Tiina"],
    correctAnswer: "Hannu ja Veijo",
  },
  {
    id: 2,
    question: "Miksi äiti ei antanut purkaa kalliolla olevaa, isän muuraamaa grilliä?",
    hint: "Vaikka hän ei pitänyt sen ulkonäöstä, syy liittyi isään.",
    options: ["Koska siinä paistettiin kylän parhaat makkarat", "Koska Heikki käytti sitä lintujen vankilana", "Se oli yksi isän viimeisistä kädenjäljistä", "Koska grillin purkaminen olisi ollut liian raskasta"],
    correctAnswer: "Se oli yksi isän viimeisistä kädenjäljistä",
  },
  {
    id: 3,
    question: "Mitä pojat rakensivat pikkumökin läheisyydessä Maken puulistoista?",
    hint: "Urheiluun liittyvä rakennelma, jossa piti osua kohteeseen.",
    options: ["Kiipeilytelineen", "Jalkapallomaalin", "Hienon savupiipun", "Uuden saunan oven"],
    correctAnswer: "Jalkapallomaalin",
  },
  {
    id: 4,
    question: "Millaisissa vaatteissa Hessulla oli tapana tehdä pihatöitä, kuten potunlaittoa?",
    hint: "Ei mitkään tyypilliset likavaatteet.",
    options: ["Vanhoissa verkkareissa", "Likaisissa työhaalareissa", "Sadevaatteissa", "Pyhävaatteissa"],
    correctAnswer: "Pyhävaatteissa",
  },
  {
    id: 5,
    question: "Mikä oli Heimalan Hessun mukaan Romosuon oikea nimi?",
    hint: "Tästä tuli myös nimi Likurin mäelle.",
    options: ["Likosuo", "Kosteasuo", "Mustasuo", "Rapakko"],
    correctAnswer: "Likosuo",
  },
  {
    id: 6,
    question: "Mitä Pepe teki Myyrän mäessä, mistä paikka jäi pysyvästi hänen mieleensä?",
    hint: "Vauhti taisi olla liian kova, ja edessä oli este.",
    options: ["Löysi ison aarteen", "Rakensi sinne salaisen majan", "Laski pyörällä alas ja törmäsi autoon", "Voitti siellä juoksukilpailun"],
    correctAnswer: "Laski pyörällä alas ja törmäsi autoon",
  },
  {
    id: 7,
    question: "Mitä kaikkea Nevalaisen montulla tehtiin?",
    hint: "Vesi, jää ja ehkä vähän jotain räjähtävää.",
    options: ["Käytiin uimassa, luistelemassa ja vähän pamauttelemassa", "Vain kalastettiin ja ongittiin", "Poimittiin marjoja ja sieniä", "Muurattiin palomuuria"],
    correctAnswer: "Käytiin uimassa, luistelemassa ja vähän pamauttelemassa",
  },
  {
    id: 8,
    question: "Mikä tärkeä perinne kuului Rasalan perheen juhannuksen viettoon?",
    hint: "Sisälsi muun muassa Jaffaa, Asterixia ja Sittisuutaa.",
    options: ["Jättimäinen juhannuskokko Romokalliolla", "24 pullon limsakori", "Yöuinti Karhusjärvellä", "Telttaretki Kolmiomittaustornille"],
    correctAnswer: "24 pullon limsakori",
  },
  {
    id: 9,
    question: "Kuka tunnettiin Rasalan yleisurheilukisoissa kovasta kestävyydestään?",
    hint: "Hän jaksoi juosta Lankisen Lempin mökille ja takaisin.",
    options: ["Ville", "Saku", "Pepe", "Make"],
    correctAnswer: "Make",
  },
  {
    id: 10,
    question: "Mihin kirjaan Villen järjestämien yleisurheilukisojen tulokset kirjattiin ylös?",
    hint: "Kirjan nimi viittasi vauhtiin ja lajiin.",
    options: ["Yleisurheilu Raketti -kirjaan", "Suureen urheilukirjaan", "Koulun ruutuvihkoon", "Mustolan satamakirjaan"],
    correctAnswer: "Yleisurheilu Raketti -kirjaan",
  },
  {
    id: 11,
    question: "Mihin kulkuneuvoon Heikki (Hessu) kiinnitti ison pyydystämänsä hauen polkiessaan kotiin kädet veressä ja \"naama messingillä\"?",
    hint: "Kaksipyöräinen kulkuväline.",
    options: ["Keltaiseen potkulautaan", "Vihreään Jopoon", "Punaiseen traktoriin", "Naapurin mopoon"],
    correctAnswer: "Vihreään Jopoon",
  },
  {
    id: 12,
    question: "Kuka veljeksistä jaksoi vetää kaikista eniten leukoja Rasalan yleisurheilukisoissa?",
    hint: "Ei Make, eikä Hannu, eikä Ville.",
    options: ["Pepe", "Make", "Hannu", "Ville"],
    correctAnswer: "Pepe",
  },
  {
    id: 13,
    question: "Minkä tärkeän rakennelman pojat yrittivät muurata Rasalan pikkumökkiin?",
    hint: "Vinkki: liittyy tuleen ja savuun.",
    options: ["Ison pizzauunin", "Saunan kiukaan", "Piipun ja palomuurin", "Koirankopin"],
    correctAnswer: "Piipun ja palomuurin",
  },
  {
    id: 14,
    question: "Minkä eläimen mukaan oli nimetty mäki, jota Pepe laski alas pyörällä niin kovaa, että törmäsi autoon?",
    hint: "Pieni kaivautuva eläin.",
    options: ["Karhun", "Ketun", "Sammakon", "Myyrän"],
    correctAnswer: "Myyrän",
  },
  {
    id: 15,
    question: "Mikä Rasalan iso tupa oli alun perin, ennen kuin siitä tehtiin koti?",
    hint: "Liittyy isoihin ajoneuvoihin.",
    options: ["Valtava kanala", "Kuorma-autotalli", "Vanha kyläkoulu", "Salainen karkkitehdas"],
    correctAnswer: "Kuorma-autotalli"
  },
  {
    id: 16,
    question: "Millainen hurja ja erikoinen henkilö asui kerran Rasalan naapurissa?",
    hint: "Laiton ammatti.",
    options: ["Sirkuspelle", "Salainen agentti", "Taikuri", "Pankkiryöstäjä"],
    correctAnswer: "Pankkiryöstäjä"
  },
  {
    id: 17,
    question: "Mikä oli Rasalassa asuneen ison vuohipukin nimi?",
    hint: "Miehen etunimi.",
    options: ["Mauri", "Teuvo", "Kyösti", "Jorma"],
    correctAnswer: "Teuvo"
  },
  {
    id: 18,
    question: "Mikä on Vikke-papan oikea, kokonainen etunimi?",
    hint: "Kaksi nimeä, jotka alkavat V:llä ja A:lla.",
    options: ["Veikko Antero", "Vilho Armas", "Vihtori Akseli", "Väinö Allan"],
    correctAnswer: "Vihtori Akseli"
  },
  {
    id: 19,
    question: "Mikä on Ella-mummun oikea, kokonainen etunimi?",
    hint: "Toinen nimi on yleinen suomalainen I-kirjaimella alkava nimi.",
    options: ["Ella Inkeri", "Ella Anneli", "Ella Maria", "Ella Kaarina"],
    correctAnswer: "Ella Inkeri"
  },
  {
    id: 20,
    question: "Mikä oli Ella-mummun tyttönimi eli sukunimi silloin, kun hänet kastettiin vauvana?",
    hint: "Alkaa R-kirjaimella.",
    options: ["Laivamaa", "Korhonen", "Romppainen", "Illikainen"],
    correctAnswer: "Romppainen"
  }
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
