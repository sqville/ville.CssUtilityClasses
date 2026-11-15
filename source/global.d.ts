// the reference directive enables tooling to discover the generated type definitions
/// <reference path="../types/qooxdoo.d.ts" />

// add custom global declarations here
declare namespace JSX {
  type Element = qx.html.Element;
  interface IntrinsicElements {
    [elemName: string]: Record<string, any>;
  }
}