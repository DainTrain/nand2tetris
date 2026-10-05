import { appendFileSync } from 'fs';
// import { type Token, TokenStream } from './TokenStream.js';
// import { Op } from '../types/grammar.js';
// import { JackSymbol, SymbolKind, SymbolTable } from './SymbolTable.js';

export class VMWriter {
    // private tokens: TokenStream;
    private vmFileName: string | undefined = undefined;
    // private indentLevel: number = 0;
    public debug: boolean = true;
    // private symbolTable: SymbolTable;

    constructor(vmFileName: string) {
        this.vmFileName = vmFileName;
        // this.tokens = new TokenStream(xmlString);
        // this.symbolTable = new SymbolTable();
    }

    log(message: string, ...rest: (string | number | undefined)[]) {
        if (this.debug) {
            console.log(message, rest);
        }
    }

    write(message: string) {
        appendFileSync(`bin/${this.vmFileName}.vm`, `${message}\n`, 'utf-8');
    }

    writePush(segment: string, index: number) {
        this.write(`push ${segment} ${index}`);
    }

    writePop(segment: string, index: number) {
        this.write(`pop ${segment} ${index}`);
    }

    writeArithmetic(command: string) {
        if (command == '+') {
            this.write('add');
        }
        if (command == '*') {
            this.write('call Math.mult 2');
        }
    }

    writeCall(name: string, nArgs: number) {
        this.write(`call ${name} ${nArgs}`);
    }

    writeFunction(name: string, nLocals: number) {
        this.write(`function ${this.vmFileName}.${name} ${nLocals}`);
    }

    writeReturn() {
        this.write('push 0');
        this.write('return');
    }
}