package com.technion.gyrocraft.activities;

import android.content.Intent;
import android.os.Bundle;
import android.support.v4.app.FragmentActivity;
import android.util.Log;
import android.view.View;
import android.widget.EditText;
import android.widget.TextView;

import com.technion.gyrocraft.App;
import com.technion.gyrocraft.AssetsCache;
import com.technion.gyrocraft.IConnectionListener;
import com.technion.gyrocraft.R;
import com.technion.gyrocraft.controllers.Connection.State;
import com.technion.gyrocraft.fragments.OptionsFragment;

import org.json.JSONException;
import org.json.JSONObject;

public class DialogActivity extends FragmentActivity implements IConnectionListener {
    public static final String sTag = "DialogActivity";
    public static final String sTutorialDeathKey = "finishType";
    public static final String sDialogTypeKey = "dialog_type";
    public static final String sScoreKey = "score";
    private int mDialogType;
    private int mScore;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        this.setFinishOnTouchOutside(false);
        Bundle parameters = getIntent().getExtras();
        if(parameters!=null) {
            mDialogType = parameters.getInt(sDialogTypeKey, R.layout.dialog_pause);
            setContentView(mDialogType);
        }
        else {
            mDialogType = R.layout.dialog_pause;
            setContentView(R.layout.dialog_pause);
        }

        if (mDialogType == R.layout.dialog_end_game) {
            TextView finalScoreTextView = (TextView) findViewById(R.id.dialog_end_final_score);
            String curText = (String) finalScoreTextView.getText();
            finalScoreTextView.setText(curText.replace("<score>", String.valueOf(parameters.getInt(sScoreKey))));
        }
        else if (mDialogType == R.layout.dialog_score) {
            mScore = parameters.getInt(sScoreKey);
            TextView finalScoreTextView = (TextView) findViewById(R.id.dialog_score_final_score);
            String curText = (String) finalScoreTextView.getText();
            finalScoreTextView.setText(curText.replace("<score>", String.valueOf(mScore)));
            if (AssetsCache.isHighScore(mScore)) {
                ((TextView) findViewById(R.id.score_dialog_title)).setText("New High Score");
            }

        }else if(mDialogType == R.layout.dialog_end_tutorial){
            if(parameters.getBoolean(sTutorialDeathKey, false)){
                ((TextView) findViewById(R.id.finish_tutorial_text)).setText(R.string.finish_tutorial_death);
            }else{
                ((TextView) findViewById(R.id.finish_tutorial_text)).setText(R.string.finish_tutorial);
            }
        }
        else if (mDialogType == R.layout.dialog_options) {
            getSupportFragmentManager().beginTransaction().add(R.id.fragment_container, OptionsFragment.newInstance(true)).commit();
        }
    }

    @Override
    public void onPause() {
        App.getConnection().unregisterListener();
        super.onPause();
    }

    @Override
    public void onResume(){
        super.onResume();
        App.getConnection().registerListener(this);
    }

    @Override
    public void onBackPressed(){
        Intent intent;
        switch(mDialogType) {
            case R.layout.dialog_pause:
                intent = new Intent(this, GameActivity.class);
                intent.setFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP);
                intent.putExtra("state", "resume");
                finish();
                startActivity(intent);
                break;

            case R.layout.dialog_score:
                intent = new Intent(this, DialogActivity.class);
                intent.putExtra(sDialogTypeKey, R.layout.dialog_end_game);
                intent.putExtra(sScoreKey, mScore);
                finish();
                startActivity(intent);
                break;

            case R.layout.dialog_options:
                intent = new Intent(this, DialogActivity.class);
                intent.putExtra(sDialogTypeKey,R.layout.dialog_pause);
                finish();
                startActivity(intent);
                break;

            case R.layout.dialog_connection_error:
            case R.layout.dialog_end_game:
            case R.layout.dialog_end_tutorial:
                returnToMain(null);
                break;
        }
    }

    //region main navigation
    public void returnToMain(View view) {
        if (App.getConnection().getState() == State.ConnectedToBrowser) {
            App.getConnection().send("go_to_main", "Control");
        }

        Intent intent = new Intent(this, MainActivity.class);
        intent.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
        startActivity(intent);
    }

    public void resumeGame(View view) {
        onBackPressed();
    }
    public void restartGame(View view) {
        App.getConnection().send("restart", "Control");
        Intent intent = new Intent(this, GameActivity.class);
        intent.setFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP);
        intent.putExtra("state", "restart");
        finish();
        startActivity(intent);
    }
    //endregion

    //region scoreDialog
    public void continueToEnd(View view) {
        onBackPressed();
    }

    public void submitScore(View view) {
        String name = String.valueOf(((EditText) findViewById(R.id.high_score_name)).getText());
        if (name.equals("")) {
            name = "Guest";
        }
        AssetsCache.addScore(new AssetsCache.Score(name, mScore));
        App.getConnection().send(AssetsCache.getHighScore(), "HighScore");
        continueToEnd(view);
    }
    //endregion

    // region IConnectionListener implementation
    @Override
    public void onMessage(JSONObject message) {
        // Copied from GameActivity to handle the scenario of the user pressing the pause
        // button and then EndGame message is received

        try {
            if (message.getString("type").equals("EndGame")) {
                int score = Integer.parseInt(message.getString("body"));
                Intent intent=new Intent(this,DialogActivity.class);
                intent.putExtra(DialogActivity.sScoreKey, score);
                if (AssetsCache.isNewScore(score)) {
                    intent.putExtra(DialogActivity.sDialogTypeKey, R.layout.dialog_score);
                }
                else {
                    intent.putExtra(DialogActivity.sDialogTypeKey, R.layout.dialog_end_game);
                }
                finish();
                startActivity(intent);
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
        Intent intent = new Intent(this, DialogActivity.class);
        intent.putExtra(sDialogTypeKey,R.layout.dialog_connection_error);
        finish();
        startActivity(intent);
    }

    public void optionsClick(View view) {
        Intent intent = new Intent(this, DialogActivity.class);
        intent.putExtra(sDialogTypeKey,R.layout.dialog_options);
        finish();
        startActivity(intent);
    }

    public void backClick(View view) {
        App.getConnection().send(AssetsCache.getBrowserVolume(), "Volume");
        onBackPressed();
    }
    //endregion
}
