import JSConfetti from 'https://cdn.skypack.dev/js-confetti';

const jsConfetti = new JSConfetti();
let flipCount = 0;
let maxTime = 40;
let timeLeft = maxTime;
let matchedCard = 0;
let missedMatches = 0;
let isPlaying = false;
let timerId = null;
let firstClick = null;
let secondClick = null;
let desc = document.querySelector(".desc");

const cards = document.querySelectorAll(".card");
let imgArr = [
    "img-1.png", "img-2.png", "img-3.png", "img-4.png", "img-5.png", "img-6.png",
    "img-1.png", "img-2.png", "img-3.png", "img-4.png", "img-5.png", "img-6.png"
];

function startGame() {
    shuffleAndAssignImages();
    flipCard();
}

startGame();

function shuffleAndAssignImages() {
    let shuffledImages = shuffleArray([...imgArr]);
    cards.forEach((card, index) => {
        $(card).find('.card-img').attr('src', "images/" + shuffledImages[index]);
    });
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function startTimer() {
    if (timerId) return;
    document.querySelector('.time b').textContent = timeLeft + "s";

    timerId = setInterval(() => {
        if (timeLeft <= 0) {
            setAlert("Time's up!");
            clearInterval(timerId);
            document.querySelector('.time b').textContent = "0s";
            isPlaying = false;
            timerId = null;
            $('.card').off('click');
        } else {
            timeLeft--;
            document.querySelector('.time b').textContent = timeLeft + "s";
        }
    }, 1000);
}

function flipCard() {
    $('.card').on('click', function () {
        if (!isPlaying) {
            isPlaying = true;
            startTimer();
        }

        if (timeLeft <= 0 || $(this).hasClass('flip') || secondClick != null) 
            return;

        else {
            $(this).addClass('flip');
            updateFlips();

            if (!firstClick) {
                firstClick = $(this);
            } else {
                secondClick = $(this);
                checkMatch();
            }
        }
    });
}

function setAlert(msg) {
    if (msg === "WON!") {
        desc.classList.add('show', 'success');
        $(desc).hide().html(`
            <p>Wohooo! 🎉 You matched cards before time! <br>
            You got only <strong>${missedMatches}</strong> misses! </p>
        `).fadeIn(500);
        jsConfetti.addConfetti();
    } else if (msg === "Time's up!") {
        desc.classList.add('show', 'timeout');
        $(desc).hide().html(`
            <p>Time's up! ⏳ You lose! <br>
            You got <strong>${missedMatches}</strong> misses! </p>
        `).fadeIn(500);
        playSound("timeout");
    }
}

function checkMatch() {
    const cardOneImg = firstClick.find(".back-view img").attr('src');
    const cardTwoImg = secondClick.find(".back-view img").attr('src');

    if (cardOneImg === cardTwoImg) {
        matchedCard++;
        playSound("success");
        if (matchedCard == 6 && timeLeft > 0) {
            setAlert("WON!");
            clearInterval(timerId);
            return;  // Exit function
        }
        disableClick();
    } 
    else {
        missedMatches++;
        playSound("wrong");
        unflipCards();
    }
}

function playSound(name) {
    var audio = new Audio(name + ".mp3");
    audio.play();
}

function disableClick() {
    firstClick.off('click');
    secondClick.off('click');
    resetClicks();
}

function unflipCards() {
    setTimeout(() => {
        firstClick.addClass('shake');
        secondClick.addClass('shake');
    }, 400);

    setTimeout(() => {
        firstClick.removeClass('shake flip');
        secondClick.removeClass('shake flip');
        resetClicks();
    }, 1200);
}



function resetClicks() {
    firstClick = null;
    secondClick = null;
}

function updateFlips() {
    flipCount++;
    $(".flips b").text(flipCount);
}

$(".btn").click(function () {
    resetGame();
});

function resetGame() {
    flipCount = 0;
    timeLeft = maxTime;
    isPlaying = false;
    clearInterval(timerId);
    timerId = null;
    $(".time b").text(timeLeft + "s");
    $(".flips b").text(flipCount);

    $(desc).fadeOut(500, function () {
        desc.classList.remove('timeout', 'success');
        desc.innerHTML = `<div class="desc">Flip the cards, find the pairs, and become the ultimate memory master!</div>`;
        $(desc).fadeIn();
    });

    resetClicks();
    $('.card').removeClass('flip shake');
    $('.card').off('click');
    setTimeout(shuffleAndAssignImages, 500);
    flipCard();
}
