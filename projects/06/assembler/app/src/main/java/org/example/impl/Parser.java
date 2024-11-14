package org.example.impl;

import org.example.CommandType;
import org.example.IParser;

import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.io.File;
import java.io.FileNotFoundException;

public class Parser implements IParser {
    private String currentCommand;
    private String currentDestChars;
    private String currentCompChars;
    private String currentJumpChars;
    private BufferedReader bReader;

    public Parser() {}

    public Parser(File asmFile) {
        // open input file in order to parse it
        try {
            bReader = new BufferedReader(new FileReader(asmFile));
            // setCurrentCommand(bReader.readLine());
        } catch (FileNotFoundException ex) {
            System.err.println("Could not find file" + asmFile.getAbsolutePath());
        } catch (IOException ex) {
            System.err.println("Could not read file");
        }
    }

    public boolean hasMoreCommands() {
        try {
            String nextLine = bReader.readLine();
            if (nextLine == null) {
                return false;
            } else {
                nextLine = nextLine.trim();
                if (nextLine.startsWith("//")) {
                    return hasMoreCommands();
                }
                if (nextLine.contains("//")) {
                    nextLine = nextLine.split("\\/\\/")[0];
                }
                setCurrentCommand(nextLine.trim());
                return true;
            }
        } catch (IOException ex) {
            System.err.println("Could not read file");
        }
        return false;
    }

    public void advance() {
        try {
            setCurrentCommand(bReader.readLine());
        } catch (IOException ex) {
            System.err.println("Could not read file");
        }
    }

    public CommandType commandType() {
        // take the currentCommand, and get the command type (A,C,L)
        if (currentCommand.startsWith("@")) {
            return CommandType.A_COMMAND;
        } else if (currentCommand.startsWith("(")) {
            return CommandType.L_COMMAND;
        } else if (currentCommand.startsWith("//") || currentCommand.isEmpty()) {
            return CommandType.COMMENT;
        } else {
            return CommandType.C_COMMAND;
        }
    }

    public String symbol() {
        switch (commandType()) {
            case A_COMMAND:
                return currentCommand.split("@")[1];
            case L_COMMAND:
                return currentCommand.substring(1, currentCommand.length()-1);
            case C_COMMAND:
            default:
                return null;
        }
    }

    public String dest() {
        return currentDestChars;
    }

    public String comp() {
        return currentCompChars;
    }

    public String jump() {
        return currentJumpChars;
    }

    public void setCurrentCommand(String command) {
        currentCommand = command;
        setCurrentChars();
    }

    public String[] setCurrentChars() {
        if (commandType() == CommandType.C_COMMAND) {
            // set dest, comp, and jump chars based on current command
            String[] destPlusRest = currentCommand.split("=");
            currentDestChars = destPlusRest.length > 1 ? destPlusRest[0] : "";
            String[] compPlusJump = (destPlusRest[destPlusRest.length - 1]).split(";");
            currentCompChars = compPlusJump[0];
            currentJumpChars = compPlusJump.length > 1 ? compPlusJump[1] : "";
            return new String[] {currentDestChars, currentCompChars, currentJumpChars};
        } else {
            currentDestChars = "";
            currentCompChars = "";
            currentJumpChars = "";
            return null;
        }
    }
}
