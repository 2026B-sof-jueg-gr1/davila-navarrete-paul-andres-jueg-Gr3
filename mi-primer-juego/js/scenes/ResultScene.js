class ResultScene extends Phaser.Scene {
    constructor() { super('Result'); }

    create(data) {
        drawTentBackdrop(this);
        addTitle(this, data.finalKilled ? 'Función completa' : 'Nivel superado', 116, '62px');

        // Estrellas
        for (let i = 0; i < 3; i++) {
            const on = i < data.stars;
            const s = this.add.star(W / 2 + (i - 1) * 80, 196, 5, 14, 32, on ? COLORS.mustard : COLORS.plum)
                .setStrokeStyle(3, on ? COLORS.red : 0x000000).setScale(0);
            this.tweens.add({ targets: s, scale: 1, duration: 350, delay: 250 + i * 180, ease: 'Back.easeOut' });
        }

        const rows = [
            ['Víctimas (3 × 1000)', data.killPoints],
            [`Eficiencia (${data.moves} mov., par ${data.par})`, data.efficiency],
            ['Última víctima', data.finalKilled ? data.finalBonus : 'escapó'],
            ['Total', data.total]
        ];
        rows.forEach(([k, v], i) => {
            const y = 262 + i * 36;
            const isTotal = i === rows.length - 1;
            const style = { fontFamily: FONT_BODY, fontSize: isTotal ? '24px' : '19px', color: isTotal ? '#9fd356' : '#efe3c8', fontStyle: isTotal ? '800' : '400' };
            this.add.text(220, y, k, style).setOrigin(0, 0.5);
            this.add.text(580, y, String(v), style).setOrigin(1, 0.5);
        });

        const note = data.newBest ? '¡Nuevo récord!' :
            (data.finalKilled ? `Récord: ${GameSettings.best}` : 'Atrapa a la última víctima para el puntaje máximo.');
        this.add.text(W / 2, 420, note, { fontFamily: FONT_BODY, fontSize: '18px', color: '#f2c14e' }).setOrigin(0.5);

        const again = makeButton(this, W / 2, 482, 'Jugar de nuevo', () => this.scene.start('Game'));
        const menu = makeButton(this, W / 2, 546, 'Menú principal', () => this.scene.start('Menu'));
        setupMenuNav(this, [again, menu], () => this.scene.start('Menu'));
        Sfx.play(data.finalKilled ? 'win' : 'lose');
    }
}
