export const ROOM_MAX_X = 7; // Size: 8
export const ROOM_MAX_Y = 7;
export const ENTITIES = ['boss', 'player', 'cat', 'dog', 'dragon'];

export const entityIcons = {
  'sword': 'https://cdn.discordapp.com/emojis/707334264387272754.png?v=1',
  //'sword': 'https://discordapp.com/assets/0d444d5cf3da0c2ee54dd67790e2338f.svg',
   'armor': 'https://cdn.discordapp.com/emojis/707334203066417162.png?v=1',
 // 'armor': 'https://discordapp.com/assets/ad2e4d6e7b90ca6005a5038e22b099cc.svg',
  'cat': 'https://cdn.discordapp.com/emojis/703150997517893692.png?v=1',
  'dragon': 'https://cdn.discordapp.com/emojis/705963075576135691.png?v=1',
  'boss': 'https://cdn.discordapp.com/emojis/707342275201728512.png?v=1',
 // 'boss': 'https://cdn.discordapp.com/emojis/627827327874760724.png?v=1',
  'dog': 'https://cdn.discordapp.com/emojis/703152291540369450.png?v=1'
};

// 7
// 6
// 5
// 4
// 3
// 2
// 1
// 0  1  2  3  4  5  6  7

const coordEquals = (a, b) => a.x === b.x && a.y === b.y;

const mirrorBy = (coord, reference) => {
  let xdiff = reference.x - coord.x;
  let ydiff = reference.y - coord.y;
  return {
    x: coord.x + (2 * xdiff),
    y: coord.y + (2 * ydiff),
  }
}

class D15Game {
  constructor(boss, player, cat, dog, dragon) {
    this.hp = 200;
    this.turns = [];

    this.player = player;
    this.boss = boss;
    this.cat = cat;
    this.dog = dog;
    this.dragon = dragon;
    this.state = 'sword';
    this.sequence = 0;

  }

  isPossibleMoveTarget(x, y, moving = 'player') {
    if (x > ROOM_MAX_X || x < 0) {
      return false;
    }
    if (y > ROOM_MAX_Y || y < 0) {
      return false;
    }

    let coord = {x, y};

    return ENTITIES.filter(entity => entity !== moving).every(entity => !coordEquals(coord, this[entity]))
  }

  findMoveUntil(coord, moving, stepX, stepY, steps) {
    let latestOk = coord;
    let xCarry = coord.x;
    let yCarry = coord.y;
    for (let i = 0; i < steps; i++) {
      xCarry += stepX;
      yCarry += stepY;
      if (this.isPossibleMoveTarget(xCarry, yCarry, moving)) {
        latestOk = {
          x: xCarry,
          y: yCarry
        }
      } else {
        break;
      }
    }
    return latestOk;
  }

  checkWin() {
    let requiredFields = [
      {
        x: this.boss.x + 1,
        y: this.boss.y,
      }, {
        x: this.boss.x - 1,
        y: this.boss.y,
      }, {
        x: this.boss.x,
        y: this.boss.y + 1,
      }, {
        x: this.boss.x,
        y: this.boss.y - 1,
      }
    ];

    return requiredFields.every(requiredCoord => ENTITIES.some(entity => coordEquals(this[entity], requiredCoord)));
  }

  getPossibleMoves() {
    // TODO: Move these checks outside
    if (this.hp <= 0) {
      return [{move: 'DEAD', possible: false}];
    }
    if (this.checkWin()) {
      return [{move: 'ATTACK', possible: false}];
    }

    let moves = [];

    let moveAmount = this.state === 'sword' ? 2 : 1;

    moves.push({move: 'left', possible: this.isPossibleMoveTarget(this.player.x - moveAmount, this.player.y)});
    moves.push({move: 'right', possible: this.isPossibleMoveTarget(this.player.x + moveAmount, this.player.y)});
    moves.push({move: 'down', possible: this.isPossibleMoveTarget(this.player.x, this.player.y - moveAmount)});
    moves.push({move: 'up', possible: this.isPossibleMoveTarget(this.player.x, this.player.y + moveAmount)});
    moves.push({move: 'dog', possible: true});
    moves.push({move: 'cat', possible: true});
    moves.push({move: 'dragon', possible: true});
    moves.push({move: 'switch', possible: true});
    moves.push({move: 'pass turn', possible: this.hp > 60});

    return moves;
  }

