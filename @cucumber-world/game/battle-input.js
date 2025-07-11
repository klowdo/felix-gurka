/**
 * Battle Input Handler - Manages menu navigation and player input during battles
 * Part of Cucumber World RPG Battle System
 */

class BattleInput {
    constructor() {
        // Menu state management
        this.menuState = 'main'; // main, moves, items, confirm
        this.selectedAction = 0; // Current selection index
        this.selectedMove = 0;   // Selected move index
        this.selectedItem = 0;   // Selected item index
        
        // Menu options
        this.mainMenuOptions = ['ATTACK', 'DEFEND', 'ITEMS', 'RUN'];
        this.maxOptions = 4;
        
        // Input state
        this.keys = {};
        this.lastKeyPress = 0;
        this.keyRepeatDelay = 200; // milliseconds
        
        // Callbacks for battle actions
        this.onActionSelected = null;
        this.onMoveSelected = null;
        this.onItemSelected = null;
        this.onMenuBack = null;
        
        this.setupEventListeners();
    }

    /**
     * Setup keyboard event listeners
     */
    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
            this.handleKeyPress(e.key.toLowerCase());
            
            // Prevent default for battle controls
            if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', 
                 'enter', ' ', 'escape'].includes(e.key.toLowerCase())) {
                e.preventDefault();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
    }

    /**
     * Handle key press based on current menu state
     */
    handleKeyPress(key) {
        const now = Date.now();
        
        // Prevent too rapid key repeats
        if (now - this.lastKeyPress < this.keyRepeatDelay) {
            return;
        }
        
        switch (this.menuState) {
            case 'main':
                this.handleMainMenuInput(key);
                break;
            case 'moves':
                this.handleMoveMenuInput(key);
                break;
            case 'items':
                this.handleItemMenuInput(key);
                break;
            case 'confirm':
                this.handleConfirmInput(key);
                break;
        }
        
        this.lastKeyPress = now;
    }

    /**
     * Handle main battle menu navigation
     */
    handleMainMenuInput(key) {
        switch (key) {
            case 'w':
            case 'arrowup':
                this.selectedAction = Math.max(0, this.selectedAction - 2);
                break;
            case 's':
            case 'arrowdown':
                this.selectedAction = Math.min(2, this.selectedAction + 2);
                break;
            case 'a':
            case 'arrowleft':
                if (this.selectedAction % 2 === 1) {
                    this.selectedAction -= 1;
                }
                break;
            case 'd':
            case 'arrowright':
                if (this.selectedAction % 2 === 0 && this.selectedAction < 3) {
                    this.selectedAction += 1;
                }
                break;
            case 'enter':
            case ' ':
                this.selectMainMenuOption();
                break;
        }
    }

    /**
     * Handle move selection menu navigation
     */
    handleMoveMenuInput(key) {
        switch (key) {
            case 'w':
            case 'arrowup':
                this.selectedMove = Math.max(0, this.selectedMove - 2);
                break;
            case 's':
            case 'arrowdown':
                this.selectedMove = Math.min(2, this.selectedMove + 2);
                break;
            case 'a':
            case 'arrowleft':
                if (this.selectedMove % 2 === 1) {
                    this.selectedMove -= 1;
                }
                break;
            case 'd':
            case 'arrowright':
                if (this.selectedMove % 2 === 0 && this.selectedMove < 3) {
                    this.selectedMove += 1;
                }
                break;
            case 'enter':
            case ' ':
                this.selectMove();
                break;
            case 'escape':
                this.goBack();
                break;
        }
    }

    /**
     * Handle item menu navigation
     */
    handleItemMenuInput(key) {
        switch (key) {
            case 'w':
            case 'arrowup':
                this.selectedItem = Math.max(0, this.selectedItem - 1);
                break;
            case 's':
            case 'arrowdown':
                this.selectedItem = Math.min(this.getMaxItems() - 1, this.selectedItem + 1);
                break;
            case 'enter':
            case ' ':
                this.selectItem();
                break;
            case 'escape':
                this.goBack();
                break;
        }
    }

    /**
     * Handle confirmation input
     */
    handleConfirmInput(key) {
        switch (key) {
            case 'enter':
            case ' ':
                this.confirmAction();
                break;
            case 'escape':
                this.cancelAction();
                break;
        }
    }

    /**
     * Select main menu option
     */
    selectMainMenuOption() {
        const option = this.mainMenuOptions[this.selectedAction];
        
        switch (option) {
            case 'ATTACK':
                this.enterMoveMenu();
                break;
            case 'DEFEND':
                this.executeDefend();
                break;
            case 'ITEMS':
                this.enterItemMenu();
                break;
            case 'RUN':
                this.executeRun();
                break;
        }
    }

    /**
     * Enter move selection menu
     */
    enterMoveMenu() {
        this.menuState = 'moves';
        this.selectedMove = 0;
        console.log('Entered move selection menu');
    }

    /**
     * Enter item selection menu
     */
    enterItemMenu() {
        this.menuState = 'items';
        this.selectedItem = 0;
        console.log('Entered item selection menu');
    }

    /**
     * Select a move
     */
    selectMove() {
        if (this.onMoveSelected) {
            this.onMoveSelected(this.selectedMove);
        }
        this.menuState = 'main';
        console.log(`Selected move ${this.selectedMove}`);
    }

    /**
     * Select an item
     */
    selectItem() {
        if (this.onItemSelected) {
            this.onItemSelected(this.selectedItem);
        }
        this.menuState = 'main';
        console.log(`Selected item ${this.selectedItem}`);
    }

    /**
     * Execute defend action
     */
    executeDefend() {
        if (this.onActionSelected) {
            this.onActionSelected('defend');
        }
        console.log('Selected defend action');
    }

    /**
     * Execute run action
     */
    executeRun() {
        if (this.onActionSelected) {
            this.onActionSelected('run');
        }
        console.log('Selected run action');
    }

    /**
     * Go back to previous menu
     */
    goBack() {
        if (this.menuState === 'moves' || this.menuState === 'items') {
            this.menuState = 'main';
            if (this.onMenuBack) {
                this.onMenuBack();
            }
        }
    }

    /**
     * Confirm current action
     */
    confirmAction() {
        // Implementation depends on what's being confirmed
        console.log('Action confirmed');
    }

    /**
     * Cancel current action
     */
    cancelAction() {
        this.goBack();
    }

    /**
     * Get maximum number of items (placeholder)
     */
    getMaxItems() {
        return 4; // Will be replaced with actual inventory count
    }

    /**
     * Reset menu to main state
     */
    resetToMainMenu() {
        this.menuState = 'main';
        this.selectedAction = 0;
        this.selectedMove = 0;
        this.selectedItem = 0;
    }

    /**
     * Set event callbacks
     */
    setCallbacks(callbacks) {
        this.onActionSelected = callbacks.onActionSelected;
        this.onMoveSelected = callbacks.onMoveSelected;
        this.onItemSelected = callbacks.onItemSelected;
        this.onMenuBack = callbacks.onMenuBack;
    }

    /**
     * Get current selection info for rendering
     */
    getSelectionInfo() {
        return {
            menuState: this.menuState,
            selectedAction: this.selectedAction,
            selectedMove: this.selectedMove,
            selectedItem: this.selectedItem,
            mainMenuOptions: this.mainMenuOptions
        };
    }

    /**
     * Cleanup event listeners
     */
    destroy() {
        // Remove event listeners when battle ends
        document.removeEventListener('keydown', this.handleKeyPress);
        document.removeEventListener('keyup', this.handleKeyPress);
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BattleInput;
} else if (typeof window !== 'undefined') {
    window.BattleInput = BattleInput;
}