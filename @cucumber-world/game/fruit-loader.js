/**
 * Fruit Loader - Handles loading and managing fruit and world data from JSON files
 * Part of Cucumber World RPG
 */

class FruitLoader {
    constructor() {
        this.fruitsData = new Map();
        this.worldsData = new Map();
        this.loadingPromises = new Map();
        this.basePath = '@cucumber-world/';
    }

    /**
     * Load a fruit's data from JSON file
     * @param {string} fruitId - The fruit ID (e.g., 'apple_001')
     * @returns {Promise<Object>} The fruit data object
     */
    async loadFruit(fruitId) {
        // Check if already loaded
        if (this.fruitsData.has(fruitId)) {
            return this.fruitsData.get(fruitId);
        }

        // Check if currently loading
        if (this.loadingPromises.has(fruitId)) {
            return this.loadingPromises.get(fruitId);
        }

        // Extract fruit name from ID (e.g., 'apple_001' -> 'apple')
        const fruitName = fruitId.split('_')[0];
        const filePath = `${this.basePath}fruits/${fruitName}.json`;

        // Create loading promise
        const loadingPromise = this.fetchJSON(filePath)
            .then(data => {
                this.fruitsData.set(fruitId, data);
                this.loadingPromises.delete(fruitId);
                console.log(`Loaded fruit: ${fruitId}`);
                return data;
            })
            .catch(error => {
                this.loadingPromises.delete(fruitId);
                console.error(`Failed to load fruit ${fruitId}:`, error);
                throw error;
            });

        this.loadingPromises.set(fruitId, loadingPromise);
        return loadingPromise;
    }

    /**
     * Load a world's data from JSON file
     * @param {string} worldId - The world ID (e.g., 'garden')
     * @returns {Promise<Object>} The world data object
     */
    async loadWorld(worldId) {
        // Check if already loaded
        if (this.worldsData.has(worldId)) {
            return this.worldsData.get(worldId);
        }

        // Check if currently loading
        if (this.loadingPromises.has(`world_${worldId}`)) {
            return this.loadingPromises.get(`world_${worldId}`);
        }

        const filePath = `${this.basePath}worlds/${worldId}.json`;

        // Create loading promise
        const loadingPromise = this.fetchJSON(filePath)
            .then(data => {
                this.worldsData.set(worldId, data);
                this.loadingPromises.delete(`world_${worldId}`);
                console.log(`Loaded world: ${worldId}`);
                return data;
            })
            .catch(error => {
                this.loadingPromises.delete(`world_${worldId}`);
                console.error(`Failed to load world ${worldId}:`, error);
                throw error;
            });

        this.loadingPromises.set(`world_${worldId}`, loadingPromise);
        return loadingPromise;
    }

    /**
     * Load multiple fruits at once
     * @param {Array<string>} fruitIds - Array of fruit IDs to load
     * @returns {Promise<Array<Object>>} Array of fruit data objects
     */
    async loadFruits(fruitIds) {
        const promises = fruitIds.map(id => this.loadFruit(id));
        return Promise.all(promises);
    }

    /**
     * Load all available fruits (scans fruit directory)
     * @returns {Promise<Array<Object>>} Array of all fruit data
     */
    async loadAllFruits() {
        // For now, we'll load our known fruits
        // In a real implementation, you might scan the directory
        const knownFruits = ['apple_001', 'banana_001', 'orange_001'];
        return this.loadFruits(knownFruits);
    }

    /**
     * Create a fruit instance with stats and level
     * @param {string} fruitId - The fruit ID
     * @param {number} level - The fruit's level (default: 1)
     * @param {Object} overrides - Optional stat overrides
     * @returns {Promise<Object>} Fruit instance with calculated stats
     */
    async createFruitInstance(fruitId, level = 1, overrides = {}) {
        const fruitData = await this.loadFruit(fruitId);
        
        // Calculate level-based stats
        const calculatedStats = this.calculateStats(fruitData.baseStats, level);
        
        // Generate unique instance ID
        const instanceId = this.generateInstanceId();
        
        return {
            instanceId,
            fruitId,
            level,
            name: fruitData.name,
            type: fruitData.type,
            emoji: fruitData.emoji,
            description: fruitData.description,
            rarity: fruitData.rarity,
            currentStats: { ...calculatedStats, ...overrides },
            maxStats: calculatedStats,
            attacks: [...fruitData.attacks],
            experience: 0,
            experienceToNext: this.calculateExpToNext(level, fruitData.growthRate),
            nickname: null,
            status: 'healthy',
            originalData: fruitData
        };
    }

