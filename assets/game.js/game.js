// Array containing the valid choices in the game
var choices = ["rock", "paper", "scissors"];

// DOM elements to display the player's choice, bot's choice, game result, and scores
var playersDisplay = document.getElementById("playersDisplay");
var botDisplay = document.getElementById("botDisplay");
var resultDisplay = document.getElementById("resultDisplay");
var playerScoreDisplay = document.getElementById("playerScoreDisplay");
var botScoreDisplay = document.getElementById("botScoreDisplay");

// Initialize scores for player and bot
var playerScore = 0;
var botScore = 0;

// Function to play the game, taking player's choice as a parameter
function mygame(playersChoice) {
    // Select a random choice for the bot from the available choices
    var botChoice = choices[Math.floor(Math.random() * choices.length)];
    var result = "";

    // Determine the result of the game based on player's and bot's choices
    if (playersChoice === botChoice) {
        result = "IT'S A TIE";
    } else {
        result = (playersChoice === "rock" && botChoice === "scissors") ||
            (playersChoice === "paper" && botChoice === "rock") ||
            (playersChoice === "scissors" && botChoice === "paper") ?
            "YOU WIN" : "YOU LOSE";
    }

    // Update the display for player's choice, bot's choice, and the result
    playersDisplay.textContent = 'The Player chose: ' + playersChoice;
    botDisplay.textContent = 'The Bot chose: ' + botChoice;
    resultDisplay.textContent = result;

    // Update scores and result display color based on the outcome
    switch (result) {
        case "YOU WIN":
            resultDisplay.style.color = "green"; // Set result text color to green
            playerScore++; // Increment player's score
            playerScoreDisplay.textContent = 'Player Score: ' + playerScore; // Update player's score display
            break;
        case "YOU LOSE":
            resultDisplay.style.color = "red"; // Set result text color to red
            botScore++; // Increment bot's score
            botScoreDisplay.textContent = 'Bot Score: ' + botScore; // Update bot's score display
            break;
        case "IT'S A TIE":
            resultDisplay.style.color = "black"; // Set result text color to black for a tie
            break;
    }
}

// Object mapping button IDs to their respective choices
var buttons = {
    rockButton: "rock",
    paperButton: "paper",
    scissorsButton: "scissors"
};

// Ensure the DOM is fully loaded before adding event listeners to the buttons
document.addEventListener('DOMContentLoaded', function() {
    // Iterate over the buttons object to add click event listeners
    Object.keys(buttons).forEach(function(buttonId) {
        var choice = buttons[buttonId]; // Get the corresponding choice for each button
        document.getElementById(buttonId).addEventListener("click", function() {
            handleButtonClick(choice); // Call the function to handle the button click
        });
    });
});

// Function to handle button clicks
function handleButtonClick(choice) {
    mygame(choice); // Call the game function with the user's choice
}