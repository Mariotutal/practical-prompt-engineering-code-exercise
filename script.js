(function () {
  const STORAGE_KEY = "promptLibrary";

  const form = document.getElementById("prompt-form");
  const titleInput = document.getElementById("prompt-title");
  const contentInput = document.getElementById("prompt-content");
  const listEl = document.getElementById("prompts-list");
  const emptyEl = document.getElementById("prompts-empty");

  function loadPrompts() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const data = JSON.parse(raw);
      return Array.isArray(data) ? data : [];
    } catch (e) {
      console.warn("Failed to parse stored prompts", e);
      return [];
    }
  }

  function savePrompts(prompts) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prompts));
    } catch (e) {
      console.error("Failed to save prompts", e);
    }
  }

  function createId() {
    return "p_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);
  }

  function trim(str) {
    return (str || "").trim();
  }

  /** Returns first few words of content for preview */
  function preview(text, wordCount) {
    wordCount = wordCount || 8;
    const words = trim(text).split(/\s+/).filter(Boolean).slice(0, wordCount);
    const joined = words.join(" ");
    const rest = trim(text).split(/\s+/).filter(Boolean).length > wordCount;
    return joined + (rest ? " …" : "");
  }

  function render(prompts) {
    listEl.innerHTML = "";

    if (!prompts.length) {
      emptyEl.hidden = false;
      return;
    }

    emptyEl.hidden = true;

    prompts.forEach(function (p) {
      const card = document.createElement("article");
      card.className = "card";
      card.dataset.id = p.id;

      const main = document.createElement("div");
      main.className = "card-main";

      const titleEl = document.createElement("h3");
      titleEl.className = "card-title";
      titleEl.textContent = p.title || "Untitled";

      const previewEl = document.createElement("p");
      previewEl.className = "card-preview";
      previewEl.textContent = preview(p.content || "");

      main.appendChild(titleEl);
      main.appendChild(previewEl);

      const actions = document.createElement("div");
      actions.className = "card-actions";

      const deleteBtn = document.createElement("button");
      deleteBtn.type = "button";
      deleteBtn.className = "delete-btn";
      deleteBtn.setAttribute("aria-label", "Delete prompt");
      deleteBtn.textContent = "Delete";
      deleteBtn.addEventListener("click", function () {
        deletePrompt(p.id);
      });

      actions.appendChild(deleteBtn);

      card.appendChild(main);
      card.appendChild(actions);
      listEl.appendChild(card);
    });
  }

  function deletePrompt(id) {
    const prompts = loadPrompts().filter(function (p) {
      return p.id !== id;
    });
    savePrompts(prompts);
    render(prompts);
  }

  function handleSubmit(e) {
    e.preventDefault();

    const title = trim(titleInput.value);
    const content = trim(contentInput.value);

    if (!title) {
      titleInput.focus();
      return;
    }
    if (!content) {
      contentInput.focus();
      return;
    }

    const prompts = loadPrompts();
    prompts.unshift({
      id: createId(),
      title: title,
      content: content,
    });
    savePrompts(prompts);
    render(prompts);

    form.reset();
    titleInput.focus();
  }

  function init() {
    form.addEventListener("submit", handleSubmit);
    render(loadPrompts());
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
