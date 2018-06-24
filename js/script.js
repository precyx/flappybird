
// -------------------------------------------------
// @Index
// FlappyBird
// Pipe
// Pipe Pair
// PipeManager
// MoneyText
// MoneyTextManager
// BorderLimit
// CollisionManager
// Gravitation
// FlyingForce
// Score Board
// UIButton
// Game UI
// Renderer
// Game
// UserInput
// Main Controller
// -------------------------------------------------



// -------------------------------------------------
// @FlappyBird
// -------------------------------------------------
var APP = (function(APP){
  function FlappyBird(){
    this.position;
    this.velocity = new APP.Vector(0,0);
    this.acceleration = new APP.Vector(0,0);
    //
    this.rotation_acceleration = 0.2;
    this.rotation_velocity = 1.5;
    this.rotation_velocity_base = this.rotation_velocity;
    this.rotation = 0;
    //
    this.width = 406*0.12-10;
    this.height = 287*0.12-5;

    this.init = function(){
      this.position = new APP.Vector(APP.W/2.5 -10, APP.H /2-100);
      this.fly();
    }

    this.applyForce = function(v){
      this.acceleration.add(v);
    }

    this.update = function(){
      this.velocity.add(this.acceleration);
      this.position.add(this.velocity);
      this.acceleration.mult(0);
      //
      if(this.velocity.y < 3) {
        this.rotation -= 20;
        this.rotation_velocity = this.rotation_velocity_base;
      }
      else {
        this.rotation += this.rotation_velocity;
        this.rotation_velocity += this.rotation_acceleration;
      }
      this.rotation = APP.Math2.constraint(this.rotation, -30, 90);
    }

    this.draw = function(){
      var context = APP.Canvas.context;
      var birdImage = document.getElementById("bird_img");
      var scale = 0.11;
      var x = this.position.x;
      var y = this.position.y;
      var rotationPoint = {
        x : x + birdImage.width*scale /2,
        y : y + birdImage.height*scale /2
      };
      //
      context.beginPath();
      context.fillStyle = "#000000";
      context.rect(this.position.x, this.position.y, this.width, this.height);
      context.closePath();
      //context.fill();
      //

      //
      APP.Canvas.rotate(rotationPoint, this.rotation, function(){

        context.drawImage(birdImage, x-10, y-5, birdImage.width*scale, birdImage.height*scale);
        context.closePath();
      });
      //

    }

    this.mousedown = function(){
      if(APP.Game.state == "bird_flying") this.fly();
      //if(APP.Game.state == "bird_grounded") APP.Game.restart();
    }

    this.fly = function(){
     this.velocity.y  -= this.velocity.y +8.1
    }
  }
  APP.FlappyBird = new FlappyBird();
  return APP;
})(APP || {});







// -------------------------------------------------
// @Pipe
// -------------------------------------------------
var APP = (function(APP){
  function Pipe(){
    this.position;
    this.width;
    this.height;
  }
  Pipe.prototype.update = function(){
    this.position.x -= APP.PipeManager.pipeVelocity;
  }
  Pipe.prototype.draw = function(pipeType){
    var context = APP.Canvas.context;
    var pipe_base_img = document.getElementById("pipe_base_img");
    var pat = context.createPattern(pipe_base_img, "repeat");
    context.fillStyle = pat;
    context.save();
    context.translate(this.position.x, this.position.y);
    context.fillRect(0, 0, this.width, this.height);
    context.restore();

    var pipe_head_img = document.getElementById("pipe_head_img");
    if(pipeType == "pipe_top") pipe_head_img = document.getElementById("pipe_head_top_img");
    var w = pipe_head_img.width;
    var h = pipe_head_img.height;
    var x = this.position.x-w/2 +66/2;
    var y = this.position.y +0;
    if(pipeType == "pipe_top") y = this.height-23;
    context.drawImage(pipe_head_img, x, y, w, h);

    /*context.beginPath();
    context.fillStyle = "#fbfbfb";
    context.lineWidth = 3;
    context.rect(this.position.x, this.position.y, this.width, this.height);
    context.fill();
    context.stroke();
    context.closePath();*/
  }
  APP.Pipe = Pipe;
  return APP;
})(APP || {});



