package com.technion.gyrocraft.controllers;

import android.util.Base64;
import android.util.Log;

import com.technion.gyrocraft.App;
import com.technion.gyrocraft.IConnectionListener;
import com.technion.gyrocraft.R;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.Map;
import java.util.Queue;
import java.util.TimeZone;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import sg.com.temasys.skylink.sdk.config.SkylinkConfig;
import sg.com.temasys.skylink.sdk.listener.LifeCycleListener;
import sg.com.temasys.skylink.sdk.listener.MessagesListener;
import sg.com.temasys.skylink.sdk.listener.RemotePeerListener;
import sg.com.temasys.skylink.sdk.rtc.SkylinkConnection;
import sg.com.temasys.skylink.sdk.rtc.SkylinkException;


/**
 * Created by galmalka on 4/26/16.
 */
public class WebRtcConnection extends Connection implements MessagesListener, LifeCycleListener, RemotePeerListener {
    private static final String sTag = "WebRtcConnection";
    private static final String HMAC_SHA1_ALGORITHM = "HmacSHA1";
    private static final String TIME_ZONE_UTC = "UTC";
    private static final String ISO_TIME_FORMAT = "yyyy-MM-dd'T'HH:mm:ss.SSSZZZ";

    // region Singleton implementation
    private static WebRtcConnection _instance = null;

    public static void init() {
        if (_instance != null) {
            Log.i(sTag, "Already initialized!");
            return;
        }

        _instance = new WebRtcConnection();
    }

    public static WebRtcConnection getInstance() {
        return _instance;
    }
    //endregion

    // region Class implementation
    private SkylinkConnection mSkyLinkConnection;
    private String mPeerId;

    private WebRtcConnection() {
        mSkyLinkConnection = SkylinkConnection.getInstance();
        mSkyLinkConnection.setMessagesListener(this);
        mSkyLinkConnection.setLifeCycleListener(this);
        mSkyLinkConnection.setRemotePeerListener(this);
    }

    @Override
    public void connect(String room) {
        Log.i(sTag, "Connecting to room: " + room);
        String appKey = App.getContext().getString(R.string.skylink_appid);
        String appSecret = App.getContext().getString(R.string.skylink_app_secret);
        String clientName = App.getContext().getString(R.string.skylink_client_name);
        String connectionString = getSkylinkConnectionString(room, appKey, appSecret, new Date(), SkylinkConnection.DEFAULT_DURATION);
        mSkyLinkConnection.init(App.getContext().getString(R.string.skylink_appid), getSkylinkConfig(), App.getContext());
        mSkyLinkConnection.connectToRoom(connectionString, clientName);
    }

    @Override
    public void disconnect() {
        synchronized (this) {
            if (mState == State.Disconnected) {
                Log.d(sTag, "Trying to disconnect, but already disconnected");
                return;
            }
            setDisconnected();
            mSkyLinkConnection.disconnectFromRoom();
        }
    }

    // Sending a message

    @Override
    protected void _send(JSONObject jsonObject) {
        synchronized (this) {
            if (mState != State.ConnectedToBrowser) {
                Log.w(sTag, "Not connected to browser. Will not send the message");
                return;
            }

            try {
                mSkyLinkConnection.sendP2PMessage(mPeerId, jsonObject);
            } catch (SkylinkException e) {
                Log.e(sTag, "Failed to send message to peer " + mPeerId + ". Error: " + e.getMessage());
            } catch (Exception e) {
                // Unexpected connection errors - If we log the error we get nullpointerexception <.<
                Log.e(sTag, "Failed to send message.");
            }
        }
    }

    // region MessageListener implementation
    @Override
    public void onServerMessageReceive(String s, Object o, boolean b) {

    }

    @Override
    public void onP2PMessageReceive(String remotePeerId, final Object message, boolean isPrivate) {
        callListener(new Runnable() {
            @Override
            public void run() {
                try {
                    mListener.onMessage(new JSONObject((String) message));
                } catch (JSONException e) {
                    e.printStackTrace();
                }
            }
        });
    }
    //endregion

    // region LifeCycleListener implementation
    @Override
    public void onConnect(boolean isSuccess, String message) {
        if (isSuccess) {
            Log.i(sTag, "Connected to room");
            setConnectedToRoom();
            callListener(new Runnable() {
                @Override
                public void run() {
                    mListener.onConnectToRoom();
                }
            });
        } else {
            Log.e(sTag, "Failed to connect to room. Error: " + message);
        }
    }

    @Override
    public void onWarning(int errorCode, String message) {
        Log.w(sTag, "Got warning. Error code: " + errorCode + ". Message" + message);
    }

