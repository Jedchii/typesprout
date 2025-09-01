// Game state
let gameState = {
    isPlaying: false,
    currentQuote: '',
    currentPosition: 0,
    startTime: null,
    timer: null,
    gameTimer: null, // New timer for 1-minute game limit
    maxGameTime: 60000, // 1 minute in milliseconds
    difficulty: 'easy',
    botSpeedRanges: {
        easy: { min: 30, max: 50 },
        intermediate: { min: 40, max: 70 },
        hard: { min: 60, max: 90 },
        impossible: { min: 80, max: 115 }
    },
    bots: [
        { name: 'Player 2', progress: 0, wpm: 0, finished: false, finishTime: null, placement: null },
        { name: 'Player 3', progress: 0, wpm: 0, finished: false, finishTime: null, placement: null },
        { name: 'Player 4', progress: 0, wpm: 0, finished: false, finishTime: null, placement: null }
    ],
    player: { progress: 0, wpm: 0, finished: false, finishTime: null, placement: null },
    playerWPM: 0,
    correctChars: 0,
    totalChars: 0,
    seedCount: 0,
    inventory: { easy: 0, intermediate: 0, hard: 0, impossible: 0 },
    treeStage: 0, // 0 = young, 1 = teen, 2 = adult
    playersFinished: 0, // Track how many players have finished
    totalPlayers: 4, // Player + 3 bots
    finishOrder: [] // Track finish order for placement
};

// Tree growth stages data
const treeStages = [
    {
        // Sprout (0-50% progress)
        emoji: '🌱',
        src: 'Assets/common_oak_tree_sapling.png',
        label: 'Sprout',
        alt: 'Sprout'
    },
    {
        // Mature (50-100% progress)
        emoji: '🌿',
        src: 'Assets/common_oak_tree_adult.png',
        label: 'Mature',
        alt: 'Mature'
    },
    {
        // Senescent (100% progress)
        emoji: '🌳',
        src: 'Assets/goated_fertility_tree_adult.png',
        label: 'Senescent',
        alt: 'Senescent'
    }
];

// Sample quotes for different difficulties
const quotes = {
    easy: [
        {
            text: "It is not in the stars to hold our destiny but in ourselves.",
            author: "William Shakespeare"
        },
        {
            text: "Happiness can be found even in the darkest of times if one only remembers to turn on the light.",
            author: "J.K. Rowling"
        },
        {
            text: "Not all those who wander are lost; some find meaning in the path itself.",
            author: "J.R.R. Tolkien"
        },
        {
            text: "To love oneself is the beginning of a lifelong romance.",
            author: "Oscar Wilde"
        },
        {
            text: "The only thing we have to fear is fear itself, for courage grows when tested.",
            author: "Franklin D. Roosevelt"
        }
    ],
    intermediate: [
        {
            text: "The fault, dear Brutus, is not in our stars, but in ourselves, that we are underlings.",
            author: "Shakespeare"
        },
        {
            text: "There is nothing either good or bad, but thinking makes it so, and therein lies the challenge of life.",
            author: "Hamlet (Shakespeare)"
        },
        {
            text: "It was the best of times, it was the worst of times, and yet the world moved on unchanged.",
            author: "Charles Dickens"
        },
        {
            text: "A man is but the product of his thoughts; what he thinks, he becomes, and his future unfolds accordingly.",
            author: "Mahatma Gandhi"
        },
        {
            text: "We are such stuff as dreams are made on, and our little life is rounded with a sleep.",
            author: "Shakespeare"
        }
    ],
    hard: [
        {
            text: "All happy families are alike; each unhappy family is unhappy in its own way, and therein lies the weight of human tragedy.",
            author: "Leo Tolstoy"
        },
        {
            text: "So we beat on, boats against the current, borne back ceaselessly into the past, chasing illusions that slip through our hands.",
            author: "F. Scott Fitzgerald"
        },
        {
            text: "The mind is its own place, and in itself can make a heaven of hell, a hell of heaven; choice is both a gift and a burden.",
            author: "John Milton"
        },
        {
            text: "Call me Ishmael; for some lives begin with adventure, and others with the endless search for meaning upon the open sea.",
            author: "Herman Melville"
        },
        {
            text: "The world breaks everyone, and afterward many are strong at the broken places, though the scars remain as reminders.",
            author: "Ernest Hemingway"
        }
    ],
    impossible: [
        {
            text: "There are more things in heaven and earth, Horatio, than are dreamt of in your philosophy; the universe is vaster than imagination itself.",
            author: "Shakespeare"
        },
        {
            text: "The measure of intelligence is the ability to change, yet the burden of wisdom lies in discerning what must never be abandoned.",
            author: "Albert Einstein (paraphrased)"
        },
        {
            text: "And when you gaze long into an abyss, the abyss also gazes into you; truth itself bends beneath such weight.",
            author: "Friedrich Nietzsche"
        },
        {
            text: "Time is a river, but memory is the oar; we drift endlessly, yet each stroke pulls us toward shores we cannot see.",
            author: "Inspired by Marcus Aurelius"
        },
        {
            text: "Man suffers only because he takes seriously what the gods made for fun; perhaps laughter, not reason, is the truest salvation.",
            author: "Alan Watts"
        }
    ]
};

