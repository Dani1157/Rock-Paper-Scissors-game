var choices = ["rock", "paper", "scissors"];

var playersDisplay = document.getElementById("playersDisplay");
var botDisplay = document.getElementById("botDisplay");
var resultDisplay = document.getElementById("resultDisplay");
var playerScoreDisplay = document.getElementById("playerScoreDisplay");
var botScoreDisplay = document.getElementById("botScoreDisplay");

var playerScore = 0;
var botScore = 0;

function mygame(playersChoice) {
    var botChoice = choices[Math.floor(Math.random() * choices.length)];
    var result = "";

    if (playersChoice === botChoice) {
        result = "IT'S A TIE";
    } else {
        result = (playersChoice === "rock" && botChoice === "scissors") ||
            (playersChoice === "paper" && botChoice === "rock") ||
            (playersChoice === "scissors" && botChoice === "paper") ?
            "YOU WIN" : "YOU LOSE";
    }

    playersDisplay.textContent = 'The Player chose: ' + playersChoice;
    botDisplay.textContent = 'The Bot chose: ' + botChoice;
    resultDisplay.textContent = result;

    switch (result) {
        case "YOU WIN":
            resultDisplay.style.color = "green";
            playerScore++;
            playerScoreDisplay.textContent = 'Player Score: ' + playerScore;
            break;
        case "YOU LOSE":
            resultDisplay.style.color = "red";
            botScore++;
            botScoreDisplay.textContent = 'Bot Score: ' + botScore;
            break;
        case "IT'S A TIE":
            resultDisplay.style.color = "black";
            break;
    }
}

var buttons = {
    rockButton: "rock",
    paperButton: "paper",
    scissorsButton: "scissors"
};

// Use DOMContentLoaded to ensure DOM is fully loaded before adding event listeners
document.addEventListener('DOMContentLoaded', function() {
    Object.keys(buttons).forEach(function(buttonId) {
        var choice = buttons[buttonId];
        document.getElementById(buttonId).addEventListener("click", function() {
            handleButtonClick(choice);
        });
    });
});

function handleButtonClick(choice) {
    mygame(choice);
}