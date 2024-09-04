class MenuScene extends Phaser.Scene {
    constructor() {
        super({key: 'Menu'})
    }

    preload() {
        this.load.image('bg', 'assets/bg_cropped.png')
        this.load.image('btn', 'assets/UI/2.png')
        this.load.image('btnOverlay', 'assets/UI/3.png')
        this.load.audio('pop', 'assets/audio/pop.mp3')
        this.load.audio('swoosh', 'assets/audio/swoosh.mp3')
    }

    create() {
        const bg = this.add.image(0, 0, 'bg').setOrigin(0, 0)
        bg.setDisplaySize(720, 1280)
        const title = this.add.text(0, 0, 'Totally Not\nCandy Crush!', 
            {fontSize: '70px', fill: '#ffccef', align: 'center', fontStyle: 'bold',
            fontFamily: 'Comic Sans MS', stroke: '#000000', strokeThickness: 6})
        title.setX(this.cameras.main.width / 2 - title.width / 2);
        title.setY(this.cameras.main.height / 8 - title.height / 8);
        const playX = this.cameras.main.width / 2
        const playY = this.cameras.main.height / 2
        const playBtn = this.add.image(playX, playY, 'btn').setOrigin(0.5, 0.5).setScale(1.2, 1.2)
        this.add.text(playX, playY, 'Play!', 
            {fontSize: '60px', fill: '#ffccef', align: 'center', fontStyle: 'bold',
            fontFamily: 'Comic Sans MS', stroke: '#000000', strokeThickness: 6}).setOrigin(0.5, 0.5)
        playBtn.setInteractive()
        playBtn.on('pointerdown', () => {
            this.sound.play('pop', {seek: 0.23})
            const playBtnOverlay = this.add.image(playX, playY, 'btnOverlay').setOrigin(0.5, 0.5).setScale(1.2, 1.2).setAlpha(0.5)
            this.input.on('pointerup', () => {
                playBtnOverlay.destroy()
            })
            playBtn.on('pointerup', () => {
                this.scene.start('Level')
            })
        })
    }
}