// Seed randomization system
const SEED_POOLS = {
    easy: ['oak', 'birch', 'spruce', 'cedar', 'willow', 'maple', 'acacia'],
    intermediate: ['silkfloss', 'ghostgum', 'socotradragon', 'ginkgo', 'monkeypuzzle'],
    hard: ['rainboweucalyptus', 'baobab', 'fertility'],
    impossible: ['yggdrasil']
};

const SEED_INFO = {
    // Common seeds
    oak: { name: 'Oak', rarity: 'Common', emoji: '🌱' },
    birch: { name: 'Birch', rarity: 'Common', emoji: '🌱' },
    spruce: { name: 'Spruce', rarity: 'Common', emoji: '🌱' },
    cedar: { name: 'Cedar', rarity: 'Common', emoji: '🌱' },
    willow: { name: 'Willow', rarity: 'Common', emoji: '🌱' },
    maple: { name: 'Maple', rarity: 'Common', emoji: '🌱' },
    acacia: { name: 'Acacia', rarity: 'Common', emoji: '🌱' },
    
    // Rare seeds
    silkfloss: { name: 'Silk Floss', rarity: 'Rare', emoji: '🌿' },
    ghostgum: { name: 'Ghost Gum', rarity: 'Rare', emoji: '🌿' },
    socotradragon: { name: 'Socotra Dragon', rarity: 'Rare', emoji: '🌿' },
    ginkgo: { name: 'Ginkgo', rarity: 'Rare', emoji: '🌿' },
    monkeypuzzle: { name: 'Monkey Puzzle', rarity: 'Rare', emoji: '🌿' },
    
    // Goated seeds
    rainboweucalyptus: { name: 'Rainbow Eucalyptus', rarity: 'Goated', emoji: '🌳' },
    baobab: { name: 'Baobab', rarity: 'Goated', emoji: '🌳' },
    fertility: { name: 'Fertility Tree', rarity: 'Goated', emoji: '🌳' },
    
    // Hidden seed
    yggdrasil: { name: 'Yggdrasil', rarity: 'Hidden', emoji: '🌲' }
};

// Function to get random seed based on difficulty
function getRandomSeed(difficulty) {
    const pool = SEED_POOLS[difficulty];
    if (!pool || pool.length === 0) return null;
    
    const randomIndex = Math.floor(Math.random() * pool.length);
    return pool[randomIndex];
}

// Function to update Forest inventory
function updateForestInventory(seedType) {
    try {
        // Get existing Forest inventory from localStorage
        const forestSaveKey = "isoFarm_v1";
        let forestData = JSON.parse(localStorage.getItem(forestSaveKey) || '{}');
        
        // Initialize if needed
        if (!forestData.inventory) {
            forestData.inventory = {};
        }
        
        // Add the specific seed to Forest inventory
        const seedKey = `${seedType}_seed`;
        forestData.inventory[seedKey] = (forestData.inventory[seedKey] || 0) + 1;
        
        // Save back to localStorage
        localStorage.setItem(forestSaveKey, JSON.stringify(forestData));
        
        console.log(`Added 1 ${seedType} seed to Forest inventory`);
    } catch (e) {
        console.error('Failed to update Forest inventory:', e);
    }
}

// DOM elements
const difficultyButtons = document.querySelectorAll('.difficulty-btn');
const startButton = document.getElementById('start-btn');
const typingInput = document.getElementById('typing-input');
const quoteDisplay = document.getElementById('quote-display');
const timerDisplay = document.getElementById('timer');
const wpmDisplay = document.getElementById('wpm');
const placementDisplay = document.getElementById('placement');
const gameOverModal = document.getElementById('game-over-modal');
const inventoryModal = document.getElementById('inventory-modal');
const inventoryButton = document.getElementById('inventory-btn');

// Initialize game
function initGame() {
    updateInventoryDisplay();

    // Difficulty selection
    difficultyButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            difficultyButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            gameState.difficulty = btn.dataset.difficulty;
        });
    });

    // Start game
    startButton.addEventListener('click', startRace);

    // Typing input
    typingInput.addEventListener('input', handleTyping);
    typingInput.addEventListener('keydown', handleKeyDown);

    // Menu button - navigate to main menu
    document.getElementById('menu-btn').addEventListener('click', () => {
        window.location.href = '../Main Menu/mainmenu.html';
    });

    // Inventory button
    inventoryButton.addEventListener('click', openInventory);

    // Settings button - navigate to settings page
    const settingsButton = document.querySelector('.nav-btn:nth-child(2)'); // About button is first, Settings is second
    if (settingsButton && settingsButton.textContent.trim() === 'Settings') {
        settingsButton.addEventListener('click', () => {
            window.location.href = '../Main Menu/mainmenu.html';
        });
    }
    
    // COORDINATOR ROLE INITIALIZATION: Request coordinator role for Main Game
    console.log('🎮 Main Game initializing - requesting coordinator role for battle music...');
    
    // Wait for audio system to be ready, then request coordinator role
    const waitForAudioSystem = () => {
        if (window.TypeSproutAudio && window.TypeSproutAudio.isInitialized) {
            console.log('🎵 Audio system ready - requesting coordinator role for Main Game...');
            window.TypeSproutAudio.requestCoordinatorRole()
                .then(() => {
                    console.log('✅ Main Game successfully became audio coordinator');
                })
                .catch(error => {
                    console.warn('⚠️ Failed to become coordinator, but continuing:', error);
                });
        } else {
            console.log('🔄 Waiting for audio system to initialize...');
            setTimeout(waitForAudioSystem, 100); // Check every 100ms
        }
    };
    
    // Start checking for audio system
    setTimeout(waitForAudioSystem, 100);
}

