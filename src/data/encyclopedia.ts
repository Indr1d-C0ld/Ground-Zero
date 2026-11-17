// Enciclopedia di Ground Zero.
// Contenuto educativo in italiano: effetti, fisica degli effetti, storia, politica e medicina.
// Nessun dettaglio di progetto, materiali o assemblaggio di armi.
// I numeri sono valori pubblici consolidati; dove le fonti divergono il testo dà una forbice.

export type Block =
  | { t: "p"; text: string }
  | { t: "h"; text: string }
  | { t: "formula"; tex: string; caption: string }
  | { t: "table"; caption: string; head: string[]; rows: string[][] }
  | { t: "list"; items: string[] }
  | { t: "quote"; text: string; who: string }
  | { t: "fact"; label: string; value: string }
  | { t: "figures"; topic: string };

export type Chapter = {
  id: string;
  part: string;
  title: string;
  kicker: string;
  summary: string;
  topics: string[];
  blocks: Block[];
  sources: string[];
};

export const CHAPTERS: Chapter[] = [
  // ───────────────────────────── FONDAMENTI ─────────────────────────────
  {
    id: "energia",
    part: "Fondamenti",
    title: "L'energia di una detonazione",
    kicker: "Kiloton, megaton e dove va a finire l'energia",
    summary:
      "Che cosa significa «15 kiloton», perché il paragone con il tritolo è una convenzione e come l'energia si divide fra onda d'urto, calore e radiazione.",
    topics: ["diagrammi", "palla-di-fuoco"],
    blocks: [
      {
        t: "p",
        text: "La potenza di un'esplosione nucleare si misura in equivalente di tritolo (TNT). Un kiloton (kt) è l'energia liberata da mille tonnellate di TNT; un megaton (Mt) da un milione. È una convenzione storica: nessuno ha mai fatto esplodere mille tonnellate di tritolo per confronto, e il valore è fissato per definizione.",
      },
      { t: "formula", tex: "1 kt ≡ 10¹² cal = 4,184 × 10¹² J", caption: "Definizione convenzionale del kiloton di TNT." },
      {
        t: "p",
        text: "La differenza con un esplosivo chimico non è solo di quantità. Una carica chimica libera la sua energia in un gas caldo a qualche migliaio di gradi; una detonazione nucleare concentra un'energia milioni di volte maggiore in un volume minuscolo, in meno di un microsecondo, portando la materia a decine di milioni di gradi. A quelle temperature gran parte dell'energia esce prima come radiazione (raggi X), che l'aria assorbe e trasforma nella palla di fuoco.",
      },
      { t: "h", text: "La ripartizione dell'energia" },
      {
        t: "p",
        text: "Per uno scoppio in aria a quota bassa o media (sotto circa 30 km), il manuale di Glasstone e Dolan propone una ripartizione tipica. Sono frazioni medie: cambiano con la potenza, con il tipo di ordigno e soprattutto con la quota.",
      },
      {
        t: "table",
        caption: "Ripartizione tipica dell'energia in uno scoppio in aria sotto i 30 km (Glasstone e Dolan 1977, cap. 1).",
        head: ["Forma", "Frazione", "Tempo", "Effetto principale"],
        rows: [
          ["Onda d'urto", "≈ 50%", "secondi–decine di secondi", "crolli, proiezione di detriti e vetri"],
          ["Radiazione termica", "≈ 35%", "frazioni di secondo–pochi secondi", "ustioni, incendi, accecamento"],
          ["Radiazione nucleare iniziale", "≈ 5%", "primo minuto", "dose acuta da gamma e neutroni"],
          ["Radiazione residua", "≈ 10%", "ore–anni", "fallout, contaminazione"],
        ],
      },
      { t: "h", text: "Come cambia con la quota" },
      {
        t: "list",
        items: [
          "Scoppio al suolo: la palla di fuoco tocca il terreno, una parte dell'energia scava il cratere e scuote il suolo; la frazione termica efficace scende (circa la metà rispetto all'aria) e il fallout locale diventa importante.",
          "Scoppio in aria a quota ottimale: massimizza l'area colpita da una data sovrapressione; il fallout locale è trascurabile perché la palla di fuoco non risucchia terreno.",
          "Alta quota (sopra 30–40 km): l'aria rarefatta non trattiene i raggi X, che viaggiano lontano; l'onda d'urto si indebolisce, la palla di fuoco si allarga enormemente, cresce la frazione termica.",
          "Spazio (sopra circa 100 km): quasi niente onda d'urto. Dominano raggi X, impulso elettromagnetico, aurore artificiali e fasce di radiazione intrappolate dal campo magnetico.",
          "Sotterraneo o subacqueo: niente impulso termico all'esterno; l'energia diventa onda sismica o idraulica, cratere, colonna d'acqua e, se lo scoppio non è contenuto, contaminazione.",
        ],
      },
      { t: "h", text: "Ordini di grandezza" },
      { t: "fact", label: "Hiroshima, 6 agosto 1945", value: "≈ 15 kt (stima 13–18 kt)" },
      { t: "fact", label: "Testata strategica moderna tipica", value: "100–500 kt" },
      { t: "fact", label: "Tsar Bomba, 1961", value: "≈ 50 Mt: oltre tremila volte Hiroshima" },
      {
        t: "p",
        text: "La scala è così ampia che i grafici della potenza vanno letti in logaritmo: tra il più piccolo ordigno tattico (frazioni di kiloton) e il più grande mai provato ci sono cinque ordini di grandezza. Gli effetti però non crescono in proporzione all'energia, come spiega il capitolo sulle leggi di scala.",
      },
      { t: "figures", topic: "diagrammi" },
    ],
    sources: [
      "S. Glasstone, P. J. Dolan, The Effects of Nuclear Weapons, 3ª ed., U.S. DoD/ERDA, 1977, cap. 1 (§1.20–1.27, ripartizione dell'energia).",
      "Office of Technology Assessment, The Effects of Nuclear War, 1979, cap. 2.",
      "Nuclear Weapon Archive (C. Sublette), Nuclear Weapons FAQ, sez. 3 «Effects».",
    ],
  },
  {
    id: "fissione-fusione",
    part: "Fondamenti",
    title: "Fissione e fusione, in concetto",
    kicker: "Da dove viene l'energia, senza entrare nell'officina",
    summary:
      "Perché nuclei pesanti che si spezzano e nuclei leggeri che si uniscono liberano energia, cosa vuol dire reazione a catena e perché la frazione di fissione conta per il fallout.",
    topics: ["diagrammi", "termonucleari", "manhattan"],
    blocks: [
      {
        t: "p",
        text: "Ogni nucleo atomico è tenuto insieme da un'energia di legame. Per i nuclei di massa intermedia, come il ferro, il legame per nucleone è massimo. Per questo spezzare un nucleo molto pesante (fissione) o unire due nuclei molto leggeri (fusione) porta a configurazioni più legate, e la differenza di energia viene liberata. È la stessa fisica che fa funzionare le centrali e il Sole.",
      },
      { t: "h", text: "Fissione" },
      {
        t: "p",
        text: "Un nucleo pesante che assorbe un neutrone può spezzarsi in due frammenti, emettendo in media due o tre neutroni nuovi e circa 200 MeV di energia, quasi tutta come energia cinetica dei frammenti. Se in media almeno uno dei neutroni prodotti causa un'altra fissione, il processo si autoalimenta: è la reazione a catena. In un reattore la catena è tenuta in equilibrio; in un'esplosione cresce in modo esponenziale per un tempo brevissimo.",
      },
      { t: "formula", tex: "E(fissione) ≈ 200 MeV ≈ 3,2 × 10⁻¹¹ J", caption: "Energia media liberata da una singola fissione." },
      { t: "fact", label: "Fissioni per kiloton", value: "≈ 1,45 × 10²³" },
      { t: "fact", label: "Materia che si fissiona per 1 kt", value: "≈ 57 grammi" },
      {
        t: "p",
        text: "Il secondo numero aiuta a capire l'ordine di grandezza: la bomba di Hiroshima ha trasformato in energia la fissione di meno di un chilogrammo di materiale, e la massa effettivamente convertita in energia (E = mc²) è stata di circa 0,7 grammi.",
      },
      { t: "h", text: "Fusione" },
      {
        t: "p",
        text: "La fusione di isotopi dell'idrogeno (deuterio e trizio) libera 17,6 MeV per reazione: meno di una fissione, ma per unità di massa parecchie volte di più. Perché i nuclei si avvicinino nonostante la repulsione elettrica servono temperature di decine di milioni di gradi: per questo si parla di reazioni «termonucleari». Nelle armi, quelle condizioni sono prodotte da una prima esplosione a fissione. I dettagli di progetto restano classificati e non sono oggetto di questa enciclopedia.",
      },
      { t: "h", text: "Perché la distinzione conta per gli effetti" },
      {
        t: "list",
        items: [
          "Onda d'urto e calore dipendono dall'energia totale, non dalla sua origine: un megaton è un megaton.",
          "Il fallout dipende quasi solo dalla parte di energia venuta dalla fissione, perché sono i prodotti di fissione a essere radioattivi. Glasstone assume per convenzione il 50% di fissione nelle armi ad alta potenza.",
          "I neutroni della fusione sono più energetici: a parità di potenza, ordigni piccoli progettati per massimizzare la radiazione pronta hanno un raggio di dose letale relativamente più largo (le cosiddette armi a radiazione rafforzata).",
          "La pulizia di un ordigno è sempre relativa: anche Tsar Bomba, con circa il 97% di energia da fusione secondo le fonti sovietiche, ha prodotto fallout misurabile.",
        ],
      },
      {
        t: "table",
        caption: "Frazione di fissione in alcuni casi storici (stime pubbliche).",
        head: ["Evento", "Potenza", "Frazione di fissione"],
        rows: [
          ["Hiroshima, 1945", "≈ 15 kt", "100%"],
          ["Ivy Mike, 1952", "≈ 10,4 Mt", "≈ 75% (≈ 7,7 Mt)"],
          ["Castle Bravo, 1954", "≈ 15 Mt", "≈ 67% (≈ 10 Mt)"],
          ["Tsar Bomba, 1961", "≈ 50 Mt", "≈ 3%"],
        ],
      },
      { t: "figures", topic: "termonucleari" },
    ],
    sources: [
      "Glasstone e Dolan 1977, cap. 1 (§1.38–1.72, fissione, fusione, energia per kiloton).",
      "Nuclear Weapon Archive, Nuclear Weapons FAQ, sez. 2 e 4 (livello concettuale).",
      "R. Rhodes, The Making of the Atomic Bomb, Simon & Schuster, 1986.",
      "V. Adamsky, Y. Smirnov, «Moscow's Biggest Bomb», Cold War International History Project Bulletin 4, 1994.",
    ],
  },
  {
    id: "palla-di-fuoco",
    part: "Fondamenti",
    title: "La palla di fuoco",
    kicker: "Il primo secondo",
    summary:
      "Dalla sfera di plasma al doppio lampo: come nasce la palla di fuoco, quanto è grande e perché l'impulso termico ha due massimi.",
    topics: ["palla-di-fuoco", "trinity", "diagrammi"],
    blocks: [
      {
        t: "p",
        text: "Nel primo milionesimo di secondo i residui dell'ordigno raggiungono decine di milioni di gradi ed emettono raggi X molli. L'aria li assorbe nel raggio di pochi metri e diventa a sua volta incandescente: nasce una sfera luminosa, la palla di fuoco, che cresce e si raffredda emettendo luce visibile e infrarossa.",
      },
      { t: "h", text: "Il doppio lampo" },
      {
        t: "p",
        text: "Visto da lontano, il lampo ha una firma caratteristica in due tempi. Il primo massimo dura pochi millisecondi: è la superficie dell'onda d'urto appena formata, caldissima. Subito dopo l'aria compressa e ionizzata davanti alla sfera diventa opaca e nasconde l'interno caldo: la luminosità crolla fino a un minimo. Quando l'onda d'urto si allontana e si raffredda torna trasparente (il «breakaway») e la palla di fuoco riappare: secondo massimo, molto più lungo, che porta circa il 99% dell'energia termica.",
      },
      {
        t: "p",
        text: "Questa firma è così tipica da essere stata usata dai satelliti Vela, dagli anni Sessanta, per riconoscere esplosioni nucleari in atmosfera: un lampo con due massimi e un minimo nel mezzo non ha cause naturali conosciute.",
      },
      { t: "formula", tex: "t_max ≈ 0,0417 · Y^0,44 s   (Y in kt)", caption: "Tempo del secondo massimo termico per uno scoppio in aria a bassa quota (Glasstone e Dolan, cap. 7)." },
      {
        t: "table",
        caption: "Tempo del secondo massimo e ordine di grandezza della palla di fuoco (stime per scoppio in aria vicino al livello del mare; raggio ≈ 55 m × Y^0,4, coerente con i circa 1.740 m di diametro massimo indicati da Glasstone e Dolan, §2.05, per 1 Mt).",
        head: ["Potenza", "t_max", "Raggio massimo indicativo"],
        rows: [
          ["1 kt", "≈ 0,04 s", "≈ 50–60 m"],
          ["15 kt", "≈ 0,14 s", "≈ 160–200 m"],
          ["100 kt", "≈ 0,32 s", "≈ 350–400 m"],
          ["1 Mt", "≈ 0,87 s", "≈ 0,85–1 km"],
          ["10 Mt", "≈ 2,4 s", "≈ 2–2,5 km"],
        ],
      },
      {
        t: "p",
        text: "Il raggio massimo cresce all'incirca come Y^0,4. Le stime differiscono fra le fonti di un 20–30% perché la palla di fuoco non ha un bordo netto: dipende da quale soglia di luminosità si sceglie. Una conseguenza pratica conta più del numero preciso: se la palla di fuoco tocca il suolo, aspira terreno e produce fallout locale abbondante. Per questo la quota dello scoppio decide la contaminazione.",
      },
      { t: "h", text: "Dopo il lampo" },
      {
        t: "list",
        items: [
          "Entro qualche secondo l'onda d'urto si stacca dalla palla di fuoco e prosegue da sola.",
          "La palla di fuoco, più leggera dell'aria circostante, sale come una mongolfiera a circa 75–100 m/s per le potenze maggiori, trascinando aria e, se vicina al suolo, polvere e detriti.",
          "Dopo alcune decine di secondi smette di essere luminosa e diventa la testa della nube a fungo.",
          "Per un megaton, circa il 75–80% dell'energia termica è emessa entro una decina di volte t_max, quindi in meno di dieci secondi: abbastanza perché un riparo improvvisato riduca le ustioni, non abbastanza perché chi è all'aperto possa reagire nel primo istante.",
        ],
      },
      { t: "fact", label: "Trinity, 16 luglio 1945", value: "a 25 millesimi di secondo la palla di fuoco aveva già un raggio di ≈ 130 m, cioè era larga ≈ 260 m (misure di G. I. Taylor sulle foto)" },
      { t: "figures", topic: "palla-di-fuoco" },
    ],
    sources: [
      "Glasstone e Dolan 1977, cap. 2 (§2.03–2.33, sviluppo della palla di fuoco) e cap. 7 (§7.80–7.89, impulso termico e t_max).",
      "Nuclear Weapon Archive, Nuclear Weapons FAQ, sez. 5.2.",
      "Los Alamos Scientific Laboratory, Trinity test photographic records (Berlyn Brixner), 1945.",
    ],
  },
  {
    id: "scala",
    part: "Fondamenti",
    title: "Le leggi di scala",
    kicker: "Perché mille volte più potente non vuol dire mille volte più lontano",
    summary:
      "La legge della radice cubica, perché le aree crescono come Y^(2/3), e perché molte testate piccole coprono più superficie di una grande.",
    topics: ["diagrammi", "onda-urto"],
    blocks: [
      {
        t: "p",
        text: "Un'onda d'urto riempie un volume. Se l'energia raddoppia, a parità di condizioni lo stesso livello di sovrapressione si trova a una distanza dove il volume racchiuso è raddoppiato. Il volume di una sfera cresce come il cubo del raggio, quindi la distanza cresce come la radice cubica dell'energia. È la legge di Hopkinson–Cranz, verificata sia con esplosivi chimici sia nei test nucleari.",
      },
      { t: "formula", tex: "R(Y) = R(1 kt) · Y^(1/3)", caption: "Scala alla radice cubica: distanza a cui si ha una data sovrapressione." },
      { t: "formula", tex: "A ∝ R² ∝ Y^(2/3)", caption: "L'area colpita cresce solo con la potenza elevata a due terzi." },
      {
        t: "table",
        caption: "Moltiplicatori di scala rispetto a 1 kt.",
        head: ["Potenza", "Raggio (×)", "Area (×)"],
        rows: [
          ["1 kt", "1", "1"],
          ["8 kt", "2", "4"],
          ["15 kt", "2,5", "6,1"],
          ["125 kt", "5", "25"],
          ["1 Mt", "10", "100"],
          ["50 Mt", "36,8", "1.357"],
        ],
      },
      {
        t: "p",
        text: "Da qui viene un risultato contro intuitivo che ha guidato gli arsenali dagli anni Settanta: dieci testate da 100 kt, ben distribuite, distruggono più area di una sola da 1 Mt, perché 10 × 100^(2/3) ≈ 215 contro 1000^(2/3) = 100. Per questo, con missili più precisi e testate multiple, la potenza media delle testate è scesa mentre il loro numero cresceva.",
      },
      { t: "h", text: "Non tutto scala allo stesso modo" },
      {
        t: "list",
        items: [
          "Onda d'urto: radice cubica, con correzioni per la quota e per la pressione dell'aria (scala di Sachs).",
          "Calore: la fluenza diminuisce con il quadrato della distanza e con l'assorbimento dell'aria, quindi i raggi termici crescono più in fretta della radice cubica, circa come Y^0,4, finché la foschia non li limita. Per le grandi potenze il calore è l'effetto con il raggio più ampio.",
          "Radiazione pronta: l'aria la assorbe in modo esponenziale, quindi il raggio cresce molto lentamente. Raddoppiare la potenza aggiunge solo qualche centinaio di metri.",
          "Fallout: dipende dalla frazione di fissione, dalla quota e dal vento, e si allunga sottovento per centinaia di chilometri: non è un cerchio e non obbedisce a una sola legge.",
        ],
      },
      {
        t: "table",
        caption: "Ordine di grandezza dei raggi per uno scoppio in aria a quota ottimale (atmosfera limpida; valori arrotondati da Glasstone e Dolan e dal fit di Brode).",
        head: ["Effetto", "15 kt", "100 kt", "1 Mt"],
        rows: [
          ["5 psi (34 kPa)", "≈ 1,7 km", "≈ 3,1 km", "≈ 6,7 km"],
          ["Ustioni di 3° grado", "≈ 1,9 km", "≈ 4,5 km", "≈ 11 km"],
          ["Dose pronta 5 Gy", "≈ 1,2–1,3 km", "≈ 1,6–1,8 km", "≈ 2,5–3 km"],
        ],
      },
      {
        t: "p",
        text: "La tabella mostra il cambio di regime. A 15 kt i tre cerchi hanno raggi confrontabili; a 1 Mt la radiazione pronta è tutta dentro l'area già distrutta dall'onda, e il calore arriva il doppio più lontano. Sono ordini di grandezza: umidità, nubi e terreno spostano i valori anche del 30–50%.",
      },
      { t: "figures", topic: "diagrammi" },
    ],
    sources: [
      "Glasstone e Dolan 1977, cap. 3 (§3.60–3.69, leggi di scala) e cap. 7 (§7.98).",
      "H. L. Brode, Airblast From Nuclear Bursts — Analytic Approximations, Pacific-Sierra Research, PSR Report 1419-3, 1986.",
      "Office of Technology Assessment 1979, cap. 2 e appendice A.",
    ],
  },

  // ───────────────────────────── EFFETTI ─────────────────────────────
  {
    id: "onda-urto",
    part: "Effetti",
    title: "L'onda d'urto",
    kicker: "Sovrapressione, vento e il muro che arriva dopo il lampo",
    summary:
      "Come si forma l'onda d'urto, la differenza fra sovrapressione e pressione dinamica, lo stelo di Mach, la quota ottimale e la tabella dei danni.",
    topics: ["onda-urto", "hiroshima", "diagrammi"],
    blocks: [
      {
        t: "p",
        text: "L'onda d'urto è un fronte di aria compressa che si allontana dal punto di scoppio a velocità supersonica e rallenta fino alla velocità del suono. Dietro il fronte la pressione sale di colpo sopra quella atmosferica (sovrapressione) e l'aria si muove in un vento violento verso l'esterno. Poi la pressione scende sotto il valore normale (fase negativa) e il vento si inverte, più debole.",
      },
      {
        t: "p",
        text: "Per 1 Mt, il fronte è a circa 5 km dopo 10 secondi e a circa 19 km dopo 50 secondi (Glasstone e Dolan, §2.32). Tra il lampo e l'arrivo dell'onda passa quindi un intervallo che cresce con la distanza: a Hiroshima, chi era a 3 km vide la luce qualche secondo prima del colpo, e molti feriti da vetri erano andati alla finestra a guardare.",
      },
      { t: "h", text: "Sovrapressione e pressione dinamica" },
      {
        t: "p",
        text: "Si usano due grandezze. La sovrapressione statica schiaccia: carica pareti e tetti dall'esterno. La pressione dinamica, legata al vento, spinge e trascina: rovescia veicoli, abbatte alberi e pali, proietta persone e detriti. Le strutture alte e leggere sono sensibili alla seconda, i pannelli ampi e chiusi alla prima.",
      },
      { t: "formula", tex: "q = 5p² / (2·(7P₀ + p))", caption: "Pressione dinamica di picco q in funzione della sovrapressione p (P₀ = pressione ambiente; aria ideale). A 10 psi, q ≈ 2,2 psi." },
      { t: "h", text: "Riflessione e stelo di Mach" },
      {
        t: "p",
        text: "In uno scoppio in aria, l'onda incidente colpisce il suolo e si riflette. Oltre una certa distanza dal punto zero l'onda riflessa, che viaggia nell'aria già scaldata e compressa, raggiunge quella incidente e le due si fondono in un unico fronte verticale, più forte di entrambe: lo stelo di Mach. È per sfruttare questo rinforzo che gli scoppi in aria sono più distruttivi, sulle strutture ordinarie, degli scoppi al suolo della stessa potenza.",
      },
      {
        t: "p",
        text: "Per ogni livello di sovrapressione esiste una quota di scoppio che lo porta più lontano. Per i 5 psi, nel fit di Brode usato da Ground Zero, è circa 276 m × Y^(1/3) (Y in kt): circa 680 m per 15 kt, 2,8 km per 1 Mt. Livelli più alti richiedono quote più basse. Hiroshima esplose a circa 580–600 m, Nagasaki a circa 500 m: quote vicine all'ottimo per i danni urbani.",
      },
      { t: "h", text: "Danni agli edifici" },
      {
        t: "table",
        caption: "Sovrapressione di picco e danni tipici (Glasstone e Dolan, cap. 5; OTA 1979). Il vento indicato è il picco a livello del mare.",
        head: ["Sovrapressione", "kPa", "Vento di picco", "Effetti tipici"],
        rows: [
          ["0,5–1 psi", "3,5–7", "≈ 30–60 km/h", "vetri rotti; ferite da schegge di vetro"],
          ["2 psi", "14", "≈ 110 km/h", "danni moderati alle case, tetti e infissi strappati"],
          ["3 psi", "21", "≈ 160 km/h", "case in legno e muratura leggera gravemente danneggiate"],
          ["5 psi", "34", "≈ 260 km/h", "crollo della maggior parte delle abitazioni; soglia storica della «distruzione urbana»"],
          ["10 psi", "69", "≈ 470 km/h", "edifici in cemento armato gravemente danneggiati o distrutti"],
          ["20 psi", "138", "≈ 800 km/h", "anche le strutture in cemento armato pesante crollano"],
        ],
      },
      { t: "h", text: "Effetti sulle persone" },
      {
        t: "p",
        text: "Il corpo umano tollera sovrapressioni sorprendentemente alte: sono necessari decine di psi per lesioni polmonari dirette. Ma in città la grande maggioranza delle vittime dell'onda non muore per la pressione: muore sotto i crolli, colpita da detriti e vetri, o scagliata contro superfici dure. Per questo le curve di mortalità usate in pianificazione (OTA 1979) sono molto più severe di quelle fisiologiche.",
      },
      {
        t: "table",
        caption: "Effetti diretti della sovrapressione sul corpo umano, onda di lunga durata (Glasstone e Dolan, Tab. 12.38; valori indicativi).",
        head: ["Effetto", "Sovrapressione"],
        rows: [
          ["Soglia di rottura del timpano", "≈ 5 psi (35 kPa)"],
          ["Rottura del timpano nel 50% dei casi", "≈ 15–20 psi (100–140 kPa)"],
          ["Soglia di lesione polmonare", "≈ 12–15 psi (80–100 kPa)"],
          ["Mortalità diretta del 50%", "≈ 40–60 psi (280–410 kPa)"],
        ],
      },
      {
        t: "table",
        caption: "Probabilità indicative di morte e ferimento per persone in edifici ordinari, secondo l'Office of Technology Assessment (1979).",
        head: ["Zona", "Morti", "Feriti"],
        rows: [
          ["Oltre 12 psi", "≈ 98%", "≈ 2%"],
          ["5–12 psi", "≈ 50%", "≈ 40%"],
          ["2–5 psi", "≈ 5%", "≈ 45%"],
          ["1–2 psi", "≈ 0–1%", "≈ 25%"],
        ],
      },
      { t: "fact", label: "Durata della fase positiva a 5 psi", value: "≈ 0,25–0,3 s per 1 kt; ≈ 2,5–3 s per 1 Mt (Glasstone e Dolan, fig. 3.76, scala Y^(1/3))" },
      {
        t: "p",
        text: "La durata conta: un'onda lunga carica una struttura più a fondo di una breve con lo stesso picco. Per questo una testata grande è più distruttiva, a parità di sovrapressione, di una piccola, e per questo le tabelle per strutture si riferiscono di solito a una potenza indicata.",
      },
      { t: "figures", topic: "onda-urto" },
    ],
    sources: [
      "Glasstone e Dolan 1977, cap. 3 (fenomeni dell'onda d'urto, §3.01–3.80), cap. 5 (danni alle strutture), cap. 12 (§12.38, lesioni da sovrapressione).",
      "H. L. Brode, Airblast From Nuclear Bursts — Analytic Approximations, PSR Report 1419-3, 1986.",
      "Office of Technology Assessment, The Effects of Nuclear War, 1979, cap. 2 (tabella delle probabilità di danno).",
      "U.S. Strategic Bombing Survey, The Effects of Atomic Bombs on Hiroshima and Nagasaki, 1946.",
    ],
  },
  {
    id: "termico",
    part: "Effetti",
    title: "L'impulso termico",
    kicker: "Ustioni, incendi e tempesta di fuoco",
    summary:
      "Quanta energia arriva su un centimetro quadrato, perché le soglie di ustione crescono con la potenza, come l'atmosfera filtra il calore e la differenza fra incendio esteso e tempesta di fuoco.",
    topics: ["termico", "hiroshima", "nagasaki"],
    blocks: [
      {
        t: "p",
        text: "Circa un terzo dell'energia di uno scoppio in aria esce come luce visibile e infrarossa. Viaggia alla velocità della luce, in linea retta: tutto ciò che vede la palla di fuoco la riceve, tutto ciò che è in ombra ne è protetto. A Hiroshima le «ombre» di persone e oggetti stampate su muri e gradini sono il segno di questa geometria.",
      },
      { t: "formula", tex: "Q = f · E · T / (4π D²)", caption: "Fluenza termica Q a distanza D: f frazione termica (≈ 0,35 in aria), E energia totale, T trasmissività dell'atmosfera." },
      {
        t: "p",
        text: "La fluenza si esprime per tradizione in calorie per centimetro quadrato (1 cal/cm² ≈ 41,8 kJ/m²). Per confronto, il sole di mezzogiorno estivo fornisce circa 0,02 cal/cm² al secondo: un impulso di 10 cal/cm² concentrato in un secondo equivale a qualche centinaio di soli.",
      },
      { t: "h", text: "Perché le soglie crescono con la potenza" },
      {
        t: "p",
        text: "La pelle smaltisce calore. Se la stessa energia arriva in un tempo più lungo, una parte viene dissipata e il danno è minore. Poiché l'impulso di un megaton dura secondi e quello di un kiloton frazioni di secondo, servono più calorie per ustionare con un'arma grande. Lo stesso vale per l'accensione dei materiali.",
      },
      {
        t: "table",
        caption: "Fluenze indicative per ustioni della pelle esposta (cal/cm²), pelle di pigmentazione media. Valori arrotondati dalle curve di Glasstone e Dolan (fig. 12.64; probabilità di ustione in fig. 12.65): per pelle chiara servono valori un po' più alti, per pelle scura circa il 10–15% in meno. La variabilità fra individui è ampia.",
        head: ["Potenza", "1° grado", "2° grado", "3° grado"],
        rows: [
          ["1 kt", "≈ 2", "≈ 4", "≈ 6"],
          ["10–20 kt", "≈ 2,4", "≈ 4,5", "≈ 7"],
          ["100 kt", "≈ 2,7", "≈ 5", "≈ 8,5"],
          ["1 Mt", "≈ 3,3", "≈ 6–6,5", "≈ 10"],
          ["10 Mt", "≈ 4", "≈ 7,5", "≈ 12"],
        ],
      },
      {
        t: "p",
        text: "Le ustioni di terzo grado su più del 20–25% della superficie corporea sono potenzialmente mortali anche con cure moderne; senza cure specializzate la soglia si abbassa. Le ustioni «da lampo» colpiscono le parti scoperte e rivolte verso lo scoppio; gli abiti chiari riflettono parte della luce, quelli scuri la assorbono. A Hiroshima i motivi dei kimono restarono impressi sulla pelle.",
      },
      { t: "h", text: "L'atmosfera come filtro" },
      {
        t: "list",
        items: [
          "Visibilità: con aria limpida (oltre 20–50 km di visibilità) la trasmissività resta alta per molti chilometri; con foschia o smog si riduce di un fattore due o più.",
          "Nubi: uno strato di nubi fra lo scoppio e il suolo può schermare gran parte del calore; uno strato sopra uno scoppio basso può rifletterlo verso terra e aumentarlo.",
          "Neve e superfici chiare riflettono e possono aumentare l'esposizione; la vegetazione fitta fa ombra.",
          "Lampo e cecità: anche a decine di chilometri, di notte, guardare la palla di fuoco può causare accecamento temporaneo (minuti) e, se l'immagine cade sulla retina, ustioni retiniche permanenti.",
        ],
      },
      { t: "h", text: "Incendi" },
      {
        t: "p",
        text: "Carta, tende, foglie secche e tessuti leggeri si accendono già tra 3 e 10 cal/cm². Molti incendi però nascono in modo indiretto: l'onda d'urto rovescia stufe e fornelli, rompe linee elettriche e tubature del gas. Nelle città del 1945, con case in legno e carta e la colazione sul fuoco, gli incendi secondari furono innumerevoli.",
      },
      {
        t: "p",
        text: "Si distinguono due regimi. In un incendio esteso (conflagrazione) il fronte si muove spinto dal vento e può percorrere grandi distanze. In una tempesta di fuoco migliaia di focolai si fondono in un'unica colonna convettiva che risucchia aria da ogni direzione con venti fino a 50–80 km/h verso il centro: dentro, la temperatura e la mancanza di ossigeno rendono la sopravvivenza quasi impossibile anche nei rifugi. Servono molto combustibile per metro quadrato, molti focolai simultanei e vento debole.",
      },
      {
        t: "table",
        caption: "Incendi delle due città nel 1945 (U.S. Strategic Bombing Survey 1946; Glasstone e Dolan, §7.73–7.77).",
        head: ["", "Hiroshima", "Nagasaki"],
        rows: [
          ["Potenza", "≈ 15 kt", "≈ 21 kt"],
          ["Inizio della tempesta di fuoco", "≈ 20 minuti dopo; picco in 2–3 ore", "non si sviluppò"],
          ["Area bruciata", "≈ 11–13 km²", "≈ 6–7 km² distrutti"],
          ["Motivo della differenza", "città piatta, densa, vento debole", "valli strette e colline, edifici più distanziati, vento"],
        ],
      },
      {
        t: "p",
        text: "La tempesta di fuoco di Hiroshima non fu unica nella guerra: Amburgo (luglio 1943) e Tokyo (marzo 1945) ne avevano già conosciute con bombardamenti convenzionali. La differenza fu che a Hiroshima bastò un aereo e un istante. Oggi le città hanno più cemento ma anche molto più combustibile per metro quadrato (arredi, plastiche, carburanti), e gli studi sul clima, come quelli di Toon e Robock, assumono che incendi urbani di grande scala siano probabili dopo uno scoppio sopra una città.",
      },
      { t: "figures", topic: "termico" },
    ],
    sources: [
      "Glasstone e Dolan 1977, cap. 7 (radiazione termica e suoi effetti, §7.01–7.110) e cap. 12 (§12.13–12.75, ustioni e lesioni oculari).",
      "U.S. Strategic Bombing Survey, The Effects of Atomic Bombs on Hiroshima and Nagasaki, 1946.",
      "Office of Technology Assessment 1979, cap. 2 (incendi e tempeste di fuoco).",
      "L. Eden, Whole World on Fire, Cornell University Press, 2004.",
    ],
  },
  {
    id: "radiazione-iniziale",
    part: "Effetti",
    title: "La radiazione iniziale",
    kicker: "Gamma e neutroni nel primo minuto",
    summary:
      "Che cosa misurano gray, sievert, rad e rem; quanta dose uccide; le tre forme della sindrome acuta da radiazione e perché la radiazione pronta pesa di più nelle armi piccole.",
    topics: ["radiazione", "medicina", "hiroshima"],
    blocks: [
      {
        t: "p",
        text: "Per convenzione la radiazione nucleare iniziale è quella emessa entro il primo minuto, il tempo in cui la nube sale abbastanza da portare i prodotti radioattivi fuori portata del suolo. Comprende raggi gamma, dalle fissioni e dalla cattura di neutroni nell'aria e nei prodotti di fissione, e neutroni veloci. L'aria la attenua in modo quasi esponenziale: ogni qualche centinaio di metri la dose si riduce di un fattore importante, ed è per questo che il suo raggio cresce poco con la potenza.",
      },
      { t: "h", text: "Le unità" },
      {
        t: "table",
        caption: "Unità di dose usate in radioprotezione e nella letteratura storica.",
        head: ["Unità", "Che cosa misura", "Equivalenze"],
        rows: [
          ["gray (Gy)", "dose assorbita: energia per unità di massa", "1 Gy = 1 J/kg = 100 rad"],
          ["rad", "unità storica della dose assorbita", "1 rad = 0,01 Gy"],
          ["sievert (Sv)", "dose equivalente/efficace, pesata per tipo di radiazione e organo", "1 Sv = 100 rem"],
          ["rem", "unità storica della dose equivalente", "1 rem = 0,01 Sv"],
          ["roentgen (R)", "esposizione: ionizzazione prodotta in aria dai gamma", "per i gamma, 1 R ≈ 0,0087 Gy in aria, ≈ 1 rad nei tessuti"],
        ],
      },
      {
        t: "p",
        text: "Per gli effetti acuti si ragiona in gray, perché il sievert è stato pensato per i rischi a lungo termine a basse dosi. Per confronto: un abitante dell'Italia riceve dal fondo naturale circa 2–3 mSv all'anno, una TAC addominale circa 10 mSv. Le dosi di cui parla questo capitolo sono da cento a mille volte maggiori, ricevute in pochi secondi.",
      },
      { t: "fact", label: "LD50/60 senza cure (dose al midollo)", value: "≈ 3,5–4,5 Gy" },
      { t: "fact", label: "LD50/60 con terapia intensiva moderna", value: "≈ 6–7 Gy (stima)" },
      { t: "h", text: "La sindrome acuta da radiazione" },
      {
        t: "p",
        text: "Sopra circa 1 Gy al corpo intero compare la sindrome acuta da radiazione (ARS). Si svolge in quattro fasi: prodromi (nausea, vomito, affaticamento, a volte febbre) nelle prime ore; una fase latente di apparente benessere; la fase di malattia manifesta; guarigione o morte. Più alta la dose, prima arrivano i sintomi e più breve è la latenza: il tempo di insorgenza del vomito è uno degli indicatori usati per stimare la dose ricevuta.",
      },
      {
        t: "table",
        caption: "Le forme della sindrome acuta (valori indicativi da UNSCEAR, IAEA e letteratura medica; dosi al corpo intero, radiazione a basso LET).",
        head: ["Forma", "Dose", "Organo critico", "Decorso tipico"],
        rows: [
          ["Lieve", "≈ 1–2 Gy", "midollo osseo", "nausea in alcuni; calo dei globuli bianchi; sopravvivenza quasi certa"],
          ["Ematopoietica", "≈ 2–6(8) Gy", "midollo osseo", "latenza 1–3 settimane; infezioni ed emorragie; morti fra 3 e 8 settimane, molte evitabili con cure"],
          ["Gastrointestinale", "≈ 6(8)–20(30) Gy", "mucosa intestinale", "vomito e diarrea entro ore; disidratazione, sepsi; morte in 1–2 settimane nella maggior parte dei casi"],
          ["Neurovascolare", "oltre ≈ 20–30 Gy", "sistema nervoso e vasi", "confusione, shock, collasso in minuti–ore; morte in 1–2 giorni"],
        ],
      },
      {
        t: "p",
        text: "Ustioni e traumi peggiorano molto la prognosi: si parla di lesioni combinate. Una dose che da sola sarebbe sopravvivibile diventa spesso letale se si aggiunge un'ustione estesa, perché il midollo danneggiato non riesce a difendere le ferite dalle infezioni. A Hiroshima e Nagasaki molte morti delle settimane successive ebbero questa origine.",
      },
      { t: "h", text: "Quanto lontano" },
      {
        t: "table",
        caption: "Distanza indicativa della dose pronta di 5 Gy all'aperto, misurata dal punto di scoppio (distanza obliqua; per uno scoppio alto la distanza al suolo è minore). Stime arrotondate da Glasstone e Dolan, fig. 8.33a–b, con i neutroni; dipendono da quota, umidità e tipo di ordigno, con incertezze fino a un fattore 2.",
        head: ["Potenza", "Raggio 5 Gy", "Raggio 5 psi"],
        rows: [
          ["1 kt", "≈ 0,7–0,8 km", "≈ 0,7 km"],
          ["15 kt", "≈ 1,2–1,3 km", "≈ 1,7 km"],
          ["100 kt", "≈ 1,6–1,8 km", "≈ 3,1 km"],
          ["1 Mt", "≈ 2,5–3 km", "≈ 6,7 km"],
        ],
      },
      {
        t: "p",
        text: "Sotto la decina di kiloton la radiazione pronta può arrivare più lontano dell'onda distruttiva: persone apparentemente illese possono aver ricevuto una dose letale. Sopra, il cerchio della radiazione resta quasi sempre dentro quello dei crolli. Edifici in cemento e terreno riducono molto la dose: un muro spesso o un seminterrato possono dimezzarla più volte.",
      },
      { t: "figures", topic: "medicina" },
    ],
    sources: [
      "Glasstone e Dolan 1977, cap. 8 (radiazione nucleare iniziale) e cap. 12 (§12.100–12.140, effetti biologici acuti).",
      "UNSCEAR 1988 Report, Annex G «Early effects in man of high doses of radiation».",
      "IAEA/WHO, Diagnosis and Treatment of Radiation Injuries, Safety Reports Series 2, 1998.",
      "Radiation Effects Research Foundation (RERF), dosimetria DS02 e DS86.",
    ],
  },
  {
    id: "fallout",
    part: "Effetti",
    title: "Il fallout",
    kicker: "La polvere che ricade, e la regola del sette e dieci",
    summary:
      "Fallout locale e globale, il decadimento t^-1,2 di Way e Wigner, la regola del 7:10, la dose integrata, i fattori di protezione degli edifici e la lezione di Castle Bravo.",
    topics: ["fallout", "difesa-civile", "termonucleari"],
    blocks: [
      {
        t: "p",
        text: "Il fallout è materiale radioattivo che ricade dalla nube. Quando la palla di fuoco tocca il suolo aspira centinaia di migliaia di tonnellate di terra e detriti; i prodotti di fissione si condensano su queste particelle, che ricadono in ore lungo la direzione del vento. È il fallout locale, il più pericoloso. Le particelle più fini, o quelle di uno scoppio in aria, salgono nella stratosfera e ricadono in mesi o anni su tutto l'emisfero: è il fallout globale, a dosi molto più basse.",
      },
      {
        t: "p",
        text: "Uno scoppio in aria abbastanza alto da non far toccare il suolo alla palla di fuoco produce poco fallout locale. Hiroshima e Nagasaki ebbero contaminazione locale modesta, concentrata nella «pioggia nera» che cadde nelle ore successive. Uno scoppio al suolo di potenza paragonabile può invece contaminare in modo letale centinaia di chilometri quadrati.",
      },
      { t: "h", text: "Quanto rapidamente decade" },
      {
        t: "p",
        text: "Il fallout è una miscela di centinaia di radionuclidi con tempi di dimezzamento diversi. Nel 1948 Katharine Way ed Eugene Wigner mostrarono che, sommati, decadono con buona approssimazione secondo una legge di potenza. È valida fra circa mezz'ora e sei mesi dopo lo scoppio.",
      },
      { t: "formula", tex: "R(t) = R₁ · t^(−1,2)   (t in ore)", caption: "Rateo di dose al tempo t, con R₁ rateo di riferimento a un'ora (H+1)." },
      {
        t: "p",
        text: "Ne discende una regola mnemonica usata dalla difesa civile: ogni volta che il tempo si moltiplica per sette, il rateo di dose si divide per dieci. Il rateo a un'ora, R₁, è una grandezza di riferimento: in molti punti il fallout arriva dopo, ma si usa comunque R₁ per descrivere la contaminazione di un luogo.",
      },
      {
        t: "table",
        caption: "Regola del 7:10 a partire da un rateo di riferimento di 1000 R/h (≈ 10 Gy/h) a H+1.",
        head: ["Tempo dopo lo scoppio", "Rateo di dose", "Frazione di R₁"],
        rows: [
          ["1 ora", "1000 R/h", "100%"],
          ["7 ore", "≈ 100 R/h", "10%"],
          ["49 ore (≈ 2 giorni)", "≈ 10 R/h", "1%"],
          ["343 ore (≈ 2 settimane)", "≈ 1 R/h", "0,1%"],
          ["≈ 100 giorni", "≈ 0,1 R/h", "0,01%"],
        ],
      },
      { t: "formula", tex: "D(t_a → t_b) = 5 · R₁ · (t_a^(−0,2) − t_b^(−0,2))", caption: "Dose accumulata fra l'arrivo t_a e l'uscita t_b, integrando la legge t^(−1,2)." },
      {
        t: "p",
        text: "L'integrale ha una conseguenza importante: una parte grande della dose che si riceverebbe restando all'aperto per sempre arriva nelle prime ore. Dal tempo di arrivo t_a all'infinito la dose totale è 5·R₁·t_a^(−0,2). Per un fallout che arriva un'ora dopo, le prime 6 ore danno circa il 30% della dose totale, il primo giorno e mezzo circa la metà, la prima settimana circa due terzi. Restare al riparo nei primi uno o due giorni è quindi la misura protettiva più efficace.",
      },
      { t: "h", text: "Fattori di protezione" },
      {
        t: "p",
        text: "Massa e distanza schermano. Il fattore di protezione (PF) è il rapporto fra la dose all'aperto e quella al riparo. Un PF di 10 riduce di dieci volte la dose; un PF di 40 è considerato dalla pianificazione statunitense il minimo per un rifugio adeguato.",
      },
      {
        t: "table",
        caption: "Fattori di protezione indicativi dal fallout (Glasstone e Dolan, cap. 9; FEMA, Planning Guidance for Response to a Nuclear Detonation, 2010/2022). Ordini di grandezza.",
        head: ["Luogo", "PF tipico"],
        rows: [
          ["All'aperto", "1"],
          ["Automobile", "≈ 1,5–2"],
          ["Casa in legno a un piano, piano terra", "≈ 2–3"],
          ["Casa in muratura, piano terra, stanza interna", "≈ 5–10"],
          ["Seminterrato di una casa", "≈ 10–20"],
          ["Edificio grande in cemento, piani centrali, nucleo interno", "≈ 20–100"],
          ["Seminterrato di edificio grande", "≈ 50–200"],
          ["Rifugio interrato o galleria profonda", "≥ 200–1000"],
        ],
      },
      { t: "h", text: "Castle Bravo, 1° marzo 1954" },
      {
        t: "p",
        text: "Il test più grande degli Stati Uniti, sull'atollo di Bikini, rese circa 15 Mt invece dei 4–8 attesi, per una reazione nucleare secondaria che i progettisti avevano sottovalutato. Il vento in quota era girato verso est. La nube depositò fallout pesante su un'area lunga centinaia di chilometri.",
      },
      {
        t: "list",
        items: [
          "Il peschereccio giapponese Daigo Fukuryū Maru, circa 130–160 km a est (le fonti variano), fu coperto di polvere bianca. I 23 uomini a bordo svilupparono la sindrome acuta; il marconista Aikichi Kuboyama morì nel settembre 1954 (la causa precisa, in cui pesò anche un'epatite da trasfusione, è discussa).",
          "Rongelap, a circa 180 km: 64 abitanti ricevettero dosi al corpo intero stimate attorno a 1,75–1,9 Gy prima di essere evacuati dopo circa due giorni; altri abitanti di Ailinginae e Utirik dosi minori. Negli anni seguenti emersero noduli e tumori della tiroide.",
          "L'incidente fece conoscere al mondo la parola fallout e spinse le prime campagne contro i test atmosferici, fino al trattato del 1963.",
        ],
      },
      { t: "figures", topic: "fallout" },
    ],
    sources: [
      "Glasstone e Dolan 1977, cap. 9 (fallout locale, §9.01–9.150; regola 7:10 §9.145; fattori di protezione §9.152 e sgg.).",
      "K. Way, E. P. Wigner, «The Rate of Decay of Fission Products», Physical Review 73, 1948.",
      "FEMA, Planning Guidance for Response to a Nuclear Detonation, 2ª ed. 2010, 3ª ed. 2022.",
      "R. A. Conard et al., rapporti medici di Brookhaven sulle Isole Marshall, 1955–1980.",
      "Nuclear Weapon Archive, «Operation Castle».",
    ],
  },
  {
    id: "crateri",
    part: "Effetti",
    title: "Crateri, scoppi sotterranei e subacquei",
    kicker: "Quando l'energia va nel terreno o nell'acqua",
    summary:
      "Come si forma un cratere, il test Sedan, l'onda di base di Crossroads Baker, le esplosioni contenute e il legame fra magnitudo sismica e potenza usato dalla verifica internazionale.",
    topics: ["crateri", "sotterranei", "subacquei"],
    blocks: [
      {
        t: "p",
        text: "Quando uno scoppio avviene sul terreno o poco sotto, parte dell'energia va nel suolo: lo vaporizza, lo frantuma e lo espelle formando un cratere. Il cratere apparente di uno scoppio al suolo da 1 Mt in terreno asciutto ha un diametro dell'ordine di 300–400 m e una profondità di qualche decina di metri. Per i bersagli molto resistenti, come i silos, conta questo e non la sovrapressione in aria.",
      },
      { t: "h", text: "Sedan, 6 luglio 1962" },
      {
        t: "p",
        text: "Nell'ambito del programma Plowshare, che studiava usi civili come lo scavo di canali e porti, gli Stati Uniti fecero esplodere 104 kt a 194 m di profondità nel deserto del Nevada. Il cratere è largo circa 390 m e profondo circa 98 m: furono spostati circa 11 milioni di tonnellate di terra. La nube radioattiva, finita fuori dal poligono, fu una delle maggiori fonti di contaminazione interna degli Stati Uniti nei test. Plowshare fu chiuso nel 1977.",
      },
      { t: "fact", label: "Cratere Sedan", value: "≈ 390 m di diametro, ≈ 98 m di profondità" },
      { t: "h", text: "Scoppi sotterranei contenuti" },
      {
        t: "p",
        text: "A profondità sufficienti (indicativamente oltre 100 m × Y^(1/3)) l'esplosione non raggiunge la superficie. Si forma una cavità di roccia fusa che poi crolla, lasciando spesso in superficie un cratere di sprofondamento. Dal 1963 quasi tutti i test sono stati di questo tipo; alcuni hanno comunque sfiatato gas radioattivi, come Baneberry in Nevada nel 1970.",
      },
      { t: "h", text: "Magnitudo sismica e potenza" },
      {
        t: "p",
        text: "Un'esplosione sotterranea genera onde sismiche registrabili in tutto il mondo. La rete del Sistema Internazionale di Monitoraggio del CTBTO usa la magnitudo delle onde di volume (mb) per stimarne la potenza. La relazione dipende dalla geologia e dalla profondità; per rocce dure e bene accoppiate una forma tipica è:",
      },
      { t: "formula", tex: "m_b ≈ 4,45 + 0,75 · log₁₀(Y)   (Y in kt)", caption: "Relazione indicativa per rocce dure (Bowers e Selby 2009). In terreni secchi e porosi la stessa potenza dà magnitudo più bassa." },
      {
        t: "table",
        caption: "Magnitudo e potenza dei test nordcoreani (stime pubbliche, ampie incertezze).",
        head: ["Data", "m_b", "Potenza stimata"],
        rows: [
          ["9 ottobre 2006", "≈ 4,1–4,3", "≈ 0,5–1 kt"],
          ["25 maggio 2009", "≈ 4,5–4,7", "≈ 2–5 kt"],
          ["12 febbraio 2013", "≈ 4,9–5,1", "≈ 6–16 kt"],
          ["6 gennaio 2016", "≈ 4,8–5,1", "≈ 7–10 kt"],
          ["9 settembre 2016", "≈ 5,1–5,3", "≈ 10–25 kt"],
          ["3 settembre 2017", "≈ 6,1–6,3", "≈ 70–280 kt (stima centrale 150–250)"],
        ],
      },
      { t: "h", text: "Sott'acqua" },
      {
        t: "p",
        text: "Il 25 luglio 1946, nel test Crossroads Baker, 23 kt esplosero a circa 27 m di profondità nella laguna di Bikini, sotto una flotta bersaglio di navi dismesse. Si sollevò una colonna d'acqua di circa 600 m di diametro e quasi 2 km di altezza; ricadendo, generò un'onda di base: un anello di nebbia radioattiva che scivolò sulla laguna per chilometri. Otto navi affondarono, e molte delle altre rimasero così contaminate che non fu possibile decontaminarle. Il chimico Glenn Seaborg lo definì «il primo disastro nucleare del mondo».",
      },
      {
        t: "list",
        items: [
          "In acqua l'onda d'urto viaggia più veloce e si attenua meno che in aria: è il meccanismo dei siluri e delle cariche di profondità nucleari degli anni Cinquanta e Sessanta.",
          "Wigwam (14 maggio 1955, circa 30 kt a circa 600 m di profondità nel Pacifico) misurò gli effetti sui sommergibili.",
          "Gli scoppi in acque basse possono generare onde superficiali, ma le stime di «tsunami nucleari» capaci di sommergere coste lontane sono state ripetutamente ridimensionate: gran parte dell'energia si dissipa vicino al punto di scoppio.",
        ],
      },
      { t: "figures", topic: "subacquei" },
      { t: "figures", topic: "crateri" },
    ],
    sources: [
      "Glasstone e Dolan 1977, cap. 6 (fenomeni nel suolo e crateri) e cap. 2 (§2.47–2.69, scoppi subacquei e onda di base).",
      "U.S. DOE/NV, United States Nuclear Tests July 1945 through September 1992, DOE/NV-209, rev. 16, 2015.",
      "N. D. Selby, D. Bowers, «A comparison of mb–yield relations», 2009, e rapporti NORSAR e CTBTO sui test nordcoreani.",
      "D. Bradley, No Place to Hide, 1948; W. Shurcliff, Bombs at Bikini, 1947.",
    ],
  },
  {
    id: "alta-quota",
    part: "Effetti",
    title: "Alta quota e impulso elettromagnetico",
    kicker: "Quando lo scoppio non tocca nulla, ma raggiunge tutto",
    summary:
      "Le tre componenti dell'impulso elettromagnetico (E1, E2, E3), Starfish Prime e i lampioni di Honolulu, le fasce di radiazione artificiali e la geometria dell'orizzonte.",
    topics: ["alta-quota", "diagrammi"],
    blocks: [
      {
        t: "p",
        text: "Sopra qualche decina di chilometri l'aria è troppo rarefatta per sostenere un'onda d'urto potente. I raggi gamma dello scoppio, però, raggiungono la parte alta dell'atmosfera (20–40 km) su un'area enorme e strappano elettroni alle molecole d'aria. Questi elettroni, deviati dal campo magnetico terrestre, irradiano un impulso elettromagnetico (EMP) che investe tutto ciò che è in vista dello scoppio.",
      },
      { t: "h", text: "Le tre componenti" },
      {
        t: "table",
        caption: "Componenti dell'impulso elettromagnetico da scoppio ad alta quota (Commissione EMP del Congresso USA, 2004–2008; IEC 61000-2-9).",
        head: ["Componente", "Durata", "Origine", "Bersagli tipici"],
        rows: [
          ["E1", "nanosecondi (salita ≈ 2–5 ns)", "elettroni Compton da raggi gamma", "elettronica, componenti a stato solido; campi fino a decine di kV/m"],
          ["E2", "microsecondi–millisecondi", "gamma diffusi e neutroni", "simile a un fulmine; pericoloso dopo E1, che può aver danneggiato le protezioni"],
          ["E3", "secondi–minuti", "perturbazione del campo magnetico terrestre", "linee elettriche e cavi lunghi, trasformatori; simile a una forte tempesta geomagnetica"],
        ],
      },
      { t: "h", text: "Starfish Prime, 9 luglio 1962" },
      {
        t: "p",
        text: "Gli Stati Uniti fecero esplodere 1,4 Mt a circa 400 km di quota sopra l'atollo Johnston, nel Pacifico. A Honolulu, a circa 1.450 km, si spensero circa 300 lampioni, scattarono allarmi antifurto e fu danneggiato un collegamento telefonico a microonde. Il cielo si accese di un'aurora artificiale visibile per minuti fino alle Hawaii e alle Samoa.",
      },
      {
        t: "p",
        text: "Gli elettroni iniettati nelle fasce di Van Allen formarono una fascia di radiazione artificiale che persistette per anni. Nei mesi successivi almeno sei o sette satelliti, fra cui Telstar 1, Ariel 1 e Transit 4B, subirono danni o si guastarono: allora circa un terzo dei satelliti in orbita bassa. Anche i test sovietici del Progetto K, nell'ottobre 1962 sopra il Kazakistan, produssero danni a linee elettriche e telefoniche.",
      },
      { t: "fact", label: "Starfish Prime", value: "1,4 Mt a 400 km; effetti a 1.450 km" },
      { t: "h", text: "La geometria dell'orizzonte" },
      {
        t: "p",
        text: "L'EMP di tipo E1 colpisce l'area da cui lo scoppio è visibile sopra l'orizzonte. La distanza al suolo fino all'orizzonte, per una quota h piccola rispetto al raggio terrestre R, è:",
      },
      { t: "formula", tex: "d ≈ √(2 · R · h)   (R ≈ 6371 km)", caption: "Raggio dell'area in linea di vista con uno scoppio a quota h." },
      {
        t: "table",
        caption: "Raggio dell'orizzonte geometrico per alcune quote.",
        head: ["Quota", "Raggio", "Ordine di grandezza"],
        rows: [
          ["30 km", "≈ 620 km", "una regione italiana grande"],
          ["100 km", "≈ 1.130 km", "l'Italia intera e i paesi vicini"],
          ["400 km", "≈ 2.260 km", "gran parte dell'Europa"],
        ],
      },
      {
        t: "p",
        text: "Il campo non è uniforme dentro il cerchio: dipende dall'angolo con il campo magnetico terrestre e diminuisce verso il bordo. Gli effetti sui sistemi civili moderni sono incerti, perché non ci sono test atmosferici dal 1980: le stime si basano su simulatori, sulle tempeste geomagnetiche (come quella del Québec nel 1989) e sui dati del 1962. Le valutazioni vanno da disturbi locali e recuperabili a danni gravi alle reti elettriche.",
      },
      { t: "figures", topic: "alta-quota" },
    ],
    sources: [
      "Glasstone e Dolan 1977, cap. 2 (§2.130–2.145, scoppi ad alta quota) e cap. 11 (impulso elettromagnetico).",
      "Report of the Commission to Assess the Threat to the United States from Electromagnetic Pulse (EMP) Attack, 2004 e 2008.",
      "C. N. Vittitoe, Did High-Altitude EMP Cause the Hawaiian Streetlight Incident?, Sandia National Laboratories, SAND88-3341, 1989.",
      "W. N. Hess, The Effects of High Altitude Explosions, NASA TN D-2402, 1964.",
    ],
  },
  {
    id: "nube",
    part: "Effetti",
    title: "La nube a fungo",
    kicker: "Salita, stabilizzazione e tropopausa",
    summary:
      "Come si forma il fungo, quanto sale e quanto ci mette, perché la tropopausa separa il fallout locale da quello globale.",
    topics: ["nube", "trinity", "tsar"],
    blocks: [
      {
        t: "p",
        text: "La palla di fuoco, calda e leggera, sale come una bolla. Raffreddandosi trascina dietro di sé una colonna di aria e, se lo scoppio è vicino al suolo, polvere e detriti: il gambo. In quota la bolla rallenta, si allarga a formare un vortice ad anello e diventa la testa del fungo. La nube smette di salire quando la sua densità eguaglia quella dell'aria circostante, di solito entro 6–10 minuti.",
      },
      {
        t: "p",
        text: "Il colore iniziale rossastro o bruno viene dagli ossidi di azoto prodotti dal calore; poi l'acqua condensa e la nube diventa bianca. Nei test a bassa quota su terreni umidi si vede spesso un anello di condensazione, la «nube di Wilson», per un istante attorno alla palla di fuoco.",
      },
      {
        t: "table",
        caption: "Quota della sommità della nube stabilizzata (ordini di grandezza, latitudini medie; da Glasstone e Dolan fig. 2.16 e 9.96, §2.17, e osservazioni dei test). Sotto circa 15 kt le quote sono misurate dal punto di scoppio. Le stime pubbliche variano del 20–30%; ai tropici, dove la tropopausa è più alta, le nubi dei test salirono di più.",
        head: ["Potenza", "Sommità", "Base della testa"],
        rows: [
          ["1 kt", "≈ 2,5–3,5 km", "≈ 1,5–2 km"],
          ["10 kt", "≈ 5,5–7 km", "≈ 3–3,5 km"],
          ["20 kt", "≈ 7–9 km", "≈ 4–5 km"],
          ["100 kt", "≈ 12–14 km", "≈ 6–8 km"],
          ["1 Mt", "≈ 20–22 km", "≈ 12–14 km"],
          ["10 Mt", "≈ 29–37 km", "≈ 20–22 km"],
          ["50 Mt (Tsar Bomba)", "≈ 60–67 km (osservata)", "≈ 30–40 km"],
        ],
      },
      { t: "h", text: "La tropopausa" },
      {
        t: "p",
        text: "La tropopausa è il confine fra la troposfera, dove avvengono la pioggia e il rimescolamento verticale, e la stratosfera, stabile e secca. Si trova fra circa 8–10 km ai poli e 16–18 km all'equatore; alle nostre latitudini attorno a 10–12 km. Sopra qualche centinaio di kiloton la nube la attraversa e deposita gran parte dei materiali fini nella stratosfera, dove restano mesi o anni prima di ricadere in tutto l'emisfero.",
      },
      {
        t: "list",
        items: [
          "Nube nella troposfera (potenze piccole): la ricaduta è quasi tutta locale e regionale, accelerata dalla pioggia.",
          "Nube nella stratosfera (potenze grandi): una parte sostanziale dei prodotti radioattivi diventa fallout globale. È per questo che lo stronzio-90 dei test degli anni Cinquanta e Sessanta si trova nei denti dei bambini nati in quegli anni in tutto il mondo.",
          "Il fumo degli incendi urbani può salire nella stratosfera per un processo diverso: il riscaldamento solare del fumo nero lo fa salire ancora. È il meccanismo alla base degli scenari di inverno nucleare.",
        ],
      },
      { t: "fact", label: "Tempo di salita tipico", value: "≈ 6–10 minuti alla quota finale" },
      { t: "fact", label: "Ivy Mike, 1952", value: "≈ 37–41 km di sommità; ≈ 160 km di larghezza della testa" },
      { t: "figures", topic: "nube" },
    ],
    sources: [
      "Glasstone e Dolan 1977, cap. 2 (§2.06–2.20, nube radioattiva; fig. 2.16 quote della nube) e cap. 9 (§9.50–9.80, fallout mondiale).",
      "Nuclear Weapon Archive, «Operation Ivy» e «The Tsar Bomba».",
      "L. Z. Reiss, «Strontium-90 absorption by deciduous teeth», Science 134, 1961 (Baby Tooth Survey di St. Louis).",
    ],
  },

  // ───────────────────────────── CONSEGUENZE ─────────────────────────────
  {
    id: "sanita",
    part: "Conseguenze",
    title: "Effetti sanitari e collasso dei servizi",
    kicker: "Quando l'ospedale è dentro il cerchio",
    summary:
      "Perché il numero di feriti conta quanto quello dei morti, cosa successe ai medici di Hiroshima, gli scenari dell'OTA e la scarsità dei letti per grandi ustionati.",
    topics: ["medicina", "hiroshima", "difesa-civile"],
    blocks: [
      {
        t: "p",
        text: "Le stime di vittime si concentrano sui morti, ma per chi deve prestare soccorso il problema sono i feriti: centinaia di migliaia di persone con ustioni, fratture, ferite da vetro e dosi di radiazione, in una città dove ospedali, strade, acqua, elettricità e comunicazioni sono stati colpiti nello stesso istante.",
      },
      { t: "h", text: "Hiroshima, il sistema sanitario" },
      {
        t: "p",
        text: "Secondo i dati raccolti dopo la guerra, dei circa 300 medici della città circa 270 furono uccisi o feriti, e dei circa 1.780 infermieri circa 1.650. Dei 45 ospedali civili solo 3 restarono utilizzabili. All'ospedale della Croce Rossa, a circa 1,5 km dal punto zero, uno dei pochi medici illesi curò migliaia di persone per giorni. Le medicazioni finirono in poche ore.",
      },
      { t: "fact", label: "Medici di Hiroshima uccisi o feriti", value: "≈ 270 su ≈ 300 (≈ 90%)" },
      { t: "h", text: "Gli scenari dell'OTA (1979)" },
      {
        t: "p",
        text: "Nel 1979 l'Office of Technology Assessment del Congresso degli Stati Uniti pubblicò uno studio rimasto un riferimento. Uno degli scenari è un singolo scoppio da 1 Mt su Detroit, con la popolazione di allora (circa 4,3 milioni nell'area metropolitana).",
      },
      {
        t: "table",
        caption: "Detroit, 1 Mt, scenario OTA 1979 (popolazione notturna, senza preavviso).",
        head: ["Tipo di scoppio", "Morti", "Feriti"],
        rows: [
          ["In aria (≈ 1,8 km di quota)", "≈ 470.000", "≈ 630.000"],
          ["Al suolo", "≈ 220.000", "≈ 420.000"],
        ],
      },
      {
        t: "p",
        text: "Lo scoppio al suolo uccide meno nell'immediato perché i cerchi dell'onda sono più piccoli, ma produce fallout letale sottovento, con morti nei giorni successivi che dipendono dal vento e dai rifugi. Per una guerra su larga scala fra Stati Uniti e Unione Sovietica, lo stesso studio stimava fra 20 e 165 milioni di morti statunitensi, a seconda degli scenari, e concludeva che gli effetti indiretti (fame, malattie, collasso economico) avrebbero potuto superare quelli diretti.",
      },
      { t: "h", text: "Letti per ustionati" },
      {
        t: "p",
        text: "Un grande ustionato richiede settimane di terapia intensiva, trasfusioni, chirurgia ripetuta e personale specializzato. Gli Stati Uniti hanno circa 1.800–2.000 letti in centri specializzati per ustioni, numero rimasto dello stesso ordine dal 1979; in Italia i centri grandi ustionati sono una ventina, con qualche centinaio di posti. Un solo scoppio su una città può produrre decine di migliaia di ustionati gravi: più dei posti disponibili in un intero continente.",
      },
      {
        t: "list",
        items: [
          "Triage: in uno scenario di massa le risorse vanno a chi ha probabilità di sopravvivere con cure minime; molti feriti gravi ricevono solo terapia palliativa.",
          "Lesioni combinate: radiazione più ustioni o traumi aumentano molto la mortalità e la richiesta di cure.",
          "Acqua e igiene: la mancanza di acqua potabile e di fognature funzionanti favorisce le epidemie nelle settimane successive.",
          "Personale: i soccorritori stessi sono limitati dalla dose che possono ricevere nelle zone contaminate.",
          "Salute mentale: lutto, sfollamento e stigma pesano per decenni, come mostrano gli studi sugli hibakusha.",
        ],
      },
      {
        t: "quote",
        text: "Una guerra nucleare non può essere vinta e non deve mai essere combattuta.",
        who: "Dichiarazione congiunta Reagan–Gorbačëv, Ginevra, 1985",
      },
      { t: "figures", topic: "medicina" },
    ],
    sources: [
      "Office of Technology Assessment, The Effects of Nuclear War, 1979, cap. 2 (Detroit e Leningrado) e cap. 4.",
      "Committee for the Compilation of Materials on Damage Caused by the Atomic Bombs, Hiroshima and Nagasaki: The Physical, Medical, and Social Effects of the Atomic Bombings, 1981.",
      "International Physicians for the Prevention of Nuclear War (IPPNW), rapporti sulle conseguenze umanitarie, 2013–2022.",
      "American Burn Association, Burn Care Resources in North America.",
    ],
  },
  {
    id: "lungo-termine",
    part: "Conseguenze",
    title: "Effetti a lungo termine",
    kicker: "Settant'anni di sopravvissuti seguiti uno per uno",
    summary:
      "Il Life Span Study della RERF, l'eccesso di leucemie e tumori solidi, il rischio relativo per gray e quello che gli studi non hanno trovato.",
    topics: ["medicina", "hiroshima", "nagasaki"],
    blocks: [
      {
        t: "p",
        text: "Dal 1950 la Radiation Effects Research Foundation (RERF, prima Atomic Bomb Casualty Commission), istituzione nippo-statunitense, segue una coorte di circa 120.000 persone: circa 94.000 sopravvissuti presenti in città al momento dei bombardamenti e circa 27.000 residenti che erano altrove. È il Life Span Study, la principale fonte sui rischi della radiazione per l'essere umano e la base delle norme internazionali di radioprotezione.",
      },
      { t: "h", text: "Leucemie" },
      {
        t: "p",
        text: "Le leucemie furono il primo effetto tardivo a comparire. L'eccesso si vide dopo circa due anni, con un picco fra cinque e dieci anni dopo l'esposizione, e poi diminuì. Fra i sopravvissuti con dosi significative, circa metà delle morti per leucemia è attribuibile alla radiazione; in numero assoluto, gli eccessi sono qualche decina–un centinaio nell'intera coorte.",
      },
      { t: "h", text: "Tumori solidi" },
      {
        t: "p",
        text: "I tumori solidi aumentano più lentamente e il rischio persiste per tutta la vita. L'aumento è approssimativamente proporzionale alla dose. Si esprime come eccesso di rischio relativo (ERR): la frazione in più rispetto al tasso normale.",
      },
      { t: "fact", label: "ERR per tumori solidi (incidenza)", value: "≈ 0,47 per Gy, media fra i sessi (esposti a 30 anni, a 70 anni di età; Preston et al. 2007)" },
      {
        t: "p",
        text: "Detto in altro modo: una dose di 1 Gy aumenta di circa il 50% il rischio di tumore solido rispetto a chi non è stato esposto. Nella coorte, su circa 17.400 primi tumori solidi diagnosticati fra il 1958 e il 1998, circa 850 sono attribuiti alla radiazione (Preston et al. 2007): circa il 5% del totale, circa l'11% fra chi aveva ricevuto una dose apprezzabile, e circa la metà fra chi aveva ricevuto più di 1 Gy. L'aggiornamento al 2009 (Grant et al. 2017) conta circa 22.500 tumori solidi, di cui circa 990 attribuibili alla radiazione. Il rischio è maggiore per chi era bambino al momento dell'esposizione e per le donne.",
      },
      {
        t: "table",
        caption: "Effetti tardivi osservati e non osservati nel Life Span Study (sintesi RERF e UNSCEAR).",
        head: ["Effetto", "Esito"],
        rows: [
          ["Leucemie", "aumento chiaro, picco a 5–10 anni"],
          ["Tumori solidi (stomaco, polmone, mammella, tiroide, colon…)", "aumento proporzionale alla dose, per tutta la vita"],
          ["Malattie cardiovascolari", "aumento probabile sopra ≈ 0,5 Gy, dibattuto a dosi minori"],
          ["Cataratta", "aumento, soglia bassa (≈ 0,5 Gy o meno)"],
          ["Esposizione in utero", "microcefalia e ritardo mentale, soprattutto fra 8 e 15 settimane di gestazione"],
          ["Effetti ereditari nei figli dei sopravvissuti", "nessun aumento statisticamente rilevabile finora"],
        ],
      },
      {
        t: "p",
        text: "L'assenza di effetti ereditari rilevabili non significa che non esistano: nei topi la radiazione causa mutazioni ereditarie, e i limiti statistici dello studio sono noti. Ma il risultato ha contraddetto le paure più diffuse degli anni Cinquanta, e ha pesato sullo stigma sociale che gli hibakusha e i loro figli hanno subito, ad esempio nei matrimoni.",
      },
      { t: "h", text: "Basse dosi" },
      {
        t: "p",
        text: "Sotto circa 100 mSv l'eccesso di rischio è troppo piccolo per essere misurato direttamente in una popolazione. La radioprotezione assume per prudenza il modello lineare senza soglia (LNT), che estrapola il rischio verso il basso: circa il 5% di rischio di morte per tumore per sievert di dose efficace (ICRP 103). È una convenzione utile per proteggere, non una misura precisa delle basse dosi.",
      },
      { t: "figures", topic: "medicina" },
    ],
    sources: [
      "D. L. Preston et al., «Solid cancer incidence in atomic bomb survivors: 1958–1998», Radiation Research 168, 2007.",
      "K. Ozasa et al., «Studies of the mortality of atomic bomb survivors, Report 14, 1950–2003», Radiation Research 177, 2012.",
      "E. J. Grant et al., «Solid Cancer Incidence among the Life Span Study of Atomic Bomb Survivors: 1958–2009», Radiation Research 187, 2017.",
      "Radiation Effects Research Foundation, www.rerf.or.jp, schede divulgative sul Life Span Study.",
      "UNSCEAR 2006 Report, Annex A «Epidemiological studies of radiation and cancer».",
      "ICRP Publication 103, 2007.",
    ],
  },
  {
    id: "clima",
    part: "Conseguenze",
    title: "Clima e inverno nucleare",
    kicker: "Il fumo delle città nella stratosfera",
    summary:
      "Dallo studio TTAPS del 1983 ai modelli climatici di Robock e Toon, la quantità di fuliggine dei diversi scenari, il crollo dei raccolti e le critiche al modello.",
    topics: ["diagrammi", "termico"],
    blocks: [
      {
        t: "p",
        text: "Nel 1983 Richard Turco, Owen Toon, Thomas Ackerman, James Pollack e Carl Sagan (lo studio TTAPS, dalle iniziali) pubblicarono su Science un calcolo che cambiò il dibattito: il fumo di centinaia di città in fiamme, salito in alta atmosfera, avrebbe potuto oscurare il sole per settimane e raffreddare i continenti di decine di gradi. Nacque l'espressione «inverno nucleare».",
      },
      {
        t: "p",
        text: "Il meccanismo non è la polvere sollevata dalle esplosioni ma la fuliggine nera degli incendi urbani e industriali. Il fumo nero assorbe la luce solare, si riscalda e sale ancora, fino nella stratosfera, dove non piove e le particelle restano anni. Sotto, la superficie si raffredda e le precipitazioni diminuiscono.",
      },
      { t: "h", text: "I modelli recenti" },
      {
        t: "p",
        text: "I primi modelli erano semplici e furono criticati, e negli anni Ottanta si parlò di «autunno nucleare». Dal 2007 Alan Robock, Owen Toon e colleghi hanno ripreso la questione con modelli climatici moderni: i raffreddamenti sono un po' più piccoli dei primi calcoli ma durano di più, perché la fuliggine resta in stratosfera per anni.",
      },
      {
        t: "table",
        caption: "Scenari di fuliggine in stratosfera e raffreddamento medio globale della superficie (Robock et al. 2007; Toon et al. 2019; Coupe et al. 2019). Sulle terre emerse e nelle zone agricole il raffreddamento è maggiore: da circa 1,5 °C (5 Tg) a circa 15 °C (150 Tg) secondo Xia et al. 2022. 1 Tg = un milione di tonnellate. Valori indicativi.",
        head: ["Scenario", "Fuliggine", "Raffreddamento globale"],
        rows: [
          ["Guerra regionale, 100 armi da 15 kt su città", "≈ 5 Tg", "≈ 1–1,5 °C per alcuni anni"],
          ["India–Pakistan, 250 armi da 15–100 kt (fino a 500 negli scenari più ampi)", "≈ 16–36 Tg (fino a 47 Tg)", "≈ 2–5 °C"],
          ["Stati Uniti–Russia, frazione degli arsenali", "≈ 50 Tg", "≈ 3,5–4 °C"],
          ["Stati Uniti–Russia, guerra totale", "≈ 150 Tg", "≈ 7–10 °C, oltre un decennio di recupero"],
        ],
      },
      { t: "h", text: "Raccolti e fame" },
      {
        t: "p",
        text: "Nel 2022 Lili Xia e colleghi, su Nature Food, hanno collegato gli scenari climatici a modelli di raccolti e pesca. Il risultato è che la carestia, non le esplosioni, sarebbe la principale causa di morte di una guerra nucleare.",
      },
      {
        t: "table",
        caption: "Calo medio mondiale delle calorie prodotte da colture principali e pesca nel secondo anno, e persone senza cibo alla fine del secondo anno, ipotizzando commercio internazionale interrotto e metà dei mangimi destinata all'alimentazione umana (Xia et al. 2022, tab. 1 e tab. S1). Stime con grandi incertezze.",
        head: ["Fuliggine", "Calo calorico medio mondiale (anno 2)", "Persone senza cibo a fine anno 2"],
        rows: [
          ["5 Tg", "≈ 7%", "≈ 255 milioni"],
          ["16 Tg", "≈ 23%", "≈ 0,9 miliardi"],
          ["27 Tg", "≈ 33%", "≈ 1,4 miliardi"],
          ["37 Tg", "≈ 41%", "≈ 2,1 miliardi"],
          ["47 Tg", "≈ 48%", "≈ 2,5 miliardi"],
          ["150 Tg", "≈ 82% (≈ 90% per le sole colture dopo 3–4 anni)", "≈ 5,3 miliardi"],
        ],
      },
      { t: "h", text: "Il dibattito" },
      {
        t: "list",
        items: [
          "Quanta fuliggine produce una città che brucia dipende dal combustibile per metro quadrato e dal tipo di incendio: è il parametro più incerto.",
          "Uno studio del Los Alamos National Laboratory (Reisner et al. 2018) ha ottenuto, per lo scenario regionale, molta meno fuliggine in stratosfera perché nelle sue simulazioni gli incendi non diventavano tempeste di fuoco. Toon e Robock hanno contestato le ipotesi sul combustibile.",
          "Gli incendi canadesi del 2017 e australiani del 2019–2020 hanno mostrato fumo salito fino alla stratosfera per autoriscaldamento, confermando il meccanismo su scala più piccola.",
          "Il rapporto delle Accademie nazionali statunitensi «Potential Environmental Effects of Nuclear War» (giugno 2025), che non ha prodotto nuove simulazioni, considera fisicamente plausibili l'oscuramento e il raffreddamento, ma conclude che le incertezze sono grandi, soprattutto su incendi e quota della fuliggine, e si sommano lungo la catena dagli scenari agli effetti sociali; raccomanda confronti sistematici fra modelli.",
        ],
      },
      {
        t: "p",
        text: "Ground Zero non calcola il clima. Scala la fuliggine, con un fattore largo, sull'area urbana che può bruciare, e sotto qualche centesimo di teragrammo dice semplicemente che un inverno nucleare non nasce da un singolo scoppio.",
      },
      { t: "figures", topic: "diagrammi" },
    ],
    sources: [
      "R. P. Turco, O. B. Toon, T. P. Ackerman, J. B. Pollack, C. Sagan, «Nuclear Winter: Global Consequences of Multiple Nuclear Explosions», Science 222, 1983.",
      "A. Robock, L. Oman, G. L. Stenchikov, «Nuclear winter revisited with a modern climate model», J. Geophys. Res. 112, 2007.",
      "O. B. Toon et al., «Rapidly expanding nuclear arsenals in Pakistan and India portend regional and global catastrophe», Science Advances 5, 2019.",
      "J. Coupe et al., «Nuclear winter responses to nuclear war between the United States and Russia», J. Geophys. Res. Atmospheres 124, 2019.",
      "L. Xia et al., «Global food insecurity and famine from reduced crop, marine fishery and livestock production due to climate disruption from nuclear war soot injection», Nature Food 3, 2022.",
      "J. Reisner et al., «Climate impact of a regional nuclear weapons exchange», J. Geophys. Res. Atmospheres 123, 2018.",
      "National Academies of Sciences, Engineering, and Medicine, Potential Environmental Effects of Nuclear War, 2025.",
    ],
  },
  {
    id: "ambiente",
    part: "Conseguenze",
    title: "Ambiente e contaminazione",
    kicker: "Isotopi, tempi di dimezzamento e il carbonio della bomba",
    summary:
      "Quali radionuclidi contano e per quanto tempo, cosa ha lasciato mezzo secolo di test nell'ambiente e come si misura ancora oggi.",
    topics: ["fallout", "radiazione"],
    blocks: [
      {
        t: "p",
        text: "Dopo le prime settimane gran parte della radioattività del fallout è decaduta. Restano pochi isotopi a vita media più lunga, che entrano nel suolo, nell'acqua e nella catena alimentare e determinano il rischio per anni o decenni.",
      },
      {
        t: "table",
        caption: "Radionuclidi principali del fallout e loro comportamento ambientale (dati nucleari standard; UNSCEAR 2000).",
        head: ["Isotopo", "Tempo di dimezzamento", "Comportamento e organo bersaglio"],
        rows: [
          ["Iodio-131", "8,0 giorni", "latte fresco; si concentra nella tiroide, soprattutto nei bambini"],
          ["Bario-140 / Lantanio-140", "12,8 giorni", "contribuisce alla dose esterna delle prime settimane"],
          ["Zirconio-95", "64 giorni", "dose esterna dei primi mesi"],
          ["Stronzio-90", "28,8 anni", "si comporta come il calcio: ossa e denti"],
          ["Cesio-137", "30,1 anni", "si comporta come il potassio: muscoli; dose esterna dal suolo per decenni"],
          ["Trizio (idrogeno-3)", "12,3 anni", "acqua; bassa energia"],
          ["Carbonio-14", "≈ 5.700 anni", "entra in ogni essere vivente"],
          ["Plutonio-239", "≈ 24.100 anni", "poco mobile; pericoloso se inalato"],
        ],
      },
      { t: "h", text: "L'eredità dei test" },
      {
        t: "p",
        text: "Fra il 1945 e il 1980 furono eseguiti 543 test atmosferici (secondo il conteggio UNSCEAR, che include alcuni test di sicurezza), per una potenza totale di circa 440 Mt, di cui circa 189 Mt da fissione. Fu la principale fonte di contaminazione radioattiva artificiale del pianeta, molto più di Černobyl' per l'emisfero nord nel suo complesso.",
      },
      { t: "fact", label: "Dose efficace media mondiale dai test, picco del 1963", value: "≈ 0,11 mSv all'anno" },
      {
        t: "p",
        text: "Il valore medio è piccolo rispetto al fondo naturale (circa 2,4 mSv all'anno nel mondo), ma la distribuzione era molto disuguale: le popolazioni vicine ai poligoni (Nevada e Utah, Semipalatinsk, Isole Marshall, Polinesia, Maralinga) ricevettero dosi molto più alte. Gli Stati Uniti hanno istituito nel 1990 un programma di indennizzo per i «downwinders»; il Kazakistan e le Isole Marshall convivono con le conseguenze sanitarie e sociali.",
      },
      { t: "h", text: "Il carbonio della bomba" },
      {
        t: "p",
        text: "I test hanno quasi raddoppiato la concentrazione di carbonio-14 nell'atmosfera dell'emisfero nord fra il 1955 e il 1963. Dopo il trattato del 1963 il picco è sceso lentamente, assorbito da oceani e biosfera. Questo segnale, la «curva della bomba», è diventato uno strumento scientifico: permette di datare tessuti umani, avori e vini, e di misurare il ricambio delle cellule del cervello. Plutonio e carbonio-14 dei test sono fra i candidati a marcare l'inizio dell'Antropocene nei sedimenti.",
      },
      { t: "figures", topic: "fallout" },
    ],
    sources: [
      "UNSCEAR 2000 Report, Annex C «Exposures from man-made sources of radiation» (test atmosferici).",
      "Glasstone e Dolan 1977, cap. 9 (§9.50–9.120, fallout mondiale e radionuclidi a vita lunga).",
      "National Cancer Institute, Estimated Exposures and Thyroid Doses Received by the American People from Iodine-131 in Fallout Following Nevada Atmospheric Nuclear Bomb Tests, 1997.",
      "Q. Hua, M. Barbetti, A. Z. Rakowski, «Atmospheric radiocarbon for the period 1950–2010», Radiocarbon 55, 2013.",
    ],
  },

  // ───────────────────────────── STORIA ─────────────────────────────
  {
    id: "manhattan",
    part: "Storia",
    title: "Il Progetto Manhattan",
    kicker: "Dalla fissione scoperta in laboratorio al deserto di Alamogordo",
    summary:
      "Dalla scoperta della fissione nel 1938 al test Trinity: la lettera di Einstein, la prima pila di Fermi, Los Alamos, i costi e le persone.",
    topics: ["manhattan", "trinity"],
    blocks: [
      {
        t: "p",
        text: "Nel dicembre 1938 Otto Hahn e Fritz Strassmann, a Berlino, trovarono bario in uranio bombardato con neutroni. Lise Meitner e Otto Frisch, in esilio, compresero che il nucleo si era spezzato e calcolarono l'energia liberata. Nel giro di pochi mesi i fisici di mezzo mondo capirono che una reazione a catena era possibile, e che la Germania nazista poteva arrivarci per prima.",
      },
      {
        t: "p",
        text: "Il 2 agosto 1939 Albert Einstein firmò una lettera, scritta con Leó Szilárd, al presidente Roosevelt. Ne seguirono un comitato e finanziamenti modesti. Il 2 dicembre 1942, sotto le tribune dello stadio dell'Università di Chicago, il gruppo di Enrico Fermi ottenne la prima reazione a catena controllata con la pila CP-1. Fra i protagonisti italiani del progetto ci furono anche Emilio Segrè e Bruno Rossi.",
      },
      { t: "h", text: "Un'industria segreta" },
      {
        t: "p",
        text: "Dal settembre 1942, sotto il generale Leslie Groves, il Manhattan Engineer District divenne un'impresa industriale: impianti a Oak Ridge, nel Tennessee, e Hanford, nello stato di Washington, per produrre i materiali; un laboratorio di progettazione a Los Alamos, nel Nuovo Messico, diretto da J. Robert Oppenheimer dal 1943. Collaborarono il Regno Unito e il Canada.",
      },
      { t: "fact", label: "Costo del progetto (1942–1946)", value: "≈ 2 miliardi di dollari dell'epoca" },
      { t: "fact", label: "Persone impiegate al picco", value: "≈ 125.000–130.000" },
      {
        t: "p",
        text: "Quasi tutti lavoravano senza sapere a che cosa. Le città segrete di Oak Ridge e Hanford sorsero su terre espropriate a comunità agricole e native; a Hanford le scorie di quegli anni sono ancora oggi uno dei maggiori problemi di bonifica degli Stati Uniti.",
      },
      { t: "h", text: "Trinity, 16 luglio 1945" },
      {
        t: "p",
        text: "Alle 5:29:45 ora locale, nel poligono di Alamogordo, esplose il primo ordigno nucleare, posto su una torre di acciaio di 30 m. La potenza, stimata a lungo in circa 21 kt, è stata rivalutata nel 2021 a circa 25 kt. Il lampo fu visto a centinaia di chilometri; la sabbia fusa formò un vetro verdastro, la trinitite. Il fallout ricadde su allevamenti e villaggi del Nuovo Messico i cui abitanti non furono avvertiti né indennizzati per decenni.",
      },
      {
        t: "quote",
        text: "Ora sono diventato Morte, il distruttore di mondi.",
        who: "J. R. Oppenheimer, ricordando la Bhagavad Gita, intervista NBC del 1965",
      },
      {
        t: "p",
        text: "Pochi giorni prima, a Chicago, 70 scienziati guidati da Szilárd avevano firmato una petizione al presidente per chiedere che la bomba non fosse usata senza prima dare al Giappone la possibilità di arrendersi. Il rapporto Franck aveva proposto una dimostrazione in un luogo disabitato. Nessuno dei due documenti arrivò in tempo sulla scrivania di Truman.",
      },
      { t: "figures", topic: "manhattan" },
      { t: "figures", topic: "trinity" },
    ],
    sources: [
      "R. Rhodes, The Making of the Atomic Bomb, Simon & Schuster, 1986.",
      "U.S. Department of Energy, The Manhattan Project: An Interactive History, Office of History and Heritage Resources.",
      "H. D. Smyth, Atomic Energy for Military Purposes (rapporto Smyth), 1945.",
      "A. Selby et al., «A new yield assessment for the Trinity nuclear test, 75 years later», Nuclear Technology 207, 2021.",
    ],
  },
  {
    id: "hiroshima-nagasaki",
    part: "Storia",
    title: "Hiroshima e Nagasaki",
    kicker: "Le sole due volte",
    summary:
      "La cronologia delle due giornate, le potenze, le quote di scoppio e le stime delle vittime con la loro incertezza.",
    topics: ["hiroshima", "nagasaki"],
    blocks: [
      {
        t: "p",
        text: "Sono le uniche due armi nucleari mai usate in guerra. Tutto ciò che sappiamo sugli effetti sulle persone viene, in ultima analisi, da quei due giorni e dagli anni che seguirono.",
      },
      { t: "h", text: "Hiroshima, lunedì 6 agosto 1945" },
      {
        t: "table",
        caption: "Cronologia essenziale (ora locale).",
        head: ["Ora", "Evento"],
        rows: [
          ["7:09", "allarme aereo: passa l'aereo meteorologico Straight Flush"],
          ["7:31", "cessato allarme; la città riprende la giornata, molti studenti sono all'aperto per lavori di demolizione antincendio"],
          ["8:15", "il B-29 Enola Gay sgancia Little Boy; scoppio dopo circa 43 secondi a circa 580–600 m sopra l'ospedale Shima"],
          ["8:15–8:30", "crolli in tutto il centro; migliaia di focolai"],
          ["≈ 8:40", "inizia la formazione della tempesta di fuoco, che raggiunge il massimo in 2–3 ore"],
          ["≈ 9:00–16:00", "a nord-ovest cade la «pioggia nera», carica di fuliggine e radioattività"],
          ["sera", "le prime notizie raggiungono Tokyo; 16 ore dopo Truman annuncia la bomba"],
        ],
      },
      { t: "fact", label: "Hiroshima", value: "≈ 15 kt (13–18) a ≈ 600 m di quota" },
      { t: "h", text: "Nagasaki, giovedì 9 agosto 1945" },
      {
        t: "p",
        text: "Il bersaglio principale era Kokura, coperta da nubi e fumo. Il B-29 Bockscar ripiegò su Nagasaki, anch'essa nuvolosa; il bombardiere sganciò Fat Man alle 11:02 attraverso uno squarcio, circa 2–3 km a nord del punto previsto, sopra la valle dell'Urakami. Le colline schermarono il centro storico: la potenza era maggiore di Hiroshima, i morti meno. Il quartiere dell'Urakami, il cuore della comunità cattolica giapponese, con la sua cattedrale, fu distrutto.",
      },
      { t: "fact", label: "Nagasaki", value: "≈ 21 kt (19–23) a ≈ 500 m di quota" },
      { t: "h", text: "Quanti morti" },
      {
        t: "p",
        text: "Non esiste un numero esatto. I registri erano distrutti, molti militari, lavoratori coreani e sfollati non erano censiti, interi nuclei familiari scomparvero senza testimoni. Le stime dipendono dalla data di riferimento e dal metodo.",
      },
      {
        t: "table",
        caption: "Stime di popolazione e vittime (RERF; Committee for the Compilation 1981; città di Hiroshima e Nagasaki).",
        head: ["", "Hiroshima", "Nagasaki"],
        rows: [
          ["Popolazione presente", "≈ 340.000–350.000", "≈ 250.000–270.000"],
          ["Morti entro fine 1945", "≈ 90.000–166.000 (stima più citata ≈ 140.000)", "≈ 60.000–80.000 (stima più citata ≈ 74.000)"],
          ["Morti nel primo giorno", "≈ metà del totale del 1945", "≈ metà del totale del 1945"],
          ["Edifici distrutti o danneggiati", "≈ 90% su ≈ 76.000", "≈ 36% su ≈ 51.000 (centro protetto dalle colline)"],
        ],
      },
      {
        t: "p",
        text: "Fra le vittime ci furono decine di migliaia di lavoratori coreani, prigionieri di guerra alleati e alcune migliaia di cittadini statunitensi di origine giapponese. I sopravvissuti, gli hibakusha, riconosciuti dalla legge giapponese, erano oltre 370.000 negli anni Ottanta; nel 2025 meno di 100.000, con età media superiore agli 85 anni. Nel 2024 la loro organizzazione, Nihon Hidankyo, ha ricevuto il Premio Nobel per la Pace.",
      },
      { t: "h", text: "Il dibattito" },
      {
        t: "p",
        text: "Se i bombardamenti siano stati necessari per la resa del Giappone, annunciata il 15 agosto, è una delle questioni più discusse della storiografia del Novecento. Pesarono anche la dichiarazione di guerra sovietica dell'8 agosto e l'invasione della Manciuria. Ground Zero non prende posizione: mostra che cosa fecero e che cosa farebbero oggi armi simili su una mappa contemporanea.",
      },
      { t: "figures", topic: "hiroshima" },
      { t: "figures", topic: "nagasaki" },
    ],
    sources: [
      "U.S. Strategic Bombing Survey, The Effects of Atomic Bombs on Hiroshima and Nagasaki, 1946.",
      "Committee for the Compilation of Materials on Damage Caused by the Atomic Bombs in Hiroshima and Nagasaki, Hiroshima and Nagasaki: The Physical, Medical, and Social Effects of the Atomic Bombings, Basic Books, 1981.",
      "Radiation Effects Research Foundation, «Frequently Asked Questions» sul numero delle vittime.",
      "Glasstone e Dolan 1977, cap. 12 (§12.08–12.12).",
      "Hiroshima Peace Memorial Museum; Nagasaki Atomic Bomb Museum.",
    ],
  },
  {
    id: "test",
    part: "Storia",
    title: "L'era dei test",
    kicker: "2.056 esplosioni in mezzo secolo",
    summary:
      "Quanti test, dove e da parte di chi; dai test atmosferici a quelli sotterranei; i poligoni e le popolazioni che vi abitavano.",
    topics: ["termonucleari", "tsar", "sotterranei", "nube"],
    blocks: [
      {
        t: "p",
        text: "Dal 1945 al 2017 sono stati eseguiti circa 2.056 test nucleari. Circa un quarto in atmosfera, sott'acqua o nello spazio, gli altri sottoterra. Il ritmo più alto si toccò nel 1962, con 178 test in un solo anno, a ridosso del trattato che avrebbe vietato quelli atmosferici.",
      },
      {
        t: "table",
        caption: "Test nucleari per paese (Arms Control Association; CTBTO). I conteggi variano leggermente fra le fonti secondo come si contano le esplosioni simultanee.",
        head: ["Paese", "Primo test", "Atmosferici", "Sotterranei", "Totale"],
        rows: [
          ["Stati Uniti", "1945", "215", "815", "1.030"],
          ["URSS", "1949", "219", "496", "715"],
          ["Regno Unito", "1952", "21", "24", "45"],
          ["Francia", "1960", "50", "160", "210"],
          ["Cina", "1964", "23", "22", "45"],
          ["India", "1974", "–", "3", "3"],
          ["Pakistan", "1998", "–", "2", "2"],
          ["Corea del Nord", "2006", "–", "6", "6"],
          ["Totale", "", "528", "1.528", "2.056"],
        ],
      },
      { t: "h", text: "I poligoni" },
      {
        t: "list",
        items: [
          "Stati Uniti: Nevada Test Site (928 test), Isole Marshall (Bikini ed Enewetak, 67 test fra il 1946 e il 1958), atollo Johnston e Isola di Natale nel Pacifico.",
          "URSS: Semipalatinsk in Kazakistan (456 test, oltre 100 atmosferici, con villaggi a poche decine di chilometri) e Novaja Zemlja nell'Artico, dove esplose Tsar Bomba.",
          "Regno Unito: Monte Bello, Emu Field e Maralinga in Australia, su terre aborigene; Isola di Natale e Malden nel Pacifico; poi in Nevada con gli Stati Uniti.",
          "Francia: Reggane e In Ekker nel Sahara algerino (1960–1966), poi Moruroa e Fangataufa nella Polinesia francese (1966–1996).",
          "Cina: Lop Nur, nello Xinjiang.",
          "India: Pokhran, nel Rajasthan. Pakistan: Ras Koh e Kharan, nel Belucistan. Corea del Nord: Punggye-ri.",
        ],
      },
      { t: "h", text: "La corsa al megaton" },
      {
        t: "p",
        text: "Negli anni Cinquanta le due superpotenze passarono dai kiloton ai megaton. Ivy Mike (1952) cancellò l'isolotto di Elugelab; Castle Bravo (1954) contaminò le Marshall; il 30 ottobre 1961 l'Unione Sovietica fece esplodere su Novaja Zemlja Tsar Bomba, circa 50 Mt, la più potente esplosione mai prodotta dall'uomo. Era stata deliberatamente ridotta a circa metà della sua potenza possibile per limitare il fallout. Il lampo fu visto a 1.000 km, l'onda di pressione fece più volte il giro della Terra.",
      },
      { t: "fact", label: "Anno con più test", value: "1962: 178 esplosioni" },
      { t: "fact", label: "Potenza totale dei test atmosferici", value: "≈ 440 Mt (UNSCEAR)" },
      {
        t: "p",
        text: "Dopo il trattato del 1963 Stati Uniti, URSS e Regno Unito passarono ai test sotterranei. Francia e Cina, che non lo firmarono, continuarono in atmosfera fino al 1974 e al 1980. Dal 1996, anno del Trattato per la messa al bando totale, solo India, Pakistan (1998) e Corea del Nord (2006–2017) hanno condotto test esplosivi.",
      },
      { t: "figures", topic: "tsar" },
      { t: "figures", topic: "sotterranei" },
    ],
    sources: [
      "Arms Control Association, «The Nuclear Testing Tally», aggiornamento 2023.",
      "CTBTO Preparatory Commission, «General Overview of the Effects of Nuclear Testing» e schede per paese.",
      "UNSCEAR 2000 Report, Annex C.",
      "U.S. DOE/NV, United States Nuclear Tests, DOE/NV-209, 2015.",
      "Nuclear Weapon Archive, sezioni per paese.",
    ],
  },
  {
    id: "dottrine",
    part: "Storia",
    title: "Corsa agli armamenti e dottrine",
    kicker: "Deterrenza, triade e distruzione reciproca assicurata",
    summary:
      "Come sono cresciuti gli arsenali fino al picco del 1986, le dottrine che dovevano renderli inutilizzabili e i vettori che li portano.",
    topics: ["vettori", "termonucleari"],
    blocks: [
      {
        t: "p",
        text: "Nel 1945 esistevano due bombe. Nel 1986 circa 64.500 testate nelle scorte militari, oltre 70.000 contando quelle ritirate in attesa di smantellamento. La crescita fu il prodotto di una competizione in cui ogni parte temeva di essere sorpassata, di bilanci militari giganteschi e di dottrine che assegnavano alle armi nucleari migliaia di bersagli.",
      },
      {
        t: "table",
        caption: "Scorte militari di testate in alcuni anni chiave, escluse le testate ritirate in attesa di smantellamento (serie storica FAS 2026, che rivede Norris e Kristensen 2013; arrotondate). Fra parentesi il totale mondiale comprese le ritirate.",
        head: ["Anno", "Stati Uniti", "URSS/Russia", "Altri", "Totale"],
        rows: [
          ["1950", "≈ 300", "≈ 5", "–", "≈ 300"],
          ["1967 (picco USA)", "≈ 31.250", "≈ 8.400", "≈ 400", "≈ 40.000"],
          ["1986 (picco mondiale)", "≈ 23.300", "≈ 40.200", "≈ 1.000", "≈ 64.500 (≈ 70.400)"],
          ["2000", "≈ 10.600", "≈ 12.200", "≈ 1.100", "≈ 23.800 (≈ 34.000)"],
          ["2025", "≈ 3.700", "≈ 4.300", "≈ 1.600", "≈ 9.600 (≈ 12.200)"],
        ],
      },
      { t: "h", text: "Le dottrine" },
      {
        t: "list",
        items: [
          "Rappresaglia massiccia (Dulles, 1954): rispondere a qualsiasi aggressione con un attacco nucleare totale. Poco credibile per crisi minori.",
          "Risposta flessibile (Kennedy, 1961; NATO dal 1967): una scala di opzioni, convenzionali e nucleari, per non trovarsi a scegliere fra resa e apocalisse.",
          "Distruzione reciproca assicurata, MAD (formulata da McNamara negli anni Sessanta): se ciascuna parte può distruggere l'altra anche dopo aver subito il primo colpo, nessuna ha interesse a iniziare.",
          "Controforza: colpire le forze nucleari avversarie invece delle città. Promette di limitare i danni, ma rende più instabile la crisi, perché premia chi colpisce per primo.",
          "Lancio su allarme: lanciare i propri missili alla notizia di un attacco in arrivo, prima che colpisca. Lascia ai decisori pochi minuti e moltiplica il peso dei falsi allarmi.",
          "Non primo uso: impegno a non usare per primi armi nucleari. Dichiarato dalla Cina nel 1964 e dall'India nel 1998–2003, con riserve; non adottato da Stati Uniti, Russia e NATO.",
        ],
      },
      { t: "h", text: "La triade" },
      {
        t: "table",
        caption: "I tre vettori strategici e le loro caratteristiche generali.",
        head: ["Vettore", "Tempo di volo tipico", "Pregi", "Limiti"],
        rows: [
          ["Missili balistici intercontinentali (ICBM) in silos", "≈ 30 minuti", "prontezza, comunicazioni sicure", "posizione nota, quindi vulnerabili"],
          ["Missili da sottomarino (SLBM)", "≈ 10–30 minuti", "difficili da localizzare: garantiscono il secondo colpo", "comunicazione con i sottomarini più difficile"],
          ["Bombardieri e missili da crociera", "ore", "richiamabili, segnale politico", "più lenti, intercettabili"],
        ],
      },
      {
        t: "p",
        text: "Dal 1970 i missili con testate multiple indipendenti (MIRV) moltiplicarono il numero di testate senza moltiplicare i missili. Il controllo degli armamenti degli anni Settanta e Ottanta cercò di limitarli perché premiavano il primo colpo: un solo missile poteva minacciare più silos avversari.",
      },
      {
        t: "p",
        text: "Dopo la Guerra fredda gli arsenali sono scesi di oltre l'80%. Da circa il 2018 la tendenza si è fermata: la Cina sta aumentando rapidamente le sue testate, Stati Uniti e Russia modernizzano tutti e tre i rami della triade, e il controllo degli armamenti bilaterale è quasi del tutto smantellato.",
      },
      { t: "figures", topic: "vettori" },
    ],
    sources: [
      "H. M. Kristensen, M. Korda et al., Nuclear Notebook, Bulletin of the Atomic Scientists, serie 1987–2025.",
      "Federation of American Scientists, Status of World Nuclear Forces 2025.",
      "H. M. Kristensen, R. S. Norris, «Global nuclear weapons inventories, 1945–2013», Bulletin of the Atomic Scientists 69(5), 2013.",
      "Federation of American Scientists, «Estimated Global Nuclear Warhead Inventories», serie storica 1945–2026 (anche in Our World in Data).",
      "L. Freedman, The Evolution of Nuclear Strategy, 3ª ed., Palgrave, 2003.",
      "SIPRI Yearbook 2025, cap. 6.",
    ],
  },
  {
    id: "trattati",
    part: "Storia",
    title: "Trattati e controllo degli armamenti",
    kicker: "Sessant'anni di limiti, verifiche e ritiri",
    summary:
      "Dal trattato sui test del 1963 al TPNW: che cosa vieta ciascun accordo, chi lo ha firmato e quali sono ancora in vigore.",
    topics: ["trattati"],
    blocks: [
      {
        t: "p",
        text: "Il controllo degli armamenti nucleari nasce dalla paura del fallout e dalla crisi di Cuba. Gli accordi sono di tre tipi: limitano i test, impediscono la diffusione delle armi a nuovi paesi, riducono il numero di armi e vettori. Alcuni sono multilaterali e universali, altri bilaterali fra Washington e Mosca.",
      },
      {
        t: "table",
        caption: "Principali trattati nucleari.",
        head: ["Trattato", "Firma", "Contenuto", "Stato"],
        rows: [
          ["Trattato sulla messa al bando parziale dei test (PTBT)", "1963", "vieta i test in atmosfera, nello spazio e sott'acqua", "in vigore; non firmato da Francia e Cina"],
          ["Trattato sullo spazio extra-atmosferico", "1967", "vieta armi nucleari in orbita e sui corpi celesti", "in vigore"],
          ["Trattato di Tlatelolco", "1967", "America Latina zona libera da armi nucleari", "in vigore"],
          ["Trattato di non proliferazione (TNP/NPT)", "1968", "solo 5 stati riconosciuti come nucleari; impegno al disarmo (art. VI); salvaguardie AIEA", "in vigore dal 1970, esteso a tempo indeterminato nel 1995; 191 parti"],
          ["SALT I e Trattato ABM", "1972", "congela i lanciatori; limita le difese antimissile", "ABM abbandonato dagli USA nel 2002"],
          ["SALT II", "1979", "tetti a lanciatori e MIRV", "mai ratificato, rispettato fino al 1986"],
          ["Trattato INF", "1987", "elimina i missili a terra con gittata 500–5.500 km", "2.692 missili distrutti entro il 1991; terminato nel 2019"],
          ["START I", "1991", "6.000 testate contabilizzate, 1.600 vettori", "scaduto nel 2009"],
          ["Trattato per la messa al bando totale dei test (CTBT)", "1996", "vieta qualsiasi esplosione nucleare", "non in vigore: mancano ratifiche di stati chiave; la Russia ha revocato la ratifica nel 2023"],
          ["SORT (Mosca)", "2002", "1.700–2.200 testate strategiche schierate", "sostituito da New START"],
          ["New START", "2010", "1.550 testate schierate, 700 vettori schierati, 800 totali; ispezioni", "Russia sospende la partecipazione nel 2023; scaduto il 5 febbraio 2026 senza proroga né sostituto"],
          ["Trattato sulla proibizione delle armi nucleari (TPNW)", "2017", "vieta sviluppo, possesso, uso e minaccia d'uso", "in vigore dal 2021; nessuno stato nucleare né membro NATO lo ha firmato"],
        ],
      },
      { t: "h", text: "La verifica" },
      {
        t: "p",
        text: "Un trattato vale quanto la capacità di verificarlo. I satelliti di ricognizione resero possibili i SALT; le ispezioni sul posto furono la novità dell'INF e degli START. Il CTBT, pur non essendo in vigore, ha costruito un Sistema Internazionale di Monitoraggio di oltre 300 stazioni sismiche, idroacustiche, infrasoniche e di radionuclidi, che ha rilevato tutti i test nordcoreani.",
      },
      { t: "fact", label: "Stazioni del sistema di monitoraggio CTBTO (previste)", value: "337 strutture, oltre il 90% già operative" },
      {
        t: "quote",
        text: "Ogni uomo, donna e bambino vive sotto una spada di Damocle nucleare, appesa al più sottile dei fili.",
        who: "John F. Kennedy, Assemblea generale delle Nazioni Unite, 1961",
      },
      {
        t: "p",
        text: "Nel 2017 la Campagna internazionale per l'abolizione delle armi nucleari (ICAN) ha ricevuto il Premio Nobel per la Pace per il lavoro che ha portato al TPNW. Gli stati nucleari sostengono che il disarmo debba passare dal TNP e da accordi graduali; i sostenitori del TPNW rispondono che il TNP chiede il disarmo da oltre cinquant'anni.",
      },
      { t: "figures", topic: "trattati" },
    ],
    sources: [
      "United Nations Office for Disarmament Affairs (UNODA), Treaties Database.",
      "Arms Control Association, Fact Sheets sui singoli trattati.",
      "CTBTO Preparatory Commission, «Overview of the verification regime».",
      "U.S. Department of State, Bureau of Arms Control, testi e protocolli di INF, START, New START.",
      "Arms Control Association, «New START Expires As U.S. Urges 'Modernized' Treaty», Arms Control Today, marzo 2026.",
    ],
  },
  {
    id: "quasi-incidenti",
    part: "Storia",
    title: "Quasi incidenti",
    kicker: "Le volte in cui è andata bene",
    summary:
      "Goldsboro 1961, il sottomarino B-59 durante la crisi di Cuba, Stanislav Petrov e Able Archer nel 1983, il razzo norvegese del 1995: falsi allarmi, errori e decisioni individuali.",
    topics: ["vettori", "trattati"],
    blocks: [
      {
        t: "p",
        text: "La deterrenza presuppone attori razionali, informazioni corrette e sistemi che funzionano. La storia della Guerra fredda contiene decine di episodi in cui una di queste condizioni è mancata. I più noti sono documentati da archivi declassificati; molti altri, probabilmente, non lo sono.",
      },
      { t: "h", text: "Goldsboro, 24 gennaio 1961" },
      {
        t: "p",
        text: "Un B-52 si spezzò in volo sopra la Carolina del Nord e perse due bombe termonucleari da alcuni megaton. Un paracadute di una si aprì; secondo un'analisi declassificata nel 2013, su quella bomba diversi dispositivi di sicurezza erano stati superati dalla sequenza dell'incidente, e uno solo, un interruttore a bassa tensione, impedì la detonazione. Parti dell'altra bomba non furono mai recuperate dal terreno paludoso.",
      },
      { t: "h", text: "Crisi dei missili di Cuba, 16–28 ottobre 1962" },
      {
        t: "p",
        text: "Il 27 ottobre, il giorno più pericoloso, un U-2 fu abbattuto su Cuba e unità navali statunitensi costrinsero il sottomarino sovietico B-59 a emergere usando cariche di profondità di segnalazione. L'equipaggio, senza contatto con Mosca da giorni, temeva che la guerra fosse iniziata. A bordo c'era un siluro a testata nucleare; il suo uso richiedeva l'accordo di tre ufficiali. Il comandante Valentin Savickij era favorevole; il capo di stato maggiore della flottiglia, Vasilij Archipov, si oppose. Il sottomarino emerse.",
      },
      { t: "h", text: "Stanislav Petrov, 26 settembre 1983" },
      {
        t: "p",
        text: "Poco dopo la mezzanotte, nel bunker Serpuchov-15 vicino a Mosca, il sistema satellitare di allarme precoce Oko segnalò il lancio di un missile dagli Stati Uniti, poi di altri quattro. Il tenente colonnello Petrov, ufficiale di turno, giudicò improbabile un attacco con così pochi missili e riferì un malfunzionamento. Aveva ragione: i satelliti avevano scambiato per lanci i riflessi del sole sulle nubi d'alta quota. Erano passate tre settimane dall'abbattimento del volo Korean Air 007.",
      },
      { t: "h", text: "Able Archer 83, 7–11 novembre 1983" },
      {
        t: "p",
        text: "Un'esercitazione NATO simulava il passaggio a un attacco nucleare con procedure e comunicazioni più realistiche del solito. Una parte della dirigenza sovietica, già convinta che gli Stati Uniti preparassero un primo colpo (operazione di intelligence RYaN), mise in allerta alcune forze. Un rapporto del President's Foreign Intelligence Advisory Board, declassificato nel 2015, concluse che gli Stati Uniti potevano aver «inavvertitamente messo i rapporti su un piede di guerra».",
      },
      { t: "h", text: "Il razzo norvegese, 25 gennaio 1995" },
      {
        t: "p",
        text: "Un razzo scientifico norvegese-statunitense Black Brant XII, lanciato dall'isola di Andøya per studiare l'aurora boreale, fu interpretato dai radar russi come un possibile missile da sottomarino. Per la prima volta fu attivata la valigetta nucleare (Čeget) del presidente Boris El'cin. La notifica del lancio era stata inviata settimane prima, ma non era arrivata agli operatori.",
      },
      {
        t: "table",
        caption: "Altri episodi documentati.",
        head: ["Data", "Episodio"],
        rows: [
          ["5 ottobre 1960", "un radar di allarme in Groenlandia scambia la Luna che sorge per un attacco missilistico"],
          ["17 gennaio 1966", "Palomares, Spagna: collisione in volo fra un B-52 e un aereo cisterna; quattro bombe cadono, due disperdono plutonio"],
          ["21 gennaio 1968", "Thule, Groenlandia: un B-52 si schianta sul ghiaccio; contaminazione da plutonio"],
          ["9 novembre 1979", "un nastro di addestramento caricato per errore nei computer NORAD simula un attacco sovietico"],
          ["3 giugno 1980", "un chip guasto da 46 centesimi genera falsi allarmi al NORAD"],
          ["18–19 settembre 1980", "Damascus, Arkansas: esplosione del combustibile di un missile Titan II nel silo; la testata è proiettata fuori senza detonare"],
        ],
      },
      {
        t: "p",
        text: "Nessuno di questi episodi ha portato a una detonazione. Ma in diversi casi la differenza è stata fatta da una persona, da un componente, da una coincidenza. È uno dei motivi per cui molti esperti considerano il rischio di una guerra per errore o incomprensione non meno serio di quello di una guerra deliberata.",
      },
      { t: "figures", topic: "vettori" },
    ],
    sources: [
      "E. Schlosser, Command and Control, Penguin, 2013.",
      "National Security Archive (George Washington University), dossier su B-59, Able Archer 83 e Goldsboro.",
      "S. Savranskaya, «New Sources on the Role of Soviet Submarines in the Cuban Missile Crisis», Journal of Strategic Studies 28, 2005.",
      "President's Foreign Intelligence Advisory Board, The Soviet «War Scare», 1990 (declassificato 2015).",
      "P. Lewis, H. Williams, B. Pelopidas, S. Aghlani, Too Close for Comfort: Cases of Near Nuclear Use and Options for Policy, Chatham House, 2014.",
    ],
  },

  // ───────────────────────────── IL MODELLO ─────────────────────────────
  {
    id: "modello",
    part: "Il modello",
    title: "Come leggere Ground Zero",
    kicker: "Che cosa calcola la mappa, e con quali approssimazioni",
    summary:
      "I modelli dietro i cerchi: Brode per l'onda d'urto, Glasstone per il calore, la dose pronta, il pennacchio di fallout, le curve di mortalità, la nube, l'orizzonte dell'EMP e la fascia di incertezza.",
    topics: ["diagrammi"],
    blocks: [
      {
        t: "p",
        text: "Ground Zero mette su una mappa gli ordini di grandezza dei manuali pubblici. Non è una previsione e non è un piano: è un modo per vedere, su luoghi familiari, la scala di fenomeni che altrimenti restano numeri astratti. Questo capitolo elenca i modelli e i loro limiti.",
      },
      { t: "h", text: "Onda d'urto" },
      {
        t: "p",
        text: "La sovrapressione al suolo viene dall'approssimazione analitica di Harold Brode (1986), che riproduce le curve di Glasstone e Dolan con un errore dichiarato attorno al 10% a livello del mare, includendo l'effetto della quota di scoppio e dello stelo di Mach. Le distanze scalano con Y^(1/3); la pressione ambiente del luogo corregge i valori secondo la scala di Sachs.",
      },
      { t: "h", text: "Calore" },
      {
        t: "formula",
        tex: "Q(D) = f · E · T(D, V) / (4π D²)",
        caption: "Fluenza termica con trasmissività T dipendente da distanza e visibilità V; f ≈ 0,35 in aria, circa la metà al suolo.",
      },
      {
        t: "p",
        text: "Le soglie di ustione crescono con la potenza perché l'impulso dura di più. Visibilità e nubi del meteo corrente riducono i raggi. Il modello non conosce le ombre degli edifici né il terreno.",
      },
      { t: "h", text: "Radiazione pronta" },
      {
        t: "p",
        text: "La dose di 5 Gy all'aperto è scalata dalle curve di Glasstone per gamma e neutroni, con un'attenuazione esponenziale nell'aria. Cresce molto lentamente con la potenza. Non tiene conto della schermatura degli edifici.",
      },
      { t: "h", text: "Fallout" },
      {
        t: "p",
        text: "Il fallout locale è disegnato solo se la palla di fuoco tocca terra o se lo scoppio è al suolo o sotterraneo non contenuto. È un pennacchio gaussiano sottovento: la larghezza cresce con la distanza, la direzione e la velocità vengono dal vento (meteo o manuale). Il rateo di riferimento a un'ora è calibrato sui contorni di Glasstone per 1 Mt di fissione:",
      },
      { t: "formula", tex: "R₁(x) ∝ Y_f · x^(−1,44)", caption: "Rateo a H+1 lungo l'asse del pennacchio, con Y_f potenza da fissione e x distanza sottovento." },
      { t: "formula", tex: "D = 5 · R₁ · (t_a^(−0,2) − t_b^(−0,2)) / PF", caption: "Dose accumulata fra arrivo t_a e uscita t_b (ore), divisa per il fattore di protezione del riparo scelto." },
      {
        t: "p",
        text: "Il tempo di arrivo t_a è la distanza divisa per la velocità del vento. Non è un modello di particelle: non conosce precipitazioni locali, orografia, cambi di vento in quota. La pioggia, in realtà, accorcia e concentra il fallout.",
      },
      { t: "h", text: "Persone" },
      {
        t: "p",
        text: "La popolazione è una griglia costruita dalle città GeoNames con più di 15.000 abitanti, ciascuna rappresentata come un disco la cui area viene dalla popolazione e da una densità ipotizzata, più alta per le metropoli, più una densità rurale di fondo che si può azzerare. Per ogni cella la probabilità di morte per ciascun effetto segue una curva lognormale (probit):",
      },
      { t: "formula", tex: "P(x) = Φ( ln(x / x₅₀) / σ )", caption: "Probabilità di morte per un effetto di intensità x; x₅₀ è il valore che uccide metà degli esposti, σ la dispersione." },
      { t: "formula", tex: "P_tot = 1 − Π (1 − P_i)", caption: "Combinazione degli effetti, trattati come indipendenti." },
      {
        t: "p",
        text: "I rifugi spostano le curve nel senso descritto dall'OTA nel 1979, ma non annullano il rischio dentro i 20 psi. Il risultato è mostrato con una fascia da circa 0,4 a circa 2,5 volte il valore centrale, perché nessun numero tondo va letto come un censimento: ora del giorno, stagione, preavviso, struttura degli edifici e soccorsi cambiano i risultati più di qualunque parametro fisico.",
      },
      { t: "fact", label: "Fascia di incertezza sulle vittime", value: "× 0,4 – × 2,5" },
      { t: "h", text: "Nube ed EMP" },
      {
        t: "list",
        items: [
          "Quota della nube: interpolata in scala logaritmica da una tabella di quote di sommità e base in funzione della potenza, come quella del capitolo sulla nube a fungo.",
          "EMP: per gli scoppi sopra qualche decina di chilometri è disegnato il cerchio dell'orizzonte, d ≈ √(2Rh). È un'area di esposizione, non una mappa di danni.",
          "Clima: la fuliggine è stimata dall'area urbana che può bruciare, con un fattore largo, sulla scala dei lavori di Toon e Robock.",
        ],
      },
      { t: "h", text: "Che cosa non c'è" },
      {
        t: "list",
        items: [
          "Il terreno: colline e valli schermano onda e calore (Nagasaki ne è l'esempio).",
          "Gli edifici reali: altezza, materiali, distanza fra i palazzi.",
          "Gli effetti di più detonazioni insieme, gli incendi che si propagano, i danni alle infrastrutture e le conseguenze dei giorni successivi.",
          "Qualunque informazione sul funzionamento interno delle armi: le sagome della biblioteca sono profili esterni di categoria.",
        ],
      },
      { t: "figures", topic: "diagrammi" },
    ],
    sources: [
      "H. L. Brode, Airblast From Nuclear Bursts — Analytic Approximations, PSR Report 1419-3, 1986.",
      "Glasstone e Dolan 1977, cap. 3, 7, 8, 9 e 12.",
      "Office of Technology Assessment, The Effects of Nuclear War, 1979.",
      "GeoNames, cities15000 (CC-BY 4.0); Open-Meteo.",
      "A. Wellerstein, NUKEMAP, Stevens Institute of Technology: documentazione dei modelli, come termine di confronto.",
    ],
  },
];

