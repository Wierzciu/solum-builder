"""P7b (D-408): side panes that hide, in the Schematic and the Board view. Either side
hides and comes back (its key, View's items, the tab on the canvas's edge), the drawing
staying where it was on screen; remembered after a reload, per view; an expanded pane
stays out when its column hides, and its Collapse shows the column; a review opening shows
the board's hidden right column, which can be hidden again."""

import re

import pytest
from playwright.sync_api import Page, expect

from solum.yamlio import load_yaml
from tests.ui.conftest import REPO, open_circuit, part_pos, reload_kept, to_screen
from tests.ui.test_board import expect_matches, open_with_board
from tests.ui.test_editor import menu

pytestmark = pytest.mark.ui

HIDDEN = re.compile(r"\bside-hidden\b")


def canvas_width(page: Page) -> float:
    return float(page.locator("section.canvas").bounding_box()["width"])  # type: ignore[index]


def board_x(page: Page, ref: str) -> float:
    box = page.locator(f'#board .board-part[data-ref="{ref}"]').bounding_box()
    assert box
    return float(box["x"])


def test_the_schematic_sides_hide_and_come_back(page: Page, base_url: str) -> None:
    open_circuit(page, base_url, "ts808")
    results = page.locator("aside.panels")
    where = to_screen(page, *part_pos(page, "Q1"))
    width = canvas_width(page)
    page.keyboard.press("]")
    expect(results).to_have_class(HIDDEN)
    expect(results).not_to_be_in_viewport()
    assert canvas_width(page) == pytest.approx(width + 440, abs=1)
    assert to_screen(page, *part_pos(page, "Q1")) == pytest.approx(where, abs=0.5)
    tab = page.locator(".side-tab.right")
    expect(tab).to_be_visible()
    expect(tab).to_have_attribute("title", "Show the results (])")
    expect(page.locator(".side-tab.left")).to_be_hidden()

    # the left side too, from View's menu: the drawing still in place
    menu(page, "view-menu", "menu-side-left")
    expect(page.locator("#palette")).to_have_class(HIDDEN)
    assert canvas_width(page) == pytest.approx(width + 440 + 184, abs=1)
    assert to_screen(page, *part_pos(page, "Q1")) == pytest.approx(where, abs=0.5)
    page.locator("#view-menu").click()
    expect(page.locator("#menu-side-left")).to_contain_text("Show left pane")
    page.keyboard.press("Escape")

    # remembered after a reload
    reload_kept(page)
    expect(results).to_have_class(HIDDEN)
    expect(page.locator("#palette")).to_have_class(HIDDEN)

    # the edge tabs bring them back, pinned in place
    page.locator(".side-tab.left").click()
    page.locator(".side-tab.right").click()
    expect(results).not_to_have_class(HIDDEN)
    expect(results).to_be_in_viewport()
    expect(page.locator(".side-tab.right")).to_be_hidden()
    assert canvas_width(page) == pytest.approx(width, abs=1)


def test_the_board_view_keeps_its_own_sides(page: Page, base_url: str) -> None:
    open_with_board(page, base_url, load_yaml(REPO / "tests/fixtures/stripboard/rangemaster.yaml"))
    page.locator("#board-button").click()
    expect_matches(page)  # checked, so drawn and fitted
    x = board_x(page, "R1")
    page.keyboard.press("[")
    expect(page.locator("#board-tray")).to_have_class(HIDDEN)
    assert board_x(page, "R1") == pytest.approx(x, abs=0.5)  # the board didn't move
    expect(page.locator(".side-tab.left")).to_have_attribute("title", "Show the tray ([)")
    # the Schematic view's palette is its own: still shown there
    page.locator("#board-button").click()
    expect(page.locator("#palette")).not_to_have_class(HIDDEN)
    expect(page.locator(".side-tab.left")).to_be_hidden()
    page.locator("#board-button").click()
    expect(page.locator(".side-tab.left")).to_be_visible()
    page.locator(".side-tab.left").click()
    expect(page.locator("#board-tray")).not_to_have_class(HIDDEN)
    assert board_x(page, "R1") == pytest.approx(x, abs=0.5)


def test_a_large_view_stays_out_and_its_collapse_shows_the_column(
    page: Page, base_url: str
) -> None:
    open_circuit(page, base_url, "ts808")
    frequency = page.locator("#panel-frequency")
    page.locator("#frequency-expand").click()
    expect(frequency).to_have_class(re.compile(r"\blarge-view\b"))
    box = frequency.bounding_box()
    page.keyboard.press("]")
    expect(page.locator("aside.panels")).to_have_class(HIDDEN)
    expect(frequency).to_be_visible()
    assert frequency.bounding_box() == box  # as it was: placed against the window
    page.locator("#frequency-expand").click()  # Collapse: back in its column, shown first
    expect(page.locator("aside.panels")).not_to_have_class(HIDDEN)
    expect(frequency).not_to_have_class(re.compile(r"\blarge-view\b"))
    expect(frequency).to_be_in_viewport()


def test_a_review_shows_the_hidden_right_column_once(page: Page, base_url: str) -> None:
    open_with_board(page, base_url, None)
    page.locator("#board-button").click()
    column = page.locator("#board-panels")
    page.locator("#board-settings summary").click()
    page.locator("#board-layout").click()
    dialog = page.locator("#layout-dialog")
    dialog.locator(".layout-choice[data-layout='full'] input").check()
    dialog.locator("input[name='layout-speed'][value='quick']").check()
    expect(dialog.locator(".layout-time[data-time='quick']")).not_to_contain_text("Working out")
    dialog.locator("button[data-answer='go']").click()
    page.locator(".ask-buttons button[data-answer='layout']").click()
    expect(page.locator(".compact-run")).to_be_visible()
    page.keyboard.press("]")  # hidden while it runs
    expect(column).to_have_class(HIDDEN)
    review = page.locator(".compact-review")
    expect(review).to_be_attached(timeout=90_000)
    expect(page.locator(".compact-run")).to_be_hidden(timeout=90_000)
    # the review opened: the column shown, so its result is seen
    expect(column).not_to_have_class(HIDDEN)
    expect(review).to_be_visible()
    # hidden again during the review; the tab says what it brings back
    page.keyboard.press("]")
    expect(column).to_have_class(HIDDEN)
    expect(page.locator("section.canvas")).to_have_class(re.compile(r"\breviewing\b"))
    tab = page.locator(".side-tab.right")
    expect(tab).to_have_attribute("title", "Show the review (])")
    tab.click()
    expect(column).not_to_have_class(HIDDEN)
    expect(review).to_be_visible()
