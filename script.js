"use strict";
// Global Variables
// Settings
const aiExploder = false;
const wrap = false;

// World
let cellSize = 30;
let frame = 0;
let paused = false;
let optionsShown = false;
let difficulty = 0;
let extraDiffPerFrame = 0.01;

// Array storing items
let natResources = []; // Resources placed in the world
let resources = []; // Reserouces available after natural resource explodes
let exploders = [];
let spriteFramesPerSecond = {};

// Main characters
let myExploder1;
let myExploder2;

// Positions of the main character
const positions = {
    UP_WALKING: 0,
    LEFT_WALKING: 1,
    DOWN_WALKING: 2,
    RIGHT_WALKING: 3,
    UP_STOPPED: 4,
    LEFT_STOPPED: 5,
    DOWN_STOPPED: 6,
    RIGHT_STOPPED: 7,
};

// Sprites
let sprBackWalk, sprFrontWalk, sprLeftWalk, sprRightWalk;
let sprBackStop, sprFrontStop, sprLeftStop, sprRightStop;
let paramResource, paramResActivated, paramExplosion, paramCoins;

// Sounds
const pickUpSnd = new soundFxs("./Sounds/coins01.mp3", 10);
const endPickUpSnd = new soundFxs("./Sounds/coinsEnd.mp3", 5);
const explosionSnd = new soundFxs("./Sounds/explosion.mp3", 5);
const hurt = new soundFxs("./Sounds/hurt.mp3", 10);

// Images
function newImage(src) {
    var tmp = new Image();
    tmp.src = src;
    return tmp;
}
const imgExplosion = newImage("./Images/explosion.png");
const imgPlasticBoxGrey = newImage("./Images/plastic_box.png");
const imgPlasticBoxRed = newImage("./Images/plastic_box_red_shaking2.png");
const imgCoins = newImage("./Images/bling_coins.png");
const imgExploder1 = newImage("./Images/spritesheet_edu.png");
const imgExploder2 = newImage("./Images/spritesheet_jonathan.png");
const canvasBackground = newImage("./Images/greenbackground.png");

// Options Div
const divOptions = document.getElementById("options");

// Canvasses
// Main Canvas
const canvas = document.getElementById("canvas1");
const ctx = canvas.getContext("2d");
const canvasPosition = canvas.getBoundingClientRect();

// Menu Canvas
const mCanvas = document.getElementById("menu");
const menuCtx = mCanvas.getContext("2d");
const menuCanvasPosition = mCanvas.getBoundingClientRect();

//Options Canvas
/*
const oCanvas = document.getElementById('options');
const optionsCTX = oCanvas.getContext('2d');
const optionsCanvasPosition = oCanvas.getBoundingClientRect();
*/

// Background Canvas
const canvasBKG = document.getElementById("background");
const ctxBKG = canvasBKG.getContext("2d");

// Makes sure the image is loaded first otherwise nothing will draw.
canvasBackground.onload = function () {
    ctxBKG.drawImage(canvasBackground, 0, 0, canvasBKG.width, canvasBKG.height);
};

// Mouse routines
// For main canvas
/*
const mouse = {
    x: undefined,
    y: undefined,
    width: 1,
    height: 1,
};
// For Menu Canvas
const menuMouse = {
    x: undefined,
    y: undefined,
    width: 1,
    height: 1,
};
// For Options Canvas
const optionsMouse = {
    x: undefined,
    y: undefined,
    click: false,
    width: 1,
    height: 1,
};
// Mouse listeners
canvas.addEventListener('mousemove', function (e) {
    mouse.x = e.x - canvasPosition.left;
    mouse.y = e.y - canvasPosition.top;
});
mCanvas.addEventListener('mousemove', function (e) {
    menuMouse.x = e.x - menuCanvasPosition.left;
    menuMouse.y = e.y - menuCanvasPosition.top;
});
oCanvas.addEventListener('mousemove', function (e) {
    optionsMouse.x = e.x - optionsCanvasPosition.left;
    optionsMouse.y = e.y - optionsCanvasPosition.top;
});
oCanvas.addEventListener('mousedown', function (e) {
    optionsMouse.x = e.x - optionsCanvasPosition.left;
    optionsMouse.y = e.y - optionsCanvasPosition.top;
});

canvas.addEventListener('mouseleave', function () {
    mouse.x = undefined;
    mouse.y = undefined;
});
mCanvas.addEventListener('mouseleave', function () {
    menuMouse.x = undefined;
    menuMouse.y = undefined;
});

oCanvas.addEventListener('mouseleave', function () {
    optionsMouse.x = undefined;
    optionsMouse.y = undefined;
});
*/
// Keyboard routines
let controlers = [];
const ctrl0 = {
    up: false,
    down: false,
    left: false,
    right: false,
    btn1: false,
    btn2: false,
};

