/**
 * Audio System Initialization Script
 * This script demonstrates how to integrate the AudioManager system into any page
 * Includes audio activation overlay for guaranteed browser compliance
 */

(async function initializeAudioSystem() {
    'use strict';
    
    console.log('🔊 INIT.JS START:', {
        url: window.location.href,
        readyState: document.readyState,
        timestamp: Date.now(),
        existingActivationTimestamp: localStorage.getItem('typesprout_audio_activation_timestamp'),
        existingSessionFlag: sessionStorage.getItem('typesprout_audio_activated'),
        existingLocalFlag: localStorage.getItem('typesprout_audio_activated_persistent')
    });
    
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeAudioSystem);
        return;
    }
    
    // Load audio activation overlay components
    console.log('🔊 Loading audio activation overlay components...');
    await loadAudioActivationComponents();
    console.log('🔊 Audio activation overlay components loaded');
    
    try {
        console.log('🎵 Initializing TypeSprout Audio System...');
        
        // Initialize AudioManager singleton
        const audioManager = AudioManager.getInstance();
        console.log('🔊 AudioManager singleton retrieved');
        
        // Initialize the system
        await audioManager.initialize();
        console.log('🔊 AudioManager initialization completed');
        
        // Add to window for global access (optional)
        window.TypeSproutAudio = audioManager;
        window.audioManager = audioManager; // For debugging
        
        console.log('✅ Audio System initialized successfully!');
        console.log('📊 System Status:', {
            section: audioManager.currentSection,
            volumes: audioManager.getVolumes(),
            initialized: audioManager.isInitialized,
            activated: audioManager.isAudioActivated,
            overlayExists: !!audioManager.activationOverlay,
            overlayActivated: audioManager.activationOverlay?.isActivated()
        });
        
        // Setup page-specific audio handling
        setupPageSpecificAudio(audioManager);
        
        // Log helpful debugging info
        logAudioDebugInfo(audioManager);
        
    } catch (error) {
        console.error('❌ Failed to initialize Audio System:', error);
    }
})();

/**
 * Load audio activation overlay CSS and JS components
 */
async function loadAudioActivationComponents() {
    const basePath = getAudioBasePath();
    
    // Check if CSS is already loaded in HTML
    const existingCSS = document.querySelector('link[href*="AudioActivationOverlay.css"]');
    if (!existingCSS) {
        // Load CSS dynamically only if not already present
        const cssLink = document.createElement('link');
        cssLink.rel = 'stylesheet';
        cssLink.type = 'text/css';
        cssLink.href = `${basePath}/AudioActivationOverlay.css`;
        document.head.appendChild(cssLink);
        console.log('🎨 Audio activation overlay CSS loaded dynamically');
    } else {
        console.log('🎨 Audio activation overlay CSS already loaded in HTML');
    }
    
    // Load JS
    if (!window.AudioActivationOverlay) {
        const jsScript = document.createElement('script');
        jsScript.src = `${basePath}/AudioActivationOverlay.js`;
        
        // Wait for script to load
        await new Promise((resolve, reject) => {
            jsScript.onload = () => {
                console.log('📦 AudioActivationOverlay script loaded');
                resolve();
            };
            jsScript.onerror = () => {
                console.error('❌ Failed to load AudioActivationOverlay script');
                reject(new Error('Failed to load AudioActivationOverlay script'));
            };
            document.head.appendChild(jsScript);
        });
    } else {
        console.log('📦 AudioActivationOverlay already available');
    }
}

/**
 * Get the base path for audio files
 */
function getAudioBasePath() {
    // Try to determine the correct path based on current location
    const currentPath = window.location.pathname;
    
    if (currentPath.includes('/audio/')) {
        return '.';
    } else if (currentPath.includes('/Main Menu/') || currentPath.includes('/TreeDex/') ||
               currentPath.includes('/Main Game/') || currentPath.includes('/Forest/') ||
               currentPath.includes('/settings/')) {
        return '../audio';
    } else {
        // Assume we're at root level
        return './audio';
    }
}

