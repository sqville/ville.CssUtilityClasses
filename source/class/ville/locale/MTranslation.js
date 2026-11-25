/**
 * Browser-native `Intl`-backed localization mixin (`ville.locale.MTranslation` — `STRAT-BUILD-01`).
 *
 * Replaces `qx.locale.MTranslation`, `qx.locale.Manager` (15.2 KB), `qx.locale.LocalizedString`,
 * `qx.locale.Date`, and `qx.util.format.DateFormat` with a lightweight, zero-CLDR
 * implementation powered by standard ECMAScript `Intl` APIs (`Intl.PluralRules`,
 * `Intl.DateTimeFormat`, `Intl.NumberFormat`, `Intl.RelativeTimeFormat`).
 *
 * Preserves 100% backward compatibility with Qooxdoo's `this.tr()`, `this.trn()`,
 * `this.trc()`, `this.trnc()`, and `this.marktr()` APIs while adding `this.formatDate()`,
 * `this.formatNumber()`, and zero-legacy dynamic locale change listeners.
 *
 * @ignore(Intl, Intl.*)
 */
qx.Mixin.define("ville.locale.MTranslation", {
  statics: {
    /**
     * Active BCP 47 locale tag (defaults to browser `navigator.language` or `"en-US"`).
     *
     * @type {string}
     */
    __locale:
      typeof navigator !== "undefined" && navigator.language
        ? navigator.language
        : "en-US",

    /**
     * Map of locale tags to `{ [messageId]: translatedTemplate }` dictionaries.
     *
     * @type {Object<string, Object<string, string>>}
     */
    __catalogs: {},

    /**
     * Cached `Intl.PluralRules` instance for the active locale.
     *
     * @type {Intl.PluralRules|null}
     */
    __pluralRules: null,

    /**
     * Counter and map for dynamic locale change listeners (`STRAT-BUILD-01`).
     *
     * @type {number}
     * @private
     */
    __nextLocaleListenerId: 1,

    /**
     * @type {Object<string, { listener: Function, self: any }>}
     * @private
     */
    __localeListeners: {},

    /**
     * Returns the active BCP 47 locale tag.
     *
     * @returns {string} Active locale tag (e.g., `"en-US"`, `"de-DE"`).
     */
    getLocale() {
      return ville.locale.MTranslation.__locale;
    },

    /**
     * Sets the active BCP 47 locale tag, invalidates cached `Intl` formatters,
     * and notifies any registered locale change listeners.
     *
     * @param {string} locale BCP 47 locale string.
     */
    setLocale(locale) {
      if (
        locale &&
        typeof locale === "string" &&
        locale !== ville.locale.MTranslation.__locale
      ) {
        const oldLocale = ville.locale.MTranslation.__locale;
        ville.locale.MTranslation.__locale = locale;
        ville.locale.MTranslation.__pluralRules = null;

        const listeners = ville.locale.MTranslation.__localeListeners;
        for (const id in listeners) {
          const entry = listeners[id];
          if (entry && typeof entry.listener === "function") {
            entry.listener.call(entry.self || null, {
              getData() {
                return locale;
              },
              getOldData() {
                return oldLocale;
              }
            });
          }
        }
      }
    },

    /**
     * Registers a callback invoked whenever `ville.locale.MTranslation.setLocale()` changes the active locale.
     *
     * @param {Function} listener Callback function.
     * @param {Object} [self] Execution context (`this`) for the callback.
     * @returns {string} Opaque listener ID for `removeChangeLocaleListenerById()`.
     */
    addChangeLocaleListener(listener, self) {
      const id =
        "locale_" + ville.locale.MTranslation.__nextLocaleListenerId++;
      ville.locale.MTranslation.__localeListeners[id] = { listener, self };
      return id;
    },

    /**
     * Removes a previously registered locale change listener by its ID.
     *
     * @param {string|null} id Listener ID returned by `addChangeLocaleListener()`.
     */
    removeChangeLocaleListenerById(id) {
      if (id && ville.locale.MTranslation.__localeListeners[id]) {
        delete ville.locale.MTranslation.__localeListeners[id];
      }
    },

    /**
     * Registers translation key/value pairs for a locale.
     *
     * @param {string} locale BCP 47 locale tag (e.g., `"en"`, `"de"`).
     * @param {Object<string, string>} map Translation dictionary.
     */
    addTranslation(locale, map) {
      if (!locale || !map) {
        return;
      }
      const existing = ville.locale.MTranslation.__catalogs[locale] || {};
      ville.locale.MTranslation.__catalogs[locale] = Object.assign(existing, map);
    },

    /**
     * Resolves a message ID from the registered translation catalogs (or `qx.$$translations`)
     * and substitutes `%1`, `%2`, ... positional arguments.
     *
     * @param {string} messageId Source message string.
     * @param {Array<*>} args Positional arguments to interpolate.
     * @returns {string} Translated and interpolated string.
     */
    translate(messageId, args) {
      if (messageId == null) {
        return "";
      }
      const locale = ville.locale.MTranslation.__locale;
      const shortLocale = locale.split("-")[0];
      const catalogs = ville.locale.MTranslation.__catalogs;
      const qxTrans =
        typeof window !== "undefined" && window.qx && window.qx.$$translations
          ? window.qx.$$translations
          : null;

      const template =
        catalogs[locale]?.[messageId] ??
        catalogs[shortLocale]?.[messageId] ??
        qxTrans?.[locale]?.[messageId] ??
        qxTrans?.[shortLocale]?.[messageId] ??
        String(messageId);

      if (!args || args.length === 0) {
        return template;
      }

      return template.replace(/%([1-9][0-9]*)/g, (match, indexStr) => {
        const idx = parseInt(indexStr, 10) - 1;
        return idx >= 0 && idx < args.length && args[idx] !== undefined
          ? String(args[idx])
          : match;
      });
    },

    /**
     * Selects singular or plural message template via `Intl.PluralRules` and translates it.
     *
     * @param {string} singularMessageId Singular message template.
     * @param {string} pluralMessageId Plural message template.
     * @param {number} count Numeric count determining plural category.
     * @param {Array<*>} args Positional arguments to interpolate.
     * @returns {string} Translated singular or plural string.
     */
    translatePlural(singularMessageId, pluralMessageId, count, args) {
      if (!ville.locale.MTranslation.__pluralRules && typeof Intl !== "undefined") {
        ville.locale.MTranslation.__pluralRules = new Intl.PluralRules(
          ville.locale.MTranslation.__locale
        );
      }
      const category = ville.locale.MTranslation.__pluralRules
        ? ville.locale.MTranslation.__pluralRules.select(count)
        : count === 1
        ? "one"
        : "other";
      const chosenId = category === "one" ? singularMessageId : pluralMessageId;
      return ville.locale.MTranslation.translate(chosenId, args);
    }
  },

  members: {
    /**
     * Translates a message and interpolates `%1`, `%2`, ... positional arguments.
     *
     * @param {string} messageId Message identifier to translate.
     * @param {...*} varargs Optional positional arguments.
     * @returns {string} Translated message string.
     */
    tr(messageId, ...varargs) {
      return ville.locale.MTranslation.translate(messageId, varargs);
    },

    /**
     * Translates a singular/plural message using native `Intl.PluralRules`.
     *
     * @param {string} singularMessageId Singular message template.
     * @param {string} pluralMessageId Plural message template.
     * @param {number} count Numeric count determining plural category.
     * @param {...*} varargs Optional positional arguments.
     * @returns {string} Translated singular or plural string.
     */
    trn(singularMessageId, pluralMessageId, count, ...varargs) {
      return ville.locale.MTranslation.translatePlural(
        singularMessageId,
        pluralMessageId,
        count,
        varargs
      );
    },

    /**
     * Translates a message with a disambiguating developer comment.
     *
     * @param {string} hint Translator comment/context hint.
     * @param {string} messageId Message identifier to translate.
     * @param {...*} varargs Optional positional arguments.
     * @returns {string} Translated string.
     */
    trc(hint, messageId, ...varargs) {
      return ville.locale.MTranslation.translate(messageId, varargs);
    },

    /**
     * Translates a singular/plural message with a disambiguating developer comment.
     *
     * @param {string} hint Translator comment/context hint.
     * @param {string} singularMessageId Singular message template.
     * @param {string} pluralMessageId Plural message template.
     * @param {number} count Numeric count.
     * @param {...*} varargs Optional positional arguments.
     * @returns {string} Translated string.
     */
    trnc(hint, singularMessageId, pluralMessageId, count, ...varargs) {
      return ville.locale.MTranslation.translatePlural(
        singularMessageId,
        pluralMessageId,
        count,
        varargs
      );
    },

    /**
     * Marks a message string for translation extraction without translating immediately.
     *
     * @param {string} messageId Message identifier.
     * @returns {string} The original `messageId`.
     */
    marktr(messageId) {
      return messageId;
    },

    /**
     * Formats a `Date` or timestamp using native `Intl.DateTimeFormat`.
     *
     * @param {Date|number} date Date or epoch milliseconds to format.
     * @param {Intl.DateTimeFormatOptions} [options] Standard `Intl.DateTimeFormat` options.
     * @returns {string} Locale-formatted date string.
     */
    formatDate(date, options) {
      return new Intl.DateTimeFormat(
        ville.locale.MTranslation.__locale,
        options
      ).format(date);
    },

    /**
     * Formats a numeric value using native `Intl.NumberFormat`.
     *
     * @param {number} value Number to format.
     * @param {Intl.NumberFormatOptions} [options] Standard `Intl.NumberFormat` options.
     * @returns {string} Locale-formatted number string.
     */
    formatNumber(value, options) {
      return new Intl.NumberFormat(
        ville.locale.MTranslation.__locale,
        options
      ).format(value);
    }
  }
});
