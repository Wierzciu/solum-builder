"""Polski kurs (fork): każda lekcja ma treść, obwód i poprawny quiz.

Testy nie uruchamiają ngspice — sprawdzają to, co da się sprawdzić bez silnika: pliki YAML,
spójność id, obecność obwodu, poprawność odpowiedzi i to, że rysunek obwodu jest spójny
(`connect`). Symulacje lekcji przechodzą przez zwykłe testy symulacyjne projektu.
"""

from pathlib import Path

import pytest

from solum.circuit.connectivity import connect
from solum.lessons import LessonBook, LessonError

REPO = Path(__file__).parents[2]
LESSONS = REPO / "library" / "lessons"


@pytest.fixture(scope="module")
def book() -> LessonBook:
    return LessonBook(LESSONS)


def test_every_lesson_loads_and_the_course_has_the_planned_size(book: LessonBook) -> None:
    assert len(book) == 12
    index = book.index()
    assert index["count"] == 12
    lectures = [entry["id"] for entry in index["lectures"]]
    assert lectures == ["WSTĘP", "L1", "L3", "L4", "L5", "L6"]
    assert sum(len(entry["lessons"]) for entry in index["lectures"]) == 12


def test_lesson_ids_are_unique_and_ordered(book: LessonBook) -> None:
    ids = [lesson.id for lesson in book._lessons.values()]
    assert len(ids) == len(set(ids))
    orders = sorted(lesson.order for lesson in book._lessons.values())
    assert orders == [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110]


def test_every_lesson_has_content_a_circuit_and_a_quiz(book: LessonBook) -> None:
    for lesson in book._lessons.values():
        payload = book.payload(lesson.id)
        assert payload["title"]
        assert payload["summary"]
        assert payload["objectives"]
        assert payload["blocks"]
        types = [block["type"] for block in payload["blocks"]]
        assert "text" in types
        assert "circuit" in types
        assert "quiz" in types
        for block in payload["blocks"]:
            if block["type"] == "circuit":
                assert block["circuit"] == lesson.circuit
                assert block["tasks"], f"{lesson.id}: obwód bez zadań"
            if block["type"] == "quiz":
                assert 0 <= block["answer"] < len(block["options"])
                assert block["explain"]


def test_every_lesson_circuit_is_drawn_and_connected(book: LessonBook) -> None:
    for lesson in book._lessons.values():
        circuit = book.circuit(lesson.id)
        assert circuit.parts, f"{lesson.id}: pusty obwód"
        assert circuit.wires or circuit.labels, f"{lesson.id}: brak przewodów i etykiet"
        assert circuit.probes.in_ and circuit.probes.out, lesson.id
        nets = connect(circuit)
        assert {circuit.probes.in_, circuit.probes.out} <= set(nets.members), lesson.id


def test_a_broken_lesson_is_a_plain_polish_error(tmp_path: Path) -> None:
    (tmp_path / "circuits").mkdir()
    (tmp_path / "broken.yaml").write_text("id: broken\n", encoding="utf-8")
    with pytest.raises(LessonError, match="pole"):
        LessonBook(tmp_path)


def test_a_missing_circuit_is_reported(tmp_path: Path) -> None:
    (tmp_path / "circuits").mkdir()
    (tmp_path / "broken.yaml").write_text(
        """
id: broken
order: 1
lecture: L1
lecture_title: Test
title: Test
summary: Test
objectives: [Test]
circuit: nie-ma
blocks:
  - type: text
    md: Test
""",
        encoding="utf-8",
    )
    with pytest.raises(LessonError, match="brak obwodu"):
        LessonBook(tmp_path)
