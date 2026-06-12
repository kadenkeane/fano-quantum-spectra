/* ================================================================
   script.js — Quantum Spectra of Fano Threefolds
   ================================================================ */

const STATUS_TEXT = {
  confirmed:  'Confirmed Mutation Match',
  unconfirmed:    'Unconfirmed Mutation Match',
};

/* ── KaTeX renderer ───────────────────────────────────────────── */
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

/* ── Build a single card element from a variety data object ───── */
const BRAID_MODES = [
  { key: 'default',        label: 'Default' },
  { key: 'start_clusters', label: 'Color by starting clusters' },
  { key: 'end_clusters',   label: 'Color by ending clusters' },
  { key: 'simplified',     label: 'Simplified' },
];

const MUTATION_TEXT = {
  confirmed:  'Confirmed',
  unconfirmed:    'Unconfirmed',
};

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

function buildCard(variety) {
  const card = document.createElement('div');
  card.className = 'variety-card';
  card.dataset.id     = variety.id;
  card.dataset.status = variety.status;

  const modeButtons = BRAID_MODES.map((m, i) =>
    `<button class="mode-btn${i === 0 ? ' active' : ''}" data-mode="${m.key}">${m.label}</button>`
  ).join('');

  card.innerHTML = `
    <div class="variety-header">
      <div class="header-left">
        <span class="family-id">${variety.familyLabel}</span>
        <span class="variety-name">${renderText(variety.name)}</span>
      </div>
      <div class="header-right">
        <span class="status-badge">${STATUS_TEXT[variety.status] ?? '—'}</span>
        <span class="chevron">&#8964;</span>
      </div>
    </div>
    <div class="variety-body">
      <div class="body-section">

        <div class="info-block">
          <p class="block-label">Contractions</p>
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

        ${buildSubsection('Eigenvalue animation',
          `<div class="media-frame">
            <img src="data/${variety.id}/${variety.id}_eigenvalue_animation.gif" alt="Eigenvalue animation for ${variety.familyLabel}" loading="lazy">
          </div>`
        )}

        ${buildSubsection('Braid animation',
          `<div class="media-frame">
            <img src="data/${variety.id}/${variety.id}_braid_animation.gif" alt="Braid animation for ${variety.familyLabel}" loading="lazy">
          </div>`
        )}

        ${buildSubsection('Braid diagram',
          `<div class="braid-toolbar">${modeButtons}</div>
          <div class="media-frame">
            <img class="braid-img" src="data/${variety.id}/${variety.id}_braid_diagram_default.png" alt="Braid diagram for ${variety.familyLabel}" loading="lazy">
          </div>`
        )}

        <div class="divider"></div>

        <div class="meta-strip">
          <div class="info-block">
            <p class="block-label">Braid word</p>
            <div class="math-block">${renderMath(variety.braidWord)}</div>
          </div>
          <div class="info-block">
            <p class="block-label">Clusters</p>
            <p class="block-text">
              <span class="cluster-label">Start</span>${renderMath(variety.startClusters)}<br>
              <span class="cluster-label">End</span>${renderMath(variety.endClusters)}
            </p>
          </div>
          <div class="info-block">
            <p class="block-label">Mutation match</p>
            <p class="mutation-status">${MUTATION_TEXT[variety.status] ?? '—'}</p>
          </div>
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

  // braid mode buttons
  const toolbar = card.querySelector('.braid-toolbar');
  const braidImg = card.querySelector('.braid-img');
  toolbar.addEventListener('click', e => {
    const btn = e.target.closest('.mode-btn');
    if (!btn) return;
    toolbar.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    braidImg.src = `data/${variety.id}/${variety.id}_braid_diagram_${btn.dataset.mode}.png`;
  });

  return card;
}

/* ── Fetch data and render all cards ──────────────────────────── */
fetch('data.json')
  .then(res => res.json())
  .then(varieties => {
    varieties.sort((a, b) => a.familyLabel.localeCompare(b.familyLabel, undefined, { numeric: true }));
    const list = document.querySelector('.variety-list');
    varieties.forEach(v => list.appendChild(buildCard(v)));
  })
  .catch(err => console.error('Failed to load data.json:', err));