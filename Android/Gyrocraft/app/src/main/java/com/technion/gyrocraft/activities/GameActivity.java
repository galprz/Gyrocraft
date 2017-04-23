package com.technion.gyrocraft.activities;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.os.Vibrator;
import android.util.Log;
import android.view.View;
import android.widget.ImageView;
import android.widget.SeekBar;

import com.technion.gyrocraft.AirplaneData;
import com.technion.gyrocraft.App;
import com.technion.gyrocraft.AssetsCache;
import com.technion.gyrocraft.IConnectionListener;
import com.technion.gyrocraft.R;
import com.technion.gyrocraft.SensorData;
import com.technion.gyrocraft.controllers.SensorController;
import com.technion.gyrocraft.custom_widgets.Compass;
import com.technion.gyrocraft.custom_widgets.Pitch;
import com.technion.gyrocraft.custom_widgets.Scala;
import com.technion.gyrocraft.custom_widgets.VerticalSeekBar;
import com.technion.gyrocraft.custom_widgets.WarningLight;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.Timer;
import java.util.TimerTask;


public class GameActivity extends Activity implements IConnectionListener {
    private static final String sTag = "GameActivity";
    private ImageView mPauseSwitch;
    private Timer mSensorTimer;
    private SensorController mSensorController;
    private Pitch mPitch;
    private Scala mVelocityScala;
    private Scala mAltitudeScala;
    private Compass mCompass;
    private WarningLight mWarningLight;
    private VerticalSeekBar mThrottle;
    private Vibrator mVibrator;
    private boolean mManualPause = true;
    private boolean mIsLightOn;
    private boolean mIsTutorial;

    //called when hitting restart button.
    @Override
    protected void onNewIntent (Intent intent){

        //handle Restart Sequence
        Bundle parameters = intent.getExtras();
        if(parameters!=null) {
            if (parameters.getString("state").equals("restart")) {
                if (mThrottle != null) {
                    mThrottle.setProgress(0);
                }
                mWarningLight.turnOff();
                mIsLightOn = false;
            }
        }
        else {
        }
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_game);
        mPauseSwitch = (ImageView) findViewById(R.id.pause_switch);

        mPitch = (Pitch) findViewById(R.id.pitch);
        int airplaneIndex = getIntent().getIntExtra(getString(R.string.airplane), 0);
        mIsTutorial = getIntent().getBooleanExtra(getString(R.string.TutorialMode), false);

        mVelocityScala = (Scala) findViewById(R.id.velocity_scala);
        int scalaImageId = this.getResources().getIdentifier(AssetsCache.getAirplanes().get(airplaneIndex).getSpeedScalaImage(), "drawable", this.getPackageName());
        mVelocityScala.setScalaImage(scalaImageId);
        mAltitudeScala = (Scala) findViewById(R.id.altitude_scala);
        mCompass = (Compass) findViewById(R.id.compass);
        mThrottle = (VerticalSeekBar) findViewById(R.id.seekbar_throttle);
        mWarningLight = (WarningLight) findViewById(R.id.warning_light);
        mVibrator = (Vibrator) getSystemService(Context.VIBRATOR_SERVICE);


        if(getIntent().getBooleanExtra(getString(R.string.TutorialMode),false)){
            findViewById(R.id.pause_label).setVisibility(View.GONE);
            findViewById(R.id.pause_switch).setVisibility(View.GONE);
        }else{
            findViewById(R.id.next_tutorial).setVisibility(View.GONE);
            findViewById(R.id.previous_tutorial).setVisibility(View.GONE);
            findViewById(R.id.exit_tutorial).setVisibility(View.GONE);
        }


        App.getConnection().registerListener(this);

        //sensors
        mSensorController = new SensorController(getBaseContext());
        mSensorController.startListen();

