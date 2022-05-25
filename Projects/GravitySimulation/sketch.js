
class Planet {
  constructor(x, y, hsp, vsp, r) {
    this.pos = createVector(x, y);
    this.vel = createVector(hsp, vsp);
    this.acc = createVector(0, 0);
    this.r = r;
    this.m =  pow(r, 2);
  }

  applyGravity(other){
    var norm = other.pos.copy().sub(this.pos).normalize();
    var dist = this.pos.dist(other.pos);
    var force = 2*this.m*other.m / pow(dist, 2);
    this.applyForce(norm.mult(force));
  }
  applyForce(force){
    this.acc.add(force.mult(1/this.m));
  }

  update(){
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.acc = createVector(0);
  }

  display(){
    fill(100);
    stroke(0);
    strokeWeight(5);
    ellipse(this.pos.x, this.pos.y, this.r*2, this.r*2);
  }
}


let planets = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  planets.push(new Planet(140, 100, 4, 0, 20));
  planets.push(new Planet(200, 300, -0.9, 0, 40));
}

function draw() {
  background(20);

  for(let planet of planets){
    for(let other of planets){
      if(other == planet){ continue; }
      planet.applyGravity(other);
    }
    planet.update();
    planet.display();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
