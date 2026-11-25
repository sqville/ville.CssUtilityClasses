/**
 * Path B Composable Sync/Async Schema Validator (`STRAT-FORM-01`).
 *
 * Bridges native HTML5 Constraint Validation (`checkValidity()`,
 * `setCustomValidity()`, `:user-invalid`) with composable, Zod-inspired
 * synchronous and asynchronous field and form schemas (`Validator.string()`,
 * `Validator.number()`, `Validator.boolean()`, `Validator.object()`, or
 * external Standard Schema / Zod `.safeParseAsync()` schemas).
 */
qx.Class.define("ville.ui.form.Validator", {
  extend: qx.core.Object,

  construct(rules = []) {
    super();
    this.__rules = Array.isArray(rules) ? rules.slice() : [];
  },

  statics: {
    /**
     * Creates a string field validator chain.
     *
     * @return {ville.ui.form.Validator}
     */
    string() {
      return new ville.ui.form.Validator([
        (val) =>
          val == null || typeof val === "string"
            ? null
            : "Expected a text string"
      ]);
    },

    /**
     * Creates a numeric field validator chain.
     *
     * @return {ville.ui.form.Validator}
     */
    number() {
      return new ville.ui.form.Validator([
        (val) => {
          if (val == null || val === "") return null;
          const n = Number(val);
          return Number.isNaN(n) ? "Expected a valid number" : null;
        }
      ]);
    },

    /**
     * Creates a boolean field validator chain.
     *
     * @return {ville.ui.form.Validator}
     */
    boolean() {
      return new ville.ui.form.Validator([
        (val) =>
          typeof val === "boolean" ? null : "Expected a boolean selection"
      ]);
    },

    /**
     * Wraps a map of `{ fieldName: validatorOrFn }` into a form-level schema.
     *
     * @param {Object<string, ville.ui.form.Validator|Function|Object>} shape
     * @return {{validate: Function, validateAsync: Function}}
     */
    object(shape = {}) {
      return {
        shape,
        validate(data) {
          const errors = {};
          let valid = true;
          for (const [key, rule] of Object.entries(shape)) {
            const msg = ville.ui.form.Validator.runSync(rule, data?.[key], data);
            if (msg) {
              errors[key] = msg;
              valid = false;
            }
          }
          return { valid, errors };
        },
        async validateAsync(data) {
          const errors = {};
          let valid = true;
          for (const [key, rule] of Object.entries(shape)) {
            const msg = await ville.ui.form.Validator.runAsync(
              rule,
              data?.[key],
              data
            );
            if (msg) {
              errors[key] = msg;
              valid = false;
            }
          }
          return { valid, errors };
        }
      };
    },

    /**
     * Evaluates a validator instance, Standard Schema / Zod schema, or function
     * synchronously and returns `null` when valid or an error string when invalid.
     */
    runSync(validator, value, context) {
      if (!validator) return null;
      if (validator instanceof ville.ui.form.Validator) {
        return validator.validate(value, context);
      }
      if (typeof validator.safeParse === "function") {
        const res = validator.safeParse(value);
        if (res && !res.success) {
          return res.error?.issues?.[0]?.message || "Invalid value";
        }
        return null;
      }
      if (typeof validator === "function") {
        const out = validator.call(context || null, value);
        if (out === false) return "Invalid value";
        if (typeof out === "string" && out.length > 0) return out;
      }
      return null;
    },

    /**
     * Evaluates a validator instance, Standard Schema / Zod schema, or async
     * function and returns `null` when valid or an error string when invalid.
     */
    async runAsync(validator, value, context) {
      if (!validator) return null;
      if (validator instanceof ville.ui.form.Validator) {
        return await validator.validateAsync(value, context);
      }
      if (typeof validator.safeParseAsync === "function") {
        const res = await validator.safeParseAsync(value);
        if (res && !res.success) {
          return res.error?.issues?.[0]?.message || "Invalid value";
        }
        return null;
      }
      if (typeof validator === "function") {
        const out = await validator.call(context || null, value);
        if (out === false) return "Invalid value";
        if (typeof out === "string" && out.length > 0) return out;
      }
      return null;
    }
  },

  members: {
    __rules: null,

    required(message = "This field is required") {
      this.__rules.push((val) =>
        val == null || val === "" || val === false ? message : null
      );
      return this;
    },

    min(minLenOrVal, message) {
      this.__rules.push((val) => {
        if (val == null || val === "") return null;
        if (typeof val === "string") {
          return val.length < minLenOrVal
            ? message || `Must be at least ${minLenOrVal} characters`
            : null;
        }
        return Number(val) < minLenOrVal
          ? message || `Must be at least ${minLenOrVal}`
          : null;
      });
      return this;
    },

    max(maxLenOrVal, message) {
      this.__rules.push((val) => {
        if (val == null || val === "") return null;
        if (typeof val === "string") {
          return val.length > maxLenOrVal
            ? message || `Must be at most ${maxLenOrVal} characters`
            : null;
        }
        return Number(val) > maxLenOrVal
          ? message || `Must be at most ${maxLenOrVal}`
          : null;
      });
      return this;
    },

    email(message = "Please enter a valid email address") {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      this.__rules.push((val) =>
        val == null || val === "" || re.test(String(val)) ? null : message
      );
      return this;
    },

    pattern(regex, message = "Format is invalid") {
      this.__rules.push((val) =>
        val == null || val === "" || regex.test(String(val)) ? null : message
      );
      return this;
    },

    refine(predicateFn, message = "Invalid value") {
      this.__rules.push(async (val, ctx) => {
        const ok = await predicateFn(val, ctx);
        if (ok === true || ok == null) return null;
        return typeof ok === "string" ? ok : message;
      });
      return this;
    },

    validate(value, context) {
      for (const rule of this.__rules) {
        const res = rule(value, context);
        if (typeof res === "string" && res.length > 0) {
          return res;
        }
      }
      return null;
    },

    async validateAsync(value, context) {
      for (const rule of this.__rules) {
        const res = await rule(value, context);
        if (typeof res === "string" && res.length > 0) {
          return res;
        }
      }
      return null;
    }
  }
});
