# 🌳 TypeSprout

> *Growing skills, one keystroke at a time* 🌱⌨️

A comprehensive pixel-art typing game that combines competitive typing races with tree collecting, forest management, and educational content. Master your typing skills while building your own virtual forest ecosystem!

![Version](https://img.shields.io/badge/version-1.0.0-green.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Platform](https://img.shields.io/badge/platform-web-blue.svg)

## 🎮 Game Overview

TypeSprout transforms traditional typing practice into an engaging multi-game experience featuring:

- **🏁 Competitive Typing Races** - Race against AI opponents with real-time WPM tracking
- **🌲 Forest Management** - Plant and grow trees in your personal isometric forest
- **📚 TreeDex Collection** - Discover and unlock 16 unique tree species with rich lore
- **🎵 Immersive Audio** - Dynamic music system with crossfading and spatial sound effects
- **🖼️ Pixel-Perfect Art** - Authentic retro aesthetic with smooth animations

## ✨ Core Features

### 🏁 Typing Race System
- **Multi-Difficulty Racing**: Easy, Intermediate, Hard, and Hidden "Impossible" mode
- **Real-Time Competition**: Race against 3 AI opponents with dynamic WPM calculations
- **Live Performance Tracking**: WPM, accuracy, and placement statistics
- **Visual Tree Growth**: Watch your tree evolve as you type faster and more accurately
- **Seed Rewards**: Earn different seed types based on your performance

### 🌲 Forest Simulation
- **Isometric Grid System**: Plant trees in a beautiful 3D-perspective environment  
- **Growth Mechanics**: Trees progress through seed → sprout → mature stages over time
- **Species Diversity**: 16 different tree types with unique appearances and growth patterns
- **Inventory Management**: Collect and manage different seed types
- **Save System**: Persistent forest state with automatic saving

### 📚 TreeDex Encyclopedia
- **16 Unique Species**: From common Oak to legendary Yggdrasil
- **Educational Content**: Scientific names, native ranges, and detailed descriptions
- **Rarity System**: Common, Rare, Goated, and Hidden classification
- **Progress Tracking**: Trees unlock as you grow them in your forest
- **Rich Lore**: Each species features unique backstories and cultural significance

### 🎵 Advanced Audio System
- **Dynamic Music**: Automatic track switching between menu and gameplay
- **2-Second Crossfading**: Smooth transitions between different sections
- **Universal SFX**: Button sounds and interaction feedback
- **Volume Controls**: Separate sliders for master, music, and SFX
- **Persistent Settings**: Audio preferences saved across sessions

## 🌟 Tree Species Collection

Discover 16 meticulously researched tree species, each with unique characteristics:

### Common Trees (1-7)
- **Oak, Birch, Spruce, Cedar, Willow, Maple, Acacia**

### Rare Trees (8-14)  
- **Silk Floss** - Thorny trunk with beautiful blossoms
- **Ghost Gum** - Glowing white bark from Australian Dreamtime
- **Socotra Dragon** - Alien umbrella shape that bleeds red resin
- **Ginkgo** - Living fossil that survived the atomic bomb
- **Monkey Puzzle** - Prehistoric Chilean sacred tree
- **Rainbow Eucalyptus** - Natural rainbow-colored bark
- **Baobab** - Ancient water-storing giants

### Legendary Trees (15-16)
- **Fertility Tree** - Campus legend from University of the Philippines
- **Yggdrasil** - Norse mythological world tree

## 🎯 Gameplay Flow

1. **Start Racing** → Choose difficulty and compete in typing challenges
2. **Earn Seeds** → Better performance yields rarer seed rewards  
3. **Plant Forest** → Use seeds to grow your personal tree collection
4. **Unlock TreeDex** → Mature trees reveal detailed species information
5. **Collect All** → Discover all 16 species and complete your encyclopedia

## 🛠️ Technical Architecture

### Single-Page Application (SPA)
- **Seamless Navigation**: Smooth transitions between game modes
- **View Management**: Opening cutscene → Main menu → Game sections
- **Modular Design**: Clean separation between gameplay systems

### File Structure
```
TypeSprout/
├── 🎬 Main Menu/           # SPA hub with video cutscenes
│   ├── index.html          # Main application entry point
│   ├── script.js           # Navigation and view management
│   └── *.css              # Modular styling system
├── 🏁 Main Game/           # Typing race engine  
│   ├── script.js           # Race logic and AI opponents
│   └── Assets/             # Game sprites and images
├── 🌲 Forest/              # Isometric farming simulation
│   ├── script.js           # Plant system and save management
│   └── assets/             # Tree sprites and environment
├── 📚 TreeDex/             # Species encyclopedia
│   ├── script.js           # Collection tracking and species data
│   └── assets/             # TreeDex UI and tree images
├── 🎵 audio/               # Comprehensive audio system
│   ├── AudioManager.js     # Singleton audio coordination
│   ├── MusicManager.js     # Background music with crossfading
│   ├── SFXManager.js       # Button sounds and effects
│   └── SettingsManager.js  # Audio settings integration
└── 📁 assets/              # Shared sprites and resources
    ├── sprites/seeds/      # Seed collection graphics
    ├── sprites/sprouts/    # Growth stage sprites  
    └── sprites/trees/      # Mature tree artwork
```

## 🚀 Quick Start

### Installation
```bash
# Clone the repository
git clone https://github.com/yourusername/typesprout.git
cd typesprout

# Launch with local server (recommended)
python -m http.server 8000
# or
npx serve .

# Open in browser
open http://localhost:8000
```

### Direct Launch
Simply open [`index.html`](index.html) in any modern web browser!

### Audio Setup
Place these files in the [`SFX/`](SFX/) directory:
- `Title _ScreenMusic.mp3` - Main menu background music
- `BattleMusic.mp3` - Gameplay background music
- `Button Sound Effect.mp3` - UI interaction sounds

## 🎮 Controls & Accessibility

### Keyboard Navigation
- **Arrow Keys**: Navigate menu options
- **Enter/Space**: Select menu items and confirm actions
- **Escape**: Return to previous screen or pause
- **Tab**: Cycle through interactive elements

### Audio Shortcuts
- **Ctrl/Cmd + M**: Toggle audio on/off
- **Ctrl/Cmd + Plus/Minus**: Adjust master volume

### Accessibility Features
- Complete keyboard navigation support
- Visual focus indicators for all interactive elements  
- Screen reader compatible semantic markup
- High contrast pixel-art design for clarity

## 🎨 Art & Design Philosophy

### Pixel-Perfect Aesthetic
- **Native Resolution**: 320×180 base resolution with crisp scaling
- **Authentic Retro Style**: Press Start 2P font and classic gaming colors
- **Consistent Art Direction**: Unified color palette across all assets

### Visual Design
- **Isometric Perspective**: Beautiful 3D-style forest environments
- **Sprite Animations**: Smooth tree growth and UI transitions  
- **Video Backgrounds**: Atmospheric cutscenes with graceful fallbacks

## 🔧 Development

### Code Standards
- **Vanilla JavaScript**: No frameworks, maximum compatibility
- **Modular CSS**: BEM methodology with organized stylesheets
- **Semantic HTML**: Accessibility-first markup structure
- **Progressive Enhancement**: Graceful degradation for all features

### Browser Compatibility
- ✅ **Chrome/Edge**: Full feature support
- ✅ **Firefox**: Complete compatibility  
- ✅ **Safari**: WebM video fallback to MP4
- ✅ **Mobile**: Touch-friendly responsive design

## 🏆 Performance & Progression

### Typing Metrics
- **Words Per Minute (WPM)**: Real-time calculation during races
- **Accuracy Tracking**: Error detection and correction feedback
- **Placement Rankings**: 1st-4th place competitive results
- **Progressive Difficulty**: Adaptive challenge scaling

### Reward System
- **Common Seeds**: Consistent rewards for steady performance
- **Rare Seeds**: Earned through exceptional typing speed/accuracy  
- **Goated Seeds**: Reserved for mastery-level achievements
- **Hidden Seeds**: Secret unlock conditions for legendary trees

## 📊 Save System

### Persistent Data
- **Forest State**: Tree positions, growth stages, and planting timestamps
- **TreeDex Progress**: Species unlock status and collection tracking
- **Audio Settings**: Volume preferences and toggle states
- **Cross-Tab Sync**: Settings synchronized across browser tabs

### Storage Format
Uses [`localStorage`](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage) with structured JSON for reliable data persistence.

## 🌍 Educational Value

### Learning Outcomes
- **Typing Proficiency**: Measurable improvement in speed and accuracy
- **Botanical Knowledge**: Real scientific information about tree species
- **Cultural Awareness**: Tree significance across different cultures
- **Environmental Appreciation**: Understanding of global forest diversity

### Research-Based Content
Each tree species features:
- Accurate scientific nomenclature
- Authentic native range information  
- Cultural and historical significance
- Ecological importance and conservation status

## 🤝 Contributing

We welcome contributions in these areas:

### 🎮 Gameplay Enhancement
- New typing challenges and game modes
- Additional tree species and biomes
- Enhanced AI opponent behaviors
- Achievement and progression systems

### 🎨 Art & Design
- Additional tree species artwork
- Environmental backgrounds and biomes
- UI improvements and animations
- Accessibility enhancements

### 🔧 Technical Improvements
- Performance optimizations
- Cross-browser compatibility fixes  
- Mobile responsiveness enhancements
- Code refactoring and documentation

### Development Setup
```bash
# Fork and clone your fork
git clone https://github.com/yourusername/typesprout.git
cd typesprout

# Create feature branch
git checkout -b feature/amazing-enhancement

# Test your changes locally  
python -m http.server 8000

# Submit pull request with:
# - Clear description of changes
# - Screenshots/videos of new features
# - Browser compatibility testing results
```

## 📈 Roadmap

### Phase 1: Polish & Performance
- [ ] Mobile touch controls optimization
- [ ] Advanced typing statistics and analytics  
- [ ] Custom typing lesson creation tools
- [ ] Enhanced error feedback and correction

### Phase 2: Content Expansion  
- [ ] Additional forest biomes (Desert, Rainforest, Tundra)
- [ ] Seasonal tree variations and environmental effects
- [ ] More tree species with regional focus
- [ ] Multiplayer typing race implementation

### Phase 3: Advanced Features
- [ ] User account system with cloud save
- [ ] Global leaderboards and tournaments
- [ ] Custom forest sharing and community features
- [ ] Advanced audio system with 3D spatial effects

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

### Educational Institutions
- **University of the Philippines Los Baños** - Inspiration for the Fertility Tree legend

### Cultural Sources
- **Norse Mythology** - Yggdrasil world tree concept
- **Aboriginal Dreamtime** - Ghost Gum spiritual significance  
- **Global Forest Conservation** - Species information and awareness

### Technical Inspiration
- **Classic Typing Games** - Mario Teaches Typing, Mavis Beacon
- **Pixel Art Games** - Stardew Valley, Hyper Light Drifter
- **Educational Gaming** - Making learning engaging and memorable

### Creative Credits

- **Minecraft** - Audio assets inspired and credited to Mojang's Minecraft as part of the immersive sound design
- **Jump King** - Visual art style inspiration drawn from Jump King's distinctive pixel art aesthetic

### Open Source Community
- **Web Standards** - HTML5, CSS3, and JavaScript best practices
- **Accessibility Guidelines** - WCAG compliance and inclusive design
- **Browser Developers** - Cross-platform compatibility and modern APIs

---

**TypeSprout** - Where every keystroke grows your digital forest and expands your knowledge of the natural world. Start your typing journey today and discover the wonder of trees from around the globe! 🌳✨

*Built with ❤️ using vanilla web technologies for maximum compatibility and performance.*
