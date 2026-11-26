# Lekcje — przewodnik dla autora

Kurs jest częścią polskiego forka Solum Builder. Ten plik opisuje, gdzie leży treść,
jak ją zmieniać i jak sprawdzić zmiany.

## Gdzie co jest

| Ścieżka | Co |
|---|---|
| `library/lessons/*.yaml` | treść lekcji: metadane, cele, bloki, quizy |
| `library/lessons/circuits/*.json` | obwody otwierane w symulatorze |
| `solum/lessons.py` | walidacja YAML i renderowanie Markdownu do HTML |
| `scripts/build_lesson_circuits.py` | generator obwodów (Drawing + kontrola netlisty) |
| `web/lekcje/` | strona kursu (`index.html`, `lekcje.css`, `lekcje.js`) |
| `tests/unit/test_lessons.py` | testy spójności kursu |

## Format lekcji

```yaml
id: l1-prawo-ohma          # = nazwa pliku, małe litery i myślniki
order: 10                  # kolejność w kursie
lecture: L1                # WSTĘP, L1, L3, L4, L5, L6
lecture_title: Wprowadzenie do elektroniki
title: Prąd, napięcie, opór i prawo Ohma
slides: "L1, slajdy 25–41"
minutes: 25
summary: "Jedno–dwa zdania streszczenia."
objectives:                # 2–4 punkty
  - "Co student będzie umieć."
circuit: l1-prawo-ohma     # id pliku z circuits/
circuit_title: Dzielnik 1 kΩ / 2 kΩ
source: "Podstawy_Elektroniki.pdf, wykład L1"
blocks: [...]
```

### Bloki

- `text` — `md`: Markdown; dozwolony HTML (`<div class="formula-line">…</div>`,
  `<sub>`, `<sup>`). Nie ma LaTeX-a — wzory pisz jako HTML/Unicode.
- `formula` — `html`: duży, wyśrodkowany wzór.
- `note` — `tone`: `info`, `tip`, `warn`; `title`, `md`.
- `circuit` — `circuit`, `title`, `md`, `tasks` (lista Markdown inline).
- `quiz` — `question`, `options` (min. 2), `answer` (indeks od 0), `explain`.
- `table` — `head`, `rows` (lista list); komórki mogą mieć HTML.

Quizy są ponumerowane automatycznie. Postęp (ukończone lekcje, zadania, poprawne quizy)
jest w `localStorage` pod kluczem `solum-pl-lekcje-v1`.

## Obwody

Obwód rysuje się kodem. W `scripts/build_lesson_circuits.py`:

```python
def moj_obwod() -> None:
    d = Drawing()
    d.part("V1", "vsource", (0, 0), value=9)
    d.part("R1", "resistor", (100, -20), value="1k")
    d.part("R2", "resistor", (220, -20), value="2k")
    d.wire("V1.+", "R1.1")
    d.wire("R1.2", "R2.1")
    d.wire("R2.2", (240, 40))
    d.wire("V1.-", (0, 60))
    d.label("in", (40, -20))
    d.label("out", (160, -20))
    d.label("GND", (0, 60), (240, 40))
    check(d, [
        {"V1.+", "R1.1"},
        {"R1.2", "R2.1"},
        {"V1.-", "R2.2"},
    ], "Mój obwód", id="moj-obwod", probes={"in": "in", "out": "out"})
```

`check()` porównuje rysunek z listą połączeń i zapisuje plik dopiero, gdy są zgodne.
Po zmianie:

```bash
.venv/bin/python scripts/build_lesson_circuits.py
.venv/bin/python .claude/skills/draw-circuit/look.py \
  library/lessons/circuits/moj-obwod.json
```

`look.py` otwiera obwód w prawdziwej aplikacji (na tymczasowych folderach), wypisuje
ostrzeżenia, napięcia DC i zapisuje PNG obok pliku. Obejrzyj obraz: brak tekstu na tekście,
przewodów przez części i etykiet na sobie.

### Zasady rysowania

- sygnał z lewej do prawej, zasilanie u góry, masa u dołu,
- `probes: {in, out}` musi wskazywać istniejące sieci,
- każdy pin albo jest podłączony, albo świadomie otwarty (symulator to pokaże),
- dla lekcji DC dodaj obciążenie 1 MΩ / amp, żeby węzeł nie był „wiszący”,
- ostrzeżenia typu „DC at the output” są w lekcjach DC poprawne — opisz je w treści.

## Tłumaczenie interfejsu

`web/i18n.js` ma słownik `PL` i wzorce `RULES`. Nowy napis w aplikacji: dopisz parę
`"English": "Polski"`. Napis z danymi: dopisz wzorzec. Tłumaczenie nie dotyka SVG
(schematu) ani tekstu użytkownika.

## Sprawdzenie

```bash
.venv/bin/python -m pytest tests/unit/test_lessons.py -q
.venv/bin/python -m ruff check solum/lessons.py scripts/build_lesson_circuits.py tests/unit/test_lessons.py
.venv/bin/python -m mypy --strict solum/lessons.py
```

Strona: <http://localhost:8000/lekcje/>. Adres lekcji: `/lekcje/#/<id>`.
