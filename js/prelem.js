
// quiz settings
const STORAGE_NAME = "SK_QUIZ_VARS"; // a unique name
var maxHighScores = 5;
var maxTimer = 30.00; // in seconds
var maxTimerSubWrong = 0;//-2.5; // in seconds

// handle to our callback timer function
// needed to clear the timer interval
var timerHandle = null;

// setup enum for where user is at in quiz across pages
const QUIZ_STATUS = Object.freeze({ start:0, active:1, hsEntry: 2, end:3 });

// quiz vars (default) for storage across pages
let quizVars =
{
    status: QUIZ_STATUS.start,
    availQID: [],
    curQID: "",
    correct: 0,
    total: 0,
    timer: null,
    score: 0,
    place: null,

    highScores: [],

    updateCurQID() {
        this.curQID = this.availQID.splice(Math.floor(Math.random()*this.availQID.length), 1);
    }
};

// content element references for quick showing/hiding
// usage: content[ QUIZ_STATUS.active ] will give #quiz-active reference
var content =
[
    document.getElementById("quiz-start"),      // 0 or start
    document.getElementById("quiz-active"),     // 1 or active
    document.getElementById("quiz-hs-entry"),   // 2 or hsEntry
    document.getElementById("quiz-end"),        // 3 or end
];

// button element references
var startButton = document.getElementById("button-start"); // start the quiz
var nextButton = document.getElementById("quiz-next"); // next question
var resetButton = document.getElementById("button-reset");
var resetScoreButton = document.getElementById("reset-score");

// other element references
var questionElm = document.getElementById("quiz-question"); // question
var answersElm = document.getElementById("quiz-answers"); // contains answer radio selections
var statusElm = document.getElementById("quiz-status"); // status messages get put here

var answerLabelElms = answersElm.getElementsByTagName("label");
//var answerInputElms = [];
//for (var i = 0; i < answerLabelElms.length; i++)
//    answerInputElms[i] = answerLabelElms[i].firstElementChild;
var answerInputElms = answersElm.getElementsByTagName("input");

var hsInputElm = document.getElementById("quiz-hs-input");
var hsFormElm = document.getElementById("quiz-hs-form");
var statsElm = document.getElementById("quiz-stats");
var hsElm = document.getElementById("quiz-hs");

var dropZoneQuestions = document.getElementById("dropZoneQuestions");
var dropZoneAnswers = document.getElementById("dropZoneAnswers");

// i could have done individual object declarations for each question with methods
// attached to each, but this will do for a small project that won't be continued
// as client side answers for a quiz are not so great, attempted a simple mask/code of
// the answers, if the user can get proper answer from coded source then no need to 
// take the quiz now really
var quizItems = 
{
    ///////////////////////////////////////////////////////////////////
    // questions

    "0": { // ID
        correctCode: "1", // can be plaintext or coded, see below
        chosenCode: "",
        question: "Which of the following is a way to concatenate strings together?",
        explaination: "because reasons",
        answers: [
            "\"This quiz is \" . garbageString . \".\";",
            "\"This quiz is \" + garbageString + \".\";",
            "\"This quiz is \" garbageString \".\";",
            "All of the above"
        ]
    },

    "1": {
        correctCode: "0",
        chosenCode: "",
        question: "Which of the following methods of the String object returns the characters in a string between two indexes into the string?",
        explaination: "because reasons",
        answers: [
            "substring()",
            "split()",
            "substr()",
            "slice()"
        ]
    },

    "2": {
        correctCode: "2",
        chosenCode: "",
        question: "What is the HTML tag under which one can write the Javascript code?",
        explaination: "because reasons",
        answers: [
            "&lt;javascript&gt;",
            "&lt;scripted&gt;",
            "&lt;script&gt;",
            "&lt;js&gt;"
        ]
    },

    "3": {
        correctCode: "2",
        chosenCode: "",
        question: "What is the correct syntax for referring to an external script called \"geek.js\"?",
        explaination: "because reasons",
        answers: [
            "&lt;script href=\"geek.js\"&gt;",
            "&lt;script name=\"geek.js\"&gt;",
            "&lt;script src=\"geek.js\"&gt;",
            "&lt;script ref=\"geek.js\"&gt;"
        ]
    },

    "4": {
        correctCode: "3",
        chosenCode: "",
        question: "Which of the following is NOT a valid declcaration type in ES6.",
        explaination: "because reasons",
        answers: [
            "var name = 'John';",
            "let name = 'John';",
            "const name = 'John';",
            "string name = 'John';"
        ]
    },

    ///////////////////////////////////////////////////////////////////
    // methods

    importQuestions(file)
    {
        console.log("import questions");
        // need function for going through and converting special chars that will mess up 
        // variable string quotes or html, ie turn " into \", < into &lt; and > into &gt;, etc
        // also maybe replace CR or EOL with <br /> or just make it a <pre> if not already

        // parse out file
        /* 
        turn this:

        1. this is a multiline 
        question?
        A. answer 1
        B. answer 2
        C. answer 3
        D. answer 4

        into this:
        
        "0": { // the number question in the import will be ignored
            correctCode: "",
            chosenCode: "",
            question: "Which of the following is NOT a valid declcaration type in ES6.",
            explaination: "",
            answers: [
                "var name = 'John';",
                "let name = 'John';",
                "const name = 'John';",
                "string name = 'John';"
            ]
        },
        */
    },

    importAnswers(file)
    {
        console.log("import answers");
        // parse out file
        /* 
        turn this:

        1. A. this is a description
        with multiline features

        into this:
        
        "0": { // the number question in the import will be ignored, will go off order and index
            correctCode: "0", // 0 for a, 1 for b, etc
            chosenCode: "",
            question: "Which of the following is NOT a valid declcaration type in ES6.",
            explaination: "this is a description with multiline features",
            answers: [
                "var name = 'John';",
                "let name = 'John';",
                "const name = 'John';",
                "string name = 'John';"
            ]
        },
        */
    },

    // simply for comparing answers
    compareAnswer(QID, plainAnswer)
    {
        // set the user chosen answer, we wouln't be comparing otherwise
        this[QID].chosenCode = plainAnswer;

        // compare answers
        if (this[QID].correctCode == plainAnswer)
            return true;

        return false;
    },

    // simply returns all valid question IDs
    getAllQIDs()
    {
        var rtn = [];

        for (var i = 0; this[ i.toString() ] !== undefined; i++)
            rtn.push(i);
        
        return rtn;
    },

    // method for generating answer code
    generateCode(id = null, answer = null)
    {
        // return actual answer code then compare outside
        if (id !== null && answer !== null)
            return this._gen( id, answer );

        // log header
        console.log("Place the following codes under the right ID:");

        // loop through all available questions to generate our hash for each
        for (var i = 0; this[ i.toString() ] !== undefined; i++)
        {
            // log it so we can use it
            console.log( "ID: " + i + " Code: " + this._gen(i.toString(), this[i.toString()].correctCode) );
        }

        // log footer
        console.log("Don't forget to comment quizItems.generateCode() when done");
    },

    // handles actual 'internal' generation
    // both params are strings
    _gen(_id, _answer)
    {
        // return if not strings
        if (typeof _id != 'string' || typeof _answer != 'string')
            return false;

        // return correct generated code
        return ( _answer.toLowerCase().charCodeAt() + _id.charCodeAt() ).toString(16);
    }

};

// when generating codes of actual answers for storage, make sure correctCode contains actual answer, not code
// then uncomment and run once to see correlated code to ID and replace correctCode in each accordingly
// once codes set in quizItems, make sure to re-comment below
// quizItems.generateCode();
