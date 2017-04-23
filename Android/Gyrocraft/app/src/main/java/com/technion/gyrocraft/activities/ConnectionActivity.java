package com.technion.gyrocraft.activities;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.TextView;

import com.technion.gyrocraft.App;
import com.technion.gyrocraft.Game;
import com.technion.gyrocraft.IConnectionListener;
import com.technion.gyrocraft.R;
import com.technion.gyrocraft.controllers.Connection.State;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.Timer;
import java.util.TimerTask;

public class ConnectionActivity extends Activity implements IConnectionListener {
    private static final String sTag = "ConnectionActivity";
    private static final int sRetryTime = 3*1000; // 3 seconds
    private static final int sConnectionTime = 20*1000; // 20 seconds
    private static final int sMaxConnectionTime = 40; // in seconds

    private TextView mStatusTextView;
    private TextView mLongConnectionTextView;
    private TextView mCancelConnectionTextView;
    private TextView mFailedConnectionTextView;
    private TextView mReturnToMainTextView;
    private Timer mRetryTimer;
    private Timer mConnectionTimer;
    private Timer mTimeCounter;
    private int mConnectionTime = sConnectionTime / 1000;
    private boolean mShouldReturnToMain = false;
    private boolean mConnectionSuccessful = false;
    private boolean mCancelFromUser = false;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_connection);
        setFinishOnTouchOutside(false);

        mStatusTextView = (TextView) findViewById(R.id.connection_status);
        mLongConnectionTextView = (TextView) findViewById(R.id.long_connection);
        mCancelConnectionTextView = (TextView) findViewById(R.id.connection_cancel);
        mFailedConnectionTextView = (TextView) findViewById(R.id.connection_failed);
        mReturnToMainTextView = (TextView) findViewById(R.id.connection_return_to_main);

        mLongConnectionTextView.setVisibility(View.GONE);
        mCancelConnectionTextView.setVisibility(View.GONE);
        mFailedConnectionTextView.setVisibility(View.GONE);
        mReturnToMainTextView.setVisibility(View.GONE);

        App.getConnection().registerListener(this);

        // If we're connected to room but not to the browser we need to reconnect
        if (App.getConnection().getState() == State.ConnectedToRoom) {
            App.getConnection().disconnect();
        }

        // Check if we're already connected. If so we don't need to connect
        if (App.getConnection().getState() == State.ConnectedToBrowser) {
            onConnectToBrowser();
        }
        else {
            mStatusTextView.setText(R.string.connecting_to_server);
            String uuid = getIntent().getStringExtra(getString(R.string.uuid));
            App.setConnection(uuid.charAt(0) == '0' ? App.ConnectionType.WebSocket : App.ConnectionType.WebRtc);
            App.getConnection().connect(uuid);
        }

        // When this timer fires we'll show a message of long loading time
        mConnectionTimer = new Timer();
        mConnectionTimer.schedule(onLongConnection, sConnectionTime);
    }

    private TimerTask onLongConnection = new TimerTask() {
        @Override
        public void run() {
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    mLongConnectionTextView.setVisibility(View.VISIBLE);
                    mCancelConnectionTextView.setVisibility(View.VISIBLE);
                }
            });

            // Set new timer for counting the time
            mTimeCounter = new Timer();
            mTimeCounter.schedule(new TimerTask() {
                @Override
                public void run() {
                    runOnUiThread(new Runnable() {
                        @Override
                        public void run() {
                            String curText = (String) mLongConnectionTextView.getText();
                            mLongConnectionTextView.setText(curText.replaceAll("for (.*) seconds", "for " + Integer.toString(mConnectionTime) + " seconds"));
                            mConnectionTime++;
                            if (mConnectionTime > sMaxConnectionTime) {
                                mLongConnectionTextView.setVisibility(View.GONE);
                                mCancelConnectionTextView.setVisibility(View.GONE);
                                mFailedConnectionTextView.setVisibility(View.VISIBLE);
                                mReturnToMainTextView.setVisibility(View.VISIBLE);
                            }
                        }
                    });
                }
            }, 0, 1000);
        }
    };

    public void returnToMain(View view) {
        onBackPressed();
    }

    @Override
    public void onPause() {
        // Stop all timers
        if (mRetryTimer != null) {
            mRetryTimer.cancel();
        }
        if (mConnectionTimer != null) {
            mConnectionTimer.cancel();
        }
        if (mTimeCounter != null) {
            mTimeCounter.cancel();
        }
        if (!mConnectionSuccessful && !mCancelFromUser) {
            mShouldReturnToMain = true;
        }
        App.getConnection().unregisterListener();
        super.onPause();
    }

    @Override
    public void onResume() {
        super.onResume();
        if (mShouldReturnToMain) {
            mShouldReturnToMain = false;
            onBackPressed();
        }
        else {
            App.getConnection().registerListener(this);
        }

        mCancelFromUser = false;
    }

    @Override
    public void onBackPressed(){
        mCancelFromUser = true;
        App.getConnection().disconnect();
        Intent intent = new Intent(this, MainActivity.class);
        intent.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
        startActivity(intent);
    }

    @Override
    public void onMessage(JSONObject message) {
        try {
            String type = message.getString("type");
            String body = message.getString("body");
            if (!type.equals("Control")) {
                Log.w(sTag, String.format("Got message with type %s. Ignoring", type));
                return;
            }
            if (!body.equals("start")) {
                Log.w(sTag, String.format("Got message with body %s. Ignoring", body));
                return;
            }
            mRetryTimer.cancel();
            App.getConnection().unregisterListener();
            mConnectionSuccessful = true;
            finish();
        } catch (JSONException e) {
            Log.e(sTag, String.format("Got message with unknown format. Error: ", e.getMessage()));
        }
    }

    @Override
    public void onConnectToRoom() {
        mStatusTextView.setText(R.string.connecting_to_browser);
    }

    @Override
    public void onConnectToBrowser() {
        mRetryTimer = new Timer();
        final Game game = (Game) getIntent().getSerializableExtra(getString(R.string.game));
        mRetryTimer.schedule(new TimerTask() {
            @Override
            public void run() {
                App.getConnection().send(game);
            }
        }, 0, sRetryTime);
        runOnUiThread(new Runnable() {
            @Override
            public void run() {
                if (game.tutorialMode) {
                    mStatusTextView.setText(R.string.waiting_for_tutoria_to_start);
                }
                else {
                    mStatusTextView.setText(R.string.waiting_for_game_to_start);
                }
            }
        });
    }

    @Override
    public void onDisconnect() {

    }
}
