class OptionsScene extends Phaser.Scene {
    constructor() { super('Options'); }

    create() {
        drawTentBackdrop(this);
        addTitle(this, 'Opciones', 130, '64px');

        const order = ['facil', 'normal', 'dificil'];
        const label = {
            sound: () => `Sonido: ${GameSettings.sound ? 'Sí' : 'No'}`,
            diff: () => `Golpe final: ${DIFFICULTY[GameSettings.difficulty].label}`,
            grid: () => `Cuadrícula: ${GameSettings.grid ? 'Visible' : 'Oculta'}`
        };
        const opts = { w: 380 };

        const sound = makeButton(this, W / 2, 230, label.sound(), () => {
            GameSettings.sound = !GameSettings.sound; saveSettings(); sound.setLabel(label.sound());
        }, opts);
        const diff = makeButton(this, W / 2, 294, label.diff(), () => {
            const i = order.indexOf(GameSettings.difficulty);
            GameSettings.difficulty = order[(i + 1) % order.length]; saveSettings(); diff.setLabel(label.diff());
        }, opts);
        const grid = makeButton(this, W / 2, 358, label.grid(), () => {
            GameSettings.grid = !GameSettings.grid; saveSettings(); grid.setLabel(label.grid());
        }, opts);
        const reset = makeButton(this, W / 2, 422, 'Borrar récord', () => {
            GameSettings.best = 0; saveSettings(); reset.setLabel('Récord borrado');
        }, opts);
        const back = makeButton(this, W / 2, 506, 'Volver', () => this.scene.start('Menu'), opts);

        setupMenuNav(this, [sound, diff, grid, reset, back], () => this.scene.start('Menu'));
    }
}
