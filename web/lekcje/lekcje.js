/**
 * Interaktywne lekcje: spis, treść, zadania i quizy.
 *
 * Treść lekcji przychodzi z `/api/lessons/<id>` już jako HTML (Markdown renderuje serwer),
 * więc ten moduł tylko składa bloki i prowadzi postęp w localStorage. Symulator otwiera
 * się pod `/#lesson/<id>` — jako obwód tylko do odczytu, z możliwością „Zapisz jako…”.
 */

const API = "../api/lessons";
const STORE_KEY = "solum-pl-lekcje-v1";

/** @typedef {{done: Record<string, boolean>, tasks: Record<string, boolean>, quiz: Record<string, boolean>}} Progress */

/** @returns {Progress} */
function loadProgress() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORE_KEY) || "{}");
    return {
      done: raw.done && typeof raw.done === "object" ? raw.done : {},
      tasks: raw.tasks && typeof raw.tasks === "object" ? raw.tasks : {},
      quiz: raw.quiz && typeof raw.quiz === "object" ? raw.quiz : {},
    };
  } catch {
    return { done: {}, tasks: {}, quiz: {} };
  }
}

/** @param {Progress} progress */
function saveProgress(progress) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(progress));
  } catch {
    /* tryb prywatny albo pełny magazyn: postęp zostaje tylko w tej karcie */
  }
}

const state = {
  /** @type {any} */ index: null,
  /** @type {any} */ lesson: null,
  /** @type {Progress} */ progress: loadProgress(),
};

const $ = (/** @type {string} */ id) => /** @type {HTMLElement} */ (document.getElementById(id));

/** @param {string} text @param {string} [tag] @param {Record<string,string>} [attrs] */
function el(text, tag = "div", attrs = {}) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, value);
  if (text) node.textContent = text;
  return node;
}

/** @param {any} lesson */
function lessonHref(lesson) {
  return `#/${lesson.id}`;
}

/** @returns {any[]} */
function allLessons() {
  return state.index.lectures.flatMap((/** @type {any} */ lecture) => lecture.lessons);
}

/** @param {string} id */
function findLesson(id) {
  return allLessons().find((lesson) => lesson.id === id) ?? null;
}

/** @param {string} id */
function lessonDone(id) {
  return Boolean(state.progress.done[id]);
}

function renderProgress() {
  const total = allLessons().length;
  const done = allLessons().filter((lesson) => lessonDone(lesson.id)).length;
  const percent = total ? Math.round((done / total) * 100) : 0;
  $("progress-count").textContent = `${done} / ${total}`;
  $("progress-fill").style.width = `${percent}%`;
  const bar = $("progress-bar");
  bar.setAttribute("aria-valuenow", String(percent));
  const note = $("progress-note");
  if (done === total && total > 0) {
    note.textContent = "Wszystkie lekcje ukończone. Gratulacje!";
    note.classList.add("done");
  } else if (done === 0) {
    note.textContent = "Zacznij od pierwszej lekcji.";
    note.classList.remove("done");
  } else {
    note.textContent = `Ukończono ${done} z ${total} lekcji.`;
    note.classList.remove("done");
  }
}

/** Spis lekcji w panelu bocznym. @param {string | null} current */
function renderToc(current) {
  const toc = $("toc");
  toc.replaceChildren();
  for (const lecture of state.index.lectures) {
    const group = el("", "section", { class: "toc-group" });
    group.append(el(lecture.title, "h2"));
    for (const lesson of lecture.lessons) {
      const link = /** @type {HTMLAnchorElement} */ (el("", "a", { href: lessonHref(lesson) }));
      const tick = el(lessonDone(lesson.id) ? "✓" : "·", "span", { class: "tick", "aria-hidden": "true" });
      const label = el(lesson.title, "span", { class: "label" });
      link.append(tick, label);
      if (lessonDone(lesson.id)) link.classList.add("done");
      if (lesson.id === current) link.setAttribute("aria-current", "page");
      group.append(link);
    }
    toc.append(group);
  }
}

/** @param {string} html */
function prose(html) {
  const node = el("", "section", { class: "prose" });
  node.innerHTML = html;
  return node;
}

