package com.technion.gyrocraft;

import org.json.JSONObject;

/**
 * Created by galmalka on 3/18/16.
 */
public interface IConnectionListener {
    void onMessage(JSONObject message);

    void onConnectToRoom();

    void onConnectToBrowser();

    void onDisconnect();
}