function startRace() {
    // Show countdown modal first
    showCountdownModal();
}

function showCountdownModal() {
    const countdownModal = document.getElementById('countdown-modal');
    const countdownText = document.getElementById('countdown-text');
    const countdownNumber = document.getElementById('countdown-number');
    const countdownSubtext = document.getElementById('countdown-subtext');

    // Show the modal
    countdownModal.style.display = 'flex';

    // Phase 1: Finding players (3 seconds)
    countdownText.innerHTML = 'Finding players<span class="loading-dots"></span>';
    countdownText.classList.add('finding-players');
    countdownNumber.style.display = 'none';
    countdownSubtext.textContent = 'Please wait...';

    setTimeout(() => {
        // Phase 2: Starting In text
        countdownText.textContent = 'Starting In';
        countdownText.classList.remove('finding-players');
        countdownNumber.style.display = 'block';
        countdownSubtext.textContent = 'Get ready!';

        // Phase 3: Countdown 3, 2, 1
        let count = 3;
        countdownNumber.textContent = count;

        const countdownInterval = setInterval(() => {
            count--;
            if (count > 0) {
                countdownNumber.textContent = count;
                // Restart the pulse animation
                countdownNumber.style.animation = 'none';
                setTimeout(() => {
                    countdownNumber.style.animation = 'countdownPulse 1s ease-in-out';
                }, 10);
            } else {
                clearInterval(countdownInterval);
                // Hide modal and start the actual race
                countdownModal.style.display = 'none';
                startActualRace();
            }
        }, 1000);
    }, 3000); // 3 seconds for "Finding players"
}

function startActualRace() {
    console.log('🎮 startActualRace() called - checking audio system status...');
    console.log('🔊 TypeSproutAudio available:', !!window.TypeSproutAudio);
    console.log('🔊 Current audio section:', window.TypeSproutAudio ? window.TypeSproutAudio.currentSection : 'N/A');
    console.log('🔊 Audio initialized:', window.TypeSproutAudio ? window.TypeSproutAudio.isInitialized : 'N/A');
    console.log('🔊 Audio activated:', window.TypeSproutAudio ? window.TypeSproutAudio.isAudioActivated : 'N/A');
    
    gameState.isPlaying = true;
    gameState.currentPosition = 0;
    gameState.startTime = Date.now();
    gameState.correctChars = 0;
    gameState.totalChars = 0;
    gameState.playerWPM = 0;
    gameState.playersFinished = 0;
    gameState.finishOrder = [];

    // Reset player
    gameState.player = { progress: 0, wpm: 0, finished: false, finishTime: null, placement: null };

    // Reset bots
    gameState.bots.forEach(bot => {
        bot.progress = 0;
        bot.wpm = 0;
        bot.finished = false;
        bot.finishTime = null;
        bot.placement = null;
    });

    // Reset tree growth
    resetTreeGrowth();

    // Get random quote
    const quotesArray = quotes[gameState.difficulty];
    const selectedQuote = quotesArray[Math.floor(Math.random() * quotesArray.length)];
    gameState.currentQuote = selectedQuote.text;
    gameState.currentAuthor = selectedQuote.author;
    
    // Store trimmed quote length for completion checking
    gameState.trimmedQuoteLength = selectedQuote.text.trimEnd().length;

    // Disable difficulty buttons during race
    disableDifficultyButtons();

    // Update UI
    displayQuote();
    displayAuthor();
    typingInput.disabled = false;
    typingInput.focus();
    typingInput.value = '';
    startButton.textContent = 'Racing...';
    startButton.disabled = true;

    // Start timer
    gameState.timer = setInterval(updateGame, 100);

    // Start 1-minute game timer
    gameState.gameTimer = setTimeout(() => {
        if (gameState.isPlaying) {
            endRace('timer');
        }
    }, gameState.maxGameTime);

    // Start bot racing
    startBotRacing();
    
    // COORDINATOR TRANSFER FIX: Request coordinator role and start battle music
    console.log('🎵 ATTEMPTING TO START BATTLE MUSIC WITH COORDINATOR TRANSFER...');
    if (window.TypeSproutAudio) {
        try {
            console.log('🎵 Requesting coordinator role and transitioning to battle music...');
            window.TypeSproutAudio.requestCoordinatorAndTransition('battle')
                .then(() => {
                    console.log('✅ Battle music coordinator transfer and start completed successfully');
                })
                .catch(error => {
                    console.error('❌ Failed to transfer coordinator role and start battle music:', error);
                    // Fallback: try regular section change
                    console.log('🎵 Fallback: trying regular handleSectionChange...');
                    window.TypeSproutAudio.handleSectionChange('battle');
                });
        } catch (error) {
            console.error('❌ Failed to request coordinator role for battle music:', error);
            // Fallback: try regular section change
            console.log('🎵 Fallback: trying regular handleSectionChange...');
            try {
                window.TypeSproutAudio.handleSectionChange('battle');
            } catch (fallbackError) {
                console.error('❌ Even fallback failed:', fallbackError);
            }
        }
    } else {
        console.error('❌ CRITICAL: TypeSproutAudio not available - no music will play!');
        console.log('🔍 Available audio objects:', {
            AudioManager: !!window.AudioManager,
            MusicManager: !!window.MusicManager,
            AudioActivationOverlay: !!window.AudioActivationOverlay
        });
    }
}

