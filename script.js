'use strict';
// Global Variables
// Settings
const aiExploder = false;
const wrap = false;

// Array storing items
let natResources = []; // Resources placed in the world
let resources = []; // Reserouces available after natural resource explodes
let exploders = [];


let myExploder1;
let myExploder2;
let sprBackWalk, sprFrontWalk, sprLeftWalk, sprRightWalk;
let sprBackStop, sprFrontStop, sprLeftStop, sprRightStop;
let paramResource, paramExplosion, paramCoins;
const positions = {
    UP_WALKING: 0, LEFT_WALKING: 1, DOWN_WALKING: 2, RIGHT_WALKING: 3,
    UP_STOPPED: 4, LEFT_STOPPED: 5, DOWN_STOPPED: 6, RIGHT_STOPPED: 7
};

// Sound Effects
class soundFxs {
    constructor(soundFile, instances) {
        this.instances = instances;
        this.samples = [];
        for (let i = 0; i < instances; i++) {
            this.samples.push(new Audio(soundFile));
        }
        this.currInstance = 0;
    }
    play() {
        this.samples[this.currInstance].play();
        this.currInstance += 1;
        if (this.currInstance >= this.instances) this.currInstance = 0;
    }
}

const pickUpSnd = new soundFxs("./Sounds/coins01.mp3", 10);
const endPickUpSnd = new soundFxs("./Sounds/coinsEnd.mp3", 5);
const explosionSnd = new soundFxs("./Sounds/explosion.mp3", 5);

// Main Canvas
const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
const canvasPosition = canvas.getBoundingClientRect();

// Background
const canvasBKG = document.getElementById('background');
const ctxBKG = canvasBKG.getContext('2d');
const canvasBackground = new Image();
canvasBackground.src = "./Images/waterdrops.jpg";

// Explosions Canvas
const expCanvas = document.getElementById('explosions');
const ctxEXP = expCanvas.getContext('2d');

// Make sure the image is loaded first otherwise nothing will draw.
canvasBackground.onload = function () {
    ctxBKG.drawImage(canvasBackground, 0, 0, canvasBKG.width, canvasBKG.height);
}

// Menu Canvas
const mCanvas = document.getElementById('menu');
const menuCtx = mCanvas.getContext('2d');
const menuCanvasPosition = mCanvas.getBoundingClientRect();

// World
let cellSize = 30;
let wCols = canvas.width / cellSize;
let wRows = canvas.height / cellSize;
let frame = 0;

// Mouse routines
// From main canvas
const mouse = {
    x: undefined,
    y: undefined,
    width: 1,
    height: 1,
}
// From Menu Canvas
const menuMouse = {
    x: undefined,
    y: undefined,
    width: 1,
    height: 1,
}
// Mouse listeners
canvas.addEventListener('mousemove', function (e) {
    mouse.x = e.x - canvasPosition.left;
    mouse.y = e.y - canvasPosition.top;
});
mCanvas.addEventListener('mousemove', function (e) {
    menuMouse.x = e.x - menuCanvasPosition.left;
    menuMouse.y = e.y - menuCanvasPosition.top;
});
canvas.addEventListener('mouseleave', function () {
    mouse.x = undefined;
    mouse.y = undefined;
})
mCanvas.addEventListener('mouseleave', function () {
    menuMouse.x = undefined;
    menuMouse.y = undefined;
})

// Keyboard routines
let controlers = [];
const ctrl0 = {
    up: false,
    down: false,
    left: false,
    right: false,
    btn1: false,
    btn2: false,
}
controlers.push(ctrl0);
const ctrl1 = {
    up: false,
    down: false,
    left: false,
    right: false,
    btn1: false,
    btn2: false,
}
controlers.push(ctrl1);
document.addEventListener('keydown', function (e) {
    switch (e.key) {
        case 'a': ctrl0.left = true; break;
        case 'w': ctrl0.up = true; break;
        case 's': ctrl0.down = true; break;
        case 'd': ctrl0.right = true; break;

        case 'ArrowLeft': ctrl1.left = true; break;
        case 'ArrowUp': ctrl1.up = true; break;
        case 'ArrowDown': ctrl1.down = true; break;
        case 'ArrowRight': ctrl1.right = true; break;
    }
});

