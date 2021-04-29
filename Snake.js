class Snake {
    constructor(params) {
        this.canvas = params.el
        this.canvas.width = params.width
        this.canvas.height = params.height
        this.ctx = this.canvas.getContext('2d')
        this.score = params.score
        this.timer = params.timer
        this.gameStatus = 'playing'
        this.timestamp = 0

        this.blockQuantity = params.blockQuantity
        this.blocks = []
        this.blockSize = {
            w: this.canvas.width / this.blockQuantity.x,
            h: this.canvas.height / this.blockQuantity.y
        }
        this.snakes = []
        this.snakesTemp = []
        this.snakeColor = params.snakeColor
        this.snakeLength = params.snakeLength
        this.snakeBorderColor = params.snakeBorderColor
        this.snakeDirection = 'right'
        this.snakeDx = this.blockSize.w
        this.snakeDy = 0
        this.snakeSpeed = params.snakeSpeed
        this.snakePositions = []

        this.foodQuantity = 3
        this.foodColor = params.foodColor
        this.foods = []

        this.secondsPassed = 0
        this.username = params.username
    }

    init() {
        for (let i = 0; i < this.blockQuantity.y; i++) {
            let row = []
            for (let j = 0; j < this.blockQuantity.x; j++) {
                let background = (i % 2 == 0 && j % 2 == 1) || (i % 2 == 1 && j % 2 == 0) ? '#2f4f4f' : '#395f5f';
                row.push({
                    background,
                    x: j * this.blockSize.w,
                    y: i * this.blockSize.h
                })
            }
            this.blocks.push(row)
        }

        for (let i = 0; i < this.snakeLength; i++) {
            let block = this.blocks[this.blockQuantity.y / 2][this.blockQuantity.x / 2 - i]
            this.snakes.push({
                x: block.x,
                y: block.y,
            })
        }

        for (let i = 0; i < this.foodQuantity; i++) {
            this.generateFood()
        }

        this.events()
    }

    drawBlocks() {
        this.blocks.forEach(row => {
            row.forEach(col => {
                this.ctx.fillStyle = col.background
                this.ctx.fillRect(col.x, col.y, this.blockSize.w, this.blockSize.h)
            })
        })
    }

    drawSnakes() {
        this.snakes.forEach(snake => {
            this.ctx.beginPath()
            this.ctx.fillStyle = this.snakeColor
            this.ctx.strokeStyle = this.snakeBorderColor
            this.ctx.rect(snake.x, snake.y, this.blockSize.w, this.blockSize.h)
            this.ctx.fill()
            this.ctx.stroke()
            this.ctx.closePath()
        })
    }

    drawFoods() {
        this.foods.forEach(food => {
            this.ctx.fillStyle = this.foodColor
            this.ctx.fillRect(food.x, food.y, this.blockSize.w, this.blockSize.h)
        })
    }

    draw() {
        this.drawBlocks()
        this.drawSnakes()
        this.drawFoods()
    }

    start() {
        requestAnimationFrame((timestamp) => {
            this.secondsPassed = 0
            this.render(0)
        })
    }

    saveSnakePosition() {
        if (this.snakePositions.length > 10) {
            this.snakePositions.shift()
        }
        let newSnake = this.snakes.slice()
        this.snakePositions.push(newSnake)
    }

    updateSnake() {
        let newHead = {
            x: this.snakes[0].x + this.snakeDx,
            y: this.snakes[0].y + this.snakeDy
        }
        this.snakes.unshift(newHead)

        if (newHead.x < 0 || newHead.y < 0 || newHead.x >= this.canvas.width || newHead.y >= this.canvas.height) {
            this.gameOver()
        }

        let isEat = this.isEat()
        if (!isEat) this.snakes.pop()

        this.snakes.forEach((snake, index) => {
            if (index > 0) {
                if (snake.x == newHead.x && snake.y == newHead.y) {
                    this.gameOver()
                }
            }
        })

        this.snakesTemp = this.snakes
    }

    updateScore() {
        this.score.innerText = this.snakes.length
    }

    updateTimer(timestamp) {
        var seconds = Math.round((timestamp / 1000) % 60)
        var minutes = Math.round((timestamp / (60 * 1000)) % 60)
        var hours = Math.round((timestamp % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))


        this.timer.innerText = `${hours < 10 ? 0 : ''}${hours}:${minutes < 10 ? 0 : ''}${minutes}:${seconds < 10 ? 0 : ''}${seconds}`
    }

    update(timestamp) {
        this.updateSnake()
        this.updateScore()
        this.updateTimer(timestamp)
    }

    render(timestamp) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
        this.timestamp = timestamp
        this.draw()

        if (timestamp - this.secondsPassed > this.snakeSpeed && this.gameStatus == 'playing') {
            this.secondsPassed = timestamp
            this.update(timestamp)
        }
        requestAnimationFrame((timestampe) => {
            this.render(timestampe)
        })
    }

    gameOver() {
        let highscore = localStorage.getItem('highscore') == undefined ? 6 : localStorage.getItem('highscore')

        if (this.snakes.length > highscore) localStorage.setItem('highscore', this.snakes.length)

        highscore = localStorage.getItem('highscore')

        alert('Username: ' + this.username + ', Your Score: ' + this.snakes.length + ', The Highscore: ' + highscore + ', Your Time: ' + this.timer.innerText)
        this.gameStatus = 'over'
    }

    generateFood() {
        let food = this.blocks[this.randomInt(1, this.blockQuantity.y - 2)][this.randomInt(1, this.blockQuantity.x - 2)]

        if (this.snakes.every(snake => snake.x == food.x && snake.y == food.y)) {
            this.generateFood()
        } else {
            this.foods.push(food)
        }
    }

    isEat() {
        let head = this.snakes[0]
        let foodIndex = null
        let eaten = false

        this.foods.forEach((food, index) => {
            if (head.x == food.x && head.y == food.y) {
                eaten = true
                foodIndex = index
                this.generateFood()
                return true
            }
        })

        if (foodIndex != null) this.foods.splice(foodIndex, 1)
        return eaten
    }

    randomInt(min, max) {
        return Math.round(Math.random() * max) + min
    }

    events() {
        let _this = this

        document.addEventListener('keyup', function (e) {
            if ((e.key == 'w' || e.key == 'ArrowUp') && _this.snakeDirection !== 'down') {
                _this.snakeDy = -_this.blockSize.h
                _this.snakeDx = 0
                _this.snakeDirection = 'up'
                _this.update(_this.timestamp.valueOf())
            } else if ((e.key == 's' || e.key == 'ArrowDown') && _this.snakeDirection !== 'up') {
                _this.snakeDy = _this.blockSize.h
                _this.snakeDx = 0
                _this.snakeDirection = 'down'
                _this.update(_this.timestamp.valueOf())
            } else if ((e.key == 'd' || e.key == 'ArrowRight') && _this.snakeDirection !== 'left') {
                _this.snakeDy = 0
                _this.snakeDx = _this.blockSize.w
                _this.snakeDirection = 'right'
                _this.update(_this.timestamp.valueOf())
            } else if ((e.key == 'a' || e.key == 'ArrowLeft') && _this.snakeDirection !== 'right') {
                _this.snakeDy = 0
                _this.snakeDx = -_this.blockSize.w
                _this.snakeDirection = 'left'
                _this.update(_this.timestamp.valueOf())
            }
        })

        setInterval(() => {
            if (this.gameStatus == 'playing') {
                this.saveSnakePosition()
            }
        }, 250)
    }
}