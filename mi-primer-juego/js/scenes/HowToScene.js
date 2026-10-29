class HowToScene extends Phaser.Scene {
    constructor() { super('HowTo'); }

    create() {
        drawTentBackdrop(this);
        addTitle(this, 'Cómo jugar', 120, '60px');

        const lines = [
            'Bufo se desliza en línea recta hasta chocar con algo.',
            'Si choca con una víctima, la elimina.',
            'Elimina a las 3 víctimas para completar el nivel.',
            'Después aparece la última víctima: tienes pocos movimientos',
            'para alcanzarla antes de que escape.',
            'Al alcanzarla, detén la aguja en la zona verde 3 veces.',
            'Si escapa, igual ganas, pero con menos puntos.',
            '',
            'Flechas o WASD: mover    Z: deshacer    R: reiniciar    Esc: menú',
            'En pantallas táctiles: desliza para moverte y toca para golpear.'
        ];
        this.add.text(W / 2, 330, lines.join('\n'), {
            fontFamily: FONT_BODY, fontSize: '18px', color: '#efe3c8', align: 'center', lineSpacing: 8
        }).setOrigin(0.5);

        const back = makeButton(this, W / 2, 540, 'Volver', () => this.scene.start('Menu'));
        setupMenuNav(this, [back], () => this.scene.start('Menu'));
    }
}