    @Override
    public void onDisconnect(int errorCode, String message) {
        setDisconnected();
        Log.i(sTag, "Disconnected from room");
        callListener(new Runnable() {
            @Override
            public void run() {
                mListener.onDisconnect();
            }
        });
    }

    @Override
    public void onReceiveLog(String message) {
        Log.d(sTag, "Received log: " + message);
    }

    @Override
    public void onLockRoomStatusChange(String s, boolean b) {

    }
    //endregion

    // region RemotePeerListener implementation
    @Override
    public void onRemotePeerJoin(String s, Object o, boolean b) {

    }

    @Override
    public void onRemotePeerUserDataReceive(String s, Object o) {

    }

    @Override
    public void onOpenDataConnection(String peerId) {
        setConnectedToBrowser(peerId);
        Log.i(sTag, "Connected To Browser");
        callListener(new Runnable() {
            @Override
            public void run() {
                mListener.onConnectToBrowser();
            }
        });
    }

    @Override
    public void onRemotePeerLeave(String s, String s1) {
        setConnectedToRoom();
        callListener(new Runnable() {
            @Override
            public void run() {
                mListener.onDisconnect();
            }
        });
    }
    //endregion

    // region Privates
    @Override
    protected String getTag() {
        return sTag;
    }

    private void setDisconnected() {
        synchronized(this) {
            mState = State.Disconnected;
            mPeerId = null;
        }
    }

    private void setConnectedToRoom() {
        synchronized(this) {
            mState = State.ConnectedToRoom;
            mPeerId = null;
        }
    }

    private void setConnectedToBrowser(String peerId) {
        synchronized(this) {
            mState = State.ConnectedToBrowser;
            mPeerId = peerId;
        }
    }

    private static SkylinkConfig getSkylinkConfig() {
        SkylinkConfig config = new SkylinkConfig();

        config.setAudioVideoSendConfig(SkylinkConfig.AudioVideoConfig.NO_AUDIO_NO_VIDEO);
        config.setHasPeerMessaging(true);
        config.setHasFileTransfer(false);
        Map<String, Object> map = new HashMap<>();
        map.put("transport", "UDP");
        config.setAdvancedOptions(map);

        return config;
    }

    /**
     * Returns the SkylinkConnectionString
     *
     * @param roomName  Name of the room
     * @param appKey    App Key
     * @param secret    App secret
     * @param startTime Room Start Time
     * @param duration  Duration of the room in Hours
     * @return
     */
    private static String getSkylinkConnectionString(String roomName, String appKey,
                                                    String secret,
                                                    Date startTime, int duration) {

        Log.d(sTag, "Room name " + roomName);
        Log.d(sTag, "App Key " + appKey);
        Log.d(sTag, "startTime " + startTime);
        Log.d(sTag, "duration " + duration);

        // Convert the date in to ISO format
        String dateString = getISOTimeStamp(startTime);

        // Compute RFC 2104-compliant HMAC signature
        String cred = calculateRFC2104HMAC(roomName + "_" + duration + "_"
                + dateString, secret);
        try {
            cred = URLEncoder.encode(cred, "UTF-8");
        } catch (UnsupportedEncodingException e) {
            Log.e(sTag, e.getMessage(), e);
        }

        return appKey + "/"
                + roomName + "/" + dateString + "/" + duration + "?cred="
                + cred;
    }

    /**
     * Computes RFC 2104-compliant HMAC signature.
     *
     * @param data data The data to be signed.
     * @param key  The signing key.
     * @return The Base64-encoded RFC 2104-compliant HMAC signature.
     */
    private static String calculateRFC2104HMAC(String data, String key) {
        String result = null;
        try {

            // Get an hmac_sha1 key from the raw key bytes
            SecretKeySpec signingKey = new SecretKeySpec(key.getBytes(),
                    HMAC_SHA1_ALGORITHM);

            // Get an hmac_sha1 Mac instance and initialize with the signing key
            Mac mac = Mac.getInstance(HMAC_SHA1_ALGORITHM);
            mac.init(signingKey);

            // Compute the hmac on input data bytes
            byte[] rawHmac = mac.doFinal(data.getBytes());

            // Base64-encode the hmac
            result = Base64
                    .encodeToString(rawHmac, android.util.Base64.DEFAULT);

        } catch (Exception e) {
            Log.e(sTag, "Failed to generate HMAC : " + e.getMessage(), e);
        }
        return result.substring(0, result.length() - 1);
    }

    /**
     * Returns the date in ISO time format
     *
     * @param date
     * @return ISO timestamp
     */
    private static String getISOTimeStamp(Date date) {
        TimeZone tz = TimeZone.getTimeZone(TIME_ZONE_UTC);
        DateFormat df = new SimpleDateFormat(ISO_TIME_FORMAT);
        df.setTimeZone(tz);
        return df.format(date);
    }
    //endregion
    //endregion
}
