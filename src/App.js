import React from 'react';
import './App.css';
import D15Game, {ENTITIES, entityIcons, ROOM_MAX_X, ROOM_MAX_Y} from "./D15Game";

const randomIntFromInterval = function(min, max) { // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
}
const generateRandomDefauls = () => {return {
  'player_x' : randomIntFromInterval(0,7),
  'player_y' : 2,
  'boss_x' : randomIntFromInterval(2,5),
  'boss_y' : 5,
  'cat_x' : randomIntFromInterval(0,7),
  'cat_y' : randomIntFromInterval(3,4),
  'dog_x' : randomIntFromInterval(0,7),
  'dog_y' : randomIntFromInterval(6,7),
  'dragon_x' : randomIntFromInterval(0,7),
  'dragon_y' : randomIntFromInterval(0,1),
}}
const randomDefaults = generateRandomDefauls();

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {dungeon: null, numTurns: null}
  }


  render() {
    return <div>
      <section>
        <div>
          {this.renderBoard()}
        </div>
      </section>
      <div style={{clear: 'both'}} />
      <br/>
      <section>
        {this.renderControls()}
      </section>
    </div>
  }

  renderBoard() {
    const dungeon = this.state.dungeon;

    let entityPositions = {};
    if (dungeon) {
      ENTITIES.forEach(entity => {
        let entityCoords = dungeon[entity];
        if (entity === 'player') {
          entity = dungeon.state;
        }
        entityPositions[`${entityCoords.x}/${entityCoords.y}`] = <img src={entityIcons[entity]} alt={entity} width="28px" height="28px"/> ;
      });
    }

    let rows = [];
    for (let y = ROOM_MAX_Y; y >= 0; y--) {
      let cols = [];
      for (let x = 0; x <= ROOM_MAX_X; x++) {
        let content;
        let coordString = `${x}/${y}`;
        if (dungeon) {
          if (coordString in entityPositions) {
            content = entityPositions[coordString];
          }
        } else {
          content = coordString;
        }

        let col_classes = 'coll';
        if (dungeon) {
          col_classes += ' ' + dungeon.colorAt(x, y);
        }
        cols.push(<div className={col_classes} key={x}>{content}</div>);
      }
      rows.push(<div key={y} className="roww">{cols}</div>);
    }

    return <div className="board">
      {rows}
    </div>
  }

  renderControls() {

    let testDefaults = randomDefaults

    const dungeon = this.state.dungeon;

    if (!dungeon) {
      return <form onSubmit={e => {
        e.preventDefault();
        let args = []
        ENTITIES.forEach(entity => {
          args.push({
            x: Number(this.refs[`${entity}_x`].value),
            y: Number(this.refs[`${entity}_y`].value),
          })
        });
        let newDung = new D15Game(...args);
        newDung.hp = Number(this.refs.hp.value);
        newDung.state = this.refs.player_state.value;
        newDung.sequence = this.refs['11color'].value+'_square';
        this.setState({dungeon: newDung, numTurns: 0})
      }}>
        <p>Configure your board according to the shown coordinates and click "Start".</p>
        <div  className="form-inline py-10">
        <label htmlFor="hp">HP</label>
        <input type="number" min="1" max="200" required defaultValue="200" ref="hp" id="hp" className="form-control" />
        <label htmlFor="state">Mode</label>
        <select required id="state" ref="player_state" defaultValue="sword" className="form-control">
          <option>sword</option>
          <option>armor</option>
        </select>
          <label htmlFor="11color">Top-Left Color</label>
          <select required id="11color" ref="11color" defaultValue="yellow" className="form-control">
            <option>yellow</option>
            <option>green</option>
            <option>red</option>
            <option>blue</option>
          </select>
        </div>
        <div  className="form-inline py-10">
        {ENTITIES.map(entity => <div key={entity}>
          <label>{entity}</label>
          <input type="number" min="0" max={ROOM_MAX_X} required ref={`${entity}_x`} placeholder="X" defaultValue={testDefaults[`${entity}_x`]} className="form-control" />
          <input type="number" min="0" max={ROOM_MAX_Y} required ref={`${entity}_y`} placeholder="Y" defaultValue={testDefaults[`${entity}_y`]} className="form-control" />
        </div>)}
        </div>
<button type="submit" className="btn btn-primary btn-block mt-10">Start</button>
        <textarea className="form-control mt-10" placeholder="Paste Dungeon board (:green_square:........:yellow_square:)" style={{resize: "vertical"}} onChange={e => {
          let input = e.target.value || '';
          let count = (input.match(/square/g) || []).length
          if (count === 59) {
            let parts = input.split(':');
            let i = 0;
            parts.forEach(part => {
              part = part.trim();
              if (!part) {
                return;
              }
              if (i === 0 && part.includes('square')) {
                this.refs['11color'].value = part.split('_')[0];
              }
              let partX = i % 8;
              let partY = 7 - Math.floor(i / 8);
              if (part.includes('armor')) {
                this.refs.player_x.value = partX;
                this.refs.player_y.value = partY;
                this.refs.player_state.value = 'armor';
              }else if (part.includes('sword')) {
                this.refs.player_x.value = partX;
                this.refs.player_y.value = partY;
                this.refs.player_state.value = 'sword';
              }else if (part.includes('TIMEdragon')) {
                this.refs.boss_x.value = partX;
                this.refs.boss_y.value = partY;
              }else if (part.includes('dogpet')) {
                this.refs.dog_x.value = partX;
                this.refs.dog_y.value = partY;
              }else if (part.includes('catpet')) {
                this.refs.cat_x.value = partX;
                this.refs.cat_y.value = partY;
              }else if (part.includes('dragonpet')) {
                this.refs.dragon_x.value = partX;
                this.refs.dragon_y.value = partY;
              }
              i++;
            });
            e.target.value = '';
            alert("Configured positions. Check HP & Color.");
          }
        }}/>
      </form>
    } else {
      return <div>
        <p>HP: {dungeon.hp}</p>
        <p>Sequence: {dungeon.sequence}</p>
        <p>Turns: {this.state.numTurns}</p>
        {dungeon.getPossibleMoves().map(move => <button key={move} type="button" className="btn" onClick={() => {
          dungeon.move(move);
          this.setState({numTurns: dungeon.turns.length});
        }}>{move}</button> )}
        <br/>
      </div>
    }
  }
}

export default App;
