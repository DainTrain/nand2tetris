package org.example;

public interface IParser {
    public boolean hasMoreCommands();

    public void advance();

    public CommandType commandType();

    public String arg1();

    public int arg2();
}