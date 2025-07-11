/**
 * Grid System - Pokemon-style grid-based movement and tile management
 * Part of Cucumber World RPG Enhanced System
 */

class GridSystem {
    constructor(tileSize = 32) {
        this.tileSize = tileSize;
        this.gridWidth = Math.floor(1200 / tileSize); // 37 tiles
        this.gridHeight = Math.floor(800 / tileSize); // 25 tiles
        
        // Grid data
        this.tiles = new Array(this.gridWidth * this.gridHeight).fill(null);
        this.tileDefinitions = null;
        
        // Player state
        this.playerGridX = 0;
        this.playerGridY = 0;
        this.playerPixelX = 0;
        this.playerPixelY = 0;
        this.isMoving = false;
        this.movementQueue = [];
        
        // Camera system for Pokemon-style centered view
        this.camera = {
            x: 0,
            y: 0,
            targetX: 0,
            targetY: 0,
            smoothing: 0.1,
            instantMovement: true  // True Pokemon style
        };
        
        // Screen dimensions for centering
        this.screenWidth = 1200;
        this.screenHeight = 800;
        this.screenCenterX = this.screenWidth / 2;
        this.screenCenterY = this.screenHeight / 2;
        
        // Animation state
        this.movementSpeed = 150; // milliseconds per tile
        this.movementStartTime = 0;
        this.movementDirection = null;
        this.lastMoveTime = 0;
        
        // Encounter system
        this.stepCount = 0;
        this.lastEncounterStep = 0;
        
        this.init();
    }

    /**
     * Initialize the grid system
     */
    async init() {
        try {
            await this.loadTileDefinitions();
            console.log('Grid system initialized');
        } catch (error) {
            console.error('Failed to initialize grid system:', error);
        }
    }

    /**
     * Load tile definitions from JSON
     */
    async loadTileDefinitions() {
        try {
            const response = await fetch('@cucumber-world/objects/tiles.json');
            this.tileDefinitions = await response.json();
            console.log('Tile definitions loaded');
        } catch (error) {
            console.error('Failed to load tile definitions:', error);
            this.setupFallbackTiles();
        }
    }

    /**
     * Setup fallback tile definitions
     */
    setupFallbackTiles() {
        this.tileDefinitions = {
            tile_types: {
                terrain: {
                    grass: { emoji: '🌱', walkable: true, encounter_rate: 0.1 },
                    path: { emoji: '⬜', walkable: true, encounter_rate: 0.02 }
                },
                obstacles: {
                    tree: { emoji: '🌳', walkable: false, blocks_movement: true },
                    bush: { emoji: '🫐', walkable: false, interactive: true }
                }
            }
        };
    }

    /**
     * Load level from grid-based JSON format
     */
    loadLevel(levelData) {
        console.log('Grid system loading level:', levelData.id || 'unknown');
        this.clearGrid();
        
        if (levelData.grid_layout) {
            console.log('Loading from grid_layout');
            this.loadFromGridLayout(levelData.grid_layout);
        } else if (levelData.tile_map) {
            console.log('Loading from tile_map');
            this.loadFromTileMap(levelData.tile_map);
        } else {
            console.log('No grid data found, generating default level');
            this.generateDefaultLevel();
        }
        
        // Set player starting position
        if (levelData.player_start) {
            console.log('Setting player start position:', levelData.player_start);
            this.setPlayerPosition(levelData.player_start.x, levelData.player_start.y);
        } else {
            const defaultX = Math.floor(this.gridWidth / 2);
            const defaultY = Math.floor(this.gridHeight / 2);
            console.log(`No start position defined, using center: (${defaultX}, ${defaultY})`);
            this.setPlayerPosition(defaultX, defaultY);
        }
        
        console.log('Grid level loaded successfully');
    }

