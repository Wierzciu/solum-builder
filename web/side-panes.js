/**
 * Side panes that hide (D-408): each view (the Schematic and the Board) has a left side
 * (the palette; the tray) and a right column (the result panes; the board's panes), and
 * either can be hidden to give the canvas the width, the drawing kept where it is on
 * screen. A hidden side leaves a small tab on the canvas's edge that brings it back
 * pinned in its place. Remembered per view and per side (`solum.sides`, kept by the
 * server with the pane order, D-311). `[` and `]` toggle the left and the right side.
 *
 * The state is plain data (`readSides`, `withSide`), tested on its own; `sidePanes` puts
 * it on the page, given the columns and what keeps the drawing still by the app root.
 */

import { h, onBackInColumn, stackLargeViews } from "./panels.js";
import { remember, remembered } from "./storage.js";

/**
 * @typedef {"schematic" | "board"} View
 * @typedef {"left" | "right"} Side
 * @typedef {Record<View, Record<Side, boolean>>} Sides each side true when it's hidden
 */

export const SIDES_KEY = "solum.sides";
/** @type {View[]} */
export const VIEWS = ["schematic", "board"];
/** @type {Side[]} */
export const SIDES = ["left", "right"];

/** What each side is called on its edge tab. @type {Record<View, Record<Side, string>>} */
const NAMES = { schematic: { left: "the parts", right: "the results" }, board: { left: "the tray", right: "the board's panes" } };
const KEYS = { left: "[", right: "]" };

/**
 * The hidden sides as kept, anything missing or garbled read as shown.
 * @param {unknown} saved @returns {Sides}
 */
export function readSides(saved) {
  const from = /** @type {any} */ (saved && typeof saved === "object" ? saved : {});
  return /** @type {Sides} */ (Object.fromEntries(VIEWS.map((v) => [v, Object.fromEntries(SIDES.map((s) => [s, from[v]?.[s] === true]))])));
}

/**
 * The sides with one hidden (true) or shown (false); undefined turns it over.
 * @param {Sides} sides @param {View} view @param {Side} side @param {boolean} [hidden]
 * @returns {Sides}
 */
export function withSide(sides, view, side, hidden) {
  return { ...sides, [view]: { ...sides[view], [side]: hidden ?? !sides[view][side] } };
}

/**
 * The edge tab's tooltip for a hidden side: what it brings back, and its key. While a full
 * layout is reviewed, the board's right column holds the review (D-406).
 * @param {View} view @param {Side} side @param {boolean} reviewing
 */
export function tabTitle(view, side, reviewing) {
  const what = view === "board" && side === "right" && reviewing ? "the review" : NAMES[view][side];
  return `Show ${what} (${KEYS[side]})`;
}

/**
 * The side panes on the page.
 * @param {HTMLElement} host the canvas's body, where the edge tabs go
 * @param {{
 *   columns: Record<View, Record<Side, HTMLElement>>,
 *   view: () => View,
 *   keepPlace: (change: () => void) => void,
 *   changed?: () => void,
 * }} opts `keepPlace`: runs the change with the view shown's drawing kept still;
 *   `changed`: told after a side is hidden or shown (the menus' ticks)
 */
export function sidePanes(host, opts) {
  let sides = readSides(remembered(SIDES_KEY));
  let reviewing = false;
  /** @type {Record<Side, HTMLButtonElement>} */
  const tabs = /** @type {any} */ ({});
  for (const side of SIDES) {
    const tab = /** @type {HTMLButtonElement} */ (h("button", { type: "button", class: `side-tab ${side}`, "data-side": side, hidden: "" }, [side === "left" ? "›" : "‹"]));
    tab.addEventListener("click", () => set(side, false));
    tabs[side] = tab;
    host.append(tab);
  }

  function apply() {
    for (const v of VIEWS) for (const s of SIDES) opts.columns[v][s].classList.toggle("side-hidden", sides[v][s]);
    const view = opts.view();
    for (const s of SIDES) {
      tabs[s].hidden = !sides[view][s];
      tabs[s].title = tabTitle(view, s, reviewing);
      tabs[s].setAttribute("aria-label", tabs[s].title);
    }
  }

  /** @param {Side} side @param {boolean} [hidden] undefined: turned over */
  function set(side, hidden) {
    const view = opts.view();
    const next = withSide(sides, view, side, hidden);
    if (next[view][side] === sides[view][side]) return;
    opts.keepPlace(() => {
      sides = next;
      apply();
    });
    remember(SIDES_KEY, sides);
    stackLargeViews(); // the bars span the canvas, wider or narrower now
    opts.changed?.();
  }

  // a large view's Collapse puts it back in its column: shown first, so it lands in sight
  onBackInColumn((el) => {
    for (const v of VIEWS) {
      for (const s of SIDES) {
        if (!sides[v][s] || !opts.columns[v][s].contains(el)) continue;
        if (v === opts.view()) set(s, false);
        else {
          sides = withSide(sides, v, s, false);
          apply();
          remember(SIDES_KEY, sides);
        }
      }
    }
  });
  apply();

  return {
    /** Hide or show a side of the view shown. @param {Side} side */
    toggle: (side) => set(side, undefined),
    /** Whether a side of the view shown is hidden. @param {Side} side */
    hidden: (side) => sides[opts.view()][side],
    /** The view changed: its sides and tabs. */
    refresh: apply,
    /**
     * A full layout's review opened (true) or closed (false): opening shows the board's
     * hidden right column once, so its result is seen; it can be hidden again.
     * @param {boolean} open
     */
    reviewing(open) {
      reviewing = open;
      if (open && opts.view() === "board" && sides.board.right) set("right", false);
      else apply();
    },
  };
}
