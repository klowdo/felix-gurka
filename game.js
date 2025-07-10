class CucumberGame {
    constructor() {
        this.gameContainer = document.getElementById('game-container');
        this.gameArea = document.getElementById('game-area');
        this.player = document.getElementById('cucumber-player');
        this.scoreElement = document.getElementById('score');
        this.gameOverScreen = document.getElementById('game-over');
        this.finalScoreElement = document.getElementById('final-score');
        this.restartBtn = document.getElementById('restart-btn');
        this.backBtn = document.getElementById('back-btn');
        this.mainCucumber = document.getElementById('main-cucumber');

        this.isGameRunning = false;
        this.isJumping = false;
        this.score = 0;
        this.gameSpeed = 2;
        this.obstacles = [];
        this.gameLoop = null;

        this.init();
    }

    init() {
        this.mainCucumber.addEventListener('click', () => {
            console.log('Main cucumber clicked!');
            this.startGame();
        });
        this.restartBtn.addEventListener('click', () => this.restartGame());
        this.backBtn.addEventListener('click', () => this.backToHome());

        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && this.isGameRunning) {
                e.preventDefault();
                this.jump();
            }
        });

        document.addEventListener('click', (e) => {
            if (this.isGameRunning && e.target !== this.restartBtn && e.target !== this.backBtn) {
                this.jump();
            }
        });
    }

    startGame() {
        console.log('Starting game...');
        document.querySelector('main').style.display = 'none';
        document.querySelector('footer').style.display = 'none';
        this.gameContainer.classList.remove('game-hidden');
        this.gameContainer.style.display = 'block';
        this.gameContainer.style.visibility = 'visible';
        this.gameOverScreen.classList.add('game-hidden');

        console.log('Game container display:', this.gameContainer.style.display);
        console.log('Game container classes:', this.gameContainer.className);
        console.log('Player element:', this.player);
        console.log('Score element:', this.scoreElement);
        

        this.isGameRunning = true;
        this.score = 0;
        this.gameSpeed = 2;
        this.obstacles = [];
        this.updateScore();

        this.gameLoop = setInterval(() => this.update(), 20);

        setTimeout(() => this.createObstacle(), 2000);
        console.log('Game started successfully');
    }

    jump() {
        if (this.isJumping || !this.isGameRunning) return;

        this.isJumping = true;
        this.player.classList.add('jumping');

        setTimeout(() => {
            this.player.classList.remove('jumping');
            this.isJumping = false;
        }, 600);
    }

    createObstacle() {
        if (!this.isGameRunning) return;

        const obstacle = document.createElement('div');
        obstacle.className = 'obstacle';
        obstacle.textContent = '🧅'; // Using onion as obstacle
        obstacle.style.right = '-50px';
        this.gameArea.appendChild(obstacle);
        this.obstacles.push(obstacle);

        const nextObstacleDelay = Math.random() * 2000 + 1500;
        setTimeout(() => this.createObstacle(), nextObstacleDelay);
    }

    update() {
        if (!this.isGameRunning) return;

        this.obstacles.forEach((obstacle, index) => {
            const currentRight = parseInt(obstacle.style.right) || 0;
            obstacle.style.right = (currentRight + this.gameSpeed) + 'px';

            if (currentRight > window.innerWidth + 50) {
                obstacle.remove();
                this.obstacles.splice(index, 1);
                this.score += 10;
                this.updateScore();

                if (this.score % 100 === 0) {
                    this.gameSpeed += 0.5;
                }
            }

            if (this.checkCollision(obstacle)) {
                this.gameOver();
            }
        });
    }

    checkCollision(obstacle) {
        const playerRect = this.player.getBoundingClientRect();
        const obstacleRect = obstacle.getBoundingClientRect();

        return playerRect.left < obstacleRect.right &&
               playerRect.right > obstacleRect.left &&
               playerRect.top < obstacleRect.bottom &&
               playerRect.bottom > obstacleRect.top;
    }

    updateScore() {
        this.scoreElement.textContent = `Poäng: ${this.score}`;
    }

    gameOver() {
        this.isGameRunning = false;
        clearInterval(this.gameLoop);

        this.obstacles.forEach(obstacle => obstacle.remove());
        this.obstacles = [];

        this.finalScoreElement.textContent = this.score;
        this.gameOverScreen.classList.remove('game-hidden');
    }

    restartGame() {
        this.startGame();
    }

    backToHome() {
        this.gameContainer.classList.add('game-hidden');
        document.querySelector('main').style.display = 'block';
        document.querySelector('footer').style.display = 'block';

        if (this.gameLoop) {
            clearInterval(this.gameLoop);
        }

        this.obstacles.forEach(obstacle => obstacle.remove());
        this.obstacles = [];
        this.isGameRunning = false;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new CucumberGame();
});
