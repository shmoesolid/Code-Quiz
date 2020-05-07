// function that attempts to load quiz variables from local storage
function loadQuizVars()
{
    // attempt to load quiz variables
    var vars = JSON.parse(localStorage.getItem(STORAGE_NAME));

    // no quiz active
    if (vars === null 
        || vars.quizActive === null 
        || vars.quizActive === false
    ) {
        // return global defaults
        return quizVars;
    }

    // we have something, return vars
    return vars;
}

// function that saves quizVars into local storage
function saveQuizVars()
{
    localStorage.setItem(STORAGE_NAME, JSON.stringify(quizVars));
}

// listener callback for resetting the quiz
function reset()
{
    // stop timer callback
    clearInterval(timerHandle);

    // reset vars
    quizVars.status = QUIZ_STATUS.start;
    quizVars.availQID = "";
    quizVars.curQID = "";
    quizVars.correct = 0;
    quizVars.total = 0;
    quizVars.timer = null;
    quizVars.score = 0;
    quizVars.place = null;

    // save and reload
    saveQuizVars();
    location.reload();
}

function resetScore()
{
    // log
    console.log('reset scores');

    // empty it out
    quizVars.highScores = [];

    // save and reload
    saveQuizVars();
    location.reload();
}

// listener callback for starting quiz button
function startQuiz()
{
    // set variables of content
    quizVars.status = QUIZ_STATUS.active;

    // start timer
    quizVars.timer = maxTimer;

    // save and reload
    saveQuizVars();
    location.reload();
}

// listener callback for next question button
function nextQuestion()
{
    // get current radio buttons in quiz-answers
    for(var i = 0; i < answerInputElms.length; i++)
    {
        // set variable for readability
        var curElement = answerInputElms[i];

        // this radio element is checked
        if (curElement.checked) 
        {
            // compare answer whether coded or not
            // CORRECT
            if ( quizItems.compareAnswer(quizVars.curQID, curElement.id) )
                quizVars.correct++; // increase correct num

            // WRONG
            else 
                quizVars.timer += maxTimerSubWrong; // decrease timer

            // reset
            curElement.checked = false;

            // we're done searching, break out
            break;
        }

        // we didn't check a thing, still wrong
        if ( i == (answerInputElms.length-1) )
            quizVars.timer += maxTimerSubWrong; // decrease timer
    }

    // increase total questions
    quizVars.total++;

    // clear current question ID
    quizVars.curQID = "";

    // check if quiz is over
    if (!quizVars.availQID)
    {
        // set score
        quizVars.score = (quizVars.timer.toFixed(2) * quizVars.correct * quizVars.total).toFixed();

        // compare score with others to see if in top 10
        var place = compareScores();

        // top 10, set entry and place we got
        if (place < 10 && quizVars.score > 0) 
        {
            quizVars.status = QUIZ_STATUS.hsEntry;
            quizVars.place = place;
        }

        // not top 10, go straight to end
        else quizVars.status = QUIZ_STATUS.end;
    }

    // save and reload
    saveQuizVars();
    location.reload();
}

function highScore(event)
{
    // make sure they enter name
    event.preventDefault();

    // encapulate object
    var newScore = { name: hsInputElm.value.trim(), score: quizVars.score };

    // add name in where it belongs
    quizVars.highScores.splice(quizVars.place, 0, newScore);

    // make sure we chop off lowest score
    if (quizVars.highScores.length > 9) quizVars.highScores.pop();

    // set status to end
    quizVars.status = QUIZ_STATUS.end;

    // save and reload
    saveQuizVars();
    location.reload();
}

// compares current score to all score's and determines where it should be placed
function compareScores()
{
    // prime return index
    var rtnIndex = 0;

    // loop through our scores
    while (rtnIndex < quizVars.highScores.length)
    {
        // we have a new high score
        if (parseInt(quizVars.score) > parseInt(quizVars.highScores[rtnIndex].score))
            return rtnIndex;

        rtnIndex++;
    }

    return rtnIndex;
}

// timer interval callback
function updateTime(numBy = -.01) // in seconds
{
    // update time but don't go below 0
    quizVars.timer = Math.max( (quizVars.timer + numBy), 0);
    
    // update visual
    statusElm.innerHTML = quizVars.timer.toFixed(2);

    // at the time limit
    if (quizVars.timer <= 0 && !resetting)
    {
        // clear timer
        clearInterval(timerHandle);

        // game over
        quizVars.status = QUIZ_STATUS.end;

        // save and reload
        saveQuizVars();
        location.reload();
    }
}

// shows the current status content and hides the rest
function toggleDisplay(quizStatus)
{
    // hide all
    for(var i=0; i < content.length; i++)
        content[i].style.display = "none";

    // show only our current status content
    content[quizStatus].style.display = "block";
}

// gets random integer from 0 to 1 less than specified num
function _randomInt(num)
{
  return Math.floor( Math.random() * num );
}
