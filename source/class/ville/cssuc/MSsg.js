/**
 * 
 * @ignore(URLSearchParams)
 * 
 */
qx.Mixin.define("ville.cssuc.MSsg",
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