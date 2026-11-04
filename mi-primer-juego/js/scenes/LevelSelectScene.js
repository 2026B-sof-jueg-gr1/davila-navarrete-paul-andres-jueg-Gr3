// Selector de niveles: un panel por mundo; los niveles se desbloquean al superar el anterior
class LevelSelectScene extends Phaser.Scene {
    constructor() { super('LevelSelect'); }

    create() {
        drawCinemaBackdrop(this);
        addTitle(this, 'Select a level', 116, '56px');

        const buttons = [];
        let start = 0;
        const last = lastPlayedLevel();
        const info = this.add.text(W / 2, 500, '', {
            fontFamily: FONT_BODY, fontSize: '18px', color: '#ff2a45', fontStyle: '600'
        }).setOrigin(0.5);

        WORLDS.forEach((world, w) => {
            const wy = 232 + w * 166;
            if (!world.levels.length) { this.drawComingSoon(world, w, wy); return; }
            this.drawWorldHeader(world, w, wy, 150);
            if (!worldUnlocked(w)) {
                this.add.text(W / 2 + 320, wy - 53, `Clear World ${w} to unlock`, {
                    fontFamily: FONT_BODY, fontSize: '15px', color: '#8a7a90', fontStyle: '600'
                }).setOrigin(1, 0.5);
            }
            const unlocked = unlockedLevels(w);
            for (let l = 0; l < (world.planned || world.levels.length); l++) {
                const lv = world.levels[l], x = W / 2 + (l - 2) * 124, y = wy + 5;
                if (!lv) { this.drawLockedTile(x, y, true); continue; }
                if (l >= unlocked) { this.drawLockedTile(x, y); continue; }
                const btn = makeButton(this, x, y, String(l + 1), () => this.scene.start('Game', { world: w, level: l }),
                    { w: 100, h: 70, size: '30px' });
                // Al enfocar un nivel se muestra su nombre y datos
                const baseFocus = btn.setFocus;
                btn.setFocus = f => {
                    baseFocus(f);
                    if (f) info.setText(`${lv.name}   ·   ${lv.map.join('').split('V').length - 1} victims   ·   ${lv.maxMoves} moves`);
                };
                this.drawStars(x, y + 50, levelStars(w, l));
                buttons.push(btn);
                // Enfoca el último nivel jugado; si no hay, el último desbloqueado
                if (!last || (last.world === w && last.level === l)) start = buttons.length - 1;
            }
        });

        buttons.push(makeButton(this, W / 2, 580, 'Back', () => this.scene.start('Menu'), { h: 46 }));
        const backBtn = buttons[buttons.length - 1], backFocus = backBtn.setFocus;
        backBtn.setFocus = f => { backFocus(f); if (f) info.setText(''); };
        setupMenuNav(this, buttons, () => this.scene.start('Menu'), start);
    }

    drawWorldHeader(world, w, y, h) {
        this.add.rectangle(W / 2, y, 680, h, COLORS.panel, 0.9).setStrokeStyle(2, COLORS.red);
        const top = y - h / 2 + 22;
        this.add.text(W / 2 - 320, top, `World ${w + 1}  ·  ${world.name}`, {
            fontFamily: FONT_BODY, fontSize: '20px', color: '#efe3c8', fontStyle: '800'
        }).setOrigin(0, 0.5);
    }

    // Nivel bloqueado (candado) o todavía no hecho ("Soon")
    drawLockedTile(x, y, soon) {
        this.add.rectangle(x, y, 100, 70, 0x120a16).setStrokeStyle(2, COLORS.plum);
        if (!soon) { this.drawLock(x, y, COLORS.plum); return; }
        this.add.text(x, y, 'Soon', { fontFamily: FONT_TITLE, fontSize: '24px', color: '#5a3a66' }).setOrigin(0.5);
    }

    drawLock(x, y, color) {
        const g = this.add.graphics();
        g.lineStyle(4, color); g.beginPath(); g.arc(x, y - 6, 9, Math.PI, 0); g.strokePath();
        g.fillStyle(color); g.fillRoundedRect(x - 14, y - 6, 28, 22, 4);
        g.fillStyle(0x120a16); g.fillCircle(x, y + 3, 3); g.fillRect(x - 1, y + 3, 2, 7);
    }

    drawStars(x, y, n) {
        for (let i = 0; i < 3; i++) {
            const on = i < n;
            this.add.star(x + (i - 1) * 20, y, 5, 4, 8, on ? COLORS.neon : COLORS.plum)
                .setStrokeStyle(1.5, on ? COLORS.red : 0x000000);
        }
    }

    drawComingSoon(world, w, y) {
        this.add.rectangle(W / 2, y, 680, 110, 0x120a16, 0.9).setStrokeStyle(2, COLORS.plum);
        this.add.text(W / 2 - 320, y - 33, `World ${w + 1}  ·  ${world.name}`, {
            fontFamily: FONT_BODY, fontSize: '20px', color: '#8a7a90', fontStyle: '800'
        }).setOrigin(0, 0.5);
        this.drawLock(W / 2 - 150, y + 14, COLORS.plum);
        const t = this.add.text(W / 2 + 20, y + 14, 'Coming soon', {
            fontFamily: FONT_TITLE, fontSize: '40px', color: '#c8102e'
        }).setOrigin(0.5).setShadow(3, 3, '#3a0008', 0, false, true);
        this.tweens.add({ targets: t, alpha: 0.55, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    }
}
