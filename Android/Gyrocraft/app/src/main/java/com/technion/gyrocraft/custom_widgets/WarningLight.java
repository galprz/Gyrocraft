package com.technion.gyrocraft.custom_widgets;

import android.content.Context;
import android.util.AttributeSet;
import android.view.animation.AlphaAnimation;
import android.view.animation.Animation;
import android.view.animation.AnimationUtils;
import android.view.animation.LinearInterpolator;
import android.widget.ImageView;
import android.widget.RelativeLayout;
import com.technion.gyrocraft.R;

/**
 * Created by galp on 5/18/16.
 */
public class WarningLight extends RelativeLayout {
    private ImageView mLight = null;
    private boolean mIsOn = false;

    public WarningLight(Context context) {
        super(context);
        init();
    }

    public WarningLight(Context context, AttributeSet attrs) {
        super(context, attrs);
        init();
    }

    public WarningLight(Context context, AttributeSet attrs, int defStyle) {
        super(context, attrs, defStyle);
        init();
    }

    private void init() {
        inflate(getContext(), R.layout.widget_warning_light, this);
        mLight = (ImageView) findViewById(R.id.light);
    }

    synchronized public void turnOn() {
        if(mIsOn){
            return ;
        }
        mIsOn = true;
        mLight.setAlpha((float)1);
        final Animation animation = new AlphaAnimation(1, 0);
        animation.setDuration(700);
        animation.setInterpolator(new LinearInterpolator());
        animation.setRepeatCount(Animation.INFINITE);
        animation.setRepeatMode(Animation.REVERSE);
        mLight.startAnimation(animation);

    }

    synchronized public void turnOff(){
        mLight.clearAnimation();
        mLight.setAlpha((float)0);
        mIsOn = false;
    }

    synchronized public boolean isOn() {
        return mIsOn;
    }

}
