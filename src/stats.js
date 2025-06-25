// Initialize DOM elements
const scoreElement = document.getElementById("score");
const bestScoreElement = document.getElementById("best-score");
const positionElement = document.getElementById("my-position");
const ticketElement = document.getElementById("ticket");

// GameScore object with all methods
window.GameStats = {
  // Private state
  _currentScore: 0,
  _bestScore: 0,
  _currentPosition: 0,
  _tickets: 0,

  // Update display methods
  updateScore(newScore) {
    this._currentScore = newScore;
    scoreElement.textContent = this._currentScore;
  },

  updateBestScore(newBestScore) {
    this._bestScore = newBestScore;
    bestScoreElement.textContent = this._bestScore;
  },

  updatePosition(newPosition) {
    this._currentPosition = newPosition;
    positionElement.textContent = this._currentPosition;
  },

  updateTickets(newTickets) {
    this._tickets = newTickets;
    ticketElement.textContent = this._tickets;
  },

  // Getter methods
  getCurrentScore() {
    return this._currentScore;
  },

  getBestScore() {
    return this._bestScore;
  },

  getCurrentPosition() {
    return this._currentPosition;
  },

  getTickets() {
    return this._tickets;
  },

  // Reset methods
  resetScore() {
    this.updateScore(0);
  },

  resetAll() {
    this.updateScore(0);
    this.updatePosition(0);
    this.updateTickets(0);
    this.updateBestScore(0);
  },
};
