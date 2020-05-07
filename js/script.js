
// setup listeners (see prelem and func)
startButton.addEventListener("click", startQuiz); // start quiz button
nextButton.addEventListener("click", nextQuestion); // next question in quiz
resetButton.addEventListener("click", reset);
resetScoreButton.addEventListener("click", resetScore);
hsFormElm.addEventListener("submit", highScore);
window.addEventListener("beforeunload", saveQuizVars); // makes sure quiz vars save (refresh/close/whatnot)

// load quiz vars if possible
quizVars = loadQuizVars();

console.log(quizVars);

// do various things based on our game status
switch (quizVars.status)
{
    // setup/display question and answers
    case QUIZ_STATUS.active:

        // check if no current question id
        if (!quizVars.curQID)
        {
            // get available question IDs whether from storage or fresh start
            quizVars.availQID = (!quizVars.availQID) ? quizItems.getAllQIDs() : quizVars.availQID;

            // get new id out of available ids randomly
            quizVars.curQID = quizVars.availQID.charAt( _randomInt(quizVars.availQID.length) );

            // remove that id
            quizVars.availQID = quizVars.availQID.replace(quizVars.curQID, "");
        }

        // set timer visual and run the timer
        statusElm.innerHTML = quizVars.timer.toFixed(2);
        timerHandle = setInterval(updateTime, 10);

        // simplify our items object reference
        var curQuizItem = quizItems[ quizVars.curQID.toString() ];

        // set question
        questionElm.innerHTML = curQuizItem.question;

        // get element references in answers element
        for (var i = 0; i < curQuizItem.answers.length; i++)
            answerLabelElms[i].innerHTML = "<code> " + curQuizItem.answers[i] + " </code>";

        // leave switch
        break;
    
    // display end of game stuff
    case QUIZ_STATUS.end:

        // header 
        content[quizVars.status].innerHTML += "High Scores:<br />";

        // display high scores
        for (var i = 0; i < quizVars.highScores.length; i++)
            content[quizVars.status].innerHTML += 
                (i+1) + ". " + quizVars.highScores[i].name + " (" + quizVars.highScores[i].score +")<br />";

        // display stats
        content[quizVars.status].innerHTML += "<br />Correct: " +quizVars.correct +" / "+ quizVars.total;
        content[quizVars.status].innerHTML += "<br />Time Left: " + quizVars.timer.toFixed(2);
        content[quizVars.status].innerHTML += "<br />Score: " + quizVars.score;
}

// toggle our div display for where we are at
// display at the end so stuff is loaded, it's all 
// hidden up until this point anyways
toggleDisplay(quizVars.status);