// ───────────────────────────── GLOSSARIO ─────────────────────────────

export const GLOSSARY: { term: string; def: string }[] = [
  { term: "Breakaway", def: "Istante in cui l'onda d'urto, raffreddandosi, torna trasparente e lascia vedere la palla di fuoco: segna l'inizio del secondo massimo termico." },
  { term: "Cesio-137", def: "Prodotto di fissione con tempo di dimezzamento di 30,1 anni. Si comporta chimicamente come il potassio; domina la contaminazione del suolo per decenni." },
  { term: "Conflagrazione", def: "Incendio esteso il cui fronte avanza spinto dal vento. Diverso dalla tempesta di fuoco, che è stazionaria e alimentata da venti verso il centro." },
  { term: "Controforza", def: "Dottrina che indirizza le armi nucleari contro le forze militari avversarie, in particolare silos e basi, invece che contro le città." },
  { term: "Cratere apparente", def: "La cavità visibile dopo uno scoppio al suolo o sotterraneo poco profondo, al netto del materiale ricaduto al suo interno." },
  { term: "CTBT", def: "Trattato per la messa al bando totale dei test nucleari (1996). Vieta qualsiasi esplosione nucleare; non è in vigore, ma ha un sistema di monitoraggio mondiale operativo." },
  { term: "Deterrenza", def: "Strategia che mira a impedire un attacco minacciando una ritorsione inaccettabile." },
  { term: "Distruzione reciproca assicurata (MAD)", def: "Situazione in cui ciascuna parte può distruggere l'altra anche dopo aver subito un primo attacco, rendendo irrazionale iniziare una guerra nucleare." },
  { term: "Doomsday Clock", def: "Orologio simbolico del Bulletin of the Atomic Scientists, dal 1947. La distanza dalla mezzanotte indica il giudizio degli esperti sul rischio di catastrofe globale." },
  { term: "Doppio lampo", def: "Firma luminosa tipica di un'esplosione nucleare in atmosfera: un primo picco di millisecondi, un minimo, un secondo picco più lungo." },
  { term: "Dose assorbita", def: "Energia depositata dalla radiazione per unità di massa. Si misura in gray (Gy)." },
  { term: "Dose efficace", def: "Dose pesata per tipo di radiazione e sensibilità degli organi, usata per il rischio a lungo termine. Si misura in sievert (Sv)." },
  { term: "E1, E2, E3", def: "Le tre componenti dell'impulso elettromagnetico: rapidissima (nanosecondi), intermedia (simile al fulmine), lenta (secondi–minuti, simile a una tempesta geomagnetica)." },
  { term: "Eccesso di rischio relativo (ERR)", def: "Aumento proporzionale del rischio di una malattia rispetto ai non esposti. Un ERR di 0,5 per Gy significa +50% di rischio per ogni gray." },
  { term: "EMP", def: "Impulso elettromagnetico. Prodotto soprattutto dagli scoppi ad alta quota, può indurre correnti dannose in circuiti elettronici e linee lunghe su aree di migliaia di chilometri." },
  { term: "Equivalente TNT", def: "Convenzione per esprimere l'energia di un'esplosione: 1 kt equivale per definizione a 10¹² calorie, l'energia di mille tonnellate di tritolo." },
  { term: "Fallout", def: "Materiale radioattivo che ricade dalla nube. Locale se cade entro un giorno a decine–centinaia di km; globale se resta in quota e ricade in mesi o anni." },
  { term: "Fase positiva", def: "Intervallo in cui la pressione dietro il fronte d'urto supera quella atmosferica. È seguita da una fase negativa, di depressione, con vento inverso." },
  { term: "Fasce di Van Allen", def: "Regioni attorno alla Terra dove il campo magnetico intrappola particelle cariche. I test ad alta quota del 1958–1962 vi crearono fasce artificiali." },
  { term: "Fattore di protezione (PF)", def: "Rapporto fra la dose che si riceverebbe all'aperto e quella ricevuta al riparo. Un PF di 10 riduce la dose di dieci volte." },
  { term: "Fissione", def: "Divisione di un nucleo pesante in due frammenti, con emissione di neutroni e circa 200 MeV di energia." },
  { term: "Fluenza termica", def: "Energia termica ricevuta per unità di superficie, di solito in cal/cm² (1 cal/cm² ≈ 41,8 kJ/m²)." },
  { term: "Frazione di fissione", def: "Parte dell'energia totale che proviene da reazioni di fissione. Determina quasi da sola la quantità di fallout." },
  { term: "Fusione", def: "Unione di nuclei leggeri, come gli isotopi dell'idrogeno, in un nucleo più pesante, con liberazione di energia. Richiede temperature di decine di milioni di gradi." },
  { term: "Gray (Gy)", def: "Unità di dose assorbita: 1 Gy = 1 joule per chilogrammo = 100 rad." },
  { term: "H+1", def: "Un'ora dopo la detonazione. Il rateo di dose del fallout riferito a H+1 è la grandezza standard per descrivere la contaminazione di un luogo." },
  { term: "Hibakusha", def: "Termine giapponese per i sopravvissuti ai bombardamenti di Hiroshima e Nagasaki, riconosciuti dalla legge giapponese." },
  { term: "ICBM", def: "Missile balistico intercontinentale: gittata superiore a 5.500 km, tempo di volo di circa 30 minuti." },
  { term: "Impulso termico", def: "La radiazione visibile e infrarossa emessa dalla palla di fuoco; porta circa il 35% dell'energia di uno scoppio in aria." },
  { term: "Iodio-131", def: "Prodotto di fissione con tempo di dimezzamento di 8 giorni. Si concentra nella tiroide, soprattutto attraverso il latte fresco." },
  { term: "Ipocentro (punto zero)", def: "Il punto sulla superficie terrestre direttamente sotto (o sopra, per scoppi sotterranei) il punto di detonazione." },
  { term: "Kiloton (kt)", def: "Energia equivalente a mille tonnellate di TNT, cioè 4,184 × 10¹² J." },
  { term: "Lancio su allarme", def: "Postura in cui i missili vengono lanciati quando i sensori segnalano un attacco in arrivo, prima che colpisca." },
  { term: "LD50/60", def: "Dose letale per il 50% degli esposti entro 60 giorni. Per l'uomo, senza cure, circa 3,5–4,5 Gy al midollo osseo." },
  { term: "Legge della radice cubica", def: "Regola per cui la distanza a cui si osserva un dato effetto dell'onda d'urto cresce come la radice cubica della potenza." },
  { term: "Lesioni combinate", def: "Esposizione alla radiazione associata a ustioni o traumi. Aumenta molto la mortalità rispetto a ciascuna lesione da sola." },
  { term: "LNT", def: "Modello lineare senza soglia: ipotesi prudenziale della radioprotezione secondo cui il rischio di tumore è proporzionale alla dose anche a dosi molto basse." },
  { term: "Magnitudo m_b", def: "Magnitudo sismica calcolata dalle onde di volume, usata per individuare e stimare la potenza delle esplosioni sotterranee." },
  { term: "Megaton (Mt)", def: "Energia equivalente a un milione di tonnellate di TNT, cioè mille kiloton." },
  { term: "MIRV", def: "Veicoli di rientro multipli indipendenti: più testate trasportate da un solo missile, ciascuna diretta verso un bersaglio diverso." },
  { term: "Neutrone", def: "Particella neutra del nucleo. Nelle esplosioni nucleari i neutroni veloci contribuiscono alla dose pronta e rendono radioattivi alcuni materiali che colpiscono." },
  { term: "Non primo uso", def: "Impegno dichiarato a non usare per primi armi nucleari, ma solo in risposta a un attacco nucleare." },
  { term: "Nube a fungo", def: "Nube formata dalla palla di fuoco che sale trascinando aria e detriti; si stabilizza in 6–10 minuti a una quota che cresce con la potenza." },
  { term: "Nube di Wilson", def: "Nube di condensazione effimera che compare attorno all'esplosione in aria umida, quando la fase negativa dell'onda raffredda l'aria." },
  { term: "Ombre nucleari", def: "Sagome rimaste su muri e selciati dove persone od oggetti hanno schermato l'impulso termico, scolorendo la superficie attorno." },
  { term: "Onda di base", def: "Anello di nebbia o polvere che si espande a livello del suolo o del mare dopo uno scoppio sotterraneo o subacqueo, spesso fortemente radioattivo." },
  { term: "Onda d'urto", def: "Fronte di compressione che si propaga dal punto di scoppio; porta circa metà dell'energia di uno scoppio in aria." },
  { term: "Palla di fuoco", def: "Sfera di aria e residui incandescenti che si forma nel primo millisecondo e cresce fino a centinaia di metri o chilometri di raggio." },
  { term: "Pioggia nera", def: "Pioggia carica di fuliggine e particelle radioattive caduta a Hiroshima e Nagasaki nelle ore successive ai bombardamenti." },
  { term: "Pressione dinamica", def: "Pressione legata al vento dietro il fronte d'urto: trascina e rovescia oggetti, persone e strutture." },
  { term: "Probit", def: "Metodo statistico che descrive la probabilità di un effetto con una curva cumulativa normale del logaritmo dell'intensità." },
  { term: "Psi", def: "Libbre per pollice quadrato, unità storica della sovrapressione. 1 psi ≈ 6,9 kPa; la pressione atmosferica al livello del mare è circa 14,7 psi." },
  { term: "Quota di scoppio ottimale", def: "Altezza dell'esplosione che porta più lontano un dato livello di sovrapressione al suolo." },
  { term: "Rad", def: "Unità storica di dose assorbita: 1 rad = 0,01 Gy." },
  { term: "Radiazione iniziale", def: "Raggi gamma e neutroni emessi entro il primo minuto dalla detonazione." },
  { term: "Radiazione residua", def: "Radiazione emessa dopo il primo minuto, soprattutto dai prodotti di fissione nel fallout e dai materiali resi radioattivi dai neutroni." },
  { term: "Reazione a catena", def: "Processo in cui i neutroni prodotti da una fissione causano altre fissioni. Controllata nei reattori, rapidissima e divergente in un'esplosione." },
  { term: "Regola del 7:10", def: "Approssimazione del decadimento del fallout: ogni volta che il tempo si moltiplica per sette, il rateo di dose si divide per dieci." },
  { term: "Rem", def: "Unità storica di dose equivalente: 1 rem = 0,01 Sv." },
  { term: "Roentgen (R)", def: "Unità storica di esposizione ai raggi X e gamma, basata sulla ionizzazione dell'aria. Per i gamma, circa 1 rad nei tessuti molli." },
  { term: "Scoppio al suolo", def: "Detonazione sulla superficie o a quota così bassa che la palla di fuoco tocca il terreno: produce cratere e fallout locale abbondante." },
  { term: "Scoppio in aria", def: "Detonazione a quota tale che la palla di fuoco non tocca il suolo: massimizza l'area distrutta e produce poco fallout locale." },
  { term: "Scoppio sotterraneo contenuto", def: "Esplosione abbastanza profonda da non rompere la superficie né rilasciare radioattività in atmosfera; la forma di quasi tutti i test dopo il 1963." },
  { term: "Sievert (Sv)", def: "Unità di dose equivalente ed efficace: 1 Sv = 100 rem. Usata per il rischio a lungo termine." },
  { term: "Sindrome acuta da radiazione (ARS)", def: "Insieme di sintomi dopo una dose elevata al corpo intero in breve tempo, oltre circa 1 Gy: forme ematopoietica, gastrointestinale e neurovascolare." },
  { term: "SLBM", def: "Missile balistico lanciato da sottomarino. È la componente più difficile da colpire della triade e garantisce la capacità di secondo colpo." },
  { term: "Sovrapressione", def: "Aumento della pressione rispetto a quella atmosferica dietro il fronte d'urto. Si misura in psi o kPa." },
  { term: "Stelo di Mach", def: "Fronte d'urto rinforzato che si forma quando l'onda riflessa dal suolo raggiunge e si fonde con quella incidente." },
  { term: "Stronzio-90", def: "Prodotto di fissione con tempo di dimezzamento di 28,8 anni. Si comporta come il calcio e si accumula in ossa e denti." },
  { term: "Tempesta di fuoco", def: "Incendio di massa in cui i focolai si fondono in un'unica colonna convettiva che risucchia aria con venti violenti verso il centro." },
  { term: "Termonucleare", def: "Reazione di fusione resa possibile dalle altissime temperature; per estensione, arma la cui energia viene in parte dalla fusione." },
  { term: "TNP (NPT)", def: "Trattato di non proliferazione nucleare (1968): riconosce cinque stati dotati di armi nucleari, vieta agli altri di acquisirle e impegna tutti al disarmo." },
  { term: "TPNW", def: "Trattato sulla proibizione delle armi nucleari (2017, in vigore dal 2021): vieta sviluppo, possesso, uso e minaccia d'uso." },
  { term: "Trasmissività atmosferica", def: "Frazione della radiazione termica che attraversa l'aria senza essere assorbita o diffusa; diminuisce con la distanza e con la foschia." },
  { term: "Triade", def: "L'insieme di missili intercontinentali a terra, missili da sottomarino e bombardieri su cui si basano gli arsenali strategici di Stati Uniti, Russia e, in parte, Cina." },
  { term: "Tropopausa", def: "Confine fra troposfera e stratosfera, a circa 8–18 km di quota secondo latitudine e stagione. Le nubi che la superano generano fallout globale." },
  { term: "Ustioni da lampo", def: "Ustioni causate direttamente dalla radiazione termica sulla pelle esposta, distinte da quelle causate dalle fiamme degli incendi." },
  { term: "Ustioni di 1°, 2°, 3° grado", def: "Rispettivamente: arrossamento superficiale; vesciche con danno parziale del derma; distruzione a tutto spessore della pelle, che richiede innesti." },
  { term: "Way–Wigner (legge di)", def: "Legge empirica del 1948 secondo cui il rateo di dose dei prodotti di fissione misti decresce come t^(−1,2)." },
];

