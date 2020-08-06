"use strict";

class GroundUI {
  constructor({ pos, size }) {
    this.groundImages = [new Image(), new Image()];
    this.groundImages[0].src = "./images/‏‏ground.PNG";
    this.groundImages[1].src = "./images/‏‏ground.PNG";
    this.pos = pos;
    this.size = size;
  }

  updatePos() {
    let speed = 3;
    this.pos.x -= speed;
    let canvasWidth = document.querySelector("canvas").width;
    if (this.pos.x <= 0 - canvasWidth) {
      this.pos.x = 0;
    }
  }
}
