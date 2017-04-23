var GYROCRAFT = GYROCRAFT || {};
GYROCRAFT.Terminator = function(scene , Setting , R){
	// Fix the airplane object 
	airplaneObject = R.terminator_airplane;
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
		max_thrust : 100000,
		acceleration_delay : 1500
	};
	GYROCRAFT.Airplane.call(this,scene,Setting,R,model);
}