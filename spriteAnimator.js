// Sprite animation controller
class spriteAnimator {
    constructor(spriteImage,
        cellWidth, cellHeight,
        padLeft, padTop,
        spriteWidth, spriteHeight,
        scale, speed, rowsColumnsSequence) {
        // scale - how much to increase (>1) or decrease (<1) the sprite
        // speed - from 0(slowest) to 1(fastest)
        // rowsColumnsSequence is an array with arrays => [[0,0], [0,1], [0,2]...]
        this.sprite = spriteImage;
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
        this.timePerSpriteCycle = { startTime: 0, endTime: 0, frames: 0 };
    }

    draw(x, y) {
        this.width = Math.floor(this.scale * this.sprW);
        this.height = Math.floor(this.scale * this.sprH);
        if (this.data.length == 0) return;
        if (this.floatCounter == 0) {
            this.timePerSpriteCycle.startTime = performance.now();
        }
        this.floatCounter += this.speed;
        ctx.drawImage(this.sprite,
            this.data[this.counter][0], this.data[this.counter][1],
            this.sprW, this.sprH, x, y, this.width, this.height);
        this.counter = Math.round(this.floatCounter);
        if (this.counter >= this.data.length) {
            this.timePerSpriteCycle.endTime = performance.now();
            this.timePerSpriteCycle.frames = this.counter;
            spriteFramesPerSecond[this.sprite.src.substring(this.sprite.src.length - 15)] =
                Math.round(this.timePerSpriteCycle.frames /
                    (this.timePerSpriteCycle.endTime - this.timePerSpriteCycle.startTime) * 1000);
            this.floatCounter = 0;
            this.counter = 0;
            this.lastFrame = true;
        } else {
            this.lastFrame = false;
        }
        return (this.lastFrame);
    }

    reColor(x, y, color) {
        ctx.globalCompositeOperation = "color";
        ctx.fillStyle = color;
        ctx.fillRect(x, y, this.width, this.height);
        ctx.globalCompositeOperation = "destination-in";
        ctx.drawImage(this.sprite,
            this.data[this.counter][0], this.data[this.counter][1],
            this.sprW, this.sprH, x, y, this.width, this.height);
        ctx.globalCompositeOperation = "source-over";

    }

    setSprite(n) {
        this.counter = n;
    }
}