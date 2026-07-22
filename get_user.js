import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, query, where } from "firebase/firestore";
import fs from "fs";

// Lue config.ts tiedostosta credentials (yksinkertaistettu, tai kopioitu)
// Koska meillä on test-db.js jo olemassa
