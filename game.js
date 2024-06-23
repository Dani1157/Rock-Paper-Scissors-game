var choices = ["rock", "paper", "scissors"];
var playersDisplay = document.getElementById("playersDisplay");
var botDisplay = document.getElementById("botDisplay");
var resultDisplay = document.getElementById("resultDisplay");
var playerScoreDisplay = document.getElementById("playerScoreDisplay");
var botScoreDisplay = document.getElementById("botScoreDisplay");

var playerScore = 0;
var botScore = 0;

function mygame(playersChoice) {
  var botChoice = choices[Math.floor(Math.random() * 3)];

  var result = "";

  if (playersChoice === botChoice) {
    result = "IT'S A TIE";
  } else {
    switch (playersChoice) {
      case "rock":
        result = (botChoice === "scissors") ? "YOU WIN" : "YOU LOSE";
        break;
      case "paper":
        result = (botChoice === "rock") ? "YOU WIN" : "YOU LOSE";
        break;
      case "scissors":
        result = (botChoice === "paper") ? "YOU WIN" : "YOU LOSE";
        break;
    }
  }

  playersDisplay.textContent = 'The Player chose: ' + playersChoice;
  botDisplay.textContent = 'The Bot chose: ' + botChoice;
  resultDisplay.textContent = result;

  switch (result) {
    case "YOU WIN":
      resultDisplay.textContent = "YOU WIN";
      resultDisplay.style.color = "green";
      playerScore++;
      playerScoreDisplay.textContent = 'Player Score: ' + playerScore;
      break;
    case "YOU LOSE":
      resultDisplay.textContent = "YOU LOSE";
      resultDisplay.style.color = "red";
      botScore++;
      botScoreDisplay.textContent = 'Bot Score: ' + botScore;
      break;
    case "IT'S A TIE":
      resultDisplay.textContent = "IT'S A TIE";
      resultDisplay.style.color = "black";
      break;
  }
}

// Get the buttons
var rockButton = document.getElementById("rockButton");
var paperButton = document.getElementById("paperButton");
var scissorsButton = document.getElementById("scissorsButton");

// Add an event listener to each button
rockButton.addEventListener("click", function() {
  mygame("rock");
});
paperButton.addEventListener("click", function() {
  mygame("paper");
});
scissorsButton.addEventListener("click", function() {
  mygame("scissors");
});