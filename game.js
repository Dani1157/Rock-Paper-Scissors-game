// Define an array of choices for the game (rock, paper, scissors)
const choices = ["rock", "paper", "scissor"];
// Get the HTML elements for displaying the player's choice, bot's choice, result, and scores
const playersDisplay = document.getElementById("playersDisplay");
const botDisplay = document.getElementById("botDisplay");
const resultDisplay = document.getElementById("resultDisplay");
const playerScoreDisplay = document.getElementById("playerScoreDisplay");
const botScoreDisplay = document.getElementById("botScoreDisplay");
// Initialize the player's score and bot's score to 0
let playerScore = 0;
let botScore = 0;
// Define a function to play the game
function mygame(playersChoice) {
    // Generate a random choice for the bot
    const botChoice = choices[Math.floor(Math.random() * 3)];
     // Determine the result of the game based on the player's choice and bot's choice
    let result = "";

    if (playersChoice === botChoice) {
        // If the player and bot chose the same thing, it's a tie
        result = "IT'S A TIE";
    } else {
        // Use a switch statement to determine the winner based on the player's choice
        switch (playersChoice) {
            case "rock":
                // If the player chose rock and the bot chose scissors, the player wins
                result = (botChoice === "scissor") ? "YOU WIN" : "YOU LOSE";
                break;
            case "paper":
                // If the player chose paper and the bot chose rock, the player wins
                result = (botChoice === "rock") ? "YOU WIN" : "YOU LOSE";
                break;
            case "scissor":
                // If the player chose scissors and the bot chose paper, the player wins
                result = (botChoice === "paper") ? "YOU WIN" : "YOU LOSE";
                break;
        }
    }
 // Update the display to show the player's choice and bot's choice
    playersDisplay.textContent = `The Player chose: ${playersChoice}`;
    botDisplay.textContent = `The Bot chose: ${botChoice}`;
    resultDisplay.textContent = result;

    // Update the display to show the winner and update the scores accordingly
    switch (result) {
        case "YOU WIN":
            // If the player wins, update the score display and change the text color to green
            resultDisplay.textContent = "YOU WIN";
            resultDisplay.style.color = "green";
            playerScore++;
            playerScoreDisplay.textContent = `Player Score: ${playerScore}`;
            break;
        case "YOU LOSE":
            // If the player loses, update the score display and change the text color to red
            resultDisplay.textContent = "YOU LOSE";
            resultDisplay.style.color = "red";
            botScore++;
            botScoreDisplay.textContent = `Bot Score: ${botScore}`;
            break;
        case "IT'S A TIE":
            // If it's a tie, update the score display but don't change the text color
            resultDisplay.textContent = "IT'S A TIE";
            resultDisplay.style.color = "black";
            break;
    }
}