    /**
     * Load from grid layout (2D array format)
     */
    loadFromGridLayout(layout) {
        for (let y = 0; y < Math.min(layout.length, this.gridHeight); y++) {
            const row = layout[y];
            for (let x = 0; x < Math.min(row.length, this.gridWidth); x++) {
                const tileId = row[x];
                this.setTile(x, y, tileId);
            }
        }
    }

    /**
     * Load from tile map (coordinate-based format)
     */
    loadFromTileMap(tileMap) {
        // Set default background
        this.fillGrid('grass');
        
        // Place specific tiles
        Object.entries(tileMap).forEach(([key, tileId]) => {
            const [x, y] = key.split(',').map(Number);
            if (this.isValidGridPosition(x, y)) {
                this.setTile(x, y, tileId);
            }
        });
    }

    /**
     * Generate a default level with grass and some obstacles
     */
    generateDefaultLevel() {
        // Fill with grass
        this.fillGrid('grass');
        
        // Add some random trees
        for (let i = 0; i < 20; i++) {
            const x = Math.floor(Math.random() * this.gridWidth);
            const y = Math.floor(Math.random() * this.gridHeight);
            this.setTile(x, y, 'tree');
        }
        
        // Add some bushes
        for (let i = 0; i < 15; i++) {
            const x = Math.floor(Math.random() * this.gridWidth);
            const y = Math.floor(Math.random() * this.gridHeight);
            this.setTile(x, y, 'bush');
        }
        
        // Add a path from left to right
        const pathY = Math.floor(this.gridHeight / 2);
        for (let x = 0; x < this.gridWidth; x++) {
            this.setTile(x, pathY, 'path');
        }
    }

    /**
     * Clear the entire grid
     */
    clearGrid() {
        this.tiles.fill(null);
    }

    /**
     * Fill grid with a specific tile type
     */
    fillGrid(tileType) {
        for (let i = 0; i < this.tiles.length; i++) {
            this.tiles[i] = tileType;
        }
    }

    /**
     * Set a tile at grid coordinates
     */
    setTile(x, y, tileType) {
        if (this.isValidGridPosition(x, y)) {
            const index = y * this.gridWidth + x;
            this.tiles[index] = tileType;
        }
    }

    /**
     * Get tile at grid coordinates
     */
    getTile(x, y) {
        if (!this.isValidGridPosition(x, y)) return null;
        const index = y * this.gridWidth + x;
        return this.tiles[index];
    }

    /**
     * Check if grid position is valid
     */
    isValidGridPosition(x, y) {
        return x >= 0 && x < this.gridWidth && y >= 0 && y < this.gridHeight;
    }

    /**
     * Set player position in grid coordinates
     */
    setPlayerPosition(gridX, gridY) {
        if (this.isValidGridPosition(gridX, gridY)) {
            this.playerGridX = gridX;
            this.playerGridY = gridY;
            this.updatePlayerPixelPosition();
            console.log(`Player positioned at grid (${gridX}, ${gridY}), pixel (${this.playerPixelX}, ${this.playerPixelY})`);
            console.log(`Camera at (${this.camera.x}, ${this.camera.y})`);
        }
    }

    /**
     * Update player pixel position based on grid position
     */
    updatePlayerPixelPosition() {
        this.playerPixelX = (this.playerGridX * this.tileSize) + (this.tileSize / 2);
        this.playerPixelY = (this.playerGridY * this.tileSize) + (this.tileSize / 2);
        this.updateCamera();
    }

