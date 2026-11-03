// Constantes globales del juego
const W = 800, H = 640;
const T = 64, COLS = 11, ROWS = 8;
const HUD_H = 76;

const COLORS = {
    bg: 0x140b18, panel: 0x24142c, plum: 0x3a1f47,
    red: 0xb3123a, lime: 0x9fd356, mustard: 0xf2c14e, bone: 0xefe3c8
};
const FONT_TITLE = '"Creepster", "Impact", cursive';
const FONT_BODY = '"Rubik", "Segoe UI", sans-serif';

// Leyenda: # obstáculo, P payaso, V víctima, F aparición de la víctima final, . piso
// Todos los niveles se verificaron con un solver: "par" es la solución mínima para eliminar a las víctimas,
// "maxMoves" es el límite (par + 2) y "finalMoves" alcanza para atrapar a la víctima final desde
// cualquier casilla donde pueda terminar el payaso. La dificultad sube con cada nivel.
const LEVELS = [
    {
        name: 'Noche en la feria',
        par: 13,
        maxMoves: 15,
        finalMoves: 4,
        finalAlt: [{ r: 7, c: 10 }, { r: 5, c: 10 }],
        map: [
            '...V.#.....',
            '........#..',
            '.......#...',
            '.......#...',
            '.....#...V.',
            '###...#..#.',
            'V......#..F',
            'P####..#...'
        ]
    },
    {
        name: 'La casa de los espejos',
        par: 15,
        maxMoves: 17,
        finalMoves: 4,
        map: [
            '....V.#F...',
            '......#....',
            '.#.#.#..#..',
            'P......#...',
            '.....##....',
            '..#V.#.....',
            '....V.#V...',
            '....#..#..#'
        ]
    },
    {
        name: 'El tren fantasma',
        par: 18,
        maxMoves: 20,
        finalMoves: 4,
        map: [
            '#...#P...#.',
            '....###..V.',
            '........#.#',
            '.##......#.',
            '.#...V...#.',
            'F..........',
            '#...#..##V.',
            '...#..###.V'
        ]
    },
    {
        name: 'Carpa de las sombras',
        par: 20,
        maxMoves: 22,
        finalMoves: 5,
        map: [
            '......###..',
            '..#.......V',
            '.V#.#.##...',
            '...#V...#V#',
            '#.V......P.',
            '........#.#',
            '...........',
            'F.#.#......'
        ]
    },
    {
        name: 'El gran final',
        par: 25,
        maxMoves: 27,
        finalMoves: 4,
        map: [
            '..##....#..',
            '....#P#....',
            '..V...VF#.V',
            '.##...##..#',
            '..#...#..#.',
            'V.#.#.....V',
            '##......#..',
            '..##..#.#..'
        ]
    }
];

// Dificultad del minijuego de precisión: ancho de zona por ronda y velocidad de la aguja
const DIFFICULTY = {
    facil:   { label: 'Fácil',   zones: [120, 95, 75], speed: 260 },
    normal:  { label: 'Normal',  zones: [90, 66, 48],  speed: 360 },
    dificil: { label: 'Difícil', zones: [70, 48, 32],  speed: 470 }
};

// Ajustes persistentes
const Store = {
    key: 'risas-macabras',
    load() { try { return JSON.parse(localStorage.getItem(this.key) || '{}'); } catch (e) { return {}; } },
    save(o) { try { localStorage.setItem(this.key, JSON.stringify(o)); } catch (e) { /* sin almacenamiento */ } }
};
const GameSettings = Object.assign({ sound: true, difficulty: 'normal', grid: false, best: 0 }, Store.load());
function saveSettings() { Store.save(GameSettings); }
