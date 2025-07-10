/**
 * World Explorer - Handles world navigation and exploration
 * Part of Cucumber World RPG
 */

class WorldExplorer {
    constructor(gameEngine, fruitLoader) {
        this.gameEngine = gameEngine;
        this.fruitLoader = fruitLoader;
        
        // Current world state
        this.currentWorld = null;
        this.currentArea = null;
        this.worldData = null;
        
        // Player position
        this.playerX = 400;
        this.playerY = 300;
        this.playerSpeed = 3;
        
        // Exploration state
        this.explorationTimer = 0;
        this.lastEncounterTime = 0;
        this.encounterCooldown = 3000; // 3 seconds between encounters
        
        // Animation state
        this.playerAnimationFrame = 0;
        this.animationTimer = 0;
        
        // UI state
        this.showAreaInfo = false;
        this.areaInfoTimer = 0;
        this.encounterPopup = null;
        
        // Movement
        this.keys = {};
        this.setupKeyboardHandlers();
    }

    /**
     * Initialize world exploration
     * @param {string} worldId - World to load
     * @param {string} areaId - Starting area
     */
    async init(worldId = 'garden', areaId = 'vegetable_patch') {
        try {
            console.log(`Loading world: ${worldId}, area: ${areaId}`);
            
            // Load world data
            this.worldData = await this.fruitLoader.loadWorld(worldId);
            this.currentWorld = worldId;
            this.currentArea = areaId;
            
            // Set starting position based on area
            this.setStartingPosition(areaId);
            
            // Show area info when entering
            this.showAreaInfo = true;
            this.areaInfoTimer = 3000; // Show for 3 seconds
            
            console.log('World explorer initialized');
        } catch (error) {
            console.error('Failed to initialize world explorer:', error);
            throw error;
        }
    }

    /**
     * Update world exploration logic
     * @param {number} timestamp - Current timestamp
     */
    update(timestamp) {
        // Update timers
        this.explorationTimer += 16; // Assume 60fps
        this.animationTimer += 16;
        
        if (this.areaInfoTimer > 0) {
            this.areaInfoTimer -= 16;
            if (this.areaInfoTimer <= 0) {
                this.showAreaInfo = false;
            }
        }

        // Handle player movement
        this.updatePlayerMovement();
        
        // Update player animation
        if (this.animationTimer >= 200) { // Change frame every 200ms
            this.playerAnimationFrame = (this.playerAnimationFrame + 1) % 4;
            this.animationTimer = 0;
        }
        
        // Check for random encounters
        this.checkForEncounters(timestamp);
        
        // Update any active encounter popup
        if (this.encounterPopup) {
            this.updateEncounterPopup();
        }
    }

    /**
     * Render the world exploration view
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    render(ctx) {
        // Clear and set background
        this.renderBackground(ctx);
        
        // Render world elements
        this.renderWorldElements(ctx);
        
        // Render player
        this.renderPlayer(ctx);
        
        // Render UI elements
        this.renderUI(ctx);
        
        // Render encounter popup if active
        if (this.encounterPopup) {
            this.renderEncounterPopup(ctx);
        }
    }

    /**
     * Render background based on current world/area
     */
    renderBackground(ctx) {
        const area = this.getCurrentAreaData();
        
        // Set background color based on area
        let bgColor = '#90EE90'; // Default green
        
        if (this.currentWorld === 'garden') {
            bgColor = area?.id === 'flower_meadow' ? '#FFB6C1' : '#90EE90';
        } else if (this.currentWorld === 'forest') {
            bgColor = area?.id === 'ancient_grove' ? '#2F4F2F' : '#228B22';
        }
        
        const gradient = ctx.createLinearGradient(0, 0, 0, ctx.canvas.height);
        gradient.addColorStop(0, bgColor);
        gradient.addColorStop(1, this.darkenColor(bgColor, 0.2));
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    }

    /**
     * Render world elements like trees, flowers, etc.
     */
    renderWorldElements(ctx) {
        const area = this.getCurrentAreaData();
        
        // Render decorative elements based on area
        if (this.currentWorld === 'garden') {
            this.renderGardenElements(ctx, area);
        } else if (this.currentWorld === 'forest') {
            this.renderForestElements(ctx, area);
        }
        
        // Render exploration hotspots
        this.renderExplorationSpots(ctx);
    }

