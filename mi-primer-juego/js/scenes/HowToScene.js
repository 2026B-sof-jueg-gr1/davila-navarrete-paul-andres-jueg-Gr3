class HowToScene extends Phaser.Scene {
    constructor() { super('HowTo'); }

    create() {
        drawCinemaBackdrop(this);
        addTitle(this, 'How to play', 120, '60px');

        const lines = [
            'The killer slides in a straight line until he hits something.',
            'If he hits a victim, he eliminates them.',
            'Eliminate every victim before you run out of moves.',
            'Then the last victim appears: you only have a few moves',
            'to reach her before she escapes.',
            'When you reach her, stop the needle in the green zone 3 times.',
            'If she escapes, you still win, but with fewer points.',
            'Clear a level to unlock the next one, and a world to open the next.',
            'Jason can press Space: his mother shows the next 5 best moves.',
            'Sober victims (no music notes) run away when you stop next to them.',
            '',
            'Arrows or WASD: move    Z: undo    R: restart    Esc: menu',
            'On touch screens: swipe to move and tap to strike.'
        ];
        this.add.text(W / 2, 330, lines.join('\n'), {
            fontFamily: FONT_BODY, fontSize: '18px', color: '#efe3c8', align: 'center', lineSpacing: 8
        }).setOrigin(0.5);

        const back = makeButton(this, W / 2, 540, 'Back', () => this.scene.start('Menu'));
        setupMenuNav(this, [back], () => this.scene.start('Menu'));
    }
}
