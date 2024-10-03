// MaintenanceMenu.js
import { initializeMethodsCrop } from "../classes/Crop.js";
import { getCrop } from "../../../js/fetch.js";
import { initializeMethodsCropVariety } from "../classes/CropVariety.js";
import { initializeMethodsBarangay } from "../classes/Barangay.js";
import {
    initializeMethodsFarmer,
    getBarangayNames,
} from "../classes/Farmer.js";
import { initializeMethodsRecord } from "../classes/Record.js";
import Dialog from "../helpers/Dialog.js";

function loadMonthYear() {
    $(document).ready(function () {
        // Get the current year
        var currentYear = new Date().getFullYear();

        // Initialize the select element
        var $yearSelect = $("#yearSelect");

        // Loop to add options from the current year to 10 years ago
        for (var year = currentYear; year >= currentYear - 10; year--) {
            $yearSelect.append(
                $("<option>", {
                    value: year,
                    text: year,
                })
            );
        }
    });
    $(document).ready(function () {
        // Array of month names to match with the options in the select element
        var months = [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
        ];

        // Get the current month as a number (0-11)
        var currentMonthIndex = new Date().getMonth();

        // Get the current month name from the array
        var currentMonthName = months[currentMonthIndex];

        // Set the current month as selected in the select element
        $("#monthPicker select").val(currentMonthName);
    });
}

// Function to initialize the maintenance menu view
function initializeMaintenanceMenu(option) {
    // Clear previous content
    $("#maintenance-content").empty();

    // Switch based on selected option
    switch (option) {
        case "crop":
            initializeCropView();
            break;
        case "crop_variety":
            initializeCropVarietyView();
            break;
        case "barangay":
            initializeBarangayView();
            break;
        case "farmer":
            initializeFarmerView();
            break;
        case "production":
            initializeProductionView();
            break;
        case "price":
            initializePriceMonitoringView();
            break;
        case "pestDisease":
            initializePestReportsView();
            break;
        case "damage":
            initializeDamageReportsView();
            break;
        case "soilHealth":
            initializeSoilHealthView();
            break;
        default:
            initializeBarangayView();
    }
}

// Function to initialize Barangay Records view
function initializeCropView() {
    // Example content for Crop Records
    $("#maintenance-content").html(`
    <div class="row d-flex justify-content-between align-items-center mt-5">
      <div class="col-md-4">
        <form id="cropForm">
          <input type="hidden" class="form-control" id="cropId" name="cropId">
          
          <div class="mb-3">
            <input placeholder="Crop Name" type="text" class="form-control" id="cropName" name="cropName" required>
          </div>

          <div class="mb-3">
            <input placeholder="Scientific Name" type="text" class="form-control" id="scientificName" name="scientificName" required>
          </div>

          <div class="mb-3">
            <textarea placeholder="Planting Season" type="text" class="form-control" id="plantingSeason" name="plantingSeason" rows="3" required></textarea>
          </div>

          <div class="mb-3">
            <textarea placeholder="Growth Duration" type="text" class="form-control" id="growthDuration" name="growthDuration" rows="3" required></textarea>
          </div>
          
          <div class="mb-3">
            <select class="form-control" id="cropType" name="cropType" required>
              <option value="" disabled selected>Select Type</option>
              <option value="Vegetables">Vegetables</option>
              <option value="Rice">Rice</option>
              <option value="Fruits">Fruits</option>
            </select>
          </div>
          
          <div class="mb-3">
            <select class="form-control" id="unit" name="unit" required>
              <option value="" disabled selected>Select Unit</option>
              <option value="kg">kilogram</option>
              <option value="pc">piece</option>
              <option value="bundle">bundle</option>
            </select>
          </div>
          
          <div class="mb-3" id="weightDiv" style="display: none;">
            <input placeholder="Weight on kilogram (optional)" type="number" class="form-control" id="weight" name="weight" value="1.00" step="0.01" min="0">
          </div>

          <div class="mb-3">
            <label id="lblCropImg">Upload Image:</label>
            <div class="input-group mb-3" style="width: 100%;">
              <input type="file" class="form-control" id="cropImg" name="cropImg" accept="image/*">
              <div class="input-group-append">
                <label class="input-group-text" for="cropImg">
                  <i class="fas fa-upload"></i>
                </label>
              </div>
            </div>
          </div>
          
          <button type="button" class="btn btn-custom" id="submitBtn">Add Crop</button>
          <button type="button" class="btn btn-custom mt-2" id="cancelBtn" style="display: none;">Cancel</button>
        </form>
      </div>
  
      <div class="col-md-8 actionBtn">
        <div class="d-flex justify-content-end align-items-center mb-2">
          <button id="editBtn" class="btn btn-warning" style="margin-right: 10px;" disabled>Edit</button>
          <button id="deleteBtn" class="btn btn-danger" disabled>Delete</button>
        </div>
  
        <div class="table-responsive">
          <table id="cropTable" class="table table-custom text-center">
            <thead>
              <tr style="background-color: #2774E9; color: white;">
                <th scope="col" style="display: none;">Crop ID</th>
                <th scope="col">Crop Image</th>
                <th scope="col">Crop Name</th>
                <th scope="col">Type</th>
                <th scope="col">Scientific Name</th> <!-- New Column -->
                <th scope="col">Planting Season</th> <!-- New Column -->
                <th scope="col">Growth Duration</th> <!-- New Column -->
                <th scope="col">Unit</th> <!-- New Column -->
                <th scope="col">Weight</th> <!-- New Column -->
              </tr>
            </thead>
            <tbody id="cropTableBody">
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
  `);

    initializeMethodsCrop();
    createDeleteModal();
    createEditModal();

    // Event listener to show/hide the weight input based on the selected unit
    $("#unit").change(function () {
        const selectedUnit = $(this).val();
        if (selectedUnit === "kg") {
            $("#weightDiv").hide(); // Hide weight input if unit is kg
            $("#weight").val("1.00"); // Set weight value to 0.00
        } else {
            $("#weightDiv").show(); // Show weight input for other units
        }
    });
}

