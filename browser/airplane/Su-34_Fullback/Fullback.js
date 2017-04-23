var GYROCRAFT = GYROCRAFT || {};
GYROCRAFT.Fullback = function(scene , Setting , R){
	airplaneObject = R.fullback_airplane;
	airplaneObject.rotation.x = -Math.PI/2;
	for (var i=0; i < airplaneObject.children.length; i++){
		if(airplaneObject.children[i] instanceof THREE.Mesh && airplaneObject.children[i].material.map==null){
			airplaneObject.children[i].material = airplaneObject.children[14].material;
		}
	}
	var model = {
		object : airplaneObject,
		offset :  - Math.PI/2,
		drag_const : 0.0001,
		max_thrust : 200000,
		acceleration_delay : 1000

	};
	GYROCRAFT.Airplane.call(this,scene,Setting,R,model);
}