/** @param {any} block @param {any} lesson @param {number} quizNumber */
function renderBlock(block, lesson, quizNumber) {
  if (block.type === "text") return prose(block.html);

  if (block.type === "formula") {
    const node = el("", "div", { class: "formula" });
    node.innerHTML = block.html;
    return node;
  }

  if (block.type === "note") {
    const node = el("", "aside", { class: `note ${block.tone || "info"}` });
    if (block.title) node.append(el(block.title, "h3"));
    node.append(prose(block.html));
    return node;
  }

  if (block.type === "table") {
    const wrap = el("", "div", { class: "table-wrap" });
    const table = el("", "table");
    const head = el("", "thead");
    const headRow = el("", "tr");
    for (const cell of block.head) {
      const th = el("", "th");
      th.innerHTML = cell;
      headRow.append(th);
    }
    head.append(headRow);
    const body = el("", "tbody");
    for (const row of block.rows) {
      const tr = el("", "tr");
      for (const cell of row) {
        const td = el("", "td");
        td.innerHTML = cell;
        tr.append(td);
      }
      body.append(tr);
    }
    table.append(head, body);
    wrap.append(table);
    return wrap;
  }

  if (block.type === "circuit") {
    const card = el("", "section", { class: "circuit-card" });
    const head = el("", "div", { class: "circuit-head" });
    head.append(el("Obwód", "span", { class: "kind" }));
    head.append(el(block.title || lesson.circuit_title, "h3"));
    const open = el("", "a", {
      class: "open-sim",
      href: `../#lesson/${lesson.id}`,
      target: "_blank",
      rel: "noopener",
      title: "Otwórz ten obwód w Solum Builder (nowa karta)",
    });
    open.textContent = "Otwórz w symulatorze ↗";
    head.append(open);
    card.append(head);

    const body = el("", "div", { class: "circuit-body" });
    body.append(prose(block.html));

    const tasks = el("", "ul", { class: "tasks" });
    (block.tasks || []).forEach((task, index) => {
      const key = `${lesson.id}:task:${index}`;
      const item = el("", "li");
      const label = el("", "label");
      const input = /** @type {HTMLInputElement} */ (el("", "input", { type: "checkbox" }));
      input.checked = Boolean(state.progress.tasks[key]);
      const box = el("✓", "span", { class: "box", "aria-hidden": "true" });
      const text = el("", "span", { class: "text" });
      text.innerHTML = task;
      input.addEventListener("change", () => {
        state.progress.tasks[key] = input.checked;
        saveProgress(state.progress);
        text.classList.toggle("done", input.checked);
      });
      text.classList.toggle("done", input.checked);
      label.append(input, box, text);
      item.append(label);
      tasks.append(item);
    });
    if (tasks.childElementCount) body.append(tasks);
    body.append(
      el(
        "Obwód otwiera się jako przykład tylko do odczytu. Aby go zmieniać, wybierz w symulatorze Plik → Zapisz jako…",
        "p",
        { class: "circuit-note" },
      ),
    );
    card.append(body);
    return card;
  }

  if (block.type === "quiz") {
    const key = `${lesson.id}:quiz:${quizNumber}`;
    const answered = Boolean(state.progress.quiz[key]);
    const quiz = el("", "section", { class: "quiz" });
    const top = el("", "div", { class: "quiz-top" });
    top.append(el(String(quizNumber + 1), "span", { class: "num" }), el("Sprawdź się", "span"));
    quiz.append(top);
    const question = el("", "div", { class: "quiz-question" });
    question.innerHTML = block.question;
    quiz.append(question);

    const options = el("", "div", { class: "options" });
    /** @type {HTMLButtonElement[]} */
    const buttons = [];
    const explain = el("", "div", { class: "explain", "aria-live": "polite", hidden: "hidden" });

    block.options.forEach((option, index) => {
      const button = /** @type {HTMLButtonElement} */ (el("", "button", { type: "button", class: "option" }));
      const letter = el(String.fromCharCode(65 + index), "span", { class: "letter", "aria-hidden": "true" });
      const body = el("", "span");
      body.innerHTML = option;
      button.append(letter, body);
      button.addEventListener("click", () => choose(index));
      buttons.push(button);
      options.append(button);
    });
    quiz.append(options, explain);

    function show(answer, chosen) {
      buttons.forEach((button, index) => {
        button.disabled = true;
        if (index === block.answer) button.classList.add("correct");
        if (chosen !== null && index === chosen) button.classList.add("chosen");
        if (chosen !== null && index === chosen && index !== block.answer) button.classList.add("wrong");
      });
      explain.hidden = false;
      explain.classList.toggle("good", chosen === block.answer);
      explain.classList.toggle("bad", chosen !== block.answer);
      explain.innerHTML =
        (chosen === block.answer ? "<strong>Dobrze.</strong> " : "<strong>Nie tym razem.</strong> ") +
        block.explain;
    }

    function choose(index) {
      if (buttons[0]?.disabled) return;
      const correct = index === block.answer;
      state.progress.quiz[key] = correct;
      saveProgress(state.progress);
      show(block.answer, index);
      updateCompletionHint();
    }

    if (answered) show(block.answer, null);
    return quiz;
  }

  return el(`Nieznany blok lekcji: ${block.type}`, "p", { class: "error-box" });
}

