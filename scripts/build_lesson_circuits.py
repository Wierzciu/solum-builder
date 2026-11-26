"""Obwody przykładowe do lekcji (library/lessons/circuits/*.json).

Każdy obwód jest rysowany kodem: części mają ręcznie dobrane położenia, przewody idą
pin-do-pinu, a `net_differences` sprawdza rysunek z listą połączeń, którą zaprojektowaliśmy
wcześniej. Dzięki temu literówka w drucie albo zły pin zatrzymuje budowę, zamiast trafić do
lekcji.

Uruchomienie (z katalogu repo):

    .venv/bin/python scripts/build_lesson_circuits.py
"""

from __future__ import annotations

import sys
from pathlib import Path

from solum.circuit.draw import Drawing, net_differences
from solum.circuit.io import save_circuit

OUT = Path("library/lessons/circuits")
V = 90  # obrót: pin 1 do góry
FILM = {"kind": "film"}


def check(drawing: Drawing, intended: list[set[str]], name: str, **fields):
    """Zbuduj obwód, porównaj z zamiarem i zapisz; każda różnica kończy pracę."""
    circuit = drawing.circuit(name, **fields)
    differences = net_differences(circuit, intended)
    if differences:
        raise SystemExit(f"{name}: rysunek nie zgadza się z zamiarem:\n" + "\n".join(differences))
    path = OUT / f"{circuit.id}.json"
    save_circuit(circuit, path)
    print(f"  {path.name}: {len(circuit.parts)} części, {len(circuit.wires)} przewodów")


def wstep() -> None:
    """Dzielnik napięcia z potencjometrem: pokrętło zmienia napięcie wyjściowe."""
    d = Drawing()
    d.part("V1", "vsource", (0, 0), value=9)
    d.part("R1", "resistor", (100, -80), value="10k")
    d.part("VR1", "pot", (240, -80), value="10k", taper="B", rotation=0.5, label="Napięcie")
    d.part("R2", "resistor", (320, -100), V, value="1M")
    d.wire("V1.+", (0, -80), "R1.1")
    d.wire("R1.2", "VR1.1")
    d.wire("VR1.3", (300, -80), (300, 40), (240, 40))
    d.wire("VR1.2", (240, -140))
    d.wire((240, -140), (320, -140), "R2.1")
    d.wire("R2.2", (320, 0))
    d.wire("V1.-", (0, 60))
    d.label("in", (0, -80))
    d.label("out", (240, -140))
    d.label("GND", (0, 60), (240, 40), (320, 0))
    check(
        d,
        [
            {"V1.+", "R1.1"},
            {"R1.2", "VR1.1"},
            {"V1.-", "VR1.3", "R2.2"},
            {"VR1.2", "R2.1"},
        ],
        "Dzielnik z potencjometrem",
        id="wstep-dzielnik",
        description=(
            "Dzielnik napięcia: 9 V na rezystorze 10 kΩ i potencjometrze 10 kΩ. "
            "Pokrętło „Napięcie” przesuwa suwak, a napięcie wyjściowe zmienia się od 0 V do 9 V."
        ),
        tags=["lekcja", "DC", "dzielnik"],
        probes={"in": "in", "out": "out"},
        net_notes={
            "out": "Suwak potencjometru: napięcie dzielone w stosunku R_dolne / (R1 + R_dolne)."
        },
    )


def prad_napiecie() -> None:
    """Szeregowy obwód 9 V, 1 kΩ i 2 kΩ: prawo Ohma i podział napięć."""
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
    d.label("GND", (0, 60), (240, 40), (320, 0))
    check(
        d,
        [
            {"V1.+", "R1.1"},
            {"R1.2", "R2.1"},
            {"V1.-", "R2.2"},
        ],
        "Prawo Ohma i dzielnik napięcia",
        id="l1-prawo-ohma",
        description=(
            "Obwód szeregowy: źródło 9 V, R1 = 1 kΩ, R2 = 2 kΩ. Prąd wynosi 3 mA, "
            "na R1 odkłada się 3 V, a na R2 6 V."
        ),
        tags=["lekcja", "DC", "prawo Ohma"],
        probes={"in": "in", "out": "out"},
        net_notes={"out": "Węzeł między R1 i R2: 6 V względem masy."},
    )


