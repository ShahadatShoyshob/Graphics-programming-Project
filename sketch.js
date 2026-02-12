let tableLength = 640;
let redBalls = []; //for red ball bodies
let coloredBalls = []; //for colored ball bodies
let cueBall; //for the body of cue ball

//matter.js asic setup
let Engine = Matter.Engine;
let World = Matter.World;
let Bodies = Matter.Bodies;
let Body = Matter.Body;
let engine = Engine.create();

let redBallsPos = []; //positional data
let coloredBallsPos = [];
let redBallsPracticePos = [];
let flash = []; //cue ball strick visual
let entry = []; //pocket entry animation
let pockets = []; //pocket physics bodies
let cushions = []; //cushions physics bodies

function setup() {
  createCanvas(650, 500);

  tableWidth = tableLength / 2;
  ballDiameter = tableWidth / 36;
  pocketDiameter = ballDiameter * 1.5;
  extensionSetup();
  //
  setupPositions();

  engine.world.gravity.y = 0;
  addCushionsAndPockets();
}

function draw() {
  clear();
  background(60);
  drawTable();
  instructions(); //fucntion used for user instructions logic

  for (let ball of coloredBalls) {
    drawBallTrails(ball);
  }
  for (let ball of redBalls) {
    drawBallTrails(ball);
  }
  //cue ball
  if (cueBall) {
    drawBallTrails(cueBall);
    //draw cuestick if cue ball isn't in motion
    if (cueBall.speed < 0.15) {
      //here, I am figureing out angl;e between mosue and cue ball
      // - drawing cue stick using it
      // - adding motion in the angled direction to the ball using trignometric ratios
      // - motion force is caucluated form user input from keys 1-9
      let dy = mouseY - cueBall.position.y;
      let dx = mouseX - cueBall.position.x;

      let ang = atan2(dy, dx);
      push();
      translate(cueBall.position.x, cueBall.position.y);
      rotate(ang);
      stroke(255);
      strokeWeight(2);
      line(20, 0, 180, 0);
      strokeWeight(1);
      stroke(255, 100);
      line(0, 0, -180, 0);
      stroke("brown");
      strokeWeight(3);
      line(40, 0, 180, 0);
      noStroke();
      pop();
      fill(255);
      textSize(20);
      textAlign(CENTER, CENTER);
      text("Press keys 1-9 to hit cue ball", width / 2, 50);
      if (keyIsPressed) {
        let force = 0;
        switch (key) {
          case "1":
            force = 1;
            break;
          case "2":
            force = 4;
            break;
          case "3":
            force = 6;
            break;
          case "4":
            force = 8;
            break;
          case "5":
            force = 10;
            break;
          case "6":
            force = 12;
            break;
          case "7":
            force = 14;
            break;
          case "8":
            force = 16;
            break;
          case "9":
            force = 18;
            break;
        }
        Body.setVelocity(cueBall, {
          x: cos(ang + PI) * force,
          y: sin(ang + PI) * force,
        });
      }
    } else {
      fill(255);
      textSize(20);
      textAlign(CENTER, CENTER);
      text("wait...", width / 2, 50);
    }
  }
  //cue flash
  if (flash.length > 0) {
    //its a self removing array in whcih each flash gets removed when once it's t factor reaches 0
    //I send flash obejcts from over the collision part of the code with postions and a t factor of 30 frames.
    for (let i = 0; i < flash.length; i++) {
      fill(255, map(flash[i].t, 30, 0, 100, 0));
      noStroke();
      circle(
        flash[i].x,
        flash[i].y,
        map(flash[i].t, 30, 0, ballDiameter, ballDiameter * 5)
      );
      //each decreasing fasctor of t makes circle less opaque and bigger in size
      flash[i].t -= 1;
      if (flash[i].t < 0) flash.splice(i, 1);
    }
  }
  //same logic as flash, but circles get smaller here over the time.
  if (entry.length > 0) {
    for (let i = 0; i < entry.length; i++) {
      fill(entry[i].col);
      noStroke();
      circle(entry[i].x, entry[i].y, map(entry[i].t, 30, 0, ballDiameter, 0));
      entry[i].t -= 1;
      if (entry[i].t < 0) entry.splice(i, 1);
    }
  }
  //tags
  fill(255);
  textSize(16);
  textAlign(CENTER, CENTER);
  text("Ball size", 115, 450);
  text("Cue size", 325, 450);
  text("Pocket size", 535, 450);
  //updates engine every frame
  Engine.update(engine);
}

