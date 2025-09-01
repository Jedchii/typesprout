// SPA Router and View Management
class SPARouter {
  constructor() {
    this.currentView = 'opening';
    this.views = {
      'opening': document.getElementById('opening-view'),
      'menu': document.getElementById('menu-view'),
      'game': document.getElementById('game-view'),
      'settings': document.getElementById('settings-view')
    };
  }

  // Navigate to a specific view
  async navigateTo(viewName, skipHistory = false) {
    if (this.currentView === viewName) return;

    console.log(`🔄 SPA Navigation: ${this.currentView} → ${viewName}`);

    const currentViewElement = this.views[this.currentView];
    const targetViewElement = this.views[viewName];

    if (!targetViewElement) {
      console.error(`View ${viewName} not found`);
      return;
    }

    // AGGRESSIVE BACKGROUND HIDING - completely hide all background elements during transition
    const backgrounds = document.querySelectorAll('.menu-background, .page-background, .menu-container, .page-container');
    const originalStyles = new Map();
    
    backgrounds.forEach((bg, index) => {
      // Store original styles
      originalStyles.set(index, {
        display: bg.style.display,
        opacity: bg.style.opacity,
        background: bg.style.background,
        backgroundImage: bg.style.backgroundImage
      });
      
      // Completely hide and remove backgrounds
      bg.style.transition = 'none';
      bg.style.display = 'none';
      bg.style.opacity = '0';
      bg.style.background = 'none';
      bg.style.backgroundImage = 'none';
    });

    // Also hide any container backgrounds that might have CSS backgrounds
    const containers = document.querySelectorAll('.menu-stage, .page-stage');
    const containerOriginalStyles = new Map();
    
    containers.forEach((container, index) => {
      containerOriginalStyles.set(index, {
        background: container.style.background,
        backgroundImage: container.style.backgroundImage
      });
      
      container.style.background = 'none';
      container.style.backgroundImage = 'none';
    });

    // Fade out current view
    if (currentViewElement) {
      currentViewElement.classList.add('fade-out');
    }

    // Wait for fade out animation
    await new Promise(resolve => setTimeout(resolve, 600));

    // Switch views
    Object.values(this.views).forEach(view => {
      view.classList.remove('active', 'fade-out');
    });

    targetViewElement.classList.add('active');
    this.currentView = viewName;

    // Restore all background elements and styles after transition
    setTimeout(() => {
      backgrounds.forEach((bg, index) => {
        const originalStyle = originalStyles.get(index);
        bg.style.transition = '';
        bg.style.display = originalStyle.display;
        bg.style.opacity = originalStyle.opacity;
        bg.style.background = originalStyle.background;
        bg.style.backgroundImage = originalStyle.backgroundImage;
      });
      
      containers.forEach((container, index) => {
        const originalStyle = containerOriginalStyles.get(index);
        container.style.background = originalStyle.background;
        container.style.backgroundImage = originalStyle.backgroundImage;
      });
    }, 500); // Longer delay to ensure view is fully visible

    // Update browser history (skip if file:// protocol to avoid SecurityError)
    if (!skipHistory && window.location.protocol !== 'file:') {
      try {
        const path = viewName === 'opening' ? '/' : `/${viewName}`;
        history.pushState({ view: viewName }, '', path);
      } catch (error) {
        console.warn('History API not available:', error.message);
      }
    }

    // Notify AudioManager about section change based on view
    if (window.audioManager) {
      const audioSection = viewName === 'game' ? 'battle' : 'title_screen';
      console.log(`🎵 SPA: Calling AudioManager handleSectionChange: ${audioSection} for view ${viewName}`);
      window.audioManager.handleSectionChange(audioSection);
    }
  }

  // Handle browser back/forward navigation
  handlePopState(event) {
    const viewName = event.state?.view || 'opening';
    this.navigateTo(viewName, true);
  }
}

// Initialize SPA Router
let spaRouter;

