/**
 * AudioActivationOverlay - Full-screen overlay that ensures audio starts properly after user interaction
 * Guarantees browser audio compliance by executing play() calls inside user gestures
 */
class AudioActivationOverlay {
    constructor(audioManager) {
        this.audioManager = audioManager;
        this.overlay = null;
        this.isAudioUnlocked = false;
        this.hasBeenActivated = false;
        
        // Check if audio was already activated this session
        this.checkActivationStatus();
        
        // Cross-page coordination
        this.setupCrossPageCoordination();
    }
    
    /**
     * Check if audio has already been activated this session with timestamp validation
     */
    checkActivationStatus() {
        // Enhanced timing fix: Ensure storage is accessible before checking
        const performCheck = () => {
            try {
                const sessionActivated = sessionStorage.getItem('typesprout_audio_activated');
                const localActivated = localStorage.getItem('typesprout_audio_activated_persistent');
                const activationTimestamp = localStorage.getItem('typesprout_audio_activation_timestamp');
                
                console.log('🔊 OVERLAY ACTIVATION CHECK:', {
                    url: window.location.href,
                    sessionActivated,
                    localActivated,
                    activationTimestamp,
                    timestampAge: activationTimestamp ? Math.round((Date.now() - parseInt(activationTimestamp)) / 1000 / 60 * 100) / 100 + ' minutes' : 'none',
                    hasAudioManager: !!window.audioManager,
                    audioManagerActivated: window.audioManager?.isAudioActivated || 'unknown',
                    globalManagerExists: !!window['__typesprout_audio_manager__']
                });
                
                // Check cross-page AudioManager first
                const globalManager = window['__typesprout_audio_manager__'];
                if (globalManager && globalManager.isAudioActivated) {
                    this.hasBeenActivated = true;
                    this.isAudioUnlocked = true;
                    console.log('🔊 ✅ Cross-page AudioManager activation detected - skipping overlay');
                    return true;
                }
                
                // Check for recent activation (within last 5 minutes)
                if (this.isRecentActivation(activationTimestamp)) {
                    this.hasBeenActivated = true;
                    this.isAudioUnlocked = true;
                    console.log('🔊 ✅ Recent audio activation detected - skipping overlay');
                    return true;
                }
                
                // Fallback to legacy boolean checking
                if (sessionActivated === 'true' || localActivated === 'true') {
                    this.hasBeenActivated = true;
                    this.isAudioUnlocked = true;
                    console.log('🔊 ✅ Legacy audio activation detected - skipping overlay');
                    return true;
                } else {
                    console.log('🔊 ⚠️ No activation detected - overlay may be needed');
                    return false;
                }
            } catch (error) {
                console.warn('🔊 Storage access error in overlay check:', error);
                return null; // Retry needed
            }
        };
        
        // Immediate check
        const result = performCheck();
        if (result !== null) return;
        
        // If storage not ready, retry after short delay
        console.log('🔊 Overlay retrying activation check after storage initialization...');
        setTimeout(() => {
            performCheck();
        }, 100);
    }
    
    /**
     * Check if activation timestamp is within the last 5 minutes
     */
    isRecentActivation(timestampString) {
        if (!timestampString) {
            console.log('🔊 No timestamp found - not recent');
            return false;
        }
        
        try {
            const timestamp = parseInt(timestampString);
            if (isNaN(timestamp)) {
                console.log('🔊 Invalid timestamp format - not recent');
                return false;
            }
            
            const now = Date.now();
            const fiveMinutesInMs = 5 * 60 * 1000; // 5 minutes
            const timeDiff = now - timestamp;
            
            // More lenient check - ensure we're not dealing with future timestamps due to clock skew
            const isRecent = timeDiff >= -30000 && timeDiff <= fiveMinutesInMs; // Allow 30s clock skew
            
            console.log('🔊 ✅ ENHANCED Activation timestamp check:', {
                timestampString,
                timestamp,
                now,
                timeDiffMs: timeDiff,
                timeDiffSeconds: Math.round(timeDiff / 1000 * 100) / 100,
                timeDiffMinutes: Math.round(timeDiff / 1000 / 60 * 100) / 100,
                isRecent,
                fiveMinuteWindow: fiveMinutesInMs,
                clockSkewAllowed: '30s',
                url: window.location.href
            });
            
            return isRecent;
        } catch (error) {
            console.warn('🔊 Failed to parse activation timestamp:', error);
            return false;
        }
    }
    
