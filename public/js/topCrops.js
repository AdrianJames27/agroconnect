import Dialog from "../management/components/helpers/Dialog.js";
import {
    getCrop,
    getCropName,
    getTotalAreaPlanted,
    getCropVarieties,
    getProduction,
    getPrice,
    getPest,
    getDisease,
    addDownload,
} from "./fetch.js";
import * as stats from "./statistics.js";
let crops = [];
let varieties = [];
let dataEntry = []; // Global variable to store all entries

$(document).ready(function () {
    $("#infoBtn").click(function () {
        let htmlScript = `
        <p>Welcome to the Top Crops page. This tool allows you to rank crops based on various performance indicators. Follow these instructions to use the tool effectively:</p>

        <ol>
          <li><strong>Understand Ranking Criteria:</strong><br>
          Crops are ranked based on a composite score that includes production volume, price, income, revenue, and pest/disease occurrences etc. The formula for calculating the composite score is as follows:</li>
        </ol>

        <pre>
        Composite Score = (Production Volume Score * Weight1) +
                          (Price Score * Weight2) +
                          (Income Score * Weight3) +
                          (Revenue Score * Weight4) -
                          (Pest/Disease Score * Weight5)
                          + ... (additional factors)
        </pre>

        <p>Where the scores for each factor are normalized and weighted according to their importance. The weights (Weight1, Weight2, etc.) are predefined to reflect the relative significance of each factor. The formula may also include other factors relevant to crop performance.</p>

        <ol start="2">
          <li><strong>View Rankings:</strong><br>
          The crops are displayed in descending order of their composite score. Higher scores indicate better overall performance based on the selected criteria.</li>

          <li><strong>Access Crop Details:</strong><br>
          Click the 'View' button next to a crop to open a modal with detailed information. This modal includes:
            <ul>
              <li><strong>Crop Image:</strong> A visual representation of the crop variety.</li>
              <li><strong>Crop Information:</strong> Details such as maturity period, variety, and other relevant data.</li>
            </ul>
          </li>

          <li><strong>Download Data:</strong><br>
          You can download the data in various formats for further analysis:
            <ul>
              <li><strong>CSV:</strong> Download raw data in CSV format for use in spreadsheet applications or data analysis tools.</li>
              <li><strong>Excel:</strong> Download the data in Excel format, which includes formatted tables for easy review and manipulation.</li>
              <li><strong>PDF:</strong> Download table in PDF format for easy sharing and reporting.</li>
            </ul>
          </li>
        </ol>

        <p>This tool is designed to help you rank crops transparently and make informed decisions based on comprehensive performance data.</p>
        `;

        Dialog.showInfoModal(htmlScript);
    });
});

// Fetch initial crop data
async function initializeCrops() {
    try {
        crops = await getCrop(); // Fetch and initialize crops data
    } catch (error) {
        console.error("Failed to initialize crops:", error);
    }
}

async function initializeCropVarieties() {
    try {
        varieties = await getCropVarieties(); // Fetch and initialize crops data
    } catch (error) {
        console.error("Failed to initialize crop varieties:", error);
    }
}

function calculateOccurrencePercentage(occurence, totalPlanted) {
    if (totalPlanted === 0) {
        return 0; // Avoid division by zero
    }
    return (occurence / totalPlanted) * 100;
}

class TopCrops {
    constructor(season, type) {
        this.season = season;
        this.type = type;
        this.initialize();
    }

    async initialize() {
        try {
            const cropData = await main(this.season, this.type);
            const topCrops = this.generateTopCrops(cropData);
            this.displayTopCrops(topCrops);
            dataEntry = topCrops;
        } catch (error) {
            console.error("Failed to initialize TopCrops:", error);
        }
    }

