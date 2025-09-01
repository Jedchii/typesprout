/**
 * AudioManager - Singleton class for managing all audio functionality
 * Handles cross-section audio management, state persistence, and integration
 */
class AudioManager {
    static instance = null;
    
    constructor() {
        // Cross-page singleton persistence using global storage
        if (!AudioManager.instance && typeof window !== 'undefined') {
            // Check if there's a cross-page reference
            const globalKey = '__typesprout_audio_manager__';
            if (window[globalKey]) {
                AudioManager.instance = window[globalKey];
                console.log('🔊 AUDIOMANAGER SINGLETON: Restored cross-page instance', {
                    url: window.location.href,
                    timestamp: Date.now()
                });
                return AudioManager.instance;
            }
        }
        
        if (AudioManager.instance) {
            console.log('🔊 AUDIOMANAGER SINGLETON: Returning existing instance', {
                url: window.location.href,
                existingInstance: !!AudioManager.instance,
                isInitialized: AudioManager.instance.isInitialized
            });
            return AudioManager.instance;
        }
        
        console.log('🔊 AUDIOMANAGER SINGLETON: Creating new instance', {
            url: window.location.href,
            timestamp: Date.now()
        });
        
        AudioManager.instance = this;
        
        // Store globally for cross-page persistence
        if (typeof window !== 'undefined') {
            window['__typesprout_audio_manager__'] = this;
        }
        
        // Initialize managers
        this.musicManager = null;
        this.sfxManager = null;
        this.settingsManager = null;
        this.activationOverlay = null;
        
        // Audio state
        this.currentSection = 'unknown';
        this.isInitialized = false;
        this.audioContext = null;
        this.isAudioActivated = false;
        
        // Chrome autoplay policy compliance
        this._initializationPromise = null;
        this._queuedSectionChange = null;
        
        // Settings
        this.masterVolume = 1.0;
        this.musicVolume = 1.0;
        this.sfxVolume = 1.0;
        this.audioEnabled = true;
        
        // SPA: No cross-page coordination needed
        this.isCoordinator = true; // Always coordinator in SPA
        
        // Load saved state
        this.loadState();
        
        // Initialize audio activation overlay
        this.initializeActivationOverlay();
    }
    
    /**
     * Get singleton instance
     */
    static getInstance() {
        if (!AudioManager.instance) {
            new AudioManager();
        }
        return AudioManager.instance;
    }
    
    /**
     * Initialize the audio system
     */
    async initialize() {
        if (this.isInitialized) {
            console.log('🔊 AudioManager already initialized');
            return;
        }
        
        // Prevent multiple concurrent initializations
        if (this._initializationPromise) {
            console.log('🔊 AudioManager initialization already in progress, waiting...');
            return await this._initializationPromise;
        }
        
        console.log('🔊 Starting AudioManager initialization...');
        
        // Create initialization promise to prevent concurrent calls
        this._initializationPromise = this._doInitialize();
        
        try {
            await this._initializationPromise;
        } finally {
            this._initializationPromise = null;
        }
    }
    
