// Initialization
let WORD_LIST = ['ENGINEERING']; 
const MAX_WRONG = 6;
const BODY_PARTS = [
  'part-head',
  'part-body',
  'part-arm-left',
  'part-arm-right',
  'part-leg-left',
  'part-leg-right'
];

// Load dictionary.txt
async function loadDictionary() {
  try {
    // Relative path to dictionary.txt in the same directory
    const response = await fetch('./dictionary.txt');

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const textData = await response.text();

    WORD_LIST = textData
      .split('\n')
      .map(word => word.trim().toUpperCase())
      .filter(word => word.length > 0);

    initGame();
  } catch (error) {
    console.error('Failed to load dictionary.txt:', error);
    WORD_LIST = ['ENGINEERING'];
    initGame();
  }
}

// Initializing Variables
let selectedWord = '';
let guessedLetters = new Set();
let wrongGuesses = 0;

// DOM References
const wordDisplay = document.getElementById('word-display');
const keyboardContainer = document.getElementById('keyboard');
const wrongCountSpan = document.getElementById('wrong-count');
const resetBtn = document.getElementById('reset-btn');

// Start/Reset Game
function initGame() {
  if (WORD_LIST.length === 0) return;

  selectedWord = WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)];
  guessedLetters.clear();
  wrongGuesses = 0;

  wrongCountSpan.textContent = wrongGuesses;
  resetDrawing();
  renderWordDisplay();
  renderKeyboard();
}

// Render Underlines/Letters
function renderWordDisplay() {
  wordDisplay.innerHTML = '';
  for (const letter of selectedWord) {
    const box = document.createElement('div');
    box.classList.add('letter-box');
    box.textContent = guessedLetters.has(letter) ? letter : '';
    wordDisplay.appendChild(box);
  }
}

// Render Keyboard Buttons
function renderKeyboard() {
  keyboardContainer.innerHTML = '';
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  alphabet.split('').forEach(letter => {
    const button = document.createElement('button');
    button.classList.add('key-btn');
    button.textContent = letter;

    if (guessedLetters.has(letter)) {
      button.disabled = true;
      button.classList.add(selectedWord.includes(letter) ? 'correct' : 'wrong');
    }

    button.addEventListener('click', () => handleGuess(letter));
    keyboardContainer.appendChild(button);
  });
}

// Handle Guess Logic
function handleGuess(letter) {
  if (guessedLetters.has(letter) || wrongGuesses >= MAX_WRONG) return;

  guessedLetters.add(letter);

  if (!selectedWord.includes(letter)) {
    wrongGuesses++;
    wrongCountSpan.textContent = wrongGuesses;
    revealNextBodyPart();
  }

  renderWordDisplay();
  renderKeyboard();
  checkGameEnd();
}

// Draw Next Part on SVG
function revealNextBodyPart() {
  const partId = BODY_PARTS[wrongGuesses - 1];
  const element = document.getElementById(partId);
  if (element) {
    element.classList.add('show');
  }
}

// Hide All SVG Body Parts
function resetDrawing() {
  document.querySelectorAll('.body-part').forEach(part => {
    part.classList.remove('show');
  });
}

// Check Win/Loss Condition
function checkGameEnd() {
  const isWon = selectedWord.split('').every(l => guessedLetters.has(l));

  if (isWon) {
    setTimeout(() => alert('You Win! 🎉'), 100);
    disableAllKeys();
  } else if (wrongGuesses >= MAX_WRONG) {
    setTimeout(() => alert(`Game Over! The word was: ${selectedWord}`), 100);
    disableAllKeys();
  }
}

function disableAllKeys() {
  keyboardContainer.querySelectorAll('button').forEach(btn => btn.disabled = true);
}

// Event Listener for Reset Button
resetBtn.addEventListener('click', initGame);

// Physical Keyboard Input Listener
document.addEventListener('keydown', (e) => {
  const key = e.key.toUpperCase();
  if (/^[A-Z]$/.test(key)) {
    handleGuess(key);
  }
});

// Initialize by loading the dictionary file first
loadDictionary();
