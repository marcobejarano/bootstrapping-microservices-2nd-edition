import { describe, it, expect } from "bun:test";
import { square } from "./math";

describe('Square function', () => {
  it('can square two', () => {
    const mockMultiply = (n1: number, n2: number) => {
      expect(n1).toBe(2);
      expect(n2).toBe(2);
      return 4;
    };

    const result = square(2, mockMultiply);
    expect(result).toBe(4);
  });
});