function displayQuote() {
    const quote = gameState.currentQuote;
    const typed = typingInput.value;
    let html = '';

    // Find current word boundaries
    const currentWordStart = gameState.currentPosition;
    let currentWordEnd = quote.indexOf(' ', currentWordStart);
    if (currentWordEnd === -1) {
        currentWordEnd = quote.length; // Last word
    }

    for (let i = 0; i < quote.length; i++) {
        if (i < gameState.currentPosition) {
            // Already completed characters (correct)
            html += `<span class="correct">${quote[i]}</span>`;
        } else if (i >= currentWordStart && i < currentWordEnd) {
            // Current word being typed
            const typedIndex = i - currentWordStart;
            if (typedIndex < typed.length) {
                if (typed[typedIndex] === quote[i]) {
                    html += `<span class="correct">${quote[i]}</span>`;
                } else {
                    html += `<span class="incorrect">${quote[i]}</span>`;
                }
            } else if (typedIndex === typed.length) {
                html += `<span class="current">${quote[i]}</span>`;
            } else {
                html += quote[i];
            }
        } else {
            // Future characters
            html += quote[i];
        }
    }

    quoteDisplay.innerHTML = html;
}

function displayAuthor() {
    const authorDisplay = document.getElementById('quote-author');
    if (authorDisplay && gameState.currentAuthor) {
        authorDisplay.textContent = `— ${gameState.currentAuthor}`;
    }
}

function handleKeyDown(e) {
    if (!gameState.isPlaying) return;

    // Handle space key press
    if (e.key === ' ') {
        e.preventDefault(); // Prevent default space behavior

        const typed = e.target.value;
        const quote = gameState.currentQuote;

        // Find the current word boundaries
        const currentWordStart = gameState.currentPosition;
        let currentWordEnd = quote.indexOf(' ', currentWordStart);
        if (currentWordEnd === -1) {
            currentWordEnd = quote.length; // Last word
        }

        const expectedWord = quote.substring(currentWordStart, currentWordEnd);
        const typedWord = typed;

        // Check if the typed word matches the expected word
        if (typedWord === expectedWord) {
            // Correct word - clear input and advance position
            e.target.value = '';
            gameState.currentPosition = currentWordEnd + 1; // +1 to skip the space

            // Update correct characters count
            gameState.correctChars += expectedWord.length + 1; // +1 for space
            gameState.totalChars += expectedWord.length + 1;

            // Check if race is complete (no more words) - use trimmed length
            if (gameState.currentPosition >= gameState.trimmedQuoteLength) {
                handleRacerFinish('player');
                return;
            }
        } else {
            // Incorrect word - don't clear input, let user continue typing
            // Add space to input to show it was pressed
            e.target.value = typed + ' ';
            gameState.totalChars += 1; // Count the space as typed
        }


        // Update display
        displayQuote();
        updateStats();
    }
}

function handleTyping(e) {
    if (!gameState.isPlaying) return;

    const typed = e.target.value;
    const quote = gameState.currentQuote;

    // Update total characters as user types
    const currentWordStart = gameState.currentPosition;
    let currentWordEnd = quote.indexOf(' ', currentWordStart);
    if (currentWordEnd === -1) {
        currentWordEnd = quote.length; // Last word
    }

    const expectedWord = quote.substring(currentWordStart, currentWordEnd);

    // Count correct characters in current word for WPM calculation
    let correctInCurrentWord = 0;
    for (let i = 0; i < Math.min(typed.length, expectedWord.length); i++) {
        if (typed[i] === expectedWord[i]) {
            correctInCurrentWord++;
        } else {
            break; // Stop at first incorrect character
        }
    }

    // CHECK FOR COMPLETION OF FINAL WORD (no space required)
    if (currentWordEnd === quote.length && typed === expectedWord) {
        // User completed the final word perfectly - finish the race!
        gameState.currentPosition = currentWordEnd;
        gameState.correctChars += expectedWord.length;
        gameState.totalChars += expectedWord.length;
        
        // Disable typing input immediately to prevent further typing
        typingInput.disabled = true;
        typingInput.blur(); // Remove focus from input
        
        handleRacerFinish('player');
        return;
    }

    // Update total chars for current typing session
    gameState.totalChars = gameState.correctChars + typed.length;

    // Update player progress for visual display
    gameState.player.progress = gameState.currentPosition + correctInCurrentWord;
    gameState.player.wpm = gameState.playerWPM;

    // Update display to show current typing progress
    displayQuote();
    updateStats();
}

