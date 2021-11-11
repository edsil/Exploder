'use strict';

// Global Variables
const aiExploder = true;
let myExploder1;
let myExploder2;


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

let pickUpSnd = new soundFxs("coins01.mp3", 10);
let endPickUpSnd = new soundFxs("coinsEnd.mp3", 5);
let explosionSnd = new soundFxs("explosion.mp3", 5);

// Array storing items
let resouceTypes = []; // All possible resources
let natResources = []; // Resources placed in the world
let resources = []; // Reserouces available after natural resource explodes
let inventory = []; // Resources owned by the exploder
let natResTypes = [];
let exploders = [];

// Main Canvas
const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
let canvasPosition = canvas.getBoundingClientRect();

// Background
const canvasBKG = document.getElementById('background');
const ctxBKG = canvasBKG.getContext('2d');
let canvasBackground = new Image();
canvasBackground.src = "waterdrops.jpg";

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
let menuCanvasPosition = mCanvas.getBoundingClientRect();

// World
let cellSize = 30;
let wCols = canvas.width / cellSize;
let wRows = canvas.height / cellSize;
let cellGap = 3;
let frame = 0;
const wrap = false;

// Game status / info
const controlsBar = {
    width: mCanvas.width,
    height: mCanvas.height,
}

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
}


// Exploder
const eType1 = {
    image: 'blue', // to be replace with an image later, for now it will be a square
    power: 100, // Initial exploder power
    health: 100, //Initial exploere health
    cash: 100, // Initial exploder cash
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
    height: 1.5,
    width: 0.75,
    speed: 1,
    control: 0,
}

class Exploder {
    constructor(eType, x, y) {
        this.image = eType.image;
        this.power = eType.power;
        this.health = eType.health;
        this.cash = eType.cash;
        this.height = Math.floor(eType.height * cellSize);
        this.width = Math.floor(eType.width * cellSize);
        this.speed = eType.speed;
        this.control = eType.control;
        this.x = x;
        this.y = y;
    }

    update() {
        if (controlers[this.control].up) this.y -= this.speed;
        if (controlers[this.control].down) this.y += this.speed;
        if (controlers[this.control].left) this.x -= this.speed;
        if (controlers[this.control].right) this.x += this.speed;
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

    clear() {
        ctx.clearRect(this.x, this.y, this.width, this.height);
    }

    draw() {
        ctx.fillStyle = this.image;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}
function handleExploder() {
    for (let i = 0; i < exploders.length; i++) {
        exploders[i].clear();
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
        exploders[1].clear();
        exploders[1].x = Math.ceil(exploders[1].x + xMove);
        exploders[1].y = Math.ceil(exploders[1].y + yMove);
        exploders[1].update();
    }

}


// Resources after explosions
// types
const carbon = {
    images: ['black'],
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

            let piece = {
                x: x,
                y: y,
                width: this.width,
                height: this.height,
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
            if (boxCollision(exploders[j], this.space)) {
                for (let i = 0; i < this.pieces.length; i++) {
                    if (boxCollision(exploders[j], this.pieces[i])) {
                        if (this.pieces.length <= 1) {
                            endPickUpSnd.play();
                        } else {
                            pickUpSnd.play();
                        }
                        let p = this.pieces[i];
                        ctx.clearRect(p.x, p.y, p.width, p.height);
                        exploders[j].cash += this.valueTotal / this.quantity;
                        this.pieces.splice(i, 1);
                        i--;
                    }
                }
            }
        }
    }
    draw() {
        for (let i = 0; i < this.pieces.length; i++) {
            ctx.fillStyle = this.currImage;
            ctx.fillRect(this.pieces[i].x, this.pieces[i].y, this.width, this.height);
        }
    }
}
function handleResourcesExploded() {
    for (let i = 0; i < resources.length; i++) {
        resources[i].update();
        resources[i].draw();
        if (resources[i].expired) {
            ctx.clearRect(resources[i].x, resources[i].y,
                resources[i].radius, resources[i].radius);
            resources.splice(i, 1);
            i++;
        }
    }
}



// Natural Resources
// types
let maxResources = 4;
let resourcesSlower = 150;
const blackRock = {
    images: ['black', 'orange', 'red'], cost: 10, value: 12,
    minPower: 50, detonTime: 200, explodingRadius: 150, explodingTime: 150,
    aliveTime: 6000, damage: 15, framesPerDamage: 30, width: 1, height: 1,
};

class NatResource {
    constructor(type, x, y) {
        this.images = type.images;
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
                explosionSnd.play();
            } else {
                this.currImage = this.images[1];
            }
        } else if (this.exploding) {
            if (this.timer > --this.explodingTime) {
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
            ctx.clearRect(this.x + cellGap, this.y + cellGap,
                this.width - cellGap, this.height - cellGap);
            return;
        } else {
            if (this.activated || this.exploding) {
                let opacity = 1 - 2 * (this.detonTime - this.timer) / (this.initDetonTime);
                if (this.exploding) opacity = 1;
                ctxEXP.fillStyle = "rgba(255, 162, 162, " + opacity + ")";
                ctxEXP.beginPath();
                ctxEXP.arc(this.x + this.width / 2, this.y + this.height / 2, this.radius, 0, Math.PI * 2);
                ctxEXP.fill();
            }
            ctx.fillStyle = this.currImage;
            ctx.fillRect(this.x + cellGap, this.y + cellGap,
                this.width - cellGap, this.height - cellGap);
        }
    }
}

