/**
 * SFXManager - Handles sound effects, particularly button clicks and UI sounds
 * Provides universal button click detection and volume control
 */
class SFXManager {
    constructor(audioManager) {
        this.audioManager = audioManager;
        
        // Audio elements pool for overlapping sounds
        this.buttonSoundPool = [];
        this.poolSize = 5; // Number of simultaneous button sounds
        
        // Sound URLs
        this.soundUrls = {
            button: '../SFX/Button Sound Effect.mp3'
        };
        
        // State
        this.volume = 1.0;
        this.isInitialized = false;
        
        // Button selectors for universal detection
        this.buttonSelectors = [
            '.menu-button',
            '.page-button',
            'button',
            '.btn',
            '.button',
            '[role="button"]',
            'input[type="button"]',
            'input[type="submit"]',
            '.clickable',
            '.nav-link',
            '.tab-button',
            '.close-button',
            '.modal-button',
            '.menu-nav-button',    // TreeDex and Forest "BACK TO MENU" buttons
            '.nav-btn',           // Main Game top navigation
            '.difficulty-btn',    // Main Game difficulty selection
            '.control-btn',       // Main Game control buttons
            '.close-inventory'    // Main Game inventory modal
        ];
        
        // Click handler reference for cleanup
        this.clickHandler = null;
    }
    
    /**
     * Initialize the SFX manager
     */
    async initialize() {
        if (this.isInitialized) {
            console.log('🔊 SFXManager already initialized');
            return;
        }
        
        console.log('🔊 SFXManager.initialize() called - Starting initialization...');
        console.log('🔊 AudioManager reference:', !!this.audioManager);
        console.log('🔊 AudioManager audio enabled:', this.audioManager?.audioEnabled);
        
        try {
            console.log('🔊 Step 1: Preloading sounds...');
            console.log('🔊 Sound URLs:', this.soundUrls);
            await this.preloadSounds();
            console.log('🔊 Step 1 Complete: Sounds preloaded successfully');
            
            console.log('🔊 Step 2: Setting up click detection...');
            this.setupUniversalClickDetection();
            console.log('🔊 Step 2 Complete: Click detection set up');
            
            this.isInitialized = true;
            console.log('✅ SFXManager initialized successfully');
            console.log('🔊 Final state - Click handler set up:', !!this.clickHandler);
            console.log('🔊 Final state - Button selectors count:', this.buttonSelectors.length);
            console.log('🔊 Final state - Button sound pool size:', this.buttonSoundPool.length);
        } catch (error) {
            console.error('❌ CRITICAL: SFXManager initialization failed:', error);
            console.error('❌ Error details:', {
                message: error.message,
                stack: error.stack,
                type: error.constructor.name,
                audioManager: !!this.audioManager,
                soundUrls: this.soundUrls
            });
            throw error;
        }
    }
    
    /**
     * Preload all sound effects
     */
    async preloadSounds() {
        console.log('🔊 preloadSounds() starting...');
        console.log('🔊 Pool size:', this.poolSize);
        console.log('🔊 Button sound URL:', this.soundUrls.button);
        
        // Create button sound pool
        const loadPromises = [];
        
        for (let i = 0; i < this.poolSize; i++) {
            console.log(`🔊 Creating audio element ${i + 1}/${this.poolSize}`);
            
            const promise = new Promise((resolve, reject) => {
                const audio = new Audio();
                
                // Set up timeout to prevent hanging
                const timeoutId = setTimeout(() => {
                    console.warn(`⚠️ Timeout loading button sound ${i + 1} - using silent fallback`);
                    const silentAudio = this.createSilentAudio();
                    this.buttonSoundPool.push({
                        audio: silentAudio,
                        inUse: false
                    });
                    resolve();
                }, 5000); // 5 second timeout
                
                audio.addEventListener('canplaythrough', () => {
                    clearTimeout(timeoutId);
                    this.buttonSoundPool.push({
                        audio: audio,
                        inUse: false
                    });
                    console.log(`✅ Loaded button sound ${i + 1}/${this.poolSize}`);
                    resolve();
                }, { once: true });
                
                audio.addEventListener('error', (e) => {
                    clearTimeout(timeoutId);
                    console.error(`❌ Failed to load button sound ${i + 1}:`, e);
                    console.error(`❌ Audio source was: ${audio.src}`);
                    console.error(`❌ Error event:`, e);
                    // Create silent fallback
                    const silentAudio = this.createSilentAudio();
                    this.buttonSoundPool.push({
                        audio: silentAudio,
                        inUse: false
                    });
                    resolve(); // Don't reject to allow other sounds to load
                });
                
                audio.preload = 'auto';
                audio.volume = 0;
                console.log(`🔊 Setting audio source ${i + 1}: ${this.soundUrls.button}`);
                audio.src = this.soundUrls.button;
            });
            
            loadPromises.push(promise);
        }
        
        console.log('🔊 Waiting for all sounds to load...');
        await Promise.all(loadPromises);
        console.log('🔊 All audio elements processed');
        
        // Setup audio properties
        console.log('🔊 Setting up audio properties...');
        this.buttonSoundPool.forEach((soundItem, index) => {
            console.log(`🔊 Setting up properties for audio ${index + 1}`);
            this.setupAudioProperties(soundItem.audio);
        });
        console.log('✅ preloadSounds() completed successfully');
    }
    
