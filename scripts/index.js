const gridContainer = document.querySelector(".grid-container");
const tabs = document.querySelectorAll('.menu__tab');
const gameWindow = document.querySelector('.game'),
      menuWindow = document.querySelector('.menu');

let cards = [];
let firstCard, secondCard;
let lockBoard = false;
let score = 0;

document.querySelector(".score").textContent = score;

function getData(n) {
    fetch("./database/cards.json")
        .then((res) => res.json())
        .then((database) => {

            for (let i = 0; i <= n; i++) {
                cards.push(...database);
            }

            shuffleCards();
            generateCards();
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
                getData(1);
                menuWindow.style.display = 'none';
                gameWindow.style.display = 'flex';
            } else if (tab == tabs[1]) {
                grid.classList.add('grid-container_large');
                getData(3);
                menuWindow.style.display = 'none';
                gameWindow.style.display = 'flex';
            } else {
                grid.classList.add('grid-container_large');
                getData(5);
                menuWindow.style.display = 'none';
                gameWindow.style.display = 'flex';
            }
        });
    });
}

setBoardSize();

function openModal() {
    const renderedCards = document.querySelectorAll('.card');
    let counter = 0;

    for (let i of renderedCards) {
        if (i.classList.contains('flipped')) {
            counter++;
        }
    }

    if (counter == cards.length) {
        setTimeout(showModal, 1000);
    }
}

function showModal() {
    const modal = document.querySelector('.modal');
    modal.style.display = 'flex';
    closeModal(modal);
}

function closeModal(elem) {
    const closeBtn = document.querySelector('.modal__btn');
    closeBtn.addEventListener('click', () => elem.style.display = 'none');
}