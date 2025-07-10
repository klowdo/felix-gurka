/**
 * Cucumber World RPG - Main Game Engine
 * Part of Cucumber World RPG
 */

class CucumberWorld {
    constructor(containerId) {
        this.containerId = containerId;
        this.container = null;
        this.canvas = null;
        this.ctx = null;
        
        // Core systems
        this.fruitLoader = new FruitLoader();
        this.saveManager = new SaveManager();
        this.worldExplorer = null;
        this.battleSystem = null;
        this.inventory = null;
        
        // Game state
        this.currentSave = null;
        this.currentSlot = null;
        this.gameState = 'menu'; // menu, loading, world, battle, inventory
        this.isInitialized = false;
        
        // UI state
        this.selectedSaveSlot = 1;
        this.showNewGameDialog = false;
        
        // Performance
        this.lastFrameTime = 0;
        this.frameCount = 0;
        this.fps = 0;
        
        this.init();
    }

    /**
     * Initialize the game engine
     */
    async init() {
        try {
            console.log('Initializing Cucumber World RPG...');
            
            // Create container and canvas
            this.createGameContainer();
            this.setupCanvas();
            
            // Load initial data
            await this.preloadAssets();
            
            // Setup event handlers
            this.setupEventHandlers();
            
            // Start main game loop
            this.startGameLoop();
            
            this.isInitialized = true;
            console.log('Cucumber World RPG initialized successfully');
            
            // Show main menu
            this.showMainMenu();
            
        } catch (error) {
            console.error('Failed to initialize Cucumber World RPG:', error);
            this.showError('Failed to initialize game');
        }
    }

    /**
     * Create the main game container
     */
    createGameContainer() {
        this.container = document.getElementById(this.containerId);
        if (!this.container) {
            throw new Error(`Container element '${this.containerId}' not found`);
        }

        this.container.innerHTML = `
            <div class="cucumber-world-game">
                <div class="game-header">
                    <h2>🥒 Cucumber World RPG 🍎</h2>
                    <div class="game-controls">
                        <button id="cw-menu-btn" class="cw-btn">Menu</button>
                        <button id="cw-save-btn" class="cw-btn" style="display: none;">Save</button>
                    </div>
                </div>
                <div class="game-content">
                    <canvas id="cw-game-canvas" width="800" height="600"></canvas>
                    <div id="cw-ui-overlay" class="ui-overlay"></div>
                </div>
                <div class="game-footer">
                    <div id="cw-status-bar" class="status-bar"></div>
                </div>
            </div>
        `;
    }

