/**
 * This is a qooxdoo mixin, added to ville.ui.application.Standalone
 * Add this.markSsgPage() to the area of the application where the
 * app.page.<your page class> should go.
 * @ignore(URLSearchParams)
 */
qx.Mixin.define("ville.cssuc.include.MSsg",
{ 
  properties: {

    ssgPage: {
      check: "String",
      nullable: true
    }

  },

  members: {

    markSsgPage() {
      // Load page main content based on url param page
      const queryString = window.location.search;

      // 2. Parse the parameters
      const urlParams = new URLSearchParams(queryString);

      // 3. Get specific values
      this.setSsgPage(urlParams.get('page'));
    }
  }
});