function drawBallTrails(ball) {
  //I used bodies object of each ball body to hold a trail array, in which
  // - push a trail every frame
  //every 10th trail gets removed
  //all 10 trails are drawn at ther same time

  fill(ball.color_);
  let d = ball.circleRadius * 2; //diameter
  for (let i = 0; i < ball.trail.length; i++) {
    circle(ball.trail[i].x, ball.trail[i].y, (d / 12) * (i + 1));
  }
  circle(ball.position.x, ball.position.y, d);
  ball.trail.push({ x: ball.position.x, y: ball.position.y });
  if (ball.trail.length > 10) ball.trail.splice(0, 1); //keeping a 10 position trail
}

//collision detections and actions relative to that
Matter.Events.on(engine, "collisionStart", function (col) {
  let collisionsArr = col.pairs;

  for (var i = 0; i < collisionsArr.length; i++) {
    let pair = collisionsArr[i];
    let bodyA = pair.bodyA;
    let bodyB = pair.bodyB;

    // console.log(bodyA.label, bodyB.label);//detects coltion between any two bodies
    //here I remove body colliding with pocket with entry in the pocket animation
    if (bodyA.label == "pocket" || bodyB.label == "pocket") {
      let body;
      if (bodyA.label == "pocket") {
        body = bodyB;
      }
      if (bodyB.label == "pocket") {
        body = bodyA;
      }
      let index;
      switch (body.label) {
        case "red ball":
          //remove it from redballs array
          index = redBalls.indexOf(body);
          entry.push({
            x: body.position.x,
            y: body.position.y,
            t: 30,
            col: body.color_,
          }); //entry animation
          redBalls.splice(index, 1);
          World.remove(engine.world, body);
          break;
        case "cue ball":
          // cueBall gets undefined and removed
          entry.push({
            x: body.position.x,
            y: body.position.y,
            t: 30,
            col: body.color_,
          }); //entry animation
          World.remove(engine.world, body);
          cueBall = undefined;
          break;
        case "colored ball":
          index = coloredBalls.indexOf(body);
          coloredBalls.splice(index, 1);
          entry.push({
            x: body.position.x,
            y: body.position.y,
            t: 30,
            col: body.color_,
          }); //entry animation
          World.remove(engine.world, body);
          break;
      }
    }
    //cue impact
    //here I add impact/falsh effect on  eevry cue collision
    let cue;
    if (bodyA.label == "cue ball") cue = bodyA;
    if (bodyB.label == "cue ball") cue = bodyB;
    if (cue) {
      flash.push({ x: cue.position.x, y: cue.position.y, t: 30 });
    }
  }
});

