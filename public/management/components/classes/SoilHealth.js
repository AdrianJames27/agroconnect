import Dialog from "../helpers/Dialog.js";
import { addDownload, getYearRange } from "../../../js/fetch.js";
let soilHealths = [];

class SoilHealth {
    constructor(
        recordId,
        barangay,
        farmer,
        fieldType,
        nitrogenContent,
        phosphorusContent,
        potassiumContent,
        pH,
        generalRating,
        recommendations,
        season,
        monthYear
    ) {
        this.recordId = recordId;
        this.barangay = barangay;
        this.farmer = farmer;
        this.fieldType = fieldType;
        this.nitrogenContent = nitrogenContent;
        this.phosphorusContent = phosphorusContent;
        this.potassiumContent = potassiumContent;
        this.pH = pH;
        this.generalRating = generalRating;
        this.recommendations = recommendations;
        this.season = season;
        this.monthYear = monthYear;
    }

    async addSoilHealth(soilHealths) {
        console.log(soilHealths);

        // Function to chunk the array into smaller batches
        function chunkArray(array, size) {
            const result = [];
            for (let i = 0; i < array.length; i += size) {
                result.push(array.slice(i, i + size));
            }
            return result;
        }

        const batchSize = 20; // Size of each batch
        const totalRows = soilHealths.length;
        const soilHealthBatches = chunkArray(soilHealths, batchSize);

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

        for (const [index, batch] of soilHealthBatches.entries()) {
            const start = processedRows + 1;
            const end = start + batch.length - 1;
            updateProgressMessage(start, end);

            try {
                await $.ajax({
                    url: "/api/soilhealths-batch",
                    method: "POST",
                    data: {
                        soilHealthData: batch,
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

        getSoilHealth();
    }

    updateSoilHealth(updatedSoilHealth) {
        const existingSoilHealth = soilHealthData.find(
            (u) => u.recordId === updatedSoilHealth.recordId
        );

        if (
            existingSoilHealth &&
            existingSoilHealth.recordId !== updatedSoilHealth.recordId
        ) {
            alert("Soil Health record ID already exists");
            return;
        }

        soilHealths = soilHealths.map((soilHealth) =>
            soilHealth.recordId === updatedSoilHealth.recordId
                ? { ...soilHealth, ...updatedSoilHealth }
                : soilHealth
        );

        fetch(`/api/soilhealths/${updatedSoilHealth.recordId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(updatedSoilHealth),
        })
            .then((response) => response.json())
            .then((data) => {
                console.log("Success:", data);
            })
            .catch((error) => {
                console.error("Error:", error);
            });
        getSoilHealth();
    }

    removeSoilHealth(soilHealths) {
        $.ajax({
            url: "/api/soilhealthsByRecords",
            method: "DELETE",
            data: {
                soilHealthData: soilHealths, // Custom key for data
                _token: $('meta[name="csrf-token"]').attr("content"),
            },
            success: function (response) {
                console.log(response);
            },
            error: function (xhr) {
                console.error(xhr.responseText);
            },
        });
        getSoilHealth();
    }
}

function getSoilHealth() {
    // Fetch soil health data from Laravel backend
    $.ajaxSetup({
        headers: {
            "X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr("content"),
        },
    });

    $.ajax({
        url: "/api/soilhealths",
        method: "GET",
        success: function (response) {
            soilHealths = response;
            console.log(soilHealths);
        },
        error: function (xhr, status, error) {
            console.error("Error fetching soil health data:", error);
        },
    });
}

function initializeMethodsSoilHealth() {
    function searchSoilHealth(searchTerm) {
        const lowerCaseSearchTerm = searchTerm.toLowerCase(); // Convert search term to lowercase for case-insensitive search
        const foundSoilHealths = soilHealths.filter((soilHealth) => {
            return Object.values(soilHealth).some((value) =>
                value.toString().toLowerCase().includes(lowerCaseSearchTerm)
            );
        });
        return foundSoilHealths;
    }

    var pageSize = 5;
    var currentPage = 1;

    async function displaySoilHealth(searchTerm = null) {
        // Simulate a delay of 1 second
        await new Promise((resolve) => setTimeout(resolve, 1000));

        $("#soilHealthTableBody").empty();

        var startIndex = (currentPage - 1) * pageSize;
        var endIndex = startIndex + pageSize;

        const foundSoilHealths = searchTerm
            ? searchSoilHealth(searchTerm)
            : soilHealths;

        if (foundSoilHealths.length > 0) {
            for (var i = startIndex; i < endIndex; i++) {
                if (i >= foundSoilHealths.length) {
                    break;
                }
                var soilHealth = foundSoilHealths[i];
                $("#soilHealthTableBody").append(`
            <tr data-index=${soilHealth.recordId}>
              <td>${soilHealth.barangay}</td>
              <td>${soilHealth.farmer}</td>
              <td>${soilHealth.fieldType}</td>
              <td>${soilHealth.nitrogenContent}</td>
              <td>${soilHealth.phosphorusContent}</td>
              <td>${soilHealth.potassiumContent}</td>
              <td>${soilHealth.pH}</td>
              <td>${soilHealth.generalRating}</td>
              <td>${soilHealth.recommendations}</td>
              <td>${soilHealth.season}</td>
              <td>${soilHealth.monthYear}</td>
            </tr>
          `);
            }
        } else {
            $("#soilHealthTableBody").append(`
          <tr>
            <td colspan="10">No results found!</td>
          </tr>
        `);
        }

        // Reinitialize tablesorter after adding rows
        $("#soilHealthTable").trigger("update");
    }

    $("#search").on("input", function () {
        let searchTerm = $("#search").val();
        displaySoilHealth(searchTerm);
    });

    // Pagination: Previous button click handler
    $("#prevBtn").click(function () {
        if (currentPage > 1) {
            currentPage--;
            displaySoilHealth($("#search").val());
        }
    });

    // Pagination: Next button click handler
    $("#nextBtn").click(function () {
        var totalPages = Math.ceil(
            searchSoilHealth($("#search").val()).length / pageSize
        );
        if (currentPage < totalPages) {
            currentPage++;
            displaySoilHealth($("#search").val());
        }
    });

    $(document).ready(function () {
        $(".download-btn").click(function () {
            // Call the downloadDialog method and handle the promise
            Dialog.downloadDialog()
                .then((format) => {
                    console.log(format);
                    download(format, soilHealths);
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
        const filename = `Soil Health Data ${yearRange}`;

        // Call the appropriate download function based on the format
        if (format === "csv") {
            downloadCSV(filename, data);
        } else if (format === "xlsx") {
            downloadExcel(filename, data);
        } else if (format === "pdf") {
            downloadPDF(filename, data);
        }
    }

    function downloadCSV(filename, data) {
        // Define the header mapping for soil health data
        const headerMap = {
            barangay: "Barangay",
            fieldType: "Field Type",
            nitrogenContent: "Nitrogen",
            phosphorusContent: "Phosphorus",
            potassiumContent: "Potassium",
            pH: "pH",
            generalRating: "General Rating",
            recommendations: "Recommendations",
            season: "Season",
            monthYear: "Month Year",
        };

        // Define the order of headers
        const headersToInclude = [
            "barangay",
            "fieldType",
            "nitrogenContent",
            "phosphorusContent",
            "potassiumContent",
            "pH",
            "generalRating",
            "recommendations",
            "season",
            "monthYear",
        ];

        // Map headers to the desired names
        const mappedHeaders = headersToInclude.map((key) => headerMap[key]);

        // Convert data to CSV format
        let csvContent =
            "data:text/csv;charset=utf-8," +
            mappedHeaders.join(",") +
            "\n" +
            data
                .map((row) =>
                    headersToInclude.map((key) => row[key] || "").join(",")
                )
                .join("\n");

        // Encode CSV content
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", filename);
        document.body.appendChild(link); // Required for FF

        link.click(); // Download CSV
        document.body.removeChild(link);
        addDownload(filename, "CSV");
    }

    function downloadExcel(filename, data) {
        // Define the header mapping for soil health data
        const headerMap = {
            barangay: "Barangay",
            fieldType: "Field Type",
            nitrogenContent: "Nitrogen",
            phosphorusContent: "Phosphorus",
            potassiumContent: "Potassium",
            pH: "pH",
            generalRating: "General Rating",
            recommendations: "Recommendations",
            season: "Season",
            monthYear: "Month Year",
        };

        // Define the order of headers
        const headersToInclude = [
            "barangay",
            "fieldType",
            "nitrogenContent",
            "phosphorusContent",
            "potassiumContent",
            "pH",
            "generalRating",
            "recommendations",
            "season",
            "monthYear",
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
        const doc = new jsPDF();

        // Specify the columns you want to include in the PDF
        const columns = [
            "barangay",
            "fieldType",
            "nitrogenContent",
            "phosphorusContent",
            "potassiumContent",
            "pH",
            "generalRating",
            "recommendations",
            "season",
            "monthYear",
        ];
        const headers = columns.map(formatHeader);

        // Create the table using only the specified columns
        doc.autoTable({
            head: [headers],
            body: data.map((row) => columns.map((key) => row[key] || "")),
            theme: "striped",
        });

        doc.save(filename);
        addDownload(filename, "PDF");
    }

    function formatHeader(key) {
        const headerMap = {
            barangay: "Barangay",
            fieldType: "Field Type",
            nitrogenContent: "Nitrogen",
            phosphorusContent: "Phosphorus",
            potassiumContent: "Potassium",
            pH: "pH",
            generalRating: "General Rating",
            recommendations: "Recommendations",
            season: "Season",
            monthYear: "Month Year",
        };
        return headerMap[key] || key;
    }

    getSoilHealth();
    displaySoilHealth();
}

// Function to build and return table rows as an array of SoilHealth instances
async function processSoilHealthData(
    workbook,
    cellMappings,
    id,
    season,
    monthYear
) {
    // Select the sheet you want to read from
    var sheetName = workbook.SheetNames[0]; // Assuming the first sheet
    var worksheet = workbook.Sheets[sheetName];

    // Find the column index for the relevant fields in cellMappings
    var barangayColumn = getKeyBySubstring(cellMappings, "Barangay");
    var typeColumn = getKeyBySubstring(cellMappings, "Field Type");
    var nitrogenColumn = getKeyBySubstring(cellMappings, "Nitrogen");
    var phosphorusColumn = getKeyBySubstring(cellMappings, "Phosphorus");
    var potassiumColumn = getKeyBySubstring(cellMappings, "Potassium");
    var phColumn = getKeyBySubstring(cellMappings, "pH");
    var generalFertilityColumn = getKeyBySubstring(
        cellMappings,
        "General Fertility"
    );
    var recommendationsColumn = getKeyBySubstring(
        cellMappings,
        "Recommendations"
    );
    console.log(
        barangayColumn,
        nitrogenColumn,
        phosphorusColumn,
        potassiumColumn,
        phColumn,
        generalFertilityColumn,
        recommendationsColumn
    );

    // Decode the range of the worksheet
    var range = XLSX.utils.decode_range(worksheet["!ref"]);
    let soilHealthDatas = [];

    // Valid soil health values
    const validValues = new Set(["L", "ML", "MH", "H"]);

    // Loop through rows starting from the first row after the header
    for (var rowNum = range.s.r + 1; rowNum <= range.e.r; rowNum++) {
        // Check if the corresponding row in columns 'Nitrogen', 'Phosphorus', 'Potassium', and 'pH' are valid
        var cellAddressNitrogen = nitrogenColumn.charAt(0) + (rowNum + 1); // Dynamically construct column 'Nitrogen' cell address
        var cellValueNitrogen = worksheet[cellAddressNitrogen]
            ? worksheet[cellAddressNitrogen].v
            : "";

        var cellAddressPhosphorus = phosphorusColumn.charAt(0) + (rowNum + 1); // Dynamically construct column 'Phosphorus' cell address
        var cellValuePhosphorus = worksheet[cellAddressPhosphorus]
            ? worksheet[cellAddressPhosphorus].v
            : "";

        var cellAddressPotassium = potassiumColumn.charAt(0) + (rowNum + 1); // Dynamically construct column 'Potassium' cell address
        var cellValuePotassium = worksheet[cellAddressPotassium]
            ? worksheet[cellAddressPotassium].v
            : "";

        var cellAddressPh = phColumn.charAt(0) + (rowNum + 1); // Dynamically construct column 'pH' cell address
        var cellValuePh = worksheet[cellAddressPh]
            ? worksheet[cellAddressPh].v
            : "";

        // Check if all soil health values are within the valid range
        if (
            ![
                cellValueNitrogen,
                cellValuePhosphorus,
                cellValuePotassium,
                cellValuePh,
            ].every((value) => validValues.has(value))
        ) {
            continue; // Skip this row if it doesn't meet the filter criteria
        }

        // Read values based on the defined cell mappings
        var soilHealthData = {};
        Object.keys(cellMappings).forEach(function (key) {
            var cellAddress = cellMappings[key].charAt(0) + (rowNum + 1); // Dynamically construct cell address based on key

            var cellValue = worksheet[cellAddress]
                ? worksheet[cellAddress].v
                : "";
            soilHealthData[key] = cellValue; // Store value for the current key in soilHealthData
        });

        // Create a new SoilHealth instance
        var soilHealth = new SoilHealth(
            id,
            getKeyBySubstring(soilHealthData, "Barangay"),
            getKeyBySubstring(soilHealthData, "Farmer"),
            getKeyBySubstring(soilHealthData, "Field Type"),
            getKeyBySubstring(soilHealthData, "Nitrogen"),
            getKeyBySubstring(soilHealthData, "Phosphorus"),
            getKeyBySubstring(soilHealthData, "Potassium"),
            getKeyBySubstring(soilHealthData, "pH"),
            getKeyBySubstring(soilHealthData, "General Fertility"),
            getKeyBySubstring(soilHealthData, "Recommendations"),
            season,
            monthYear
        );

        // Add the new soil health instance to soilHealthDatas array using addSoilHealth method
        soilHealthDatas.push(soilHealth);
    }

    // Check if the record ID already exists in the soilHealthDatas array
    var existingSoilHealth = soilHealths.find(
        (sh) => sh.recordId === soilHealthDatas[0].recordId
    );

    if (existingSoilHealth) {
        // Remove existing soil health before adding the new one
        await soilHealthDatas[0].removeSoilHealth(soilHealthDatas);
    }

    soilHealthDatas[0].addSoilHealth(soilHealthDatas);
    return soilHealths;
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
    SoilHealth,
    getSoilHealth,
    soilHealths,
    initializeMethodsSoilHealth,
    processSoilHealthData,
};
