package com.technion.gyrocraft.custom_widgets;

import android.content.Context;
import android.support.percent.PercentRelativeLayout;
import android.util.AttributeSet;
import android.widget.ImageView;

import com.technion.gyrocraft.R;

/**
 * Created by galp on 4/9/16.
 */
public class Pitch extends PercentRelativeLayout {
    private ImageView mInsideCircle;

    public Pitch(Context context) {
        super(context);
        init();
    }

    public Pitch(Context context, AttributeSet attrs) {
        super(context, attrs);
        init();
    }

    public Pitch(Context context, AttributeSet attrs, int defStyle) {
        super(context, attrs, defStyle);
        init();
    }

    private void init(){
        inflate(getContext(), R.layout.widget_pitch, this);
        mInsideCircle = (ImageView) findViewById(R.id.pitch_inside_circle);
    }

    public void setRoll(float angle){
        mInsideCircle.setRotation((float) (angle * 180 / Math.PI));
    }

    public void setPitch(float angle){
        mInsideCircle.setTranslationY((float) (angle * mInsideCircle.getHeight() * 0.3));
    }

}