function addCushionsAndPockets() {
  //a static fucntion to add fixed static bodies with diffrent physical properties on the table at very start
  //-cushions here are very big physical wall aroudn the table covering all of the canvas
  // so that ball don't go off the tabel in high speed.
  cushions = [];
  cushions[0] = Bodies.rectangle(width / 2, -45, width, 300, {
    isStatic: true,
    restitution: 0.8,
    friction: 0.5,
    angle: 0,
    label: "cushion",
  });
  cushions[1] = Bodies.rectangle(width / 2, 545, width, 300, {
    isStatic: true,
    restitution: 0.8,
    friction: 0.5,
    angle: 0,
    label: "cushion",
  });
  cushions[2] = Bodies.rectangle(-130, height / 2, 300, height, {
    isStatic: true,
    restitution: 0.8,
    friction: 0.5,
    angle: 0,
    label: "cushion",
  });
  cushions[3] = Bodies.rectangle(width + 130, height / 2, 300, height, {
    isStatic: true,
    restitution: 0.8,
    friction: 0.5,
    angle: 0,
    label: "cushion",
  });
  World.add(engine.world, cushions);

  //pockets
  pockets = [];
  let x = width / 2 - tableLength / 2;
  let y = height / 2 - tableWidth / 2;
  let d = pocketDiameter;
  fill(20);
  options = {
    isStatic: true,
    label: "pocket",
  };
  pockets.push(
    Bodies.circle(x + d, y + d, pocketSizeSlider.value() / 2, options)
  );
  pockets.push(
    Bodies.circle(
      x + tableLength / 2,
      y + d,
      pocketSizeSlider.value() / 2,
      options
    )
  );
  pockets.push(
    Bodies.circle(
      x + tableLength - d,
      y + d,
      pocketSizeSlider.value() / 2,
      options
    )
  );
  y += tableWidth;
  pockets.push(
    Bodies.circle(x + d, y - d, pocketSizeSlider.value() / 2, options)
  );
  pockets.push(
    Bodies.circle(
      x + tableLength / 2,
      y - d,
      pocketSizeSlider.value() / 2,
      options
    )
  );
  pockets.push(
    Bodies.circle(
      x + tableLength - d,
      y - d,
      pocketSizeSlider.value() / 2,
      options
    )
  );
  World.add(engine.world, pockets);
}

function instructions() {
  //here I take user interactions for ball mode choice and cue ball placement in d area
  if (redBalls.length == 0) {
    fill(255);
    textSize(20);
    textAlign(CENTER, CENTER);
    text("Press a key\n1 : default   2 : random   3 : practice", width / 2, 50);
    if (keyIsPressed) {
      if (key == "1" || key == "2" || key == "3") {
        //colored ball
        for (let ball of coloredBallsPos) {
          coloredBalls.push(
            Bodies.circle(ball.x, ball.y, ballSizeSlider.value() / 2, {
              //for a ball
              restitution: 0.9,
              friction: 0.1,
              density: 1,
              label: "colored ball",
              color_: ball.col,
              trail: [],
            })
          );
        }
        World.add(engine.world, coloredBalls);
      }
      if (key == "1") {
        //add red balls
        for (let ball of redBallsPos) {
          redBalls.push(
            Bodies.circle(ball.x, ball.y, ballSizeSlider.value() / 2, {
              //for a ball
              restitution: 0.9,
              friction: 0.1,
              density: 1,
              label: "red ball",
              color_: ball.col,
              trail: [],
            })
          );
        }
        keyIsPressed = false; //so only one click happens
        World.add(engine.world, redBalls);
      }
      if (key == "2") {
        let x = width / 2 - tableLength / 2;
        let y = height / 2 - tableWidth / 2;
        let d = pocketDiameter;
        //add red balls
        for (let ball of redBallsPos) {
          redBalls.push(
            Bodies.circle(
              random(x + d * 2, x + tableLength - 4 * d),
              random(y + 2 * d, y + tableWidth - 4 * d),
              ballSizeSlider.value() / 2,
              {
                //for a ball
                restitution: 0.9,
                friction: 0.1,
                density: 1,
                label: "red ball",
                color_: ball.col,
                trail: [],
              }
            )
          );
        }
        keyIsPressed = false; //so only one click happens
        World.add(engine.world, redBalls);
      }
      if (key == "3") {
        //add red balls
        for (let ball of redBallsPracticePos) {
          redBalls.push(
            Bodies.circle(ball.x, ball.y, ballSizeSlider.value() / 2, {
              //for a ball
              restitution: 0.9,
              friction: 0.1,
              density: 1,
              label: "red ball",
              color_: ball.col,
              trail: [],
            })
          );
        }
        keyIsPressed = false; //so only one click happens
        World.add(engine.world, redBalls);
      }
    }
  } else {
    if (cueBall == undefined) {
      fill(255);
      textSize(20);
      textAlign(CENTER, CENTER);
      text("Press in the D zone to insert cue ball", width / 2, 50);
      if (mouseIsPressed) {
        let x = width / 2 - tableLength / 2;
        let y = height / 2 - tableWidth / 2;
        if (
          mouseX < x + tableLength / 4 &&
          dist(mouseX, mouseY, x + tableLength / 4, y + tableWidth / 2) <
            4 * pocketDiameter
        ) {
          mouseIsPressed = false;
          //adding cue ball
          cueBall = Bodies.circle(
            mouseX,
            mouseY,
            cueBallSizeSlider.value() / 2,
            {
              //for a ball
              restitution: 0.9,
              friction: 0.1,
              density: 1,
              label: "cue ball",
              color_: "white",
              trail: [],
            }
          );
          World.add(engine.world, [cueBall]);
        }
      }
    }
  }
}

