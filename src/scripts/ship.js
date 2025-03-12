export default class Ship {
  constructor(length) {
    this.length = length;
    this.timesHit = 0;
    this.orientation = "horizontal";
    this.origin = [0, 0];
  }

  hit() {
    if (this.timesHit < this.length) this.timesHit += 1;
  }

  isSunk() {
    return this.timesHit >= this.length;
  }

  getCoords() {
    const [xOrigin, yOrigin] = this.origin;
    const [xOffset, yOffset] =
      this.orientation === "horizontal" ? [1, 0] : [0, 1];

    return Array.from({ length: this.length }, (_, i) => [
      xOrigin + xOffset * i,
      yOrigin + yOffset * i,
    ]);
  }
}
