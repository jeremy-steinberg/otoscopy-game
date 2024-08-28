// Game variables
let score = 0;
let lives = 5;
let timeLeft = 10;
let timerInterval;
let currentImage;
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
    document.getElementById('dx-button').addEventListener('click', showDx);

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
    timeLeft = 10;
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
    if (answer === currentImage.category) {
        score += 10;
        document.getElementById('score').textContent = `Score: ${score}`;
        document.getElementById('cover-win').style.display = 'flex';
    } else {
        lives--;
        updateLives();
        document.getElementById('cover-lose').style.display = 'flex';
    }

    if (lives > 0) {
        setTimeout(startNewRound, 2000);
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
    lives = 5;
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
