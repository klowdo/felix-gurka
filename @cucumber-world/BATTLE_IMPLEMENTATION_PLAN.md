# Battle System Implementation Plan

## Current Status
✅ **Completed:**
- Random encounter triggers on grass tiles (3% rate)
- Wild fruit generation with stats and levels
- Battle state transition and screen rendering
- Basic battle UI with HP bars and fruit display
- Auto-battle resolution for testing

⏳ **Next Steps:** Complete interactive battle system

---

## Phase 1: Interactive Battle Menu (Week 1)

### 1.1 Battle Input System
```javascript
// File: @cucumber-world/game/battle-input.js
class BattleInput {
  constructor() {
    this.selectedAction = 'attack'
    this.selectedMove = 0
    this.menuState = 'main' // main, moves, items
  }
  
  handleKeyPress(key) {
    switch(this.menuState) {
      case 'main':
        this.handleMainMenu(key)
        break
      case 'moves':
        this.handleMoveSelection(key)
        break
    }
  }
}
```

**Tasks:**
- [ ] Create battle input handler class
- [ ] Add WASD/Arrow key navigation for battle menu
- [ ] Implement menu highlighting and selection
- [ ] Add action confirmation (Enter/Space)

### 1.2 Battle Action Menu
```
Current: Auto-battle placeholder
Target:  Interactive menu system

┌─────────────────────────────┐
│ > ATTACK    DEFEND          │
│   ITEMS     RUN             │
└─────────────────────────────┘
```

**Tasks:**
- [ ] Create 4-option battle menu (Attack/Defend/Items/Run)
- [ ] Add visual selection cursor (">") 
- [ ] Implement menu navigation with keyboard
- [ ] Add menu transition animations

### 1.3 Move Selection Sub-Menu
```
When "ATTACK" selected:

┌─────────────────────────────┐
│ > Vine Whip    Tackle       │
│   Growth       Synthesis    │
└─────────────────────────────┘

Back to main menu with ESC
```

**Tasks:**
- [ ] Create move selection interface
- [ ] Display move names, PP (Power Points), damage
- [ ] Add move descriptions on hover/selection
- [ ] Implement back navigation to main menu

---

## Phase 2: Turn-Based Combat Engine (Week 2)

### 2.1 Battle Engine Core
```javascript
// File: @cucumber-world/game/battle-engine.js
class BattleEngine {
  constructor() {
    this.turn = 'player' // 'player' or 'enemy'
    this.battlePhase = 'select' // select, animate, resolve
    this.currentAction = null
  }
  
  processTurn(playerAction, enemyAction) {
    // Determine turn order based on speed
    // Execute actions in order
    // Check for battle end conditions
  }
}
```

**Tasks:**
- [ ] Create BattleEngine class for turn management
- [ ] Implement speed-based turn order calculation
- [ ] Add action queuing and processing system
- [ ] Create battle state validation

### 2.2 Combat Actions Implementation

#### Attack Action
```javascript
executeAttack(attacker, defender, move) {
  const damage = this.calculateDamage(attacker, defender, move)
  defender.hp -= damage
  
  return {
    damage: damage,
    critical: this.wasCritical(),
    effectiveness: this.getTypeEffectiveness(move.type, defender.type)
  }
}
```

**Tasks:**
- [ ] Implement damage calculation formula
- [ ] Add critical hit system (6.25% chance)
- [ ] Create type effectiveness chart (grass vs fire vs water)
- [ ] Add accuracy checks and miss possibility

#### Defend Action
```javascript
executeDefend(defender) {
  defender.defense *= 1.5 // Temporary defense boost
  defender.hp += Math.floor(defender.maxHP * 0.1) // Small heal
  
  return { defenseBoosted: true, healAmount: healAmount }
}
```

**Tasks:**
- [ ] Implement defense stance mechanics
- [ ] Add small HP recovery during defend
- [ ] Create temporary stat modification system
- [ ] Add visual feedback for defense mode

#### Run Action
```javascript
attemptRun(playerSpeed, enemySpeed) {
  const escapeChance = (playerSpeed / enemySpeed) * 0.5
  return Math.random() < escapeChance
}
```

**Tasks:**
- [ ] Implement escape probability calculation
- [ ] Add run attempt feedback messages
- [ ] Handle successful escape (return to world)
- [ ] Handle failed escape (lose turn)

