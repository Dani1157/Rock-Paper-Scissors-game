
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
        resultDisplay.textContent = "YOU WIN";
        resultDisplay.style.color = "green";
        playerScore++;
        playerScoreDisplay.textContent = `Player Score: ${playerScore}`;
        break;
    case "YOU LOSE":
        resultDisplay.textContent = "YOU LOSE";
        resultDisplay.style.color = "red";
        botScore++;
        botScoreDisplay.textContent = `Bot Score: ${botScore}`;
        break;
    case "IT'S A TIE":
        resultDisplay.textContent = "IT'S A TIE";
        resultDisplay.style.color = "black";
        break;
}
}

