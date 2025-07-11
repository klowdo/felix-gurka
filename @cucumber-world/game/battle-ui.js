/**
 * Battle UI - Renders interactive battle menu and interface elements
 * Part of Cucumber World RPG Battle System
 */

class BattleUI {
    constructor() {
        // Menu dimensions and positioning
        this.menuWidth = 400;
        this.menuHeight = 120;
        this.menuX = 50;
        this.menuY = 650; // Bottom of 800px screen
        
        // Animation state
        this.animationTime = 0;
        this.cursorBlink = 0;
        
        // Colors and styling
        this.colors = {
            menuBg: 'rgba(0, 0, 0, 0.9)',
            menuBorder: '#FFFFFF',
            normalText: '#FFFFFF',
            selectedText: '#FFD700',
            cursor: '#FF6B6B',
            hpGreen: '#4CAF50',
            hpYellow: '#FFC107',
            hpRed: '#F44336'
        };
    }

    /**
     * Update animation timers
     */
    update(deltaTime) {
        this.animationTime += deltaTime;
        this.cursorBlink = Math.sin(this.animationTime / 300) * 0.5 + 0.5;
    }

    /**
     * Render the complete battle UI
     */
    render(ctx, battleData, inputState, gameEngine) {
        // Render battle background
        this.renderBattleBackground(ctx);
        
        // Render battle participants
        if (battleData) {
            this.renderBattleParticipants(ctx, battleData);
        }
        
        // Render interactive menu
        this.renderBattleMenu(ctx, inputState);
        
        // Render battle messages
        this.renderBattleMessages(ctx, battleData);
    }

    /**
     * Render battle background
     */
    renderBattleBackground(ctx) {
        const gradient = ctx.createLinearGradient(0, 0, 0, ctx.canvas.height);
        gradient.addColorStop(0, '#87CEEB'); // Sky blue
        gradient.addColorStop(0.7, '#90EE90'); // Light green
        gradient.addColorStop(1, '#228B22'); // Forest green
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        
        // Add some decorative elements
        this.renderBackgroundElements(ctx);
    }

    /**
     * Render background decorative elements
     */
    renderBackgroundElements(ctx) {
        ctx.save();
        
        // Simple grass decoration
        ctx.font = '20px Arial';
        ctx.globalAlpha = 0.3;
        
        for (let i = 0; i < 15; i++) {
            const x = (i * 80) + Math.sin(this.animationTime / 1000 + i) * 10;
            const y = ctx.canvas.height - 200 + Math.cos(this.animationTime / 800 + i) * 5;
            ctx.fillText('🌱', x, y);
        }
        
        ctx.restore();
    }

    /**
     * Render battle participants (fruits and HP bars)
     */
    renderBattleParticipants(ctx, battleData) {
        const centerX = ctx.canvas.width / 2;
        const centerY = ctx.canvas.height / 2;
        
        if (!battleData.enemyFruit || !battleData.playerFruit) return;
        
        const enemyFruit = battleData.enemyFruit;
        const playerFruit = battleData.playerFruit;
        
        ctx.save();
        
        // Enemy fruit (top right)
        ctx.font = '80px Arial';
        ctx.textAlign = 'center';
        
        const enemyEmoji = this.getFruitEmoji(enemyFruit.species);
        ctx.fillText(enemyEmoji, centerX + 200, centerY - 120);
        
        // Enemy info and HP bar
        this.renderFruitInfo(ctx, enemyFruit, centerX + 200, centerY - 40, 'enemy');
        
        // Player fruit (bottom left)
        ctx.font = '80px Arial';
        ctx.fillText('🥒', centerX - 200, centerY + 120);
        
        // Player info and HP bar
        this.renderFruitInfo(ctx, playerFruit, centerX - 200, centerY + 200, 'player');
        
        ctx.restore();
    }

