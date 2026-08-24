const OWNER = 'MarlonMedellin';
const REPO = 'GanaConMerito';
const REF = 'web_review_question';
const ITEMS_ROOT = 'content/question-bank-v4/items/';

const folderList = document.querySelector('#folderList');
const folderCount = document.querySelector('#folderCount');
const questionList = document.querySelector('#questionList');
const questionCount = document.querySelector('#questionCount');
const searchInput = document.querySelector('#searchInput');
const card = document.querySelector('#questionCard');
const counter = document.querySelector('#counter');
const currentFolderLabel = document.querySelector('#currentFolderLabel');
const status = document.querySelector('#status');
const prevBtn = document.querySelector('#prevBtn');
const nextBtn = document.querySelector('#nextBtn');

let folders = {};
let currentFolder = '';
let currentIndex = 0;
let loadedQuestions = new Map();
let filteredIndexes = [];

const esc = (value = '') => String(value).replace(/[&<>"']/g, c => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
}[c]));

const pretty = value => String(value ?? '—').replaceAll('_', ' ');
const questionId = item => item.name.replace(/\.json$/i, '');

async function loadBank() {
  const url = `https://api.github.com/repos/${OWNER}/${REPO}/git/trees/${encodeURIComponent(REF)}?recursive=1`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`No fue posible leer el banco (${response.status}).`);

  const data = await response.json();
  folders = {};

  for (const item of data.tree || []) {
    if (!item.path.startsWith(ITEMS_ROOT)) continue;

    const relative = item.path.slice(ITEMS_ROOT.length);
    if (!relative) continue;

    if (item.type === 'tree') {
      folders[relative] ||= [];
      continue;
    }

    if (item.type !== 'blob' || !item.path.endsWith('.json')) continue;

    const parts = relative.split('/');
    if (parts.length < 2) continue;

    const folder = parts.slice(0, -1).join('/');
    (folders[folder] ||= []).push({
      name: parts.at(-1),
      path: item.path,
      sha: item.sha
    });
  }

  Object.values(folders).forEach(items =>
    items.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }))
  );

  const names = Object.keys(folders).sort((a, b) => a.localeCompare(b));
  if (!names.length) throw new Error('No se encontraron carpetas en content/question-bank-v4/items.');

  const total = Object.values(folders).reduce((sum, items) => sum + items.length, 0);
  status.textContent = `${total} preguntas · ${names.length} carpetas`;
  folderCount.textContent = `${names.length}`;

  const params = new URLSearchParams(location.search);
  currentFolder = folders[params.get('folder')] ? params.get('folder') : names[0];

  renderFolders();
  await selectFolder(currentFolder, params.get('id'));
}

function renderFolders() {
  folderList.innerHTML = Object.entries(folders)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, items]) => `
      <button class="folder-button ${name === currentFolder ? 'active' : ''}" data-folder="${esc(name)}" type="button">
        ${esc(name)} <span class="count">${items.length}</span>
      </button>
    `).join('');

  folderList.querySelectorAll('.folder-button').forEach(button => {
    button.addEventListener('click', () => selectFolder(button.dataset.folder));
  });
}

async function selectFolder(folder, preferredId = null) {
  currentFolder = folder;
  searchInput.value = '';
  renderFolders();
  currentFolderLabel.textContent = folder;

  const items = folders[folder] || [];
  questionCount.textContent = `${items.length}`;

  if (!items.length) {
    currentIndex = 0;
    filteredIndexes = [];
    questionList.innerHTML = '<div class="empty-list">Esta carpeta todavía no contiene preguntas JSON.</div>';
    counter.textContent = '0 preguntas';
    prevBtn.disabled = true;
    nextBtn.disabled = true;
    history.replaceState(null, '', `?folder=${encodeURIComponent(currentFolder)}`);
    card.className = 'question-card';
    card.innerHTML = `
      <p class="question-id">${esc(currentFolder)}</p>
      <h1 class="question-title">Carpeta sin preguntas</h1>
      <div class="context-box">Esta carpeta existe en el banco, pero actualmente no contiene archivos de preguntas JSON.</div>
    `;
    return;
  }

  const preferredIndex = preferredId
    ? items.findIndex(item => questionId(item) === preferredId)
    : -1;

  currentIndex = preferredIndex >= 0 ? preferredIndex : 0;
  filteredIndexes = items.map((_, index) => index);
  await renderQuestionList();
  await loadCurrent();
}

async function renderQuestionList() {
  const items = folders[currentFolder] || [];
  const query = searchInput.value.trim().toLowerCase();

  if (!query) {
    filteredIndexes = items.map((_, index) => index);
  } else {
    const matches = [];

    for (let index = 0; index < items.length; index += 1) {
      const item = items[index];
      const id = questionId(item).toLowerCase();

      if (id.includes(query)) {
        matches.push(index);
        continue;
      }

      const cached = loadedQuestions.get(item.path);
      if (cached) {
        const haystack = `${cached.context || ''} ${cached.stem || ''} ${cached.topic || ''} ${cached.domain || ''}`.toLowerCase();
        if (haystack.includes(query)) matches.push(index);
      }
    }

    filteredIndexes = matches;
  }

  if (!filteredIndexes.length) {
    questionList.innerHTML = '<div class="empty-list">No hay preguntas que coincidan con la búsqueda.</div>';
    questionCount.textContent = '0';
    return;
  }

  questionCount.textContent = query ? `${filteredIndexes.length}/${items.length}` : `${items.length}`;

  questionList.innerHTML = filteredIndexes.map(index => {
    const item = items[index];
    const cached = loadedQuestions.get(item.path);
    const subtitle = cached?.stem || cached?.topic || 'Pregunta del banco';

    return `
      <button class="question-row ${index === currentIndex ? 'active' : ''}" data-index="${index}" type="button">
        <strong>${esc(questionId(item))}</strong>
        <span>${esc(subtitle)}</span>
      </button>
    `;
  }).join('');

  questionList.querySelectorAll('.question-row').forEach(button => {
    button.addEventListener('click', () => {
      currentIndex = Number(button.dataset.index);
      loadCurrent();
    });
  });

  requestAnimationFrame(() => {
    questionList.querySelector('.question-row.active')?.scrollIntoView({ block: 'nearest' });
  });
}

