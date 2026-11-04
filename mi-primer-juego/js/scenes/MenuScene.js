class MenuScene extends Phaser.Scene {
    constructor() { super('Menu'); }

    create() {
        generateTextures(this);
        drawCinemaBackdrop(this);

        drawMarquee(this, 132, 640, 124);
        addTitle(this, 'Late Night Feature', 128, '72px');
        this.add.text(W / 2, 216, 'A puzzle game starring slasher icons', {
            fontFamily: FONT_BODY, fontSize: '18px', color: '#efe3c8'
        }).setOrigin(0.5).setAlpha(0.85);

        // Asesino del último nivel jugado (por ejemplo, Art navideño); si no hay, el del primer mundo
        const last = lastPlayedLevel();
        const lastWorld = last ? WORLDS[last.world] : WORLDS[0];
        const killerTex = (last && lastWorld.levels[last.level].killerTex) || lastWorld.killerTex;
        // Ambos personajes apoyados en la misma línea de piso (origen en los pies), lejos de las cortinas
        const floorY = 528;
        const clown = this.add.image(150, floorY, killerTex).setOrigin(0.5, 1);
        this.tweens.add({ targets: clown, scaleY: 1.04, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
        const victim = this.add.image(660, floorY, 'finalGirl').setOrigin(0.5, 1).setFlipX(true);
        this.tweens.add({ targets: victim, x: 664, duration: 60, yoyo: true, repeat: -1 });

        // "Continue" aparece si hay un último nivel jugado guardado
        const actions = [];
        if (last) actions.push([`Continue  (Level ${last.world + 1}-${last.level + 1})`, () => this.scene.start('Game', last)]);
        actions.push(['Play', () => this.scene.start('LevelSelect')]);
        actions.push(['How to play', () => this.scene.start('HowTo')]);
        actions.push(['Options', () => this.scene.start('Options')]);
        const step = last ? 58 : 64, top = last ? 282 : 290;
        const buttons = actions.map(([label, fn], i) => makeButton(this, W / 2, top + i * step, label, fn, { w: 320, h: last ? 48 : 52 }));
        setupMenuNav(this, buttons);

        const best = GameSettings.best ? `High score: ${GameSettings.best} points` : 'No high score yet';
        this.add.text(W / 2, last ? 524 : 486, best, { fontFamily: FONT_BODY, fontSize: '18px', color: '#ff2a45' }).setOrigin(0.5);
        this.add.text(W / 2, H - 30, 'Arrows and Enter to choose', {
            fontFamily: FONT_BODY, fontSize: '14px', color: '#efe3c8'
        }).setOrigin(0.5).setAlpha(0.55);
    }
}
