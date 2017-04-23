var GYROCRAFT = GYROCRAFT || {};
GYROCRAFT.Timer = function(timerContainer,timerKnobID,maxValue){
  var UNITS = "s";
  var self = this;
  var timerMaxValue = maxValue || 60;
  var currentValue = 0;
  var timerContainer = $("#" + timerContainer);
  var timerObject = $("#" + timerKnobID);
  var timerAnimationRequest = null;
  var animationInProgress = false;
  var listners = [];
  timerObject.knob({
      draw : function () {
          if(this.$.data('skin') == 'tron') {
              this.cursorExt = 0.3;

              var a = this.arc(this.cv)  // Arc
                      , pa                   // Previous arc
                      , r = 1;

              this.g.lineWidth = this.lineWidth;

              if (this.o.displayPrevious) {
                  pa = this.arc(this.v);
                  this.g.beginPath();
                  this.g.strokeStyle = this.pColor;
                  this.g.arc(this.xy, this.xy, this.radius - this.lineWidth, pa.s, pa.e, pa.d);
                  this.g.stroke();
              }

              this.g.beginPath();
              this.g.strokeStyle = r ? this.o.fgColor : this.fgColor ;
              this.g.arc(this.xy, this.xy, this.radius - this.lineWidth, a.s, a.e, a.d);
              this.g.stroke();

              this.g.lineWidth = 2;
              this.g.beginPath();
              this.g.strokeStyle = this.o.fgColor;
              this.g.arc( this.xy, this.xy, this.radius - this.lineWidth + 1 + this.lineWidth * 2 / 3, 0, 2 * Math.PI, false);
              this.g.stroke();
              return false;
          }
      }
  });

  function timerEnded(){
    //tell all the listners 
    for(var i in listners){
      listners[i].onTimeEnd();
    }
  }
 function timerFiveLeft(){
    //tell all the listners 
    for(var i in listners){
      listners[i].onLastFive();
    }
  }
  function decreaseTimer(){
    if(currentValue == 0){
      self.pause();
      timerEnded();
      return;
    }
	if(currentValue == 5){
		timerFiveLeft();
	}
    timerObject
      .val(--currentValue)
      .trigger('change');
    timerObject.val(currentValue + UNITS);
   
  }

  function increseTimer(val){
    if(currentValue == timerMaxValue)return;
    currentValue += val;
    timerObject
      .val(currentValue)
      .trigger('change');
    timerObject.val(currentValue + UNITS);
  }

  function animatTimerFill(time,onEnd){
    animationInProgress = true;
    var addTime = Math.ceil(time/120);
    function animation(){
      if(currentValue == time){
        animationInProgress = false;
        if(onEnd)
          onEnd();
        return;
      }   
      increseTimer(Math.min(addTime,time - currentValue)); 
      requestAnimationFrame(animation);
    }
    animation();
  }


  function validListner(listner){
    return (typeof listner.getID == "function" &&
            typeof listner.onTimeEnd == "function"&&
            typeof listner.onLastFive == "function");
  }

  this.addListener = function(listner){
    if(!validListner(listner)){
      throw "Error : " + listner + " is not valid listner for timer ";
    }
    listners.push(listner);
  }

  this.removeListener = function(listner){
    listners = listners.filter(function(obj){
      return obj.getID() != listner.getID();
    });
  }

  this.setTime = function(time){
    if(animationInProgress)return;
    var isPlaiedBefore = (timerAnimationRequest)?true:false;
    this.pause();
    timerObject
      .trigger("configure",   {
        "max" : time,
      });
    timerMaxValue = time;
    animatTimerFill(time,(isPlaiedBefore)?this.play:undefined);
  }

  this.start = function(){
    if(timerAnimationRequest)return;
    timerAnimationRequest = setInterval(decreaseTimer, 1000);
  }

  this.pause = function(){
    clearInterval(timerAnimationRequest);
    timerAnimationRequest = null;
  }
  this.show = function(){
    timerContainer.show();
  }
  this.hide = function(){
    timerContainer.hide();
  }
  this.getCurrentTime = function(){
    return currentValue;
  }
  this.getMaxTime = function(){
    return timerMaxValue;
  }
}