    /**
     * Create a silent fallback audio element
     */
    createSilentAudio() {
        const audio = new Audio();
        audio.src = 'data:audio/wav;base64,UklGRnoAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoAAAABAAEA';
        audio.volume = 0;
        return audio;
    }
    
    /**
     * Setup audio element properties
     */
    setupAudioProperties(audio) {
        audio.volume = this.volume;
        
        // Reset in-use flag when sound ends
        audio.addEventListener('ended', () => {
            const soundItem = this.buttonSoundPool.find(item => item.audio === audio);
            if (soundItem) {
                soundItem.inUse = false;
            }
        });
        
        // Handle errors during playback
        audio.addEventListener('error', () => {
            console.error('SFX playback error occurred');
            const soundItem = this.buttonSoundPool.find(item => item.audio === audio);
            if (soundItem) {
                soundItem.inUse = false;
            }
        });
    }
    
    /**
     * Setup universal click detection for buttons
     */
    setupUniversalClickDetection() {
        console.log('🔘 Setting up universal click detection...');
        
        // Remove existing handler if any
        if (this.clickHandler) {
            document.removeEventListener('click', this.clickHandler, true);
            console.log('🔘 Removed existing click handler');
        }
        
        // Create new click handler
        this.clickHandler = (event) => {
            const target = event.target;
            console.log('🖱️ Click detected on:', target.tagName, target.className);
            
            // Check if the clicked element matches any button selector
            if (this.isButtonElement(target)) {
                console.log('🔘 Button detected:', target.className || target.tagName, 'Target:', target);
                // Play button sound immediately on click
                this.playButtonSound();
            } else {
                console.log('❌ Click not detected as button');
            }
        };
        
        // Add event listener with capture phase to catch all clicks
        document.addEventListener('click', this.clickHandler, true);
        console.log('✅ Click event listener added');
        
        // Also listen for touch events on mobile
        const touchHandler = (event) => {
            const target = event.target;
            console.log('👆 Touch detected on:', target.tagName, target.className);
            if (this.isButtonElement(target)) {
                this.playButtonSound();
            }
        };
        
        document.addEventListener('touchend', touchHandler, true);
        console.log('✅ Touch event listener added');
    }
    
    /**
     * Check if an element should trigger button sound
     */
    isButtonElement(element) {
        if (!element || !element.matches) {
            return false;
        }
        
        // Check if element matches any button selector
        for (const selector of this.buttonSelectors) {
            try {
                if (element.matches(selector)) {
                    return true;
                }
            } catch (e) {
                // Invalid selector, skip
                continue;
            }
        }
        
        // Check parent elements (in case of nested button content)
        let parent = element.parentElement;
        while (parent && parent !== document.body) {
            for (const selector of this.buttonSelectors) {
                try {
                    if (parent.matches(selector)) {
                        return true;
                    }
                } catch (e) {
                    continue;
                }
            }
            parent = parent.parentElement;
        }
        
        // Check for common button-like attributes
        if (element.onclick || element.getAttribute('onclick')) {
            return true;
        }
        
        // Check for cursor pointer style (common for clickable elements)
        const computedStyle = window.getComputedStyle(element);
        if (computedStyle.cursor === 'pointer') {
            return true;
        }
        
        return false;
    }
    
    /**
     * Play button sound effect
     */
    playButtonSound() {
        if (!this.isInitialized || !this.audioManager.audioEnabled) {
            return;
        }
        
        // Find an available sound from the pool
        const availableSound = this.buttonSoundPool.find(item => !item.inUse);
        
        if (availableSound) {
            availableSound.inUse = true;
            availableSound.audio.currentTime = 0;
            availableSound.audio.volume = this.volume;
            
            // Play with proper promise handling for Chrome autoplay policy
            this.safePlaySFX(availableSound.audio).then(() => {
                console.log('🔊 Button sound played successfully');
            }).catch((error) => {
                console.warn('🔊 Button sound failed:', error);
                availableSound.inUse = false;
                this.handleSFXPlaybackFailure(error);
            });
        }
    }
    