// Function to initialize Crop Variety Records view
function initializeCropVarietyView() {
    // Example content for Crop Variety Records
    $("#maintenance-content").html(`
      <div class="row d-flex justify-content-between align-items-center mt-5">
          <div class="col-md-4">
              <form id="cropVarietyForm">
                  <input type="hidden" class="form-control" id="varietyId" name="varietyId">

                  <div class="mb-3">
                      <select class="form-control" id="cropId" name="cropId" required>
                          <option value="" disabled selected>Select Associated Crop</option>
                          <!-- Populate this dropdown with crop options -->
                      </select>
                  </div>
                  
                  <div class="mb-3">
                      <input placeholder="Variety Name" type="text" class="form-control" id="varietyName" name="varietyName" required>
                  </div>
                  
                  <div class="mb-3">
                      <input placeholder="Color" type="text" class="form-control" id="color" name="color" required>
                  </div>

                  <div class="mb-3">
                      <input placeholder="Size" type="text" class="form-control" id="size" name="size" required>
                  </div>

                  <div class="mb-3">
                      <input placeholder="Flavor" type="text" class="form-control" id="flavor" name="flavor" required>
                  </div>

                  <div class="mb-3">
                      <textarea placeholder="Growth Conditions" class="form-control" id="growthConditions" name="growthConditions" rows="3" required></textarea>
                  </div>

                  <div class="mb-3">
                      <textarea placeholder="Pest/Disease Resistance" class="form-control" id="pestDiseaseResistance" name="pestDiseaseResistance" rows="3" required></textarea>
                  </div>

                  <div class="mb-3">
                      <textarea placeholder="Recommended Practices" class="form-control" id="recommendedPractices" name="recommendedPractices" rows="3" required></textarea>
                  </div>

                  <div class="mb-3">
                      <label id="lblCropImg">Upload Image:</label>
                      <div class="input-group mb-3" style="width: 100%;">
                          <input type="file" class="form-control" id="cropImg" name="cropImg" accept="image/*">
                          <div class="input-group-append">
                              <label class="input-group-text" for="cropImg">
                                  <i class="fas fa-upload"></i>
                              </label>
                          </div>
                      </div>
                  </div>
                  
                  <button type="button" class="btn btn-custom" id="submitBtn">Add Variety</button>
                  <button type="button" class="btn btn-custom mt-2" id="cancelBtn" style="display: none;">Cancel</button>
              </form>
          </div>

          <div class="col-md-8 actionBtn">
              <div class="d-flex justify-content-end align-items-center mb-2">
                  <button id="editBtn" class="btn btn-warning" style="margin-right: 10px;" disabled>Edit</button>
                  <button id="deleteBtn" class="btn btn-danger" disabled>Delete</button>
              </div>

              <div class="table-responsive">
                  <table id="cropVarietyTable" class="table table-custom text-center">
                      <thead>
                          <tr style="background-color: #2774E9; color: white;">
                              <th scope="col" style="display: none;">Variety ID</th>
                              <th scope="col">Crop Image</th>
                              <th scope="col">Variety Name</th>
                              <th scope="col">Crop ID</th>
                              <th scope="col">Color</th>
                              <th scope="col">Size</th>
                              <th scope="col">Flavor</th>
                              <th scope="col">Growth Conditions</th>
                              <th scope="col">Pest/Disease Resistance</th>
                              <th scope="col">Recommended Practices</th>
                          </tr>
                      </thead>
                      <tbody id="cropVarietyTableBody">
                          <!-- Table rows will be dynamically added here -->
                      </tbody>
                  </table>
              </div>
              
              <div class="text-right">
                  <button id="prevVarietyBtn" class="btn btn-green mr-2">Previous</button>
                  <button id="nextVarietyBtn" class="btn btn-green">Next</button>
              </div>
          </div>
      </div>
  `);

    $(document).ready(function () {
        // Call the getCrop function and populate the dropdown
        getCrop()
            .then(function (crops) {
                let $cropDropdown = $("#cropId");
                // Clear existing options (optional if you are repopulating)
                $cropDropdown.empty();
                // Add the default "Select Associated Crop" option
                $cropDropdown.append(
                    '<option value="" disabled selected>Select Associated Crop</option>'
                );

                // Loop through the crops and append each option
                crops.forEach(function (crop) {
                    $cropDropdown.append(
                        '<option value="' +
                            crop.cropId +
                            '">' +
                            crop.cropName +
                            "</option>"
                    );
                });
            })
            .catch(function (error) {
                console.error("Error fetching crops:", error);
            });
    });

    // Initialize methods for crop varieties and create modals
    initializeMethodsCropVariety();
    createDeleteModal();
    createEditModal();
}