def szeregowo_rownolegle() -> None:
    """1 kΩ szeregowo z równoległym połączeniem dwóch 2 kΩ."""
    d = Drawing()
    d.part("V1", "vsource", (0, 0), value=9)
    d.part("R1", "resistor", (100, -20), value="1k")
    d.part("R2", "resistor", (240, -80), value="2k")
    d.part("R3", "resistor", (240, 40), value="2k")
    d.wire("V1.+", "R1.1")
    d.wire("R1.2", (220, -20))
    d.wire((220, -20), "R2.1")
    d.wire((220, -20), "R3.1")
    d.wire("R2.2", (300, -80), (300, 40), "R3.2")
    d.wire((300, 40), (300, 100))
    d.wire("V1.-", (0, 60))
    d.label("in", (40, -20))
    d.label("out", (220, -20))
    d.label("GND", (0, 60), (300, 100))
    check(
        d,
        [
            {"V1.+", "R1.1"},
            {"R1.2", "R2.1", "R3.1"},
            {"V1.-", "R2.2", "R3.2"},
        ],
        "Połączenie szeregowo-równoległe",
        id="l1-szeregowo-rownolegle",
        description=(
            "R1 = 1 kΩ w szeregu z równoległym połączeniem R2 = R3 = 2 kΩ. "
            "Wypadkowa rezystancja wynosi 2 kΩ, więc prąd to 4,5 mA, a na gałęziach równoległych "
            "odkłada się 4,5 V."
        ),
        tags=["lekcja", "DC", "rezystory"],
        probes={"in": "in", "out": "out"},
        net_notes={"out": "Górny węzeł gałęzi równoległych: 4,5 V względem masy."},
    )


def dzielnik_obciazony() -> None:
    """Dzielnik 10 kΩ / 10 kΩ obciążony kolejnym 10 kΩ: napięcie spada z 4,5 V do 3 V."""
    d = Drawing()
    d.part("V1", "vsource", (0, 0), value=9)
    d.part("R1", "resistor", (100, -20), value="10k")
    d.part("R2", "resistor", (180, 60), V, value="10k")
    d.part("R3", "resistor", (280, 60), V, value="10k")
    d.part("OUT", "amp", (380, -20))
    d.wire("V1.+", "R1.1")
    d.wire("R1.2", (280, -20), "OUT.in")
    d.wire((180, -20), "R2.1")
    d.wire((180, -20), (280, -20))
    d.wire((280, -20), "R3.1")
    d.wire("R2.2", (180, 120))
    d.wire("R3.2", (280, 120))
    d.wire("V1.-", (0, 60))
    d.label("in", (40, -20))
    d.label("out", (240, -20))
    d.label("GND", (0, 60), (180, 120), (280, 120))
    check(
        d,
        [
            {"V1.+", "R1.1"},
            {"R1.2", "R2.1", "R3.1", "OUT.in"},
            {"V1.-", "R2.2", "R3.2"},
        ],
        "Dzielnik napięcia z obciążeniem",
        id="l3-dzielnik-obciazony",
        description=(
            "Dzielnik R1 = R2 = 10 kΩ zasilany z 9 V daje bez obciążenia 4,5 V. "
            "Doleczony równolegle R3 = 10 kΩ obciąża dzielnik i napięcie spada do 3 V."
        ),
        tags=["lekcja", "DC", "dzielnik"],
        probes={"in": "in", "out": "out"},
        net_notes={"out": "Węzeł dzielnika obciążony R3; bez R3 byłoby tu 4,5 V, z R3 jest 3 V."},
    )


