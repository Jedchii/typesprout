/**
 * Settings Page Integration
 * Connects new settings UI to existing AudioManager/SettingsManager system
 */

class TypeSproutSettingsPage {
    constructor() {
        this.audioManager = null;
        this.settingsManager = null;
        this.isInitialized = false;
        
        // UI Elements
        this.elements = {
            masterVolumeSlider: null,
            musicVolumeSlider: null,
            sfxVolumeSlider: null,
            masterVolumeValue: null,
            musicVolumeValue: null,
            sfxVolumeValue: null,
            fullscreenToggle: null,
            resetButton: null
        };
        
        // Fullscreen state
        this.isFullscreen = false;
        this.fullscreenSupported = false;
        
        // Initialize when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initialize());
        } else {
            this.initialize();
        }
    }
    
    async initialize() {
        try {
            console.log('🎛️ Initializing TypeSprout Settings Page...');
            
            // Get UI elements
            this.getUIElements();
            
            // Check fullscreen support
            this.checkFullscreenSupported();
            
            // Initialize audio system
            await this.initializeAudioSystem();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Sync initial state
            this.syncInitialState();
            
            // Load saved fullscreen preference
            this.loadFullscreenPreference();
            
            this.isInitialized = true;
            console.log('✅ Settings Page initialized successfully');
            
        } catch (error) {
            console.error('❌ Failed to initialize Settings Page:', error);
            this.showErrorFallback();
        }
    }
    
    getUIElements() {
        this.elements.masterVolumeSlider = document.getElementById('master-volume');
        this.elements.musicVolumeSlider = document.getElementById('music-volume');
        this.elements.sfxVolumeSlider = document.getElementById('sfx-volume');
        this.elements.masterVolumeValue = document.getElementById('master-volume-value');
        this.elements.musicVolumeValue = document.getElementById('music-volume-value');
        this.elements.sfxVolumeValue = document.getElementById('sfx-volume-value');
        this.elements.fullscreenToggle = document.getElementById('fullscreen-toggle');
        this.elements.resetButton = document.getElementById('reset-settings');
        
        // Validate required elements
        const requiredElements = [
            'masterVolumeSlider', 'musicVolumeSlider', 'sfxVolumeSlider',
            'masterVolumeValue', 'musicVolumeValue', 'sfxVolumeValue',
            'fullscreenToggle', 'resetButton'
        ];
        
        for (const elementName of requiredElements) {
            if (!this.elements[elementName]) {
                throw new Error(`Required UI element not found: ${elementName}`);
            }
        }
    }
    
    checkFullscreenSupported() {
        this.fullscreenSupported = !!(
            document.fullscreenEnabled ||
            document.webkitFullscreenEnabled ||
            document.mozFullScreenEnabled ||
            document.msFullscreenEnabled
        );
        
        if (!this.fullscreenSupported) {
            console.warn('⚠️ Fullscreen API not supported in this browser');
            this.elements.fullscreenToggle.disabled = true;
            this.elements.fullscreenToggle.title = 'Fullscreen not supported in this browser';
        }
    }
    
    async initializeAudioSystem() {
        // Wait for AudioManager to be available
        if (typeof AudioManager === 'undefined') {
            throw new Error('AudioManager not loaded');
        }
        
        // Get AudioManager instance (singleton)
        this.audioManager = AudioManager.getInstance();
        
        // Wait for AudioManager to be initialized by init.js
        // Don't initialize ourselves - let the main init.js handle it
        let waitCount = 0;
        const maxWait = 50; // 5 seconds maximum wait
        
        while (!this.audioManager.isInitialized && waitCount < maxWait) {
            console.log(`🔊 Waiting for AudioManager initialization... (${waitCount + 1}/${maxWait})`);
            await new Promise(resolve => setTimeout(resolve, 100));
            waitCount++;
        }
        
        if (!this.audioManager.isInitialized) {
            console.warn('🔊 AudioManager not initialized by init.js - initializing now as fallback');
            await this.audioManager.initialize();
        }
        
        // Get SettingsManager reference
        this.settingsManager = this.audioManager.settingsManager;
        if (!this.settingsManager) {
            throw new Error('SettingsManager not available');
        }
        
        console.log('✅ Audio system connection established');
    }
    
    setupEventListeners() {
        // Volume slider listeners
        this.setupVolumeSlider('master', this.elements.masterVolumeSlider, this.elements.masterVolumeValue);
        this.setupVolumeSlider('music', this.elements.musicVolumeSlider, this.elements.musicVolumeValue);
        this.setupVolumeSlider('sfx', this.elements.sfxVolumeSlider, this.elements.sfxVolumeValue);
        
        // Fullscreen toggle
        this.elements.fullscreenToggle.addEventListener('click', () => this.toggleFullscreen());
        
        // Reset button
        this.elements.resetButton.addEventListener('click', () => this.resetToDefaults());
        
        // Listen for external fullscreen changes
        document.addEventListener('fullscreenchange', () => this.handleFullscreenChange());
        document.addEventListener('webkitfullscreenchange', () => this.handleFullscreenChange());
        document.addEventListener('mozfullscreenchange', () => this.handleFullscreenChange());
        document.addEventListener('MSFullscreenChange', () => this.handleFullscreenChange());
        
        // Listen for settings changes from other pages
        window.addEventListener('storage', (event) => {
            if (event.key === 'typesprout_audio_state') {
                this.syncWithExternalChanges();
            }
        });
        
        console.log('✅ Event listeners setup complete');
    }
    
    setupVolumeSlider(type, slider, valueDisplay) {
        const updateVolume = (event) => {
            const value = parseFloat(event.target.value) / 100; // Convert to 0-1 range
            
            // Update via SettingsManager (which handles AudioManager integration)
            if (this.settingsManager) {
                this.settingsManager.setVolume(type, value);
            }
            
            // Update value display
            valueDisplay.textContent = `${Math.round(value * 100)}%`;
            
            // Provide audio feedback for non-master volume changes
            if (type !== 'master' && this.audioManager) {
                this.audioManager.playButtonSound();
            }
        };
        
        // Use both 'input' for real-time updates and 'change' for final value
        slider.addEventListener('input', updateVolume);
        slider.addEventListener('change', updateVolume);
    }
    
    syncInitialState() {
        if (!this.audioManager) return;
        
        const volumes = this.audioManager.getVolumes();
        
        // Set slider values and displays
        this.updateVolumeDisplay('master', volumes.master);
        this.updateVolumeDisplay('music', volumes.music);
        this.updateVolumeDisplay('sfx', volumes.sfx);
        
        console.log('✅ Initial state synchronized');
    }
    
    updateVolumeDisplay(type, value) {
        const slider = this.elements[`${type}VolumeSlider`];
        const display = this.elements[`${type}VolumeValue`];
        
        if (slider && display) {
            const percentValue = Math.round(value * 100);
            slider.value = percentValue;
            display.textContent = `${percentValue}%`;
        }
    }
    
    syncWithExternalChanges() {
        // Sync with changes made from other pages
        if (this.audioManager) {
            const volumes = this.audioManager.getVolumes();
            this.updateVolumeDisplay('master', volumes.master);
            this.updateVolumeDisplay('music', volumes.music);
            this.updateVolumeDisplay('sfx', volumes.sfx);
            
            console.log('🔄 Synced with external audio changes');
        }
    }
    
    // Fullscreen functionality
    toggleFullscreen() {
        if (!this.fullscreenSupported) return;
        
        if (this.isFullscreenActive()) {
            this.exitFullscreen();
        } else {
            this.enterFullscreen();
        }
    }
    
    isFullscreenActive() {
        return !!(
            document.fullscreenElement ||
            document.webkitFullscreenElement ||
            document.mozFullScreenElement ||
            document.msFullscreenElement
        );
    }
    
    enterFullscreen() {
        const elem = document.documentElement;
        
        if (elem.requestFullscreen) {
            elem.requestFullscreen();
        } else if (elem.webkitRequestFullscreen) {
            elem.webkitRequestFullscreen();
        } else if (elem.mozRequestFullScreen) {
            elem.mozRequestFullScreen();
        } else if (elem.msRequestFullscreen) {
            elem.msRequestFullscreen();
        }
    }
    
    exitFullscreen() {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    }
    
    handleFullscreenChange() {
        const isFullscreen = this.isFullscreenActive();
        this.updateFullscreenToggle(isFullscreen);
        this.saveFullscreenPreference(isFullscreen);
        
        console.log(`📺 Fullscreen ${isFullscreen ? 'activated' : 'deactivated'}`);
    }
    
    updateFullscreenToggle(isFullscreen) {
        const toggle = this.elements.fullscreenToggle;
        const text = toggle.querySelector('.toggle-text');
        
        toggle.setAttribute('aria-checked', isFullscreen.toString());
        text.textContent = isFullscreen ? 'ON' : 'OFF';
    }
    
    loadFullscreenPreference() {
        const saved = localStorage.getItem('typesprout_fullscreen_enabled');
        if (saved === 'true') {
            // Don't auto-enter fullscreen, just update the toggle display
            // User needs to manually trigger fullscreen for security reasons
            this.updateFullscreenToggle(false);
        }
    }
    
    saveFullscreenPreference(isFullscreen) {
        localStorage.setItem('typesprout_fullscreen_enabled', isFullscreen.toString());
    }
    
    resetToDefaults() {
        if (!this.settingsManager) return;
        
        // Show confirmation
        if (confirm('Reset all settings to default values?')) {
            // Reset via SettingsManager
            this.settingsManager.resetToDefaults();
            
            // Update UI
            this.updateVolumeDisplay('master', 1.0);
            this.updateVolumeDisplay('music', 1.0);
            this.updateVolumeDisplay('sfx', 1.0);
            
            // Exit fullscreen if active
            if (this.isFullscreenActive()) {
                this.exitFullscreen();
            }
            
            // Clear fullscreen preference
            localStorage.removeItem('typesprout_fullscreen_enabled');
            
            console.log('🔄 Settings reset to defaults');
            
            // Play confirmation sound
            if (this.audioManager) {
                this.audioManager.playButtonSound();
            }
        }
    }
    
    showErrorFallback() {
        // Show basic error message if initialization fails
        const container = document.querySelector('.settings-container');
        if (container) {
            container.innerHTML = `
                <div class="settings-group">
                    <h3 class="group-title">⚠️ ERROR</h3>
                    <div class="control-item">
                        <p style="color: #fff; font-family: 'Press Start 2P', cursive; font-size: 10px; text-align: center; line-height: 1.6;">
                            Settings could not load properly.<br>
                            Please refresh the page or check your connection.
                        </p>
                    </div>
                </div>
            `;
        }
    }
}

// Initialize settings page
window.addEventListener('DOMContentLoaded', () => {
    window.typesproutSettings = new TypeSproutSettingsPage();
});

// Export for potential external use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TypeSproutSettingsPage;
} else {
    window.TypeSproutSettingsPage = TypeSproutSettingsPage;
}