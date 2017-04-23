package com.technion.gyrocraft.activities;
import android.content.Intent;
import android.os.Bundle;
import android.support.v4.app.Fragment;
import android.support.v4.app.FragmentActivity;
import android.support.v4.app.FragmentTransaction;
import android.util.Log;
import android.view.KeyEvent;
import android.view.View;
import android.widget.Toast;

import com.technion.gyrocraft.App;
import com.technion.gyrocraft.IConnectionListener;
import com.technion.gyrocraft.R;
import com.technion.gyrocraft.fragments.LeaderBoardFragment;
import com.technion.gyrocraft.fragments.MainFragment;
import com.technion.gyrocraft.fragments.OptionsFragment;

import org.json.JSONObject;

public class MainActivity extends FragmentActivity implements IConnectionListener {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        if (savedInstanceState != null) {
            return;
        }

        MainFragment mainFragment = new MainFragment();
        getSupportFragmentManager().beginTransaction().add(R.id.fragment_container, mainFragment).commit();
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

    public void startGameBtn(View view) {
        Intent intent=new Intent(this, AirplanesActivity.class);
        intent.putExtra(getString(R.string.TutorialMode), false);
        startActivity(intent);
        overridePendingTransition(0, 0);
    }
    public void startTutorialBtn(View view) {
        Intent intent=new Intent(this, AirplanesActivity.class);
        Bundle params = new Bundle();
        params.putBoolean(getString(R.string.TutorialMode), true);
        intent.putExtras(params);
        startActivity(intent);
        overridePendingTransition(0, 0);
    }

    public void leaderBoardBtn(View view) {
        replaceFragment(new LeaderBoardFragment(), R.id.fragment_container);
    }

    private void replaceFragment(Fragment frag, int id){
        FragmentTransaction transaction = getSupportFragmentManager().beginTransaction();
        transaction.setCustomAnimations(0, 0);
        transaction.addToBackStack(null);
        transaction.replace(id, frag);
        transaction.commit();
    }

    public void onOptionsClick(View view) {
        replaceFragment(OptionsFragment.newInstance(false), R.id.fragment_container);
    }

    public void backClick(View view) {
        onBackPressed();
    }

    @Override
    public void onBackPressed() {
        if (getSupportFragmentManager().getBackStackEntryCount() > 0) {
            getSupportFragmentManager().popBackStack();
        }
        else {
            super.onBackPressed();
        }
    }

    @Override
    public void onMessage(JSONObject message) {

    }

    @Override
    public void onConnectToRoom() {

    }

    @Override
    public void onConnectToBrowser() {

    }

    @Override
    public void onDisconnect() {
        runOnUiThread(new Runnable() {
            @Override
            public void run() {
                Toast.makeText(MainActivity.this, "Connection was lost", Toast.LENGTH_LONG).show();
            }
        });
    }
}
