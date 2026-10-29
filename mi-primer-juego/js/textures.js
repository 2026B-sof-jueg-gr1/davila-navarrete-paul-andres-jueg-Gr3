// Todas las texturas se dibujan por código: el juego no depende de imágenes externas
function generateTextures(scene) {
    if (scene.textures.exists('clown')) return;
    const mk = (key, w, h, draw) => {
        const g = scene.make.graphics({ x: 0, y: 0, add: false });
        draw(g);
        g.generateTexture(key, w, h);
        g.destroy();
    };

    // Piso tipo feria abandonada (damero oscuro)
    const floor = (key, tones) => mk(key, T, T, g => {
        for (let i = 0; i < 4; i++) {
            g.fillStyle(tones[i % tones.length]); g.fillRect(0, i * 16, T, 16);
            g.fillStyle(0x000000, 0.35); g.fillRect(0, i * 16 + 15, T, 1);
            g.fillStyle(0xffffff, 0.04); g.fillRect(0, i * 16, T, 1);
            const seam = (i % 2) ? 22 : 46;
            g.fillStyle(0x000000, 0.3); g.fillRect(seam, i * 16, 1, 15);
            g.fillStyle(0x000000, 0.25); g.fillCircle(seam + 4, i * 16 + 8, 1);
        }
        g.lineStyle(1, 0x000000, 0.12); g.lineBetween(6, 6, 18, 7); g.lineBetween(30, 38, 44, 39);
    });
    floor('floorA', [0x2b1d24, 0x31212a, 0x281a21, 0x2e1f27]);
    floor('floorB', [0x251920, 0x2b1d25, 0x22171d, 0x281b22]);

    // Panel de carpa de circo con franjas
    mk('wall', T, T, g => {
        g.fillStyle(0x3b0a16); g.fillRect(0, 0, T, T);
        for (let x = 4; x < T - 4; x += 14) {
            g.fillStyle(0x9e1530); g.fillRect(x, 6, 7, T - 12);
            g.fillStyle(0xe9dcc0); g.fillRect(x + 7, 6, 7, T - 12);
        }
        g.fillStyle(0xf2c14e); g.fillRect(2, 2, T - 4, 5); g.fillRect(2, T - 7, T - 4, 5);
        g.fillStyle(0x000000, 0.25); g.fillRect(2, T - 7, T - 4, 5);
    });

    // Caja de madera con estrella pintada
    mk('crate', T, T, g => {
        g.fillStyle(0x5a3a22); g.fillRect(4, 4, T - 8, T - 8);
        g.lineStyle(4, 0x3a2414); g.strokeRect(6, 6, T - 12, T - 12);
        g.lineBetween(8, 8, T - 8, T - 8); g.lineBetween(T - 8, 8, 8, T - 8);
        g.fillStyle(0xf2c14e, 0.85); g.fillCircle(T / 2, T / 2, 7);
        g.fillStyle(0x000000, 0.3); g.fillRect(4, T - 10, T - 8, 6);
    });

    // Personajes a 128 px (se muestran a 0.5 para que se vean nítidos)
    const OL = 0x1a0a1f;

    // Payaso asesino original: "Bufo"
    mk('clown', 128, 128, g => {
        g.fillStyle(0x000000, 0.35); g.fillEllipse(64, 118, 84, 16);
        // Medias a rayas
        [46, 70].forEach(x => {
            g.fillStyle(0x5b2a86); g.fillRect(x, 92, 12, 20);
            g.fillStyle(0x9fd356); for (let y = 94; y < 112; y += 6) g.fillRect(x, y, 12, 3);
            g.lineStyle(2, OL); g.strokeRect(x, 92, 12, 20);
        });
        // Zapatos
        [[47, 114], [81, 114]].forEach(([x, y]) => {
            g.fillStyle(0xd7263d); g.fillEllipse(x, y, 32, 14);
            g.lineStyle(3, OL); g.strokeEllipse(x, y, 32, 14);
            g.fillStyle(0xffffff, 0.35); g.fillEllipse(x - 5, y - 3, 12, 4);
        });
        // Brazo izquierdo
        g.fillStyle(0x4a2170); g.fillRoundedRect(24, 70, 14, 28, 6);
        g.lineStyle(3, OL); g.strokeRoundedRect(24, 70, 14, 28, 6);
        g.fillStyle(0xf4efe4); g.fillCircle(31, 100, 8); g.lineStyle(3, OL); g.strokeCircle(31, 100, 8);
        // Torso con rombos
        g.fillStyle(0x5b2a86); g.fillRoundedRect(34, 62, 60, 38, 14);
        g.fillStyle(0x9fd356);
        [[50, 82], [78, 82]].forEach(([x, y]) => { g.fillTriangle(x - 9, y, x, y - 12, x + 9, y); g.fillTriangle(x - 9, y, x, y + 12, x + 9, y); });
        g.fillStyle(0x000000, 0.22); g.fillRoundedRect(74, 62, 20, 38, { tl: 0, tr: 14, bl: 0, br: 14 });
        g.lineStyle(3, OL); g.strokeRoundedRect(34, 62, 60, 38, 14);
        // Pompones
        [[64, 76], [64, 90]].forEach(([x, y]) => {
            g.fillStyle(0xffd23f); g.fillCircle(x, y, 6); g.lineStyle(2, OL); g.strokeCircle(x, y, 6);
            g.fillStyle(0xffffff, 0.6); g.fillCircle(x - 2, y - 2, 2);
        });
        // Gola de volantes
        for (let i = -3; i <= 3; i++) {
            const x = 64 + i * 10, y = 63 + Math.abs(i) * 1.5;
            g.fillStyle(0xf4efe4); g.fillCircle(x, y, 10);
            g.lineStyle(2.5, OL); g.strokeCircle(x, y, 10);
        }
        g.fillStyle(0xd7263d); for (let i = -3; i <= 3; i++) g.fillCircle(64 + i * 10, 70 + Math.abs(i) * 1.5, 2.5);
        // Pelo
        g.fillStyle(0xff7a1a);
        [[34, 36, 14], [94, 36, 14], [38, 20, 11], [90, 20, 11], [30, 52, 9], [98, 52, 9]].forEach(([x, y, r]) => {
            g.fillCircle(x, y, r); g.lineStyle(3, OL); g.strokeCircle(x, y, r); g.fillStyle(0xff7a1a); g.fillCircle(x, y, r - 1.5);
        });
        g.fillStyle(0xffa45c); [[30, 32], [90, 32], [36, 16]].forEach(([x, y]) => g.fillCircle(x, y, 4));
        // Cabeza
        g.fillStyle(0xa9c98c); g.fillCircle(64, 38, 27);
        g.fillStyle(0xd3eab9); g.fillCircle(61, 35, 24);
        g.lineStyle(3, OL); g.strokeCircle(64, 38, 27);
        g.fillStyle(0xe57f9b, 0.45); g.fillCircle(44, 48, 6); g.fillCircle(84, 48, 6);
        // Maquillaje y ojos
        g.fillStyle(0x5b2a86);
        g.fillTriangle(44, 30, 60, 30, 52, 52); g.fillTriangle(68, 30, 84, 30, 76, 52);
        g.fillStyle(0x140910); g.fillEllipse(52, 36, 15, 16); g.fillEllipse(76, 36, 15, 16);
        g.fillStyle(0xfff04a); g.fillCircle(53, 37, 4.5); g.fillCircle(75, 37, 4.5);
        g.fillStyle(0xff8a00); g.fillCircle(53, 38, 2); g.fillCircle(75, 38, 2);
        g.fillStyle(0xffffff); g.fillCircle(51, 35, 1.6); g.fillCircle(73, 35, 1.6);
        g.lineStyle(4, OL); g.lineBetween(41, 22, 58, 28); g.lineBetween(87, 22, 70, 28);
        // Nariz
        g.fillStyle(0xe0102f); g.fillCircle(64, 48, 8); g.lineStyle(2.5, OL); g.strokeCircle(64, 48, 8);
        g.fillStyle(0xffffff, 0.7); g.fillCircle(61, 45, 2.5);
        // Sonrisa
        g.fillStyle(0x2a0a12);
        g.beginPath(); g.moveTo(40, 52); g.lineTo(88, 52); g.lineTo(80, 60); g.lineTo(64, 63); g.lineTo(48, 60); g.closePath(); g.fillPath();
        g.lineStyle(2.5, OL); g.strokePath();
        g.fillStyle(0xfff6e0); for (let x = 44; x < 84; x += 6) g.fillTriangle(x, 52, x + 5, 52, x + 2.5, 57);
        g.lineStyle(2, 0xe0102f); g.lineBetween(40, 52, 34, 48); g.lineBetween(88, 52, 94, 48);
        // Mazo
        g.fillStyle(0x8a5a2b); g.fillRect(103, 34, 8, 60); g.lineStyle(3, OL); g.strokeRect(103, 34, 8, 60);
        g.fillStyle(0xb07a45); g.fillRect(105, 36, 2, 56);
        g.fillStyle(0xd7263d); g.fillRoundedRect(86, 14, 42, 26, 6); g.lineStyle(3, OL); g.strokeRoundedRect(86, 14, 42, 26, 6);
        g.fillStyle(0xf4efe4); g.fillRect(94, 15, 5, 24); g.fillRect(115, 15, 5, 24);
        g.fillStyle(0xffffff, 0.35); g.fillRect(89, 18, 36, 4);
        g.fillStyle(0xf4efe4); g.fillCircle(107, 78, 8); g.lineStyle(3, OL); g.strokeCircle(107, 78, 8);
    });

    // Víctimas asustadas, estilo chibi
    const victim = (key, shirt, hair, skin, hairStyle) => mk(key, 128, 128, g => {
        g.fillStyle(0x000000, 0.35); g.fillEllipse(64, 118, 64, 14);
        g.fillStyle(0x23304a); g.fillRoundedRect(48, 94, 13, 22, 4); g.fillRoundedRect(67, 94, 13, 22, 4);
        g.lineStyle(2.5, OL); g.strokeRoundedRect(48, 94, 13, 22, 4); g.strokeRoundedRect(67, 94, 13, 22, 4);
        // Brazos en alto
        [[30, 1], [98, -1]].forEach(([x]) => {
            g.fillStyle(shirt); g.fillRoundedRect(x - 6, 50, 12, 30, 6);
            g.lineStyle(2.5, OL); g.strokeRoundedRect(x - 6, 50, 12, 30, 6);
            g.fillStyle(skin); g.fillCircle(x, 46, 7); g.lineStyle(2.5, OL); g.strokeCircle(x, 46, 7);
        });
        if (hairStyle === 'long') {
            g.fillStyle(hair); g.fillRoundedRect(36, 26, 56, 52, 18); g.lineStyle(3, OL); g.strokeRoundedRect(36, 26, 56, 52, 18);
        }
        g.fillStyle(shirt); g.fillRoundedRect(40, 66, 48, 34, 12);
        g.fillStyle(0x000000, 0.18); g.fillRoundedRect(70, 66, 18, 34, { tl: 0, tr: 12, bl: 0, br: 12 });
        g.lineStyle(3, OL); g.strokeRoundedRect(40, 66, 48, 34, 12);
        // Cabeza
        g.fillStyle(skin); g.fillCircle(64, 44, 24); g.lineStyle(3, OL); g.strokeCircle(64, 44, 24);
        g.fillStyle(0x000000, 0.08); g.fillCircle(70, 48, 18);
        g.fillStyle(hair);
        if (hairStyle === 'spiky') {
            g.fillTriangle(40, 34, 50, 14, 58, 30); g.fillTriangle(52, 30, 64, 10, 74, 30); g.fillTriangle(70, 30, 80, 14, 88, 34);
            g.fillEllipse(64, 28, 50, 16);
        } else if (hairStyle === 'bun') {
            g.fillCircle(64, 14, 10); g.fillEllipse(64, 28, 50, 18);
        } else {
            g.fillEllipse(64, 28, 52, 20);
        }
        // Ojos asustados
        g.fillStyle(0xffffff); g.fillEllipse(55, 44, 12, 14); g.fillEllipse(73, 44, 12, 14);
        g.lineStyle(2, OL); g.strokeEllipse(55, 44, 12, 14); g.strokeEllipse(73, 44, 12, 14);
        g.fillStyle(0x111111); g.fillCircle(55, 46, 3); g.fillCircle(73, 46, 3);
        g.fillStyle(0xffffff); g.fillCircle(54, 45, 1); g.fillCircle(72, 45, 1);
        g.lineStyle(2.5, OL); g.lineBetween(48, 33, 58, 36); g.lineBetween(80, 33, 70, 36);
        // Boca
        g.fillStyle(0x3a0d16); g.fillEllipse(64, 57, 10, 12);
        g.fillStyle(0xd7263d); g.fillEllipse(64, 60, 6, 4);
        // Gota de sudor
        g.fillStyle(0x7fc8ff); g.fillTriangle(88, 22, 92, 32, 84, 32); g.fillCircle(88, 32, 4.5);
        g.fillStyle(0xffffff, 0.8); g.fillCircle(87, 31, 1.3);
    });
    victim('victimA', 0x2a9d8f, 0x5a3a22, 0xf1c7a3, 'spiky');
    victim('victimB', 0xe9c46a, 0x1c1c1c, 0xc68b59, 'short');
    victim('victimC', 0xe76f9a, 0xf6d36b, 0xf6d5bd, 'bun');
    victim('finalGirl', 0xf4efe4, 0x6b2d1a, 0xe8b894, 'long');

    // Luz cálida que acompaña al payaso
    mk('light', 256, 256, g => {
        for (let r = 128; r > 0; r -= 8) { g.fillStyle(0xffc46b, 0.018); g.fillCircle(128, 128, r); }
    });

    // Mancha caricaturesca
    mk('splat', T, T, g => {
        g.fillStyle(0x8f0a1e, 0.9);
        g.fillEllipse(32, 34, 40, 26);
        [[12, 26, 6], [52, 30, 5], [20, 50, 5], [46, 48, 4], [32, 14, 4], [56, 42, 3]]
            .forEach(([x, y, r]) => g.fillCircle(x, y, r));
        g.fillStyle(0xc2172f, 0.6); g.fillEllipse(28, 30, 16, 8);
    });

    mk('px', 6, 6, g => { g.fillStyle(0xffffff); g.fillRect(0, 0, 6, 6); });
    mk('ring', 72, 72, g => { g.lineStyle(4, 0xf2c14e, 1); g.strokeCircle(36, 36, 32); });

    // Viñeta oscura
    const tex = scene.textures.createCanvas('vignette', W, H);
    const ctx = tex.getContext();
    const grad = ctx.createRadialGradient(W / 2, H / 2 + 20, 180, W / 2, H / 2, 520);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(1, 'rgba(0,0,0,0.78)');
    ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H);
    tex.refresh();
}
