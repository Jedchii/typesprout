/**
 * SettingsManager - Handles audio settings integration and UI synchronization
 * Connects to existing settings UI controls and provides real-time adjustments
 */
class SettingsManager {
    constructor(audioManager) {
        this.audioManager = audioManager;
        
        // Settings state
        this.settings = {
            masterVolume: 1.0,
            musicVolume: 1.0,
            sfxVolume: 1.0,
            audioEnabled: true,
            keySounds: true,
            effectsLevel: 'high'
        };
        
        // UI element selectors
        this.selectors = {
            audioToggle: '.audio-toggle, #audioToggle',
            masterVolumeSlider: '.master-volume, #masterVolume',
            musicVolumeSlider: '.music-volume, #musicVolume',
            sfxVolumeSlider: '.sfx-volume, #sfxVolume',
            keySoundsToggle: '.key-sounds-toggle, #keySounds',
            settingsList: '.settings-list',
            audioSetting: '.settings-list p:first-child', // "🔊 Audio: ON"
            keySoundsSetting: '.settings-list p:nth-child(5)' // "⌨️ Key Sounds: ON"
        };
        
        // Event listeners references for cleanup
        this.eventListeners = new Map();
        
        this.isInitialized = false;
    }
    
    /**
     * Initialize the settings manager
     */
    async initialize() {
        if (this.isInitialized) {
            return;
        }
        
        try {
            // Load settings from AudioManager
            this.syncWithAudioManager();
            
            // Setup UI integration
            this.setupUIIntegration();
            
            // Update existing static settings display
            this.updateStaticSettingsDisplay();
            
            // Setup dynamic controls if available
            this.setupDynamicControls();
            
            this.isInitialized = true;
            console.log('SettingsManager initialized successfully');
        } catch (error) {
            console.error('Failed to initialize SettingsManager:', error);
        }
    }
    
    /**
     * Sync settings with AudioManager
     */
    syncWithAudioManager() {
        if (!this.audioManager) return;
        
        const volumes = this.audioManager.getVolumes();
        this.settings.masterVolume = volumes.master;
        this.settings.musicVolume = volumes.music;
        this.settings.sfxVolume = volumes.sfx;
        this.settings.audioEnabled = volumes.enabled;
    }
    
    /**
     * Setup UI integration for existing and dynamic controls
     */
    setupUIIntegration() {
        // Look for existing volume sliders
        this.setupVolumeSliders();
        
        // Look for audio toggle buttons
        this.setupAudioToggles();
        
        // Setup keyboard shortcuts
        this.setupKeyboardShortcuts();
        
        // Listen for setting changes from other sources
        this.setupSettingsListeners();
    }
    
    /**
     * Setup volume slider controls
     */
    setupVolumeSliders() {
        // Master volume
        const masterSlider = document.querySelector(this.selectors.masterVolumeSlider);
        if (masterSlider) {
            this.setupSlider(masterSlider, 'master');
        }
        
        // Music volume
        const musicSlider = document.querySelector(this.selectors.musicVolumeSlider);
        if (musicSlider) {
            this.setupSlider(musicSlider, 'music');
        }
        
        // SFX volume
        const sfxSlider = document.querySelector(this.selectors.sfxVolumeSlider);
        if (sfxSlider) {
            this.setupSlider(sfxSlider, 'sfx');
        }
    }
    
    /**
     * Setup individual slider
     */
    setupSlider(slider, type) {
        // Set initial value
        const currentValue = this.settings[`${type}Volume`];
        slider.value = currentValue * 100; // Convert to percentage
        
        // Add event listener
        const handler = (event) => {
            const value = parseFloat(event.target.value) / 100;
            this.setVolume(type, value);
        };
        
        slider.addEventListener('input', handler);
        slider.addEventListener('change', handler);
        this.eventListeners.set(slider, handler);
    }
    
    /**
     * Setup audio toggle buttons
     */
    setupAudioToggles() {
        const audioToggle = document.querySelector(this.selectors.audioToggle);
        if (audioToggle) {
            const handler = () => {
                this.toggleAudio();
            };
            
            audioToggle.addEventListener('click', handler);
            this.eventListeners.set(audioToggle, handler);
        }
        
        // Key sounds toggle
        const keySoundsToggle = document.querySelector(this.selectors.keySoundsToggle);
        if (keySoundsToggle) {
            const handler = () => {
                this.toggleKeySounds();
            };
            
            keySoundsToggle.addEventListener('click', handler);
            this.eventListeners.set(keySoundsToggle, handler);
        }
    }
    