    /**
     * Calculate stats based on base stats and level
     * @param {Object} baseStats - Base stats from fruit data
     * @param {number} level - Current level
     * @returns {Object} Calculated stats
     */
    calculateStats(baseStats, level) {
        const statMultiplier = 1 + (level - 1) * 0.1; // 10% increase per level
        
        return {
            health: Math.floor(baseStats.health * statMultiplier),
            attack: Math.floor(baseStats.attack * statMultiplier),
            defense: Math.floor(baseStats.defense * statMultiplier),
            speed: Math.floor(baseStats.speed * statMultiplier),
            special: Math.floor(baseStats.special * statMultiplier)
        };
    }

    /**
     * Calculate experience needed for next level
     * @param {number} level - Current level
     * @param {string} growthRate - Growth rate (fast, medium, slow)
     * @returns {number} Experience needed for next level
     */
    calculateExpToNext(level, growthRate = 'medium') {
        const baseExp = {
            fast: 50,
            medium: 75,
            slow: 100
        };
        
        return Math.floor(baseExp[growthRate] * Math.pow(level, 1.5));
    }

    /**
     * Generate a unique instance ID
     * @returns {string} Unique instance ID
     */
    generateInstanceId() {
        return 'fruit_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Get fruit data (cached or load if needed)
     * @param {string} fruitId - The fruit ID
     * @returns {Object|null} Fruit data or null if not loaded
     */
    getFruit(fruitId) {
        return this.fruitsData.get(fruitId) || null;
    }

    /**
     * Get world data (cached or load if needed)
     * @param {string} worldId - The world ID
     * @returns {Object|null} World data or null if not loaded
     */
    getWorld(worldId) {
        return this.worldsData.get(worldId) || null;
    }

    /**
     * Get random fruit from a specific habitat
     * @param {string} habitat - The habitat to search
     * @param {number} minLevel - Minimum level
     * @param {number} maxLevel - Maximum level
     * @returns {Promise<Object>} Random fruit instance
     */
    async getRandomFruitFromHabitat(habitat, minLevel = 1, maxLevel = 5) {
        await this.loadAllFruits();
        
        // Filter fruits by habitat
        const availableFruits = [];
        for (const [fruitId, fruitData] of this.fruitsData) {
            if (fruitData.habitat.includes(habitat)) {
                availableFruits.push(fruitId);
            }
        }
        
        if (availableFruits.length === 0) {
            throw new Error(`No fruits found for habitat: ${habitat}`);
        }
        
        // Select random fruit
        const randomFruit = availableFruits[Math.floor(Math.random() * availableFruits.length)];
        const randomLevel = minLevel + Math.floor(Math.random() * (maxLevel - minLevel + 1));
        
        return this.createFruitInstance(randomFruit, randomLevel);
    }

    /**
     * Fetch JSON data from file
     * @param {string} filePath - Path to JSON file
     * @returns {Promise<Object>} Parsed JSON data
     */
    async fetchJSON(filePath) {
        try {
            const response = await fetch(filePath);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Failed to fetch ${filePath}:`, error);
            throw error;
        }
    }

    /**
     * Clear all cached data (useful for testing)
     */
    clearCache() {
        this.fruitsData.clear();
        this.worldsData.clear();
        this.loadingPromises.clear();
        console.log('Fruit loader cache cleared');
    }

    /**
     * Get loading status information
     * @returns {Object} Loading status
     */
    getLoadingStatus() {
        return {
            fruitsLoaded: this.fruitsData.size,
            worldsLoaded: this.worldsData.size,
            currentlyLoading: this.loadingPromises.size
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FruitLoader;
} else if (typeof window !== 'undefined') {
    window.FruitLoader = FruitLoader;
}