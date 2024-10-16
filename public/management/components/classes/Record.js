import { processDiseaseData } from "../classes/Disease.js";
import { processPestData } from "../classes/Pest.js";
import { processPriceData } from "../classes/Price.js";
import { processProductionData } from "../classes/Production.js";
import { processDamageData } from "../classes/Damage.js";
import { processSoilHealthData } from "../classes/SoilHealth.js";
import Dialog from "../helpers/Dialog.js";
import { user } from "../HeaderSidebar.js";

// Record.js
let records = [];

class Record {
    constructor(
        recordId,
        userId,
        name,
        season,
        monthYear,
        type,
        fileRecord = ""
    ) {
        this.recordId = recordId;
        this.userId = userId;
        this.name = name;
        this.season = season;
        this.type = type;
        this.monthYear = monthYear;
        this.fileRecord = fileRecord;
    }

    async createRecord(record) {
        const existingRecord = records.find(
            (b) => b.monthYear === record.monthYear && b.type === record.type
        );
        if (existingRecord) {
            alert("Record with the same type already exists");
            return;
        }

        try {
            const response = await fetch("/api/records", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(record),
            });

            console.log("Response Status:", response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.log("Full Response:", errorText);
                throw new Error("Failed to create record");
            }

            const data = await response.json();
            console.log("Success:", data);
            return data.recordId;
        } catch (error) {
            console.error("Error:", error);
            return null;
        }
    }

    async updateRecord(updatedRecord) {
        const existingRecord = records.find(
            (b) =>
                b.monthYear === updatedRecord.monthYear &&
                b.type !== updatedRecord.type
        );
        if (existingRecord) {
            alert("Record with the same type already exists");
            return;
        }

        records = records.map((record) =>
            record.recordId === updatedRecord.recordId
                ? { ...record, ...updatedRecord }
                : record
        );

        try {
            const response = await fetch(
                `/api/records/${updatedRecord.recordId}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(updatedRecord),
                }
            );

            if (!response.ok) {
                throw new Error("Failed to update record");
            }

            const data = await response.json();
            console.log("Success:", data);
            return data.recordId;
        } catch (error) {
            console.error("Error:", error);
            return null;
        }
    }

    removeRecord(recordId) {
        fetch(`/api/records/${recordId}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then((response) => {
                if (response.status === 204) {
                    records = records.filter(
                        (record) => record.recordId !== record
                    );
                    console.log(`Record with ID ${recordId} deleted.`);
                } else if (response.status === 404) {
                    console.error(`Record with ID ${recordId} not found.`);
                } else {
                    console.error(
                        `Failed to delete record with ID ${recordId}.`
                    );
                }
            })
            .catch((error) => {
                console.error("Error:", error);
            });
    }
}

let links = "";

function getRecord(dataType) {
    // Fetch records from Laravel backend
    $.ajaxSetup({
        headers: {
            "X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr("content"),
        },
    });

    function getFormattedBase64FileSize(base64String) {
        // Function to calculate the file size of a base64 string
        function getBase64FileSize(base64String) {
            let padding = 0;
            if (base64String.endsWith("==")) padding = 2;
            else if (base64String.endsWith("=")) padding = 1;

            let base64StringLength = base64String.length;
            return (base64StringLength * 3) / 4 - padding;
        }

        // Function to format the file size
        function formatFileSize(size) {
            const units = ["B", "KB", "MB", "GB", "TB"];
            let unitIndex = 0;
            let formattedSize = size;

            while (formattedSize >= 1024 && unitIndex < units.length - 1) {
                formattedSize /= 1024;
                unitIndex++;
            }

            return `${formattedSize.toFixed(2)} ${units[unitIndex]}`;
        }

        const fileSize = getBase64FileSize(base64String);
        return formatFileSize(fileSize);
    }

    $.ajax({
        url: `/api/records/${dataType}`, // Endpoint to fetch records
        method: "GET",
        xhrFields: {
            withCredentials: true, // Ensure cookies are sent with the request
        },
        success: async function (response) {
            console.log("Response:", response);

            if (Array.isArray(response) && response.length > 0) {
                const recordsArray = response; // Store the array of records in recordsArray
                records = [];

                // Example: Accessing and logging properties of each record
                recordsArray.forEach((record) => {
                    // Calculate and log the file size of the base64-encoded fileRecord
                    let fileSize = getFormattedBase64FileSize(
                        record.fileRecord
                    );
                    record.fileSize = fileSize;

                    // Convert the base64-encoded fileRecord to a downloadable link
                    const base64String = record.fileRecord;
                    const mimeType =
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"; // MIME type for Excel files
                    const link = `data:${mimeType};base64,${base64String}`;

                    // Create a button with the download link
                    const button = `<button class="btn btn-sm btn-green" onclick="confirmDownload('${link}', '${record.name}.xlsx')">Download</button>`;

                    record.downloadButton = button;
                    record.nameString = record.name; // Add name as a normal string

                    records.push(record);
                });

                // Optionally, update the UI with the new records
                // Example: $('#recordsTable').html(generateTableHtml(records));
            } else {
                console.log(
                    "Expected an array of records, but received:",
                    response
                );
                records = [];
                console.log("Response:", records);
            }
        },
        error: function (xhr, status, error) {
            console.error("Error fetching records:", error);
        },
    });
}

window.confirmDownload = async function (link, filename) {
    const res = await Dialog.confirmDialog(
        "Download File",
        "Are you sure you want to download this file?"
    );
    if (res.operation === Dialog.OK_OPTION) {
        const a = document.createElement("a");
        a.href = link;
        a.download = filename;
        a.click();
    }
};

function searchRecord(recordName) {
    const foundRecords = records.filter((record) =>
        record.recordName.includes(recordName)
    );
    return foundRecords;
}

function initializeMethodsRecord(dataType) {
    getRecord(dataType);

    var selectedRow = null;
    var pageSize = 5;
    var currentPage = 1;
    var record = null;
    var isEdit = false;

    async function displayRecords(recordName = null) {
        // Simulate a delay of 1 second
        await new Promise((resolve) => setTimeout(resolve, 1000));

        $("#recordTableBody").empty();
        const userId = user ? user.userId : null;
        const userRole = user ? user.role : "admin";
        var startIndex = (currentPage - 1) * pageSize;
        var endIndex = startIndex + pageSize;

        // Filter records based on user role
        const filteredRecords =
            userRole === "admin"
                ? records
                : records.filter((record) => record.userId === userId);

        if (recordName) {
            // Display a single record if recordName is provided
            const foundRecords = searchRecord(recordName).filter((record) =>
                filteredRecords.some((fr) => fr.recordId === record.recordId)
            );
            if (foundRecords.length > 0) {
                foundRecords.forEach((record) => {
                    $("#recordTableBody").append(`
                      <tr data-index=${record.recordId}>
                          <td style="display: none;">${record.recordId}</td>
                          <td>${record.fileSize}</td>
                          <td>${record.nameString}</td>
                          <td>${record.downloadButton}</td>
                      </tr>
                  `);
                });
            } else {
                // Handle case where recordName is not provided
                $("#recordTableBody").append(`
                  <tr>
                      <td colspan="4">Record not found!</td>
                  </tr>
              `);
            }
        } else {
            // Display paginated records if no recordName is provided
            for (var i = startIndex; i < endIndex; i++) {
                if (i >= filteredRecords.length) {
                    break;
                }
                var record = filteredRecords[i];
                $("#recordTableBody").append(`
                  <tr data-index=${record.recordId}>
                      <td style="display: none;">${record.recordId}</td>
                      <td>${record.nameString}</td>
                      <td>
                        ${record.fileSize} 
                        <span style="margin-left: 1em;">${record.downloadButton}</span>
                      </td>
                  </tr>
              `);
            }
        }
    }

    // Display initial records
    displayRecords();

    $("#search").on("input", function () {
        let recordName = $("#search").val();
        displayRecords(recordName);
    });

    // Pagination: Previous button click handler
    $("#prevBtn").click(function () {
        if (currentPage > 1) {
            currentPage--;
            displayRecords();
        }
    });

    // Pagination: Next button click handler
    $("#nextBtn").click(function () {
        var totalPages = Math.ceil(records.length / pageSize);
        if (currentPage < totalPages) {
            currentPage++;
            displayRecords();
        }
    });

    function getSeason(month) {
        console.log(month);
        month = month.toLowerCase();

        // Define the dry and wet seasons
        const drySeason = ["march", "april", "may", "june", "july", "august"];
        const wetSeason = [
            "september",
            "october",
            "november",
            "december",
            "january",
            "february",
        ];

        // Determine the season based on the month
        if (drySeason.includes(month)) {
            return "Dry";
        } else if (wetSeason.includes(month)) {
            return "Wet";
        } else {
            return "Invalid month";
        }
    }

    function updateMonthYear(dataType, requestData) {
        let urls = [];

        switch (dataType) {
            case "production":
                urls = ["/api/productions/update-month-year"];
                break;
            case "price":
                urls = ["/api/prices/update-month-year"];
                break;
            case "pestDisease":
                urls = [
                    "/api/pests/update-month-year",
                    "/api/diseases/update-month-year",
                ];
                break;
            case "soilHealth":
                urls = ["/api/soilhealths/update-month-year"];
                break;
            case "damage":
                urls = ["/api/damages/update-month-year"];
                break;
            default:
                console.error("Unsupported data type");
                return;
        }

        if (urls.length === 0) {
            console.error("No URLs found for the data type");
            return;
        }

        urls.forEach(function (url) {
            $.ajax({
                url: url,
                type: "POST",
                contentType: "application/json",
                data: JSON.stringify(requestData),
                success: function (response) {
                    console.log("Success:", response);
                },
                error: function (xhr) {
                    console.error("Error:", xhr.responseText);
                },
            });
        });
    }

    $("#submitBtn").click(async function (event) {
        event.preventDefault();
        var recordId = Number($("#recordId").val());
        var userId = user.userId;
        var month = $("#monthPicker select").val(); // input is inside #monthPicker
        var year = $("#yearPicker select").val(); // input is inside #yearPicker
        var season = getSeason(month);
        var type = dataType;
        var monthYear = `${month} ${year}`;
        var name = `${dataType
            .replace(/([a-z])([A-Z])/g, "$1 $2")
            .replace(/^./, (str) => str.toUpperCase())} ${monthYear}`;

        var fileInput = document.getElementById("fileRecord");
        var file = fileInput.files[0];
        let terms = getSearchTerms(dataType);

        try {
            if (file) {
                // Validate the search terms asynchronously
                let isValid = await validateSearchTerms(
                    file,
                    terms[0],
                    terms[4]
                );

                if (!isValid) {
                    toastr.success("Invalid File Format!", "Invalid", {
                        timeOut: 5000, // 5 seconds
                        positionClass: "toast-top-center",
                        toastClass: "toast-warning",
                    });
                    return;
                }

                const arrayBuffer = await file.arrayBuffer();
                const blob = new Blob([arrayBuffer], { type: file.type });

                // Convert Blob to base64 string
                const readerBase64 = new FileReader();
                readerBase64.onload = function (e) {
                    const fileRecord = e.target.result.split(",")[1]; // Extract base64 string

                    // Prepare the record object
                    let record = new Record(
                        recordId,
                        userId,
                        name,
                        season,
                        monthYear,
                        type,
                        fileRecord
                    );

                    // Create or update record based on the selectedRow
                    let recordPromise =
                        selectedRow !== null && isEdit
                            ? record.updateRecord(record)
                            : record.createRecord(record);

                    recordPromise
                        .then((id) => {
                            if (id === undefined) {
                                console.warn(
                                    "Record ID is undefined. Skipping further processing."
                                );
                                return; // Exit the then block
                            }
                            processDataBasedOnType(
                                dataType,
                                terms[0],
                                terms[1],
                                terms[2],
                                terms[3],
                                file,
                                id,
                                season,
                                monthYear
                            );
                            // Reset form and update UI
                            $("#lblUpload").text("Upload File:");
                            $("#submitBtn").text("Add record");
                            $("#cancelBtn").hide();
                            $("#fileRecord").attr("required", "required");
                            $("#recordForm")[0].reset();
                            getRecord(dataType);
                            displayRecords();
                            resetFields();
                            selectedRow = null;
                        })
                        .catch((error) => {
                            console.error(
                                "Error creating/updating record:",
                                error
                            );
                            toastr.error("Something went wrong.", "Error", {
                                timeOut: 5000, // 5 seconds
                                positionClass: "toast-center-center",
                                toastClass: "toast-error", // Custom error color
                            });
                        });
                };

                readerBase64.readAsDataURL(blob);
            } else {
                if (selectedRow !== null && isEdit) {
                    let record = new Record(
                        recordId,
                        userId,
                        name,
                        season,
                        monthYear,
                        type,
                        ""
                    );
                    record
                        .updateRecord(record)
                        .then(() => {
                            // Reset form and update UI
                            $("#lblUpload").text("Upload File:");
                            $("#submitBtn").text("Add record");
                            $("#cancelBtn").hide();
                            $("#recordForm")[0].reset();
                            $("#fileRecord").attr("required", "required");
                            getRecord(dataType);
                            const requestData = {
                                recordId: recordId,
                                monthYear: monthYear,
                            };
                            updateMonthYear(dataType, requestData);
                            displayRecords();
                            resetFields();
                            isEdit = false;
                            selectedRow = null;
                        })
                        .catch((error) => {
                            console.error("Error updating record:", error);
                            toastr.error("Something went wrong.", "Error", {
                                timeOut: 5000, // 5 seconds
                                positionClass: "toast-center-center",
                                toastClass: "toast-error", // Custom error color
                            });
                        });
                } else {
                    toastr.success("Please select a file first!", "Alert", {
                        timeOut: 5000, // 5 seconds
                        positionClass: "toast-top-center",
                        toastClass: "toast-info",
                    });
                }
            }
        } catch (error) {
            console.error("Error during file validation:", error);
            toastr.error("Something went wrong.", "Error", {
                timeOut: 5000, // 5 seconds
                positionClass: "toast-center-center",
                toastClass: "toast-error", // Custom error color
            });
        }
    });

    function getSearchTerms(dataType) {
        let terms;
        let terms2;
        let checkFormat;
        let methodName;
        let methodName2;
        switch (dataType) {
            case "production":
                checkFormat = "PRODUCTION MONITORING REPORT";
                terms = [
                    "Barangay",
                    "Commodity",
                    "Variety",
                    "Area Planted",
                    "Month Planted",
                    "Month Harvested",
                    "Volume of Production",
                    "Cost of Production",
                    "Farm Gate Price",
                    "Volume Sold",
                ];
                methodName = processProductionData;
                break;
            case "price":
                checkFormat = "PRICE MONITORING REPORT";
                terms = ["Commodity", "Farm Gate Price"];
                methodName = processPriceData;
                break;
            case "pestDisease":
                checkFormat = "PEST AND DISEASE MONITORING REPORT";
                terms = [
                    "Farm Location",
                    "Crops Planted",
                    "Pest Observed",
                    "Total no. of Trees/Plants Planted",
                    "Total no. of Trees/Plants Affected/Damaged",
                ];
                terms2 = [
                    "Farm Location",
                    "Crops Planted",
                    "Disease Observed",
                    "Total no. of Trees/Plants Planted",
                    "Total no. of Trees/Plants Affected/Damaged",
                ];
                methodName = processPestData;
                methodName2 = processDiseaseData;
                break;
            case "soilHealth":
                checkFormat = "SOIL HEALTH MONITORING REPORT";
                terms = [
                    "Barangay",
                    "Farmer",
                    "Field Type",
                    "Nitrogen",
                    "Phosphorus",
                    "Potassium",
                    "pH",
                    "General Fertility",
                    "Recommendations",
                ];
                methodName = processSoilHealthData;
                break;
            case "damage":
                checkFormat = "DAMAGE MONITORING REPORT";
                terms = [
                    "Barangay",
                    "Commodity",
                    "Variety",
                    "Number of Farmers Affected",
                    "Total Area affected",
                    "Yield Loss",
                    "Grand Total Value",
                ];
                methodName = processDamageData;
                break;
            default:
                console.error("Unknown data type");
        }

        return [terms, terms2, methodName, methodName2, checkFormat];
    }

    function validateSearchTerms(file, searchTerms, checkFormat) {
        searchTerms.push(checkFormat);
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = function (event) {
                try {
                    const data = event.target.result;
                    const workbook = XLSX.read(new Uint8Array(data), {
                        type: "array",
                    });

                    // Normalize the search terms
                    const normalizedSearchTerms =
                        searchTerms.map(normalizeString);

                    // Create a Set to keep track of found search terms
                    const foundTerms = new Set();

                    // Iterate through each sheet in the workbook
                    for (let sheetName of workbook.SheetNames) {
                        const worksheet = workbook.Sheets[sheetName];
                        const range = XLSX.utils.decode_range(
                            worksheet["!ref"]
                        );

                        // Iterate through each row in the sheet
                        for (
                            let rowNum = range.s.r;
                            rowNum <= range.e.r;
                            rowNum++
                        ) {
                            // Iterate through each cell in the row
                            for (
                                let colNum = range.s.c;
                                colNum <= range.e.c;
                                colNum++
                            ) {
                                const cellAddress = XLSX.utils.encode_cell({
                                    r: rowNum,
                                    c: colNum,
                                });
                                const cell = worksheet[cellAddress];

                                if (cell && cell.v) {
                                    const cellValue = cell.v;
                                    if (
                                        cellMatchesSearchTerms(
                                            cellValue,
                                            normalizedSearchTerms
                                        )
                                    ) {
                                        normalizedSearchTerms.forEach(
                                            (term) => {
                                                if (
                                                    cellMatchesSearchTerms(
                                                        cellValue,
                                                        [term]
                                                    )
                                                ) {
                                                    foundTerms.add(term);
                                                }
                                            }
                                        );
                                    }
                                }
                            }
                        }
                    }

                    console.log(foundTerms);
                    // Check if all search terms are found
                    const allTermsFound = normalizedSearchTerms.every((term) =>
                        foundTerms.has(term)
                    );
                    resolve(allTermsFound);
                } catch (error) {
                    reject(error);
                }
            };

            reader.onerror = function (event) {
                reject(event.target.error);
            };

            reader.readAsArrayBuffer(file);
        });
    }

    function processDataBasedOnType(
        dataType,
        searchTerms,
        searchTerms2,
        methodName,
        methodName2,
        file,
        id,
        season,
        monthYear
    ) {
        const reader = new FileReader();
        reader.onload = function (event) {
            const data = event.target.result;
            const workbook = XLSX.read(data, { type: "binary" });
            if (dataType === "pestDisease") {
                extractData(
                    workbook,
                    searchTerms,
                    methodName,
                    id,
                    season,
                    monthYear
                );
                extractData(
                    workbook,
                    searchTerms2,
                    methodName2,
                    id,
                    season,
                    monthYear
                );
            } else {
                extractData(
                    workbook,
                    searchTerms,
                    methodName,
                    id,
                    season,
                    monthYear
                );
            }
        };
        reader.readAsBinaryString(file);
    }

    // Normalize search term: remove whitespace and convert to lowercase
    function normalizeString(str) {
        if (typeof str !== "string") {
            str = String(str);
        }
        return str.toLowerCase();
    }

    // Check if a cell matches any search term (case insensitive and whole word match)
    function cellMatchesSearchTerms(cellValue, searchTerms) {
        const normalizedCellValue = normalizeString(cellValue);
        return searchTerms.some((term) => {
            const normalizedTerm = normalizeString(term);
            // Create a regex to match whole words only
            const regex = new RegExp(`\\b${normalizedTerm}\\b`, "i");
            return regex.test(normalizedCellValue);
        });
    }

    // Extract data from the workbook and search for terms
    function extractData(
        workbook,
        searchTerms,
        processFunction,
        id,
        season,
        monthYear
    ) {
        // Normalize the search terms
        let headers = {};
        const normalizedSearchTerms = searchTerms.map(normalizeString);

        // Iterate through each sheet in the workbook
        workbook.SheetNames.forEach((sheetName) => {
            const worksheet = workbook.Sheets[sheetName];
            const range = XLSX.utils.decode_range(worksheet["!ref"]);

            // Iterate through each row in the sheet
            for (let rowNum = range.s.r + 1; rowNum <= range.e.r; rowNum++) {
                // Iterate through each cell in the row
                for (let colNum = range.s.c; colNum <= range.e.c; colNum++) {
                    const cellAddress = XLSX.utils.encode_cell({
                        r: rowNum,
                        c: colNum,
                    });
                    const cell = worksheet[cellAddress];

                    if (
                        cell &&
                        cell.v &&
                        cellMatchesSearchTerms(cell.v, normalizedSearchTerms)
                    ) {
                        // Pass additional data to display function
                        headers[cell.v] = cellAddress;
                    }
                }
            }
        });

        // Call the specific process function based on the data type
        const rowsArray = processFunction(
            workbook,
            headers,
            id,
            season,
            monthYear
        );
    }

    function resetFields() {
        // Reset UI states
        $("#editBtn").prop("disabled", true);
        $("#deleteBtn").prop("disabled", true);
        selectedRow = null;
        $("#recordTableBody tr").removeClass("selected-row");
    }

    $("#editBtn").click(async function () {
        // Open the confirmation dialog
        const result = await Dialog.confirmDialog(
            "Confirm Edit",
            "Are you sure you want to edit this record?"
        );

        // Check if the user clicked OK
        if (result.operation === 1) {
            // Proceed with the edit
            $("#dataEdit").text("record");
            $("#cancelBtn").show();
            $("#recordId").val(record.recordId);
            isEdit = true;
            // Assuming record.monthYear is like 'July 2024'
            var monthYear = record.monthYear;

            // Split the monthYear into month and year
            var parts = monthYear.split(" ");
            var month = parts[0]; // 'July'
            var year = parts[1]; // '2024'

            // Set the values in the input fields
            $("#monthPicker select").val(month);
            $("#yearPicker select").val(year);
            $("#fileRecord").removeAttr("required");
            $("#lblUpload").text("Insert New File (optional):");
            $("#submitBtn").text("Update Record");
        } else {
            // If Cancel is clicked, do nothing or add additional handling if needed
            console.log("Edit action was canceled.");
        }
        $("#recordTableBody tr").removeClass("selected-row");
        $("#editBtn").prop("disabled", true);
        $("#deleteBtn").prop("disabled", true);
    });

    $("#cancelEdit").click(function () {
        resetFields();
    });

    // Cancel button click handler
    $("#cancelBtn").click(function () {
        selectedRow = null;
        $("#lblUpload").text("Upload File:");
        $("#submitBtn").text("Add Record");
        $("#fileRecord").attr("required", "required");
        $("#cancelBtn").hide();
        $("#recordTableBody tr").removeClass("selected-row");
        $("#editBtn").prop("disabled", true);
        $("#deleteBtn").prop("disabled", true);
    });
    $("#deleteBtn").click(async function () {
        // Open the confirmation dialog
        const result = await Dialog.confirmDialog(
            "Confirm Deletion",
            "Are you sure you want to delete this record?"
        );

        // Check if the user clicked OK
        if (result.operation === 1) {
            // Proceed with deletion
            let recordToDelete = new Record();
            recordToDelete.removeRecord(record.recordId);
            getRecord(dataType);
            displayRecords();
            resetFields();
        } else {
            // If Cancel is clicked, do nothing or add additional handling if needed
            console.log("Delete action was canceled.");
            $("#editBtn").prop("disabled", true);
            $("#deleteBtn").prop("disabled", true);
        }
    });

    $("#cancelDelete").click(function () {
        resetFields();
    });

    // Row click handler (for selecting rows)
    $("#recordTableBody").on("click", "tr", function () {
        var $this = $(this);
        var recordId = $this.data("index");
        record = records.find((u) => u.recordId === recordId);
        selectedRow = recordId;
        // Highlight selected row
        if (selectedRow !== null) {
            $("#recordTableBody tr").removeClass("selected-row");
            $("#recordTableBody tr")
                .filter(function () {
                    return (
                        parseInt($(this).find("td:eq(0)").text(), 10) ===
                        selectedRow
                    );
                })
                .addClass("selected-row");
            $("#editBtn").prop("disabled", false);
            $("#deleteBtn").prop("disabled", false);
        } else {
            $("#recordTableBody tr").removeClass("selected-row");
        }
    });
}

export { Record, getRecord, searchRecord, records, initializeMethodsRecord };
