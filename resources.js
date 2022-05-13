// Natural Resources
class NatResource {
    constructor(type, difficulty, x, y) {
        this.sprExplosion = new spriteAnimator(...type.paramExplosion);
        this.sprActivated = new spriteAnimator(...type.paramResActivated);
        this.sprResource = new spriteAnimator(...type.paramResource);
        this.endExplosion = false;
        this.cost = type.cost;
        this.value = type.value;
        this.minPower = type.minPower;
        this.detonTime = type.detonTime;
        this.initDetonTime = this.detonTime * (1 - difficulty);
        this.radius = type.explodingRadius * (1 + difficulty);
        this.explodingTime = type.explodingTime * (1 + difficulty);
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
        this.popUpTimer = 10;
        this.popUpCounter = 0;
        this.originalScale = this.sprResource.scale;
    }
    update() {
        if (this.expired || this.exploded) return;
        this.timer++;
        if (this.activated) {
            if (this.timer > --this.detonTime) {
                this.timer = 0;
                this.activated = false;
                this.exploding = true;
                explosionSnd.play();
            } else {
                for (let i = 0; i < exploders.length; i++) {
                    if (boxCircleCollision(exploders[i], this)) {
                        exploders[i].inDanger();
                    }
                }
            }
        } else if (this.exploding) {
            if (this.endExplosion) {
                this.exploded = true;
                let r = new ResourceExploded(carbon, this.x + this.width / 2, this.y + this.height / 2,
                    this.value / 2, this.value, this.width / cellSize * 1.5);
                resources.push(r);
                this.exploding = false;
                this.timer = 0;
            } else {
                for (let i = 0; i < exploders.length; i++) {
                    if (boxCircleCollision(exploders[i], this)) {
                        exploders[i].inDanger();
                        if (this.timer % this.framesPerDamage == 0) {
                            exploders[i].hurtHealth(this.damage);
                        }
                    }
                }
            }
        } else {
            if (this.popUpCounter < this.popUpTimer) {

                if (++this.popUpCounter >= this.popUpTimer) {
                    this.sprResource.scale = this.originalScale;
                } else {
                    this.sprResource.scale = this.originalScale * 1.3;
                }
            }
            if (this.timer > --this.aliveTime) {
                this.expired = true;
                this.timer = 0;
            }
        }
    }
    activate(exploder) {
        if (this.activated || this.expired || this.exploding || this.exploded) return;
        exploders[exploder].cash -= this.cost;
        this.timer = 0;
        this.activated = true;
    }
    popUp() {
        this.popUpCounter = 0;
    }

    draw(ctx2D) {
        if (this.expired || this.exploded) {
            return;
        } else {
            if (this.exploding) {
                if (this.sprExplosion.draw(this.x - this.sprExplosion.width / 2, this.y - this.sprExplosion.height / 2, ctx2D)) {
                    this.endExplosion = true;
                }
            } else if (this.activated) {
                this.sprActivated.draw(this.x, this.y, ctx2D);
            }
            else {
                this.sprResource.draw(this.x, this.y, ctx2D);
            }
        }
    }
}

// Resources after explosions
class ResourceExploded {
    constructor(type, x, y, quantity, valueTotal, radius) {
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
            for (let i = 0; i < this.pieces.length; i++) {
                if (boxCollision(exploders[j], this.pieces[i])) {
                    if (this.pieces.length <= 1) {
                        endPickUpSnd.play();
                    } else {
                        pickUpSnd.play();
                    }
                    exploders[j].cash += this.valueTotal / this.quantity;
                    this.pieces.splice(i, 1);
                    i--;
                }
            }
        }
    }
    draw(ctx2D) {
        for (let i = 0; i < this.pieces.length; i++) {
            this.pieces[i].sprite.draw(this.pieces[i].x, this.pieces[i].y, ctx2D);
        }
    }
}

