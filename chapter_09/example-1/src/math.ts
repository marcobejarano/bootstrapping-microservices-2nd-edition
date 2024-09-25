export const square = (n: number, multiply: (a: number, b: number) => number) => {
  return multiply(n, n);
};
