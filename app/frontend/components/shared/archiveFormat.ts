export const formatCount = (value?: number): string =>
  (value ?? 0).toLocaleString("en-US");
