"""Interaktywne lekcje dołączone do polskiego forka (katalog `library/lessons/`).

Lekcja to plik YAML: metadane, cele, bloki treści (tekst, wzór, ramka, zadanie z
symulatorem, quiz, tabela) i wskazanie obwodu z `library/lessons/circuits/`, który
otwiera się w edytorze Solum Builder. Treść jest renderowana raz, przy wczytaniu, tym
samym silnikiem Markdown co przewodnik (`solum/manual.py`), więc front dostaje gotowy
HTML i nie musi znać Markdownu.

Błąd w pliku lekcji jest błędem startu aplikacji (LessonError z nazwą pliku i pola), a
nie cichym pominięciem: brakujący obwód albo zły klucz quizu ma być widoczny od razu.
"""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Any, Literal

from markdown_it import MarkdownIt
from pydantic import BaseModel, ConfigDict, Field, ValidationError, model_validator

from solum.circuit.io import CircuitError, load_circuit
from solum.circuit.schema import Circuit
from solum.yamlio import YamlError, load_yaml

_MD = MarkdownIt("commonmark", {"html": True}).enable("table")


class LessonError(ValueError):
    """Plik lekcji jest nieczytelny albo niespójny (komunikat po polsku)."""


BlockType = Literal["text", "formula", "note", "circuit", "quiz", "table"]
Tone = Literal["info", "tip", "warn"]


class Block(BaseModel):
    """Jeden blok treści lekcji. Pola zależą od `type`; walidacja niżej pilnuje, żeby
    blok miał wszystko, czego potrzebuje jego rodzaj, i nic zbędnego."""

    model_config = ConfigDict(extra="forbid")

    type: BlockType
    md: str = ""  # treść Markdown (text, note, circuit, quiz)
    html: str = ""  # gotowy HTML wzoru (formula); treść własna, zaufana
    title: str = ""
    tone: Tone = "info"
    circuit: str = ""  # id obwodu (circuit)
    tasks: list[str] = Field(default_factory=list)
    question: str = ""
    options: list[str] = Field(default_factory=list)
    answer: int | None = None
    explain: str = ""
    head: list[str] = Field(default_factory=list)
    rows: list[list[str]] = Field(default_factory=list)

    @model_validator(mode="after")
    def _fits_type(self) -> Block:
        if self.type in ("text", "note") and not self.md.strip():
            raise ValueError("blok tekstowy potrzebuje pola `md`")
        if self.type == "formula" and not self.html.strip():
            raise ValueError("blok wzoru potrzebuje pola `html`")
        if self.type == "circuit":
            if not self.circuit.strip():
                raise ValueError("blok obwodu potrzebuje pola `circuit`")
            if not self.md.strip():
                raise ValueError("blok obwodu potrzebuje opisu w `md`")
        if self.type == "quiz":
            if not self.question.strip():
                raise ValueError("quiz potrzebuje pola `question`")
            if len(self.options) < 2:
                raise ValueError("quiz potrzebuje co najmniej dwóch odpowiedzi")
            if self.answer is None or not 0 <= self.answer < len(self.options):
                raise ValueError("pole `answer` quizu musi wskazywać jedną z odpowiedzi")
            if not self.explain.strip():
                raise ValueError("quiz potrzebuje wyjaśnienia w `explain`")
        if self.type == "table" and (not self.head or not self.rows):
            raise ValueError("tabela potrzebuje `head` i `rows`")
        return self

    def rendered(self) -> dict[str, Any]:
        """Blok dla strony: Markdown zamieniony na HTML, reszta bez zmian."""
        out = self.model_dump(
            exclude={"md", "html", "tasks", "question", "options", "explain", "head", "rows"}
        )
        if self.type in ("text", "note", "circuit"):
            out["html"] = _MD.render(self.md)
        elif self.type == "formula":
            out["html"] = self.html
        if self.type == "circuit":
            out["tasks"] = [_MD.renderInline(t) for t in self.tasks]
        if self.type == "quiz":
            out["question"] = _MD.renderInline(self.question)
            out["options"] = [_MD.renderInline(o) for o in self.options]
            out["explain"] = _MD.renderInline(self.explain)
        if self.type == "table":
            out["head"] = [_MD.renderInline(h) for h in self.head]
            out["rows"] = [[_MD.renderInline(c) for c in row] for row in self.rows]
        return out