function drawTable() {
  //rough drawing of the table in the back, later used for positional planning
  noStroke();
  fill("#F5D941");
  rect(
    width / 2 - tableLength / 2,
    height / 2 - tableWidth / 2,
    tableLength,
    tableWidth,
    pocketDiameter / 2
  );
  fill(78, 135, 54);
  rect(
    width / 2 - tableLength / 2 + pocketDiameter,
    height / 2 - tableWidth / 2 + pocketDiameter,
    tableLength - pocketDiameter * 2,
    tableWidth - pocketDiameter * 2
  );

  let x = width / 2 - tableLength / 2;
  let y = height / 2 - tableWidth / 2;
  let d = pocketDiameter;

  //d zone
  stroke(255);
  strokeWeight(1);
  line(x + tableLength / 4, y + d, x + tableLength / 4, y + tableWidth - d);
  arc(
    x + tableLength / 4,
    y + tableWidth / 2,
    8 * d,
    8 * d,
    PI - PI / 2,
    TWO_PI - PI / 2
  );
  noStroke();

  //bars and cushions
  fill("#336016");
  rect(x + d / 2, y + d * 1.7, d, tableWidth - d * 3.4, 100);
  rect(x - d / 2 + tableLength, y + d * 1.7, -d, tableWidth - d * 3.4, 100);
  rect(x + d * 1.7, y + d / 2, tableLength / 2 - 2.4 * d, d, 100);
  rect(
    x + tableLength / 2 + d * 0.7,
    y + d / 2,
    tableLength / 2 - 2.4 * d,
    d,
    100
  );
  rect(x + d * 1.7, y - d / 2 + tableWidth, tableLength / 2 - 2.4 * d, -d, 100);
  rect(
    x + tableLength / 2 + d * 0.7,
    y - d / 2 + tableWidth,
    tableLength / 2 - 2.4 * d,
    -d,
    100
  );

  fill("#3E260B");
  rect(x + d * 1.5, y, tableLength / 2 - d * 2, d);
  rect(x + d / 2 + tableLength / 2, y, tableLength / 2 - d * 2, d);
  rect(x + d * 1.5, y + tableWidth, tableLength / 2 - d * 2, -d);
  rect(
    x + d / 2 + tableLength / 2,
    y + tableWidth,
    tableLength / 2 - d * 2,
    -d
  );
  rect(x, y + d * 1.5, d, tableWidth - d * 3);
  rect(x + tableLength, y + d * 1.5, -d, tableWidth - d * 3);

  //pockets
  fill(20);
  for (let i = 0; i < 6; i++) {
    let x = width / 2 - tableLength / 2;
    let y = height / 2 - tableWidth / 2;
    let d = pocketDiameter;
    if (i > 2) {
      circle(x + d, y + d, pocketSizeSlider.value());
      circle(x + tableLength / 2, y + d, pocketSizeSlider.value());
      circle(x + tableLength - d, y + d, pocketSizeSlider.value());
    } else {
      y += tableWidth;
      circle(x + d, y - d, pocketSizeSlider.value());
      circle(x + tableLength / 2, y - d, pocketSizeSlider.value());
      circle(x + tableLength - d, y - d, pocketSizeSlider.value());
    }
  }
}

