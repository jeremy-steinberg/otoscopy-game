// Game variables
let score = 0;
let streak = 0;
let gpepHighScore = 0;
let fellowHighScore = 0;
let lives = 5;
let timeLeft = 10;
let timerInterval;
let currentImage;
let audio;
let isMinimalist = false;
let isFellowMode = false;
let isRunning = false;
let wiggleInterval;
let waxExtractionTools = 3;
let images = {
    AOM: [],
    OME: [],
    No_Effusion: []
};

// Initialize the game
function initGame() {
    // Set up event listeners for menu buttons
    document.getElementById('start-button').addEventListener('click', startGame);
    document.getElementById('info-button').addEventListener('click', showInfo);
    document.getElementById('back-button').addEventListener('click', showMenu);
    document.getElementById('back2-button').addEventListener('click', showMenu);
    document.getElementById('back3-button').addEventListener('click', showMenu);
    document.getElementById('dx-button').addEventListener('click', showDx);
    document.getElementById('toggle-minimalist').addEventListener('click', toggleMinimalistDesign);
    document.getElementById('toggle-fellow').addEventListener('change', toggleFellowMode);
    document.getElementById('wax-button').addEventListener('click', extractWax);

    loadMinimalistState();
    loadFellowModeState();
    loadHighScores();

    // Load image paths from images.json
    fetch('images.json')
        .then(response => response.json())
        .then(imagePaths => {
            // Preload images
            for (let category in imagePaths) {
                imagePaths[category].forEach(path => {
                    let img = new Image();
                    img.src = path;
                    images[category].push(img);
                });
            }

            // Set up event listeners for keyboard shortcuts
            document.addEventListener('keydown', handleKeyPress);

            // Show the menu
            showMenu();
        })
        .catch(error => {
            console.error('Error loading images.json:', error);
        });
}

// Toggle minimalist design
function toggleMinimalistDesign() {
    isMinimalist = !isMinimalist;
    updateMinimalistDesign();
    saveMinimalistState();
}

// Update the design based on the minimalist state
function updateMinimalistDesign() {
    if (isMinimalist) {
        document.body.classList.add('minimalist');
    } else {
        document.body.classList.remove('minimalist');
    }
}

// Save the minimalist state to localStorage
function saveMinimalistState() {
    localStorage.setItem('isMinimalist', JSON.stringify(isMinimalist));
}

// Load the minimalist state from localStorage
function loadMinimalistState() {
    const savedState = localStorage.getItem('isMinimalist');
    if (savedState !== null) {
        isMinimalist = JSON.parse(savedState);
        updateMinimalistDesign();
    }
}

// Toggle fellow mode
function toggleFellowMode() {
    isFellowMode = document.getElementById('toggle-fellow').checked;
    let fellowModeText = document.getElementById('fellow-mode-text');
    fellowModeText.textContent = isFellowMode ? "Fellow Mode Enabled" : "GPEP Mode Enabled";
    updateFellowMode();
    saveFellowModeState();
    updateHighScoreDisplay();
}



// Update the game based on the fellow mode state
function updateFellowMode() {
    if (isFellowMode) {
        document.body.classList.add('fellow-mode');
    } else {
        document.body.classList.remove('fellow-mode');
    }
}


// Save the fellow mode state to localStorage
function saveFellowModeState() {
    localStorage.setItem('isFellowMode', JSON.stringify(isFellowMode));
}

// Load the fellow mode state from localStorage
function loadFellowModeState() {
    const savedState = localStorage.getItem('isFellowMode');
    if (savedState !== null) {
        isFellowMode = JSON.parse(savedState);
        document.getElementById('toggle-fellow').checked = isFellowMode;
        isFellowMode = document.getElementById('toggle-fellow').checked;
        let fellowModeText = document.getElementById('fellow-mode-text');
        fellowModeText.textContent = isFellowMode ? "Fellow Mode Enabled" : "GPEP Mode Enabled";
        updateFellowMode();
    }
}

// Show the menu
function showMenu() {
    document.getElementById('menu').style.display = 'flex';
    document.getElementById('info-screen').style.display = 'none';
    document.getElementById('dx-screen').style.display = 'none';
    document.getElementById('game-container').style.display = 'none';
    stopAudio();
    isRunning = false;
}

