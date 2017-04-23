package com.technion.gyrocraft.custom_widgets;

import android.content.Context;
import android.content.res.TypedArray;
import android.graphics.Typeface;
import android.util.AttributeSet;
import android.widget.TextView;

import com.technion.gyrocraft.AssetsCache;
import com.technion.gyrocraft.R;

/**
 * Created by galmalka on 4/8/16.
 */
public class CustomFontTextView extends TextView {
    public CustomFontTextView(Context context) {
        super(context);
    }

    public CustomFontTextView(Context context, AttributeSet attrs) {
        super(context, attrs);

        applyCustomFont(attrs);
    }

    public CustomFontTextView(Context context, AttributeSet attrs, int defStyle) {
        super(context, attrs, defStyle);

        applyCustomFont(attrs);
    }

    private void applyCustomFont(AttributeSet attrs) {
        if (attrs != null) {
            TypedArray typedArray = getContext().obtainStyledAttributes(attrs, R.styleable.CustomFontTextView);
            String fontName = typedArray.getString(R.styleable.CustomFontTextView_fontName);
            if (fontName != null) {
                Typeface customFont = AssetsCache.getTypeface(fontName);
                setTypeface(customFont);
            }
            typedArray.recycle();
        }
    }
}
