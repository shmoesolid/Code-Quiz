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
    loadByStatus();
}

function resetScore()
{
    // confirm if want to delete
    if (!confirm("Are you sure you want to delete all high scores?"))
        return;

    // empty it out
    quizVars.highScores = [];

    // save and reload
    saveQuizVars();
    loadByStatus();
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
    loadByStatus();
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
                quizVars.timer = Math.max( (quizVars.timer + maxTimerSubWrong), 0); // decrease timer

            // reset
            curElement.checked = false;

            // we're done searching, break out
            break;
        }

        // we didn't check a thing, still wrong
        if ( i == (answerInputElms.length-1) )
            quizVars.timer = Math.max( (quizVars.timer + maxTimerSubWrong), 0); // decrease timer
    }

    // clear current question ID
    quizVars.curQID = "";

    // check if quiz is over
    if (!quizVars.availQID)
        finishOffQuiz();

    // save and reload
    saveQuizVars();
    loadByStatus();
}

// handles timer clearing out and scoring
function finishOffQuiz()
{
    // clear timer
    clearInterval(timerHandle);
    timerHandle = null;

    // handles it so if time does run out but we got some questions
    // right our score won't be 0
    var scoreTimer = Math.max(quizVars.timer, 1);

    // set score
    quizVars.score = (scoreTimer.toFixed(2) * quizVars.correct * quizVars.total).toFixed();

    // compare score with others to see if in top 10
    var place = compareScores();

    // top 10, set entry and place we got
    if (quizVars.score > 0 && place < maxHighScores) 
    {
        quizVars.status = QUIZ_STATUS.hsEntry;
        quizVars.place = place;
    }

    // not top 10, go straight to end
    else quizVars.status = QUIZ_STATUS.end;
}

function highScore(event)
{
    // make sure they enter name
    event.preventDefault();

    // encapulate object
    var newScore = { name: hsInputElm.value.trim(), score: quizVars.score };

    // add name in where it belongs
    quizVars.highScores.splice(quizVars.place, 0, newScore);

    // make sure we chop off lowest score(s) based on max
    while (quizVars.highScores.length > maxHighScores) quizVars.highScores.pop();

    // set status to end
    quizVars.status = QUIZ_STATUS.end;

    // save and reload
    saveQuizVars();
    loadByStatus();
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

        // goto next index
        rtnIndex++;
    }

    // return our index/placement
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
    if (quizVars.timer <= 0)
    {
        // it's over, wrap it up
        finishOffQuiz();

        // save and reload
        saveQuizVars();
        loadByStatus();
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

// keeps whole page from refreshing
function loadByStatus()
{
    // load quiz vars if possible
    // this is here just in case page reload
    quizVars = loadQuizVars();

    // do various things based on our game status
    switch (quizVars.status)
    {
        case QUIZ_STATUS.start:

            // set quiz question total count and save
            quizVars.total = quizItems.getAllQIDs().length;
            saveQuizVars();

            // leave switch
            break;

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

            // set timer visual
            statusElm.innerHTML = quizVars.timer.toFixed(2);

            // set new interval if our handle is null
            if (!timerHandle) timerHandle = setInterval(updateTime, 10);

            // simplify our items object reference
            var curQuizItem = quizItems[ quizVars.curQID.toString() ];

            // set question
            questionElm.innerHTML = curQuizItem.question;

            // get element references in answers element
            for (var i = 0; i < curQuizItem.answers.length; i++)
            {
                answerLabelElms[i].innerHTML = curQuizItem.answers[i];
                answerInputElms[i].checked = false;

            }
                

            // leave switch
            break;
        
        // display end of game stuff
        case QUIZ_STATUS.end:

            // start building hs string
            var toAdd = "";
            
            // add high scores
            for (var i = 0; i < quizVars.highScores.length; i++)
                toAdd += (i+1) + ". " + quizVars.highScores[i].name + " (" + quizVars.highScores[i].score +")<br />";

            // no high scores added
            if (!quizVars.highScores.length)
                toAdd += "No high scores!";

            // set string to hs element
            hsElm.innerHTML = toAdd;

            // build stats string
            toAdd = "Your Score: " + quizVars.score;
            toAdd += "<br />Correct: " +quizVars.correct +" / "+ quizVars.total;
            toAdd += "<br />Time Left: " + quizVars.timer.toFixed(2);

            // set string to stats element
            statsElm.innerHTML = toAdd;
    }

    // toggle our div display for where we are at
    // display at the end so stuff is loaded, it's all 
    // hidden up until this point anyways
    toggleDisplay(quizVars.status);
}