// Function to initialize Barangay Records view
function initializeBarangayView() {
    // Example content for Barangay Records
    $("#maintenance-content").html(`
  <div class="row d-flex justify-content-between align-items-center mt-5">
    <div class="col-md-4">
      <form id="barangayForm">
        <input type="hidden" class="form-control" id="barangayId" name="barangayId">
        <div class="mb-3">
          <input placeholder="Barangay" type="text" class="form-control" id="barangayName" name="barangayName" required>
        </div>
        <button type="button" class="btn btn-custom" id="submitBtn">Add Barangay</button>
        <button type="button" class="btn btn-custom mt-2" id="cancelBtn" style="display: none;">Cancel</button>
      </form>
    </div>
    <div class="col-md-8">
      <div class="d-flex justify-content-end align-items-center mb-2 ">
        <button id="editBtn" class="btn btn-warning" style="margin-right: 10px;" disabled>Edit</button>
        <button id="deleteBtn" class="btn btn-danger" disabled>Delete</button>
      </div>
      <div class="table-responsive">
        <table id="barangayTable" class="table table-custom text-center">
          <thead>
            <tr style="background-color: #2774E9; color: white;">
              <th scope="col">Barangay</th>
              <th scope="col">Coordinates</th>
            </tr>
          </thead>
          <tbody id="barangayTableBody">
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
`);

    initializeMethodsBarangay();
    createDeleteModal();
    createEditModal();
}

// Function to initialize Farmer Records view
function initializeFarmerView() {
    $("#maintenance-content").html(`
    <div class="row d-flex justify-content-between align-items-center mt-5">
      <div class="col-md-4">
        <form id="farmerForm">
          <input type="hidden" class="form-control" id="farmerId" name="farmerId">
          
          <div class="mb-3">
            <select style='width: 100%;' id="barangay-option" class="form-control" name="barangayId" required>
              <!-- Options will be populated dynamically -->
            </select>
          </div>
          
          <div class="mb-3">
            <input placeholder="Farmer Name" type="text" class="form-control" id="farmerName" name="farmerName" required>
          </div>
          
          <div class="mb-3">
            <input placeholder="Field Area" type="number" step="0.01" class="form-control" id="fieldArea" name="fieldArea">
          </div>
          
          <div class="mb-3">
            <select style='width: 100%;' id="fieldType" class="form-control" name="fieldType" required>
              <option value="" disabled selected>Select Field Type</option>
              <option value='Vegetables'>Vegetables</option>
              <option value='Rice'>Rice</option>
              <option value='Fruit Trees'>Fruit Trees</option>
              <option value='OA'>OA</option>
              <option value='Corn'>Corn</option>
            </select>
          </div>
          
          <div class="mb-3">
            <input placeholder="Phone Number (optional)" type="text" class="form-control" id="phoneNumber" name="phoneNumber">
          </div>
          
          <button type="button" class="btn btn-custom" id="submitBtn">Add Farmer</button>
          <button type="button" class="btn btn-custom mt-2" id="cancelBtn" style="display: none;">Cancel</button>
        </form>
      </div>
      
      <div class="col-md-8 actionBtn">
        <div class="d-flex justify-content-end align-items-center mb-2 ">
          <button id="editBtn" class="btn btn-warning" style="margin-right: 10px;" disabled>Edit</button>
          <button id="deleteBtn" class="btn btn-danger" disabled>Delete</button>
        </div>
        
        <div class="table-responsive">
          <table id="farmerTable" class="table table-custom text-center">
            <thead>
              <tr style="background-color: #2774E9; color: white;">
                <th scope="col">Barangay</th>
                <th scope="col">Farmer Name</th>
                <th scope="col">Field Area</th>
                <th scope="col">Field Type</th>
                <th scope="col">Phone Number</th>
              </tr>
            </thead>
            <tbody id="farmerTableBody">
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
      <button id="downloadBtn" class="download-btn btn btn-primary">Download Farmers</button>
    </div>
  `);

    getBarangayNames();
    initializeMethodsFarmer();
    createDeleteModal();
    createEditModal();
}

