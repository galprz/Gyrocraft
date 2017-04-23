var GYROCRAFT = GYROCRAFT || {};

// Singelton implementation
GYROCRAFT.WebRtcConnection = (function () {
    function _WebRtcConnection(settings) {
        GYROCRAFT.ConnectionBase.call(this);

        var self = this;

        // Constants
        var ANDORID_CLIENT_NAME = "AndroidClient";
        var BROWSER_CLIENT_NAME = "BrowserClient";

        var mSkyLink = new Skylink();
        var mPeerId;

        function changeState(state){
            switch(state){
                case self.DISCONNECTED:
                    self.mState = self.DISCONNECTED;
                    mPeerId = null;
                    self.mRoom = null;
                    break;
                case self.CONNECTED_TO_ROOM:
                    self.mState = self.CONNECTED_TO_ROOM;
                    mPeerId = null;
                    break;
                case self.CONNECTED_TO_DEVICE:
                    self.mState = self.CONNECTED_TO_DEVICE;
                    break;        
            }
        }
        changeState(this.DISCONNECTED);

        // Set listeners
        mSkyLink.on('peerJoined', function(peerId, peerInfo, isSelf) { 
            if (isSelf) {
                return;
            }
            if (peerInfo.userData == ANDORID_CLIENT_NAME){
                console.debug(ANDORID_CLIENT_NAME + " connected to room. Peer id: " + peerId);
                //setTimeout(refreshConnection, 20*1000);
                self.callListener("onPeerJoined", peerId, peerInfo);
            } 
            else {
                console.warn("Unexpected peer joined to room. Peer id: " + peerId + " Info:");
                console.warn(peerInfo);
            }
        });

        mSkyLink.on('peerLeft', function(peerId, peerInfo, isSelf) {
            if (isSelf) {
                return;
            }
            changeState(self.CONNECTED_TO_ROOM);
            self.callListener("onPeerLeft", peerId, peerInfo);
            console.info(peerId + " disconnected");

        });

        mSkyLink.on('incomingMessage', function(message, peerId, peerInfo, isSelf) {
            if (self.mState != self.CONNECTED_TO_DEVICE) {
                changeState(self.CONNECTED_TO_DEVICE);
                mPeerId = peerId;
            }
            self.callListener("onIncomingMessage", message.content);
        });

        // If browser is disconnected from room
        mSkyLink.on('sessionDisconnect', function(peerId, peerInfo) { 
            changeState(self.DISCONNECTED);
            self.callListener("onSessionDisconnect", peerId, peerInfo);
            console.info("Disconnected from server");
        });

        mSkyLink.on('dataChannelState', function(state, peerId, error, channelName, channelType) {
            if (error) {
                console.error("Data channel error:");
                console.error(error);
                return;
            }
            if (state == mSkyLink.DATA_CHANNEL_STATE.OPEN) {
                console.info("Data channel opened with peer " + peerId);
                mPeerId = peerId;
                changeState(self.CONNECTED_TO_DEVICE);
                self.callListener("onDataChannelOpen", peerId);
            }
        })

        function refreshConnection() {
            if (self.mState != self.CONNECTED_TO_DEVICE) {
                console.warn("Refreshing connection");
                mSkyLink.leaveRoom();
                setTimeout(function() {
                    mSkyLink.joinRoom(mRoom, {userData: 'BrowserClient'}, joinRoomCallback); 
                }, 3*1000);
            }
        }

        function getCredentials(room) {
            var isoDate = (new Date()).toISOString();
            var duration = 24;
            var credString = room + "_" + duration + "_" + isoDate;
            var hashedCred = CryptoJS.HmacSHA1(credString, settings.app_secret);
            var base64HashedCred = hashedCred.toString(CryptoJS.enc.Base64);
            var encodedBase64HashedCred = encodeURIComponent(base64HashedCred);

            var credentials = new Object();
            credentials.startDateTime = isoDate;
            credentials.duration = duration;
            credentials.credentials = encodedBase64HashedCred;

            return credentials;
        }

        this.connect = function (room) {
            console.info("Trying to connect to room " + room);
            mSkyLink.init({
                appKey: settings.app_key,
                defaultRoom: room,
                credentials: getCredentials(room)
            });

            mSkyLink.joinRoom(room, {userData: BROWSER_CLIENT_NAME}, function (e, s) {
                if (e){
                    console.error("Error happened. Can not join room",e);
                    self.callListener("onSessionConnect", { success : false , reason : "Error happened. Can not join room" });
                }
                else{
                    console.info("Successfully joined room " + s.room);
                    changeState(self.CONNECTED_TO_ROOM);
                    self.mRoom = room;
                    self.callListener("onSessionConnect", { success : true });
                }
            });
        }

        this.disconnect = function () {
            if (this.mState == this.DISCONNECTED) {
                return;
            }
            mSkyLink.leaveRoom();
            changeState(this.DISCONNECTED);
        }

        this.send = function(message, type) {
            if (this.mState == this.DISCONNECTED) {
                console.warn("Not connected!");
                return;
            }
            mSkyLink.sendP2PMessage(JSON.stringify({type: type, body: message}), [mPeerId]);
        }

        this.getPeerId = function(){
            return mPeerId;
        }
    }

    return {
        init : function(settings) {
            GYROCRAFT.WebRtcConnection = new _WebRtcConnection(settings);
        }
    }
})();
