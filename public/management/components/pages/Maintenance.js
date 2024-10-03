import { initializeMaintenanceMenu } from "./MaintenanceMenu.js";
import { user } from "../HeaderSidebar.js";

export default function initDashboard() {
    $(document).ready(function () {
        // Function to initialize the maintenance view
        function initializeMaintenanceView() {
            var optionsHtml;

            if (user.role === "admin") {
                optionsHtml = `
                    <option value="crop">Crop Records</option>
                     <option value="crop_variety">Crop Variety Records</option>
                    <option value="barangay">Barangay Records</option>
                    <option value="farmer">Farmer Records</option>
                    <option value="production">Production Reports</option>
                    <option value="price">Crop Price Monitoring</option>
                    <option value="pestDisease">Pest and Disease Reports</option>
                    <option value="damage">Damage Reports</option>
                    <option value="soilHealth">Soil Health Records</option>
                `;
            } else if (user.role === "agriculturist") {
                optionsHtml = `
                    <option value="production">Production Reports</option>
                    <option value="price">Crop Price Monitoring</option>
                    <option value="pestDisease">Pest and Disease Reports</option>
                                        <option value="damage">Damage Reports</option>
                    <option value="soilHealth">Soil Health Records</option>
                `;
            }

            $("#main-content").html(`
                <div class="loader-overlay" id="loader">
                    <div class="spinner"></div>
                    <div class="progress-message text-center" id="progressMessage">Uploading 0-0/0</div>
                </div>

                <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                    <div>
                        <select id="maintenance-option" class="form-select" name="role" required>
                            ${optionsHtml}
                        </select>
                    </div>
                    <div class="input-group">
                        <div class="input-group-prepend">
                            <span class="input-group-text border-0 bg-transparent"><i class="fas fa-search"></i></span>
                        </div>
                        <input placeholder="Search name..." type="text" class="form-control rounded-pill" id="search" name="search">
                    </div>
                </div>
                <div id="maintenance-content">
                    <!-- Content for the selected maintenance option will be dynamically loaded here -->
                </div>
            `);

            // Retrieve stored values
            var fromDashboard =
                sessionStorage.getItem("fromDashboard") === "true"; // Convert back to boolean
            var optionValue = sessionStorage.getItem("optionValue");
            if (fromDashboard) {
                console.log(optionValue);
                $("#maintenance-option").val(optionValue);
                initializeMaintenanceMenu(optionValue);
                sessionStorage.removeItem("fromDashboard");
                sessionStorage.removeItem("optionValue");
            } else {
                // Initialize default maintenance option view
                var defaultOption = $("#maintenance-option").val();
                initializeMaintenanceMenu(defaultOption);
            }

            // Handle change in maintenance option select
            $("#maintenance-option").change(function () {
                var selectedOption = $(this).val();
                initializeMaintenanceMenu(selectedOption);
            });
        }

        // Initialize maintenance view when document is ready
        initializeMaintenanceView();
    });
}