// Function to initialize Supply and Market view
function initializeProductionView() {
    $("#maintenance-content").html(`
    <div class="row d-flex justify-content-between align-items-center mt-5">
      <div class="col-md-4">
        <form id="recordForm" enctype="multipart/form-data">
          <input type="hidden" class="form-control" id="recordId" name="recordId">
          <input type="hidden" class="form-control" id="userId" name="userId">
          
          <div class="mb-3">
            <div class="input-group" id="monthPicker" style="width: 100%;">
              <select class="form-control" required>
                <option value="January">January</option>
                <option value="February">February</option>
                <option value="March">March</option>
                <option value="April">April</option>
                <option value="May">May</option>
                <option value="June">June</option>
                <option value="July">July</option>
                <option value="August">August</option>
                <option value="September">September</option>
                <option value="October">October</option>
                <option value="November">November</option>
                <option value="December">December</option>
              </select>
              <span class="input-group-append">
                <span class="input-group-text"><i class="fas fa-calendar-alt"></i></span>
              </span>
            </div>
          </div>
          
          <div class="mb-3">
            <div class="input-group" id="yearPicker" style="width: 100%;">
              <select id="yearSelect" class="form-control" required>
                <!-- Options will be added by jQuery -->
              </select>
              <span class="input-group-append">
                <span class="input-group-text"><i class="fas fa-calendar-alt"></i></span>
              </span>
            </div>
          </div>
          
          <div class="mb-3">
            <label id="lblUpload">Upload File:</label>
            <div class="input-group" style="width: 100%;">
              <input type="file" class="form-control" id="fileRecord" name="fileRecord" accept=".xls, .xlsx" required>
              <div class="input-group-append">
                <label class="input-group-text" for="fileRecord" id="btnUpload">
                  <i class="fas fa-upload"></i>
                </label>
              </div>
            </div>
          </div>
          
          <button type="button" class="btn btn-custom" id="submitBtn">Add Record</button>
          <button type="button" class="btn btn-custom mt-2" id="cancelBtn" style="display: none;">Cancel</button>
        </form>
      </div>
      
      <div class="col-md-8 actionBtn">
        <div class="d-flex justify-content-end align-items-center mb-2">
          <button id="infoBtn" class="btn btn-info" style="margin-right: 10px;">
            <i class="fas fa-info-circle"></i>
          </button>
          <button id="editBtn" class="btn btn-warning" style="margin-right: 10px;" disabled>Edit</button>
          <button id="deleteBtn" class="btn btn-danger" disabled>Delete</button>
        </div>
        
        <div class="table-responsive">
          <table id="recordTable" class="table table-custom text-center">
            <thead>
              <tr style="background-color: #2774E9; color: white;">
                <th scope="col">File Name</th>
                <th scope="col">File Size</th>
              </tr>
            </thead>
            <tbody id="recordTableBody">
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
  `);

    $(document).ready(function () {
        $("#infoBtn").click(function () {
            let htmlScript = `
<p>To upload your records successfully, please follow the instructions below using the provided template:</p>

<ol>
  <li><strong>Download the Template:</strong><br>
  Obtain the file <a href="components/template/Production_Template.xlsx" download>Production_Template.xlsx</a>. This template will guide you in entering the necessary data.</li>

  <li><strong>Gather Your Data:</strong><br>
  Retrieve the data from your reports and prepare it for entry into the template. The data should include the following fields:
    <ul>
      <li><strong>Barangay:</strong> The local administrative division where the production takes place.</li>
      <li><strong>Commodity:</strong> The type of crop or product being recorded.</li>
      <li><strong>Variety:</strong> The specific variety or type of the commodity.</li>
      <li><strong>Area Planted (ha):</strong> The total area planted with the crop, measured in hectares.</li>
      <li><strong>Month Planted:</strong> The month when planting of the crop started.</li>
      <li><strong>Month Harvested:</strong> The month when the crop was harvested.</li>
      <li><strong>Volume of Production (MT):</strong> The total volume of the commodity produced, measured in metric tons.</li>
      <li><strong>Cost of Production (per ha):</strong> The cost incurred for producing the crop per hectare.</li>
      <li><strong>Farm Gate Price (per kg):</strong> The price at which the commodity is sold at the farm gate, per kilogram.</li>
      <li><strong>Volume Sold (MT):</strong> The total volume of the commodity sold, measured in metric tons.</li>
    </ul>
  </li>

  <li><strong>Enter Data into the Template:</strong><br>
  Open the <a href="components/template/Production_Template.xlsx" download>Production_Template.xlsx</a> and enter your data into the appropriate columns based on the definitions provided above. Ensure accuracy to avoid errors in the data upload process.</li>

  <li><strong>Save and Upload:</strong><br>
  After filling out the template, save the file with your updated data. Upload this file to the designated upload area or system.</li>

  <li><strong>Verify Submission:</strong><br>
  Confirm that your file was uploaded correctly and check for any validation messages or errors that may require correction.</li>
</ol>

<p>By adhering to these instructions and utilizing the provided template, you ensure that your data is recorded accurately and efficiently.</p>
`;

            Dialog.showInfoModal(htmlScript);
        });
    });
    initializeMethodsRecord("production");
    createDeleteModal();
    createEditModal();
    loadMonthYear();
}

