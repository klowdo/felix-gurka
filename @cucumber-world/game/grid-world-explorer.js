/**
 * Grid World Explorer - Pokemon-style grid-based world exploration
 * Part of Cucumber World RPG Enhanced System
 */

class GridWorldExplorer {
    constructor(gameEngine, fruitLoader) {
        this.gameEngine = gameEngine;
        this.fruitLoader = fruitLoader;
        
        // Grid system
        this.gridSystem = new GridSystem(32);
        
        // Current world state
        this.currentWorld = null;
        this.currentLevel = null;
        this.levelData = null;
        
        // Input handling
        this.keys = {};
        this.lastKeyPress = 0;
        this.keyRepeatDelay = 150; // milliseconds
        
        // UI state
        this.showLevelInfo = false;
        this.levelInfoTimer = 0;
        this.encounterPopup = null;
        this.interactionPrompt = null;
        
        // Debug
        this.showDebugInfo = false;
        
        this.setupEventHandlers();
        this.setupGridEventHandlers();
    }

    /**
     * Initialize grid-based world exploration
     */
    async init(worldId = 'garden', levelId = 'vegetable_patch_grid') {
        try {
            console.log(`Loading grid world: ${worldId}, level: ${levelId}`);
            
            // Initialize grid system
            await this.gridSystem.init();
            
            // Load level data
            await this.loadLevel(worldId, levelId);
            
            // Show level info when entering
            this.showLevelInfo = true;
            this.levelInfoTimer = 3000; // Show for 3 seconds
            
            console.log('Grid world explorer initialized');
        } catch (error) {
            console.error('Failed to initialize grid world explorer:', error);
            throw error;
        }
    }

    /**
     * Load a level
     */
    async loadLevel(worldId, levelId) {
        try {
            // Try to load grid-based level data
            const levelPath = `@cucumber-world/worlds/${worldId}/levels/${levelId}.json`;
            const response = await fetch(levelPath);
            
            if (!response.ok) {
                throw new Error(`Failed to load level: ${levelPath}`);
            }
            
            this.levelData = await response.json();
            this.currentWorld = worldId;
            this.currentLevel = levelId;
            
            // Load level into grid system
            this.gridSystem.loadLevel(this.levelData);
            
            console.log('Grid level loaded:', levelId);
        } catch (error) {
            console.error('Failed to load grid level:', error);
            // Create a fallback level
            this.createFallbackLevel();
        }
    }

    /**
     * Create fallback level if loading fails
     */
    createFallbackLevel() {
        this.levelData = {
            id: 'fallback_level',
            name: 'Fallback Garden',
            type: 'grid_based',
            player_start: { x: 18, y: 12 }
        };
        
        this.gridSystem.generateDefaultLevel();
        this.gridSystem.setPlayerPosition(18, 12);
        
        console.log('Fallback level created');
    }

    /**
     * Setup grid event handlers
     */
    setupGridEventHandlers() {
        this.gridSystem.setEventHandlers({
            onEncounter: (encounterData) => this.handleEncounter(encounterData),
            onInteraction: (interactionData) => this.handleInteraction(interactionData),
            onHealing: () => this.handleHealing(),
            onTransition: (transitionData) => this.handleTransition(transitionData)
        });
    }

    /**
     * Update world exploration logic
     */
    update(timestamp) {
        // Update grid system movement
        this.gridSystem.updateMovement();
        
        // Update timers
        if (this.levelInfoTimer > 0) {
            this.levelInfoTimer -= 16;
            if (this.levelInfoTimer <= 0) {
                this.showLevelInfo = false;
            }
        }
        
        // Handle input
        this.handleInput();
        
        // Update any active popups
        if (this.encounterPopup) {
            this.updateEncounterPopup();
        }
    }

    /**
     * Handle keyboard input
     */
    handleInput() {
        const now = Date.now();
        
        // Prevent too rapid key repeats
        if (now - this.lastKeyPress < this.keyRepeatDelay) {
            return;
        }
        
        // Movement input
        if (this.keys['w'] || this.keys['arrowup']) {
            if (this.gridSystem.movePlayer('up')) {
                this.lastKeyPress = now;
            }
        } else if (this.keys['s'] || this.keys['arrowdown']) {
            if (this.gridSystem.movePlayer('down')) {
                this.lastKeyPress = now;
            }
        } else if (this.keys['a'] || this.keys['arrowleft']) {
            if (this.gridSystem.movePlayer('left')) {
                this.lastKeyPress = now;
            }
        } else if (this.keys['d'] || this.keys['arrowright']) {
            if (this.gridSystem.movePlayer('right')) {
                this.lastKeyPress = now;
            }
        }
        
        // Interaction input
        if (this.keys[' ']) { // Space bar
            this.gridSystem.interact();
            this.lastKeyPress = now;
        }
    }