### 2.3 AI Enemy Behavior
```javascript
class EnemyAI {
  selectAction(enemy, player) {
    const hpRatio = enemy.hp / enemy.maxHP
    
    if (hpRatio < 0.2) {
      return this.selectDefensiveMove() // 70% defend when low HP
    } else {
      return this.selectAttackMove() // 80% attack when healthy
    }
  }
}
```

**Tasks:**
- [ ] Create enemy AI decision tree
- [ ] Implement HP-based behavior patterns
- [ ] Add randomness to prevent predictability
- [ ] Create different AI personalities (aggressive, defensive, balanced)

---

## Phase 3: Battle Animations & Feedback (Week 3)

### 3.1 Attack Animations
```javascript
// Attack animation sequence
playAttackAnimation(attacker, move) {
  1. Attacker moves toward target (200ms)
  2. Flash/impact effect at contact (100ms)
  3. Attacker returns to position (200ms)
  4. Damage number popup (500ms)
  5. HP bar animation (800ms)
}
```

**Tasks:**
- [ ] Create sprite movement animations
- [ ] Add impact flash effects
- [ ] Implement damage number popups
- [ ] Create smooth HP bar animations
- [ ] Add screen shake for powerful moves

### 3.2 Battle Messages
```
Current: Static "A wild Apple appeared!"
Target:  Dynamic battle narrative

"Cucumber used Vine Whip!"
"It's super effective!"
"Wild Apple took 23 damage!"
"Wild Apple used Apple Toss!"
"Cucumber took 15 damage!"
```

**Tasks:**
- [ ] Create message queue system
- [ ] Add typewriter text effect
- [ ] Implement effectiveness messages ("Super effective!", "Not very effective...")
- [ ] Add critical hit announcements
- [ ] Create status effect notifications

### 3.3 Visual Effects
```javascript
// Particle effects for different move types
const moveEffects = {
  'grass': 'leafParticles',
  'fire': 'fireBlast', 
  'water': 'waterSplash',
  'electric': 'electricBolt'
}
```

**Tasks:**
- [ ] Create particle effect system
- [ ] Add type-specific visual effects
- [ ] Implement status effect animations (poison bubbles, paralysis sparks)
- [ ] Create victory/defeat celebration effects

---

## Phase 4: Advanced Combat Features (Week 4)

### 4.1 Status Effects System
```javascript
// Status effects that persist across turns
const statusEffects = {
  poison: {
    damage: (maxHP) => Math.floor(maxHP / 8),
    duration: 5,
    message: "Cucumber is hurt by poison!"
  },
  paralysis: {
    skipTurnChance: 0.25,
    duration: 99, // Until healed
    message: "Cucumber is paralyzed and can't move!"
  },
  sleep: {
    skipTurnChance: 1.0,
    duration: 3,
    message: "Cucumber is fast asleep!"
  }
}
```

**Tasks:**
- [ ] Implement poison, paralysis, sleep, confusion
- [ ] Add status effect duration tracking
- [ ] Create status icons above fruit HP bars
- [ ] Add status-inflicting moves to move database

### 4.2 Move Database Expansion
```json
{
  "vine_whip": {
    "name": "Vine Whip",
    "type": "grass",
    "power": 25,
    "accuracy": 90,
    "pp": 15,
    "description": "Strikes with slender vines",
    "effects": []
  },
  "poison_powder": {
    "name": "Poison Powder",
    "type": "grass", 
    "power": 0,
    "accuracy": 85,
    "pp": 10,
    "description": "Inflicts poison status",
    "effects": [{"type": "poison", "chance": 100}]
  }
}
```

**Tasks:**
- [ ] Create comprehensive move database JSON file
- [ ] Add 20+ unique moves with varied effects
- [ ] Implement PP (Power Points) system
- [ ] Add move learning based on fruit level

### 4.3 Type Effectiveness Chart
```javascript
const typeChart = {
  grass: {
    superEffective: ['water', 'ground', 'rock'],
    notVeryEffective: ['fire', 'grass', 'poison', 'flying', 'bug'],
    noEffect: []
  },
  fire: {
    superEffective: ['grass', 'ice', 'bug'],
    notVeryEffective: ['fire', 'water', 'rock'],
    noEffect: []
  }
  // ... etc
}
```

