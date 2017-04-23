var GYROCRAFT = GYROCRAFT || {};
GYROCRAFT.Sky = function(scene,Setting,R){
//Private:
	var clouds = [];
	var background_left = 0,background_top = 70;
	var spreadRadious = Setting.clouds.spread_radius;
	var numberOfClouds = Setting.clouds.number_of_clouds;
	$('body').css("background-image", "url(" + R.background.src + ")");  
    $('body').css('background-position', Setting.background.left_offset + 'px 50%');
	
	var maxDistance = Setting.clouds.spread.max 
	var minDistance = Setting.clouds.spread.min;
	var positionInFrontOfObject = GYROCRAFT.Utils.positionInFrontOfObject;
    /**
     * Generate new cloud according to the index of the cloud.
     * distance form position decided according to the index of the cloud
     * @param  int [0..numberOfClouds-1] distance factor  cloud distance factor  the higher the factor the longer the distance
     * @param  Three.Vector3   origin position position  [description]
     * @param  Three.Vector3   direction direction to point the cloud
     * @return GYROCRAFT.Cloud new cloud
     */
    function generateCloud(factor,position,direction){
    	var distance = (maxDistance - minDistance)*( factor / Math.max((numberOfClouds - 1),1)) + minDistance;
    	return new GYROCRAFT.Cloud(scene,Setting.clouds,R.clouds,positionInFrontOfObject(position,direction,distance));
    }

//Public:

	/**
	 * Auto generate new cloud if needed and update the sky background image
	 * @param Three.Vector3 Generate new cloud in front of this position if needed
	 * @param Three.Vector3 Generate new cloud in the direction of that vector	
	 * @return undefined
	 */
	var currentIndex = 0;
	this.update = function(position,direction){
		//Generate new clouds
		for(var i = 0 ; i<clouds.length ; i++){
			distance = clouds[i].position.distanceTo(position);
			if(distance > Setting.clouds.cloud_limit_distance){
				clouds[i].destroy();
				clouds[i] = generateCloud(currentIndex,position,direction);	
				currentIndex = (currentIndex + 1) % numberOfClouds;	
			}
		}

		//Update background image
		
		//Animate roll effect
		angle = Math.atan2(direction.x, direction.z) - Math.atan2(0, -1);
		if (angle < 0){
	   		angle = angle + 2 * Math.PI;
		}
		var xPosition = angle / (Math.PI * 2) * R.background.width	+ Setting.background.left_offset
		$('body').css('background-position-x', xPosition + 'px');
		//Animate pitch
		var yPosition = Math.sign(position.y) * Math.min(Math.abs(position.y/GlobalSetting.game.airplane.range),1) * 50;
		yPosition = 50- yPosition;
		$('body').css('background-position-y', yPosition + '%');

	}

   	/**
     * Generate clouds at the beginning of the game
     * @return undefined
     */
	this.createNewClouds = function(){
  		var zeroVector = new THREE.Vector3(0,0,0);
		var startingDirection = new THREE.Vector3(0,0,-1);
		for(var i = 0 ; i < numberOfClouds ; i++){
			if(clouds[i]){
				clouds[i].destroy();
			}
			clouds.push(generateCloud(i,zeroVector,startingDirection));
		}
	}

	this.sun = new GYROCRAFT.Sun(scene,Setting.sun);


}