// -------------------------------------------------
// @Pipe Pair
// -------------------------------------------------
var APP = (function(APP){
  function PipePair(pipe1, pipe2){
    this.pipe1 = pipe1;
    this.pipe2 = pipe2;
  }
  PipePair.prototype.update = function(){
    this.pipe1.update();
    this.pipe2.update();
    if(this.pipe1.position.x < -100) APP.PipeManager.removePipe(this);
  }
  PipePair.prototype.draw = function(){
    this.pipe1.draw("pipe_top");
    this.pipe2.draw("pipe_bot");
  }
  APP.PipePair = PipePair;
  return APP;
})(APP || {});






// -------------------------------------------------
// @MoneyText + Manager
// -------------------------------------------------
var APP = (function(APP){
  function MoneyText(x,y){
    this.move = false;
    this.txt = "+10";
    this.color = "#ffefa6";
    this.position = new APP.Vector(x,y);
    this.velocity = new APP.Vector(0, -6);
    this.acceleration = new APP.Vector(0, 0.4);
    //
    var that = this;
    APP.Time.startTimer(function(){ that.move = true; }, 50, 1);
  }
  MoneyText.prototype.update = function(){
    if(!this.move) return;
    this.velocity.add(this.acceleration);
    this.position.add(this.velocity);
    if(this.position.y > APP.H - 100) APP.MoneyTextManager.remove(this);
  }
  MoneyText.prototype.draw = function(){
    var context = APP.Canvas.context;
    context.font="42px flappyfont";
    context.lineWidth = 2;
    context.fillStyle = this.color;
    var txt = this.txt;
    var txt_w = context.measureText(txt).width;
    context.fillText(txt, this.position.x, this.position.y);
    context.strokeText(txt,this.position.x, this.position.y);
  }

  function MoneyTextManager(){
    this.elems = [];
    //
    this.clear = function(){
      this.elems = [];
    }
    this.add = function(){
      var x = APP.FlappyBird.position.x +60;
      var y = APP.FlappyBird.position.y +30;
      var moneyText = new APP.MoneyText(x, y);
      this.elems.push(moneyText);
    }
    this.remove = function(elem){
      for(var i = 0; i < this.elems.length; i++){
        if(elem == this.elems[i]) {
          this.elems.splice(i, 1);
          break;
        }
      }
    }
    this.update = function(){
      for(var i = 0; i < this.elems.length; i++){
        this.elems[i].update();
      }
    }
    this.draw = function(){
      for(var i = 0; i < this.elems.length; i++){
        this.elems[i].draw();
      }
    }
  }

  APP.MoneyText = MoneyText;
  APP.MoneyTextManager = new MoneyTextManager();
  return APP;
})(APP || {});







