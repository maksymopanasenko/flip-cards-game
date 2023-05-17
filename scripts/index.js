const gridContainer = document.querySelector(".grid-container");
const tabs = document.querySelectorAll('.menu__tab');
const modal = document.querySelector('.modal');
const gameWindow = document.querySelector('.game'),
      menuWindow = document.querySelector('.menu');
const scoreTableItemsEasy = document.querySelectorAll('[data-level="easy"]'),
      scoreTableItemsMiddle = document.querySelectorAll('[data-level="middle"]'),
      scoreTableItemsHard = document.querySelectorAll('[data-level="hard"]');

let cards = [];
let arrayEasy = [],
    arrayMiddle = [],
    arrayHard = [];
let setTime;
let firstCard, secondCard;
let lockBoard = false;
let score = 0;


function defineLevelTable(storageKey, recordsArray, selector) {

    if (window.localStorage.getItem(storageKey)) {
        getFromStorage(storageKey, selector);
        recordsArray = [...JSON.parse(window.localStorage.getItem(storageKey))];
    }
}

defineLevelTable('scoreEasy', arrayEasy, scoreTableItemsEasy);
defineLevelTable('scoreMiddle', arrayMiddle, scoreTableItemsMiddle);
defineLevelTable('scoreHard', arrayHard, scoreTableItemsHard);

document.querySelector(".score").textContent = score;

document.querySelectorAll('.modal__btn').forEach(btn => {
    btn.addEventListener('click', () => {
        hideModal(btn);
    });
});

document.querySelector('.aside__btn').addEventListener('click', (e) => {
    hideModal(e.target);
})

function getData(n) {
    fetch("./database/cards.json")
        .then((res) => res.json())
        .then((database) => {

            for (let i = 0; i <= n; i++) {
                cards.push(...database);
            }

            shuffleCards();
            generateCards();
            setTimeLimit();
        });
}

function shuffleCards() {
    let currentIndex = cards.length,
        randomIndex,
        temporaryValue;
    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        temporaryValue = cards[currentIndex];
        cards[currentIndex] = cards[randomIndex];
        cards[randomIndex] = temporaryValue;
    }
}

function generateCards() {
    for (let card of cards) {
        const cardElement = document.createElement("div");
        cardElement.classList.add("card");
        cardElement.setAttribute("data-name", card.name);
        cardElement.innerHTML = `
            <div class="front">
                <img class="front-image" src=${card.image} />
            </div>
            <div class="back"></div>
            `;
        gridContainer.appendChild(cardElement);
        cardElement.addEventListener("click", flipCard);
    }
}   

function flipCard() {
    if (lockBoard) return;
    if (this === firstCard) return;

    this.classList.add("flipped");

    if (!firstCard) {
        firstCard = this;
        return;
    }

    secondCard = this;
    score++;
    document.querySelector(".score").textContent = score;
    lockBoard = true;

    checkForMatch();
    openModal();
}

function checkForMatch() {
    let isMatch = firstCard.dataset.name === secondCard.dataset.name;
    isMatch ? disableCards() : unflipCards();
}

function disableCards() {
    firstCard.removeEventListener("click", flipCard);
    secondCard.removeEventListener("click", flipCard);

    resetBoard();
}

function unflipCards() {
    setTimeout(() => {
        firstCard.classList.remove("flipped");
        secondCard.classList.remove("flipped");
        resetBoard();
    }, 1000);
}

function resetBoard() {
    firstCard = null;
    secondCard = null;
    lockBoard = false;
}

function restart() {
    resetBoard();
    shuffleCards();
    score = 0;
    document.querySelector(".score").textContent = score;
    gridContainer.innerHTML = "";
    generateCards();
}

function setBoardSize() {
    const grid = document.querySelector('.grid-container');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            if (tab == tabs[0]) {
                grid.classList.remove('grid-container_large', 'middle', 'hard');
                getData(1);
                menuWindow.style.display = 'none';
                gameWindow.style.display = 'flex';
            } else if (tab == tabs[1]) {
                grid.classList.add('grid-container_large', 'middle');
                grid.classList.remove('hard');
                getData(3);
                menuWindow.style.display = 'none';
                gameWindow.style.display = 'flex';
            } else {
                grid.classList.add('grid-container_large', 'hard');
                grid.classList.remove('middle');
                getData(5);
                menuWindow.style.display = 'none';
                gameWindow.style.display = 'flex';
            }
        });
    });
}

