export function Method() {
  return (
    <article className="mx-auto h-full max-w-2xl overflow-y-auto px-4 py-6 text-fg">
      <p className="text-xs tracking-widest text-muted uppercase">Metodo</p>
      <h2 className="font-serif text-3xl leading-tight">Che cosa calcola, e che cosa no</h2>
      <div className="mt-4 space-y-4 text-base leading-relaxed">
        <p>
          Atlante è un osservatorio. Mette su una mappa gli ordini di grandezza pubblicati da mezzo secolo di manuali aperti — non una previsione, non un piano, non un modo per costruire qualcosa. Le sagome in biblioteca sono profili esterni di categoria.
        </p>
        <h3 className="font-serif text-2xl">Onda d'urto</h3>
        <p>
          La sovrapressione viene dall'approssimazione di Harold Brode (1986), la stessa famiglia di curve usata per leggere Glasstone e Dolan (1977). A livello del mare l'errore dichiarato è circa il dieci per cento. Controlli di sanità: 15 kt a 580 m di quota danno circa 5 psi a 1,6 km; 1 Mt in aria ottimale circa 6,7 km a 5 psi (il manuale dice circa 7); 1 Mt al suolo circa 4,7 km (il manuale circa 4,4). La quota che massimizza il cerchio dei 5 psi, in questo fit, è 276 metri per la radice cubica della potenza in kiloton.
        </p>
        <p>
          20 psi distrugge il cemento armato pesante. 5 psi fa crollare la casa ordinaria: è la soglia storica della «distruzione urbana». 1 psi rompe i vetri, e i vetri feriscono. Il terreno, la forma delle strade e la qualità dei palazzi non entrano nel conto.
        </p>
        <h3 className="font-serif text-2xl">Calore</h3>
        <p>
          L'energia termica segue la formula geometrica di Glasstone: una frazione dell'ordine del 35% per uno scoppio in aria, circa la metà al suolo, molto meno se lo scoppio è sepolto o sott'acqua. La soglia per le ustioni cresce con la durata dell'impulso, quindi con la potenza. Foschia, umidità e nubi accorciano i raggi. Per Hiroshima il terzo grado cade intorno ai 2 km e il primo grado poco sotto i 4: è l'ordine storico, non la mappa medica della città.
        </p>
        <h3 className="font-serif text-2xl">Radiazione pronta e fallout</h3>
        <p>
          I 5 Gy pronti scalano debolmente con la potenza, perché l'aria assorbe. Sotto i 10 kt possono uscire dal cerchio dell'onda; sopra, di solito ci stanno dentro. Il fallout locale è disegnato solo se la palla di fuoco tocca terra, o se lo scoppio è di superficie o sotterraneo non contenuto. La forma è un sigaro sottovento calibrato in modo grossolano su 1 Mt di fissione e su casi come Bravo: non è un modello di particelle. La pioggia lo accorcia e lo concentra. La regola del 7 e 10 — ogni sette volte il tempo, il rateo scende di dieci — sta dietro l'idea di dose totale, non è stampata come previsione ora per ora.
        </p>
        <h3 className="font-serif text-2xl">Persone</h3>
        <p>
          Le città sono GeoNames, soglia 15 mila abitanti, licenza CC-BY, popolazione di oggi. Ogni città è un disco la cui area viene dalla popolazione e da una densità ipotizzata (più alta nelle metropoli). Le morti sono la popolazione del disco pesata per anelli di sovrapressione, calore e radiazione, più una densità di fondo che puoi azzerare. I rifugi cambiano le probabilità nel senso descritto dall'Office of Technology Assessment nel 1979: non le annullano dentro i 20 psi. La fascia mostrata, da circa metà al doppio e mezzo, è lì per impedire di leggere una cifra tonda come un censimento.
        </p>
        <h3 className="font-serif text-2xl">Clima</h3>
        <p>
          La fuliggine è proporzionata, con un fattore largo, all'area urbana che può prendere fuoco, usando come scala i lavori di Toon, Robock e colleghi (un centinaio di incendi tipo Hiroshima può iniettare qualche teragrammo). Sotto qualche centesimo di teragrammo il testo dice, semplicemente, che un inverno nucleare non nasce da un singolo scoppio.
        </p>
        <h3 className="font-serif text-2xl">Che cosa sta in questo sito</h3>
        <p>
          Il catalogo dei dispositivi, le fotografie, le città e i calcoli viaggiano con la pagina. I nomi dei luoghi escono da GeoNames (città sopra i 15 mila abitanti, CC-BY), non da un geocoder esterno. Le tessere di mappa arrivano dai servizi pubblici di Esri, senza chiave: una mappa del mondo non si può allegare intera. L'unica altra chiamata in rete è il meteo, e con esso la quota del punto, da Open-Meteo. Se non risponde, restano vento, visibilità e pressione di riferimento.
        </p>
        <h3 className="font-serif text-2xl">Meteo</h3>
        <p>
          Open-Meteo fornisce vento, nubi, umidità, visibilità e pressione nel punto, adesso. Puoi sostituire il vento. Il meteo di Castle Bravo nel 1954 non è il meteo di Bikini oggi: per quel caso conviene il vento manuale.
        </p>
      </div>
    </article>
  );
}