    /**
     * Internal initialization method
     */
    async _doInitialize() {
        
        try {
            // Access globally loaded manager classes with detailed logging
            console.log('📦 Accessing manager classes...');
            
            let MusicManager, SFXManager, SettingsManager;
            
            try {
                console.log('📦 Accessing MusicManager...');
                MusicManager = window.MusicManager;
                if (!MusicManager) {
                    throw new Error('MusicManager not found in window object');
                }
                console.log('✅ MusicManager accessed successfully');
            } catch (error) {
                console.error('❌ Failed to access MusicManager:', error);
                throw new Error('MusicManager access failed: ' + error.message);
            }
            
            try {
                console.log('📦 Accessing SFXManager...');
                SFXManager = window.SFXManager;
                if (!SFXManager) {
                    throw new Error('SFXManager not found in window object');
                }
                console.log('✅ SFXManager accessed successfully');
            } catch (error) {
                console.error('❌ Failed to access SFXManager:', error);
                throw new Error('SFXManager access failed: ' + error.message);
            }
            
            try {
                console.log('📦 Accessing SettingsManager...');
                SettingsManager = window.SettingsManager;
                if (!SettingsManager) {
                    throw new Error('SettingsManager not found in window object');
                }
                console.log('✅ SettingsManager accessed successfully');
            } catch (error) {
                console.error('❌ Failed to access SettingsManager:', error);
                throw new Error('SettingsManager access failed: ' + error.message);
            }
            
            console.log('🏗️ Creating manager instances...');
            this.musicManager = new MusicManager(this);
            console.log('✅ MusicManager instance created');
            
            this.sfxManager = new SFXManager(this);
            console.log('✅ SFXManager instance created');
            
            this.settingsManager = new SettingsManager(this);
            console.log('✅ SettingsManager instance created');
            
            // Initialize activation overlay
            if (window.AudioActivationOverlay && !this.activationOverlay) {
                this.activationOverlay = new window.AudioActivationOverlay(this);
                console.log('✅ AudioActivationOverlay instance created');
            }
            
            // Detect current section
            console.log('🔍 Detecting current section...');
            this.detectCurrentSection();
            console.log('✅ Current section detected:', this.currentSection);
            
            // Initialize all managers with individual error handling
            console.log('🚀 Initializing managers...');
            
            try {
                console.log('🎵 Initializing MusicManager...');
                await this.musicManager.initialize();
                console.log('✅ MusicManager initialized successfully');
            } catch (error) {
                console.error('❌ MusicManager initialization failed:', error);
                throw new Error('MusicManager initialization failed: ' + error.message);
            }
            
            try {
                console.log('🔊 Initializing SFXManager...');
                await this.sfxManager.initialize();
                console.log('✅ SFXManager initialized successfully');
            } catch (error) {
                console.error('❌ SFXManager initialization failed:', error);
                throw new Error('SFXManager initialization failed: ' + error.message);
            }
            
            try {
                console.log('⚙️ Initializing SettingsManager...');
                await this.settingsManager.initialize();
                console.log('✅ SettingsManager initialized successfully');
            } catch (error) {
                console.error('❌ SettingsManager initialization failed:', error);
                throw new Error('SettingsManager initialization failed: ' + error.message);
            }
            
            this.isInitialized = true;
            
            // Restore enhanced music state if available
            if (this.savedMusicState && this.musicManager) {
                this.musicManager.titleMusicStarted = this.savedMusicState.titleMusicStarted;
                this.musicManager.savedTitlePosition = this.savedMusicState.savedTitlePosition;
                this.musicManager.currentMusicType = this.savedMusicState.musicType;
                console.log('🎵 Restored enhanced music state to MusicManager');
            }
            
            console.log('✅ AudioManager initialized successfully');
            
            console.log('🔊 AUDIOMANAGER POST-INIT OVERLAY CHECK:', {
                hasOverlay: !!this.activationOverlay,
                shouldShow: this.activationOverlay?.shouldShow(),
                isActivated: this.isAudioActivated,
                url: window.location.href
            });
            
            // Chrome Autoplay Policy Compliance: Only show overlay or start music after user gesture
            if (this.activationOverlay && this.activationOverlay.shouldShow()) {
                console.log('🔊 ❌ SHOWING OVERLAY: AudioManager determined overlay should show');
                this.activationOverlay.show();
            } else if (this.isAudioActivated) {
                // Audio was already activated in previous session
                console.log('🎵 ✅ SPA: Audio already activated - starting music automatically');
                console.log('🎵 Current section for auto-resume:', this.currentSection);
                
                // Initialize audio context first
                this.initializeAudioContext();
                
                // Enhanced auto-resume logic for SPA
                this.attemptNavigationMusicResume();
            } else {
                console.log('🔊 ⚠️ Audio not yet activated - music will start after user interaction');
            }
            
        } catch (error) {
            console.error('❌ CRITICAL: Failed to initialize AudioManager:', error);
            console.error('❌ Error details:', {
                message: error.message,
                stack: error.stack,
                type: error.constructor.name
            });
            throw error; // Re-throw to ensure calling code knows initialization failed
        }
    }
    
