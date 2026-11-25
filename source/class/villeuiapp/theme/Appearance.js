/**
 * Application Appearance Theme (`villeuiapp.theme.Appearance` — `STRAT-BUILD-08`, `STRAT-CSS-06`).
 *
 * Extends the active vendor base appearance (`ville.cssuc.theme.mantine.Appearance` by default,
 * or `obsidian` / `shadcn` when switched via `"ville.cssEngine"`).
 *
 * Because `appshell`, `appshell-header`, `appshell-header-inner`, `appshell-logo-text`,
 * and `appshell-main` are now first-class entries inside each vendor's `Appearance.js`
 * (`mantine`, `obsidian`, `shadcn`), `villeuiapp.theme.Appearance` only needs to hold
 * app-specific custom overrides.
 *
 * @require(ville.cssuc.theme.mantine.Appearance)
 * @require(ville.cssuc.theme.obsidian.Appearance)
 * @require(ville.cssuc.theme.shadcn.Appearance)
 */
qx.Theme.define("villeuiapp.theme.Appearance", {
  extend: ville.cssuc.theme.mantine.Appearance,

  appearances: {
    // App-specific custom appearance overrides go here
  }
});