**Tasks:**
- [ ] Implement complete type effectiveness chart
- [ ] Add 8 fruit types (grass, fire, water, electric, normal, poison, ice, ground)
- [ ] Create type matchup calculation system
- [ ] Add "No effect" scenarios (electric vs ground)

---

## Phase 5: Fruit Capture System (Week 5)

### 5.1 Capture Mechanics
```javascript
calculateCaptureRate(fruit, captureItem, currentHP, maxHP) {
  const baseRate = captureItem.baseRate // 0.15 for basic net
  const hpModifier = 1 - (currentHP / maxHP) // Lower HP = easier capture
  const levelModifier = 1 / (fruit.level * 0.1) // Higher level = harder
  
  return baseRate * hpModifier * levelModifier
}
```

**Tasks:**
- [ ] Implement capture probability calculation
- [ ] Create capture items (Fruit Net, Super Net, Master Net)
- [ ] Add capture attempt animations (net throwing)
- [ ] Create capture success/failure feedback

### 5.2 Items System Integration
```
Items Menu:
┌─────────────────────────────┐
│ > Fruit Net (x5)   Use      │
│   Berry Juice (x3) Use      │
│   Super Net (x1)   Use      │
│   Antidote (x2)    Use      │
└─────────────────────────────┘
```

**Tasks:**
- [ ] Create items database with healing/capture items
- [ ] Implement item usage in battle
- [ ] Add inventory management
- [ ] Create item effect animations

### 5.3 Team Management
```javascript
// When capture successful
addToTeam(capturedFruit) {
  if (this.team.length < 6) {
    this.team.push(capturedFruit)
  } else {
    this.sendToStorage(capturedFruit)
  }
}
```

**Tasks:**
- [ ] Implement 6-fruit team limit
- [ ] Create fruit storage system
- [ ] Add team switching interface
- [ ] Implement fruit nickname system

---

## Phase 6: Experience & Progression (Week 6)

### 6.1 EXP and Leveling System
```javascript
calculateEXP(defeatedFruit, isWild) {
  const baseEXP = defeatedFruit.baseEXP || 50
  const levelBonus = defeatedFruit.level * 10
  const wildMultiplier = isWild ? 1.0 : 1.5 // Trainer battles give more EXP
  
  return Math.floor((baseEXP + levelBonus) * wildMultiplier)
}

checkLevelUp(fruit) {
  const expNeeded = Math.pow(fruit.level + 1, 3) // Cubic growth
  return fruit.totalEXP >= expNeeded
}
```

**Tasks:**
- [ ] Implement EXP gain calculation
- [ ] Create level-up stat increases
- [ ] Add level-up celebration animation
- [ ] Create EXP bar in battle UI

### 6.2 Move Learning
```javascript
// Fruits learn new moves at specific levels
const moveLearnSets = {
  cucumber: {
    1: ['tackle'],
    3: ['vine_whip'], 
    7: ['growth'],
    12: ['synthesis'],
    18: ['power_whip']
  }
}
```

**Tasks:**
- [ ] Create level-based move learning system
- [ ] Add "Fruit wants to learn new move" dialogue
- [ ] Implement move replacement interface (4 move limit)
- [ ] Add forgotten move recovery system

### 6.3 Evolution System (Optional)
```javascript
// Some fruits can evolve at certain levels
const evolutionData = {
  apple: {
    evolvesTo: 'golden_apple',
    level: 16,
    method: 'level'
  },
  berry: {
    evolvesTo: 'super_berry',
    level: 20,
    method: 'level'
  }
}
```

**Tasks:**
- [ ] Design evolution chains for fruits
- [ ] Create evolution animation sequence
- [ ] Add evolution confirmation choice
- [ ] Update sprite/emoji for evolved forms

---

## Phase 7: Trainer Battles (Week 7)

### 7.1 Trainer AI Enhancement
```javascript
class TrainerAI extends EnemyAI {
  constructor(trainer) {
    this.strategy = trainer.strategy // aggressive, defensive, balanced
    this.team = trainer.team
    this.currentFruit = 0
  }
  
  selectAction(battle) {
    // Consider type effectiveness
    // Switch fruits when disadvantaged
    // Use items strategically
    // Plan multi-turn strategies
  }
}
```

**Tasks:**
- [ ] Create advanced trainer AI
- [ ] Implement team switching logic
- [ ] Add strategic item usage
- [ ] Create trainer personality types

