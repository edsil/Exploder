export function displayOptions(optionsDiv) {
    optionsDiv.hidden = false;

    // creating the span element, then add a class attribute
    const playGame = document.createElement("BUTTON");
    playGame.innerHTML = "Play";
    //playGame.setAttribute("class", "expl-button");
    playGame.top = 200;
    playGame.left = 400;
    playGame.width = 400;
    playGame.height = 150;
    playGame.addEventListener("click", () => {
        closeAndPlay(optionsDiv);
    });
    optionsDiv.appendChild(playGame);

    const options = document.createElement("BUTTON");
    options.innerHTML = "Options";
    //options.setAttribute("class", "expl-button");
    options.top = 100;
    options.left = 300;
    options.width = 200;
    options.height = 50;
    options.addEventListener("click", () => {
        settings(optionsDiv);
    });
    optionsDiv.appendChild(options);
}

export function closeAndPlay(optionsDiv) {
    optionsDiv.hidden = true;
    //let optionsShown = false;
    while (optionsDiv.firstChild) {
        optionsDiv.removeChild(optionsDiv.lastChild);
    }
}

export function settings(optionsDiv) {
    return optionsDiv;
}