/** Po każdym quizie: jeśli wszystkie są poprawne, podpowiedz zamknięcie lekcji. */
function updateCompletionHint() {
  const finish = document.querySelector(".lesson-nav .finish");
  if (!finish || !state.lesson) return;
  const quizzes = state.lesson.blocks.filter((/** @type {any} */ block) => block.type === "quiz").length;
  const correct = Object.keys(state.progress.quiz).filter((key) => key.startsWith(`${state.lesson.id}:quiz:`) && state.progress.quiz[key]).length;
  if (quizzes > 0 && correct >= quizzes && !lessonDone(state.lesson.id)) {
    finish.textContent = "Wszystkie quizy zaliczone — oznacz lekcję jako ukończoną";
  }
}

/** @param {string} id */
async function loadLesson(id) {
  const loading = $("loading");
  loading?.removeAttribute("hidden");
  const main = $("lesson");
  main.replaceChildren(el("Wczytuję lekcję…", "div", { class: "loading" }));
  const spinner = el("", "span", { class: "spinner", "aria-hidden": "true" });
  main.firstElementChild?.prepend(spinner);

  try {
    const reply = await fetch(`${API}/${encodeURIComponent(id)}`);
    if (!reply.ok) {
      const body = await reply.json().catch(() => null);
      throw new Error(body?.message || `Serwer odpowiedział ${reply.status}.`);
    }
    const lesson = await reply.json();
    state.lesson = lesson;
    renderLesson(lesson);
    renderToc(lesson.id);
    document.title = `${lesson.title} — Lekcje podstaw elektroniki`;
  } catch (error) {
    state.lesson = null;
    const box = el("", "div", { class: "error-box" });
    box.append(el("Nie udało się wczytać lekcji", "h2"));
    box.append(el(error instanceof Error ? error.message : String(error), "p"));
    const back = el("Wróć do pierwszej lekcji", "a", { href: lessonHref(allLessons()[0]) });
    box.append(back);
    main.replaceChildren(box);
    renderToc(null);
  }
}