controlers.push(ctrl0);
const ctrl1 = {
    up: false,
    down: false,
    left: false,
    right: false,
    btn1: false,
    btn2: false,
};

controlers.push(ctrl1);
document.addEventListener("keydown", function (e) {
    switch (e.code) {
        case "KeyA":
            ctrl0.left = true;
            break;
        case "KeyW":
            ctrl0.up = true;
            break;
        case "KeyS":
            ctrl0.down = true;
            break;
        case "KeyD":
            ctrl0.right = true;
            break;
        case "KeyE":
            ctrl0.btn1 = true;
            break;

        case "ArrowLeft":
            ctrl1.left = true;
            break;
        case "ArrowUp":
            ctrl1.up = true;
            break;
        case "ArrowDown":
            ctrl1.down = true;
            break;
        case "ArrowRight":
            ctrl1.right = true;
            break;
        case "Space":
            ctrl1.btn1 = true;
            break;
        case "KeyM":
            callOptions();
    }
});

function callOptions() {
    paused = true;
    displayOptions(divOptions);
    optionsShown = true;
    waitOptionsClosure();
}

function waitOptionsClosure() {
    if (optionsShown) {
        setTimeout(waitOptionsClosure, 100);
    } else {
        paused = false;
        animate();
    }
}

document.addEventListener("keyup", function (e) {
    switch (e.code) {
        case "KeyA":
            ctrl0.left = false;
            break;
        case "KeyW":
            ctrl0.up = false;
            break;
        case "KeyS":
            ctrl0.down = false;
            break;
        case "KeyD":
            ctrl0.right = false;
            break;
        case "KeyE":
            ctrl0.btn1 = false;
            break;

        case "ArrowLeft":
            ctrl1.left = false;
            break;
        case "ArrowUp":
            ctrl1.up = false;
            break;
        case "ArrowDown":
            ctrl1.down = false;
            break;
        case "ArrowRight":
            ctrl1.right = false;
            break;
        case "Space":
            ctrl1.btn1 = false;
            break;
    }
});

// Menu
function updateMenu(ctx2D) {
    ctx2D.clearRect(0, 0, mCanvas.width, mCanvas.height);
    ctx2D.fillStyle = "gold";
    ctx2D.font = "20px Orbitron";
    ctx2D.fillText("Power: " + exploders[0].power, 10, 20);
    ctx2D.fillText("Health: " + exploders[0].health, 10, 70);
    ctx2D.fillText("Cash: " + exploders[0].cash, 10, 120);
    ctx2D.fillText("Difficulty: " + difficulty, 10, 170);

    ctx2D.font = "12px Orbitron";
    /*
    let printRow = 200;
    let timersKeys = Object.keys(spriteFramesPerSecond);
    for (let i = 0; i < timersKeys.length; i++) {
        ctx2D.fillText(timersKeys[i] + ": " + spriteFramesPerSecond[timersKeys[i]], 10, printRow);
        printRow += 20;
    }*/
    ctx2D.fillText("FPS: " + Math.round((1000 * frame) / performance.now()), 10, mCanvas.height - 20);
}