document.addEventListener('DOMContentLoaded', () => {
  // Initialize SPA Router
  spaRouter = new SPARouter();

  // Handle browser navigation
  window.addEventListener('popstate', (event) => {
    spaRouter.handlePopState(event);
  });

  // Set initial state based on current URL
  const path = window.location.pathname;
  let initialView = 'opening';
  if (path.includes('menu')) initialView = 'menu';
  else if (path.includes('game')) initialView = 'game';
  else if (path.includes('settings')) initialView = 'settings';
  
  if (initialView !== 'opening') {
    spaRouter.navigateTo(initialView, true);
  }

  // Initialize Opening View
  initializeOpeningView();

  // Initialize Menu View
  initializeMenuView();
});

// Opening View Logic (from original script.js)
function initializeOpeningView() {
  const stage = document.getElementById('stage');
  const bgVideo = document.getElementById('bgVideo');
  const fallbackImg = document.querySelector('.bg-fallback');
  
  /* ---- Video Background Setup ---- */
  function setupVideoFallback() {
    // Show fallback image if video fails to load or play
    if (fallbackImg) {
      fallbackImg.style.display = 'block';
      console.log('Video fallback: Using static background image');
    }
  }

  // Handle video loading and playback
  if (bgVideo) {
    bgVideo.addEventListener('loadeddata', () => {
      console.log('Video loaded successfully. Current source:', bgVideo.currentSrc);
    });

    bgVideo.addEventListener('error', () => {
      console.log('Video failed to load, using fallback');
      setupVideoFallback();
    });

    // Ensure video plays (some browsers require user interaction)
    bgVideo.addEventListener('canplay', () => {
      const playPromise = bgVideo.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          console.log('Video autoplay prevented, using fallback');
          setupVideoFallback();
        });
      }
    });

    // Simple loop without horizontal flipping
    bgVideo.addEventListener('ended', () => {
      bgVideo.currentTime = 0;
      bgVideo.play().catch(e => console.log('Loop play error:', e));
    });

    // Set video to loop naturally
    bgVideo.loop = true;

    // Start playing when ready
    bgVideo.addEventListener('canplaythrough', () => {
      bgVideo.play().catch(e => console.log('Autoplay prevented:', e));
    }, { once: true });
  } else {
    // No video element found, use fallback
    setupVideoFallback();
  }

  /* ---- Start prompt SPA navigation ---- */
  const startPrompt = document.querySelector('.start-prompt');
  const goToMenu = () => {
    // Use SPA navigation instead of page redirect
    spaRouter.navigateTo('menu');
  };

  if (startPrompt) {
    startPrompt.addEventListener('click', goToMenu);
    startPrompt.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        goToMenu();
      }
    });
  }
}