// -------------------------------------------------
// @PipeManager
// -------------------------------------------------
var APP = (function(APP){
  function PipeManager(){
    this.pipePairs = [];
    this.timer;
    this.pipeVelocity = 0;
    this.bg_position_x = 0;
    this.ground_height = undefined;
    this.ground_position_y = undefined;
    //
    this.init = function(){
      var ground_img = document.getElementById("ground_img");
      this.ground_height = ground_img.height;
      this.pipePairs = [];
      this.stopTimer();
      this.timer = APP.Time.startTimer(APP.PipeManager.onTime1, 1500);
    }
    this.onTime1 = function(){
      APP.PipeManager.addPipe();
      APP.Time.killTimer(APP.PipeManager.timer);
      APP.PipeManager.timer = APP.Time.startTimer(APP.PipeManager.onTime2, 1500);
    }
    this.onTime2 = function(){
      APP.PipeManager.crossPipe();
    }
    this.stopTimer = function(){
      APP.Time.killTimer(APP.PipeManager.timer);
    }
    this.update = function(){
      for(var i = 0; i < this.pipePairs.length; i++){
        var pipe = this.pipePairs[i];
        pipe.update();
      }
      this.bg_position_x -= this.pipeVelocity;
    }
    this.crossPipe = function(){
      APP.PipeManager.addPipe();
      APP.ScoreBoard.score++;
      APP.MoneyTextManager.add();
    }
    this.draw = function(){
      var context = APP.Canvas.context;
      /* draw bg */
      var bg_img = document.getElementById("bg_img");
      context.drawImage(bg_img, 0, 0, bg_img.width, bg_img.height);
      /* draw pipePairs */
      for(var i = 0; i < this.pipePairs.length; i++){
        var pipe = this.pipePairs[i];
        pipe.draw();
      }
      /* draw ground */
      var ground_img = document.getElementById("ground_img");
      var pat = context.createPattern(ground_img,"repeat");
      context.beginPath();
      context.fillStyle = pat;
      var x = 0;
      var y = this.ground_position_y - ground_img.height;
      context.save();
      context.translate(this.bg_position_x, y);
      context.fillRect(-this.bg_position_x, 0, APP.W, ground_img.height);
      context.restore();
      //context.drawImage(ground_img, 0, 500, ground_img.width, ground_img.height);
      context.closePath();
    }
    this.addPipe = function(){
      var holeSize = 140;
      var hole = APP.Math2.random(100, APP.PipeManager.ground_position_y - 100 - 240);
      var pipe1 = new APP.Pipe();
      pipe1.position = new APP.Vector(APP.W+1, 0);
      pipe1.width = 66;
      pipe1.height = hole;
      var pipe2 = new APP.Pipe();
      pipe2.position = new APP.Vector(APP.W, hole+holeSize);
      pipe2.width = 66;
      pipe2.height = APP.H - hole - holeSize;
      var pipePair = new APP.PipePair(pipe1, pipe2);
      this.pipePairs.push(pipePair);
    }
    this.removePipe = function(pipePair){
      for(var i = 0; i < this.pipePairs.length; i++){
        var p = this.pipePairs[i];
        if(p.remove) this.pipePairs.splice(i,1);
        if(p == pipePair) p.remove = true;
      }
    }
  }
  APP.PipeManager = new PipeManager();
  return APP;
})(APP || {});













// -------------------------------------------------
// @BorderLimit
// -------------------------------------------------
var APP = (function(APP){
  function BorderLimit(){
    this.update = function(){
      var elem = APP.FlappyBird;
      var limit = APP.H - APP.PipeManager.ground_height -20;
      if(elem.position.y > limit) {
        APP.Game.changeState("bird_grounded");
      }
    }
  }
  APP.BorderLimit = new BorderLimit();
  return APP;
})(APP || {});










// -------------------------------------------------
// @CollisionManager
// -------------------------------------------------
var APP = (function(APP){
  function CollisionManager(){
    this.update = function(){
      for(var i = 0; i < APP.PipeManager.pipePairs.length; i++){
        for( var j = 0; j < 2; j++){
          var p;
          if(j == 0) p = APP.PipeManager.pipePairs[i].pipe1;
          if(j == 1) p = APP.PipeManager.pipePairs[i].pipe2;
          if(APP.FlappyBird.position.x + APP.FlappyBird.width > p.position.x &&
             APP.FlappyBird.position.x < p.position.x + p.width &&
             APP.FlappyBird.position.y + APP.FlappyBird.height > p.position.y &&
             APP.FlappyBird.position.y < p.position.y + p.height) {
               if(APP.Game.state == "bird_flying") {
                 APP.Game.changeState("bird_collided_with_wall");
               }
            }
        }
      }
    }//end-update
  }
  APP.CollisionManager = new CollisionManager();
  return APP;
})(APP || {});












// -------------------------------------------------
// @Gravitation
// -------------------------------------------------
var APP = (function(APP){
  function Gravitation(){
    var gravity = new APP.Vector(0, 0.45);
    this.update = function(elem){
      if(APP.FlappyBird.velocity.y < 8)  APP.FlappyBird.applyForce(gravity);
    }
  }
  APP.Gravitation = new Gravitation();
  return APP;
})(APP || {});






// -------------------------------------------------
// @FlyingForce
// -------------------------------------------------
var APP = (function(APP){
  function Flying(){
    var flying = new APP.Vector(1, 0);
    this.update = function(){
      APP.FlappyBird.position.add(flying)
    }
  }
  APP.Flying = new Flying();
  return APP;
})(APP || {});






