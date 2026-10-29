class MenuScene extends Phaser.Scene {
    constructor() { super('Menu'); }

    create() {
        generateTextures(this);
        drawTentBackdrop(this);

        addTitle(this, 'Risas Macabras', 128, '84px');
        this.add.text(W / 2, 216, 'Un puzzle de payaso asesino en una feria abandonada', {
            fontFamily: FONT_BODY, fontSize: '18px', color: '#efe3c8'
        }).setOrigin(0.5).setAlpha(0.85);

        const clown = this.add.image(128, 420, 'clown').setScale(1.7);
        this.tweens.add({ targets: clown, y: 410, scaleY: 1.76, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
        const victim = this.add.image(660, 440, 'finalGirl').setScale(1.2).setFlipX(true);
        this.tweens.add({ targets: victim, x: 664, duration: 60, yoyo: true, repeat: -1 });

        const buttons = [
            makeButton(this, W / 2, 290, 'Iniciar juego', () => this.scene.start('Game')),
            makeButton(this, W / 2, 354, 'Cómo jugar', () => this.scene.start('HowTo')),
            makeButton(this, W / 2, 418, 'Opciones', () => this.scene.start('Options'))
        ];
        setupMenuNav(this, buttons);

        const best = GameSettings.best ? `Récord: ${GameSettings.best} puntos` : 'Aún no hay récord';
        this.add.text(W / 2, 486, best, { fontFamily: FONT_BODY, fontSize: '18px', color: '#f2c14e' }).setOrigin(0.5);
        this.add.text(W / 2, H - 30, 'Flechas y Enter para elegir', {
            fontFamily: FONT_BODY, fontSize: '14px', color: '#efe3c8'
        }).setOrigin(0.5).setAlpha(0.55);
    }
}
