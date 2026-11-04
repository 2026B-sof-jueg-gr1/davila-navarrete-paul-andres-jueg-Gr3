const DIRS = {
    up: { dr: -1, dc: 0 }, down: { dr: 1, dc: 0 },
    left: { dr: 0, dc: -1 }, right: { dr: 0, dc: 1 }
};

class GameScene extends Phaser.Scene {
    constructor() { super('Game'); }

    create(data) {
        generateTextures(this);
        this.worldIndex = (data && data.world) || 0;
        this.levelIndex = (data && data.level) || 0;
        this.world = WORLDS[this.worldIndex];
        this.lv = this.world.levels[this.levelIndex];
        // Recordar el último nivel jugado para "Continue"
        GameSettings.lastPlayed = { world: this.worldIndex, level: this.levelIndex };
        saveSettings();
        this.ox = (W - COLS * T) / 2;
        this.oy = HUD_H;
        this.phase = 'hunt';        // hunt -> final -> minigame -> done
        this.busy = false;
        this.moves = 0;
        this.kills = 0;
        this.history = [];
        this.final = null;
        this.mg = null;
        this.momLeft = this.world.ability === 'mom' ? this.world.hints : 0;
        this.hint = null;
        this.hintObjs = [];
        // La escena se reutiliza entre niveles: no arrastrar objetos destruidos del nivel anterior
        this.momText = null;
        this.momHead = null;
        this.momLine = null;

        this.parseLevel();
        this.drawBoard();
        this.createActors();
        this.createHud();
        this.setupInput();
        this.add.image(W / 2, H / 2, 'vignette').setDepth(40);
        const momTip = () => { if (this.momLeft) this.momSays('Press Space, Jason. Mommy will guide you.'); };
        if (this.lv.intro) this.busy = true;
        this.showBanner(`Level ${this.worldIndex + 1}-${this.levelIndex + 1}: ${this.lv.name}`,
            `Eliminate all ${this.victims.length} victims in ${this.lv.maxMoves} moves`, 1500,
            this.lv.intro ? () => this.showIntro(this.lv.intro, momTip) : null);
        if (!this.lv.intro) this.time.delayedCall(2000, momTip);
    }

    // ---------- Nivel ----------
    parseLevel() {
        this.walls = new Set();
        this.victims = [];
        const kinds = this.lv.victimTex ||
            ['victimA', 'victimB', 'victimC', 'victimD', 'victimE', 'victimF', 'victimG', 'victimH', 'victimI'];
        this.lv.map.forEach((row, r) => [...row].forEach((ch, c) => {
            if (ch === '#') this.walls.add(`${r},${c}`);
            if (ch === 'V' || ch === 'S') this.victims.push({ r, c, alive: true, sober: ch === 'S', tex: kinds[this.victims.length % kinds.length] });
            if (ch === 'P') { this.pr = r; this.pc = c; }
            if (ch === 'F') this.finalSpawn = { r, c };
        }));
    }

    // Origen vertical de un personaje: los pies quedan igual aunque la textura tenga espacio extra arriba (gorros)
    charOriginY(tex) {
        const h = this.textures.get(tex).getSourceImage().height;
        return (0.56 * 170 + h - 170) / h;
    }

    cx(c) { return this.ox + c * T + T / 2; }
    cy(r) { return this.oy + r * T + T / 2; }
    isWall(r, c) { return r < 0 || r >= ROWS || c < 0 || c >= COLS || this.walls.has(`${r},${c}`); }

    targetAt(r, c) {
        const v = this.victims.find(v => v.alive && v.r === r && v.c === c);
        if (v) return v;
        if (this.final && this.final.alive && this.final.r === r && this.final.c === c) return this.final;
        return null;
    }

