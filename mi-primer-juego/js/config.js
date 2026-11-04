// Constantes globales del juego
const W = 800, H = 640;
const T = 64, COLS = 11, ROWS = 8;
const HUD_H = 76;

const COLORS = {
    bg: 0x140b18, panel: 0x24142c, plum: 0x3a1f47,
    red: 0xb3123a, lime: 0x9fd356, neon: 0xff1f3d, bone: 0xefe3c8
};
const FONT_TITLE = '"Creepster", "Impact", cursive';
const FONT_BODY = '"Rubik", "Segoe UI", sans-serif';

// Leyenda: # obstáculo, P payaso, V víctima, S víctima sobria (huye si el asesino se para a su lado), F aparición de la víctima final, . piso
// intro: cartel que explica una mecánica nueva al entrar al nivel
// victimTex: dibujo de cada víctima en orden de lectura del mapa (sin repetir dentro del nivel); finalTex: la víctima final
// Todos los niveles se verificaron con un solver: "par" es la solución mínima para eliminar a las víctimas,
// "maxMoves" es el límite (par + 2; par + 4 en el mundo de Jason) y "finalMoves" alcanza para atrapar a la víctima final desde
// cualquier casilla donde pueda terminar el payaso. La dificultad sube con cada nivel.
const LEVELS = [
    {
        name: 'Late-Night Food',
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
        ],
        // Escenario: local de comida rápida con cocina (k) y un baño sucio (b) en la esquina inferior izquierda.
        // Cada obstáculo (#) del mapa tiene aquí su objeto; ver THEMES más abajo.
        theme: 'fastfood',
        victimTex: ['victimA', 'victimB', 'victimC'],
        decor: [
            '.....D..kkk',
            '........Gkk',
            '.......Rkkk',
            '.......Ckkk',
            '.....M.....',
            'WWW...M..X.',
            'bbb....S...',
            'bTLON..S...'
        ],
        // Tabique del baño: borde izquierdo de la columna 3, filas 5 a 7, con la puerta en la fila 6.
        // Solo es dibujo: las casillas a ambos lados de las partes cerradas ya son obstáculos.
        partitions: [{ c: 3, r0: 5, r1: 7, door: 6 }],
        // Pintada en la pared del baño, en lugar del letrero (fila 5, columnas 0 a 2)
        graffiti: { r: 5, c0: 0, c1: 2, text: 'ART WAS HERE' }
    },
    {
        name: 'Clown Cafe',
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
        ],
        // Escenario: parque infantil de noche (pasto) con el food truck "Clown Cafe" sobre una losa (c)
        theme: 'park',
        victimTex: ['victimD', 'victimE', 'victimF', 'victimG'],
        decor: [
            '......A....',
            '......B....',
            '.E.H.I..Q..',
            '....cccK...',
            '....cYZc...',
            '..J.cUcc...',
            '......F....',
            '....P..V..I'
        ]
    },
    {
        name: 'Locker Room',
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
        ],
        // Escenario: vestidor de gimnasio de preparatoria, con las regaderas (s) abajo a la derecha
        theme: 'locker',
        // Dibujo de cada víctima en orden de lectura del mapa, y de la víctima final
        victimTex: ['victimA', 'victimB', 'victimC', 'finalGirl'],
        finalTex: 'victimH',
        // Pareja abajo a la derecha (el chico y la chica del vestido rosa): corazones en vez de notas
        lovers: [{ r: 6, c: 9 }, { r: 7, c: 10 }],
        decor: [
            'T...L....F.',
            '....LML....',
            '........H.R',
            '.LM......U.',
            '.L.......D.',
            '...........',
            'E...C.sWWss',
            '...X..SSSss'
        ]
    },
    {
        name: 'Silent Night Mall',
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
        ],
        // Escenario: centro comercial moderno decorado de Navidad; el sillón de Santa y el árbol están sobre la alfombra roja (r)
        theme: 'xmas',
        // Art vestido de Santa y víctimas con gorritos navideños
        killerTex: 'artSanta',
        victimTex: ['victimA_santa', 'victimB_elf', 'victimC_antlers', 'victimD_beanie', 'victimH_tree'],
        finalTex: 'finalGirl_bow',
        decor: [
            '......TCG..',
            '..E..rrrr..',
            '..F.PrXSr..',
            '...B.rrrK.L',
            'A..........',
            '........N.U',
            '...........',
            '..Q.H......'
        ]
    },
    {
        name: 'The Grand Finale',
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
        ],
        // Escenario: carpa de circo abandonada (horror), con la pista (r) en el centro
        theme: 'circus',
        victimTex: ['victimE', 'victimF', 'victimG', 'victimH', 'victimI'],
        decor: [
            '..WW....W..',
            '....D.D....',
            '........C..',
            '.GZ...NZ..B',
            '..IrrrLr.A.',
            '..JrDrrr...',
            'SZ.rrrrrO..',
            '..KZ..Y.T..'
        ]
    }
];

