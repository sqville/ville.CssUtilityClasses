/**
 * Mode 3 / Path B Inline Calendar DateChooser Control (`ville.ui.control.DateChooser` — `STRAT-WIDGET-06`).
 *
 * Replaces the 23 KB legacy `qx.ui.control.DateChooser` with a lightweight,
 * `Intl.DateTimeFormat`-powered calendar grid using a single delegated click
 * handler for day cells and zero child `Widget` instances per day cell.
 */
qx.Class.define("ville.ui.control.DateChooser", {
  extend: ville.ui.core.Box,
  include: [ville.ui.form.MForm],
  implement: [
    ville.ui.form.IField,
    ville.ui.form.IDateForm,
    ville.ui.form.IForm
  ],

  /**
   * @param {Date|null} [date] Optional initial selected date.
   */
  construct(date) {
    // @ts-ignore
    super();

    const initial = date instanceof Date ? date : new Date();
    this.__shownYear = initial.getFullYear();
    this.__shownMonth = initial.getMonth();

    this._createChildControl("navigation-bar");
    this._createChildControl("date-pane");

    if (date instanceof Date) {
      this.setValue(date);
    } else {
      this._renderCalendarGrid();
    }
  },

  events: {
    /** Fired when a date cell is activated/selected. */
    execute: "qx.event.type.Event"
  },

  properties: {
    appearance: {
      refine: true,
      init: "datechooser"
    },

    /** Currently selected `Date` value. */
    value: {
      check: "Date",
      nullable: true,
      init: null,
      apply: "_applyValue",
      event: "changeValue"
    },

    /** Currently displayed 4-digit year. */
    shownYear: {
      check: "Integer",
      nullable: true,
      init: null,
      event: "changeShownYear"
    },

    /** Currently displayed zero-based month (0 = January .. 11 = December). */
    shownMonth: {
      check: "Integer",
      nullable: true,
      init: null,
      event: "changeShownMonth"
    }
  },

  members: {
    /** @type {number} @private */
    __shownYear: 2026,

    /** @type {number} @private */
    __shownMonth: 0,

    /**
     * @override
     * @param {string} id
     * @param {*} [hash]
     * @returns {ville.ui.core.Widget|null}
     * @protected
     */
    _createChildControlImpl(id, hash) {
      let control;

      switch (id) {
        case "navigation-bar": {
          control = new ville.ui.layout.HGroup("space-between");
          const prevBtn = this._createChildControl("last-month-button");
          const monthLabel = this._createChildControl("month-year-label");
          const nextBtn = this._createChildControl("next-month-button");
          control.add(prevBtn);
          control.add(monthLabel);
          control.add(nextBtn);
          this._add(control);
          break;
        }

        case "last-month-button":
          control = new ville.ui.form.ActionIcon("CHEVRON_LEFT", "subtle");
          control.setAriaLabel("Previous month");
          control.addListener("execute", () => this.showMonth(this.__shownMonth - 1, this.__shownYear));
          break;

        case "next-month-button":
          control = new ville.ui.form.ActionIcon("CHEVRON_RIGHT", "subtle");
          control.setAriaLabel("Next month");
          control.addListener("execute", () => this.showMonth(this.__shownMonth + 1, this.__shownYear));
          break;

        case "month-year-label":
          control = new ville.ui.basic.Label("");
          break;

        case "date-pane": {
          control = new ville.ui.core.Box("div");
          const paneEl = control.getContentElement();
          paneEl.setStyles({
            display: "grid",
            gridTemplateColumns: "repeat(7, minmax(2rem, 1fr))",
            gap: "2px",
            textAlign: "center"
          });
          paneEl.addListener("click", this._onDatePaneClick, this);
          this._add(control);
          break;
        }
      }

      return control || super._createChildControlImpl(id, hash);
    },

    /**
     * Navigates the calendar view to the specified `month` (0..11) and `year`.
     *
     * @param {number} [month]
     * @param {number} [year]
     */
    showMonth(month, year) {
      const targetDate = new Date(
        year !== undefined ? year : this.__shownYear,
        month !== undefined ? month : this.__shownMonth,
        1
      );
      this.__shownYear = targetDate.getFullYear();
      this.__shownMonth = targetDate.getMonth();
      this.setShownYear(this.__shownYear);
      this.setShownMonth(this.__shownMonth);
      this._renderCalendarGrid();
    },

    /**
     * Renders weekday headers and day buttons inside `date-pane` using native `Intl.DateTimeFormat`.
     *
     * @protected
     */
    _renderCalendarGrid() {
      const monthLabel = this.getChildControl("month-year-label", true);
      const viewDate = new Date(this.__shownYear, this.__shownMonth, 1);

      if (monthLabel) {
        const titleStr = new Intl.DateTimeFormat(this.getLocale(), {
          month: "long",
          year: "numeric"
        }).format(viewDate);
        monthLabel.setValue(titleStr);
      }

      const pane = this.getChildControl("date-pane", true);
      if (!pane) {
        return;
      }

      const firstDayOfWeek = viewDate.getDay();
      const daysInMonth = new Date(
        this.__shownYear,
        this.__shownMonth + 1,
        0
      ).getDate();
      const selected = this.getValue();
      const selY = selected instanceof Date ? selected.getFullYear() : -1;
      const selM = selected instanceof Date ? selected.getMonth() : -1;
      const selD = selected instanceof Date ? selected.getDate() : -1;

      const weekdays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
      const htmlParts = [];

      for (const wd of weekdays) {
        htmlParts.push(
          `<span class="ville-datechooser-weekday" style="font-size:0.75rem;opacity:0.65;padding:4px 0;">${wd}</span>`
        );
      }

      for (let blank = 0; blank < firstDayOfWeek; blank++) {
        htmlParts.push(`<span aria-hidden="true"></span>`);
      }

      for (let d = 1; d <= daysInMonth; d++) {
        const isSelected =
          selY === this.__shownYear &&
          selM === this.__shownMonth &&
          selD === d;
        const selAttr = isSelected
          ? ' data-selected="true" aria-pressed="true" style="font-weight:600;border-radius:6px;padding:4px;cursor:pointer;"'
          : ' aria-pressed="false" style="border-radius:6px;padding:4px;cursor:pointer;"';
        htmlParts.push(
          `<button type="button" class="ville-datechooser-day" data-ville-day="${d}"${selAttr}>${d}</button>`
        );
      }

      pane.getContentElement().setAttribute("html", htmlParts.join(""));
      ville.ui.core.Widget.scheduleFlush();
    },

    /**
     * Delegated click listener on `date-pane` (`[data-ville-day]`).
     *
     * @param {Object} e
     * @protected
     */
    _onDatePaneClick(e) {
      if (!this.isEnabled()) {
        return;
      }
      const nativeEvt = e?.getNativeEvent ? e.getNativeEvent() : e;
      const target = /** @type {HTMLElement|null} */ (nativeEvt?.target);
      if (!target || typeof target.closest !== "function") {
        return;
      }
      const dayBtn = target.closest("[data-ville-day]");
      if (!dayBtn) {
        return;
      }
      const day = Number(dayBtn.getAttribute("data-ville-day"));
      if (day > 0) {
        const picked = new Date(this.__shownYear, this.__shownMonth, day);
        this.setValue(picked);
        this.fireEvent("execute");
      }
    },

    _applyValue(value) {
      if (value instanceof Date && !Number.isNaN(value.getTime())) {
        this.__shownYear = value.getFullYear();
        this.__shownMonth = value.getMonth();
        this.setShownYear(this.__shownYear);
        this.setShownMonth(this.__shownMonth);
      }
      this._renderCalendarGrid();
    }
  }
});
