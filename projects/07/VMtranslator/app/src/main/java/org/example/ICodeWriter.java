package org.example;
import java.io.IOException;

public interface ICodeWriter {
    public void setFileName(String fileName) throws IOException;

    public void writeArithmetic(String command) throws IOException;

    public void writePushPop(CommandType command, String segment, int index) throws IOException;
}