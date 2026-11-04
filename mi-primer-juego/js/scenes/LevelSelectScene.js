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
                    if (f) info.setText(`${lv.name}   ·   ${lv.map.join('').replace(/[^VS]/g, '').length} victims   ·   ${lv.maxMoves} moves`);
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

        // Candado arriba a la derecha: pide un código secreto que desbloquea todos los niveles
        this.navLocked = false;
        const lockBtn = makeButton(this, W / 2 + 300, 116, '', () => this.openCodePrompt(), { w: 58, h: 52 });
        this.drawLock(W / 2 + 300, 116, 0xefe3c8, GameSettings.unlockAll);
        const lockFocus = lockBtn.setFocus;
        lockBtn.setFocus = f => { lockFocus(f); if (f) info.setText(GameSettings.unlockAll ? 'All levels unlocked' : 'Enter a secret code'); };
        buttons.push(lockBtn);
        setupMenuNav(this, buttons, () => this.scene.start('Menu'), start);
    }

    // Ventana para escribir el código. Con teclado se escribe directo; en móvil un input oculto abre el teclado del sistema.
    openCodePrompt() {
        if (this.navLocked) return;
        this.navLocked = true;
        const objs = [], add = o => { objs.push(o); return o.setDepth(80); };
        add(this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.75).setInteractive());
        add(this.add.rectangle(W / 2, H / 2, 460, 260, COLORS.panel).setStrokeStyle(3, COLORS.neon));
        add(this.add.text(W / 2, H / 2 - 88, 'Secret code', { fontFamily: FONT_TITLE, fontSize: '40px', color: '#c8102e' })
            .setOrigin(0.5).setShadow(3, 3, '#3a0008', 0, false, true));
        const box = add(this.add.rectangle(W / 2, H / 2 - 10, 300, 58, 0x120a16).setStrokeStyle(2, COLORS.red).setInteractive({ useHandCursor: true }));
        const shown = add(this.add.text(W / 2, H / 2 - 10, '', { fontFamily: FONT_BODY, fontSize: '30px', color: '#efe3c8', fontStyle: '800' }).setOrigin(0.5));
        const msg = add(this.add.text(W / 2, H / 2 + 40, 'Type the code and press Enter', {
            fontFamily: FONT_BODY, fontSize: '15px', color: '#8a7a90', fontStyle: '600'
        }).setOrigin(0.5));
        const ok = makeButton(this, W / 2 - 75, H / 2 + 88, 'OK', () => submit(), { w: 120, h: 42, size: '20px' }).setDepth(80);
        const cancel = makeButton(this, W / 2 + 75, H / 2 + 88, 'Cancel', () => close(), { w: 120, h: 42, size: '20px' }).setDepth(80);
        objs.push(ok.bg, ok.txt, cancel.bg, cancel.txt);

        let value = '', done = false;
        const show = () => shown.setText(value + (value.length < 10 ? '_' : ''));
        show();
        const input = document.createElement('input');
        Object.assign(input, { type: 'text', autocomplete: 'off', autocapitalize: 'characters', spellcheck: false, maxLength: 10 });
        Object.assign(input.style, { position: 'fixed', left: '0', top: '0', width: '1px', height: '1px', opacity: '0', fontSize: '16px', border: '0' });
        document.body.appendChild(input);
        const focusInput = () => { try { input.focus(); } catch (e) { /* sin foco */ } };
        focusInput();
        box.on('pointerdown', focusInput);
        // Teclado del móvil (que no siempre manda teclas reconocibles): se lee lo escrito en el input
        input.addEventListener('input', () => {
            value = input.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10);
            input.value = value; show();
        });

        const onKey = e => {
            if (done) return;
            if (e.key === 'Enter') { e.preventDefault(); submit(); }
            else if (e.key === 'Escape') close();
            else if (e.key === 'Backspace') { e.preventDefault(); value = value.slice(0, -1); input.value = value; show(); }
            else if (/^[a-zA-Z0-9]$/.test(e.key) && value.length < 10) {
                e.preventDefault(); value += e.key.toUpperCase(); input.value = value; show();
            }
        };
        // Teclado nativo (no la cola de Phaser) para poder evitar que la letra se escriba dos veces en el input
        window.addEventListener('keydown', onKey);

        const close = () => {
            if (done) return;
            done = true;
            window.removeEventListener('keydown', onKey);
            input.remove();
            objs.forEach(o => { this.tweens.killTweensOf(o); o.destroy(); });
            // Se suelta un poco después para que el Enter/Escape que cerró la ventana no llegue al menú
            this.time.delayedCall(150, () => { this.navLocked = false; });
        };
        const submit = () => {
            if (done) return;
            if (value === UNLOCK_CODE) {
                done = true;
                window.removeEventListener('keydown', onKey);
                input.remove();
                GameSettings.unlockAll = true;
                saveSettings();
                Sfx.play('win');
                msg.setText('All levels unlocked!').setColor('#ff2a45').setFontSize('20px');
                shown.setColor('#ff2a45');
                this.cameras.main.flash(300, 200, 16, 46);
                this.time.delayedCall(1100, () => this.scene.restart());
            } else {
                Sfx.play('miss');
                msg.setText('Wrong code').setColor('#ff2a45');
                this.tweens.killTweensOf([box, shown]);
                box.x = shown.x = W / 2;
                this.tweens.add({ targets: [box, shown], x: '+=8', duration: 50, yoyo: true, repeat: 3 });
                value = ''; input.value = ''; show();
                focusInput();
            }
        };
        this.events.once('shutdown', () => { window.removeEventListener('keydown', onKey); input.remove(); });
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

    // open: el arco se dibuja levantado y hacia un lado
    drawLock(x, y, color, open) {
        const g = this.add.graphics();
        g.lineStyle(4, color); g.beginPath();
        if (open) g.arc(x + 9, y - 13, 9, Math.PI, 0); else g.arc(x, y - 6, 9, Math.PI, 0);
        g.strokePath();
        if (open) { g.lineBetween(x, y - 13, x, y - 6); }
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
