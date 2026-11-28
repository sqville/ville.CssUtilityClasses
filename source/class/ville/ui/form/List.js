/**
 * Unified `ville.ui.form.List` alias extending `{ville.ui.list.List}` (`STRAT-WIDGET-08`).
 *
 * Ensures both `new ville.ui.form.List()` and `new ville.ui.list.List()` share
 * the exact same non-virtual `MDataView` + `<template>` cloning engine.
 */
qx.Class.define("ville.ui.form.List", {
  extend: ville.ui.list.List
});