    /**
     * Initialize activation overlay system with enhanced timestamp checking
     */
    initializeActivationOverlay() {
        // Enhanced timing fix: Wait for localStorage to be fully accessible
        const checkActivation = () => {
            try {
                const activationTimestamp = localStorage.getItem('typesprout_audio_activation_timestamp');
                const sessionActivated = sessionStorage.getItem('typesprout_audio_activated');
                const localActivated = localStorage.getItem('typesprout_audio_activated_persistent');
                
                console.log('🔊 AUDIOMANAGER ACTIVATION CHECK:', {
                    url: window.location.href,
                    activationTimestamp,
                    timestampAge: activationTimestamp ? Math.round((Date.now() - parseInt(activationTimestamp)) / 1000 / 60 * 100) / 100 + ' minutes' : 'none',
                    sessionActivated,
                    localActivated,
                    currentActivatedState: this.isAudioActivated
                });
                
                if (this.isRecentActivation(activationTimestamp)) {
                    this.isAudioActivated = true;
                    console.log('🔊 ✅ AudioManager: Recent audio activation detected - skipping overlay (within 5 minutes)');
                    return true;
                }
                
                // Fallback to legacy boolean checking
                if (sessionActivated === 'true' || localActivated === 'true') {
                    this.isAudioActivated = true;
                    console.log('🔊 ✅ AudioManager: Legacy audio activation detected - skipping overlay');
                    return true;
                }
                
                console.log('🔊 ⚠️ AudioManager: No recent audio activation - overlay may be shown');
                return false;
            } catch (error) {
                console.warn('🔊 Storage access error, retrying...', error);
                return null; // Indicates retry needed
            }
        };
        
        // Immediate check
        const result = checkActivation();
        if (result !== null) return;
        
        // If storage not ready, retry with small delay
        console.log('🔊 Retrying activation check after storage initialization...');
        setTimeout(() => {
            checkActivation();
        }, 50);
    }
    
    /**
     * Check if activation timestamp is within the last 5 minutes
     */
    isRecentActivation(timestampString) {
        if (!timestampString) {
            return false;
        }
        
        try {
            const timestamp = parseInt(timestampString);
            if (isNaN(timestamp)) {
                return false;
            }
            
            const now = Date.now();
            const fiveMinutesInMs = 5 * 60 * 1000; // 5 minutes
            const timeDiff = now - timestamp;
            
            const isRecent = timeDiff >= 0 && timeDiff <= fiveMinutesInMs;
            
            console.log('🔊 AudioManager activation timestamp check:', {
                timestamp,
                now,
                timeDiffMs: timeDiff,
                timeDiffMinutes: Math.round(timeDiff / 1000 / 60 * 100) / 100,
                isRecent,
                fiveMinuteWindow: fiveMinutesInMs
            });
            
            return isRecent;
        } catch (error) {
            console.warn('🔊 AudioManager failed to parse activation timestamp:', error);
            return false;
        }
    }
    
