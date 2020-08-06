"use strict";

class PipesPair {
  constructor(xPos, speed) {
    this.speed = speed;
    this.space = 2.5;
    this.topPipe = {
      pos: new Vec(xPos, 0),
      size: new Vec(4, this.getRandomeYSize(true)),
    };
    this.bottomPipe = {
      pos: new Vec(xPos, this.calculateBottomPipeYPos()),
      size: new Vec(4, this.getRandomeYSize(false)),
    };
  }

  getRandomeYSize(isTopPipe) {
    let groundYsize = 1.5;
    let gridRowsAmount = 10;
    if (isTopPipe) {
      let max = gridRowsAmount - groundYsize - this.space;
      let randomYsize = Math.floor(Math.random() * max);
      if (randomYsize === 0) {
        return 1;
      } else {
        return randomYsize;
      }
    } else {
      return gridRowsAmount - groundYsize - this.topPipe.size.y - this.space;
    }
  }

  isOutOfTheGrid() {
    return this.topPipe.pos.x + this.topPipe.size.x <= 0;
  }

  updatePosDuringGame(time) {
    let disatance = this.speed * time;
    this.topPipe.pos.x -= disatance;
    this.bottomPipe.pos.x -= disatance;
  }

  calculateBottomPipeYPos() {
    return this.topPipe.pos.y + this.topPipe.size.y + this.space;
  }
}
