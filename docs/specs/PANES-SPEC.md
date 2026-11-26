# Panes and toggles: one "on" look, and side panes that hide

The user, 2026-11-25/26. Two pieces of app chrome, built together because both change how the app looks everywhere: **D-407** (one "on" look) and **D-408** (side panes that hide).

## A. One "on" look (D-407)

**Goal.** Every toggle and tab shows "on" the same way, and solid brass only ever means "do it".

**The rule** (the user, 2026-11-26): **ocean with a brass edge for "on", solid brass for "go".**
- "On" = `background: var(--info-bg)` (ocean), `border-color: var(--accent)` (brass), `color: var(--text)`: what the palette's active tile and the review's After / Before / Both already had, as `docs/DESIGN.md` says (the active tool is `--info-bg`). In the Dark and Light themes the accent is their blue.
- "Go" = solid brass (`button.primary`: Apply, Save, Keep try n, Continue, Stop and keep the best; a stale Run). Nothing else is solid brass.

**What changed** (four looks became one):
- One rule near the top of `web/app.css` for `button[aria-pressed="true"]`, `button[aria-checked="true"]` and `button.active`, hovered or not: any toggle, tab row (`role="radio"` with `aria-checked`) or active tool without a rule of its own is right by default. That covers the Notes pane's General / Parts & nets, the knobs' positions, the Scope's and the Audio pane's pick levels, Bias & headroom's charts and tones, Edit by, the Open and Blocks windows' list orders and Current only, the calculators' band counts and filters.
- `.board-toggle`: its outline rule (D-406) removed, so Cuts, Links, Suggest next, the Settings toggles, Hide parts and Flip take the one look.
- The header's **Board** (`.board-button`): gains the brass edge, and keeps the look when hovered.
- `.compact-modes`' own rule removed (it was already the look).
- The gain box's **Try** / **Trying** (`.fix-option`): it was brass-filled with brass text (the global pressed rule plus its own); its rule removed, so Trying is "on".
- Left as they are: `.chain-block` and the chain key (copper `--picked`, D-127: the stage picked, not a toggle); the Frequency pane's **Pin** (its edge the pinned curve's colour, so it names the curve, D-366); menu items' ✓.

**Tests.** `tests/ui/test_on_look.py` reads computed styles: the palette's Wire tile, a Notes tab (also hovered), an After / Before / Both button, the Board button (also hovered) and a pressed board toggle all have the `--info-bg` background and `--accent` edge; a `.primary` button's background is `--accent`.

## B. Side panes that hide (D-408)

**Goal.** Give the canvas the whole width when you want it, in the schematic and the Board view, without losing your place.

**What the person gets.**
- Each view has two side panes: the left (the palette in the schematic; Cuts / Links and the tray in the Board view) and the right column (the result panes; the board's panes).
- Each side can be **hidden** and **shown** again. Hidden, it takes no width: the canvas grows into the space and the drawing keeps its zoom and its place on screen (the view box grows at the edge that moved; nothing jumps).
- **A tab on the canvas's edge** where the hidden pane was (`›` on the left, `‹` on the right), its tooltip naming the side and its key (*Show the parts ([)*, *Show the results (])*, *Show the tray ([)*, *Show the board's panes (])*). A click brings the pane back **pinned**, in its place.
- **Keys:** `[` toggles the left side, `]` the right, in both views. They work typed with Alt too (on a Portuguese Mac `[` is Option+8), not with Ctrl. In Help → Hot keys under *Side panes (either view)*.
- **View menu:** *Hide left pane* / *Hide right pane* (*Show …* while hidden), with the keys as hints.
- **Remembered per view and per side**, kept by the server with the pane order and large views (`solum.sides`, D-311), so the Board view can keep its tray hidden while the schematic keeps its palette, and it follows the person to any browser.
- **Large views** (the user, 2026-11-25): an expanded pane stays as it is when its column is hidden, open or shrunk to its bar. Its **Collapse** puts it back in its column; if that column is hidden, the column is shown first, so it lands in sight. (A hidden column's panes can't be expanded: their Expand is on their bar in the column.)
- **The full layout's review** (D-406), at the top of the board's right column: when a review opens, a hidden right column is shown once, so its result is seen. It can be hidden again during the review (the user: "why not?"): the yellow outline still says you're reviewing, and the edge tab says *Show the review (])*. The column can be hidden while the layout runs, too.
- **Inspector and pop-ups** (the part form, History, ⓘ pop-ups): unaffected.

**How it works.**
- `web/side-panes.js`: the state as plain data (`readSides`, `withSide`, `tabTitle`), and `sidePanes(host, {columns, view, keepPlace})` putting it on the page, given callbacks by `app.js` (D-284). The keys are `editor/keys.js`' `leftPane` / `rightPane`, allowed in the Board view.
- Hidden = the column slid out past the workspace's edge by a negative margin of its own width (`--side-w`; `.workspace` clips) and `visibility: hidden`, not `display: none`: it keeps its layout and scroll, can't be focused, and a pane out as a large view (`position: fixed`) stays visible (`.side-hidden > .large-view`).
- The drawing stays still: the change runs inside the schematic's or the board's `keepPlace` (the review's Before board too), which uses `viewport.holdView` (each point kept under the same pixel). A window resize still keeps the middle (D-164).
- `panels.js` `onBackInColumn` tells the side panes before a large view goes back into its column; `compact-run.js` tells the Board view when the review opens or closes (`reviewing`).

**Tests.** JS logic (`tests/ui/test_js_logic.py`): `holdView`, the state read, turned over and shown, the tab's words, the keys. UI (`tests/ui/test_side_panes.py`): the schematic's right then left side hidden (key, View menu), the canvas wider by their widths and a part under the same pixel, kept after a reload, the edge tabs bringing them back; the Board view's tray hidden with the board still, the schematic's palette unaffected; a large view staying out and its Collapse showing the column; a review opening showing the hidden right column, hidden again and brought back by the tab with the review still open.

**Out of scope.** Resizing the panes by dragging; floating drawers; hiding the header.

**Open questions, taken as assumed** (for the user to confirm):
1. An unpinned drawer sliding **over** the canvas from its tab? **No for now**: the tab brings it back pinned; nothing covers the drawing. A later phase if wanted.
2. Keys `[` and `]`? **Yes** (both were free).
3. Hidden state remembered per view? **Yes.**
4. A View-menu item too? **Yes.**
5. (Found while building) Kept by the server, not in the browser as first proposed: the pane order and large views are, and this is the same kind of preference.