// Mundo 2: Jason. Su habilidad (Espacio) hace aparecer la cabeza de su madre, que marca
// los siguientes 5 pasos de la mejor ruta; por eso los niveles son más largos y dan 4 movimientos de margen.
const JASON_LEVELS = [
    {
        name: 'Camp Crystal Lake',
        par: 30,
        maxMoves: 34,
        finalMoves: 4,
        map: [
            '.#.....#.F#',
            '##....##P.V',
            '..##....V..',
            '..........#',
            '.#.#....#..',
            '....#.V#...',
            '#V..#..#.#V',
            'V..#.#.#...'
        ],
        // Escenario: campamento junto al lago de noche, con niebla; el arroyo (W) baja por la columna 7
        theme: 'camp',
        victimTex: ['victimG', 'victimA', 'victimH', 'victimC', 'victimI', 'victimB'],
        decor: [
            '.P.....P..S',
            'PP....KZ...',
            '..CZ.......',
            '..........O',
            '.B.R....F..',
            '....L..W...',
            'P...A..W.R.',
            '...T.N.W...'
        ]
    },
    {
        name: 'Party at the Lake',
        // Sin la huida de las sobrias (S) el nivel no tiene solución: hay que usarla. Margen de 3 movimientos.
        par: 28,
        maxMoves: 31,
        finalMoves: 4,
        map: [
            'F##...#..#.',
            '...#..V..#.',
            '....#..#VP#',
            '.....V..#..',
            '..#.#..S...',
            '#...#....#.',
            'S..#...#...',
            '..#..V.V.#.'
        ],
        theme: 'camp',
        victimTex: ['victimD', 'victimE', 'victimF', 'victimH', 'victimC', 'victimG', 'victimI'],
        decor: [
            '.CZ...P..W.',
            '...R.....W.',
            '....F..X..O',
            '........L..',
            '..B.A......',
            'P...Q....R.',
            '...P...B...',
            '..S......P.'
        ],
        intro: {
            title: 'Sober victims',
            lines: [
                'Victims without music notes are sober.',
                'If the killer stops right next to one, they run',
                'in a straight line away from him until',
                'something blocks their way.',
                'Use it to drive them within reach!'
            ]
        }
    }
];