        ((SeekBar) findViewById(R.id.seekbar_throttle)).setOnSeekBarChangeListener(new SeekBar.OnSeekBarChangeListener() {
            @Override
            public void onProgressChanged(SeekBar seekBar, int progress, boolean fromUser) {
                Log.i(sTag, String.valueOf(progress));
                App.getConnection().send(progress, "Thrust");
            }

            @Override
            public void onStartTrackingTouch(SeekBar seekBar) {

            }

            @Override
            public void onStopTrackingTouch(SeekBar seekBar) {

            }
        });
    }

    @Override
    public void onPause() {
        App.getConnection().send("pause", "Control");
        mSensorTimer.cancel();
        App.getConnection().unregisterListener();
        super.onPause();
    }

    @Override
    public void onResume(){
        super.onResume();
        App.getConnection().registerListener(this);
        mSensorTimer = new Timer();
        mSensorTimer.schedule(new TimerTask() {
            @Override
            public void run() {
                SensorData orientation = mSensorController.g();
                App.getConnection().send(orientation);
            }
        }, 50, 50);
        mPauseSwitch.setImageResource(R.drawable.game_on);
        if (mIsLightOn) {
            mWarningLight.turnOn();
        }
        App.getConnection().send("resume", "Control");
    }

    @Override
    public void onBackPressed()
    {
        if (mIsTutorial) {
            return;
        }

        mManualPause=true;
        mPauseSwitch.setImageResource(R.drawable.game_off);
        if (mWarningLight.isOn()) {
            mWarningLight.turnOff();
            mVibrator.cancel();
            AssetsCache.getAudio(R.raw.warning_alert).pause();
            AssetsCache.getAudio(R.raw.warning_alert).seekTo(0);
            mIsLightOn = true;
        }
        Intent intent=new Intent(this,DialogActivity.class);
        startActivity(intent);
    }

    public void pauseClick(View view) {
        onBackPressed();
    }

    private void onEndGame(final int score) {
        runOnUiThread(new Runnable() {
            @Override
            public void run() {
                mPauseSwitch.setImageResource(R.drawable.game_off);
                Intent intent = new Intent(GameActivity.this, DialogActivity.class);
                intent.putExtra(DialogActivity.sScoreKey, score);
                if (AssetsCache.isNewScore(score)) {
                    intent.putExtra(DialogActivity.sDialogTypeKey, R.layout.dialog_score);
                } else {
                    intent.putExtra(DialogActivity.sDialogTypeKey, R.layout.dialog_end_game);
                }

                startActivity(intent);
            }
        });
    }

    private void onEndTutorial(final boolean death){
        runOnUiThread(new Runnable() {
            @Override
            public void run() {
                mPauseSwitch.setImageResource(R.drawable.game_off);
                Intent intent = new Intent(GameActivity.this, DialogActivity.class);
                intent.putExtra(DialogActivity.sDialogTypeKey, R.layout.dialog_end_tutorial);
                if(death){
                    intent.putExtra(DialogActivity.sTutorialDeathKey, true);
                }
                startActivity(intent);
            }
        });
    }

    public void calibrate(View view) {
        mSensorController.calibrate();
        if (mIsTutorial) {
            App.getConnection().send("calibrate", "Tutorial");
        }
    }

    @Override
    public void onDestroy(){
        mSensorTimer.cancel();
        mSensorController.stopListen();
        super.onDestroy();
    }
    public void exitTutorial(View view){
        App.getConnection().send(null, "EndTutorial");
        Intent intent = new Intent(this, MainActivity.class);
        intent.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
        startActivity(intent);
    }

    public void nextTutorial(View view){
        App.getConnection().send(null, "NextTutorial");
    }

    public void previousTutorial(View view){
        App.getConnection().send(null, "PreviousTutorial");
    }

    // region Connection interface
    @Override
    public void onMessage(JSONObject message) {
        try {
            String type = message.getString("type");
            final String body = message.getString("body");
            switch (type) {
                case "AirplaneData":
                    final AirplaneData airplaneData = App.getGson().fromJson(body, AirplaneData.class);
                    updateGauges(airplaneData);
                    break;
                case "PlaySound":
                    playSound(body);
                    break;
                case "WarningLight":
                    runOnUiThread(new Runnable() {
                        @Override
                        public void run() {
                            if(body.equals("TurnOn")){
                                mWarningLight.turnOn();
                                mIsLightOn = true;
                            }else if(body.equals("TurnOff")){
                                mWarningLight.turnOff();
                                mIsLightOn = false;
                            }
                        }
                    });
                    break;
                case "EndGame":
                    onEndGame(Integer.parseInt(body));
                    break;
                case "EndTutorial":
                    onEndTutorial(false);
                    break;
                case "EndTutorialDeath":
                    onEndTutorial(true);
                    break;
                default:
                    Log.w(sTag, String.format("Got message with unknown type %s. Ignoring", type));
            }
        } catch (JSONException e) {
            Log.e(sTag, String.format("Got message with unknown format. Error: ", e.getMessage()));
        }
    }

    @Override
    public void onConnectToRoom() {

    }

    @Override
    public void onConnectToBrowser() {

    }

    @Override
    public void onDisconnect() {
        Intent intent=new Intent(this,DialogActivity.class);
        intent.putExtra(DialogActivity.sDialogTypeKey, R.layout.dialog_connection_error);
        startActivity(intent);
    }
    //endregion

    // region Privates
    private void updateGauges(final AirplaneData airplaneData) {
        runOnUiThread(new Runnable() {
            @Override
            public void run() {
                mPitch.setRoll(airplaneData.rollAngle);
                mPitch.setPitch(airplaneData.pitchAngle);
                mVelocityScala.setHand(airplaneData.velocity);
                mAltitudeScala.setHand(airplaneData.altitude);
                mCompass.setAngle(airplaneData.compassAngle);
            }
        });
    }

    private void alertVibrate(){
        if( AssetsCache.isVibrate()) {
            long[] pattern = {170, 700, 500, 700, 500, 700};
            mVibrator.vibrate(pattern, -1);
        }
    }
    private void playSound(final String name) {
        runOnUiThread(new Runnable() {
            @Override
            public void run() {
                switch (name) {
                    case "alert":
                        AssetsCache.getAudio(R.raw.warning_alert).start();
                        alertVibrate();
                        break;
                }
            }
        });
    }
    //endregion
}