// -------------------------------------------------
// @Score Board
// -------------------------------------------------
var APP = (function(APP){
  function ScoreBoard(){
    this.score = 0;
    this.update = function(){}
    this.draw = function(){
      var context = APP.Canvas.context;
      context.font="80px flappyfont";
      context.lineWidth = 3;
      context.fillStyle = "#ffffff";
      var txt = this.score;
      var txt_w = context.measureText(txt).width;
      context.fillText(txt,APP.W/2 -txt_w/2,100);
      context.strokeText(txt,APP.W/2 -txt_w/2,100);
      //
      context.font="12px Arial";
      context.fillStyle = "#000000";
      var dump = JSON.stringify(APP, null, 4)
      var dump2 = dump.replace(/\n/g, "<br>").replace(/[ ]/g, "&nbsp;");
      //context.fillText(dump2,10,10);
      //document.getElementById("dump").innerHTML = dump;
    }

  }
  APP.ScoreBoard = new ScoreBoard();
  return APP;
})(APP || {});





// -------------------------------------------------
// @UIButton
// -------------------------------------------------
var APP = (function(APP){
  function UIButton(){
    this.hover = false;
    this.focus = false;
    this.img;
    this.x;
    this.y;
    this.w;
    this.h;
    this.clickEvent;
    this.scale = 0.5;
    //
    this.init = function(img, x, y){
        this.img = img;
        this.w = img.width*this.scale/2;
        this.h = img.height*this.scale;
        this.x = x;
        this.y = y;
    }
    this.setClickListener = function(fn){
      this.clickEvent = fn;
    }
    this.draw = function(context){
      var img = this.img;
      var w = this.w;
      var h = this.h;
      var x = this.x;
      var y = this.y;
      var s = this.scale;
      //APP.Canvas.context.fillRect(x,y,w,h);
      //
      if(!this.hover) APP.Canvas.context.drawImage(img, 0, 0, w/s, h/s, x, y, w, h);
      else APP.Canvas.context.drawImage(img, w/s, 0, w/s, h/s, x, y, w, h);
    }
  }
  APP.UIButton = UIButton;
  return APP;
})(APP || {});




// -------------------------------------------------
// @Game UI
// -------------------------------------------------
var APP = (function(APP){
  function GameUI(){
    this.elems = [];
    //
    this.init = function(){
      var restartButton = new APP.UIButton();
      restartButton.init(document.getElementById("restart_btn_img"), APP.W/2 -75, APP.H/2 - 26);
      restartButton.setClickListener(function(){
        APP.Game.restart();
      });
      this.elems.push(restartButton);
    }
    this.clear = function(){
      this.elems = [];
    }
    this.draw = function(){
      for(var i = 0; i<APP.GameUI.elems.length; i++){
        var elem = APP.GameUI.elems[i];
        elem.draw();
      }
    }
    this.isPointInsideAABB = function(point, aabb){
        var sides = {
          left    : aabb.x,
          top     : aabb.y,
          right   : aabb.x + aabb.w,
          bottom  : aabb.y + aabb.h
        };
        if(point.x > sides.left &&
           point.x < sides.right &&
           point.y > sides.top &&
           point.y < sides.bottom){ return true; }
        else return false;
    }
  }
  APP.GameUI = new GameUI();
  return APP;
})(APP || {});













// -------------------------------------------------
// @Renderer
// -------------------------------------------------
var APP = (function(APP){
  function Renderer(){
    this.states;
    this.update = function(){
      APP.Renderer.states[APP.Game.state]();
    }
    this.draw = function(){
      APP.Canvas.context.clearRect(0,0,APP.W, APP.H);
      APP.PipeManager.draw();
      APP.FlappyBird.draw();
      APP.ScoreBoard.draw();
      APP.MoneyTextManager.draw();
      APP.GameUI.draw();
      /* debug draw */
      var c = APP.Canvas.context;
      c.font = "12px Arial";
      c.fillStyle = "#000000";
      c.fillText(APP.Game.state, 10, 10);
    }
    // States
    this.birdFlying = function(){
      APP.Gravitation.update();
      APP.BorderLimit.update();
      APP.FlappyBird.update();
      APP.CollisionManager.update();
      APP.PipeManager.update();
      APP.MoneyTextManager.update();
    }
    //
    this.birdGrounded = function(){}
    //
    this.birdCollidedWithWall = function(){
      APP.Gravitation.update();
      APP.BorderLimit.update();
      APP.FlappyBird.update();
    }
  }
  APP.Renderer = new Renderer();
  APP.Renderer.states = {
    "game_configure"          :  function(){},
    "game_init"               :  function(){},
    "bird_flying"             :  APP.Renderer.birdFlying,
    "bird_grounded"           :  APP.Renderer.birdGrounded,
    "bird_collided_with_wall" :  APP.Renderer.birdCollidedWithWall
  };
  return APP;
})(APP || {});













