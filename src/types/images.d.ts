/**
 * Type declarations for image imports.
 * Allows TypeScript to understand PNG imports as URL strings.
 */

declare module '*.png' {
  const value: string;
  export default value;
}
