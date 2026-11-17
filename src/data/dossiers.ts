export type Dossier = {
  photos?: string[];
  facts: [string, string][];
  more: string[];
};

/** Public history and external facts only. No interior drawings, no build steps. */
const D: Record<string, Dossier> = {
  trinity: {
    photos: ["tower"],
    facts: [
      ["Quando", "16 luglio 1945, ore 05:29"],
      ["Dove", "Jornada del Muerto, Alamogordo, Nuovo Messico"],
      ["Laboratorio", "Los Alamos"],
      ["Quota", "Torre di 30 m"],
      ["Resa", "Circa 21 kt nella stima del 1945, poi rivista verso 25 kt"],
      ["Che cosa non era", "Non era un'arma lanciabile"],
    ],
    more: [
      "Trinity servì a provare l'implosione prima di Nagasaki. Il sito è oggi dentro il poligono di White Sands e si visita solo in rare giornate aperte. La fotografia in scheda è la torre, non una sezione del dispositivo.",
      "Il contenitore d'acciaio Jumbo, previsto se la reazione fosse fallita, non fu usato nello sparo.",
    ],
  },
  "little-boy": {
    photos: ["little-boy", "enola", "hiroshima"],
    facts: [
      ["Quando", "6 agosto 1945, ore 08:15 locali"],
      ["Quota", "Circa 580 m"],
      ["Aereo", "B-29 Enola Gay, 509th Composite Group, da Tinian"],
      ["Comandante", "Col. Paul Tibbets"],
      ["Ingombro pubblicato", "Circa 3 m per 71 cm, intorno a 4,4 tonnellate"],
      ["Tipo dichiarato", "Cannone all'uranio. Un solo impiego in guerra"],
      ["Morti storiche", "Nell'ordine di 70–140 mila entro la fine del 1945"],
    ],
    more: [
      "La mappa di Ground Zero usa la popolazione di Hiroshima oggi, non quella del 1945. Il numero di morti della scheda storica e quello calcolato sulla città attuale non vanno letti come la stessa cosa.",
      "Non ne fu costruita una serie. Dopo la guerra il tipo cannone fu giudicato ingombrante e poco sicuro da tenere armato, e l'arsenale americano prese un'altra strada.",
    ],
  },
  "fat-man": {
    photos: ["fat-man", "bockscar", "nagasaki"],
    facts: [
      ["Quando", "9 agosto 1945, ore 11:02 locali"],
      ["Bersaglio previsto", "Kokura. Nagasaki fu scelta per le nubi sul primario"],
      ["Quota", "Circa 500 m"],
      ["Aereo", "B-29 Bockscar, maggiore Charles Sweeney"],
      ["Resa storica", "Circa 21 kt"],
      ["Morti storiche", "Nell'ordine di 40–80 mila entro la fine del 1945"],
    ],
    more: [
      "Fat Man è il capostipite delle bombe a implosione americane del dopoguerra (Mk-4, Mk-5, Mk-6). La fotografia mostra l'involucro a Tinian, non l'interno.",
      "Il terreno della valle di Urakami schermò una parte della città rispetto a uno scoppio su terreno piatto: è uno dei motivi per cui il modello a cerchi, qui, non è la mappa del 1945.",
    ],
  },
  mk17: {
    photos: ["mk17"],
    facts: [
      ["In servizio", "1954–1957"],
      ["Massa", "Circa 19 tonnellate"],
      ["Lunghezza", "Circa 7,5 m"],
      ["Resa pubblicata", "10–15 Mt"],
      ["Vettore", "Solo i bombardieri più grandi dell'epoca"],
    ],
    more: [
      "È il periodo in cui la potenza cresceva più in fretta della miniaturizzazione. Pochi anni dopo armi molto più leggere coprivano la stessa fascia di megaton.",
    ],
  },
  mk18: {
    facts: [
      ["In servizio", "1953–1956"],
      ["Resa", "500 kt, sola fissione"],
      ["Test di riferimento", "Ivy King, 16 novembre 1952, 500 kt"],
    ],
    more: [
      "Segna il tetto pratico di un'arma a sola fissione. Le termonucleari, già dimostrate l'anno prima con Ivy Mike, resero quel percorso obsoleto per le potenze alte.",
    ],
  },
  b28: {
    photos: ["b28", "b52"],
    facts: [
      ["In servizio", "1958–1991"],
      ["Rese pubblicate", "Da circa 70 kt a 1,45 Mt, secondo la versione"],
      ["Impieghi", "Bombardieri, caccia-bombardieri, missile Hound Dog"],
      ["Incidenti noti", "Palomares, 1966, due bombe; Thule, 1968, una"],
    ],
    more: [
      "Non esiste «la» B28: le mod coprono ruoli diversi. Il nominale di studio, 350 kt, è un punto in mezzo alla fascia, scelto per confrontare gli effetti.",
      "Palomares e Thule sono episodi di sicurezza e di contaminazione dopo una caduta, non di scoppio nucleare. Le bombe non detonate restano, in quelle storie, ordigni dispersi.",
    ],
  },
  b39: {
    photos: ["mk39"],
    facts: [
      ["In servizio", "1957–1966"],
      ["Resa stimata", "3–4 Mt"],
      ["Massa", "Circa 2,9 tonnellate"],
      ["Episodio", "Goldsboro, Carolina del Nord, 24 gennaio 1961"],
    ],
    more: [
      "A Goldsboro un B-52 in avaria perse due B39. Una percorse quasi tutta la sequenza di sicurezze senza scoppiare. È un caso di storia della custodia delle armi, non del loro interno.",
    ],
  },
  b41: {
    photos: ["b52"],
    facts: [
      ["In servizio", "1960–1976"],
      ["Resa di progetto", "25 Mt, non un test a quella potenza"],
      ["Massa", "Circa 4,8 tonnellate"],
      ["Vettore", "B-52"],
    ],
    more: [
      "È l'arma più potente mai entrata davvero nell'arsenale americano, ben sotto la Tsar Bomba, che restò un esperimento unico. Fu smantellata a metà degli anni Settanta.",
    ],
  },
  b53: {
    photos: ["b52"],
    facts: [
      ["In servizio", "1962–1997"],
      ["Ultimo smantellamento", "2011"],
      ["Resa dichiarata", "9 Mt"],
      ["Ruolo", "Bersagli molto duri, per potenza e non per penetrazione"],
      ["Parente", "La testata W53 del Titan II"],
    ],
    more: [
      "Il Titan II che portava la W53 fu ritirato nel 1987, dopo l'incidente del silo di Damascus, Arkansas (1980), in cui morì un tecnico e il missile esplose senza innesco nucleare.",
    ],
  },
  w53: {
    facts: [
      ["Missile", "LGM-25C Titan II"],
      ["Resa", "9 Mt"],
      ["In servizio", "1962–1987"],
      ["Schieramento", "Sili in Arkansas, Kansas e Arizona"],
    ],
    more: [
      "Il Titan II era ipergolico: stava in silo pronto al lancio, e proprio quei propellenti causarono l'incidente di Damascus. La testata non detonò.",
    ],
  },
  b61: {
    photos: ["b61"],
    facts: [
      ["In servizio", "Dal 1968, ancora oggi"],
      ["Ingombro", "Circa 3,6 m per 34 cm, intorno a 320 kg"],
      ["Rese pubblicate", "Da frazioni di kt fino a circa 340 kt, secondo la mod"],
      ["Versioni citate", "Mod 3 e 4 tattiche, mod 7 più alta, mod 11 di penetrazione, mod 12 in ingresso"],
      ["Europa", "Alcune restano americane, sotto doppia chiave NATO"],
    ],
    more: [
      "Il nominale di studio di 50 kt non è «la potenza della B61». È un gradino intermedio, utile per leggere i cerchi. Le opzioni basse e alte vanno scelte a mano nel cursore.",
      "La fotografia è l'involucro esterno diffuso dal Dipartimento dell'Energia. Non mostra come è fatta dentro.",
    ],
  },
  b83: {
    photos: ["b83", "b52"],
    facts: [
      ["In servizio", "Dal 1983"],
      ["Resa dichiarata", "1,2 Mt"],
      ["Ruolo", "Bomba strategica di caduta, anche da bassissima quota"],
      ["Vettori storici", "B-52, B-1, B-2"],
    ],
    more: [
      "È la bomba a caduta americana di maggiore potenza ancora in inventario. Le discussioni recenti sul suo ritiro non cambiano la scheda di effetti: 1,2 Mt resta la cifra pubblica.",
    ],
  },
  "w54-davy": {
    photos: ["davy"],
    facts: [
      ["Sistema", "M388 Davy Crockett, cannone senza rinculo da 120 o 155 mm"],
      ["In servizio", "1961–1971"],
      ["Resa", "Decine di tonnellate, spesso citate intorno a 20 t"],
      ["Impiego previsto", "Reparti di fanteria in Europa, gittata di pochi chilometri"],
    ],
    more: [
      "È l'arma nucleare americana più piccola mai schierata, e anche la più assurda sul piano tattico: il raggio letale non era poi così lontano da chi sparava. La foto di museo mostra lanciatore e proiettile da fuori.",
    ],
  },
  "w54-sadm": {
    facts: [
      ["Nome", "Special Atomic Demolition Munition"],
      ["In servizio", "Anni Sessanta, ritirata nel 1989 circa"],
      ["Famiglia", "Stessa testata W54 del Davy Crockett, altro impiego"],
      ["Resa pubblicata", "Fra una frazione di kt e circa 1 kt"],
    ],
    more: [
      "Era una carica da demolizione per ponti, valichi e porti, trasportabile da una squadra. Non è il Davy Crockett: cambia il vettore, non l'ordine di grandezza. Non c'è una fotografia libera distinta in questo archivio.",
    ],
  },
  w76: {
    photos: ["trident", "ohio"],
    facts: [
      ["Resa", "Circa 100 kt"],
      ["Missili", "Trident I (C4), poi Trident II (D5)"],
      ["Piattaforme", "Sottomarini classe Ohio; la W76-1 è la versione rigenerata"],
      ["Dal", "1978, ancora in servizio"],
    ],
    more: [
      "È la testata più numerosa della forza imbarcata americana. Il Trident II è anche il missile dei sottomarini britannici Vanguard, con una testata diversa, Holbrook, stimata sullo stesso ordine di potenza.",
    ],
  },
  "w76-2": {
    photos: ["trident"],
    facts: [
      ["Schierata", "Dal 2019, pochi esemplari"],
      ["Resa stimata", "5–8 kt"],
      ["Vettore", "Trident II"],
    ],
    more: [
      "Il rendimento esatto non è stato pubblicato. La fascia è quella del Nuclear Notebook. È una testata piccola su un missile strategico: gli effetti, a parità di quota, somigliano a un'arma tattica, non alla W76 da 100 kt.",
    ],
  },
  w78: {
    photos: ["minuteman"],
    facts: [
      ["Resa", "335 kt, cifra standard delle rassegne"],
      ["Missile", "LGM-30G Minuteman III"],
      ["Dal", "1979"],
      ["Sostituzione", "Prevista, nel tempo, con la W87"],
    ],
    more: [
      "Il Minuteman III entrò in servizio nel 1970. Poteva portare tre veicoli di rientro; i trattati hanno ridotto molti missili a una testata. La gittata pubblica è intercontinentale, oltre i 10 mila km.",
    ],
  },
  w80: {
    photos: ["alcm", "b52"],
    facts: [
      ["Resa variabile", "5–150 kt"],
      ["Massa pubblicata", "Circa 130 kg"],
      ["Oggi", "W80-1 sull'AGM-86 dei B-52"],
      ["Ritirata", "La versione da crociera navale"],
      ["In sviluppo", "W80-4 per il missile LRSO, non ancora schierata"],
    ],
    more: [
      "Il nominale di studio è l'estremo alto, 150 kt. Un ALCM non è un ICBM: vola in atmosfera, si può abbattere, e la quota di scoppio la sceglie il profilo di volo, non una parabola.",
    ],
  },
  w84: {
    facts: [
      ["Missile", "BGM-109G Gryphon, crociera terrestre"],
      ["Schieramento", "Europa occidentale, anni Ottanta"],
      ["Trattato", "INF, 1987: eliminati i raggio intermedio"],
      ["Resa", "Variabile, fino a circa 150 kt, stima"],
    ],
    more: [
      "Parente della W80. Fu ritirata e smantellata nei primi anni Novanta. È un caso da archivio INF, insieme al Pershing II e al Pioneer sovietico.",
    ],
  },
  w85: {
    photos: ["pershing"],
    facts: [
      ["Missile", "MGM-31 Pershing II"],
      ["Gittata pubblicata", "Circa 1.800 km"],
      ["Resa stimata", "Fino a circa 80 kt, variabile"],
      ["Dopo l'INF", "Molte testate divennero B61 mod 10, poi ritirata"],
    ],
    more: [
      "Il Pershing II, schierato in Germania Ovest dal 1983, era il versante americano della crisi degli euromissili. Il lancio in fotografia è una prova, non un impiego.",
    ],
  },
  w87: {
    photos: ["minuteman"],
    facts: [
      ["Resa", "300 kt"],
      ["Nata per", "LGM-118 Peacekeeper, fino a 10 testate"],
      ["Oggi", "Parte dei Minuteman III, di solito una testata"],
      ["Programma", "W87-1 indicata per il futuro Sentinel, non ancora in servizio"],
    ],
    more: [
      "Il Peacekeeper fu ritirato nel 2005. Le testate sopravvissero al missile. L'estremo 475 kt che compare nella fascia è una stima di programma della W87-1, non l'arma oggi in silo.",
    ],
  },
  w88: {
    photos: ["trident", "ohio"],
    facts: [
      ["Resa", "455 kt"],
      ["Missile", "Trident II D5"],
      ["Dal", "1988"],
      ["Ruolo", "Meno numerosa della W76, più potente"],
    ],
    more: [
      "455 kt è la cifra del Nuclear Notebook, non una misura di un test pubblico con quel nome. Su un Ohio i tubi sono 24; quanti siano armati, e con quale mix W76/W88, dipende dai trattati e non è un dato fisso della scheda.",
    ],
  },
  "ivy-mike": {
    photos: ["ivy"],
    facts: [
      ["Quando", "1 novembre 1952, Enewetak"],
      ["Resa misurata", "10,4 Mt"],
      ["Massa dell'impianto", "Decine di tonnellate, criogenia compresa"],
      ["Che cosa dimostrò", "Il principio termonucleare. Non era trasportabile"],
    ],
    more: [
      "Usava deuterio liquido refrigerato. La fotografia è la shot cab, l'edificio dello sparo, non un'arma. L'isola di Elugelab fu cancellata dal reef.",
    ],
  },
  "castle-bravo": {
    photos: ["shrimp"],
    facts: [
      ["Quando", "1 marzo 1954, atollo di Bikini"],
      ["Previsti", "Circa 6 Mt"],
      ["Misurati", "15 Mt"],
      ["Cratere", "Diametro intorno a 2 km"],
      ["Chi fu investito", "Atolli abitati, e il peschereccio Daigo Fukuryū Maru"],
    ],
    more: [
      "È il caso giusto per studiare il fallout di uno scoppio al suolo, non «la bomba più grande». Il litio del combustibile rese più del previsto: la scheda registra l'esito misurato. La foto è il cilindro Shrimp prima del test, visto da fuori.",
    ],
  },
  sedan: {
    photos: ["sedan"],
    facts: [
      ["Quando", "6 luglio 1962, Nevada Test Site"],
      ["Resa", "104 kt"],
      ["Profondità", "194 m"],
      ["Cratere rimasto", "Circa 390 m di diametro e 100 m di profondità"],
      ["Programma", "Plowshare, scavi «civili» con esplosivi nucleari"],
    ],
    more: [
      "Il cratere è ancora nel deserto ed è la fotografia della scheda. Uno scoppio così poco profondo alza molta terra e lascia fallout: l'onda in aria è minore di uno scoppio di superficie della stessa potenza.",
    ],
  },
  rds1: {
    facts: [
      ["Quando", "29 agosto 1949, Semipalatinsk"],
      ["Nome", "Primo lampo"],
      ["Resa", "Circa 22 kt"],
      ["Tipo", "Implosione al plutonio, primo test sovietico"],
    ],
    more: [
      "Chiuse il monopolio americano a quattro anni da Trinity. Non era ancora un arsenale: era la prova che il programma c'era.",
    ],
  },
  rds37: {
    facts: [
      ["Quando", "22 novembre 1955, Semipalatinsk"],
      ["Resa misurata", "1,6 Mt"],
      ["Progetto", "Depotenziato rispetto a circa 3 Mt"],
      ["Vettore del test", "Sgancio da aereo"],
    ],
    more: [
      "È la data sovietica di un ordigno termonucleare già avioportato. Il test causò comunque vittime civili fuori dal poligono, per il crollo di un ricovero. La fascia fino a 3 Mt è il progetto non eseguito quel giorno.",
    ],
  },
  tsar: {
    photos: ["tu95"],
    facts: [
      ["Quando", "30 ottobre 1961, Novaja Zemlja"],
      ["Resa misurata", "50 Mt"],
      ["Progetto non eseguito", "Circa 100 Mt, con un altro tamper"],
      ["Massa", "Circa 27 tonnellate, 8 m di lunghezza"],
      ["Quota", "Circa 4 km"],
      ["Aereo", "Tu-95V modificato, con un Tu-16 di osservazione"],
    ],
    more: [
      "Non entrò in arsenale: troppo pesante, troppo unica. La versione fatta scoppiare limitò la fissione, e lo scoppio fu in aria, quindi il fallout locale fu molto diverso da Bravo. L'onda ruppe vetri a centinaia di chilometri, fino in Scandinavia.",
      "La fotografia è un Tu-95, la famiglia del vettore, non l'esemplare modificato del 1961 e non la bomba.",
    ],
  },
  "ss18-single": {
    facts: [
      ["Missile", "R-36M Voevoda, in Occidente SS-18 Satan"],
      ["Base", "Silo"],
      ["Versione", "Monotestata, stime fino a circa 20 Mt"],
      ["Stato", "Ritirata, intorno al 2020"],
    ],
    more: [
      "Le rese delle versioni pesanti non sono mai state un dato ufficiale russo. 20 Mt è l'ordine di grandezza delle rassegne occidentali sulla monotestata, non una misura.",
    ],
  },
  ss20: {
    photos: ["pioneer"],
    facts: [
      ["Missile", "RSD-10 Pioneer, SS-20 Saber"],
      ["Base", "Rampa mobile"],
      ["Testate", "Fino a tre, stima intorno a 150 kt l'una"],
      ["Trattato", "INF: smantellato, lanciatori compresi"],
    ],
    more: [
      "Fu il sistema che, con i Pershing II e i Gryphon, definì la crisi degli euromissili. La fotografia è il vettore, un pezzo da museo o da parata, non una testata.",
    ],
  },
  topol: {
    facts: [
      ["Missile", "RT-2PM Topol, SS-25"],
      ["Base", "Tel mobile su strada"],
      ["Testata", "Singola, stima intorno a 800 kt"],
      ["Servizio", "1985–circa 2024"],
    ],
    more: [
      "Per trent'anni è stata la colonna mobile sovietica e poi russa. Il rendimento non è ufficiale. Non va confuso con il Topol-M, che ha un'altra scheda e un'altra fotografia.",
    ],
  },
  "topol-m": {
    photos: ["topol"],
    facts: [
      ["Missile", "RT-2PM2 Topol-M, SS-27"],
      ["Base", "Silo e rampa mobile"],
      ["Testata", "Singola, stima 550 kt–1 Mt"],
      ["Dal", "1997, ancora in servizio"],
    ],
    more: [
      "È un sistema russo post-sovietico. 800 kt, il nominale di studio, è il valore più ripetuto dalle rassegne aperte. La foto è un lanciatore alle prove di una parata, non un lancio operativo.",
    ],
  },
  yars: {
    facts: [
      ["Missile", "RS-24 Yars"],
      ["Dal", "2010 circa, in servizio"],
      ["Testate", "MIRV, spesso indicate in tre, resa unitaria stimata intorno a 150 kt"],
      ["Base", "Silo e mobile"],
    ],
    more: [
      "Sostituisce i Topol nella forza strategica russa. Numero di testate e resa non sono dati ufficiali: la scheda resta una stima larga.",
    ],
  },
  iskander: {
    facts: [
      ["Sistema", "9K720 Iskander-M"],
      ["Gittata dichiarata", "Circa 500 km"],
      ["Base", "Rampa stradale, due missili"],
      ["Resa della versione nucleare", "Non ufficiale, spesso stimata fra 10 e 50 kt"],
    ],
    more: [
      "La versione convenzionale è quella vista nelle guerre recenti. La versione nucleare è accreditata dalle rassegne, senza una resa pubblicata dallo Stato. Non c'è in archivio una fotografia libera del missile: restano i dati aperti del vettore.",
    ],
  },
  "blue-danube": {
    photos: ["danube"],
    facts: [
      ["In servizio", "1953–1962"],
      ["Vettori", "V-bomber: Valiant, Victor, Vulcan"],
      ["Massa", "Circa 4,5 tonnellate"],
      ["Resa", "Controversa, fra circa 10 e 16 kt, con stime più alte"],
    ],
    more: [
      "Prima arma britannica di serie, ancora enorme rispetto alle bombe americane già alleggerite. La fotografia è l'esterno esposto. Il disaccordo sulla resa è il motivo della marca «controversa».",
    ],
  },
  "yellow-sun": {
    photos: ["yellow-sun"],
    facts: [
      ["In servizio", "1961–1972"],
      ["Resa stimata", "Circa 1–1,1 Mt"],
      ["Testata", "Red Snow, di origine americana adattata"],
      ["Anche su", "Missile standoff Blue Steel"],
    ],
    more: [
      "Definì la forza strategica dei V-bomber negli anni Sessanta, insieme a Blue Steel. La Mk.1 interim, con Green Grass, è un'altra scheda: circa 400 kt, non questo megaton.",
    ],
  },
  "green-grass": {
    facts: [
      ["Periodo", "1958–1962, interim"],
      ["Resa stimata", "Circa 400 kt, sola fissione"],
      ["Dove stava", "Violet Club e Yellow Sun Mk.1"],
    ],
    more: [
      "Servì a non lasciare i V-bomber senza un'arma megatonica mentre Red Snow non era pronta. Fu considerata ingombrante e poco pratica, e uscì appena arrivò Yellow Sun Mk.2.",
    ],
  },
  we177a: {
    facts: [
      ["In servizio", "1969–1992"],
      ["Ruolo", "Tattica, anche carica di profondità"],
      ["Resa stimata", "0,5 kt e circa 10 kt"],
    ],
    more: [
      "La famiglia WE.177 fu l'ultima bomba britannica. La A è la versione tattica; la B, megatonica, e la C, intermedia, hanno schede proprie. Il Regno Unito non pubblicò le rese.",
    ],
  },
  holbrook: {
    photos: ["trident"],
    facts: [
      ["Piattaforma", "Sottomarini classe Vanguard"],
      ["Missile", "Trident II, in pooling con gli Stati Uniti"],
      ["Resa stimata", "Circa 100 kt, con un'opzione bassa spesso citata intorno a 10 kt"],
      ["Origine di progetto", "Derivata dalla W76"],
    ],
    more: [
      "Londra non pubblica il rendimento. 100 kt è l'inferenza a partire dal progetto americano, non una misura britannica. I sottomarini sono i Vanguard, non gli Ohio: la foto del missile è il D5, quella della nave americana non è la loro.",
    ],
  },
  chevaline: {
    facts: [
      ["Sistema", "Polaris britannico modificato"],
      ["In servizio", "1982–1996"],
      ["Testate", "Due, indurite, stima intorno a 200 kt"],
      ["Reso pubblico", "Solo nel 1980, anni dopo l'avvio"],
    ],
    more: [
      "Era un programma per penetrare le difese di Mosca, non un missile nuovo. Il rendimento è di letteratura.",
    ],
  },
  an11: {
    photos: ["mirage"],
    facts: [
      ["In servizio", "1964–1973"],
      ["Resa stimata", "Circa 60 kt, fissione"],
      ["Vettore", "Mirage IVA"],
      ["Test che aprì la strada", "Gerboise bleue, 13 febbraio 1960, circa 70 kt, Sahara"],
    ],
    more: [
      "Prima arma della forza di dissuasione francese. La fotografia è il bombardiere, non la bomba: di quest'ultima non c'è uno scatto libero utilizzabile qui.",
    ],
  },
  an22: {
    photos: ["mirage"],
    facts: [
      ["In servizio", "1967–1988"],
      ["Resa stimata", "Circa 70 kt"],
      ["Vettore", "Mirage IVA, fino all'arrivo dell'ASMP"],
    ],
    more: [
      "Alleggerì e rese più praticabile il carico del Mirage IV. La resa resta una stima da rassegne, non un comunicato.",
    ],
  },
  tno: {
    facts: [
      ["Missile", "M51, sottomarini classe Le Triomphant"],
      ["Dal", "Intorno al 2010"],
      ["Resa stimata", "Circa 100 kt a testata"],
      ["Carico", "Più veicoli di rientro, numero esatto non pubblicato"],
    ],
    more: [
      "È la testata oceanica francese attuale, successore della TN-75. Parigi non pubblica la resa: 100 kt è l'ordine di grandezza di SIPRI e del Nuclear Notebook.",
    ],
  },
  cn596: {
    facts: [
      ["Quando", "16 ottobre 1964, Lop Nur"],
      ["Resa", "22 kt"],
      ["Tipo", "Uranio, primo test cinese"],
      ["Nome in codice occidentale", "CHIC-1, dispositivo 596"],
    ],
    more: [
      "A meno di tre anni di distanza, il test numero 6 raggiunse 3,3 Mt. La scheda è quel primo scoppio, non un missile di oggi.",
    ],
  },
  "cn-h6": {
    facts: [
      ["Quando", "17 giugno 1967, Lop Nur"],
      ["Resa misurata", "3,3 Mt"],
      ["Vettore del test", "Sgancio da un H-6"],
    ],
    more: [
      "Prima esplosione termonucleare cinese. È un dispositivo storico misurato: non va letto come la resa di un DF-5 o di un DF-41, che restano stime a parte.",
    ],
  },
  df5: {
    facts: [
      ["Missile", "DF-5, ICBM da silo"],
      ["In servizio", "Dai primi anni Ottanta"],
      ["Monotestata", "Stime fra 1 e 5 Mt"],
      ["DF-5B", "Accreditata di più testate, resa unitaria ignota"],
    ],
    more: [
      "Nessuna cifra ufficiale. 4 Mt è un centro di studio per la monotestata. Per una MIRV della versione B il nominale andrebbe abbassato: il dato pubblico non c'è.",
    ],
  },
  df41: {
    facts: [
      ["Missile", "DF-41"],
      ["Classe", "ICBM mobile, anche da silo nelle rassegne"],
      ["Testate", "MIRV accreditate, rese unitarie non pubblicate"],
      ["Nominale di studio", "150 kt, un ordine di grandezza, non una misura"],
    ],
    more: [
      "È fra i sistemi cinesi più opachi. Stringere la fascia sarebbe fiction. La scheda serve a mettere un ICBM moderno sulla mappa con un'etichetta onesta.",
    ],
  },
  smiling: {
    facts: [
      ["Quando", "18 maggio 1974, Pokhran"],
      ["Nome", "Smiling Buddha, esperimento descritto come pacifico"],
      ["Resa", "Rivendicata intorno a 12 kt, stime esterne più basse, spesso circa 8"],
    ],
    more: [
      "È il primo test indiano. La marca «controversa» o la fascia larga, dove c'è, tengono insieme il comunicato e le misure a distanza. Non diventò subito un arsenale schierato.",
    ],
  },
  jericho: {
    facts: [
      ["Stato", "Israele non conferma né smentisce l'arsenale"],
      ["Vettori accreditati", "Missili Gerico, e aviogetti"],
      ["Resa di studio", "40 kt, un punto dentro una fascia molto larga"],
    ],
    more: [
      "Non esiste una scheda ufficiale da cui copiare massa, resa o fotografia. Qualunque cifra più stretta sarebbe inventata. La voce sta in archivio perché il programma è dato per noto dalle rassegne, non perché se ne conoscano i dettagli.",
    ],
  },
  nk2017: {
    facts: [
      ["Quando", "3 settembre 2017, Punggye-ri"],
      ["Resa", "Stime fra circa 100 e 250 kt; nominale di studio 140"],
      ["Rivendicazione", "Test termonucleare. Le misure a distanza non fissano il progetto"],
    ],
    more: [
      "È il test nordcoreano di gran lunga più potente. Il sito di Punggye-ri, nelle analisi aperte, ne uscì danneggiato. La fascia resta larga di proposito.",
    ],
  },
  hwasong15: {
    facts: [
      ["Missili", "Hwasong-15 e, dopo, Hwasong-17"],
      ["Classe", "IRBM / ICBM in sviluppo e prova"],
      ["Testata", "Non c'è una resa ufficiale del carico"],
      ["Nominale di studio", "100 kt, ordine di grandezza"],
    ],
    more: [
      "I lanci dimostrano gittata e vettore, non la potenza di una testata schierata. Tenere 100 kt è una scelta di studio, segnata come stima.",
    ],
  },
  "sa-devices": {
    facts: [
      ["Costruiti", "Sei dispositivi"],
      ["Tipo dichiarato dopo lo smantellamento", "Cannone all'uranio"],
      ["Massa ricostruita", "Intorno a una tonnellata"],
      ["Resa stimata", "10–20 kt"],
      ["Fine", "Smontati nel 1989–1991, verifiche AIEA"],
    ],
    more: [
      "Unico arsenale costruito e poi abolito per intero. Non ci fu un test riconosciuto. Il lampo di Vela del 1979 resta un episodio controverso e non è contato qui come prova di questi sei ordigni. Nessun dettaglio di assemblaggio: non serve a leggere gli effetti.",
    ],
  },
};

export function dossierFor(id: string): Dossier | undefined {
  return D[id];
}

export function dossierBlob(id: string): string {
  const dossier = D[id];
  if (!dossier) return "";
  return `${dossier.more.join(" ")} ${dossier.facts.map((pair) => pair.join(" ")).join(" ")}`;
}