    /**
     * Render fruit info (name, level, HP bar)
     */
    renderFruitInfo(ctx, fruit, x, y, type) {
        ctx.save();
        
        // Fruit name and level
        ctx.font = 'bold 18px Arial';
        ctx.fillStyle = 'white';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.textAlign = 'center';
        
        const text = `${fruit.name} Lv.${fruit.level}`;
        ctx.strokeText(text, x, y);
        ctx.fillText(text, x, y);
        
        // HP bar
        const hpBarWidth = 160;
        const hpBarHeight = 12;
        const hpBarX = x - hpBarWidth / 2;
        const hpBarY = y + 20;
        
        this.renderHPBar(ctx, hpBarX, hpBarY, hpBarWidth, hpBarHeight, 
                         fruit.hp, fruit.maxHP);
        
        // HP text
        ctx.font = '12px Arial';
        ctx.fillStyle = 'white';
        ctx.fillText(`${fruit.hp}/${fruit.maxHP}`, x, hpBarY + hpBarHeight + 15);
        
        ctx.restore();
    }

    /**
     * Render HP bar with color based on health ratio
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
            ctx.fillStyle = this.colors.hpGreen;
        } else if (hpRatio > 0.2) {
            ctx.fillStyle = this.colors.hpYellow;
        } else {
            ctx.fillStyle = this.colors.hpRed;
        }
        
        ctx.fillRect(x, y, hpWidth, height);
        
        // Border
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, width, height);
    }

    /**
     * Render main battle menu
     */
    renderBattleMenu(ctx, inputState) {
        if (!inputState) return;
        
        const selection = inputState.getSelectionInfo();
        
        switch (selection.menuState) {
            case 'main':
                this.renderMainMenu(ctx, selection);
                break;
            case 'moves':
                this.renderMoveMenu(ctx, selection);
                break;
            case 'items':
                this.renderItemMenu(ctx, selection);
                break;
        }
    }

    /**
     * Render main battle menu (Attack/Defend/Items/Run)
     */
    renderMainMenu(ctx, selection) {
        // Menu background
        ctx.fillStyle = this.colors.menuBg;
        ctx.fillRect(this.menuX, this.menuY, this.menuWidth, this.menuHeight);
        
        // Menu border
        ctx.strokeStyle = this.colors.menuBorder;
        ctx.lineWidth = 3;
        ctx.strokeRect(this.menuX, this.menuY, this.menuWidth, this.menuHeight);
        
        // Menu options in 2x2 grid
        const options = selection.mainMenuOptions;
        const optionWidth = this.menuWidth / 2;
        const optionHeight = this.menuHeight / 2;
        
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        
        for (let i = 0; i < options.length; i++) {
            const row = Math.floor(i / 2);
            const col = i % 2;
            
            const optionX = this.menuX + (col * optionWidth) + (optionWidth / 2);
            const optionY = this.menuY + (row * optionHeight) + (optionHeight / 2) + 8;
            
            // Highlight selected option
            if (i === selection.selectedAction) {
                // Selection background
                ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
                ctx.fillRect(
                    this.menuX + (col * optionWidth) + 10,
                    this.menuY + (row * optionHeight) + 10,
                    optionWidth - 20,
                    optionHeight - 20
                );
                
                // Cursor
                ctx.fillStyle = this.colors.cursor;
                ctx.fillText('►', optionX - 60, optionY);
                
                // Selected text color
                ctx.fillStyle = this.colors.selectedText;
            } else {
                ctx.fillStyle = this.colors.normalText;
            }
            
            ctx.fillText(options[i], optionX, optionY);
        }
    }