    /**
     * Update camera to follow player (Pokemon-style)
     */
    updateCamera() {
        // Calculate world bounds
        const worldWidth = this.gridWidth * this.tileSize;
        const worldHeight = this.gridHeight * this.tileSize;
        
        // Target camera position to center player on screen
        this.camera.targetX = this.playerPixelX - this.screenCenterX;
        this.camera.targetY = this.playerPixelY - this.screenCenterY;
        
        // Clamp camera to world bounds
        this.camera.targetX = Math.max(0, Math.min(this.camera.targetX, worldWidth - this.screenWidth));
        this.camera.targetY = Math.max(0, Math.min(this.camera.targetY, worldHeight - this.screenHeight));
        
        // True Pokemon style - instant camera movement
        const oldCameraX = this.camera.x;
        const oldCameraY = this.camera.y;
        this.camera.x = this.camera.targetX;
        this.camera.y = this.camera.targetY;
        
        // Log camera movement for debugging
        if (oldCameraX !== this.camera.x || oldCameraY !== this.camera.y) {
            console.log(`Camera moved from (${oldCameraX}, ${oldCameraY}) to (${this.camera.x}, ${this.camera.y})`);
            console.log(`Player at pixel (${this.playerPixelX}, ${this.playerPixelY}), screen center (${this.screenCenterX}, ${this.screenCenterY})`);
        }
        
        // For smooth camera movement, uncomment these instead:
        // this.camera.x += (this.camera.targetX - this.camera.x) * this.camera.smoothing;
        // this.camera.y += (this.camera.targetY - this.camera.y) * this.camera.smoothing;
    }

    /**
     * Attempt to move player in a direction
     */
    movePlayer(direction) {
        if (this.isMoving) {
            this.movementQueue.push(direction);
            return false;
        }

        const { dx, dy } = this.getDirectionDelta(direction);
        const newX = this.playerGridX + dx;
        const newY = this.playerGridY + dy;

        // Check if movement is valid
        if (!this.canMoveTo(newX, newY)) {
            return false;
        }

        // Start movement animation
        this.startMovement(direction, newX, newY);
        return true;
    }

    /**
     * Get direction delta values
     */
    getDirectionDelta(direction) {
        switch (direction) {
            case 'up': return { dx: 0, dy: -1 };
            case 'down': return { dx: 0, dy: 1 };
            case 'left': return { dx: -1, dy: 0 };
            case 'right': return { dx: 1, dy: 0 };
            default: return { dx: 0, dy: 0 };
        }
    }

    /**
     * Check if player can move to position
     */
    canMoveTo(x, y) {
        if (!this.isValidGridPosition(x, y)) return false;
        
        const tile = this.getTile(x, y);
        const tileDef = this.getTileDefinition(tile);
        
        if (!tileDef) return true; // Empty tiles are walkable
        
        return tileDef.walkable !== false;
    }

    /**
     * Start movement animation
     */
    startMovement(direction, targetX, targetY) {
        this.isMoving = true;
        this.movementDirection = direction;
        this.movementStartTime = Date.now();
        this.targetGridX = targetX;
        this.targetGridY = targetY;
        
        // Calculate pixel positions
        this.startPixelX = this.playerPixelX;
        this.startPixelY = this.playerPixelY;
        this.targetPixelX = (targetX * this.tileSize) + (this.tileSize / 2);
        this.targetPixelY = (targetY * this.tileSize) + (this.tileSize / 2);
    }

    /**
     * Update movement animation
     */
    updateMovement() {
        if (!this.isMoving) return;

        const elapsed = Date.now() - this.movementStartTime;
        const progress = Math.min(elapsed / this.movementSpeed, 1);

        // Interpolate position
        this.playerPixelX = this.startPixelX + (this.targetPixelX - this.startPixelX) * progress;
        this.playerPixelY = this.startPixelY + (this.targetPixelY - this.startPixelY) * progress;

        // Update camera during movement for smooth follow
        this.updateCamera();

        // Check if movement is complete
        if (progress >= 1) {
            this.completeMovement();
        }
    }

    /**
     * Complete current movement
     */
    completeMovement() {
        this.isMoving = false;
        this.playerGridX = this.targetGridX;
        this.playerGridY = this.targetGridY;
        this.updatePlayerPixelPosition();
        
        // Increment step count
        this.stepCount++;
        this.lastMoveTime = Date.now();
        
        // Check for encounters
        this.checkEncounter();
        
        // Check for tile events
        this.checkTileEvents();
        
        // Process queued movements
        if (this.movementQueue.length > 0) {
            const nextDirection = this.movementQueue.shift();
            this.movePlayer(nextDirection);
        }
    }