// Function to initialize Crop Price Monitoring view
function initializePriceMonitoringView() {
    // Example content for Price Monitoring
    $("#maintenance-content").html(`
        <div class="row d-flex justify-content-between align-items-center mt-5">
          <div class="col-md-4">
            <form id="recordForm" enctype="multipart/form-data">
              <input type="hidden" class="form-control" id="recordId" name="recordId">
              <input type="hidden" class="form-control" id="userId" name="userId">
              
              <div class="mb-3">
                <div class="input-group" id="monthPicker" style="width: 100%;">
                  <select class="form-control" required>
                    <option value="January">January</option>
                    <option value="February">February</option>
                    <option value="March">March</option>
                    <option value="April">April</option>
                    <option value="May">May</option>
                    <option value="June">June</option>
                    <option value="July">July</option>
                    <option value="August">August</option>
                    <option value="September">September</option>
                    <option value="October">October</option>
                    <option value="November">November</option>
                    <option value="December">December</option>
                  </select>
                  <span class="input-group-append">
                    <span class="input-group-text"><i class="fas fa-calendar-alt"></i></span>
                  </span>
                </div>
              </div>
              
              <div class="mb-3">
                <div class="input-group" id="yearPicker" style="width: 100%;">
                  <select id="yearSelect" class="form-control" required>
                    <!-- Options will be added by jQuery -->
                  </select>
                  <span class="input-group-append">
                    <span class="input-group-text"><i class="fas fa-calendar-alt"></i></span>
                  </span>
                </div>
              </div>
              
              <div class="mb-3">
                <label id="lblUpload">Upload File:</label>
                <div class="input-group" style="width: 100%;">
                  <input type="file" class="form-control" id="fileRecord" name="fileRecord" accept=".xls, .xlsx" required>
                  <div class="input-group-append">
                    <label class="input-group-text" for="fileRecord" id="btnUpload">
                      <i class="fas fa-upload"></i>
                    </label>
                  </div>
                </div>
              </div>
              
              <button type="button" class="btn btn-custom" id="submitBtn">Add Record</button>
              <button type="button" class="btn btn-custom mt-2" id="cancelBtn" style="display: none;">Cancel</button>
            </form>
          </div>
          
          <div class="col-md-8 actionBtn">
            <div class="d-flex justify-content-end align-items-center mb-2 ">
              <button id="infoBtn" class="btn btn-info" style="margin-right: 10px;">
                <i class="fas fa-info-circle"></i>
              </button>
              <button id="editBtn" class="btn btn-warning" style="margin-right: 10px;" disabled>Edit</button>
              <button id="deleteBtn" class="btn btn-danger" disabled>Delete</button>
            </div>
            
            <div class="table-responsive">
              <table id="recordTable" class="table table-custom text-center">
                <thead>
                  <tr style="background-color: #2774E9; color: white;">
                    <th scope="col">File Name</th>
                    <th scope="col">File Size</th>
                  </tr>
                </thead>
                <tbody id="recordTableBody">
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
      `);

    $(document).ready(function () {
        $("#infoBtn").click(function () {
            let htmlScript = `
  <p>To upload your price records successfully, please follow the instructions below using the provided template:</p>

<ol>
  <li><strong>Download the Template:</strong><br>
  Obtain the file <a href="components/template/Price_Template.xlsx" download>Price_Template.xlsx</a>. This template will guide you in entering the necessary data.</li>

  <li><strong>Gather Your Data:</strong><br>
  Retrieve the price data from your reports and prepare it for entry into the template. The data should include the following fields:
    <ul>
      <li><strong>Commodity:</strong> The type of crop or product for which the price is recorded.</li>
      <li><strong>Farm Gate Price (per kg):</strong> The price at which the commodity is sold at the farm gate, per kilogram.</li>
    </ul>
  </li>

  <li><strong>Enter Data into the Template:</strong><br>
  Open the <a href="components/template/Price_Template.xlsx" download>Price_Template.xlsx</a> and enter your data into the appropriate columns based on the definitions provided above. Ensure accuracy to avoid errors in the data upload process.</li>

  <li><strong>Save and Upload:</strong><br>
  After filling out the template, save the file with your updated data. Upload this file to the designated upload area or system.</li>

  <li><strong>Verify Submission:</strong><br>
  Confirm that your file was uploaded correctly and check for any validation messages or errors that may require correction.</li>
</ol>

<p>By adhering to these instructions and utilizing the provided template, you ensure that your price data is recorded accurately and efficiently.</p>
`;

            Dialog.showInfoModal(htmlScript);
        });
    });
    initializeMethodsRecord("price");
    createDeleteModal();
    createEditModal();
    loadMonthYear();
}

