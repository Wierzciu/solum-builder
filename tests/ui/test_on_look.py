"""P7a (D-407): one "on" look. Every toggle and tab that's on has the same background and
edge (ocean with a brass edge); solid brass is only a button that does something."""

import pytest
from playwright.sync_api import Page, expect

from tests.ui.conftest import open_circuit
from tests.ui.test_board import open_with_board

pytestmark = pytest.mark.ui

STYLE = """(sel) => {
  const s = getComputedStyle(document.querySelector(sel));
  return [s.backgroundColor, s.borderTopColor];
}"""


def look(page: Page, selector: str) -> tuple[str, str]:
    background, border = page.evaluate(STYLE, selector)
    return background, border


def token(page: Page, name: str) -> str:
    """A colour token as the browser computes it (a background set to it)."""
    return str(
        page.evaluate(
            """(name) => {
              const d = document.createElement('div');
              d.style.background = `var(${name})`;
              document.body.append(d);
              const c = getComputedStyle(d).backgroundColor;
              d.remove();
              return c;
            }""",
            name,
        )
    )


def test_every_on_toggle_and_tab_looks_the_same(page: Page, base_url: str) -> None:
    open_circuit(page, base_url, "ts808")
    on = (token(page, "--info-bg"), token(page, "--accent"))
    brass = token(page, "--accent")

    page.locator('[data-tool="wire"]').click()  # the palette's Wire tile
    assert look(page, '[data-tool="wire"][aria-pressed="true"]') == on
    page.keyboard.press("Escape")
    # a Notes tab (a radio row, D-407: no longer solid brass)
    assert look(page, '#notes-body [data-tab][aria-checked="true"]') == on
    # a pressed button hovered stays on
    page.locator('#notes-body [data-tab][aria-checked="true"]').hover()
    assert look(page, '#notes-body [data-tab][aria-checked="true"]') == on
    # the review's After / Before / Both, as its markup has it
    page.evaluate(
        """() => {
          const row = document.createElement('div');
          row.className = 'compact-modes';
          row.innerHTML = '<button id="probe-mode" aria-pressed="true">After</button>';
          document.body.append(row);
        }"""
    )
    assert look(page, "#probe-mode") == on
    # a "go" button (Apply, Save: as the dialogs make them) is solid brass, not the on look
    page.evaluate(
        """() => {
          const b = document.createElement('button');
          b.className = 'primary';
          b.id = 'probe-go';
          document.body.append(b);
        }"""
    )
    background, _ = look(page, "#probe-go")
    assert background == brass
    assert background != on[0]


def test_the_board_view_toggles_and_its_button_look_the_same(page: Page, base_url: str) -> None:
    open_with_board(page, base_url, None)
    page.locator("#board-button").click()  # starts the board
    expect(page.locator("#board-edit")).to_be_visible()
    on = (token(page, "--info-bg"), token(page, "--accent"))
    assert look(page, '#board-button[aria-pressed="true"]') == on
    page.locator("#board-edit [data-tool='cuts']").click()
    assert look(page, "#board-edit [data-tool='cuts'][aria-pressed='true']") == on
    page.locator("#board-button").hover()
    assert look(page, '#board-button[aria-pressed="true"]') == on