function openModal() {
    const renderedCards = document.querySelectorAll('.card');
    let counter = 0;

    for (let i of renderedCards) {
        if (i.classList.contains('flipped')) {
            counter++;
        }
    }

    if (counter == cards.length) {
        updateScore();
        clearInterval(setTime);
        toggleModalContent(0);
        setTimeout(showModal, 1000);
    }
}

function showModal() {
    modal.style.display = 'flex';
}

function hideModal(btn) {
    
    clearInterval(setTime);
    
    if (btn.classList.contains('restart')) {
        setTimeLimit();
    }

    if (btn.classList.contains('to-menu')) {
        menuWindow.style.display = 'block';
        gameWindow.style.display = 'none';
        cards = [];
        restart();
    }
    modal.style.display = 'none';
}

function updateScore() {
    const score = document.getElementById('score');
    const scoreModal = document.querySelector('.modal__score');

    scoreModal.innerText = score.innerText;

    if (gridContainer.classList.contains('hard')) {
        defineStorage('scoreHard', arrayHard, scoreTableItemsHard);
    } else if (gridContainer.classList.contains('middle')) {
        defineStorage('scoreMiddle', arrayMiddle, scoreTableItemsMiddle);
    } else {
        defineStorage('scoreEasy', arrayEasy, scoreTableItemsEasy);
    }

    function defineStorage(storageKey, recordsArray, selector) {

        if (window.localStorage.getItem(storageKey)) {
            recordsArray = [...JSON.parse(window.localStorage.getItem(storageKey))];
        }

        recordsArray.push(score.innerText);

        if (selector.length < recordsArray.length) {
            sortNumbers(recordsArray).pop();
        }

        window.localStorage.setItem(storageKey, JSON.stringify(sortNumbers(recordsArray)));

        getFromStorage(storageKey, selector);
    }
}

function getFromStorage(key, selector) {
    let records = window.localStorage.getItem(key);
    records = JSON.parse(records);

    for (let i = 0; i < records.length; i++) {
        records.forEach((item, n) => {
            selector[n].innerText = item;
        });
    }
}

function sortNumbers(array) {
    return array.sort(function(a, b) {
        return a - b;
    });
}

const mins = document.querySelector('.minutes'),
      secs = document.querySelector('.seconds');

function setTimeLimit() {
    if (gridContainer.classList.contains('hard')) {
        updateTime(160);
    } else if (gridContainer.classList.contains('middle')) {
        updateTime(110);
    } else {
        updateTime(60);
    }
}

function updateTime(time) {
    let total = time;
    let minutes, seconds;

    calcTime(total);

    setTime = setInterval(() => {
        total -= 1;
        calcTime(total);
    }, 1000);

    function calcTime(total) {
        minutes = Math.floor(total / 60);
        seconds = Math.floor(total % 60);
        mins.innerText = getZero(minutes);
        secs.innerText = getZero(seconds);

        if (total <= 0) {
            showModal();
            clearInterval(setTime);
            toggleModalContent(1);
        }
    }
}

function getZero(num) {
    if (num >= 0 && num < 10) {
        return `0${num}`;
    } else {
        return num;
    }
}

function toggleModalContent(num) {
    const modalContent = document.querySelectorAll('.modal__content');

    modalContent.forEach((content, i) => {
        if (i == num) {
            content.classList.add('modal__content_active');
        } else {
            content.classList.remove('modal__content_active');
        }
    });
}

function changeSlide() {
    const tables = document.querySelectorAll('.records__group');
    const arrowLeft = document.querySelector('[data-arrow="left"]');
    const arrowRight = document.querySelector('[data-arrow="right"]');
    
    let count = 0;

    arrowLeft.addEventListener('click', () => {
        count--;
        setSlide();
    });

    arrowRight.addEventListener('click', () => {
        count++;
        setSlide();
    });

    function setSlide() {
        tables.forEach(table => table.style.display = 'none');

        if(count < 0) {
            count = tables.length - 1;
        }

        if (count > tables.length -1) {
            count = 0;
        }

        tables[count].style.display = 'block';
    }
}

setBoardSize();
changeSlide();