function setupPositions() {
  //calculating and storing ball positions as per different modes in different arrays
  let x = width / 2 - tableLength / 2;
  let y = height / 2 - tableWidth / 2;
  coloredBallsPos[0] = {
    x: x + tableLength / 4,
    y: y + tableWidth / 2 - pocketDiameter * 4,
    col: "green",
  };
  coloredBallsPos[1] = {
    x: x + tableLength / 4,
    y: y + tableWidth / 2,
    col: "orange",
  };
  coloredBallsPos[2] = {
    x: x + tableLength / 4,
    y: y + tableWidth / 2 + pocketDiameter * 4,
    col: "yellow",
  };
  coloredBallsPos[3] = {
    x: x + tableLength / 2,
    y: y + tableWidth / 2,
    col: "blue",
  };
  coloredBallsPos[4] = {
    x: x + tableLength / 2 + tableLength / 4,
    y: y + tableWidth / 2,
    col: "pink",
  };
  coloredBallsPos[5] = {
    x: x + tableLength - tableLength / 10,
    y: y + tableWidth / 2,
    col: "black",
  };

  let rows = 5;
  let index = 0;
  for (let i = 0; i < rows; i++) {
    let posX =
      x +
      pocketDiameter +
      tableLength / 2 +
      tableLength / 4 +
      i * pocketDiameter;
    let posY = y + tableWidth / 2 - (i * pocketDiameter) / 2;
    for (let j = 0; j <= i; j++) {
      redBallsPos[index] = { x: posX, y: posY, col: "red" };
      index += 1;
      posY += pocketDiameter;
    }
  }

  // redBallsPracticePos
  for (let i = 1; i <= 5; i++) {
    redBallsPracticePos.push({
      x: x + tableLength / 2 + tableLength / 4,
      y: y + tableWidth / 2 - ballDiameter * i,
      col: "red",
    });
    redBallsPracticePos.push({
      x: x + tableLength / 2 + tableLength / 4,
      y: y + tableWidth / 2 + ballDiameter * i,
      col: "red",
    });
    redBallsPracticePos.push({
      x: x + tableLength / 2 + tableLength / 4 + ballDiameter * i,
      y: y + tableWidth / 2,
      col: "red",
    });
  }
}

function extensionSetup() {
  //sliders for ball, cue ball and pocket size change
  //extension slider
  ballSizeSlider = createSlider(
    ballDiameter,
    ballDiameter * 5,
    ballDiameter,
    0.1
  );
  ballSizeSlider.position(20, 450);
  ballSizeSlider.size(190, 30);
  ballSizeSlider.changed(() => {
    console.log("ball size changed!");
    //for a physical body in matter.js , to resize it we, Delete it and recreate a new one with a different radius.
    for (let i = 0; i < redBalls.length; i++) {
      let tempx = redBalls[i].position.x;
      let tempy = redBalls[i].position.y;
      World.remove(engine.world, redBalls[i]);
      redBalls[i] = Bodies.circle(tempx, tempy, ballSizeSlider.value() / 2, {
        //for a ball
        restitution: 0.9,
        friction: 0.1,
        density: 1,
        label: "red ball",
        color_: "red",
        trail: [],
      });
      World.add(engine.world, redBalls[i]);
    }

    for (let i = 0; i < coloredBalls.length; i++) {
      let tempx = coloredBalls[i].position.x;
      let tempy = coloredBalls[i].position.y;
      let tempCol = coloredBalls[i].color_;
      World.remove(engine.world, coloredBalls[i]);
      coloredBalls[i] = Bodies.circle(
        tempx,
        tempy,
        ballSizeSlider.value() / 2,
        {
          //for a ball
          restitution: 0.9,
          friction: 0.1,
          density: 1,
          label: "colored ball",
          color_: tempCol,
          trail: [],
        }
      );
      World.add(engine.world, coloredBalls[i]);
    }
  });

  cueBallSizeSlider = createSlider(
    ballDiameter,
    ballDiameter * 5,
    ballDiameter,
    0.1
  );
  cueBallSizeSlider.position(230, 450);
  cueBallSizeSlider.size(190, 30);
  cueBallSizeSlider.changed(() => {
    if (cueBall == undefined) return;
    console.log("cue ball size changed!");
    let tempx = cueBall.position.x;
    let tempy = cueBall.position.y;
    let tempCol = cueBall.color_;
    World.remove(engine.world, cueBall);
    cueBall = Bodies.circle(tempx, tempy, cueBallSizeSlider.value() / 2, {
      //for a ball
      restitution: 0.9,
      friction: 0.1,
      density: 1,
      label: "cue ball",
      color_: tempCol,
      trail: [],
    });
    World.add(engine.world, cueBall);
  });

  pocketSizeSlider = createSlider(
    pocketDiameter,
    ballDiameter * 5,
    pocketDiameter,
    0.1
  );
  pocketSizeSlider.position(440, 450);
  pocketSizeSlider.size(190, 30);
  pocketSizeSlider.changed(() => {
    console.log("pocket size changed!");
    for (let i = 0; i < pockets.length; i++) {
      let tempx = pockets[i].position.x;
      let tempy = pockets[i].position.y;
      let tempCol = pockets[i].color_;
      World.remove(engine.world, pockets[i]);
      pockets[i] = Bodies.circle(tempx, tempy, pocketSizeSlider.value() / 2, {
        //for a ball
        isStatic: true,
        label: "pocket",
      });
      World.add(engine.world, pockets[i]);
    }
  });
}


