import { readFile } from 'fs/promises';
import { join, parse } from 'path';
import { appendFileSync } from 'fs';
import { type Token, TokenStream } from './util/token-stream.js';

export class CompilationEngine {
    private tokens: TokenStream;
    private xmlFileName: string | undefined = undefined;
    private indentLevel: number = 0;
    public debug: boolean = false;

    constructor(xmlFileName: string, xmlString: string) {
        this.xmlFileName = xmlFileName;
        this.tokens = new TokenStream(xmlString);
    }

    log(message: string, ...rest: (string | number | undefined)[]) {
        if (this.debug) {
            console.log(message, rest);
        }
    }

    write(message: string) {
        appendFileSync(`bin/${this.xmlFileName}`, `${' '.repeat(this.indentLevel * 2)}${message}\n`, 'utf-8');
    }

    /**
     * Reads a token, validating it matches the expected tag and value. If valid, writes the tag and symbol.
     * @param expectedTag 
     * @param expectedValue 
     * @returns 0 if successful validate and write, -1 otherwise
     */
    private expectAndWrite(expectedTag: string, expectedValue?: string): void {
        let parsedToken: Token = this.tokens.expect(expectedTag, expectedValue);
        this.write(`<${parsedToken.tag}> ${parsedToken.value} </${parsedToken.tag}>`);
    }

    compileClass(): void {
        this.write('<class>');
        this.indentLevel++;

        this.expectAndWrite('keyword', 'class');
        this.expectAndWrite('identifier', 'Main');
        this.expectAndWrite('symbol', '{');

        let peekedToken: Token | null = this.tokens.peek();
        let hasClassVarDec, nextStaticOrField = (peekedToken?.tag === 'keyword' && (peekedToken?.value === 'static' || peekedToken?.value === 'field'));
        if (hasClassVarDec) {
            this.write('<classVarDec>');
            this.indentLevel++;
        }
        while (nextStaticOrField) {
            this.compileClassVarDec();
            peekedToken = this.tokens.peek();
            nextStaticOrField = (peekedToken?.tag === 'keyword' && (peekedToken?.value === 'static' || peekedToken?.value === 'field'));
        }
        if (hasClassVarDec) {
            this.indentLevel--;
            this.write('</classVarDec>');
        }

        while (peekedToken?.tag === 'keyword' && (peekedToken?.value === 'constructor' || peekedToken?.value === 'function' || peekedToken?.value === 'method')) {
            this.write('<subroutineDec>');
            this.indentLevel++;
            this.compileSubroutine();
            this.indentLevel--;
            this.write('</subroutineDec>');
            peekedToken = this.tokens.peek();
        }

        this.expectAndWrite('symbol', '}');
        this.indentLevel--;
        this.write('</class>');
    }

    compileClassVarDec(): void {
        let varScopeToken: Token = this.tokens.advance();
        this.write(`<keyword> ${varScopeToken.value} </keyword>`);
        varScopeToken = this.tokens.advance();
        this.write(`<keyword> ${varScopeToken.value} </keyword>`);
        this.expectAndWrite('keyword');
        this.expectAndWrite('symbol', ';');
    }

    compileSubroutine(): void {
        let subroutineTokenHead = this.tokens.advance();
        this.write(`<keyword> ${subroutineTokenHead.value} </keyword>`); // e.g. function
        subroutineTokenHead = this.tokens.advance();
        this.write(`<keyword> ${subroutineTokenHead.value} </keyword>`); // e.g. void
        subroutineTokenHead = this.tokens.advance();
        this.write(`<identifier> ${subroutineTokenHead.value} </identifier>`); //e.g. main
        this.expectAndWrite('symbol', '(');

        this.compileParameterList();

        this.expectAndWrite('symbol', ')');

        this.write('<subroutineBody>');
        this.indentLevel++;

        this.expectAndWrite('symbol', '{');
        this.compileVarDec();
        this.compileStatements();
        this.expectAndWrite('symbol', '}');

        this.indentLevel--;
        this.write('</subroutineBody>');
    }

    compileParameterList(): void {
        this.write('<parameterList>');
        this.indentLevel++;

        let paramListToken = this.tokens.peek();
        if (paramListToken?.value !== ')') {
            this.expectAndWrite('keyword');
            this.expectAndWrite('identifier');
            paramListToken = this.tokens.peek();
        }
        while (paramListToken?.value !== ')') {
            paramListToken = this.tokens.advance();
            this.expectAndWrite('symbol', ',');
            this.expectAndWrite('keyword');
            this.expectAndWrite('identifier');
            paramListToken = this.tokens.peek();
        }

        this.indentLevel--;
        this.write('</parameterList>');
    }

    compileVarDec(): void {
        while (this.tokens.peek()?.value === 'var') {
            this.write('<varDec>');
            this.indentLevel++;

            this.expectAndWrite('keyword', 'var');
            const typeToken = this.tokens.peek()?.value;
            if (['int', 'char', 'boolean'].includes(typeToken!)) {
                this.expectAndWrite('keyword');
            } else {
                this.expectAndWrite('identifier');
            }
            this.expectAndWrite('identifier');
            while (this.tokens.peek()?.tag === 'symbol' && this.tokens.peek()?.value === ',') {
                this.expectAndWrite('symbol', ',');
                this.expectAndWrite('identifier');
            }
            this.expectAndWrite('symbol', ';');

            this.indentLevel--;
            this.write('</varDec>');
        }
    }

