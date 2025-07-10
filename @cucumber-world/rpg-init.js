/**
 * Cucumber World RPG Initialization Script
 * Handles the integration between the main website and the RPG game
 */

class CucumberWorldInit {
    constructor() {
        this.game = null;
        this.isGameInitialized = false;
        this.container = null;
        this.startButton = null;
        
        this.init();
    }

    /**
     * Initialize the RPG integration
     */
    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupEventHandlers());
        } else {
            this.setupEventHandlers();
        }
    }

    /**
     * Setup event handlers for the RPG
     */
    setupEventHandlers() {
        this.startButton = document.getElementById('start-rpg-btn');
        this.container = document.getElementById('cucumber-world-container');
        
        if (!this.startButton || !this.container) {
            console.error('RPG elements not found in DOM');
            return;
        }

        // Add click handler to start button
        this.startButton.addEventListener('click', () => {
            this.startRPG();
        });

        console.log('Cucumber World RPG integration initialized');
    }

    /**
     * Start the RPG game
     */
    async startRPG() {
        try {
            // Show loading state
            this.showLoading();
            
            // Check if game is already initialized
            if (!this.isGameInitialized) {
                await this.initializeGame();
            }
            
            // Show the game container
            this.showGameContainer();
            
            // Scroll to game
            this.scrollToGame();
            
            console.log('RPG started successfully');
        } catch (error) {
            console.error('Failed to start RPG:', error);
            this.showError('Failed to start the game. Please try again.');
        }
    }

    /**
     * Initialize the game engine
     */
    async initializeGame() {
        // Check if required classes are available
        if (typeof CucumberWorld === 'undefined') {
            throw new Error('CucumberWorld class not loaded');
        }

        // Create game container content
        this.container.innerHTML = `
            <div class="cucumber-world-game">
                <div class="game-header">
                    <h2>🥒 Cucumber World RPG 🍎</h2>
                    <div class="game-controls">
                        <button id="cw-menu-btn" class="cw-btn">Menu</button>
                        <button id="cw-save-btn" class="cw-btn" style="display: none;">Save</button>
                        <button id="cw-close-btn" class="cw-btn">Close Game</button>
                    </div>
                </div>
                <div class="game-content">
                    <canvas id="cw-game-canvas" width="800" height="600"></canvas>
                    <div id="cw-ui-overlay" class="ui-overlay"></div>
                </div>
                <div class="game-footer">
                    <div id="cw-status-bar" class="status-bar">Initializing...</div>
                </div>
            </div>
        `;

        // Initialize the game
        this.game = new CucumberWorld('cucumber-world-container');
        
        // Add close button handler
        document.getElementById('cw-close-btn').addEventListener('click', () => {
            this.closeGame();
        });

        // Wait a moment for initialization
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        this.isGameInitialized = true;
    }

    /**
     * Show loading state
     */
    showLoading() {
        this.startButton.innerHTML = '<span class="loading-spinner"></span>Loading...';
        this.startButton.disabled = true;
    }

    /**
     * Reset start button
     */
    resetStartButton() {
        this.startButton.innerHTML = '🎮 Start Adventure';
        this.startButton.disabled = false;
    }

    /**
     * Show the game container
     */
    showGameContainer() {
        this.container.style.display = 'block';
        this.resetStartButton();
    }

    /**
     * Hide the game container
     */
    hideGameContainer() {
        this.container.style.display = 'none';
        this.resetStartButton();
    }

    /**
     * Close the game and return to main page
     */
    closeGame() {
        // Confirm if user wants to close
        const confirmClose = confirm('Are you sure you want to close the game? Make sure to save your progress!');
        
        if (confirmClose) {
            this.hideGameContainer();
            
            // Scroll back to RPG intro section
            const rpgIntro = document.querySelector('.rpg-intro');
            if (rpgIntro) {
                rpgIntro.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }

    /**
     * Scroll to the game container
     */
    scrollToGame() {
        this.container.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }

    /**
     * Show error message
     */
    showError(message) {
        this.resetStartButton();
        
        // Create error message element
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        
        // Insert after the start button
        this.startButton.parentNode.insertBefore(errorDiv, this.startButton.nextSibling);
        
        // Remove error message after 5 seconds
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 5000);
    }

    /**
     * Show success message
     */
    showSuccess(message) {
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.textContent = message;
        
        this.startButton.parentNode.insertBefore(successDiv, this.startButton.nextSibling);
        
        setTimeout(() => {
            if (successDiv.parentNode) {
                successDiv.parentNode.removeChild(successDiv);
            }
        }, 3000);
    }

    /**
     * Get game status
     */
    getGameStatus() {
        return {
            initialized: this.isGameInitialized,
            running: this.container && this.container.style.display !== 'none',
            gameEngine: this.game ? this.game.getGameState() : null
        };
    }
}

// Initialize when script loads
const cucumberWorldInit = new CucumberWorldInit();

// Export for debugging/testing
if (typeof window !== 'undefined') {
    window.CucumberWorldInit = CucumberWorldInit;
    window.cucumberWorldInit = cucumberWorldInit;
}