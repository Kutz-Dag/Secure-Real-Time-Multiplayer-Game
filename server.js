require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const expect = require('chai');
const socket = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');

const fccTestingRoutes = require('./routes/fcctesting.js');
const runner = require('./test-runner.js');

const app = express();

app.use(helmet());
app.use(
  helmet.hidePoweredBy({
    setTo: 'PHP 7.4.3'
  })
);
app.use(helmet.noSniff());
app.use(helmet.xssFilter());
app.use(helmet.noCache());

app.use('/public', express.static(process.cwd() + '/public'));
app.use('/assets', express.static(process.cwd() + '/assets'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//For FCC testing purposes and enables user to connect from outside the hosting platform
app.use(cors({origin: '*'})); 

// Index page (static HTML)
app.route('/')
  .get(function (req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
  }); 

//For FCC testing purposes
fccTestingRoutes(app);
    
// 404 Not Found Middleware
app.use(function(req, res, next) {
  res.status(404)
    .type('text')
    .send('Not Found');
});

const portNum = process.env.PORT || 3000;

// Set up server and tests
const server = app.listen(portNum, () => {
  console.log(`Listening on port ${portNum}`);
  if (process.env.NODE_ENV==='test') {
    console.log('Running Tests...');
    setTimeout(function () {
      try {
        runner.run();
      } catch (error) {
        console.log('Tests are not valid:');
        console.error(error);
      }
    }, 1500);
  }
});

const io = socket(server);

let players = {};
let collectibles = {};

for (let i = 0; i < 5; i++) {
  collectibles[`c${i}`] = {
    x: Math.random() * 500,
    y: Math.random() * 500,
    value: Math.floor(Math.random() * 10 + 1),
    id: `c${i}`,
  };
}

io.on('connection', (socket) => {
  const playerId = socket.id;

  players[playerId] = {
    x: Math.random() * 500,
    y: Math.random() * 500,
    score: 0,
    id: playerId,
  };

  socket.emit('stateUpdate', { players, collectibles });

  socket.on('move', (dir) => {
    const player = players[playerId];
    if (player) {
      switch (dir) {
        case 'up':
          player.y -= 5;
          break;
        case 'down':
          player.y += 5;
          break;
        case 'left':
          player.x -= 5;
          break;
        case 'right':
          player.x += 5;
          break;
      }

      Object.keys(collectibles).forEach((key) => {
        const collectible = collectibles[key];
        if (
          player.x < collectible.x + 20 &&
          player.x + 20 > collectible.x &&
          player.y < collectible.y + 20 &&
          player.y + 20 > collectible.y
        ) {
          player.score += collectible.value;
          delete collectibles[key];
        }
      });

      io.emit('stateUpdate', { players, collectibles });
    }
  });

  socket.on('disconnect', () => {
    delete players[playerId];
    io.emit('stateUpdate', { players, collectibles });
  });
});

module.exports = app; // For testing