    compileStatements(): void {
        this.write('<statements>');
        this.indentLevel++;
        let nextStatementToken = this.tokens.peek();
        if (nextStatementToken === null) return;
        while (nextStatementToken !== null && ['let', 'if', 'while', 'do', 'return'].includes(nextStatementToken.value)) {
            switch (nextStatementToken.value) {
                case 'let':
                    this.compileLet();
                    break;
                case 'if':
                    this.compileIf();
                    break;
                case 'while':
                    this.compileWhile();
                    break;
                case 'do':
                    this.compileDo();
                    break;
                case 'return':
                    this.compileReturn();
                    break;
                default:
                    break;
            }
            nextStatementToken = this.tokens.peek();
        }
        this.indentLevel--;
        this.write('</statements');
    }

    compileDo(): void {
        this.write('<doStatement>');
        this.indentLevel++;

        this.expectAndWrite('keyword', 'do');
        this.expectAndWrite('identifier');
        if (this.tokens.peek()?.tag === 'symbol' && this.tokens.peek()?.value === '.') {
            this.expectAndWrite('symbol', '.');
            this.expectAndWrite('identifier');
        }
        this.expectAndWrite('symbol', '(');
        this.compileExpressionList();
        this.expectAndWrite('symbol', ')');

        this.expectAndWrite('symbol', ';');

        this.indentLevel--;
        this.write('</doStatement>');
    }

    compileLet(): void {
        this.write('<letStatement>');
        this.indentLevel++;

        this.expectAndWrite('keyword', 'let');
        this.expectAndWrite('identifier');
        if (this.tokens.peek()?.value === '[') {
            this.expectAndWrite('symbol', '[');
            this.compileExpression();
            this.expectAndWrite(']');
        }
        this.expectAndWrite('symbol', '=');
        this.compileExpression();
        this.expectAndWrite('symbol', ';');

        this.indentLevel--;
        this.write('</letStatement>');
    }

    compileWhile(): void {
        this.write('<whileStatement>');
        this.indentLevel++;

        this.expectAndWrite('keyword', 'while');
        this.expectAndWrite('symbol', '(');

        this.compileExpression();

        this.expectAndWrite('symbol', ')');
        this.expectAndWrite('symbol', '{');

        this.compileStatements();

        this.expectAndWrite('symbol', '}');

        this.indentLevel--;
        this.write('</whileStatement>');
    }

    compileReturn(): void {
        this.write('<returnStatement>');
        this.indentLevel++;

        this.expectAndWrite('keyword', 'return');
        if (this.tokens.peek()?.value !== ';') {
            this.compileExpression();
        }
        this.expectAndWrite('symbol', ';');

        this.indentLevel--;
        this.write('</returnStatement>');
    }

    compileIf(): void {
        this.write('<ifStatement>');
        this.indentLevel++;

        this.expectAndWrite('keyword', 'if');
        this.expectAndWrite('symbol', '(');

        this.compileExpression();

        this.expectAndWrite('symbol', ')');
        this.expectAndWrite('symbol', '{');

        this.compileStatements();

        this.expectAndWrite('}');
        let elseToken = this.tokens.peek();
        if (elseToken?.tag === 'keyword' && elseToken?.value === 'else') {
            this.expectAndWrite('keyword', 'else');
            this.expectAndWrite('symbol', '{');

            this.compileStatements();

            this.expectAndWrite('}');
        }

        this.indentLevel--;
        this.write('</ifStatement>');
    }

    compileExpression(): void {
        this.write('<expression>');
        this.indentLevel++;

        this.compileTerm();

        let possibleOp = this.tokens.peek()?.value;
        while (possibleOp && ['+', '-', '*', '/', '&', '|', '<', '>', '='].includes(possibleOp)) {
            this.expectAndWrite('symbol');
            this.compileTerm();
            possibleOp = this.tokens.peek()?.value;
        }

        this.indentLevel--;
        this.write('</expression>');
    }

    compileTerm(): void {
        this.write('<term>');
        this.indentLevel++;

        let termToken = this.tokens.peek();
        if (termToken === null) {
            throw new Error('expected term token but couldnt find one');
        } else if (typeof termToken.value === 'number') {
            this.write(`<integerConstant> ${termToken.value} </integerConstant>`);
        } else if (termToken.value.startsWith('"')) {
            this.write(`<stringConstant> ${termToken.value} </stringConstant>`);
        } else if (['true', 'false', 'null', 'this'].includes(termToken.value)) {
            this.write(`<keyword> ${termToken.value} </keyword>`);
        } else if (termToken.value === '-' || termToken.value === '~') {
            this.write(`<symbol> ${termToken.value} </symbol`);
            this.compileTerm();
        } else if (termToken.value.startsWith('(')) {
            this.expectAndWrite('symbol', '(');
            this.compileExpression();
            this.expectAndWrite('symbol', ')');
        } else if (termToken.value.indexOf('[') !== -1) {
            this.expectAndWrite('identifier');
            this.expectAndWrite('symbol', '[');
            this.compileExpression();
            this.expectAndWrite('symbol', ']');
        } else {
            this.expectAndWrite('identifier');
        }

        this.indentLevel--;
        this.write('</term>');
    }

    compileExpressionList(): void {
        this.write('<expressionList>');
        this.indentLevel++;

        this.compileExpression();
        let possibleComma = this.tokens.peek()?.value;
        while (possibleComma === ',') {
            this.expectAndWrite('symbol', ',');
            this.compileExpression();
            possibleComma = this.tokens.peek()?.value;
        }

        this.indentLevel--;
        this.write('</expressionList>');
    }
}