GYROCRAFT.Tutorial = function(R){
	var tutorialCompleted;
	var self = this;
	var phoneObject = R.phone.clone();
	var screenObject = phoneObject.children[23];
	var explanationProgress;
	var visibleObjects = [22,23,24,25];
	for(var i in phoneObject.children){
		if(visibleObjects.indexOf(parseInt(i)) < 0){
			phoneObject.children[i].visible=false;
		}
	}
	this.PRESENTATION = 0;
	this.MISSION = 1;

	var mode = this.MISSION ;

	var renderer,scene,light,camera,requestAnimationID,checkpoint,airplane;
	var tutContianer = $('#tutorial-contianer');
	var subtitles = $('#tutorial-subtitles');
	var pressNext = $('#tutorial-press-next');
	var radarContainer = $('#tutorial-radar-explanation');
	var tutMission = $('#tutorial-mission');
	
	this.READY_TO_START = -1;
	this.MOVE_LEFT = 0;
	this.MOVE_RIGHT = 1;
	this.MOVE_UP = 2;
	this.MOVE_DOWN = 3;
	this.CALIBRATE = 4;
	this.THROTTLE = 5;
	this.GAUGES = 6;
	this.ALARM_PAUSE = 7;
	this.CHECKPOINT = 8;
	this.RADAR_FIRST = 9;
	this.RADAR_SEC = 10;
	this.FINALL_MISSION = 11;
	this.COMPLETED = 12;

	this.PLAY_MOVE_LEFT = 13;
	this.PLAY_MOVE_RIGHT = 14;
	this.PLAY_MOVE_UP  = 15;
	this.PLAY_MOVE_DOWN= 16;
	this.PLAY_CHECKPOINT = 17;
	


	var slide = 0;
	var tutorial = [
		this.MOVE_LEFT,
		this.PLAY_MOVE_LEFT,
		this.MOVE_RIGHT,
		this.PLAY_MOVE_RIGHT,
		this.MOVE_UP,
		this.PLAY_MOVE_UP,
		this.MOVE_DOWN,
		this.PLAY_MOVE_DOWN,
		this.CALIBRATE,
		this.THROTTLE,
		this.GAUGES,
		this.ALARM_PAUSE,
		this.CHECKPOINT,
		this.RADAR_FIRST,
		this.RADAR_SEC,
		this.FINALL_MISSION,
		this.PLAY_CHECKPOINT
	];

	/* subtitles */
	var SUB_PREPARE_THE_PHONE  = "Hold your phone horizontally,";
	var SUB_MOVE_LEFT = "On the next screen, tilt the phone to the left to fly left.";
	var SUB_MOVE_RIGHT = "Good job. Now tilt the phone to the right to fly right.";
	var SUB_MOVE_UP = "Great. Now tilt the phone up to fly upwards,";
	var SUB_MOVE_DOWN = "And down to fly downwards.";
	var SUB_CALIBRATE_EXPLANATION = "This is the calibrate button. Use it to reset your plane's pitch according to your preferred playing position.";
	var SUB_THROTTLE_EXPLANATION = "This is the throttle stick. you can control your speed by pulling it up or down.";
	var SUB_GAUGES_EXPLANATION =  "These are the gauges. they show you your current speed, elevation and orientation."
	var SUB_ALARM_PAUSE = "You can pause the game using the pause button.<br> The alarm will start if something is wrong."
	var SUB_CHECKPOINT = "During the game, you need to fly through checkpoints before the timer runs out.";
	var SUB_RADAR_SAME_PLANE = "The radar shows you your next target.<br>Here, the checkpoint is to your left.<br>The color blue and the up triangle indicate it's above you."
	var SUB_RADAR_SAME_PLANE2 = "In this picture you can see the color changed to green and the arrow down, indicating you need to fly lower."
	var SUB_FINAL_MISSION = "Your final task is to go through a checkpoint, using all that you have learned."

	var PRESS_NEXT_TO_MISSION = "Press <b>Next</b> on your phone to start the Tutorial mission";
	var NAVIGATE_IN_TUT = "Press <b>Next</b> and <b>Back</b> to navigate in the Tutorial slides";

	var tutorial,currentMission;
	/*
		stages animations
	 */
	function resetPhoneRotation(){
		phoneObject.rotation.z = -Math.PI/2;
		phoneObject.rotation.x = 0.2 ;
		phoneObject.rotation.y = Math.PI;
	}

	/* move left animation */
	function moveLeft(){
		phoneObject.position.set(10,20,-90);
		phoneObject.rotation.set( Math.PI/2,Math.PI,-Math.PI/2);
		phoneObject.visible = true;
		checkpoint.visible = false;
		airplane.visible = false;

		var tweenPreparePhone,tweenStraight,tweenLeft;
		screenObject.material.map = R.phone_textures.screen;

		subtitles.html(SUB_PREPARE_THE_PHONE);
		pressNext.html(PRESS_NEXT_TO_MISSION);

		var tweenPreparePhoneOrigin = { x : Math.PI/2 };
		var target = { x : 0.2};
		tweenPreparePhone = new TWEEN.Tween(tweenPreparePhoneOrigin).to(target, 2000);
		tweenPreparePhone.onUpdate(function(){
		    phoneObject.rotation.x = tweenPreparePhoneOrigin.x;
		});
		tweenPreparePhone.delay(1000);
		tweenPreparePhone.onComplete(function(){
			subtitles.html(SUB_MOVE_LEFT);
		});

		var tweenLeftOrigin = { z : -Math.PI/2};
		tweenLeft = new TWEEN.Tween(tweenLeftOrigin).to({ z : -Math.PI/2 - 0.5}, 2000);
		tweenLeft.onUpdate(function(){
		    phoneObject.rotation.z = tweenLeftOrigin.z;
		});
		tweenLeft.onComplete(function(){
			tweenLeftOrigin.z = -Math.PI/2;		
		});

		var tweenStraightOrigin = { z : -Math.PI/2 - 0.5};
		tweenStraight = new TWEEN.Tween(tweenStraightOrigin).to({ z : -Math.PI/2 }, 2000);
		tweenStraight.onUpdate(function(){
		    phoneObject.rotation.z = tweenStraightOrigin.z;
		});
		tweenStraight.onComplete(function(){
			tweenStraightOrigin.z = -Math.PI/2 - 0.5 ;
		});

		tweenPreparePhone.chain(tweenLeft);
		tweenLeft.chain(tweenStraight);
		tweenStraight.chain(tweenLeft);
		tweenPreparePhone.start();

		explanationProgress.done(function(){
			tweenPreparePhone.stop();
			tweenStraight.stop();
			tweenLeft.stop();
		});
	}

	/* move right animation */


	function moveRight(){

		resetPhoneRotation();
		phoneObject.visible = true;
		checkpoint.visible = false;
		airplane.visible = false;
		radarContainer.hide();

		var tweenRight,tweenStraight;

		subtitles.html(SUB_MOVE_RIGHT);
		pressNext.html(PRESS_NEXT_TO_MISSION);
		screenObject.material.map = R.phone_textures.screen;

		var tweenRightOrigin = { z : -Math.PI/2};
		tweenRight = new TWEEN.Tween(tweenRightOrigin).to({ z : -Math.PI/2 + 0.5}, 2000);
		tweenRight.onUpdate(function(){
		    phoneObject.rotation.z = tweenRightOrigin.z;
		});

		var completionCounter = 0;
		tweenRight.onComplete(function(){
			tweenRightOrigin.z = -Math.PI/2;
		
		});

		var tweenStraightOrigin = { z : -Math.PI/2 + 0.5};
		tweenStraight = new TWEEN.Tween(tweenStraightOrigin).to({ z : -Math.PI/2 }, 2000);
		tweenStraight.onUpdate(function(){
		    phoneObject.rotation.z = tweenStraightOrigin.z;
		});

		tweenStraight.onComplete(function(){
			tweenStraightOrigin.z = -Math.PI/2 + 0.5 ;
			
		});

		tweenRight.chain(tweenStraight);
		tweenStraight.chain(tweenRight);
		tweenRight.start();

		explanationProgress.done(function(){
			tweenStraight.stop();
			tweenRight.stop();
		});
	}

	/* move up animation */


	function moveUp(){
		resetPhoneRotation();
		phoneObject.visible = true;
		checkpoint.visible = false;
		airplane.visible = false;
		radarContainer.hide();
		screenObject.material.map = R.phone_textures.screen;

		var tweenUp,tweenStraight;

		subtitles.html(SUB_MOVE_UP);
		pressNext.html(PRESS_NEXT_TO_MISSION);

		var tweenUpOrigin = { x :  0.2 };
		tweenUp = new TWEEN.Tween(tweenUpOrigin).to({ x : 0.2 + 0.5}, 2000);
		tweenUp.onUpdate(function(){
		    phoneObject.rotation.x = tweenUpOrigin.x;
		});

		tweenUp.onComplete(function(){
			tweenUpOrigin.x =  0.2 ;			
		});

		var tweenStraightOrigin = { x :  0.2 + 0.5};
		tweenStraight = new TWEEN.Tween(tweenStraightOrigin).to({ x : 0.2 }, 2000);
		tweenStraight.onUpdate(function(){
		    phoneObject.rotation.x = tweenStraightOrigin.x;
		});
		tweenStraight.onComplete(function(){
			tweenStraightOrigin.x =  0.2 + 0.5;
		});

		tweenUp.chain(tweenStraight);
		tweenStraight.chain(tweenUp);
		tweenUp.start();

		
		explanationProgress.done(function(){
			tweenStraight.stop();
			tweenUp.stop();
		});

	}
	/* move down animation */


	function moveDown(){
		resetPhoneRotation();
		phoneObject.visible = true;
		checkpoint.visible = false;
		airplane.visible = false;
		radarContainer.hide();
		phoneObject.position.z = -90;
		screenObject.material.map = R.phone_textures.screen;

		var tweenDown,tweenStraight;
		subtitles.html(SUB_MOVE_DOWN);
		pressNext.html(PRESS_NEXT_TO_MISSION);

		var tweenDownOrigin = { x :  0.2 };
		tweenDown = new TWEEN.Tween(tweenDownOrigin).to({ x : 0.2 - 0.5}, 2000);
		tweenDown.onUpdate(function(){
		    phoneObject.rotation.x = tweenDownOrigin.x;

		});

		tweenDown.onComplete(function(){
			tweenDownOrigin.x =  0.2 ;			
		});

		var tweenStraightOrigin = { x :  0.2 - 0.5};
		tweenStraight = new TWEEN.Tween(tweenStraightOrigin).to({ x : 0.2 }, 2000);
		tweenStraight.onUpdate(function(){
		    phoneObject.rotation.x = tweenStraightOrigin.x;
		});
		tweenStraight.onComplete(function(){
			tweenStraightOrigin.x =  0.2 - 0.5;
		})
		tweenDown.chain(tweenStraight);
		tweenStraight.chain(tweenDown);
		tweenDown.start();

		explanationProgress.done(function(){
			tweenDown.stop();
			tweenStraight.stop();
		});
	}

	/* animation about how to get a checkpoint  */

	
	function calibrateExplanation(){
		resetPhoneRotation();
		phoneObject.visible = true;
		checkpoint.visible = false;
		airplane.visible = false;
		radarContainer.hide();
		subtitles.html("");
		phoneObject.rotation.x = 0.2;
		phoneObject.position.z = -90;
		screenObject.material.map = R.phone_textures.screen;
		pressNext.html(NAVIGATE_IN_TUT);

		var tweenFaceToCameraOrigin = { x :  0.2 };
		tweenFaceToCamera = new TWEEN.Tween(tweenFaceToCameraOrigin).to({ x : Math.PI/2}, 2000);
		tweenFaceToCamera.onUpdate(function(){
		    phoneObject.rotation.x = tweenFaceToCameraOrigin.x;
		});
		tweenFaceToCamera.start();

		var tweenComeForwardOrigin = { z : -90 };
		tweenComeForward = new TWEEN.Tween(tweenComeForwardOrigin).to({ z : -40}, 3000);
		tweenComeForward.onUpdate(function(){
		    phoneObject.position.z = tweenComeForwardOrigin.z;
		});	
		tweenComeForward.onComplete(function(){
			subtitles.html(SUB_CALIBRATE_EXPLANATION);
			screenObject.material.map = R.phone_textures.screen_calibrate;
		});
		tweenComeForward.start();

		explanationProgress.done(function(){
			tweenComeForward.stop();
			tweenFaceToCamera.stop();
		});
	}

	function throttleExplanation(){
		phoneObject.visible = true;
		checkpoint.visible = false;
		airplane.visible = false;
		phoneObject.rotation.x = Math.PI/2;
		phoneObject.position.z = -40;
		radarContainer.hide();
		subtitles.html(SUB_THROTTLE_EXPLANATION);
		pressNext.html(NAVIGATE_IN_TUT);

		screenObject.material.map = R.phone_textures.screen_throttle;
	}

	function gaugesExplanation(){
		phoneObject.visible = true;
		checkpoint.visible = false;
		airplane.visible = false;
		radarContainer.hide();	
		subtitles.html(SUB_GAUGES_EXPLANATION);
		screenObject.material.map = R.phone_textures.screen_widgets;

	}
	
	function alarmPauseExplanation(){
		phoneObject.visible = true;
		checkpoint.visible = false;
		airplane.visible = false;
		radarContainer.hide();	
		subtitles.html(SUB_ALARM_PAUSE);
		pressNext.html(NAVIGATE_IN_TUT);
		screenObject.material.map = R.phone_textures.screen_alarm_pause;
	}
	


	function checkpointExplanation(){
		var TIME_CHECKPOINT_EXPLANATION = 7000;
		phoneObject.visible = false;
		checkpoint.visible = true;
		airplane.visible = false;
		radarContainer.hide();
		checkpoint.rotation.y = 0;

		subtitles.html(SUB_CHECKPOINT);
		pressNext.html(NAVIGATE_IN_TUT);

		var tweenSpinCheckpointOrigin = {y : 0};
		var tweenSpinCheckpoint = new TWEEN.Tween(tweenSpinCheckpointOrigin).to({ y : 2*Math.PI}, TIME_CHECKPOINT_EXPLANATION);
		tweenSpinCheckpoint.onUpdate(function(){
			checkpoint.rotation.y = tweenSpinCheckpointOrigin.y;
		});
		tweenSpinCheckpoint.start();
		explanationProgress.done(function(){
			tweenSpinCheckpoint.stop();
		});
	}
	
	function radarFirstExplanation(){
		phoneObject.visible = false;
		checkpoint.visible = false;
		airplane.visible = false;
		radarContainer.show();

		radarContainer.attr('src',R.phone_textures.radar_same_plane.src);
		subtitles.html(SUB_RADAR_SAME_PLANE);
		pressNext.html(NAVIGATE_IN_TUT);

	}


	function radarSecondExplanation(){
		phoneObject.visible = false;
		checkpoint.visible = false;
		airplane.visible = false;
		radarContainer.show();
		radarContainer.attr('src',R.phone_textures.radar_same_plane2.src);
		subtitles.html(SUB_RADAR_SAME_PLANE2);
		pressNext.html(NAVIGATE_IN_TUT);

	}

	function finishMissionExplanation(){
		phoneObject.visible = false;
		checkpoint.visible = true;
		airplane.visible = true;
		radarContainer.hide();
		checkpoint.rotation.y = 2*Math.PI;
		subtitles.html(SUB_FINAL_MISSION);
		pressNext.html(PRESS_NEXT_TO_MISSION);

	}


	function render(){
		TWEEN.update();
		renderer.render( scene, camera );
		requestAnimationID = requestAnimationFrame( render );
	}

	this.showExplanation = function(){
		tutMission.hide();
		if(this.getState() == this.COMPLETED || this.getState()  == this.READY_TO_START){
			return;
		}
		if(explanationProgress){
			explanationProgress.resolve();
		}
		explanationProgress = $.Deferred();
		switch(this.getState()){
			case this.MOVE_LEFT:
				moveLeft();
				break;
			case this.MOVE_RIGHT:
				moveRight();
				break;
			case this.MOVE_UP:
				moveUp();
				break;
			case this.MOVE_DOWN:
				moveDown();
				break;
			case this.CALIBRATE:
				calibrateExplanation();
				break;
			case this.THROTTLE:
				throttleExplanation();
				break;
			case this.GAUGES:
				gaugesExplanation();
				break;
			case this.ALARM_PAUSE:
				alarmPauseExplanation();
				break;
			case this.CHECKPOINT:
				checkpointExplanation();
				break;
			case this.RADAR_FIRST:
				radarFirstExplanation();
				break;
			case this.RADAR_SEC:
				radarSecondExplanation();
				break;
			case this.FINALL_MISSION:
				finishMissionExplanation();
				break;
			default :
				return null;
		}
		tutContianer.show();
		render();
		mode = this.PRESENTATION;
	}

	this.hideExplanation = function(){
		mode = this.MISSION;
		cancelAnimationFrame(requestAnimationID);
		tutContianer.hide();
	}
	/**
	 * prepare the tutorial 
	 **/

	this.initiate = function(){
		renderer = new THREE.WebGLRenderer({ alpha: true });
		renderer.setSize( window.innerWidth, window.innerHeight );
		document.getElementById("tutorial").appendChild( renderer.domElement );

		scene = new THREE.Scene();
		scene.add(new THREE.AmbientLight(0xFFFFFF));
		
		camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
		camera.position.set(0,0,5);
		scene.add(camera);

		scene.add(phoneObject);
		
		var geometry = new THREE.TorusGeometry( 10, 0.7, 5, 100 );
		var material = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
		checkpoint = new THREE.Mesh( geometry, material );
		checkpoint.position.set(0,0,-30);
		scene.add( checkpoint );
		
		airplane = R.tutorial_airplane.clone();
		airplane.position.set(0,0,-10);

		scene.add( airplane );

		slide = 0;
		tutorialCompleted = $.Deferred();
		this.done = tutorialCompleted.done;

	}

	/**
	 * restart the tutorial 
	 */
	this.reset = function(){
		slide = 0;
		radarContainer.hide();
		if(tutorialCompleted){
			tutorialCompleted.resolve();
		}
		tutorialCompleted = $.Deferred();
		this.done = tutorialCompleted.done;
	}
	


	this.finish = function(){
		tutorialCompleted.resolve();
	}



	this.next = function(){
		slide++;
		if(tutorial.length == slide){
			tutorialCompleted.resolve();
			return false;
		}
		return true;
	}

	this.back = function(){
		if(slide > 0){
			slide--;
		}
		
	}

	this.show  = function(){
		tutContianer.show();
	}

	this.hide = function(){
		tutContianer.hide();
	}

	this.getState = function(){
		return tutorial[slide];
	}
	this.isMissionState = function(){
		switch(this.getState()){
			case this.PLAY_MOVE_LEFT:
				return true;
			case this.PLAY_MOVE_RIGHT:
				return true;
			case this.PLAY_MOVE_UP:
				return true;
			case this.PLAY_MOVE_DOWN:
				return true;
			case this.PLAY_CHECKPOINT:
				return true;
			default :
				return false;
		}
	}
	this.getMode = function(){
		return mode;
	}
	this.finish = function(arg){
		if(explanationProgress){
			explanationProgress.resolve();
		}
		tutorialCompleted.resolve(arg);
	}
/*

*/
}