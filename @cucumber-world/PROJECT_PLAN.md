# Cucumber World RPG - Project Documentation

## 🎮 Project Overview
A Pokemon-like RPG game where Felix the cucumber explores different worlds, catches fruits as companions, and battles other cucumbers. The game features multiple save slots, turn-based combat, and progression through different worlds.

## 🏗️ Architecture & File Structure

```
@cucumber-world/
├── PROJECT_PLAN.md (this file)
├── fruits/ (JSON data files for all fruit types)
│   ├── apple.json
│   ├── banana.json
│   ├── orange.json
│   ├── grape.json
│   ├── strawberry.json
│   └── ...
├── game/ (Core game modules)
│   ├── cucumber-world.js (main game engine)
│   ├── battle-system.js (turn-based combat)
│   ├── world-explorer.js (area navigation)
│   ├── save-manager.js (localStorage save system)
│   ├── fruit-loader.js (JSON data loading)
│   └── inventory.js (fruit management)
├── worlds/ (World/area definitions)
│   ├── garden.json (starter area)
│   ├── forest.json (second area)
│   ├── desert.json (advanced area)
│   └── mountain.json (end-game area)
└── cucumber-world.css (game styling)
```

## 📊 Data Structures

### Fruit JSON Schema
```json
{
  "id": "apple_001",
  "name": "Apple",
  "type": "grass",
  "description": "A crisp, healthy fruit with natural healing properties",
  "rarity": "common",
  "baseStats": {
    "health": 45,
    "attack": 15,
    "defense": 12,
    "speed": 8,
    "special": 10
  },
  "attacks": [
    {
      "id": "apple_toss",
      "name": "Apple Toss",
      "damage": 20,
      "accuracy": 90,
      "type": "normal",
      "description": "Throws a fresh apple at the opponent"
    }
  ],
  "habitat": ["garden", "forest"],
  "evolutionLevel": null,
  "evolvesTo": null
}
```

### World JSON Schema
```json
{
  "id": "garden",
  "name": "Peaceful Garden",
  "description": "A serene garden where common fruits grow",
  "unlockRequirement": null,
  "areas": [
    {
      "name": "Vegetable Patch",
      "fruits": ["apple", "carrot", "lettuce"],
      "encounterRate": 0.3
    }
  ],
  "wildCucumbers": [
    {
      "name": "Garden Cucumber",
      "level": [1, 3],
      "fruits": ["apple", "lettuce"],
      "encounterRate": 0.1
    }
  ]
}
```

### Save Data Schema
```json
{
  "playerName": "Player",
  "currentWorld": "garden",
  "unlockedWorlds": ["garden"],
  "inventory": [
    {
      "fruitId": "apple_001",
      "level": 5,
      "experience": 120,
      "currentStats": {...},
      "learnedAttacks": [...],
      "nickname": "Crunchy"
    }
  ],
  "team": ["fruit_uuid_1", "fruit_uuid_2"],
  "gameProgress": {
    "battlesWon": 15,
    "fruitsCollected": 8,
    "explorationProgress": {...}
  },
  "lastSaved": "2024-01-01T12:00:00Z"
}
```

## 🎯 Core Systems

### 1. Save Manager (save-manager.js)
- Multiple save slots (3-5 slots)
- localStorage integration
- Save/load game progress
- Backup and restore functionality

### 2. World Explorer (world-explorer.js)
- Different worlds/areas to explore
- Random fruit encounters
- Movement system
- Area progression/unlocking

### 3. Battle System (battle-system.js)
- Turn-based combat
- Fruit vs fruit battles
- Attack/defense calculations
- Experience and leveling
- Type effectiveness system

### 4. Fruit Loader (fruit-loader.js)
- Load fruit data from JSON files
- Fruit factory/creation
- Stats calculation and management
- Dynamic fruit generation

### 5. Inventory System (inventory.js)
- Manage collected fruits
- Fruit storage and organization
- Team selection for battles
- Fruit evolution system

## 🔄 Game Flow

1. **Main Menu** - Select save slot or new game
2. **World Map** - Choose which world to explore
3. **Exploration** - Move around, find fruits, encounter wild cucumbers
4. **Battle** - Turn-based combat when encountering opponents
5. **Collection** - Catch defeated/found fruits
6. **Inventory** - Manage fruits, form battle teams
7. **Progress** - Unlock new worlds, level up fruits

## 📋 TODO List Status

### ✅ Completed
- [x] Plan game architecture and file structure
- [x] Create @cucumber-world directory structure
- [x] Document project plan and progress
- [x] Create sample fruit JSON files (apple, banana, orange)
- [x] Create world JSON files (garden, forest)
- [x] Build fruit-loader.js for JSON data loading
- [x] Implement save-manager.js with localStorage

### 🚧 In Progress
- [ ] Create main cucumber-world.js game engine

### 📝 Pending - Medium Priority
- [ ] Build world-explorer.js for area navigation
- [ ] Implement battle-system.js for turn-based combat
- [ ] Create inventory.js for fruit management

### 📝 Pending - Low Priority
- [ ] Design cucumber-world.css styling
- [ ] Add RPG section to main index.html

## 🎨 UI Integration

The RPG will be integrated into the main Felix cucumber website as a new section below the dinosaur game with:
- "Cucumber World RPG" title section
- "New Game" and "Load Game" buttons
- Canvas-based game interface
- Separate CSS to avoid conflicts with existing styling

## 🔧 Technical Requirements

- **Browser Storage**: localStorage for save games
- **File Loading**: Fetch API for JSON data
- **Game Engine**: Canvas-based rendering
- **State Management**: Modular JavaScript classes
- **Data Format**: JSON for easy modification and expansion

## 📝 Development Notes

- Keep all RPG files separate from existing dinosaur game
- Use modular architecture for easy maintenance
- Design JSON schemas for easy content expansion
- Implement proper error handling for save/load operations
- Consider mobile responsiveness for UI elements

---

*Last Updated: 2025-01-10*
*Status: Initial Development Phase*