// Function to initialize Pest and Disease Reports view
function initializePestReportsView() {
    // Example content for Pest and Disease Reports
    $("#maintenance-content").html(`
      <div class="row d-flex justify-content-between align-items-center mt-5">
        <div class="col-md-4">
          <form id="recordForm" enctype="multipart/form-data">
            <input type="hidden" class="form-control" id="recordId" name="recordId">
            <input type="hidden" class="form-control" id="userId" name="userId">
            
            <div class="mb-3">
              <div class="input-group" id="monthPicker" style="width: 100%;">
                <select class="form-control" required>
                  <option value="January">January</option>
                  <option value="February">February</option>
                  <option value="March">March</option>
                  <option value="April">April</option>
                  <option value="May">May</option>
                  <option value="June">June</option>
                  <option value="July">July</option>
                  <option value="August">August</option>
                  <option value="September">September</option>
                  <option value="October">October</option>
                  <option value="November">November</option>
                  <option value="December">December</option>
                </select>
                <span class="input-group-append">
                  <span class="input-group-text"><i class="fas fa-calendar-alt"></i></span>
                </span>
              </div>
            </div>
            
            <div class="mb-3">
              <div class="input-group" id="yearPicker" style="width: 100%;">
                <select id="yearSelect" class="form-control" required>
                  <!-- Options will be added by jQuery -->
                </select>
                <span class="input-group-append">
                  <span class="input-group-text"><i class="fas fa-calendar-alt"></i></span>
                </span>
              </div>
            </div>
            
            <div class="mb-3">
              <label id="lblUpload">Upload File:</label>
              <div class="input-group" style="width: 100%;">
                <input type="file" class="form-control" id="fileRecord" name="fileRecord" accept=".xls, .xlsx" required>
                <div class="input-group-append">
                  <label class="input-group-text" for="fileRecord" id="btnUpload">
                    <i class="fas fa-upload"></i>
                  </label>
                </div>
              </div>
            </div>
            
            <button type="button" class="btn btn-custom" id="submitBtn">Add Record</button>
            <button type="button" class="btn btn-custom mt-2" id="cancelBtn" style="display: none;">Cancel</button>
          </form>
        </div>
        
        <div class="col-md-8 actionBtn">
          <div class="d-flex justify-content-end align-items-center mb-2 ">
            <button id="infoBtn" class="btn btn-info" style="margin-right: 10px;">
              <i class="fas fa-info-circle"></i>
            </button>
            <button id="editBtn" class="btn btn-warning" style="margin-right: 10px;" disabled>Edit</button>
            <button id="deleteBtn" class="btn btn-danger" disabled>Delete</button>
          </div>
          
          <div class="table-responsive">
            <table id="recordTable" class="table table-custom text-center">
              <thead>
                <tr style="background-color: #2774E9; color: white;">
                  <th scope="col">File Name</th>
                  <th scope="col">File Size</th>
                </tr>
              </thead>
              <tbody id="recordTableBody">
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
    `);

    $(document).ready(function () {
        $("#infoBtn").click(function () {
            let htmlScript = `
<p>To upload your pest and disease records successfully, please follow the instructions below using the provided template:</p>

<ol>
  <li><strong>Download the Template:</strong><br>
  Obtain the file <a href="components/template/Pest_and_Disease_Template.xlsx" download>Pest_and_Disease_Template.xlsx</a>. This template will guide you in entering the necessary data.</li>

  <li><strong>Gather Your Data:</strong><br>
  Retrieve the pest and disease data from your reports and prepare it for entry into the template. The data should include the following fields:
    <ul>
      <li><strong>Farm Location:</strong> The location where the crops are planted.</li>
      <li><strong>Crops Planted:</strong> The type of crops that are being monitored.</li>
      <li><strong>Growth Stage:</strong> The current growth stage of the crops.</li>
      <li><strong>INSECT PEST:</strong> Details about any insect pests observed.</li>
      <li><strong>Insect Pest Observed:</strong> The specific insect pest observed.</li>
      <li><strong>Total no. of Trees/Plants Planted:</strong> The total number of trees or plants planted.</li>
      <li><strong>Total no. of Trees/Plants Affected/Damaged:</strong> The total number of trees or plants affected or damaged by the pest.</li>
      <li><strong>DISEASE:</strong> Details about any diseases observed.</li>
      <li><strong>Disease Observed:</strong> The specific disease observed.</li>
      <li><strong>Total no. of Trees/Plants Planted:</strong> The total number of trees or plants planted affected by the disease.</li>
      <li><strong>Total no. of Trees/Plants Affected/Damaged:</strong> The total number of trees or plants affected or damaged by the disease.</li>
    </ul>
  </li>

  <li><strong>Enter Data into the Template:</strong><br>
  Open the <a href="components/template/Pest_and_Disease_Template.xlsx" download>Pest_and_Disease_Template.xlsx</a> and enter your data into the appropriate columns based on the definitions provided above. Ensure accuracy to avoid errors in the data upload process.</li>

  <li><strong>Save and Upload:</strong><br>
  After filling out the template, save the file with your updated data. Upload this file to the designated upload area or system.</li>

  <li><strong>Verify Submission:</strong><br>
  Confirm that your file was uploaded correctly and check for any validation messages or errors that may require correction.</li>
</ol>

<p>By adhering to these instructions and utilizing the provided template, you ensure that your pest and disease data is recorded accurately and efficiently.</p>
`;

            Dialog.showInfoModal(htmlScript);
        });
    });
    initializeMethodsRecord("pestDisease");
    createDeleteModal();
    createEditModal();
    loadMonthYear();
}

