let over = false;
let permutations = 0;
let others = 0;
let positions = [];

let callback;

export default function solve(gameInstance, cb) {
  callback = cb;
  permutate(gameInstance);
  if (!over) {
    return 'Unwinnable, checked '+permutations+' possible permutations until death';
  } else {
    return {start: gameInstance, win: over, permutations, others};
  }
}

function permutate(game)
{
  positions.push(game.serialize());
  game.getPossibleMoves().forEach(moveDirection => {
    if (moveDirection === 'DEAD') {
      permutations++;
      if (permutations % 10000 === 0) {
          console.log("Dead after "+game.turns.length, permutations);
      }
      return;
    }
    if (moveDirection === 'ATTACK') {
      console.log("Found winning permutation", game);
      if (!over || game.hp > over.hp) {
        over = game;
      } else {
        others++;
      }
      return;
    }
    if (over) {
      return;
    }

    let newGame = game.getClone();
    newGame.move(moveDirection);
    if (positions.indexOf(newGame.serialize()) !== -1) {
      return;
    }
    if (callback) {
      callback(newGame);
      setTimeout(() => permutate(newGame), 100);
      //permutate(newGame);
    } else {
      permutate(newGame);
    }
  });
}
