require('@babel/register')({
  presets: ['@babel/env'],
});

const D15Game = require("./D15Game").default;

const data = require('./runs.json');

const hp = 199;

data.forEach(function(run) {
  let steps = run.length - 1;
  for (let i = 0; i < steps; i++) {
    let d1strs = run[i].split(':');
    d1strs.shift();
    let d1 = parseMap(d1strs.join(':'));

    let d2strs = run[i + 1].split(':');
    let move2 = d2strs.shift();
    let d2 = parseMap(d2strs.join(':'));

    let premove = d1.serialize();

    d1.hp = hp;

    d1.move(move2.toLowerCase());

    d1.hp = hp;
    d2.hp = hp;

    if (d1.serialize() === d2.serialize()) {
      console.log(".");
    } else {
      console.log(premove, d1.serialize(), d2.serialize());
    }
  }
});

const colorToSequence = {
  'yellow_square': 0,
  'green_square': 1,
  'red_square': 2,
  'blue_square': 3,
};

function parseMap(input) {
  let count = (input.match(/square/g) || []).length
  if (count !== 59) {
    throw Error("Invalid map");
  }
  let parts = input.split(':');
  let i = 0;

  let state, boss, player, cat, dog, dragon, color;

  parts.forEach(part => {
    part = part.trim();
    if (!part) {
      return;
    }
    if (i === 0) {
      color = part;
    }
    let partX = i % 8;
    let partY = 7 - Math.floor(i / 8);

    let coord = {
      x: partX,
      y: partY,
    };

    if (part.includes('armor')) {
      state = 'armor';
      player = coord;
    } else if (part.includes('sword')) {
      state = 'sword';
      player = coord;
    } else if (part.includes('TIMEdragon')) {
      boss = coord;
    } else if (part.includes('dogpet')) {
      dog = coord;
    } else if (part.includes('catpet')) {
      cat = coord;
    } else if (part.includes('dragonpet')) {
      dragon = coord;
    }
    i++;
  });

  if (!(state && boss && dog)) {
    throw Error("Incomplete board");
  }

  let game = new D15Game(boss, player, cat, dog, dragon);
  game.state = state;
  game.sequence = color;
  return game;
}

