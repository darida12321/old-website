
class VerletObject {
  constructor(x, y){
    this.x = x;
    this.y = y;
    this.px = this.x;
    this.py = this.y;
    this.ax = 0;
    this.ay = 0;
    this.r = 20
  }

  applyAcc(ax, ay){
    this.ax += ax;
    this.ay += ay;
  }

  update(dt){
    this.vx = this.x - this.px
    this.vy = this.y - this.py
    this.px = this.x;
    this.py = this.y;
    this.x += this.vx + this.ax*sq(dt)
    this.y += this.vy + this.ay*sq(dt)
    this.ax = 0
    this.ay = 0
  }
  
  display(){
    ellipse(this.x, this.y, this.r*2, this.r*2)
  }
}


class PhysicsEngine {
  constructor(){
    this.verlets = []
  }

  addVerlet(obj){
    append(this.verlets, obj)
  }

  applyGravity(g){
    for(let i = 0; i < this.verlets.length; i++){
      this.verlets[i].applyAcc(0, g)
    }
  }

  applySquareConstraint(){
    for(let i = 0; i < this.verlets.length; i++){
      let ver = this.verlets[i]
      if(ver.x < ver.r){ ver.x = ver.r }
      if(ver.y < ver.r){ ver.y = ver.r }
      if(width - ver.r < ver.x){ ver.x = width - ver.r }
      if(height - ver.r < ver.y){ ver.y = height - ver.r }
    }
  }

  collide(){
    for(let i = 0; i < this.verlets.length; i++){
      for(let j = i+1; j < this.verlets.length; j++){
        let ver1 = this.verlets[i]
        let ver2 = this.verlets[j]
        let distSq = sq(ver1.x-ver2.x) + sq(ver1.y-ver2.y)
        if(distSq < sq(ver1.r + ver2.r)){
          let diff = sqrt(distSq) - (ver1.r + ver2.r)
          let nx = (ver2.x - ver1.x) / sqrt(distSq)
          let ny = (ver2.y - ver1.y) / sqrt(distSq)
          ver1.x += diff/2 * nx;
          ver1.y += diff/2 * ny;
          ver2.x -= diff/2 * nx;
          ver2.y -= diff/2 * ny;
        }
      }
    }
  }

  update(dt){
    for(let i = 0; i < this.verlets.length; i++){
      this.verlets[i].update(dt)
    }
  }

  display(){
    for(let i = 0; i < this.verlets.length; i++){
      this.verlets[i].display()
    }
  }
}

let engine
function setup() {
  createCanvas(windowWidth, windowHeight);
  frameRate(30);
  engine = new PhysicsEngine()
  engine.addVerlet(new VerletObject(100, 500))
  engine.addVerlet(new VerletObject(140, 580))
}

function draw() {
  background(0)
  let dt = 1/60;
  let steps = 4;
  for(let i = 0; i < steps; i++){
    engine.applyGravity(6000)
    engine.update(dt/steps)
    engine.collide()
    engine.applySquareConstraint()
  }
  engine.display()
  console.log(frameRate())
}

function mouseDragged() {
  engine.addVerlet(new VerletObject(mouseX, mouseY))
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
