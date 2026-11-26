/**
 * Polska warstwa interfejsu Solum Builder.
 *
 * Aplikacja jest forkiem projektu angielskiego, więc zamiast przepisywać tysiące napisów
 * w modułach, tłumaczymy **widoczne napisy** po zbudowaniu strony: dokładne teksty z
 * poniższego słownika oraz kilka wzorców dla komunikatów z danymi („Saved X (v1.0)”).
 * Treść użytkownika — nazwy obwodów, notatki, wartości części — nie jest ruszana, bo
 * słownik dopasowuje tylko znane napisy interfejsu.
 *
 * Nowy napis w interfejsie: dopisz parę „angielski”: „polski”. Jeśli napis zawiera dane,
 * dopisz wzorzec w `RULES`. Tłumaczenie działa też dla elementów dodanych później
 * (MutationObserver), więc menu i panele nie muszą być tłumaczone w miejscu powstania.
 */

const PL = new Map(Object.entries({
  // ---- nagłówek, menu, przyciski ------------------------------------------------
  "File": "Plik",
  "Edit": "Edycja",
  "Blocks": "Bloki",
  "View": "Widok",
  "Tools": "Narzędzia",
  "Help": "Pomoc",
  "Board": "Płytka",
  "Not saved": "Niezapisane",
  "Untitled": "Bez nazwy",
  "Power": "Zasilanie",
  "▶ Run": "▶ Uruchom",
  "Run": "Uruchom",
  "Auto-run": "Auto-uruchamianie",
  "History": "Historia",
  "Rename": "Zmień nazwę",
  "Name": "Nazwa",
  "no supply": "brak zasilania",
  "Custom…": "Własne…",
  "Fit": "Dopasuj",
  "Zoom in": "Przybliż",
  "Zoom out": "Oddal",

  // ---- menu Plik ----------------------------------------------------------------
  "New sheet": "Nowy arkusz",
  "New from starter": "Nowy z przykładu",
  "Open…": "Otwórz…",
  "Import…": "Importuj…",
  "Save": "Zapisz",
  "Save as…": "Zapisz jako…",
  "Properties…": "Właściwości…",
  "New major version…": "Nowa wersja główna…",
  "Export…": "Eksportuj…",
  "Settings…": "Ustawienia…",
  "Delete this circuit…": "Usuń ten obwód…",

  // ---- menu Edycja --------------------------------------------------------------
  "Undo": "Cofnij",
  "Redo": "Ponów",
  "History…": "Historia…",
  "Edit part…": "Edytuj część…",
  "Rotate": "Obróć",
  "Delete": "Usuń",
  "Copy": "Kopiuj",
  "Paste": "Wklej",
  "Select all": "Zaznacz wszystko",
  "Find part…": "Znajdź część…",

  // ---- menu Bloki/Widok/Narzędzia/Pomoc ----------------------------------------
  "Insert or manage blocks…": "Wstaw lub zarządzaj blokami…",
  "Save sheet as block…": "Zapisz arkusz jako blok…",
  "Fit circuit": "Dopasuj obwód",
  "DC voltages on schematic": "Napięcia DC na schemacie",
  "Impedance in and out": "Impedancja wejścia i wyjścia",
  "Capacitor types": "Typy kondensatorów",
  "Problem marks": "Znaczniki problemów",
  "Hide left pane": "Ukryj lewy panel",
  "Hide right pane": "Ukryj prawy panel",
  "Reset pane order": "Przywróć kolejność paneli",
  "Unit converter…": "Przelicznik jednostek…",
  "Resistor colour code…": "Kod paskowy rezystorów…",
  "Calculators…": "Kalkulatory…",
  "Stripboard layout": "Układ płytki paskowej",
  "Parts and datasheets…": "Części i karty katalogowe…",
  "Add a model…": "Dodaj model…",
  "Interaktywne lekcje…": "Interaktywne lekcje…",
  "Documentation…": "Dokumentacja…",
  "Formulas…": "Wzory…",
  "Hot keys…": "Skróty klawiszowe…",
  "Choosing capacitors…": "Dobór kondensatorów…",
  "Resistor colour code and values…": "Kod paskowy i wartości rezystorów…",
  "About Solum Builder…": "O Solum Builder…",

  // ---- paleta części ------------------------------------------------------------
  "Wiring": "Okablowanie",
  "Passive": "Bierne",
  "Semiconductors": "Półprzewodniki",
  "Signal & power": "Sygnał i zasilanie",
  "WIRING": "OKABLOWANIE",
  "Wire": "Przewód",
  "Ground": "Masa",
  "Net label": "Etykieta sieci",
  "PASSIVE": "BIERNE",
  "Resistor": "Rezystor",
  "Capacitor": "Kondensator",
  "Pot": "Potencjometr",
  "Inductor": "Cewka",
  "Trimmer": "Trymer",
  "Switch": "Przełącznik",
  "SEMICONDUCTORS": "PÓŁPRZEWODNIKI",
  "Diode": "Dioda",
  "Transistor": "Tranzystor",
  "Dual op-amp": "Wzmacniacz podwójny",
  "Quad op-amp": "Wzmacniacz poczwórny",
  "Single op-amp": "Wzmacniacz pojedynczy",
  "Hex inverter": "Inwerter sześciokrotny",
  "Dual OTA": "Podwójny OTA",
  "SIGNAL & POWER": "SYGNAŁ I ZASILANIE",
  "Guitar in": "Wejście gitarowe",
  "Amp out": "Wyjście wzmacniacza",
  "DC source": "Źródło DC",
  "Jack": "Gniazdo",
  "plugged in": "wtyk włożony",
  "DC jack": "Gniazdo DC",
  "Battery": "Bateria",
  "Charge pump": "Pompa ładunku",
  "Regulator": "Stabilizator",
  "MISC": "RÓŻNE",
  "Text": "Tekst",

  // ---- panele i ich przyciski ---------------------------------------------------
  "Problems": "Problemy",
  "Notes": "Notatki",
  "Probe": "Sonda",
  "Frequency": "Częstotliwość",
  "Bias & headroom": "Punkt pracy i zapas",
  "Scope": "Oscyloskop",
  "Harmonics": "Harmoniczne",
  "Knobs & switches": "Pokrętła i przełączniki",
  "Audio": "Audio",
  "Warnings": "Ostrzeżenia",
  "Schematic": "Schemat",
  "Nets": "Sieci",
  "Settings": "Ustawienia",
  "Tray": "Taca",
  "Suggest next": "Zaproponuj następny",
  "Hide parts": "Ukryj części",
  "Flip": "Odwróć",
  "Trim": "Przytnij",
  "Wire it for me": "Połącz za mnie",
  "Cuts": "Cięcia",
  "Links": "Zwory",
  "Expand": "Rozwiń",
  "Pin": "Przypnij",
  "Freeze": "Zamroź",
  "Layers": "Warstwy",
  "Clear snapshot": "Wyczyść migawkę",
  "Clear sweep": "Wyczyść przegląd",
  "Use as opening positions": "Ustaw jako pozycje początkowe",
  "Soft": "Łagodny",
  "Medium": "Średni",
  "Hard": "Mocny",
  "at": "na",
  "Before you build": "Przed budową",
  "net": "sieć",
  "in from guitar": "we. z gitary",
  "out to amp": "wy. do wzmacniacza",
  "Why:": "Dlaczego:",
  "Fix:": "Jak naprawić:",
  "A pedal's output should sit at 0 V DC. DC there reaches the amp (or the next pedal) and thumps whenever the pedal is switched in or out.":
    "Wyjście efektu powinno mieć 0 V DC. Napięcie stałe dociera do wzmacniacza (albo następnego efektu) i powoduje trzaski przy włączaniu i wyłączaniu.",
  "Add an output coupling capacitor before the output, with a resistor to ground after it (100k is common) so it can't charge up.":
    "Dodaj kondensator sprzęgający na wyjściu i rezystor do masy za nim (często 100 kΩ), żeby kondensator się nie ładował.",
  "Misc": "Różne",
  "Warning": "Ostrzeżenie",
  "Error": "Błąd",
  "Note": "Uwaga",
  "DC at the output": "Napięcie stałe na wyjściu",
  "No amp output": "Brak wyjścia wzmacniacza",
  "The circuit has no amp output, so its output isn't loaded the way an amp loads it.":
    "Obwód nie ma wyjścia wzmacniacza, więc jego wyjście nie jest obciążone tak jak we wzmacniaczu.",
  "Drag an Amp output in from the palette and wire it to the circuit's output.":
    "Przeciągnij wyjście wzmacniacza z palety i podłącz je do wyjścia obwodu.",
  "No guitar input": "Brak wejścia gitarowego",
  "The circuit has no guitar input, so there's no frequency response or waveform to show.":
    "Obwód nie ma wejścia gitarowego, więc nie ma charakterystyki częstotliwościowej ani przebiegu do pokazania.",
  "Drag a Guitar input in from the palette and wire it to the circuit's input.":
    "Przeciągnij wejście gitarowe z palety i podłącz je do wejścia obwodu.",
  "No enclosure chosen": "Nie wybrano obudowy",
  "No enclosure is chosen, so the parts list can't name one.":
    "Nie wybrano obudowy, więc lista części nie może jej podać.",
  "Pick one in File → Properties.": "Wybierz obudowę w Plik → Właściwości.",
  "Supply without a bulk capacitor": "Zasilanie bez kondensatora buforującego",
  "Add an electrolytic from": "Dodaj kondensator elektrolityczny od",
  "to ground (1 µF or more; the Rat uses 100 µF after a 47 Ω resistor, the Input filter block).":
    "do masy (1 µF lub więcej; Rat używa 100 µF za rezystorem 47 Ω, blok filtra wejściowego).",
  "No notes yet. + Note adds one; a block you drop adds its description as one.":
    "Brak notatek. + Notatka dodaje jedną; wstawiony blok dodaje swój opis.",
  "+ Note": "+ Notatka",
  "General": "Ogólne",
  "Parts & nets": "Części i sieci",

  // ---- komunikaty i podpowiedzi -------------------------------------------------
  "Drag parts in from the left. Wire tool: click to start, click to bend, click a pin to finish. Drag a ball to move a wire end. Click to probe, double-click to edit.":
    "Przeciągnij części z lewej. Narzędzie przewodu: kliknij, aby zacząć, kliknij, aby zgiąć, kliknij nóżkę, aby zakończyć. Przeciągnij kulkę, aby przesunąć koniec przewodu. Kliknij, aby sondować, dwuklik, aby edytować.",
  "The circuit changed since these results. Press Run (Ctrl+Enter), or turn on Auto-run.":
    "Obwód zmienił się od czasu tych wyników. Naciśnij Uruchom (Ctrl+Enter) albo włącz Auto-uruchamianie.",
  "The circuit couldn't be loaded into the simulator.":
    "Nie udało się wczytać obwodu do symulatora.",
  "Checked (the drawing only: the circuit wasn't simulated).":
    "Sprawdzono tylko rysunek: obwód nie został zasymulowany.",
  "No guitar input in this circuit, so there's DC only.":
    "W tym obwodzie nie ma wejścia gitarowego, więc dostępne jest tylko DC.",
  "There's no saved circuit called": "Nie ma zapisanego obwodu o nazwie",
  "Starters are read-only. Save this as a new circuit.":
    "Przykłady są tylko do odczytu. Zapisz ten obwód jako nowy.",
  "Starters can't be changed. File → Save as… makes a copy you can name.":
    "Przykładów nie można zmieniać. Plik → Zapisz jako… tworzy kopię, której możesz nadać nazwę.",
  "Core blocks can't be changed. Edit it from the Blocks dialog to make a copy.":
    "Bloków bazowych nie można zmieniać. Skopiuj go z okna Bloki.",
  "is a final version, so it's read-only. Unlock it in File → Properties first.":
    "jest wersją finalną, więc jest tylko do odczytu. Odblokuj ją w Plik → Właściwości.",
  "is a final version, so it's read-only. Unlock it in File → Properties, or File → Save as… makes a copy.":
    "jest wersją finalną, więc jest tylko do odczytu. Odblokuj ją w Plik → Właściwości albo użyj Plik → Zapisz jako…",
  "Do you want to save the changes to": "Czy zapisać zmiany w",
  "Your changes will be lost if you don't save them.":
    "Zmiany zostaną utracone, jeśli ich nie zapiszesz.",
  "Don't Save": "Nie zapisuj",
  "Cancel": "Anuluj",
  "Save": "Zapisz",
  "Close": "Zamknij",
  "Delete": "Usuń",
  "No circuit to open.": "Nie ma obwodu do otwarcia.",
  "Choose a file first.": "Najpierw wybierz plik.",
  "No block to insert.": "Nie ma bloku do wstawienia.",
  "Show the folder in Finder": "Pokaż folder w Finderze",
  "Search": "Szukaj",
  "Open first": "Otwórz pierwszy",
  "Nothing in the guide matches that.": "Nic w przewodniku nie pasuje.",
  "No readings": "Brak odczytów",
  "No frequency response: this circuit has no guitar input.":
    "Brak charakterystyki częstotliwościowej: ten obwód nie ma wejścia gitarowego.",
  "No waveform: this circuit has no guitar input.":
    "Brak przebiegu: ten obwód nie ma wejścia gitarowego.",
  "No harmonics without a waveform.": "Brak harmonicznych bez przebiegu.",
  "Measure all": "Zmierz wszystkie",
  "Click a tone to measure it.": "Kliknij ton, aby go zmierzyć.",
  "Add a guitar input to see the stages.":
    "Dodaj wejście gitarowe, aby zobaczyć stopnie.",
  "Średni pick": "Średnie uderzenie",
  "Łagodny pick": "Łagodne uderzenie",
  "Mocny pick": "Mocne uderzenie",
  "Properties": "Właściwości",
  "read-only": "tylko odczyt",
  "Tags": "Tagi",
  "Comma-separated, for search.": "Oddzielone przecinkami, do wyszukiwania.",
  "Description": "Opis",
  "Enclosure": "Obudowa",
  "not chosen yet": "jeszcze nie wybrano",
  "For the parts list; sizes outside, as sellers list them.":
    "Do listy części; wymiary zewnętrzne, tak jak podają sprzedawcy.",
  "Apply": "Zastosuj",
  "Kind": "Rodzaj",
  "Circuit": "Obwód",
  "Last saved": "Ostatni zapis",
  "never": "nigdy",
  "Status": "Stan",
  "built in (read-only)": "wbudowany (tylko odczyt)",
  "Unit converter": "Przelicznik jednostek",
  "Save as a new circuit": "Zapisz jako nowy obwód",
  "in My circuits": "w Moich obwodach",
  "Save as a new block": "Zapisz jako nowy blok",
  "in My blocks": "w Moich blokach",
  "Open": "Otwórz",
  "my circuits": "moje obwody",
  "Current only": "Tylko aktualne",
  "Nothing saved yet. Save a circuit and it shows up here.":
    "Nic jeszcze nie zapisano. Zapisz obwód, a pojawi się tutaj.",
  "Ref": "Oznaczenie",
  "Voltage": "Napięcie",
  "Drives its own net. V+ and V− come from Power.":
    "Napędza własną sieć. V+ i V− pochodzą z zasilania.",
  "Compare supply voltages, overlaid on the plots (up to 5)":
    "Porównaj napięcia zasilania na wykresach (do 5)",
  "Try": "Wypróbuj",
  "Export": "Eksport",
  "Checking the last save…": "Sprawdzam ostatni zapis…",
  "Save the circuit first: exports are made from the last save, so the package matches the file.":
    "Najpierw zapisz obwód: eksport powstaje z ostatniego zapisu, żeby paczka zgadzała się z plikiem.",
  "Blocks aren't exported on their own: place this one in a circuit and export that.":
    "Bloków nie eksportuje się osobno: wstaw blok do obwodu i wyeksportuj obwód.",
  "Schematic (SVG)": "Schemat (SVG)",
  "Schematic (PDF)": "Schemat (PDF)",
  "Stripboard (PDF)": "Płytka paskowa (PDF)",
  "Build package (zip)": "Paczka budowy (zip)",
  "My circuits": "Moje obwody",
  "Import": "Importuj",
  "a Solum Builder file (.json), not a netlist": "plik Solum Builder (.json), nie netlista",
  "Save it as": "Zapisz jako",
  "Search circuits": "Szukaj obwodów",
  "Delete": "Usuń",
  "Rename": "Zmień nazwę",
  "New sheet": "Nowy arkusz",
  "New from starter": "Nowy z przykładu",
  "Cancel": "Anuluj",
  "none": "brak",
  "None": "Brak",
  "Buffered": "Buforowane",
  "Input": "Wejście",
  "Output": "Wyjście",

  // ---- audio --------------------------------------------------------------------
  "Guitar": "Gitara",
  "Guitar volume": "Głośność gitary",
  "Guitar cable": "Kabel gitarowy",
  "Cable in": "Pojemność kabla wejściowego",
  "Cable out": "Pojemność kabla wyjściowego",
  "Dry": "Sygnał suchy",
  "Pedal": "Efekt",
  "Snapshot": "Migawka",
  "Keep as snapshot": "Zapisz jako migawkę",
  "Sweep": "Przegląd",
  "Render sweep": "Renderuj przegląd",
  "Spectrum": "Widmo",
  "What you hear": "Co słyszysz",
  "Pedal output": "Wyjście efektu",
  "Pedal (no clipping)": "Efekt (bez obcięcia)",
  "Playing now": "Teraz odtwarzane",
  "Loop": "Pętla",
  "Render": "Renderuj",
  "No clip": "Bez obcięcia",
  "Medium pick": "Średnie uderzenie",
  "Clean guitar": "Czysta gitara",
  "Amp": "Wzmacniacz",
  "Cab": "Kolumna",
  "NAM amp capture": "Model wzmacniacza NAM",
  "Cab IR": "Impuls kolumny (IR)",

  // ---- ustawienia, o programie, przelicznik ------------------------------------
  "SETTINGS": "USTAWIENIA",
  "Folders": "Foldery",
  "Circuits, blocks, models and audio": "Obwody, bloki, modele i audio",
  "To change it, set DATA_DIR (in .env or the environment), then restart.":
    "Aby zmienić, ustaw DATA_DIR (w .env lub środowisku) i uruchom ponownie.",
  "Cache": "Pamięć podręczna",
  "To change it, set CACHE_DIR (in .env or the environment), then restart.":
    "Aby zmienić, ustaw CACHE_DIR (w .env lub środowisku) i uruchom ponownie.",
  "Results are kept so the same run is instant the next time. When the cache is full the oldest go first; it is always safe to delete.":
    "Wyniki są przechowywane, żeby kolejne uruchomienie było natychmiastowe. Gdy pamięć się zapełni, najstarsze wpisy znikają pierwsze; można ją bezpiecznie usunąć.",
  "Largest size": "Maksymalny rozmiar",
  "GB": "GB",
  "Using": "Zajęte",
  "now.": "teraz.",
  "Appearance": "Wygląd",
  "Solum Builder's own colours: warm dark, brass highlights.":
    "Kolory Solum Builder: ciepła ciemność, mosiężne akcenty.",
  "Dark": "Ciemny",
  "Neutral greys, a blue highlight.": "Neutralne szarości, niebieski akcent.",
  "Light": "Jasny",
  "Dark text on white, a blue highlight.": "Ciemny tekst na białym, niebieski akcent.",
  "ABOUT SOLUM BUILDER": "O SOLUM BUILDER",
  "A circuit simulator for guitar-pedal builders: draw a circuit, probe any point, turn the knobs, check it against plain-English rules, and hear it through an amp model.":
    "Symulator obwodów dla konstruktorów efektów gitarowych: narysuj obwód, sondź dowolny punkt, kręć pokrętłami, sprawdź reguły i posłuchaj go przez model wzmacniacza.",
  "Version": "Wersja",
  "Simulator": "Symulator",
  "Source": "Źródło",
  "Built on ngspice (simulation), uPlot (plots) and the Fahkwang typeface. The classic circuits follow published analyses (ElectroSmash, Aion FX and others), each cited in its file.":
    "Zbudowano na ngspice (symulacja), uPlot (wykresy) i czcionce Fahkwang. Klasyczne obwody pochodzą z publikowanych analiz (ElectroSmash, Aion FX i inne), cytowanych w plikach.",
  "UNIT CONVERTER": "PRZELICZNIK JEDNOSTEK",
  "Type a value the way it's written on a schematic (22n, 4k7, 2M2) or in plain numbers (0.000000022, 4700). On a capacitor, you can also type the code printed on it.":
    "Wpisz wartość tak, jak na schemacie (22n, 4k7, 2M2) albo jako liczbę (0.000000022, 4700). Dla kondensatora możesz też podać kod nadrukowany na obudowie.",
  "Quantity": "Wielkość",
  "Capacitance (F)": "Pojemność (F)",
  "Resistance (Ω)": "Rezystancja (Ω)",
  "Inductance (H)": "Indukcyjność (H)",
  "Frequency (Hz)": "Częstotliwość (Hz)",
  "Voltage (V)": "Napięcie (V)",
  "Current (A)": "Prąd (A)",
  "Time (s)": "Czas (s)",
  "Value": "Wartość",
  "Code on the part": "Kod na części",

  // ---- skróty klawiszowe: nagłówki ---------------------------------------------
  "HOT KEYS": "SKRÓTY KLAWISZOWE",
  "On a Mac, ⌘ works wherever Ctrl is shown. Keys typed into a box are the box's, not shortcuts.":
    "Na Macu ⌘ działa wszędzie tam, gdzie pokazano Ctrl. Klawisze wpisane w polu tekstowym należą do pola, nie do skrótów.",
  "Drawing": "Rysowanie",
  "Parts (press, then click where it goes)": "Części (naciśnij, potem kliknij miejsce)",
  "Editing": "Edycja",
  "Side panes (either view)": "Panele boczne (w obu widokach)",
  "Mouse on the sheet": "Mysz na schemacie",
  "On the board": "Na płytce",
  "Elsewhere": "Gdzie indziej",
}));

