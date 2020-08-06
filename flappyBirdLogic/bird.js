"use strict";

class Bird {
  constructor(grid) {
    this.pos = this.getPos(grid);
    this.priorYStartJumpPos = this.pos.y;
    /*jumpsInARow  responsible for making the bird jumping continuously 
      only when the user continuously presses the jump button and just from the second jump onward*/
    this.jumpsInARow = 0;
    this.speed = 0;
    this.size = new Vec(2.5, 0.9);
  }

  getPos(gridRows) {
    for (let y = 0; y < gridRows.length; y++) {
      for (let x = 0; x < gridRows.length; x++) {
        if (gridRows[y][x] == "@") {
          return new Vec(x, y);
        }
      }
    }
  }

  updatePosDuringGame(time, isMoveBtn) {
    if (isMoveBtn) {
      this.jumpsInARow++;
      if (this.jumpsInARow == 1 || this.jumpsInARow >= 35) {
        this.priorYStartJumpPos = this.pos.y;
        this.up(time);
      } else {
        this.down(time);
      }
    } else {
      this.jumpsInARow = 0;
      this.down(time);
    }
  }

  updatePosBeforeGameBegan(time, framesCount) {
    if (framesCount < 20) {
      this.pos.y -= 0.5 * time;
    } else {
      this.pos.y += 0.5 * time;
    }
  }

  up(time) {
    let jump = -5.0;
    this.speed = jump;
    this.pos = this.pos.plus(new Vec(0, this.speed * time));
  }

  down(time) {
    //as long as the bird is falling down the speed gets higher
    let gravity = 0.25;
    this.speed += gravity;
    this.pos = this.pos.plus(new Vec(0, this.speed * time));
  }
}
