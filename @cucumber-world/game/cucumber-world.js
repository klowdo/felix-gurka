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
        this.gridWorldExplorer = null;
        this.battleSystem = null;
        this.inventory = null;
        this.useGridSystem = true; // Toggle between grid-based and free movement
        
        // Game state
        this.currentSave = null;
        this.currentSlot = null;
        this.gameState = 'menu'; // menu, loading, world, battle, inventory, newgame
        this.isInitialized = false;
        
        // Battle system
        this.currentBattle = null;
        this.battleInput = null;
        this.battleUI = null;
        
        // UI state
        this.selectedSaveSlot = 1;
        this.selectedMenuOption = 0;
        this.playerNameInput = '';
        
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

        // Check if the game content already exists (from rpg-init.js)
        const existingGame = this.container.querySelector('.cucumber-world-game');
        if (existingGame) {
            console.log('Using existing game container');
            return;
        }

        // Create new game container if it doesn't exist
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
                    <canvas id="cw-game-canvas" width="1200" height="800"></canvas>
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
        
        // Maintain 3:2 aspect ratio for better widescreen experience
        const aspectRatio = 3 / 2;  // 1200:800 = 3:2
        let width = Math.min(containerRect.width - 40, 1200); // padding and max width
        let height = width / aspectRatio;
        
        if (height > containerRect.height - 40) {
            height = containerRect.height - 40;
            width = height * aspectRatio;
        }
        
        // Set canvas size
        this.canvas.style.width = width + 'px';
        this.canvas.style.height = height + 'px';
        
        // Keep internal resolution high for crisp graphics
        this.canvas.width = 1200;
        this.canvas.height = 800;
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
        const menuBtn = document.getElementById('cw-menu-btn');
        if (menuBtn) {
            menuBtn.addEventListener('click', () => {
                this.showMainMenu();
            });
        }

        // Save button
        const saveBtn = document.getElementById('cw-save-btn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                this.quickSave();
            });
        }

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
                if (this.useGridSystem && this.gridWorldExplorer) {
                    this.gridWorldExplorer.update(timestamp);
                } else if (this.worldExplorer) {
                    this.worldExplorer.update(timestamp);
                }
                break;
            case 'battle':
                if (this.battleSystem) {
                    this.battleSystem.update(timestamp);
                } else if (this.battleUI) {
                    this.battleUI.update(timestamp);
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
            case 'newgame':
                this.renderNewGameForm();
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
        if (this.useGridSystem && this.gridWorldExplorer) {
            this.gridWorldExplorer.render(this.ctx);
        } else if (this.worldExplorer) {
            this.worldExplorer.render(this.ctx);
        } else {
            // Placeholder world view
            const ctx = this.ctx;
            ctx.fillStyle = '#228B22';
            ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            ctx.fillStyle = 'white';
            ctx.font = 'bold 20px Arial';
            ctx.textAlign = 'center';
            const systemType = this.useGridSystem ? 'Grid World' : 'World';
            ctx.fillText(`${systemType} Explorer Loading...`, this.canvas.width / 2, this.canvas.height / 2);
        }
    }

    /**
     * Render battle view
     */
    renderBattleView() {
        if (this.battleSystem) {
            this.battleSystem.render(this.ctx);
        } else if (this.currentBattle && this.battleUI) {
            // Render interactive battle screen
            this.battleUI.render(this.ctx, this.currentBattle, this.battleInput, this);
        } else if (this.currentBattle) {
            // Fallback to simple battle screen
            this.renderSimpleBattle(this.ctx);
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
     * Render simple battle screen (placeholder)
     */
    renderSimpleBattle(ctx) {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        // Battle background (garden theme)
        const gradient = ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#87CEEB'); // Sky blue
        gradient.addColorStop(0.7, '#90EE90'); // Light green
        gradient.addColorStop(1, '#228B22'); // Forest green
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw battle participants
        if (this.currentBattle) {
            const enemyFruit = this.currentBattle.enemyFruit;
            const playerFruit = this.currentBattle.playerFruit;
            
            // Enemy fruit (top right)
            ctx.save();
            ctx.font = '60px Arial';
            ctx.textAlign = 'center';
            
            // Enemy fruit emoji
            const enemyEmoji = this.getFruitEmoji(enemyFruit.species);
            ctx.fillText(enemyEmoji, centerX + 200, centerY - 150);
            
            // Enemy info
            ctx.font = 'bold 18px Arial';
            ctx.fillStyle = 'white';
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 2;
            
            const enemyText = `${enemyFruit.name} Lv.${enemyFruit.level}`;
            ctx.strokeText(enemyText, centerX + 200, centerY - 80);
            ctx.fillText(enemyText, centerX + 200, centerY - 80);
            
            // Enemy HP bar
            this.renderHPBar(ctx, centerX + 120, centerY - 60, 160, 12, 
                           enemyFruit.hp, enemyFruit.maxHP);
            
            // Player fruit (bottom left)
            ctx.font = '60px Arial';
            ctx.fillText('🥒', centerX - 200, centerY + 100);
            
            // Player info
            ctx.font = 'bold 18px Arial';
            const playerText = `${playerFruit.name} Lv.${playerFruit.level}`;
            ctx.strokeText(playerText, centerX - 200, centerY + 140);
            ctx.fillText(playerText, centerX - 200, centerY + 140);
            
            // Player HP bar
            this.renderHPBar(ctx, centerX - 280, centerY + 160, 160, 12,
                           playerFruit.hp, playerFruit.maxHP);
            
            ctx.restore();
        }
        
        // Battle message box
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(50, this.canvas.height - 150, this.canvas.width - 100, 100);
        
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 3;
        ctx.strokeRect(50, this.canvas.height - 150, this.canvas.width - 100, 100);
        
        // Battle message
        ctx.fillStyle = 'white';
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'left';
        
        let battleMessage = "Battle in progress...";
        if (this.currentBattle) {
            battleMessage = `A wild ${this.currentBattle.enemyFruit.name} appeared!`;
        }
        
        ctx.fillText(battleMessage, 80, this.canvas.height - 110);
        ctx.fillText("(Battle system in development)", 80, this.canvas.height - 80);
    }

    /**
     * Render HP bar
     */
    renderHPBar(ctx, x, y, width, height, currentHP, maxHP) {
        // Background
        ctx.fillStyle = '#333';
        ctx.fillRect(x, y, width, height);
        
        // HP bar
        const hpRatio = currentHP / maxHP;
        const hpWidth = width * hpRatio;
        
        // Color based on HP ratio
        if (hpRatio > 0.5) {
            ctx.fillStyle = '#4CAF50'; // Green
        } else if (hpRatio > 0.2) {
            ctx.fillStyle = '#FFC107'; // Yellow
        } else {
            ctx.fillStyle = '#F44336'; // Red
        }
        
        ctx.fillRect(x, y, hpWidth, height);
        
        // Border
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, width, height);
        
        // HP text
        ctx.fillStyle = 'white';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`${currentHP}/${maxHP}`, x + width/2, y + height + 12);
    }

    /**
     * Get emoji for fruit species
     */
    getFruitEmoji(species) {
        const emojis = {
            'apple': '🍎',
            'orange': '🍊', 
            'banana': '🍌',
            'berry': '🫐',
            'cucumber': '🥒'
        };
        return emojis[species] || '🍎';
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
     * Render new game form
     */
    renderNewGameForm() {
        const ctx = this.ctx;
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;

        // Background gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#98FB98');
        gradient.addColorStop(1, '#90EE90');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Form background
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.fillRect(centerX - 300, centerY - 200, 600, 400);
        
        // Form border
        ctx.strokeStyle = '#2F4F2F';
        ctx.lineWidth = 3;
        ctx.strokeRect(centerX - 300, centerY - 200, 600, 400);

        // Title
        ctx.fillStyle = '#2F4F2F';
        ctx.font = 'bold 32px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('🥒 Start New Adventure 🥒', centerX, centerY - 140);

        // Subtitle
        ctx.font = '18px Arial';
        ctx.fillText('Enter your name to begin exploring Cucumber World!', centerX, centerY - 100);

        // Name input label
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('Player Name:', centerX - 250, centerY - 50);

        // Input field background
        ctx.fillStyle = 'white';
        ctx.fillRect(centerX - 250, centerY - 30, 500, 40);
        ctx.strokeStyle = '#4CAF50';
        ctx.lineWidth = 2;
        ctx.strokeRect(centerX - 250, centerY - 30, 500, 40);

        // Show current input
        ctx.fillStyle = '#2F4F2F';
        ctx.font = '18px Arial';
        ctx.textAlign = 'left';
        const inputText = this.playerNameInput || '';
        ctx.fillText(inputText + (Date.now() % 1000 < 500 ? '|' : ''), centerX - 240, centerY - 8);

        // Buttons
        this.renderButton(ctx, centerX - 100, centerY + 50, 200, 40, 'Start Game', '#4CAF50');
        this.renderButton(ctx, centerX - 100, centerY + 110, 200, 40, 'Back to Menu', '#f44336');

        // Instructions
        ctx.fillStyle = '#666';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Type your name and click "Start Game" or press Enter', centerX, centerY + 170);
    }

    /**
     * Render a button
     */
    renderButton(ctx, x, y, width, height, text, color) {
        // Button background
        ctx.fillStyle = color;
        ctx.fillRect(x, y, width, height);
        
        // Button border
        ctx.strokeStyle = this.darkenColor(color, 0.2);
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, width, height);
        
        // Button text
        ctx.fillStyle = 'white';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(text, x + width/2, y + height/2 + 5);
    }

    /**
     * Darken a color
     */
    darkenColor(color, percent) {
        // Simple color darkening - in production you'd want a more robust solution
        if (color === '#4CAF50') return '#45a049';
        if (color === '#f44336') return '#da190b';
        return color;
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
            case 'newgame':
                this.handleNewGameClick(canvasX, canvasY);
                break;
            case 'world':
                if (this.useGridSystem && this.gridWorldExplorer) {
                    this.gridWorldExplorer.handleClick(canvasX, canvasY);
                } else if (this.worldExplorer) {
                    this.worldExplorer.handleClick(canvasX, canvasY);
                }
                break;
        }
    }

    /**
     * Handle menu clicks
     */
    handleMenuClick(x, y) {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        // Check menu option clicks
        const menuOptions = ['New Game', 'Load Game', 'Settings', 'About'];
        
        for (let i = 0; i < menuOptions.length; i++) {
            const optionY = centerY - 20 + (i * 50);
            if (x > centerX - 120 && x < centerX + 120 && 
                y > optionY - 20 && y < optionY + 20) {
                this.selectedMenuOption = i;
                this.handleMenuSelect();
                break;
            }
        }
    }

    /**
     * Handle new game form clicks
     */
    handleNewGameClick(x, y) {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        // Start Game button
        if (x > centerX - 100 && x < centerX + 100 && 
            y > centerY + 50 && y < centerY + 90) {
            this.confirmNewGame();
        }
        
        // Back to Menu button
        if (x > centerX - 100 && x < centerX + 100 && 
            y > centerY + 110 && y < centerY + 150) {
            this.showMainMenu();
        }
    }

    /**
     * Handle menu selection
     */
    handleMenuSelect() {
        switch (this.selectedMenuOption) {
            case 0: // New Game
                this.showNewGameForm();
                break;
            case 1: // Load Game
                this.showLoadGameMenu();
                break;
            case 2: // Settings
                this.showMessage('Settings coming soon!');
                break;
            case 3: // About
                this.showMessage('Cucumber World RPG v1.0 - Made with 💚');
                break;
        }
    }

    /**
     * Handle keyboard events
     */
    handleKeyDown(event) {
        // Prevent arrow keys from scrolling the page when game is active
        if (this.gameState !== 'menu' && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
            event.preventDefault();
        }
        
        // Handle new game form input
        if (this.gameState === 'newgame') {
            if (event.key === 'Escape') {
                this.showMainMenu();
                return;
            }
            
            if (event.key === 'Enter') {
                this.confirmNewGame();
                return;
            }
            
            if (event.key === 'Backspace') {
                this.playerNameInput = this.playerNameInput.slice(0, -1);
                return;
            }
            
            // Add character if it's a valid input
            if (event.key.length === 1 && this.playerNameInput.length < 20) {
                this.playerNameInput += event.key;
                return;
            }
        }
        
        switch (event.key) {
            case 'Escape':
                this.showMainMenu();
                break;
            case 'Enter':
                if (this.gameState === 'menu') {
                    this.handleMenuSelect();
                }
                break;
            case 'ArrowUp':
                if (this.gameState === 'menu') {
                    this.selectedMenuOption = Math.max(0, this.selectedMenuOption - 1);
                }
                break;
            case 'ArrowDown':
                if (this.gameState === 'menu') {
                    this.selectedMenuOption = Math.min(3, this.selectedMenuOption + 1);
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
     * Show new game form
     */
    showNewGameForm() {
        this.gameState = 'newgame';
        this.playerNameInput = '';
    }

    /**
     * Confirm new game creation
     */
    async confirmNewGame() {
        const playerName = this.playerNameInput.trim() || 'Player';
        
        if (playerName.length < 1) {
            this.showMessage('Please enter a valid name!');
            return;
        }

        try {
            this.gameState = 'loading';
            
            // Create new save
            this.currentSave = this.saveManager.createNewSave(1, playerName);
            this.currentSlot = 1;
            
            // Load world explorer
            await this.loadWorldExplorer();
            
            this.gameState = 'world';
            const saveBtn = document.getElementById('cw-save-btn');
            if (saveBtn) saveBtn.style.display = 'inline-block';
            
            console.log('New game started');
        } catch (error) {
            console.error('Failed to start new game:', error);
            this.gameState = 'menu';
        }
    }

    /**
     * Start a new game (legacy method for compatibility)
     */
    async startNewGame() {
        this.showNewGameForm();
    }

    /**
     * Load world explorer system
     */
    async loadWorldExplorer() {
        console.log('Loading world explorer, useGridSystem:', this.useGridSystem);
        console.log('Current save data:', this.currentSave);
        
        if (this.useGridSystem) {
            // Initialize grid-based world explorer
            this.gridWorldExplorer = new GridWorldExplorer(this, this.fruitLoader);
            const levelId = this.currentSave.currentArea === 'vegetable_patch' ? 
                'vegetable_patch_grid' : (this.currentSave.currentArea + '_grid');
            console.log(`Loading grid level: ${levelId} for area: ${this.currentSave.currentArea}`);
            await this.gridWorldExplorer.init(this.currentSave.currentWorld, levelId);
            console.log('Grid world explorer loaded successfully');
        } else {
            // Initialize traditional world explorer
            this.worldExplorer = new WorldExplorer(this, this.fruitLoader);
            await this.worldExplorer.init(this.currentSave.currentWorld, this.currentSave.currentArea || 'vegetable_patch');
            console.log('World explorer loaded successfully');
        }
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
     * Start a battle with given battle data
     */
    startBattle(battleData) {
        console.log('Game engine starting battle:', battleData);
        
        // Store battle data
        this.currentBattle = battleData;
        
        // Initialize battle input and UI systems
        if (!this.battleInput) {
            this.battleInput = new BattleInput();
            
            // Set up battle action callbacks
            this.battleInput.setCallbacks({
                onActionSelected: (action) => this.handleBattleAction(action),
                onMoveSelected: (moveIndex) => this.handleMoveSelection(moveIndex),
                onItemSelected: (itemIndex) => this.handleItemSelection(itemIndex),
                onMenuBack: () => this.handleMenuBack()
            });
        }
        
        if (!this.battleUI) {
            this.battleUI = new BattleUI();
        }
        
        // Reset battle input to main menu
        this.battleInput.resetToMainMenu();
        
        // Change to battle state
        this.gameState = 'battle';
        
        console.log('Interactive battle started!');
    }

    /**
     * End the current battle
     */
    endBattle(result) {
        console.log('Battle ended with result:', result);
        
        // Call the battle end callback
        if (this.currentBattle && this.currentBattle.onBattleEnd) {
            this.currentBattle.onBattleEnd(result);
        }
        
        // Clear battle data
        this.currentBattle = null;
    }

    /**
     * Return to world exploration from battle
     */
    returnToWorld() {
        console.log('Returning to world exploration');
        this.gameState = 'world';
    }

    /**
     * Show error message
     */
    showError(message) {
        console.error(message);
        alert(message); // Temporary - would use proper error UI
    }

    /**
     * Handle battle actions
     */
    handleBattleAction(action) {
        console.log('Battle action selected:', action);
        
        switch (action) {
            case 'defend':
                this.executeBattleDefend();
                break;
            case 'run':
                this.executeBattleRun();
                break;
        }
    }
    
    /**
     * Handle move selection
     */
    handleMoveSelection(moveIndex) {
        console.log('Move selected:', moveIndex);
        
        if (this.currentBattle && this.currentBattle.playerFruit) {
            const playerMoves = this.currentBattle.playerFruit.moves;
            const selectedMove = playerMoves[moveIndex];
            
            if (selectedMove) {
                this.executeBattleAttack(selectedMove);
            }
        }
    }
    
    /**
     * Handle item selection
     */
    handleItemSelection(itemIndex) {
        console.log('Item selected:', itemIndex);
        // Placeholder for item usage
        this.showMessage('Items coming soon!');
    }
    
    /**
     * Handle menu back navigation
     */
    handleMenuBack() {
        console.log('Back to main battle menu');
    }
    
    /**
     * Execute attack move
     */
    executeBattleAttack(move) {
        if (!this.currentBattle) return;
        
        const attacker = this.currentBattle.playerFruit;
        const defender = this.currentBattle.enemyFruit;
        
        // Calculate damage (simplified for now)
        const damage = Math.floor(Math.random() * 20) + 10;
        defender.hp = Math.max(0, defender.hp - damage);
        
        // Update battle message
        this.currentBattle.currentMessage = `${attacker.name} used ${move}! Dealt ${damage} damage!`;
        
        console.log(`${attacker.name} used ${move} for ${damage} damage!`);
        
        // Check if enemy is defeated
        if (defender.hp <= 0) {
            setTimeout(() => {
                this.endBattle({
                    victory: true,
                    expGained: 25,
                    levelUp: false
                });
            }, 2000);
        } else {
            // Enemy counter-attack after delay
            setTimeout(() => {
                this.executeEnemyTurn();
            }, 2000);
        }
    }
    
    /**
     * Execute defend action
     */
    executeBattleDefend() {
        if (!this.currentBattle) return;
        
        const player = this.currentBattle.playerFruit;
        
        // Small heal when defending
        const healAmount = Math.floor(player.maxHP * 0.1);
        player.hp = Math.min(player.maxHP, player.hp + healAmount);
        
        this.currentBattle.currentMessage = `${player.name} defends and recovers ${healAmount} HP!`;
        
        console.log(`${player.name} defended and healed ${healAmount} HP`);
        
        // Enemy turn after delay
        setTimeout(() => {
            this.executeEnemyTurn();
        }, 2000);
    }
    
    /**
     * Execute run action
     */
    executeBattleRun() {
        if (!this.currentBattle) return;
        
        // 75% chance to escape from wild battles
        const escapeChance = 0.75;
        
        if (Math.random() < escapeChance) {
            this.currentBattle.currentMessage = "Successfully ran away!";
            
            setTimeout(() => {
                this.endBattle({
                    victory: false,
                    escaped: true,
                    expGained: 0,
                    levelUp: false
                });
            }, 1500);
        } else {
            this.currentBattle.currentMessage = "Couldn't escape!";
            
            setTimeout(() => {
                this.executeEnemyTurn();
            }, 2000);
        }
    }
    
    /**
     * Execute enemy turn
     */
    executeEnemyTurn() {
        if (!this.currentBattle) return;
        
        const attacker = this.currentBattle.enemyFruit;
        const defender = this.currentBattle.playerFruit;
        
        // Simple AI: always attack with first move
        const enemyMove = attacker.moves[0] || 'Tackle';
        const damage = Math.floor(Math.random() * 15) + 5;
        
        defender.hp = Math.max(0, defender.hp - damage);
        
        this.currentBattle.currentMessage = `Wild ${attacker.name} used ${enemyMove}! Dealt ${damage} damage!`;
        
        console.log(`Enemy ${attacker.name} used ${enemyMove} for ${damage} damage!`);
        
        // Check if player is defeated
        if (defender.hp <= 0) {
            setTimeout(() => {
                this.endBattle({
                    victory: false,
                    expGained: 0,
                    levelUp: false
                });
            }, 2000);
        } else {
            // Reset to player turn
            setTimeout(() => {
                this.currentBattle.currentMessage = "What will Cucumber do?";
                this.battleInput.resetToMainMenu();
            }, 2000);
        }
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