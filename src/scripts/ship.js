export default class Ship {
  constructor (length) {
    this.length = length;
    this.timesHit = 0;
    this.sunk = false;
    this.orientation = 'horizontal';
    this.origin = [0,0];
  }

  hit () {
    if (this.timesHit < this.length) this.timesHit += 1;
  }

  isSunk () {
    return this.timesHit >= this.length;
  }

  getCoords () {
    const coords = [];
    const [xOrigin, yOrigin] = this.origin;

    // Determine the axis change based on orientation
    const [xOffset, yOffset] = this.orientation === 'horizontal' ? [1, 0] : [0, 1];

    // Generate coordinates based on orientation
    for (let i = 0; i < this.length; i++) {
      coords.push([xOrigin + xOffset * i, yOrigin + yOffset * i]);
    }
    
    return coords;
  }
}