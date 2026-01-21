import { join } from 'path';
import { readFile } from 'fs/promises';
import { assertIdentifierValue, Keyword, TokenType } from '../types/grammar.js';
import { JackSymbols } from '../types/grammar.js';

/**
 * Holds the input stream and reads the contents according to the Jack grammar.
 */
export class JackTokenizer {
    private currentToken: string | undefined = undefined;
    public programStream: string | undefined = undefined;
    public debug: boolean = false;

    constructor(programStream: string) {
        this.programStream = programStream;
        return this;
    }

    static async create(jackFileName: string): Promise<JackTokenizer> {
        const data = await readFile(join(process.cwd(), jackFileName), 'utf8');
        return new JackTokenizer(data.replace(/\/\*[\s\S]*?\*\/|\/\/.*\n?/g, ''));
    }

    log(message: string, ...rest: (string | number | undefined)[]) {
        if (this.debug) {
            console.log(message, rest);
        }
    }

    hasMoreTokens() {
        return this.programStream !== undefined && this.programStream !== '';
    }

    getToken() {
        return this.currentToken;
    }

    tokenType(): TokenType | undefined {
        if (!this.currentToken) return undefined;
        // console.log('Keyword values are:', <any>Object.values(Keyword));
        // console.log('determining token type for:', this.currentToken);
        // console.log((<any>Object).values(Keyword).includes(this.currentToken));
        if ((<any>Object).values(Keyword).includes(this.currentToken)) {
            return TokenType.KEYWORD;
        } else if (this.currentToken?.length === 1 && JackSymbols.includes(this.currentToken)) {
            return TokenType.SYMBOL;
        } else if (this.currentToken?.startsWith('"')) {
            return TokenType.STRING_CONST;
        } else if (this.currentToken && /^\d/.test(this.currentToken.charAt(0))) {
            return TokenType.INT_CONST;
        } else {
            try {
                assertIdentifierValue(this.currentToken);
                return TokenType.IDENTIFIER;
            } catch (e) {
                return TokenType.UNRECOGNIZED;
            }
        }
    }

    Symbol(): string {
        if (this.tokenType() === TokenType.SYMBOL) {
            return this.currentToken!;
        } else {
            return '';
        }
    }

    identifier(): string {
        if (this.tokenType() === TokenType.IDENTIFIER) {
            return this.currentToken!;
        } else {
            return '';
        }
    }

    intVal(): number {
        if (this.tokenType() === TokenType.INT_CONST) {
            return Number(this.currentToken);
        } else {
            return NaN;
        }
    }

    stringVal(): string {
        if (this.tokenType() === TokenType.STRING_CONST) {
            return this.currentToken!.slice(1, this.currentToken!.length - 1);
        } else {
            return '';
        }
    }

    advance() {
        while (true) {
            if (this.programStream === undefined || this.programStream === '') {
                this.log('program stream is undefined or empty...');
                this.currentToken = undefined;
                return;
            } else if (this.programStream.startsWith('\n') || this.programStream.startsWith('\t') || this.programStream.startsWith(' ') || this.programStream.startsWith('\r')) {
                this.log('programStream starts with a whitespace char...');
                this.log('making rest of line:', this.programStream.split('\n')[0].slice(1));
                this.programStream = this.programStream.slice(1);
            } else {
                this.log('=== else advancing token ===');
                const idx = getNextStoppingIndex(this.programStream);
                this.log('rest of current line: ', this.programStream.split('\n')[0]);
                this.log('stopping at: ', idx);
                if (idx === undefined || idx === -1) {
                    this.programStream = undefined;
                    return;
                }
                if (idx === 0) {
                    this.currentToken = this.programStream.charAt(0);
                    this.programStream = this.programStream.slice(1);
                    // if (this.programStream.startsWith(' ')) {
                    //     this.programStream = this.programStream.slice(1);
                    // }
                    // if (this.currentToken === '(') {
                    //     console.log('just found open paren');
                    //     console.log('next char is:', this.currentToken.charAt(0));
                    //     console.log('current line is:', this.programStream.split('\n')[0]);
                    // }
                    return;
                } else {
                    this.currentToken = this.programStream.slice(0, idx);

                    //special case to handle string constant
                    if (this.currentToken?.startsWith('"')) {
                        // console.log('found double quote, current token is:', this.currentToken);
                        // console.log('current line is:', this.programStream.split('\n')[0]);
                        // we know index zero is double quote, so look for closing quote starting at index 1
                        const secondQuoteIdx = this.programStream.indexOf('"', 1);
                        // console.log('next quote is at', secondQuoteIdx);
                        this.currentToken = this.programStream.slice(0, secondQuoteIdx + 1);
                        // console.log('new token is:', this.currentToken);
                        this.programStream = this.programStream.slice(secondQuoteIdx + 1);
                        return;
                    }

                    this.programStream = this.programStream.slice(idx);
                }
                return;
            }
        }
    }
}

/**
         * returns the index of the next character
         * might be space, but could also be symbol
         */
export function getNextStoppingIndex(text: string) {
    // const modifiedRegex = new RegExp(/\{\}\(\)\[\]\.\,\;+\-\*\/\&\|\<\>\=\~/);
    const modifiedRegex = new RegExp(/[{}()[\].,\*\/\+\-&|<>=~;]/);
    const whitespaceIndex = getNextWhitespaceIndex(text);
    const match = modifiedRegex.exec(text)?.index;
    if (whitespaceIndex === undefined || whitespaceIndex === -1) {
        return match;
    } else if (match === undefined || match === -1) {
        return whitespaceIndex;
    } else if (whitespaceIndex === undefined && match === undefined) {
        return undefined;
    } else {
        return Math.min(match, whitespaceIndex);
    }
}

export function getNextWhitespaceIndex(text: string) {
    const newlineIdx = text.indexOf('\n');
    const spaceIdx = text.indexOf(' ');
    const tabIdx = text.indexOf('\t');
    if (newlineIdx === -1 && spaceIdx === -1 && tabIdx === -1) {
        return -1;
    } else if (newlineIdx === -1) {
        if (spaceIdx === -1) return tabIdx;
        if (tabIdx === -1) return spaceIdx;
        return Math.min(spaceIdx, tabIdx);
    } else if (spaceIdx === -1) {
        if (newlineIdx === -1) return tabIdx;
        if (tabIdx === -1) return newlineIdx;
        return Math.min(newlineIdx, tabIdx);
    } else if (tabIdx === -1) {
        if (newlineIdx === -1) return spaceIdx;
        if (spaceIdx === -1) return newlineIdx;
        return Math.min(newlineIdx, spaceIdx);
    } else {
        const min1 = Math.min(newlineIdx, spaceIdx);
        return Math.min(min1, tabIdx);
    }
}