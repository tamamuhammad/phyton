const canvas = document.querySelector('#canvas')
const timer = document.querySelector('#timer')
const score = document.querySelector('#score')
const start = document.querySelector('.start')
const cancel = document.querySelector('.cancel')
const rewind = document.querySelector('.rewind')
const range = document.querySelector('#rewind')
const nameInput = document.querySelector('#username')
const instructions = document.querySelector('#instruction')
const playground = document.querySelector('#playground')

let snake = new Snake({
    el: canvas,
    width: 960,
    height: 600,
    score: score,
    timer: timer,
    blockQuantity: {
        x: 48,
        y: 30
    },
    snakeColor: '#b8860b',
    snakeLength: 6,
    snakeBorderColor: '#808080',
    snakeSpeed: 250,
    foodColor: '#808080',
    username: nameInput.value
})

start.addEventListener('click', function () {
    instructions.style.display = 'none'
    playground.style.display = 'flex'

    snake.init()
    snake.start()
})

rewind.addEventListener('click', function (e) {
    if (snake.gameStatus == 'playing') {
        range.style.display = 'block'
        cancel.style.display = 'block'
        snake.gameStatus = 'paused'
        range.value = 10
    } else if (snake.gameStatus == 'paused') {
        snake.gameStatus = 'playing'
        snake.snakesTemp = snake.snakes
        range.style.display = 'none'
        cancel.style.display = 'none'
    }

})

range.addEventListener('input', function (e) {
    let val = e.target.value
    snake.snakes = snake.snakePositions[val] == undefined ? snake.snakes : snake.snakePositions[val]
})

cancel.addEventListener('click', function (e) {
    snake.snakes = snake.snakesTemp
    snake.gameStatus = 'playing'

    range.style.display = 'none'
    cancel.style.display = 'none'

})

nameInput.addEventListener('input', function (e) {
    if (e.target.value == '')
        start.setAttribute('disabled', true)
    else
        start.removeAttribute('disabled')
})


