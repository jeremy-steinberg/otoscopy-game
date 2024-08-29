// Game variables
let score = 0;
let lives = 5;
let timeLeft = 10;
let timerInterval;
let currentImage;
let isMinimalist = false;
let isFellowMode = false;
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

    loadMinimalistState();
    loadFellowModeState();

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
    updateFellowMode();
    saveFellowModeState();
}


// Update the game based on the fellow mode state
function updateFellowMode() {
    if (isFellowMode) {
        document.body.classList.add('fellow-mode');
        document.getElementById('fellow-mode-text').textContent = 'Fellow Mode';
        document.getElementById('image').style.width = "20%";
        document.getElementById('image').style.backgroundColor = "black"; 
        document.getElementById('image').style.border = "black";      
 
    } else {
        document.body.classList.remove('fellow-mode');
        document.getElementById('fellow-mode-text').textContent = 'GPEP Mode';
        document.getElementById('image').style.width = "100%";
        document.getElementById('image').style.backgroundColor = "#008080"; 
        document.getElementById('image').style.border = "4px solid #00ffff";  

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
        updateFellowMode();
    }
}

// Show the menu
function showMenu() {
    document.getElementById('menu').style.display = 'flex';
    document.getElementById('info-screen').style.display = 'none';
    document.getElementById('dx-screen').style.display = 'none';
    document.getElementById('game-container').style.display = 'none';
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
    document.getElementById('menu').style.display = 'none';
    document.getElementById('info-screen').style.display = 'none';
    document.getElementById('dx-screen').style.display = 'none';
    document.getElementById('game-container').style.display = 'block';
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

    // Display the image
    document.getElementById('image').innerHTML = `<img src="${currentImage.src}" alt="Otoscopy Image">`;

    // Start the timer
    timerInterval = setInterval(updateTimer, 1000);

    // Hide covers
    document.getElementById('cover').style.display = 'none';
    document.getElementById('cover-win').style.display = 'none';
    document.getElementById('cover-lose').style.display = 'none';
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
    } else if (answer === currentImage.category) {
        let pointsAwarded = isFellowMode ? Math.min(timeLeft, 5) : 10;
        score += pointsAwarded;
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
    }
}

// End the game
function endGame() {
    // Hide the image and show the game over screen
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
}

// Reset the game
function resetGame() {
    score = 0;
    lives = isFellowMode ? 3 : 5; // Reduce lives for fellow mode
    document.getElementById('score').textContent = 'Score: 0';
    updateLives();
    startNewRound();
    // Ensure all covers are hidden
    document.getElementById('cover').style.display = 'none';
    document.getElementById('cover-win').style.display = 'none';
    document.getElementById('cover-lose').style.display = 'none';
}

// Initialize the game when the page loads
window.onload = initGame;