// Function to initialize Damage Reports view
function initializeDamageReportsView() {
    $("#maintenance-content").html(`
    <div class="row d-flex justify-content-between align-items-center mt-5">
      <div class="col-md-4">
        <form id="recordForm" enctype="multipart/form-data">
          <input type="hidden" class="form-control" id="recordId" name="recordId">
          <input type="hidden" class="form-control" id="userId" name="userId">
          
          <div class="mb-3">
            <div class="input-group" id="monthPicker" style="width: 100%;">
              <select class="form-control" required>
                <option value="January">January</option>
                <option value="February">February</option>
                <option value="March">March</option>
                <option value="April">April</option>
                <option value="May">May</option>
                <option value="June">June</option>
                <option value="July">July</option>
                <option value="August">August</option>
                <option value="September">September</option>
                <option value="October">October</option>
                <option value="November">November</option>
                <option value="December">December</option>
              </select>
              <span class="input-group-append">
                <span class="input-group-text"><i class="fas fa-calendar-alt"></i></span>
              </span>
            </div>
          </div>
          
          <div class="mb-3">
            <div class="input-group" id="yearPicker" style="width: 100%;">
              <select id="yearSelect" class="form-control" required>
                <!-- Options will be added by jQuery -->
              </select>
              <span class="input-group-append">
                <span class="input-group-text"><i class="fas fa-calendar-alt"></i></span>
              </span>
            </div>
          </div>
          
          <div class="mb-3">
            <label id="lblUpload">Upload File:</label>
            <div class="input-group" style="width: 100%;">
              <input type="file" class="form-control" id="fileRecord" name="fileRecord" accept=".xls, .xlsx" required>
              <div class="input-group-append">
                <label class="input-group-text" for="fileRecord" id="btnUpload">
                  <i class="fas fa-upload"></i>
                </label>
              </div>
            </div>
          </div>
          
          <button type="button" class="btn btn-custom" id="submitBtn">Add Record</button>
          <button type="button" class="btn btn-custom mt-2" id="cancelBtn" style="display: none;">Cancel</button>
        </form>
      </div>
      
      <div class="col-md-8 actionBtn">
        <div class="d-flex justify-content-end align-items-center mb-2 ">
          <button id="infoBtn" class="btn btn-info" style="margin-right: 10px;">
            <i class="fas fa-info-circle"></i>
          </button>
          <button id="editBtn" class="btn btn-warning" style="margin-right: 10px;" disabled>Edit</button>
          <button id="deleteBtn" class="btn btn-danger" disabled>Delete</button>
        </div>
        
        <div class="table-responsive">
          <table id="recordTable" class="table table-custom text-center">
            <thead>
              <tr style="background-color: #2774E9; color: white;">
                <th scope="col">File Name</th>
                <th scope="col">File Size</th>
              </tr>
            </thead>
            <tbody id="recordTableBody">
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
  `);

    $(document).ready(function () {
        $("#infoBtn").click(function () {
            let htmlScript = `
<p style="margin-bottom: 15px;">To upload your damage reports successfully, please follow the instructions below using the provided template:</p>

<ol style="margin-bottom: 15px;">
  <li><strong>Download the Template:</strong><br>
  Obtain the file <a href="components/template/Damage_Report_Template.xlsx" download>Damage_Report_Template.xlsx</a>. This template will guide you in entering the necessary data.</li>

  <li><strong>Gather Your Data:</strong><br>
  Retrieve the data from your reports and prepare it for entry into the template. The data should include the following fields:</li>
  <ul style="margin-bottom: 15px;">
    <li><strong>Barangay:</strong> The local administrative division where the damage occurred.</li>
    <li><strong>Commodity:</strong> The type of crop or product that was affected by the damage.</li>
    <li><strong>Variety:</strong> The specific variety or type of the commodity that was affected.</li>
    <li><strong>Number of Farmers Affected:</strong> The total number of farmers affected by the damage.</li>
    <li><strong>Area Affected (ha) - Total:</strong> The total area affected by the damage, measured in hectares.</li>
    <li><strong>Yield Loss (%):</strong> The percentage of yield loss due to the damage.</li>
    <li><strong>Grand Total Value:</strong> The total financial value of the damage, calculated based on the yield loss and area affected.</li>
  </ul>

  <li><strong>Enter Data into the Template:</strong><br>
  Open <a href="components/template/Damage_Report_Template.xlsx" download>Damage_Report_Template.xlsx</a> and enter your data into the appropriate columns based on the definitions provided above. Ensure accuracy to avoid errors in the data upload process.</li>

  <li><strong>Save and Upload:</strong><br>
  After filling out the template, save the file with your updated data. You will then upload this file to the designated upload area or system.</li>

  <li><strong>Verify Submission:</strong><br>
  Confirm that your file was uploaded correctly and check for any validation messages or errors that may require correction.</li>
</ol>

<p style="margin-bottom: 15px;">By adhering to these instructions and utilizing the provided template, you ensure that your damage reports are recorded accurately and efficiently.</p>
`;

            Dialog.showInfoModal(htmlScript);
        });
    });
    initializeMethodsRecord("damage");
    createDeleteModal();
    createEditModal();
    loadMonthYear();
}