def kvl_kcl() -> None:
    """Dwa źródła i jeden węzeł: KCL daje 6 V, KVL domyka oba oczka."""
    d = Drawing()
    d.part("V1", "vsource", (0, 0), value=10)
    d.part("R1", "resistor", (100, -20), value="1k")
    d.part("R2", "resistor", (280, -20), value="1k")
    d.part("V2", "vsource", (400, 0), value=5)
    d.part("R3", "resistor", (200, 60), V, value="2k")
    d.wire("V1.+", "R1.1")
    d.wire("R1.2", (200, -20), "R2.1")
    d.wire("R2.2", "V2.+")
    d.wire((200, -20), (200, 40))
    d.wire("V1.-", (0, 60))
    d.wire("V2.-", (400, 60))
    d.wire("R3.2", (200, 120))
    d.label("in", (40, -20))
    d.label("out", (200, -20))
    d.label("GND", (0, 60), (400, 60), (200, 120))
    check(
        d,
        [
            {"V1.+", "R1.1"},
            {"R1.2", "R2.1", "R3.1"},
            {"R2.2", "V2.+"},
            {"V1.-", "V2.-", "R3.2"},
        ],
        "KVL i KCL: dwa źródła, jeden węzeł",
        id="l3-kvl-kcl",
        description=(
            "Dwa źródła 10 V i 5 V oraz rezystory 1 kΩ, 1 kΩ i 2 kΩ. W węźle między nimi "
            "KCL daje 6 V; przez R1 płynie 4 mA, przez R2 1 mA, a przez R3 3 mA."
        ),
        tags=["lekcja", "DC", "Kirchhoff"],
        probes={"in": "in", "out": "out"},
        net_notes={"out": "Węzeł KCL: (U−10)/1k + (U−5)/1k + U/2k = 0, czyli U = 6 V."},
    )


def filtr_rc() -> None:
    """Filtr dolnoprzepustowy RC: R = 10 kΩ, C = 100 nF, f_c ≈ 159 Hz."""
    d = Drawing()
    d.part("IN", "guitar", (0, 0), volume="250k")
    d.part("R1", "resistor", (100, 0), value="10k")
    d.part("C1", "capacitor", (200, 60), V, value="100n", **FILM)
    d.part("OUT", "amp", (300, 0))
    d.wire("IN.out", "R1.1")
    d.wire("R1.2", (200, 0), "OUT.in")
    d.wire((200, 0), "C1.1")
    d.wire("C1.2", (200, 120))
    d.label("in", (40, 0))
    d.label("out", (240, 0))
    d.label("GND", (200, 120))
    check(
        d,
        [
            {"IN.out", "R1.1"},
            {"R1.2", "C1.1", "OUT.in"},
            {"C1.2"},
        ],
        "Filtr dolnoprzepustowy RC",
        id="l3-filtr-rc",
        description=(
            "Filtr RC: R = 10 kΩ, C = 100 nF. Częstotliwość graniczna f_c = 1/(2πRC) ≈ 159 Hz; "
            "powyżej niej sygnał jest coraz mocniej tłumiony."
        ),
        tags=["lekcja", "AC", "filtr"],
        probes={"in": "in", "out": "out"},
        net_notes={"out": "Na wyjściu filtra: przy 159 Hz wzmocnienie spada o 3 dB."},
    )


def dioda() -> None:
    """Dioda 1N4148 odcina dodatnią połówkę sygnału (obcinacz)."""
    d = Drawing()
    d.part("IN", "guitar", (0, 0), volume="250k")
    d.part("R1", "resistor", (100, 0), value="1k")
    d.part("D1", "diode", (200, 60), V, model="1N4148")
    d.part("OUT", "amp", (300, 0))
    d.wire("IN.out", "R1.1")
    d.wire("R1.2", (200, 0), "OUT.in")
    d.wire((200, 0), "D1.A")
    d.wire("D1.K", (200, 120))
    d.label("in", (40, 0))
    d.label("out", (240, 0))
    d.label("GND", (200, 120))
    check(
        d,
        [
            {"IN.out", "R1.1"},
            {"R1.2", "D1.A", "OUT.in"},
            {"D1.K"},
        ],
        "Obcinacz na diodzie",
        id="l4-dioda-obcinacz",
        description=(
            "Dioda 1N4148 do masy za rezystorem 1 kΩ. Dodatnia połówka sygnału jest "
            "ograniczana do około 0,7 V, ujemna przechodzi prawie bez zmian."
        ),
        tags=["lekcja", "dioda", "AC"],
        probes={"in": "in", "out": "out"},
        net_notes={"out": "Węzeł za diodą: dodatnie szczyty są obcinane na napięciu przewodzenia."},
    )


