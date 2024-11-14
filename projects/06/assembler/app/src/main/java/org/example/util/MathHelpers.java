package org.example.util;

public class MathHelpers {

    // taken from https://www.geeksforgeeks.org/java-program-for-decimal-to-binary-conversion/
    public static long decimalToBinary(int N) {
        long binaryNum = 0;
        int count = 0;
        while (N != 0) {
            int rem = N % 2;
            Double c = Math.pow(10, count);
            long cLong = c.longValue();
            binaryNum += rem * cLong;
            N /= 2;
            count++;
        }
        return binaryNum;
    }
}
