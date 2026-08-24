const OWNER = 'MarlonMedellin';
const REPO = 'GanaConMerito';
const REF = 'web_review_question';
const ITEMS_ROOT = 'content/question-bank-v4/items/';

const folderSelect = document.querySelector('#folderSelect');
const questionSelect = document.querySelector('#questionSelect');
const card = document.querySelector('#questionCard');
const counter = document.querySelector('#counter');
const status = document.querySelector('#status');
const prevBtn = document.querySelector('#prevBtn');
const nextBtn = document.querySelector('#nextBtn');
const jumpInput = document.querySelector('#jumpInput');

let folders = {};
let currentFolder = '';
let currentIndex = 0;

const esc = (value = '') => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const pretty = value => String(value ?? '—').replaceAll('_', ' ');

async function loadIndex() {
  const url = `https://api.github.com/repos/${OWNER}/${REPO}/git/trees/${encodeURIComponent(REF)}?recursive=1`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`No fue posible leer el árbol del repositorio (${response.status}).`);
  const data = await response.json();

  folders = {};
  for (const item of data.tree || []) {
    if (item.type !== 'blob' || !item.path.startsWith(ITEMS_ROOT) || !item.path.endsWith('.json')) continue;
    const relative = item.path.slice(ITEMS_ROOT.length);
    const parts = relative.split('/');
    if (parts.length < 2) continue;
    const folder = parts.slice(0, -1).join('/');
    (folders[folder] ||= []).push({ name: parts.at(-1), path: item.path });
  }

  Object.values(folders).forEach(items => items.sort((a,b) => a.name.localeCompare(b.name, undefined, {numeric:true})));
  const names = Object.keys(folders).sort();
  if (!names.length) throw new Error('No se encontraron preguntas JSON en el banco.');

  folderSelect.innerHTML = names.map(name => `<option value="${esc(name)}">${esc(name)} (${folders[name].length})</option>`).join('');
  const params = new URLSearchParams(location.search);
  currentFolder = folders[params.get('folder')] ? params.get('folder') : names[0];
  folderSelect.value = currentFolder;
  fillQuestions(params.get('id'));
  status.textContent = `${Object.values(folders).reduce((n, a) => n + a.length, 0)} preguntas`;
}

function fillQuestions(preferredId) {
  const items = folders[currentFolder];
  questionSelect.innerHTML = items.map((item, i) => `<option value="${i}">${esc(item.name.replace(/\.json$/,''))}</option>`).join('');
  const found = preferredId ? items.findIndex(x => x.name.replace(/\.json$/,'') === preferredId) : -1;
  currentIndex = found >= 0 ? found : 0;
  questionSelect.value = String(currentIndex);
  loadCurrent();
}

async function loadCurrent() {
  const items = folders[currentFolder];
  const item = items[currentIndex];
  if (!item) return;
  card.className = 'card loading';
  card.textContent = 'Cargando pregunta…';
  counter.textContent = `${currentIndex + 1} de ${items.length} · ${currentFolder}`;
  prevBtn.disabled = currentIndex === 0;
  nextBtn.disabled = currentIndex === items.length - 1;
  questionSelect.value = String(currentIndex);

  const id = item.name.replace(/\.json$/,'');
  history.replaceState(null, '', `?folder=${encodeURIComponent(currentFolder)}&id=${encodeURIComponent(id)}`);

  try {
    const raw = `https://raw.githubusercontent.com/${OWNER}/${REPO}/${REF}/${item.path}`;
    const response = await fetch(raw);
    if (!response.ok) throw new Error(`No fue posible cargar ${item.name}.`);
    renderQuestion(await response.json());
  } catch (error) {
    card.className = 'card error';
    card.textContent = error.message;
  }
}

function renderQuestion(q) {
  const options = q.options || {};
  const explanations = q.explanations || {};
  const meta = [
    ['ID', q.id], ['Scope', q.scope], ['Dominio', q.domain], ['Tema', q.topic],
    ['Competencia', q.competency], ['Tipo', q.questionType], ['Nivel cognitivo', q.cognitiveLevel],
    ['Dificultad', q.estimatedDifficulty], ['Fuente', q.source?.reference]
  ];

  card.className = 'card';
  card.innerHTML = `
    <p class="eyebrow">${esc(q.id)} · ${esc(pretty(q.domain))} · ${esc(pretty(q.topic))}</p>
    ${q.context ? `<div class="context">${esc(q.context)}</div>` : ''}
    <h1>${esc(q.stem || 'Sin enunciado')}</h1>
    <div class="options">
      ${Object.entries(options).map(([key,value]) => `<div class="option ${key === q.correctAnswer ? 'correct' : ''}"><strong>${esc(key)}.</strong>${esc(value)}</div>`).join('')}
    </div>
    <p><strong>Respuesta correcta:</strong> ${esc(q.correctAnswer || '—')}</p>
    ${q.hint ? `<details><summary>Pista</summary><p>${esc(q.hint)}</p></details>` : ''}
    ${Object.keys(explanations).length ? `<details><summary>Explicaciones</summary>${Object.entries(explanations).map(([key,value]) => `<div class="explanation"><strong>${esc(key)}.</strong> ${esc(value)}</div>`).join('')}</details>` : ''}
    ${q.learningNote ? `<details><summary>Nota de aprendizaje</summary><p>${esc(q.learningNote)}</p></details>` : ''}
    <div class="meta">${meta.filter(([,v]) => v != null).map(([k,v]) => `<div><strong>${esc(k)}:</strong><br>${esc(pretty(v))}</div>`).join('')}</div>
  `;
}

function move(delta) {
  const target = currentIndex + delta;
  if (target >= 0 && target < folders[currentFolder].length) { currentIndex = target; loadCurrent(); }
}

folderSelect.addEventListener('change', () => { currentFolder = folderSelect.value; fillQuestions(); });
questionSelect.addEventListener('change', () => { currentIndex = Number(questionSelect.value); loadCurrent(); });
prevBtn.addEventListener('click', () => move(-1));
nextBtn.addEventListener('click', () => move(1));
document.querySelector('#jumpBtn').addEventListener('click', jumpToId);
jumpInput.addEventListener('keydown', e => { if (e.key === 'Enter') jumpToId(); });
document.addEventListener('keydown', e => {
  if (['INPUT','SELECT'].includes(document.activeElement.tagName)) return;
  if (e.key === 'ArrowLeft') move(-1);
  if (e.key === 'ArrowRight') move(1);
});

function jumpToId() {
  const wanted = jumpInput.value.trim().toUpperCase();
  if (!wanted) return;
  for (const [folder, items] of Object.entries(folders)) {
    const index = items.findIndex(x => x.name.replace(/\.json$/,'').toUpperCase() === wanted);
    if (index >= 0) {
      currentFolder = folder; currentIndex = index; folderSelect.value = folder;
      fillQuestions(wanted); return;
    }
  }
  alert(`No se encontró ${wanted}.`);
}

loadIndex().catch(error => {
  status.textContent = 'Error';
  card.className = 'card error';
  card.textContent = error.message;
});
