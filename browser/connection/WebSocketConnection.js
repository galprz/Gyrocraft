var GYROCRAFT = GYROCRAFT || {};

GYROCRAFT.WebSocketConnection = (function() {
    function _WebSocketconnection(settings) {
        GYROCRAFT.ConnectionBase.call(this);
        var self = this;
        var mCurrentConnection;

        this.connect = function(room) {
            if (this.mState == this.CONNECTED_TO_DEVICE) {
                console.info("Already connected to device");
                return;
            }

            GYROCRAFT.FireBaseConnection.setNewRoom(room, function(ip) {
                console.info("Trying to connect to ip " + ip);
                mCurrentConnection = new WebSocket(new URL("ws://" + ip));

                mCurrentConnection.onopen = function(e){
                    console.info("Successfully connected to the device");
                };
                mCurrentConnection.onmessage = function(e){
                    if (self.mState != self.CONNECTED_TO_DEVICE) {
                        self.mState = self.CONNECTED_TO_DEVICE;
                    }
                    self.callListener("onIncomingMessage", JSON.parse(e.data));
                }

                mCurrentConnection.onclose = function(e){
                    self.mState = self.DISCONNECTED;
                    mCurrentConnection = null;
                    self.callListener("onSessionDisconnect");
                    console.info("Disconnected from server");
                };

                mCurrentConnection.onerror = function(e){
                    console.error("Failed to connect to device with ip " + ip);
                    // TODO: handle errors
                };
            });
            
            this.mRoom = room;
            self.callListener("onSessionConnect", { success : true });
        }

        this.disconnect = function() {
            if (this.mState == this.DISCONNECTED) {
                return;
            }

            mCurrentConnection.close();
            mCurrentConnection = null;
            self.mState = self.DISCONNECTED;
        }

        this.send = function(message, type) {
            if (this.mState == this.DISCONNECTED || !mCurrentConnection) {
                console.warn("Not connected!");
                return;
            }

            mCurrentConnection.send(JSON.stringify({type: type, body: message}));
        }
    }

    return {
        init : function(settings) {
            GYROCRAFT.WebSocketConnection = new _WebSocketconnection(settings);
        }
    }
})();


