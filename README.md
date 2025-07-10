# 🥒 Felix Gurka Website

A delightful website featuring Felix the cucumber with two exciting games:
1. **Dinosaur-style jumping game** - Jump over peaches!
2. **Cucumber World RPG** - A Pokemon-inspired adventure game

## 🚀 Quick Start

### Using Nix Flake (Recommended)

```bash
# Enter development environment
nix develop

# Start development server with live reload
npm run dev

# Or use other server options
serve .              # Simple static server
live-server          # Live-reload server
http-server . -p 8000 -o  # Basic HTTP server
```

### Using Node.js directly

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

## 🎮 Features

### Main Website
- Felix cucumber presentation
- Responsive design
- Swedish language content
- Beautiful animations and effects

### Dinosaur Game
- Click the bouncing cucumber to start
- Jump over peach obstacles
- Progressive difficulty
- High score tracking

### Cucumber World RPG
- Pokemon-like adventure game
- Explore multiple worlds (Garden, Forest)
- Collect fruit companions (Apple, Banana, Orange)
- Turn-based battle system (coming soon)
- Save/load progress with multiple slots
- WASD movement controls

## 🛠️ Development

### Available Scripts

- `npm run dev` - Start live-reload development server
- `npm run serve` - Simple static server
- `npm start` - HTTP server with auto-open
- `npm run preview` - Preview on port 8080

### File Structure

```
├── index.html              # Main website
├── style.css              # Main styling
├── game.js                # Dinosaur jumping game
├── @cucumber-world/       # RPG game directory
│   ├── PROJECT_PLAN.md    # Development documentation
│   ├── cucumber-world.css # RPG styling
│   ├── rpg-init.js       # Website integration
│   ├── fruits/           # Fruit data (JSON)
│   ├── worlds/           # World data (JSON)
│   └── game/             # Core game modules
├── flake.nix             # Nix development environment
└── package.json          # Node.js configuration
```

## 🌐 Deployment

The website is deployed at: https://gurka.flixen.se

### GitHub Pages Setup
- Uses CNAME file for custom domain
- Cloudflare DNS for `gurka.flixen.se` subdomain
- Automatic deployment on push to main branch

## 🎯 RPG Game Features

### Current Features
- ✅ World exploration with WASD controls
- ✅ Random fruit encounters
- ✅ Multiple save slots with localStorage
- ✅ Professional game UI with canvas rendering
- ✅ Responsive design for mobile/desktop

### Coming Soon
- ⏳ Turn-based battle system
- ⏳ Fruit inventory management
- ⏳ More worlds and areas
- ⏳ Fruit evolution system
- ⏳ Achievement system

## 🔧 Technical Details

### Technologies Used
- **Frontend**: Vanilla HTML/CSS/JavaScript
- **Game Engine**: Canvas 2D rendering
- **Data Storage**: localStorage for save games
- **Development**: Node.js development servers
- **Package Manager**: npm
- **Environment**: Nix flake for reproducible development

### Browser Support
- Modern browsers with ES6+ support
- Canvas 2D API support required for games
- localStorage required for save functionality

## 📱 Mobile Support

Both games are optimized for mobile devices:
- Touch controls for movement
- Responsive layouts
- Mobile-friendly UI elements

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally using `nix develop` and `npm run dev`
5. Submit a pull request

## 📄 License

MIT License - see the code for details.

---

*Made with 💚 for Felix the cucumber* 🥒