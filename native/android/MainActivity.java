package com.maluquinhodev.quadra;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(QuadraStoragePlugin.class);
        super.onCreate(savedInstanceState);
    }
}
