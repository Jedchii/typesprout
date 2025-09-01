# TypeSprout Audio System

A comprehensive audio management system for the TypeSprout game featuring singleton architecture, crossfading music transitions, universal button sound detection, and persistent settings management.

## 🎵 System Overview

The audio system consists of four core components:

### 1. AudioManager.js - Core Singleton
- **Purpose**: Central audio management and coordination
- **Features**:
  - Singleton pattern for cross-section audio management
  - Automatic section detection (title_screen vs battle)
  - localStorage-based state persistence
  - Error handling for missing audio files
  - Browser compatibility layer

### 2. MusicManager.js - Background Music
- **Purpose**: Handles background music with smooth transitions
- **Features**:
  - Loads `Title_ScreenMusic.mp3` and `BattleMusic.mp3` from `../SFX/`
  - 2-second crossfade transitions between tracks
  - Track continuation for same-music section transitions
  - Volume control integration
  - Loop management and error recovery

### 3. SFXManager.js - Sound Effects
- **Purpose**: Manages button clicks and UI sounds
- **Features**:
  - Loads `Button Sound Effect.mp3` from `../SFX/`
  - Universal button click detection for multiple selectors
  - Sound pooling for overlapping effects
  - Volume control from settings
  - Customizable button selectors

### 4. SettingsManager.js - Settings Integration
- **Purpose**: Connects audio system to UI controls
- **Features**:
  - Integration with existing settings UI
  - Real-time volume adjustments
  - Master audio toggle functionality
  - Dynamic volume controls creation
  - Keyboard shortcuts support

## 🚀 Quick Start

### Basic Integration

```html
<!-- Include all audio system files -->
<script src="audio/AudioManager.js"></script>
<script src="audio/MusicManager.js"></script>
<script src="audio/SFXManager.js"></script>
<script src="audio/SettingsManager.js"></script>
<script src="audio/init.js"></script>
```

### Manual Initialization

```javascript
// Initialize the audio system
const audioManager = AudioManager.getInstance();
await audioManager.initialize();

// The system is now ready to use
window.TypeSproutAudio = audioManager;
```

## 🎮 Usage Examples

### Section Transitions
```javascript
// Transition to battle music
audioManager.handleSectionChange('battle');

// Transition to title screen music
audioManager.handleSectionChange('title_screen');
```

### Volume Control
```javascript
// Set master volume (0.0 - 1.0)
audioManager.setMasterVolume(0.8);

// Set music volume
audioManager.setMusicVolume(0.6);

// Set SFX volume
audioManager.setSFXVolume(0.9);

// Toggle audio on/off
audioManager.toggleAudio();
```

### Manual Sound Effects
```javascript
// Play button sound manually
audioManager.playButtonSound();

// Add custom button selector
audioManager.sfxManager.addButtonSelector('.my-custom-button');
```

## 📁 File Structure

```
audio/
├── AudioManager.js      # Core singleton manager
├── MusicManager.js      # Background music with crossfading
├── SFXManager.js        # Button sounds and effects
├── SettingsManager.js   # Settings integration
├── init.js             # Initialization script
├── test.html           # Comprehensive test page
└── README.md           # This documentation
```

## 🎛️ Configuration Options

### Button Selectors (SFXManager)
The system automatically detects clicks on:
- `.menu-button`, `.page-button`
- `button`, `.btn`, `.button`
- `[role="button"]`
- `input[type="button"]`, `input[type="submit"]`
- `.clickable`, `.nav-link`, `.tab-button`
- Elements with `cursor: pointer` style

### Volume Ranges
- All volumes accept values from 0.0 (silent) to 1.0 (maximum)
- Master volume affects all audio output
- Individual volume controls for music and SFX

### Section Detection
Automatic section detection based on:
- URL patterns (mainmenu, game, treedex, etc.)
- DOM elements (`.main-menu`, `.game-container`)
- Fallback to title_screen if uncertain

## 🧪 Testing

### Test Page
Open `audio/test.html` in your browser for comprehensive testing:
- Volume controls with real-time feedback
- Music section transitions
- Button sound testing
- System status monitoring
- Console log display
- Stress testing capabilities

### Manual Testing Functions
```javascript
// Available in browser console when init.js is loaded
AudioTestUtils.testSectionTransition('battle');
AudioTestUtils.testVolumeControl('music', 0.5);
AudioTestUtils.testButtonSound();
AudioTestUtils.testToggleAudio();
AudioTestUtils.showState();
```

