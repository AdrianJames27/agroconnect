import Dialog from "../helpers/Dialog.js";
import { addDownload, getYearRange } from "../../../js/fetch.js";
let riceProductions = [];

class RiceProduction {
    constructor(
        recordId,
        barangay,
        cropName,
        areaPlanted,
        monthHarvested,
        volumeProduction,
        averageYield,
        season,
        year
    ) {
        this.recordId = recordId;
        this.barangay = barangay;
        this.cropName = cropName;
        this.areaPlanted = areaPlanted;
        this.monthHarvested = monthHarvested;
        this.volumeProduction = volumeProduction;
        this.averageYield = averageYield;
        this.season = season;
        this.year = year;
    }

    async addRiceProduction(riceProductions) {
        console.log(riceProductions);
        function chunkArray(array, size) {
            const result = [];
            for (let i = 0; i < array.length; i += size) {
                result.push(array.slice(i, i + size));
            }
            return result;
        }
        const batchSize = 20; // Size of each batch
        const totalRows = riceProductions.length;
        const riceProductionBatches = chunkArray(riceProductions, batchSize);

        let processedRows = 0; // Keep track of the number of processed rows

        // Function to update progress message
        const updateProgressMessage = (start, end) => {
            $("#progressMessage").text(
                `Uploading ${start}-${end}/${totalRows}`
            );
        };

        // Show the loader and disable user interaction
        $("#loader").show();
        $("body").addClass("no-scroll"); // Optional: Add a class to disable scrolling

        for (const [index, batch] of riceProductionBatches.entries()) {
            const start = processedRows + 1;
            const end = start + batch.length - 1;
            updateProgressMessage(start, end);

            try {
                await $.ajax({
                    url: "/api/riceProductions-batch",
                    method: "POST",
                    data: {
                        riceProductionData: batch,
                        _token: $('meta[name="csrf-token"]').attr("content"),
                    },
                });
                console.log(`Batch ${index + 1} sent successfully:`, batch);
                processedRows += batch.length;
            } catch (xhr) {
                console.error(
                    `Error sending batch ${index + 1}:`,
                    xhr.responseText
                );
                // Optionally handle the error or retry
            }
        }

        // Hide the loader and re-enable user interaction
        $("#loader").hide();
        $("body").removeClass("no-scroll"); // Remove the class to re-enable scrolling
        toastr.success("File uploaded successfully!", "Success", {
            timeOut: 5000, // 5 seconds
            positionClass: "toast-top-center",
            toastClass: "toast-success-custom",
        });

        getRiceProduction();
    }

