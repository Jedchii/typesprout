/**
 * MusicManager - Handles background music with crossfading transitions
 * Manages Title_ScreenMusic.mp3 and BattleMusic.mp3 with smooth transitions
 */
class MusicManager {
    constructor(audioManager) {
        this.audioManager = audioManager;
        
        // Audio elements for crossfading
        this.currentTrack = null;
        this.nextTrack = null;
        
        // Music tracks
        this.tracks = {
            title_screen: null,
            battle: null
        };
        
        // Track URLs
        this.trackUrls = {
            title_screen: '../SFX/Title _ScreenMusic.mp3',
            battle: '../SFX/BattleMusic.mp3'
        };
        
        // State
        this.currentSection = null;
        this.volume = 1.0;
        this.isTransitioning = false;
        this.fadeInDuration = 2000; // 2 seconds
        this.fadeOutDuration = 2000; // 2 seconds
        
        // Enhanced state tracking for seamless continuity
        this.titleMusicStarted = false;
        this.savedTitlePosition = 0;
        this.currentMusicType = null; // 'title_screen' or 'battle'
        
        // Crossfade properties
        this.crossfadeInterval = null;
        this.crossfadeStep = 50; // milliseconds
        
        this.isInitialized = false;
    }
    
    /**
     * Initialize the music manager
     */
    async initialize() {
        if (this.isInitialized) {
            return;
        }
        
        try {
            await this.preloadTracks();
            this.setupTrackProperties();
            this.isInitialized = true;
            console.log('MusicManager initialized successfully');
        } catch (error) {
            console.error('Failed to initialize MusicManager:', error);
        }
    }
    
    /**
     * Preload all music tracks
     */
    async preloadTracks() {
        const loadPromises = Object.entries(this.trackUrls).map(([key, url]) => {
            return new Promise((resolve, reject) => {
                const audio = new Audio();
                
                audio.addEventListener('canplaythrough', () => {
                    this.tracks[key] = audio;
                    console.log(`Loaded music track: ${key}`);
                    resolve();
                }, { once: true });
                
                audio.addEventListener('error', (e) => {
                    console.error(`Failed to load music track ${key}:`, e);
                    // Create a silent fallback
                    this.tracks[key] = this.createSilentTrack();
                    resolve(); // Don't reject to allow other tracks to load
                });
                
                audio.preload = 'auto';
                audio.loop = true;
                audio.volume = 0;
                audio.src = url;
            });
        });
        
        await Promise.all(loadPromises);
    }
    
    /**
     * Create a silent fallback track
     */
    createSilentTrack() {
        const audio = new Audio();
        // Create a data URL for a silent audio file
        audio.src = 'data:audio/wav;base64,UklGRnoAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoAAAABAAEA';
        audio.loop = true;
        audio.volume = 0;
        return audio;
    }
    
    /**
     * Setup common properties for all tracks
     */
    setupTrackProperties() {
        Object.values(this.tracks).forEach(track => {
            if (track) {
                track.loop = true;
                track.volume = 0;
                
                // Handle track end (shouldn't happen with loop=true, but just in case)
                track.addEventListener('ended', () => {
                    if (track === this.currentTrack) {
                        this.restartCurrentTrack();
                    }
                });
                
                // Handle track errors during playback
                track.addEventListener('error', () => {
                    console.error('Audio playback error occurred');
                });
            }
        });
    }
    