    /**
     * Initialize audio context (called after user activation)
     */
    initializeAudioContext() {
        if (this.audioContext && this.audioContext.state !== 'closed') {
            console.log('🔊 Audio context already initialized');
            return Promise.resolve();
        }
        
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            console.log('🔊 Audio context initialized after activation');
            
            // Resume if suspended - Chrome requires this to be done in user gesture
            if (this.audioContext.state === 'suspended') {
                return this.audioContext.resume().then(() => {
                    console.log('🔊 Audio context resumed successfully');
                    return true;
                }).catch(error => {
                    console.warn('🔊 Audio context resume failed:', error);
                    return false;
                });
            }
            
            return Promise.resolve(true);
        } catch (error) {
            console.error('🔊 Failed to initialize audio context:', error);
            return Promise.resolve(false);
        }
    }
    
    /**
     * Activate audio system (called by overlay after user interaction)
     */
    async activateAudioSystem() {
        console.log('🔊 Audio system activated by user interaction');
        
        this.isAudioActivated = true;
        const timestamp = Date.now();
        
        // Initialize and resume audio context within user gesture
        const contextResumed = await this.initializeAudioContext();
        if (!contextResumed) {
            console.warn('🔊 Audio context failed to resume - audio may not work properly');
        }
        
        // Store activation status with timestamp for cross-page persistence
        sessionStorage.setItem('typesprout_audio_activated', 'true');
        localStorage.setItem('typesprout_audio_activated_persistent', 'true');
        localStorage.setItem('typesprout_audio_activation_timestamp', timestamp.toString());
        
        console.log('🔊 Audio activation status saved with timestamp:', timestamp);
        
        // Process any queued section changes now that audio is unlocked
        if (this._queuedSectionChange) {
            console.log('🔊 Processing queued section change:', this._queuedSectionChange);
            const queuedSection = this._queuedSectionChange;
            this._queuedSectionChange = null;
            this.handleSectionChange(queuedSection);
        } else if (this.isInitialized) {
            // Start music for current section
            this.attemptImmediateMusicStart();
        }
    }
    
    /**
     * SPA: No cross-page coordination needed
     */
    setupCrossPageCoordination() {
        // SPA: Always coordinator, no broadcast channel needed
        console.log('🔗 SPA: No cross-page coordination needed');
    }
    
    /**
     * SPA: No coordinator methods needed - single page application
     */
    
    /**
     * SPA: No broadcasting needed
     */
    broadcastAudioState() {
        // SPA: No broadcasting needed - single page application
        console.log('🎵 SPA: Audio state managed locally');
    }
    
    /**
     * Attempt to start music immediately (only after audio activation)
     */
    attemptImmediateMusicStart() {
        if (!this.musicManager) {
            return;
        }
        
        if (!this.isAudioActivated) {
            console.log('🎵 Audio not yet activated - music start will be delayed');
            return;
        }
        
        console.log('🎵 Attempting immediate music start');
        
        // Try to start music right away
        try {
            this.handleSectionChange(this.currentSection);
        } catch (error) {
            console.warn('Immediate music start failed:', error);
        }
    }
    
    /**
     * Enhanced music resume for navigation scenarios
     */
    attemptNavigationMusicResume() {
        if (!this.musicManager) {
            console.log('🎵 SPA NAVIGATION RESUME: Not ready - no music manager');
            return;
        }
        
        if (!this.isAudioActivated) {
            console.log('🎵 SPA NAVIGATION RESUME: Audio not activated');
            return;
        }
        
        console.log('🎵 SPA NAVIGATION RESUME: Starting music for section:', this.currentSection);
        console.log('🎵 SPA NAVIGATION RESUME: Saved music state:', this.savedMusicState);
        
        // Small delay to ensure audio context is ready
        setTimeout(async () => {
            try {
                // For title_screen sections (SPA navigation), auto-resume music
                if (this.currentSection === 'title_screen') {
                    console.log('🎵 SPA NAVIGATION RESUME: Auto-starting title screen music');
                    
                    // Force music start even if no previous track
                    await this.musicManager.transitionToSection(this.currentSection);
                    
                    console.log('🎵 SPA NAVIGATION RESUME: Title screen music started successfully');
                } else {
                    // For other sections, use normal transition logic
                    this.handleSectionChange(this.currentSection);
                }
            } catch (error) {
                console.error('🎵 SPA NAVIGATION RESUME: Failed to resume music:', error);
            }
        }, 100);
    }
    
    /**
     * Detect current section based on URL and DOM
     */
    detectCurrentSection() {
        const url = window.location.href;
        const path = window.location.pathname;
        const filename = path.split('/').pop();
        
        console.log('🔍 SECTION DETECTION DEBUG:', {
            url: url,
            path: path,
            filename: filename,
            currentSection: this.currentSection
        });
        
        // Check URL patterns with detailed logging
        if (url.includes('mainmenu') || path.includes('mainmenu') || path.includes('Main Menu') || filename === 'mainmenu.html') {
            this.currentSection = 'title_screen';
            console.log('🎯 MAINMENU DETECTED as title_screen');
        } else if (url.includes('game') || path.includes('Main Game') || filename === 'game.html') {
            // Only actual Main Game uses battle music
            this.currentSection = 'battle';
            console.log('🎯 GAME DETECTED as battle');
        } else if (url.includes('treedex') || path.includes('TreeDex') || url.includes('Forest') || url.includes('settings')) {
            // TreeDex, Forest, and Settings continue with title screen music
            this.currentSection = 'title_screen';
            console.log('🎯 OTHER PAGE DETECTED as title_screen');
        } else if (filename === 'index.html' || path.includes('index')) {
            this.currentSection = 'title_screen';
            console.log('🎯 INDEX DETECTED as title_screen');
        } else {
            // Fallback: check for specific elements
            if (document.querySelector('.main-menu') || document.querySelector('#mainMenu') || document.querySelector('.menu-container')) {
                this.currentSection = 'title_screen';
                console.log('🎯 ELEMENT DETECTED as title_screen (menu elements found)');
            } else if (document.querySelector('.game-container') || document.querySelector('#gameArea')) {
                this.currentSection = 'battle';
                console.log('🎯 ELEMENT DETECTED as battle (game elements found)');
            } else {
                // Default to title screen
                this.currentSection = 'title_screen';
                console.log('🎯 FALLBACK to title_screen');
            }
        }
        
        console.log('✅ Final detected section:', this.currentSection);
    }
    
    /**
     * Handle section changes with cross-page coordination
     */
    handleSectionChange(newSection) {
        if (!this.isInitialized) {
            console.warn('AudioManager not initialized yet');
            return;
        }
        
        console.log(`🎵 NAVIGATION DEBUG: handleSectionChange called: ${this.currentSection} → ${newSection}`);
        
        const previousSection = this.currentSection;
        this.currentSection = newSection;
        
        // Save state
        this.saveState();
        
        // DEBUG: Check current music state before any changes
        if (this.musicManager && this.musicManager.currentTrack) {
            console.log('🎵 PRE-TRANSITION MUSIC STATE:', {
                isPlaying: !this.musicManager.currentTrack.paused,
                currentTime: this.musicManager.currentTrack.currentTime,
                volume: this.musicManager.currentTrack.volume,
                src: this.musicManager.currentTrack.src,
                musicType: this.musicManager.currentMusicType
            });
        } else {
            console.log('🎵 PRE-TRANSITION: No current track playing');
        }
        
        // SPA: Always manage music transitions directly
        if (this.musicManager) {
            console.log('🎵 SPA: Handling music transition');
            
            // Chrome Autoplay Policy: Queue section changes until audio is activated
            if (!this.isAudioActivated) {
                console.log('🔊 Audio not activated yet - queueing section change for after user interaction');
                this._queuedSectionChange = newSection;
                
                // Show activation overlay if we need user interaction
                if (this.activationOverlay && this.activationOverlay.shouldShow()) {
                    console.log('🔊 Showing audio activation overlay for section transition');
                    this.activationOverlay.show();
                }
                return;
            }
            
            const shouldTransitionMusic = this.shouldTransitionMusic(previousSection, newSection);
            
            console.log(`🎵 SPA Music transition check:`, {
                previousSection,
                newSection,
                shouldTransitionMusic,
                isAudioActivated: this.isAudioActivated,
                hasCurrentTrack: !!this.musicManager.currentTrack,
                isPlaying: this.musicManager.currentTrack ? !this.musicManager.currentTrack.paused : false,
                currentMusicSection: this.musicManager.currentSection
            });
            
            if (shouldTransitionMusic) {
                console.log(`🎵 SPA: Triggering music transition to: ${newSection}`);
                this.musicManager.transitionToSection(newSection);
            } else {
                console.log(`🎵 SPA SEAMLESS CONTINUATION: No music transition needed - continuing current track`);
            }
        } else {
            console.warn('🎵 No MusicManager available for section change');
        }
        
        console.log(`✅ Section changed from ${previousSection} to ${newSection}`);
        
        // DEBUG: Check music state after transition
        setTimeout(() => {
            if (this.musicManager && this.musicManager.currentTrack) {
                console.log('🎵 POST-TRANSITION MUSIC STATE:', {
                    isPlaying: !this.musicManager.currentTrack.paused,
                    currentTime: this.musicManager.currentTrack.currentTime,
                    volume: this.musicManager.currentTrack.volume,
                    src: this.musicManager.currentTrack.src,
                    musicType: this.musicManager.currentMusicType
                });
            } else {
                console.log('🎵 POST-TRANSITION: No current track playing');
            }
        }, 1000);
    }
    
    /**
     * SPA: Direct transition to new section (no coordinator role needed)
     */
    async requestCoordinatorAndTransition(newSection) {
        console.log(`🎵 SPA: Direct transition to: ${newSection}`);
        
        if (!this.isInitialized) {
            console.warn('🎵 AudioManager not initialized yet - queuing section change');
            this.currentSection = newSection;
            this.saveState();
            return;
        }
        
        try {
            // SPA: Direct section change handling
            console.log('🎵 SPA: Handling section transition directly...');
            this.handleSectionChange(newSection);
            
        } catch (error) {
            console.error('🎵 Failed to transition section:', error);
            // Fallback: at least update our section
            this.currentSection = newSection;
            this.saveState();
        }
    }
    
    /**
     * Determine if music should transition based on section changes
     */
    shouldTransitionMusic(previousSection, newSection) {
        // Always start music if none is playing
        if (!this.musicManager.currentTrack || this.musicManager.currentTrack.paused) {
            return true;
        }
        
        // Determine the music type for each section
        const getMusicType = (section) => {
            return section === 'battle' ? 'battle' : 'title_screen';
        };
        
        const previousMusicType = getMusicType(previousSection);
        const newMusicType = getMusicType(newSection);
        
        // Only transition if the music type actually changes
        const shouldTransition = previousMusicType !== newMusicType;
        
        console.log(`🎵 Music type analysis:`, {
            previousSection,
            newSection,
            previousMusicType,
            newMusicType,
            shouldTransition
        });
        
        return shouldTransition;
    }
    
    /**
     * Load state from localStorage with enhanced music position tracking
     */
    loadState() {
        try {
            const savedState = localStorage.getItem('typesprout_audio_state');
            if (savedState) {
                const state = JSON.parse(savedState);
                this.masterVolume = state.masterVolume ?? 1.0;
                this.musicVolume = state.musicVolume ?? 1.0;
                this.sfxVolume = state.sfxVolume ?? 1.0;
                this.audioEnabled = state.audioEnabled ?? true;
                this.currentSection = state.currentSection ?? 'title_screen';
                
                // Store enhanced music state for later restoration
                this.savedMusicState = {
                    musicType: state.musicType,
                    titleMusicStarted: state.titleMusicStarted ?? false,
                    savedTitlePosition: state.savedTitlePosition ?? 0
                };
                
                console.log('Audio state loaded from localStorage with music continuity data');
                console.log('🎵 Saved music state:', this.savedMusicState);
            }
        } catch (error) {
            console.warn('Failed to load audio state:', error);
        }
    }
    
    /**
     * Save state to localStorage with enhanced music position tracking
     */
    saveState() {
        try {
            const musicInfo = this.musicManager ? this.musicManager.getCurrentInfo() : {};
            
            const state = {
                masterVolume: this.masterVolume,
                musicVolume: this.musicVolume,
                sfxVolume: this.sfxVolume,
                audioEnabled: this.audioEnabled,
                currentSection: this.currentSection,
                // Enhanced music state persistence
                musicType: musicInfo.musicType,
                titleMusicStarted: musicInfo.titleMusicStarted,
                savedTitlePosition: musicInfo.savedTitlePosition,
                timestamp: Date.now()
            };
            
            localStorage.setItem('typesprout_audio_state', JSON.stringify(state));
        } catch (error) {
            console.warn('Failed to save audio state:', error);
        }
    }
    
    /**
     * Set master volume
     */
    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
        this.updateAllVolumes();
        this.saveState();
    }
    
    /**
     * Set music volume
     */
    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        this.updateAllVolumes();
        this.saveState();
    }
    
    /**
     * Set SFX volume
     */
    setSFXVolume(volume) {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
        this.updateAllVolumes();
        this.saveState();
    }
    
    /**
     * Toggle audio on/off
     */
    toggleAudio(enabled = null) {
        if (enabled !== null) {
            this.audioEnabled = enabled;
        } else {
            this.audioEnabled = !this.audioEnabled;
        }
        
        this.updateAllVolumes();
        this.saveState();
        
        return this.audioEnabled;
    }
    
    /**
     * Update volumes across all managers
     */
    updateAllVolumes() {
        const effectiveMasterVolume = this.audioEnabled ? this.masterVolume : 0;
        
        if (this.musicManager) {
            this.musicManager.setVolume(this.musicVolume * effectiveMasterVolume);
        }
        
        if (this.sfxManager) {
            this.sfxManager.setVolume(this.sfxVolume * effectiveMasterVolume);
        }
    }
    
    /**
     * Get current volumes
     */
    getVolumes() {
        return {
            master: this.masterVolume,
            music: this.musicVolume,
            sfx: this.sfxVolume,
            enabled: this.audioEnabled
        };
    }
    
    /**
     * Play button sound effect
     */
    playButtonSound() {
        if (this.sfxManager) {
            this.sfxManager.playButtonSound();
        }
    }
    
    /**
     * Cleanup and dispose resources
     */
    dispose() {
        // SPA: Simplified cleanup - no coordinator heartbeat or broadcast channel
        
        if (this.musicManager) {
            this.musicManager.dispose();
        }
        
        if (this.sfxManager) {
            this.sfxManager.dispose();
        }
        
        if (this.audioContext) {
            this.audioContext.close();
        }
        
        // Dispose overlay
        if (this.activationOverlay) {
            this.activationOverlay.dispose();
            this.activationOverlay = null;
        }
        
        AudioManager.instance = null;
    }
}

// Export for use as module or global
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AudioManager;
} else {
    window.AudioManager = AudioManager;
}