    /**
     * Setup the game canvas
     */
    setupCanvas() {
        this.canvas = document.getElementById('cw-game-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Make canvas responsive
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    /**
     * Resize canvas to fit container
     */
    resizeCanvas() {
        const container = this.canvas.parentElement;
        const containerRect = container.getBoundingClientRect();
        
        // Maintain 4:3 aspect ratio
        const aspectRatio = 4 / 3;
        let width = containerRect.width - 20; // padding
        let height = width / aspectRatio;
        
        if (height > containerRect.height - 20) {
            height = containerRect.height - 20;
            width = height * aspectRatio;
        }
        
        this.canvas.width = width;
        this.canvas.height = height;
        this.canvas.style.width = width + 'px';
        this.canvas.style.height = height + 'px';
    }

    /**
     * Preload game assets
     */
    async preloadAssets() {
        console.log('Preloading game assets...');
        
        // Load basic fruit data
        await this.fruitLoader.loadAllFruits();
        
        // Load world data
        await this.fruitLoader.loadWorld('garden');
        await this.fruitLoader.loadWorld('forest');
        
        console.log('Assets preloaded successfully');
    }

    /**
     * Setup event handlers
     */
    setupEventHandlers() {
        // Menu button
        document.getElementById('cw-menu-btn').addEventListener('click', () => {
            this.showMainMenu();
        });

        // Save button
        document.getElementById('cw-save-btn').addEventListener('click', () => {
            this.quickSave();
        });

        // Canvas click events
        this.canvas.addEventListener('click', (e) => {
            this.handleCanvasClick(e);
        });

        // Keyboard events
        document.addEventListener('keydown', (e) => {
            this.handleKeyDown(e);
        });
    }

    /**
     * Start the main game loop
     */
    startGameLoop() {
        const gameLoop = (timestamp) => {
            this.update(timestamp);
            this.render();
            requestAnimationFrame(gameLoop);
        };
        
        requestAnimationFrame(gameLoop);
    }

    /**
     * Update game logic
     */
    update(timestamp) {
        // Calculate FPS
        if (timestamp - this.lastFrameTime >= 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.lastFrameTime = timestamp;
        }
        this.frameCount++;

        // Update current game state
        switch (this.gameState) {
            case 'world':
                if (this.worldExplorer) {
                    this.worldExplorer.update(timestamp);
                }
                break;
            case 'battle':
                if (this.battleSystem) {
                    this.battleSystem.update(timestamp);
                }
                break;
        }
    }

    /**
     * Render game graphics
     */
    render() {
        // Clear canvas
        this.ctx.fillStyle = '#87CEEB';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Render based on current state
        switch (this.gameState) {
            case 'menu':
                this.renderMainMenu();
                break;
            case 'loading':
                this.renderLoadingScreen();
                break;
            case 'world':
                this.renderWorldView();
                break;
            case 'battle':
                this.renderBattleView();
                break;
            case 'inventory':
                this.renderInventoryView();
                break;
        }

        // Render UI overlay
        this.renderUI();
    }

    /**
     * Render main menu
     */
    renderMainMenu() {
        const ctx = this.ctx;
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;

        // Background gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#98FB98');
        gradient.addColorStop(1, '#90EE90');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Title
        ctx.fillStyle = '#2F4F2F';
        ctx.font = 'bold 36px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('🥒 Cucumber World RPG 🍎', centerX, centerY - 150);

        // Subtitle
        ctx.font = '18px Arial';
        ctx.fillText('Explore worlds, collect fruits, battle cucumbers!', centerX, centerY - 110);

        // Menu options
        const menuOptions = [
            'New Game',
            'Load Game',
            'Settings',
            'About'
        ];

        ctx.font = 'bold 24px Arial';
        menuOptions.forEach((option, index) => {
            const y = centerY - 20 + (index * 50);
            const isSelected = index === this.selectedMenuOption;
            
            ctx.fillStyle = isSelected ? '#FF6347' : '#2F4F2F';
            ctx.fillText(option, centerX, y);
            
            if (isSelected) {
                ctx.fillText('→', centerX - 120, y);
                ctx.fillText('←', centerX + 120, y);
            }
        });

        // Instructions
        ctx.font = '14px Arial';
        ctx.fillStyle = '#696969';
        ctx.fillText('Use arrow keys to navigate, Enter to select', centerX, this.canvas.height - 30);
    }

    /**
     * Render loading screen
     */
    renderLoadingScreen() {
        const ctx = this.ctx;
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;

        ctx.fillStyle = '#4169E1';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        ctx.fillStyle = 'white';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Loading...', centerX, centerY);

        // Simple loading animation
        const dots = '.'.repeat((Math.floor(Date.now() / 500) % 4));
        ctx.fillText(dots, centerX + 60, centerY);
    }

    /**
     * Render world exploration view
     */
    renderWorldView() {
        if (this.worldExplorer) {
            this.worldExplorer.render(this.ctx);
        } else {
            // Placeholder world view
            const ctx = this.ctx;
            ctx.fillStyle = '#228B22';
            ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            ctx.fillStyle = 'white';
            ctx.font = 'bold 20px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('World Explorer Loading...', this.canvas.width / 2, this.canvas.height / 2);
        }
    }

    /**
     * Render battle view
     */
    renderBattleView() {
        if (this.battleSystem) {
            this.battleSystem.render(this.ctx);
        } else {
            // Placeholder battle view
            const ctx = this.ctx;
            ctx.fillStyle = '#DC143C';
            ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            ctx.fillStyle = 'white';
            ctx.font = 'bold 20px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Battle System Loading...', this.canvas.width / 2, this.canvas.height / 2);
        }
    }

    /**
     * Render inventory view
     */
    renderInventoryView() {
        const ctx = this.ctx;
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        ctx.fillStyle = 'white';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Inventory System Coming Soon...', this.canvas.width / 2, this.canvas.height / 2);
    }

    /**
     * Render UI overlay
     */
    renderUI() {
        // Status bar
        this.updateStatusBar();
    }

    /**
     * Update status bar
     */
    updateStatusBar() {
        const statusBar = document.getElementById('cw-status-bar');
        let statusText = `FPS: ${this.fps} | State: ${this.gameState}`;
        
        if (this.currentSave) {
            statusText += ` | Player: ${this.currentSave.playerName} | Level: ${this.currentSave.playerStats.level}`;
        }
        
        statusBar.textContent = statusText;
    }

    /**
     * Handle canvas click events
     */
    handleCanvasClick(event) {
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        // Scale coordinates to canvas size
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        const canvasX = x * scaleX;
        const canvasY = y * scaleY;
        
        console.log(`Canvas click at: ${canvasX}, ${canvasY}`);
        
        // Handle clicks based on current state
        switch (this.gameState) {
            case 'menu':
                this.handleMenuClick(canvasX, canvasY);
                break;
            case 'world':
                if (this.worldExplorer) {
                    this.worldExplorer.handleClick(canvasX, canvasY);
                }
                break;
        }
    }

    /**
     * Handle menu clicks
     */
    handleMenuClick(x, y) {
        // Simple menu click detection - you'd want more precise hit detection
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        // Check if click is in menu area
        if (x > centerX - 100 && x < centerX + 100) {
            if (y > centerY - 20 && y < centerY + 30) {
                this.startNewGame();
            } else if (y > centerY + 30 && y < centerY + 80) {
                this.showLoadGameMenu();
            }
        }
    }

    /**
     * Handle keyboard events
     */
    handleKeyDown(event) {
        switch (event.key) {
            case 'Escape':
                this.showMainMenu();
                break;
            case 'Enter':
                if (this.gameState === 'menu') {
                    this.handleMenuSelect();
                }
                break;
        }
    }

    /**
     * Show main menu
     */
    showMainMenu() {
        this.gameState = 'menu';
        this.selectedMenuOption = 0;
        document.getElementById('cw-save-btn').style.display = 'none';
    }

    /**
     * Start a new game
     */
    async startNewGame() {
        try {
            this.gameState = 'loading';
            
            // Create new save
            const playerName = prompt('Enter your name:') || 'Player';
            this.currentSave = this.saveManager.createNewSave(1, playerName);
            this.currentSlot = 1;
            
            // Load world explorer
            await this.loadWorldExplorer();
            
            this.gameState = 'world';
            document.getElementById('cw-save-btn').style.display = 'inline-block';
            
            console.log('New game started');
        } catch (error) {
            console.error('Failed to start new game:', error);
            this.gameState = 'menu';
        }
    }

    /**
     * Load world explorer system
     */
    async loadWorldExplorer() {
        // Initialize the world explorer
        this.worldExplorer = new WorldExplorer(this, this.fruitLoader);
        await this.worldExplorer.init(this.currentSave.currentWorld, this.currentSave.currentArea || 'vegetable_patch');
        console.log('World explorer loaded successfully');
    }

    /**
     * Show load game menu
     */
    showLoadGameMenu() {
        const saves = this.saveManager.getAllSaveInfo();
        console.log('Available saves:', saves);
        // This would show a proper load game UI
        alert('Load game menu - coming soon!');
    }

    /**
     * Quick save current game
     */
    quickSave() {
        if (this.currentSave && this.currentSlot) {
            if (this.saveManager.saveGame(this.currentSlot, this.currentSave)) {
                this.showMessage('Game saved!');
            } else {
                this.showMessage('Save failed!');
            }
        }
    }

    /**
     * Show temporary message
     */
    showMessage(message) {
        console.log(message);
        // This would show a proper UI message
    }

    /**
     * Show error message
     */
    showError(message) {
        console.error(message);
        alert(message); // Temporary - would use proper error UI
    }

    /**
     * Get current game state info
     */
    getGameState() {
        return {
            state: this.gameState,
            isInitialized: this.isInitialized,
            currentSave: this.currentSave ? this.currentSave.playerName : null,
            fps: this.fps
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CucumberWorld;
} else if (typeof window !== 'undefined') {
    window.CucumberWorld = CucumberWorld;
}