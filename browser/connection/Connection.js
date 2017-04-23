var GYROCRAFT = GYROCRAFT || {};

// Abstract
GYROCRAFT.ConnectionBase = function() {
	// Connection states 
    this.DISCONNECTED = "disconnected";
    this.CONNECTED_TO_ROOM  = "connected_to_room";
    this.CONNECTED_TO_DEVICE  =  "connected_to_device";

    this.mListener = null;
	this.mState = this.DISCONNECTED;
	this.mRoom = null;

    this.validListener = function(listener) {
        function hasFunction(type){
            return (typeof type === "function");
        }
        return hasFunction(listener.onPeerJoined)        &&
               hasFunction(listener.onPeerLeft)          &&
               hasFunction(listener.onIncomingMessage)   &&
               hasFunction(listener.onSessionDisconnect) &&
               hasFunction(listener.onSessionConnect)    &&
               hasFunction(listener.onDataChannelOpen);
    }

    this.callListener = function(callback, args){
        if (this.mListener) {
            try {
                var args_arr = Array.from(arguments).slice(1);
                this.mListener[callback].apply(this, args_arr);
            } 
            catch(err) {
                console.debug("Failed to execute callback " + callback + " with args: " + args + ". Error:" + err + ". Listener object:");
                console.debug(this.mListener);
            }
        }
        else {
            console.warn("No listener attached");
        }
    }

    // Listener "of type" IConnectionListener
    this.registerListener = function(listener) {
        if(this.validListener(listener)){
            this.mListener = listener;
        }
    }

    this.unregisterListener = function() {
        this.mListener = null;
    }

    this.getState = function() {
        return this.mState;
    }

    this.getRoom = function(){
        return this.mRoom;
    }	
}

GYROCRAFT.ConnectionType = (function () {
	return {
		WebRtc: "WebRtc",
		WebSocket: "WebSocket"
	};
})();

GYROCRAFT.Connection = null;

GYROCRAFT.setConnection = function(connectionType) {
	if (connectionType == GYROCRAFT.ConnectionType.WebRtc) {
		GYROCRAFT.Connection = GYROCRAFT.WebRtcConnection;
	}
	else if (connectionType == GYROCRAFT.ConnectionType.WebSocket) {
		GYROCRAFT.Connection = GYROCRAFT.WebSocketConnection;
	}
	else {
		console.warn("Unrecognized connection type " + connectionType);
	}
}