    /**
     * Transition to a specific section's music with seamless continuation support
     */
    async transitionToSection(section) {
        if (!this.isInitialized) {
            console.warn('🎵 MusicManager not initialized');
            return;
        }
        
        console.log(`🎵 NAVIGATION MUSIC DEBUG: transitionToSection called with section: ${section}`);
        console.log(`🎵 Current state: musicType=${this.currentMusicType}, titleStarted=${this.titleMusicStarted}, section=${this.currentSection}`);
        
        // DEBUG: Current track state
        if (this.currentTrack) {
            console.log('🎵 CURRENT TRACK STATE:', {
                src: this.currentTrack.src,
                paused: this.currentTrack.paused,
                currentTime: this.currentTrack.currentTime,
                volume: this.currentTrack.volume,
                readyState: this.currentTrack.readyState
            });
        } else {
            console.log('🎵 NO CURRENT TRACK');
        }
        
        const targetTrack = this.tracks[section];
        if (!targetTrack) {
            console.warn(`🎵 No track found for section: ${section}`);
            return;
        }
        
        const targetMusicType = this.getMusicTypeForSection(section);
        console.log(`🎵 Target music type: ${targetMusicType}`);
        
        // **ENHANCED SEAMLESS CONTINUATION LOGIC**
        
        // Case 1: Same music type - continue playing seamlessly (no restart)
        if (this.currentMusicType === targetMusicType &&
            this.currentTrack && !this.currentTrack.paused) {
            console.log(`🎵 ✅ SEAMLESS CONTINUATION: keeping ${targetMusicType} music playing (${this.currentTrack.currentTime.toFixed(1)}s)`);
            this.currentSection = section;
            return;
        }
        
        // Case 2: No music playing - start appropriate music
        if (!this.currentTrack || this.currentTrack.paused) {
            console.log(`🎵 🚀 STARTING MUSIC: first time or after pause for ${targetMusicType}`);
            this.currentSection = section;
            this.currentMusicType = targetMusicType;
            
            if (targetMusicType === 'title_screen') {
                await this.startTitleMusicWithPosition();
            } else {
                await this.startTrack(targetTrack);
            }
            return;
        }
        
        // Case 3: Music type change - crossfade with position preservation
        console.log(`🎵 🔄 MUSIC TYPE CHANGE: ${this.currentMusicType} → ${targetMusicType}`);
        
        this.currentSection = section;
        
        if (this.currentMusicType === 'title_screen' && targetMusicType === 'battle') {
            // Save title music position before switching to battle
            this.saveTitleMusicPosition();
            await this.crossfadeWithPositionSave(this.currentTrack, targetTrack);
        } else if (this.currentMusicType === 'battle' && targetMusicType === 'title_screen') {
            // Resume title music from saved position
            await this.crossfadeToTitleMusicWithPosition(this.currentTrack, targetTrack);
        } else {
            // Regular crossfade
            await this.crossfadeTransition(this.currentTrack, targetTrack);
        }
        
        this.currentMusicType = targetMusicType;
        
        console.log(`🎵 ✅ TRANSITION COMPLETE: Now playing ${targetMusicType} for section ${section}`);
    }
    
    /**
     * Get music type for a section (for seamless continuation logic)
     */
    getMusicTypeForSection(section) {
        // Battle sections use battle music, everything else uses title screen music
        if (section === 'battle') {
            return 'battle';
        }
        return 'title_screen';
    }
    
    /**
     * Start title music with position preservation
     */
    async startTitleMusicWithPosition() {
        const titleTrack = this.tracks.title_screen;
        if (!titleTrack) return;
        
        console.log(`🎵 Starting title music - already started: ${this.titleMusicStarted}, saved position: ${this.savedTitlePosition}`);
        
        this.currentTrack = titleTrack;
        
        // Set position: use saved position if title music has been started before
        if (this.titleMusicStarted && this.savedTitlePosition > 0) {
            this.currentTrack.currentTime = this.savedTitlePosition;
            console.log(`🎵 Resuming title music from position: ${this.savedTitlePosition}s`);
        } else {
            this.currentTrack.currentTime = 0;
            this.titleMusicStarted = true;
            console.log('🎵 Starting title music from beginning (first time)');
        }
        
        this.currentTrack.volume = 0;
        
        try {
            await this.safePlayAudio(this.currentTrack);
            await this.fadeIn(this.currentTrack);
            console.log('🎵 Title music started successfully');
        } catch (error) {
            console.error('🎵 Failed to start title music:', error);
            this.handlePlaybackFailure(error, 'title music');
        }
    }
    
    /**
     * Start playing a track with fade in
     */
    async startTrack(track) {
        if (!track) {
            console.warn('🎵 startTrack called with null track');
            return;
        }
        
        console.log('🎵 Starting track...', track.src);
        
        this.currentTrack = track;
        this.currentTrack.currentTime = 0;
        this.currentTrack.volume = 0;
        
        try {
            await this.safePlayAudio(this.currentTrack);
            await this.fadeIn(this.currentTrack);
            console.log('🎵 Track started successfully');
        } catch (error) {
            console.error('🎵 Failed to start track:', error);
            this.handlePlaybackFailure(error, 'music track');
        }
    }
    
