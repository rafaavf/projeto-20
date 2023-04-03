const Engine = Matter.Engine;
const World = Matter.World;
const Bodies = Matter.Bodies;
const Constraint = Matter.Constraint;
const Body = Matter.Body;

var engine, world, backgroundImg;
var canvas, tower, ground, cannon;
var angle = 20;
var cannonBall;
var balls = [];
var boats = [];
var boatAnimation = [];
var boatSpriteData, boatSpriteSheet;
var brokenBoatAnimation = [];
var brokeBoatSpriteSheet, brokenBoatSpriteData;
var ballAnimation = [];
var ballSpriteSheet, ballSpriteData;

var waterSound, backgroundSound, pirateSound, cannonSound;
var score = 0;

var isGameOver = false;
var isLaughing = false;

function preload() {
  backgroundImg = loadImage("./assets/background.gif");
  towerImage = loadImage("./assets/tower.png");
  boatSpriteData= loadJSON ("./assets/boat/boat.json");
  boatSpriteSheet = loadImage ("./assets/boat/boat.png");
  brokenBoatSpriteData = loadJSON ("./assets/boat/broken_boat.json");
  brokenBoatSpriteSheet = loadImage ("./assets/boat/broken_boat.png");
  ballSpriteData = loadJSON ("./assets/water_splash/water_splash.json");
  ballSpriteSheet = loadImage ("./assets/water_splash/water_splash.png");
  waterSound = loadSound ("./assets/cannon_water.mp3");
  backgroundSound = loadSound ("./assets/background_music.mp3");
  pirateSound = loadSound ("./assets/pirate_laugh.mp3");
  cannonSound = loadSound ("./assets/cannon_explosion.mp3");
}

function setup() {

  canvas = createCanvas(1200, 600);
  engine = Engine.create();
  world = engine.world;

  var options = {
    isStatic: true
  }

  ground = Bodies.rectangle(0, height - 1, width * 2, 1, options);
  World.add(world, ground);

  tower = Bodies.rectangle(160, 350, 160, 310, options);
  World.add(world, tower);

  angleMode(DEGREES);
  angle = 15;
  cannon = new Cannon(180, 110, 130, 100, angle);
  boat = new Boat(width - 79, height - 60, 170, 170, -80);

  var boatFrames = boatSpriteData.frames;
  for (let i = 0; i < boatFrames.length; i++) {
      var pos = boatFrames [i].position;
      var img = boatSpriteSheet.get(pos.x,pos.y,pos.w,pos.h);
      boatAnimation.push(img);
  }

  var brokenBoatFrames = brokenBoatSpriteData.frames;
  for (let i = 0; i < brokenBoatFrames.length; i++) {
    var pos = brokenBoatFrames [i].position;
    var img = brokenBoatSpriteSheet.get(pos.x, pos.y, pos.w, pos.h);
    brokenBoatAnimation.push(img);
  }

  var ballFrames = ballSpriteData.frames;
  for (let i = 0; i < ballFrames.length; i++) {
    var pos = ballFrames [i].position;
    var img = ballSpriteSheet.get(pos.x, pos.y, pos.w, pos.h);
    ballAnimation.push(img);
  }
}

function draw() {

  image(backgroundImg, 0, 0, width, height);

  if (!backgroundSound.isPlaying()){
    backgroundSound.play();
    backgroundSound.setVolume(0.4);
  }

  Engine.update(engine);
  rect(ground.position.x, ground.position.y, width * 2, 1);

  push();
  imageMode(CENTER);
  image(towerImage, tower.position.x, tower.position.y, 160, 310);
  pop();

  fill ("black");
  textSize(40);
  textAlign(CENTER,CENTER);
  text(`Pontuação: ${score}`, width - 300, 50);

  cannon.display();
  showBoats();


  for (var i = 0; i < balls.length; i++) {
    showCannonBalls(balls[i], i)
    collisionBoat(i);
  }
}

function keyReleased() {
  if (keyCode == DOWN_ARROW) {
    cannonSound.play();
    cannonSound.setVolume(0.1);
    balls[balls.length - 1].shoot();
  }
}

function keyPressed() {
  if (keyCode == DOWN_ARROW) {
    var cannonBall = new CannonBall(cannon.x, cannon.y);
    balls.push(cannonBall);

  }
}

function showCannonBalls(ball, index) {
  if (ball) {
    ball.display();
    ball.animate()
    if (ball.body.position.x >= width ||
      ball.body.position.y >= height - 50) {
       if (!waterSound.isPlaying()) {
        waterSound.play();
        waterSound.setVolume(0.3);
       }
      ball.remove(index);
    }

  }

}
function showBoats() {
  if (boats.length > 0) {
    if (boats[boats.length - 1] === undefined ||
      boats[boats.length - 1].body.position.x < width - 300) {
      var positions = [-40, -60, -70, -20];
      var position = random(positions);
      var boat = new Boat(width - 79, height - 60, 170, 170, position, boatAnimation);
      boats.push(boat);
    }
    for (var i = 0; i < boats.length; i++) {
      if (boats[i]) {
        Matter.Body.setVelocity(boats[i].body, { x: -0.9, y: 0 });
        boats[i].display();
        boats[i].animate();
        var collision = Matter.SAT.collides(this.tower,boats[i].body);
        if (collision.collided && !boats[i].isBroken) {
          if (!isLaughing && !pirateSound.isPlaying()) {
            pirateSound.play();
            isLaughing = true;
          }
          isGameOver = true;
          gameOver();
        }
      }

    }
  } else {
    var boat = new Boat(width - 79, height - 60, 170, 170, -80,boatAnimation);
    boats.push(boat);
  }
}

function collisionBoat(index) {
  for (let i = 0; i < boats.length; i++) {
    if (balls[index] !== undefined && boats[i] !== undefined) {
      var collision = Matter.SAT.collides(balls[index].body, boats[i].body);
      if (collision.collided) {
        score += 1;
        boats[i].remove(i);

        Matter.World.remove(world, balls[index].body);
        delete balls[index];
      }
    }
  }
}

function gameOver () {
  swal ({
    title : "Fim de jogo!",
    text : "Obrigada por jogar", 
    imageUrl : "https://raw.githubusercontent.com/whitehatjr/PiratesInvasion/main/assets/boat.png",
    imageSize : "150x150",
    confirmButtonText : "Jogar novamente",
  },
  function (isConfirm) {
if (isConfirm){
  location.reload();
}
  })
}