// Decorados por tema. En cada uno: letra de obstáculo -> textura y zona de piso que va debajo
// ('.' es el piso normal del tema); "floors" da los dos pisos alternos de cada zona.
// Opcionales: w (ancho en casillas), glow (resplandor que late; true = calor naranja, o un color), flicker (zona con luz que parpadea),
// festive (guirnaldas, coronas y nieve alrededor del tablero), spooky (banderines rotos, focos fundidos y un reflector),
// foggy (niebla que cruza el tablero y luciérnagas).
const THEMES = {
    fastfood: {
        floors: { '.': ['ffFloorA', 'ffFloorB'], k: ['ffKitchen', 'ffKitchen'], b: ['bathFloorA', 'bathFloorB'] },
        flicker: { zone: 'b', color: 0x9fd356 },
        obstacles: {
            D: { tex: 'ffSoda', floor: '.' }, G: { tex: 'ffFryer', floor: 'k', glow: true }, R: { tex: 'ffRegister', floor: '.' },
            C: { tex: 'ffCounter', floor: '.' }, M: { tex: 'ffTable', floor: '.' }, X: { tex: 'ffTrash', floor: '.' },
            S: { tex: 'ffBooth', floor: '.' }, W: { tex: 'bathWall', floor: 'b' },
            T: { tex: 'bathToilet', floor: 'b' }, L: { tex: 'bathSink', floor: 'b' },
            O: { tex: 'ffMop', floor: '.' }, N: { tex: 'ffCondiments', floor: '.' }
        }
    },
    park: {
        floors: { '.': ['parkGrassA', 'parkGrassB'], c: ['parkSlabA', 'parkSlabB'] },
        obstacles: {
            A: { tex: 'parkSwingTop', floor: '.' }, B: { tex: 'parkSwingBot', floor: '.' }, E: { tex: 'parkBench', floor: '.' },
            H: { tex: 'parkSpring', floor: '.' }, I: { tex: 'parkTree', floor: '.' }, J: { tex: 'parkMerry', floor: '.' },
            K: { tex: 'parkSlide', floor: '.' }, Q: { tex: 'parkTrash', floor: '.' }, U: { tex: 'parkPicnic', floor: 'c' },
            F: { tex: 'parkSeesaw', floor: '.' }, P: { tex: 'parkSandbox', floor: '.' }, V: { tex: 'parkBush', floor: '.' },
            // Y es el food truck de 2 casillas; Z es su mitad derecha, ya dibujada
            Y: { tex: 'foodTruck', floor: 'c', w: 2 }, Z: { tex: null, floor: 'c' }
        }
    },
    locker: {
        floors: { '.': ['lrFloorA', 'lrFloorB'], s: ['lrShowerA', 'lrShowerB'] },
        flicker: { zone: 's', color: 0xbfe6ff },
        obstacles: {
            L: { tex: 'lrLocker', floor: '.' }, M: { tex: 'lrLockerOpen', floor: '.' },
            U: { tex: 'lrBenchTop', floor: '.' }, D: { tex: 'lrBenchBot', floor: '.' },
            F: { tex: 'lrFountain', floor: '.' }, H: { tex: 'lrHamper', floor: '.' }, R: { tex: 'lrBallRack', floor: '.' },
            T: { tex: 'lrTowels', floor: '.' }, E: { tex: 'lrScale', floor: '.' }, C: { tex: 'lrBags', floor: '.' },
            X: { tex: 'lrTrash', floor: '.' }, S: { tex: 'lrShower', floor: 's' }, W: { tex: 'lrTileWall', floor: 's' }
        }
    },
    xmas: {
        floors: { '.': ['xmFloorA', 'xmFloorB'], r: ['xmCarpetA', 'xmCarpetB'] },
        festive: true,
        obstacles: {
            T: { tex: 'xmShopFashion', floor: '.' }, C: { tex: 'xmShopTech', floor: '.' }, G: { tex: 'xmShopShoes', floor: '.' },
            E: { tex: 'xmInfoTop', floor: '.' }, F: { tex: 'xmInfoBot', floor: '.' }, P: { tex: 'xmDirectory', floor: '.' },
            X: { tex: 'xmTree', floor: 'r', glow: 0xffd8e0 }, S: { tex: 'xmSanta', floor: 'r' }, B: { tex: 'xmBench', floor: '.' },
            K: { tex: 'xmAdColumn', floor: 'r' }, L: { tex: 'xmPlanter', floor: '.' }, A: { tex: 'xmKiosk', floor: '.' },
            N: { tex: 'xmCoffee', floor: '.' }, U: { tex: 'xmATM', floor: '.' }, Q: { tex: 'xmRecycle', floor: '.' },
            H: { tex: 'xmClaw', floor: '.' }
        }
    },
    circus: {
        floors: { '.': ['ccFloorA', 'ccFloorB'], r: ['ccRingA', 'ccRingB'] },
        spooky: true,
        obstacles: {
            W: { tex: 'ccTentWall', floor: '.' }, D: { tex: 'ccDrum', floor: '.' }, C: { tex: 'ccCrate', floor: '.' },
            G: { tex: 'ccCage', floor: '.', w: 2 }, N: { tex: 'ccKnifeBoard', floor: '.', w: 2 }, B: { tex: 'ccBarrels', floor: '.' },
            I: { tex: 'ccPoleTop', floor: '.' }, J: { tex: 'ccPoleBot', floor: '.' }, L: { tex: 'ccDoll', floor: 'r' },
            A: { tex: 'ccBalloons', floor: '.' }, S: { tex: 'ccBleachers', floor: '.', w: 2 }, O: { tex: 'ccPopcorn', floor: '.' },
            K: { tex: 'ccClownCar', floor: '.', w: 2 }, Y: { tex: 'ccHay', floor: '.' }, T: { tex: 'ccTrunk', floor: '.' },
            // Z es la mitad derecha de un objeto de 2 casillas, ya dibujada
            Z: { tex: null, floor: '.' }
        }
    },
    camp: {
        floors: { '.': ['cmDirtA', 'cmDirtB'] },
        foggy: true,
        obstacles: {
            P: { tex: 'cmPine', floor: '.' }, S: { tex: 'cmSign', floor: '.' }, K: { tex: 'cmCabin', floor: '.', w: 2, glow: 0xd8a83a },
            C: { tex: 'cmCanoe', floor: '.', w: 2 }, O: { tex: 'cmOuthouse', floor: '.' }, B: { tex: 'cmBush', floor: '.' },
            R: { tex: 'cmRock', floor: '.' }, F: { tex: 'cmFire', floor: '.', glow: true }, L: { tex: 'cmLogs', floor: '.' },
            W: { tex: 'cmWater', floor: '.' }, A: { tex: 'cmStumpAxe', floor: '.' }, T: { tex: 'cmStump', floor: '.' },
            N: { tex: 'cmTent', floor: '.' }, Q: { tex: 'cmCooler', floor: '.' }, X: { tex: 'cmBoombox', floor: '.' },
            Z: { tex: null, floor: '.' }
        }
    }
};