function handleWorldResources() {
    ctxEXP.clearRect(0, 0, expCanvas.width, expCanvas.height);
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
        let res1 = new NatResource(blackRock, x, y);
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
    resouceTypes = []; // All possible resources
    natResources = []; // Resources placed in the world
    resources = []; // Reserouces available after natural resource explodes
    inventory = []; // Resources owned by the exploder
    natResTypes = [];
    exploders = [];
    myExploder1 = new Exploder(eType1, 100, 100);
    exploders.push(myExploder1);
    if (aiExploder) {
        myExploder2 = new Exploder(eType2, 300, 300);
        exploders.push(myExploder2);
    }
}

function animate() {
    frame += 1;
    runAutoExploder();
    handleExploder();
    handleWorldResources();
    handleResourcesExploded();
    updateMenu();
    requestAnimationFrame(animate);
}
init();
animate();

// Test showing all walkers
/*
// Images

const walkingImage = new Image();
walkingImage.src = 'walking.png'; // Image: 21,45; Cell: 64, 60
const walking = {
    image: walkingImage,
    spriteSize: { x: 21, y: 48 },
    cellSize: { x: 64, y: 61 },
}



class animateSprite {
    constructor(sprite, row, x, y, speed) {
        this.sprite = sprite;
        this.cols = 0;
        this.x = x;
        this.y = y;
        this.row = row;
        this.aSlower = speed;

    }

    loadAttributes() {
        this.image = this.sprite.image;
        this.col = 0;
        this.counter = 0;
        this.cols = Math.floor(this.sprite.image.width / this.sprite.cellSize.x);
        this.cellSize = this.sprite.cellSize;
        this.spriteSize = this.sprite.spriteSize;
    }

    animate() {
        if (this.cols != 0) {
            if (++this.counter >= this.aSlower) {
                this.counter = 0;
                ctx.clearRect(this.x, this.y, 50, 100);
                ctx.drawImage(this.image,
                    this.col * this.cellSize.x, this.row * this.cellSize.y,
                    this.spriteSize.x, this.spriteSize.y,
                    this.x, this.y, 5 + 8 * (this.row), 10 + 16 * (this.row));
                this.col = this.col + 1;
                if (this.col > this.cols) this.col = 0;
            }
        } else if (this.sprite.image.width != 0) {
            this.loadAttributes();
        }
        requestAnimationFrame(this.animate.bind(this));
    }
}
rubish = [];
for (let i = 0; i < 8; i++) {
    let x = new animateSprite(walking, i, 100 + i * 50, 50 + i * 50, 4 * i + 7);
    x.animate();
    rubish.push(x);
}
*/