// ───────────────────────────── CRONOLOGIA ─────────────────────────────

export const TIMELINE: {
  year: number;
  date?: string;
  title: string;
  text: string;
  tag: "storia" | "test" | "trattato" | "incidente" | "arsenale";
}[] = [
  { year: 1896, date: "1896-03", title: "Becquerel scopre la radioattività", text: "Henri Becquerel osserva che i sali di uranio impressionano lastre fotografiche anche al buio.", tag: "storia" },
  { year: 1898, title: "Polonio e radio", text: "Marie e Pierre Curie isolano due nuovi elementi radioattivi e coniano il termine «radioattività».", tag: "storia" },
  { year: 1905, title: "E = mc²", text: "Albert Einstein mostra l'equivalenza fra massa ed energia: la base teorica dell'energia nucleare.", tag: "storia" },
  { year: 1911, title: "Il nucleo atomico", text: "Ernest Rutherford scopre che quasi tutta la massa dell'atomo è concentrata in un nucleo minuscolo.", tag: "storia" },
  { year: 1932, title: "Il neutrone", text: "James Chadwick scopre il neutrone, la particella senza carica che può penetrare i nuclei.", tag: "storia" },
  { year: 1934, title: "I ragazzi di via Panisperna", text: "A Roma Enrico Fermi e il suo gruppo bombardano gli elementi con neutroni lenti; nel 1938 Fermi riceve il Nobel.", tag: "storia" },
  { year: 1938, date: "1938-12", title: "Scoperta della fissione", text: "Otto Hahn e Fritz Strassmann trovano bario nell'uranio irradiato; Lise Meitner e Otto Frisch ne danno l'interpretazione all'inizio del 1939.", tag: "storia" },
  { year: 1939, date: "1939-08-02", title: "La lettera di Einstein", text: "Einstein e Szilárd avvertono Roosevelt della possibilità di una bomba e del rischio che la Germania la costruisca.", tag: "storia" },
  { year: 1942, date: "1942-12-02", title: "Prima reazione a catena controllata", text: "A Chicago la pila CP-1 del gruppo di Fermi raggiunge la criticità.", tag: "storia" },
  { year: 1942, date: "1942-09", title: "Nasce il Progetto Manhattan", text: "Il generale Leslie Groves assume la direzione; nel 1943 apre il laboratorio di Los Alamos diretto da Oppenheimer.", tag: "storia" },
  { year: 1945, date: "1945-07-16", title: "Trinity", text: "Primo test nucleare della storia nel Nuovo Messico, circa 21–25 kt.", tag: "test" },
  { year: 1945, date: "1945-08-06", title: "Hiroshima", text: "Little Boy, circa 15 kt. Entro la fine dell'anno muoiono fra 90.000 e 166.000 persone.", tag: "storia" },
  { year: 1945, date: "1945-08-09", title: "Nagasaki", text: "Fat Man, circa 21 kt, sulla valle dell'Urakami. Entro la fine dell'anno muoiono fra 60.000 e 80.000 persone.", tag: "storia" },
  { year: 1946, date: "1946-07", title: "Operazione Crossroads", text: "Due test a Bikini contro una flotta bersaglio; lo scoppio subacqueo Baker contamina gran parte delle navi.", tag: "test" },
  { year: 1947, title: "Nasce il Doomsday Clock", text: "Il Bulletin of the Atomic Scientists fissa le lancette a 7 minuti dalla mezzanotte.", tag: "storia" },
  { year: 1949, date: "1949-08-29", title: "Primo test sovietico", text: "RDS-1 a Semipalatinsk, circa 22 kt. Il monopolio statunitense finisce prima del previsto; il Doomsday Clock passa a 3 minuti.", tag: "test" },
  { year: 1952, date: "1952-10-03", title: "Primo test britannico", text: "Operazione Hurricane alle isole Monte Bello, in Australia: circa 25 kt in una nave.", tag: "test" },
  { year: 1952, date: "1952-11-01", title: "Ivy Mike", text: "Primo dispositivo termonucleare degli Stati Uniti, circa 10,4 Mt: l'isolotto di Elugelab scompare.", tag: "test" },
  { year: 1953, date: "1953-08-12", title: "RDS-6s", text: "Test sovietico con potenziamento da fusione, circa 400 kt. Il Doomsday Clock arriva a 2 minuti dalla mezzanotte.", tag: "test" },
  { year: 1953, date: "1953-12-08", title: "Atomi per la pace", text: "Eisenhower propone all'ONU la condivisione dell'energia nucleare civile; nel 1957 nasce l'AIEA.", tag: "storia" },
  { year: 1954, date: "1954-03-01", title: "Castle Bravo", text: "15 Mt invece dei 4–8 previsti; il fallout colpisce Rongelap e il peschereccio Daigo Fukuryū Maru.", tag: "incidente" },
  { year: 1955, date: "1955-07-09", title: "Manifesto Russell–Einstein", text: "Undici scienziati chiedono ai governi di rinunciare alla guerra; ne nascono le conferenze Pugwash (1957).", tag: "storia" },
  { year: 1955, date: "1955-11-22", title: "RDS-37", text: "Primo test termonucleare sovietico a due stadi sganciato da un aereo, circa 1,6 Mt.", tag: "test" },
  { year: 1957, date: "1957-10-04", title: "Sputnik", text: "Il primo satellite artificiale dimostra che un missile sovietico può raggiungere qualsiasi punto della Terra.", tag: "arsenale" },
  { year: 1957, date: "1957-11-08", title: "Grapple X", text: "Il Regno Unito ottiene la sua prima esplosione termonucleare nel megaton, circa 1,8 Mt, all'Isola di Natale.", tag: "test" },
  { year: 1958, date: "1958-10-31", title: "Moratoria dei test", text: "Stati Uniti, URSS e Regno Unito sospendono i test; la moratoria dura fino al settembre 1961.", tag: "trattato" },
  { year: 1960, date: "1960-02-13", title: "Primo test francese", text: "Gerboise Bleue a Reggane, nel Sahara algerino, circa 70 kt.", tag: "test" },
  { year: 1961, date: "1961-01-24", title: "Goldsboro", text: "Un B-52 si spezza in volo sulla Carolina del Nord e perde due bombe termonucleari; una sola sicura evita la detonazione di una delle due.", tag: "incidente" },
  { year: 1961, date: "1961-10-30", title: "Tsar Bomba", text: "L'URSS fa esplodere su Novaja Zemlja circa 50 Mt, la più grande esplosione mai prodotta.", tag: "test" },
  { year: 1962, date: "1962-07-09", title: "Starfish Prime", text: "1,4 Mt a 400 km di quota sul Pacifico: lampioni spenti alle Hawaii e satelliti danneggiati.", tag: "test" },
  { year: 1962, date: "1962-10-16", title: "Crisi dei missili di Cuba", text: "Tredici giorni di confronto fra Stati Uniti e URSS sui missili sovietici a Cuba; si chiude il 28 ottobre.", tag: "incidente" },
  { year: 1962, date: "1962-10-27", title: "Il sottomarino B-59", text: "Vasilij Archipov nega il consenso all'uso di un siluro nucleare mentre il sottomarino è bersagliato da cariche di segnalazione.", tag: "incidente" },
  { year: 1962, title: "L'anno dei test", text: "178 esplosioni nucleari in un solo anno, il numero più alto della storia.", tag: "test" },
  { year: 1963, date: "1963-06-20", title: "La linea rossa", text: "Accordo per un collegamento diretto fra Washington e Mosca, nato dalle difficoltà di comunicazione durante la crisi di Cuba.", tag: "trattato" },
  { year: 1963, date: "1963-08-05", title: "Trattato sulla messa al bando parziale dei test", text: "Vietati i test in atmosfera, nello spazio e sott'acqua. Il Doomsday Clock torna a 12 minuti.", tag: "trattato" },
  { year: 1964, date: "1964-10-16", title: "Primo test cinese", text: "Test 596 a Lop Nur, circa 22 kt. La Cina dichiara la politica di non primo uso.", tag: "test" },
  { year: 1966, date: "1966-01-17", title: "Palomares", text: "Collisione in volo sulla Spagna: quattro bombe cadono, due disperdono plutonio sui campi.", tag: "incidente" },
  { year: 1967, title: "Picco dell'arsenale statunitense", text: "Gli Stati Uniti raggiungono circa 31.255 testate.", tag: "arsenale" },
  { year: 1967, date: "1967-02-14", title: "Trattato di Tlatelolco", text: "L'America Latina diventa la prima zona abitata libera da armi nucleari.", tag: "trattato" },
  { year: 1967, date: "1967-06-17", title: "Primo test termonucleare cinese", text: "Circa 3,3 Mt, meno di tre anni dopo il primo test a fissione.", tag: "test" },
  { year: 1968, date: "1968-07-01", title: "Trattato di non proliferazione", text: "Aperto alla firma; entra in vigore il 5 marzo 1970.", tag: "trattato" },
  { year: 1968, date: "1968-08-24", title: "Canopus", text: "Primo test termonucleare francese a Fangataufa, circa 2,6 Mt.", tag: "test" },
  { year: 1970, title: "Arrivano i MIRV", text: "Gli Stati Uniti schierano il Minuteman III con testate multiple indipendenti.", tag: "arsenale" },
  { year: 1972, date: "1972-05-26", title: "SALT I e Trattato ABM", text: "Primo limite ai lanciatori strategici e forte limitazione delle difese antimissile.", tag: "trattato" },
  { year: 1974, date: "1974-05-18", title: "Smiling Buddha", text: "Primo test indiano a Pokhran, presentato come esplosione pacifica; potenza stimata 4–10 kt.", tag: "test" },
  { year: 1974, date: "1974-07-03", title: "Trattato sulla soglia dei test", text: "Stati Uniti e URSS limitano i test sotterranei a 150 kt.", tag: "trattato" },
  { year: 1979, date: "1979-06-18", title: "SALT II", text: "Firmato a Vienna; mai ratificato dopo l'invasione sovietica dell'Afghanistan.", tag: "trattato" },
  { year: 1979, date: "1979-09-22", title: "L'incidente Vela", text: "Un satellite registra un doppio lampo nell'Atlantico meridionale; l'origine non è mai stata confermata ufficialmente.", tag: "incidente" },
  { year: 1979, date: "1979-11-09", title: "Il nastro del NORAD", text: "Un nastro di addestramento caricato per errore mostra un attacco sovietico massiccio; caccia in volo per alcuni minuti.", tag: "incidente" },
  { year: 1980, date: "1980-10-16", title: "Ultimo test atmosferico", text: "La Cina conduce a Lop Nur l'ultimo test nucleare in atmosfera della storia.", tag: "test" },
  { year: 1983, date: "1983-09-26", title: "Stanislav Petrov", text: "Il sistema di allarme sovietico segnala cinque missili statunitensi; Petrov lo giudica un falso allarme e ha ragione.", tag: "incidente" },
  { year: 1983, date: "1983-11-07", title: "Able Archer 83", text: "Un'esercitazione NATO allarma la dirigenza sovietica, che teme un primo colpo mascherato.", tag: "incidente" },
  { year: 1983, date: "1983-12-23", title: "Lo studio TTAPS", text: "Su Science Turco, Toon, Ackerman, Pollack e Sagan introducono l'idea di inverno nucleare.", tag: "storia" },
  { year: 1984, title: "Tre minuti", text: "Il Doomsday Clock torna a 3 minuti dalla mezzanotte, il punto più vicino dal 1953.", tag: "storia" },
  { year: 1985, date: "1985-11-21", title: "Vertice di Ginevra", text: "Reagan e Gorbačëv dichiarano che una guerra nucleare non può essere vinta e non deve mai essere combattuta.", tag: "trattato" },
  { year: 1986, title: "Picco mondiale delle testate", text: "Circa 64.500 testate nelle scorte militari, oltre 70.000 contando quelle ritirate in attesa di smantellamento; circa 40.000 erano sovietiche (stime FAS e Bulletin of the Atomic Scientists).", tag: "arsenale" },
  { year: 1986, date: "1986-10-11", title: "Reykjavík", text: "Reagan e Gorbačëv arrivano a discutere l'eliminazione di tutte le armi nucleari; il vertice fallisce sulla difesa antimissile, ma apre la strada all'INF.", tag: "trattato" },
  { year: 1987, date: "1987-12-08", title: "Trattato INF", text: "Eliminata un'intera classe di missili a terra di gittata intermedia: 2.692 missili distrutti entro il 1991.", tag: "trattato" },
  { year: 1990, date: "1990-10-24", title: "Ultimo test sovietico", text: "A Novaja Zemlja; la Russia non ha più condotto test esplosivi.", tag: "test" },
  { year: 1991, date: "1991-07-31", title: "START I", text: "Primo trattato che riduce davvero le testate strategiche: 6.000 contabilizzate per parte. Il Doomsday Clock arriva a 17 minuti.", tag: "trattato" },
  { year: 1991, date: "1991-07-10", title: "Il Sudafrica rinuncia alla bomba", text: "Dopo aver smantellato in segreto i suoi sei ordigni, il Sudafrica aderisce al TNP: unico caso di disarmo nucleare completo di un arsenale costruito in proprio.", tag: "arsenale" },
  { year: 1991, date: "1991-12", title: "Fine dell'URSS e programma Nunn–Lugar", text: "Gli Stati Uniti finanziano la messa in sicurezza e lo smantellamento delle armi sovietiche.", tag: "arsenale" },
  { year: 1992, date: "1992-09-23", title: "Ultimo test statunitense", text: "Divider, in Nevada. Da allora gli Stati Uniti mantengono una moratoria.", tag: "test" },
  { year: 1994, date: "1994-12-05", title: "Memorandum di Budapest", text: "Ucraina, Bielorussia e Kazakistan cedono alla Russia le armi sovietiche sul loro territorio in cambio di garanzie di sicurezza.", tag: "trattato" },
  { year: 1995, date: "1995-01-25", title: "Il razzo norvegese", text: "Un razzo scientifico scambiato per un missile: per la prima volta viene attivata la valigetta nucleare russa.", tag: "incidente" },
  { year: 1995, date: "1995-05-11", title: "Il TNP diventa permanente", text: "La conferenza di riesame estende il trattato a tempo indeterminato.", tag: "trattato" },
  { year: 1996, date: "1996-01-27", title: "Ultimo test francese", text: "Xouthos, a Fangataufa. Chiude una serie contestata in tutto il Pacifico.", tag: "test" },
  { year: 1996, date: "1996-07-29", title: "Ultimo test cinese", text: "A Lop Nur, poche settimane prima dell'apertura del CTBT.", tag: "test" },
  { year: 1996, date: "1996-09-24", title: "CTBT aperto alla firma", text: "Il trattato per la messa al bando totale dei test viene firmato da Stati Uniti, Russia, Cina, Francia e Regno Unito; non è mai entrato in vigore.", tag: "trattato" },
  { year: 1998, date: "1998-05-11", title: "Pokhran-II", text: "L'India conduce cinque test in due giorni e si dichiara stato nucleare.", tag: "test" },
  { year: 1998, date: "1998-05-28", title: "Chagai", text: "Il Pakistan risponde con test in due giorni, il 28 e il 30 maggio.", tag: "test" },
  { year: 2002, date: "2002-06-13", title: "Fine del Trattato ABM", text: "Il ritiro degli Stati Uniti diventa effettivo.", tag: "trattato" },
  { year: 2002, date: "2002-05-24", title: "Trattato di Mosca (SORT)", text: "Limite di 1.700–2.200 testate strategiche schierate entro il 2012.", tag: "trattato" },
  { year: 2003, date: "2003-01-10", title: "La Corea del Nord lascia il TNP", text: "Unico stato ad aver annunciato il ritiro dal trattato.", tag: "trattato" },
  { year: 2006, date: "2006-10-09", title: "Primo test nordcoreano", text: "Potenza inferiore a 1 kt, rilevata dalle reti sismiche mondiali.", tag: "test" },
  { year: 2007, title: "Cinque minuti", text: "Il Doomsday Clock include per la prima volta il cambiamento climatico fra le minacce.", tag: "storia" },
  { year: 2009, date: "2009-05-25", title: "Secondo test nordcoreano", text: "Potenza stimata 2–5 kt.", tag: "test" },
  { year: 2010, date: "2010-04-08", title: "New START", text: "1.550 testate strategiche schierate e 700 vettori schierati per parte, con ispezioni; in vigore dal febbraio 2011.", tag: "trattato" },
  { year: 2013, date: "2013-02-12", title: "Terzo test nordcoreano", text: "Potenza stimata 6–16 kt.", tag: "test" },
  { year: 2015, title: "Tre minuti", text: "Il Doomsday Clock torna a 3 minuti dalla mezzanotte.", tag: "storia" },
  { year: 2016, date: "2016-01-06", title: "Quarto test nordcoreano", text: "Pyongyang lo presenta come termonucleare; la potenza stimata, 7–10 kt, rende dubbia l'affermazione.", tag: "test" },
  { year: 2016, date: "2016-09-09", title: "Quinto test nordcoreano", text: "Potenza stimata 10–25 kt.", tag: "test" },
  { year: 2017, date: "2017-07-07", title: "Adottato il TPNW", text: "122 stati votano all'ONU il Trattato sulla proibizione delle armi nucleari.", tag: "trattato" },
  { year: 2017, date: "2017-09-03", title: "Sesto test nordcoreano", text: "Il più potente: magnitudo 6,1–6,3, potenza stimata fra circa 140 e 250 kt. Una frana scuote il monte Mantap nei minuti successivi.", tag: "test" },
  { year: 2017, date: "2017-10-06", title: "Nobel a ICAN", text: "La Campagna internazionale per l'abolizione delle armi nucleari riceve il Premio Nobel per la Pace.", tag: "storia" },
  { year: 2018, title: "Due minuti", text: "Il Doomsday Clock torna al livello del 1953.", tag: "storia" },
  { year: 2019, date: "2019-08-02", title: "Fine del Trattato INF", text: "Gli Stati Uniti si ritirano accusando la Russia di violazioni; il trattato decade.", tag: "trattato" },
  { year: 2020, date: "2020-01-23", title: "Cento secondi", text: "Il Doomsday Clock passa per la prima volta dai minuti ai secondi.", tag: "storia" },
  { year: 2021, date: "2021-01-22", title: "Il TPNW entra in vigore", text: "Dopo la cinquantesima ratifica; nessuno stato nucleare vi aderisce.", tag: "trattato" },
  { year: 2021, date: "2021-02-03", title: "New START prorogato", text: "Esteso di cinque anni, fino al 5 febbraio 2026.", tag: "trattato" },
  { year: 2023, date: "2023-02-21", title: "La Russia sospende New START", text: "Si interrompono ispezioni e scambi di dati, ultimo pilastro del controllo bilaterale.", tag: "trattato" },
  { year: 2023, date: "2023-11-02", title: "La Russia revoca la ratifica del CTBT", text: "Mosca dichiara di volersi allineare alla posizione degli Stati Uniti, che hanno firmato ma non ratificato.", tag: "trattato" },
  { year: 2024, date: "2024-10-11", title: "Nobel a Nihon Hidankyo", text: "Il Premio Nobel per la Pace va all'organizzazione dei sopravvissuti di Hiroshima e Nagasaki.", tag: "storia" },
  { year: 2025, date: "2025-01-28", title: "Ottantanove secondi", text: "Il Doomsday Clock è fissato a 89 secondi dalla mezzanotte, il punto più vicino della sua storia.", tag: "storia" },
  { year: 2025, title: "Circa 12.200 testate", text: "Secondo la FAS nove paesi possiedono circa 12.241 testate, di cui circa 9.600 nelle scorte militari e le altre ritirate in attesa di smantellamento; l'arsenale cinese, circa 600, è quello che cresce più in fretta.", tag: "arsenale" },
  { year: 2025, date: "2025-10-30", title: "Annunciata la ripresa dei test statunitensi", text: "Il presidente Trump ordina di prepararsi a provare armi nucleari «su base paritaria» con Russia e Cina. Alla fine del 2026 nessuna esplosione è stata condotta e la forma dei test resta indefinita.", tag: "test" },
  { year: 2026, date: "2026-01-27", title: "Ottantacinque secondi", text: "Il Doomsday Clock è fissato a 85 secondi dalla mezzanotte, nuovo punto più vicino della sua storia.", tag: "storia" },
  { year: 2026, date: "2026-02-05", title: "Scade New START", text: "Finisce l'ultimo trattato che limitava gli arsenali strategici di Stati Uniti e Russia, senza proroga né sostituto. Mosca dichiara di rispettarne i limiti centrali finché lo faranno gli Stati Uniti, che non rispondono formalmente e chiedono un nuovo accordo esteso alla Cina.", tag: "trattato" },
];