    /**
     * Save current title music position
     */
    saveTitleMusicPosition() {
        if (this.currentTrack && this.currentMusicType === 'title_screen') {
            this.savedTitlePosition = this.currentTrack.currentTime;
            console.log(`🎵 Saved title music position: ${this.savedTitlePosition}s`);
        }
    }
    
    /**
     * Crossfade with position save (title → battle)
     */
    async crossfadeWithPositionSave(fromTrack, toTrack) {
        if (this.isTransitioning) return;
        
        this.isTransitioning = true;
        this.nextTrack = toTrack;
        
        // Save title position before crossfade
        this.saveTitleMusicPosition();
        
        // Start battle music from beginning
        this.nextTrack.currentTime = 0;
        this.nextTrack.volume = 0;
        
        try {
            await this.safePlayAudio(this.nextTrack);
            await this.performCrossfade(fromTrack, toTrack);
            
            fromTrack.pause();
            this.currentTrack = toTrack;
            this.nextTrack = null;
            
            console.log('🎵 Crossfade to battle music completed with position save');
        } catch (error) {
            console.error('Crossfade with position save failed:', error);
            this.handlePlaybackFailure(error, 'battle music crossfade');
        } finally {
            this.isTransitioning = false;
        }
    }
    
    /**
     * Crossfade to title music with position restoration (battle → title)
     */
    async crossfadeToTitleMusicWithPosition(fromTrack, toTrack) {
        if (this.isTransitioning) return;
        
        this.isTransitioning = true;
        this.nextTrack = toTrack;
        
        // Resume title music from saved position
        if (this.titleMusicStarted && this.savedTitlePosition > 0) {
            this.nextTrack.currentTime = this.savedTitlePosition;
            console.log(`🎵 Resuming title music from saved position: ${this.savedTitlePosition}s`);
        } else {
            this.nextTrack.currentTime = 0;
        }
        
        this.nextTrack.volume = 0;
        
        try {
            await this.safePlayAudio(this.nextTrack);
            await this.performCrossfade(fromTrack, toTrack);
            
            fromTrack.pause();
            fromTrack.currentTime = 0;
            this.currentTrack = toTrack;
            this.nextTrack = null;
            
            console.log('🎵 Crossfade to title music completed with position restoration');
        } catch (error) {
            console.error('Crossfade to title music with position failed:', error);
            this.handlePlaybackFailure(error, 'title music crossfade');
        } finally {
            this.isTransitioning = false;
        }
    }
    
    /**
     * Crossfade between two tracks (regular)
     */
    async crossfadeTransition(fromTrack, toTrack) {
        if (this.isTransitioning) return;
        
        this.isTransitioning = true;
        this.nextTrack = toTrack;
        
        this.nextTrack.currentTime = 0;
        this.nextTrack.volume = 0;
        
        try {
            await this.safePlayAudio(this.nextTrack);
            await this.performCrossfade(fromTrack, toTrack);
            
            fromTrack.pause();
            fromTrack.currentTime = 0;
            this.currentTrack = toTrack;
            this.nextTrack = null;
            
        } catch (error) {
            console.error('Crossfade transition failed:', error);
            this.handlePlaybackFailure(error, 'music crossfade');
        } finally {
            this.isTransitioning = false;
        }
    }
    
    /**
     * Perform the actual crossfade animation
     */
    performCrossfade(fromTrack, toTrack) {
        return new Promise((resolve) => {
            const steps = this.fadeInDuration / this.crossfadeStep;
            let currentStep = 0;
            
            const initialFromVolume = fromTrack.volume;
            const targetToVolume = this.volume;
            
            this.crossfadeInterval = setInterval(() => {
                currentStep++;
                const progress = currentStep / steps;
                
                if (progress >= 1) {
                    // Fade complete
                    fromTrack.volume = 0;
                    toTrack.volume = targetToVolume;
                    clearInterval(this.crossfadeInterval);
                    this.crossfadeInterval = null;
                    resolve();
                } else {
                    // Apply eased transition
                    const easedProgress = this.easeInOutCubic(progress);
                    fromTrack.volume = initialFromVolume * (1 - easedProgress);
                    toTrack.volume = targetToVolume * easedProgress;
                }
            }, this.crossfadeStep);
        });
    }
    
