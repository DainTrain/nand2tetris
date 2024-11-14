package org.example;

public interface IParser {
    public boolean hasMoreCommands();

    public void advance();

    public CommandType commandType();

    public String symbol();

    public String dest();

    public String comp();

    public String jump();
}
