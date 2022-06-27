
class Rectangle {
  constructor(x, y, w, h){
    this.x = x
    this.y = y
    this.w = w
    this.h = h
  }

  collidesWith(other){
    if(other.x + other.w < this.x){ return false; }
    if(other.y + other.h < this.y){ return false; }
    if(this.x + this.w < other.x){ return false; }
    if(this.y + this.h < other.y){ return false; }
    return true
  }

  contains(other) {
    return this.x <= other.x && other.x+other.w <= this.x+this.w
        && this.y <= other.y && other.y+other.h <= this.y+this.h
  }

  display(){
    rect(this.x, this.y, this.w, this.h)
  }
}

class Circle {
  constructor(x, y, r, col){
    this.x = x;
    this.y = y;
    this.r = r;
    this.col = col
  }

  getBoundingBox() {
    return new Rectangle(thix.x-this.r, this.y-this.r, 2*this.r, 2*this.r)
  }

  display(){
    fill(this.col)
    ellipse(this.x, this.y, this.r*2, this.r*2)
  }
}

class QuadTree {
  constructor(area, depth) {
    this.depth = depth
    this.resize(area)
  }

  resize(area) {
    this.area = area

    let x = area.x
    let y = area.y
    let cW = area.w/2
    let cH = area.h/2
    this.childAreas = [
      new Rectangle(x+0,  y+0,  cW, cH),
      new Rectangle(x+cW, y+0,  cW, cH),
      new Rectangle(x+0,  y+cH, cW, cH),
      new Rectangle(x+cW, y+cH, cW, cH)
    ]

    this.objects = []
    this.children = [null, null, null, null]
  }

  insert(object){
    for(let i = 0; i < 4; i++){
      if(this.depth <= 0){ continue; }
      if(!this.childAreas[i].contains(object[1])){ continue }
      if(!this.children[i]){
        this.children[i] = new QuadTree(this.childAreas[i], this.depth-1)
      }
      this.children[i].insert(object)
      return
    }

    append(this.objects, object)
  }

  getObjects(area){
    if(area.contains(this.area)){ return this.getAllObjects() }
    var objs = []
    for(let i = 0; i < this.objects.length; i++){
      if(!area.collidesWith(this.objects[i][1])){ continue }
      append(objs, this.objects[i][0])
    }
    for(let i = 0; i < 4; i++){
      if(!this.children[i]){ continue }
      objs = concat(objs, this.children[i].getObjects(area))
    }
    return objs
  }

  getAllObjects(){
    var objs = []
    for(let i = 0; i < this.objects.length; i++){
      append(objs, this.objects[i][0])
    }
    for(let i = 0; i < 4; i++){
      if(!this.children[i]){ continue }
      objs = concat(objs, this.children[i].getAllObjects())
    }
    return objs
  }

  display() {
    noFill()
    this.area.display()
    for(let i = 0; i < 4; i++){
      if(!this.children[i]){ continue; }
      this.children[i].display()
    }
    fill(255)
    for(let i = 0; i < this.objects.length; i++){
      //this.objects[i][1].display()
    }
  }
}

var quadTree
var mouseRect

function populateQuadTree(){
  for(let i = 0; i < 800; i++){
    let r = random(2, 10)
    let x = random(r, width-r)
    let y = random(r, height-r)
    quadTree.insert([
      new Circle(x, y, r, color(random(100, 200), random(100, 200), random(100, 200))),
      new Rectangle(x-r, y-r, 2*r, 2*r)
    ])
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight)
  frameRate(60)
  quadTree = new QuadTree(new Rectangle(0, 0, width, height), 8)
  populateQuadTree()
  mouseRect = new Rectangle(0, 0, 100, 100)
}

function draw() {
  background(100)
  mouseRect.x = mouseX - mouseRect.w/2
  mouseRect.y = mouseY - mouseRect.h/2
  quadTree.display()
  let circles = quadTree.getAllObjects()
  for(let i = 0; i < circles.length; i++){
    circles[i].display()
  }

  noFill()
  mouseRect.display()

  let inArea = quadTree.getObjects(mouseRect)
  for(let i = 0; i < inArea.length; i++){
    inArea[i].col = color(255)
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight)
  quadTree.resize(new Rectangle(0, 0, width, height))
  populateQuadTree()
}
