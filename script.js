
// Status text mappings
const SUPERPOTENTIAL_TEXT = {
  confirmed:   'Confirmed Superpotential',
  confirmed_star:   'Confirmed Superpotential',
  unconfirmed: 'Unconfirmed Superpotential',
};

const MUTATION_TEXT = {
  confirmed:   'Confirmed Mutation Match',
  confirmed_star:   'Confirmed Mutation Match',
  unconfirmed: 'Unconfirmed Mutation Match',
};

// Determine header badge text based on both status fields
function getHeaderBadgeText(variety) {
  if (variety.superpotential_status === 'unconfirmed') {
    return 'Unconfirmed Superpotential';
  }
  return variety.mutation_status === 'confirmed' || variety.mutation_status === 'confirmed_star' 
  ? 'Confirmed Mutation Match' 
  : 'Unconfirmed Mutation Match';
}

// KaTeX renderer
function renderMath(tex) {
  try {
    return katex.renderToString(tex, { throwOnError: false, displayMode: false });
  } catch (e) {
    return `<span style="color:red;">${tex}</span>`;
  }
}

function renderText(str) {
  return str.replace(/\$([^$]+)\$/g, (_, tex) =>
    katex.renderToString(tex, { throwOnError: false, displayMode: false })
  );
}

const titleEl = document.getElementById('site-title');
titleEl.innerHTML = renderText(titleEl.textContent);

const ANIMATION_PERTURBATION_TOGGLE = {
  key: 'perturbation',
  states: [
    { value: 'positive', label: 'Positive Perturbation' },
    { value: 'negative', label: 'Negative Perturbation' },
    // { value: 'zero',     label: 'No Perturbation' },
  ]
};

const ANIMATION_TOGGLES = [
  ANIMATION_PERTURBATION_TOGGLE,
];

const BRAID_TOGGLES = [
  {
    key: 'simplification',
    states: [
      { value: 'none',     label: 'No Simplification' },
      { value: 'initial',  label: 'Initial Cluster Simplification' },
      { value: 'terminal', label: 'Ending Cluster Simplification' },
      { value: 'total',    label: 'Total Simplification' },
    ]
  },
  {
    key: 'color',
    states: [
      { value: 'default',           label: 'Default Colors' },
      { value: 'initial_clusters',  label: 'Color by Initial Clusters' },
      { value: 'terminal_clusters', label: 'Color by Ending Clusters' },
    ]
  },
  {
    key: 'perturbation',
    states: [
      { value: 'positive', label: 'Positive Perturbation' },
      { value: 'negative', label: 'Negative Perturbation' }
    ]
  },
  {
    key: 'order',
    states: [
      { value: 'default',  label: 'Default Order' },
      { value: 'reversed', label: 'Reversed Order' },
    ]
  },
  {
    key: 'crossings',
    states: [
      { value: 'default', label: 'Default Over/Under' },
      { value: 'swapped', label: 'Swapped Over/Under' },
    ]
  },
];

function buildBraidState() {
  const state = {};
  BRAID_TOGGLES.forEach(t => state[t.key] = 0); // index into states array
  return state;
}

function braidImagePath(varietyId, state) {
  const color          = BRAID_TOGGLES[1].states[state.color].value;
  const perturbation   = BRAID_TOGGLES[2].states[state.perturbation].value;
  const order          = BRAID_TOGGLES[3].states[state.order].value;
  const crossings      = BRAID_TOGGLES[4].states[state.crossings].value;
  const simplification = BRAID_TOGGLES[0].states[state.simplification].value;
  return `data/${varietyId}/${varietyId}_${color}_coloring_${crossings}_crossings_${perturbation}_perturbation_${order}_order_${simplification}_simplification.png`;
}


function animationImagePath(varietyId, animationType, state) {
  const color        = BRAID_TOGGLES.find(t => t.key === 'color').states[state.color].value;
  const perturbation = ANIMATION_PERTURBATION_TOGGLE.states[state.perturbation].value;
  return `data/${varietyId}/${varietyId}_${animationType}_${color}_coloring_${perturbation}_perturbation.gif`;
}

function buildAnimationToolbar(card, varietyId, animationType) {
  const toolbar = card.querySelector(`#anim-toolbar-${animationType}-${varietyId}`);
  const img     = card.querySelector(`#anim-img-${animationType}-${varietyId}`);
  const state   = { color: 0, perturbation: 0 };

  ANIMATION_TOGGLES.forEach(toggle => {
    const btn = document.createElement('button');
    btn.className = 'mode-btn';
    btn.textContent = toggle.states[0].label;
    btn.addEventListener('click', () => {
      state[toggle.key] = (state[toggle.key] + 1) % toggle.states.length;
      btn.textContent = toggle.states[state[toggle.key]].label;
      btn.classList.toggle('active', state[toggle.key] !== 0);
      img.src = animationImagePath(varietyId, animationType, state);
    });
    toolbar.appendChild(btn);
  });
}
const RPATH_TOGGLES = [
  {
    key: 'chart',
    states: [
      { value: 'q1',     label: renderText("$q_1^m$ / $q_2^n$") },
      { value: 'q2',  label: renderText("$q_2^n$ / $q_1^m$") }
    ]
  }
]