function startBotRacing() {
    const speedRange = gameState.botSpeedRanges[gameState.difficulty];

    gameState.bots.forEach((bot, index) => {
        // Generate random speed within the difficulty range
        bot.targetWPM = Math.round(speedRange.min + Math.random() * (speedRange.max - speedRange.min));

        bot.interval = setInterval(() => {
            if (!gameState.isPlaying) return;

            // Calculate characters per second
            const cps = (bot.targetWPM * 5) / 60; // 5 characters per word average
            bot.progress += cps * 0.1; // Update every 100ms

            // Add some randomness
            bot.progress += (Math.random() - 0.5) * 0.5;

            // Cap at quote length - use trimmed length for completion
            if (bot.progress >= gameState.trimmedQuoteLength && !bot.finished) {
                bot.progress = gameState.trimmedQuoteLength;
                clearInterval(bot.interval);
                handleRacerFinish('bot', index);
            }

            // Update WPM display
            const elapsed = (Date.now() - gameState.startTime) / 1000 / 60; // minutes
            bot.wpm = elapsed > 0 ? Math.round((bot.progress / 5) / elapsed) : 0;

            updateProgress();
        }, 100);
    });
}

// Function to handle when a racer finishes
function handleRacerFinish(racerType, racerIndex = null) {
    if (!gameState.isPlaying) return;

    const currentTime = Date.now();
    let racer;
    let racerName;

    if (racerType === 'player') {
        racer = gameState.player;
        racerName = 'Player 1 (You)';
    } else {
        racer = gameState.bots[racerIndex];
        racerName = racer.name;
    }

    // Mark as finished if not already
    if (!racer.finished) {
        racer.finished = true;
        racer.finishTime = currentTime;
        gameState.playersFinished++;

        // If player finished, freeze their WPM at completion time
        if (racerType === 'player') {
            gameState.player.finalWPM = gameState.playerWPM;
            gameState.player.finished = true;
        }

        // Add to finish order
        gameState.finishOrder.push({
            type: racerType,
            index: racerIndex,
            name: racerName,
            finishTime: currentTime,
            wpm: racerType === 'player' ? gameState.playerWPM : racer.wpm
        });

        // Assign placement based on finish order
        racer.placement = gameState.finishOrder.length;

        console.log(`${racerName} finished in ${racer.placement} place with ${racerType === 'player' ? gameState.playerWPM : racer.wmp} WPM`);

        // Update placement display
        updatePlacementDisplay();

        // Check if game should end
        if (gameState.playersFinished >= gameState.totalPlayers) {
            // All players finished
            setTimeout(() => endRace('all_finished'), 1000); // Small delay to show final placement
        }
    }
}

// New function to check if game should end
function checkGameEnd(finisher, finisherBot = null) {
    if (!gameState.isPlaying) return;

    // Game ends when either:
    // 1. All players have finished, OR
    // 2. Timer runs out (handled by setTimeout in startActualRace)

    if (gameState.playersFinished >= gameState.totalPlayers) {
        // All players finished
        endRace('all_finished');
    } else if (finisher === 'player' || finisher === 'bot') {
        // Someone finished but not everyone - continue playing until timer or all finish
        // Just update the display, don't end the game yet
        updateProgress();
    }
}

function updateGame() {
    updateStats();
    updateProgress();
}

function updateStats() {
    // Update timer
    const elapsed = Date.now() - gameState.startTime;
    const minutes = Math.floor(elapsed / 60000);
    const seconds = Math.floor((elapsed % 60000) / 1000);
    timerDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;

    // Update WPM - only if player hasn't finished yet
    if (gameState.isPlaying && !gameState.player.finished) {
        const elapsedMinutes = elapsed / 60000;
        if (elapsedMinutes > 0) {
            // Calculate total correct characters including partial progress
            let totalCorrectChars = gameState.correctChars;

            // Add partial progress from current word being typed
            const typedInput = typingInput.value;
            if (typedInput.length > 0) {
                const currentWordStart = gameState.currentPosition;
                let currentWordEnd = gameState.currentQuote.indexOf(' ', currentWordStart);
                if (currentWordEnd === -1) {
                    currentWordEnd = gameState.currentQuote.length;
                }

                const expectedWord = gameState.currentQuote.substring(currentWordStart, currentWordEnd);

                // Count correct characters in current word
                let correctInCurrentWord = 0;
                for (let i = 0; i < Math.min(typedInput.length, expectedWord.length); i++) {
                    if (typedInput[i] === expectedWord[i]) {
                        correctInCurrentWord++;
                    } else {
                        break; // Stop at first incorrect character
                    }
                }
                totalCorrectChars += correctInCurrentWord;
            }

            gameState.playerWPM = Math.round((totalCorrectChars / 5) / elapsedMinutes);
        }
    }

    // Display the final WPM if player finished, otherwise current WPM
    const displayWPM = gameState.player.finished && gameState.player.finalWPM ? gameState.player.finalWPM : gameState.playerWPM;
    wpmDisplay.textContent = displayWPM;

    // Update placement - show "--" during race, actual placement when finished
    if (gameState.isPlaying && !gameState.player.finished) {
        placementDisplay.textContent = '--';
    } else if (gameState.player.placement) {
        const placementText = getPlacementText(gameState.player.placement);
        placementDisplay.textContent = placementText;
    } else {
        placementDisplay.textContent = '--';
    }
}