    generateTopCrops(cropData) {
        console.log(cropData);
        if (!Array.isArray(cropData)) {
            console.error("Expected input to be an array");
            return [];
        }

        // Define the weights for each metric (adjust these based on importance)
        const weights = {
            plantedWeight: 0.35,
            volumeWeight: 0.35,
            priceWeight: 0.1,
            pestWeight: -0.05, // Negative weight since higher pest occurrence is bad
            diseaseWeight: -0.05, // Negative weight since higher disease occurrence is bad
            incomeWeight: 0.1,
            profitWeight: 0.1,
        };

        // Process each crop entry
        const processedCrops = cropData.map((item) => {
            // Calculate per-hectare values where applicable
            const volumeProductionPerHectare =
                item.totalArea > 0 ? item.totalVolume / item.totalArea : 0;
            const incomePerHectare =
                item.totalArea > 0 ? item.totalIncome / item.totalArea : 0;
            const profitPerHectare =
                item.totalArea > 0 ? item.totalProfit / item.totalArea : 0;
            let totalPlanted = item.totalPlanted; // Total planted area or similar context

            // Calculate composite score based on total values
            const compositeScore =
                item.totalArea * weights.plantedWeight +
                item.totalVolume * weights.volumeWeight +
                item.price * weights.priceWeight +
                item.pestOccurrence * weights.pestWeight +
                item.diseaseOccurrence * weights.diseaseWeight +
                item.totalIncome * weights.incomeWeight +
                item.totalProfit * weights.profitWeight;

            return {
                cropName: item.cropName,
                type: item.cropType,
                compositeScore: compositeScore,
                // Updated remarks with inline function usage
                remarks:
                    `The total area is <strong>${item.totalArea.toFixed(
                        2
                    )} hectares</strong>. ` +
                    `Average volume per hectare is <strong>${volumeProductionPerHectare.toFixed(
                        2
                    )}</strong>. ` +
                    `The current price stands at <strong>₱${item.price.toFixed(
                        2
                    )}</strong>. ` +
                    `Pest occurrences total <strong>${
                        item.pestOccurrence
                    }</strong>, which is <strong>${calculateOccurrencePercentage(
                        item.pestOccurrence,
                        totalPlanted
                    ).toFixed(2)}%</strong> of the total planted area. ` +
                    `Disease occurrences are <strong>${
                        item.diseaseOccurrence
                    }</strong>, representing <strong>${calculateOccurrencePercentage(
                        item.diseaseOccurrence,
                        totalPlanted
                    ).toFixed(2)}%</strong> of the total planted area. ` +
                    `Additionally, the average income per hectare is <strong>₱${incomePerHectare.toFixed(
                        2
                    )}</strong>, ` +
                    `while the average profit per hectare amounts to <strong>₱${profitPerHectare.toFixed(
                        2
                    )}</strong>.`,

                volumeProductionPerHectare:
                    volumeProductionPerHectare.toFixed(2),
                incomePerHectare: incomePerHectare.toFixed(2),
                profitPerHectare: profitPerHectare.toFixed(2),
                price: item.price.toFixed(2),
                pestOccurrence: item.pestOccurrence,
                diseaseOccurrence: item.diseaseOccurrence,
                totalArea: item.totalArea,
            };
        });

        // Sort crops by composite score in descending order
        const sortedCrops = processedCrops.sort(
            (a, b) => b.compositeScore - a.compositeScore
        );

        // Optionally, filter or slice to get the top N crops
        return sortedCrops;
    }

