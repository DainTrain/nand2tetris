import { appendFileSync } from 'fs';

export class VMWriter {
    private vmFileName: string | undefined = undefined;
    public debug: boolean = true;

    constructor(vmFileName: string) {
        this.vmFileName = vmFileName;
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
        switch (command) {
            case '+':
                this.write('add');
                break;
            case '*':
                this.write('call Math.mult 2');
                break;
            default:
                break;

        }
    }

    writeLabel(label: string) {
        this.write(`(${label})`);
    }

    writeGoto(label: string) {
    }

    writeIf(label: string) {

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