function updateProgress() {
    // Update vertical racing visual
    updateVerticalRaceVisual();
}

function updateVerticalRaceVisual() {
    // Update player lane
    const playerLane = document.querySelector('.player-lane');
    const playerWPMDisplay = playerLane.querySelector('.racer-wpm-display');
    playerWPMDisplay.textContent = `${gameState.playerWPM} WPM`;
    updateProgressLeaf(playerLane, gameState.currentPosition, true);

    // Update bot lanes
    const botLanes = document.querySelectorAll('.bot-lane');
    gameState.bots.forEach((bot, index) => {
        const botLane = botLanes[index];
        const botWPMDisplay = botLane.querySelector('.racer-wpm-display');
        botWPMDisplay.textContent = `${bot.wpm} WPM`;
        updateProgressLeaf(botLane, bot.progress, false);
    });

    // Update tree growth visualization
    updateTreeGrowth();
}

// Tree growth update function with dynamic sprite animations
function updateTreeGrowth() {
    if (!gameState.isPlaying || !gameState.currentQuote) return;

    // Calculate race progress percentage and ensure it doesn't exceed 100%
    const raceProgress = Math.min((gameState.currentPosition / gameState.trimmedQuoteLength) * 100, 100);

    // Determine tree stage based on progress
    let newTreeStage = 0; // Sprout (0-50%)
    if (raceProgress >= 100) {
        newTreeStage = 2; // Senescent (100%)
    } else if (raceProgress >= 50) {
        newTreeStage = 1; // Mature (50-100%)
    }

    // Update tree stage if it has changed
    if (newTreeStage !== gameState.treeStage) {
        gameState.treeStage = newTreeStage;
        animateTreeGrowth(newTreeStage);
    }

    // Update progress text and ensure it doesn't exceed 100%
    const progressText = document.querySelector('.tree-progress-text');
    if (progressText) {
        progressText.textContent = `Race Progress: ${Math.round(raceProgress)}%`;
    }
}

// Animate tree growth with visual effects
function animateTreeGrowth(stageIndex) {
    const treeImage = document.getElementById('tree-stage');
    const treeLabel = document.querySelector('.tree-stage-label');

    if (!treeImage || !treeLabel || !treeStages[stageIndex]) return;

    // Add growing animation class
    treeImage.classList.add('tree-growing');

    // Update tree image and label after a short delay for smooth transition
    setTimeout(() => {
        const stage = treeStages[stageIndex];
        treeImage.src = stage.src;
        treeImage.alt = stage.alt;
        treeLabel.textContent = stage.label;

        // Remove animation class after animation completes
        setTimeout(() => {
            treeImage.classList.remove('tree-growing');
        }, 800); // Match the CSS animation duration
    }, 100);
}

// Reset tree to initial stage
function resetTreeGrowth() {
    gameState.treeStage = 0;
    const treeImage = document.getElementById('tree-stage');
    const treeLabel = document.querySelector('.tree-stage-label');
    const progressText = document.querySelector('.tree-progress-text');

    if (treeImage && treeLabel && progressText) {
        const initialStage = treeStages[0];
        treeImage.src = initialStage.src;
        treeImage.alt = initialStage.alt;
        treeLabel.textContent = initialStage.label;
        progressText.textContent = 'Race Progress: 0%';
        treeImage.classList.remove('tree-growing');
    }
}

function updateProgressLeaf(racerLane, progress, isPlayer = false) {
    const leafLane = racerLane.querySelector('.leaf-lane');
    let progressLeaf = leafLane.querySelector('.progress-leaf');

    // Create progress leaf if it doesn't exist
    if (!progressLeaf) {
        progressLeaf = document.createElement('div');
        progressLeaf.className = 'progress-leaf';

        // Random leaf type for variety
        const leafTypes = ['leaf1', 'leaf2', 'leaf3', 'leaf4'];
        progressLeaf.classList.add(leafTypes[Math.floor(Math.random() * leafTypes.length)]);

        leafLane.appendChild(progressLeaf);
    }

    // Calculate leaf position based on progress
    const containerHeight = leafLane.offsetHeight;
    let progressPercent;

    if (isPlayer) {
        // For player, use typing progress
        progressPercent = gameState.trimmedQuoteLength ? (gameState.currentPosition / gameState.trimmedQuoteLength) : 0;
    } else {
        // For bots, use their progress
        progressPercent = gameState.trimmedQuoteLength ? (progress / gameState.trimmedQuoteLength) : 0;
    }

    // Position leaf from top (0%) to bottom (100%) based on progress
    const leafPosition = Math.min(progressPercent * (containerHeight - 20), containerHeight - 20);
    progressLeaf.style.top = `${leafPosition}px`;
}

