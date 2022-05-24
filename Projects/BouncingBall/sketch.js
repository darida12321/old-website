
var w = window.innerWidth;
var h = window.innerHeight;

function setup() {
  createCanvas(windowWidth, windowHeight);
  lastTime = millis();
}

let x = 100;
let y = 100;
let hsp = 500;
let vsp = 300;
let r = 50;
let lastTime;

function draw() {
  background(255,255,128);

  fill(255, 0, 0);
  stroke(0);
  strokeWeight(5);
  ellipse(x, y, 2*r, 2*r);

  x += hsp * deltaTime/1000;
  y += vsp * deltaTime/1000;
  if(x < r){ x = r; hsp = abs(hsp); }
  if(y < r){ y = r; vsp = abs(vsp); }
  if(width - r < x){ x = width - r; hsp = -abs(hsp); }
  if(height - r < y){ y = height - r; vsp = -abs(vsp); }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
