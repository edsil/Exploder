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