### Keyboard Shortcuts
- **Ctrl/Cmd + M**: Toggle audio
- **Ctrl/Cmd + Plus**: Increase master volume
- **Ctrl/Cmd + Minus**: Decrease master volume
- **Ctrl + Shift + A**: Show debug info

## 🔧 Integration with Existing Pages

### Main Menu Integration
```html
<!-- In mainmenu.html -->
<script src="audio/AudioManager.js"></script>
<script src="audio/MusicManager.js"></script>
<script src="audio/SFXManager.js"></script>
<script src="audio/SettingsManager.js"></script>
<script src="audio/init.js"></script>
```

### Settings Page Enhancement
The SettingsManager automatically enhances the existing settings page:
- Updates static "🔊 Audio: ON/OFF" display
- Can create dynamic volume controls
- Integrates with existing toggle buttons

### Game Pages
```javascript
// For pages that need specific section music
document.addEventListener('DOMContentLoaded', async () => {
    const audioManager = AudioManager.getInstance();
    await audioManager.initialize();
    
    // Force specific section if auto-detection fails
    audioManager.handleSectionChange('battle');
});
```

## 🎵 Audio Files Required

Place these files in the `SFX/` directory:
- `Title _ScreenMusic.mp3` - Main menu background music
- `BattleMusic.mp3` - Game/battle background music  
- `Button Sound Effect.mp3` - UI button click sound

## 🔍 Troubleshooting

### Common Issues

1. **Audio not playing**
   - Check browser autoplay policies (requires user interaction)
   - Verify audio files exist in `../SFX/` directory
   - Check console for error messages

2. **Button sounds not working**
   - Ensure buttons have recognizable classes/selectors
   - Check if SFX volume is set to 0
   - Verify audio system is initialized

3. **Music transitions not smooth**
   - Check if both music files loaded successfully
   - Ensure sufficient browser performance
   - Verify crossfade duration settings

### Debug Information
```javascript
// Check system status
const audioManager = window.TypeSproutAudio;
console.log('System initialized:', audioManager.isInitialized);
console.log('Current section:', audioManager.currentSection);
console.log('Volumes:', audioManager.getVolumes());

// Check individual managers
if (audioManager.musicManager) {
    console.log('Music info:', audioManager.musicManager.getCurrentInfo());
}

if (audioManager.sfxManager) {
    console.log('SFX info:', audioManager.sfxManager.getCurrentInfo());
}
```

## 📈 Performance Considerations

- **Audio Pooling**: SFX uses a pool of 5 audio elements for overlapping sounds
- **Preloading**: All audio files are preloaded on initialization
- **Memory Management**: Proper cleanup and disposal methods implemented
- **Error Handling**: Graceful fallbacks for missing audio files
- **Browser Compatibility**: Works with modern browsers supporting Web Audio API

## 🔮 Future Enhancements

- **Additional Sound Effects**: Support for more game sounds (collecting, achievements, etc.)
- **Audio Ducking**: Automatic volume reduction during important events
- **Spatial Audio**: 3D audio positioning for immersive experience
- **Dynamic Music**: Adaptive music based on game state
- **Audio Compression**: Optimized audio files for faster loading

## 📝 API Reference

### AudioManager Methods
- `getInstance()` - Get singleton instance
- `initialize()` - Initialize the system
- `handleSectionChange(section)` - Change music section
- `setMasterVolume(volume)` - Set master volume (0.0-1.0)
- `setMusicVolume(volume)` - Set music volume (0.0-1.0)
- `setSFXVolume(volume)` - Set SFX volume (0.0-1.0)
- `toggleAudio(enabled?)` - Toggle audio on/off
- `playButtonSound()` - Play button sound manually
- `getVolumes()` - Get current volume settings
- `dispose()` - Cleanup resources

### Events
- Storage events for cross-tab synchronization
- Automatic section detection on navigation
- Universal button click detection
- Keyboard shortcut handling

## 👥 Contributing

When extending the audio system:
1. Follow the existing singleton pattern
2. Implement proper error handling
3. Add cleanup methods for memory management
4. Update the test page with new features
5. Document any new configuration options

## 📄 License

Part of the TypeSprout game project.