package org.example.impl;

import org.example.*;
import java.io.BufferedWriter;
import java.io.FileWriter;
import java.io.IOException;
import java.util.Map;
import java.util.HashMap;

public class CodeWriter implements ICodeWriter {
    private String fileName;
    private BufferedWriter bWriter = null;
    private Map<String,String> segmentToSymbolMap = new HashMap<String, String>(){{
        put("local", "LCL"); put("argument", "ARG"); put("this", "THIS"); put("that", "THAT");}};

    public CodeWriter() {

    }

    public void setFileName(String fileName) throws IOException {
        System.out.println("filename: " + fileName);
        FileWriter fstream = new FileWriter(fileName + ".asm");
        bWriter = new BufferedWriter(fstream);
    }

    private void write(String asmCommand) throws IOException {
        bWriter.write(asmCommand + "\n");
    }

    /**
     * writes an arithmetic VM command to assembly
     */
    public void writeArithmetic(String command) throws IOException {
        write("// " + command);
        /* [Base-2] x
        *  [Base-1] y
        *  [Base=SP] empty
        * for unary operators (neg, not), decrement SP and operate only on y.
        * for binary operators (add, sub, eq, gt, lt, and, or),
        * we will decrement SP to store y, decrement again to operate on x,
        * write the result, and then increment SP to point to the next available addr.
        */
        if (command == "neg" || command == "not") {
            write("@SP");
            write("A=M-1");
            write("M=" + (command == "neg" ? "-" : "!") + "M");
        }

        switch (command) {
            case "add":
            case "sub":
            case "and":
            case "or":
                writeSimpleTemplate(command);
                break;
            case "eq":
            case "gt":
            case "lt":
                writeBranchTemplate(command);
                break;
            default:
                break;
        }
    }

    public void writePushPop(CommandType command, String segment, int index) throws IOException {
        write("// " + (command == CommandType.C_POP ? "pop " : "push ") + segment + " " + index);
        switch (segment) {
            case "constant":
                if (command == CommandType.C_PUSH) {
                    write("@" + index);
                    write("D=A");
                    write("@SP");
                    write("A=M");
                    write("M=D");
                    writeIncrementSP();
                }
                break;
            case "pointer":
                if (command == CommandType.C_POP) {
                    writeDecrementSP();
                    write("A=M");
                    write("D=M");
                    write(index == 0 ? "@THIS" : "@THAT");
                    write("M=D");
                } else {
                    write(index == 0 ? "@THIS" : "@THAT");
                    write("D=M");
                    write("@SP");
                    write("A=M");
                    write("M=D");
                    writeIncrementSP();
                }
                break;
            case "temp":
                if (command == CommandType.C_POP) {
                    writeDecrementSP();
                    write("A=M");
                    write("D=M");
                    int addr = 5 + index;
                    write("@" + addr);
                    write("M=D");
                } else {
                    int addr = 5 + index;
                    write("@" + addr);
                    write("D=M");
                    write("@SP");
                    write("A=M");
                    write("M=D");
                    writeIncrementSP();
                }
            case "static":
                if (command == CommandType.C_POP) {
                    writeDecrementSP();
                    write("A=M");
                    write("D=M");
                    write("@" + fileName + "." + index);
                    write("M=D");
                } else {
                    write("@" + fileName + "." + index);
                    write("D=M");
                    write("@SP");
                    write("A=M");
                    write("M=D");
                    writeIncrementSP();
                }
                break;
            case "local":
            case "argument":
            case "this":
            case "that":
                if (command == CommandType.C_POP) {
                    writeIndexedPop(segment, index);
                } else {
                    writeIndexedPush(segment, index);
                }
                break;
            default:
                break;
        }
    }

    /**
     * writes a push to the stack from one of the indexed memory segments:
     * local, argument, this, that
     */
    public void writeIndexedPush(String segment, int index) throws IOException {
        write("@" + index);
        write("D=A");
        write("@" + segmentToSymbolMap.get(segment));
        write("A=D+M");
        write("D=M");
        write("@SP");
        write("A=M");
        write("M=D");
        writeIncrementSP();
    }

    /**
     * writes a pop from the stack to one of the indexed memory segments:
     * local, argument, this, that
     */
    public void writeIndexedPop(String segment, int index) throws IOException {
        write("@" + index);
        write("D=A");
        write("@" + segmentToSymbolMap.get(segment));
        write("D=D+M");
        write("@R13");
        write("M=D");
        writeDecrementSP();
        write("A=M");
        write("D=M");
        write("@R13");
        write("M=D");
    }

    public void close() throws IOException {
        bWriter.close();
    }

    public void writeDecrementSP() throws IOException {
        write("@SP");
        write("M=M-1");
    }

    public void writeIncrementSP() throws IOException {
        write("@SP");
        write("M=M+1");
    }

    public void writeSimpleTemplate(String command) throws IOException {
        // decrement to point SP at y arg
        writeDecrementSP();
        write("A=M");
        write("D=M"); // D=y
        writeDecrementSP();
        write("A=M"); // after this operation, M[A]=x

        switch (command) {
            case "add":
                write("M=D+M");
                break;
            case "sub":
                write("M=M-D");
                break;
            case "and":
                write("M=D&M");
                break;
            case "or":
                write("M=D|M");
                break;
            case "eq":
                write("M=");
        }
        writeIncrementSP();
    }

    public void writeBranchTemplate(String command) throws IOException {
        // R13 = y
        writeDecrementSP();
        write("A=M");
        write("D=M");
        write("@R13");
        write("M=D");
        // D = x
        writeDecrementSP();
        write("A=M");
        write("D=M");
        // D = x - y
        write("@R13");
        write("D=D-M");
        //R13 = true
        write("M=-1");

        //jump if true, based on command
        write("@NEXT");
        if (command == "eq") write("D;JEQ");
        if (command == "gt") write("D;JGT");
        if (command == "lt") write("D;JLT");

        //R13 = false
        write("@R13");
        write("M=0");
        
        write("(NEXT)");
        // M[SP] = R13
        write("@R13");
        write("D=M");
        write("@SP");
        write("A=M");
        write("M=D");
        writeIncrementSP();
        
    }
}