document.addEventListener('keyup', function (e) {
    switch (e.key) {
        case 'a': ctrl0.left = false; break;
        case 'w': ctrl0.up = false; break;
        case 's': ctrl0.down = false; break;
        case 'd': ctrl0.right = false; break;

        case 'ArrowLeft': ctrl1.left = false; break;
        case 'ArrowUp': ctrl1.up = false; break;
        case 'ArrowDown': ctrl1.down = false; break;
        case 'ArrowRight': ctrl1.right = false; break;
    }
});

// Menu
function updateMenu() {
    menuCtx.clearRect(0, 0, mCanvas.width, mCanvas.height);
    menuCtx.fillStyle = 'gold';
    menuCtx.font = '20px Orbitron';
    menuCtx.fillText('Power: ' + exploders[0].power, 10, 20);
    menuCtx.fillText('Health: ' + exploders[0].health, 10, 70);
    menuCtx.fillText('Cash: ' + exploders[0].cash, 10, 120);
    menuCtx.font = '12px Orbitron';
    menuCtx.fillText('FPS: ' + Math.round(1000 * frame / performance.now()), 10, mCanvas.height - 20);
}


// Exploder
// Sprite animation controller
class spriteAnimator {
    constructor(spriteSheetName,
        cellWidth, cellHeight,
        padLeft, padTop,
        spriteWidth, spriteHeight,
        scale, speed, rowsColumnsSequence) {
        // scale - how much to increase (>1) or decrease (<1) the sprite
        // speed - from 0(slowest) to 1(fastest)
        // rowsColumnsSequence is an array with arrays => [[0,0], [0,1], [0,2]...]
        this.sprite = new Image();
        this.sprite.src = spriteSheetName;
        this.cellW = cellWidth;
        this.cellH = cellHeight;
        this.padLeft = padLeft;
        this.padTop = padTop;
        this.sprW = spriteWidth;
        this.sprH = spriteHeight;
        this.scale = scale;
        this.speed = speed;
        this.sequence = rowsColumnsSequence;
        this.data = [];
        this.width = Math.floor(this.scale * this.sprW);
        this.height = Math.floor(this.scale * this.sprH);
        for (let i = 0; i < this.sequence.length; i++) {
            if ('row' in this.sequence[i] && 'cols' in this.sequence[i]) {
                let sy = this.sequence[i].row * this.cellH + this.padTop;
                for (let x = this.sequence[i].cols[0]; x <= this.sequence[i].cols[1]; x++) {
                    let sx = x * this.cellW + this.padLeft;
                    this.data.push([sx, sy]);
                }
            } else if ('col' in this.sequence[i] && 'rows' in this.sequence[i]) {
                let sx = this.sequence[i].col * this.cellW + this.padLeft;
                for (let y = this.sequence[i].rows[0]; y <= this.sequence[i].rows[1]; y++) {
                    let sy = y * this.cellH + this.padTop;
                    this.data.push([sx, sy]);
                }
            } else
                throw 'Wrong sequencing. Format must be [{row: 0, cols: [0, 7]}, {rows: [0, 3], col: 2}]';
        }
        this.floatCounter = 0;
        this.counter = 0;
        this.preX = -1;
        this.preY = -1;
        this.lastFrame = false;
    }

    draw(x, y) {
        if (this.data.length == 0) return;
        this.floatCounter += this.speed;
        ctx.drawImage(this.sprite,
            this.data[this.counter][0], this.data[this.counter][1],
            this.sprW, this.sprH, x, y, this.width, this.height);
        this.counter = Math.round(this.floatCounter);
        if (this.counter >= this.data.length) {
            this.floatCounter = 0;
            this.counter = 0;
            this.lastFrame = true;
        } else {
            this.lastFrame = false;
        }
        return (this.lastFrame);
    }

    setSprite(n) {
        this.counter = n;
    }
}