    /**
     * Fade in a track
     */
    fadeIn(track) {
        return new Promise((resolve) => {
            if (!track) {
                console.warn('🎵 fadeIn called with null track');
                resolve();
                return;
            }
            
            console.log(`🎵 Starting fadeIn - targetVolume: ${this.volume}, duration: ${this.fadeInDuration}ms`);
            
            const steps = this.fadeInDuration / this.crossfadeStep;
            let currentStep = 0;
            const targetVolume = this.volume;
            
            const fadeInterval = setInterval(() => {
                currentStep++;
                const progress = Math.min(currentStep / steps, 1);
                const easedProgress = this.easeInOutCubic(progress);
                
                track.volume = targetVolume * easedProgress;
                
                if (currentStep % 10 === 0 || progress >= 1) { // Log every 10th step or final step
                    console.log(`🎵 FadeIn progress: ${Math.round(progress * 100)}%, volume: ${track.volume.toFixed(3)}`);
                }
                
                if (progress >= 1) {
                    clearInterval(fadeInterval);
                    console.log(`🎵 FadeIn completed! Final volume: ${track.volume}`);
                    resolve();
                }
            }, this.crossfadeStep);
        });
    }
    
    /**
     * Fade out a track
     */
    fadeOut(track) {
        return new Promise((resolve) => {
            if (!track || track.volume === 0) {
                resolve();
                return;
            }
            
            const steps = this.fadeOutDuration / this.crossfadeStep;
            let currentStep = 0;
            const initialVolume = track.volume;
            
            const fadeInterval = setInterval(() => {
                currentStep++;
                const progress = Math.min(currentStep / steps, 1);
                const easedProgress = this.easeInOutCubic(progress);
                
                track.volume = initialVolume * (1 - easedProgress);
                
                if (progress >= 1) {
                    track.pause();
                    clearInterval(fadeInterval);
                    resolve();
                }
            }, this.crossfadeStep);
        });
    }
    
