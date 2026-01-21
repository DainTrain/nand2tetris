export type JackSymbol = {
    name: string;
    type: string;
    kind: SymbolKind;
    index?: number;
}

export type SymbolKind = 'static' | 'field' | 'argument' | 'var';

export class SymbolTable {
    private classSymbols: JackSymbol[] = [];
    private subroutineSymbols: JackSymbol[] = [];
    private indexes = {
        'static': 0,
        'field': 0,
        'argument': 0,
        'var': 0
    };

    construtor() {
        this.classSymbols = [];
        this.subroutineSymbols = [];
    }

    startSubroutine(): void {
        this.subroutineSymbols = [];
        this.indexes['argument'] = 0;
        this.indexes['var'] = 0;
    }

    define(symbol: JackSymbol): void {
        if (symbol.kind === 'static' || symbol.kind === 'field') {
            this.classSymbols.push({ ...symbol, index: this.indexes[symbol.kind] });
        } else {
            this.subroutineSymbols.push({ ...symbol, index: this.indexes[symbol.kind] })
        }
        this.indexes[symbol.kind]++;
        console.log(`just defined ${symbol.name} and now index for ${symbol.kind} is ${this.indexes[symbol.kind]}`)
    }

    varCount(kind: SymbolKind): number {
        if (kind === 'static' || kind === 'field') {
            return this.classSymbols.filter(symbol => symbol.kind === kind).length;
        } else {
            return this.subroutineSymbols.filter(symbol => symbol.kind === kind).length;
        }
    }

    kindOf(name: string): SymbolKind | 'none' {
        let foundSymbol = null;
        foundSymbol = this.classSymbols.find(symbol => symbol.name === name);
        if (foundSymbol) return foundSymbol.kind;
        foundSymbol = this.subroutineSymbols.find(symbol => symbol.name === name);
        if (foundSymbol) return foundSymbol.kind;
        return 'none';
    }

    typeOf(name: string): string {
        let foundSymbol = null;
        foundSymbol = this.classSymbols.find(symbol => symbol.name === name);
        if (foundSymbol) return foundSymbol.type;
        foundSymbol = this.subroutineSymbols.find(symbol => symbol.name === name);
        if (foundSymbol) return foundSymbol.type;
        return '';
    }

    indexOf(name: string): number {
        let foundSymbols = [];
        console.log(`looking for ${name} in either one of:`);
        console.log(this.classSymbols);
        console.log(this.subroutineSymbols);
        foundSymbols = this.classSymbols.filter(symbol => symbol.name === name);
        if (foundSymbols.length > 0) return foundSymbols[0].index ?? -1;
        foundSymbols = this.subroutineSymbols.filter(symbol => symbol.name === name);
        if (foundSymbols.length > 0) return foundSymbols[0].index ?? -1;
        return -1;
    }

}