// -------------------------------------------------
// @Game
// -------------------------------------------------
(function(APP){
  function Game(){
    this.state = "unspecified";
    this.restart = function(){
      this.changeState("game_init");
    }
    this.changeState = function(stateName){
      APP.Game.state = stateName;
      APP.Game.states[stateName]();
    }
    // States
    this.gameConfigure = function(){
      var W = APP.W;
      var H = APP.H;
      APP.PipeManager.pipeVelocity = (W > 500) ? 5 : 3;
      APP.PipeManager.ground_position_y = (H > 650) ? 650 : H;
      //
      APP.FlappyBird.init();
      APP.UserInput.init();
      APP.AnimationFrame.run({
        fps:    60,
        time:   APP.Time.tick,
        update: APP.Renderer.update,
        render: APP.Renderer.draw
      });
      APP.Game.changeState("game_init");
    }
    this.gameInit = function(){
      APP.GameUI.clear();
      APP.ScoreBoard.score = 0;
      APP.MoneyTextManager.clear();
      APP.PipeManager.init();
      APP.FlappyBird.init();
      APP.UserInput.allow = {"mouse" : true, "keyboard" : true, "touch" : true};
      APP.Game.changeState("bird_flying");
    }
    this.birdFlying = function(){
    }
    //
    this.birdGrounded = function(){
      APP.GameUI.init();
      APP.PipeManager.stopTimer();
    }
    this.birdCollidedWithWall = function(){
      APP.PipeManager.stopTimer();
    }
  }
  APP.Game = new Game();
  APP.Game.states = {
    "game_configure"            : APP.Game.gameConfigure,
    "game_init"                 : APP.Game.gameInit,
    "bird_collided_with_wall"   : APP.Game.birdCollidedWithWall,
    "bird_grounded"             : APP.Game.birdGrounded,
    "bird_flying"               : APP.Game.birdFlying
  };
  return APP;
})(APP || {});














