const DIRS = {
    up: { dr: -1, dc: 0 }, down: { dr: 1, dc: 0 },
    left: { dr: 0, dc: -1 }, right: { dr: 0, dc: 1 }
};

class GameScene extends Phaser.Scene {
    constructor() { super('Game'); }

    create() {
        generateTextures(this);
        this.ox = (W - COLS * T) / 2;
        this.oy = HUD_H;
        this.phase = 'hunt';        // hunt -> final -> minigame -> done
        this.busy = false;
        this.moves = 0;
        this.kills = 0;
        this.history = [];
        this.final = null;
        this.mg = null;

        this.parseLevel();
        this.drawBoard();
        this.createActors();
        this.createHud();
        this.setupInput();
        this.add.image(W / 2, H / 2, 'vignette').setDepth(40);
        this.showBanner(LEVEL.name, 'Elimina a las 3 víctimas', 1500);
    }

    // ---------- Nivel ----------
    parseLevel() {
        this.walls = new Set();
        this.victims = [];
        const kinds = ['victimA', 'victimB', 'victimC'];
        LEVEL.map.forEach((row, r) => [...row].forEach((ch, c) => {
            if (ch === '#') this.walls.add(`${r},${c}`);
            if (ch === 'V') this.victims.push({ r, c, alive: true, tex: kinds[this.victims.length % 3] });
            if (ch === 'P') { this.pr = r; this.pc = c; }
            if (ch === 'F') this.finalSpawn = { r, c };
        }));
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
                this.add.image(this.cx(c), this.cy(r), (r + c) % 2 ? 'floorB' : 'floorA');
                if (this.walls.has(`${r},${c}`)) {
                    this.add.image(this.cx(c), this.cy(r), (r * 7 + c * 3) % 3 === 0 ? 'crate' : 'wall').setDepth(2);
                }
            }
        }
        if (GameSettings.grid) {
            const g = this.add.graphics().setDepth(1);
            g.lineStyle(1, COLORS.bone, 0.12);
            for (let c = 0; c <= COLS; c++) g.lineBetween(this.ox + c * T, this.oy, this.ox + c * T, this.oy + ROWS * T);
            for (let r = 0; r <= ROWS; r++) g.lineBetween(this.ox, this.oy + r * T, this.ox + COLS * T, this.oy + r * T);
        }
        // Foquitos de feria sobre el tablero
        for (let i = 0; i < 22; i++) {
            const b = this.add.circle(this.ox + 16 + i * ((COLS * T - 32) / 21), this.oy - 7, 3.5,
                i % 3 ? COLORS.mustard : COLORS.lime).setDepth(41);
            this.tweens.add({ targets: b, alpha: 0.25, duration: 250 + (i * 89) % 450, yoyo: true, repeat: -1, delay: (i * 113) % 600 });
        }
    }

    createActors() {
        this.victims.forEach(v => {
            v.sprite = this.add.image(this.cx(v.c), this.cy(v.r) - 2, v.tex).setDepth(5).setScale(0.5);
            v.shake = this.tweens.add({ targets: v.sprite, x: v.sprite.x + 1.5, duration: 70, yoyo: true, repeat: -1 });
        });
        this.player = this.add.image(this.cx(this.pc), this.cy(this.pr), 'clown').setDepth(10).setScale(0.5);
        this.light = this.add.image(this.player.x, this.player.y, 'light').setDepth(8).setBlendMode(Phaser.BlendModes.ADD).setScale(1.6);
        this.tweens.add({ targets: this.light, alpha: 0.75, duration: 140, yoyo: true, repeat: -1, repeatDelay: 1800, hold: 60 });
        this.tweens.add({ targets: this.player, scaleY: 0.525, duration: 600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    }

    // ---------- HUD ----------
    createHud() {
        const style = { fontFamily: FONT_BODY, fontSize: '18px', color: '#efe3c8', fontStyle: '600' };
        this.killText = this.add.text(this.ox, 20, '', style);
        this.moveText = this.add.text(this.ox, 44, '', { ...style, fontSize: '15px', fontStyle: '400' }).setAlpha(0.85);
        this.statusText = this.add.text(W / 2 - 40, 32, '', { ...style, color: '#f2c14e' }).setOrigin(0.5);

        const small = { w: 100, h: 34, size: '15px' };
        const right = this.ox + COLS * T;
        makeButton(this, right - 270, 34, 'Deshacer', () => this.undo(), small);
        makeButton(this, right - 160, 34, 'Reiniciar', () => this.scene.restart(), small);
        makeButton(this, right - 50, 34, 'Menú', () => this.scene.start('Menu'), small);

        this.add.text(W / 2, H - 26, 'Flechas o WASD para moverte, Z deshace, R reinicia', {
            fontFamily: FONT_BODY, fontSize: '14px', color: '#efe3c8'
        }).setOrigin(0.5).setAlpha(0.55).setDepth(41);
        this.updateHud();
    }

    updateHud() {
        this.killText.setText(`Víctimas ${this.kills}/3`);
        this.moveText.setText(`Movimientos ${this.moves}   Par ${LEVEL.par}`);
        if (this.phase === 'final') {
            this.statusText.setText(`Escapa en ${this.finalMovesLeft}`);
            this.statusText.setColor(this.finalMovesLeft <= 1 ? '#ff4d6d' : '#f2c14e');
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
            if (keyDir[e.code]) this.tryMove(DIRS[keyDir[e.code]]);
            else if (e.code === 'KeyZ') this.undo();
            else if (e.code === 'KeyR') this.scene.restart();
            else if (e.code === 'Escape') this.scene.start('Menu');
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
                    this.afterMove();
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
        this.busy = false;
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
        this.updateHud();
        Sfx.play('honk');
        this.time.delayedCall(120, () => Sfx.play('kill'));
        this.lunge(d);
        this.killFx(v);
        this.floatText(v.sprite.x, v.sprite.y - 20, '+1000');

        this.time.delayedCall(500, () => {
            if (this.kills === 3) this.spawnFinal();
            else this.busy = false;
        });
    }

    killFx(v) {
        const s = v.sprite;
        if (v.shake) v.shake.pause();
        s.setTint(0xff3355);
        this.cameras.main.shake(140, 0.008);
        v.splat = this.add.image(s.x, s.y + 6, 'splat').setDepth(3).setScale(0).setAngle(Phaser.Math.Between(0, 359));
        this.tweens.add({ targets: v.splat, scale: 1, duration: 220, ease: 'Back.easeOut' });
        this.tweens.add({ targets: s, angle: 90, alpha: 0, y: s.y + 10, duration: 380, ease: 'Quad.easeIn' });
        for (let i = 0; i < 14; i++) {
            const p = this.add.image(s.x, s.y, 'px').setDepth(12)
                .setTint(Phaser.Utils.Array.GetRandom([0xc2172f, 0x8f0a1e, 0xf2c14e, 0x9fd356]))
                .setScale(Phaser.Math.FloatBetween(0.6, 1.4));
            const a = Phaser.Math.FloatBetween(0, Math.PI * 2), dist = Phaser.Math.Between(20, 60);
            this.tweens.add({
                targets: p, x: s.x + Math.cos(a) * dist, y: s.y + Math.sin(a) * dist, alpha: 0, angle: 180,
                duration: 500, ease: 'Cubic.easeOut', onComplete: () => p.destroy()
            });
        }
    }

    floatText(x, y, txt, color = '#f2c14e') {
        const t = this.add.text(x, y, txt, { fontFamily: FONT_BODY, fontSize: '20px', color, fontStyle: '800' })
            .setOrigin(0.5).setDepth(45).setShadow(2, 2, '#000', 0, false, true);
        this.tweens.add({ targets: t, y: y - 36, alpha: 0, duration: 900, onComplete: () => t.destroy() });
    }

    // ---------- Deshacer ----------
    snapshot() {
        return { r: this.pr, c: this.pc, moves: this.moves, kills: this.kills, alive: this.victims.map(v => v.alive) };
    }

    undo() {
        if (this.busy || this.phase !== 'hunt' || !this.history.length) return;
        const s = this.history.pop();
        this.pr = s.r; this.pc = s.c; this.moves = s.moves; this.kills = s.kills;
        this.player.setPosition(this.cx(s.c), this.cy(s.r));
        this.victims.forEach((v, i) => {
            if (s.alive[i] && !v.alive) {
                v.alive = true;
                v.sprite.setPosition(this.cx(v.c), this.cy(v.r) - 2).setAlpha(1).setAngle(0).clearTint();
                if (v.shake) v.shake.resume();
                if (v.splat) { v.splat.destroy(); v.splat = null; }
            }
        });
        Sfx.play('undo');
        this.updateHud();
    }

    // ---------- Víctima final ----------
    spawnFinal() {
        this.phase = 'final';
        this.huntMoves = this.moves;
        this.history = [];
        this.finalMovesLeft = LEVEL.finalMoves;
        const free = p => !(p.r === this.pr && p.c === this.pc) && !this.isWall(p.r, p.c);
        const spot = [this.finalSpawn, ...LEVEL.finalAlt].find(free);
        this.final = { r: spot.r, c: spot.c, alive: true, isFinal: true };

        const x = this.cx(spot.c), y = this.cy(spot.r);
        this.final.ring = this.add.image(x, y, 'ring').setDepth(4).setAlpha(0);
        this.tweens.add({ targets: this.final.ring, alpha: 0.9, scale: 1.12, duration: 600, yoyo: true, repeat: -1 });
        this.final.sprite = this.add.image(x, y - 2, 'finalGirl').setDepth(5).setScale(0);
        this.tweens.add({ targets: this.final.sprite, scale: 0.5, duration: 500, ease: 'Back.easeOut' });
        this.final.shake = this.tweens.add({ targets: this.final.sprite, x: x + 1.5, duration: 60, yoyo: true, repeat: -1 });

        Sfx.play('appear');
        this.updateHud();
        this.showBanner('Apareció la última víctima', `Atrápala en ${LEVEL.finalMoves} movimientos o escapará`, 1700,
            () => { this.busy = false; });
    }

    finalEscape() {
        this.phase = 'done';
        this.busy = true;
        this.statusText.setText('');
        this.fleeFinal();
        this.showBanner('Se escapó', 'Nivel superado, pero con menos puntos', 1400);
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
        add(this.add.rectangle(W / 2, H / 2, 540, 280, COLORS.panel).setStrokeStyle(3, COLORS.mustard));
        const mgTitle = add(this.add.text(W / 2, H / 2 - 100, 'Golpe final', { fontFamily: FONT_TITLE, fontSize: '48px', color: '#c8102e' })
            .setOrigin(0.5).setShadow(3, 3, '#3a0008', 0, false, true));
        objs.push(addDrips(this, mgTitle, 61));
        mgTitle.setDepth(62);
        add(this.add.text(W / 2, H / 2 - 50, 'Pulsa Espacio o toca cuando la aguja esté en la zona verde', {
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
            Sfx.play('honk');
            this.time.delayedCall(120, () => Sfx.play('kill'));
            this.lunge(d);
            this.killFx(f);
            this.floatText(f.sprite.x, f.sprite.y - 20, `+${bonus}`, '#9fd356');
            this.time.delayedCall(1300, () => this.endLevel(true, bonus));
        } else {
            this.fleeFinal();
            this.showBanner('Se escapó', 'Nivel superado, pero con menos puntos', 1400);
            this.time.delayedCall(1700, () => this.endLevel(false, 0));
        }
    }

    // ---------- Fin del nivel ----------
    endLevel(finalKilled, finalBonus) {
        const killPoints = 3000;
        const huntMoves = this.huntMoves || this.moves;
        const efficiency = Math.max(0, 2000 - Math.max(0, huntMoves - LEVEL.par) * 150);
        const total = killPoints + efficiency + finalBonus;
        const stars = 1 + (finalKilled ? 1 : 0) + (huntMoves <= LEVEL.par + 2 ? 1 : 0);
        const newBest = total > (GameSettings.best || 0);
        if (newBest) { GameSettings.best = total; saveSettings(); }
        this.scene.start('Result', {
            killPoints, efficiency, finalKilled, finalBonus, total, stars, newBest,
            moves: huntMoves, par: LEVEL.par
        });
    }

    // ---------- Utilidades ----------
    showBanner(title, sub, hold = 1400, onDone) {
        const y = H / 2;
        const strip = this.add.rectangle(W / 2, y, W, 120, 0x0c060e, 0.92).setDepth(50).setScale(1, 0)
            .setStrokeStyle(3, COLORS.red);
        const t1 = this.add.text(W / 2, y - 16, title, { fontFamily: FONT_TITLE, fontSize: '46px', color: '#c8102e' })
            .setOrigin(0.5).setDepth(51).setAlpha(0).setShadow(3, 3, '#3a0008', 0, false, true);
        const t2 = this.add.text(W / 2, y + 30, sub, { fontFamily: FONT_BODY, fontSize: '18px', color: '#f2c14e', fontStyle: '600' })
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