// Sprites
function initSprites() {
    let size = 2;
    let speed = 0.21;
    let padLeft = 6;
    let padTop = 13;
    let spriteWidth = 49;
    let spriteHeight = 51;
    let param = ['./Images/eduCreation.png',
        64, 64, padLeft, padTop,
        spriteWidth, spriteHeight,
        size, speed, []];

    // Back Walking
    param[9] = [{ row: 8, cols: [1, 8] }];
    sprBackWalk = new spriteAnimator(...param);

    // Left walking
    param[9] = [{ row: 9, cols: [1, 8] }];
    sprLeftWalk = new spriteAnimator(...param);

    // Front walking
    param[9] = [{ row: 10, cols: [1, 8] }];;
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
    param[9] = [{ row: 2, cols: [0, 0] }];;
    sprFrontStop = new spriteAnimator(...param);

    // Right Stopped
    param[9] = [{ row: 3, cols: [0, 0] }];
    sprRightStop = new spriteAnimator(...param);

    // Explosion
    paramExplosion = ['./Images/explosion.png',
        100, 100, 0, 0,
        100, 100,
        size, 1, [{ row: 0, cols: [0, 8] }, { row: 1, cols: [0, 8] }, { row: 2, cols: [0, 8] },
        { row: 3, cols: [0, 8] }, { row: 4, cols: [0, 8] }, { row: 5, cols: [0, 8] },
        { row: 6, cols: [7, 8] }, { row: 8, cols: [0, 1] }]];

    paramResource = ['./Images/plastic_box.png', 34, 38, 0, 0, 34, 38, 1, 1, [{ row: 0, cols: [0, 0] }]];

    paramCoins = ['./Images/bling_coins.png', 21, 21, 0, 0, 16, 21, 1, 0.06, [{ row: 0, cols: [0, 3] }]];
}


initSprites();
const eType1 = {
    image: 'blue', // to be replace with an image later, for now it will be a square
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
    speed: 3,
    control: 1,
}

const eType2 = {
    image: 'red', // to be replace with an image later, for now it will be a square
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
}

class Exploder {
    constructor(eType, x, y) {
        this.image = eType.image;
        this.power = eType.power;
        this.health = eType.health;
        this.cash = eType.cash;
        this.speed = eType.speed;
        this.control = eType.control;
        this.x = x;
        this.y = y;
        this.preX = this.x;
        this.preY = this.y;
        this.sprites = [eType.spriteUpWalking, eType.spriteLeftWalking, eType.spriteDownWalking,
        eType.spriteRightWalking, eType.spriteUpStopped, eType.spriteLeftStopped,
        eType.spriteDownStopped, eType.spriteRightStopped];
        this.lastMove = positions.DOWN_STOPPED;
        this.currSprite = this.sprites[this.lastMove];
        this.width = 10000;
        this.height = 10000;
        for (let i = 0; i < this.sprites.length; i++) {
            this.width = Math.min(this.width, this.sprites[i].width);
            this.height = Math.min(this.height, this.sprites[i].height);
        }
    }

    update() {
        if (this.lastMove < positions.UP_STOPPED) {
            this.lastMove += 4;
        }
        if (controlers[this.control].up) {
            this.y -= this.speed;
            this.lastMove = positions.UP_WALKING;
        }
        if (controlers[this.control].down) {
            this.y += this.speed;
            this.lastMove = positions.DOWN_WALKING;
        }
        if (controlers[this.control].left) {
            this.x -= this.speed;
            this.lastMove = positions.LEFT_WALKING;
        }
        if (controlers[this.control].right) {
            this.x += this.speed;
            this.lastMove = positions.RIGHT_WALKING;
        }
        this.currSprite = this.sprites[this.lastMove];
        if (wrap) {
            if (this.x < 0) {
                this.x = canvas.width;
            } else if (this.x > canvas.width) {
                this.x = 0;
            }
            if (this.y < 0) {
                this.y = canvas.height;
            } else if (this.y > canvas.height) {
                this.y = 0;
            }
        } else {
            if (this.x < -1) {
                this.x = -1;
            } else if (this.x > canvas.width - this.width + 1) {
                this.x = canvas.width - this.width + 1;
            }
            if (this.y < -1) {
                this.y = -1;
            } else if (this.y > canvas.height - this.height + 1) {
                this.y = canvas.height - this.height + 1;
            }
        }
    }