// Show the info screen
function showInfo() {
    document.getElementById('menu').style.display = 'none';
    document.getElementById('info-screen').style.display = 'flex';
    document.getElementById('dx-screen').style.display = 'none';
    document.getElementById('game-container').style.display = 'none';
}

// Show the info screen
function showDx() {
    document.getElementById('menu').style.display = 'none';
    document.getElementById('info-screen').style.display = 'none';
    document.getElementById('dx-screen').style.display = 'flex';
    document.getElementById('game-container').style.display = 'none';
}

// Start the game
function startGame() {
    lives = isFellowMode ? 3 : 5;
    isRunning = true;
    document.getElementById('wax-button').style.display = isFellowMode ? 'block' : 'none';
    waxExtractionTools = isFellowMode ? 3 : 0; // Reset wax extraction tools
    document.getElementById('menu').style.display = 'none';
    document.getElementById('info-screen').style.display = 'none';
    document.getElementById('dx-screen').style.display = 'none';
    document.getElementById('game-container').style.display = 'block';
    updateWaxToolsDisplay(); // New function call
    resetGame();
}

// Start a new round
function startNewRound() {
    // Reset timer
    clearInterval(timerInterval);
    timeLeft = isFellowMode ? 6 : 10; // Reduce time for fellow mode
    updateTimer();

    // Choose a random image
    let categories = Object.keys(images);
    let randomCategory = categories[Math.floor(Math.random() * categories.length)];
    let randomIndex = Math.floor(Math.random() * images[randomCategory].length);
    currentImage = {
        category: randomCategory,
        src: images[randomCategory][randomIndex].src
    };

    // Determine blur factor and wax display if isFellowMode is true
    let blurStyle = "";
    let waxOverlays = "";
    let imageContainerClass = isFellowMode ? "fellow-mode-image" : "gpep-mode-image";
    
    if (isFellowMode) {
        
        // Apply random blur
        let randomBlur = Math.random() * 2; // Random blur between 0 and 2px
        blurStyle = `filter: blur(${randomBlur}px);`;

        // Determine whether to show wax
        let showWax = Math.random() < 1; // 100% chance to show wax
        if (showWax) {
            let waxCount = Math.floor(Math.random() * 4) + 3; // Random number of wax pieces (3 to 7)
            for (let i = 0; i < waxCount; i++) {
                let waxImage = Math.random() < 0.5 ? 'img/wax1.png' : 'img/wax2.png';
                let randomRotation = Math.random() * 360; // Random rotation between 0 and 360 degrees
                let waxSize = Math.random() * 75 + 25; // Random size for wax overlay (25 to 100 pixels)
                let randomTop = Math.random() * 80 + 10; // Random top position (10% to 90%)
                let randomLeft = Math.random() * 80 + 10; // Random left position (10% to 90%)
                let randomOpacity = Math.random() * 0.3 + 0.7; // Random opacity between 0.7 and 1
                let randomBlurWax = Math.floor(Math.random() * 1) + 1; // Random blur between 0.5 and 1
                waxOverlays += `<img src="${waxImage}" class="wax-overlay" style="top: ${randomTop}%; left: ${randomLeft}%; width: ${waxSize}px; height: ${waxSize}px; transform: rotate(${randomRotation}deg); filter: blur(${randomBlurWax}px); opacity: ${randomOpacity};">`;            
            }
        }
    }

    // Display the image with or without blur and with wax overlays (if applicable)
    document.getElementById('image').innerHTML = `
        <div class="image-container ${imageContainerClass}" style="position: relative; display: overflow: hidden;">
            <img src="${currentImage.src}" alt="Otoscopy Image" style="${blurStyle}">
            ${waxOverlays}
        </div>
    `;

    // Start wiggle effect after the image container is in the DOM
    if (isFellowMode && isRunning === true) {
        // Randomly decide whether to apply the wiggle effect
        let shouldWiggle = Math.random() < 0.33; // 33% chance to wiggle
        if (shouldWiggle) {
            setTimeout(() => {
                startWiggleEffect();
                // Play crying sound
                let randomCryingSound = Math.floor(Math.random() * 6) + 1;
                audio = new Audio(`audio/crying${randomCryingSound}.mp3`);
                audio.play();
            }, 100); // Short delay to ensure DOM is ready
        }
    }

    // Display the image with or without blur and with wax overlays (if applicable)
    document.getElementById('image').innerHTML = `
        <div class="image-container ${imageContainerClass}" style="position: relative; overflow: hidden;">
            <img src="${currentImage.src}" alt="Otoscopy Image" style="${blurStyle}">
            ${waxOverlays}
        </div>
    `;

    // Start the timer
    timerInterval = setInterval(updateTimer, 1000);

    // Hide covers
    document.getElementById('cover').style.display = 'none';
    document.getElementById('cover-win').style.display = 'none';
    document.getElementById('cover-lose').style.display = 'none';
}

