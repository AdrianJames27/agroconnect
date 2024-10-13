import { initializeMethodsPest } from "../classes/Pest.js";
import { initializeMethodsDisease } from "../classes/Disease.js";
import { initializeMethodsProduction } from "../classes/Production.js";
import { initializeMethodsSoilHealth } from "../classes/SoilHealth.js";
import { initializeMethodsPrice } from "../classes/Price.js";
import { initializeMethodsDamage } from "../classes/Damage.js";

function initializeDataEntriesMenu(option) {
    // Clear previous content
    $("#maintenance-content").empty();

    // Switch based on selected option
    switch (option) {
        case "productions":
            initializeProductionView();
            break;
        case "prices":
            initializePriceView();
            break;
        case "pests":
            initializePestView();
            break;
        case "diseases":
            initializeDiseaseView();
            break;
        case "damages":
            initializeDamageView();
            break;
        case "soil_healths":
            initializeSoilHealthsView();
            break;
        default:
            initializeProductionView();
    }
}

// Function to initialize Barangay Records view
function initializeProductionView() {
    $("#entries-content").html(`
    <div class="row d-flex justify-content-between align-items-center mt-5">
      <div class="col">
        <div class="table-responsive">
          <table id="productionTable" class="table table-custom table-sm text-center tablesorter">
            <thead>
              <tr style="background-color: #2774E9; color: white;">
                <th scope="col">Barangay</th>
                <th scope="col">Commodity</th>
                <th scope="col">Variety</th>
                <th scope="col">Area Planted</th>
                <th scope="col">Month Planted</th>
                <th scope="col">Month Harvested</th>
                <th scope="col">Volume of Production</th>
                <th scope="col">Cost of Production</th>
                <th scope="col">Farm Gate Price</th>
                <th scope="col">Volume Sold</th>
                <th scope="col">Season</th>
                <th scope="col">Month Year</th>
              </tr>
            </thead>
            <tbody id="productionTableBody">
              <!-- Table rows will be dynamically added here -->
            </tbody>
          </table>
        </div>
        <div class="text-right">
          <button id="prevBtn" class="btn btn-green mr-2">Previous</button>
          <button id="nextBtn" class="btn btn-green">Next</button>
        </div>
      </div>
    </div>
    <div class="text-center mt-3">
      <button id="downloadBtn" class="download-btn btn btn-primary">Download Productions</button>
    </div>
  `);

    initializeMethodsProduction();

    // Initialize tablesorter
    $("#productionTable").tablesorter({
        theme: "bootstrap", // or another theme if you're using it
        widgets: ["zebra"], // Example of adding widgets
        widgetOptions: {
            // Add custom classes for the sorting icons
            cssIcon: "tablesorter-header-icon",
        },
    });
}

function initializePriceView() {
    $("#entries-content").html(`
    <div class="row d-flex justify-content-between align-items-center mt-5">
      <div class="col">
        <div class="table-responsive">
          <table id="priceTable" class="table table-custom table-sm text-center tablesorter">
            <thead>
              <tr style="background-color: #2774E9; color: white;">
                <th scope="col">Commodity</th>
                <th scope="col">Price</th>
                <th scope="col">Season</th>
                <th scope="col">Month Year</th>
              </tr>
            </thead>
            <tbody id="priceTableBody">
              <!-- Table rows will be dynamically added here -->
            </tbody>
          </table>
        </div>
        <div class="text-right">
          <button id="prevBtn" class="btn btn-green mr-2">Previous</button>
          <button id="nextBtn" class="btn btn-green">Next</button>
        </div>
      </div>
    </div>
    <div class="text-center mt-3">
      <button id="downloadBtn" class="download-btn btn btn-primary">Download Prices</button>
    </div>
  `);
    initializeMethodsPrice();

    // Initialize tablesorter
    $("#priceTable").tablesorter({
        theme: "bootstrap", // or another theme if you're using it
        widgets: ["zebra"], // Example of adding widgets
        widgetOptions: {
            // Add custom classes for the sorting icons
            cssIcon: "tablesorter-header-icon",
        },
    });
}

function initializePestView() {
    $("#entries-content").html(`
    <div class="row d-flex justify-content-between align-items-center mt-5">
      <div class="col">
        <div class="table-responsive">
          <table id="pestTable" class="table table-custom table-sm text-center tablesorter">
            <thead>
              <tr style="background-color: #2774E9; color: white;">
                <th scope="col">Farm Location</th>
                <th scope="col">Crops Planted</th>
                <th scope="col">Pest Observed</th>
                <th scope="col">Total no. of Trees/Plants Planted</th>
                <th scope="col">Total no. of Trees/Plants Affected/Damaged</th>
                <th scope="col">Season</th>
                <th scope="col">Month Year</th>
              </tr>
            </thead>
            <tbody id="pestTableBody">
              <!-- Table rows will be dynamically added here -->
            </tbody>
          </table>
        </div>
        <div class="text-right">
          <button id="prevBtn" class="btn btn-green mr-2">Previous</button>
          <button id="nextBtn" class="btn btn-green">Next</button>
        </div>
      </div>
    </div>
    <div class="text-center mt-3">
      <button id="downloadBtn" class="download-btn btn btn-primary">Download Pests</button>
    </div>
  `);
    initializeMethodsPest();

    // Initialize tablesorter
    $("#pestTable").tablesorter({
        theme: "bootstrap", // or another theme if you're using it
        widgets: ["zebra"], // Example of adding widgets
        widgetOptions: {
            // Add custom classes for the sorting icons
            cssIcon: "tablesorter-header-icon",
        },
    });
}

