
const choices = ["rock", "paper", "scissor"];
const playersDislay = document.getElementById("playersDisplay");
const botDisplay = document.getElementById("botDisplay");
const resultDisplay = document.getElementById("resultDisplay");
const playerScoreDisplay = document.getElementById("playerScoreDisplay");
const botScoreDisplay = document.getElementById("botScoreDisplay");
let playerScore = 0;
let botScore = 0;

function mygame(playerschoice) {
    const botChoice = choices[Math.floor(Math.random() * 3)];
    let result = "";

    if (playerschoice === botChoice) {
        result = "IT'S A TIE";
    } else {
        switch (playerschoice) {
            case "rock":
                result = (botChoice === "scissor") ? "YOU WIN" : "YOU LOSE";
                break;
            case "paper":
                result = (botChoice === "rock") ? "YOU WIN" : "YOU LOSE";
                break;
            case "scissor":
                result = (botChoice === "paper") ? "YOU WIN" : "YOU LOSE";
                break;
        }
    }

    playersDislay.textContent = `The Player chose: ${playerschoice}`;
    botDisplay.textContent = `The Bot chose: ${botChoice}`;
    resultDisplay.textContent = result;

    switch (result) {
        case "YOU WIN":
            document.body.style.backgroundColor = "green";
            playerScore++;
            playerScoreDisplay.textContent = `Player Score: ${playerScore}`;
            break;
        case "YOU LOSE":
            document.body.style.backgroundColor = "red";
            botScore++;
            botScoreDisplay.textContent = `Bot Score: ${botScore}`;
            break;
        case "IT'S A TIE":
            document.body.style.backgroundColor = "black";
            break;
    
    }
}