/** Wzorce dla napisów z danymi. Kolejność ma znaczenie: pierwszy pasujący wygrywa. */
const RULES = [
  [/^Saved (.+) \(v([\d.]+)\)\.$/, "Zapisano $1 (v$2)."],
  [/^Renamed to (.+)\.$/, "Zmieniono nazwę na $1."],
  [/^Imported (.+) into (.+)\.$/, "Zaimportowano $1 do $2."],
  [/^Deleted (.+)\.$/, "Usunięto $1."],
  [/^Do you want to save the changes to “(.+)”\?$/, "Czy zapisać zmiany w „$1”?"],
  [/^(.+): keep the changes\?$/, "$1: zachować zmiany?"],
  [/^Delete the (circuit|block) “(.+)” \(v([\d.]+)\)\?$/, "Usunąć $1 „$2” (v$3)?"],
  [/^Delete the (circuit|block) “(.+)”\?$/, "Usunąć $1 „$2”?"],
  [/^(.+) is a final version, so it's read-only.*$/, "$1 jest wersją finalną, więc jest tylko do odczytu."],
  [/^(\d+) warnings?$/, (_, n) => `${n} ${plural(n, "ostrzeżenie", "ostrzeżenia", "ostrzeżeń")}`],
  [/^(\d+) notes?$/, (_, n) => `${n} ${plural(n, "notatka", "notatki", "notatek")}`],
  [/^(\d+) errors?$/, (_, n) => `${n} ${plural(n, "błąd", "błędy", "błędów")}`],
  [/^(\d+) problems?$/, (_, n) => `${n} ${plural(n, "problem", "problemy", "problemów")}`],
  [/^(\d+) parts?$/, (_, n) => `${n} ${plural(n, "część", "części", "części")}`],
  [/^· (\d+) warnings?, (\d+) notes?$/, (_, w, n) => `· ${w} ${plural(w, "ostrzeżenie", "ostrzeżenia", "ostrzeżeń")}, ${n} ${plural(n, "notatka", "notatki", "notatek")}`],
  [/^· (\d+) warnings?$/, (_, n) => `· ${n} ${plural(n, "ostrzeżenie", "ostrzeżenia", "ostrzeżeń")}`],
  [/^· (\d+) errors?$/, (_, n) => `· ${n} ${plural(n, "błąd", "błędy", "błędów")}`],
  [/^· (\d+) notes?$/, (_, n) => `· ${n} ${plural(n, "notatka", "notatki", "notatek")}`],
  [/^(\d+) warnings?, (\d+) notes?$/, (_, w, n) => `${w} ${plural(w, "ostrzeżenie", "ostrzeżenia", "ostrzeżeń")}, ${n} ${plural(n, "notatka", "notatki", "notatek")}`],
  [/^Parts & nets \((\d+)\)$/, "Części i sieci ($1)"],
  [/^Before you build · (\d+)$/, "Przed budową · $1"],
  [/^The output \((.+)\) sits at ([\d.]+) V DC\.$/, "Wyjście ($1) ma $2 V DC."],
  [/^(.+) powers (.+) but has no bulk capacitor to ground\.$/, "$1 zasila $2, ale nie ma kondensatora buforującego do masy."],
  [/^Add an electrolytic from (.+) to ground \(1 µF or more.*$/, "Dodaj kondensator elektrolityczny od $1 do masy (1 µF lub więcej)."],
];

/** Polska liczba mnoga: 1 ostrzeżenie, 2 ostrzeżenia, 5 ostrzeżeń. */
function plural(n, one, few, many) {
  const k = Number(n);
  if (k === 1) return one;
  const mod10 = k % 10;
  const mod100 = k % 100;
  if (mod10 >= 2 && mod10 <= 4 && !(mod100 >= 12 && mod100 <= 14)) return few;
  return many;
}

const ATTRS = ["title", "aria-label", "placeholder", "alt"];
const SKIP = new Set(["SCRIPT", "STYLE", "CODE", "PRE", "TEXTAREA", "SVG", "PATH", "G", "TEXT"]);

/** @param {string} text @returns {string} */
function translate(text) {
  if (!text) return text;
  const leading = text.match(/^\s*/)?.[0] ?? "";
  const trailing = text.match(/\s*$/)?.[0] ?? "";
  const core = text.trim();
  if (!core) return text;
  const exact = PL.get(core);
  if (exact) return leading + exact + trailing;
  for (const [pattern, replacement] of RULES) {
    if (pattern.test(core)) {
      return leading + core.replace(pattern, /** @type {any} */ (replacement)) + trailing;
    }
  }
  return text;
}

/** @param {Node} node */
function translateTextNode(node) {
  const parent = node.parentElement;
  if (!parent || SKIP.has(parent.tagName) || parent.closest("svg, code, pre, textarea, [contenteditable='true']")) return;
  const next = translate(/** @type {string} */ (node.nodeValue));
  if (next !== node.nodeValue) node.nodeValue = next;
}

/** @param {Element} element */
function translateAttributes(element) {
  for (const name of ATTRS) {
    const value = element.getAttribute(name);
    if (!value) continue;
    const next = translate(value);
    if (next !== value) element.setAttribute(name, next);
  }
}

/** @param {Node} root */
function walk(root) {
  if (root.nodeType === Node.TEXT_NODE) {
    translateTextNode(root);
    return;
  }
  if (!(root instanceof Element)) return;
  if (root.tagName === "SCRIPT" || root.tagName === "STYLE") return;
  translateAttributes(root);
  for (const child of root.childNodes) walk(child);
}

let started = false;

/** Uruchom tłumaczenie i pilnuj elementów dodawanych później. */
export function startPolish() {
  if (started) return;
  started = true;
  document.documentElement.lang = "pl";
  walk(document.body);
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === "characterData") {
        translateTextNode(mutation.target);
      } else if (mutation.type === "attributes") {
        if (mutation.target instanceof Element) translateAttributes(mutation.target);
      } else {
        for (const node of mutation.addedNodes) walk(node);
      }
    }
    if (document.title) {
      const title = translate(document.title);
      if (title !== document.title) document.title = title;
    }
  });
  observer.observe(document.body, {
    subtree: true,
    childList: true,
    characterData: true,
    attributes: true,
    attributeFilter: ATTRS,
  });
  const title = translate(document.title);
  if (title !== document.title) document.title = title;
}

startPolish();
