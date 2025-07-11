# Cucumber World RPG - Battle System Plan

## Overview
Design document for implementing a Pokemon-style turn-based battle system that triggers when encountering wild fruits during grid-based exploration.

## Core Battle Flow

### 1. Battle Initiation
```
Grid Exploration → Wild Encounter → Battle Transition → Turn-Based Combat → Results → Return to Grid
```

**Trigger Conditions:**
- Player walks on grass tiles (3% encounter rate)
- Player interacts with berry bushes (15% encounter rate)
- Trainer battles on paths (0.5% encounter rate)

**Transition Animation:**
- Screen flash effect (white → battle background)
- Sliding transition similar to Pokemon games
- Sound effect: "wild fruit appeared!" jingle

### 2. Battle Screen Layout
```
┌─────────────────────────────────────────────────────────────┐
│  🌳 GARDEN BATTLE BACKGROUND 🌳                           │
│                                                             │
│                    🍎 Wild Apple                          │
│                   ▓▓▓▓▓▓▓▓▓▓ HP: 45/45                   │
│                   Level 3                                   │
│                                                             │
│                                                             │
│                                                             │
│              🥒 Your Cucumber                               │
│              ▓▓▓▓▓▓▓▓▓▓ HP: 50/50                         │
│              Level 2                                        │
│                                                             │
│┌───────────────────────────────────────────────────────────┐│
││ > ATTACK    DEFEND                                        ││
││   ITEMS     RUN                                           ││
│└───────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

## Battle Mechanics

### 3. Turn-Based System

**Turn Order:**
- Speed stat determines who goes first
- Player chooses action → Execute → Enemy AI → Repeat

**Action Types:**
1. **ATTACK** - Use a move to damage opponent
2. **DEFEND** - Reduce incoming damage, slight HP recovery  
3. **ITEMS** - Use healing items, capture tools
4. **RUN** - Attempt to escape (success rate based on speed difference)

### 4. Combat Stats System

```json
{
  "fruit_stats": {
    "base_stats": {
      "health": "Hit Points - damage taken reduces this",
      "attack": "Physical damage output",
      "defense": "Damage reduction",
      "speed": "Turn order and escape chance",
      "special": "Special move effectiveness"
    },
    "level_scaling": {
      "health": "base_health + (level * 3)",
      "attack": "base_attack + (level * 2)", 
      "defense": "base_defense + (level * 1.5)",
      "speed": "base_speed + (level * 1)",
      "special": "base_special + (level * 1.5)"
    }
  }
}
```

**Damage Calculation:**
```javascript
damage = (attacker.attack * move.power * type_effectiveness) / defender.defense
damage = Math.max(1, Math.floor(damage * random(0.85, 1.0)))
```

### 5. Move System

**Basic Moves for Each Fruit Type:**

```json
{
  "apple_moves": [
    {
      "name": "Apple Toss",
      "power": 20,
      "accuracy": 90,
      "type": "grass",
      "description": "Hurls a fresh apple at the opponent"
    },
    {
      "name": "Sweet Scent", 
      "power": 0,
      "accuracy": 100,
      "type": "grass",
      "effect": "lowers_opponent_attack",
      "description": "Sweet aroma that weakens the enemy"
    },
    {
      "name": "Crunch",
      "power": 25,
      "accuracy": 85,
      "type": "normal",
      "description": "A powerful bite attack"
    }
  ],
  "orange_moves": [
    {
      "name": "Citrus Blast",
      "power": 22,
      "accuracy": 88,
      "type": "fire",
      "description": "Acidic juice that burns"
    },
    {
      "name": "Vitamin Boost",
      "power": 0,
      "accuracy": 100,
      "type": "normal", 
      "effect": "heals_self",
      "description": "Restores health with vitamin C"
    }
  ],
  "banana_moves": [
    {
      "name": "Slip Trap",
      "power": 15,
      "accuracy": 95,
      "type": "normal",
      "effect": "lowers_opponent_speed",
      "description": "Opponent slips on banana peel"
    },
    {
      "name": "Potassium Power",
      "power": 28,
      "accuracy": 80,
      "type": "electric",
      "description": "Electrifying potassium surge"
    }
  ]
}
```

### 6. Type Effectiveness System

```json
{
  "type_chart": {
    "grass": {
      "strong_against": ["water", "ground"],
      "weak_against": ["fire", "ice"],
      "normal_against": ["normal", "grass", "electric"]
    },
    "fire": {
      "strong_against": ["grass", "ice"],
      "weak_against": ["water", "ground"], 
      "normal_against": ["normal", "fire", "electric"]
    },
    "water": {
      "strong_against": ["fire", "ground"],
      "weak_against": ["grass", "electric"],
      "normal_against": ["normal", "water", "ice"]
    }
  },
  "effectiveness_multipliers": {
    "super_effective": 1.5,
    "normal": 1.0,
    "not_very_effective": 0.67
  }
}
```

## Battle UI Components

### 7. Health Bar Animation
```javascript
// Smooth HP bar animation when taking damage
function animateHealthBar(currentHP, maxHP, targetHP) {
  // Red section shows damage taken
  // Green section shows remaining health  
  // Smooth transition over 1 second
}
```

### 8. Battle Messages
```
"A wild Apple appeared!"
"Cucumber used Apple Toss!"
"It's super effective!"
"Wild Apple fainted!"
"Cucumber gained 24 EXP!"
"Cucumber grew to level 3!"
```

### 9. Action Menu System
```
Main Menu:
├── ATTACK → Move Selection (4 moves max)
├── DEFEND → Defensive stance
├── ITEMS → Item inventory
│   ├── Healing Items (Berry Juice, Super Berry)
│   ├── Capture Items (Fruit Net, Super Net)
│   └── Status Items (Antidote, Awakening)
└── RUN → Escape attempt
```

## Advanced Features

### 10. Status Effects
```json
{
  "status_effects": {
    "poisoned": {
      "effect": "lose_hp_each_turn",
      "amount": "max_hp / 8",
      "duration": 5,
      "message": "Cucumber is hurt by poison!"
    },
    "confused": {
      "effect": "may_hurt_self",
      "chance": 0.33,
      "duration": 3,
      "message": "Cucumber is confused!"
    },
    "paralyzed": {
      "effect": "may_skip_turn", 
      "chance": 0.25,
      "duration": 99,
      "message": "Cucumber is paralyzed!"
    }
  }
}
```

### 11. Experience and Leveling
```javascript
// EXP calculation
baseEXP = defeatedFruit.baseEXP * defeatedFruit.level
gainedEXP = Math.floor(baseEXP * (isWildBattle ? 1.0 : 1.5))

