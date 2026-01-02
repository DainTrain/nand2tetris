import { getNextStoppingIndex } from '../src/tokenizer';
import { expect, test } from 'vitest';

test('getNextStoppingIndex', () => {
    expect(getNextStoppingIndex('main()')).toBe(4);

    expect(getNextStoppingIndex('a;')).toBe(1);

    expect(getNextStoppingIndex('sum, i')).toBe(3);

    expect(getNextStoppingIndex('i+1')).toBe(1);

    expect(getNextStoppingIndex('Output.println();')).toBe(6);

    expect(getNextStoppingIndex('println()')).toBe(7);

    expect(getNextStoppingIndex('numerator/denom')).toBe(9);

    expect(getNextStoppingIndex('class Main {')).toBe(5);

    expect(getNextStoppingIndex('Main {')).toBe(4);

    expect(getNextStoppingIndex('{\n')).toBe(0);

    expect(getNextStoppingIndex('\t\t\t')).toBe(0);

    expect(getNextStoppingIndex('readInt("Enter')).toBe(7);
    expect(getNextStoppingIndex('("Enter')).toBe(0);
    expect(getNextStoppingIndex('"Enter ')).toBe(6);
});