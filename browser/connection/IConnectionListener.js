function IConnectionListener() {
    function defaultFunction(name) {
        console.debug(name + " not implemented");
    }

    /**
     * Will be called when a peer joins the room
     * @param peerId: The id off the peer 
     * @param peerInfo: An object with info about the peer
     */
    this.onPeerJoined = function (peerId,peerInfo) { defaultFunction("onPeerJoined") };

    /**
     * Will be called when a peer leaves the room
     * @param peerId: The id off the peer 
     * @param peerInfo: An object with info about the peer
     */
    this.onPeerLeft = function (peerId,peerInfo) { defaultFunction("onPeerLeft") };

    /**
     * Will be called when a peer joins the room
     * @param message: The message
     */
    this.onIncomingMessage = function (message) { defaultFunction("onIncomingMessage") };

    /**
     * Will be called when self leaves the room
     * @param peerId: The id off the peer (self)
     * @param peerInfo: An object with info about the peer (self)
     */
    this.onSessionDisconnect = function (peerId,peerInfo) { defaultFunction("onSessionDisconnect") };

    /**
     * Will be called when self enters the room
     * @param result: Object:
     *        success: Whether or not the connection was successful
     */
    this.onSessionConnect = function (result) { defaultFunction("onSessionConnect") };

    /**
     * Will be called when data channel is opened with peer
     * @param peerId: The id off the peer (self)
     */
    this.onDataChannelOpen = function (peerId) { defaultFunction("onDataChannelOpen") };
}