// Initialise Sprites
function initSprites() {
    let size = 2;
    let speed = 0.21;
    let padLeft = 6;
    let padTop = 13;
    let spriteWidth = 49;
    let spriteHeight = 51;
    let param = [imgExploder2, 64, 64, padLeft, padTop, spriteWidth, spriteHeight, size, speed, []];

    // Back Walking
    param[9] = [{ row: 8, cols: [1, 8] }];
    sprBackWalk = new spriteAnimator(...param);

    // Left walking
    param[9] = [{ row: 9, cols: [1, 8] }];
    sprLeftWalk = new spriteAnimator(...param);

    // Front walking
    param[9] = [{ row: 10, cols: [1, 8] }];
    sprFrontWalk = new spriteAnimator(...param);

    // Right walking
    param[9] = [{ row: 11, cols: [1, 8] }];
    sprRightWalk = new spriteAnimator(...param);

    param[8] = 0.17;
    // Back Stopped
    param[9] = [{ row: 0, cols: [0, 0] }];
    sprBackStop = new spriteAnimator(...param);

    // Left Stopped
    param[9] = [{ row: 1, cols: [0, 0] }];
    sprLeftStop = new spriteAnimator(...param);

    // Front Stopped
    param[9] = [{ row: 2, cols: [0, 0] }];
    sprFrontStop = new spriteAnimator(...param);

    // Right Stopped
    param[9] = [{ row: 3, cols: [0, 0] }];
    sprRightStop = new spriteAnimator(...param);

    // Explosion
    paramExplosion = [
        imgExplosion,
        100,
        100,
        0,
        0,
        100,
        100,
        size,
        1,
        [
            { row: 0, cols: [0, 8] },
            { row: 1, cols: [0, 8] },
            { row: 2, cols: [0, 8] },
            { row: 3, cols: [0, 8] },
            { row: 4, cols: [0, 8] },
            { row: 5, cols: [0, 8] },
            { row: 6, cols: [7, 8] },
            { row: 8, cols: [0, 1] },
        ],
    ];

    paramResource = [imgPlasticBoxGrey, 42, 42, 0, 0, 42, 42, 1, 1, [{ row: 0, cols: [0, 0] }]];

    paramResActivated = [
        imgPlasticBoxRed,
        42,
        42,
        0,
        0,
        42,
        42,
        1,
        0.3,
        [
            { row: 0, cols: [0, 8] },
            { row: 1, cols: [0, 8] },
            { row: 2, cols: [0, 8] },
            { row: 3, cols: [0, 8] },
            { row: 4, cols: [0, 8] },
        ],
    ];

    paramCoins = [imgCoins, 21, 21, 0, 0, 16, 21, 1, 0.06, [{ row: 0, cols: [0, 3] }]];
}

initSprites();

// Exploders
const eType1 = {
    power: 100, // Initial exploder power
    health: 100, //Initial exploere health
    cash: 100, // Initial exploder cash
    spriteUpWalking: sprBackWalk,
    spriteLeftWalking: sprLeftWalk,
    spriteDownWalking: sprFrontWalk,
    spriteRightWalking: sprRightWalk,
    spriteUpStopped: sprBackStop,
    spriteLeftStopped: sprLeftStop,
    spriteDownStopped: sprFrontStop,
    spriteRightStopped: sprRightStop,
    height: 2,
    width: 1,
    speed: 3.5,
    control: 1,
};

const eType2 = {
    power: 100, // Initial exploder power
    health: 100, //Initial exploere health
    cash: 100, // Initial exploder cash
    spriteUpWalking: sprBackWalk,
    spriteLeftWalking: sprLeftWalk,
    spriteDownWalking: sprFrontWalk,
    spriteRightWalking: sprRightWalk,
    spriteUpStopped: sprBackStop,
    spriteLeftStopped: sprLeftStop,
    spriteDownStopped: sprFrontStop,
    spriteRightStopped: sprRightStop,
    speed: 1,
    control: 0,
};

function handleExploder() {
    for (let i = 0; i < exploders.length; i++) {
        exploders[i].update();
        exploders[i].draw(ctx);
    }
    if (exploders[0].health <= 0) {
        init();
    }
}

function runAutoExploder() {
    if (aiExploder) {
        let xMove = ((exploders[0].x - exploders[1].x) ** 3 / canvas.width ** 2) * exploders[1].speed;
        let yMove = ((exploders[0].y - exploders[1].y) ** 3 / canvas.height ** 2) * exploders[1].speed;
        exploders[1].x = Math.ceil(exploders[1].x + xMove);
        exploders[1].y = Math.ceil(exploders[1].y + yMove);
        exploders[1].update();
    }
}

// Resources after explosions
// types
const carbon = {
    paramResource: paramCoins,
    width: 0.3,
    height: 0.3,
    alivetime: 1800,
};

function handleResourcesExploded() {
    for (let i = 0; i < resources.length; i++) {
        resources[i].update();
        resources[i].draw(ctx);
        if (resources[i].expired) {
            resources.splice(i, 1);
            i++;
        }
    }
}

