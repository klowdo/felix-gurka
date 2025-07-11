/**
 * Collision System - Handles collision detection for environment objects and boundaries
 * Part of Cucumber World RPG Enhanced System
 */

class CollisionSystem {
    constructor() {
        // Collision shapes
        this.shapes = {
            CIRCLE: 'circle',
            RECTANGLE: 'rectangle',
            POLYGON: 'polygon'
        };
        
        // Collision layers
        this.layers = {
            ENVIRONMENT: 'environment',
            PLAYER: 'player',
            INTERACTION: 'interaction',
            TRIGGER: 'trigger'
        };
        
        // Active collision objects
        this.collisionObjects = new Map();
        this.spatialGrid = new SpatialGrid(1200, 800, 50); // 50x50 pixel grid cells
        
        // Interaction state
        this.nearbyInteractables = new Set();
        this.activeCollisions = new Set();
    }

    /**
     * Initialize collision system with level data
     */
    init(levelData) {
        this.clearCollisions();
        this.setupLevelCollisions(levelData);
        console.log('Collision system initialized for level');
    }

    /**
     * Clear all collision objects
     */
    clearCollisions() {
        this.collisionObjects.clear();
        this.spatialGrid.clear();
        this.nearbyInteractables.clear();
        this.activeCollisions.clear();
    }

    /**
     * Setup collisions for a level
     */
    setupLevelCollisions(levelData) {
        // Add environment object collisions
        if (levelData.environment) {
            levelData.environment.forEach(obj => {
                this.addEnvironmentObjectCollision(obj);
            });
        }

        // Add level boundary collisions
        this.addLevelBoundaries(levelData.size || { width: 1200, height: 800 });

        // Add exit trigger zones
        if (levelData.exits) {
            levelData.exits.forEach(exit => {
                this.addExitTrigger(exit);
            });
        }

        // Add path collision modifiers
        if (levelData.paths) {
            levelData.paths.forEach(path => {
                this.addPathCollision(path);
            });
        }
    }

    /**
     * Add collision for an environment object
     */
    addEnvironmentObjectCollision(obj) {
        const objDef = this.getObjectDefinition(obj.type);
        if (!objDef) return;

        const [x, y] = obj.position;
        const size = objDef.size || { width: 30, height: 30 };
        const radius = objDef.collision_radius || Math.max(size.width, size.height) / 2;

        const collisionData = {
            id: obj.id,
            type: this.layers.ENVIRONMENT,
            shape: this.shapes.CIRCLE,
            x: x,
            y: y,
            radius: radius,
            width: size.width,
            height: size.height,
            solid: objDef.collision !== false,
            interactive: objDef.interactive || false,
            blocks_movement: objDef.blocks_movement || false,
            object: obj,
            definition: objDef
        };

        this.addCollisionObject(collisionData);
    }

    /**
     * Add level boundary collisions
     */
    addLevelBoundaries(size) {
        const margin = 30; // Distance from edge
        
        // Top boundary
        this.addCollisionObject({
            id: 'boundary_top',
            type: this.layers.ENVIRONMENT,
            shape: this.shapes.RECTANGLE,
            x: 0,
            y: 0,
            width: size.width,
            height: margin,
            solid: true,
            boundary: true
        });

        // Bottom boundary
        this.addCollisionObject({
            id: 'boundary_bottom',
            type: this.layers.ENVIRONMENT,
            shape: this.shapes.RECTANGLE,
            x: 0,
            y: size.height - margin,
            width: size.width,
            height: margin,
            solid: true,
            boundary: true
        });

        // Left boundary
        this.addCollisionObject({
            id: 'boundary_left',
            type: this.layers.ENVIRONMENT,
            shape: this.shapes.RECTANGLE,
            x: 0,
            y: 0,
            width: margin,
            height: size.height,
            solid: true,
            boundary: true
        });

        // Right boundary
        this.addCollisionObject({
            id: 'boundary_right',
            type: this.layers.ENVIRONMENT,
            shape: this.shapes.RECTANGLE,
            x: size.width - margin,
            y: 0,
            width: margin,
            height: size.height,
            solid: true,
            boundary: true
        });
    }

    /**
     * Add exit trigger zone
     */
    addExitTrigger(exit) {
        const [x, y] = exit.position;
        const radius = exit.trigger_radius || 30;

        this.addCollisionObject({
            id: `exit_${exit.id}`,
            type: this.layers.TRIGGER,
            shape: this.shapes.CIRCLE,
            x: x,
            y: y,
            radius: radius,
            solid: false,
            trigger: true,
            exit: exit
        });
    }