async function getQuestion(item) {
  if (loadedQuestions.has(item.path)) return loadedQuestions.get(item.path);

  const raw = `https://raw.githubusercontent.com/${OWNER}/${REPO}/${REF}/${item.path}`;
  const response = await fetch(raw);
  if (!response.ok) throw new Error(`No fue posible cargar ${item.name}.`);

  const question = await response.json();
  loadedQuestions.set(item.path, question);
  return question;
}

async function loadCurrent() {
  const items = folders[currentFolder] || [];
  const item = items[currentIndex];
  if (!item) return;

  const id = questionId(item);
  counter.textContent = `${currentIndex + 1} de ${items.length}`;
  prevBtn.disabled = currentIndex <= 0;
  nextBtn.disabled = currentIndex >= items.length - 1;

  history.replaceState(null, '', `?folder=${encodeURIComponent(currentFolder)}&id=${encodeURIComponent(id)}`);

  card.className = 'question-card loading';
  card.textContent = `Cargando ${id}…`;

  try {
    const question = await getQuestion(item);
    renderQuestion(question);
    await renderQuestionList();
  } catch (error) {
    card.className = 'question-card error';
    card.textContent = error.message;
  }
}

function renderQuestion(q) {
  const options = q.options || {};
  const explanations = q.explanations || {};
  const metadata = [
    ['ID', q.id],
    ['Ámbito', q.scope],
    ['Dominio', q.domain],
    ['Tema', q.topic],
    ['Competencia', q.competency],
    ['Tipo de pregunta', q.questionType],
    ['Nivel cognitivo', q.cognitiveLevel],
    ['Dificultad estimada', q.estimatedDifficulty],
    ['Fuente', q.source?.reference]
  ].filter(([, value]) => value != null && value !== '');

  card.className = 'question-card';
  card.innerHTML = `
    <p class="question-id">${esc(q.id || 'Sin ID')}</p>

    ${q.context ? `
      <p class="context-label">Contexto</p>
      <div class="context-box">${esc(q.context)}</div>
    ` : ''}

    <h1 class="question-title">${esc(q.stem || 'Sin enunciado')}</h1>

    <h2 class="options-title">Opciones de respuesta</h2>
    <div class="options">
      ${Object.entries(options).map(([key, value]) => `
        <div class="option">
          <span class="option-key">${esc(key)}</span>
          <span>${esc(value)}</span>
        </div>
      `).join('')}
    </div>

    <section class="answer-panel">
      <button id="revealAnswer" class="reveal-button" type="button">Ver respuesta y explicación</button>
      <div id="answerContent" class="answer-content" hidden>
        <div class="correct-answer">Respuesta correcta: ${esc(q.correctAnswer || '—')}</div>

        ${Object.keys(explanations).length ? `
          <div class="explanations">
            ${Object.entries(explanations).map(([key, value]) => `
              <div class="explanation"><strong>${esc(key)}.</strong>${esc(value)}</div>
            `).join('')}
          </div>
        ` : ''}

        ${q.hint ? `<div class="learning-note"><strong>Pista:</strong> ${esc(q.hint)}</div>` : ''}
        ${q.learningNote ? `<div class="learning-note"><strong>Nota de aprendizaje:</strong> ${esc(q.learningNote)}</div>` : ''}
      </div>
    </section>

    <section class="meta-block">
      <h3>Información de la pregunta</h3>
      <div class="meta-grid">
        ${metadata.map(([label, value]) => `
          <div class="meta-item">
            <strong>${esc(label)}</strong>
            ${esc(pretty(value))}
          </div>
        `).join('')}
      </div>
    </section>
  `;

  const revealButton = document.querySelector('#revealAnswer');
  const answerContent = document.querySelector('#answerContent');

  revealButton.addEventListener('click', () => {
    const isHidden = answerContent.hidden;
    answerContent.hidden = !isHidden;
    revealButton.textContent = isHidden ? 'Ocultar respuesta y explicación' : 'Ver respuesta y explicación';
  });
}

function move(delta) {
  const items = folders[currentFolder] || [];
  const target = currentIndex + delta;
  if (target < 0 || target >= items.length) return;
  currentIndex = target;
  loadCurrent();
}

prevBtn.addEventListener('click', () => move(-1));
nextBtn.addEventListener('click', () => move(1));

searchInput.addEventListener('input', () => renderQuestionList());

searchInput.addEventListener('keydown', event => {
  if (event.key !== 'Enter' || filteredIndexes.length !== 1) return;
  currentIndex = filteredIndexes[0];
  loadCurrent();
});

document.addEventListener('keydown', event => {
  if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;
  if (event.key === 'ArrowLeft') move(-1);
  if (event.key === 'ArrowRight') move(1);
});

loadBank().catch(error => {
  status.textContent = 'Error al cargar';
  card.className = 'question-card error';
  card.textContent = error.message;
});
