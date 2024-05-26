class Tile {
    constructor(value, x, y) {
      this.value = value;
      this.x = x;
      this.y = y;
      this.previousPosition = null;
    }
  }
  
  class Game2048 {
    constructor() {
      this.size = 4;
      this.tiles = [];
      this.tileElements = [];
      this.score = 0;
      this.bestScore = localStorage.getItem('bestScore') || 0;
      this.setup();
      this.addEventListeners();
      this.update();
      this.updateScore();
    }
  
    setup() {
      for (let i = 0; i < this.size; i++) {
        this.tiles[i] = [];
        for (let j = 0; j < this.size; j++) {
          this.tiles[i][j] = null;
        }
      }
      this.addRandomTile();
      this.addRandomTile();
    }
  
    addRandomTile() {
      const availableCells = [];
      for (let i = 0; i < this.size; i++) {
        for (let j = 0; j < this.size; j++) {
          if (!this.tiles[i][j]) {
            availableCells.push({ x: i, y: j });
          }
        }
      }
      const randomCell = availableCells[Math.floor(Math.random() * availableCells.length)];
      const value = Math.random() < 0.9 ? 2 : 4;
      this.tiles[randomCell.x][randomCell.y] = new Tile(value, randomCell.x, randomCell.y);
    }
  
    addEventListeners() {
      window.addEventListener('keydown', this.handleKey.bind(this));
      document.getElementById('start-button').addEventListener('click', this.start.bind(this));
      document.getElementById('restart-button').addEventListener('click', this.restart.bind(this));
    }
  
    handleKey(event) {
      let moved = false;
      switch (event.key) {
        case 'ArrowUp': moved = this.move('up'); break;
        case 'ArrowDown': moved = this.move('down'); break;
        case 'ArrowLeft': moved = this.move('left'); break;
        case 'ArrowRight': moved = this.move('right'); break;
      }
      if (moved) {
        setTimeout(() => {
          this.addRandomTile();
          this.update();
          this.updateScore();
        }, 200); // Wait for animation to complete
      }
    }
  
    move(direction) {
      let moved = false;
      switch (direction) {
        case 'up': moved = this.moveUp(); break;
        case 'down': moved = this.moveDown(); break;
        case 'left': moved = this.moveLeft(); break;
        case 'right': moved = this.moveRight(); break;
      }
      return moved;
    }
  
    moveTilesInDirection(xStep, yStep) {
      let moved = false;
      const order = xStep + yStep > 0 ? [this.size - 2, -1, -1] : [1, this.size, 1];
  
      for (let x = 0; x < this.size; x++) {
        for (let y = order[0]; y !== order[1]; y += order[2]) {
          const currentX = xStep === 0 ? x : y;
          const currentY = xStep === 0 ? y : x;
          if (this.tiles[currentX][currentY]) {
            let targetX = currentX;
            let targetY = currentY;
  
            while (this.isWithinBounds(targetX + xStep, targetY + yStep) && !this.tiles[targetX + xStep][targetY + yStep]) {
              targetX += xStep;
              targetY += yStep;
              moved = true;
            }
  
            if (this.isWithinBounds(targetX + xStep, targetY + yStep) &&
              this.tiles[targetX + xStep][targetY + yStep].value === this.tiles[currentX][currentY].value) {
              this.tiles[targetX + xStep][targetY + yStep].value *= 2;
              this.score += this.tiles[targetX + xStep][targetY + yStep].value;
              this.tiles[currentX][currentY] = null;
              moved = true;
            } else if (targetX !== currentX || targetY !== currentY) {
              this.tiles[targetX][targetY] = this.tiles[currentX][currentY];
              this.tiles[currentX][currentY] = null;
            }
          }
        }
      }
      return moved;
    }
  
    moveUp() {
      return this.moveTilesInDirection(-1, 0);
    }
  
    moveDown() {
      return this.moveTilesInDirection(1, 0);
    }
  
    moveLeft() {
      return this.moveTilesInDirection(0, -1);
    }
  
    moveRight() {
      return this.moveTilesInDirection(0, 1);
    }
  
    isWithinBounds(x, y) {
      return x >= 0 && x < this.size && y >= 0 && y < this.size;
    }
  
    update() {
      const tileContainer = document.querySelector('.tile-container');
      tileContainer.innerHTML = '';
      const tileSize = 25; // Percentage
      const gapSize = 420;  // Pixels
      const gridSize = 500; // Grid size in pixels
  
      for (let i = 0; i < this.size; i++) {
        for (let j = 0; j < this.size; j++) {
          if (this.tiles[i][j]) {
            const tile = this.tiles[i][j];
            const tileElement = document.createElement('div');
            tileElement.className = `tile tile-${tile.value}`;
  
            // Calculate the translation including the gap size
            const translateX = j * (tileSize + (gapSize / gridSize) * 100) + 14;
            const translateY = i * (tileSize + (gapSize / gridSize) * 100) + 128;
  
            tileElement.style.transform = `translate(${translateX}%, ${translateY}%)`;
            tileElement.textContent = tile.value;
            tileContainer.appendChild(tileElement);
  
            // Add animation class based on the movement direction
            if (tile.previousPosition) {
              const deltaX = tile.x - tile.previousPosition.x;
              const deltaY = tile.y - tile.previousPosition.y;
  
              if (deltaX === -1) {
                tileElement.classList.add('move-up');
              } else if (deltaX === 1) {
                tileElement.classList.add('move-down');
              } else if (deltaY === -1) {
                tileElement.classList.add('move-left');
              } else if (deltaY === 1) {
                tileElement.classList.add('move-right');
              }
  
              // Remove the previous position after updating
              tile.previousPosition = null;
            }
          }
        }
      }
    }
  
    updateScore() {
      document.getElementById('score').textContent = this.score;
      if (this.score > this.bestScore) {
        this.bestScore = this.score;
        localStorage.setItem('bestScore', this.bestScore);
      }
      document.getElementById('best-score').textContent = this.bestScore;
    }
  
    start() {
      this.score = 0;
      this.setup();
      this.update();
      this.updateScore();
    }
  
    restart() {
      this.score = 0;
      this.setup();
      this.update();
      this.updateScore();
    }
  }
  
  document.addEventListener('DOMContentLoaded', () => {
    new Game2048();
  });
  