// ───────────────────────────── DETONAZIONI NOTEVOLI ─────────────────────────────
// Potenze: migliori stime pubbliche (DOE/NV-209, Nuclear Weapon Archive, CTBTO, NORSAR).
// Dove le fonti divergono, la nota riporta la forbice.

export const TESTS: {
  name: string;
  country: string;
  date: string;
  yieldKt: number;
  type: "atmosferico" | "superficie" | "sotterraneo" | "subacqueo" | "alta quota" | "in guerra";
  site: string;
  note: string;
}[] = [
  { name: "Trinity", country: "Stati Uniti", date: "1945-07-16", yieldKt: 25, type: "atmosferico", site: "Alamogordo, Nuovo Messico", note: "Su torre di 30 m. Stima storica 21 kt, rivalutata nel 2021 a circa 25 kt." },
  { name: "Little Boy", country: "Stati Uniti", date: "1945-08-06", yieldKt: 15, type: "in guerra", site: "Hiroshima, Giappone", note: "Scoppio a circa 580–600 m. Stime 13–18 kt." },
  { name: "Fat Man", country: "Stati Uniti", date: "1945-08-09", yieldKt: 21, type: "in guerra", site: "Nagasaki, Giappone", note: "Scoppio a circa 500 m sulla valle dell'Urakami. Stime 19–23 kt." },
  { name: "Crossroads Able", country: "Stati Uniti", date: "1946-07-01", yieldKt: 23, type: "atmosferico", site: "Atollo di Bikini", note: "Sganciata da aereo su una flotta bersaglio; cadde a circa 600 m dal punto previsto." },
  { name: "Crossroads Baker", country: "Stati Uniti", date: "1946-07-25", yieldKt: 23, type: "subacqueo", site: "Laguna di Bikini", note: "A circa 27 m di profondità. Onda di base radioattiva, otto navi affondate." },
  { name: "Sandstone X-Ray", country: "Stati Uniti", date: "1948-04-15", yieldKt: 37, type: "atmosferico", site: "Atollo di Enewetak", note: "Primo test dopo la guerra a verificare un progetto più efficiente; su torre." },
  { name: "RDS-1", country: "URSS", date: "1949-08-29", yieldKt: 22, type: "atmosferico", site: "Semipalatinsk, Kazakistan", note: "Primo test sovietico, su torre. Noto in Occidente come Joe-1." },
  { name: "Ranger Able", country: "Stati Uniti", date: "1951-01-27", yieldKt: 1, type: "atmosferico", site: "Nevada Test Site", note: "Primo test nel poligono del Nevada; l'inizio di 928 test in quel sito." },
  { name: "Greenhouse George", country: "Stati Uniti", date: "1951-05-09", yieldKt: 225, type: "atmosferico", site: "Atollo di Enewetak", note: "Primo esperimento con una quantità significativa di reazioni di fusione." },
  { name: "Buster-Jangle Sugar", country: "Stati Uniti", date: "1951-11-19", yieldKt: 1.2, type: "superficie", site: "Nevada Test Site", note: "Primo scoppio statunitense al suolo, per studiare crateri e fallout." },
  { name: "Buster-Jangle Uncle", country: "Stati Uniti", date: "1951-11-29", yieldKt: 1.2, type: "sotterraneo", site: "Nevada Test Site", note: "Interrato a circa 5 m: non contenuto, formò un cratere." },
  { name: "Hurricane", country: "Regno Unito", date: "1952-10-03", yieldKt: 25, type: "superficie", site: "Isole Monte Bello, Australia", note: "Nello scafo della fregata HMS Plym, sotto la linea di galleggiamento. Primo test britannico." },
  { name: "Ivy Mike", country: "Stati Uniti", date: "1952-11-01", yieldKt: 10400, type: "superficie", site: "Elugelab, Enewetak", note: "Primo dispositivo termonucleare; non trasportabile. L'isolotto fu sostituito da un cratere di circa 1,9 km." },
  { name: "Ivy King", country: "Stati Uniti", date: "1952-11-16", yieldKt: 500, type: "atmosferico", site: "Atollo di Enewetak", note: "La più potente esplosione statunitense a sola fissione." },
  { name: "Upshot-Knothole Grable", country: "Stati Uniti", date: "1953-05-25", yieldKt: 15, type: "atmosferico", site: "Nevada Test Site", note: "Proiettile sparato da un cannone di artiglieria, esploso a circa 160 m." },
  { name: "RDS-6s", country: "URSS", date: "1953-08-12", yieldKt: 400, type: "atmosferico", site: "Semipalatinsk, Kazakistan", note: "Ordigno con potenziamento da fusione, circa 15–20% dell'energia dalla fusione. Joe-4 in Occidente." },
  { name: "Castle Bravo", country: "Stati Uniti", date: "1954-03-01", yieldKt: 15000, type: "superficie", site: "Atollo di Bikini", note: "Il test statunitense più potente: 15 Mt contro 4–8 previsti. Fallout su Rongelap e sul Daigo Fukuryū Maru." },
  { name: "Castle Romeo", country: "Stati Uniti", date: "1954-03-27", yieldKt: 11000, type: "superficie", site: "Atollo di Bikini", note: "Su chiatta; anch'esso circa tre volte oltre la previsione." },
  { name: "Castle Yankee", country: "Stati Uniti", date: "1954-05-05", yieldKt: 13500, type: "superficie", site: "Atollo di Bikini", note: "Su chiatta; secondo test statunitense per potenza." },
  { name: "Esercitazione di Tockoe", country: "URSS", date: "1954-09-14", yieldKt: 40, type: "atmosferico", site: "Tockoe, regione di Orenburg", note: "Esercitazione militare con decine di migliaia di soldati che manovrarono vicino al punto di scoppio." },
  { name: "Wigwam", country: "Stati Uniti", date: "1955-05-14", yieldKt: 30, type: "subacqueo", site: "Pacifico, a sud-ovest di San Diego", note: "A circa 600 m di profondità, per misurare gli effetti sui sommergibili." },
  { name: "RDS-37", country: "URSS", date: "1955-11-22", yieldKt: 1600, type: "atmosferico", site: "Semipalatinsk, Kazakistan", note: "Primo termonucleare sovietico a due stadi, sganciato da aereo. Potenza ridotta di proposito per il test." },
  { name: "Redwing Cherokee", country: "Stati Uniti", date: "1956-05-21", yieldKt: 3800, type: "atmosferico", site: "Atollo di Bikini", note: "Prima bomba termonucleare statunitense sganciata da aereo; cadde a circa 6 km dal bersaglio." },
  { name: "Grapple 1 (Short Granite)", country: "Regno Unito", date: "1957-05-15", yieldKt: 300, type: "atmosferico", site: "Isola Malden, Pacifico", note: "Primo tentativo termonucleare britannico; potenza molto inferiore all'obiettivo." },
  { name: "Plumbbob Hood", country: "Stati Uniti", date: "1957-07-05", yieldKt: 74, type: "atmosferico", site: "Nevada Test Site", note: "Da pallone; il test atmosferico più potente sul territorio continentale degli Stati Uniti." },
  { name: "Plumbbob Rainier", country: "Stati Uniti", date: "1957-09-19", yieldKt: 1.7, type: "sotterraneo", site: "Nevada Test Site", note: "Primo test sotterraneo completamente contenuto; i sismografi lo registrarono fino in Alaska." },
  { name: "Grapple X", country: "Regno Unito", date: "1957-11-08", yieldKt: 1800, type: "atmosferico", site: "Isola di Natale (Kiritimati)", note: "Primo test britannico nel megaton." },
  { name: "Grapple Y", country: "Regno Unito", date: "1958-04-28", yieldKt: 3000, type: "atmosferico", site: "Isola di Natale (Kiritimati)", note: "Il test britannico più potente." },
  { name: "Hardtack Teak", country: "Stati Uniti", date: "1958-08-01", yieldKt: 3800, type: "alta quota", site: "Atollo Johnston (≈ 77 km di quota)", note: "Aurora artificiale visibile fino alle Hawaii; interruzioni delle radiocomunicazioni nel Pacifico." },
  { name: "Hardtack Orange", country: "Stati Uniti", date: "1958-08-12", yieldKt: 3800, type: "alta quota", site: "Atollo Johnston (≈ 43 km di quota)", note: "Seconda prova ad alta quota della serie." },
  { name: "Gerboise Bleue", country: "Francia", date: "1960-02-13", yieldKt: 70, type: "atmosferico", site: "Reggane, Algeria", note: "Primo test francese, su torre; il più potente primo test di qualsiasi paese." },
  { name: "Tsar Bomba (AN602)", country: "URSS", date: "1961-10-30", yieldKt: 50000, type: "atmosferico", site: "Novaja Zemlja", note: "Sganciata da aereo, esplosa a circa 4 km di quota. Stime 50–58 Mt; nube fino a circa 60–67 km." },
  { name: "Gnome", country: "Stati Uniti", date: "1961-12-10", yieldKt: 3.1, type: "sotterraneo", site: "Carlsbad, Nuovo Messico", note: "Programma Plowshare, in un deposito di sale; rilascio di vapore radioattivo imprevisto." },
  { name: "Dominic Frigate Bird", country: "Stati Uniti", date: "1962-05-06", yieldKt: 600, type: "atmosferico", site: "Pacifico centrale", note: "Unico test statunitense con un missile balistico lanciato da sottomarino fino alla detonazione." },
  { name: "Sedan", country: "Stati Uniti", date: "1962-07-06", yieldKt: 104, type: "sotterraneo", site: "Nevada Test Site", note: "Plowshare, a 194 m: cratere di circa 390 m × 98 m. Non contenuto, ricadute radioattive fuori dal poligono." },
  { name: "Starfish Prime", country: "Stati Uniti", date: "1962-07-09", yieldKt: 1400, type: "alta quota", site: "Atollo Johnston (≈ 400 km di quota)", note: "EMP alle Hawaii a 1.450 km; fasce di radiazione artificiali che danneggiarono diversi satelliti." },
  { name: "Test 184 (K-3)", country: "URSS", date: "1962-10-22", yieldKt: 300, type: "alta quota", site: "Kazakistan (≈ 290 km di quota)", note: "Progetto K: danni da EMP a linee elettriche e telefoniche sotterranee e aeree." },
  { name: "Test 219", country: "URSS", date: "1962-12-24", yieldKt: 24200, type: "atmosferico", site: "Novaja Zemlja", note: "Secondo test più potente della storia (stima pubblica)." },
  { name: "Test 596", country: "Cina", date: "1964-10-16", yieldKt: 22, type: "atmosferico", site: "Lop Nur, Xinjiang", note: "Primo test cinese, su torre." },
  { name: "Chagan", country: "URSS", date: "1965-01-15", yieldKt: 140, type: "sotterraneo", site: "Semipalatinsk, Kazakistan", note: "Esplosione «pacifica» per creare un bacino: il cratere è oggi un lago, ancora contaminato." },
  { name: "Test n. 6", country: "Cina", date: "1967-06-17", yieldKt: 3300, type: "atmosferico", site: "Lop Nur, Xinjiang", note: "Primo termonucleare cinese, sganciato da aereo, 32 mesi dopo il primo test." },
  { name: "Canopus", country: "Francia", date: "1968-08-24", yieldKt: 2600, type: "atmosferico", site: "Atollo di Fangataufa", note: "Primo termonucleare francese, da pallone; l'atollo restò interdetto per anni." },
  { name: "Milrow", country: "Stati Uniti", date: "1969-10-02", yieldKt: 1000, type: "sotterraneo", site: "Amchitka, Alaska", note: "Test di calibrazione per Cannikin; proteste per il rischio sismico e di tsunami, da cui nacque Greenpeace." },
  { name: "Baneberry", country: "Stati Uniti", date: "1970-12-18", yieldKt: 10, type: "sotterraneo", site: "Nevada Test Site", note: "Sfiato imprevisto di una nube radioattiva fino a circa 3 km di quota." },
  { name: "Cannikin", country: "Stati Uniti", date: "1971-11-06", yieldKt: 5000, type: "sotterraneo", site: "Amchitka, Alaska", note: "Il più potente test sotterraneo statunitense: meno di 5 Mt; terremoto di magnitudo circa 7." },
  { name: "Test del 12 settembre 1973", country: "URSS", date: "1973-09-12", yieldKt: 4200, type: "sotterraneo", site: "Novaja Zemlja (Matočkin Šar)", note: "Il più potente test sotterraneo sovietico: quattro cariche simultanee, circa 4,2 Mt in tutto (mb 6,97). Il 27 ottobre 1973, nell'area meridionale, una singola carica di circa 3,5 Mt diede una magnitudo quasi uguale." },
  { name: "Smiling Buddha", country: "India", date: "1974-05-18", yieldKt: 8, type: "sotterraneo", site: "Pokhran, Rajasthan", note: "Dichiarato «esplosione pacifica», 12 kt secondo l'India; stime sismiche 4–10 kt." },
  { name: "Incidente Vela", country: "Non attribuito", date: "1979-09-22", yieldKt: 3, type: "atmosferico", site: "Atlantico meridionale (presunto)", note: "Doppio lampo registrato dal satellite Vela 6911. Mai confermato ufficialmente; potenza ipotizzata 2–3 kt." },
  { name: "Ultimo test sovietico", country: "URSS", date: "1990-10-24", yieldKt: 70, type: "sotterraneo", site: "Novaja Zemlja", note: "Otto cariche simultanee. Dichiarato dall'URSS nella classe 20–150 kt; la stima più citata è circa 70 kt." },
  { name: "Divider", country: "Stati Uniti", date: "1992-09-23", yieldKt: 20, type: "sotterraneo", site: "Nevada Test Site", note: "Ultimo test statunitense. Potenza dichiarata solo come inferiore a 20 kt: il valore è un limite superiore." },
  { name: "Xouthos", country: "Francia", date: "1996-01-27", yieldKt: 120, type: "sotterraneo", site: "Atollo di Fangataufa", note: "Ultimo test francese, al termine di una serie che suscitò proteste internazionali." },
  { name: "Ultimo test cinese", country: "Cina", date: "1996-07-29", yieldKt: 3, type: "sotterraneo", site: "Lop Nur, Xinjiang", note: "Potenza stimata 1–5 kt." },
  { name: "Shakti (Pokhran-II)", country: "India", date: "1998-05-11", yieldKt: 20, type: "sotterraneo", site: "Pokhran, Rajasthan", note: "Tre ordigni simultanei; l'India dichiarò 55–58 kt in totale (43–45 kt il principale). Le stime indipendenti vanno da 10–15 kt (sismiche) a circa 25 kt: il valore indicato è una stima centrale." },
  { name: "Chagai-I", country: "Pakistan", date: "1998-05-28", yieldKt: 9, type: "sotterraneo", site: "Ras Koh, Belucistan", note: "Dichiarati fino a 40 kt complessivi; stime sismiche circa 6–13 kt, valore centrale ≈ 9 kt." },
  { name: "Chagai-II", country: "Pakistan", date: "1998-05-30", yieldKt: 4, type: "sotterraneo", site: "Kharan, Belucistan", note: "Dichiarati 12–18 kt secondo le fonti; stime sismiche 2–8 kt, valore centrale ≈ 4 kt." },
  { name: "Primo test nordcoreano", country: "Corea del Nord", date: "2006-10-09", yieldKt: 0.7, type: "sotterraneo", site: "Punggye-ri", note: "Potenza stimata 0,5–1 kt, probabilmente inferiore alle attese." },
  { name: "Secondo test nordcoreano", country: "Corea del Nord", date: "2009-05-25", yieldKt: 3, type: "sotterraneo", site: "Punggye-ri", note: "Stime 2–5 kt." },
  { name: "Terzo test nordcoreano", country: "Corea del Nord", date: "2013-02-12", yieldKt: 10, type: "sotterraneo", site: "Punggye-ri", note: "Stime 6–16 kt." },
  { name: "Quarto test nordcoreano", country: "Corea del Nord", date: "2016-01-06", yieldKt: 8, type: "sotterraneo", site: "Punggye-ri", note: "Annunciato come termonucleare; stime 7–10 kt." },
  { name: "Quinto test nordcoreano", country: "Corea del Nord", date: "2016-09-09", yieldKt: 15, type: "sotterraneo", site: "Punggye-ri", note: "Stime 10–25 kt." },
  { name: "Sesto test nordcoreano", country: "Corea del Nord", date: "2017-09-03", yieldKt: 200, type: "sotterraneo", site: "Punggye-ri", note: "Magnitudo 6,1–6,3. Stime pubblicate da circa 70 a oltre 250 kt; le più citate stanno fra 140 kt (intelligence statunitense) e 250 kt (NORSAR, 38 North)." },
];