function rpathImagePath(varietyId, state) {
  const chart          = RPATH_TOGGLES[0].states[state].value;
  return `data/${varietyId}/${varietyId}_${chart}_rPath.png`;
}

function buildRpathToolbar(card, varietyId) {
  const toolbar = card.querySelector(`#rpath-toolbar-${varietyId}`);
  const img     = card.querySelector(`#rpath-img-${varietyId}`);
  let state = 0;

  RPATH_TOGGLES.forEach(toggle => {
    const btn = document.createElement('button');
    btn.className = 'mode-btn';
    btn.innerHTML = toggle.states[0].label;
    btn.addEventListener('click', () => {
      state = (state + 1) % toggle.states.length;
      btn.innerHTML = toggle.states[state].label;
      btn.classList.toggle('active', state !== 0);
      img.src = rpathImagePath(varietyId, state);
    });
    toolbar.appendChild(btn);
  });
}
const STATUS_TEXT = {
  confirmed:  'Confirmed',
  confirmed_star: 'Confirmed*',
  unconfirmed:    'Unconfirmed',
};

function fileExists(url) {
  return fetch(url, { method: 'HEAD' })
    .then(res => res.ok)
    .catch(() => false);
}

function buildSubsection(title, contentHTML) {
  return `
    <div class="subsection">
      <div class="subsection-header">
        <span>${title}</span>
        <span class="subsection-chevron">&#8964;</span>
      </div>
      <div class="subsection-body">
        ${contentHTML}
      </div>
    </div>
  `;
}

const FILTERS = [
  { label: 'All',                        test: v => true },
  { label: 'Confirmed Superpotential',   test: v => v.superpotential_status === 'confirmed' || v.superpotential_status === 'confirmed_star' },
  { label: 'Confirmed Mutation Match',   test: v => v.mutation_status === 'confirmed' || v.mutation_status === 'confirmed_star' },
];

let activeFilter = 0;
let loadedVarieties = [];

function applyFilter() {
  const test = FILTERS[activeFilter].test;
  loadedVarieties.forEach(({ variety, card }) => {
    card.style.display = test(variety) ? '' : 'none';
  });
}

function buildFilterBar() {
  const bar = document.getElementById('filter-bar');
  const select = document.createElement('select');
  select.className = 'filter-select';
  
  FILTERS.forEach((filter, i) => {
    const option = document.createElement('option');
    option.value = i;
    option.textContent = filter.label;
    select.appendChild(option);
  });

  select.addEventListener('change', () => {
    activeFilter = parseInt(select.value);
    applyFilter();
  });

  bar.appendChild(select);
}
buildFilterBar()

