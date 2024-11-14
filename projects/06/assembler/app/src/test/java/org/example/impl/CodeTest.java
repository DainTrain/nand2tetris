package org.example.impl;

import org.junit.Test;
import org.junit.Before;
import static org.junit.Assert.*;

public class CodeTest {
    Code testCode;
    @Before public void setup() {
        testCode = new Code();
    }

    @Test public void destTest() {
        assertEquals("101", testCode.dest("AM"));
    }
}