// Mundos: cada uno tiene su propio asesino y 5 niveles. Un mundo sin niveles se muestra como "Coming soon".
// planned: casillas de nivel que se muestran aunque todavía no existan; ability y hints: habilidad del asesino y usos por nivel.
const WORLDS = [
    { name: 'Art, the Killer Clown', killerTex: 'clown', levels: LEVELS },
    { name: "Jason, Mommy's Good Boy", killerTex: 'jason', ability: 'mom', hints: 3, planned: 5, levels: JASON_LEVELS }
];

// Dificultad del minijuego de precisión: ancho de zona por ronda y velocidad de la aguja
const DIFFICULTY = {
    facil:   { label: 'Easy',    zones: [120, 95, 75], speed: 260 },
    normal:  { label: 'Normal',  zones: [90, 66, 48],  speed: 360 },
    dificil: { label: 'Hard',    zones: [70, 48, 32],  speed: 470 }
};

// Ajustes persistentes
const Store = {
    key: 'risas-macabras',
    load() { try { return JSON.parse(localStorage.getItem(this.key) || '{}'); } catch (e) { return {}; } },
    save(o) { try { localStorage.setItem(this.key, JSON.stringify(o)); } catch (e) { /* sin almacenamiento */ } }
};
const GameSettings = Object.assign({ sound: true, difficulty: 'normal', grid: false, best: 0, progress: {}, stars: {}, lastPlayed: null }, Store.load());
function saveSettings() { Store.save(GameSettings); }

// Progreso por mundo: niveles desbloqueados (al menos el primero) y mejores estrellas de cada nivel
// Un mundo se abre al superar el último nivel del anterior
function worldUnlocked(w) { return w === 0 || (GameSettings.progress[w - 1] || 1) > WORLDS[w - 1].levels.length; }
function unlockedLevels(w) { return worldUnlocked(w) ? Math.min(WORLDS[w].levels.length, GameSettings.progress[w] || 1) : 0; }
// Último nivel jugado (no el último desbloqueado), si todavía existe en la lista de mundos
function lastPlayedLevel() {
    const p = GameSettings.lastPlayed;
    return p && WORLDS[p.world] && WORLDS[p.world].levels[p.level] ? p : null;
}
function levelStars(w, l) { return GameSettings.stars[`${w}-${l}`] || 0; }
function recordLevelResult(w, l, stars) {
    GameSettings.progress[w] = Math.max(GameSettings.progress[w] || 1, l + 2);
    const k = `${w}-${l}`;
    GameSettings.stars[k] = Math.max(GameSettings.stars[k] || 0, stars);
    saveSettings();
}