    /**
     * Render garden-specific elements
     */
    renderGardenElements(ctx, area) {
        const elements = [
            { x: 100, y: 150, emoji: '🌻', size: 30 },
            { x: 200, y: 100, emoji: '🌹', size: 25 },
            { x: 600, y: 200, emoji: '🌷', size: 28 },
            { x: 700, y: 400, emoji: '🌺', size: 32 },
            { x: 150, y: 450, emoji: '🌼', size: 26 }
        ];
        
        ctx.font = '30px Arial';
        elements.forEach(element => {
            ctx.font = `${element.size}px Arial`;
            ctx.fillText(element.emoji, element.x, element.y);
        });
        
        // Add fruit trees if in fruit tree area
        if (area?.id === 'fruit_trees') {
            const trees = [
                { x: 150, y: 250, emoji: '🌳' },
                { x: 350, y: 180, emoji: '🌳' },
                { x: 550, y: 320, emoji: '🌳' }
            ];
            
            ctx.font = '40px Arial';
            trees.forEach(tree => {
                ctx.fillText(tree.emoji, tree.x, tree.y);
            });
        }
    }

    /**
     * Render forest-specific elements
     */
    renderForestElements(ctx, area) {
        const trees = [
            { x: 50, y: 120, emoji: '🌲', size: 45 },
            { x: 180, y: 80, emoji: '🌲', size: 40 },
            { x: 320, y: 150, emoji: '🌲', size: 50 },
            { x: 480, y: 90, emoji: '🌲', size: 42 },
            { x: 650, y: 180, emoji: '🌲', size: 48 },
            { x: 120, y: 350, emoji: '🌲', size: 38 },
            { x: 400, y: 400, emoji: '🌲', size: 44 },
            { x: 600, y: 450, emoji: '🌲', size: 41 }
        ];
        
        trees.forEach(tree => {
            ctx.font = `${tree.size}px Arial`;
            ctx.fillText(tree.emoji, tree.x, tree.y);
        });
        
        // Add mysterious elements for deep woods
        if (area?.id === 'deep_woods' || area?.id === 'ancient_grove') {
            ctx.font = '35px Arial';
            ctx.fillText('🍄', 250, 380);
            ctx.fillText('🍄', 520, 280);
        }
    }

    /**
     * Render exploration spots where players can find items/fruits
     */
    renderExplorationSpots(ctx) {
        // Sparkle effect for areas with high encounter rates
        const area = this.getCurrentAreaData();
        if (area && area.encounterRate > 0.25) {
            const sparkles = [
                { x: 300, y: 200 },
                { x: 500, y: 350 },
                { x: 150, y: 300 }
            ];
            
            ctx.font = '20px Arial';
            sparkles.forEach((sparkle, index) => {
                const alpha = 0.5 + 0.5 * Math.sin((this.explorationTimer + index * 1000) / 500);
                ctx.globalAlpha = alpha;
                ctx.fillText('✨', sparkle.x, sparkle.y);
            });
            ctx.globalAlpha = 1;
        }
    }

    /**
     * Render the player character
     */
    renderPlayer(ctx) {
        // Simple cucumber representation with walking animation
        const cucumber = '🥒';
        const size = 32;
        
        ctx.font = `${size}px Arial`;
        ctx.textAlign = 'center';
        
        // Add slight bounce when moving
        let yOffset = 0;
        if (this.isPlayerMoving()) {
            yOffset = Math.sin(this.animationTimer / 100) * 2;
        }
        
        ctx.fillText(cucumber, this.playerX, this.playerY + yOffset);
        
        // Reset text alignment
        ctx.textAlign = 'left';
    }

    /**
     * Render UI elements
     */
    renderUI(ctx) {
        // World and area info
        this.renderLocationInfo(ctx);
        
        // Area transition info
        if (this.showAreaInfo) {
            this.renderAreaInfo(ctx);
        }
        
        // Movement instructions
        this.renderInstructions(ctx);
    }

    /**
     * Render current location information
     */
    renderLocationInfo(ctx) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(10, 10, 280, 60);
        
        ctx.fillStyle = 'white';
        ctx.font = 'bold 16px Arial';
        ctx.fillText(`World: ${this.worldData?.name || 'Unknown'}`, 20, 30);
        