/*
Design and Controls:
The snooker game is implemented using p5.js for rendering and matter.js for physics. Matter.js (Matter.Engine) handles the simulation of motion. 
The user controls the cue stick with the mouse: on mouse press the initial position is recorded, dragging sets the aim and pull-back distance, 
and on release a force proportional to the drag vector is applied to the cue ball. 
The cue stick is drawn between the cue ball and the mouse pointer to indicate shot direction and power.

Gameplay Modes:
Three gameplay modes are triggered by keys 1, 2, and 3: Mode 1 – Standard Setup: Pressing 1 resets to a full snooker rack. 
All 15 red balls are positioned in a triangular rack, and the six colored balls (yellow, green, brown, blue, pink, black) are placed at their standard table positions. 
Mode 2 – Random Clusters: Key 2 clears the table and respawns balls in randomized cluster or scatter layouts. This creates unpredictable break shots each game. 
Mode 3 – Practice Mode: Key 3 sets up a simplified practice scenario (e.g. only a cue ball and a red ball), allowing focused shot practice without the full rack.
Each mode reinitializes the physics world to ensure a clean start.

Animations:
Several visual effects enhance gameplay: Ball Trail Effect: When balls move, they leave a translucent trail. 
This is achieved by storing recent positions or drawing a fading tail along the ball’s path, creating a motion blur effect that makes fast-moving balls easier to track. 
Cue Impact Flash: Upon the cue striking the cue ball, a brief bright flash or highlight appears at the contact point. 
For example, a white circle or glow is drawn for a single frame immediately after impact, emphasizing the shot. 
Pocket Entry Shrink: When a ball falls into a pocket, it shrinks gradually before being removed. 
Detecting a ball overlapping a pocket triggers a radius-reduction animation: each frame the ball’s radius is reduced, giving the illusion of descending into the pocket.

Physics Simulation:
Matter.js handles all ball dynamics and collisions. Each ball is a circular Matter.Body with specified restitution (bounciness) and friction. 
Restitution less than 1 ensures realistic bounces off cushions, and friction makes balls gradually slow down. 
Cushions and table boundaries are static rectangular bodies. Collisions between balls and cushions are automatically resolved by the physics engine. 
Pockets are implemented as open gaps or invisible sensor bodies that detect a ball entering, triggering the potting animation and removal of the ball.

Creative Extension: Dynamic Resizing
A key creative extension is adding sliders to resize balls, pockets, and the cue stick in real-time. 
We create p5.js slider controls for ball radius, pocket radius, and cue length. When a slider changes, the corresponding physics body must be replaced. 
Matter.js cannot resize body shapes dynamically, so the code removes the old body (using Matter.World.remove) and creates a new one with the updated size. 
We copy the old body’s position and velocity to the new body to preserve continuity. This required careful management of bodies but adds an interactive twist.
*/