package org.example;
import java.io.IOException;

public interface ICodeWriter {
    public void setFileName(String fileName) throws IOException;

    public void writeArithmetic(String command) throws IOException;

    public void writePushPop(CommandType command, String segment, int index) throws IOException;

    public void writeInit() throws IOException;

    public void writeLabel(String label) throws IOException;

    public void writeGoto(String label) throws IOException;

    public void writeIf(String label) throws IOException;

    public void writeCall(String fnName, int numArgs) throws IOException;

    public void writeReturn() throws IOException;

    public void writeFunction(String fnName, int numLocals) throws IOException;
}