    drawBoard() {
        this.cameras.main.setBackgroundColor(COLORS.bg);
        const frame = this.add.graphics();
        frame.fillStyle(0x000000, 0.5);
        frame.fillRect(this.ox - 8, this.oy - 8, COLS * T + 16, ROWS * T + 16);
        frame.lineStyle(3, COLORS.red);
        frame.strokeRect(this.ox - 6, this.oy - 6, COLS * T + 12, ROWS * T + 12);

        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                const wall = this.walls.has(`${r},${c}`);
                const th = this.lv.decor && THEMES[this.lv.theme];
                if (th) {
                    // Nivel con decorado: cada obstáculo es un objeto del escenario
                    const d = this.lv.decor[r][c];
                    const ob = wall && th.obstacles[d];
                    const floors = th.floors[ob ? ob.floor : d] || th.floors['.'];
                    this.add.image(this.cx(c), this.cy(r), floors[(r + c) % 2]);
                    // Los objetos de varias casillas (w) se centran sobre todas ellas
                    if (ob && ob.tex) this.add.image(this.cx(c) + ((ob.w || 1) - 1) * T / 2, this.cy(r), ob.tex).setDepth(2);
                    // Resplandor que late alrededor de algunos obstáculos (calor de la freidora, luces del árbol)
                    if (ob && ob.glow) {
                        const heat = this.add.image(this.cx(c), this.cy(r), 'light').setDepth(1)
                            .setBlendMode(Phaser.BlendModes.ADD).setScale(0.55).setTint(ob.glow === true ? 0xff5a1a : ob.glow);
                        this.tweens.add({ targets: heat, alpha: 0.45, scale: 0.6, duration: 500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
                    }
                    continue;
                }
                this.add.image(this.cx(c), this.cy(r), (r + c) % 2 ? 'floorB' : 'floorA');
                if (wall) {
                    this.add.image(this.cx(c), this.cy(r), (r * 7 + c * 3) % 3 === 0 ? 'crate' : 'wall').setDepth(2);
                }
            }
        }
        // Tabiques delgados entre casillas, con una puerta abierta
        (this.lv.partitions || []).forEach(p => {
            const g = this.add.graphics().setDepth(4);
            const x = this.ox + p.c * T;
            for (let r = p.r0; r <= p.r1; r++) {
                const y = this.oy + r * T;
                if (r === p.door) {
                    // Marco de la puerta y hoja abierta hacia dentro del baño
                    g.fillStyle(0x2a2d26); g.fillRect(x - 5, y, 10, 6); g.fillRect(x - 5, y + T - 6, 10, 6);
                    g.fillStyle(0x6a4a2a); g.fillRect(x - 4 - (T - 10), y + 1, T - 10, 5);
                    g.lineStyle(2, 0x140a0c); g.strokeRect(x - 4 - (T - 10), y + 1, T - 10, 5);
                    g.fillStyle(0x9aa2aa); g.fillCircle(x - T + 12, y + 3.5, 2);
                    continue;
                }
                g.fillStyle(0xb4baa9); g.fillRect(x - 4, y, 8, T);
                g.fillStyle(0x5a4a1a, 0.45); g.fillRect(x - 4, y + T * 0.6, 8, T * 0.4);
                g.lineStyle(2, 0x140a0c); g.strokeRect(x - 4, y, 8, T);
            }
        });
        // Pintada embarrada en la pared (cafe, como escrita con la mano)
        const gr = this.lv.graffiti;
        if (gr) {
            const x = this.ox + (gr.c0 + gr.c1 + 1) * T / 2, y = this.oy + gr.r * T + T / 2 - 2;
            const style = { fontFamily: FONT_TITLE, fontSize: '26px', color: '#3e200a' };
            this.add.text(x + 1.5, y + 2, gr.text, style).setOrigin(0.5).setAlpha(0.45).setAngle(-3).setDepth(3);
            const t = this.add.text(x, y, gr.text, style).setOrigin(0.5).setAlpha(0.92).setAngle(-3).setDepth(3);
            const b = t.getBounds(), g = this.add.graphics().setDepth(3);
            g.fillStyle(0x3e200a, 0.85);
            [0.08, 0.27, 0.46, 0.63, 0.86].forEach((f, i) => {
                const dx = b.left + b.width * f, len = 4 + (i * 5) % 9;
                g.fillRect(dx, b.bottom - 5 - f * 3, 2, len); g.fillCircle(dx + 1, b.bottom - 5 - f * 3 + len, 1.6);
            });
            g.fillStyle(0x5a3416, 0.35);
            g.fillEllipse(b.left + 6, b.centerY + 2, 14, 7); g.fillEllipse(b.right - 4, b.centerY - 1, 10, 6);
        }
        // Tubo fluorescente que parpadea sobre una zona del tema (baño, regaderas)
        const theme = this.lv.decor && THEMES[this.lv.theme];
        if (theme && theme.flicker) {
            let r0 = ROWS, c0 = COLS, r1 = -1, c1 = -1;
            this.lv.decor.forEach((row, r) => [...row].forEach((ch, c) => {
                const ob = this.walls.has(`${r},${c}`) && theme.obstacles[ch];
                if ((ob ? ob.floor : ch) === theme.flicker.zone) { r0 = Math.min(r0, r); c0 = Math.min(c0, c); r1 = Math.max(r1, r); c1 = Math.max(c1, c); }
            }));
            if (r1 >= 0) {
                const glow = this.add.rectangle(this.ox + (c0 + c1 + 1) * T / 2, this.oy + (r0 + r1 + 1) * T / 2,
                    (c1 - c0 + 1) * T, (r1 - r0 + 1) * T, theme.flicker.color, 0.07).setDepth(3);
                this.tweens.add({ targets: glow, alpha: 0, duration: 60, yoyo: true, repeat: -1, repeatDelay: 1500, hold: 90 });
            }
        }
        if (GameSettings.grid) {
            const g = this.add.graphics().setDepth(1);
            g.lineStyle(1, COLORS.bone, 0.12);
            for (let c = 0; c <= COLS; c++) g.lineBetween(this.ox + c * T, this.oy, this.ox + c * T, this.oy + ROWS * T);
            for (let r = 0; r <= ROWS; r++) g.lineBetween(this.ox, this.oy + r * T, this.ox + COLS * T, this.oy + r * T);
        }
        if (theme && theme.festive) { this.drawFestive(); return; }
        if (theme && theme.spooky) { this.drawSpooky(); return; }
        if (theme && theme.foggy) { this.drawFoggy(); return; }
        // Foquitos de feria sobre el tablero
        for (let i = 0; i < 22; i++) {
            const b = this.add.circle(this.ox + 16 + i * ((COLS * T - 32) / 21), this.oy - 7, 3.5,
                i % 3 ? COLORS.neon : COLORS.lime).setDepth(41);
            this.tweens.add({ targets: b, alpha: 0.25, duration: 250 + (i * 89) % 450, yoyo: true, repeat: -1, delay: (i * 113) % 600 });
        }
    }

