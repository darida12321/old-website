
function setup() {
  createCanvas(windowWidth, windowHeight);
  frameRate(60);
}

function draw() {
  line(0, 0, width, height)
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
