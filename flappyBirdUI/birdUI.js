"use strict";

class BirdUI {
  constructor() {
    this.image = new Image();
    this.imageSrcs = [
      "./images/bird-1.png",
      "./images/bird-2.png",
      "./images/bird-3.png",
      "./images/bird-2.png",
    ];
    this.imgIndex = 0;
    this.image.src = this.imageSrcs[this.imgIndex];
  }
}