### 7.2 Trainer Data System
```json
{
  "cucumber_trainer_1": {
    "name": "Veggie Master Bob",
    "sprite": "trainer_bob",
    "team": [
      {
        "species": "apple",
        "level": 5,
        "moves": ["tackle", "apple_toss"],
        "nature": "bold"
      },
      {
        "species": "orange", 
        "level": 4,
        "moves": ["tackle", "citrus_blast"],
        "nature": "timid"
      }
    ],
    "dialogue": {
      "pre_battle": "I challenge you to a fruit battle!",
      "victory": "Your fruits are strong!",
      "defeat": "I need to train more..."
    }
  }
}
```

**Tasks:**
- [ ] Create trainer database
- [ ] Add pre/post battle dialogue
- [ ] Implement trainer sprites/avatars
- [ ] Create victory rewards (money, items)

---

## Phase 8: Polish & Balance (Week 8)

### 8.1 Battle Balance Testing
```javascript
// Automated battle simulation for balance testing
function simulateBattle(fruit1, fruit2, iterations = 1000) {
  let wins = 0
  for (let i = 0; i < iterations; i++) {
    const result = runBattleSimulation(fruit1, fruit2)
    if (result.winner === fruit1) wins++
  }
  return wins / iterations // Win rate
}
```

**Tasks:**
- [ ] Create battle simulation tools
- [ ] Balance fruit stats and move power
- [ ] Test type effectiveness balance
- [ ] Adjust encounter rates and difficulty curves

### 8.2 Audio Integration
```javascript
const battleSounds = {
  encounter: 'wild_encounter.mp3',
  attack_hit: 'attack_normal.wav',
  super_effective: 'super_effective.wav',
  critical_hit: 'critical.wav',
  level_up: 'level_up.mp3',
  victory: 'battle_won.mp3',
  defeat: 'battle_lost.mp3'
}
```

**Tasks:**
- [ ] Add battle music and sound effects
- [ ] Create type-specific attack sounds
- [ ] Add ambient battle environment sounds
- [ ] Implement volume controls

### 8.3 Visual Polish
**Tasks:**
- [ ] Add battle background variations (forest, cave, water)
- [ ] Create weather effects (rain, sun, snow)
- [ ] Polish HP bar animations
- [ ] Add battle camera shake effects
- [ ] Create smooth transition animations

---

## Implementation Timeline

| Week | Focus | Deliverable |
|------|-------|-------------|
| 1 | Interactive Menu | Working battle menu navigation |
| 2 | Combat Engine | Turn-based combat with all 4 actions |
| 3 | Animation & Feedback | Smooth battle animations and messages |
| 4 | Advanced Features | Status effects and expanded moves |
| 5 | Capture System | Working fruit capture mechanics |
| 6 | Progression | EXP, leveling, and move learning |
| 7 | Trainer Battles | AI opponents with teams |
| 8 | Polish | Balanced, polished battle system |

## Success Metrics

✅ **Minimum Viable Battle System:**
- Interactive 4-option menu (Attack/Defend/Items/Run)
- Turn-based combat with damage calculation
- Type effectiveness (3-4 types minimum)
- Basic EXP and leveling
- Wild fruit capture

🎯 **Complete Battle System:**
- All 8 phases implemented
- 20+ unique moves with varied effects
- Status effects and advanced mechanics
- Trainer battles with strategic AI
- Balanced and polished gameplay

## File Structure
```
@cucumber-world/game/
├── battle-engine.js        # Core turn-based combat logic
├── battle-input.js         # Menu navigation and input
├── battle-ui.js           # Battle interface rendering
├── battle-animations.js   # Visual effects and animations
├── enemy-ai.js            # AI behavior patterns
├── move-processor.js      # Move execution and effects
├── status-effects.js      # Status condition system
├── capture-system.js      # Fruit capture mechanics
├── exp-system.js          # Experience and leveling
└── trainer-ai.js          # Advanced trainer battle AI

@cucumber-world/data/
├── moves.json             # Complete move database
├── fruits.json            # Fruit stats and evolution data
├── trainers.json          # Trainer teams and dialogue
├── items.json             # Battle items and effects
└── types.json             # Type effectiveness chart
```

This plan transforms the current battle starter into a complete Pokemon-style combat system with all the depth and strategic elements players expect!