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
// Nivel verificado con un solver: solución mínima de 13 movimientos.
const LEVEL = {
    name: 'Noche en la feria',
    par: 13,
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
};

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
