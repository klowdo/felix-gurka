# Cucumber World RPG - Project Context for Claude

## Project Overview
This is a Pokemon-style RPG game called "Cucumber World RPG" built for the Felix Gurka website. The game features grid-based exploration and turn-based combat with fruit companions.

## Current Implementation Status

### ✅ Completed Features
- **Grid-based movement system** with Pokemon-style camera (player centered, world moves)
- **Tile system** with grass (3% encounters), paths (safe), stone areas (safe), bushes (15% encounters)
- **Random encounter system** that triggers wild fruit battles
- **Basic battle starter** with encounter popup → battle screen transition
- **Battle screen rendering** with HP bars, fruit sprites, and placeholder UI
- **Save/load system** with multiple save slots
- **JSON-based world data** for easy level creation and expansion

### 🏗️ Core Architecture
- **Main Game Engine**: `@cucumber-world/game/cucumber-world.js`
- **Grid System**: `@cucumber-world/game/grid-system.js` (Pokemon-style movement)
- **World Explorer**: `@cucumber-world/game/grid-world-explorer.js`
- **Save Manager**: `@cucumber-world/game/save-manager.js`
- **Collision System**: `@cucumber-world/game/collision-system.js`
- **World Renderer**: `@cucumber-world/game/world-renderer.js`

### 📁 Data Structure
```
@cucumber-world/
├── fruits/                 # Fruit companion data (apple.json, etc.)
├── worlds/garden/levels/    # Grid-based level layouts
├── objects/                # Tile definitions and environment objects
├── game/                   # Core game engine files
└── BATTLE_IMPLEMENTATION_PLAN.md  # Complete battle system roadmap
```

## Battle System Status

### ✅ Working Now
1. **Random Encounters**: Walk on grass → 3% chance → "A wild Apple appeared!"
2. **Wild Fruit Generation**: Random species, level 1-3, calculated stats
3. **Battle Transition**: Game state changes to 'battle', shows Pokemon-style screen
4. **Battle Rendering**: Gradient background, fruit sprites, HP bars, message box
5. **Auto-Resolution**: Currently auto-wins after 3 seconds for testing

### 🎯 Next Major Implementation: Complete Battle System

## Battle System Implementation Plan (8 Weeks)

### **Week 1: Interactive Battle Menu**
Replace current auto-battle with interactive 4-option menu:
```
┌─────────────────────────────┐
│ > ATTACK    DEFEND          │
│   ITEMS     RUN             │
└─────────────────────────────┘
```
- Create `battle-input.js` for WASD menu navigation
- Add visual cursor and selection highlighting
- Implement move selection sub-menu when "Attack" chosen

### **Week 2: Turn-Based Combat Engine**
- Create `battle-engine.js` for core combat logic
- Implement speed-based turn order (faster fruit goes first)
- Add damage calculation: `(attack * move_power * type_effectiveness) / defense`
- Create basic enemy AI decision making
- Handle all 4 actions: Attack, Defend, Items, Run

### **Week 3: Battle Animations & Feedback**
- Add attack animations (sprite movement, impact effects)
- Create dynamic battle messages ("It's super effective!", "Critical hit!")
- Implement smooth HP bar animations
- Add particle effects for different move types

### **Week 4: Advanced Combat Features**
- Status effects system (poison, paralysis, sleep, confusion)
- Expand move database to 20+ unique moves with varied effects
- Complete type effectiveness chart (grass vs fire vs water vs electric)
- Add PP (Power Points) system for moves

### **Week 5: Fruit Capture System**
- Implement capture mechanics with Fruit Nets
- Capture rate formula: `base_rate * (1 - hp_ratio) * level_modifier`
- Add capture items to inventory system
- Create team management (6 fruit limit)

### **Week 6: Experience & Progression**
- EXP gain calculation and level-up system
- Move learning at specific levels
- Stat increases on level up
- Optional evolution system for certain fruits

### **Week 7: Trainer Battles**
- Advanced trainer AI with multiple fruits
- Trainer database with teams and dialogue
- Strategic team switching during battle
- Victory rewards (money, items, EXP bonuses)

### **Week 8: Polish & Balance**
- Battle simulation tools for balance testing
- Audio integration (battle music, sound effects)
- Visual polish (backgrounds, weather effects)
- Performance optimization

## Key Technical Details

### Grid System
- **Tile Size**: 32x32 pixels
- **Grid Dimensions**: 37x25 tiles (1200x800 screen)
- **Camera**: Player stays centered, world moves around them
- **Encounter Rate**: Grass 3%, Bushes 15%, Paths 0.5%

### Battle Data Structure
```javascript
// Current battle data format
{
  enemyFruit: {
    name: "Apple",
    species: "apple", 
    level: 2,
    hp: 51,
    maxHP: 51,
    stats: { attack: 19, defense: 21, speed: 14 },
    moves: ["Apple Toss", "Sweet Scent"],
    type: "grass"
  },
  playerFruit: {
    name: "Cucumber",
    species: "cucumber",
    level: 2,
    hp: 50,
    maxHP: 50,
    stats: { attack: 16, defense: 14, speed: 12 },
    moves: ["Vine Whip", "Tackle"],
    type: "grass"
  }
}
```

### Save Data Format
```javascript
{
  playerName: "string",
  currentWorld: "garden",
  currentArea: "vegetable_patch", 
  team: [/* array of fruit objects */],
  inventory: {/* items and quantities */},
  gameProgress: {/* completion tracking */}
}
```

## Important Implementation Notes

1. **useGridSystem = true**: The game uses grid-based movement, not free movement
2. **Battle Flow**: Grid exploration → encounter → popup → battle state → resolution → return to grid
3. **File Integration**: New battle files should integrate with existing `cucumber-world.js` game engine
4. **Backward Compatibility**: Maintain save file compatibility during battle system expansion
5. **Performance**: Use object pooling for animations, cache frequently accessed data

## Common Commands for Development
```bash
npm run dev          # Start development server
git add . && git commit -m "message"  # Commit changes
```

## Development Workflow - IMPORTANT
**ALWAYS commit changes when implementing new features or fixing bugs:**
1. After completing any significant work, run: `git add . && git commit -m "descriptive message"`
2. Use meaningful commit messages that describe what was implemented
3. Commit frequently to track progress and enable rollbacks if needed

## Testing the Current System
1. Start a new game in the RPG
2. Walk around on grass tiles (green 🌱)  
3. Eventually get random encounter: "A wild [Fruit] appeared!"
4. See battle screen with HP bars and fruit sprites
5. Battle auto-resolves after 3 seconds
6. Return to grid exploration

## Next Steps Priority
1. **Interactive Battle Menu** - Replace auto-battle with player choice
2. **Damage Calculation** - Implement actual combat mechanics  
3. **Type System** - Add grass/fire/water effectiveness
4. **Status Effects** - Poison, paralysis, etc.
5. **Capture Mechanics** - Ability to catch wild fruits

This context should help any new Claude session understand the project state and continue development effectively.