    updateRiceProduction(updatedRiceProduction) {
        const existingRiceProduction = riceProductions.find(
            (u) => u.riceProductionId === updatedRiceProduction.riceProductionId
        );

        if (
            existingRiceProduction &&
            existingRiceProduction.riceProductionId !==
                updatedRiceProduction.riceProductionId
        ) {
            alert("riceProduction ID already exists");
            return;
        }

        riceProductions = riceProductions.map((riceProduction) =>
            riceProduction.recordId === updatedRiceProduction.recordId
                ? { ...riceProduction, ...updatedRiceProduction }
                : riceProduction
        );

        fetch(
            `/api/riceProductions/${updatedRiceProduction.riceProductionId}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(updatedRiceProduction),
            }
        )
            .then((response) => response.json())
            .then((data) => {
                console.log("Success:", data);
            })
            .catch((error) => {
                console.error("Error:", error);
            });
        getRiceProduction();
    }

    removeRiceProduction(riceProductions) {
        $.ajax({
            url: "/api/riceProductionsByRecords",
            method: "DELETE",
            data: {
                riceProductionData: riceProductions, // Custom key for data
                _token: $('meta[name="csrf-token"]').attr("content"),
            },
            success: function (response) {
                console.log(response);
            },
            error: function (xhr) {
                console.error(xhr.responseText);
            },
        });
        getRiceProduction();
    }
}

async function getRiceProduction() {
    // Fetch riceProductions from Laravel backend
    $.ajaxSetup({
        headers: {
            "X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr("content"),
        },
    });

    // Return a promise
    return new Promise((resolve, reject) => {
        $.ajax({
            url: "/api/riceProductions",
            method: "GET",
            success: function (response) {
                // Assuming response is an array of riceProductions [{...fields...}, ...]
                riceProductions = response; // Store the riceProductions globally or return them
                console.log("ajax get riceProduction");
                console.log(riceProductions);
                resolve(riceProductions); // Resolve the promise with the riceProductions
            },
            error: function (xhr, status, error) {
                console.error("Error fetching riceProductions:", error);
                reject(error); // Reject the promise on error
            },
        });
    });
}

function initializeMethodsRiceProduction() {
    function searchRiceProduction(searchTerm) {
        const lowerCaseSearchTerm = searchTerm.toLowerCase(); // Convert search term to lowercase for case-insensitive search
        const foundRiceProductions = riceProductions.filter(
            (riceProduction) => {
                return Object.values(riceProduction).some((value) =>
                    value.toString().toLowerCase().includes(lowerCaseSearchTerm)
                );
            }
        );
        return foundRiceProductions;
    }

    var pageSize = 5;
    var currentPage = 1;

    async function displayRiceProduction(searchTerm = null) {
        // Simulate a delay of 1 second
        await new Promise((resolve) => setTimeout(resolve, 1000));

        $("#riceProductionTableBody").empty();

        console.log(riceProductions);

        var startIndex = (currentPage - 1) * pageSize;
        var endIndex = startIndex + pageSize;

        const foundRiceProductions = searchTerm
            ? searchRiceProduction(searchTerm)
            : riceProductions;

        if (foundRiceProductions.length > 0) {
            for (var i = startIndex; i < endIndex; i++) {
                if (i >= foundRiceProductions.length) {
                    break;
                }
                var riceProduction = foundRiceProductions[i];
                $("#riceProductionTableBody").append(`
                    <tr data-index=${riceProduction.riceProductionId}>
                        <td>${riceProduction.barangay}</td>
                        <td>${riceProduction.cropName}</td>
                        <td>${riceProduction.areaPlanted}</td>
                        <td>${riceProduction.monthHarvested}</td>
                        <td>${riceProduction.volumeProduction.toFixed(2)}</td>
                        <td>₱${riceProduction.averageYield.toFixed(2)}</td>
                        <td>${riceProduction.season}</td>
                        <td>${riceProduction.year}</td>
                    </tr>
        `);
            }
        } else {
            $("#riceProductionTableBody").append(`
        <tr>
          <td colspan="12">No results found!</td>
        </tr>
      `);
        }

        // Reinitialize tablesorter after adding rows
        $("#riceProductionTable").trigger("update");
    }

    $("#search").on("input", function () {
        let searchTerm = $("#search").val();
        displayRiceProduction(searchTerm);
    });

    // Pagination: Previous button click handler
    $("#prevBtn").click(function () {
        if (currentPage > 1) {
            currentPage--;
            displayRiceProduction($("#search").val());
        }
    });

    // Pagination: Next button click handler
    $("#nextBtn").click(function () {
        var totalPages = Math.ceil(
            searchRiceProduction($("#search").val()).length / pageSize
        );
        if (currentPage < totalPages) {
            currentPage++;
            displayRiceProduction($("#search").val());
        }
    });

    $(document).ready(function () {
        $(".download-btn").click(function () {
            // Call the downloadDialog method and handle the promise
            Dialog.downloadDialog()
                .then((format) => {
                    console.log(format);
                    download(format, riceProductions);
                })
                .catch((error) => {
                    console.error("Error:", error); // Handle any errors that occur
                });
        });
    });

    let yearRange = "";

    // Fetch year range once and store it
    async function initializeYearRange() {
        yearRange = await getYearRange();
    }

    // Call this function when your app or page loads
    initializeYearRange();

    // Modified download function that uses the stored yearRange
    function download(format, data) {
        // Construct the filename using the stored yearRange
        const filename = `riceProduction Data ${yearRange}`;

        // Call the appropriate download function based on the format
        if (format === "csv") {
            downloadCSV(filename, data);
        } else if (format === "xlsx") {
            downloadExcel(filename, data);
        } else if (format === "pdf") {
            downloadPDF(filename, data);
        }
    }

    function formatHeader(key) {
        return key
            .replace(/([a-z])([A-Z])/g, "$1 $2")
            .replace(/_/g, " ")
            .replace(/\b\w/g, (char) => char.toUpperCase());
    }

    function escapeCSVValue(value) {
        if (
            typeof value === "string" &&
            (value.includes(",") || value.includes("\n") || value.includes('"'))
        ) {
            value = '"' + value.replace(/"/g, '""') + '"';
        }
        return value; // Return escaped value
    }

    function downloadCSV(filename, data) {
        // Define the header mapping for riceProduction data
        const headerMap = {
            barangay: "Barangay",
            cropName: "Commodity",
            areaPlanted: "Area Planted (ha)",
            monthHarvested: "Month Harvested",
            volumeProduction: "Volume of Production (ha)",
            averageYield: "Average Yield (ha)",
            season: "Season",
            year: "Year",
        };

        // Define the order of headers
        const headersToInclude = [
            "barangay",
            "cropName",
            "areaPlanted",
            "monthHarvested",
            "volumeProduction",
            "averageYield",
            "season",
            "year",
        ];

        // Map headers to the desired names
        const headers = headersToInclude.map((key) => headerMap[key]);

        // Helper function to escape CSV values
        function escapeCSVValue(value) {
            if (value === undefined || value === null) return "";
            if (
                typeof value === "string" &&
                (value.includes(",") ||
                    value.includes('"') ||
                    value.includes("\n"))
            ) {
                value = `"${value.replace(/"/g, '""')}"`;
            }
            return value;
        }

        // Filter data to match the new headers and format values
        const csvRows = [
            headers.join(","),
            ...data.map((row) =>
                headersToInclude
                    .map((key) => {
                        let value = row[key] !== undefined ? row[key] : ""; // Ensure non-null values

                        return escapeCSVValue(value);
                    })
                    .join(",")
            ),
        ].join("\n");

        // Create a Blob and trigger download
        const blob = new Blob([csvRows], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        // Optional: Log download action
        addDownload(filename, "CSV");
    }

    function downloadExcel(filename, data) {
        // Define the header mapping for riceProduction data
        const headerMap = {
            barangay: "Barangay",
            cropName: "Commodity",
            areaPlanted: "Area Planted (ha)",
            monthHarvested: "Month Harvested",
            volumeProduction: "Volume of Production (ha)",
            averageYield: "Average Yield (ha)",
            season: "Season",
            year: "Year",
        };

        // Define the order of headers
        const headersToInclude = [
            "barangay",
            "cropName",
            "areaPlanted",
            "monthHarvested",
            "volumericeProduction",
            "averageYield",
            "season",
            "year",
        ];

        // Map headers to the desired names
        const mappedHeaders = headersToInclude.map((key) => headerMap[key]);

        // Filter data to match the new headers
        const filteredData = data.map((row) => {
            const filteredRow = {};
            headersToInclude.forEach((key) => {
                filteredRow[headerMap[key]] = row[key];
            });
            return filteredRow;
        });

        // Create a new workbook and add a worksheet
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet(filename);

        // Add filtered data to the worksheet
        worksheet.addRow(mappedHeaders);
        filteredData.forEach((row) => {
            worksheet.addRow(
                headersToInclude.map((header) => {
                    const value = row[headerMap[header]];
                    // Format specific columns with peso sign
                    return value;
                })
            );
        });

        // Define header and data style
        const headerStyle = {
            font: {
                name: "Calibri",
                size: 12,
                bold: true,
                color: { argb: "FFFFFFFF" }, // White color
            },
            fill: {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "203764" },
            },
            alignment: { horizontal: "center", vertical: "middle" },
            border: {
                top: { style: "thin", color: { argb: "FF000000" } }, // Black border
                right: { style: "thin", color: { argb: "FF000000" } },
                bottom: { style: "thin", color: { argb: "FF000000" } },
                left: { style: "thin", color: { argb: "FF000000" } },
            },
        };

        const dataStyle = {
            font: {
                name: "Calibri",
                size: 11,
            },
            alignment: {
                horizontal: "center",
                vertical: "middle",
                wrapText: true,
            },
            border: {
                top: { style: "thin", color: { argb: "FF000000" } }, // Black border
                right: { style: "thin", color: { argb: "FF000000" } },
                bottom: { style: "thin", color: { argb: "FF000000" } },
                left: { style: "thin", color: { argb: "FF000000" } },
            },
        };

        // Apply style to header row
        const headerRow = worksheet.getRow(1);
        headerRow.eachCell({ includeEmpty: true }, (cell) => {
            cell.style = headerStyle;
        });
        headerRow.height = 20; // Set header row height

        // Apply style to data rows
        worksheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
            if (rowNumber > 1) {
                // Skip header row
                row.eachCell({ includeEmpty: true }, (cell) => {
                    cell.style = dataStyle;
                });
            }
        });

        // Set column widths with padding to prevent overflow
        worksheet.columns = mappedHeaders.map((header) => ({
            width: Math.max(header.length, 10) + 5, // Ensure minimum width
        }));

        // Write workbook to browser
        workbook.xlsx.writeBuffer().then(function (buffer) {
            const blob = new Blob([buffer], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = filename;
            a.click();
            URL.revokeObjectURL(url);
        });
        addDownload(filename, "XLSX");
    }

    function downloadPDF(filename, data) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF("landscape"); // Specify landscape orientation

        // Extract all unique keys from the data
        const allKeys = [...new Set(data.flatMap(Object.keys))];

        // Filter out keys containing "id" and the last two keys
        const filteredKeys = allKeys.filter(
            (key) => !key.toLowerCase().includes("id")
        );
        const columns = filteredKeys.slice(0, filteredKeys.length - 2);

        // Format headers
        const headers = columns.map(formatHeader);

        // Function to format numerical values
        const formatValue = (value) => {
            if (typeof value === "number") {
                return value.toFixed(2); // Format numbers to 2 decimal places
            }
            return value;
        };

        // Create the table using all columns and formatted values
        doc.autoTable({
            head: [headers],
            body: data.map((row) =>
                columns.map((key) => {
                    let value = row[key];
                    return formatValue(value);
                })
            ),
            theme: "striped",
        });

        // Save the PDF
        doc.save(filename);
        addDownload(filename, "PDF");
    }

    function formatHeader(header) {
        return header
            .replace(/([a-z])([A-Z])/g, "$1 $2") // Insert space before each capital letter
            .replace(/_/g, " ") // Replace underscores with spaces if any
            .split(" ")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
    }

    async function initializeRiceProductionDisplay() {
        try {
            // Get riceProduction data
            await getRiceProduction(); // Wait for the data to be ready

            // Now call displayriceProduction with the retrieved data
            displayRiceProduction();
        } catch (error) {
            console.error(
                "Failed to initialize riceProduction display:",
                error
            );
            // Handle the error (e.g., show an error message to the user)
        }
    }

    // Call the initialization function
    initializeRiceProductionDisplay();
}