class Lesson(BaseModel):
    """Jedna lekcja, wczytana z `library/lessons/<id>.yaml`."""

    model_config = ConfigDict(extra="forbid")

    id: str
    order: int
    lecture: str  # "L1", "L3", "L4", "L5", "L6" albo "WSTĘP"
    lecture_title: str
    title: str
    slides: str = ""
    minutes: int = 15
    summary: str
    objectives: list[str] = Field(min_length=1)
    circuit: str
    circuit_title: str = ""
    source: str = ""
    blocks: list[Block] = Field(min_length=1)

    @model_validator(mode="after")
    def _quiz_ids(self) -> Lesson:
        if not self.id.replace("-", "").isalnum() or self.id.lower() != self.id:
            raise ValueError("`id` musi być małymi literami, cyframi i myślnikami")
        return self

    def payload(self) -> dict[str, Any]:
        return {
            "id": self.id,
            "order": self.order,
            "lecture": self.lecture,
            "lecture_title": self.lecture_title,
            "title": self.title,
            "slides": self.slides,
            "minutes": self.minutes,
            "summary": self.summary,
            "objectives": self.objectives,
            "circuit": self.circuit,
            "circuit_title": self.circuit_title or self.title,
            "source": self.source,
            "blocks": [b.rendered() for b in self.blocks],
        }


@dataclass(frozen=True)
class LessonEntry:
    """Pozycja spisu lekcji (bez treści, żeby `/api/lessons` był lekki)."""

    id: str
    order: int
    lecture: str
    lecture_title: str
    title: str
    minutes: int
    summary: str


class LessonBook:
    """Wszystkie lekcje z katalogu: spis, pojedyncza lekcja i jej obwód."""

    def __init__(self, directory: Path) -> None:
        self.directory = directory
        self._lessons: dict[str, Lesson] = {}
        self._circuits: dict[str, Path] = {}
        self._load()

    def _load(self) -> None:
        if not self.directory.is_dir():
            return
        self._circuits = {p.stem: p for p in sorted((self.directory / "circuits").glob("*.json"))}
        for path in sorted(self.directory.glob("*.yaml")):
            try:
                raw = load_yaml(path)
            except YamlError as err:
                raise LessonError(f"{path.name}: {err}") from None
            if not isinstance(raw, dict):
                raise LessonError(f"{path.name}: lekcja musi być mapą pól YAML.")
            try:
                lesson = Lesson.model_validate(raw)
            except ValidationError as err:
                first = err.errors()[0]
                where = ".".join(str(p) for p in first["loc"])
                raise LessonError(
                    f"{path.name}: pole `{where}` — {first['msg'].removeprefix('Value error, ')}."
                ) from None
            if lesson.id != path.stem:
                raise LessonError(f"{path.name}: `id` musi być takie samo jak nazwa pliku.")
            if lesson.id in self._lessons:
                raise LessonError(f"{path.name}: lekcja o id `{lesson.id}` jest już wczytana.")
            if lesson.circuit not in self._circuits:
                raise LessonError(
                    f"{path.name}: brak obwodu `{lesson.circuit}` w library/lessons/circuits/."
                )
            self._lessons[lesson.id] = lesson

    def __len__(self) -> int:
        return len(self._lessons)

    def index(self) -> dict[str, Any]:
        """Spis lekcji pogrupowany po wykładach, w kolejności `order`."""
        groups: dict[str, list[LessonEntry]] = {}
        for lesson in sorted(self._lessons.values(), key=lambda item: item.order):
            entry = LessonEntry(
                id=lesson.id,
                order=lesson.order,
                lecture=lesson.lecture,
                lecture_title=lesson.lecture_title,
                title=lesson.title,
                minutes=lesson.minutes,
                summary=lesson.summary,
            )
            groups.setdefault(lesson.lecture, []).append(entry)
        lectures = []
        for lecture, entries in groups.items():
            lectures.append(
                {
                    "id": lecture,
                    "title": entries[0].lecture_title,
                    "lessons": [
                        {
                            "id": e.id,
                            "title": e.title,
                            "minutes": e.minutes,
                            "summary": e.summary,
                        }
                        for e in entries
                    ],
                }
            )
        return {"count": len(self._lessons), "lectures": lectures}

    def lesson(self, lesson_id: str) -> Lesson:
        try:
            return self._lessons[lesson_id]
        except KeyError:
            raise LessonError(f"Nie ma lekcji o id `{lesson_id}`.") from None

    def payload(self, lesson_id: str) -> dict[str, Any]:
        return self.lesson(lesson_id).payload()

    def circuit(self, lesson_id: str) -> Circuit:
        lesson = self.lesson(lesson_id)
        path = self._circuits[lesson.circuit]
        try:
            return load_circuit(path)
        except CircuitError as err:
            raise LessonError(f"{path.name}: {err}") from None
