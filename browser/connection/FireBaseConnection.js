var GYROCRAFT = GYROCRAFT || {};

GYROCRAFT.FireBaseConnection = (function() {
	function _FireBaseConnection(settings) {
		var mRoomRef;

		firebase.initializeApp(settings);

		function detachPosts() {
			mRoomRef.off('child_added')
			mRoomRef=null;
		};
		
		// returns key of a new made room to use as a QR.
		// callBack - used: callBack(string ip) once after a phone connects;
		this.setNewRoom = function(room, callBack){
			console.info("Setting room " + room);
			if(mRoomRef!=null){ //remove old listener if exists
				detachPosts();
			}
			// maybe add check whether room creation was successfull 
			/*var onComplete = function(error) {
					if (error) {
					console.log('Synchronization failed');
				  } else {
					console.log('Synchronization succeeded');
				  }
				};
			*/
			var updates = {};
			updates['/roomList/' + room] = 0;
			firebase.database().ref().update(updates); //,onComplete);
			//set listener
			
			mRoomRef = firebase.database().ref('roomList/' + room + '/');
			mRoomRef.on('child_added', function(data) {
				console.log(data.key + "." + data.child("ip").key+ ":" + data.child("ip").val());
				callBack(data.child("ip").val());
				detachPosts();
			});
		}

		this.getConnectionType = function(callback) {
			var ref = firebase.database().ref('skylink/');
			ref.once("value", function(data) {
			  	if (data.val() == false){
			  		callback(GYROCRAFT.ConnectionType.WebSocket);
			  	}
			  	else {
			  		callback(GYROCRAFT.ConnectionType.WebRtc);
			  	}
			});
		}
	}

	return {
        init : function(settings) {
            GYROCRAFT.FireBaseConnection = new _FireBaseConnection(settings);
        }
    }
})();