var GYROCRAFT = GYROCRAFT || {};

GYROCRAFT.Radar = function(scene,Setting,R){
	R = R || {};

	var scala=Setting.scala;
	var objects=[];
	var points=[];

	var $radar   = $("<div id='radar' class='radar' style='background-image: url("+Setting.radarBG +")'></div>");
	var $scanner = $("<div id='radar-scanner' style='background-image: url("+Setting.radar_scanner +")'></div>")
	var mScannerAngle = 0;
	$radar.append($scanner);
	$( "body" ).append($radar);

	this.clear = function() {
	var i;
		for (i = 0; i < points.length; ++i) {
			points[i].remove();
		}
		points = [];
		objects = [];
	}
	
	this.removeFromScene = function() {
		this.clear();
		$radar.hide();
	}
	this.addToScene = function(){
		$radar.show();
	}
	//new obj must have getPosition() which returns an obj with x,y,z coordinates
	this.register=function(position,centerPos,orientation){
		if(objects.indexOf(position)==-1){
			objects.push(position);
			var newPosition=calcPosition(position,centerPos,orientation);
			points.push(new Point($radar,(newPosition)));
		}
	}

	this.unRegister=function(obj){
		var index = objects.indexOf(obj);
		if (index > -1) {
			objects.splice(index, 1);
			var point=points.splice(index,1);
			point[0].remove();
		}
	}

	this.update = function(centerPos,orientation){
		mScannerAngle = (mScannerAngle + Setting.scanner_pace) % 360; 
		$scanner.rotate(mScannerAngle);
		for(var i=0;i<objects.length;i++){
			var newPosition=calcPosition(objects[i],centerPos,orientation);
			points[i].updatePosition(newPosition);
		}
	}

	var calcPosition=function(position,centerPos,orientation){
		var image=Setting.circle,
			pX=(position.x-centerPos.x)/scala,
			pY=(position.z-centerPos.z)/scala,
			radius=Math.sqrt(pX*pX+pY*pY),
			originalAngle=Math.atan2(pY,pX),
			newAngle = (Math.PI / 180) * (90-orientation) + originalAngle; //we want to face 90Deg = UP
		if(radius > Setting.radar_radius){
			image=Setting.arrow;
			radius= Setting.radar_radius;
		}else if (Math.abs(position.y - centerPos.y) > Setting.circle_range ){
			image = ((position.y - centerPos.y) > 0) ? Setting.triangle_up : Setting.triangle_down;
		}
		return {
			x: 45 - (Math.cos(newAngle) * radius), //changing position to fit html Axis
			y: 45 - (Math.sin(newAngle) * radius),
			h: GYROCRAFT.Utils.noremalAirplanAltitude(position.y) - GYROCRAFT.Utils.noremalAirplanAltitude(centerPos.y),
			img:image,
			ori:180*newAngle/Math.PI			//for rotating the arrow
		};
	}
	Point = function(radar,radarPos){	
	
		var $point=$("<div class = 'radar-point' ></div>");
		var $pointImage=$("<img class = 'radar-image' >");
		var $pointLable=$("<font class='radar-labal' ></font>");
		$point.append($pointImage,$pointLable);
		this.updatePosition=function(radarPos){
			var color = Math.ceil(radarPos.h) <=0 ? "#00ff00":"#1affff";
			$pointLable.html("Alt : "+ Math.ceil(radarPos.h));
			$pointLable.css({"color" : color});

			$point.css({'left':(radarPos.x)+'%','top':(radarPos.y)+'%'});
			$pointImage.attr('src',radarPos.img);
			if(radarPos.img == Setting.arrow){
				$pointImage.rotate(180+radarPos.ori); 
			}else{
				$pointImage.rotate(0);
			}
		}
		this.remove=function(){
			$point.remove();
		}
		this.updatePosition(radarPos);
		radar.append($point);
	}
}