    /**
     * Check for random encounters
     */
    checkEncounter() {
        const tile = this.getTile(this.playerGridX, this.playerGridY);
        const tileDef = this.getTileDefinition(tile);
        
        if (!tileDef || !tileDef.encounter_rate) return;

        // Don't encounter too frequently
        if (this.stepCount - this.lastEncounterStep < 3) return;

        if (Math.random() < tileDef.encounter_rate) {
            this.triggerEncounter(tileDef);
            this.lastEncounterStep = this.stepCount;
        }
    }

    /**
     * Trigger an encounter
     */
    triggerEncounter(tileDef) {
        console.log('Encounter triggered on tile:', tileDef);
        
        // This would be handled by the game engine
        if (this.onEncounter) {
            this.onEncounter({
                type: tileDef.encounter_types?.[0] || 'wild_fruit',
                tile: tileDef,
                position: { x: this.playerGridX, y: this.playerGridY }
            });
        }
    }

    /**
     * Check for tile-specific events
     */
    checkTileEvents() {
        const tile = this.getTile(this.playerGridX, this.playerGridY);
        const tileDef = this.getTileDefinition(tile);
        
        if (!tileDef) return;

        // Auto-trigger events
        if (tileDef.auto_trigger) {
            this.triggerTileEvent(tileDef);
        }
    }

    /**
     * Trigger tile event
     */
    triggerTileEvent(tileDef) {
        console.log('Tile event triggered:', tileDef);
        
        if (tileDef.healing && this.onHealing) {
            this.onHealing();
        }
        
        if (tileDef.transition && this.onTransition) {
            this.onTransition(tileDef);
        }
    }

    /**
     * Interact with current tile
     */
    interact() {
        const tile = this.getTile(this.playerGridX, this.playerGridY);
        const tileDef = this.getTileDefinition(tile);
        
        if (!tileDef || !tileDef.interactive) {
            // Check adjacent tiles
            return this.interactWithAdjacent();
        }
        
        this.triggerInteraction(tileDef);
        return true;
    }

    /**
     * Check for interactions with adjacent tiles
     */
    interactWithAdjacent() {
        const directions = ['up', 'down', 'left', 'right'];
        
        for (const direction of directions) {
            const { dx, dy } = this.getDirectionDelta(direction);
            const x = this.playerGridX + dx;
            const y = this.playerGridY + dy;
            
            const tile = this.getTile(x, y);
            const tileDef = this.getTileDefinition(tile);
            
            if (tileDef && tileDef.interactive) {
                this.triggerInteraction(tileDef, { x, y });
                return true;
            }
        }
        
        return false;
    }

    /**
     * Trigger interaction with tile
     */
    triggerInteraction(tileDef, position = null) {
        console.log('Interaction triggered:', tileDef);
        
        if (this.onInteraction) {
            this.onInteraction({
                tile: tileDef,
                position: position || { x: this.playerGridX, y: this.playerGridY },
                actions: tileDef.special_actions || []
            });
        }
    }

    /**
     * Get tile definition from tile type
     */
    getTileDefinition(tileType) {
        if (!this.tileDefinitions || !tileType) return null;
        
        const categories = this.tileDefinitions.tile_types;
        
        for (const category of Object.values(categories)) {
            if (category[tileType]) {
                return category[tileType];
            }
        }
        
        return null;
    }