// Natural Resources
// types
let maxResources = 12;
let resourcesSlower = 120;
const plasticBox = {
    cost: 10,
    value: 12,
    minPower: 50,
    detonTime: 300,
    explodingRadius: 150,
    explodingTime: 200,
    paramExplosion: paramExplosion,
    paramResActivated: paramResActivated,
    paramResource: paramResource,
    aliveTime: 6000,
    damage: 15,
    framesPerDamage: 20,
    width: 1,
    height: 1,
};

function handleWorldResources() {
    for (let i = 0; i < natResources.length; i++) {
        natResources[i].update();
        natResources[i].draw(ctx);
        if (natResources[i].expired || natResources[i].exploded) {
            natResources.splice(i, 1);
            i--;
        } else if (!(natResources[i].activated || natResources[i].exploding)) {
            for (let j = 0; j < exploders.length; j++) {
                if (boxCollision(natResources[i], exploders[j])) {
                    if (controlers[exploders[j].control].btn1) {
                        natResources[i].activate(j);
                    } else {
                        natResources[i].popUp();
                    }
                }
            }
        }
    }
    if (natResources.length < maxResources && frame % resourcesSlower == 0) {
        let x = Math.floor(50 + Math.random() * (canvas.width - 100));
        let y = Math.floor(50 + Math.random() * (canvas.height - 100));
        let res1 = new NatResource(plasticBox, difficulty, x, y);
        natResources.push(res1);
    }
}

// Collision detectors
function boxCollision(first, second) {
    if (
        !(
            first.x > second.x + second.width ||
            first.x + first.width < second.x ||
            first.y > second.y + second.height ||
            first.y + first.height < second.y
        )
    ) {
        return true;
    }
}

function boxCircleCollision(rect, circle) {
    // Rect must contain .x, .y, .width, .height
    // Circle must contain .x, .y, .radius
    if (
        !(
            "x" in rect &&
            "y" in rect &&
            "width" in rect &&
            "height" in rect &&
            "x" in circle &&
            "y" in circle &&
            "radius" in circle
        )
    ) {
        throw "rect must contain .x, .y, .width, .height and circle must contain .x, .y, .radius!";
    }
    let is_in = false;
    // Translate rect so circle is at 0,0
    let x1 = rect.x - circle.x;
    let x2 = x1 + rect.width;
    let y1 = rect.y - circle.y;
    let y2 = y1 + rect.height;
    let r = circle.radius;

    is_in = x1 < -r && x2 > r && y1 < -r && y2 > r;
    if (!is_in) {
        let x = (x1 + x2) / 2;
        let y = (y1 + y2) / 2;
        let sqDist = Math.sqrt(x * x + y * y);
        is_in = sqDist <= r;
    }
    if (!is_in && Math.abs(x1) < r) {
        let yIntersect = Math.sqrt(r * r - x1 * x1);
        is_in = (y1 < -yIntersect && -yIntersect < y2) || (y1 < yIntersect && yIntersect < y2);
    }
    if (!is_in && Math.abs(x2) < r) {
        let yIntersect = Math.sqrt(r * r - x2 * x2);
        is_in = (y1 < -yIntersect && -yIntersect < y2) || (y1 < yIntersect && yIntersect < y2);
    }
    if (!is_in && Math.abs(y1) < r) {
        let yIntersect = Math.sqrt(r * r - y1 * y1);
        is_in = (x1 < -yIntersect && -yIntersect < x2) || (x1 < yIntersect && yIntersect < x2);
    }
    if (!is_in && Math.abs(y2) < r) {
        let yIntersect = Math.sqrt(r * r - y2 * y2);
        is_in = (x1 < -yIntersect && -yIntersect < x2) || (x1 < yIntersect && yIntersect < x2);
    }
    return is_in;
}

function init() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    natResources = []; // Resources placed in the world
    resources = []; // Reserouces available after natural resource explodes
    exploders = [];
    myExploder1 = new Exploder(eType1, 100, 100);
    exploders.push(myExploder1);
    if (aiExploder) {
        myExploder2 = new Exploder(eType2, 300, 300, sprBackWalk, sprLeftWalk, sprFrontWalk, sprRightWalk);
        exploders.push(myExploder2);
    }
}

function animate() {
    if (!paused) {
        frame += 1;
        if (frame % 60 == 0) difficulty += extraDiffPerFrame;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        runAutoExploder();
        handleExploder();
        handleWorldResources();
        handleResourcesExploded();
        updateMenu(menuCtx);
        requestAnimationFrame(animate);
    }
}
init();
animate();