    displayTopCrops(data) {
        const tableBody = $("#cropsTable tbody");
        tableBody.empty(); // Clear existing rows

        let promises = data.map((crop) => {
            // Find matching crop details
            const cropDetails = crops.find((c) => c.cropName === crop.cropName);
            if (!cropDetails) return Promise.resolve(null); // Skip if no crop details found

            const varietyDetails = varieties.filter(
                (v) => v.cropId === cropDetails.cropId
            );

            if (varietyDetails.length > 0) {
                let varietyPromises = varietyDetails.map((variety) => {
                    return getTotalAreaPlanted(
                        variety.cropId,
                        variety.varietyName
                    ).then((totalAreaPlanted) => {
                        variety.totalAreaPlanted =
                            parseFloat(totalAreaPlanted).toFixed(2); // Add totalAreaPlanted
                        return {
                            varietyName: variety.varietyName,
                            totalAreaPlanted: variety.totalAreaPlanted,
                            cropImg: variety.cropImg,
                            color: variety.color,
                            flavor: variety.flavor,
                            size: variety.size,
                            growthConditions: variety.growthConditions,
                            pestDiseaseResistance:
                                variety.pestDiseaseResistance,
                            recommendedPractices: variety.recommendedPractices,
                            // Include any other specific fields you want from the variety
                        }; // Return only the specific fields needed from variety
                    });
                });

                // After all promises for variety details resolve
                return Promise.all(varietyPromises).then(
                    (updatedVarietyDetails) => {
                        const cropImg = cropDetails.cropImg || "";
                        const description = `
                    <div class='card m-3 shadow-sm'>
                        <div class='card-header bg-success text-white'>
                            <h5 class='mb-0'>Crop Details</h5>
                        </div>
                        <div class='card-body'>
                            <p class='card-text'><strong>Scientific Name:</strong> <span class='text-primary'>${cropDetails.scientificName}</span></p>
                            <p class='card-text'><strong>Unit:</strong> <span class='text-primary'>${cropDetails.unit}</span></p>
                            <p class='card-text'><strong>Weight:</strong> <span class='text-primary'>${cropDetails.weight}</span></p>
                            <p class='card-text'><strong>Planting Season:</strong> <span class='text-primary'>${cropDetails.plantingSeason}</span></p>
                            <p class='card-text'><strong>Growth Duration:</strong> <span class='text-primary'>${cropDetails.growthDuration}</span></p>
                        </div>
                    </div>
                `;

                        const cropTitle = cropDetails.cropName;

                        // Create table row with View button
                        const row = `<tr class="text-center">
                    <td>${crop.cropName}</td>
                    <td>${crop.type}</td>
                    <td>${crop.remarks}</td>
                   <td>
                        <button class="btn btn-green view-btn" 
                            data-img="${cropImg}" 
                            data-description="${description}" 
                            data-crop="${cropTitle}" 
                            data-variety='${JSON.stringify(
                                updatedVarietyDetails
                            )}'> <!-- Updated to use specific variety details -->
                            View Information
                        </button>
                    </td>
                    </tr>`;

                        return row; // Return the row to append later
                    }
                );
            } else {
                // If no varieties, return a row with an empty variety array
                const cropImg = cropDetails.cropImg || "";
                const description = `
                <div class='card m-3 shadow-sm'>
                    <div class='card-header bg-success text-white'>
                        <h5 class='mb-0'>Crop Details</h5>
                    </div>
                    <div class='card-body'>
                        <p class='card-text'><strong>Scientific Name:</strong> <span class='text-primary'>${cropDetails.scientificName}</span></p>
                        <p class='card-text'><strong>Unit:</strong> <span class='text-primary'>${cropDetails.unit}</span></p>
                        <p class='card-text'><strong>Weight:</strong> <span class='text-primary'>${cropDetails.weight}</span></p>
                        <p class='card-text'><strong>Planting Season:</strong> <span class='text-primary'>${cropDetails.plantingSeason}</span></p>
                        <p class='card-text'><strong>Growth Duration:</strong> <span class='text-primary'>${cropDetails.growthDuration}</span></p>
                    </div>
                </div>
            `;

                const cropTitle = cropDetails.cropName;

                // Create table row with empty variety details
                const row = `<tr class="text-center">
                <td>${crop.cropName}</td>
                <td>${crop.type}</td>
                <td>${crop.remarks}</td>
               <td>
                    <button class="btn btn-green view-btn" 
                        data-img="${cropImg}" 
                        data-description="${description}" 
                        data-crop="${cropTitle}" 
                        data-variety='${JSON.stringify(
                            []
                        )}'> <!-- Empty array for varieties -->
                        View Information
                    </button>
                </td>
                </tr>`;

                return row; // Return the row to append later
            }
        });

        // After all crop promises resolve
        Promise.all(promises)
            .then((rows) => {
                rows.forEach((row) => {
                    if (row) {
                        tableBody.append(row); // Append valid rows to the table
                    }
                });

                // Attach click event handler to View buttons
                $(".view-btn").on("click", async function () {
                    const imgSrc = $(this).data("img");
                    const desc = $(this).data("description");
                    const cropTitle = $(this).data("crop");
                    const varietyDetails = $(this).data("variety");

                    // Call the custom modal function
                    const res = await Dialog.showCropModal(
                        imgSrc,
                        desc,
                        cropTitle,
                        varietyDetails
                    );

                    if (res.operation === Dialog.OK_OPTION) {
                        console.log("Modal was closed by the user");
                    } else {
                        console.log("Modal was not closed");
                    }
                });
            })
            .catch((error) => {
                console.error("Error fetching crop details:", error);
            });
    }
}

$(document).ready(async function () {
    await initializeCrops();
    await initializeCropVarieties();
    new TopCrops("Dry", "Vegetables");

    $("#seasonSelect, #typeSelect").on("change", function () {
        const season = $("#seasonSelect").val();
        const type = $("#typeSelect").val();
        new TopCrops(season, type);
    });

    $("#searchInput").on("keyup", function () {
        const value = $(this).val().toLowerCase();
        $("#cropsTable tbody tr").filter(function () {
            $(this).toggle(
                $(this).find("td:eq(0)").text().toLowerCase().indexOf(value) >
                    -1 ||
                    $(this)
                        .find("td:eq(1)")
                        .text()
                        .toLowerCase()
                        .indexOf(value) > -1
            );
        });
    });

    $(document).ready(function () {
        $(".download-btn").click(function () {
            // Call the downloadDialog method and handle the promise
            Dialog.downloadDialog()
                .then((format) => {
                    console.log(format); // This will log the format (e.g., 'csv', 'xlsx', or 'pdf')
                    const currentType = $("#typeSelect").val();
                    download(format, currentType, dataEntry);
                })
                .catch((error) => {
                    console.error("Error:", error); // Handle any errors that occur
                });
        });
    });
});

async function main(season, type) {
    try {
        let production = await getProduction("", season);
        let price = await getPrice("", season);
        let pest = await getPest("", season);
        let disease = await getDisease("", season);

        production = production.map((entry) => ({ ...entry, type }));
        price = price.map((entry) => ({ ...entry, type }));
        pest = pest.map((entry) => ({ ...entry, type }));
        disease = disease.map((entry) => ({ ...entry, type }));

        return await stats.getCropData(
            production,
            price,
            pest,
            disease,
            crops,
            type
        );
    } catch (error) {
        console.error("An error occurred in the main function:", error);
    }
}

