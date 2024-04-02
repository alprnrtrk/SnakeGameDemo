const colors = {
    void: 'transparent',
    wall: 'red',
    snake: 'yellow',
    head: 'green',
    bait: 'red',
}

const settings = {
    speed: 50,
}

function reset() {
    document.head.innerHTML = ''
    document.body.innerHTML = ''
    let style = document.createElement('style')
    style.innerText = `
        *{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body{
            display: flex;
            justify-content: center;
            align-items: center;
            width: 100vw;
            height: 100vh;
            overflow: hidden;
            background-color: #333;
        }
    `
    document.body.appendChild(style)
}

class Cell {
    constructor(row, col, size, status, demo) {
        this.row = row
        this.col = col
        this.size = size
        this.status = status || 'void'
        this.element = null
        this.demo = demo || false
    }

    render() {
        const cell = document.createElement('div')
        cell.style.cssText = `
            width: ${this.size}px;
            height: ${this.size}px;
            background-color: ${colors[this.status]};
            ${(this.demo) ? 'border: solid 1px rgba(255,255,255,.05);' : ''}
        `
        this.element = cell
        return cell
    }
}

class Grid {
    constructor(rows, cols, gridSize, demo) {
        this.rows = rows
        this.cols = cols
        this.gridSize = gridSize
        this.demo = demo || false
        this.cells = []
    }

    createGrid() {
        const grid = document.createElement('div')
        grid.style.cssText = `
            display: grid;
            grid-template-rows: repeat(${this.rows}, ${this.gridSize}px);
            grid-template-columns: repeat(${this.cols}, ${this.gridSize}px);
        `
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                let item = new Cell(r, c, this.gridSize, 'void', demo)
                this.cells.push(item)
                grid.appendChild(item.render())
            }
        }

        return grid
    }
}

class Thic {
    constructor(canvas, snake) {
        this.canvas = canvas
        this.snake = snake
        this.bait = null
    }

    move() {
        //* get previous tail and head
        let preHead = this.canvas.cells.filter(c => c.status == 'head')[0]
        let preTail = this.snake.tail

        //* clear status of head
        this.canvas.cells.filter(c => c.status == 'head')[0].status = 'void'

        //* move head
        this.canvas.cells.filter(c => c.row == (preHead.row + this.snake.direction[1]) && c.col == (preHead.col + this.snake.direction[0]))[0].status = 'head'

        //*clear status of tail

        for (let cell of preTail) {
            cell.status = 'void'
        }

        //* create new tail

        this.snake.tail.push(preHead)
        this.snake.tail.shift()

        //*move tail

        for (let cell of this.snake.tail) {
            this.canvas.cells.filter(c => c.row == cell.row && c.col == cell.col)[0].status = 'snake'
        }
    }

    eat() {
        this.snake.tail.push(this.snake.tail[this.snake.tail.length - 1])
    }

    placeBait() {
        if (this.canvas.cells.filter(c => c.status == 'bait')[0] == null) {
            let space = this.canvas.cells.filter(c => c.status == 'void')
            let bait = Math.floor(Math.random() * space.length)

            space[bait].status = "bait"
            this.bait = space[bait]

            this.eat()
        }
    }


    render() {
        this.canvas.cells.forEach(c => {
            c.element.style.backgroundColor = colors[c.status]
        });
    }

    update() {
        this.move()
        this.placeBait()
        this.render()
    }
}

class Snake {
    constructor(canvas, headPosition, direction, size) {
        this.canvas = canvas;
        this.headPosition = headPosition || [parseInt(this.canvas.rows / 2), parseInt(this.canvas.cols / 2)];
        this.direction = direction || [1, 0];
        this.size = size || 3;
        this.tail = [];
        this.head = null
    }

    placeSnake() {
        const headCell = this.canvas.cells.find(obj => obj.row === this.headPosition[0] && obj.col === this.headPosition[1]);
        headCell.status = 'head';
        this.head = headCell

        const [dx, dy] = this.direction;
        const stepRow = dx === 0 ? 0 : dx > 0 ? 1 : -1;
        const stepCol = dy === 0 ? 0 : dy > 0 ? 1 : -1;

        for (let i = 1; i <= this.size; i++) {
            const newRow = this.headPosition[0] - (stepCol * i);
            const newCol = this.headPosition[1] - (stepRow * i);

            const cell = this.canvas.cells.find(obj => obj.row === newRow && obj.col === newCol);
            cell.status = 'snake';
            this.tail.push(cell)
        }

        this.tail.reverse()
    }
}

document.addEventListener('DOMContentLoaded', () => {
    reset()

    const myGrid = new Grid(50, 50, 15, demo = true)
    document.body.appendChild(myGrid.createGrid())

    const mySnake = new Snake(myGrid)
    mySnake.placeSnake()

    const gameThic = new Thic(myGrid, mySnake)

    window.onkeyup = function (e) {
        var key = e.keyCode ? e.keyCode : e.which;
        switch (key) {
            case 38:
                mySnake.direction = [0, -1]
                break;
            case 40:
                mySnake.direction = [0, 1]
                break;
            case 39:
                mySnake.direction = [1, 0]
                break;
            case 37:
                mySnake.direction = [-1, 0]
                break;
        }
    }

    setInterval(() => {
        gameThic.update()
    }, settings.speed);
})