// Build a single card element from a variety data object
function buildCard(variety) {
  const card = document.createElement('div');
  card.className = 'variety-card';
  card.dataset.id     = variety.id;
  card.dataset.superpotentialStatus = variety.superpotential_status;
  card.dataset.mutationStatus = variety.mutation_status;


  card.innerHTML = `
    <div class="variety-header">
      <div class="header-left">
        <span class="family-id">${variety.familyLabel}</span>
        <span class="variety-name">${renderText(variety.name)}</span>
      </div>
      <div class="header-right">
        <span class="status-badge">${getHeaderBadgeText(variety)}</span>
        <span class="chevron">&#8964;</span>
      </div>
    </div>
    <div class="variety-body">
      <div class="body-section">

        <div class="info-block">
          <p class="block-label">Extremal Contractions</p>
          <p class="block-text">${renderText(variety.contractions)}</p>
        </div>

        <div class="info-block">
          <p class="block-label">Superpotential</p>
          <div class="math-block">${renderMath(variety.superpotential)}</div>
        </div>

        <div class="info-block">
          <p class="block-label">Quantum spectrum polynomial</p>
          <div class="math-block">${renderMath(variety.spectrumPolynomial)}</div>
        </div>

        <div class="divider"></div>

        ${buildSubsection('Evolution of the Eigenvalues Along the Path',
          `<div class="braid-toolbar" id="anim-toolbar-eigenvalue_animation-${variety.id}"></div>
          <div class="media-frame">
            <img id="anim-img-eigenvalue_animation-${variety.id}"
              src="data/${variety.id}/${variety.id}_eigenvalue_animation_default_coloring_positive_perturbation.gif"
              alt="Eigenvalue animation for ${variety.familyLabel}" loading="lazy">
          </div>`
        )}

        ${buildSubsection('Braid Animation',
          `<div class="braid-toolbar" id="anim-toolbar-braid_animation-${variety.id}"></div>
          <div class="media-frame">
            <img id="anim-img-braid_animation-${variety.id}"
              src="data/${variety.id}/${variety.id}_braid_animation_default_coloring_positive_perturbation.gif"
              alt="Braid animation for ${variety.familyLabel}" loading="lazy">
          </div>`
        )}

        ${buildSubsection('Braid diagram',
          `<div class="braid-toolbar" id="braid-toolbar-${variety.id}"></div>
          <div class="media-frame">
            <img class="braid-img" id="braid-img-${variety.id}" 
              src="data/${variety.id}/${variety.id}_default_coloring_default_crossings_positive_perturbation_default_order_none_simplification.png" 
              alt="Braid diagram for ${variety.familyLabel}" loading="lazy">
          </div>`
        )}
        <div class="divider"></div>

        <div class="meta-strip">
          <!--<div class="info-block">
            <p class="block-label">Braid word</p>
            <div class="math-block">${renderMath(variety.braidWord)}</div>
          </div> -->
          <div class="info-block">
            <p class="block-label">Clusters</p>
            <p class="block-text">
              <span class="cluster-label">Start</span>${renderMath(variety.startClusters)}<br>
              <span class="cluster-label">End</span>${renderMath(variety.endClusters)}
            </p>
          </div>
          <div class="info-block">
            <p class="block-label">Status</p>
            <p class="block-text">
              <span class="superpotential-status">Superpotential: ${STATUS_TEXT[variety.superpotential_status] ?? '—'}</span><br>
              <span class="mutation-status">Mutation Match: ${STATUS_TEXT[variety.mutation_status] ?? '—'}</span>
            </p>
          </div>
        </div>
        ${variety.notes != "" ? '<div class="divider"></div>' : ''}
        <div class="info-block">
          <p class="block-text">${renderText(variety.notes)}</p>
        </div>
      </div>
    </div>
  `;

  // main card toggle
  card.querySelector('.variety-header').addEventListener('click', () => {
    card.classList.toggle('open');
  });

  // subsection toggles
  card.querySelectorAll('.subsection-header').forEach(header => {
    header.addEventListener('click', () => {
      header.closest('.subsection').classList.toggle('open');
    });
  });

  // braid cycling toggles
  const state = buildBraidState();
  const toolbar = card.querySelector(`#braid-toolbar-${variety.id}`);
  const braidImg = card.querySelector(`#braid-img-${variety.id}`);
  buildAnimationToolbar(card, variety.id, 'eigenvalue_animation');
  buildAnimationToolbar(card, variety.id, 'braid_animation');
  // buildRpathToolbar(card, variety.id);

  BRAID_TOGGLES.forEach((toggle, toggleIndex) => {
    const btn = document.createElement('button');
    btn.className = 'mode-btn';
    btn.textContent = toggle.states[0].label;
    btn.addEventListener('click', () => {
      state[toggle.key] = (state[toggle.key] + 1) % toggle.states.length;
      btn.textContent = toggle.states[state[toggle.key]].label;
      btn.classList.toggle('active', state[toggle.key] !== 0);
      braidImg.src = braidImagePath(variety.id, state);
    });
    toolbar.appendChild(btn);
  });
  fileExists(`data/${variety.id}/${variety.id}_q1_rPath.png`).then(exists => {
    if (exists) {
      const rpathHTML = buildSubsection('Discriminant Points',
        `<div class="braid-toolbar" id="rpath-toolbar-${variety.id}"></div>
        <div class="media-frame">
          <img id="rpath-img-${variety.id}"
            src="data/${variety.id}/${variety.id}_q1_rPath.png"
            alt="Ratio path diagram for ${variety.familyLabel}" loading="lazy">
        </div>`
      );
      const braidSubsection = card.querySelector(`#braid-toolbar-${variety.id}`)
        .closest('.subsection');
      braidSubsection.insertAdjacentHTML('beforebegin', rpathHTML);

      // only wire up the new subsection header
      braidSubsection.previousElementSibling.querySelector('.subsection-header')
        .addEventListener('click', () => {
          braidSubsection.previousElementSibling.classList.toggle('open');
        });

      buildRpathToolbar(card, variety.id);
    }
  });
  return card;
}

// Fetch data and render all cards
fetch('data.json')
  .then(res => res.json())
  .then(varieties => {
    varieties.sort((a, b) => a.familyLabel.localeCompare(b.familyLabel, undefined, { numeric: true }));
    const list = document.querySelector('.variety-list');
    varieties.forEach(v => {
      const card = buildCard(v);
      loadedVarieties.push({ variety: v, card });
      list.appendChild(card);
    });
  })
  .catch(err => console.error('Failed to load data.json:', err));