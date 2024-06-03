const choices = ["rock", "paper", "scissor"];
const playersDisplay = document.getElementById("playersDisplay");
const botDisplay = document.getElementById("botDisplay");
const resultDisplay = document.getElementById("resultDisplay");
const playerScoreDisplay = document.getElementById("playerScoreDisplay");
const botScoreDisplay = document.getElementById("botScoreDisplay");
let playerScore = 0;
let botScore = 0;

function myGame() {
  const playersChoice = prompt("Enter your choice (rock, paper, scissor):");
  const botChoice = choices[Math.floor(Math.random() * 3)]; // This line generates a random number between 0 and 3, and uses it to select a random choice from the choices array
  let result = "";

  if (playersChoice === botChoice) {
    result = "IT'S A TIE";
  } else {
    switch (playersChoice) {
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

  playersDisplay.textContent = `The Player chose: ${playersChoice}`;
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

myGame();