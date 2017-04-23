package com.technion.gyrocraft.activities;

import android.content.Intent;
import android.os.Bundle;
import android.support.v4.app.FragmentActivity;
import android.support.v4.app.FragmentTransaction;
import android.support.v4.view.PagerAdapter;
import android.support.v4.view.ViewPager;
import android.util.Log;
import android.view.View;
import android.widget.Toast;

import com.google.zxing.integration.android.IntentIntegrator;
import com.google.zxing.integration.android.IntentResult;
import com.technion.gyrocraft.Airplane;
import com.technion.gyrocraft.App;
import com.technion.gyrocraft.AssetsCache;
import com.technion.gyrocraft.Game;
import com.technion.gyrocraft.IAirplaneFragmentListener;
import com.technion.gyrocraft.IConnectionListener;
import com.technion.gyrocraft.R;
import com.technion.gyrocraft.ZoomOutPageTransformer;
import com.technion.gyrocraft.adapters.AirplanePagerAdapter;
import com.technion.gyrocraft.controllers.Connection;
import com.technion.gyrocraft.custom_widgets.AnimatedViewPager;
import com.technion.gyrocraft.custom_widgets.ImageButtonSelector;
import com.technion.gyrocraft.fragments.AirplaneFragment;

import org.json.JSONObject;

public class AirplanesActivity extends FragmentActivity implements IAirplaneFragmentListener, IConnectionListener {
    private static final String sTag = "AirplanesActivity";

    private AnimatedViewPager mPager;
    private PagerAdapter mPagerAdapter;
    private ImageButtonSelector mLeft,mRight;
    private int mCurrentPosition;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_airplanes);

        mPager = (AnimatedViewPager) findViewById(R.id.view_pager);
        mLeft=(ImageButtonSelector)findViewById(R.id.left_button);
        mRight=(ImageButtonSelector)findViewById(R.id.right_button);
        if (mPager != null) {
            mPager.addOnPageChangeListener(new ViewPager.OnPageChangeListener() {
                @Override
                public void onPageScrolled(int position, float positionOffset, int positionOffsetPixels) {

                }

                @Override
                public void onPageSelected(int position) {
                    enableButtons();
                }

                @Override
                public void onPageScrollStateChanged(int state) {

                }
            });
            mPagerAdapter = new AirplanePagerAdapter(getSupportFragmentManager(), this, AssetsCache.getAirplanes());
            mPager.setPageTransformer(true, new ZoomOutPageTransformer());
            mPager.setAdapter(mPagerAdapter);
            enableButtons();
        }
        else {
            AirplaneFragment airplaneFragment = AirplaneFragment.newInstance(AssetsCache.getAirplanes().get(0));
            getSupportFragmentManager().beginTransaction().add(R.id.airplane_fragement_container, airplaneFragment).commit();
        }
    }

    @Override
    public void onBackPressed() {
        if (mPager == null || mPager.getCurrentItem() == 0) {
            super.onBackPressed();
        } else {
            mPager.setCurrentItem(mPager.getCurrentItem() - 1);
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

    public void backClick(View view) {
        finish();
    }

    public void startClick(View view) {
        // If we're already connected we don't need to scan the qr
        if (App.getConnection().getState() == Connection.State.ConnectedToBrowser) {
            startGame(null);
        }
        else {
            new IntentIntegrator(this).setOrientationLocked(false).setCaptureActivity(QRActivity.class).setBeepEnabled(false).initiateScan();
        }
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        IntentResult result = IntentIntegrator.parseActivityResult(requestCode, resultCode, data);
        if(result != null) {
            if(result.getContents() == null) {
                Log.d(sTag, "Cancelled scan");
            } else {
                Log.d(sTag, "Scanned: " + result.getContents());
                startGame(result.getContents());
            }
        } else {
            // This is important, otherwise the result will not be passed to the fragment
            super.onActivityResult(requestCode, resultCode, data);
        }
    }
    public void leftArrowClick(View view) {
        if (mPager.getCurrentItem() > 0) {
            mPager.setCurrentItem(mPager.getCurrentItem() - 1);
        }
    }

    public void rightArrowClick(View view) {
        if (mPager.getCurrentItem() < mPagerAdapter.getCount() - 1) {
            mPager.setCurrentItem(mPager.getCurrentItem() + 1, true);
        }
    }
    private void enableButtons(){
            mLeft.setEnabled(mPager.getCurrentItem() != 0);
            mRight.setEnabled(mPager.getCurrentItem() != mPagerAdapter.getCount() - 1);
    }
    @Override
    public void onListItemClick(int position) {
        mCurrentPosition = position;
        AirplaneFragment airplaneFragment = AirplaneFragment.newInstance(AssetsCache.getAirplanes().get(position));
        FragmentTransaction transaction = getSupportFragmentManager().beginTransaction();
        transaction.replace(R.id.airplane_fragement_container, airplaneFragment);
        transaction.commit();
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
                Toast.makeText(AirplanesActivity.this, "Connection was lost", Toast.LENGTH_LONG).show();
            }
        });
    }

    private void startGame(String UUID) {
        Intent[] intents = new Intent[2];
        intents[0] = new Intent(this, GameActivity.class);
        intents[1] = new Intent(this, ConnectionActivity.class);
        intents[1].putExtra(getString(R.string.uuid), UUID);
        String airplaneName;
        int pos;
        if (mPager != null) {
            pos = mPager.getCurrentItem();
            airplaneName = AssetsCache.getAirplanes().get(mPager.getCurrentItem()).getName();
        }
        else {
            pos = mCurrentPosition;
            airplaneName = AssetsCache.getAirplanes().get(mCurrentPosition).getName();
        }
        intents[0].putExtra(getString(R.string.airplane),pos);
        intents[0].putExtra(getString(R.string.TutorialMode),getIntent().getBooleanExtra(getString(R.string.TutorialMode), false));
        intents[1].putExtra(getString(R.string.game), new Game(airplaneName, AssetsCache.getBrowserVolume(), AssetsCache.getHighScore(),getIntent().getBooleanExtra(getString(R.string.TutorialMode), false)));
        startActivities(intents);
    }
}
