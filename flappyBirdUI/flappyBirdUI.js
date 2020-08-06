"use strict";

class FlappyBirdUI {
  constructor() {
    this.flappyBirdGameLogic = new FlappyBirdGameLogic();
    this.canvas = this.createCanvasAndAppendToDom();
    this.cx = this.canvas.getContext("2d");
    this.widthScale = this.canvas.width / 24;
    this.heightScale = this.canvas.height / 10;
    this.moveBtnsTracer = this.getMoveBtnsTracer(" ");
    this.groundUI = new GroundUI(this.getGroundUIPosAndSize());
    this.birdUI = new BirdUI();
    this.pipesPairImgs = this.getPipesPairImgs();
    this.bgImage = this.getBgImg();
  }

  getGroundUIPosAndSize() {
    let { pos, size } = this.flappyBirdGameLogic.getGroundPosAndSize();
    return {
      pos: {
        x: pos.x * this.widthScale,
        y: pos.y * this.heightScale,
      },
      size: {
        x: size.x * this.widthScale,
        y: size.y * this.heightScale,
      },
    };
  }
  createCanvasAndAppendToDom() {
    let canvas = document.createElement("canvas");
    canvas.width = 480;
    canvas.height = 650;
    document.body.appendChild(canvas);
    return canvas;
  }

  getBgImg() {
    let bgImage = new Image();
    bgImage.src = "./images/background.png";
    return bgImage;
  }

  getPipesPairImgs() {
    let topPipeImage = new Image();
    topPipeImage.src = "./images/top-pipe.png";
    let bottomPipeImage = new Image();
    bottomPipeImage.src = "./images/bottom-pipe.png";
    return { topPipeImage, bottomPipeImage };
  }

  //returns object that track the move keys
  getMoveBtnsTracer(key) {
    let moveBtnsTracer = Object.create(null);

    function track(event) {
      //track space key
      if (key === event.key) {
        moveBtnsTracer[event.key] = event.type == "keydown";
        return;
      }
      //track mouse down and up
      if (event.type === "mousedown" || event.type === "mouseup") {
        moveBtnsTracer[key] = event.type === "mousedown";
      }
      event.preventDefault();
    }

    window.addEventListener("keydown", track);
    window.addEventListener("keyup", track);
    this.canvas.addEventListener("mousedown", track);
    this.canvas.addEventListener("mouseup", track);

    return moveBtnsTracer;
  }