  move(direction) {
    this.turns.push(direction);

    let moveAmount = this.state === 'sword' ? 2 : 1;

    let previousLocation = Object.assign({}, this.player);

    switch (direction) {
      case 'switch':
        if (this.state === 'sword') {
          this.state = 'armor';
        } else {
          this.state = 'sword';
        }
        break;
      case 'pass turn':
        this.hp -= 25;
        break;
      case 'up':
        this.player.y += moveAmount;
        break;
      case 'down':
        this.player.y -= moveAmount;
        break;
      case 'left':
        this.player.x -= moveAmount;
        break;
      case 'right':
        this.player.x += moveAmount;
        break;
      case 'dog':
        this.player = Object.assign(this.player, this.dog);
        this.dog = previousLocation;
        break;
      case 'cat':
        this.player = Object.assign(this.player, this.cat);
        this.cat = previousLocation;
        break;
      case 'dragon':
        this.player = Object.assign(this.player, this.dragon);
        this.dragon = previousLocation;
        break;
      default:
        throw Error('unknown move');
    }

    let dmgAmount = this.state === 'sword' ? 4 : 2;

    if (direction !== 'pass turn') {
      this.dogmove();
      this.catmove();
      this.dragonmove();
    }

    this.hp -= dmgAmount;
    this.shiftSequence();
  }

  shiftSequence()
  {
    switch (this.sequence) {
      case 'yellow_square':
        this.sequence = 'green_square';
        break;
      case 'green_square':
        this.sequence = 'red_square';
        break;
      case 'red_square':
        this.sequence = 'blue_square';
        break;
      case 'blue_square':
        this.sequence = 'yellow_square';
        break;
      default:
        throw Error("wtf");
    }
  }

  colorAt(x, y) {
    let offsetX = x % 2;
    let offsetY = (7 - y) % 2;

    let offset = offsetX + (2 * offsetY);

    switch (this.sequence) {
      case 'yellow_square':
        switch (offset) {
          case 0:
            return 'yellow';
          case 1:
            return 'green';
          case 2:
            return 'red';
          case 3:
            return 'blue';
          default:
            throw Error("oof");
        }
      case 'green_square':
        switch (offset) {
          case 0:
            return 'green';
          case 1:
            return 'red';
          case 2:
            return 'blue';
          case 3:
            return 'yellow';
          default:
            throw Error("oof");
        }
      case 'red_square':
        switch (offset) {
          case 0:
            return 'red';
          case 1:
            return 'blue';
          case 2:
            return 'yellow';
          case 3:
            return 'green';
          default:
            throw Error("oof");
        }
      case 'blue_square':
        switch (offset) {
          case 0:
            return 'blue';
          case 1:
            return 'yellow';
          case 2:
            return 'green';
          case 3:
            return 'red';
          default:
            throw Error("oof");
        }
      default:
        throw Error("oooof");
    }
  }

  dogmove() {
    if (this.hp > 130) {

      let intendedMove;
      let dogOn = this.colorAt(this.dog.x, this.dog.y);

      switch (this.sequence) {
        case 'yellow_square':
          switch (dogOn) {
            case 'yellow':
              intendedMove = 'down';
              break;
            case 'green':
              intendedMove = 'up';
              break;
            case 'red':
              intendedMove = 'right';
              break;
            case 'blue':
              intendedMove = 'left';
              break;
            default:
              throw Error("uk sequence dogmove");
          }
          break;
        case 'green_square':
          switch (dogOn) {
            case 'yellow':
              intendedMove = 'down';
              break;
            case 'green':
              intendedMove = 'right';
              break;
            case 'red':
              intendedMove = 'left';
              break;
            case 'blue':
              intendedMove = 'up';
              break;
            default:
              throw Error("uk sequence dogmove");
          }
          break;
        case 'red_square':
          switch (dogOn) {
            case 'yellow':
              intendedMove = 'left';
              break;
            case 'green':
              intendedMove = 'right';
              break;
            case 'red':
              intendedMove = 'up';
              break;
            case 'blue':
              intendedMove = 'down';
              break;
            default:
              throw Error("uk sequence dogmove");
          }
          break;
        case 'blue_square':
          switch (dogOn) {
            case 'yellow':
              intendedMove = 'right';
              break;
            case 'green':
              intendedMove = 'down';
              break;
            case 'red':
              intendedMove = 'up';
              break;
            case 'blue':
              intendedMove = 'left';
              break;
            default:
              throw Error("uk sequence dogmove");
          }
          break;
        default:
          throw Error("uk sequence dogmove");
      }

      let intendedXDir, intendedYDir;
      switch (intendedMove) {
        case 'up':
          intendedXDir = 0;
          intendedYDir = 1;
          break;
        case 'left':
          intendedXDir = -1;
          intendedYDir = 0;
          break;
        case 'right':
          intendedXDir = 1;
          intendedYDir = 0;
          break;
        case 'down':
          intendedXDir = 0;
          intendedYDir = -1;
          break;
        default:
          throw Error("No intended direction");
      }

      let prio1 = {x: this.dog.x + (5 * intendedXDir), y: this.dog.y + (5 * intendedYDir)};
      let prio2 = {x: this.dog.x + (-2 * intendedXDir), y: this.dog.y + (-2 * intendedYDir)};

      if (this.isPossibleMoveTarget(prio1.x, prio1.y, 'dog')) {
        this.dog = prio1;
      } else if (this.isPossibleMoveTarget(prio2.x, prio2.y, 'dog')) {
        this.dog = prio2;
      }


    } else if (this.hp > 100) {
      // switch cat
      let tmp = this.dog;
      this.dog = this.cat;
      this.cat = tmp;
    } else if (this.hp > 60) {
      // up 3
      this.dog = this.findMoveUntil(this.dog, 'dog', 0, 1, 3);
    } else {
      // switch drag
      let tmp = this.dog;
      this.dog = this.dragon;
      this.dragon = tmp;
    }
  }

