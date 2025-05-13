package org.example.impl;

import org.example.*;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;

public class Parser implements IParser {
    private String currentCommand;
    private BufferedReader bReader;
    public String vmFileName;

    public Parser(File vmFile) {
        try {
            bReader = new BufferedReader(new FileReader(vmFile));
            vmFileName = vmFile.getName();
        } catch (FileNotFoundException ex) {
            System.err.println("Could not find file" + vmFile.getAbsolutePath());
        }
    }

    public boolean hasMoreCommands() {
        try {
            String nextLine = bReader.readLine();
            if (nextLine == null) {
                return false;
            } else {
                nextLine = nextLine.trim();
                if (nextLine.isEmpty() || nextLine.startsWith("//")) {
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
        String cc = getCurrentCommand();
        if (cc.startsWith("push")) {
            return CommandType.C_PUSH;
        } else if (cc.startsWith("pop")) {
            return CommandType.C_POP;
        } else if (cc.startsWith("label")) {
            return CommandType.C_LABEL;
        } else if (cc.startsWith("goto")) {
            return CommandType.C_GOTO;
        } else if (cc.startsWith("if-goto")) {
            return CommandType.C_IF;
        } else if (cc.startsWith("function")) {
            return CommandType.C_FUNCTION;
        } else if (cc.startsWith("call")) {
            return CommandType.C_CALL;
        } else if (cc.startsWith("return")) {
            return CommandType.C_RETURN;
        }
        return CommandType.C_ARITHMETIC;
    }

    public String arg1() {
        return getCurrentCommand().split(" ")[1];
    }

    public int arg2() {
        return Integer.parseInt(getCurrentCommand().split(" ")[2]);
    }

    public String getCurrentCommand() {
        return currentCommand;
    }
    
    public void setCurrentCommand(String cc) {
        currentCommand = cc;
    }
}