const gameState = {
    selectedTile: [-10, -10],
    prevTile: [-10, -10],
    activeTweens: 0,
    multiplier: 1
}

const config = {
    type: Phaser.AUTO,
    backgroundColor: "666666",
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        parent: 'phaser-example',
        width: 720,
        height: 1280
    },
    physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 800 },
          enableBody: true,
          debug: false
        }
      },
    scene: [MenuScene, LevelScene]
}

const game = new Phaser.Game(config)