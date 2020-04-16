// Adapted from https://carto.com/developers/carto-js/examples/#example-category-filter

function getProjectTypes () {
  const inputControls= document.querySelectorAll('#filters input');
  const values = [];

  inputControls.forEach(input => input.checked ? values.push(input.value): null);
  return values;
}

const projectTypeFilter = new carto.filter.Category('projectpro', { in: getProjectTypes() });

function applyFilters () {
  projectTypeFilter.setFilters({ in: getProjectTypes() });
}

function registerListeners () {
  document.querySelectorAll('#filters input').forEach(
    input => input.addEventListener('click', () => applyFilters())
  );
}

// This isn't necessary but it keeps the editor from thinking L and carto are typos
/* global L, carto */

var map = L.map('map').setView([29.42, -98.5], 11);

L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}.png', {
  maxZoom: 18
}).addTo(map);

// Initialize Carto
var client = new carto.Client({
  apiKey: "default_public",
  username: "bowee728"
});

/*
 * Layer 1: Bond Points ---------------------------------------------------------------------
 */

// Initialze source data
var bondPoints = new carto.source.SQL("SELECT * FROM bond_project_points_2017");
bondPoints.addFilter(projectTypeFilter);

// Create style for the data
var bondPointsStyle = new carto.style.CartoCSS(`
  #layer {
    marker-width: 7;
    marker-fill: ramp([projectpro], (#E8D358, #70C196, #653182, #1EAEFF, #FF30FE, #FF8920), ("STREETS", "PARKS", "LIBRARIES", "DRAINAGE", "LAW ENFORCEMENT", "FIRE PROTECTION"), "=");
    marker-fill-opacity: 1;
    marker-allow-overlap: true;
    marker-line-width: 1;
    marker-line-color: #FFFFFF;
    marker-line-opacity: 1;
    [zoom > 13] {marker-width: 14}
  }
`);

// Add style to the data
var bondPointsLayer = new carto.layer.Layer(bondPoints, bondPointsStyle, {
  featureClickColumns: ['projectnam', 'projectsco', 'projectsta', 'projectman', 'projectpro', 'consultant', 'contractor']
});

var sidebar = document.querySelector('.sidebar-feature-content');
bondPointsLayer.on('featureClicked', function (event) {
  // Create the HTML that will go in the sidebar. event.data has all the data for 
  // the clicked feature.
  var content = '<h3>' + event.data['projectnam'] + '</h3>' + '<div id = "project-details">' + '<br>' + event.data['projectsco'] + '<br>' + '<b>Stage: </b>' + event.data['projectsta'] + '<br>' + '<b>Project Manager: </b>' + event.data['projectman'] + '<br>' + '<b>Program: </b>' + event.data['projectpro'] + '<br>' + '<b>Consultant: </b>' + event.data['consultant'] + '<br>' + '<b>Contractor: </b>' + event.data['contractor'] + '</div>';
  
  
  // Then put the HTML inside the sidebar. Once you click on a feature, the HTML
  // for the sidebar will change.
  sidebar.innerHTML = content;
});



/*
 * Layer 2: Historic Sites ------------------------------------------------------------------
 */

//Initialize source data
var historicSites = new carto.source.SQL(
  "SELECT * FROM historic_landmark_sites"
);

// Create style for the data
var historicSitesStyle = new carto.style.CartoCSS(`
  #layer {
    polygon-fill: #005580;
    polygon-opacity: 0.10;
  }
  #layer::outline {
    line-width: 1;
    line-color: #005580;
    line-opacity: 0.50;
  }
`);

// Add style to the data

// Note: any column you want to show up in the popup needs to be in the list of
// featureClickColumns below
var historicSitesLayer = new carto.layer.Layer(historicSites,historicSitesStyle);

// Add the data to the map as layers
client.addLayers([historicSitesLayer, bondPointsLayer]);
client.getLeafletLayer().addTo(map);
registerListeners();


/*
 * BUTTONS -------------------------------------------------------
 */

var resetButton = document.querySelector(".reset-button");
resetButton.addEventListener("click", function(e) {
  let checkBoxes = document.getElementsByName("ProjectTypes[]");
  for (let i = 0; i < checkBoxes.length; i++) {
    checkBoxes[i].checked = true;
  }
  projectTypeFilter.resetFilters()
  sidebar.innerHTML = "";
});