    /**
     * Render the grid world
     */
    render(ctx) {
        // Clear canvas
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        
        // Render grid system (world moves with camera)
        this.gridSystem.render(ctx);
        
        // Render UI elements (stay on screen - no camera transform)
        this.renderUI(ctx);
        
        // Render popups (stay on screen - no camera transform)
        if (this.encounterPopup) {
            this.renderEncounterPopup(ctx);
        }
        
        if (this.interactionPrompt) {
            this.renderInteractionPrompt(ctx);
        }
    }

    /**
     * Render UI elements
     */
    renderUI(ctx) {
        // Render level info
        this.renderLevelInfo(ctx);
        
        // Render level transition info
        if (this.showLevelInfo) {
            this.renderLevelTransitionInfo(ctx);
        }
        
        // Render debug info
        if (this.showDebugInfo) {
            this.renderDebugInfo(ctx);
        }
        
        // Render instructions
        this.renderInstructions(ctx);
    }

    /**
     * Render level information
     */
    renderLevelInfo(ctx) {
        if (!this.levelData) return;
        
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(10, 10, 300, 80);
        
        ctx.fillStyle = 'white';
        ctx.font = 'bold 16px Arial';
        ctx.fillText(`Level: ${this.levelData.name || 'Unknown'}`, 20, 30);
        
        ctx.font = '12px Arial';
        ctx.fillText(`Type: Grid-Based (${this.gridSystem.gridWidth}x${this.gridSystem.gridHeight})`, 20, 50);
        
        const playerState = this.gridSystem.getPlayerState();
        ctx.fillText(`Position: (${playerState.gridX}, ${playerState.gridY})`, 20, 70);
        ctx.fillText(`Steps: ${playerState.stepCount}`, 200, 70);
        
        ctx.restore();
    }

    /**
     * Render level transition info
     */
    renderLevelTransitionInfo(ctx) {
        if (!this.levelData) return;
        
        const centerX = ctx.canvas.width / 2;
        const centerY = 100;
        const width = 400;
        const height = 120;
        
        ctx.save();
        
        // Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(centerX - width/2, centerY - height/2, width, height);
        
        // Border
        ctx.strokeStyle = '#4CAF50';
        ctx.lineWidth = 3;
        ctx.strokeRect(centerX - width/2, centerY - height/2, width, height);
        
        // Text
        ctx.fillStyle = 'white';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.levelData.name || 'Unknown Level', centerX, centerY - 30);
        
        ctx.font = '14px Arial';
        const description = this.levelData.description || 'A grid-based exploration area';
        ctx.fillText(description, centerX, centerY - 5);
        
        ctx.font = '12px Arial';
        ctx.fillText('🎮 Grid-Based Movement: Use WASD or Arrow Keys', centerX, centerY + 20);
        ctx.fillText('🔍 Press SPACE to interact with objects', centerX, centerY + 35);
        