function startWiggleEffect() {
    const imageContainer = document.querySelector('.image-container');
    if (!imageContainer) {
        console.error('Image container not found');
        return;
    }
    
    wiggleInterval = setInterval(() => {
        if (!isRunning) {
            stopWiggleEffect();
            return;
        }
        let randomX = Math.random() * 4 - 2; // Random value between -2 and 2
        let randomY = Math.random() * 4 - 2; // Random value between -2 and 2
        imageContainer.style.transform = `translate(${randomX}px, ${randomY}px)`;
    }, 100); // Wiggle every 100ms

    setTimeout(() => {
        stopWiggleEffect();
    }, timeLeft * 1000); // Stop wiggle effect when time runs out
}

function stopWiggleEffect() {
    clearInterval(wiggleInterval);
    const imageContainer = document.querySelector('.image-container');
    if (imageContainer) {
        imageContainer.style.transform = 'translate(0, 0)';
    }
}

function stopAudio() {
    if (audio && !audio.paused) {
        audio.pause();
        audio.currentTime = 0;
    }
}


// Update the timer
function updateTimer() {
    timeLeft--;
    document.getElementById('timer').textContent = `Time: ${timeLeft}`;
    if (timeLeft <= 0) {
        clearInterval(timerInterval);
        checkAnswer('timeout');
    }
}

// Check the answer
function checkAnswer(answer) {
    clearInterval(timerInterval);
    stopAudio();

    if (answer === 'timeout') {
        lives--;
        updateLives();
        document.getElementById('cover-lose').style.display = 'flex';
        let displayAnswer = currentImage.category === 'No_Effusion' ? 'No Effusion' : currentImage.category;
        document.getElementById('cover-lose').innerHTML = `
        <div>
            <img src="img/incorrect.png" alt="Incorrect">
            <p>Too slow, patient moved!<br><br> Correct answer: ${displayAnswer}</p>
        </div>
    `;
    updateStreak(false); // Reset streak when timeout occurs
    } else if (answer === currentImage.category) {
        let pointsAwarded = isFellowMode ? Math.min(timeLeft, 5) : 10;
        score += pointsAwarded;
        updateStreak(answer === currentImage.category);
        updateHighScore();
        document.getElementById('score').textContent = `Score: ${score}`;
        document.getElementById('cover-win').style.display = 'flex';
        document.getElementById('cover-win').innerHTML = `
        <div>
            Ka Pai!<br>
            <img src="img/correct.png" alt="Correct">
            <p>+${pointsAwarded} points</p>
        </div>
    `;
    } else {
        lives--;
        updateLives();
        document.getElementById('cover-lose').style.display = 'flex';
        let displayAnswer = currentImage.category === 'No_Effusion' ? 'No Effusion' : currentImage.category;
        document.getElementById('cover-lose').innerHTML = `
        <div>
            <img src="img/incorrect.png" alt="Incorrect">
            <p>Correct answer: ${displayAnswer}</p>
        </div>
    `;
    updateStreak(false); // Reset streak when timeout occurs
    }

    if (lives > 0) {
        setTimeout(startNewRound, isFellowMode ? 1500 : 2000); // Reduce delay for fellow mode
    } else {
        endGame();
    }
}

// Update lives display
function updateLives() {
    let livesDisplay = '';
    for (let i = 0; i < lives; i++) {
        livesDisplay += '<img src="img/life.png" alt="Life" class="life-icon">';
    }
    document.getElementById('lives').innerHTML = `Lives: ${livesDisplay}`;
}

// Handle keyboard shortcuts
function handleKeyPress(event) {
    switch(event.key.toLowerCase()) {
        case 'a':
            checkAnswer('AOM');
            break;
        case 'o':
            checkAnswer('OME');
            break;
        case 'n':
            checkAnswer('No_Effusion');
            break;
        case 'e':
            extractWax();
            break;
    }
    stopAudio(); 
}

