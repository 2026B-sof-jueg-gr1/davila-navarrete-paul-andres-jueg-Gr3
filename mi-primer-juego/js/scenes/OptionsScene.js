class OptionsScene extends Phaser.Scene {
    constructor() { super('Options'); }

    create() {
        drawCinemaBackdrop(this);
        addTitle(this, 'Options', 130, '64px');

        const order = ['facil', 'normal', 'dificil'];
        const label = {
            sound: () => `Sound: ${GameSettings.sound ? 'On' : 'Off'}`,
            diff: () => `Final blow: ${DIFFICULTY[GameSettings.difficulty].label}`,
            grid: () => `Grid: ${GameSettings.grid ? 'Visible' : 'Hidden'}`
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
        const reset = makeButton(this, W / 2, 422, 'Reset high score', () => {
            GameSettings.best = 0; saveSettings(); reset.setLabel('High score reset');
        }, opts);
        const back = makeButton(this, W / 2, 506, 'Back', () => this.scene.start('Menu'), opts);

        setupMenuNav(this, [sound, diff, grid, reset, back], () => this.scene.start('Menu'));
    }
}