// Function to build and return table rows as an array of riceProduction instances
// Function to build and return table rows as an array of riceProduction instances
async function processRiceProductionData(
    workbook,
    cellMappings,
    id,
    season,
    year
) {
    // Select the sheet you want to read from
    var sheetName = workbook.SheetNames[0]; // Assuming the first sheet
    var worksheet = workbook.Sheets[sheetName];

    // Find the column index for 'Volume of riceProduction' in cellMappings (or any other key you want to check)
    var riceProductionVolumeColumn = getKeyBySubstring(
        cellMappings,
        "Volume of Production"
    );
    console.log(riceProductionVolumeColumn);

    // Decode the range of the worksheet
    var range = XLSX.utils.decode_range(worksheet["!ref"]);
    let riceProductionDatas = [];

    // Loop through rows starting from the first row after the header
    for (var rowNum = range.s.r + 1; rowNum <= range.e.r; rowNum++) {
        // Check if the corresponding row in column 'Volume of riceProduction' has a numeric value or valid range
        var cellAddressRiceProduction =
            riceProductionVolumeColumn.charAt(0) + (rowNum + 1); // Dynamically construct column 'Volume of riceProduction' cell address
        var cellValueRiceProduction = worksheet[cellAddressRiceProduction]
            ? worksheet[cellAddressRiceProduction].v
            : "";

        // Check if the value is numeric or a valid range
        if (!isNumeric(cellValueRiceProduction)) {
            continue; // Skip this row if it doesn't meet the filter criteria
        }

        // Read values based on the defined cell mappings
        var riceProductionData = {};
        Object.keys(cellMappings).forEach(function (key) {
            var cellAddress = cellMappings[key].charAt(0) + (rowNum + 1); // Dynamically construct cell address based on key
            var cellValue = worksheet[cellAddress]
                ? worksheet[cellAddress].v
                : "";
            riceProductionData[key] = cellValue; // Store value for the current key in riceProductionData
        });

        // Create a new riceProduction instance
        var riceProduction = new RiceProduction(
            id,
            getKeyBySubstring(riceProductionData, "Barangay"),
            getKeyBySubstring(riceProductionData, "Commodity"),
            getKeyBySubstring(riceProductionData, "Area Planted"),
            getKeyBySubstring(riceProductionData, "Month Harvested"),
            getKeyBySubstring(riceProductionData, "Volume of Production"),
            getKeyBySubstring(riceProductionData, "Average Yield"),
            season,
            year
        );

        // Add the new riceProduction instance to riceProductionDatas array
        riceProductionDatas.push(riceProduction);
    }

    // Check if the record ID already exists in the riceProductionDatas array
    var existingRiceProduction = riceProductions.find(
        (p) => p.recordId === riceProductionDatas[0].recordId
    );

    if (existingRiceProduction) {
        // Remove existing riceProduction before adding the new one
        await riceProductionDatas[0].removeRiceProduction(riceProductionDatas);
    }

    riceProductionDatas[0].addRiceProduction(riceProductionDatas);
    return riceProductions;
}

// Helper function to check if a value is numeric
function isNumeric(value) {
    return !isNaN(parseFloat(value)) && isFinite(value);
}

// Function to find a key in object containing a substring (case-insensitive and trims extra spaces)
function getKeyBySubstring(obj, substr) {
    // Convert substring to lowercase and trim any extra spaces
    const lowerSubstr = substr.trim().toLowerCase();

    for (let key in obj) {
        // Convert key to lowercase and trim any extra spaces
        if (key.trim().toLowerCase().includes(lowerSubstr)) {
            return obj[key];
        }
    }

    return null;
}

export {
    RiceProduction,
    getRiceProduction,
    riceProductions,
    initializeMethodsRiceProduction,
    processRiceProductionData,
};