function updateWaxToolsDisplay() {
    let toolsDisplay = document.getElementById('wax-tools');
    if (!toolsDisplay) {
        toolsDisplay = document.createElement('div');
        toolsDisplay.id = 'wax-tools';
        document.getElementById('game-area').insertBefore(toolsDisplay, document.getElementById('image'));
    }
    toolsDisplay.innerHTML = `Wax Extraction Tools: ${waxExtractionTools}`;
    toolsDisplay.style.display = isFellowMode ? 'block' : 'none';
}

function extractWax() {
    if (waxExtractionTools > 0) {
        waxExtractionTools--;
        updateWaxToolsDisplay();
        
        // Remove wax overlays
        let waxOverlays = document.querySelectorAll('.wax-overlay');
        waxOverlays.forEach(overlay => overlay.remove());

        // Remove blur from the image
        let image = document.querySelector('.image-container img');
        image.style.filter = 'none';

        // Reset the timer
        clearInterval(timerInterval);
        timeLeft = isFellowMode ? 6 : 10;
        updateTimer();
        timerInterval = setInterval(updateTimer, 1000);

        // Remove the extract wax button
        let extractButton = document.getElementById('extract-wax');
        if (extractButton) {
            extractButton.remove();
        }

        // Stop wiggle effect and audio
        stopWiggleEffect();
        stopAudio();
    }
}

function loadHighScores() {
    const storedGpepHighScore = localStorage.getItem('gpepHighScore');
    const storedFellowHighScore = localStorage.getItem('fellowHighScore');
    
    if (storedGpepHighScore !== null) {
        gpepHighScore = parseInt(storedGpepHighScore, 10);
    }
    if (storedFellowHighScore !== null) {
        fellowHighScore = parseInt(storedFellowHighScore, 10);
    }
    
    updateHighScoreDisplay();
}

function updateHighScoreDisplay() {
    const currentHighScore = isFellowMode ? fellowHighScore : gpepHighScore;
    const modeText = isFellowMode ? "Fellow" : "GPEP";
    document.getElementById('high-score').textContent = `${modeText} High Score: ${currentHighScore}`;
}



// High score system
function updateHighScore() {
    let currentHighScore = isFellowMode ? fellowHighScore : gpepHighScore;
    
    if (score > currentHighScore) {
        if (isFellowMode) {
            fellowHighScore = score;
            localStorage.setItem('fellowHighScore', fellowHighScore);
        } else {
            gpepHighScore = score;
            localStorage.setItem('gpepHighScore', gpepHighScore);
        }
        updateHighScoreDisplay();
        //showNotification('New High Score!');
    }
}

// Streak system
function updateStreak(correct) {
    if (correct) {
        streak++;
        if (streak > 0 && streak % 5 === 0) {
            waxExtractionTools += 1;
            updateWaxToolsDisplay();
        }
    } else {
        console.log("wrong");
        streak = 0;
    }
    document.getElementById('streak').textContent = `Streak: ${streak}`;
}

// End the game
function endGame() {
    // Hide the image and show the game over screen
    isRunning = false;
    document.getElementById('image').innerHTML = ''; // Clear the image
    document.getElementById('cover').style.display = 'flex';
    document.getElementById('cover').innerHTML = `
        <div>
            <h2>Game Over</h2>
            <img src="img/done.png" alt="Life" class="done-icon">
            <p>Your final score: ${score}</p>
            <button onclick="resetGame()">Play Again</button>
            <button onclick="showMenu()">Main Menu</button>
        </div>
    `;

    // Hide the win/lose covers in case they are visible
    document.getElementById('cover-win').style.display = 'none';
    document.getElementById('cover-lose').style.display = 'none';
    stopAudio();
}

// Reset the game
function resetGame() {
    score = 0;
    lives = isFellowMode ? 3 : 5;
    isRunning = true;
    waxExtractionTools = isFellowMode ? 3 : 0; // Reset wax extraction tools
    document.getElementById('score').textContent = 'Score: 0';
    updateLives();
    updateWaxToolsDisplay(); // Update wax tools display
    startNewRound();
    // Ensure all covers are hidden
    document.getElementById('cover').style.display = 'none';
    document.getElementById('cover-win').style.display = 'none';
    document.getElementById('cover-lose').style.display = 'none';
    streak = 0;
    document.getElementById('streak').textContent = 'Streak: 0';
}

// Initialize the game when the page loads
window.onload = initGame;