def tranzystor() -> None:
    """Wspólny emiter z regulowanym punktem pracy (trymer 20 kΩ w bazie)."""
    d = Drawing()
    d.part("IN", "guitar", (0, 0), volume="250k")
    d.part("C1", "capacitor", (100, 0), value="1µ", **FILM)
    d.part("Q1", "bjt", (240, 0), model="2N3904")
    d.part("R1", "resistor", (160, -120), V, value="47k")
    d.part("TR1", "trimmer", (120, 100), V, value="20k", rotation=0.5, label="Punkt pracy")
    d.part("R3", "resistor", (300, -120), V, value="4k7")
    d.part("R4", "resistor", (300, 100), V, value="1k")
    d.part("C2", "capacitor", (400, -20), value="1µ", **FILM)
    d.part("OUT", "amp", (520, -20))
    d.wire("IN.out", "C1.1")
    d.wire("C1.2", (160, 0), "Q1.B")
    d.wire("R1.2", (160, 0))
    d.wire("R1.1", (160, -160))
    d.wire("Q1.C", (300, -20), "R3.2")
    d.wire("R3.1", (300, -160))
    d.wire("Q1.E", (300, 20), "R4.1")
    d.wire("R4.2", (300, 160))
    d.wire((160, 0), (160, 80), "TR1.1")
    d.wire("TR1.2", (140, 140))
    d.wire((300, -20), "C2.1")
    d.wire("C2.2", "OUT.in")
    d.label("in", (40, 0))
    d.label("out", (480, -20))
    d.label("V+", (160, -160), (300, -160))
    d.label("GND", (140, 140), (300, 160))
    check(
        d,
        [
            {"IN.out", "C1.1"},
            {"C1.2", "Q1.B", "R1.2", "TR1.1"},
            {"Q1.C", "R3.2", "C2.1"},
            {"R1.1", "R3.1"},
            {"Q1.E", "R4.1"},
            {"TR1.2", "R4.2"},
            {"C2.2", "OUT.in"},
        ],
        "Tranzystor: punkt pracy",
        id="l4-tranzystor-bias",
        description=(
            "Wspólny emiter z tranzystorem 2N3904, Rc = 4,7 kΩ, Re = 1 kΩ i trymerem 20 kΩ "
            "w dzielniku bazy. Trymer przesuwa punkt pracy od odcięcia, przez stan aktywny, "
            "do nasycenia."
        ),
        tags=["lekcja", "tranzystor", "DC"],
        power={"rails": {"V+": 9.0}},
        probes={"in": "in", "out": "out"},
        net_notes={
            "V+": "Szyna zasilania 9 V.",
            "out": "Kolektor tranzystora: w stanie aktywnym około 4,9 V.",
        },
    )


def wzmacniacz_operacyjny() -> None:
    """Wzmacniacz odwracający na TL071: Rin = 10 kΩ, Rf = 20 kΩ, wzmocnienie −2."""
    d = Drawing()
    d.part("IN", "guitar", (0, 0), volume="250k")
    d.part("R1", "resistor", (100, 0), value="10k")
    d.part("IC1", "opamp", (300, -20), model="TL071")
    d.part("R2", "resistor", (300, -120), value="20k")
    d.part("OUT", "amp", (440, -20))
    d.wire("IN.out", "R1.1")
    d.wire("R1.2", (180, 0), (180, -40), "IC1.-")
    d.wire("IC1.-", (260, -120), "R2.1")
    d.wire("R2.2", (340, -120), "IC1.out")
    d.wire("IC1.+", (240, 0), (240, 40))
    d.wire("IC1.out", "OUT.in")
    d.wire("IC1.V+", (300, -90), (360, -90))
    d.wire("IC1.V-", (300, 60), (360, 60))
    d.label("in", (40, 0))
    d.label("out", (380, -20))
    d.label("GND", (240, 40))
    d.label("V+", (360, -90))
    d.label("V-", (360, 60))
    check(
        d,
        [
            {"IN.out", "R1.1"},
            {"R1.2", "IC1.-", "R2.1"},
            {"R2.2", "IC1.out", "OUT.in"},
            {"IC1.+"},
            {"IC1.V+"},
            {"IC1.V-"},
        ],
        "Wzmacniacz odwracający",
        id="l4-wzmacniacz-odwracajacy",
        description=(
            "Wzmacniacz odwracający na TL071: Rin = 10 kΩ, Rf = 20 kΩ. "
            "Wzmocnienie wynosi −Rf/Rin = −2, a sygnał wyjściowy jest odwrócony o 180°."
        ),
        tags=["lekcja", "opamp", "AC"],
        power={"rails": {"V+": 9.0, "V-": -9.0}},
        probes={"in": "in", "out": "out"},
        net_notes={"out": "Wyjście wzmacniacza: wzmocnienie −2 względem wejścia."},
    )


