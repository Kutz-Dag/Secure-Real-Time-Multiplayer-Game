class Player {
  constructor({ x, y, score, id }) {
    this.x = x;
    this.y = y;
    this.score = score || 0;
    this.id = id;
  }

  movePlayer(dir, speed) {
    switch (dir) {
      case 'up':
        this.y -= speed;
        break;
      case 'down':
        this.y += speed;
        break;
      case 'left':
        this.x -= speed;
        break;
      case 'right':
        this.x += speed;
        break;
    }
  }

  collision(item) {
    return (
      this.x < item.x + 20 &&
      this.x + 20 > item.x &&
      this.y < item.y + 20 &&
      this.y + 20 > item.y
    );
  }

  calculateRank(players) {
    const sortedPlayers = players.sort((a, b) => b.score - a.score);
    const rank = sortedPlayers.findIndex((player) => player.id === this.id) + 1;
    return `Rank: ${rank}/${players.length}`;
  }
}

export default Player;
