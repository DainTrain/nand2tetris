import { Keyword, assertIdentifierValue, TokenType } from '../types/grammar.js';
import { JackTokenizer } from './JackTokenizer.js';
import { appendFileSync, mkdirSync, readdirSync, rmSync, writeFileSync, readFileSync } from 'fs';
import { join, extname } from 'path';
import minimist, { ParsedArgs } from 'minimist';
import { CompilationEngine } from './CompilationEngine.js';
console.log('Running Jack Compiler...');
const args: ParsedArgs = minimist(process.argv.slice(2), {
  alias: {
    d: 'debug',
    h: 'help'
  }
});

if (args.help) {
  console.log(`
    Compiles .jack files into .vm files
    
    -d, --debug     Logs debug info
    -h, --help      Prints this usage`);
  process.exit(0);
}


function findJackFiles(dirPath: string, ext: string) {
  const files: string[] = [];

  function traverseDir(currentPath: string) {
    const entries = readdirSync(currentPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(currentPath, entry.name);

      if (entry.isDirectory()) {
        traverseDir(fullPath); // Recursive call for subdirectories
      } else if (entry.isFile() && extname(entry.name) === ext) {
        files.push(fullPath);
      }
    }
  }

  traverseDir(dirPath);
  return files;
}

const curDir = './';
const jackExt = '.jack';
const jackFiles = findJackFiles(curDir, jackExt);

try {
  rmSync('./bin', {
    force: true,
    recursive: true
  });
  mkdirSync('./bin');
} catch (e) {
  console.log('probably already exists');
}

for (const jackFile of jackFiles) {
  const tokenizer = await JackTokenizer.create(jackFile);
  tokenizer.debug = args.debug;

  const xmlTokenFile = `${jackFile.split('.jack')[0]}T.xml`;

  writeFileSync(`bin/${xmlTokenFile}`, '<tokens>\n', 'utf-8');
  while (tokenizer.hasMoreTokens()) {
    tokenizer.advance();
    switch (tokenizer.tokenType()) {
      case TokenType.IDENTIFIER:
        appendFileSync(`bin/${xmlTokenFile}`, '<identifier>', 'utf-8');
        appendFileSync(`bin/${xmlTokenFile}`, ` ${tokenizer.getToken()} `, 'utf-8');
        appendFileSync(`bin/${xmlTokenFile}`, '</identifier>\n', 'utf-8');
        break;
      case TokenType.INT_CONST:
        appendFileSync(`bin/${xmlTokenFile}`, '<integerConstant>', 'utf-8');
        appendFileSync(`bin/${xmlTokenFile}`, ` ${tokenizer.getToken()} `, 'utf-8');
        appendFileSync(`bin/${xmlTokenFile}`, '</integerConstant>\n', 'utf-8');
        break;
      case TokenType.KEYWORD:
        appendFileSync(`bin/${xmlTokenFile}`, '<keyword>', 'utf-8');
        appendFileSync(`bin/${xmlTokenFile}`, ` ${tokenizer.getToken()} `, 'utf-8');
        appendFileSync(`bin/${xmlTokenFile}`, '</keyword>\n', 'utf-8');
        break;
      case TokenType.STRING_CONST:
        appendFileSync(`bin/${xmlTokenFile}`, '<stringConstant>', 'utf-8');
        appendFileSync(`bin/${xmlTokenFile}`, ` ${tokenizer.stringVal()} `, 'utf-8');
        appendFileSync(`bin/${xmlTokenFile}`, '</stringConstant>\n', 'utf-8');
        break;
      case TokenType.SYMBOL:
        appendFileSync(`bin/${xmlTokenFile}`, '<symbol>', 'utf-8');
        let token = tokenizer.getToken();
        let symbol = undefined;
        if (token === '<') symbol = '&lt;';
        if (token === '>') symbol = '&gt;';
        if (token === '"') symbol = '&quot;';
        if (token === '&') symbol = '&amp;';
        symbol = symbol ?? token;
        appendFileSync(`bin/${xmlTokenFile}`, ` ${symbol} `, 'utf-8');
        appendFileSync(`bin/${xmlTokenFile}`, '</symbol>\n', 'utf-8');
        break;
      default:
        tokenizer.log('unrecognized token type');
    }
  }
  appendFileSync(`bin/${xmlTokenFile}`, '</tokens>', 'utf-8');

  const xmlParsedFile = `${jackFile.split('.jack')[0]}.xml`;
  const xmlString = readFileSync(`bin/${xmlTokenFile}`, 'utf8');
  const engine: CompilationEngine = new CompilationEngine(xmlParsedFile, xmlString);
  engine.compileClass();
}