

/*
  @Vector
  @Promise
  @Canvas
  @Time + @Timer
  @AnimationFrame
  @Math2
*/

// -----------------------------------------------------
//  @Vector V1.0
// -----------------------------------------------------
var APP = (function(APP){

  function Vector(x,y){
    if(x == undefined || y == undefined) throw new Error("x and y components required.");
    this.x = x;
    this.y = y;
  }

  Vector.prototype.add = function(vec){
    this.x += vec.x;
    this.y += vec.y;
    return this;
  }

  Vector.prototype.sub = function(vec){
    this.x -= vec.x;
    this.y -= vec.y;
    return this;
  }

  Vector.prototype.mult = function(scalar){
    this.x *= scalar;
    this.y *= scalar;
    return this;
  }

  Vector.prototype.div = function(scalar){
    this.x /= scalar;
    this.y /= scalar;
    return this;
  }

  Vector.prototype.constraint = function(max){
    if(this.x > max) this.x = max;
    if(this.y > max) this.y = max;
    if(this.x < -max) this.x = -max;
    if(this.y < -max) this.y = -max;
    return this;
  }

  Vector.prototype.clone = function(){
    return new APP.Vector(this.x, this.y);
  }

  Vector.prototype.getDistance = function(){
    return Math.sqrt( this.x * this.x + this.y * this.y );
  }

  Vector.prototype.reverse = function(){
    return new APP.Vector(-this.x, -this.y);
  }

  Vector.prototype.subStatic = function(vec1, vec2){
    return new APP.Vector(vec1.x-vec2.x, vec1.y-vec2.y);
  }

  Vector.prototype.normalize = function(){
    var length = this.getDistance();
    this.x /= length;
    this.y /= length;
    return this;
  }


  APP.Vector = Vector;
  return APP;
})(APP || {});










// -------------------------------------------------
// @Promise V1.0
// -------------------------------------------------
var APP = (function(APP){
  function Promise(){
    this.resolve = function(){};
    this.reject = function(){};
    this.then = function(resolve, reject){
      this.resolve = resolve;
      this.reject = reject;
    }
  }
  APP.Promise = Promise;
  return APP;
})(APP || {});












// -------------------------------------------------
// @Canvas V1.03
// Depends on (Promise)
// -------------------------------------------------
var APP = (function(APP){

  /*
  rect(x,y,w,h);
  arc(x,y,radius,startAngle,endAngle,counterclockwise);
  fill();
  stroke();
  */

  function Canvas(){
    var c = this;
    this.init = function(id, w, h){
      if(!id) throw new Error("canvas id required")
      var promise = new APP.Promise();
      window.onload = function(){
        c.canvas = document.getElementById(id);
        c.context = c.canvas.getContext("2d");
        var PIXEL_RATIO = getPixelRatio(c.context);
        c.context.webkitImageSmoothingEnabled = false;
        c.context.mozImageSmoothingEnabled = false;
        c.context.imageSmoothingEnabled = false;
        c.canvas.width = w*PIXEL_RATIO;
        c.canvas.height = h*PIXEL_RATIO;
        c.canvas.style.width = w +"px";
        c.canvas.style.height = h +"px";
        c.context.setTransform(PIXEL_RATIO, 0, 0, PIXEL_RATIO, 0, 0);
        APP.W = w;
        APP.H = h;
        APP.RAW_W = w*PIXEL_RATIO;
        APP.RAW_H = h*PIXEL_RATIO;
        APP.PIXEL_RATIO = PIXEL_RATIO;
        promise.resolve();
      }
      return promise;
    }

    function getPixelRatio(ctx){
        var dpr = window.devicePixelRatio || 1,
            bsr = ctx.webkitBackingStorePixelRatio ||
                  ctx.mozBackingStorePixelRatio ||
                  ctx.msBackingStorePixelRatio ||
                  ctx.oBackingStorePixelRatio ||
                  ctx.backingStorePixelRatio || 1;
        return dpr / bsr;
    }

    this.rotate = function(rotationPoint, angle, drawCallback){
      this.context.save();
      this.context.translate(rotationPoint.x,rotationPoint.y);
      this.context.rotate(angle*Math.PI/180);
      this.context.translate(-rotationPoint.x,-rotationPoint.y);
      drawCallback();
      this.context.restore();
    }

  }

  APP.Canvas = new Canvas();
  return APP;
})(APP || {});