    draw() {
        //ctx.clearRect(this.preX, this.preY, this.width, this.height);
        this.currSprite.draw(this.x, this.y);
        this.preX = this.x;
        this.preY = this.y;
    }
}
function handleExploder() {
    for (let i = 0; i < exploders.length; i++) {
        exploders[i].update();
        exploders[i].draw();
    }
    if (exploders[0].health <= 0) {
        init();
    }
}


function runAutoExploder() {
    if (aiExploder) {
        let xMove = ((exploders[0].x - exploders[1].x) ** 3 / (canvas.width ** 2)) * exploders[1].speed;
        let yMove = ((exploders[0].y - exploders[1].y) ** 3 / (canvas.height ** 2)) * exploders[1].speed;
        exploders[1].x = Math.ceil(exploders[1].x + xMove);
        exploders[1].y = Math.ceil(exploders[1].y + yMove);
        exploders[1].update();
    }

}



// Resources after explosions
// types
const carbon = {
    images: ['black'],
    paramResource: paramCoins,
    width: 0.3,
    height: 0.3,
    alivetime: 50000,
};

class ResourceExploded {
    constructor(type, x, y, quantity, valueTotal, radius) {
        this.images = type.images;
        this.currImage = this.images[0];
        this.width = Math.floor(type.width * cellSize);
        this.height = Math.floor(type.height * cellSize);
        this.x = x;
        this.y = y;
        this.quantity = quantity;
        this.paramResource = type.paramResource;
        this.aliveTime = type.aliveTime;
        this.valueTotal = valueTotal;
        this.radius = Math.floor(radius * cellSize);
        this.space = {
            x: this.x - this.radius,
            y: this.y - this.radius,
            width: this.radius * 2,
            height: this.radius * 2,
        };
        this.expired = false;
        this.timer = 0;
        this.pieces = [];
        for (let i = 0; i < this.quantity; i++) {
            let ang = Math.random() * Math.PI * 2;
            let rad = Math.random() * this.radius;
            let x = Math.floor(this.x + Math.cos(ang) * rad);
            if (x - this.width < 0 || x + this.width > canvas.width) {
                x = this.x;
            }
            let y = Math.floor(this.y + Math.sin(ang) * rad);;
            if (y - this.height < 0 || y + this.height > canvas.height) {
                y = this.y;
            }
            let sprite = new spriteAnimator(...this.paramResource);
            let piece = {
                x: x,
                y: y,
                width: this.width,
                height: this.height,
                sprite: sprite,
            }
            this.pieces.push(piece);
        }
    }
    update() {
        if (this.expired) return;
        this.timer++;
        if (this.timer > this.aliveTime || this.pieces.length == 0) {
            this.timer = 0;
            this.expired = true;
            return;
        }
        for (let j = 0; j < exploders.length; j++) {
            //if (boxCollision(exploders[j], this.space)) {
            for (let i = 0; i < this.pieces.length; i++) {
                if (boxCollision(exploders[j], this.pieces[i])) {
                    if (this.pieces.length <= 1) {
                        endPickUpSnd.play();
                    } else {
                        pickUpSnd.play();
                    }
                    //let p = this.pieces[i];
                    //ctx.clearRect(p.x, p.y, p.width, p.height);
                    exploders[j].cash += this.valueTotal / this.quantity;
                    this.pieces.splice(i, 1);
                    i--;
                }
            }
            //}
        }
    }
    draw() {
        for (let i = 0; i < this.pieces.length; i++) {
            //ctx.fillStyle = this.currImage;
            //ctx.fillRect(this.pieces[i].x, this.pieces[i].y, this.width, this.height);
            this.pieces[i].sprite.draw(this.pieces[i].x, this.pieces[i].y);
        }
    }
}
function handleResourcesExploded() {
    for (let i = 0; i < resources.length; i++) {
        resources[i].update();
        resources[i].draw();
        if (resources[i].expired) {
            //ctx.clearRect(resources[i].x, resources[i].y,
            //    resources[i].radius, resources[i].radius);
            resources.splice(i, 1);
            i++;
        }
    }
}