    /**
     * Setup cross-page coordination for activation status
     */
    setupCrossPageCoordination() {
        try {
            this.broadcastChannel = new BroadcastChannel('typesprout_audio_activation');
            
            this.broadcastChannel.onmessage = (event) => {
                if (event.data.type === 'audio_activated') {
                    this.hasBeenActivated = true;
                    this.isAudioUnlocked = true;
                    this.hideOverlay();
                }
            };
        } catch (error) {
            console.warn('BroadcastChannel not supported for audio activation coordination');
        }
    }
    
    /**
     * Show the audio activation overlay
     */
    show() {
        console.log('🔊 SHOW() CALLED - DIAGNOSTIC TRACE:', {
            url: window.location.href,
            hasBeenActivated: this.hasBeenActivated,
            isAudioUnlocked: this.isAudioUnlocked,
            overlayExists: !!this.overlay,
            callStack: new Error().stack?.split('\n').slice(1, 5).join(' <- ')
        });
        
        // Don't show if already activated or audio is already unlocked
        if (this.hasBeenActivated || this.isAudioUnlocked || this.overlay) {
            console.log('🔊 ✅ Audio activation overlay not needed - already activated');
            return false;
        }
        
        // Enhanced double-check with robust timestamp validation
        const activationTimestamp = localStorage.getItem('typesprout_audio_activation_timestamp');
        const sessionFlag = sessionStorage.getItem('typesprout_audio_activated');
        const localFlag = localStorage.getItem('typesprout_audio_activated_persistent');
        
        console.log('🔊 SHOW() FINAL VALIDATION:', {
            activationTimestamp,
            sessionFlag,
            localFlag,
            url: window.location.href
        });
        
        // Check timestamp first (most reliable)
        if (this.isRecentActivation(activationTimestamp)) {
            console.log('🔊 ✅ Recent activation detected in show() - SKIPPING OVERLAY');
            this.hasBeenActivated = true;
            this.isAudioUnlocked = true;
            return false;
        }
        
        // Fallback to boolean flags
        if (sessionFlag === 'true' || localFlag === 'true') {
            console.log('🔊 ✅ Boolean flag activation detected in show() - SKIPPING OVERLAY');
            this.hasBeenActivated = true;
            this.isAudioUnlocked = true;
            return false;
        }
        
        console.log('🔊 ❌ SHOWING AUDIO ACTIVATION OVERLAY - NO ACTIVATION DETECTED');
        
        this.createOverlay();
        this.setupEventListeners();
        document.body.appendChild(this.overlay);
        
        // Force focus for accessibility
        setTimeout(() => {
            const button = this.overlay.querySelector('.audio-activation-button');
            if (button) {
                button.focus();
            }
        }, 100);
        
        return true;
    }
    
    /**
     * Create the overlay HTML structure
     */
    createOverlay() {
        this.overlay = document.createElement('div');
        this.overlay.className = 'audio-activation-overlay';
        this.overlay.setAttribute('role', 'dialog');
        this.overlay.setAttribute('aria-modal', 'true');
        this.overlay.setAttribute('aria-labelledby', 'audio-title');
        this.overlay.setAttribute('aria-describedby', 'audio-message');
        
        this.overlay.innerHTML = `
            <div class="audio-activation-content">
                <div class="audio-activation-icon">🎵</div>
                <h1 id="audio-title" class="audio-activation-title">TypeSprout</h1>
                <p id="audio-message" class="audio-activation-message">
                    The game is played better with sounds – tap to start with audio.
                </p>
                <button class="audio-activation-button" type="button" aria-label="Activate audio and start game">
                    <span class="button-icon">🔊</span>
                    <span class="button-text">Start with Audio</span>
                </button>
                <p class="audio-activation-note">
                    Audio will enhance your gaming experience
                </p>
            </div>
        `;
    }
    
