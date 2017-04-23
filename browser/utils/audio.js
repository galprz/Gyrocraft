var GYROCRAFT = GYROCRAFT || {};
var BGs = [];
var SEs = [];
var Paused = [];
var PausedLoop = [];

GYROCRAFT.Audio = function(src,isBG) {
	var mAudio = new Audio(src);
	var isPlaying=false;
	var isLooping=false;
	if(isBG){
		BGs.push(this);
	}else{
		SEs.push(this);
	}

	function re() {
		var buffer = .44;
		if(mAudio.currentTime > mAudio.duration - buffer){
        	mAudio.currentTime = 0;
        	mAudio.play();
        };
	}

// public:
	this.setVolume = function(vol) {
		mAudio.volume=vol;
	}
	this.playFromStart = function(loop){
		mAudio.currentTime=0;
		isPlaying=false;
		isLooping=false;
		this.play(loop);
	}
	this.play = function(loop) {
		if(loop && !isLooping){
			isLooping=true;
			mAudio.addEventListener('timeupdate', re, false);
		}
		if(!isPlaying || mAudio.ended){
			isPlaying=true;
			mAudio.play();
		}
	}
	this.pause = function(){
		if(isPlaying && !mAudio.ended){
			if(isLooping){
				PausedLoop.push(this);
			}else{
				Paused.push(this);
			}
			this.stop();
		}
	}
	this.stop = function(reset=false) {
		if(isLooping){
			mAudio.removeEventListener('ended', re, false);
			isLooping=false;
		}
		if(isPlaying){
			mAudio.pause();
			isPlaying=false;
		}
		if(reset){
			mAudio.currentTime = 0;
		}
	}
}

GYROCRAFT.Audio.setVolumeBG = function(volume) {
	BGs.forEach(function (audio) {
		audio.setVolume(volume/100);
	});
}

GYROCRAFT.Audio.setVolumeSE = function(volume) {
	SEs.forEach(function (audio) {
		audio.setVolume(volume/100);
	});
}

GYROCRAFT.Audio.pauseAll = function() {
	BGs.forEach(function (audio) {
		audio.pause();
	});
	SEs.forEach(function (audio) {
		audio.pause();
	});
}
GYROCRAFT.Audio.resumeAll = function() {
	PausedLoop.forEach(function (audio) {
		audio.play(true);
	});
	Paused.forEach(function (audio) {
		audio.play();
	});
	Paused=[];
	PausedLoop=[];
}	

GYROCRAFT.Audio.stopAll = function() {
	BGs.forEach(function (audio) {
		audio.stop(true);
	});
	SEs.forEach(function (audio) {
		audio.stop();
	});
	Paused=[];
	PausedLoop=[];
	
}