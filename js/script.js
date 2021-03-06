
// setup listeners (see prelem and func)
startButton.addEventListener("click", startQuiz); // start quiz button
nextButton.addEventListener("click", nextQuestion); // next question in quiz
resetButton.addEventListener("click", reset);
resetScoreButton.addEventListener("click", resetScore);
hsFormElm.addEventListener("submit", highScore);
window.addEventListener("beforeunload", saveQuizVars); // makes sure quiz vars save (refresh/close/whatnot)

// do initial load based on global quiz status
loadByStatus();
