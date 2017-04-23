var GYROCRAFT = GYROCRAFT || {};
GYROCRAFT.SuperFlanker = function(scene , Setting , R){
	airplaneObject = R.super_flanker_airplane;
	airplaneObject.rotation.x = -Math.PI/2;
	for (var i=0; i < airplaneObject.children.length; i++){
		if(airplaneObject.children[i] instanceof THREE.Mesh && airplaneObject.children[i].material.map==null){
			airplaneObject.children[i].material = airplaneObject.children[8].material;
		}
	}
	var model = {
		object : airplaneObject,
		offset :  - Math.PI/2,
		drag_const : 0.0001,
		max_thrust : 150000,
		acceleration_delay : 2000

	};
	GYROCRAFT.Airplane.call(this,scene,Setting,R,model);
}