package com.technion.gyrocraft.custom_widgets;

import android.content.Context;
import android.support.percent.PercentRelativeLayout;
import android.util.AttributeSet;
import android.util.DisplayMetrics;

/**
 * Created by galmalka on 4/8/16.
 */
public class SlidingPercentRelativeLayout extends PercentRelativeLayout {
    private int mHeight;

    public SlidingPercentRelativeLayout(Context context) {
        super(context);
        setSize(context);
    }

    public SlidingPercentRelativeLayout(Context context, AttributeSet attrs) {
        super(context, attrs);
        setSize(context);
    }

    public SlidingPercentRelativeLayout(Context context, AttributeSet attrs, int defStyle) {
        super(context, attrs, defStyle);
        setSize(context);
    }

    private void setSize(Context context) {
        DisplayMetrics displayMetrics = context.getResources().getDisplayMetrics();
        mHeight = displayMetrics.heightPixels;
    }

    public float getYFraction() {
        return (mHeight == 0) ? 0 : getY() / (float) mHeight;
    }

    public void setYFraction(float yFraction) {
        setY((mHeight > 0) ? (yFraction * mHeight) : 0);
    }
}
