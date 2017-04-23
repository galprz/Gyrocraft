var GYROCRAFT = GYROCRAFT || {};
GYROCRAFT.DemoAirplane = function(scene , Setting , R){
	var model = {
		object : undefined,
		drag_const : 0.0001,
		max_thrust : 600000,
		acceleration_delay : 1000
	};
	GYROCRAFT.Airplane.call(this,scene,Setting,R,model);
}