    /**
     * Easing function for smooth transitions
     */
    easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
    }
    
    /**
     * Set volume for music
     */
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        
        if (this.currentTrack) {
            this.currentTrack.volume = this.volume;
        }
        
        if (this.nextTrack && !this.isTransitioning) {
            this.nextTrack.volume = this.volume;
        }
    }
    
    /**
     * Stop transition
     */
    stopTransition() {
        if (this.crossfadeInterval) {
            clearInterval(this.crossfadeInterval);
            this.crossfadeInterval = null;
        }
        this.isTransitioning = false;
    }
    
    /**
     * Restart current track if it ends unexpectedly
     */
    async restartCurrentTrack() {
        if (this.currentTrack && this.currentSection) {
            console.log('Restarting current track');
            this.currentTrack.currentTime = 0;
            try {
                await this.safePlayAudio(this.currentTrack);
                console.log('🎵 Track restarted successfully');
            } catch (error) {
                console.error('🎵 Failed to restart track:', error);
                this.handlePlaybackFailure(error, 'restart music');
            }
        }
    }
    
    /**
     * Pause all music
     */
    pauseAll() {
        console.log('🎵 ⏸️ PAUSING ALL MUSIC');
        Object.values(this.tracks).forEach(track => {
            if (track && !track.paused) {
                console.log('🎵 Pausing track:', track.src);
                track.pause();
            }
        });
        this.stopTransition();
    }
    
    /**
     * Resume current music
     */
    async resumeCurrent() {
        if (this.currentTrack && this.currentTrack.paused) {
            try {
                await this.safePlayAudio(this.currentTrack);
                console.log('🎵 Music resumed successfully');
            } catch (error) {
                console.error('🎵 Failed to resume music:', error);
                this.handlePlaybackFailure(error, 'resume music');
            }
        }
    }
    
    /**
     * Stop all music
     */
    stopAll() {
        console.log('🎵 ⏹️ STOPPING ALL MUSIC');
        this.stopTransition();
        
        Object.values(this.tracks).forEach(track => {
            if (track) {
                console.log('🎵 Stopping track:', track.src);
                track.pause();
                track.currentTime = 0;
                track.volume = 0;
            }
        });
        
        this.currentTrack = null;
        this.nextTrack = null;
        this.currentSection = null;
        console.log('🎵 ✅ ALL MUSIC STOPPED');
    }
    
    /**
     * Get current playback info
     */
    getCurrentInfo() {
        return {
            section: this.currentSection,
            isPlaying: this.currentTrack && !this.currentTrack.paused,
            isTransitioning: this.isTransitioning,
            volume: this.volume,
            currentTime: this.currentTrack ? this.currentTrack.currentTime : 0,
            duration: this.currentTrack ? this.currentTrack.duration : 0,
            musicType: this.currentMusicType,
            titleMusicStarted: this.titleMusicStarted,
            savedTitlePosition: this.savedTitlePosition
        };
    }
    
    /**
     * Cleanup and dispose resources
     */
    dispose() {
        this.stopAll();
        
        // Remove event listeners and clear references
        Object.values(this.tracks).forEach(track => {
            if (track) {
                track.removeEventListener('ended', this.restartCurrentTrack);
                track.removeEventListener('error', console.error);
                track.src = '';
                track.load();
            }
        });
        
        this.tracks = {};
        this.audioManager = null;
    }
    
    /**
     * Safely play audio with Chrome autoplay policy compliance
     */
    async safePlayAudio(audioElement) {
        if (!audioElement) {
            throw new Error('No audio element provided');
        }
        
        console.log('🎵 Attempting to play audio safely...');
        
        try {
            const playPromise = audioElement.play();
            
            // Handle browsers that don't return promises from play()
            if (playPromise !== undefined) {
                await playPromise;
            }
            
            console.log('🎵 Audio play successful');
            return true;
            
        } catch (error) {
            console.warn('🎵 Audio play failed:', error.name, error.message);
            
            // Check if this is an autoplay policy error
            if (error.name === 'NotAllowedError' ||
                error.message.includes('autoplay') ||
                error.message.includes('user activation') ||
                error.message.includes('gesture')) {
                
                console.log('🔊 Autoplay blocked by browser policy');
                throw new Error('AUTOPLAY_BLOCKED');
            }
            
            // Re-throw other errors
            throw error;
        }
    }
    
    /**
     * Handle playback failures with user re-prompting if needed
     */
    handlePlaybackFailure(error, context) {
        console.error(`🎵 Playback failure in ${context}:`, error);
        
        if (error.message === 'AUTOPLAY_BLOCKED') {
            console.log('🔊 Audio blocked by autoplay policy - need user interaction');
            
            // Check if audio was recently activated before resetting everything
            const activationTimestamp = localStorage.getItem('typesprout_audio_activation_timestamp');
            const isRecentActivation = this.isRecentActivation(activationTimestamp);
            
            if (isRecentActivation) {
                console.log('🔊 Audio was recently activated - not resetting activation status due to autoplay failure');
                console.log('🔊 Continuing without music to avoid overlay spam');
                return;
            }
            
            // Only reset if activation was NOT recent
            if (this.audioManager) {
                console.log('🔊 Audio activation was not recent - resetting activation status');
                this.audioManager.isAudioActivated = false;
                sessionStorage.removeItem('typesprout_audio_activated');
                
                // Show activation overlay if available
                if (this.audioManager.activationOverlay) {
                    console.log('🔊 Re-showing audio activation overlay due to autoplay failure');
                    setTimeout(() => {
                        this.audioManager.activationOverlay.reset();
                        this.audioManager.activationOverlay.show();
                    }, 1000); // Brief delay to avoid immediate re-show
                }
            }
        } else {
            console.warn(`🎵 Non-autoplay error in ${context}, continuing without music`);
        }
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
            
            console.log('🔊 MusicManager activation timestamp check:', {
                timestamp,
                now,
                timeDiffMs: timeDiff,
                timeDiffMinutes: Math.round(timeDiff / 1000 / 60 * 100) / 100,
                isRecent,
                fiveMinuteWindow: fiveMinutesInMs
            });
            
            return isRecent;
        } catch (error) {
            console.warn('🔊 MusicManager failed to parse activation timestamp:', error);
            return false;
        }
    }
}

// Export for use as module or global
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { MusicManager };
} else {
    window.MusicManager = MusicManager;
}