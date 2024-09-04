class LevelScene extends Phaser.Scene {
    constructor() {
        super({key: 'Level'})
    }

    preload() {
        this.load.image('tile', 'assets/UI/7.png')
        this.load.image('tileOverlay', 'assets/UI/1.png')
        this.load.image('candy1', 'assets/ico/3.png')
        this.load.image('candy2', 'assets/ico/7.png')
        this.load.image('candy3', 'assets/ico/13.png')
        this.load.image('candy4', 'assets/ico/17.png')
    }

    create() {
        const bg = this.add.image(0, 0, 'bg').setOrigin(0, 0)
        bg.setDisplaySize(720, 1280)
        gameState.score = 0
        gameState.scoreText = this.add.text(0, 0, 'Score: 0', 
            {fontSize: '50px', fill: '#ffccef', align: 'center', fontStyle: 'bold',
            fontFamily: 'Comic Sans MS', stroke: '#000000', strokeThickness: 6})
        gameState.scoreText.setX(this.cameras.main.width / 2 - gameState.scoreText.width / 2);
        gameState.scoreText.setY(this.cameras.main.height / 8 - gameState.scoreText.height / 8);
        const gridSize = 5
        const tileSize = 96
        gameState.tileOverlay = this.add.image(0, 0, 'tileOverlay').setAlpha(0).setOrigin(0, 0).setDisplaySize(tileSize, tileSize)
        for (let row = 0; row < gridSize; row++) {
            for (let col = 0; col < gridSize; col++) {
                const x = col * tileSize + (this.cameras.main.width - tileSize * gridSize) / 2
                const y = row * tileSize + (this.cameras.main.height - tileSize * gridSize) / 2
                const tile = this.add.image(x, y, 'tile').setOrigin(0, 0).setDisplaySize(tileSize, tileSize)
                tile.setInteractive()
                tile.on('pointerdown', () => {
                    if (gameState.activeTweens === 0) {
                        gameState.prevTile = gameState.selectedTile
                        gameState.selectedTile = [col, row]
                        gameState.tileOverlay.x = x
                        gameState.tileOverlay.y = y
                        gameState.tileOverlay.setAlpha(1)
                        gameState.tileOverlay.setDepth(2)
                    }
                })
            }
        }
        const candyMargin = 20
        const last2 = [-1, -1]
        gameState.candyGrid = []
        
        for (let row = 0; row < gridSize; row++) {
            gameState.candyGrid.push([])
            for (let col = 0; col < gridSize; col++) {
                let candyType = Math.floor(Math.random() * 4 + 1)
                let isVerticalMatch = (row - 2 >= 0
                    && gameState.candyGrid[row-2][col].candyType === gameState.candyGrid[row-1][col].candyType
                    && gameState.candyGrid[row-2][col].candyType === candyType)
                while ((last2[0] === last2[1] && last2[0] === candyType) || isVerticalMatch) {
                    candyType = Math.floor(Math.random() * 4 + 1)
                    isVerticalMatch = (row - 2 >= 0 
                        && gameState.candyGrid[row-2][col].candyType === gameState.candyGrid[row-1][col].candyType
                        && gameState.candyGrid[row-2][col].candyType === candyType)
                }
                last2.shift()
                last2.push(candyType)
                const x = col * tileSize + (this.cameras.main.width - tileSize * gridSize) / 2 + candyMargin / 2
                const y = row * tileSize + (this.cameras.main.height - tileSize * gridSize) / 2 + candyMargin / 2
                const candy = this.add.image(x, y, `candy${candyType}`).setOrigin(0, 0).setDisplaySize(tileSize - candyMargin, tileSize - candyMargin)
                candy.candyType = candyType
                candy.isMarked = false
                gameState.candyGrid[gameState.candyGrid.length - 1].push(candy)

            }
        }
    }

    regenerateCandy(y, x) {
        this.sound.stopByKey('swoosh')
        this.sound.play('swoosh')
        const newType = Math.floor(Math.random() * 4 + 1)
        const w = gameState.candyGrid[x][y].displayWidth, h = gameState.candyGrid[x][y].displayHeight
        gameState.candyGrid[x][y].candyType = newType
        gameState.candyGrid[x][y].setTexture(`candy${newType}`)
        gameState.candyGrid[x][y].setVisible(true)
        this.tweens.add({
            targets: gameState.candyGrid[x][y],
            displayWidth: [0, w],
            displayHeight: [0, h],
            ease: 'ease-in-out',
            duration: 100,
            onComplete: () => {
                setTimeout(() => gameState.activeTweens--, 250)
            }
        })
    }

    switchCandies(y1, x1, y2, x2, duration) {
        this.sound.stopByKey('swoosh')
        this.sound.play('swoosh')
        //console.log(`switching (${y1}, ${x1}) and (${y2}, ${x2})`)
        const candy1 = gameState.candyGrid[x1][y1]
        const candy2 = gameState.candyGrid[x2][y2]
        const new_x = candy1.x, new_y = candy1.y
        gameState.activeTweens++
        this.tweens.add({
            targets: candy1,
            x: candy2.x,
            y: candy2.y,
            duration: duration,
            ease: 'Power2',
            onComplete: () => {
                setTimeout(() => gameState.activeTweens--, 250)
            }
        })
        this.tweens.add({
            targets: candy2,
            x: new_x,
            y: new_y,
            duration: duration,
            ease: 'Power2'
        })
        gameState.candyGrid[x1][y1] = candy2
        gameState.candyGrid[x2][y2] = candy1
    }

    runMatch() {
        for (let row = 0; row < gameState.candyGrid.length; row++) {
            let lastType = -1, amount = 0
            for (let col = 0; col < gameState.candyGrid[0].length; col++) {
                if (lastType === gameState.candyGrid[row][col].candyType) {
                    amount++
                } else {
                    if (amount >= 3) {
                    // mark the candies
                        for (let i = 1; i <= amount; i++) {
                            gameState.candyGrid[row][col-i].isMarked = true
                            gameState.candyGrid[row][col-i].setVisible(false)
                        }
                    }
                    lastType = gameState.candyGrid[row][col].candyType
                    amount = 1
                }
            }
            if (amount >= 3) {
                // mark the candies
                for (let i = 1; i <= amount; i++) {
                    gameState.candyGrid[row][gameState.candyGrid[row].length-i].isMarked = true
                    gameState.candyGrid[row][gameState.candyGrid[row].length-i].setVisible(false)
                }
            }
        }
        for (let col = 0; col < gameState.candyGrid[0].length; col++) {
            let lastType = -1, amount = 0
            for (let row = 0; row < gameState.candyGrid.length; row++) {
                if (lastType === gameState.candyGrid[row][col].candyType) {
                    amount++
                } else {
                    if (amount >= 3) {
                    // mark the candies
                        for (let i = 1; i <= amount; i++) {
                            gameState.candyGrid[row-i][col].isMarked = true
                            gameState.candyGrid[row-i][col].setVisible(false)
                        }
                    }
                    lastType = gameState.candyGrid[row][col].candyType
                    amount = 1
                }
            }
            if (amount >= 3) {
                // mark the candies
                for (let i = 1; i <= amount; i++) {
                    gameState.candyGrid[gameState.candyGrid.length-i][col].isMarked = true
                    gameState.candyGrid[gameState.candyGrid.length-i][col].setVisible(false)
                }
            }
        }
    }

    matchAndRemove() {
        let runAgain = false
        this.runMatch()
        // make the candies fall
        for (let row = 0; row < gameState.candyGrid.length; row++) {
            for (let col = 0; col < gameState.candyGrid[0].length; col++) {
                if (gameState.candyGrid[row][col].isMarked) {
                    this.sound.stopByKey('pop')
                    this.sound.play('pop', {seek: 0.23})
                    const candy = gameState.candyGrid[row][col]
                    const fallingCandy = this.physics.add.image(candy.x, candy.y, `candy${candy.candyType}`)
                    fallingCandy.setDisplaySize(candy.displayWidth, candy.displayHeight)
                    fallingCandy.setVelocity((Math.random() * 400 + 600) * (Math.random()-0.5), (Math.random() * 400 + 600) * (Math.random()-0.5))
                    setTimeout(() => fallingCandy.destroy(), 3000)
                }
            }

        }
        // make the candies switch
        for (let col = 0; col < gameState.candyGrid[0].length; col++) {
            let acc = 0
            for(let row = gameState.candyGrid.length-1; row >= 0; row--) {
                if (gameState.candyGrid[row][col].isMarked) {
                    gameState.candyGrid[row][col].isMarked = false
                    runAgain = true
                    acc++
                } else if (acc > 0) {
                    setTimeout(() => {this.switchCandies(col, row, col, row+acc, 200)}, 200*(4-row))
                }
            }
            // make the previously marked candies regenerate
            for(let i = 0; i < acc; i++) {
                gameState.activeTweens++
                setTimeout(() => {
                    this.regenerateCandy(col, i)
                    gameState.score += gameState.multiplier
                    gameState.scoreText.setText(`Score: ${gameState.score}`)
                }, 1000 + i * 100)
            }
        }
        if (runAgain) {
            const interval = setInterval(() => {
                if (gameState.activeTweens === 0) {
                    clearInterval(interval)
                    setTimeout(() => {
                        gameState.multiplier++
                        this.matchAndRemove()
                    }, 200)
                }
            }, 100);
            
        } else {
            gameState.multiplier = 1
        }
    }

    update() {
        const wereTwoAdjacentTilesSelectedInSuccession = (
            (Math.abs(gameState.prevTile[0] - gameState.selectedTile[0]) === 1
            && gameState.prevTile[1] === gameState.selectedTile[1]) ||
            (Math.abs(gameState.prevTile[1] - gameState.selectedTile[1]) === 1
            && gameState.prevTile[0] === gameState.selectedTile[0]) 
        )
        const flag = wereTwoAdjacentTilesSelectedInSuccession
        if (flag) {
            this.sound.play('swoosh')
            gameState.tileOverlay.setAlpha(0)
            // switch the candies
            this.switchCandies(gameState.prevTile[0], gameState.prevTile[1], 
                gameState.selectedTile[0], gameState.selectedTile[1], 300)
            gameState.selectedTile = [-10, -10]
            gameState.prevTile = [-10, -10]
            setTimeout(() => this.matchAndRemove(), 310)
        }
    }
}