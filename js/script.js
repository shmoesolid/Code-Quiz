
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

        // create child stats element
        /* came across a weird issue where simply appending the innerHTML of quiz-end content
         * caused the button already within to not work at all.
         * decided to try using the createElement method and it worked.
         * later found that innerHTML removes any and all listen events within...  DOH! see link:
         * https://stackoverflow.com/questions/2946656/advantages-of-createelement-over-innerhtml/2947012#2947012
        */
        var statsElm = document.createElement("section");

        // start applying data
        statsElm.innerHTML = "<h3>High Scores:</h3>";

        // display high scores
        for (var i = 0; i < quizVars.highScores.length; i++)
            statsElm.innerHTML += (i+1) + ". " + quizVars.highScores[i].name + " (" + quizVars.highScores[i].score +")<br />";

        // display stats
        statsElm.innerHTML += "<br />Your Score: " + quizVars.score;
        statsElm.innerHTML += "<br />Correct: " +quizVars.correct +" / "+ quizVars.total;
        statsElm.innerHTML += "<br />Time Left: " + quizVars.timer.toFixed(2);

        // attach the stats element before our reset scores button
        content[quizVars.status].insertBefore(statsElm, content[quizVars.status].firstChild);
}

// toggle our div display for where we are at
// display at the end so stuff is loaded, it's all 
// hidden up until this point anyways
toggleDisplay(quizVars.status);
