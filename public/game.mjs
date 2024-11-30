import Player from './Player.mjs';
import Collectible from './Collectible.mjs';

const socket = io();
const canvas = document.getElementById('game-window');
const context = canvas.getContext('2d');

let players = {};
let collectibles = {};

function draw() {
  context.clearRect(0, 0, canvas.width, canvas.height);
  
  Object.values(players).forEach((player) => {
    context.fillStyle = 'blue';
    context.fillRect(player.x, player.y, 20, 20);
  });

  Object.values(collectibles).forEach((collectible) => {
    context.fillStyle = 'gold';
    context.fillRect(collectible.x, collectible.y, 20, 20);
  });
}

socket.on('stateUpdate', ({ playersData, collectiblesData }) => {
  players = playersData;
  collectibles = collectiblesData;
  draw();
});

document.addEventListener('keydown', (e) => {
  const keyMap = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right' };
  if (keyMap[e.key]) {
    socket.emit('move', keyMap[e.key]);
  }
});