function download(format, type, data) {
    const filename = `${type.toLowerCase()}.${format}`;
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
    // Define the header mapping
    const headerMap = {
        cropName: "Crop Name",
        variety: "Variety",
        type: "Type",
        totalArea: "Total Area (ha)",
        volumeProductionPerHectare: "Average Volume Production (mt/ha)",
        incomePerHectare: "Average Income / ha ",
        profitPerHectare: "Average Profit / ha",
        price: "Price (kg)",
        pestOccurrence: "Pest Observed",
        diseaseOccurrence: "Disease Observed",
    };

    // Define the order of headers
    const headersToInclude = [
        "cropName",
        "type",
        "totalArea",
        "volumeProductionPerHectare",
        "incomePerHectare",
        "profitPerHectare",
        "price",
        "pestOccurrence",
        "diseaseOccurrence",
    ];

    // Map headers to the desired names
    const headers = headersToInclude.map((key) => headerMap[key]);

    // Helper function to escape CSV values
    function escapeCSVValue(value) {
        if (value === undefined || value === null) return "";
        if (
            typeof value === "string" &&
            (value.includes(",") || value.includes('"') || value.includes("\n"))
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
                    const value = row[key] !== undefined ? row[key] : ""; // Ensure non-null values
                    if (
                        key === "incomePerHectare" ||
                        key === "profitPerHectare" ||
                        key === "price"
                    ) {
                        return value !== ""
                            ? `₱${parseFloat(value).toFixed(2)}`
                            : "";
                    }
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
    a.download =
        $("#seasonSelect").val() +
        "_" +
        filename.charAt(0).toUpperCase() +
        filename.slice(1);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Optional: Log download action
    addDownload(filename, "CSV");
}

function downloadExcel(filename, data) {
    // Define the header mapping
    const headerMap = {
        cropName: "Crop Name",
        type: "Type",
        totalArea: "Total Area (ha)",
        volumeProductionPerHectare: "Average Volume Production (mt/ha)",
        incomePerHectare: "Average Income / ha ",
        profitPerHectare: "Average Profit / ha",
        price: "Price (kg)",
        pestOccurrence: "Pest Observed",
        diseaseOccurrence: "Disease Observed",
    };

    // Define the order of headers
    const headersToInclude = [
        "cropName",
        "type",
        "totalArea",
        "volumeProductionPerHectare",
        "incomePerHectare",
        "profitPerHectare",
        "price",
        "pestOccurrence",
        "diseaseOccurrence",
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
    const worksheet = workbook.addWorksheet("Sheet1");

    // Add filtered data to the worksheet
    worksheet.addRow(mappedHeaders);
    filteredData.forEach((row) => {
        worksheet.addRow(
            headersToInclude.map((header) => {
                const value = row[headerMap[header]];
                // Format specific columns with peso sign
                if (
                    header === "incomePerHectare" ||
                    header === "profitPerHectare" ||
                    header === "price"
                ) {
                    return value ? `₱${parseFloat(value).toFixed(2)}` : "";
                }
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
            fgColor: { argb: "B1BA4D" }, // Green fill color
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
        alignment: { horizontal: "center", vertical: "middle", wrapText: true },
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
        a.download =
            $("#seasonSelect").val() +
            "_" +
            filename.charAt(0).toUpperCase() +
            filename.slice(1);
        a.click();
        URL.revokeObjectURL(url);
    });
    addDownload(filename, "XLSX");
}

function downloadPDF(filename, data) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Specify the columns you want to include in the PDF
    const columns = ["cropName", "type", "remarks"];
    const headers = columns.map(formatHeader);

    // Create the table using only the specified columns
    doc.autoTable({
        head: [headers],
        body: data.map((row) =>
            columns.map((key) =>
                key === "remarks" ? extractTextFromHTML(row[key]) : row[key]
            )
        ),
        theme: "striped",
    });

    doc.save(
        $("#seasonSelect").val() +
            "_" +
            filename.charAt(0).toUpperCase() +
            filename.slice(1)
    );
    addDownload(filename, "PDF");
}

function extractTextFromHTML(html) {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;

    // Extract the plain text
    let text = tempDiv.textContent || tempDiv.innerText || "";

    // Remove unnecessary whitespace and normalize special characters
    text = text
        .replace(/&nbsp;/g, " ") // Convert non-breaking spaces to regular spaces
        .replace(/[^\w\s.,-]/g, "") // Remove special characters except common symbols
        .replace(/\s+/g, " ") // Replace multiple spaces with a single space
        .trim(); // Remove leading and trailing spaces

    return text;
}