// Natural Resources
// types
let maxResources = 4;
let resourcesSlower = 150;
const plasticBox = {
    images: ['black', 'orange', 'red'], cost: 10, value: 12,
    minPower: 50, detonTime: 200, explodingRadius: 150, explodingTime: 150,
    paramExplosion: paramExplosion,
    paramResource: paramResource,
    aliveTime: 6000, damage: 15, framesPerDamage: 30, width: 1, height: 1,
};

class NatResource {
    constructor(type, x, y) {
        this.images = type.images;
        this.sprExplosion = new spriteAnimator(...type.paramExplosion);
        this.sprResource = new spriteAnimator(...type.paramResource);
        this.endExplosion = false;
        this.currImage = this.images[0];
        this.cost = type.cost;
        this.value = type.value;
        this.minPower = type.minPower;
        this.detonTime = type.detonTime;
        this.initDetonTime = this.detonTime;
        this.radius = type.explodingRadius;
        this.explodingTime = type.explodingTime;
        this.aliveTime = type.aliveTime;
        this.damage = type.damage;
        this.framesPerDamage = type.framesPerDamage;
        this.width = Math.floor(type.width * cellSize);
        this.height = Math.floor(type.height * cellSize);
        this.x = x;
        this.y = y;
        this.expired = false;
        this.activated = false;
        this.exploding = false;
        this.exploded = false;
        this.timer = 0;
    }
    update() {
        if (this.expired || this.exploded) return;
        this.timer++;
        if (this.activated) {
            if (this.timer > --this.detonTime) {
                this.timer = 0;
                this.activated = false;
                this.currImage = this.images[2];
                this.exploding = true;
                //ctxEXP.clearRect(this.x - this.sprExplosion.width / 2, this.y - this.sprExplosion.height / 2, this.sprExplosion.width, this.sprExplosion.height);
                //ctx.clearRect(this.x + cellGap, this.y + cellGap,
                //    this.width - cellGap, this.height - cellGap);
                explosionSnd.play();
            } else {
                this.currImage = this.images[1];
            }
        } else if (this.exploding) {
            if (this.endExplosion) {
                this.exploded = true;
                let r = new ResourceExploded(carbon, this.x + this.width / 2, this.y + this.height / 2,
                    this.value / 2, this.value, this.width / cellSize * 1.5);
                resources.push(r);
                this.exploding = false;
                this.timer = 0;
            } else if (this.timer % this.framesPerDamage == 0) {
                for (let i = 0; i < exploders.length; i++) {
                    if (boxCircleCollision(exploders[i], this)) {
                        exploders[i].health -= this.damage;
                    }
                }
            }
        } else if (this.timer > --this.aliveTime) {
            this.expired = true;
            this.timer = 0;
        }
    }
    activate(exploder) {
        if (this.activated || this.expired || this.exploding || this.exploded) return;
        exploders[exploder].cash -= this.cost;
        this.currImage = this.images[1];
        this.timer = 0;
        this.activated = true;
    }
    draw() {
        if (this.expired || this.exploded) {
            //ctx.clearRect(this.x - this.sprExplosion.width / 2, this.y - this.sprExplosion.height / 2, this.sprExplosion.width, this.sprExplosion.height);
            //ctxEXP.clearRect(this.x - this.sprExplosion.width / 2, this.y - this.sprExplosion.height / 2, this.sprExplosion.width, this.sprExplosion.height);
            return;
        } else {
            if (this.exploding) {
                //ctx.clearRect(this.x - this.sprExplosion.width / 2, this.y - this.sprExplosion.height / 2, this.sprExplosion.width, this.sprExplosion.height);
                if (this.sprExplosion.draw(this.x - this.sprExplosion.width / 2, this.y - this.sprExplosion.height / 2)) {
                    this.endExplosion = true;
                    //ctx.clearRect(this.x - this.sprExplosion.width / 2, this.y - this.sprExplosion.height / 2, this.sprExplosion.width, this.sprExplosion.height);
                }
            } else if (this.activated) {
                let opacity = 1 - 2 * (this.detonTime - this.timer) / (this.initDetonTime);
                ctxEXP.fillStyle = "rgba(255, 162, 162, " + opacity + ")";
                ctxEXP.beginPath();
                ctxEXP.arc(this.x + this.width / 2, this.y + this.height / 2, this.radius, 0, Math.PI * 2);
                ctxEXP.fill();
                ctx.fillStyle = this.currImage;
                ctx.fillRect(this.x, this.y,
                    this.width, this.height);
            }
            else {
                this.sprResource.draw(this.x, this.y);
            }
        }
    }
}