  catmove() {
    if (this.hp > 130) {
      // move 1 towards dragon
      let catMove = Object.assign({}, this.cat);
      let diffX = this.dragon.x - this.cat.x;
      let diffY = this.dragon.y - this.cat.y;
      if (!(Math.abs(diffX) > 1 || Math.abs(diffY) > 1)) {
        return;
      }
      if (Math.abs(diffX) > Math.abs(diffY)) { // TODO: This was adjusted (? still relevant?
        catMove.x += Math.sign(diffX);
      } else {
        catMove.y += Math.sign(diffY);
      }
      if (this.isPossibleMoveTarget(catMove.x, catMove.y, 'cat')) {
        this.cat = catMove;
      }
    } else if (this.hp > 100) {
      // down 3
      this.cat = this.findMoveUntil(this.cat, 'cat', 0, -1, 3);
    } else if (this.hp > 60) {
      // move 1 away from player
      let catMove = Object.assign({}, this.cat);
      let diffX = this.cat.x - this.player.x;
      let diffY = this.cat.y - this.player.y;
      if (Math.abs(diffX) > Math.abs(diffY)) {
        catMove.x += Math.sign(diffX);
      } else {
        catMove.y += Math.sign(diffY);
      }
      if (this.isPossibleMoveTarget(catMove.x, catMove.y, 'cat')) {
        this.cat = catMove;
      }
    } else {
      // right 3
      this.cat = this.findMoveUntil(this.cat, 'cat', 1, 0, 3);
    }
  }

  dragonmove() {
    if (this.hp > 130) {
      let mirrorPoint = mirrorBy(this.dragon, this.player);
      if (this.isPossibleMoveTarget(mirrorPoint.x, mirrorPoint.y, 'dragon')) {
        this.dragon = mirrorPoint;
      }
    } else if (this.hp > 100) {
      // nothing
    } else if (this.hp > 60) {
      let mirrorPoint = mirrorBy(this.dragon, {x: ROOM_MAX_X / 2, y: ROOM_MAX_Y / 2});
      if (this.isPossibleMoveTarget(mirrorPoint.x, mirrorPoint.y, 'dragon')) {
        this.dragon = mirrorPoint;
      }
    } else {
      // left 3
      this.dragon = this.findMoveUntil(this.dragon, 'dragon', -1, 0, 3);
    }
  }

  serialize()
  {
    let str = this.state+this.hp+'_';
    ENTITIES.forEach(entity => {
      str += this[entity].x.toString() + this[entity].y.toString() +'_';
    });
    return str;
  }

  getClone()
  {
    let clonedGame = new D15Game();
    ENTITIES.forEach(entity => {
      clonedGame[entity] = Object.assign({}, this[entity]);
    })
    clonedGame.hp = this.hp;
    clonedGame.state = this.state;
    clonedGame.turns = [...this.turns];
    return clonedGame;
  }

}

export default D15Game;
