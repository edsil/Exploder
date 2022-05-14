"use strict";
import { displayOptions } from "./options.js";
import { spriteAnimator } from "./spriteAnimator.js";
import { Exploder } from "./exploder.js";
import { controlers } from "./settings.js";
import { NatResource } from "./resources.js";
import * as util from "./util.js";

// Global Variables
// Settings
const aiExploder = false;

// World
let frame = 0;
let paused = false;
let difficulty = 0;
let extraDiffPerFrame = 0.01;

// Array storing items
const natResources = []; // Resources placed in the world
const resources = []; // Reserouces available after natural resource explodes
let exploders = [];
//let spriteFramesPerSecond = {};

// Main characters
let myExploder1;
let myExploder2;

// Sprites
let sprBackWalk, sprFrontWalk, sprLeftWalk, sprRightWalk;
let sprBackStop, sprFrontStop, sprLeftStop, sprRightStop;
let paramResource, paramResActivated, paramExplosion;

// Images
function newImage(src) {
    var tmp = new Image();
    tmp.src = src;
    return tmp;
}
const imgExplosion = newImage("./Images/explosion.png");
const imgPlasticBoxGrey = newImage("./Images/plastic_box.png");
const imgPlasticBoxRed = newImage("./Images/plastic_box_red_shaking2.png");
//const imgExploder1 = newImage("./Images/spritesheet_edu.png");
const imgExploder2 = newImage("./Images/spritesheet_jonathan.png");
const canvasBackground = newImage("./Images/greenbackground.png");

// Options Div
const divOptions = document.getElementById("options");

// Canvasses
// Main Canvas
const canvas = document.getElementById("canvas1");
const ctx = canvas.getContext("2d");

// Menu Canvas
const mCanvas = document.getElementById("menu");
const menuCtx = mCanvas.getContext("2d");

// Background Canvas
const canvasBKG = document.getElementById("background");
const ctxBKG = canvasBKG.getContext("2d");

// Makes sure the image is loaded first otherwise nothing will draw.
canvasBackground.onload = function () {
    ctxBKG.drawImage(canvasBackground, 0, 0, canvasBKG.width, canvasBKG.height);
};

document.addEventListener("keydown", function (e) {
    if (e.code == "KeyM") {
        callOptions();
        return;
    }
    controlers[e.code] ? controlers[e.code](true) : 0;
});

document.addEventListener("keyup", (e) => (controlers[e.code] ? controlers[e.code](false) : 0));

function callOptions() {
    paused = true;
    displayOptions(divOptions);
    //optionsShown = true;
    waitOptionsClosure();
}

function waitOptionsClosure() {
    //if (optionsShown) {
    if (!divOptions.hidden) {
        setTimeout(waitOptionsClosure, 100);
    } else {
        paused = false;
        animate();
    }
}

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
        exploders[i].update(canvas, frame);
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
        exploders[1].update(canvas);
    }
}

function handleResourcesExploded() {
    for (let i = 0; i < resources.length; i++) {
        resources[i].update(exploders);
        resources[i].draw();
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
        natResources[i].update(exploders);
        natResources[i].draw();
        if (natResources[i].expired || natResources[i].exploded) {
            natResources.splice(i, 1);
            i--;
        } else if (!(natResources[i].activated || natResources[i].exploding)) {
            for (let j = 0; j < exploders.length; j++) {
                if (util.boxCollision(natResources[i], exploders[j])) {
                    if (controlers[exploders[j].control].btn1) {
                        natResources[i].activate(exploders[j]);
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
        let res1 = new NatResource(plasticBox, difficulty, resources, x, y, ctx);
        natResources.push(res1);
    }
}

function init() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    natResources.length = 0; // Resources placed in the world
    resources.length = 0; // Reserouces available after natural resource explodes
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
