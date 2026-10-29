// Espera a que carguen las fuentes (máximo 2.5 s) y arranca el juego
function startGame() {
    new Phaser.Game({
        type: Phaser.AUTO,
        parent: 'game',
        width: W,
        height: H,
        backgroundColor: '#140b18',
        scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
        scene: [MenuScene, OptionsScene, HowToScene, GameScene, ResultScene]
    });
}

const fontsReady = (document.fonts && document.fonts.load)
    ? Promise.all([document.fonts.load('48px "Creepster"'), document.fonts.load('600 20px "Rubik"')])
    : Promise.resolve();
Promise.race([fontsReady, new Promise(r => setTimeout(r, 2500))])
    .catch(() => {})
    .then(startGame);
