package org.example.impl;

import java.util.Map;
import java.util.HashMap;

import org.example.ISymbolTable;

public class SymbolTable implements ISymbolTable {
    private Map<String, Integer> symbolTableMap;
    public SymbolTable() {
        symbolTableMap = new HashMap<String, Integer>();
        symbolTableMap.put("SP", 0);
        symbolTableMap.put("LCL", 1);
        symbolTableMap.put("ARG", 2);
        symbolTableMap.put("THIS", 3);
        symbolTableMap.put("THAT", 4);
        symbolTableMap.put("SCREEN", 16384);
        symbolTableMap.put("KBD", 24576);
        for (int i=0; i<16; i++) {
            symbolTableMap.put(String.format("R%d", i), i);
        }
    }

    public void addEntry(String symbol, int address) {
        symbolTableMap.put(symbol, address);
    }

    public boolean contains(String symbol) {
        return symbolTableMap.containsKey(symbol);
    }

    public int getAddress(String symbol) {
        return symbolTableMap.get(symbol);
    }
}