    /**
     * Play a specific sound effect (for future expansion)
     */
    playSound(soundName, volume = null) {
        if (!this.isInitialized || !this.audioManager.audioEnabled) {
            return;
        }
        
        if (soundName === 'button') {
            this.playButtonSound();
        }
        // Add other sound effects here in the future
    }
    
    /**
     * Set volume for all sound effects
     */
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        
        // Update volume for all sounds in pool
        this.buttonSoundPool.forEach(soundItem => {
            if (soundItem.audio) {
                soundItem.audio.volume = this.volume;
            }
        });
    }
    
    /**
     * Add custom button selector
     */
    addButtonSelector(selector) {
        if (typeof selector === 'string' && !this.buttonSelectors.includes(selector)) {
            this.buttonSelectors.push(selector);
        }
    }
    
    /**
     * Remove button selector
     */
    removeButtonSelector(selector) {
        const index = this.buttonSelectors.indexOf(selector);
        if (index > -1) {
            this.buttonSelectors.splice(index, 1);
        }
    }
    
    /**
     * Get current button selectors
     */
    getButtonSelectors() {
        return [...this.buttonSelectors];
    }
    
    /**
     * Manually trigger button sound (for special cases)
     */
    triggerButtonSound() {
        this.playButtonSound();
    }
    
    /**
     * Stop all playing sounds
     */
    stopAll() {
        this.buttonSoundPool.forEach(soundItem => {
            if (soundItem.audio && !soundItem.audio.paused) {
                soundItem.audio.pause();
                soundItem.audio.currentTime = 0;
                soundItem.inUse = false;
            }
        });
    }
    
    /**
     * Get current SFX info
     */
    getCurrentInfo() {
        const activeSounds = this.buttonSoundPool.filter(item => item.inUse).length;
        
        return {
            volume: this.volume,
            activeSounds: activeSounds,
            poolSize: this.poolSize,
            availableSounds: this.poolSize - activeSounds,
            buttonSelectors: this.buttonSelectors.length
        };
    }
    
    /**
     * Enable/disable button sound effects
     */
    setEnabled(enabled) {
        if (!enabled) {
            this.stopAll();
        }
    }
    
    /**
     * Cleanup and dispose resources
     */
    dispose() {
        // Remove event listeners
        if (this.clickHandler) {
            document.removeEventListener('click', this.clickHandler, true);
            document.removeEventListener('touchend', this.clickHandler, true);
        }
        
        // Stop and cleanup all sounds
        this.buttonSoundPool.forEach(soundItem => {
            if (soundItem.audio) {
                soundItem.audio.removeEventListener('ended', () => {});
                soundItem.audio.removeEventListener('error', () => {});
                soundItem.audio.pause();
                soundItem.audio.src = '';
                soundItem.audio.load();
            }
        });
        
        this.buttonSoundPool = [];
        this.audioManager = null;
        this.clickHandler = null;
    }
    
    /**
     * Safely play SFX with Chrome autoplay policy compliance
     */
    async safePlaySFX(audioElement) {
        if (!audioElement) {
            throw new Error('No audio element provided');
        }
        
        try {
            const playPromise = audioElement.play();
            
            // Handle browsers that don't return promises from play()
            if (playPromise !== undefined) {
                await playPromise;
            }
            
            return true;
            
        } catch (error) {
            // Check if this is an autoplay policy error
            if (error.name === 'NotAllowedError' ||
                error.message.includes('autoplay') ||
                error.message.includes('user activation') ||
                error.message.includes('gesture')) {
                
                console.log('🔊 SFX autoplay blocked by browser policy');
                throw new Error('AUTOPLAY_BLOCKED');
            }
            
            // Re-throw other errors
            throw error;
        }
    }
    
    /**
     * Handle SFX playback failures
     */
    handleSFXPlaybackFailure(error) {
        if (error.message === 'AUTOPLAY_BLOCKED') {
            console.log('🔊 SFX blocked by autoplay policy - audio needs activation');
            
            // Don't re-show overlay for SFX failures - just log and continue
            // SFX failures are less critical than music failures
            console.log('🔊 SFX will work after next user interaction');
        } else {
            console.warn('🔊 Non-autoplay SFX error, continuing silently:', error);
        }
    }
}

// Export for use as module or global
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SFXManager };
} else {
    window.SFXManager = SFXManager;
}