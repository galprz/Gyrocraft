package com.technion.gyrocraft.custom_widgets;

import android.content.Context;
import android.content.res.TypedArray;
import android.support.percent.PercentRelativeLayout;
import android.util.AttributeSet;
import android.widget.ImageView;

import com.technion.gyrocraft.R;

/**
 * Created by galp on 4/9/16.
 */
public class Scala extends PercentRelativeLayout {
    private static final int TYPE_ALTITUDE = 0;
    private static final int TYPE_VELOCITY = 1;
    private ImageView mScala;
    private ImageView mHand;
    private int mMax = 100;

    public Scala(Context context) {
        super(context);
        init(null);
    }

    public Scala(Context context, AttributeSet attrs) {
        super(context, attrs);
        init(attrs);
    }

    public Scala(Context context, AttributeSet attrs, int defStyle) {
        super(context, attrs, defStyle);
        init(attrs);
    }

    private void init(AttributeSet attrs){
        inflate(getContext(), R.layout.widget_scala, this);
        mHand = (ImageView) findViewById(R.id.scala_hand);
        mScala  = (ImageView) findViewById(R.id.scala_frame);
        if (attrs != null) {
            TypedArray typeArray = getContext().obtainStyledAttributes(attrs, R.styleable.Scala);
            mMax = typeArray.getInt(R.styleable.Scala_max, 100);
            int type = typeArray.getInt(R.styleable.Scala_Type, -1);
            if (type == TYPE_VELOCITY) {
                ((ImageView) findViewById(R.id.scala_frame)).setImageResource(R.drawable.airspeed_scala);
            }
            else if (type == TYPE_ALTITUDE) {
                ((ImageView) findViewById(R.id.scala_frame)).setImageResource(R.drawable.alt_scala);
            }
        }
    }

    public void setHand(float value){
        mHand.setRotation(value/mMax*340);
    }
    public void setScalaImage(int imageId){
        mScala.setImageResource(imageId);
    }
}
