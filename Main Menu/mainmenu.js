document.addEventListener('DOMContentLoaded', () => {
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
      // TODO: Add hover sound effect
      console.log(`Hover: ${action}`);
    });
  });
  
  /* ---- Menu Action Handler ---- */
  function handleMenuAction(action) {
    console.log(`Menu action: ${action}`);
    
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
          navigateToPage('game.html', 'Starting game...');
          break;
        case 'forest':
          navigateToPage('../Forest/index.html', 'Entering forest...');
          break;
        case 'treedex':
          navigateToPage('../TreeDex/treedex.html', 'Opening TreeDex...');
          break;
        case 'settings':
          navigateToPage('settings.html', 'Opening settings...');
          break;
        default:
          console.log('Unknown action:', action);
      }
    }, 150);
  }
  
  /* ---- Page Navigation ---- */
  function navigateToPage(url, message) {
    console.log(message);
    
    // Fade out the menu
    menuStage.style.opacity = '0';
    
    // Navigate after fade completes
    setTimeout(() => {
      // Check if the target page exists, otherwise show a placeholder
      window.location.href = url;
    }, 600);
  }
  
  /* ---- Keyboard Navigation ---- */
  let currentButtonIndex = 0;
  const totalButtons = menuButtons.length;
  
  document.addEventListener('keydown', (e) => {
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
        // Option to return to opening cutscene
        navigateToPage('index.html', 'Returning to opening...');
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
  
  // Initial focus on Play button
  if (menuButtons.length > 0) {
    menuButtons[0].focus();
  }
  
  /* ---- Error Handling ---- */
  window.addEventListener('error', (e) => {
    console.log('Menu error:', e.error);
    // Fallback to index if there's a critical error
    // window.location.href = 'index.html';
  });
});

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