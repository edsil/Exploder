function displayOptions(optionsDiv) {
    optionsDiv.hidden = false;

    // creating the span element, then add a class attribute
    const playGame = document.createElement('BUTTON');
    playGame.innerHTML = "Play";
    playGame.setAttribute('class', 'expl-button');
    playGame.addEventListener('click', event => { closeAndPlay(optionsDiv); });
    optionsDiv.appendChild(playGame);

    const options = document.createElement('BUTTON');
    options.innerHTML = "Options";
    options.setAttribute('class', 'expl-button');
    options.top = 100;
    options.left = 300;
    options.width = 200;
    options.height = 50;
    options.addEventListener('click', event => { settings(optionsDiv); });
    optionsDiv.appendChild(options);


}
function closeAndPlay(optionsDiv) {
    optionsDiv.hidden = true;
    optionsShown = false;
    while (optionsDiv.firstChild) {
        optionsDiv.removeChild(optionsDiv.lastChild);
    }
}

function settings(optionsDiv) {

}