// -------------------------------------------------
// @Time + @Timer
// -------------------------------------------------
var APP = (function(APP){
  function Timer(callback, time, iterations){
    this.callback = callback;
    this.end = time / (1000/APP.FPS);
    this.now = 0;
    this.currentIteration = 0;
    this.maxIterations = iterations || -1;
  }
  Timer.prototype.tick = function(dt){
    this.now++;
    if(this.now >= this.end) {
      this.callback();
      this.reset();
    }
  }
  Timer.prototype.reset = function(){
    this.now = 0;
    this.currentIteration++;
    if(this.maxIterations == -1) return; // infinit iterations
    if(this.currentIteration >= this.maxIterations){
      APP.Time.killTimer(this);
    }
  }
  APP.Timer = Timer;
  //
  function Time(){
    this.timers = [];
    //
    this.tick = function(dt){
      for(var i = 0; i < APP.Time.timers.length; i++){
        APP.Time.timers[i].tick(dt);
      }
    }
    this.startTimer = function(callback, time, iterations){
      var t = new APP.Timer(callback, time, iterations);
      this.timers.push(t);
      t.tick();
      return t;
    }
    this.killTimer = function(timer){
      for(var i = 0; i < APP.Time.timers.length; i++){
        if(timer == APP.Time.timers[i]) APP.Time.timers.splice(i,1);
      }
    }
  }
  APP.Time = new Time();
  return APP;
})(APP || {});










// -----------------------------------------------------
 //  @AnimationFrame V1.0
 // -----------------------------------------------------
 var APP = (function(APP){
   function AnimationFrame(){
     if (!window.requestAnimationFrame) { // http://paulirish.com/2011/requestanimationframe-for-smart-animating/
       window.requestAnimationFrame = window.webkitRequestAnimationFrame ||
                                      window.mozRequestAnimationFrame    ||
                                      window.oRequestAnimationFrame      ||
                                      window.msRequestAnimationFrame     ||
                                      function(callback) {
                                        window.setTimeout(callback, 1000 / 60);
                                      }
     }

     var now,dt,last,step,time,update,render;

     this.run = function(options){
       now,
       dt       = 0,
       last     = timestamp(),
       step     = 1/options.fps,
       APP.FPS = options.fps;
       time     = options.time;
       update   = options.update,
       render   = options.render;
       fpsmeter = new FPSMeter(options.fpsmeter || { decimals: 0, graph: true, theme: 'dark', left: '5px' });
       frame();
     }

     function timestamp(){
         return window.performance && window.performance.now ? window.performance.now() : new Date().getTime();
     }

     function frame() {
       fpsmeter.tickStart();
       now = timestamp();
       dt = dt + Math.min(1, (now - last) / 1000);
       while(dt > step) {
         dt = dt - step;
         update(step);
         time(step);
       }
       render(dt);
       last = now;
       fpsmeter.tick();
       requestAnimationFrame(frame);
     }
   }

   APP.AnimationFrame = new AnimationFrame();
   APP.AnimationFrame.tick = window.requestAnimationFrame;
   return APP;
 })(APP || {});




  var APP = (function (APP) {













// ------------------------------------------------------------------------------
//  @Math2 V1.1
// ------------------------------------------------------------------------------
    function Math2(){

      this.lerp = function(n, dn, dt) {
        return n + (dn * dt);
      }

      this.timestamp = function() {
        return window.performance && window.performance.now ? window.performance.now() : new Date().getTime();
      }

      this.bound = function(x, min, max) {
        return Math.max(min, Math.min(max, x));
      }

      this.between = function(n, min, max) {
        return ((n >= min) && (n <= max));
      }

      this.brighten = function(hex, percent) {

        var a = Math.round(255 * percent/100),
            r = a + parseInt(hex.substr(1, 2), 16),
            g = a + parseInt(hex.substr(3, 2), 16),
            b = a + parseInt(hex.substr(5, 2), 16);

        r = r<255?(r<1?0:r):255;
        g = g<255?(g<1?0:g):255;
        b = b<255?(b<1?0:b):255;

        return '#' + (0x1000000 + (r * 0x10000) + (g * 0x100) + b).toString(16).slice(1);
      }

      this.darken = function(hex, percent) {
        return this.brighten(hex, -percent);
      }

      this.normalize = function(n, min, max) {
        while (n < min)
          n += (max-min);
        while (n >= max)
          n -= (max-min);
        return n;
      }

      this.constraint = function(val, min, max){
        if(val > max) val = max;
        if(val < min) val = min;
        return val;
      }

      this.randomHex = function(){
            var pool = ["0","1","2","3","4","5","6","7","8","9","0","A","B","C","D","E","F"];
            var color = "#";
            for( var i = 0; i < 6; i++){
              var pick = Math.floor(Math.random() * pool.length);
              color += pool[pick];
            }
            return color;
      }

      this.normalizeAngle180 = function(angle) { return this.normalize(angle, -180, 180); },
      this.normalizeAngle360 = function(angle) { return this.normalize(angle,    0, 360); },

      this.steppedRound      = function(val, step) { return Math.round(val / step) * step;  }

      this.random            = function(min, max) { return (min + (Math.random() * (max - min)));        },
      this.randomInt         = function(min, max) { return Math.round(this.random(min, max));            },
      this.randomSteppedInt  = function(min, max, step) { var val = Math.round(this.random(min, max)); return val - val%step; },
      this.randomChoice      = function(choices)  { return choices[this.randomInt(0, choices.length-1)]; }

    }

    APP.Math2 = new Math2();

  	return APP;
  }(APP || {}));
