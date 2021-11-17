class Exploder {
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
        this.currentInDanger = false;
        this.dangerFrame = 0;
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
        if (this.currentInDanger) {
            if (this.dangerFrame < (frame - 1)) {
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
        this.dangerFrame = frame;
    }

    draw() {
        this.currSprite.draw(this.x, this.y);
        if (this.currentInDanger) {
            this.currSprite.reColor(this.x, this.y, "rgb(255,0,0)");
        }
    }
}