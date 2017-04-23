GYROCRAFT.Game = function(Setting, R, onEndGame){
//Private:
	var STARTING_TIME = 60;
   
	//The game implements ConnectionListener "interface"
	IConnectionListener.call(this);
	var self = this;

	this.RUNNING = 0;
    this.PAUSED = 1;
    this.NOT_STARTED = 2;
	var mClock = new THREE.Clock();
	var mScene = new THREE.Scene();
	var mAnimationFrameId;
	var mState = this.NOT_STARTED;
	//algo vars
	var mCheckpoint;
	var mCheckpointCount;
	var mChekpointSumHeight;
	var mCheckpointSeries;
	var mCheckpointDirection;
	
	var mTimer = new GYROCRAFT.Timer("timer-container","timer");
	var mPointsCounter = new GYROCRAFT.PointsCounter("points-container","points","added-points");
	var mHighScoreContainer = $('#high-score');
	var mBackgroundMusic = new GYROCRAFT.Audio(R.background_music.src,true);
	var mTimeEnding = new GYROCRAFT.Audio(R.time_ending.src,true);
	var mCheckpointSound = new GYROCRAFT.Audio(R.checkpoint_sound.src,false);
	var mDeathUp = new GYROCRAFT.Audio(R.death_up.src,false);
	var mDeathDown = new GYROCRAFT.Audio(R.death_down.src,false);
	var mWind = new GYROCRAFT.Audio(R.wind.src,false);
	

	var stopBGTimeout; //for storing setTimeout variable
	var mSessionSettings;
	var mHighScore;
	var mDeathFlag = false;
	var mTutorial;	
	var mPlayerAirplane = new GYROCRAFT.DemoAirplane(mScene , Setting.airplane , R.airplane);
	var mRadar = new GYROCRAFT.Radar(mScene,Setting.radar,R);
	var mPrimeryCamera = mPlayerAirplane.getCamera();
	var mWorld = new GYROCRAFT.World(mScene ,Setting.world, R.world);
	var mLight = new THREE.AmbientLight(0xFFFFFF);
	var tutorialCheckpoint = false;
	mScene.add(mLight);
	
	var mRenderer = new THREE.WebGLRenderer({ alpha: true });
	mScene.mainRender = render;
	mRenderer.setPixelRatio( window.devicePixelRatio );
	mRenderer.setSize( window.innerWidth, window.innerHeight );
	document.getElementById("game").appendChild(mRenderer.domElement);

	

	var mTutorial;
	var missionflage = true;
	var mMissionTxt = 	$('#tutorial-mission');
	function movmentObjectiveCompleted(){
		var airplaneRotation = mPlayerAirplane.getRotation();
		switch(mTutorial.getState()){
			case mTutorial.PLAY_MOVE_LEFT:
				if(!mMissionTxt.is(":visible") ){
					mMissionTxt.html("Tilt the phone left to complete the mission or press <b> Next</b> to move to the next mission");
					mMissionTxt.show();
				}
				
				if(airplaneRotation.y <= -Setting.tutorial.slide_angle){
					return true;
				}
				break;
			case mTutorial.PLAY_MOVE_RIGHT:
				if(!mMissionTxt.is(":visible") ){
					mMissionTxt.html("Tilt the phone right to complete the mission or press <b> Next</b> to move to the next mission");
					mMissionTxt.show();
				}
			
				if(airplaneRotation.y >= Setting.tutorial.slide_angle){
					return true;
				}
				break;
			case mTutorial.PLAY_MOVE_UP:
				
				if(!mMissionTxt.is(":visible")){
					mMissionTxt.html("Tilt the phone up to complete the mission, or press <b> Next</b> to move to the next mission");
					mMissionTxt.show();
				}
				if(airplaneRotation.x >= Setting.tutorial.lean_angle){
					return true;
				}
				break;
			case mTutorial.PLAY_MOVE_DOWN:
				
				if(!mMissionTxt.is(":visible") ){
					mMissionTxt.html("Tilt the phone down to complete the mission, or press <b> Next</b> to move to the next mission");
					mMissionTxt.show();
				}
				if(airplaneRotation.x <= -Setting.tutorial.lean_angle){
					return true;
				}
				break;
			case mTutorial.PLAY_CHECKPOINT:
				if(!mMissionTxt.is(":visible") ){
					mMissionTxt.html("Navigate to the checkpoint to complete the mission, or press <b> Next</b> to finish the tutorial");
					mMissionTxt.show();
				}
				
				break;
		}
		return false;

	}
	function showTutorialObjective(){
		cancelAnimationFrame(mAnimationFrameId);
		mTutorial.showExplanation();
	}

	function render(){
		var timeDelta = mClock.getDelta();
		//Update sky 
			mWorld.sky.update( mPlayerAirplane.getPosition() , mPrimeryCamera.getWorldDirection());
		//Update player airplane
			mPlayerAirplane.update( timeDelta );
			mRadar.update(mPlayerAirplane.getPosition(),mPlayerAirplane.getOrientation());
		if(GYROCRAFT.Connection.getState() == GYROCRAFT.Connection.CONNECTED_TO_DEVICE && mState == self.RUNNING){
			GYROCRAFT.Connection.send(JSON.stringify(mPlayerAirplane.getAirplaneData()), "AirplaneData");
		}
		var continueRendering = true;
		if(!mDeathFlag && !mPlayerAirplane.isLegalAltitude()){
			mDeathFlag=true;
			mPlayerAirplane.die();
			mDeathUp.playFromStart();
			mTimer.pause();
		}
		if(mDeathFlag && mPlayerAirplane.isOutOfBounds()){
			if(mSessionSettings && mSessionSettings.tutorialMode){
				GYROCRAFT.Connection.send(null, "EndTutorialDeath");
				mTutorial.finish(0);
			}else{
				onTimeEnd();
			}
			continueRendering = false;
		}
		GYROCRAFT.Utils.Messenger.displayMessage();
		//Update sun position 
			mWorld.sky.sun.update(mPlayerAirplane.getPosition());

		// Check collision
			if(mCheckpoint!=undefined && !mDeathFlag){
				mCheckpoint.update(mPlayerAirplane.getPosition());
			}
		if (mSessionSettings && mSessionSettings.tutorialMode ) {
			if(movmentObjectiveCompleted()){
			
				continueRendering = false;
				mTutorial.next();
				showTutorialObjective();		
			}
		}
		mRenderer.render( mScene, mPrimeryCamera );
		if(continueRendering && mState!=self.PAUSED){
			mAnimationFrameId = requestAnimationFrame(render);
		}
		
	}

	
	function onWindowResize( event ) {
		mRenderer.setSize( window.innerWidth, window.innerHeight );
		mPrimeryCamera.aspect = window.innerWidth / window.innerHeight;
		mPrimeryCamera.updateProjectionMatrix();
	}
	window.addEventListener( 'resize', onWindowResize, false );

	function pickAirplane(type){
		mPlayerAirplane.destroy();
		if(type == "Terminator"){
			mPlayerAirplane = new GYROCRAFT.Terminator(mScene , Setting.airplane , R.airplane);
		}else if(type == "Fullback"){
			mPlayerAirplane = new GYROCRAFT.Fullback(mScene , Setting.airplane , R.airplane);
		}else if(type == "Super Flanker"){
			mPlayerAirplane = new GYROCRAFT.SuperFlanker(mScene , Setting.airplane , R.airplane);
		}else if(type == "demo") {
			mPlayerAirplane = new GYROCRAFT.DemoAirplane(mScene , Setting.airplane , R.airplane);
		}
		mPrimeryCamera = mPlayerAirplane.getCamera();
	}

	function end() {
		mRadar.removeFromScene();
		mPlayerAirplane.restart(); //to handle airplane death location
		mDeathFlag=false;
		pickAirplane("demo");

		cancelAnimationFrame(mAnimationFrameId);
		mAnimationFrameId = requestAnimationFrame(render);
		
		mState = self.NOT_STARTED;
		mPlayerAirplane.pause();
		mPlayerAirplane.turnOffWarningLight();
		GYROCRAFT.Audio.stopAll();
		if(mCheckpoint){
			mRadar.unRegister(mCheckpoint.getPosition());
			mCheckpoint.destroy();
			mCheckpoint = null;
		}
	}

	function hideAll() {
		$('#connectionError-box').hide();
		$('#pause-box').hide();
		$('#endGame-box').hide();
		$('#endTutorial-box').hide();
	}

	function control(cmd) {
		switch (cmd) {
			case "pause":
				if(mSessionSettings.tutorialMode){
					if(mTutorial.getMode() == mTutorial.PRESENTATION){
						return;
					}
					$('#pause-box').show();
					cancelAnimationFrame(mAnimationFrameId);
					mPlayerAirplane.pause();
					GYROCRAFT.Audio.pauseAll();
					return;
				}
				if (mState == self.RUNNING) {
					$('#pause-box').show();
					cancelAnimationFrame(mAnimationFrameId);
					mState = self.PAUSED;
					mPlayerAirplane.pause();
					mTimer.pause();
					GYROCRAFT.Audio.pauseAll();
				}
				break;

			case "resume":
				if(mSessionSettings.tutorialMode){
					if(mTutorial.getMode() == mTutorial.PRESENTATION){
						return;
					}
					$('#pause-box').hide();
					mAnimationFrameId = requestAnimationFrame(render);
					GYROCRAFT.Audio.resumeAll();	
					return;
				}
				if (mState == self.PAUSED) {
					$('#pause-box').hide();
					mAnimationFrameId = requestAnimationFrame(render);
					mState = self.RUNNING;
					if(!mDeathFlag){
						mTimer.start();
					}
					GYROCRAFT.Audio.resumeAll();				
					}
				break;

			case "go_to_main":
				end();
				hideAll();
				mPointsCounter.hide();
				mTimer.hide();
				if (mSessionSettings.isTutorial) {
					mTutorial.stop();
				}
				GYROCRAFT.Connection.unregisterListener();
				onEndGame(false);
				break;

			case "restart":
				if(mSessionSettings.tutorialMode){
					return;
				}
				if (mState != self.RUNNING) {
					hideAll();
					pickAirplane(mSessionSettings.airplane);
					mPlayerAirplane.restart();
					if (mSessionSettings.isTutorial) {
						mTutorial.stop();
						mTutorial = new GYROCRAFT.Tutorial(mScene, mRadar, mPlayerAirplane, Setting, onTutorialEnd);
						mTutorial.start();
					}
					else {
						mDeathFlag=false;
						mCheckpointCount=0;
						mCheckpointDirection=null;
						generateCheckpoint(Setting.checkpoint_algo,Setting.airplane);
						GYROCRAFT.Audio.stopAll();
						mBackgroundMusic.play(true);
						mPointsCounter.restart();
					}
					mRadar.addToScene();
					if (mState == self.PAUSED) {
						mAnimationFrameId = requestAnimationFrame(render);
					}
					mState = self.RUNNING;
				}
				break;
	
			default:
				console.warn("Got unknown control message: " + cmd);
		}
	}

	$('#return_to_main').click(function(){
		$('#connectionError-box').hide();
		mPointsCounter.hide();
		mTimer.hide();
		GYROCRAFT.Connection.unregisterListener();
		onEndGame(true);
	});
	
//Public:
	this.initiate =  function(){
		mTimer.setTime(STARTING_TIME);
		mWorld.sky.createNewClouds();
		mTimer.addListener(this);
		render();
	}

	this.start = function(sessionSettings){
		mSessionSettings = sessionSettings;
		// choose an airplane 
			pickAirplane(sessionSettings.airplane);
		// generate new clouds at the begining of the game
			mWorld.sky.createNewClouds();
		// move the counter logic to other place
		mCheckpointCount = 0;
		mCheckpointDirection=null;

		// register game as listener to connection
		GYROCRAFT.Connection.registerListener(this);
		GYROCRAFT.Connection.send("start", "Control");
		// set the state of the game to running
			mState = this.RUNNING;
		// set previous high score
			mHighScore = sessionSettings.highScore;
			mHighScoreContainer.text(mHighScore);
		GYROCRAFT.Audio.setVolumeBG(sessionSettings.volume);
		GYROCRAFT.Audio.setVolumeSE(sessionSettings.volume);


		if(sessionSettings.tutorialMode){
			if(!mTutorial){
				var airplane =  R.airplane.terminator_airplane;
				if(sessionSettings.airplane == "Terminator"){
					airplane = R.airplane.terminator_airplane;
				}else if(sessionSettings.airplane == "Fullback"){
					airplane = R.airplane.fullback_airplane;
				}else if(sessionSettings.airplane == "Super Flanker"){
					airplane = R.airplane.super_flanker_airplane;
				}
				R.tutorial.tutorial_airplane = airplane;
				mTutorial = new GYROCRAFT.Tutorial(R.tutorial);
				mTutorial.initiate();	
			}else{
				mTutorial.finish(1);
				mTutorial.reset();
			}
			$('#tutorial-mission').html("");
			$('#tutorial-mission-container').show();

			mTutorial.done(function(reason){
				$('#tutorial-mission-container').hide();
				mTutorial.hide();
				if(reason == 1){
					return;
				}
				if(reason != 0){
					GYROCRAFT.Connection.send(null, "EndTutorial");
					GYROCRAFT.Utils.Messenger.send("Good job. You've finished the tutorial successfully." , 8000);
				}
				mState = self.PAUSED
				end();
				onEndGame(false);

			})
			showTutorialObjective();
		}else{
			// not in tutorial mode
			// show the timer 
			mTimer.show();
			mBackgroundMusic.play(true);

			// start to count points	
			mPointsCounter.show();	
			mPointsCounter.restart();
			generateCheckpoint(Setting.checkpoint_algo,Setting.airplane);
			mRadar.addToScene();
		}


	}

	this.onIncomingMessage = function(message){
		var body = message.body;
		switch (message.type) {
			case "SensorData": 
				if (mState == self.RUNNING) {
					mPlayerAirplane.setPitchAngle(body.Pitch);
					mPlayerAirplane.setRollAngle(body.Roll);
				}
				break;

			case "Thrust":
				mPlayerAirplane.setThrust(body);
				break;

			case "Control":
				control(body);
				break;

			case "Volume":
				GYROCRAFT.Audio.setVolumeBG(body);
				GYROCRAFT.Audio.setVolumeSE(body);

				break;

			case "HighScore":
				mHighScore = body;
				mHighScoreContainer.text(mHighScore);
				break;
			case "NextTutorial":
				if(!mTutorial.next())
					return;
				if(mTutorial.getState() == mTutorial.PLAY_CHECKPOINT){
					if(!tutorialCheckpoint){
						generateCheckpoint(Setting.checkpoint_algo,Setting.airplane);
						mRadar.addToScene();
					}
				}
				if(mTutorial.isMissionState()){
					mTutorial.hideExplanation();
					render();
				}else{
					showTutorialObjective();
				}
				break;
			case "PreviousTutorial":
				if(mTutorial.getState() == mTutorial.PLAY_CHECKPOINT){
					tutorialCheckpoint == false;
					mRadar.removeFromScene();
				}
				mTutorial.back();
				if(mTutorial.isMissionState()){
					mTutorial.back();
				}
				
				showTutorialObjective();

				break;
			case "EndTutorial":
				mTutorial.finish(0);
				break;
		}
	}

	this.onPeerLeft = function(peerId, peerInfo) {
		if(mSessionSettings.tutorialMode){
			mTutorial.finish(1);
		}

		mState = this.PAUSED;
		mTimer.pause();
		end();
		hideAll();
		$('#connectionError-box').show();
	}

	this.onSessionDisconnect = function() {
		if(mSessionSettings.tutorialMode){
			mTutorial.finish(1);
		}
		mState = this.PAUSED;
		mTimer.pause();
		end();
		hideAll();
		$('#connectionError-box').show();
	}

	function onTimeEnd(){
		end();
		$('#score').html(mPointsCounter.getScore());
		$('#endGame-box').show();
		GYROCRAFT.Connection.send(mPointsCounter.getScore(), "EndGame");
	}

	this.onTimeEnd = function() {
		onTimeEnd();
	}

	this.onLastFive = function() {
		stopBGTimeout=setTimeout(function(){ mBackgroundMusic.stop(); }, 1500);
		mTimeEnding.playFromStart();
	}
	this.getID = function() {
		return "Game";
	}

	this.startTutorial = function(sessionSettings) {
		pickAirplane(sessionSettings.airplane);
		mSessionSettings = sessionSettings;
		GYROCRAFT.Audio.setVolumeBG(sessionSettings.volume);
		GYROCRAFT.Audio.setVolumeSE(sessionSettings.volume);
		mWorld.sky.createNewClouds();
		mRadar.addToScene();
		GYROCRAFT.Connection.registerListener(this);
		GYROCRAFT.Connection.send("start", "Control");
		mState = self.RUNNING;
		mTutorial = new GYROCRAFT.Tutorial(mScene, mRadar, mPlayerAirplane, Setting, onTutorialEnd);
		mTutorial.start();
	}


	function positionForCheckpoint(algoSetting,airplaneSetting,curY, direction){		
		var radiusXZ = GYROCRAFT.Utils.rangeRandom(algoSetting.XZRangeMin,algoSetting.XZRangeMax),
			angle =  GYROCRAFT.Utils.rangeRandom(0,Math.PI*2),
			cos = Math.cos(angle),
			sin = Math.sin(angle),
			xRotation = cos * direction.x + sin*direction.z,
			zRotation = cos * direction.z + sin*direction.x,
			yDistance,minY,maxY;
		if(mCheckpointDirection==null){
			mCheckpointDirection=(GYROCRAFT.Utils.rangeRandom(0,1)>algoSetting.downChance)?1:-1;
			mCheckpointSeries=0;
			mChekpointSumHeight=0;
		}
		switch (mCheckpointSeries){
			case 0: minY=-algoSetting.Yrange;
					maxY=algoSetting.Yrange;
				break;
			case 1: minY=Math.max(-algoSetting.Yrange,-(mChekpointSumHeight*mCheckpointDirection+algoSetting.Yrange));
					maxY=algoSetting.Yrange;
				break;
			case 2: minY=Math.max(-algoSetting.Yrange,-(mChekpointSumHeight*mCheckpointDirection));
					maxY=algoSetting.Yrange;
				break;
			case 3: minY=Math.max(-algoSetting.Yrange,(algoSetting.YMinChangeRate-mChekpointSumHeight*mCheckpointDirection));
					maxY=algoSetting.Yrange;
				break;
		}
		yDistance = (mCheckpointDirection==1)?GYROCRAFT.Utils.rangeRandom(minY,maxY):GYROCRAFT.Utils.rangeRandom(-maxY,-minY);
		mChekpointSumHeight+=yDistance;

		var v = new THREE.Vector3(xRotation,0,zRotation);
		v.normalize(); 
		v.multiplyScalar(radiusXZ);
		v.setY(yDistance);
		if(curY+v.y>+airplaneSetting.range-airplaneSetting.warning_range){
			v.setY(-Math.abs(v.y));
			mCheckpointSeries=3;
			mCheckpointDirection=-mCheckpointDirection;
		}
		else if(curY+v.y<-airplaneSetting.range+airplaneSetting.warning_range){
			v.setY(Math.abs(v.y));
			mCheckpointSeries=3;
			mCheckpointDirection=-mCheckpointDirection;
		}
		if(mCheckpointSeries==3){
			mChekpointSumHeight=0;
			mCheckpointSeries=0;
		}else{
			mCheckpointSeries++;
		}
		return {
		pos:v,
		angleXZ:angle,
		distance:v.length()
		};
	}

	function generateCheckpoint(algoSetting,airplaneSetting){
		mCheckpointCount++; 
		var AirplanePos = mPlayerAirplane.getPosition(),diff=mCheckpointCount,rateOfChange=algoSetting.rateOfChange;
			
		var res = positionForCheckpoint(algoSetting,airplaneSetting,
										AirplanePos.y,mPrimeryCamera.getWorldDirection());
		var smallAngle=res.angleXZ>Math.PI?2*Math.PI-res.angleXZ:res.angleXZ,
			RotationTime=algoSetting.safetyBonus*smallAngle*algoSetting.timePer180/Math.PI,
			precentSpeed=mPlayerAirplane.getMaxVelocity()*(diff<=rateOfChange ? diff/rateOfChange : 1),
			extraTime=(diff<rateOfChange*2 ? algoSetting.bonusTime*(1-diff/(rateOfChange*2)) : 0)+1;
		var timeToTarget=res.distance/precentSpeed+extraTime;+RotationTime;
		if(mCheckpoint!=undefined){
			mRadar.unRegister(mCheckpoint.getPosition());
			mCheckpoint.destroy();
		}
		var newPos=res.pos;
		newPos.add(AirplanePos);
		mCheckpoint=new GYROCRAFT.Checkpoint(newPos,onCheckpointCollision,mScene,Setting.world.checkpoint);
		mCheckpoint.addToScene();
		mRadar.register(newPos, AirplanePos, mPlayerAirplane.getOrientation());
		if(mSessionSettings && !mSessionSettings.tutorialMode){
			mTimer.setTime(Math.ceil(timeToTarget));
			mTimer.start();
		}
	
	}
	function onCheckpointCollision() {
		if(mSessionSettings && mSessionSettings.tutorialMode){
			//end tutorial;
			mTutorial.next();		
			return;
		}
		var bonus=Math.ceil(mTimer.getCurrentTime()/mTimer.getMaxTime()*10*mCheckpointCount);
		clearTimeout(stopBGTimeout)
		mTimeEnding.stop(true);
		mBackgroundMusic.play(true);
		//GYROCRAFT.Connection.send("checkpoint", "PlaySound");
		mCheckpointSound.playFromStart();
		mPointsCounter.addPoints(100,bonus);
		generateCheckpoint(Setting.checkpoint_algo,Setting.airplane);
	}
};