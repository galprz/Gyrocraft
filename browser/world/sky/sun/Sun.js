var GYROCRAFT = GYROCRAFT || {};
GYROCRAFT.Sun = function(scene,Setting,R){
	var sunLight = new THREE.PointLight( 0xfcfbdd,Setting.intensity,Setting.distance,Setting.decay);
	var offset = new THREE.Vector3(Setting.position_offset.x , Setting.position_offset.y , Setting.position_offset.z);
	sunLight.position.copy(offset);
	
	this.update = function(position){
		sunLight.position.x = position.x;
		sunLight.position.y = position.y;
		sunLight.position.z = position.z;
		sunLight.position.add(offset);
	}
	scene.add(sunLight);
}