// Level up calculation  
expToNext = Math.pow(currentLevel + 1, 3)
if (totalEXP >= expToNext) {
  levelUp()
}
```

### 12. Capture System
```json
{
  "capture_mechanics": {
    "fruit_net": {
      "base_rate": 0.15,
      "name": "Fruit Net",
      "description": "Basic capture tool"
    },
    "super_net": {
      "base_rate": 0.35,
      "name": "Super Net", 
      "description": "Advanced capture tool"
    },
    "master_net": {
      "base_rate": 0.75,
      "name": "Master Net",
      "description": "Premium capture tool"
    }
  },
  "capture_formula": "base_rate * (1 - current_hp_ratio) * level_modifier"
}
```

## AI System

### 13. Enemy AI Patterns
```javascript
class WildFruitAI {
  selectMove(fruit, opponent) {
    // 60% - Use random attack move
    // 20% - Use status/support move if available
    // 15% - Use strongest move if low HP
    // 5% - Attempt to flee if critically low HP
  }
}

class TrainerAI {
  selectMove(fruit, opponent) {
    // More strategic:
    // - Type effectiveness considerations
    // - Switch fruits when disadvantaged
    // - Use items strategically
    // - Predict player patterns
  }
}
```

## Visual Effects

### 14. Battle Animations
```json
{
  "attack_animations": {
    "physical": "fruit moves forward, impact flash, knockback",
    "special": "particle effects, screen shake, color overlay",
    "status": "sparkles, status icon appears, fade effect"
  },
  "transition_effects": {
    "battle_start": "spiral wipe from center",
    "battle_end": "fade to white, return to grid",
    "level_up": "golden flash, stat increase display"
  }
}
```

### 15. Sound Design
```json
{
  "battle_sounds": {
    "encounter": "wild_battle_start.mp3",
    "attack_hit": "attack_normal.wav", 
    "super_effective": "attack_super.wav",
    "level_up": "level_up_fanfare.mp3",
    "victory": "battle_victory.mp3",
    "defeat": "battle_defeat.mp3"
  }
}
```

## Integration Points

### 16. Grid System Integration
```javascript
// In grid-world-explorer.js
handleEncounter(encounterData) {
  // Pause grid movement
  this.gridSystem.pauseInput = true
  
  // Create battle data
  const battleData = {
    enemyFruit: this.generateWildFruit(encounterData),
    playerFruit: this.gameEngine.currentSave.team[0],
    battleType: 'wild',
    background: this.getBattleBackground(encounterData.tile)
  }
  
  // Transition to battle
  this.gameEngine.startBattle(battleData)
}
```

### 17. Save System Integration
```json
{
  "save_battle_data": {
    "team": [
      {
        "id": "cucumber_001",
        "species": "cucumber", 
        "level": 5,
        "exp": 1247,
        "hp": 42,
        "maxHP": 55,
        "moves": ["vine_whip", "tackle", "growth", "synthesis"],
        "nature": "brave",
        "statusEffect": null
      }
    ],
    "items": {
      "fruit_net": 5,
      "super_net": 1,
      "berry_juice": 3,
      "super_berry": 1
    }
  }
}
```

## Implementation Phases

### Phase 1: Core Battle Engine
- [ ] Battle state management
- [ ] Turn-based combat loop
- [ ] Basic attack/defend mechanics
- [ ] HP/damage calculation
- [ ] Simple AI

### Phase 2: Enhanced Combat
- [ ] Move system with multiple attacks
- [ ] Type effectiveness chart
- [ ] Status effects
- [ ] Battle animations

### Phase 3: Team Management  
- [ ] Multiple fruit team system
- [ ] Fruit switching in battle
- [ ] Experience and leveling
- [ ] Move learning

### Phase 4: Advanced Features
- [ ] Capture mechanics
- [ ] Item usage in battle
- [ ] Trainer battles
- [ ] Battle backgrounds and music

### Phase 5: Polish
- [ ] Advanced animations
- [ ] Sound effects
- [ ] Battle replay system
- [ ] Tournament mode

## Technical Architecture

### 18. Battle System Classes
```javascript
class BattleEngine {
  // Core battle logic and state management
}

class BattleFruit {
  // Individual fruit in battle with stats/moves
}

class MoveProcessor {
  // Execute moves and calculate effects
}

class BattleUI {
  // Render battle interface and handle input
}

class BattleAnimator {
  // Handle all battle animations and effects
}
```

This comprehensive battle system will provide engaging Pokemon-style combat that seamlessly integrates with the grid-based exploration system, giving players strategic depth and rewarding progression mechanics.