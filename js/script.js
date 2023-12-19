
// setup listeners (see prelem and func)
startButton.addEventListener("click", startQuiz); // start quiz button
nextButton.addEventListener("click", nextQuestion); // next question in quiz
resetButton.addEventListener("click", reset);
resetScoreButton.addEventListener("click", resetScore);
hsFormElm.addEventListener("submit", highScore);
window.addEventListener("beforeunload", saveQuizVars); // makes sure quiz vars save (refresh/close/whatnot)

/*dropZoneQuestions.addEventListener("ondrop", dropHandler);
dropZoneQuestions.addEventListener("ondragover", dragOverHandler);
dropZoneAnswers.addEventListener("ondrop", dropHandler);
dropZoneAnswers.addEventListener("ondragover", dragOverHandler);*/

// do initial load based on global quiz status
loadByStatus();

// TESTING
//var arrayTest = [ 0, 1, 2];

//console.log(arrayTest);
//arrayTest.splice(Math.floor(Math.random()*arrayTest.length), 1);
//console.log(arrayTest);

/*
constructor(id) {
        this.wrapper = document.querySelector(`[data-field-wrapper="${id}"]`);
        this.fileInput = this.wrapper.querySelector('input');
        this.textArea = this.wrapper.querySelector('textarea');

        this.textInitialHeight = this.textArea.style.height;
        if (this.textArea.style.maxHeight === '') {
            this.textArea.style.maxHeight = '30em';
        }
        this.textArea.style.overflowY = 'auto';

        this.fileInput.addEventListener('change', this.handleFileInputChange.bind(this));
        
        this.textArea.parentElement.addEventListener('dragover', this.handleDragOver.bind(this));
        this.textArea.parentElement.addEventListener('drop', this.handleDrop.bind(this));
    }

    readFile(source, target) {
        const reader = new FileReader();
        reader.addEventListener('load', (event) => {
            target.value = event.target.result;
            target.style.height = this.textInitialHeight;
            target.style.height = target.scrollHeight 
                + parseFloat(getComputedStyle(target).paddingTop) 
                + parseFloat(getComputedStyle(target).paddingBottom) + 'px';
        });
        reader.readAsText(source);
    }

    handleFileInputChange(event) {
        event.preventDefault();
        const input = this.fileInput.files[0];
        this.readFile(input, this.textArea);
        this.fileInput.value = '';
        this.fileInput.blur();
    }

    handleDragOver(event) {
        event.stopPropagation();
        event.preventDefault();
        event.dataTransfer.dropEffect = 'copy';
    }

    handleDrop(event) {
        event.stopPropagation();
        event.preventDefault();
        const input = event.dataTransfer.files[0];
        this.readFile(input, this.textArea);
    }
*/