// Utilidades de interfaz compartidas
function makeButton(scene, x, y, label, onClick, opts = {}) {
    const w = opts.w || 300, h = opts.h || 52, size = opts.size || '22px';
    const bg = scene.add.rectangle(x, y, w, h, COLORS.panel)
        .setStrokeStyle(2, COLORS.neon)
        .setInteractive({ useHandCursor: true });
    const txt = scene.add.text(x, y, label, {
        fontFamily: FONT_BODY, fontSize: size, color: '#efe3c8', fontStyle: '600'
    }).setOrigin(0.5);
    const btn = {
        bg, txt, onClick,
        setFocus(f) {
            bg.setFillStyle(f ? COLORS.red : COLORS.panel);
            bg.setStrokeStyle(2, f ? COLORS.lime : COLORS.neon);
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
function setupMenuNav(scene, buttons, onBack, start = 0) {
    let index = 0;
    const focus = i => {
        index = (i + buttons.length) % buttons.length;
        buttons.forEach((b, j) => b.setFocus(j === index));
    };
    buttons.forEach((b, i) => b.bg.on('pointerover', () => focus(i)));
    focus(start);
    scene.input.keyboard.on('keydown', e => {
        if (['ArrowUp', 'KeyW', 'ArrowLeft', 'KeyA'].includes(e.code)) { focus(index - 1); Sfx.play('click'); }
        else if (['ArrowDown', 'KeyS', 'ArrowRight', 'KeyD'].includes(e.code)) { focus(index + 1); Sfx.play('click'); }
        else if (e.code === 'Enter' || e.code === 'Space') { Sfx.play('click'); buttons[index].onClick(); }
        else if (e.code === 'Escape' && onBack) onBack();
    });
}

// Fondo de cine abandonado: telón rasgado, haz del proyector con polvo, rayas de película y butacas
function drawCinemaBackdrop(scene) {
    scene.cameras.main.setBackgroundColor(0x0a0608);
    const g = scene.add.graphics();
    // Pantalla vieja y manchada al fondo
    g.fillStyle(0x16100f); g.fillRect(90, 70, W - 180, H - 170);
    g.fillStyle(0x000000, 0.35);
    [[180, 160, 70], [560, 260, 90], [300, 420, 60], [640, 470, 50]].forEach(([x, y, r]) => g.fillCircle(x, y, r));
    // Telones laterales con pliegues
    const curtain = (x0, dir) => {
        const folds = 6, fw = 13;
        for (let i = 0; i < folds; i++) {
            const x = x0 + dir * i * fw;
            g.fillStyle(i % 2 ? 0x5a0a14 : 0x7a0f1c); g.fillRect(dir > 0 ? x : x - fw, 0, fw, H);
            g.fillStyle(0x000000, 0.25); g.fillRect(dir > 0 ? x + fw - 3 : x - 3, 0, 3, H);
        }
        // Rasgaduras en el borde inferior
        g.fillStyle(0x0a0608);
        for (let i = 0; i < 5; i++) {
            const x = x0 + dir * (8 + i * 15);
            g.fillTriangle(x - 6, H, x + 6, H, x + ((i * 7) % 5) - 2, H - 22 - (i * 13) % 30);
        }
    };
    curtain(0, 1); curtain(W, -1);
    // Cenefa superior con borde ondulado
    g.fillStyle(0x4a0710); g.fillRect(0, 0, W, 30);
    for (let x = 0; x < W; x += 50) g.fillEllipse(x + 25, 30, 54, 26);
    g.fillStyle(0x000000, 0.3); g.fillRect(0, 0, W, 6);
    // Telarañas en las esquinas superiores
    g.lineStyle(1, 0xd8d0d0, 0.18);
    [[0, 1], [W, -1]].forEach(([cx, s]) => {
        for (let a = 0; a <= 4; a++) {
            const ang = a / 4 * Math.PI / 2;
            g.lineBetween(cx, 40, cx + s * Math.cos(ang) * 110, 40 + Math.sin(ang) * 110);
        }
        for (let r = 25; r <= 100; r += 25) {
            g.beginPath();
            for (let a = 0; a <= 4; a++) {
                const ang = a / 4 * Math.PI / 2, rr = r * (a % 2 ? 0.85 : 1);
                const px = cx + s * Math.cos(ang) * rr, py = 40 + Math.sin(ang) * rr;
                if (a === 0) g.moveTo(px, py); else g.lineTo(px, py);
            }
            g.strokePath();
        }
    });
    // Siluetas de butacas
    for (let i = 0; i < 14; i++) {
        const x = 10 + i * 58;
        g.fillStyle(0x050304); g.fillRoundedRect(x, H - 34, 50, 40, { tl: 14, tr: 14, bl: 0, br: 0 });
        g.fillStyle(0x2a0a10, 0.6); g.fillRect(x + 6, H - 28, 38, 3);
    }
    // Haz del proyector con polvo flotando
    const beam = scene.add.graphics();
    beam.fillStyle(0xffffff, 0.05);
    beam.fillTriangle(W - 40, -10, 120, H, W - 140, H);
    beam.fillStyle(0xffffff, 0.04);
    beam.fillTriangle(W - 40, -10, 220, H, W - 220, H);
    scene.tweens.add({ targets: beam, alpha: 0.55, duration: 90, yoyo: true, repeat: -1, repeatDelay: 2300, hold: 40 });
    for (let i = 0; i < 18; i++) {
        const t = (i * 0.37) % 1, x = 140 + t * (W - 300) + ((i * 53) % 60), y = 80 + ((i * 97) % (H - 140));
        const d = scene.add.circle(x, y, 1 + (i % 2), 0xffffff, 0.35);
        scene.tweens.add({
            targets: d, x: x + 20 - (i % 5) * 10, y: y - 30 - (i % 3) * 15, alpha: 0.05,
            duration: 3000 + (i * 431) % 2500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
        });
    }
    // Rayas de película que aparecen de vez en cuando
    for (let i = 0; i < 2; i++) {
        const s = scene.add.rectangle(200 + i * 330, H / 2, 1.5, H, 0xffffff).setAlpha(0).setDepth(99);
        scene.time.addEvent({
            delay: 700 + i * 450, loop: true, callback: () => {
                s.x = 100 + Math.random() * (W - 200);
                s.setAlpha(Math.random() < 0.35 ? 0.18 : 0);
            }
        });
    }
    scene.add.image(W / 2, H / 2, 'vignette').setDepth(100);
}

// Marquesina de cine con focos (algunos fundidos, otros parpadeando)
function drawMarquee(scene, y, w, h) {
    const g = scene.add.graphics();
    g.fillStyle(0x120709); g.fillRoundedRect(W / 2 - w / 2, y - h / 2, w, h, 10);
    g.lineStyle(3, COLORS.red); g.strokeRoundedRect(W / 2 - w / 2, y - h / 2, w, h, 10);
    g.lineStyle(1, COLORS.red, 0.5); g.strokeRoundedRect(W / 2 - w / 2 + 16, y - h / 2 + 16, w - 32, h - 32, 6);
    const pts = [];
    const step = 26, nx = Math.floor((w - 16) / step), ny = Math.floor((h - 16) / step);
    for (let i = 0; i <= nx; i++) {
        const x = W / 2 - (nx * step) / 2 + i * step;
        pts.push([x, y - h / 2 + 8], [x, y + h / 2 - 8]);
    }
    for (let j = 1; j < ny; j++) {
        const yy = y - (ny * step) / 2 + j * step;
        pts.push([W / 2 - w / 2 + 8, yy], [W / 2 + w / 2 - 8, yy]);
    }
    pts.forEach(([x, yy], i) => {
        const dead = (i * 7) % 11 === 0;
        const b = scene.add.circle(x, yy, 3.5, dead ? 0x3a1a1f : COLORS.neon);
        if (!dead && i % 5 === 0) {
            scene.tweens.add({ targets: b, alpha: 0.15, duration: 70, yoyo: true, repeat: -1, repeatDelay: 900 + (i * 173) % 2200 });
        }
    });
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