/**
 * Setup page-specific audio handling
 */
function setupPageSpecificAudio(audioManager) {
    // Auto-detect section changes when navigating between pages
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;
    
    history.pushState = function(...args) {
        originalPushState.apply(this, args);
        setTimeout(() => {
            audioManager.detectCurrentSection();
            audioManager.handleSectionChange(audioManager.currentSection);
        }, 100);
    };
    
    history.replaceState = function(...args) {
        originalReplaceState.apply(this, args);
        setTimeout(() => {
            audioManager.detectCurrentSection();
            audioManager.handleSectionChange(audioManager.currentSection);
        }, 100);
    };
    
    // Handle back/forward button navigation
    window.addEventListener('popstate', () => {
        setTimeout(() => {
            audioManager.detectCurrentSection();
            audioManager.handleSectionChange(audioManager.currentSection);
        }, 100);
    });
}

/**
 * Log helpful debugging information
 */
function logAudioDebugInfo(audioManager) {
    // Log current state
    console.group('🔊 Audio System Debug Info');
    console.log('Current Section:', audioManager.currentSection);
    console.log('Audio Enabled:', audioManager.audioEnabled);
    console.log('Volumes:', audioManager.getVolumes());
    
    if (audioManager.musicManager) {
        console.log('Music Manager:', audioManager.musicManager.getCurrentInfo());
    }
    
    if (audioManager.sfxManager) {
        console.log('SFX Manager:', audioManager.sfxManager.getCurrentInfo());
    }
    
    console.groupEnd();
    
    // Add keyboard shortcut for debugging
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === 'A') {
            e.preventDefault();
            console.clear();
            logAudioDebugInfo(audioManager);
        }
    });
    
    console.log('💡 Press Ctrl+Shift+A to show audio debug info');
}

/**
 * Utility functions for manual testing
 */
window.AudioTestUtils = {
    // Test section transitions
    testSectionTransition: async (section) => {
        const audioManager = window.TypeSproutAudio;
        if (audioManager) {
            console.log(`🧪 Testing transition to: ${section}`);
            audioManager.handleSectionChange(section);
        }
    },
    
    // Test volume controls
    testVolumeControl: (type, value) => {
        const audioManager = window.TypeSproutAudio;
        if (audioManager) {
            console.log(`🧪 Testing ${type} volume: ${value}`);
            switch (type) {
                case 'master':
                    audioManager.setMasterVolume(value);
                    break;
                case 'music':
                    audioManager.setMusicVolume(value);
                    break;
                case 'sfx':
                    audioManager.setSFXVolume(value);
                    break;
            }
        }
    },
    
    // Test button sound
    testButtonSound: () => {
        const audioManager = window.TypeSproutAudio;
        if (audioManager) {
            console.log('🧪 Testing button sound');
            audioManager.playButtonSound();
        }
    },
    
    // Toggle audio
    testToggleAudio: () => {
        const audioManager = window.TypeSproutAudio;
        if (audioManager) {
            const enabled = audioManager.toggleAudio();
            console.log(`🧪 Audio toggled: ${enabled ? 'ON' : 'OFF'}`);
        }
    },
    
    // Show current state
    showState: () => {
        const audioManager = window.TypeSproutAudio;
        if (audioManager) {
            logAudioDebugInfo(audioManager);
        }
    }
};

// Log test utilities availability
console.log('🧪 Audio Test Utilities available: window.AudioTestUtils');
console.log('📝 Usage examples:');
console.log('  AudioTestUtils.testSectionTransition("battle")');
console.log('  AudioTestUtils.testVolumeControl("music", 0.5)');
console.log('  AudioTestUtils.testButtonSound()');
console.log('  AudioTestUtils.testToggleAudio()');
console.log('  AudioTestUtils.showState()');