    /**
     * Add path collision for movement modifiers
     */
    addPathCollision(path) {
        // For now, paths don't have collision - they're just visual/speed modifiers
        // But we could add collision for blocked paths here
        if (path.condition === 'blocked') {
            path.points.forEach((point, index) => {
                if (index < path.points.length - 1) {
                    const next = path.points[index + 1];
                    this.addLineCollision(point, next, path.width || 40, `path_block_${path.id}_${index}`);
                }
            });
        }
    }

    /**
     * Add line collision between two points
     */
    addLineCollision(start, end, width, id) {
        const [x1, y1] = start;
        const [x2, y2] = end;
        const centerX = (x1 + x2) / 2;
        const centerY = (y1 + y2) / 2;
        const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
        const angle = Math.atan2(y2 - y1, x2 - x1);

        this.addCollisionObject({
            id: id,
            type: this.layers.ENVIRONMENT,
            shape: this.shapes.RECTANGLE,
            x: centerX - length / 2,
            y: centerY - width / 2,
            width: length,
            height: width,
            rotation: angle,
            solid: true
        });
    }

    /**
     * Add a collision object to the system
     */
    addCollisionObject(collisionData) {
        this.collisionObjects.set(collisionData.id, collisionData);
        this.spatialGrid.addObject(collisionData);
    }

    /**
     * Remove a collision object
     */
    removeCollisionObject(id) {
        const obj = this.collisionObjects.get(id);
        if (obj) {
            this.collisionObjects.delete(id);
            this.spatialGrid.removeObject(obj);
        }
    }

    /**
     * Check if a movement is valid (no collisions)
     */
    canMoveTo(x, y, radius = 15) {
        const nearbyObjects = this.spatialGrid.getObjectsNear(x, y, radius * 2);
        
        for (const obj of nearbyObjects) {
            if (obj.solid && this.isColliding(x, y, radius, obj)) {
                return false;
            }
        }
        
        return true;
    }

    /**
     * Get valid position after collision resolution
     */
    resolveMovement(fromX, fromY, toX, toY, radius = 15) {
        // Try the full movement first
        if (this.canMoveTo(toX, toY, radius)) {
            return { x: toX, y: toY, collided: false };
        }

        // Try horizontal movement only
        if (this.canMoveTo(toX, fromY, radius)) {
            return { x: toX, y: fromY, collided: true };
        }

        // Try vertical movement only
        if (this.canMoveTo(fromX, toY, radius)) {
            return { x: fromX, y: toY, collided: true };
        }

        // No movement possible
        return { x: fromX, y: fromY, collided: true };
    }

    /**
     * Check collision between player and object
     */
    isColliding(x, y, radius, obj) {
        switch (obj.shape) {
            case this.shapes.CIRCLE:
                return this.circleCircleCollision(x, y, radius, obj.x, obj.y, obj.radius);
            
            case this.shapes.RECTANGLE:
                return this.circleRectangleCollision(x, y, radius, obj);
            
            default:
                return false;
        }
    }

    /**
     * Circle-circle collision detection
     */
    circleCircleCollision(x1, y1, r1, x2, y2, r2) {
        const dx = x1 - x2;
        const dy = y1 - y2;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < (r1 + r2);
    }

    /**
     * Circle-rectangle collision detection
     */
    circleRectangleCollision(circleX, circleY, radius, rect) {
        // Find closest point on rectangle to circle
        const closestX = Math.max(rect.x, Math.min(circleX, rect.x + rect.width));
        const closestY = Math.max(rect.y, Math.min(circleY, rect.y + rect.height));

        // Calculate distance from circle center to closest point
        const dx = circleX - closestX;
        const dy = circleY - closestY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        return distance < radius;
    }

    /**
     * Get all interactable objects near a position
     */
    getInteractablesNear(x, y, radius = 50) {
        const nearbyObjects = this.spatialGrid.getObjectsNear(x, y, radius);
        
        return nearbyObjects.filter(obj => 
            obj.interactive && 
            this.isWithinDistance(x, y, obj.x, obj.y, radius)
        );
    }

    /**
     * Get all trigger zones at a position
     */
    getTriggersAt(x, y, radius = 15) {
        const nearbyObjects = this.spatialGrid.getObjectsNear(x, y, radius);
        
        return nearbyObjects.filter(obj => 
            obj.trigger && 
            this.isColliding(x, y, radius, obj)
        );
    }

    /**
     * Check if position is within distance of target
     */
    isWithinDistance(x1, y1, x2, y2, distance) {
        const dx = x1 - x2;
        const dy = y1 - y2;
        return Math.sqrt(dx * dx + dy * dy) <= distance;
    }

