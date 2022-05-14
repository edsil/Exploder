import { controlers } from "./settings.js";
import { options } from "./settings.js";
import { soundFxs } from "./sound.js";
const hurt = new soundFxs("./Sounds/hurt.mp3", 10);

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

export class Exploder {
    constructor(eType, x, y) {
        this.power = eType.power;
        this.health = eType.health;
        this.cash = eType.cash;
        this.speed = eType.speed;
        this.control = eType.control;
        this.x = x;
        this.y = y;
        this.preX = this.x;
        this.preY = this.y;
        this.sprites = [
            eType.spriteUpWalking,
            eType.spriteLeftWalking,
            eType.spriteDownWalking,
            eType.spriteRightWalking,
            eType.spriteUpStopped,
            eType.spriteLeftStopped,
            eType.spriteDownStopped,
            eType.spriteRightStopped,
        ];
        this.lastMove = positions.DOWN_STOPPED;
        this.currSprite = this.sprites[this.lastMove];
        this.width = 10000;
        this.height = 10000;
        for (let i = 0; i < this.sprites.length; i++) {
            this.width = Math.min(this.width, this.sprites[i].width);
            this.height = Math.min(this.height, this.sprites[i].height);
        }
        this.currentInDanger = false;
        this.dangerFrame = 0;
    }

    update(canvas, frame) {
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
        if (options.wrap) {
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
        if (this.currentInDanger) {
            if (this.dangerFrame < 0) {
                this.dangerFrame = frame;
            } else if (this.dangerFrame < frame - 1) {
                this.currentInDanger = false;
            }
        }
    }

    hurtHealth(value) {
        this.health -= value;
        hurt.play();
    }

    inDanger() {
        this.currentInDanger = true;
        this.dangerFrame = -1; // -1 is checked by the next update() to set and sets it to the frame number that is passed there
    }

    draw(ctx2D) {
        this.currSprite.draw(this.x, this.y, ctx2D);
        if (this.currentInDanger) {
            this.currSprite.reColor(this.x, this.y, "rgb(255,0,0)", ctx2D);
        }
    }
}
