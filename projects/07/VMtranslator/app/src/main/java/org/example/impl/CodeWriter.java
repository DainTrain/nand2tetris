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
    int jumpFlag = 0;
    int returnCounter = 1;
    private Map<String,String> segmentToSymbolMap = new HashMap<String, String>(){{
        put("local", "LCL"); put("argument", "ARG"); put("this", "THIS"); put("that", "THAT");}};
    private Map<String,String> registerMap = new HashMap<String, String>(){{
        put("R_LCL", "1"); put("R_FRAME", "13"); put("R_RET", "14"); put("R_COPY", "15");
    }};
    public CodeWriter() {

    }

    public void setFileName(String fileName) throws IOException {
        FileWriter fstream = new FileWriter(fileName + ".asm");
        bWriter = new BufferedWriter(fstream);
        this.fileName = fileName;
    }

    private void write(String asmCommand) throws IOException {
        write(asmCommand, true);
    }

    private void write(String asmCommand, boolean appendNewline) throws IOException {
        bWriter.write(asmCommand);
        if (appendNewline) {
            bWriter.write("\n");
        }
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
       if (command.equals("neg")) {
        writeUnaryArithmeticTemplate("M=-M");
       } else if (command.equals("not")) {
        writeUnaryArithmeticTemplate("M=!M");
       } else if (command.equals("add")) {
        writeSimpleArithmeticTemplate("M=M+D");
       } else if (command.equals("sub")) {
        writeSimpleArithmeticTemplate("M=M-D");
       } else if (command.equals("and")) {
        writeSimpleArithmeticTemplate("M=M&D");
       } else if (command.equals("or")) {
        writeSimpleArithmeticTemplate("M=M|D");
       } else if (command.equals("eq")) {
        writeBranchArithmeticTemplate("D;JEQ");
       } else if (command.equals("gt")) {
        writeBranchArithmeticTemplate("D;JGT");
       } else if (command.equals("lt")) {
        writeBranchArithmeticTemplate("D;JLT");
       } else {
        write("// unrecognized command:" + command);
       }
    }

    public void writeUnaryArithmeticTemplate(String asmOp) throws IOException {
        write("@SP");
        write("A=M-1");
        write(asmOp);
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
                    write("@SP");
                    write("AM=M-1");
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
        // calculate indexed addr into R13
        write("@" + index);
        write("D=A");
        write("@" + segmentToSymbolMap.get(segment));
        write("D=D+M");
        write("@R13");
        write("M=D");

        write("@SP");
        write("AM=M-1");
        write("D=M");

        // retrieve target addr and write D to it
        write("@R13");
        write("A=M");
        write("M=D");
    }

    public void writeInit() throws IOException {
        write("@256");
        write("D=A");
        write("@SP");
        write("M=D");
        // call Sys.init 0
        writeCall("Sys.init", 0);
    }

    public void writeLabel(String label) throws IOException {
        write("(" + this.fileName + "." + label + ")");
    }

    public void writeGoto(String label) throws IOException {
        write("@" + this.fileName + "." + label);
        write("0;JMP");
    }

    public void writeIf(String label) throws IOException {
        writeDecrementSP();
        write("@SP");
        write("A=M");
        write("D=M");
        write("@" + this.fileName + "." + label);
        write("D;JNE");
    }

    public void writeCall(String fnName, int numArgs) throws IOException {
        // push return-address
        write("@return-address" + returnCounter);
        write("D=A");
        write("@SP");
        write("A=M");
        write("M=D");
        writeIncrementSP();

        //push LCL
        write("@LCL");
        write("D=M");
        write("@SP");
        write("A=M");
        write("M=D");
        writeIncrementSP();

        // push ARG
        write("@ARG");
        write("D=M");
        write("@SP");
        write("A=M");
        write("M=D");
        writeIncrementSP();

        // push THIS
        write("@THIS");
        write("D=M");
        write("@SP");
        write("A=M");
        write("M=D");
        writeIncrementSP();

        // push THAT
        write("@THAT");
        write("D=M");
        write("@SP");
        write("A=M");
        write("M=D");
        writeIncrementSP();

        // ARG = SP-n-5
        write("@SP");
        write("D=M");
        write("@5");
        write("D=D-A");
        write("@" + numArgs);
        write("D=D-A");
        write("@ARG");
        write("M=D");

        //LCL = SP
        write("@SP");
        write("D=M");
        write("@LCL");
        write("M=D");

        // goto fnName
        write("@" + fnName);
        write("0;JMP");

        // last thing is to write return-address label
        write("(return-address" + returnCounter++ + ")");
    }

    public void writeReturn() throws IOException {
        regToReg(registerMap.get("R_FRAME"), registerMap.get("R_LCL"));
        // write("@LCL");
        // write("D=M");
        // write("@R7"); //Frame=R7
        // write("M=D"); //Frame=LCL

        // RET = *(FRAME - 5)
        write("@5");
        write("A=D-A");
        write("D=M");
        compToReg(registerMap.get("R_RET"), "D");
        // write("@R14");
        // write("M=D");

        write("@SP");
        write("M=M-1");
        write("@ARG");
        write("AD=M");

        // writeIndexedPop("ARG", 0);

        // SP = ARG+1
        write("@ARG");
        write("D=M");
        write("@SP");
        write("M=D+1");

        writeFrameRestore("THAT", 1);
        writeFrameRestore("THIS", 2);
        writeFrameRestore("ARG", 3);
        writeFrameRestore("LCL", 4);

        write("@R14");
        write("A=M");
        write("0;JMP");
    }

    public void writeFrameRestore(String segment, int offset) throws IOException {
        write("@R7");
        write("D=M");
        write("@" + offset);
        write("A=D-A");
        write("D=M");
        write("@" + segment);
        write("M=D");
    }

    public void writeFunction(String fnName, int numLocals) throws IOException {
        write("(" + fnName + ")");
        for (int i=0; i < numLocals; i++) {
            write("@0");
            write("D=A");
            write("@SP");
            write("A=M");
            write("M=D");
            writeIncrementSP();
        }
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

    public void writeSimpleArithmeticTemplate(String asmOp) throws IOException {
        write("@SP");
        write("AM=M-1"); //A=M-1 is to addr the y argument, M=M-1 is to decrement stack pointer
        write("D=M"); //D=y
        write("@SP");
        write("A=M-1");
        write(asmOp);
    }

    public void writeBranchArithmeticTemplate(String asmOp) throws IOException {
        write("@SP");
        write("AM=M-1");
        write("D-M");
        write("@SP");
        write("A=M-1");
        write("D=M-D");
        write("@R13");
        write("M=-1");
        write("@NEXT" + jumpFlag);
        write(asmOp);
        write("@R13");
        write("M=0");
        write("(NEXT" + jumpFlag++ + ")");
        write("@R13");
        write("D=M");
        write("@SP");
        write("A=M-1");
        write("M=D");
    }

    //https://github.com/havivha/Nand2Tetris/blob/master/08/VMtranslator/CodeWriter.py#L75
    public void regToDest(String dest, String reg) throws IOException {
        write("@R" + registerMap.get(reg));
        write(dest + "=M");
    }

    public void compToReg(String reg, String comp) throws IOException {
        write("@R" + registerMap.get(reg));
        write("M=" + comp);
    }

    public void regToReg(String dest, String src) throws IOException {
        regToDest("D", src);
        compToReg(dest, "D");
    }
}