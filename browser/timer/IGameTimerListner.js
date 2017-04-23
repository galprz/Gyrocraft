GYROCRAFT = GYROCRAFT || {};
GYROCRAFT.IGameTimerListner = function(){
	var mListnerUniqeID = 0;

	return function(){
		var id = mListnerUniqeID++;
		this.getID = function(){return id;}
		this.onTimeEnd = function(){
			console.warn("On time end not implenented by ", this);
		}
	}
}();