function clearAllProgressLeaves() {
    const allLeafLanes = document.querySelectorAll('.leaf-lane');
    allLeafLanes.forEach(lane => {
        const progressLeaf = lane.querySelector('.progress-leaf');
        if (progressLeaf) {
            progressLeaf.remove();
        }
    });
}

function updatePlacementDisplay() {
    // Update player placement
    const playerLane = document.querySelector('.player-lane');
    const playerPlacementDisplay = playerLane.querySelector('.racer-placement-display');

    if (gameState.player.placement) {
        const placementText = getPlacementText(gameState.player.placement);
        playerPlacementDisplay.textContent = placementText;
        playerPlacementDisplay.className = `racer-placement-display ${getPlacementClass(gameState.player.placement)}`;
    } else {
        playerPlacementDisplay.textContent = '';
        playerPlacementDisplay.className = 'racer-placement-display';
    }

    // Update bot placements
    const botLanes = document.querySelectorAll('.bot-lane');
    gameState.bots.forEach((bot, index) => {
        const botLane = botLanes[index];
        const botPlacementDisplay = botLane.querySelector('.racer-placement-display');

        if (bot.placement) {
            const placementText = getPlacementText(bot.placement);
            botPlacementDisplay.textContent = placementText;
            botPlacementDisplay.className = `racer-placement-display ${getPlacementClass(bot.placement)}`;
        } else {
            botPlacementDisplay.textContent = '';
            botPlacementDisplay.className = 'racer-placement-display';
        }
    });
}

function getPlacementText(placement) {
    switch (placement) {
        case 1: return '1st';
        case 2: return '2nd';
        case 3: return '3rd';
        case 4: return '4th';
        default: return '';
    }
}

function getPlacementClass(placement) {
    switch (placement) {
        case 1: return 'first';
        case 2: return 'second';
        case 3: return 'third';
        case 4: return 'fourth';
        default: return '';
    }
}

function calculateFinalPosition() {
    // Calculate position based on actual completion progress (same as visual display)
    const quoteLength = gameState.currentQuote.length;

    // Player's actual progress is their current position (completed characters)
    const playerProgress = gameState.currentPosition;

    let position = 1; // Start at 1st place

    // Count how many bots have progressed further than the player
    gameState.bots.forEach(bot => {
        if (bot.progress > playerProgress) {
            position++; // Bot is ahead, so player drops one position
        }
    });

    // Ensure position doesn't exceed total players (4: player + 3 bots)
    position = Math.min(position, 4);

    return position;
}

function endRace(endReason, winningBot = null) {
    gameState.isPlaying = false;
    clearInterval(gameState.timer);

    // Clear game timer
    if (gameState.gameTimer) {
        clearTimeout(gameState.gameTimer);
    }

    // Clear bot intervals
    gameState.bots.forEach(bot => {
        if (bot.interval) clearInterval(bot.interval);
    });

    // Re-enable difficulty buttons after race ends
    enableDifficultyButtons();

    // If game ended by timer, assign placements to unfinished racers based on progress
    if (endReason === 'timer') {
        assignFinalPlacements();
    }

    // Get player's final placement
    let position = gameState.player.placement || 4; // Default to last if no placement assigned

    // Determine if player actually won (finished first)
    const playerWon = (position === 1);

    // Award exactly one seed based on difficulty if player wins (1st place)
    let seedsEarned = 0;
    let seedType = '';
    let specificSeed = null;

    if (playerWon) {
        seedsEarned = 1;
        seedType = gameState.difficulty;
        
        // Get random specific seed based on difficulty
        specificSeed = getRandomSeed(gameState.difficulty);
        
        if (specificSeed) {
            // Add to main game inventory (rarity-based count)
            if (!gameState.inventory) {
                gameState.inventory = { easy: 0, intermediate: 0, hard: 0, impossible: 0 };
            }
            gameState.inventory[seedType]++;
            gameState.seedCount += seedsEarned;
            
            // Update Forest inventory with specific seed type
            updateForestInventory(specificSeed);
        }
    }

    // Show results
    showGameOver(position, seedsEarned, seedType, playerWon, endReason, specificSeed);

    // Reset UI
    typingInput.disabled = true;
    startButton.textContent = 'Start Race';
    startButton.disabled = false;

    updateInventoryDisplay();
}

function assignFinalPlacements() {
    // For racers who didn't finish, assign placements based on progress
    let unfinishedRacers = [];

    // Add player if not finished
    if (!gameState.player.finished) {
        unfinishedRacers.push({
            type: 'player',
            progress: gameState.currentPosition,
            wpm: gameState.playerWPM
        });
    }

    // Add unfinished bots
    gameState.bots.forEach((bot, index) => {
        if (!bot.finished) {
            unfinishedRacers.push({
                type: 'bot',
                index: index,
                progress: bot.progress,
                wpm: bot.wpm
            });
        }
    });

    // Sort by progress (descending)
    unfinishedRacers.sort((a, b) => b.progress - a.progress);

    // Assign placements starting from where finished racers left off
    let nextPlacement = gameState.finishOrder.length + 1;

    unfinishedRacers.forEach(racer => {
        if (racer.type === 'player') {
            gameState.player.placement = nextPlacement;
        } else {
            gameState.bots[racer.index].placement = nextPlacement;
        }
        nextPlacement++;
    });

    // Update placement display
    updatePlacementDisplay();
}

