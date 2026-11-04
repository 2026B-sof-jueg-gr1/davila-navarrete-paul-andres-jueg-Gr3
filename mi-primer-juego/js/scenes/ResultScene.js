class ResultScene extends Phaser.Scene {
    constructor() { super('Result'); }

    create(data) {
        drawCinemaBackdrop(this);
        const world = WORLDS[data.world], next = WORLDS[data.world + 1];
        const hasNext = data.level + 1 < world.levels.length;
        const last = data.level === (world.planned || world.levels.length) - 1;
        const nextWorld = !hasNext && next && next.levels.length && worldUnlocked(data.world + 1);
        addTitle(this, data.finalKilled ? (last ? 'World complete' : `Level ${data.world + 1}-${data.level + 1} complete`) : `Level ${data.world + 1}-${data.level + 1} cleared`, 116, '62px');

        // Estrellas
        for (let i = 0; i < 3; i++) {
            const on = i < data.stars;
            const s = this.add.star(W / 2 + (i - 1) * 80, 196, 5, 14, 32, on ? COLORS.neon : COLORS.plum)
                .setStrokeStyle(3, on ? COLORS.red : 0x000000).setScale(0);
            this.tweens.add({ targets: s, scale: 1, duration: 350, delay: 250 + i * 180, ease: 'Back.easeOut' });
        }

        const rows = [
            [`Victims (${data.victims} × 1000)`, data.killPoints],
            [`Efficiency (${data.moves} moves, par ${data.par})`, data.efficiency],
            ['Last victim', data.finalKilled ? data.finalBonus : 'escaped'],
            ['Total', data.total]
        ];
        rows.forEach(([k, v], i) => {
            const y = 262 + i * 36;
            const isTotal = i === rows.length - 1;
            const style = { fontFamily: FONT_BODY, fontSize: isTotal ? '24px' : '19px', color: isTotal ? '#9fd356' : '#efe3c8', fontStyle: isTotal ? '800' : '400' };
            this.add.text(220, y, k, style).setOrigin(0, 0.5);
            this.add.text(580, y, String(v), style).setOrigin(1, 0.5);
        });

        const note = data.newBest ? 'New high score!' :
            (data.finalKilled ? `High score: ${GameSettings.best}` : 'Catch the last victim for the top score.');
        this.add.text(W / 2, 420, note, { fontFamily: FONT_BODY, fontSize: '18px', color: '#ff2a45' }).setOrigin(0.5);

        // Siguiente nivel (si queda alguno), reintentar y menú
        const actions = [];
        if (hasNext) actions.push(['Next level', () => this.scene.start('Game', { world: data.world, level: data.level + 1 })]);
        else if (nextWorld) actions.push(['Next world', () => this.scene.start('Game', { world: data.world + 1, level: 0 })]);
        actions.push(['Retry', () => this.scene.start('Game', { world: data.world, level: data.level })]);
        actions.push(['Level select', () => this.scene.start('LevelSelect')]);
        const top = actions.length === 3 ? 466 : 482;
        const buttons = actions.map(([label, fn], i) => makeButton(this, W / 2, top + i * 56, label, fn, { h: 46 }));
        setupMenuNav(this, buttons, () => this.scene.start('LevelSelect'));
        Sfx.play(data.finalKilled ? 'win' : 'lose');
    }
}
