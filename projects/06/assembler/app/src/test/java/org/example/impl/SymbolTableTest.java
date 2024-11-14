package org.example.impl;

import org.junit.Test;
import static org.junit.Assert.*;

public class SymbolTableTest {
    @Test public void initTest() {
        SymbolTable table = new SymbolTable();
        assertEquals(0, table.getAddress("SP"));
        assertEquals(2, table.getAddress("ARG"));
        assertEquals(0, table.getAddress("R0"));
        assertEquals(13, table.getAddress("R13"));
        assertEquals(24576, table.getAddress("KBD"));
    }
}
