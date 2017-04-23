var GYROCRAFT = GYROCRAFT || {};

GYROCRAFT.World = function(scene,Setting,R){
//Private:
	
//Public:
	this.sky = new GYROCRAFT.Sky(scene,Setting.sky,R.sky);

	//Auto generate checkpoint in world space
	//var checkpoint = new GYROCRAFT.Checkpoint(scene ,Setting.checkpoint , R.checkpoint); 
}
