import { asset } from "@/lib/asset";

export type PhotoKind = "dispositivo" | "vettore" | "prova";

export type ArchivePhoto = {
  id: string;
  src: string;
  kind: PhotoKind;
  caption: string;
  credit: string;
};

/** Real public photographs, stored with the app. No cutaways, no interior drawings. */
export const PHOTOS: Record<string, ArchivePhoto> = {
  "little-boy": {
    id: "little-boy",
    src: "/media/little-boy.jpg",
    kind: "dispositivo",
    caption: "Little Boy a Tinian, agosto 1945. L'involucro esterno, prima dell'impiego.",
    credit: "Dominio pubblico. Manhattan Engineer District, NARA.",
  },
  "fat-man": {
    id: "fat-man",
    src: "/media/fat-man.jpg",
    kind: "dispositivo",
    caption: "Fat Man assemblato a Tinian, 1945.",
    credit: "Dominio pubblico. War Department, NARA.",
  },
  enola: {
    id: "enola",
    src: "/media/enola.jpg",
    kind: "vettore",
    caption: "Il B-29 Enola Gay con l'equipaggio. Vettore di Little Boy.",
    credit: "Dominio pubblico. US Army Air Forces.",
  },
  bockscar: {
    id: "bockscar",
    src: "/media/bockscar.jpg",
    kind: "vettore",
    caption: "Il B-29 Bockscar, vettore di Fat Man su Nagasaki.",
    credit: "Dominio pubblico. National Museum of the US Air Force.",
  },
  tower: {
    id: "tower",
    src: "/media/tower.jpg",
    kind: "prova",
    caption: "La torre di Trinity, alta 30 metri, nel deserto di Alamogordo.",
    credit: "Dominio pubblico. Governo degli Stati Uniti.",
  },
  mk17: {
    id: "mk17",
    src: "/media/mk17.jpg",
    kind: "dispositivo",
    caption: "Mk-17, una delle prime bombe termonucleari di arsenale. Ingombro esterno.",
    credit: "Dominio pubblico. Governo degli Stati Uniti.",
  },
  b61: {
    id: "b61",
    src: "/media/b61.jpg",
    kind: "dispositivo",
    caption: "B61, involucro esterno. È ancora la bomba aerea americana di riferimento.",
    credit: "Dominio pubblico. Dipartimento dell'Energia USA.",
  },
  b83: {
    id: "b83",
    src: "/media/b83.jpg",
    kind: "dispositivo",
    caption: "B83, la bomba strategica americana di maggiore potenza ancora in inventario. Esterno.",
    credit: "Dominio pubblico. Governo degli Stati Uniti.",
  },
  b28: {
    id: "b28",
    src: "/media/b28.jpg",
    kind: "dispositivo",
    caption: "B28 esposta, involucro. Ne esistettero molte versioni: tattica, strategica, di penetrazione.",
    credit: "CC BY 3.0. byteboy, via Wikimedia Commons.",
  },
  mk39: {
    id: "mk39",
    src: "/media/mk39.jpg",
    kind: "dispositivo",
    caption: "B39, bomba strategica degli anni Cinquanta. Esterno.",
    credit: "Dominio pubblico. National Museum of the US Air Force.",
  },
  davy: {
    id: "davy",
    src: "/media/davy.jpg",
    kind: "dispositivo",
    caption: "Davy Crockett al museo di Albuquerque: il lanciatore e il proiettile W54, visti da fuori.",
    credit: "CC BY-SA 3.0. Grendelkhan, via Wikimedia Commons.",
  },
  b52: {
    id: "b52",
    src: "/media/b52.jpg",
    kind: "vettore",
    caption: "B-52H Stratofortress. Per decenni il vettore delle bombe strategiche americane e dei missili da crociera.",
    credit: "Dominio pubblico. US Air Force.",
  },
  minuteman: {
    id: "minuteman",
    src: "/media/minuteman.jpg",
    kind: "vettore",
    caption: "Lancio di prova di un Minuteman III, il missile balistico intercontinentale americano da silo.",
    credit: "Dominio pubblico. US Air Force.",
  },
  alcm: {
    id: "alcm",
    src: "/media/alcm.jpg",
    kind: "vettore",
    caption: "AGM-86 ALCM, missile da crociera aviolanciato. La versione nucleare portava la W80.",
    credit: "CC BY 2.0. Cliff, via Wikimedia Commons.",
  },
  trident: {
    id: "trident",
    src: "/media/trident.jpg",
    kind: "vettore",
    caption: "Trident II (D5), il missile imbarcato dei sottomarini americani e britannici.",
    credit: "Dominio pubblico. US Navy.",
  },
  ohio: {
    id: "ohio",
    src: "/media/ohio.jpg",
    kind: "vettore",
    caption: "USS Ohio, capoclasse dei sottomarini lanciamissili che imbarcano il Trident. Qui in un allestimento successivo.",
    credit: "Dominio pubblico. US Navy. PH1 Harold Gerwien.",
  },
  "yellow-sun": {
    id: "yellow-sun",
    src: "/media/yellow-sun.jpg",
    kind: "dispositivo",
    caption: "Yellow Sun, la bomba termonucleare britannica dei V-bomber. Esterno.",
    credit: "CC BY-SA 4.0. Arjun Sarup, via Wikimedia Commons.",
  },
  danube: {
    id: "danube",
    src: "/media/danube.jpg",
    kind: "dispositivo",
    caption: "Blue Danube, prima bomba atomica britannica di serie. Esterno.",
    credit: "CC BY-SA 2.0. Hugh Llewelyn, via Wikimedia Commons.",
  },
  ivy: {
    id: "ivy",
    src: "/media/ivy.jpg",
    kind: "prova",
    caption: "La shot cab di Ivy Mike, Enewetak, 1952. Non era un'arma: era un impianto criogenico per provare la fusione.",
    credit: "Dominio pubblico. Governo degli Stati Uniti.",
  },
  shrimp: {
    id: "shrimp",
    src: "/media/shrimp.jpg",
    kind: "dispositivo",
    caption: "Il dispositivo Shrimp di Castle Bravo, nell'edificio dello sparo a Bikini. Esterno del cilindro, prima del test del 1954.",
    credit: "Dominio pubblico. Governo degli Stati Uniti.",
  },
  sedan: {
    id: "sedan",
    src: "/media/sedan.jpg",
    kind: "prova",
    caption: "Il cratere di Storax Sedan, Nevada, ancora visibile. Scoppio sotterraneo da 104 kt del programma Plowshare.",
    credit: "Dominio pubblico. Governo degli Stati Uniti.",
  },
  pershing: {
    id: "pershing",
    src: "/media/pershing.jpg",
    kind: "vettore",
    caption: "Lancio di prova di un Pershing II. La testata di arsenale era la W85.",
    credit: "Dominio pubblico. US Army.",
  },
  pioneer: {
    id: "pioneer",
    src: "/media/pioneer.jpg",
    kind: "vettore",
    caption: "RSD-10 Pioneer, il missile mobile a raggio intermedio eliminato dall'accordo INF.",
    credit: "Dominio pubblico. George Chernilevsky.",
  },
  topol: {
    id: "topol",
    src: "/media/topol.jpg",
    kind: "vettore",
    caption: "Lanciatore mobile di un Topol-M alle prove della parata di Mosca, 2012.",
    credit: "CC BY-SA 4.0. Vitaly V. Kuzmin, via Wikimedia Commons.",
  },
  tu95: {
    id: "tu95",
    src: "/media/tu95.jpg",
    kind: "vettore",
    caption: "Tu-95. Una versione modificata, il Tu-95V, sganciò la AN602; i Tu-95MS portano i missili da crociera.",
    credit: "CC BY-SA 4.0. Roman Dergunov, via Wikimedia Commons.",
  },
  mirage: {
    id: "mirage",
    src: "/media/mirage.jpg",
    kind: "vettore",
    caption: "Mirage IV, il bombardiere della forza di dissuasione francese negli anni Sessanta e Settanta.",
    credit: "CC BY-SA 4.0. Barbaracgeorge, via Wikimedia Commons.",
  },
  hiroshima: {
    id: "hiroshima",
    src: "/media/hiroshima.jpg",
    kind: "prova",
    caption: "La nube su Hiroshima, 6 agosto 1945, fotografata da uno dei B-29 della missione. Documento dell'impiego, non un modello.",
    credit: "Dominio pubblico. George R. Caron, US Army Air Forces, 6 agosto 1945.",
  },
  nagasaki: {
    id: "nagasaki",
    src: "/media/nagasaki.jpg",
    kind: "prova",
    caption: "La nube su Nagasaki, 9 agosto 1945.",
    credit: "Dominio pubblico. Charles Levy, US Army Air Forces, 9 agosto 1945.",
  },
};

// Public files are served under the deploy base path.
for (const p of Object.values(PHOTOS)) p.src = asset(p.src);

export function photosById(ids: string[] | undefined): ArchivePhoto[] {
  if (!ids) return [];
  return ids.map((id) => PHOTOS[id]).filter((photo): photo is ArchivePhoto => Boolean(photo));
}
