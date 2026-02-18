(function () {
  const STORAGE_KEY = 'promptLibrary.prompts';

  const form = document.getElementById('prompt-form');
  const titleInput = document.getElementById('prompt-title');
  const contentInput = document.getElementById('prompt-content');
  const errorEl = document.getElementById('form-error');
  const listEl = document.getElementById('prompts-list');
  const emptyEl = document.getElementById('prompts-empty');
  const countEl = document.getElementById('prompt-count');
  const cardTemplate = document.getElementById('prompt-card-template');

  function loadPrompts() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const data = JSON.parse(raw);
      if (!Array.isArray(data)) return [];
      return data
        .filter(function (p) { return p && typeof p.id === 'string' && p.title != null && p.content != null; })
        .sort(function (a, b) { return (b.createdAt || 0) - (a.createdAt || 0); });
    } catch (e) {
      console.warn('Failed to parse stored prompts', e);
      return [];
    }
  }

  function savePrompts(prompts) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prompts));
    } catch (e) {
      console.error('Failed to save prompts', e);
    }
  }

  function createId() {
    return 'p_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  function trim(str) {
    return (str || '').trim();
  }

  function preview(text) {
    var t = trim(text);
    if (!t) return '';
    var words = t.split(/\s+/).slice(0, 15);
    var joined = words.join(' ');
    return joined + (t.split(/\s+/).length > words.length ? ' …' : '');
  }

  function render(prompts) {
    listEl.innerHTML = '';

    if (!prompts.length) {
      emptyEl.hidden = false;
      countEl.textContent = '0';
      return;
    }
    emptyEl.hidden = true;
    countEl.textContent = String(prompts.length);

    var frag = document.createDocumentFragment();
    prompts.forEach(function (p) {
      var node = cardTemplate.content.firstElementChild.cloneNode(true);
      node.dataset.id = p.id;
      node.querySelector('.card-title').textContent = p.title;
      node.querySelector('.card-preview').textContent = preview(p.content);
      var delBtn = node.querySelector('.delete-btn');
      delBtn.addEventListener('click', function () { deletePrompt(p.id); });
      frag.appendChild(node);
    });
    listEl.appendChild(frag);
  }

  function deletePrompt(id) {
    var prompts = loadPrompts().filter(function (p) { return p.id !== id; });
    savePrompts(prompts);
    render(prompts);
  }

  function handleSubmit(e) {
    e.preventDefault();
    errorEl.textContent = '';

    var title = trim(titleInput.value);
    var content = trim(contentInput.value);

    if (!title) {
      errorEl.textContent = 'Title is required.';
      titleInput.focus();
      return;
    }
    if (!content) {
      errorEl.textContent = 'Content is required.';
      contentInput.focus();
      return;
    }

    var prompts = loadPrompts();
    prompts.unshift({
      id: createId(),
      title: title,
      content: content,
      createdAt: Date.now()
    });
    savePrompts(prompts);
    render(prompts);

    form.reset();
    titleInput.focus();
  }

  function init() {
    form.addEventListener('submit', handleSubmit);
    render(loadPrompts());
  }

  document.addEventListener('DOMContentLoaded', init);
})();
