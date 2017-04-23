package com.technion.gyrocraft;

import android.app.Application;
import android.content.Context;
import android.util.Log;

import com.google.gson.Gson;
import com.technion.gyrocraft.controllers.Connection;
import com.technion.gyrocraft.controllers.WebRtcConnection;
import com.technion.gyrocraft.controllers.WebSocketConnection;

/**
 * Created by galmalka on 4/13/16.
 */
public class App extends Application {
    private static Context mContext;
    private static Gson mGson;
    private static Connection mConnection;

    public enum ConnectionType {WebSocket, WebRtc}

    @Override
    public void onCreate() {
        super.onCreate();
        mContext = this;

        // Initialize singletons
        WebRtcConnection.init();
        WebSocketConnection.init();
        mConnection = WebSocketConnection.getInstance();
        mGson = new Gson();
    }

    public static Context getContext(){
        return mContext;
    }

    public static Gson getGson() { return mGson; }

    public static Connection getConnection() {
        return mConnection;
    }

    public static void setConnection(ConnectionType connectionType) {
        if (connectionType == ConnectionType.WebRtc) {
            mConnection = WebRtcConnection.getInstance();
        }
        else if (connectionType == ConnectionType.WebSocket) {
            mConnection = WebSocketConnection.getInstance();
        }
    }
}
