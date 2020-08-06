"use strict";

//@ bird  + ground, .  emtpy , &  room for new pipes pair(out of the game grid)
let simpleLevelPlan = `
........................&
........................&
........................&
........................&
.........@..............&
........................&
........................&
........................&
........................&
++++++++++++++++++++++++&`;

class FlappyBirdGameLogic {
  constructor() {
    this.gridRows = this.getGridRows(simpleLevelPlan);
    this.bird = new Bird(this.gridRows);
    this.pipes = [];
    //can get - start/playing/hitThePipes/hitTheGround
    this.status = "start";
    this.score = 0;
    this.framesCount = 0;
    this.lastPipeForWhichScoreWasIncreased = null;
  }

  getGroundPosAndSize() {
    let yPos = this.gridRows.length - 1;
    //-1 since the last element of each row is placed out of the grid
    let xSize = this.gridRows[0].length - 1;
    return {
      //-0.5 since the size is 1.5
      pos: new Vec(0, yPos - 0.5),
      size: new Vec(xSize, 1.5),
    };
  }

  //return array of arrays, each array represents a row.
  getGridRows(simpleLevelPlan) {
    return simpleLevelPlan
      .trim()
      .split("\n")
      .map((l) => [...l]);
  }

  update(time, isMoveBtn) {
    if (this.status === "start") {
      this.manageStartStatus(time, isMoveBtn);
    }
    if (this.status == "hitThePipes") {
      this.bird.down(time);
      this.isBirdHitsTheGround() ? (this.status = "hitTheGround") : "";
      return;
    }
    if (this.status === "playing") {
      this.managePlayingStatus(time, isMoveBtn);
    }
  }

  manageStartStatus(time, isMoveBtn) {
    if (isMoveBtn) {
      this.status = "playing";
      this.framesCount = 0;
    } else {
      //each 20 frames the bird direction is toggled(up/down) -see function below
      this.framesCount === 40 ? (this.framesCount = 0) : "";
      this.framesCount++;
      this.bird.updatePosBeforeGameBegan(time, this.framesCount);
    }
  }

  managePlayingStatus(time, isMoveBtn) {
    this.framesCount++;
    this.bird.updatePosDuringGame(time, isMoveBtn);
    this.updatePipesPos(time);
    this.increaseScoreIfNeeded();
    let isBirdHitThePipes = this.isBirdHitsThePipes();
    if (isBirdHitThePipes || this.isBirdHitsTheGround()) {
      this.status = isBirdHitThePipes ? "hitThePipes" : "hitTheGround";
    } else {
      let pipesSpeed = this.calculatePipesSpeed();
      if (this.isTimeToAddPipesPair(pipesSpeed)) {
        this.addPipesPair(pipesSpeed);
        this.makeAllPipesAtSameSpeedIfNeeded(pipesSpeed);
        this.framesCount = 0;
      }
      this.removePipesIfNeeded();
    }
  }

  calculatePipesSpeed() {
    //initial  pipes speed
    let pipesSpeed = 9;
    // In each seventh pipes pair the speed is increased by 1.2
    pipesSpeed = Math.min(pipesSpeed + Math.floor(this.score / 6) * 1.2, 13.8);
    return pipesSpeed;
  }

  addPipesPair(pipesSpeed) {
    let pipesXPos = this.gridRows[0].length - 1;
    this.pipes.push(new PipesPair(pipesXPos, pipesSpeed));
  }

  makeAllPipesAtSameSpeedIfNeeded(pipesSpeed) {
    let pipesPairsAmount = this.pipes.length;
    if (
      pipesPairsAmount > 1 &&
      this.pipes[pipesPairsAmount - 1].speed >
        this.pipes[pipesPairsAmount - 2].speed
    ) {
      this.pipes.forEach((pipesPair) => {
        pipesPair.speed = pipesSpeed;
      });
    }
  }

  /*each stage  during  the game has its own pipes speed ,
   and a different amount of passed frames is relevant to each such stage, in order to add a pipes pair.*/
  isTimeToAddPipesPair(pipesSpeed) {
    switch (pipesSpeed) {
      case 9:
        return this.framesCount >= 100;
      case 10.2:
        return this.framesCount >= 90;
      case 11.4:
        return this.framesCount >= 85;
      case 12.6:
        return this.framesCount >= 80;
      case 13.8:
        return this.framesCount >= 75;
    }
  }

  updatePipesPos(time) {
    for (let pipesPair of this.pipes) {
      pipesPair.updatePosDuringGame(time);
    }
  }

  removePipesIfNeeded() {
    if (this.pipes.length !== 0) {
      if (this.pipes[0].isOutOfTheGrid()) {
        this.pipes.shift();
      }
    }
  }

  isBirdHitsTheGround() {
    let birdEndY = this.bird.pos.y + this.bird.size.y;
    let groundYPos = this.getGroundPosAndSize().pos.y + 0.15;
    return birdEndY > groundYPos;
  }

  isBirdHitsThePipes() {
    let isTopPipe = true;
    for (let { topPipe, bottomPipe } of this.pipes) {
      if (
        this.isBirdOverlap(topPipe, isTopPipe) ||
        this.isBirdOverlap(bottomPipe, !isTopPipe)
      ) {
        return true;
      }
    }
    return false;
  }

  isBirdOverlap(pipe, isTopPipe) {
    let bird = this.bird;
    let isXoverlapping =
      bird.pos.x + bird.size.x > pipe.pos.x &&
      bird.pos.x < pipe.pos.x + pipe.size.x;
    if (isTopPipe) {
      return isXoverlapping && bird.pos.y < pipe.pos.y + pipe.size.y;
    }
    return isXoverlapping && bird.pos.y + bird.size.y > pipe.pos.y;
  }

  getBirdStatus() {
    //checks two loss options
    if (this.status === "hitThePipes" || this.status === "hitTheGround") {
      return "falling";
    }
    if (this.bird.pos.y < this.bird.priorYStartJumpPos) {
      return "jumping";
    }
    return "falling";
  }

  increaseScoreIfNeeded() {
    let topPipe = this.getPipeAboveTheBird();
    if (topPipe && topPipe !== this.lastPipeForWhichScoreWasIncreased) {
      this.lastPipeForWhichScoreWasIncreased = topPipe;
      this.score++;
    }
  }

  getPipeAboveTheBird() {
    for (let { topPipe } of this.pipes) {
      if (
        this.bird.pos.x >= topPipe.pos.x &&
        this.bird.pos.x + this.bird.size.x <= topPipe.pos.x + topPipe.size.x
      ) {
        return topPipe;
      }
    }
    return null;
  }

  //Returns an array in which each member contains info about a pipes pair
  getPipesPosAndSize() {
    let pipesData = [];
    for (let { topPipe, bottomPipe } of this.pipes) {
      pipesData.push({
        topPipe: { pos: topPipe.pos, size: topPipe.size },
        bottomPipe: { pos: bottomPipe.pos, size: bottomPipe.size },
      });
    }
    return pipesData;
  }

  getState() {
    return {
      gameStatus: this.status,
      birdStatus: this.getBirdStatus(),
      score: this.score,
      birdPosAndSize: { pos: this.bird.pos, size: this.bird.size },
      pipesPairsPosAndSize: this.getPipesPosAndSize(),
      framesCount: this.framesCount,
    };
  }
}
