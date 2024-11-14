package org.example.impl;

import org.junit.Test;
import org.junit.Before;

import static org.junit.Assert.*;

import org.example.CommandType;

public class ParserTest {
    Parser testParser;
    @Before public void setup() {
        testParser = new Parser();
    }

    @Test public void destTest() {
        testParser.setCurrentCommand("AM=M+1");
        assertEquals("AM", testParser.dest());

        testParser.setCurrentCommand("D+1");
        assertEquals("", testParser.dest());
    }

    // @Test public void mapDestToCodeTest() {
    //     String inputDest;
    //     String outputHackSnippet;
    //     inputDest = "A";
    //     outputHackSnippet = testParser.mapDestToCode(inputDest);
    //     assertEquals("100", outputHackSnippet);

    //     inputDest = "MD";
    //     outputHackSnippet = testParser.mapDestToCode(inputDest);
    //     assertEquals("011", outputHackSnippet);

    //     inputDest = "AMD";
    //     outputHackSnippet = testParser.mapDestToCode(inputDest);
    //     assertEquals("111", outputHackSnippet);

    //     inputDest = "";
    //     outputHackSnippet = testParser.mapDestToCode(inputDest);
    //     assertEquals("000", outputHackSnippet);
    // }

    @Test public void setCurrentCharsTest() {
        testParser.setCurrentCommand("AMD=M+1");
        assertArrayEquals(new String[]{"AMD", "M+1", ""}, testParser.setCurrentChars());

        testParser.setCurrentCommand("M=D+M");
        assertArrayEquals(new String[]{"M", "D+M", ""}, testParser.setCurrentChars());

        testParser.setCurrentCommand("D;JGT");
        assertArrayEquals(new String[]{"", "D", "JGT"}, testParser.setCurrentChars());

        testParser.setCurrentCommand("0;JMP");
        assertArrayEquals(new String[]{"", "0", "JMP"}, testParser.setCurrentChars());
    }

    @Test public void compTest() {
        testParser.setCurrentCommand("AM=D-1;");
        assertEquals("D-1", testParser.comp());

        // testParser.setCurrentCommand("D+A");
        // assertEquals("0000010", testParser.comp());

        // testParser.setCurrentCommand("A&D");
        // assertEquals("0000000", testParser.comp());

        // testParser.setCurrentCommand("-M");
        // assertEquals("1110011", testParser.comp());

        // testParser.setCurrentCommand("M-D");
        // assertEquals("1000111", testParser.comp());

        // testParser.setCurrentCommand("!M");
        // assertEquals("1110001", testParser.comp());
    }

    // @Test public void compTest() {
    //     testParser.setCurrentCommand("D-1");
    //     assertEquals("0001110", testParser.comp());

    //     testParser.setCurrentCommand("D+A");
    //     assertEquals("0000010", testParser.comp());

    //     testParser.setCurrentCommand("A&D");
    //     assertEquals("0000000", testParser.comp());

    //     testParser.setCurrentCommand("-M");
    //     assertEquals("1110011", testParser.comp());

    //     testParser.setCurrentCommand("M-D");
    //     assertEquals("1000111", testParser.comp());

    //     testParser.setCurrentCommand("!M");
    //     assertEquals("1110001", testParser.comp());
    // }

    @Test public void jumpTest() {
        testParser.setCurrentCommand("0;JMP");
        assertEquals("JMP", testParser.jump());

        testParser.setCurrentCommand("D;JGT");
        assertEquals("JGT", testParser.jump());

        testParser.setCurrentCommand("M+D;JNE");
        assertEquals("JNE", testParser.jump());
    }

    @Test public void symbolTest() {
        testParser.setCurrentCommand("@50");
        assertEquals("50", testParser.symbol());

        testParser.setCurrentCommand("@sum");
        assertEquals("sum", testParser.symbol());

        testParser.setCurrentCommand("(LOOP)");
        assertEquals(CommandType.L_COMMAND, testParser.commandType());
        assertEquals("LOOP", testParser.symbol());

    }
}