// -------------------------------------------------
// @UserInput
// -------------------------------------------------
var APP = (function(APP){
  function UserInput(){
    this.KEY  = {
      SPACE : 32,
      LEFT  : 37,
      UP    : 38,
      RIGHT : 39,
      DOWN  : 40,
      O     : 79,
      I     : 73,
      P     : 80,
      W     : 87,
      A     : 65,
      S     : 83,
      D     : 68,
      X     : 88,
      I     : 73
    };

    this.allow = {
      "mouse" : true,
      "keyboard" : true,
      "touch" : true
    }

    this.init = function(){
      document.addEventListener("keydown", function(e) { return APP.UserInput.keyboard(e, e.keyCode, true); });
      document.addEventListener("keyup",   function(e) { return APP.UserInput.keyboard(e, e.keyCode, false); });
      APP.Canvas.canvas.addEventListener("mousedown", function(e) { return APP.UserInput.mouse(e, "mousedown"); });
      APP.Canvas.canvas.addEventListener("mouseup", function(e) { return APP.UserInput.mouse(e, "mouseup"); });
      APP.Canvas.canvas.addEventListener("mousemove", function(e) { return APP.UserInput.mouse(e, "mousemove"); });
      APP.Canvas.canvas.addEventListener("touchstart", function(e){ return APP.UserInput.touch(e, "touchstart"); }, false);
      APP.Canvas.canvas.addEventListener("touchend", function(e){ return APP.UserInput.touch(e, "touchend"); }, false);
      APP.Canvas.canvas.addEventListener("touchmove", function(e){ return APP.UserInput.touch(e, "touchmove"); }, false);
    }
    this.keyboard = function(e, key, pressed){
      if(!this.allow.keyboard) return;
      switch(key){
        case this.KEY.SPACE  : if(!pressed) {  } e.preventDefault(); return false; break;
      }
    }
    this.mouse = function(e, type){
      if(!this.allow.mouse) return;
      if(type == "mousedown"){
        e.preventDefault();
        for(var i=0; i<APP.GameUI.elems.length; i++){
          var elem = APP.GameUI.elems[i];
          var rect = APP.Canvas.canvas.getBoundingClientRect();
          var mousePosition = {x:e.clientX - rect.left, y:e.clientY - rect.top};
          var uiAABB = {x:elem.x, y:elem.y, w:elem.w, h:elem.h};
          if(APP.GameUI.isPointInsideAABB(mousePosition, uiAABB)) {
            elem.hover = true;
            elem.focus = true;
          }
          else  {
            elem.hover = false;
            elem.focus = false;
          }
        }
        APP.FlappyBird.mousedown();
      }
      else if(type == "mouseup"){
        for(var i=0; i<APP.GameUI.elems.length; i++){
          var elem = APP.GameUI.elems[i];
          var rect = APP.Canvas.canvas.getBoundingClientRect();
          var mousePosition = {x:e.clientX - rect.left, y:e.clientY - rect.top};
          var uiAABB = {x:elem.x, y:elem.y, w:elem.w, h:elem.h};
          if(elem.focus && APP.GameUI.isPointInsideAABB(mousePosition, uiAABB)) elem.clickEvent();
          elem.hover = false;
          elem.focus = false;
        }
      }
      else if(type == "mousemove"){
        for(var i=0; i<APP.GameUI.elems.length; i++){
          var elem = APP.GameUI.elems[i];
          var rect = APP.Canvas.canvas.getBoundingClientRect();
          var mousePosition = {x:e.clientX - rect.left, y:e.clientY - rect.top};
          var uiAABB = {x:elem.x, y:elem.y, w:elem.w, h:elem.h};
          if(elem.focus && APP.GameUI.isPointInsideAABB(mousePosition, uiAABB)) elem.hover = true;
          else elem.hover = false;
        }
      }
    }
    this.touch = function(e, type){
      if(!this.allow.touch) return;
      if(type == "touchstart"){
        e.preventDefault();
        for(var i=0; i<APP.GameUI.elems.length; i++){
          var elem = APP.GameUI.elems[i];
          var touch = e.targetTouches[0];
          var touchPosition = {x:touch.pageX, y:touch.pageY};
          var uiAABB = {x:elem.x, y:elem.y, w:elem.w, h:elem.h};
          if(APP.GameUI.isPointInsideAABB(touchPosition, uiAABB)) {
            elem.hover = true;
            elem.focus = true;
          }
          else  {
            elem.hover = false;
            elem.focus = false;
          }
        }
        APP.FlappyBird.mousedown();
      }
      if(type == "touchend"){
        for(var i=0; i<APP.GameUI.elems.length; i++){
          var elem = APP.GameUI.elems[i];
          var touch = e.changedTouches[0];
          var touchPosition = {x:touch.pageX, y:touch.pageY};
          var uiAABB = {x:elem.x, y:elem.y, w:elem.w, h:elem.h};
          if(elem.focus && APP.GameUI.isPointInsideAABB(touchPosition, uiAABB)) elem.clickEvent();
          elem.hover = false;
          elem.focus = false;
        }
      }
      if(type == "touchmove"){
        for(var i=0; i<APP.GameUI.elems.length; i++){
          var elem = APP.GameUI.elems[i];
          var touch = e.touches[0];
          var touchPosition = {x:touch.pageX, y:touch.pageY};
          var uiAABB = {x:elem.x, y:elem.y, w:elem.w, h:elem.h};
          if(elem.focus && APP.GameUI.isPointInsideAABB(touchPosition, uiAABB)) elem.hover = true;
          else elem.hover = false;
        }
      }
    }

  }
  APP.UserInput = new UserInput();
  return APP;
})(APP || {});













// -------------------------------------------------
// @Main Controller
// -------------------------------------------------
(function(APP){
  var W = APP.Math2.constraint(window.innerWidth, 100, 800);
  var H = APP.Math2.constraint(window.innerHeight, 250, 650);
  APP.Canvas.init("stage", W, H).then(run);
  // Run app
  function run(){
    APP.Game.changeState("game_configure");
  }
})(APP || {});






















//