    /**
     * Setup event listeners for the overlay
     */
    setupEventListeners() {
        const button = this.overlay.querySelector('.audio-activation-button');
        const content = this.overlay.querySelector('.audio-activation-content');
        
        // Primary activation handler - must be called within user gesture
        const activateAudio = async (event) => {
            event.preventDefault();
            event.stopPropagation();
            
            console.log('🔊 Audio activation triggered by user interaction');
            
            try {
                // Show loading state
                button.classList.add('loading');
                button.disabled = true;
                button.innerHTML = `
                    <span class="button-icon">⏳</span>
                    <span class="button-text">Starting Audio...</span>
                `;
                
                // Execute audio unlock inside the user gesture - CRITICAL for Chrome
                const unlockSuccess = await this.unlockAudioSystem();
                
                if (!unlockSuccess) {
                    console.warn('🔊 Audio context unlock failed, but continuing');
                }
                
                // Activate the audio system in AudioManager
                if (this.audioManager && typeof this.audioManager.activateAudioSystem === 'function') {
                    await this.audioManager.activateAudioSystem();
                } else {
                    console.warn('🔊 AudioManager activateAudioSystem not available');
                }
                
                // Mark as activated immediately to prevent race conditions
                this.markAsActivated();
                
                // Show success state briefly
                button.innerHTML = `
                    <span class="button-icon">✅</span>
                    <span class="button-text">Audio Ready!</span>
                `;
                
                // Hide overlay with animation after brief success display
                setTimeout(() => {
                    this.hideOverlayWithAnimation();
                }, 800);
                
                console.log('🔊 Audio activation completed successfully');
                
            } catch (error) {
                console.error('🔊 Audio activation failed:', error);
                
                // Show error state briefly, then hide anyway to avoid blocking UI
                button.innerHTML = `
                    <span class="button-icon">⚠️</span>
                    <span class="button-text">Audio Issue - Continuing</span>
                `;
                
                setTimeout(() => {
                    // Mark as activated even on error to prevent repeated prompts
                    this.markAsActivated();
                    this.hideOverlayWithAnimation();
                }, 1500);
            }
        };
        
        // Multiple activation triggers for maximum compatibility
        button.addEventListener('click', activateAudio);
        button.addEventListener('touchend', activateAudio);
        
        // Keyboard support
        this.overlay.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                activateAudio(event);
            } else if (event.key === 'Escape') {
                // Allow escape to skip audio (fallback)
                this.markAsActivated();
                this.hideOverlayWithAnimation();
            }
        });
        
        // Prevent any clicks from going through the overlay
        this.overlay.addEventListener('click', (event) => {
            if (event.target === this.overlay) {
                // Clicking outside the content area activates audio
                activateAudio(event);
            }
        });
        
        // Prevent scrolling and other interactions
        this.overlay.addEventListener('wheel', (event) => {
            event.preventDefault();
        });
        
        this.overlay.addEventListener('touchmove', (event) => {
            event.preventDefault();
        });
    }
    
    /**
     * Unlock the audio system inside a user gesture
     */
    async unlockAudioSystem() {
        console.log('🔊 Unlocking audio context inside user gesture...');
        
        try {
            let audioContext = this.audioManager.audioContext;
            
            // Create new context if needed
            if (!audioContext || audioContext.state === 'closed') {
                console.log('🔊 Creating new AudioContext...');
                audioContext = new (window.AudioContext || window.webkitAudioContext)();
                this.audioManager.audioContext = audioContext;
                console.log('🔊 New audio context created:', audioContext.state);
            }
            
            // Resume audio context if suspended - MUST be done inside user gesture
            if (audioContext.state === 'suspended') {
                console.log('🔊 Resuming suspended AudioContext...');
                await audioContext.resume();
                console.log('🔊 Audio context resumed, new state:', audioContext.state);
            }
            
            // Test audio context is working
            if (audioContext.state !== 'running') {
                console.warn('🔊 AudioContext not running after unlock attempt:', audioContext.state);
                return false;
            }
            
            // Create a brief test sound to ensure audio is truly unlocked
            await this.createTestSound(audioContext);
            
            this.isAudioUnlocked = true;
            console.log('🔊 Audio system successfully unlocked');
            return true;
            
        } catch (error) {
            console.error('🔊 Failed to unlock audio system:', error);
            return false;
        }
    }
    
    /**
     * Create a brief test sound to verify audio unlock
     */
    async createTestSound(audioContext) {
        try {
            console.log('🔊 Creating test sound to verify audio unlock...');
            
            // Create a very brief, quiet test tone
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
            gainNode.gain.setValueAtTime(0.001, audioContext.currentTime); // Very quiet
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.01); // 10ms test sound
            
            console.log('🔊 Test sound created successfully');
            
        } catch (error) {
            console.warn('🔊 Test sound creation failed (non-critical):', error);
        }
    }
    
    /**
     * Mark audio as activated across all pages
     */
    markAsActivated() {
        this.hasBeenActivated = true;
        this.isAudioUnlocked = true;
        
        const timestamp = Date.now();
        
        // Store in both session and local storage with timestamp
        sessionStorage.setItem('typesprout_audio_activated', 'true');
        localStorage.setItem('typesprout_audio_activated_persistent', 'true');
        localStorage.setItem('typesprout_audio_activation_timestamp', timestamp.toString());
        
        // Broadcast to other pages with timestamp
        if (this.broadcastChannel) {
            this.broadcastChannel.postMessage({
                type: 'audio_activated',
                timestamp: timestamp
            });
        }
        
        console.log('🔊 Audio activation status saved with timestamp:', timestamp);
    }
    
    /**
     * Hide overlay with smooth animation
     */
    hideOverlayWithAnimation() {
        if (!this.overlay) return;
        
        this.overlay.classList.add('hiding');
        
        // Wait for animation to complete
        setTimeout(() => {
            this.hideOverlay();
        }, 600);
    }
    
    /**
     * Hide the overlay immediately
     */
    hideOverlay() {
        if (!this.overlay) return;
        
        if (this.overlay.parentNode) {
            this.overlay.parentNode.removeChild(this.overlay);
        }
        
        this.overlay = null;
        
        // Re-enable scrolling
        document.body.style.overflow = '';
        
        console.log('🔊 Audio activation overlay hidden');
    }
    
    /**
     * Check if overlay should be shown
     */
    shouldShow() {
        console.log('🔊 SHOULD_SHOW() DIAGNOSTIC:', {
            url: window.location.href,
            hasBeenActivated: this.hasBeenActivated,
            isAudioUnlocked: this.isAudioUnlocked,
            overlayExists: !!this.overlay,
            audioManagerInstance: !!window.audioManager,
            audioManagerActivated: window.audioManager?.isAudioActivated || 'unknown'
        });
        
        // Don't show if already activated in this session
        if (this.hasBeenActivated || this.isAudioUnlocked) {
            console.log('🔊 ✅ shouldShow: false - already activated this session');
            return false;
        }
        
        // Don't show if overlay is already visible
        if (this.overlay) {
            console.log('🔊 ✅ shouldShow: false - overlay already visible');
            return false;
        }
        
        // Check for recent activation before showing
        const activationTimestamp = localStorage.getItem('typesprout_audio_activation_timestamp');
        if (this.isRecentActivation(activationTimestamp)) {
            console.log('🔊 ✅ shouldShow: false - recent activation detected');
            this.hasBeenActivated = true;
            this.isAudioUnlocked = true;
            return false;
        }
        
        // Check if we're in a secure context (required for some audio features)
        if (!window.isSecureContext) {
            console.warn('🔊 Not in secure context - some audio features may not work');
        }
        
        console.log('🔊 ❌ shouldShow: true - audio activation needed (NO RECENT ACTIVATION)');
        
        // Show overlay if audio needs user interaction for Chrome autoplay policy
        return true;
    }
    
    /**
     * Get activation status
     */
    isActivated() {
        return this.hasBeenActivated && this.isAudioUnlocked;
    }
    
    /**
     * Force show overlay (for testing)
     */
    forceShow() {
        console.log('🔊 Force showing audio activation overlay');
        this.hasBeenActivated = false;
        this.isAudioUnlocked = false;
        
        // Also reset AudioManager state
        if (this.audioManager) {
            this.audioManager.isAudioActivated = false;
        }
        
        return this.show();
    }
    
    /**
     * Reset activation status (for testing or after autoplay failure)
     */
    reset() {
        console.log('🔊 Resetting audio activation status');
        this.hasBeenActivated = false;
        this.isAudioUnlocked = false;
        sessionStorage.removeItem('typesprout_audio_activated');
        localStorage.removeItem('typesprout_audio_activated_persistent');
        localStorage.removeItem('typesprout_audio_activation_timestamp');
        this.hideOverlay();
        
        // Reset AudioManager activation status too
        if (this.audioManager) {
            this.audioManager.isAudioActivated = false;
        }
    }
    
    /**
     * Dispose and cleanup
     */
    dispose() {
        this.hideOverlay();
        
        if (this.broadcastChannel) {
            this.broadcastChannel.close();
            this.broadcastChannel = null;
        }
        
        this.audioManager = null;
    }
}

// Export for use as module or global
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AudioActivationOverlay;
} else {
    window.AudioActivationOverlay = AudioActivationOverlay;
}