function handleWorldResources() {
    //ctxEXP.clearRect(0, 0, expCanvas.width, expCanvas.height);
    for (let i = 0; i < natResources.length; i++) {
        natResources[i].update();
        natResources[i].draw();
        if (natResources[i].expired || natResources[i].exploded) {
            natResources.splice(i, 1);
            i--;
        } else if (!(natResources[i].activated || natResources[i].exploding)) {
            for (let j = 0; j < exploders.length; j++) {
                if (boxCollision(natResources[i], exploders[j])) {
                    natResources[i].activate(j);
                }
            }
        }
    }
    if (natResources.length < maxResources && frame % resourcesSlower == 0) {
        let x = Math.floor(50 + Math.random() * (canvas.width - 100));
        let y = Math.floor(50 + Math.random() * (canvas.height - 100));
        let res1 = new NatResource(plasticBox, x, y);
        natResources.push(res1);
    }
}




function boxCollision(first, second) {
    if (!(first.x > second.x + second.width ||
        first.x + first.width < second.x ||
        first.y > second.y + second.height ||
        first.y + first.height < second.y)
    ) {
        return true;
    }
}

function boxCircleCollision(rect, circle) {
    // Rect must contain .x, .y, .width, .height
    // Circle must contain .x, .y, .radius
    if (!(rect.x && rect.y && rect.width && rect.height && circle.x && circle.y && circle.radius)) {
        throw 'rect must contain .x, .y, .width, .height and circle must contain .x, .y, .radius!';
    }
    let is_in = false;
    // Translate rect so circle is at 0,0
    let x1 = (rect.x - circle.x);
    let x2 = (x1 + rect.width);
    let y1 = (rect.y - circle.y);
    let y2 = (y1 + rect.height);
    let r = circle.radius;

    is_in = (x1 < -r && x2 > r && y1 < -r && y2 > r);

    if (!is_in) {
        let x = (x1 + x2) / 2;
        let y = (y1 + y2) / 2;
        let sqDist = Math.sqrt(x * x + y * y);
        is_in = sqDist <= r;
    }

    if (!is_in && Math.abs(x1) < r) {
        let yIntersect = Math.sqrt(r * r - x1 * x1);
        is_in = ((y1 < -yIntersect && -yIntersect < y2) ||
            y1 < yIntersect && yIntersect < y2);
    }

    if (!is_in && Math.abs(x2) < r) {
        let yIntersect = Math.sqrt(r * r - x2 * x2);
        is_in = ((y1 < -yIntersect && -yIntersect < y2) ||
            y1 < yIntersect && yIntersect < y2);
    }

    if (!is_in && Math.abs(y1) < r) {
        let yIntersect = Math.sqrt(r * r - y1 * y1);
        is_in = ((x1 < -yIntersect && -yIntersect < x2) ||
            x1 < yIntersect && yIntersect < x2);
    }

    if (!is_in && Math.abs(y2) < r) {
        let yIntersect = Math.sqrt(r * r - y2 * y2);
        is_in = ((x1 < -yIntersect && -yIntersect < x2) ||
            x1 < yIntersect && yIntersect < x2);
    }

    return is_in;

}


function init() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctxEXP.clearRect(0, 0, expCanvas.width, expCanvas.height);
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
    frame += 1;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctxEXP.clearRect(0, 0, expCanvas.width, expCanvas.height);
    runAutoExploder();
    handleExploder();
    handleWorldResources();
    handleResourcesExploded();
    updateMenu();
    requestAnimationFrame(animate);
}
init();
animate();