// ───────────────────────────── ARSENALI ─────────────────────────────
// Scorte militari stimate (testate assegnate alle forze armate, schierate o in riserva),
// ESCLUSE le testate ritirate in attesa di smantellamento: serie storica FAS (Kristensen, Korda
// et al., «Estimated Global Nuclear Warhead Inventories», aggiornamento 2026), che riprende e rivede
// Norris e Kristensen, «Global nuclear weapons inventories, 1945–2013», Bulletin of the Atomic
// Scientists, 2013. Per gli Stati Uniti fino al 2020 coincide con la scorta dichiarata dal DOE/NNSA.
// Contando anche le ritirate il totale mondiale è più alto: ≈ 70.400 nel 1986, ≈ 34.000 nel 2000,
// ≈ 12.241 nel 2025. Israele, Corea del Nord e i primi anni di India e Pakistan sono stime con
// incertezze ampie (per la Corea del Nord: testate assemblate, non materiale fissile disponibile).

export const ARSENALS: {
  year: number;
  US: number;
  RU: number;
  UK: number;
  FR: number;
  CN: number;
  IN: number;
  PK: number;
  IL: number;
  KP: number;
}[] = [
  { year: 1945, US: 2, RU: 0, UK: 0, FR: 0, CN: 0, IN: 0, PK: 0, IL: 0, KP: 0 },
  { year: 1950, US: 299, RU: 5, UK: 0, FR: 0, CN: 0, IN: 0, PK: 0, IL: 0, KP: 0 },
  { year: 1955, US: 2422, RU: 200, UK: 10, FR: 0, CN: 0, IN: 0, PK: 0, IL: 0, KP: 0 },
  { year: 1960, US: 18638, RU: 1627, UK: 105, FR: 0, CN: 0, IN: 0, PK: 0, IL: 0, KP: 0 },
  { year: 1965, US: 31139, RU: 6144, UK: 271, FR: 32, CN: 5, IN: 0, PK: 0, IL: 0, KP: 0 },
  { year: 1970, US: 26008, RU: 11736, UK: 375, FR: 36, CN: 75, IN: 0, PK: 0, IL: 8, KP: 0 },
  { year: 1975, US: 27519, RU: 19235, UK: 500, FR: 188, CN: 180, IN: 0, PK: 0, IL: 20, KP: 0 },
  { year: 1980, US: 24104, RU: 30665, UK: 500, FR: 250, CN: 205, IN: 0, PK: 0, IL: 31, KP: 0 },
  { year: 1985, US: 23368, RU: 38582, UK: 350, FR: 360, CN: 222, IN: 0, PK: 0, IL: 42, KP: 0 },
  { year: 1986, US: 23317, RU: 40159, UK: 350, FR: 355, CN: 224, IN: 0, PK: 0, IL: 44, KP: 0 },
  { year: 1990, US: 21392, RU: 32980, UK: 350, FR: 505, CN: 232, IN: 0, PK: 0, IL: 53, KP: 0 },
  { year: 1995, US: 10904, RU: 18179, UK: 234, FR: 500, CN: 234, IN: 0, PK: 0, IL: 63, KP: 0 },
  { year: 2000, US: 10577, RU: 12188, UK: 280, FR: 470, CN: 232, IN: 13, PK: 14, IL: 72, KP: 0 },
  { year: 2005, US: 8360, RU: 7000, UK: 280, FR: 350, CN: 235, IN: 38, PK: 44, IL: 80, KP: 0 },
  { year: 2010, US: 5066, RU: 5215, UK: 225, FR: 300, CN: 240, IN: 80, PK: 90, IL: 80, KP: 0 },
  { year: 2015, US: 4571, RU: 4500, UK: 225, FR: 300, CN: 260, IN: 110, PK: 125, IL: 80, KP: 5 },
  { year: 2020, US: 3750, RU: 4310, UK: 225, FR: 290, CN: 350, IN: 150, PK: 160, IL: 90, KP: 15 },
  { year: 2025, US: 3700, RU: 4309, UK: 225, FR: 290, CN: 600, IN: 180, PK: 170, IL: 90, KP: 50 },
];
