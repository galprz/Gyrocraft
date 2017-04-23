var GYROCRAFT = GYROCRAFT || {};
GYROCRAFT.PointsCounter = function(pointsContainer,pointsLabalID,pointsAddLabelID){
	var pointsContainer = $("#" + pointsContainer)
	var pointsLabel = $("#" + pointsLabalID);
	var pointsAddLabel = $("#" + pointsAddLabelID);
	var mRestartOnProgress = false;
	var currentValue = 0;
	pointsLabel.text(currentValue);
	
	function animateAllPoints(points){
		var givenPoints = 0;
		var pointToAdd = Math.ceil(points / 120)
		function animate(){
			if(givenPoints == points || mRestartOnProgress){
				if(mRestartOnProgress){
					mRestartOnProgress = false;
				}
				return;
			}
			var value = Math.min(pointToAdd,points - givenPoints);
			incresePoint(value);
			givenPoints += value;
			requestAnimationFrame(animate);	
		}
		animate();
	}
	
	function incresePoint(val){
		currentValue += val;
		pointsLabel.text(currentValue);
	}
	function animateAddPoints(text,color,callback){
		pointsAddLabel
				.text(text)
				.css({
					top:"2px",
					opacity :1,
					color : color
				})
				.animate({
					opacity: 0,
					top: "-=40"
				},1200,callback);
	}
	this.addPoints = function(points,bonus){
		if(mRestartOnProgress){
			mRestartOnProgress = false;
		}
		animateAddPoints("+" + points + " Points","orange",
		function(){
				if(!bonus)return;
				animateAddPoints("+" + bonus + " Bonus","green")
			});
		animateAllPoints((bonus)?points+bonus:points);

	}

	this.show = function(){
		pointsContainer.show();
	}
	
	this.hide = function(){
		pointsContainer.hide();
	}

	this.restart = function() {
		mRestartOnProgress = true;
		currentValue = 0;
		pointsLabel.text(currentValue);
	}

	this.getScore = function() {
		return currentValue;
	}
}