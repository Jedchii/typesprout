// Volume variables
let masterVolume = 100;
let sfxVolume = 100;
let musicVolume = 100;

// Function to set volume
function setVolume(type, value) {
    value = parseInt(value);
    if (value < 0) value = 0;
    if (value > 100) value = 100;
    if (type === 'master') masterVolume = value;
    else if (type === 'sfx') sfxVolume = value;
    else if (type === 'music') musicVolume = value;
    console.log(`${type} volume set to ${value}`);
    // Here you would apply to actual audio if present
}

// Update fullscreen toggle display
function updateFullscreenToggle() {
    const toggle = document.getElementById('fullscreen-toggle');
    if (document.fullscreenElement) {
        toggle.textContent = 'x';
    } else {
        toggle.textContent = '';
    }
}

// Fullscreen toggle
function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    } else {
        document.exitFullscreen();
    }
    // Update after toggle
    setTimeout(updateFullscreenToggle, 100);
}

// Event listeners
document.getElementById('master-volume').addEventListener('input', (e) => {
    setVolume('master', e.target.value);
});

document.getElementById('sfx-volume').addEventListener('input', (e) => {
    setVolume('sfx', e.target.value);
});

document.getElementById('music-volume').addEventListener('input', (e) => {
    setVolume('music', e.target.value);
});

document.getElementById('fullscreen-toggle').addEventListener('click', toggleFullscreen);

// Initial update
updateFullscreenToggle();

// Listen for fullscreen changes
document.addEventListener('fullscreenchange', updateFullscreenToggle);