def rezonans() -> None:
    """Szeregowy RLC: R = 100 Ω, L = 10 mH, C = 1 µF, f_0 ≈ 1,59 kHz."""
    d = Drawing()
    d.part("IN", "guitar", (0, 0), volume="250k")
    d.part("R1", "resistor", (100, 0), value="100")
    d.part("L1", "inductor", (200, 0), value="10m")
    d.part("C1", "capacitor", (300, 60), V, value="1µ", **FILM)
    d.part("OUT", "amp", (400, 0))
    d.wire("IN.out", "R1.1")
    d.wire("R1.2", "L1.1")
    d.wire("L1.2", (300, 0), "OUT.in")
    d.wire((300, 0), "C1.1")
    d.wire("C1.2", (300, 120))
    d.label("in", (40, 0))
    d.label("out", (340, 0))
    d.label("GND", (300, 120))
    check(
        d,
        [
            {"IN.out", "R1.1"},
            {"R1.2", "L1.1"},
            {"L1.2", "C1.1", "OUT.in"},
            {"C1.2"},
        ],
        "Rezonans szeregowy RLC",
        id="l5-rezonans-rlc",
        description=(
            "Szeregowy obwód RLC: R = 100 Ω, L = 10 mH, C = 1 µF. Częstotliwość rezonansowa "
            "f₀ = 1/(2π√(LC)) ≈ 1592 Hz, a dobroć Q = (1/R)√(L/C) = 1."
        ),
        tags=["lekcja", "AC", "RLC"],
        probes={"in": "in", "out": "out"},
        net_notes={"out": "Węzeł między L i C: przy rezonansie napięcie na C jest największe."},
    )


def przedwzmacniacz() -> None:
    """Wzmacniacz klasy A: Rc = 10 kΩ, Re = 1 kΩ, wzmocnienie około 10."""
    d = Drawing()
    d.part("IN", "guitar", (0, 0), volume="250k")
    d.part("C1", "capacitor", (100, 0), value="1µ", **FILM)
    d.part("Q1", "bjt", (240, 0), model="2N3904")
    d.part("R1", "resistor", (160, -120), V, value="150k")
    d.part("R2", "resistor", (160, 100), V, value="22k")
    d.part("R3", "resistor", (300, -120), V, value="10k")
    d.part("R4", "resistor", (300, 100), V, value="1k")
    d.part("C2", "capacitor", (400, -20), value="1µ", **FILM)
    d.part("R5", "resistor", (460, 60), V, value="10k")
    d.part("OUT", "amp", (520, -20))
    d.wire("IN.out", "C1.1")
    d.wire("C1.2", (160, 0), "Q1.B")
    d.wire("R1.2", (160, 0))
    d.wire("R1.1", (160, -160))
    d.wire("R2.1", (160, 0))
    d.wire("R2.2", (160, 140))
    d.wire("Q1.C", (300, -20), "R3.2")
    d.wire("R3.1", (300, -160))
    d.wire("Q1.E", (300, 20), "R4.1")
    d.wire("R4.2", (300, 160))
    d.wire((300, -20), "C2.1")
    d.wire("C2.2", (460, -20), "OUT.in")
    d.wire((460, -20), "R5.1")
    d.wire("R5.2", (460, 100))
    d.label("in", (40, 0))
    d.label("out", (480, -20))
    d.label("V+", (160, -160), (300, -160))
    d.label("GND", (160, 140), (300, 160), (460, 100))
    check(
        d,
        [
            {"IN.out", "C1.1"},
            {"C1.2", "Q1.B", "R1.2", "R2.1"},
            {"Q1.C", "R3.2", "C2.1"},
            {"R1.1", "R3.1"},
            {"Q1.E", "R4.1"},
            {"R2.2", "R4.2", "R5.2"},
            {"C2.2", "OUT.in", "R5.1"},
        ],
        "Przedwzmacniacz klasy A",
        id="l6-przedwzmacniacz",
        description=(
            "Wzmacniacz klasy A według przykładu z wykładu 6: zasilanie 9 V, Rc = 10 kΩ, "
            "Re = 1 kΩ, dzielnik bazy 150 kΩ / 22 kΩ. Punkt pracy: Uc ≈ 4,5 V, prąd kolektora "
            "≈ 0,45 mA, wzmocnienie ≈ 10."
        ),
        tags=["lekcja", "tranzystor", "wzmacniacz"],
        power={"rails": {"V+": 9.0}},
        probes={"in": "in", "out": "out"},
        net_notes={"out": "Wyjście przez C2; Re bez bocznika, więc wzmocnienie ≈ Rc/Re = 10."},
    )