    createActors() {
        this.victims.forEach(v => {
            v.sprite = this.add.image(this.cx(v.c), this.cy(v.r) - 2, v.tex).setDepth(5).setScale(0.4).setOrigin(0.5, this.charOriginY(v.tex));
            // Las sobrias tiemblan de miedo y huyen si el asesino se para a su lado
            if (v.sober) { this.startFear(v); return; }
            // Las víctimas están de fiesta y no se dan cuenta del asesino: se balancean como mareadas
            v.sprite.setAngle(-4);
            v.shake = this.tweens.add({
                targets: v.sprite, angle: 4, duration: 900 + (v.r * 7 + v.c * 13) % 400, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
            });
            this.addPartyFx(v);
        });
        const killerTex = this.lv.killerTex || this.world.killerTex;
        this.player = this.add.image(this.cx(this.pc), this.cy(this.pr), killerTex).setDepth(10).setScale(0.4).setOrigin(0.5, this.charOriginY(killerTex));
        this.light = this.add.image(this.player.x, this.player.y, 'light').setDepth(8).setBlendMode(Phaser.BlendModes.ADD).setScale(0.7);
        this.tweens.add({ targets: this.light, alpha: 0.75, duration: 140, yoyo: true, repeat: -1, repeatDelay: 1800, hold: 60 });
        this.tweens.add({ targets: this.player, scaleY: 0.42, duration: 600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    }

    // Decoración navideña alrededor del tablero: guirnaldas con luces, coronas en las esquinas y nieve
    drawFestive() {
        const x0 = this.ox - 6, x1 = this.ox + COLS * T + 6, w = x1 - x0;
        const g = this.add.graphics().setDepth(41);
        [this.oy - 7, this.oy + ROWS * T + 7].forEach((y, k) => {
            g.lineStyle(7, 0x1f5a2e); g.beginPath();
            for (let i = 0; i <= 44; i++) { const x = x0 + i * w / 44, yy = y + Math.sin(i * 0.9 + k) * 3; if (i === 0) g.moveTo(x, yy); else g.lineTo(x, yy); }
            g.strokePath();
            g.lineStyle(2, 0x2f8a44); g.beginPath();
            for (let i = 0; i <= 44; i++) { const x = x0 + i * w / 44, yy = y + Math.sin(i * 0.9 + k) * 3 - 2; if (i === 0) g.moveTo(x, yy); else g.lineTo(x, yy); }
            g.strokePath();
            for (let i = 0; i < 24; i++) {
                const x = x0 + 14 + i * (w - 28) / 23;
                const b = this.add.circle(x, y + Math.sin((x - x0) / w * 44 * 0.9 + k) * 3 + 2, 3.5, [0xff1f3d, 0x3ad86a, 0xf0f0f0][i % 3]).setDepth(42);
                this.tweens.add({ targets: b, alpha: 0.2, duration: 400 + (i * 97) % 500, yoyo: true, repeat: -1, delay: (i * 131) % 700 });
            }
        });
        [[x0, this.oy - 7], [x1, this.oy - 7], [x0, this.oy + ROWS * T + 7], [x1, this.oy + ROWS * T + 7]].forEach(([x, y]) => {
            g.lineStyle(9, 0x1f5a2e); g.strokeCircle(x, y, 11); g.lineStyle(3, 0x2f8a44); g.strokeCircle(x, y, 13);
            g.fillStyle(0xff1f3d); [0, 2, 4].forEach(a => g.fillCircle(x + Math.cos(a) * 11, y + Math.sin(a) * 11, 2.2));
            g.fillStyle(0xc2172f); g.fillTriangle(x - 7, y + 10, x, y + 14, x - 6, y + 18); g.fillTriangle(x + 7, y + 10, x, y + 14, x + 6, y + 18);
            g.fillCircle(x, y + 13, 3);
        });
        // Nieve que cae despacio sobre el escenario (decoración, no bloquea)
        for (let i = 0; i < 26; i++) {
            const x = this.ox + ((i * 97) % (COLS * T)), top = this.oy - 10, bottom = this.oy + ROWS * T;
            const f = this.add.circle(x, top + ((i * 53) % (ROWS * T)), 1.5 + (i % 2), 0xffffff, 0.5).setDepth(30);
            this.tweens.add({
                targets: f, y: bottom, x: x + 14 - (i % 4) * 9, duration: 5000 + (i * 311) % 3000, repeat: -1,
                onRepeat: () => { f.y = top; f.x = x; }
            });
        }
    }

    // Circo abandonado: banderines rasgados, focos casi todos fundidos y un reflector que barre la pista
    drawSpooky() {
        const x0 = this.ox - 6, x1 = this.ox + COLS * T + 6, w = x1 - x0;
        const g = this.add.graphics().setDepth(41);
        [this.oy - 8, this.oy + ROWS * T + 6].forEach((y, k) => {
            const sag = i => y + Math.sin((i / 10) * Math.PI) * 4;
            g.lineStyle(2, 0x6a5a3a);
            for (let s = 0; s < 4; s++) {
                g.beginPath();
                for (let i = 0; i <= 10; i++) { const x = x0 + (s * 10 + i) * w / 40; if (i === 0) g.moveTo(x, sag(i)); else g.lineTo(x, sag(i)); }
                g.strokePath();
            }
            for (let i = 0; i < 40; i++) {
                if ((i * 7 + k * 3) % 9 === 0) continue;              // banderines arrancados
                const x = x0 + (i + 0.5) * w / 40, yy = sag((i % 10) + 0.5);
                const torn = (i * 5 + k) % 4 === 0;
                g.fillStyle(i % 2 ? 0xb8ad94 : 0x7a1420, 0.9);
                g.fillTriangle(x - 7, yy, x + 7, yy, x + (torn ? 3 : 0), yy + (torn ? 6 : 11));
                g.lineStyle(1, 0x140a0c); g.strokeTriangle(x - 7, yy, x + 7, yy, x + (torn ? 3 : 0), yy + (torn ? 6 : 11));
            }
            for (let i = 0; i < 11; i++) {
                const x = x0 + 20 + i * (w - 40) / 10, alive = (i + k) % 4 === 1;
                const b = this.add.circle(x, y - 4, 3.5, alive ? 0xff1f3d : 0x3a2a1a).setDepth(42);
                if (alive) this.tweens.add({ targets: b, alpha: 0.1, duration: 60, yoyo: true, repeat: -1, repeatDelay: 700 + i * 230, hold: 120 });
            }
        });
        // Reflector que recorre la pista y a veces parpadea
        const spot = this.add.image(this.cx(3), this.cy(5), 'spot').setDepth(9).setBlendMode(Phaser.BlendModes.ADD).setScale(1.1).setAlpha(0.8);
        this.tweens.add({ targets: spot, x: this.cx(7), y: this.cy(4), duration: 4200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
        this.tweens.add({ targets: spot, alpha: 0.2, duration: 70, yoyo: true, repeat: -1, repeatDelay: 2600, hold: 90 });
    }

    // Campamento: niebla del lago que cruza el tablero y luciérnagas
    drawFoggy() {
        const mask = this.make.graphics({ add: false }).fillStyle(0xffffff).fillRect(this.ox, this.oy, COLS * T, ROWS * T).createGeometryMask();
        for (let i = 0; i < 5; i++) {
            const x = this.ox + (i * 173) % (COLS * T), y = this.oy + 50 + i * 105;
            const f = this.add.image(x, y, 'fog').setDepth(30).setAlpha(0.6).setScale(1.4 + (i % 2) * 0.5).setMask(mask);
            this.tweens.add({ targets: f, x: x + (i % 2 ? -180 : 180), duration: 9000 + i * 1300, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
        }
        for (let i = 0; i < 14; i++) {
            const x = this.ox + 20 + (i * 151) % (COLS * T - 40), y = this.oy + 20 + (i * 89) % (ROWS * T - 40);
            const f = this.add.circle(x, y, 2, 0xd8f06a, 0.9).setDepth(31);
            this.tweens.add({ targets: f, alpha: 0.05, duration: 700 + (i * 97) % 600, yoyo: true, repeat: -1, delay: (i * 211) % 1200 });
            this.tweens.add({ targets: f, x: x + 10 - (i % 3) * 10, y: y - 8 + (i % 2) * 16, duration: 2400 + (i * 131) % 1500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
        }
    }

    // ---------- HUD ----------
    createHud() {
        const style = { fontFamily: FONT_BODY, fontSize: '18px', color: '#efe3c8', fontStyle: '600' };
        this.killText = this.add.text(this.ox, 20, '', style);
        this.moveText = this.add.text(this.ox, 44, '', { ...style, fontSize: '15px', fontStyle: '400' }).setAlpha(0.85);
        this.statusText = this.add.text(W / 2 - 40, 32, '', { ...style, color: '#ff2a45' }).setOrigin(0.5);

        const small = { w: 100, h: 34, size: '15px' };
        const right = this.ox + COLS * T;
        makeButton(this, right - 270, 34, 'Undo', () => this.undo(), small);
        makeButton(this, right - 160, 34, 'Restart', () => this.scene.restart({ world: this.worldIndex, level: this.levelIndex }), small);
        makeButton(this, right - 50, 34, 'Levels', () => this.scene.start('LevelSelect'), small);

        if (this.momLeft) {
            const icon = this.add.image(this.ox + 16, H - 26, 'momHead').setScale(0.36).setDepth(41).setInteractive({ useHandCursor: true });
            icon.on('pointerdown', () => this.callMother());
            this.momText = this.add.text(this.ox + 34, H - 26, '', { ...style, fontSize: '16px' }).setOrigin(0, 0.5).setDepth(41);
        }
        const help = this.momLeft ? 'Arrows/WASD move, Z undo, R restart, Space: Mommy' : 'Arrows or WASD to move, Z to undo, R to restart';
        this.add.text(W / 2, H - 26, help, {
            fontFamily: FONT_BODY, fontSize: '14px', color: '#efe3c8'
        }).setOrigin(0.5).setAlpha(0.55).setDepth(41);
        this.updateHud();
    }

    updateHud() {
        this.killText.setText(`Level ${this.worldIndex + 1}-${this.levelIndex + 1}   Victims ${this.kills}/${this.victims.length}`);
        this.moveText.setText(`Moves ${this.moves}/${this.lv.maxMoves}   Par ${this.lv.par}`);
        if (this.momText) this.momText.setText(`× ${this.momLeft}`);
        if (this.phase === 'final') {
            this.statusText.setText(`Escapes in ${this.finalMovesLeft}`);
            this.statusText.setColor(this.finalMovesLeft <= 1 ? '#ffffff' : '#ff2a45');
        } else if (this.phase === 'hunt') {
            const left = this.lv.maxMoves - this.moves;
            this.statusText.setText(`${left} moves left`);
            this.statusText.setColor(left <= 2 ? '#ffffff' : '#ff2a45');
        } else this.statusText.setText('');
    }

    // ---------- Entrada ----------
    setupInput() {
        this.input.keyboard.addCapture('UP,DOWN,LEFT,RIGHT,SPACE');
        const keyDir = {
            ArrowUp: 'up', KeyW: 'up', ArrowDown: 'down', KeyS: 'down',
            ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right'
        };
        this.input.keyboard.on('keydown', e => {
            if (this.phase === 'minigame') {
                if (e.code === 'Space' || e.code === 'Enter') this.strike();
                return;
            }
            if (e.code === 'Space') { this.callMother(); return; }
            if (keyDir[e.code]) this.tryMove(DIRS[keyDir[e.code]]);
            else if (e.code === 'KeyZ') this.undo();
            else if (e.code === 'KeyR') this.scene.restart({ world: this.worldIndex, level: this.levelIndex });
            else if (e.code === 'Escape') this.scene.start('LevelSelect');
        });

        this.input.on('pointerdown', p => {
            if (this.phase === 'minigame') { this.strike(); return; }
            this.swipe = p.y > HUD_H ? { x: p.x, y: p.y } : null;
        });
        this.input.on('pointerup', p => {
            if (!this.swipe || this.phase === 'minigame') return;
            const dx = p.x - this.swipe.x, dy = p.y - this.swipe.y;
            this.swipe = null;
            if (Math.max(Math.abs(dx), Math.abs(dy)) < 30) return;
            if (Math.abs(dx) > Math.abs(dy)) this.tryMove(dx > 0 ? DIRS.right : DIRS.left);
            else this.tryMove(dy > 0 ? DIRS.down : DIRS.up);
        });
    }

    // ---------- Movimiento ----------
    computeMove(d) {
        let r = this.pr, c = this.pc, hit = null;
        while (true) {
            const nr = r + d.dr, nc = c + d.dc;
            if (this.isWall(nr, nc)) break;
            const t = this.targetAt(nr, nc);
            if (t) { hit = t; break; }
            r = nr; c = nc;
        }
        return { r, c, hit, dist: Math.abs(r - this.pr) + Math.abs(c - this.pc) };
    }

    tryMove(d) {
        if (this.busy || (this.phase !== 'hunt' && this.phase !== 'final')) return;
        const m = this.computeMove(d);
        if (d.dc !== 0) this.player.setFlipX(d.dc < 0);
        if (m.dist === 0 && !m.hit) { this.bump(d); return; }

        if (this.phase === 'hunt') this.history.push(this.snapshot());
        this.busy = true;
        this.moves++;
        this.pr = m.r; this.pc = m.c;
        this.followHint(d);
        this.updateHud();
        if (m.dist > 0) Sfx.play('slide');

        this.tweens.add({
            targets: this.player, x: this.cx(m.c), y: this.cy(m.r),
            duration: m.dist ? Math.max(110, m.dist * 70) : 1, ease: 'Quad.easeIn',
            onComplete: () => {
                if (m.hit && m.hit.isFinal) this.startMinigame();
                else if (m.hit) this.killVictim(m.hit, d);
                else {
                    Sfx.play('thud');
                    this.cameras.main.shake(80, 0.004);
                    const t = this.scareVictims();
                    if (t) this.time.delayedCall(t, () => this.afterMove()); else this.afterMove();
                }
            }
        });
    }

    bump(d) {
        if (this.busy) return;
        this.busy = true;
        Sfx.play('bump');
        this.tweens.add({
            targets: this.player, x: this.player.x + d.dc * 6, y: this.player.y + d.dr * 6,
            duration: 60, yoyo: true, onComplete: () => { this.busy = false; }
        });
    }

    afterMove() {
        if (this.phase === 'final') {
            this.finalMovesLeft--;
            this.updateHud();
            if (this.finalMovesLeft <= 0) { this.finalEscape(); return; }
        }
        if (this.outOfMoves()) { this.huntFailed(); return; }
        this.busy = false;
    }

    // Sin movimientos antes de eliminar a todas las víctimas: hay que reintentar
    outOfMoves() {
        return this.phase === 'hunt' && this.kills < this.victims.length && this.moves >= this.lv.maxMoves;
    }

    huntFailed() {
        this.phase = 'done';
        this.busy = true;
        this.statusText.setText('');
        Sfx.play('bump');
        this.showBanner('Out of moves', `The victims got away. You have ${this.lv.maxMoves} moves`, 1700,
            () => this.scene.restart({ world: this.worldIndex, level: this.levelIndex }));
    }

    lunge(d, onDone) {
        this.tweens.add({
            targets: this.player, x: this.player.x + d.dc * 16, y: this.player.y + d.dr * 16,
            duration: 80, yoyo: true, onComplete: onDone
        });
    }

    // ---------- Eliminaciones ----------
    killVictim(v, d) {
        v.alive = false;
        this.kills++;
        this.scareVictims();
        this.updateHud();
        if (this.world.killerTex === 'clown') Sfx.play('honk');
        this.time.delayedCall(120, () => Sfx.play('kill'));
        this.lunge(d);
        this.killFx(v);
        this.floatText(v.sprite.x, v.sprite.y - 20, '+1000');

        this.time.delayedCall(500, () => {
            if (this.kills === this.victims.length) this.spawnFinal();
            else if (this.outOfMoves()) this.huntFailed();
            else this.busy = false;
        });
    }

    // ---------- Víctimas sobrias ----------
    startFear(v) {
        v.shake = this.tweens.add({ targets: v.sprite, x: v.sprite.x + 1.5, duration: 70, yoyo: true, repeat: -1 });
    }

    // Las sobrias que quedan junto al asesino corren en línea recta alejándose de él, hasta chocar con algo.
    // Devuelve cuánto dura la carrera más larga (0 si nadie huyó).
    scareVictims() {
        if (this.phase !== 'hunt') return 0;
        let longest = 0;
        this.victims.forEach(v => {
            if (!v.sober || !v.alive) return;
            const fr = v.r - this.pr, fc = v.c - this.pc;
            if (Math.abs(fr) + Math.abs(fc) !== 1) return;
            let r = v.r, c = v.c;
            while (true) {
                const nr = r + fr, nc = c + fc;
                if (this.isWall(nr, nc) || this.victims.some(o => o.alive && o.r === nr && o.c === nc) || (nr === this.pr && nc === this.pc)) break;
                r = nr; c = nc;
            }
            this.floatText(v.sprite.x, v.sprite.y - 44, '!', '#ffffff');
            const dist = Math.abs(r - v.r) + Math.abs(c - v.c);
            if (!dist) return;
            v.r = r; v.c = c;
            this.tweens.killTweensOf(v.sprite);
            v.sprite.x = this.cx(v.c - fc * dist);
            const dur = Math.min(450, Math.max(160, dist * 60));
            this.tweens.add({
                targets: v.sprite, x: this.cx(c), y: this.cy(r) - 2, duration: dur, ease: 'Quad.easeOut',
                onComplete: () => { if (v.alive) this.startFear(v); }
            });
            longest = Math.max(longest, dur);
        });
        if (longest) Sfx.play('slide');
        return longest;
    }

    // Cartel que explica la mecánica del nivel; se cierra con cualquier tecla o toque
    showIntro(intro, onDone) {
        this.busy = true;
        const objs = [], add = o => { objs.push(o); return o.setDepth(70); };
        add(this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.72));
        add(this.add.rectangle(W / 2, H / 2, 620, 320, COLORS.panel).setStrokeStyle(3, COLORS.neon));
        add(this.add.text(W / 2, H / 2 - 122, intro.title, { fontFamily: FONT_TITLE, fontSize: '42px', color: '#c8102e' })
            .setOrigin(0.5).setShadow(3, 3, '#3a0008', 0, false, true));
        // Ejemplo: una víctima sobria (huye) y una de fiesta (con notas, no se entera)
        const sober = this.victims.find(v => v.sober), party = this.victims.find(v => !v.sober);
        if (sober) {
            add(this.add.image(W / 2 - 230, H / 2 + 6, sober.tex).setScale(0.42).setOrigin(0.5, this.charOriginY(sober.tex)));
            add(this.add.text(W / 2 - 230, H / 2 - 52, '!', { fontFamily: FONT_BODY, fontSize: '26px', color: '#ffffff', fontStyle: '800' }).setOrigin(0.5));
        }
        if (party) {
            const p = add(this.add.image(W / 2 + 230, H / 2 + 6, party.tex).setScale(0.42).setOrigin(0.5, this.charOriginY(party.tex)));
            add(this.add.image(W / 2 + 222, H / 2 - 48, 'partyNotePink').setScale(1.3));
            add(this.add.image(W / 2 + 240, H / 2 - 54, 'partyNoteGreen').setScale(1.3));
            p.setAngle(-4);
        }
        add(this.add.text(W / 2, H / 2 + 4, intro.lines.join('\n'), {
            fontFamily: FONT_BODY, fontSize: '17px', color: '#efe3c8', align: 'center', lineSpacing: 7, wordWrap: { width: 340 }
        }).setOrigin(0.5));
        const go = add(this.add.text(W / 2, H / 2 + 128, 'Press any key or tap to start', {
            fontFamily: FONT_BODY, fontSize: '15px', color: '#ff2a45', fontStyle: '600'
        }).setOrigin(0.5));
        this.tweens.add({ targets: go, alpha: 0.35, duration: 600, yoyo: true, repeat: -1 });
        const close = () => {
            this.input.keyboard.off('keydown', close);
            this.input.off('pointerdown', close);
            this.tweens.killTweensOf(go);
            objs.forEach(o => o.destroy());
            this.busy = false;
            if (onDone) onDone();
        };
        this.time.delayedCall(500, () => { this.input.keyboard.on('keydown', close); this.input.on('pointerdown', close); });
    }

    // Notas musicales y burbujas que suben sobre la cabeza de la víctima
    addPartyFx(v) {
        const s = v.sprite, x = s.x, y = s.y - s.displayOriginY * s.scaleY - 2;
        const seed = v.r * 5 + v.c * 3;
        v.party = [];
        // Las parejas del nivel (lv.lovers) sueltan corazones en lugar de notas
        const inLove = (this.lv.lovers || []).some(p => p.r === v.r && p.c === v.c);
        (inLove ? ['partyHeartRed', 'partyHeartPink'] : ['partyNotePink', 'partyNoteGreen']).forEach((tex, i) => {
            const n = this.add.image(x - 8 + i * 16, y, tex).setDepth(6).setScale(1.25);
            const tw = this.tweens.add({
                targets: n, x: n.x + (i ? 10 : -10), y: y - 26, alpha: { from: 1, to: 0.15 }, angle: { from: i ? 10 : -10, to: i ? -15 : 15 },
                duration: 1400, delay: i * 700 + seed * 37 % 500, repeat: -1, ease: 'Sine.easeOut'
            });
            v.party.push(n, tw);
        });
        for (let i = 0; i < 3; i++) {
            const b = this.add.image(x + 6 - i * 6, y + 4, 'partyBubble').setDepth(6).setScale(1 + i * 0.2);
            const tw = this.tweens.add({
                targets: b, y: y - 14 - i * 3, x: b.x + (i % 2 ? 4 : -4), alpha: { from: 0.9, to: 0 },
                duration: 1100 + i * 250, delay: i * 380 + seed * 53 % 600, repeat: -1
            });
            v.party.push(b, tw);
        }
    }

    setPartyFx(v, on) {
        (v.party || []).forEach(o => {
            if (o.pause) { if (on) { o.resume(); o.restart(); } else o.pause(); } else o.setVisible(on);
        });
    }

    killFx(v) {
        const s = v.sprite;
        if (v.shake) v.shake.pause();
        this.setPartyFx(v, false);
        s.setTint(0xff3355);
        this.cameras.main.shake(140, 0.008);
        v.splat = this.add.image(s.x, s.y + 6, 'splat').setDepth(3).setScale(0).setAngle(Phaser.Math.Between(0, 359));
        this.tweens.add({ targets: v.splat, scale: 1, duration: 220, ease: 'Back.easeOut' });
        this.tweens.add({ targets: s, angle: 90, alpha: 0, y: s.y + 10, duration: 380, ease: 'Quad.easeIn' });
        for (let i = 0; i < 14; i++) {
            const p = this.add.image(s.x, s.y, 'px').setDepth(12)
                .setTint(Phaser.Utils.Array.GetRandom([0xc2172f, 0x8f0a1e, 0xff1f3d, 0x9fd356]))
                .setScale(Phaser.Math.FloatBetween(0.6, 1.4));
            const a = Phaser.Math.FloatBetween(0, Math.PI * 2), dist = Phaser.Math.Between(20, 60);
            this.tweens.add({
                targets: p, x: s.x + Math.cos(a) * dist, y: s.y + Math.sin(a) * dist, alpha: 0, angle: 180,
                duration: 500, ease: 'Cubic.easeOut', onComplete: () => p.destroy()
            });
        }
    }

    floatText(x, y, txt, color = '#ff2a45') {
        const t = this.add.text(x, y, txt, { fontFamily: FONT_BODY, fontSize: '20px', color, fontStyle: '800' })
            .setOrigin(0.5).setDepth(45).setShadow(2, 2, '#000', 0, false, true);
        this.tweens.add({ targets: t, y: y - 36, alpha: 0, duration: 900, onComplete: () => t.destroy() });
    }

    // ---------- Deshacer ----------
    snapshot() {
        return { r: this.pr, c: this.pc, moves: this.moves, kills: this.kills, alive: this.victims.map(v => v.alive), pos: this.victims.map(v => [v.r, v.c]) };
    }

    undo() {
        if (this.busy || this.phase !== 'hunt' || !this.history.length) return;
        const s = this.history.pop();
        this.pr = s.r; this.pc = s.c; this.moves = s.moves; this.kills = s.kills;
        this.player.setPosition(this.cx(s.c), this.cy(s.r));
        this.victims.forEach((v, i) => {
            const moved = v.r !== s.pos[i][0] || v.c !== s.pos[i][1];
            [v.r, v.c] = s.pos[i];
            if (v.sober && (moved || (s.alive[i] && !v.alive))) {
                this.tweens.killTweensOf(v.sprite);
                v.sprite.setPosition(this.cx(v.c), this.cy(v.r) - 2);
                if (s.alive[i]) this.startFear(v);
            }
            if (s.alive[i] && !v.alive) {
                v.alive = true;
                v.sprite.setPosition(this.cx(v.c), this.cy(v.r) - 2).setAlpha(1).setAngle(0).clearTint();
                if (v.shake) v.shake.resume();
                this.setPartyFx(v, true);
                if (v.splat) { v.splat.destroy(); v.splat = null; }
            }
        });
        this.clearHint();
        Sfx.play('undo');
        this.updateHud();
    }

    // ---------- Habilidad de Jason: la cabeza de su madre marca la mejor ruta ----------
    // Ruta más corta desde la posición actual: hasta eliminar a todas las víctimas, o hasta alcanzar a la víctima final
    bestPath() {
        const final = this.phase === 'final', vs = this.victims;
        const start = {
            r: this.pr, c: this.pc, m: final ? 0 : vs.reduce((m, v, i) => v.alive ? m | 1 << i : m, 0),
            pos: vs.map(v => [v.r, v.c]), from: null
        };
        const key = s => `${s.r},${s.c},${s.m},${s.pos.join(';')}`;
        const seen = new Set([key(start)]);
        let q = [start];
        while (q.length && seen.size < 300000) {
            const nq = [];
            for (const s of q) for (const dir of Object.keys(DIRS)) {
                const d = DIRS[dir], pos = s.pos.map(p => p.slice());
                let r = s.r, c = s.c, m = s.m, hit = null;
                const at = (rr, cc) => pos.findIndex((p, k) => (m >> k & 1) && p[0] === rr && p[1] === cc);
                while (true) {
                    const nr = r + d.dr, nc = c + d.dc;
                    if (this.isWall(nr, nc)) break;
                    if (final && nr === this.final.r && nc === this.final.c) { hit = { r: nr, c: nc }; break; }
                    const i = final ? -1 : at(nr, nc);
                    if (i >= 0) { m &= ~(1 << i); hit = { r: nr, c: nc }; break; }
                    r = nr; c = nc;
                }
                if (!hit && r === s.r && c === s.c) continue;
                // Misma regla que scareVictims: las sobrias junto al asesino huyen en línea recta
                if (!final) vs.forEach((v, i) => {
                    if (!v.sober || !(m >> i & 1)) return;
                    const fr = pos[i][0] - r, fc = pos[i][1] - c;
                    if (Math.abs(fr) + Math.abs(fc) !== 1) return;
                    let ar = pos[i][0], ac = pos[i][1];
                    while (true) {
                        const nr = ar + fr, nc = ac + fc;
                        if (this.isWall(nr, nc) || at(nr, nc) >= 0 || (nr === r && nc === c)) break;
                        ar = nr; ac = nc;
                    }
                    pos[i] = [ar, ac];
                });
                const n = { r, c, m, pos, dir, hit, from: s };
                if ((final && hit) || (!final && m === 0)) {
                    const path = [];
                    for (let p = n; p.from; p = p.from) path.unshift(p);
                    return path;
                }
                const k = key(n);
                if (seen.has(k)) continue;
                seen.add(k);
                nq.push(n);
            }
            q = nq;
        }
        return null;
    }

    callMother() {
        if (!this.world.ability || this.busy || this.hint || (this.phase !== 'hunt' && this.phase !== 'final')) return;
        if (this.momLeft <= 0) { this.momSays('Mommy has nothing more to say...'); return; }
        const path = this.bestPath();
        const left = this.phase === 'final' ? this.finalMovesLeft : this.lv.maxMoves - this.moves;
        if (!path || path.length > left) { this.momSays("It's too late, Jason... undo."); return; }
        this.momLeft--;
        this.hint = path.slice(0, 5);
        this.drawHint();
        this.momSays(this.phase === 'final' ? 'Kill her for Mommy!' : 'Kill them for Mommy...');
        this.updateHud();
    }

    // La cabeza flota sobre Jason, dice su frase y se desvanece
    momSays(text) {
        if (this.momHead) { this.momHead.destroy(); this.momLine.destroy(); }
        const x = Phaser.Math.Clamp(this.player.x, this.ox + 60, this.ox + COLS * T - 60);
        const y = Math.max(this.oy + 50, this.player.y - 80);
        const head = this.momHead = this.add.image(x, y, 'momHead').setDepth(46).setScale(0).setAlpha(0.95);
        const line = this.momLine = this.add.text(x, y + 50, text, { fontFamily: FONT_TITLE, fontSize: '24px', color: '#d8cfc0' })
            .setOrigin(0.5).setDepth(46).setAlpha(0).setShadow(2, 2, '#000', 0, false, true);
        line.x = Phaser.Math.Clamp(x, this.ox + line.width / 2, this.ox + COLS * T - line.width / 2);
        Sfx.play('appear');
        this.tweens.add({ targets: head, scale: 1, duration: 350, ease: 'Back.easeOut' });
        this.tweens.add({ targets: head, y: y - 6, duration: 700, yoyo: true, repeat: 1, ease: 'Sine.easeInOut' });
        this.tweens.add({ targets: head, alpha: 0.45, duration: 50, yoyo: true, repeat: 3, repeatDelay: 300, delay: 400 });
        this.tweens.add({ targets: line, alpha: 1, duration: 250, delay: 150 });
        this.tweens.add({
            targets: [head, line], alpha: 0, duration: 400, delay: 2200,
            onComplete: () => { head.destroy(); line.destroy(); if (this.momHead === head) this.momHead = null; }
        });
    }

    // Línea pálida por cada paso, con su número donde termina; los golpes a víctimas se marcan en rojo
    drawHint() {
        this.hintObjs.forEach(o => (o.stop ? o.stop() : o.destroy()));
        this.hintObjs = [];
        const g = this.add.graphics().setDepth(7);
        this.hintObjs.push(g);
        let r = this.pr, c = this.pc;
        const marks = [], count = {};
        this.hint.forEach((s, i) => {
            const a = 1 - i * 0.13, tr = s.hit ? s.hit.r : s.r, tc = s.hit ? s.hit.c : s.c;
            g.lineStyle(7, 0x000000, 0.4 * a); g.lineBetween(this.cx(c), this.cy(r), this.cx(tc), this.cy(tr));
            g.lineStyle(3, 0xd8cfc0, 0.85 * a); g.lineBetween(this.cx(c), this.cy(r), this.cx(tc), this.cy(tr));
            if (s.hit) { g.lineStyle(3, 0xff1f3d, 0.9 * a); g.strokeCircle(this.cx(tc), this.cy(tr), 22); }
            const k = `${s.r},${s.c}`, n = count[k] = (count[k] || 0) + 1;
            marks.push([this.cx(s.c) + (n - 1) * 16 - 14, this.cy(s.r) - 20, i]);
            r = s.r; c = s.c;
        });
        marks.forEach(([x, y, i]) => {
            const dot = this.add.circle(x, y, 10, 0x24142c, 0.95).setStrokeStyle(2, i ? 0xd8cfc0 : 0xff1f3d).setDepth(43);
            const t = this.add.text(x, y, String(i + 1), { fontFamily: FONT_BODY, fontSize: '13px', color: '#efe3c8', fontStyle: '800' })
                .setOrigin(0.5).setDepth(44);
            this.hintObjs.push(dot, t);
            if (!i) this.hintObjs.push(this.tweens.add({ targets: [dot, t], scale: 1.25, duration: 400, yoyo: true, repeat: -1 }));
        });
    }

    // Si el jugador sigue la ruta, se borra el paso hecho; si se desvía, la ruta desaparece
    followHint(d) {
        if (!this.hint) return;
        if (DIRS[this.hint[0].dir] === d) this.hint.shift();
        else this.hint = [];
        if (this.hint.length) this.drawHint(); else this.clearHint();
    }

    clearHint() {
        this.hint = null;
        this.hintObjs.forEach(o => (o.stop ? o.stop() : o.destroy()));
        this.hintObjs = [];
    }

    // ---------- Víctima final ----------
    spawnFinal() {
        this.phase = 'final';
        this.huntMoves = this.moves;
        this.history = [];
        this.finalMovesLeft = this.lv.finalMoves;
        this.clearHint();
        const free = p => !(p.r === this.pr && p.c === this.pc) && !this.isWall(p.r, p.c);
        const spot = [this.finalSpawn, ...(this.lv.finalAlt || [])].find(free);
        this.final = { r: spot.r, c: spot.c, alive: true, isFinal: true };

        const x = this.cx(spot.c), y = this.cy(spot.r);
        this.final.ring = this.add.image(x, y, 'ring').setDepth(4).setAlpha(0);
        this.tweens.add({ targets: this.final.ring, alpha: 0.9, scale: 1.12, duration: 600, yoyo: true, repeat: -1 });
        const finalTex = this.lv.finalTex || 'finalGirl';
        this.final.sprite = this.add.image(x, y - 2, finalTex).setDepth(5).setScale(0).setOrigin(0.5, this.charOriginY(finalTex));
        this.tweens.add({ targets: this.final.sprite, scale: 0.4, duration: 500, ease: 'Back.easeOut' });
        this.final.shake = this.tweens.add({ targets: this.final.sprite, x: x + 1.5, duration: 60, yoyo: true, repeat: -1 });

        Sfx.play('appear');
        this.updateHud();
        this.showBanner('Final Girl', `Catch her in ${this.lv.finalMoves} moves or she escapes`, 1700,
            () => { this.busy = false; });
    }

    finalEscape() {
        this.phase = 'done';
        this.busy = true;
        this.statusText.setText('');
        this.fleeFinal();
        this.showBanner('She escaped', 'Level cleared, but with fewer points', 1400);
        this.time.delayedCall(1700, () => this.endLevel(false, 0));
    }

    fleeFinal() {
        const f = this.final;
        f.alive = false;
        if (f.shake) f.shake.stop();
        f.ring.destroy();
        f.sprite.setFlipX(false);
        this.tweens.add({ targets: f.sprite, x: W + 60, alpha: 0, duration: 900, ease: 'Quad.easeIn' });
    }

    // ---------- Minijuego de precisión ----------
    startMinigame() {
        this.phase = 'minigame';
        this.busy = true;
        this.statusText.setText('');
        const diff = DIFFICULTY[GameSettings.difficulty] || DIFFICULTY.normal;
        const barW = 440, barX = W / 2 - barW / 2, barY = H / 2 + 20;
        const objs = [];
        const add = o => { objs.push(o); return o.setDepth(60); };

        const dim = add(this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.78)).setAlpha(0);
        this.tweens.add({ targets: dim, alpha: 1, duration: 200 });
        add(this.add.rectangle(W / 2, H / 2, 540, 280, COLORS.panel).setStrokeStyle(3, COLORS.neon));
        const mgTitle = add(this.add.text(W / 2, H / 2 - 100, 'Final Blow', { fontFamily: FONT_TITLE, fontSize: '48px', color: '#c8102e' })
            .setOrigin(0.5).setShadow(3, 3, '#3a0008', 0, false, true));
        objs.push(addDrips(this, mgTitle, 61));
        mgTitle.setDepth(62);
        add(this.add.text(W / 2, H / 2 - 50, 'Press Space or tap when the needle is in the green zone', {
            fontFamily: FONT_BODY, fontSize: '16px', color: '#efe3c8'
        }).setOrigin(0.5));
        add(this.add.rectangle(W / 2, barY, barW, 30, 0x0c060e).setStrokeStyle(2, COLORS.bone));
        const markers = [0, 1, 2].map(i => add(this.add.circle(W / 2 + (i - 1) * 36, H / 2 + 86, 10, COLORS.plum)
            .setStrokeStyle(2, COLORS.bone)));
        const needle = add(this.add.rectangle(barX, barY, 6, 48, COLORS.bone));
        needle.setDepth(62);

        this.mg = { diff, barW, barX, barY, objs, markers, needle, round: 0, hits: [], pos: 0, sign: 1, active: false, ready: false, zone: null };
        this.mgRound();
    }

    mgRound() {
        const mg = this.mg;
        if (mg.zone) mg.zone.destroy();
        mg.zoneW = mg.diff.zones[mg.round];
        mg.zoneC = Phaser.Math.Between(Math.ceil(mg.zoneW / 2) + 10, Math.floor(mg.barW - mg.zoneW / 2) - 10);
        mg.zone = this.add.rectangle(mg.barX + mg.zoneC, mg.barY, mg.zoneW, 26, COLORS.lime, 0.85).setDepth(61);
        mg.speed = mg.diff.speed * (1 + 0.18 * mg.round);
        mg.pos = mg.zoneC > mg.barW / 2 ? 0 : mg.barW;
        mg.sign = mg.pos === 0 ? 1 : -1;
        mg.active = true;
        mg.ready = false;
        this.time.delayedCall(250, () => { if (this.mg) this.mg.ready = true; });
    }

    update(time, delta) {
        if (this.light && this.player) this.light.setPosition(this.player.x, this.player.y);
        const mg = this.mg;
        if (this.phase !== 'minigame' || !mg || !mg.active) return;
        mg.pos += mg.sign * mg.speed * delta / 1000;
        if (mg.pos >= mg.barW) { mg.pos = mg.barW; mg.sign = -1; }
        if (mg.pos <= 0) { mg.pos = 0; mg.sign = 1; }
        mg.needle.x = mg.barX + mg.pos;
    }

    strike() {
        const mg = this.mg;
        if (!mg || !mg.active || !mg.ready) return;
        mg.active = false;
        const dist = Math.abs(mg.pos - mg.zoneC);
        if (dist <= mg.zoneW / 2) {
            mg.hits.push(1 - dist / (mg.zoneW / 2));
            mg.markers[mg.round].setFillStyle(COLORS.lime);
            Sfx.play('hit');
            this.tweens.add({ targets: mg.zone, alpha: 0.3, duration: 80, yoyo: true });
            mg.round++;
            if (mg.round === 3) this.time.delayedCall(350, () => this.mgFinish(true));
            else this.time.delayedCall(400, () => this.mgRound());
        } else {
            mg.markers[mg.round].setFillStyle(COLORS.red);
            Sfx.play('miss');
            this.cameras.main.shake(160, 0.006);
            this.time.delayedCall(500, () => this.mgFinish(false));
        }
    }

    mgFinish(success) {
        const mg = this.mg;
        mg.objs.forEach(o => o.destroy());
        if (mg.zone) mg.zone.destroy();
        this.mg = null;
        this.phase = 'done';

        if (success) {
            const avg = mg.hits.reduce((a, b) => a + b, 0) / mg.hits.length;
            const bonus = Math.round(2500 * (0.6 + 0.4 * avg));
            const f = this.final;
            f.alive = false;
            f.ring.destroy();
            const d = { dr: Math.sign(f.r - this.pr), dc: Math.sign(f.c - this.pc) };
            if (this.world.killerTex === 'clown') Sfx.play('honk');
            this.time.delayedCall(120, () => Sfx.play('kill'));
            this.lunge(d);
            this.killFx(f);
            this.floatText(f.sprite.x, f.sprite.y - 20, `+${bonus}`, '#9fd356');
            this.time.delayedCall(1300, () => this.endLevel(true, bonus));
        } else {
            this.fleeFinal();
            this.showBanner('She escaped', 'Level cleared, but with fewer points', 1400);
            this.time.delayedCall(1700, () => this.endLevel(false, 0));
        }
    }

    // ---------- Fin del nivel ----------
    endLevel(finalKilled, finalBonus) {
        const killPoints = this.victims.length * 1000;
        const huntMoves = this.huntMoves || this.moves;
        const efficiency = Math.max(0, 2000 - Math.max(0, huntMoves - this.lv.par) * 150);
        const total = killPoints + efficiency + finalBonus;
        const stars = 1 + (finalKilled ? 1 : 0) + (huntMoves <= this.lv.par + 2 ? 1 : 0);
        const newBest = total > (GameSettings.best || 0);
        if (newBest) { GameSettings.best = total; saveSettings(); }
        recordLevelResult(this.worldIndex, this.levelIndex, stars);
        this.scene.start('Result', {
            killPoints, efficiency, finalKilled, finalBonus, total, stars, newBest,
            moves: huntMoves, par: this.lv.par,
            world: this.worldIndex, level: this.levelIndex, victims: this.victims.length
        });
    }

    // ---------- Utilidades ----------
    showBanner(title, sub, hold = 1400, onDone) {
        const y = H / 2;
        const strip = this.add.rectangle(W / 2, y, W, 120, 0x0c060e, 0.92).setDepth(50).setScale(1, 0)
            .setStrokeStyle(3, COLORS.red);
        const t1 = this.add.text(W / 2, y - 16, title, { fontFamily: FONT_TITLE, fontSize: '46px', color: '#c8102e' })
            .setOrigin(0.5).setDepth(51).setAlpha(0).setShadow(3, 3, '#3a0008', 0, false, true);
        const t2 = this.add.text(W / 2, y + 30, sub, { fontFamily: FONT_BODY, fontSize: '18px', color: '#ff2a45', fontStyle: '600' })
            .setOrigin(0.5).setDepth(51).setAlpha(0);
        this.tweens.add({ targets: strip, scaleY: 1, duration: 180, ease: 'Quad.easeOut' });
        this.tweens.add({ targets: [t1, t2], alpha: 1, duration: 200, delay: 100 });
        this.time.delayedCall(hold, () => {
            this.tweens.add({
                targets: [strip, t1, t2], alpha: 0, duration: 250,
                onComplete: () => { strip.destroy(); t1.destroy(); t2.destroy(); if (onDone) onDone(); }
            });
        });
    }
}