        const area = this.getCurrentAreaData();
        ctx.font = '14px Arial';
        ctx.fillText(`Area: ${area?.name || 'Unknown'}`, 20, 50);
    }

    /**
     * Render area information popup
     */
    renderAreaInfo(ctx) {
        const area = this.getCurrentAreaData();
        if (!area) return;
        
        const centerX = ctx.canvas.width / 2;
        const centerY = 100;
        const width = 400;
        const height = 80;
        
        // Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(centerX - width/2, centerY - height/2, width, height);
        
        // Border
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 2;
        ctx.strokeRect(centerX - width/2, centerY - height/2, width, height);
        
        // Text
        ctx.fillStyle = 'white';
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(area.name, centerX, centerY - 10);
        
        ctx.font = '14px Arial';
        const description = area.description.substring(0, 60) + '...';
        ctx.fillText(description, centerX, centerY + 15);
        
        ctx.textAlign = 'left';
    }

    /**
     * Render movement instructions
     */
    renderInstructions(ctx) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(ctx.canvas.width - 200, ctx.canvas.height - 60, 190, 50);
        
        ctx.fillStyle = 'white';
        ctx.font = '12px Arial';
        ctx.fillText('WASD or Arrow Keys: Move', ctx.canvas.width - 190, ctx.canvas.height - 40);
        ctx.fillText('Click: Quick move', ctx.canvas.width - 190, ctx.canvas.height - 25);
        ctx.fillText('Space: Investigate area', ctx.canvas.width - 190, ctx.canvas.height - 10);
    }

    /**
     * Render encounter popup
     */
    renderEncounterPopup(ctx) {
        const centerX = ctx.canvas.width / 2;
        const centerY = ctx.canvas.height / 2;
        const width = 300;
        const height = 150;
        
        // Background
        ctx.fillStyle = 'rgba(255, 215, 0, 0.9)';
        ctx.fillRect(centerX - width/2, centerY - height/2, width, height);
        
        // Border
        ctx.strokeStyle = '#FF6347';
        ctx.lineWidth = 3;
        ctx.strokeRect(centerX - width/2, centerY - height/2, width, height);
        
        // Content
        ctx.fillStyle = '#8B0000';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Encounter!', centerX, centerY - 40);
        
        ctx.font = '16px Arial';
        ctx.fillText(this.encounterPopup.message, centerX, centerY - 10);
        
        ctx.font = '14px Arial';
        ctx.fillText('Click to continue...', centerX, centerY + 20);
        
        ctx.textAlign = 'left';
    }

    /**
     * Handle click events
     */
    handleClick(x, y) {
        // If there's an encounter popup, handle it
        if (this.encounterPopup) {
            this.handleEncounterClick();
            return;
        }
        
        // Move player towards click position
        this.movePlayerTowards(x, y);
    }

    /**
     * Setup keyboard handlers
     */
    setupKeyboardHandlers() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
            
            // Handle special keys
            if (e.key === ' ') {
                this.investigateCurrentArea();
                e.preventDefault();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
    }

    /**
     * Update player movement based on input
     */
    updatePlayerMovement() {
        let deltaX = 0;
        let deltaY = 0;
        
        // WASD and Arrow keys
        if (this.keys['w'] || this.keys['arrowup']) deltaY -= this.playerSpeed;
        if (this.keys['s'] || this.keys['arrowdown']) deltaY += this.playerSpeed;
        if (this.keys['a'] || this.keys['arrowleft']) deltaX -= this.playerSpeed;
        if (this.keys['d'] || this.keys['arrowright']) deltaX += this.playerSpeed;
        
        // Apply movement with bounds checking
        this.playerX = Math.max(20, Math.min(this.playerX + deltaX, 780));
        this.playerY = Math.max(40, Math.min(this.playerY + deltaY, 580));
    }

    /**
     * Move player towards a target position
     */
    movePlayerTowards(targetX, targetY) {
        const deltaX = targetX - this.playerX;
        const deltaY = targetY - this.playerY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        
        if (distance > 5) {
            const moveX = (deltaX / distance) * this.playerSpeed * 2;
            const moveY = (deltaY / distance) * this.playerSpeed * 2;
            
            this.playerX = Math.max(20, Math.min(this.playerX + moveX, 780));
            this.playerY = Math.max(40, Math.min(this.playerY + moveY, 580));
        }
    }

    /**
     * Check if player is currently moving
     */
    isPlayerMoving() {
        return this.keys['w'] || this.keys['s'] || this.keys['a'] || this.keys['d'] ||
               this.keys['arrowup'] || this.keys['arrowdown'] || this.keys['arrowleft'] || this.keys['arrowright'];
    }

    /**
     * Check for random encounters
     */
    checkForEncounters(timestamp) {
        if (this.encounterPopup) return; // Don't check if popup is active
        if (timestamp - this.lastEncounterTime < this.encounterCooldown) return;
        
        const area = this.getCurrentAreaData();
        if (!area) return;
        
        // Only check when player is moving
        if (this.isPlayerMoving()) {
            const encounterChance = area.encounterRate / 100; // Convert to per-frame chance
            
            if (Math.random() < encounterChance) {
                this.triggerEncounter();
                this.lastEncounterTime = timestamp;
            }
        }
    }

    /**
     * Trigger a random encounter
     */
    triggerEncounter() {
        const area = this.getCurrentAreaData();
        if (!area || !area.fruits) return;
        
        // Select random fruit from area
        const availableFruits = area.fruits;
        const randomFruit = availableFruits[Math.floor(Math.random() * availableFruits.length)];
        
        // Create encounter popup
        this.encounterPopup = {
            type: 'fruit',
            data: randomFruit,
            message: `A wild ${randomFruit.id.split('_')[0]} appeared!`
        };
        
        console.log('Encounter triggered:', this.encounterPopup);
    }

    /**
     * Handle encounter popup clicks
     */
    handleEncounterClick() {
        if (!this.encounterPopup) return;
        
        // For now, just close the popup
        // Later this would trigger battle or collection
        console.log('Encounter accepted:', this.encounterPopup);
        this.encounterPopup = null;
        
        // This is where you'd call the battle system or fruit collection
        // this.gameEngine.startBattle(encounterData);
    }

    /**
     * Update encounter popup state
     */
    updateEncounterPopup() {
        // Add any popup animations or timeout logic here
    }

    /**
     * Investigate current area for items/secrets
     */
    investigateCurrentArea() {
        console.log('Investigating current area...');
        
        // Show area info again
        this.showAreaInfo = true;
        this.areaInfoTimer = 2000;
        
        // Chance to find items or trigger special encounters
        if (Math.random() < 0.1) { // 10% chance
            console.log('Found something special!');
            // Could trigger item discovery, secret area, etc.
        }
    }

    /**
     * Get current area data
     */
    getCurrentAreaData() {
        if (!this.worldData || !this.currentArea) return null;
        
        return this.worldData.areas.find(area => area.id === this.currentArea);
    }

    /**
     * Set starting position based on area
     */
    setStartingPosition(areaId) {
        // Set different starting positions for different areas
        switch (areaId) {
            case 'vegetable_patch':
                this.playerX = 100;
                this.playerY = 400;
                break;
            case 'fruit_trees':
                this.playerX = 200;
                this.playerY = 300;
                break;
            case 'flower_meadow':
                this.playerX = 400;
                this.playerY = 350;
                break;
            default:
                this.playerX = 400;
                this.playerY = 300;
        }
    }

    /**
     * Darken a hex color by a percentage
     */
    darkenColor(color, percent) {
        const hex = color.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        
        return `rgb(${Math.floor(r * (1 - percent))}, ${Math.floor(g * (1 - percent))}, ${Math.floor(b * (1 - percent))})`;
    }

    /**
     * Change to a different area within the world
     */
    changeArea(areaId) {
        this.currentArea = areaId;
        this.setStartingPosition(areaId);
        this.showAreaInfo = true;
        this.areaInfoTimer = 3000;
        console.log(`Changed to area: ${areaId}`);
    }

    /**
     * Get explorer state for saving
     */
    getState() {
        return {
            currentWorld: this.currentWorld,
            currentArea: this.currentArea,
            playerX: this.playerX,
            playerY: this.playerY
        };
    }

    /**
     * Load explorer state from save
     */
    loadState(state) {
        this.currentWorld = state.currentWorld;
        this.currentArea = state.currentArea;
        this.playerX = state.playerX || 400;
        this.playerY = state.playerY || 300;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WorldExplorer;
} else if (typeof window !== 'undefined') {
    window.WorldExplorer = WorldExplorer;
}