def sumator() -> None:
    """Sumator odwracający na TL071: trzy wejścia 1 V, 2 V, 4 V dają −7 V (DAC 3-bit)."""
    d = Drawing()
    d.part("V1", "vsource", (-120, 0), value=1)
    d.part("V2", "vsource", (-120, 140), value=2)
    d.part("V3", "vsource", (-120, 260), value=4)
    d.part("R1", "resistor", (0, -20), value="10k")
    d.part("R2", "resistor", (0, 120), value="10k")
    d.part("R3", "resistor", (0, 240), value="10k")
    d.part("IC1", "opamp", (340, -20), model="TL071")
    d.part("R4", "resistor", (340, -140), value="10k")
    d.part("OUT", "amp", (480, -20))
    d.wire("V1.+", "R1.1")
    d.wire("V2.+", "R2.1")
    d.wire("V3.+", "R3.1")
    d.wire("R1.2", (120, -20))
    d.wire("R2.2", (120, 120), (120, -20))
    d.wire("R3.2", (120, 240), (120, -20))
    d.wire((120, -20), (120, -40), "IC1.-")
    d.wire("IC1.-", (300, -140), "R4.1")
    d.wire("R4.2", (380, -140), (380, -20))
    d.wire("IC1.+", (280, 0), (280, 40))
    d.wire("IC1.out", "OUT.in")
    d.wire("IC1.V+", (340, -90), (400, -90))
    d.wire("IC1.V-", (340, 60), (400, 60))
    d.wire("V1.-", (-120, 60))
    d.wire("V2.-", (-120, 200))
    d.wire("V3.-", (-120, 320))
    d.label("in", (-60, -20))
    d.label("out", (440, -20))
    d.label("GND", (280, 40), (-120, 60), (-120, 200), (-120, 320))
    d.label("V+", (400, -90))
    d.label("V-", (400, 60))
    check(
        d,
        [
            {"V1.+", "R1.1"},
            {"V2.+", "R2.1"},
            {"V3.+", "R3.1"},
            {"R1.2", "R2.2", "R3.2", "IC1.-", "R4.1"},
            {"R4.2", "IC1.out", "OUT.in"},
            {"IC1.+", "V1.-", "V2.-", "V3.-"},
            {"IC1.V+"},
            {"IC1.V-"},
        ],
        "Sumator odwracający (DAC)",
        id="l6-sumator-dac",
        description=(
            "Sumator odwracający: trzy napięcia 1 V, 2 V i 4 V przez rezystory 10 kΩ i "
            "sprzężenie zwrotne 10 kΩ. Wyjście to −(1+2+4) V = −7 V, czyli 3-bitowy przetwornik "
            "cyfrowo-analogowy."
        ),
        tags=["lekcja", "opamp", "DAC"],
        power={"rails": {"V+": 9.0, "V-": -9.0}},
        probes={"in": "in", "out": "out"},
        net_notes={"out": "Suma ważona wejść ze znakiem minus: −(V1 + V2 + V3)."},
    )


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    builders = [
        wstep,
        prad_napiecie,
        szeregowo_rownolegle,
        dzielnik_obciazony,
        kvl_kcl,
        filtr_rc,
        dioda,
        tranzystor,
        wzmacniacz_operacyjny,
        rezonans,
        przedwzmacniacz,
        sumator,
    ]
    for build in builders:
        print(build.__name__)
        build()
    print(f"\nGotowe: {len(builders)} obwodów w {OUT}")


if __name__ == "__main__":
    main()
    sys.exit(0)