/** @param {any} lesson */
function renderLesson(lesson) {
  const main = $("lesson");
  main.replaceChildren();

  const eyebrow = el("", "div", { class: "eyebrow" });
  eyebrow.append(el(lesson.lecture_title || lesson.lecture, "span"));
  if (lesson.slides) {
    eyebrow.append(el("", "span", { class: "sep", "aria-hidden": "true" }));
    eyebrow.append(el(lesson.slides, "span", { class: "where" }));
  }
  main.append(eyebrow);

  main.append(el(lesson.title, "h1"));
  main.append(el(lesson.summary, "p", { class: "lede" }));

  const meta = el("", "div", { class: "meta" });
  meta.append(el(`⏱ ${lesson.minutes} min`, "span", { class: "chip" }));
  meta.append(el(lesson.lecture, "span", { class: "chip accent" }));
  const quizzes = lesson.blocks.filter((/** @type {any} */ block) => block.type === "quiz").length;
  if (quizzes) meta.append(el(`${quizzes} ${quizzes === 1 ? "quiz" : "quizy"}`, "span", { class: "chip" }));
  if (lesson.circuit_title) meta.append(el(lesson.circuit_title, "span", { class: "chip" }));
  main.append(meta);

  if (lesson.objectives?.length) {
    const objectives = el("", "section", { class: "objectives" });
    objectives.append(el("Po tej lekcji będziesz umieć", "h2"));
    const list = el("", "ul");
    for (const objective of lesson.objectives) list.append(el(objective, "li"));
    objectives.append(list);
    main.append(objectives);
  }

  const blocks = el("", "div", { class: "blocks" });
  let quizNumber = 0;
  for (const block of lesson.blocks) {
    blocks.append(renderBlock(block, lesson, block.type === "quiz" ? quizNumber++ : quizNumber));
  }
  main.append(blocks);

  const nav = el("", "nav", { class: "lesson-nav", "aria-label": "Nawigacja między lekcjami" });
  const flat = allLessons();
  const index = flat.findIndex((entry) => entry.id === lesson.id);
  const previous = index > 0 ? flat[index - 1] : null;
  const next = index >= 0 && index < flat.length - 1 ? flat[index + 1] : null;
  if (previous) nav.append(el(`← ${previous.title}`, "a", { href: lessonHref(previous) }));
  const finish = el(lessonDone(lesson.id) ? "✓ Lekcja ukończona" : "Oznacz jako ukończoną", "button", {
    type: "button",
    class: `finish${lessonDone(lesson.id) ? " done" : ""}`,
  });
  finish.addEventListener("click", () => {
    const now = !lessonDone(lesson.id);
    if (now) state.progress.done[lesson.id] = true;
    else delete state.progress.done[lesson.id];
    saveProgress(state.progress);
    finish.textContent = now ? "✓ Lekcja ukończona" : "Oznacz jako ukończoną";
    finish.classList.toggle("done", now);
    renderProgress();
    renderToc(lesson.id);
  });
  nav.append(finish);
  if (next) nav.append(el(`${next.title} →`, "a", { href: lessonHref(next), class: "next" }));
  main.append(nav);
  updateCompletionHint();
  window.scrollTo({ top: 0, behavior: "instant" });
}

function currentId() {
  const hash = decodeURIComponent(location.hash.replace(/^#\/?/, ""));
  return hash || null;
}

async function route() {
  const id = currentId();
  if (!state.index) return;
  const lesson = id ? findLesson(id) : null;
  if (!id || !lesson) {
    const first = allLessons()[0];
    history.replaceState(null, "", lessonHref(first));
    return loadLesson(first.id);
  }
  return loadLesson(lesson.id);
}

async function start() {
  try {
    const reply = await fetch(API);
    if (!reply.ok) throw new Error(`Serwer odpowiedział ${reply.status}.`);
    state.index = await reply.json();
    if (!state.index.lectures?.length) throw new Error("Brak lekcji w katalogu library/lessons.");
    renderProgress();
    renderToc(currentId());
    await route();
  } catch (error) {
    const main = $("lesson");
    const box = el("", "div", { class: "error-box" });
    box.append(el("Lekcje są chwilowo niedostępne", "h2"));
    box.append(el(error instanceof Error ? error.message : String(error), "p"));
    box.append(el("Sprawdź, czy serwer Solum Builder działa, i odśwież stronę.", "p"));
    main.replaceChildren(box);
  }
}

window.addEventListener("hashchange", () => {
  route().catch((error) => console.error(error));
});
window.addEventListener("storage", (event) => {
  if (event.key !== STORE_KEY) return;
  state.progress = loadProgress();
  renderProgress();
  renderToc(state.lesson?.id ?? currentId());
  if (state.lesson) {
    const scroll = window.scrollY;
    renderLesson(state.lesson);
    window.scrollTo({ top: scroll, behavior: "instant" });
  }
});

start();
