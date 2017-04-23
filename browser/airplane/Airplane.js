var GYROCRAFT = GYROCRAFT || {};

GYROCRAFT.Airplane = function(scene , Setting , R , model){
//Private:
	var axisX = new THREE.Vector3( 1, 0, 0 ); 
	var axisY = new THREE.Vector3( 0, 1, 0 );
	var axisZ = new THREE.Vector3( 0, 0, 1 );

	var OFFSET = model.offset || 0;
	var MAX_ANGLE_SLIDE_VALUE = 1.2;
	var MAX_ANGLE_LEAN_VALUE = 0.7;
	var TUTORIAL_SLIDE_ANGLE = 0.8;
	var TUTORIAL_LEAN_ANGLE = 0.4;
	var TUTORIAL_VELOCITY_MULTIPLIER = 0.9;
	var rollAngle = 0;
	var pitchAngle = 0;
	var mWarningAlertSoundRequest = null;
	var acceleration_delay = model.acceleration_delay || 1000;
	var DRAT_CONST = model.drag_const || 0.0001;
	var maxthrust = model.max_thrust || 50000;
	var velocity = 0.1 * maxthrust;
	var thrust = Math.pow(velocity, 2) * DRAT_CONST;
	var bufferthrust = thrust;
	var maxVelocity = Math.sqrt(model.max_thrust/DRAT_CONST);
	var mLockCamera=false, mLockControls=false;
	var camera = new THREE.PerspectiveCamera( Setting.camera_fov, window.innerWidth / window.innerHeight, 1 , Setting.camera_far );
	camera.position.set(0, 3 * Setting.scale, 13 * Setting.scale);
	camera.name = "player_airplane_camera";
	var mTutorialListener = null;

	var airplaneObject = (model.object) ? model.object.clone() : new THREE.Object3D();
	airplaneObject.name = "player_airplane_object";
	
	if(Setting.scale!=1){
		airplaneObject.scale.set( Setting.scale , Setting.scale , Setting.scale );
	}

	var airplaneEnvironment  = new THREE.Object3D();
	airplaneEnvironment.name = "player_airplane_environment";
	airplaneEnvironment.add(camera);

	airplaneEnvironment.add(airplaneObject);
	scene.add(airplaneEnvironment);

	var rotateOnAxis = GYROCRAFT.Utils.rotateOnAxis;

	function drag(){
		return Math.pow(velocity, 2) * DRAT_CONST;	
	}

	function getFPS(delta) {
		var delta = Math.round(1/delta);
		if(delta == 0){
			return 1;
		}
		return delta;
	}

	function slide(fps) {
		var angle = rollAngle*MAX_ANGLE_SLIDE_VALUE;
		var currentAngle = airplaneObject.rotation.y;
		angle = currentAngle*(fps-1)/fps + angle/fps;
		rotateOnAxis(airplaneObject, axisY,  angle - currentAngle); 
		if(!mLockCamera){
			rotateOnAxis(airplaneEnvironment, axisY, - angle / 100); 
			airplaneObject.rotation.z = 0;
		}
	}

	function lean(fps){
		var currentAngle = airplaneObject.rotation.x;
		var angle = OFFSET + pitchAngle*MAX_ANGLE_LEAN_VALUE;
		angle = currentAngle*(fps-1)/fps + angle/fps;
		rotateOnAxis(airplaneObject, axisX, angle - currentAngle); 
	}

	function updatePosition(delta){
		if(thrust > bufferthrust){
			thrust -= acceleration_delay;
			thrust = Math.max(bufferthrust,thrust);
		}else if(thrust < bufferthrust){
			thrust += acceleration_delay;
			thrust = Math.min(bufferthrust,thrust);
		}
		
		var currentPitchAngle = airplaneObject.rotation.x - OFFSET;
		var acceleration = thrust - drag();
		var yPart = Math.cos(currentPitchAngle);
		var zPart = Math.sin(currentPitchAngle);
		var velocityZ = velocity*yPart;
		var velocityY = velocity*zPart;
		var accelerationZ = acceleration*yPart;
		var accelerationY = acceleration*zPart;
		var zFactor = velocityZ*delta + 0.5*accelerationZ*Math.pow(delta, 2);
		if(mLockCamera){
			airplaneObject.position.x += camera.getWorldDirection().x * zFactor;
			airplaneObject.position.z += camera.getWorldDirection().z * zFactor;
			airplaneObject.position.y += velocityY*delta;//(velocityY*delta + 0.5*accelerationY*Math.pow(delta, 2));
		}
		else{
			airplaneEnvironment.position.x += camera.getWorldDirection().x * zFactor;
			airplaneEnvironment.position.z += camera.getWorldDirection().z * zFactor;
			airplaneEnvironment.position.y += (velocityY*delta + 0.5*accelerationY*Math.pow(delta, 2));
		}
		velocity += acceleration*delta;
	}

	function getCompassAngle() {
		var x = camera.getWorldDirection().x;
		var z = camera.getWorldDirection().z;
		var radianAngle;
		if (x > 0 && z >= 0) {
			radianAngle = Math.atan(z/x);
		}
		else if (x > 0 && z < 0) {
			radianAngle = Math.atan(z/x) + 2*Math.PI;
		}
		else if (x < 0) {
			radianAngle = Math.atan(z/x) + Math.PI;
		}
		else if (x == 0 && z > 0) {
			radianAngle = Math.PI / 2;
		}
		else {
			radianAngle = 3*Math.PI / 2;
		}

		return radianAngle * 180 / Math.PI;
	}
	
//Public:
	this.isLegalAltitude = function(){
		if(airplaneEnvironment.position.y > (Setting.range - Setting.warning_range) ||
		   airplaneEnvironment.position.y < (- Setting.range + Setting.warning_range)){
			if(!mWarningAlertSoundRequest){
				this.turnOnWarningLight();
				GYROCRAFT.Connection.send("alert", "PlaySound");
				mWarningAlertSoundRequest = setInterval(function(){ GYROCRAFT.Connection.send("alert", "PlaySound"); }, 1000 * 20);
				if (airplaneEnvironment.position.y > (Setting.range - Setting.warning_range)) {
					GYROCRAFT.Utils.Messenger.send("Alert: You are flying too high.<br><div style='color:red'> Fly lower or your plane will lose control.</div>" , 8000);
				}
				else {
					GYROCRAFT.Utils.Messenger.send("Alert: You are flying too low.<br><div style='color:red'> Fly higher or your plane will lose control.</div>" , 8000);
				}
			}
		}else{
			if(mWarningAlertSoundRequest){
				this.turnOffWarningLight();
				clearInterval(mWarningAlertSoundRequest);
				mWarningAlertSoundRequest = null;
			}
		}
		if(airplaneEnvironment.position.y > (Setting.range - Setting.end_game_range) ||
		   airplaneEnvironment.position.y < (- Setting.range + Setting.end_game_range)){
			return false;
		}
		return true;
	}
	this.isOutOfBounds = function(){
		return (airplaneObject.position.y > (Setting.death_range) ||
				airplaneObject.position.y < (- Setting.death_range));
	}
	this.pause = function(){
		if(mWarningAlertSoundRequest){
			clearInterval(mWarningAlertSoundRequest);
			mWarningAlertSoundRequest = null;
		}
	}

	this.update = function(delta){
		delta = Math.min(delta,0.05);
		var fps = getFPS(delta);
		slide(fps);
		lean(fps);
		updatePosition(delta);

		// Tutorial
		if (mTutorialListener) {
			if (airplaneObject.rotation.y >= TUTORIAL_SLIDE_ANGLE) {
				mTutorialListener.onTurnRight();
			}
			else if (airplaneObject.rotation.y <= -TUTORIAL_SLIDE_ANGLE) {
				mTutorialListener.onTurnLeft();
			}

			if (OFFSET - airplaneObject.rotation.x >= TUTORIAL_LEAN_ANGLE) {
				mTutorialListener.onTurnDown();
			}
			else if (OFFSET - airplaneObject.rotation.x <= -TUTORIAL_LEAN_ANGLE) {
				mTutorialListener.onTurnUp();
			}

			if (velocity >= TUTORIAL_VELOCITY_MULTIPLIER * maxVelocity) {
				mTutorialListener.onThrottleChange();
			}
		}
	}

	this.setRollAngle = function(angle){
		if(mLockControls==false){
			rollAngle = angle;
		}
	}

	this.setPitchAngle = function(angle){
		if(mLockControls==false){
			pitchAngle = angle;
		}
	}

	this.setThrust = function(thrustRate){
		if(mLockControls==false){
			bufferthrust = Math.ceil(Math.max((thrustRate/100),0.1) * maxthrust);
		}
	}

	this.getCamera = function(){
		return camera;
	}
	
	this.getPosition = function(){
		return airplaneEnvironment.position;
	}
	this.getRotation = function(){
		return {
			x : airplaneObject.rotation.x - OFFSET,
			y : airplaneObject.rotation.y ,
			z : airplaneObject.rotation.z
		}
	}	
	this.getOrientation = function(){
		return getCompassAngle();
	}
	this.getMaxVelocity = function(){
		return maxVelocity;
	}
	this.getAirplaneData = function(){
		return {
			velocity : Math.ceil( velocity / maxVelocity  * 100),
			pitchAngle : airplaneObject.rotation.x - OFFSET,
			rollAngle : airplaneObject.rotation.y,
			altitude :  GYROCRAFT.Utils.noremalAirplanAltitude(airplaneEnvironment.position.y),
			compassAngle : getCompassAngle()
		};
	}

	this.destroy = function(){
		scene.remove(airplaneEnvironment);
		if(mWarningAlertSoundRequest){
			clearInterval(mWarningAlertSoundRequest);
			mWarningAlertSoundRequest = null;
		}
	}  

	this.restart = function() {
		if(mWarningAlertSoundRequest){
			clearInterval(mWarningAlertSoundRequest);
			mWarningAlertSoundRequest = null;
		}
		airplaneObject.rotation.set(OFFSET, 0 ,0)
		airplaneObject.position.set(0,0,0);
		airplaneEnvironment.position.set(0,0, 0);
		airplaneEnvironment.rotation.set(0, 0, 0);
		
		velocity = 0.1 * maxthrust;
		thrust = Math.pow(velocity, 2) * DRAT_CONST;
	}

	this.turnOnWarningLight = function(){
		if(GYROCRAFT.Connection.getState() == GYROCRAFT.Connection.CONNECTED_TO_DEVICE){
			GYROCRAFT.Connection.send("TurnOn", "WarningLight");
		}
	}
	this.turnOffWarningLight = function(){
		if(GYROCRAFT.Connection.getState() == GYROCRAFT.Connection.CONNECTED_TO_DEVICE){
			GYROCRAFT.Connection.send("TurnOff", "WarningLight");
		}
	}
	this.die=function(){
		mLockControls=true;
		mLockCamera=true;//combine if not needed
		airplaneEnvironment.rotation.set(0, 0, 0);
		pitchAngle=Math.sign(airplaneEnvironment.position.y)*1.5;
		//GYROCRAFT.Connection.send((airplaneEnvironment.position.y>0?"death_up":"death_down"), "PlaySound");
		rollAngle=0;
		thrust=0;
		velocity=0;
	}

	// For tutorial
	this.startTutorial = function(listener) {
	    if (typeof listener.onTurnLeft != "function" || 
	    	typeof listener.onTurnRight != "function" || 
	    	typeof listener.onTurnUp != "function" ||
	    	typeof listener.onTurnDown != "function" ||
	    	typeof listener.onThrottleChange != "function") 
	    {
	    	throw "Error : " + listener + " is not valid listner for tutorial";
	    }

	    mTutorialListener = listener;
	}

	this.stopTutorial = function() {
		mTutorialListener = null;
	}
}