  runAnimation(frameFunc) {
    let lastTime = null;
    function frame(time) {
      if (lastTime !== null) {
        let timeStep = Math.min(time - lastTime, 60) / 1000;
        if (frameFunc(timeStep) === false) return;
      }
      lastTime = time;
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  runGame() {
    this.runAnimation((time) => {
      let isMoveBtnPressed = this.moveBtnsTracer[" "];
      this.flappyBirdGameLogic.update(time, isMoveBtnPressed);
      let gameState = this.flappyBirdGameLogic.getState();
      this.drawGameOnCanvas(gameState);
      if (gameState.gameStatus != "hitTheGround") {
        return true;
      } else {
        this.storeBestScoreLocally(gameState.score);
        this.canvas.addEventListener("click", restart);
        window.addEventListener("keydown", restart);
        return false;
      }
    });

    const isRestartBtnClicked = (xClickedCoord, yClickedCoord) => {
      let canvasRect = this.canvas.getBoundingClientRect();
      let canvasXStart = canvasRect.x;
      let canvasYStart = canvasRect.y;

      let restartImgWidthPixles = 167,
        restartImgHeightPixles = 59,
        restarImgtYStart = 430;

      let restartXStart =
          canvasXStart + (this.canvas.width / 2 - restartImgWidthPixles / 2),
        restartXEnd = restartXStart + restartImgWidthPixles,
        restartYStart = canvasYStart + restarImgtYStart,
        restartYEnd = restartYStart + restartImgHeightPixles;

      return (
        xClickedCoord >= restartXStart &&
        xClickedCoord <= restartXEnd &&
        yClickedCoord >= restartYStart &&
        yClickedCoord <= restartYEnd
      );
    };

    const restart = (e) => {
      if (
        (e.type === "keydown" && e.key === " ") ||
        (e.type === "click" && isRestartBtnClicked(e.clientX, e.clientY))
      ) {
        document.body.removeChild(this.canvas);
        window.removeEventListener("keydown", restart);
        new FlappyBirdUI().runGame();
      }
    };
  }

  storeBestScoreLocally(gameScore) {
    let bestScore = localStorage.getItem("bestScore");
    if (bestScore !== undefined) {
      bestScore = bestScore > gameScore ? bestScore : gameScore;
    }
    localStorage.setItem("bestScore", `${bestScore}`);
  }

  drawGameOnCanvas(gameState) {
    let gameStatus = gameState.gameStatus;
    this.clearDisplay();
    this.drawBackground();
    this.drawPipes(gameState.pipesPairsPosAndSize);
    this.drawBird(gameState);
    this.drawGround();
    this.drawScore(gameState);
    if (gameStatus !== "hitTheGround" && gameStatus !== "hitThePipes") {
      this.groundUI.updatePos();
    } else {
      this.drawSignWithScore(gameState);
      this.drawRestartBtn();
    }
  }

  clearDisplay() {
    this.cx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  drawBackground() {
    this.cx.fillStyle = "#70c5ce";
    this.cx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    let sX = 0,
      sY = 0,
      sW = 885,
      sH = 355,
      dX = 0,
      dY = 400;
    this.cx.drawImage(
      this.bgImage,
      sX,
      sY,
      sW,
      sH,
      dX,
      dY,
      this.canvas.width,
      this.canvas.height - 400
    );
  }

  drawPipes(pipesPairsPosAndSize) {
    let topPipeImage = this.pipesPairImgs.topPipeImage,
      bottomPipeImage = this.pipesPairImgs.bottomPipeImage;
    let imgHeight = 470;
    let sX = 0,
      sY = 0,
      sW = 71,
      sH = 373;
    for (let { topPipe, bottomPipe } of pipesPairsPosAndSize) {
      this.cx.fillStyle = "black";
      this.cx.drawImage(
        topPipeImage,
        sX,
        sY,
        sW,
        sH,
        topPipe.pos.x * this.widthScale,
        this.claculateTopPipePosY(imgHeight, topPipe.size.y),
        topPipe.size.x * this.widthScale,
        imgHeight
      );
      this.cx.drawImage(
        bottomPipeImage,
        sX,
        sY,
        sW,
        sH,
        bottomPipe.pos.x * this.widthScale,
        bottomPipe.pos.y * this.heightScale,
        bottomPipe.size.x * this.widthScale,
        imgHeight
      );
    }
  }

  drawBird({ gameStatus, birdStatus, birdPosAndSize, framesCount }) {
    let birdPos = birdPosAndSize.pos,
      birdSize = birdPosAndSize.size;
    let birdUI = this.birdUI;
    // handle  wings movement
    if (birdStatus !== "falling" && framesCount % 8 === 0) {
      birdUI.image.src = birdUI.imageSrcs[birdUI.imgIndex];
      birdUI.imgIndex++;
      birdUI.imgIndex = birdUI.imgIndex == 4 ? 0 : birdUI.imgIndex;
    } else if (birdStatus === "falling") {
      birdUI.image.src = birdUI.imageSrcs[1];
    }

    let sX = 0,
      sY = 0,
      sW = 57,
      sH = 46,
      dX = birdPos.x * this.widthScale,
      dY = birdPos.y * this.heightScale;

    //rotate the canvas
    if (gameStatus !== "start") {
      this.cx.save();
      let birdCenterX = (birdPos.x + birdSize.x / 2) * this.widthScale;
      let birdCenterY = (birdPos.y + birdSize.y / 2) * this.heightScale;
      this.cx.translate(birdCenterX, birdCenterY);
      dX = -(birdSize.x * this.widthScale) / 2;
      dY = -(birdSize.y * this.heightScale) / 2;
      let degree;
      if (birdStatus === "jumping") {
        degree = -25;
      }
      if (birdStatus === "falling") {
        degree = 90;
      }
      this.cx.rotate((degree * Math.PI) / 180);
    }

    //draw
    this.cx.drawImage(
      birdUI.image,
      sX,
      sY,
      sW,
      sH,
      dX,
      dY,
      birdSize.x * this.widthScale,
      birdSize.y * this.heightScale
    );
    this.cx.restore();
  }

  drawScore({ gameStatus, score }) {
    this.cx.fillStyle = "white";
    this.cx.strokeStyle = "black";
    this.cx.lineWidth = 2;
    if (gameStatus !== "hitTheGround") {
      this.cx.font = "70px  Teko";
      this.cx.fillText(score, this.canvas.width / 2 - 20, 150);
      this.cx.strokeText(score, this.canvas.width / 2 - 20, 150);
    } else {
      this.cx.font = "50px  Teko";
      this.cx.fillText(score, this.canvas.width / 2 - 20, 320);
      this.cx.strokeText(score, this.canvas.width / 2 - 20, 320);
      this.cx.fillText(
        localStorage.getItem("bestScore"),
        this.canvas.width / 2 - 20,
        385
      );
      this.cx.strokeText(
        localStorage.getItem("bestScore"),
        this.canvas.width / 2 - 20,
        385
      );
    }
  }

  drawRestartBtn() {
    let img = new Image();
    img.src = "./images/restart-btn.PNG";
    img.onload = () => {
      let sX = 0,
        sY = 0,
        sW = 167,
        sH = 59,
        dX = this.canvas.width / 2 - sW / 2,
        dY = 430;
      this.cx.drawImage(img, sX, sY, sW, sH, dX, dY, sW, sH);
    };
  }

  drawSignWithScore({ gameStatus, score }) {
    let img = new Image();
    img.src = "./images/sign.png";
    img.onload = () => {
      let sX = 0,
        sY = 0,
        sW = 145,
        sH = 191,
        dX = this.canvas.width / 2 - sW / 2,
        dY = this.canvas.height / 2 - sH / 2;
      this.cx.drawImage(img, sX, sY, sW, sH, dX, dY, sW, sH);
      this.drawScore({ gameStatus, score });
    };
  }

  claculateTopPipePosY(pipeImgHeight, topPipeYsize) {
    return topPipeYsize * this.heightScale - pipeImgHeight;
  }

  drawGround() {
    let groundUI = this.groundUI;
    let sX = 0,
      sY = 0,
      sW = 629,
      sH = 246,
      dX = groundUI.pos.x,
      dY = groundUI.pos.y,
      dW = groundUI.size.x,
      dH = groundUI.size.y;
    this.cx.drawImage(
      this.groundUI.groundImages[0],
      sX,
      sY,
      sW,
      sH,
      dX,
      dY,
      dW,
      dH
    );
    this.cx.drawImage(
      this.groundUI.groundImages[1],
      sX,
      sY,
      sW,
      sH,
      dX + this.canvas.width,
      dY,
      dW,
      dH
    );
  }
}