    /**
     * Render the grid with camera offset
     */
    render(ctx) {
        // Save the current transform
        ctx.save();
        
        // Apply camera transform
        ctx.translate(-this.camera.x, -this.camera.y);
        
        // Calculate visible tile range for performance
        const startX = Math.floor(this.camera.x / this.tileSize);
        const startY = Math.floor(this.camera.y / this.tileSize);
        const endX = Math.min(startX + Math.ceil(this.screenWidth / this.tileSize) + 1, this.gridWidth);
        const endY = Math.min(startY + Math.ceil(this.screenHeight / this.tileSize) + 1, this.gridHeight);
        
        // Render visible tiles only
        for (let y = Math.max(0, startY); y < endY; y++) {
            for (let x = Math.max(0, startX); x < endX; x++) {
                this.renderTile(ctx, x, y);
            }
        }
        
        // Render player at screen center
        this.renderPlayer(ctx);
        
        // Render debug grid if enabled
        if (this.showDebugGrid) {
            this.renderDebugGrid(ctx, startX, startY, endX, endY);
        }
        
        // Restore the transform
        ctx.restore();
    }

    /**
     * Render a single tile
     */
    renderTile(ctx, x, y) {
        const tile = this.getTile(x, y);
        const tileDef = this.getTileDefinition(tile);
        
        const pixelX = x * this.tileSize;
        const pixelY = y * this.tileSize;
        
        // Render background
        if (tileDef && tileDef.color) {
            ctx.fillStyle = tileDef.color;
            ctx.fillRect(pixelX, pixelY, this.tileSize, this.tileSize);
        }
        
        // Render emoji
        if (tileDef && tileDef.emoji) {
            ctx.font = `${this.tileSize - 8}px Arial`;
            ctx.textAlign = 'center';
            ctx.fillText(
                tileDef.emoji, 
                pixelX + this.tileSize / 2, 
                pixelY + this.tileSize / 2 + 8
            );
        }
    }

    /**
     * Render player (always at world position, camera handles centering)
     */
    renderPlayer(ctx) {
        ctx.font = `${this.tileSize - 4}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText('🥒', this.playerPixelX, this.playerPixelY + 8);
    }

    /**
     * Render debug grid (optimized for visible area)
     */
    renderDebugGrid(ctx, startX, startY, endX, endY) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        
        // Vertical lines (only visible ones)
        for (let x = Math.max(0, startX); x <= Math.min(endX, this.gridWidth); x++) {
            ctx.beginPath();
            ctx.moveTo(x * this.tileSize, Math.max(0, startY) * this.tileSize);
            ctx.lineTo(x * this.tileSize, Math.min(endY, this.gridHeight) * this.tileSize);
            ctx.stroke();
        }
        
        // Horizontal lines (only visible ones)
        for (let y = Math.max(0, startY); y <= Math.min(endY, this.gridHeight); y++) {
            ctx.beginPath();
            ctx.moveTo(Math.max(0, startX) * this.tileSize, y * this.tileSize);
            ctx.lineTo(Math.min(endX, this.gridWidth) * this.tileSize, y * this.tileSize);
            ctx.stroke();
        }
        
        // Highlight current player tile
        ctx.fillStyle = 'rgba(255, 255, 0, 0.3)';
        ctx.fillRect(
            this.playerGridX * this.tileSize,
            this.playerGridY * this.tileSize,
            this.tileSize,
            this.tileSize
        );
    }

    /**
     * Get current player state
     */
    getPlayerState() {
        return {
            gridX: this.playerGridX,
            gridY: this.playerGridY,
            pixelX: this.playerPixelX,
            pixelY: this.playerPixelY,
            isMoving: this.isMoving,
            stepCount: this.stepCount
        };
    }

    /**
     * Set event handlers
     */
    setEventHandlers(handlers) {
        this.onEncounter = handlers.onEncounter;
        this.onInteraction = handlers.onInteraction;
        this.onHealing = handlers.onHealing;
        this.onTransition = handlers.onTransition;
    }

    /**
     * Toggle debug grid display
     */
    toggleDebugGrid() {
        this.showDebugGrid = !this.showDebugGrid;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GridSystem;
} else if (typeof window !== 'undefined') {
    window.GridSystem = GridSystem;
}