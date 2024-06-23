// Define an array of choices
var choices = ["rock", "paper", "scissors"];

// Get references to the HTML elements we'll be using
var playersDisplay = document.getElementById("playersDisplay"); // display the player's choice
var botDisplay = document.getElementById("botDisplay"); // display the bot's choice
var resultDisplay = document.getElementById("resultDisplay"); // display the result of the game
var playerScoreDisplay = document.getElementById("playerScoreDisplay"); // display the player's score
var botScoreDisplay = document.getElementById("botScoreDisplay"); // display the bot's score

// Initialize the scores to 0
var playerScore = 0;
var botScore = 0;

// Define the game function
function mygame(playersChoice) {
  // Get a random choice for the bot
  var botChoice = choices[Math.floor(Math.random() * 3)];

  // Determine the result of the game based on the player's and bot's choices
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

  // Update the HTML elements to show the results of the game
  playersDisplay.textContent = 'The Player chose: ' + playersChoice;
  botDisplay.textContent = 'The Bot chose: ' + botChoice;
  resultDisplay.textContent = result;

  // Update the scores based on the result of the game
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

// Get references to the buttons
var rockButton = document.getElementById("rockButton");
var paperButton = document.getElementById("paperButton");
var scissorsButton = document.getElementById("scissorsButton");

// Add event listeners to each button to call the game function when clicked
rockButton.addEventListener("click", function() {
  mygame("rock");
});
paperButton.addEventListener("click", function() {
  mygame("paper");
});
scissorsButton.addEventListener("click", function() {
  mygame("scissors");
});