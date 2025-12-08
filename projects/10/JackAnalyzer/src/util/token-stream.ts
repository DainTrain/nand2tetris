export type Token = {
    tag: string;
    value: string
}

export class TokenStream {
    private tokens: Token[];
    private position = 0;

    constructor(xmlString: string) {
        const inner = xmlString
            .trim()
            .replace(/^<tokens>\s*/, "")
            .replace(/\s*<\/tokens>$/, "")
            .trim();

        this.tokens = inner
            .split(/\r?\n/)
            .map(line => line.trim())
            .filter(Boolean)
            .map(line => {
                const match = line.match(/^<(\w+)>\s*(.*?)\s*<\/\1>$/);
                if (!match) throw new Error(`Invalid token format: ${line}`);
                return { tag: match[1], value: match[2] };
            })
    }

    peek(): Token | null {
        return this.position < this.tokens.length ? this.tokens[this.position] : null;
    }

    advance(): Token {
        if (this.position >= this.tokens.length) {
            throw new Error('unexpected end of token stream');
        }
        return this.tokens[this.position++];
    }

    expect(expectedTag: string, expectedValue?: string): Token {
        const token = this.advance();
        if (token.tag !== expectedTag || (expectedValue && token.value !== expectedValue)) {
            throw new Error(`Expected <${expectedTag}> ${expectedValue ?? ""}, got <${token.tag}> ${token.value}`);
        }
        return token;
    }

    hasMoreTokens(): boolean {
        return this.position < this.tokens.length;
    }
}