        ctx.restore();
    }

    /**
     * Render debug information
     */
    renderDebugInfo(ctx) {
        const playerState = this.gridSystem.getPlayerState();
        
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(ctx.canvas.width - 200, 10, 190, 120);
        
        ctx.fillStyle = '#00FF00';
        ctx.font = '12px monospace';
        ctx.fillText('=== DEBUG INFO ===', ctx.canvas.width - 190, 30);
        ctx.fillText(`Grid: ${playerState.gridX}, ${playerState.gridY}`, ctx.canvas.width - 190, 50);
        ctx.fillText(`Pixel: ${Math.round(playerState.pixelX)}, ${Math.round(playerState.pixelY)}`, ctx.canvas.width - 190, 70);
        ctx.fillText(`Moving: ${playerState.isMoving}`, ctx.canvas.width - 190, 90);
        ctx.fillText(`Steps: ${playerState.stepCount}`, ctx.canvas.width - 190, 110);
        
        ctx.restore();
    }

    /**
     * Render movement instructions
     */
    renderInstructions(ctx) {
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(ctx.canvas.width - 220, ctx.canvas.height - 80, 210, 70);
        
        ctx.fillStyle = 'white';
        ctx.font = '12px Arial';
        ctx.fillText('🎮 WASD / Arrow Keys: Move', ctx.canvas.width - 210, ctx.canvas.height - 60);
        ctx.fillText('🔍 SPACE: Interact', ctx.canvas.width - 210, ctx.canvas.height - 45);
        ctx.fillText('🌱 Walk through grass for encounters!', ctx.canvas.width - 210, ctx.canvas.height - 30);
        ctx.fillText('🫐 Berry bushes = more fruits!', ctx.canvas.width - 210, ctx.canvas.height - 15);
        
        ctx.restore();
    }

    /**
     * Handle encounters
     */
    handleEncounter(encounterData) {
        console.log('Encounter triggered:', encounterData);
        
        // Create encounter popup based on type
        let message = '';
        let encounterType = 'wild_fruit';
        
        if (encounterData.type === 'wild_fruit') {
            const fruits = ['Apple', 'Orange', 'Banana', 'Berry'];
            const randomFruit = fruits[Math.floor(Math.random() * fruits.length)];
            message = `A wild ${randomFruit} appeared!`;
            encounterType = 'fruit';
        } else if (encounterData.type === 'trainer') {
            message = 'A cucumber trainer wants to battle!';
            encounterType = 'trainer';
        }
        
        this.encounterPopup = {
            type: encounterType,
            message: message,
            data: encounterData,
            timestamp: Date.now()
        };
    }

    /**
     * Handle interactions
     */
    handleInteraction(interactionData) {
        console.log('Interaction triggered:', interactionData);
        
        if (interactionData.tile.has_text) {
            this.showTextDialog(interactionData);
        } else if (interactionData.tile.harvestable) {
            this.handleHarvest(interactionData);
        } else if (interactionData.tile.healing) {
            this.handleHealing();
        } else {
            this.showGenericInteraction(interactionData);
        }
    }

    /**
     * Show text dialog
     */
    showTextDialog(interactionData) {
        // Find the specific text for this interaction
        let text = 'This is an interactive object.';
        
        if (this.levelData && this.levelData.interactive_objects) {
            const obj = this.levelData.interactive_objects.find(o => 
                o.position.x === interactionData.position.x && 
                o.position.y === interactionData.position.y
            );
            
            if (obj && obj.text) {
                text = obj.text;
            }
        }
        
        this.interactionPrompt = {
            type: 'text',
            message: text,
            timestamp: Date.now()
        };
        
        // Auto-close after 5 seconds
        setTimeout(() => {
            this.interactionPrompt = null;
        }, 5000);
    }

    /**
     * Handle harvest action
     */
    handleHarvest(interactionData) {
        const fruits = ['Berry', 'Super Berry', 'Rare Fruit'];
        const harvestedFruit = fruits[Math.floor(Math.random() * fruits.length)];
        
        this.interactionPrompt = {
            type: 'harvest',
            message: `You harvested a ${harvestedFruit}!`,
            timestamp: Date.now()
        };
        
        setTimeout(() => {
            this.interactionPrompt = null;
        }, 3000);
    }

    /**
     * Handle healing
     */
    handleHealing() {
        this.interactionPrompt = {
            type: 'healing',
            message: 'Your fruits have been healed!',
            timestamp: Date.now()
        };
        
        setTimeout(() => {
            this.interactionPrompt = null;
        }, 3000);
    }

    /**
     * Show generic interaction
     */
    showGenericInteraction(interactionData) {
        this.interactionPrompt = {
            type: 'generic',
            message: `You examined the ${interactionData.tile.name || 'object'}.`,
            timestamp: Date.now()
        };
        
        setTimeout(() => {
            this.interactionPrompt = null;
        }, 2000);
    }

    /**
     * Handle level transitions
     */
    handleTransition(transitionData) {
        console.log('Transition triggered:', transitionData);
        // This would be handled by the game engine to load new levels
    }

    /**
     * Render encounter popup
     */
    renderEncounterPopup(ctx) {
        if (!this.encounterPopup) return;
        
        const centerX = ctx.canvas.width / 2;
        const centerY = ctx.canvas.height / 2;
        const width = 350;
        const height = 160;
        
        ctx.save();
        
        // Background
        ctx.fillStyle = 'rgba(255, 215, 0, 0.95)';
        ctx.fillRect(centerX - width/2, centerY - height/2, width, height);
        
        // Border
        ctx.strokeStyle = '#FF6347';
        ctx.lineWidth = 4;
        ctx.strokeRect(centerX - width/2, centerY - height/2, width, height);
        
        // Title
        ctx.fillStyle = '#8B0000';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Wild Encounter!', centerX, centerY - 40);
        
        // Message
        ctx.font = '18px Arial';
        ctx.fillText(this.encounterPopup.message, centerX, centerY - 10);
        
        // Instructions
        ctx.font = '14px Arial';
        ctx.fillText('Click anywhere to continue...', centerX, centerY + 30);
        
        // Emoji
        const emoji = this.encounterPopup.type === 'fruit' ? '🍎' : '🥒';
        ctx.font = '40px Arial';
        ctx.fillText(emoji, centerX, centerY + 60);
        
        ctx.restore();
    }

    /**
     * Render interaction prompt
     */
    renderInteractionPrompt(ctx) {
        if (!this.interactionPrompt) return;
        
        const centerX = ctx.canvas.width / 2;
        const centerY = ctx.canvas.height - 150;
        const maxWidth = 500;
        
        // Split text into lines
        const lines = this.wrapText(ctx, this.interactionPrompt.message, maxWidth);
        const lineHeight = 20;
        const height = Math.max(80, lines.length * lineHeight + 40);
        
        ctx.save();
        
        // Background
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.fillRect(centerX - maxWidth/2, centerY - height/2, maxWidth, height);
        
        // Border
        ctx.strokeStyle = '#4CAF50';
        ctx.lineWidth = 3;
        ctx.strokeRect(centerX - maxWidth/2, centerY - height/2, maxWidth, height);
        
        // Text
        ctx.fillStyle = '#2F4F2F';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        
        lines.forEach((line, index) => {
            const y = centerY - (lines.length * lineHeight / 2) + (index * lineHeight) + 10;
            ctx.fillText(line, centerX, y);
        });
        
        ctx.restore();
    }

    /**
     * Wrap text to fit within specified width
     */
    wrapText(ctx, text, maxWidth) {
        const words = text.split(' ');
        const lines = [];
        let currentLine = words[0];
        
        for (let i = 1; i < words.length; i++) {
            const word = words[i];
            const width = ctx.measureText(currentLine + ' ' + word).width;
            
            if (width < maxWidth) {
                currentLine += ' ' + word;
            } else {
                lines.push(currentLine);
                currentLine = word;
            }
        }
        
        lines.push(currentLine);
        return lines;
    }

    /**
     * Update encounter popup
     */
    updateEncounterPopup() {
        // Auto-close encounter popup after 10 seconds
        if (this.encounterPopup && Date.now() - this.encounterPopup.timestamp > 10000) {
            this.encounterPopup = null;
        }
    }

    /**
     * Handle click events
     */
    handleClick(x, y) {
        // Close encounter popup
        if (this.encounterPopup) {
            this.encounterPopup = null;
            return;
        }
        
        // Close interaction prompt
        if (this.interactionPrompt) {
            this.interactionPrompt = null;
            return;
        }
    }

    /**
     * Setup keyboard event handlers
     */
    setupEventHandlers() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
            
            // Prevent default for game controls
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'w', 'a', 's', 'd'].includes(e.key)) {
                e.preventDefault();
            }
            
            // Debug toggle
            if (e.key === 'F3') {
                this.toggleDebug();
                e.preventDefault();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
    }

    /**
     * Toggle debug mode
     */
    toggleDebug() {
        this.showDebugInfo = !this.showDebugInfo;
        this.gridSystem.toggleDebugGrid();
        console.log('Debug mode:', this.showDebugInfo ? 'ON' : 'OFF');
    }

    /**
     * Get current explorer state
     */
    getState() {
        const playerState = this.gridSystem.getPlayerState();
        
        return {
            currentWorld: this.currentWorld,
            currentLevel: this.currentLevel,
            playerGridX: playerState.gridX,
            playerGridY: playerState.gridY,
            stepCount: playerState.stepCount
        };
    }

    /**
     * Load explorer state
     */
    loadState(state) {
        this.currentWorld = state.currentWorld;
        this.currentLevel = state.currentLevel;
        
        if (state.playerGridX !== undefined && state.playerGridY !== undefined) {
            this.gridSystem.setPlayerPosition(state.playerGridX, state.playerGridY);
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GridWorldExplorer;
} else if (typeof window !== 'undefined') {
    window.GridWorldExplorer = GridWorldExplorer;
}