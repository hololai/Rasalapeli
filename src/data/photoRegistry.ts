// ============================================================
// CSV-POHJA KUVAHALLINNAN HELPOTTAMISEKSI
// Täytä tämä taulukko ennen sukukokousta 5.7. ja 25.7.
// Skripti muuntaa tämän automaattisesti mockData.ts:ksi.
// ============================================================
//
// OHJEET:
//  1. Kopioi tiedostonimet kuvistasi alla olevaan taulukkoon
//  2. Täytä year, location, people, story ja era
//  3. Tallenna tiedosto ja anna minulle se → teen mockData.ts automaattisesti
//
// ERA-arvot:
//  historical = 1935-1950 (seepia-teema)
//  postwar    = 1950-1965 (mustavalkoinen)
//  growth     = 1965-1985 (70-luvun tunnelma, Rasala)
//  modern     = 1985→     (täysvärinen, nykypäivä)

const photos: any[] = [
  // TÄYTÄ TÄHÄN — Yksi rivi per kuva
  // {
  //   filename: "ranua_vikke_1935.jpg",
  //   year: 1935,
  //   era: "historical",
  //   location: "Ranua",
  //   people: ["Vikke"],
  //   story: "Viken lapsuudenkoti Ranualla.",
  //   mapPin: null,         // tai "isan-grilli" jos kuva liittyy karttapinniin
  // },

  // ESIMERKKEJÄ — Poista kommenttimerkit kun lisäät kuvan
  // { filename: "grilli_1978.jpg", year: 1978, era: "growth", location: "Rasala", people: ["Vikke","Ville"], story: "Isä muuraa grillilläkin Ville apunaan.", mapPin: "isan-grilli" },
  // { filename: "limsakori_juhannus.jpg", year: 1978, era: "growth", location: "Rasala", people: ["kaikki lapset"], story: "24 pulloa! Jaffa, Asterix, Sittisuuta.", mapPin: null },
  // { filename: "nevalainen_uinti.jpg", year: 1975, era: "growth", location: "Nevalaisen monttu", people: ["lapset"], story: "Kesäinen uintireissu.", mapPin: "nevalaisen-monttu" },
  // { filename: "yleisurheilukisat.jpg", year: 1980, era: "growth", location: "Rasala", people: ["Ville","Make","Pepe","Hannu"], story: "Yleisurheilukisat pihapiirissä.", mapPin: null },
];

// Vientimuoto Firestoreen myöhemmin:
// photos.forEach(p => db.collection('photos').add(p));

export default photos;
