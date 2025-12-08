export enum TokenType {
    KEYWORD,
    SYMBOL,
    IDENTIFIER,
    INT_CONST,
    STRING_CONST,
    UNRECOGNIZED
}

// Lexical elements
export enum Keyword {
    CLASS = 'class', CONSTRUCTOR = 'constructor', FUNCTION = 'function',
    METHOD = 'method', FIELD = 'field', STATIC = 'static', VAR = 'var',
    INT = 'int', CHAR = 'char', BOOLEAN = 'boolean', VOID = 'void',
    TRUE = 'true', FALSE = 'false', NULL = 'null', THIS = 'this', LET = 'let', DO = 'do',
    IF = 'if', ELSE = 'else', WHILE = 'while', RETURN = 'return'
}

export const JackSymbols = ['{', '}', '(', ')', '[', ']', '.',
    ',', ';', '+', '-', '*', '/', '&',
    ',', '<', '>', '=', '~', '|'];

export type IntegerConstant = number;
export type StringConstant = `"${string}"`;
export type Identifier = string;
export function assertIdentifierValue(value: string): asserts value is Identifier {
    const identifierRegEx = /^[^0-9](.*)$/;
    if (!identifierRegEx.test(value)) {
        throw new Error(`"${value}" is not a valid Jack Identifier.`);
    }
}

// Program structure
export type Class = `class ${ClassName} { ${string} }`;
export type JackType = 'int' | 'char' | 'boolean' | ClassName;

export type ClassName = Identifier;


//Statements
export type Statement = LetStatement | IfStatement | WhileStatement | DoStatement | ReturnStatement;

export type LetStatement = 'let';
export type IfStatement = 'if';
export type WhileStatement = 'while';
export type DoStatement = 'do';
export type ReturnStatement = 'return';

// Expressions
export type Expression = Term | `${Term}${Op}${Term}`;
export type Term = number | `"${string}"` | KeywordConstant | `${KeywordConstant}[expression]`;

export type Op = '+' | '-' | '*' | '/' | '&' | '|' | '<' | '>' | '=';
export type UnaryOp = '-' | '~';
export type KeywordConstant = 'true' | 'false' | 'null' | 'this';