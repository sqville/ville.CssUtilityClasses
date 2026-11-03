qx.Class.define("carbonapp.Main", {
  extend: ville.ui.container.Stack,

  construct() {
    super();

    this.setCursor(null);
    this.setCssUtilityClass("cds--content");

    // Create two pages - Landing Page and Table Page

    // Landing Page
    var landingPage = new ville.ui.container.Composite();
    landingPage.setCssUtilityClass("landing-page cds--css-grid cds--css-grid--full-width");

    var lpBanner = new ville.ui.container.Composite();
    lpBanner.setCssUtilityClass("landing-page__banner cds--sm:col-span-4 cds--md:col-span-8 cds--lg:col-span-16 cds--css-grid-column");

    var lpbannernav = new ville.ui.container.Composite();
    lpbannernav.getContentElement().setNodeName("nav");
    lpbannernav.getContentElement().setAttribute("aria-label", "Page navigation");
    var navcontentsbox = new ville.ui.container.Composite();
    var navcontent = `<ol class="cds--breadcrumb cds--breadcrumb--no-trailing-slash">
        <li class="cds--breadcrumb-item">
          <a href="/" class="cds--link">Getting started</a>
        </li>
      </ol>`;
    navcontentsbox.getContentElement().useMarkup(navcontent);
    lpbannernav.add(navcontentsbox);
    lpBanner.add(lpbannernav);

    // Landing Page header
    var lpbannerheader = new ville.ui.container.Composite();
    lpbannerheader.getContentElement().setNodeName("h1");
    lpbannerheader.setCssUtilityClass("landing-page__heading");
    lpbannerheader.getContentElement().setAttribute("html", "Design &amp; build with Carbon");
    lpBanner.add(lpbannerheader);

    // Landing Page TabView
    var lpTabView = new carbonapp.TabView();

    // assemble Landing Page
    landingPage.add(lpBanner);
    landingPage.add(lpTabView);

    // Table Page
    var tablePage = new ville.ui.container.Composite();
    tablePage.setCssUtilityClass("repo-page cds--css-grid");

    // Table Page R1
    var tpR1 = new ville.ui.container.Composite();
    tpR1.setCssUtilityClass("repo-page__r1 cds--sm:col-span-4 cds--md:col-span-8 cds--lg:col-span-16 cds--css-grid-column");
    tablePage.add(tpR1);

    // Table container
    var tpContainer = new ville.ui.container.Composite();
    tpContainer.setCssUtilityClass("cds--data-table-container");
    tpR1.add(tpContainer);

    var tptableheader = new qx.ui.embed.Html();
    tptableheader.setCssUtilityClass("cds--data-table-header");
    var tptblheaderhtml = `<h4 class="cds--data-table-header__title" id="tc-:r9:-title">Carbon Table</h4>
      <p class="cds--data-table-header__description" id="tc-:r9:-description">A table of table items with expandable details.</p>`;
    tptableheader.setHtml(tptblheaderhtml);
    tpContainer.add(tptableheader);

    var tptablecontent = new qx.ui.embed.Html();
    tptablecontent.setCssUtilityClass("cds--data-table-content");
    var tptblcontenthtml = `<table class="cds--data-table cds--data-table--lg">
      <thead><tr>
        <th scope="col" class="cds--table-expand" id="expand"></th>
        <th scope="col"><div class="cds--table-header-label">Name</div></th>
        <th scope="col"><div class="cds--table-header-label">Number</div></th>
        <th scope="col"><div class="cds--table-header-label">Details</div></th>
      </tr></thead>
      <tbody>
        <tr class="cds--parent-row" data-parent-row="true">
          <td headers="expand" class="cds--table-expand">
            <button type="button" class="cds--table-expand__button" aria-label="Expand current row">
              <svg focusable="false" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" fill="currentColor" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" class="cds--table-expand__svg">
                <path d="M11 8L6 13 5.3 12.3 9.6 8 5.3 3.7 6 3z"></path>
              </svg>
            </button>
          </td>
          <td>Name of table item 1</td>
          <td>1</td>
          <td>Details for 1 go here</td>
        </tr>
        <tr class="cds--expandable-row" data-child-row="true">
          <td colspan="4">
            <div class="cds--child-row-inner-container">
              <p>Breakout for expandable row 1</p>
            </div>
          </td>
        </tr>
        <tr class="cds--parent-row cds--expandable-row" data-parent-row="true">
          <td headers="expand" class="cds--table-expand" data-previous-value="collapsed">
            <button type="button" class="cds--table-expand__button" aria-label="Expand current row">
              <svg focusable="false" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" fill="currentColor" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" class="cds--table-expand__svg">
                <path d="M11 8L6 13 5.3 12.3 9.6 8 5.3 3.7 6 3z"></path>
              </svg>
            </button>
          </td>
          <td>Name of table item 2</td>
          <td>2</td>
          <td>Details for 2 go here</td>
        </tr>
        <tr class="cds--expandable-row" data-child-row="true">
          <td colspan="4">
            <div class="cds--child-row-inner-container">
              <p>Breakout for expandable row 2</p>
            </div>
          </td>
        </tr>
        <tr class="cds--parent-row" data-parent-row="true">
          <td headers="expand" class="cds--table-expand">
            <button type="button" class="cds--table-expand__button" aria-label="Expand current row">
              <svg focusable="false" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" fill="currentColor" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" class="cds--table-expand__svg">
                <path d="M11 8L6 13 5.3 12.3 9.6 8 5.3 3.7 6 3z"></path>
              </svg>
            </button>
          </td>
          <td>Name of table item 3</td>
          <td>3</td>
          <td>Details for 3 go here</td>
        </tr>
        <tr class="cds--expandable-row" data-child-row="true">
          <td colspan="4">
            <div class="cds--child-row-inner-container">
              <p>Breakout for expandable row 3</p>
            </div>
          </td>
        </tr>
      </tbody></table>`;
    tptablecontent.setHtml(tptblcontenthtml);
    tpContainer.add(tptablecontent);

    // assemble Main
    this.add(landingPage);
    this.add(tablePage);
  },

  members : {
    // overridden
    _createContentElement() {
      return new qx.html.Element("main");
    }
  }
});
