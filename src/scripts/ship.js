export default class Ship {
  constructor (length) {
    this.length = length;
    this.timesHit = 0;
    this.sunk = false;
  }

  hit () {
    if (this.timesHit < this.length) this.timesHit += 1;
  }

  isSunk () {
    return this.timesHit >= this.length;
  }
}