// Function to initialize Soil Health Records view
function initializeSoilHealthView() {
    $("#maintenance-content").html(`
    <div class="row d-flex justify-content-between align-items-center mt-5">
      <div class="col-md-4">
        <form id="recordForm" enctype="multipart/form-data">
          <input type="hidden" class="form-control" id="recordId" name="recordId">
          <input type="hidden" class="form-control" id="userId" name="userId">
          
          <div class="mb-3">
            <div class="input-group" id="monthPicker" style="width: 100%;">
              <select class="form-control" required>
                <option value="January">January</option>
                <option value="February">February</option>
                <option value="March">March</option>
                <option value="April">April</option>
                <option value="May">May</option>
                <option value="June">June</option>
                <option value="July">July</option>
                <option value="August">August</option>
                <option value="September">September</option>
                <option value="October">October</option>
                <option value="November">November</option>
                <option value="December">December</option>
              </select>
              <span class="input-group-append">
                <span class="input-group-text"><i class="fas fa-calendar-alt"></i></span>
              </span>
            </div>
          </div>
          
          <div class="mb-3">
            <div class="input-group" id="yearPicker" style="width: 100%;">
              <select id="yearSelect" class="form-control" required>
                <!-- Options will be added by jQuery -->
              </select>
              <span class="input-group-append">
                <span class="input-group-text"><i class="fas fa-calendar-alt"></i></span>
              </span>
            </div>
          </div>
          
          <div class="mb-3">
            <label id="lblUpload">Upload File:</label>
            <div class="input-group" style="width: 100%;">
              <input type="file" class="form-control" id="fileRecord" name="fileRecord" accept=".xls, .xlsx" required>
              <div class="input-group-append">
                <label class="input-group-text" for="fileRecord" id="btnUpload">
                  <i class="fas fa-upload"></i>
                </label>
              </div>
            </div>
          </div>
          
          <button type="button" class="btn btn-custom" id="submitBtn">Add Record</button>
          <button type="button" class="btn btn-custom mt-2" id="cancelBtn" style="display: none;">Cancel</button>
        </form>
      </div>
      
      <div class="col-md-8 actionBtn">
        <div class="d-flex justify-content-end align-items-center mb-2 ">
          <button id="infoBtn" class="btn btn-info" style="margin-right: 10px;">
            <i class="fas fa-info-circle"></i>
          </button>
          <button id="editBtn" class="btn btn-warning" style="margin-right: 10px;" disabled>Edit</button>
          <button id="deleteBtn" class="btn btn-danger" disabled>Delete</button>
        </div>
        
        <div class="table-responsive">
          <table id="recordTable" class="table table-custom text-center">
            <thead>
              <tr style="background-color: #2774E9; color: white;">
                <th scope="col">File Name</th>
                <th scope="col">File Size</th>
              </tr>
            </thead>
            <tbody id="recordTableBody">
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
  `);

    $(document).ready(function () {
        $("#infoBtn").click(function () {
            let htmlScript = `
<p>To upload your soil health records successfully, please follow the instructions below using the provided template:</p>

<ol>
  <li><strong>Download the Template:</strong><br>
  Obtain the file <a href="components/template/Soil_Health_Template.xlsx" download>Soil_Health_Template.xlsx</a>. This template will guide you in entering the necessary data.</li>

  <li><strong>Gather Your Data:</strong><br>
  Retrieve the soil health data from your reports and prepare it for entry into the template. The data should include the following fields:
    <ul>
      <li><strong>Barangay:</strong> The local administrative division where the soil is tested.</li>
      <li><strong>Field Type:</strong> The type of field or crop area being assessed.</li>
      <li><strong>Soil Test Results:</strong> The results of the soil tests including:
        <ul>
          <li><strong>Nitrogen (as Organic Matter):</strong> The amount of nitrogen present in the soil as organic matter.</li>
          <li><strong>Phosphorus:</strong> The amount of phosphorus present in the soil.</li>
          <li><strong>Potassium:</strong> The amount of potassium present in the soil.</li>
          <li><strong>pH:</strong> The acidity or alkalinity of the soil.</li>
        </ul>
      </li>
      <li><strong>General Fertility Rating:</strong> The overall fertility rating of the soil based on test results.</li>
      <li><strong>Recommendations:</strong> Suggested actions or amendments based on soil test results to improve soil health.</li>
    </ul>
  </li>

  <li><strong>Enter Data into the Template:</strong><br>
  Open the <a href="components/template/Soil_Health_Template.xlsx" download>Soil_Health_Template.xlsx</a> and enter your data into the appropriate columns based on the definitions provided above. Ensure accuracy to avoid errors in the data upload process.</li>

  <li><strong>Save and Upload:</strong><br>
  After filling out the template, save the file with your updated data. Upload this file to the designated upload area or system.</li>

  <li><strong>Verify Submission:</strong><br>
  Confirm that your file was uploaded correctly and check for any validation messages or errors that may require correction.</li>
</ol>

<p>By adhering to these instructions and utilizing the provided template, you ensure that your soil health data is recorded accurately and efficiently.</p>
`;

            Dialog.showInfoModal(htmlScript);
        });
    });
    initializeMethodsRecord("soilHealth");
    createDeleteModal();
    createEditModal();
    loadMonthYear();
}

export { initializeMaintenanceMenu };
