package org.example.util;

import static org.example.util.MathHelpers.*;
import org.junit.Test;
import static org.junit.Assert.*;

public class MathHelpersTest {

    @Test public void decimalToBinaryTest() {
        assertEquals(0, decimalToBinary(0));
        assertEquals(1, decimalToBinary(1));
        assertEquals(110, decimalToBinary(6));
        assertEquals(1011, decimalToBinary(11));
        assertEquals(1101, decimalToBinary(13));
        assertEquals(1111, decimalToBinary(15));
        assertEquals(110101101010110L, decimalToBinary(27478));
    }
}