function showGameOver(position, seedsEarned, seedType, playerWon, endReason, specificSeed = null) {
    const positionText = ['1st', '2nd', '3rd', '4th'][position - 1] || `${position}th`;
    const elapsed = Date.now() - gameState.startTime;
    const minutes = Math.floor(elapsed / 60000);
    const seconds = Math.floor((elapsed % 60000) / 1000);

    // Set title based on position and end reason
    let titleText = '';
    if (playerWon) {
        titleText = '🏆 Victory!';
    } else if (position === 2) {
        titleText = '🥈 Great Job!';
    } else if (position === 3) {
        titleText = '🥉 Great Job!';
    } else {
        titleText = '😞 You Lost!';
    }

    // Add context about how the game ended
    if (endReason === 'timer') {
        titleText += ' (Time Up!)';
    } else if (endReason === 'all_finished') {
        titleText += ' (All Finished!)';
    }

    document.getElementById('result-title').textContent = titleText;
    document.getElementById('final-position').textContent = positionText;
    document.getElementById('final-wpm').textContent = gameState.playerWPM;
    document.getElementById('final-time').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;

    let rewardText = 'Keep trying!';
    if (seedsEarned > 0 && specificSeed) {
        const seedInfo = SEED_INFO[specificSeed];
        if (seedInfo) {
            rewardText = `${seedInfo.rarity} Seed (${seedInfo.name})`;
        } else {
            // Fallback to old system if seed info not found
            const fallbackSeedInfo = {
                easy: { emoji: '🌱', name: 'Common' },
                intermediate: { emoji: '🌿', name: 'Rare' },
                hard: { emoji: '🌳', name: 'Goated' },
                impossible: { emoji: '🌲', name: '???' }
            };
            const seed = fallbackSeedInfo[seedType];
            rewardText = `${seedsEarned} ${seed.emoji} ${seed.name} seed!`;
        }
    }

    document.getElementById('reward-text').textContent = rewardText;
    gameOverModal.style.display = 'flex';
}

function closeGameOver() {
    gameOverModal.style.display = 'none';
    resetGame();
}

function resetGame() {
    gameState.isPlaying = false;
    gameState.currentPosition = 0;
    gameState.correctChars = 0;
    gameState.totalChars = 0;
    gameState.playerWPM = 0;
    gameState.playersFinished = 0;
    gameState.finishOrder = [];
    gameState.trimmedQuoteLength = 0;

    // Reset player
    gameState.player = { progress: 0, wpm: 0, finished: false, finishTime: null, placement: null, finalWPM: null };

    if (gameState.timer) {
        clearInterval(gameState.timer);
    }

    if (gameState.gameTimer) {
        clearTimeout(gameState.gameTimer);
    }

    gameState.bots.forEach(bot => {
        bot.progress = 0;
        bot.wpm = 0;
        bot.finished = false;
        bot.finishTime = null;
        bot.placement = null;
        if (bot.interval) clearInterval(bot.interval);
    });

    // Reset tree growth visualization
    resetTreeGrowth();

    typingInput.value = '';
    typingInput.disabled = true;
    startButton.textContent = 'Start Race';
    startButton.disabled = false;

    quoteDisplay.innerHTML = 'Ready to test your typing skills? Select difficulty and start your race!';
    
    // Clear author display
    const authorDisplay = document.getElementById('quote-author');
    if (authorDisplay) {
        authorDisplay.textContent = '';
    }
    timerDisplay.textContent = '0:00';
    wpmDisplay.textContent = '0';
    placementDisplay.textContent = '--';

    // Clear progress leaves and reset vertical race visual
    clearAllProgressLeaves();
    document.querySelectorAll('.racer-wpm-display').forEach(display => {
        display.textContent = '0 WPM';
    });

    // Clear placement displays
    document.querySelectorAll('.racer-placement-display').forEach(display => {
        display.textContent = '';
        display.className = 'racer-placement-display';
    });
}

function updateInventoryDisplay() {
    document.getElementById('common-count').textContent = gameState.inventory.easy;
    document.getElementById('rare-count').textContent = gameState.inventory.intermediate;
    document.getElementById('legendary-count').textContent = gameState.inventory.hard;
    document.getElementById('impossible-count').textContent = gameState.inventory.impossible;
}

function openInventory() {
    updateInventoryDisplay();
    inventoryModal.style.display = 'flex';
}

function closeInventory() {
    inventoryModal.style.display = 'none';
}

// Functions to disable/enable difficulty buttons during race
function disableDifficultyButtons() {
    difficultyButtons.forEach(btn => {
        btn.disabled = true;
        btn.classList.add('disabled');
    });
}

function enableDifficultyButtons() {
    difficultyButtons.forEach(btn => {
        btn.disabled = false;
        btn.classList.remove('disabled');
    });
}

// Initialize the game when page loads
document.addEventListener('DOMContentLoaded', initGame);