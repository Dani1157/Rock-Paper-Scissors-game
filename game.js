// Define an array of choices
// These are the possible choices that a player can make
var choices = ["rock", "paper", "scissors"];

// Get references to the HTML elements we'll be using
// These are the elements that we'll use to display the game's state
var playersDisplay = document.getElementById("playersDisplay"); // display the player's choice
var botDisplay = document.getElementById("botDisplay"); // display the bot's choice
var resultDisplay = document.getElementById("resultDisplay"); // display the result of the game
var playerScoreDisplay = document.getElementById("playerScoreDisplay"); // display the player's score
var botScoreDisplay = document.getElementById("botScoreDisplay"); // display the bot's score

// Initialize the scores to 0
// The scores are used to keep track of who is winning
var playerScore = 0;
var botScore = 0;

// Define the game function
// This function is called when a player makes a choice and determines the outcome of the game
function mygame(playersChoice) {
  // Get a random choice for the bot
  // The bot makes a random choice based on our array of choices
  var botChoice = choices[Math.floor(Math.random() * 3)];

  // Determine the result of the game based on the player's and bot's choices
  // This decides whether the player wins, loses, or it's a tie
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
  // This updates the UI to show what happened in the game
  playersDisplay.textContent = 'The Player chose: ' + playersChoice;
  botDisplay.textContent = 'The Bot chose: ' + botChoice;
  resultDisplay.textContent = result;

  // Update the scores based on the result of the game
  // This updates who is winning and by how much
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
// These are the buttons that players can click to make their choices
var rockButton = document.getElementById("rockButton");
var paperButton = document.getElementById("paperButton");
var scissorsButton = document.getElementById("scissorsButton");

// Add event listeners to each button to call the game function when clicked
// This is what happens when a player clicks on a button - it calls mygame with their choice as an argument
rockButton.addEventListener("click", function() {
  mygame("rock");
});
paperButton.addEventListener("click", function() {
  mygame("paper");
});
scissorsButton.addEventListener("click", function() {
  mygame("scissors");
});