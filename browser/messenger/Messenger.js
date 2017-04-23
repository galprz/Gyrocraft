var GYROCRAFT = GYROCRAFT || {};
GYROCRAFT.Messenger = function(){
	var messagesQueue = [];
	var onProgress = false;
	var MESSAGE_DISPLAY_TIME = 2000; //in ms

	this.send = function(content,time){
		time = time || MESSAGE_DISPLAY_TIME;
		var message = {content : content,time : time};
		messagesQueue.push(message);
	}

	function animateDisplayMessage(time){
		$("#msg-continer").animate(
			{
				'right':"10px",
				'opacity': 1
			}, 1000 , function(){
				setTimeout(function(){
					$("#msg-continer").animate({
						'right': "-" + $("#msg-continer").css('width'),
						'opacity' : 0
					}, 1000 ,function(){
						onProgress = false;
					});
				},time);
			}
		)
	}
	
	this.displayMessage = function(){
		if(onProgress || messagesQueue.length == 0)return;
		onProgress = true;
		var msg = messagesQueue.shift();
		$("#msg-label").html(msg.content);
		animateDisplayMessage(msg.time);
	}

}

GYROCRAFT.Utils.Messenger = new GYROCRAFT.Messenger();