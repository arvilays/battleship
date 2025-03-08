import '../css/reset.css';
import '../css/style.css';
import Display from './display.js';
import Battleship from './battleship.js';

const main = () => {
  const display = new Display();
  const battleship = new Battleship(display);
};

main();


