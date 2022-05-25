
class Cell {
  constructor(x, y){
    this.x = x;
    this.y = y;
    this.visited = false;
    this.walls = [];
    this.cells = [];
  }

  addWall(wall){
    this.walls.push(wall);
  }
  addCell(cell){
    this.cells.push(cell);
  }

  getUnvisitedCells(){
    let out = [];
    for(let cell of this.cells){
      if(cell.visited){ continue; }
      out.push(cell);
    }
    return out;
  }
}
class Wall {
  constructor(cell1, cell2){
    this.cell1 = cell1;
    this.cell2 = cell2;
    this.exists = true;
  }
}

class Grid {
  constructor(w, h){
    this.w = w;
    this.h = h;
    this.reset();
  }
  reset(){
    this.cells = [];
    for(let x = 0; x < this.w; x++){
      this.cells[x] = [];
      for(let y = 0; y < this.h; y++){
        this.cells[x][y] = new Cell(x, y);
      }
    }
    for(let x = 0; x < this.w; x++){
      for(let y = 0; y < this.h; y++){
        if(x != 0){ this.cells[x][y].addCell(this.cells[x-1][y]); }
        if(y != 0){ this.cells[x][y].addCell(this.cells[x][y-1]); }
        if(x != this.w-1){ this.cells[x][y].addCell(this.cells[x+1][y]); }
        if(y != this.h-1){ this.cells[x][y].addCell(this.cells[x][y+1]); }
      }
    }

    this.hWalls = [];
    for(let x = 0; x < this.w-1; x++){
      this.hWalls[x] = [];
      for(let y = 0; y < this.h; y++){
        this.hWalls[x][y] = new Wall(this.cells[x][y], this.cells[x+1][y]);
      }
    }

    this.vWalls = [];
    for(let x = 0; x < this.w; x++){
      this.vWalls[x] = [];
      for(let y = 0; y < this.h-1; y++){
        this.vWalls[x][y] = new Wall(this.cells[x][y], this.cells[x][y+1]);
      }
    }
  }

  getWallBetweenCells(c1, c2){
    return this.getWallBetween(c1.x, c1.y, c2.x, c2.y);
  }
  getWallBetween(x1, y1, x2, y2){
    let xMin = min(x1, x2);
    let xMax = max(x1, x2);
    let yMin = min(y1, y2);
    let yMax = max(y1, y2);

    if(xMin == xMax){
      return this.vWalls[xMin][yMin];
    }else{
      return this.hWalls[xMin][yMin];
    }
  }

  displayCells(){
    let cw = width/this.w;
    let ch = height/this.h;


    noStroke();

    for(let x = 0; x < this.w; x++){
      for(let y = 0; y < this.h; y++){
        if(this.cells[x][y].visited){
          fill(100);
        }else{
          fill(200);
        }
        rect(x*cw, y*ch, cw, ch);
      }
    }
  }
  displayWalls(){
    let cw = width/this.w;
    let ch = height/this.h;

    stroke(0);
    strokeWeight(5);

    for(let x = 0; x < this.w-1; x++){
      for(let y = 0; y < this.h; y++){
        if(this.hWalls[x][y].exists){
          line((x+1)*cw, y*ch, (x+1)*cw, (y+1)*ch);
        }
      }
    }

    for(let x = 0; x < this.w; x++){
      for(let y = 0; y < this.h-1; y++){
        if(this.vWalls[x][y].exists){
          line(x*cw, (y+1)*ch, (x+1)*cw, (y+1)*ch);
        }
      }
    }
  }
}

class RandomizedDFS {
  constructor(grid){
    this.grid = grid;
    let x = int(random(grid.w));
    let y = int(random(grid.h));
    this.stack = [grid.cells[x][y]];
    this.stack[0].visited = true;
  }

  step(){
    if(this.stack.length == 0){ return; }

    let unvisited = this.stack[0].getUnvisitedCells();
    if(unvisited.length > 0){
      let curr = this.stack[0];
      let next = unvisited[int(random(unvisited.length))];
      this.grid.getWallBetweenCells(curr, next).exists = false;
      next.visited = true;
      this.stack.splice(0, 0, next);
    }else{
      this.stack.splice(0, 1);
    }
  }

  display(){
    if(this.stack.length == 0){ return; }

    fill(200, 0, 0);
    noStroke();

    let cw = width/this.grid.w;
    let ch = height/this.grid.h;
    rect(this.stack[0].x*cw, this.stack[0].y*ch, cw, ch);
  }
}




let grid;
let solver;
function setup() {
  createCanvas(windowWidth, windowHeight);
  frameRate(60);
  grid = new Grid(25, 25);
  solver = new RandomizedDFS(grid);
}

function draw() {
  for(let i = 0; i < 3; i++){
    solver.step();
  }

  grid.displayCells();
  solver.display();
  grid.displayWalls();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
