var GYROCRAFT = GYROCRAFT || {};
var GlobalSetting ;

GYROCRAFT.Utils = function (){
	var airplaneStartingPosition = new THREE.Vector3(0,0,0);
	var airplaneStartingCameraDirection = new THREE.Vector3(0,0,-1);
	var airplaneModel = null;
	var airplaneObject = null;
	var cameraObject  = null;
	return {
		rangeRandom : function( x , y ){
			var min = Math.min(x,y);
			var max = Math.max(x,y);
			return Math.random()*( max - min ) + min;
		},
		randomPositionAroundObject : function(objectPosition , radius , radiusOffset){
			var RAIOUS_OFFSET = radiusOffset || 400;
			radius = GYROCRAFT.Utils.rangeRandom(radius + RAIOUS_OFFSET , radius - RAIOUS_OFFSET );
			var angle = Math.random() * Math.PI * 2 // random angle betwen 0 to 360 (in radians);
			var x = Math.cos( angle ) * radius;
			var y = GYROCRAFT.Utils.rangeRandom(-window.screen.height/2,window.screen.height/2);
			var z = Math.sin( angle ) * radius;
			return new THREE.Vector3(x , y , z).add(objectPosition);
		},
		positionInFrontOfObject : function(objectPosition , direction ,distance){
			var angle =  GYROCRAFT.Utils.rangeRandom(-Math.PI / 4,Math.PI / 4 ); // random angle betwen -45 to 45(in radians) ;
			angle = (angle < 0)?2 * Math.PI+angle : angle;
			var cos = Math.cos(angle) ;
			var sin = Math.sin(angle) 
			//rotate direction vactor on xz plate
			var xRotation = cos * direction.x + sin*direction.z;
			var zRotation = cos * direction.z + sin*direction.x
			var yRotation = GYROCRAFT.Utils.rangeRandom(-0.25,0.25);
			var v = new THREE.Vector3(xRotation,yRotation,zRotation);
			v.normalize(); 
			return v.multiplyScalar(distance).add(objectPosition);
		},
		randomDirectionVector : function(){
	        var teta = GYROCRAFT.Utils.rangeRandom(0 , 2 * Math.PI);
	        var z = GYROCRAFT.Utils.rangeRandom(-1 ,1);
	        var factor = Math.sqrt(1 - Math.pow(z,2))
	        return new THREE.Vector3(
	            factor * Math.cos(teta),
	            factor * Math.sin(teta),
	            z
	        );
   		},
   		inRange : function(value,min,max){
   			return(value > min && value < max);
   		},
   		rotateOnAxis : function( object, axis, angle ) { 
    		object.rotateOnAxis(axis,angle);
		},

		assert : function(stmt) {
			if (!stmt) {
				console.trace("Assertion failed.");
			}
		},
		showToast : function(text) {
			$('#toast-text').text(text);
			$('#toast').fadeIn(400).delay(3000).fadeOut(400);
		},
		noremalAirplanAltitude : function(alt){
			var range = GlobalSetting.game.airplane.range;
			var maxDisplay = GlobalSetting.game.airplane.max_display_altitude;
			return (alt+ range) /  (2 * range) * maxDisplay;
		}

	};
}();
