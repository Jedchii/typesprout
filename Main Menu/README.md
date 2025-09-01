# Tree Typing - Video Background Implementation

A pixel-art typing game with an animated video background cutscene and main menu system.

## 🎬 Video Background Setup

### Required Video Files

Place the following video files in the `/video/` directory:

```
video/
├── background.webm    # Primary format (modern browsers)
└── background.mp4     # Fallback format (universal support)
```

### Video Specifications

**Resolution**: 320×180 pixels (native game resolution)
**Frame Rate**: 15-24 FPS (pixel-art aesthetic)
**Duration**: 5-15 seconds (seamless loop)
**Codec**: 
- WebM: VP9 codec recommended
- MP4: H.264 codec for compatibility

### Video Content Requirements

The video should include:
- **Tree swaying animation** (gentle wind effect)
- **Grass rippling** (subtle ground movement) 
- **Cloud drifting** (slow atmospheric motion)
- **Ambient lighting** (subtle color shifts)
- **Seamless loop** (first and last frames should match)

### Export Settings

**For Pixel-Perfect Rendering:**
- No anti-aliasing or smoothing
- Nearest-neighbor scaling only
- Export at native 320×180 resolution
- Use limited color palette for authentic pixel-art look

## 🎨 Pixel-Art Guidelines

### Video Creation Process

1. **Create/animate at 320×180 base resolution**
2. **Use indexed color mode** (8-bit palette)
3. **Avoid gradients** - use dithering instead  
4. **Test loop points** - ensure seamless transitions
5. **Export without compression artifacts**

### Color Palette

Based on existing assets:
- Sky: `#5d94f1` to `#4a7bc8` (gradient)
- Grass/Tree: Various greens (`#6a9628`, etc.)
- Clouds: White with subtle shadows
- Sunlight: Warm yellows/whites

## 🔧 Browser Compatibility

### Autoplay Support

The implementation includes fallback handling:
- **Video loads successfully**: Animated background plays
- **Video fails/blocked**: Static `background.png` displays
- **Autoplay prevented**: Graceful degradation to static image

### Tested Browsers

- ✅ Chrome/Edge (full video support)
- ✅ Firefox (full video support) 
- ✅ Safari (WebM may need MP4 fallback)
- ✅ Mobile browsers (touch-friendly navigation)

## 📁 Project Structure

```
Tree-Typing/
├── index.html          # Opening cutscene
├── mainmenu.html       # Main menu screen
├── style.css           # Core game styling
├── mainmenu.css        # Menu-specific styles
├── script.js           # Cutscene logic
├── mainmenu.js         # Menu navigation
├── video/              # Video assets folder
│   ├── background.webm
│   └── background.mp4
├── image/              # Static image assets
│   ├── background.png  # Fallback background
│   ├── tree.png
│   ├── cloud.png
│   └── seed.png
└── [game pages]        # Additional game screens
    ├── game.html
    ├── forest.html
    ├── treedex.html
    └── settings.html
```

## 🚀 Development Workflow

### Testing Video Implementation

1. **Without video files**: Test fallback system
2. **With video files**: Test autoplay and looping
3. **Network throttling**: Test loading performance
4. **Multiple browsers**: Verify compatibility

### Performance Optimization

- **Preload video**: Uses `preload="auto"` for instant playback
- **Compressed formats**: WebM for smaller file sizes
- **Progressive loading**: Menu prefetching for smooth transitions
- **Graceful degradation**: Static fallback always available

## 🎮 User Experience

### Navigation Flow

1. **Opening Cutscene** (`index.html`)
   - Video background with title overlay
   - Click/Enter to proceed
   - Smooth fade transition

2. **Main Menu** (`mainmenu.html`)
   - Pixel-art button navigation
   - Keyboard accessibility (arrows + Enter)
   - Hover effects and feedback

3. **Game Sections**
   - Play: Core typing gameplay
   - Forest: Environment selection
   - TreeDex: Progress and achievements  
   - Settings: Game configuration

### Accessibility Features

- **Keyboard navigation**: Full arrow key support
- **Screen reader friendly**: Proper ARIA labels
- **High contrast**: Clear pixel-art styling
- **Focus indicators**: Visible button focus states

## 🔨 Video Creation Tools

### Recommended Software

- **Aseprite**: Pixel-art animation
- **OpenToonz**: Free 2D animation software
- **After Effects**: Professional motion graphics
- **Blender**: 3D to pixel-art rendering

### Export Workflow

1. Animate at 320×180 resolution
2. Export individual frames as PNG
3. Compile to video using FFmpeg:
   ```bash
   ffmpeg -i frame_%04d.png -c:v libvpx-vp9 -pix_fmt yuv420p background.webm
   ffmpeg -i frame_%04d.png -c:v libx264 -pix_fmt yuv420p background.mp4
   ```

## 📝 Notes

- Video files are **not included** in repository (add to `.gitignore`)
- Static images serve as development/fallback content
- All UI elements maintain pixel-perfect rendering
- **Fixed resolution**: Game maintains consistent size regardless of browser zoom
- Cross-browser testing recommended before deployment

### Adjusting Game Size

The game uses a fixed scale to prevent resolution changes during zoom. To adjust the game size:

1. Open `style.css`
2. Find the `:root` section
3. Modify the `--scale` value:
   ```css
   :root {
     --scale: 3;  /* Change this: 2=smaller, 3=medium, 4=bigger, 5=largest */
   }
   ```
4. Recommended values: 2, 3, 4, or 5 for pixel-perfect alignment

---

**Version**: 1.0.0  
**Last Updated**: 2025  
**Compatible**: Modern web browsers with HTML5 video support