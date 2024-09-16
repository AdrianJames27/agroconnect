import { initializeDataEntriesMenu } from './DataEntriesMenu.js';
import { getProduction } from '../classes/Production.js';

export default function initDashboard() {
    $(document).ready(function() {
    // Function to initialize the data entries view
    function initializeDataEntriesView() {
        $('#main-content').html(`
        <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
            <div>
                <select id="entries-option" class="form-select" name="role" required>
                    <option value="productions">Productions</option>
                    <option value="prices">Prices</option>
                    <option value="pests">Pests</option>
                    <option value="diseases">Diseases</option>
                     <option value="damages">Damages</option>
                    <option value="soil_healths">Soil Healths</option>
                </select>
            </div>
            <div class="input-group">
                <div class="input-group-prepend">
                    <span class="input-group-text border-0 bg-transparent"><i class="fas fa-search"></i></span>
                </div>
                <input placeholder="Search query..." type="text" class="form-control rounded-pill" id="search" name="search">
            </div>
        </div>
        <div id="entries-content">
            <!-- Content for the selected entries option will be dynamically loaded here -->
        </div>
    `);
        // Handle change in entries option select
        $('#entries-option').change(function() {
            var selectedOption = $(this).val();
            initializeDataEntriesMenu(selectedOption);
        });

        // Initialize default maintenance option view
        var defaultOption = $('#entries-option').val();
        initializeDataEntriesMenu(defaultOption);
    }

    initializeDataEntriesView();
    });
}