const words = [
    { word: "Hello", translation: "Привет", example: "Hello, dear!", attempts: 0 },
    { word: "Goodbye", translation: "До свидания", example: "Goodbye, mam.", attempts: 0 },
    { word: "Сlothes", translation: "Одежда", example: "I bought new clothes.", attempts: 0 },
    { word: "Dog", translation: "Собака", example: "The dog is friendly.", attempts: 0 },
    { word: "Dinner", translation: "Ужин", example: "My dad cooked diner yesterday.", attempts: 0 },
    { word: "Brother", translation: "Брат", example: "I have brother.", attempts: 0 },
    { word: "Computer", translation: "Компьютер", example: "I use computer on daily basis.", attempts: 0 },
    { word: "Bag", translation: "Сумка", example: "My bag is very stylish", attempts: 0 },
    { word: "Meeting", translation: "Встреча", example: "I have two meetings today.", attempts: 0 },
    { word: "Cinema", translation: "Кинотеатр", example: "I go two the cinema twice a month.", attempts: 0 },
];

let currentIndex = 0;
let firstCard = null;
let startTime = null;
let timerInterval = null;
let elapsedTime = 0;

const flipCard = document.querySelector('.flip-card');
const frontCard = document.querySelector('#card-front h1');
const backCard = document.querySelector('#card-back h1');
const exampleText = document.querySelector('#card-back span');
const currentWordElement = document.querySelector('#current-word');
const totalWordElement = document.querySelector('#total-word');
const nextButton = document.querySelector('#next');
const backButton = document.querySelector('#back');
const examButton = document.querySelector('#exam');
const studyMode = document.querySelector('#study-mode');
const examMode = document.querySelector('#exam-mode');
const examCardsContainer = document.querySelector('#exam-cards');
const timeElement = document.querySelector('#time');
const shuffleButton = document.querySelector('#shuffle-words');

const updateCard = () => {
    frontCard.textContent = words[currentIndex].word;
    backCard.textContent = words[currentIndex].translation;
    exampleText.textContent = words[currentIndex].example;
    currentWordElement.textContent = currentIndex + 1;
    totalWordElement.textContent = words.length;
    updateStudyProgress();
};

const updateStudyProgress = () => {
    const progress = (currentIndex / (words.length - 1)) * 100;
    document.querySelector('#words-progress').value = progress;
};

const nextWord = () => {
    if (currentIndex < words.length - 1) {
        currentIndex++;
        updateCard();
        backButton.disabled = false;
    }
    if (currentIndex === words.length - 1) {
        nextButton.disabled = true;
    }
};

const prevWord = () => {
    if (currentIndex > 0) {
        currentIndex--;
        updateCard();
        nextButton.disabled = false;
    }
    if (currentIndex === 0) {
        backButton.disabled = true;
    }
};

flipCard.addEventListener('click', () => {
    flipCard.classList.toggle('active');
});

shuffleButton.addEventListener('click', () => {
    words.sort(() => Math.random() - 0.5);
    currentIndex = 0;
    updateCard();
    nextButton.disabled = false;
    backButton.disabled = true;
});

updateCard();

const startTimer = () => {
    startTime = Date.now();
    timerInterval = setInterval(updateTimer, 1000);
};

const updateTimer = () => {
    const currentTime = Date.now() - startTime;
    const minutes = Math.floor(currentTime / 60000);
    const seconds = Math.floor((currentTime % 60000) / 1000);
    timeElement.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

const stopTimer = () => {
    clearInterval(timerInterval);
    elapsedTime = Date.now() - startTime;
};

const updateExamProgress = () => {
    const correctCards = document.querySelectorAll('.fade-out').length / 2;
    const totalPairs = words.length;
    const percent = (correctCards / totalPairs) * 100;
    document.querySelector('#correct-percent').textContent = `${percent.toFixed(0)}%`;
    document.querySelector('#exam-progress').value = percent;
};

const handleCardClick = (card) => {
    if (card.classList.contains('correct') || card.classList.contains('wrong')) {
        return;
    }

    if (!firstCard) {
        firstCard = card;
        firstCard.classList.add('correct');
    } else {
        const firstWord = firstCard.dataset.word;
        const secondWord = card.dataset.word;

        const isMatch =
            (firstCard.dataset.type === 'word' && card.dataset.type === 'translation' && firstWord === secondWord) ||
            (firstCard.dataset.type === 'translation' && card.dataset.type === 'word' && firstWord === secondWord);

        if (isMatch) {
            firstCard.classList.add('fade-out');
            card.classList.add('fade-out');
            firstCard = null;
        } else {
            const wordData = words.find((w) => w.word === firstCard.dataset.word || w.translation === firstCard.dataset.word);
            if (wordData) {
                wordData.attempts++;
            }

            card.classList.add('wrong');
            setTimeout(() => {
                card.classList.remove('wrong');
                firstCard.classList.remove('correct');
                firstCard = null;
            }, 500);
        }
    }

    updateExamProgress();
    const remainingCards = document.querySelectorAll('.card:not(.fade-out)');
    if (remainingCards.length === 0) {
        stopTimer();
        showResults();
    }
};

const showResults = () => {
    const resultsModal = document.querySelector('.results-modal');
    const resultsContent = document.querySelector('.results-content');
    const wordStatsTemplate = document.querySelector('#word-stats');
    const studyCards = document.querySelector('.study-cards');
    studyCards.classList.add('hidden');
    resultsContent.innerHTML = '';

    words.forEach((word) => {
        const stats = document.importNode(wordStatsTemplate.content, true);
        stats.querySelector('.word span').textContent = word.word;
        stats.querySelector('.attempts span').textContent = word.attempts;
        resultsContent.appendChild(stats);
    });

    const minutes = Math.floor(elapsedTime / 60000);
    const seconds = Math.floor((elapsedTime % 60000) / 1000);
    document.querySelector('#timer').textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    resultsModal.classList.remove('hidden');
};

const startExam = () => {
    examCardsContainer.innerHTML = '';
    const cards = [];
    words.forEach((item) => {
        cards.push({ text: item.word, type: 'word', word: item.word });
        cards.push({ text: item.translation, type: 'translation', word: item.word });
    });
    cards.sort(() => Math.random() - 0.5);

    cards.forEach((card) => {
        const cardElement = document.createElement('div');
        cardElement.classList.add('card');
        cardElement.textContent = card.text;
        cardElement.dataset.type = card.type;
        cardElement.dataset.word = card.word;
        examCardsContainer.appendChild(cardElement);
    });

    examCardsContainer.querySelectorAll('.card').forEach((card) => {
        card.addEventListener('click', () => handleCardClick(card));
    });

    startTimer();
};

examButton.addEventListener('click', () => {
    studyMode.classList.add('hidden');
    examMode.classList.remove('hidden');
    startExam();
});

nextButton.addEventListener('click', nextWord);
backButton.addEventListener('click', prevWord);

document.querySelector('.results-modal').addEventListener('click', (e) => {
    if (e.target === document.querySelector('.results-modal')) {
        document.querySelector('.results-modal').classList.add('hidden');
        document.querySelector('.study-cards').classList.remove('hidden');
    }
});