    /**
     * Render move selection menu
     */
    renderMoveMenu(ctx, selection) {
        // Menu background
        ctx.fillStyle = this.colors.menuBg;
        ctx.fillRect(this.menuX, this.menuY, this.menuWidth, this.menuHeight);
        
        // Menu border
        ctx.strokeStyle = this.colors.menuBorder;
        ctx.lineWidth = 3;
        ctx.strokeRect(this.menuX, this.menuY, this.menuWidth, this.menuHeight);
        
        // Placeholder moves (will be replaced with actual move data)
        const moves = ['Vine Whip', 'Tackle', 'Growth', 'Synthesis'];
        const optionWidth = this.menuWidth / 2;
        const optionHeight = this.menuHeight / 2;
        
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'center';
        
        for (let i = 0; i < moves.length; i++) {
            const row = Math.floor(i / 2);
            const col = i % 2;
            
            const optionX = this.menuX + (col * optionWidth) + (optionWidth / 2);
            const optionY = this.menuY + (row * optionHeight) + (optionHeight / 2) + 8;
            
            // Highlight selected move
            if (i === selection.selectedMove) {
                // Selection background
                ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
                ctx.fillRect(
                    this.menuX + (col * optionWidth) + 10,
                    this.menuY + (row * optionHeight) + 10,
                    optionWidth - 20,
                    optionHeight - 20
                );
                
                // Cursor
                ctx.fillStyle = this.colors.cursor;
                ctx.fillText('►', optionX - 80, optionY);
                
                // Selected text color
                ctx.fillStyle = this.colors.selectedText;
            } else {
                ctx.fillStyle = this.colors.normalText;
            }
            
            ctx.fillText(moves[i], optionX, optionY);
        }
        
        // Back instruction
        ctx.font = '12px Arial';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.textAlign = 'left';
        ctx.fillText('ESC: Back', this.menuX + 10, this.menuY - 10);
    }

    /**
     * Render item selection menu
     */
    renderItemMenu(ctx, selection) {
        // Menu background
        ctx.fillStyle = this.colors.menuBg;
        ctx.fillRect(this.menuX, this.menuY, this.menuWidth, this.menuHeight);
        
        // Menu border
        ctx.strokeStyle = this.colors.menuBorder;
        ctx.lineWidth = 3;
        ctx.strokeRect(this.menuX, this.menuY, this.menuWidth, this.menuHeight);
        
        // Placeholder items
        const items = ['Fruit Net', 'Berry Juice', 'Super Net', 'Antidote'];
        
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'left';
        
        for (let i = 0; i < items.length; i++) {
            const itemY = this.menuY + 30 + (i * 20);
            
            if (i === selection.selectedItem) {
                // Selection background
                ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
                ctx.fillRect(this.menuX + 10, itemY - 15, this.menuWidth - 20, 18);
                
                // Cursor
                ctx.fillStyle = this.colors.cursor;
                ctx.fillText('►', this.menuX + 20, itemY);
                
                // Selected text color
                ctx.fillStyle = this.colors.selectedText;
            } else {
                ctx.fillStyle = this.colors.normalText;
            }
            
            ctx.fillText(`${items[i]} (x5)`, this.menuX + 40, itemY);
        }
        
        // Back instruction
        ctx.font = '12px Arial';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.textAlign = 'left';
        ctx.fillText('ESC: Back', this.menuX + 10, this.menuY - 10);
    }

    /**
     * Render battle messages
     */
    renderBattleMessages(ctx, battleData) {
        // Message area above the menu
        const msgX = this.menuX;
        const msgY = this.menuY - 100;
        const msgWidth = this.menuWidth;
        const msgHeight = 80;
        
        // Message background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(msgX, msgY, msgWidth, msgHeight);
        
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.strokeRect(msgX, msgY, msgWidth, msgHeight);
        
        // Message text
        ctx.fillStyle = 'white';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'left';
        
        let message = "What will Cucumber do?";
        if (battleData && battleData.currentMessage) {
            message = battleData.currentMessage;
        }
        
        // Word wrap the message
        const lines = this.wrapText(ctx, message, msgWidth - 20);
        for (let i = 0; i < Math.min(lines.length, 3); i++) {
            ctx.fillText(lines[i], msgX + 15, msgY + 25 + (i * 20));
        }
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
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BattleUI;
} else if (typeof window !== 'undefined') {
    window.BattleUI = BattleUI;
}