function initializeDiseaseView() {
    $("#entries-content").html(`
    <div class="row d-flex justify-content-between align-items-center mt-5">
      <div class="col">
        <div class="table-responsive">
          <table id="diseaseTable" class="table table-custom table-sm text-center tablesorter">
            <thead>
              <tr style="background-color: #2774E9; color: white;">
                <th scope="col">Farm Location</th>
                <th scope="col">Crops Planted</th>
                <th scope="col">Disease Observed</th>
                <th scope="col">Total no. of Trees/Plants Planted</th>
                <th scope="col">Total no. of Trees/Plants Affected/Damaged</th>
                <th scope="col">Season</th>
                <th scope="col">Month Year</th>
              </tr>
            </thead>
            <tbody id="diseaseTableBody">
              <!-- Table rows will be dynamically added here -->
            </tbody>
          </table>
        </div>
        <div class="text-right">
          <button id="prevBtn" class="btn btn-green mr-2">Previous</button>
          <button id="nextBtn" class="btn btn-green">Next</button>
        </div>
      </div>
    </div>
    <div class="text-center mt-3">
      <button id="downloadBtn" class="download-btn btn btn-primary">Download Diseases</button>
    </div>
  `);
    initializeMethodsDisease();

    // Initialize tablesorter
    $("#diseaseTable").tablesorter({
        theme: "bootstrap", // or another theme if you're using it
        widgets: ["zebra"], // Example of adding widgets
        widgetOptions: {
            // Add custom classes for the sorting icons
            cssIcon: "tablesorter-header-icon",
        },
    });
}

function initializeDamageView() {
    $("#entries-content").html(`
    <div class="row d-flex justify-content-between align-items-center mt-5">
      <div class="col">
        <div class="table-responsive">
          <table id="damageTable" class="table table-custom table-sm text-center tablesorter">
            <thead>
              <tr style="background-color: #2774E9; color: white;">
                <th scope="col">Barangay</th>
                <th scope="col">Commodity</th>
                <th scope="col">Variety</th>
                <th scope="col">Number of Farmers Affected</th>
                <th scope="col">Total Area Affected (ha)</th>
                <th scope="col">Yield Loss (%)</th>
                <th scope="col">Grand Total Value</th>
                <th scope="col">Season</th>
                <th scope="col">Month Year</th>
              </tr>
            </thead>
            <tbody id="damageTableBody">
              <!-- Table rows will be dynamically added here -->
            </tbody>
          </table>
        </div>
        <div class="text-right">
          <button id="prevBtn" class="btn btn-green mr-2">Previous</button>
          <button id="nextBtn" class="btn btn-green">Next</button>
        </div>
      </div>
    </div>
    <div class="text-center mt-3">
      <button id="downloadBtn" class="download-btn btn btn-primary">Download Damage Reports</button>
    </div>
  `);
    initializeMethodsDamage();

    // Initialize tablesorter
    $("#diseaseTable").tablesorter({
        theme: "bootstrap", // or another theme if you're using it
        widgets: ["zebra"], // Example of adding widgets
        widgetOptions: {
            // Add custom classes for the sorting icons
            cssIcon: "tablesorter-header-icon",
        },
    });
}

function initializeSoilHealthsView() {
    $("#entries-content").html(`
    <div class="row d-flex justify-content-between align-items-center mt-5">
      <div class="col">
        <div class="table-responsive">
          <table id="soilHealthTable" class="table table-custom table-sm text-center tablesorter">
            <thead>
              <tr style="background-color: #2774E9; color: white;">
                <th scope="col">Barangay</th>
                 <th scope="col">Farmer</th>
                <th scope="col">Field Type</th>
                <th scope="col">Nitrogen</th>
                <th scope="col">Phosphorus</th>
                <th scope="col">Potassium</th>
                <th scope="col">pH</th>
                <th scope="col">General Rating</th>
                <th scope="col">Recommendations</th>
                <th scope="col">Season</th>
                <th scope="col">Month Year</th>
              </tr>
            </thead>
            <tbody id="soilHealthTableBody">
              <!-- Table rows will be dynamically added here -->
            </tbody>
          </table>
        </div>
        <div class="text-right">
          <button id="prevBtn" class="btn btn-green mr-2">Previous</button>
          <button id="nextBtn" class="btn btn-green">Next</button>
        </div>
      </div>
    </div>
    <div class="text-center mt-3">
      <button id="downloadBtn" class="download-btn btn btn-primary">Download Soil Healths</button>
    </div>
  `);
    initializeMethodsSoilHealth();

    // Initialize tablesorter
    $("#soilHealthTable").tablesorter({
        theme: "bootstrap", // or another theme if you're using it
        widgets: ["zebra"], // Example of adding widgets
        widgetOptions: {
            // Add custom classes for the sorting icons
            cssIcon: "tablesorter-header-icon",
        },
    });
}

export { initializeDataEntriesMenu };
