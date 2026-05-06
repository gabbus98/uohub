import { Article } from '../models/article.model';

export const ARTICLES: Record<string, Article> = {

  'tools': {
    title: 'Tool & Calcolatori',
    desc: 'Strumenti interattivi per pianificare la tua build e consultare dati di gioco.',
    body: ''
  },

  'tool-skill-calc': {
    cat: 'Tool', title: 'Skill Calculator',
    desc: 'Pianifica la tua build sommando le skill e verificando di restare entro il cap da 700 punti.',
    tags: [{ t: 'Calcolatore', cls: 'blue' }, { t: 'Build' }],
    body: ''
  },

  'tool-bb-split': {
    cat: 'Tool', title: 'Formattatore per Bacheca',
    desc: 'Spezza automaticamente un testo lungo in più post da bacheca, rispettando i limiti di peso per carattere del sistema UO.',
    tags: [{ t: 'Bacheca', cls: 'blue' }, { t: 'Formattazione' }],
    body: ''
  },

  'tool-enchant-cost': {
    cat: 'Tool', title: 'Costo Incantamento',
    desc: 'Calcola il costo di incantamento per rune maggiori e minori.',
    tags: [{ t: 'Calcolatore', cls: 'blue' }, { t: 'Incantamento', cls: 'gold' }],
    body: ''
  },

  'tool-armor-cost': {
    cat: 'Tool', title: 'Armature Metalliche Infuse',
    desc: 'Calcola il costo di armature in metallo infuso o in lega infusa.',
    tags: [{ t: 'Calcolatore', cls: 'blue' }, { t: 'Armature', cls: 'gold' }],
    body: ''
  },

  'home': {
    title: 'The Last Hunt Wiki',
    body: `
    <div class="home-hero">
      <p class="eyebrow">Ultima Online — Shard Privato</p>
      <h1>How to <em>The Miracle</em> Shard</h1>
      <p>Portale ufficiale di regole, meccaniche, lore e risorse di gilda.</p>
    </div>
    <div class="home-grid">
      <div class="home-card" onclick="openArticle('skills')">
        <div class="hc-icon">⚙</div>
        <div class="hc-title">Meccaniche</div>
        <div class="hc-desc">Skill, progressione e crafting</div>
      </div>
      <div class="home-card" onclick="openArticle('bestiario')">
        <div class="hc-icon">🐉</div>
        <div class="hc-title">Bestiario</div>
        <div class="hc-desc">Creature, boss e strategie di caccia</div>
      </div>
      <div class="home-card" onclick="openArticle('dungeon')">
        <div class="hc-icon">💀</div>
        <div class="hc-title">Dungeon</div>
        <div class="hc-desc">Accesso, pericoli e bottino</div>
      </div>
      <div class="home-card" onclick="openArticle('changelog')">
        <div class="hc-icon">📋</div>
        <div class="hc-title">Changelog</div>
        <div class="hc-desc">Aggiornamenti e novità dello shard</div>
      </div>
    </div>`
  },

  'changelog': {
    cat: 'Generale', title: 'Changelog Shard',
    desc: 'Storico degli aggiornamenti e delle modifiche allo shard.',
    tags: [{ t: 'Aggiornamenti', cls: 'blue' }],
    body: `
    <div class="wiki-section">
      <h2 class="wiki-h2">Versioni</h2>
      <div class="timeline">
        <div class="tl-item">
          <div class="tl-date">PATCH 1.4 — 8 GEN</div>
          <div class="tl-title">Caverne dell'Agonia &amp; Drop Rari</div>
          <div class="tl-desc">Aggiunto nuovo dungeon a 3 livelli. Introdotti drop di Artigli di Varroth e Pelle del Predatore Antico. Bilanciamento creature rare.</div>
        </div>
        <div class="tl-item">
          <div class="tl-date">PATCH 1.3 — 3 GEN</div>
          <div class="tl-title">Aggiornamento Regole PvP</div>
          <div class="tl-desc">Rivisitata la politica PvP nelle zone di confine. Aggiunto il sistema di consenso esplicito. Fix ban evasion detection.</div>
        </div>
        <div class="tl-item">
          <div class="tl-date">PATCH 1.2 — 20 DIC</div>
          <div class="tl-title">Sistema Sopravvivenza</div>
          <div class="tl-desc">Introdotti fame, sete e temperatura. Aggiunti nuovi ricettari di crafting per cibo e pozioni di sopravvivenza.</div>
        </div>
        <div class="tl-item">
          <div class="tl-date">PATCH 1.1 — 1 DIC</div>
          <div class="tl-title">Open Beta</div>
          <div class="tl-desc">Prima apertura pubblica dello shard. World building completato, prime sessioni RP, correzioni bug critici.</div>
        </div>
      </div>
    </div>`
  },

  'skills': {
    cat: 'Meccaniche', title: 'Sistema Skill',
    desc: 'Panoramica del sistema di skill, cap e progressione del personaggio.',
    tags: [{ t: 'Meccanica', cls: 'blue' }, { t: 'Fondamentale' }],
    toc: [{ id: 'cap', label: 'Skill Cap' }, { id: 'skill-list', label: 'Skill principali' }, { id: 'build', label: 'Template build' }],
    body: `
    <div class="wiki-section" id="cap">
      <h2 class="wiki-h2">Skill Cap &amp; Statistiche</h2>
      <div class="stat-row">
        <div class="stat-pill"><span class="v">700</span><span class="l">Skill Cap</span></div>
        <div class="stat-pill"><span class="v">100</span><span class="l">Max per Skill</span></div>
        <div class="stat-pill"><span class="v">225</span><span class="l">Stat Cap</span></div>
        <div class="stat-pill"><span class="v">×1.5</span><span class="l">XP Weekend</span></div>
      </div>
      <p class="wiki-p">Ogni personaggio ha un totale di 700 punti skill distribuibili tra tutte le skill disponibili. Ogni singola skill può essere portata al massimo di 100.0.</p>
      <div class="callout info"><span class="callout-icon">ℹ</span><div>Le statistiche (Forza, Destrezza, Intelligenza) hanno un cap combinato di 225. Distribuirle in base al proprio stile di gioco è fondamentale per l'efficacia del personaggio.</div></div>
    </div>
    <div class="wiki-section" id="skill-list">
      <h2 class="wiki-h2">Skill Principali</h2>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Skill</th><th>Categoria</th><th>Effetto Chiave</th><th>Build ideale</th></tr></thead>
          <tbody>
            <tr><td><strong>Hunting</strong></td><td><span class="tag red">Combattimento</span></td><td>+danno vs bestie, tracciamento avanzato</td><td>Cacciatore puro</td></tr>
            <tr><td><strong>Tracking</strong></td><td><span class="tag blue">Esplorazione</span></td><td>Rivela creature nel raggio, percorsi nascosti</td><td>Scout</td></tr>
            <tr><td><strong>Anatomy</strong></td><td><span class="tag green">Supporto</span></td><td>+cure, identifica punti deboli</td><td>Medico/Guerriero</td></tr>
            <tr><td><strong>Tinkering</strong></td><td><span class="tag gold">Artigianato</span></td><td>Trappole, strumenti speciali</td><td>Artigiano</td></tr>
            <tr><td><strong>Poisoning</strong></td><td><span class="tag red">Combattimento</span></td><td>Veleni potenti su armi e frecce</td><td>Assassino</td></tr>
            <tr><td><strong>Lumberjacking</strong></td><td><span class="tag gold">Raccolta</span></td><td>+danno ascie, legni speciali</td><td>Ibrido</td></tr>
            <tr><td><strong>Animal Taming</strong></td><td><span class="tag blue">Speciale</span></td><td>Doma creature, compagni da caccia</td><td>Ranger</td></tr>
          </tbody>
        </table>
      </div>
    </div>
    <div class="wiki-section" id="build">
      <h2 class="wiki-h2">Template Build Consigliati</h2>
      <h3 class="wiki-h3">Cacciatore Puro</h3>
      <p class="wiki-p">Hunting 100 · Tracking 80 · Anatomy 70 · Hiding 80 · Stealth 80 · Healing 70 · Tactics 100 — Totale: 580 / 700</p>
      <h3 class="wiki-h3">Artigiano da Campo</h3>
      <p class="wiki-p">Tinkering 100 · Lumberjacking 100 · Mining 80 · Blacksmithing 100 · Carpentry 80 · Arms Lore 60 · Healing 50 — Totale: 570 / 700</p>
      <div class="callout tip"><span class="callout-icon">💡</span><div>Le build consigliate lasciano margine di 120–130 punti skill liberi per adattare il personaggio alle preferenze personali.</div></div>
    </div>`,
    next: { id: 'crafting', title: 'Crafting' }
  },

  'materiali': {
    cat: 'Meccaniche', title: 'Materiali',
    desc: 'Tipi di legno e metallo disponibili nello shard con la loro composizione di danni.',
    tags: [{ t: 'Meccanica', cls: 'blue' }, { t: 'Risorse', cls: 'gold' }],
    toc: [{ id: 'legnami', label: 'Legnami' }, { id: 'metalli', label: 'Metalli' }],
    body: `
    <div class="wiki-section" id="legnami">
      <h2 class="wiki-h2">Legnami</h2>
      <p class="wiki-p">Ogni tipo di legno determina la composizione del danno delle armi e degli oggetti craftati con esso.</p>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Legno</th><th>Fisico</th><th>Elementi</th></tr></thead>
          <tbody>
            <tr><td><strong>Legno</strong></td><td>100%</td><td>—</td></tr>
            <tr><td><strong>Legno vulcanico</strong></td><td>70%</td><td><span class="tag red">Fuoco 30%</span></td></tr>
            <tr><td><strong>Legno artico</strong></td><td>70%</td><td><span class="tag blue">Freddo 30%</span></td></tr>
            <tr><td><strong>Legno millenario</strong></td><td>70%</td><td><span class="tag blue">Energia 30%</span></td></tr>
            <tr><td><strong>Legno insanguinato</strong></td><td>70%</td><td><span class="tag gold">Psionico 30%</span></td></tr>
            <tr><td><strong>Legno oscuro</strong></td><td>70%</td><td><span class="tag red">Male 30%</span></td></tr>
            <tr><td><strong>Legno dorato</strong></td><td>70%</td><td><span class="tag gold">Sacro 30%</span></td></tr>
            <tr><td><strong>Legno lunare</strong></td><td>70%</td><td><span class="tag blue">Magico 30%</span></td></tr>
            <tr><td><strong>Legno selvaggio</strong></td><td>70%</td><td><span class="tag green">Veleno 30%</span></td></tr>
            <tr><td><strong>Legno fossile</strong></td><td>70%</td><td><span class="tag gold">Psionico 15%</span> <span class="tag blue">Energia 15%</span></td></tr>
            <tr><td><strong>Legno costiero</strong></td><td>70%</td><td><span class="tag blue">Freddo 15%</span> <span class="tag blue">Energia 15%</span></td></tr>
            <tr><td><strong>Legno regale</strong></td><td>70%</td><td><span class="tag gold">Sacro 15%</span> <span class="tag blue">Magico 15%</span></td></tr>
            <tr><td><strong>Legno sotterraneo</strong></td><td>70%</td><td><span class="tag red">Male 15%</span> <span class="tag green">Veleno 15%</span></td></tr>
            <tr><td><strong>Legno esotico</strong></td><td>70%</td><td><span class="tag blue">Magico 15%</span> <span class="tag green">Veleno 15%</span></td></tr>
            <tr><td><strong>Legno antico</strong></td><td>70%</td><td><span class="tag gold">Sacro 15%</span> <span class="tag gold">Psionico 15%</span></td></tr>
          </tbody>
        </table>
      </div>
    </div>
    <div class="wiki-section" id="metalli">
      <h2 class="wiki-h2">Metalli</h2>
      <p class="wiki-p">I metalli determinano la composizione del danno di armi e armature in metallo.</p>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Metallo</th><th>Fisico</th><th>Elementi</th></tr></thead>
          <tbody>
            <tr><td><strong>Pirite</strong></td><td>80%</td><td><span class="tag red">Fuoco 20%</span></td></tr>
            <tr><td><strong>Azurite</strong></td><td>80%</td><td><span class="tag blue">Freddo 20%</span></td></tr>
            <tr><td><strong>Valorium</strong></td><td>80%</td><td><span class="tag blue">Energia 20%</span></td></tr>
            <tr><td><strong>Ossidiana</strong></td><td>80%</td><td><span class="tag green">Veleno 20%</span></td></tr>
            <tr><td><strong>Merkite</strong></td><td>80%</td><td><span class="tag gold">Psionico 20%</span></td></tr>
            <tr><td><strong>Titanio</strong></td><td>80%</td><td><span class="tag red">Male 20%</span></td></tr>
            <tr><td><strong>Talavholk</strong></td><td>80%</td><td><span class="tag gold">Sacro 20%</span></td></tr>
            <tr><td><strong>Orialkon</strong></td><td>80%</td><td><span class="tag blue">Magico 20%</span></td></tr>
            <tr><td><strong>Mithryl</strong></td><td>70%</td><td><span class="tag red">Fuoco 10%</span> <span class="tag blue">Freddo 10%</span> <span class="tag blue">Energia 10%</span></td></tr>
            <tr><td><strong>Ithilmar</strong></td><td>100%</td><td>—</td></tr>
            <tr><td><strong>Adamantio</strong></td><td>100%</td><td>—</td></tr>
          </tbody>
        </table>
      </div>
    </div>`,
    prev: { id: 'crafting', title: 'Crafting' },
    next: { id: 'archi-balestre', title: 'Archi & Balestre' }
  },

  'archi-balestre': {
    cat: 'Meccaniche', title: 'Archi & Balestre',
    desc: 'Statistiche di archi e balestre craftabili per livello di skill, con composizione del danno per ogni tipo di legno.',
    tags: [{ t: 'Meccanica', cls: 'blue' }, { t: 'Artigianato', cls: 'gold' }, { t: 'Ranged', cls: 'red' }],
    toc: [
      { id: 'legni',     label: 'Legni e Usura' },
      { id: 'craft-100', label: 'Craft — 100 Skill' },
      { id: 'craft-200', label: 'Craft — 200 Skill' },
      { id: 'craft-241', label: 'Craft — 241 Skill' },
      { id: 'craft-245', label: 'Craft — 245 Skill' },
    ],
    body: `
    <div class="wiki-section" id="legni">
      <h2 class="wiki-h2">Legni e Usura</h2>
      <p class="wiki-p">La composizione del danno varia in base al legno usato per craftare l'arma. I valori di Usura nelle tabelle di craft si riferiscono al <strong>Legno Comune</strong>. Fanno eccezione Millenario (Archi: 78 · Balestre: 96) e Costiero (Balestre: 36).</p>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Legno</th><th>Composizione Danno</th><th>Usura Archi</th><th>Usura Balestre</th></tr></thead>
          <tbody>
            <tr><td><strong>Comune</strong></td><td>100% Fisico</td><td>base</td><td>base</td></tr>
            <tr><td><strong>Vulcanico</strong></td><td><span class="tag red">Fuoco 30%</span></td><td>—</td><td>—</td></tr>
            <tr><td><strong>Artico</strong></td><td><span class="tag blue">Freddo 30%</span></td><td>—</td><td>—</td></tr>
            <tr><td><strong>Insanguinato</strong></td><td><span class="tag gold">Psionico 30%</span></td><td>—</td><td>—</td></tr>
            <tr><td><strong>Lunare</strong></td><td><span class="tag blue">Magico 30%</span></td><td>—</td><td>—</td></tr>
            <tr><td><strong>Selvaggio</strong></td><td><span class="tag green">Veleno 30%</span></td><td>—</td><td>—</td></tr>
            <tr><td><strong>Millenario</strong></td><td><span class="tag blue">Energia 30%</span></td><td><strong>78</strong></td><td><strong>96</strong></td></tr>
            <tr><td><strong>Regale</strong></td><td><span class="tag blue">Magico 15%</span> <span class="tag gold">Sacro 15%</span></td><td>—</td><td>—</td></tr>
            <tr><td><strong>Sotterraneo</strong></td><td><span class="tag red">Male 15%</span> <span class="tag green">Veleno 15%</span></td><td>—</td><td>—</td></tr>
            <tr><td><strong>Antico</strong></td><td><span class="tag gold">Psionico 15%</span> <span class="tag gold">Sacro 15%</span></td><td>—</td><td>—</td></tr>
            <tr><td><strong>Fossile</strong></td><td><span class="tag gold">Psionico 15%</span> <span class="tag blue">Energia 15%</span></td><td>—</td><td>—</td></tr>
            <tr><td><strong>Dorato</strong></td><td><span class="tag gold">Sacro 30%</span></td><td>—</td><td>—</td></tr>
            <tr><td><strong>Oscuro</strong></td><td><span class="tag red">Male 30%</span></td><td>—</td><td>—</td></tr>
            <tr><td><strong>Costiero</strong></td><td><span class="tag blue">Freddo 15%</span> <span class="tag blue">Energia 15%</span></td><td>—</td><td><strong>36</strong></td></tr>
            <tr><td><strong>Esotico</strong></td><td><span class="tag blue">Magico 15%</span> <span class="tag green">Veleno 15%</span></td><td>—</td><td>—</td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="wiki-section" id="craft-100">
      <h2 class="wiki-h2">Craft — 100 Skill</h2>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Arma</th><th>Mani</th><th>Rap.</th><th>Pot.</th><th>Git.</th><th>Usura</th><th>Speciale</th><th>Ab. Primaria</th><th>Ab. Secondaria</th></tr></thead>
          <tbody>
            <tr><td>Arco corto</td><td>2</td><td>45</td><td>20</td><td>9</td><td>33</td><td>—</td><td>Scocco in movimento</td><td>Mortale</td></tr>
            <tr><td>Arco</td><td>2</td><td>28</td><td>27</td><td>11</td><td>33</td><td>—</td><td>Scocco in movimento</td><td>Mortale</td></tr>
            <tr><td>Arco lungo</td><td>2</td><td>22</td><td>30</td><td>13</td><td>33</td><td>Pedone</td><td>Scocco in movimento</td><td>Mortale</td></tr>
            <tr><td>Arco a doppia curva</td><td>2</td><td>30</td><td>25</td><td>11</td><td>33</td><td>—</td><td>Devastante</td><td>Stordente</td></tr>
            <tr><td>Arco in osso</td><td>2</td><td>26</td><td>27</td><td>11</td><td>33</td><td>Melee</td><td>Scocco in movimento</td><td>Lacerante</td></tr>
            <tr><td>Arco composito</td><td>2</td><td>26</td><td>22</td><td>11</td><td>33</td><td>Check Frz</td><td>Stordente</td><td>Devastate</td></tr>
            <tr><td>Arco elfico</td><td>2</td><td>28</td><td>27</td><td>11</td><td>33</td><td>20% Crit</td><td>Scocco in movimento</td><td>Tiro Multiplo</td></tr>
            <tr><td>Balestra</td><td>1</td><td>28</td><td>27</td><td>9</td><td>41</td><td>—</td><td>Perforante</td><td>Mortale</td></tr>
            <tr><td>Balestra pesante</td><td>2</td><td>22</td><td>29</td><td>11</td><td>41</td><td>Pedone</td><td>Disarciona</td><td>Devastate</td></tr>
            <tr><td>Balestre Gemelle</td><td>2</td><td>28</td><td>27</td><td>8</td><td>41</td><td>—</td><td>Mortale</td><td>Scocco in movimento</td></tr>
            <tr><td><em>Multibalestra Drow</em></td><td>2</td><td>45</td><td>22</td><td>9</td><td>82</td><td><span class="tag red">Non Craftabile</span></td><td>Tiro Multiplo</td><td>Scocco in movimento</td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="wiki-section" id="craft-200">
      <h2 class="wiki-h2">Craft — 200 Skill</h2>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Arma</th><th>Mani</th><th>Rap.</th><th>Pot.</th><th>Git.</th><th>Usura</th><th>Speciale</th><th>Ab. Primaria</th><th>Ab. Secondaria</th></tr></thead>
          <tbody>
            <tr><td>Arco corto</td><td>2</td><td>51</td><td>20</td><td>9</td><td>37</td><td>—</td><td>Scocco in movimento</td><td>Mortale</td></tr>
            <tr><td>Arco</td><td>2</td><td>32</td><td>27</td><td>11</td><td>37</td><td>—</td><td>Scocco in movimento</td><td>Mortale</td></tr>
            <tr><td>Arco lungo</td><td>2</td><td>25</td><td>30</td><td>13</td><td>37</td><td>Pedone</td><td>Scocco in movimento</td><td>Mortale</td></tr>
            <tr><td>Arco a doppia curva</td><td>2</td><td>34</td><td>25</td><td>11</td><td>37</td><td>—</td><td>Devastante</td><td>Stordente</td></tr>
            <tr><td>Arco in osso</td><td>2</td><td>29</td><td>27</td><td>11</td><td>37</td><td>Melee</td><td>Scocco in movimento</td><td>Lacerante</td></tr>
            <tr><td>Arco composito</td><td>2</td><td>29</td><td>22</td><td>11</td><td>37</td><td>Check Frz</td><td>Stordente</td><td>Devastate</td></tr>
            <tr><td>Arco elfico</td><td>2</td><td>32</td><td>27</td><td>11</td><td>37</td><td>20% Crit</td><td>Scocco in movimento</td><td>Tiro Multiplo</td></tr>
            <tr><td>Balestra</td><td>1</td><td>32</td><td>27</td><td>9</td><td>47</td><td>—</td><td>Perforante</td><td>Mortale</td></tr>
            <tr><td>Balestra pesante</td><td>2</td><td>25</td><td>29</td><td>11</td><td>47</td><td>Pedone</td><td>Disarciona</td><td>Devastate</td></tr>
            <tr><td>Balestre Gemelle</td><td>2</td><td>32</td><td>27</td><td>8</td><td>47</td><td>—</td><td>Mortale</td><td>Scocco in movimento</td></tr>
            <tr><td><em>Multibalestra Drow</em></td><td>2</td><td>—</td><td>—</td><td>—</td><td>—</td><td><span class="tag red">Non Craftabile</span></td><td>Tiro Multiplo</td><td>Scocco in movimento</td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="wiki-section" id="craft-241">
      <h2 class="wiki-h2">Craft — 241 Skill</h2>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Arma</th><th>Mani</th><th>Rap.</th><th>Pot.</th><th>Git.</th><th>Usura</th><th>Speciale</th><th>Ab. Primaria</th><th>Ab. Secondaria</th></tr></thead>
          <tbody>
            <tr><td>Arco corto</td><td>2</td><td>54</td><td>20</td><td>9</td><td>39</td><td>—</td><td>Scocco in movimento</td><td>Mortale</td></tr>
            <tr><td>Arco</td><td>2</td><td>33</td><td>27</td><td>11</td><td>39</td><td>—</td><td>Scocco in movimento</td><td>Mortale</td></tr>
            <tr><td>Arco lungo</td><td>2</td><td>26</td><td>30</td><td>13</td><td>39</td><td>Pedone</td><td>Scocco in movimento</td><td>Mortale</td></tr>
            <tr><td>Arco a doppia curva</td><td>2</td><td>34</td><td>25</td><td>11</td><td>39</td><td>—</td><td>Devastante</td><td>Stordente</td></tr>
            <tr><td>Arco in osso</td><td>2</td><td>31</td><td>27</td><td>11</td><td>39</td><td>Melee</td><td>Scocco in movimento</td><td>Lacerante</td></tr>
            <tr><td>Arco composito</td><td>2</td><td>31</td><td>22</td><td>11</td><td>39</td><td>Check Frz</td><td>Stordente</td><td>Devastate</td></tr>
            <tr><td>Arco elfico</td><td>2</td><td>33</td><td>27</td><td>11</td><td>39</td><td>20% Crit</td><td>Scocco in movimento</td><td>Tiro Multiplo</td></tr>
            <tr><td>Balestra</td><td>1</td><td>33</td><td>27</td><td>9</td><td>49</td><td>—</td><td>Perforante</td><td>Mortale</td></tr>
            <tr><td>Balestra pesante</td><td>2</td><td>26</td><td>29</td><td>11</td><td>49</td><td>Pedone</td><td>Disarciona</td><td>Devastate</td></tr>
            <tr><td>Balestre Gemelle</td><td>2</td><td>33</td><td>27</td><td>8</td><td>49</td><td>—</td><td>Mortale</td><td>Scocco in movimento</td></tr>
            <tr><td><em>Multibalestra Drow</em></td><td>2</td><td>—</td><td>—</td><td>—</td><td>—</td><td><span class="tag red">Non Craftabile</span></td><td>Tiro Multiplo</td><td>Scocco in movimento</td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="wiki-section" id="craft-245">
      <h2 class="wiki-h2">Craft — 245 Skill</h2>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Arma</th><th>Mani</th><th>Rap.</th><th>Pot.</th><th>Git.</th><th>Usura</th><th>Speciale</th><th>Ab. Primaria</th><th>Ab. Secondaria</th></tr></thead>
          <tbody>
            <tr><td>Arco corto</td><td>2</td><td>54</td><td>20</td><td>9</td><td>40</td><td>—</td><td>Scocco in movimento</td><td>Mortale</td></tr>
            <tr><td>Arco</td><td>2</td><td>34</td><td>27</td><td>11</td><td>40</td><td>—</td><td>Scocco in movimento</td><td>Mortale</td></tr>
            <tr><td>Arco lungo</td><td>2</td><td>26</td><td>30</td><td>13</td><td>40</td><td>Pedone</td><td>Scocco in movimento</td><td>Mortale</td></tr>
            <tr><td>Arco a doppia curva</td><td>2</td><td>36</td><td>25</td><td>11</td><td>40</td><td>—</td><td>Devastante</td><td>Stordente</td></tr>
            <tr><td>Arco in osso</td><td>2</td><td>31</td><td>27</td><td>11</td><td>40</td><td>Melee</td><td>Scocco in movimento</td><td>Lacerante</td></tr>
            <tr><td>Arco composito</td><td>2</td><td>31</td><td>22</td><td>11</td><td>40</td><td>Check Frz</td><td>Stordente</td><td>Devastate</td></tr>
            <tr><td>Arco elfico</td><td>2</td><td>34</td><td>27</td><td>11</td><td>40</td><td>20% Crit</td><td>Scocco in movimento</td><td>Tiro Multiplo</td></tr>
            <tr><td>Balestra</td><td>1</td><td>34</td><td>27</td><td>9</td><td>49</td><td>—</td><td>Perforante</td><td>Mortale</td></tr>
            <tr><td>Balestra pesante</td><td>2</td><td>26</td><td>29</td><td>11</td><td>49</td><td>Pedone</td><td>Disarciona</td><td>Devastate</td></tr>
            <tr><td>Balestre Gemelle</td><td>2</td><td>34</td><td>27</td><td>8</td><td>49</td><td>—</td><td>Mortale</td><td>Scocco in movimento</td></tr>
            <tr><td><em>Multibalestra Drow</em></td><td>2</td><td>—</td><td>—</td><td>—</td><td>—</td><td><span class="tag red">Non Craftabile</span></td><td>Tiro Multiplo</td><td>Scocco in movimento</td></tr>
          </tbody>
        </table>
      </div>
    </div>`,
    prev: { id: 'materiali', title: 'Materiali' },
    next: { id: 'bestiario', title: 'Bestiario' }
  },

  'crafting': {
    cat: 'Meccaniche', title: 'Crafting',
    desc: 'Materiali, ricette e sistema di artigianato avanzato.',
    tags: [{ t: 'Meccanica', cls: 'blue' }, { t: 'Artigianato', cls: 'gold' }],
    body: `
    <div class="wiki-section">
      <h2 class="wiki-h2">Materiali da Caccia</h2>
      <p class="wiki-p">Le creature lasciano materiali grezzi che possono essere lavorati dagli artigiani:</p>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Materiale</th><th>Grado</th><th>Fonte</th><th>Uso</th></tr></thead>
          <tbody>
            <tr><td>Pelliccia Comune</td><td><span class="tag green">I</span></td><td>Lupi, volpi</td><td>Armatura leggera, cappotti</td></tr>
            <tr><td>Pelle Robusta</td><td><span class="tag green">II</span></td><td>Orsi, cinghiali</td><td>Armatura media</td></tr>
            <tr><td>Squama di Rettile</td><td><span class="tag gold">III</span></td><td>Serpenti rari, lucertoloni</td><td>Armatura + resistenza veleno</td></tr>
            <tr><td>Pelliccia Dorata</td><td><span class="tag gold">IV</span></td><td>Orso Antico (raro)</td><td>Set leggendario</td></tr>
            <tr><td>Scaglia Antica</td><td><span class="tag red">V</span></td><td>Boss</td><td>Ricette boss-tier</td></tr>
          </tbody>
        </table>
      </div>
    </div>
    <div class="wiki-section">
      <h2 class="wiki-h2">Veleni</h2>
      <p class="wiki-p">La skill <strong>Poisoning</strong> consente di estrarre ed applicare veleni alle armi:</p>
      <ul class="wiki-ul">
        <li><strong>Veleno Letale:</strong> richede Poisoning 80+, estratto da Ragni delle Paludi</li>
        <li><strong>Paralisi:</strong> Poisoning 90+, da Fenici — rallenta il bersaglio del 50%</li>
        <li><strong>Necrosi:</strong> Poisoning 100, da Varroth — danno nel tempo per 60 secondi</li>
      </ul>
    </div>`,
    prev: { id: 'skills', title: 'Sistema Skill' },
    next: { id: 'materiali', title: 'Materiali' }
  },

  'bestiario': {
    cat: 'Bestiario', title: 'Bestiario',
    desc: 'Creature dello shard, comportamenti e bottino. Filtra per difficoltà.',
    tags: [{ t: 'Enciclopedia', cls: 'gold' }],
    body: '',
    prev: { id: 'archi-balestre', title: 'Archi & Balestre' },
    next: { id: 'dungeon', title: 'Dungeon' }
  },

  'dungeon': {
    cat: 'Luoghi', title: 'Dungeon',
    desc: 'I dungeon dello shard: bauli, creature, loot e statistiche delle run.',
    tags: [],
    body: '',
    prev: { id: 'bestiario', title: 'Bestiario' }
  },

  'tool-party-advisor': {
    cat: 'Tool', title: 'Party Advisor',
    desc: 'Inserisci la composizione del tuo party e scopri quale dungeon massimizza il guadagno.',
    tags: [{ t: 'Tool', cls: 'blue' }],
    body: '',
  }

};
