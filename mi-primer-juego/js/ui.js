// Utilidades de interfaz compartidas
function makeButton(scene, x, y, label, onClick, opts = {}) {
    const w = opts.w || 300, h = opts.h || 52, size = opts.size || '22px';
    const bg = scene.add.rectangle(x, y, w, h, COLORS.panel)
        .setStrokeStyle(2, COLORS.mustard)
        .setInteractive({ useHandCursor: true });
    const txt = scene.add.text(x, y, label, {
        fontFamily: FONT_BODY, fontSize: size, color: '#efe3c8', fontStyle: '600'
    }).setOrigin(0.5);
    const btn = {
        bg, txt, onClick,
        setFocus(f) {
            bg.setFillStyle(f ? COLORS.red : COLORS.panel);
            bg.setStrokeStyle(2, f ? COLORS.lime : COLORS.mustard);
            txt.setColor(f ? '#ffffff' : '#efe3c8');
        },
        setLabel(l) { txt.setText(l); },
        setDepth(d) { bg.setDepth(d); txt.setDepth(d + 1); return btn; }
    };
    bg.on('pointerover', () => { if (opts.onHover) opts.onHover(); else btn.setFocus(true); });
    bg.on('pointerout', () => { if (!opts.onHover) btn.setFocus(false); });
    bg.on('pointerdown', () => { Sfx.play('click'); btn.onClick(); });
    return btn;
}

// Navegación con teclado (flechas + Enter) para listas de botones
function setupMenuNav(scene, buttons, onBack) {
    let index = 0;
    const focus = i => {
        index = (i + buttons.length) % buttons.length;
        buttons.forEach((b, j) => b.setFocus(j === index));
    };
    buttons.forEach((b, i) => b.bg.on('pointerover', () => focus(i)));
    focus(0);
    scene.input.keyboard.on('keydown', e => {
        if (e.code === 'ArrowUp' || e.code === 'KeyW') { focus(index - 1); Sfx.play('click'); }
        else if (e.code === 'ArrowDown' || e.code === 'KeyS') { focus(index + 1); Sfx.play('click'); }
        else if (e.code === 'Enter' || e.code === 'Space') { Sfx.play('click'); buttons[index].onClick(); }
        else if (e.code === 'Escape' && onBack) onBack();
    });
}

// Fondo de carpa: cenefa de circo y foquitos
function drawTentBackdrop(scene) {
    scene.cameras.main.setBackgroundColor(COLORS.bg);
    const g = scene.add.graphics();
    const n = 16, sw = W / n;
    for (let i = 0; i < n; i++) {
        g.fillStyle(i % 2 ? COLORS.bone : COLORS.red);
        g.fillRect(i * sw, 0, sw, 34);
        g.fillCircle(i * sw + sw / 2, 34, sw / 2);
    }
    g.fillStyle(0x000000, 0.25); g.fillRect(0, 0, W, 6);
    const bulbs = [];
    for (let i = 0; i < n; i++) {
        const b = scene.add.circle(i * sw + sw / 2, 62, 4, i % 3 ? COLORS.mustard : COLORS.lime);
        bulbs.push(b);
    }
    bulbs.forEach((b, i) => scene.tweens.add({
        targets: b, alpha: 0.2, duration: 300 + (i * 97) % 500, yoyo: true, repeat: -1, delay: (i * 131) % 700
    }));
    scene.add.image(W / 2, H / 2, 'vignette').setDepth(100);
}

function addTitle(scene, text, y, size = '64px') {
    const t = scene.add.text(W / 2, y, text, {
        fontFamily: FONT_TITLE, fontSize: size, color: '#c8102e'
    }).setOrigin(0.5).setShadow(3, 3, '#3a0008', 0, false, true);
    addDrips(scene, t);
    return t;
}

// Gotas de sangre que escurren bajo un texto
function addDrips(scene, t, depth) {
    const b = t.getBounds();
    const g = scene.add.graphics();
    if (depth !== undefined) g.setDepth(depth);
    const drops = [];
    const n = Math.max(4, Math.round(b.width / 55));
    const bottom = b.bottom - b.height * 0.22;
    for (let i = 0; i < n; i++) {
        const x = b.left + b.width * (0.08 + 0.84 * ((i + 0.5) / n)) + ((i * 37) % 13 - 6);
        const len = 8 + ((i * 53) % 26);
        const w = 3 + (i % 3);
        g.fillStyle(0x8f0a1e);
        g.fillRect(x - w / 2, bottom, w, len);
        g.fillCircle(x, bottom + len, w * 0.9);
        g.fillStyle(0xc8102e);
        g.fillRect(x - w / 2 + 0.5, bottom, w - 2, len * 0.7);
        const drip = scene.add.circle(x, bottom + len, w * 0.7, 0x8f0a1e);
        if (depth !== undefined) drip.setDepth(depth);
        drops.push(drip);
        scene.tweens.add({
            targets: drip, y: drip.y + 30 + (i % 4) * 10, alpha: 0, duration: 1400,
            delay: 600 + i * 450, repeat: -1, repeatDelay: 1800 + (i * 311) % 1500, ease: 'Quad.easeIn'
        });
    }
    if (depth !== undefined) t.setDepth(depth + 1);
    return { destroy() { g.destroy(); drops.forEach(d => d.destroy()); } };
}