    /**
     * Update collision system state
     */
    update(playerX, playerY, playerRadius = 15) {
        // Update nearby interactables
        const newInteractables = this.getInteractablesNear(playerX, playerY);
        this.nearbyInteractables.clear();
        newInteractables.forEach(obj => this.nearbyInteractables.add(obj));

        // Check for trigger activations
        const triggers = this.getTriggersAt(playerX, playerY, playerRadius);
        triggers.forEach(trigger => {
            if (!this.activeCollisions.has(trigger.id)) {
                this.onTriggerEnter(trigger);
                this.activeCollisions.add(trigger.id);
            }
        });

        // Remove deactivated triggers
        Array.from(this.activeCollisions).forEach(triggerId => {
            const trigger = this.collisionObjects.get(triggerId);
            if (trigger && !this.isColliding(playerX, playerY, playerRadius, trigger)) {
                this.onTriggerExit(trigger);
                this.activeCollisions.delete(triggerId);
            }
        });
    }

    /**
     * Called when player enters a trigger zone
     */
    onTriggerEnter(trigger) {
        console.log('Trigger entered:', trigger.id);
        
        if (trigger.exit) {
            // Handle level transition
            this.onExitTrigger(trigger.exit);
        }
    }

    /**
     * Called when player exits a trigger zone
     */
    onTriggerExit(trigger) {
        console.log('Trigger exited:', trigger.id);
    }

    /**
     * Handle exit trigger activation
     */
    onExitTrigger(exit) {
        // This would be called by the game engine to handle level transitions
        console.log('Exit trigger activated:', exit.name);
    }

    /**
     * Get object definition (placeholder - would use actual object loader)
     */
    getObjectDefinition(type) {
        // This would use the actual object definitions from environment.json
        const fallbackDefs = {
            berry_bush: { size: { width: 40, height: 35 }, collision_radius: 20, collision: true, interactive: true },
            boulder: { size: { width: 60, height: 50 }, collision_radius: 30, collision: true, interactive: true },
            flower_bush: { size: { width: 35, height: 30 }, collision_radius: 18, collision: true, interactive: false }
        };
        
        return fallbackDefs[type] || { size: { width: 30, height: 30 }, collision_radius: 15, collision: true };
    }

    /**
     * Get current collision state for debugging
     */
    getDebugInfo() {
        return {
            totalObjects: this.collisionObjects.size,
            nearbyInteractables: this.nearbyInteractables.size,
            activeTriggers: this.activeCollisions.size,
            gridCells: this.spatialGrid.getCellCount()
        };
    }
}

/**
 * Spatial Grid for efficient collision detection
 */
class SpatialGrid {
    constructor(width, height, cellSize) {
        this.width = width;
        this.height = height;
        this.cellSize = cellSize;
        this.cols = Math.ceil(width / cellSize);
        this.rows = Math.ceil(height / cellSize);
        this.grid = new Array(this.cols * this.rows).fill(null).map(() => []);
    }

    /**
     * Get grid cell index for coordinates
     */
    getCellIndex(x, y) {
        const col = Math.floor(x / this.cellSize);
        const row = Math.floor(y / this.cellSize);
        
        if (col < 0 || col >= this.cols || row < 0 || row >= this.rows) {
            return -1;
        }
        
        return row * this.cols + col;
    }

    /**
     * Add object to spatial grid
     */
    addObject(obj) {
        const cellIndex = this.getCellIndex(obj.x, obj.y);
        if (cellIndex >= 0) {
            this.grid[cellIndex].push(obj);
            obj._gridCell = cellIndex;
        }
    }

    /**
     * Remove object from spatial grid
     */
    removeObject(obj) {
        if (obj._gridCell !== undefined && obj._gridCell >= 0) {
            const cell = this.grid[obj._gridCell];
            const index = cell.indexOf(obj);
            if (index >= 0) {
                cell.splice(index, 1);
            }
        }
    }

    /**
     * Get all objects near a position
     */
    getObjectsNear(x, y, radius) {
        const objects = new Set();
        
        // Check multiple cells around the position
        const cellRadius = Math.ceil(radius / this.cellSize);
        const centerCol = Math.floor(x / this.cellSize);
        const centerRow = Math.floor(y / this.cellSize);
        
        for (let row = centerRow - cellRadius; row <= centerRow + cellRadius; row++) {
            for (let col = centerCol - cellRadius; col <= centerCol + cellRadius; col++) {
                const cellIndex = row * this.cols + col;
                
                if (cellIndex >= 0 && cellIndex < this.grid.length) {
                    this.grid[cellIndex].forEach(obj => objects.add(obj));
                }
            }
        }
        
        return Array.from(objects);
    }

    /**
     * Clear all objects from grid
     */
    clear() {
        this.grid.forEach(cell => cell.length = 0);
    }

    /**
     * Get total cell count for debugging
     */
    getCellCount() {
        return this.grid.length;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CollisionSystem, SpatialGrid };
} else if (typeof window !== 'undefined') {
    window.CollisionSystem = CollisionSystem;
    window.SpatialGrid = SpatialGrid;
}