// Menu View Logic (from mainmenu.js)
function initializeMenuView() {
  const menuStage = document.getElementById('menuStage');
  const menuButtons = document.querySelectorAll('.menu-button');
  
  /* ---- Menu Button Interactions ---- */
  menuButtons.forEach(button => {
    const action = button.getAttribute('data-action');
    
    button.addEventListener('click', () => {
      handleMenuAction(action);
    });
    
    // Keyboard navigation
    button.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleMenuAction(action);
      }
    });
    
    // Add hover sound effect placeholder
    button.addEventListener('mouseenter', () => {
      // TODO: Add hover sound effect via AudioManager
      if (window.audioManager) {
        // window.audioManager.playButtonHover();
      }
      console.log(`Hover: ${action}`);
    });
  });
  
  /* ---- Menu Action Handler ---- */
  function handleMenuAction(action) {
    console.log(`Menu action: ${action}`);
    
    // Play button sound effect
    if (window.audioManager) {
      window.audioManager.playButtonSound();
    }
    
    // Add click feedback
    const activeButton = document.querySelector(`[data-action="${action}"]`);
    if (activeButton) {
      activeButton.style.transform = 'translateY(1px)';
      activeButton.style.boxShadow = 'none';
      
      setTimeout(() => {
        activeButton.style.transform = '';
        activeButton.style.boxShadow = '';
      }, 100);
    }
    
    // Handle navigation with fade transition
    setTimeout(() => {
      switch(action) {
        case 'play':
          // Navigate to game.html (with loading animations) instead of SPA view
          navigateToExternalPage('game.html', 'Navigating to game loading screen...');
          break;
        case 'forest':
          // Navigate to standalone Forest page
          navigateToExternalPage('../Forest/index.html', 'Navigating to Forest...');
          break;
        case 'treedex':
          // Navigate to standalone TreeDex page
          navigateToExternalPage('../TreeDex/treedex.html', 'Navigating to TreeDex...');
          break;
        case 'settings':
          spaRouter.navigateTo('settings');
          break;
        default:
          console.log('Unknown action:', action);
      }
    }, 150);
  }
  
  /* ---- External Page Navigation (for pages not yet converted to SPA) ---- */
  function navigateToExternalPage(url, message) {
    console.log(message);
    
    // Fade out the menu
    if (menuStage) {
      menuStage.style.opacity = '0';
    }
    
    // Navigate after fade completes
    setTimeout(() => {
      window.location.href = url;
    }, 600);
  }
  
  /* ---- Keyboard Navigation ---- */
  let currentButtonIndex = 0;
  const totalButtons = menuButtons.length;
  
  // Only add keyboard navigation when menu view is active
  document.addEventListener('keydown', (e) => {
    if (spaRouter.currentView !== 'menu') return;
    
    switch(e.key) {
      case 'ArrowDown':
        e.preventDefault();
        currentButtonIndex = (currentButtonIndex + 1) % totalButtons;
        focusCurrentButton();
        break;
        
      case 'ArrowUp':
        e.preventDefault();
        currentButtonIndex = (currentButtonIndex - 1 + totalButtons) % totalButtons;
        focusCurrentButton();
        break;
        
      case 'Escape':
        // Return to opening cutscene via SPA navigation
        spaRouter.navigateTo('opening');
        break;
    }
  });
  
  function focusCurrentButton() {
    if (menuButtons[currentButtonIndex]) {
      menuButtons[currentButtonIndex].focus();
    }
  }
  
  /* ---- Menu Background Effects (Optional) ---- */
  function createMenuParticles() {
    // Subtle floating particles for ambient effect
    const particleCount = 5;
    
    if (!menuStage) return;
    
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'menu-particle';
      particle.style.cssText = `
        position: absolute;
        width: 2px;
        height: 2px;
        background: rgba(255, 255, 255, 0.6);
        border-radius: 50%;
        z-index: 1;
        pointer-events: none;
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        animation: float ${3 + Math.random() * 4}s ease-in-out infinite;
        animation-delay: ${Math.random() * 2}s;
      `;
      
      menuStage.appendChild(particle);
    }
  }
  
  // Add floating particle effect
  createMenuParticles();
  
  // Focus on Play button when menu becomes active
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.target.classList.contains('active') && menuButtons.length > 0) {
        setTimeout(() => {
          menuButtons[0].focus();
        }, 100);
      }
    });
  });
  
  if (document.getElementById('menu-view')) {
    observer.observe(document.getElementById('menu-view'), {
      attributes: true,
      attributeFilter: ['class']
    });
  }
}

/* ---- CSS Animation for floating particles ---- */
const style = document.createElement('style');
style.textContent = `
  @keyframes float {
    0%, 100% { transform: translateY(0) translateX(0); opacity: 0.6; }
    33% { transform: translateY(-10px) translateX(3px); opacity: 1; }
    66% { transform: translateY(5px) translateX(-2px); opacity: 0.8; }
  }
`;
document.head.appendChild(style);

/* ---- Error Handling ---- */
window.addEventListener('error', (e) => {
  console.log('SPA error:', e.error);
  // Could implement fallback navigation or error recovery here
});

// Global function for external access
window.SPARouter = SPARouter;
window.navigateToView = (viewName) => {
  if (spaRouter) {
    spaRouter.navigateTo(viewName);
  }
};