    /**
     * Setup keyboard shortcuts for volume control
     */
    setupKeyboardShortcuts() {
        const handler = (event) => {
            // Only handle shortcuts when not typing in input fields
            if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
                return;
            }
            
            switch (event.key) {
                case 'M':
                case 'm':
                    if (event.ctrlKey || event.metaKey) {
                        event.preventDefault();
                        this.toggleAudio();
                    }
                    break;
                    
                case '=':
                case '+':
                    if (event.ctrlKey || event.metaKey) {
                        event.preventDefault();
                        this.adjustMasterVolume(0.1);
                    }
                    break;
                    
                case '-':
                case '_':
                    if (event.ctrlKey || event.metaKey) {
                        event.preventDefault();
                        this.adjustMasterVolume(-0.1);
                    }
                    break;
            }
        };
        
        document.addEventListener('keydown', handler);
        this.eventListeners.set(document, handler);
    }
    
    /**
     * Setup settings change listeners
     */
    setupSettingsListeners() {
        // Listen for storage changes (settings changed in other tabs)
        const storageHandler = (event) => {
            if (event.key === 'typesprout_audio_state') {
                this.syncWithAudioManager();
                this.updateAllUI();
            }
        };
        
        window.addEventListener('storage', storageHandler);
        this.eventListeners.set(window, storageHandler);
    }
    
    /**
     * Update static settings display (for existing HTML structure)
     */
    updateStaticSettingsDisplay() {
        // Update audio setting display
        const audioSetting = document.querySelector(this.selectors.audioSetting);
        if (audioSetting) {
            const status = this.settings.audioEnabled ? 'ON' : 'OFF';
            audioSetting.textContent = `🔊 Audio: ${status}`;
        }
        
        // Update key sounds setting
        const keySoundsSetting = document.querySelector(this.selectors.keySoundsSetting);
        if (keySoundsSetting) {
            const status = this.settings.keySounds ? 'ON' : 'OFF';
            keySoundsSetting.textContent = `⌨️ Key Sounds: ${status}`;
        }
    }
    
    /**
     * Setup dynamic controls (create sliders if they don't exist)
     */
    setupDynamicControls() {
        const settingsList = document.querySelector(this.selectors.settingsList);
        if (!settingsList) return;
        
        // Check if we need to add volume controls
        const hasVolumeControls = document.querySelector(this.selectors.masterVolumeSlider);
        
        if (!hasVolumeControls) {
            this.createDynamicVolumeControls(settingsList);
        }
    }
    
    /**
     * Create dynamic volume controls
     */
    createDynamicVolumeControls(container) {
        // Create volume controls container
        const volumeControlsHTML = `
            <div class="volume-controls" style="margin: 20px 0; font-family: 'Press Start 2P', monospace; font-size: 12px;">
                <div style="margin: 10px 0; display: flex; justify-content: space-between; align-items: center;">
                    <span>🔊 Master:</span>
                    <input type="range" id="masterVolume" min="0" max="100" value="${this.settings.masterVolume * 100}" 
                           style="width: 120px; margin-left: 10px;">
                    <span id="masterVolumeValue">${Math.round(this.settings.masterVolume * 100)}%</span>
                </div>
                <div style="margin: 10px 0; display: flex; justify-content: space-between; align-items: center;">
                    <span>🎵 Music:</span>
                    <input type="range" id="musicVolume" min="0" max="100" value="${this.settings.musicVolume * 100}" 
                           style="width: 120px; margin-left: 10px;">
                    <span id="musicVolumeValue">${Math.round(this.settings.musicVolume * 100)}%</span>
                </div>
                <div style="margin: 10px 0; display: flex; justify-content: space-between; align-items: center;">
                    <span>🔊 SFX:</span>
                    <input type="range" id="sfxVolume" min="0" max="100" value="${this.settings.sfxVolume * 100}" 
                           style="width: 120px; margin-left: 10px;">
                    <span id="sfxVolumeValue">${Math.round(this.settings.sfxVolume * 100)}%</span>
                </div>
            </div>
        `;
        
        // Add to container
        container.insertAdjacentHTML('afterend', volumeControlsHTML);
        
        // Setup the newly created sliders
        setTimeout(() => {
            this.setupVolumeSliders();
            this.setupVolumeValueUpdates();
        }, 100);
    }
    
    /**
     * Setup volume value display updates
     */
    setupVolumeValueUpdates() {
        const masterSlider = document.getElementById('masterVolume');
        const musicSlider = document.getElementById('musicVolume');
        const sfxSlider = document.getElementById('sfxVolume');
        
        const updateValueDisplay = (slider, valueElementId) => {
            if (slider) {
                const handler = () => {
                    const valueElement = document.getElementById(valueElementId);
                    if (valueElement) {
                        valueElement.textContent = `${slider.value}%`;
                    }
                };
                
                slider.addEventListener('input', handler);
                this.eventListeners.set(slider, handler);
            }
        };
        
        updateValueDisplay(masterSlider, 'masterVolumeValue');
        updateValueDisplay(musicSlider, 'musicVolumeValue');
        updateValueDisplay(sfxSlider, 'sfxVolumeValue');
    }
    
    /**
     * Set volume for a specific type
     */
    setVolume(type, value) {
        const clampedValue = Math.max(0, Math.min(1, value));
        this.settings[`${type}Volume`] = clampedValue;
        
        // Update AudioManager
        if (this.audioManager) {
            switch (type) {
                case 'master':
                    this.audioManager.setMasterVolume(clampedValue);
                    break;
                case 'music':
                    this.audioManager.setMusicVolume(clampedValue);
                    break;
                case 'sfx':
                    this.audioManager.setSFXVolume(clampedValue);
                    break;
            }
        }
        
        // Update UI
        this.updateVolumeDisplay(type, clampedValue);
    }
    
    /**
     * Adjust master volume by delta
     */
    adjustMasterVolume(delta) {
        const newVolume = this.settings.masterVolume + delta;
        this.setVolume('master', newVolume);
    }
    
    /**
     * Toggle audio on/off
     */
    toggleAudio() {
        this.settings.audioEnabled = !this.settings.audioEnabled;
        
        if (this.audioManager) {
            this.audioManager.toggleAudio(this.settings.audioEnabled);
        }
        
        this.updateStaticSettingsDisplay();
        console.log(`Audio ${this.settings.audioEnabled ? 'enabled' : 'disabled'}`);
        
        return this.settings.audioEnabled;
    }
    
    /**
     * Toggle key sounds
     */
    toggleKeySounds() {
        this.settings.keySounds = !this.settings.keySounds;
        
        // Update SFX manager if needed
        if (this.audioManager && this.audioManager.sfxManager) {
            this.audioManager.sfxManager.setEnabled(this.settings.keySounds);
        }
        
        this.updateStaticSettingsDisplay();
        console.log(`Key sounds ${this.settings.keySounds ? 'enabled' : 'disabled'}`);
        
        return this.settings.keySounds;
    }
    
    /**
     * Update volume display
     */
    updateVolumeDisplay(type, value) {
        const slider = document.getElementById(`${type}Volume`);
        const valueDisplay = document.getElementById(`${type}VolumeValue`);
        
        if (slider) {
            slider.value = value * 100;
        }
        
        if (valueDisplay) {
            valueDisplay.textContent = `${Math.round(value * 100)}%`;
        }
    }
    
    /**
     * Update all UI elements
     */
    updateAllUI() {
        this.updateStaticSettingsDisplay();
        
        // Update volume sliders
        this.updateVolumeDisplay('master', this.settings.masterVolume);
        this.updateVolumeDisplay('music', this.settings.musicVolume);
        this.updateVolumeDisplay('sfx', this.settings.sfxVolume);
    }
    
    /**
     * Get current settings
     */
    getSettings() {
        return { ...this.settings };
    }
    
    /**
     * Apply settings object
     */
    applySettings(newSettings) {
        Object.assign(this.settings, newSettings);
        
        // Apply to AudioManager
        if (this.audioManager) {
            this.audioManager.setMasterVolume(this.settings.masterVolume);
            this.audioManager.setMusicVolume(this.settings.musicVolume);
            this.audioManager.setSFXVolume(this.settings.sfxVolume);
            this.audioManager.toggleAudio(this.settings.audioEnabled);
        }
        
        this.updateAllUI();
    }
    
    /**
     * Reset settings to defaults
     */
    resetToDefaults() {
        this.applySettings({
            masterVolume: 1.0,
            musicVolume: 1.0,
            sfxVolume: 1.0,
            audioEnabled: true,
            keySounds: true,
            effectsLevel: 'high'
        });
    }
    
    /**
     * Cleanup and dispose resources
     */
    dispose() {
        // Remove all event listeners
        this.eventListeners.forEach((handler, element) => {
            if (element === document) {
                document.removeEventListener('keydown', handler);
            } else if (element === window) {
                window.removeEventListener('storage', handler);
            } else {
                element.removeEventListener('input', handler);
                element.removeEventListener('change', handler);
                element.removeEventListener('click', handler);
            }
        });
        
        this.eventListeners.clear();
        this.audioManager = null;
    }
}

// Export for use as module or global
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SettingsManager };
} else {
    window.SettingsManager = SettingsManager;
}