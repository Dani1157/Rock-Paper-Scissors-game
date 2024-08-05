/* esversion: 6 */

// Define an array of choices for the game
var choices = ["rock", "paper", "scissors"];

// Get references to the HTML elements we'll be using to display the game results and scores
var playersDisplay = document.getElementById("playersDisplay"); // Element for displaying the player's choice
var botDisplay = document.getElementById("botDisplay");         // Element for displaying the bot's choice
var resultDisplay = document.getElementById("resultDisplay");   // Element for displaying the result of the game
var playerScoreDisplay = document.getElementById("playerScoreDisplay"); // Element for displaying the player's score
var botScoreDisplay = document.getElementById("botScoreDisplay");     // Element for displaying the bot's score

// Initialize the scores for player and bot to 0
var playerScore = 0;
var botScore = 0;

/**
 * This function is called when a player makes a choice and determines the outcome of the game
 * @param {string} playersChoice - The choice made by the player (rock, paper, or scissors)
 */
function mygame(playersChoice) {
  // Randomly select a choice for the bot
  var botChoice = choices[Math.floor(Math.random() * choices.length)];
  var result = ""; // Variable to store the result of the game

  // Determine the result of the game based on the player's and bot's choices
  if (playersChoice === botChoice) {
    result = "IT'S A TIE"; // Both choices are the same
  } else {
    // Check the winning conditions
    result = (playersChoice === "rock" && botChoice === "scissors") || 
             (playersChoice === "paper" && botChoice === "rock") || 
             (playersChoice === "scissors" && botChoice === "paper") ? 
             "YOU WIN" : "YOU LOSE"; // Assign win or lose based on the rules
  }

  // Update the display to show the choices and result
  playersDisplay.textContent = 'The Player chose: ' + playersChoice;
  botDisplay.textContent = 'The Bot chose: ' + botChoice;
  resultDisplay.textContent = result;

  // Update scores based on the game result and change the display color accordingly
  switch (result) {
    case "YOU WIN": // Case where the player wins
      resultDisplay.style.color = "green"; // Change result text color to green
      playerScore++; // Increment the player's score
      playerScoreDisplay.textContent = 'Player Score: ' + playerScore; // Update player's score display
      break;
    case "YOU LOSE": // Case where the player loses
      resultDisplay.style.color = "red"; // Change result text color to red
      botScore++; // Increment the bot's score
      botScoreDisplay.textContent = 'Bot Score: ' + botScore; // Update bot's score display
      break;
    case "IT'S A TIE": // Case where there is a tie
      resultDisplay.style.color = "black"; // Change result text color to black
      break;
  }
}

// Get references to the buttons that allow player choices
var buttons = {
  rockButton: "rock",       // Button for rock choice
  paperButton: "paper",     // Button for paper choice
  scissorsButton: "scissors" // Button for scissors choice
};

// Add click event listeners to each button
Object.keys(buttons).forEach(function(buttonId) {
  var choice = buttons[buttonId]; // Get the player's choice corresponding to the button
  document.getElementById(buttonId).addEventListener("click", function() {
    handleButtonClick(choice); // Call the function to handle the player's choice when a button is clicked
  });
});

// Define a function to handle button clicks
function handleButtonClick(choice) {
  mygame(choice); // Call the game function with the player's choice
}