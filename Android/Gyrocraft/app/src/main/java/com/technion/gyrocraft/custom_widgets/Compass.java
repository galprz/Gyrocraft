package com.technion.gyrocraft.custom_widgets;

import android.content.Context;
import android.support.percent.PercentRelativeLayout;
import android.util.AttributeSet;
import android.widget.ImageView;

import com.technion.gyrocraft.R;

/**
 * Created by galp on 4/9/16.
 */
public class Compass extends PercentRelativeLayout {
    private ImageView mInside;

    public Compass(Context context) {
        super(context);
        init();

    }

    public Compass(Context context, AttributeSet attrs) {
        super(context, attrs);
        init();
    }

    public Compass(Context context, AttributeSet attrs, int defStyle) {
        super(context, attrs, defStyle);
        init();
    }

    private void init(){
        inflate(getContext(), R.layout.widget_compass, this);
        mInside = (ImageView) findViewById(R.id.compass_inside);
    }

    public void setAngle(float angle){
        mInside.setRotation(angle);
    }
}
