package com.technion.gyrocraft.custom_widgets;

import android.content.Context;
import android.content.res.TypedArray;
import android.graphics.drawable.Drawable;
import android.graphics.drawable.StateListDrawable;
import android.util.AttributeSet;
import android.widget.ImageView;

import com.technion.gyrocraft.R;

/**
 * Created by Eliran_work on 16/4/2016.
 */
public class ImageButtonSelector extends ImageView{
    private StateListDrawable myState=new StateListDrawable();

    public ImageButtonSelector(Context context) {
        super(context);
    }

    public ImageButtonSelector(Context context, AttributeSet attrs) {
        super(context, attrs);
        this.applySelector(context, attrs);
    }

    public ImageButtonSelector(Context context, AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
        this.applySelector(context, attrs);
    }


    private void applySelector(Context context, AttributeSet attrs) {
        setClickable(true);
        if (attrs != null) {
            TypedArray typedArray = getContext().obtainStyledAttributes(attrs, R.styleable.ImageButtonSelector);
            Drawable drawable=typedArray.getDrawable(R.styleable.ImageButtonSelector_imgDisabled);
            if (drawable != null)
                myState.addState(new int[] {-android.R.attr.state_enabled},drawable);
            drawable=typedArray.getDrawable(R.styleable.ImageButtonSelector_imgPressed);
            if (drawable != null)
                myState.addState(new int[] {android.R.attr.state_pressed, android.R.attr.state_enabled},drawable);
            drawable=typedArray.getDrawable(R.styleable.ImageButtonSelector_imgEnabled);
            if (drawable != null)
                myState.addState(new int[]{android.R.attr.state_enabled}, drawable);
            typedArray.recycle();
            setImageDrawable(myState);
        }
    }
}
