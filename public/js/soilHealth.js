import { addDownload, getYearRange } from './fetch.js';
import Dialog from '../management/components/helpers/Dialog.js';

$(document).ready(function() {
  let vegetablesData, riceData, fruitsData;
  let currentDataType;
  let yearRange;
  
  $(document).ready(function() {
    $('#infoBtn').click(function() {
        let htmlScript = `
        <p>Welcome to the Soil Health Monitoring page. This tool allows you to monitor and analyze the average soil health in Cabuyao by tracking key soil parameters. Follow these instructions to use the tool effectively:</p>

        <ol>
          <li><strong>Monitor Soil Health:</strong><br>
          This page provides an overview of soil health based on data collected from soil test kits provided to local farmers. Key parameters monitored include:
            <ul>
              <li><strong>Nitrogen (N):</strong> The amount of nitrogen in the soil, which is essential for plant growth.</li>
              <li><strong>Phosphorus (P):</strong> The amount of phosphorus present, which supports root development and energy transfer.</li>
              <li><strong>Potassium (K):</strong> The amount of potassium, which helps in disease resistance and overall plant health.</li>
              <li><strong>pH Levels:</strong> The acidity or alkalinity of the soil, affecting nutrient availability and microbial activity.</li>
              <li><strong>General Rating:</strong> An overall rating of soil fertility based on the combined results of NPK and pH levels.</li>
            </ul>
          </li>

          <li><strong>View Average Soil Health:</strong><br>
          The page displays average values for NPK, pH, and general rating across different fields and areas within Cabuyao. This helps in understanding the overall soil health in the city.</li>

          <li><strong>Update Soil Health Records:</strong><br>
          Regular updates are made based on new soil test results. Farmers are encouraged to submit their soil test data to ensure continuous monitoring and accurate assessments.</li>

          <li><strong>Download Soil Health Data:</strong><br>
          You can download the soil health data in various formats for offline review and analysis:
            <ul>
              <li><strong>CSV:</strong> Download raw soil health data in CSV format for use in data analysis tools.</li>
              <li><strong>Excel:</strong> Download the data in Excel format, including formatted tables for easy review and manipulation.</li>
              <li><strong>PDF:</strong> Download a summary of soil health data through a table, in PDF format for sharing or reporting.</li>
            </ul>
          </li>
        </ol>

        <p>This tool is designed to provide comprehensive monitoring of soil health in Cabuyao. By utilizing the provided data and download options, you can keep track of soil conditions and make informed decisions to maintain and improve soil fertility in the area.</p>
        `;

        Dialog.showInfoModal(htmlScript);
    });
});

  
  async function initialize() {
  
    try {
      yearRange = await getYearRange();
      console.log(yearRange); // Use the yearRange as needed
    } catch (error) {
      console.error('Error fetching year range:', error);
    }
  }
  
  initialize();

  fetch('api/soilhealths')
    .then(response => response.json())
    .then(data => {
      vegetablesData = data.filter(record => record.fieldType === "Vegetables");
      riceData = data.filter(record => record.fieldType === "Rice");
      fruitsData = data.filter(record => record.fieldType === "Fruit Trees");

      displayData('vegetables', vegetablesData);
      displayData('rice', riceData);
      displayData('fruits', fruitsData);

      $(document).ready(function() {
        $('.download-btn').click(function() {
            // Call the downloadDialog method and handle the promise
            Dialog.downloadDialog().then(format => {
                currentDataType = $(this).data('type');
                if (currentDataType === 'vegetables') {
                  downloadData(format, 'Vegetables', vegetablesData);
                } else if (currentDataType === 'rice') {
                  downloadData(format, 'Rice', riceData);
                } else if (currentDataType === 'fruits') {
                  downloadData(format, 'Fruits', fruitsData);
                }
            }).catch(error => {
                console.error('Error:', error);  // Handle any errors that occur
            });
        });
      });
    })
    .catch(error => console.error('Error fetching data:', error));

  function displayData(type, data) {
    console.log(data);
    if (data.length === 0) {
      $(`#${type}-body`).html('<p class="h3">Data is not available for now.</p>');
      $(`.download-btn[data-type="${type}"]`).hide();
    } else {
      let averages = calculateAverages(data);
      $(`#${type}-phosphorus`).html(`${averages.phosphorus.value} <br>(${averages.phosphorus.percentage}%)`);
      $(`#${type}-nitrogen`).html(`${averages.nitrogen.value} <br>(${averages.nitrogen.percentage}%)`);
      $(`#${type}-potassium`).html(`${averages.potassium.value} <br> (${averages.potassium.percentage}%)`);
      $(`#${type}-ph`).html(`${averages.ph.value} <br>(${averages.ph.percentage}%)`);
      $(`#${type}-general`).html(`${averages.generalRating.value} <br> (${averages.generalRating.percentage}%)`);
    }
  }

  function calculateAverages(records) {
    let totalPhosphorus = 0, totalNitrogen = 0, totalPotassium = 0, totalPH = 0, totalGeneral = 0;
    let count = records.length;

    records.forEach(record => {
      totalPhosphorus += getValue(record.phosphorusContent);
      totalNitrogen += getValue(record.nitrogenContent);
      totalPotassium += getValue(record.potassiumContent);
      totalPH += getValue(record.pH);
      totalGeneral += getValue(record.generalRating);
    });

    return {
      phosphorus: getAverage(totalPhosphorus, count),
      nitrogen: getAverage(totalNitrogen, count),
      potassium: getAverage(totalPotassium, count),
      ph: getAverage(totalPH, count),
      generalRating: getAverage(totalGeneral, count)
    };
  }

  function getValue(content) {
    switch(content) {
      case "L": return 1;
      case "ML": return 2;
      case "MH": return 3;
      case "H": return 4;
      default: return 0;
    }
  }

  function getAverage(total, count) {
    let averageValue = total / count;
    let percentage = (averageValue / 4) * 100; // Since H corresponds to the highest value, which is 4
    return {
      value: convertToText(averageValue),
      percentage: percentage.toFixed(2)
    };
  }

  function convertToText(value) {
    if (value <= 1.5) return 'Low';
    else if (value <= 2.5) return 'Moderately Low';
    else if (value <= 3.5) return 'Moderately High';
    else return 'High';
  }

  function downloadData(format, type, data) {
    const filename = `${type.toLowerCase()}.${format}`;
    if (format === 'csv') {
      downloadCSV(filename, data);
    } else if (format === 'xlsx') {
      downloadExcel(filename, data);
    } else if (format === 'pdf') {
      downloadPDF(filename, data);
    }
  }
  
  function downloadCSV(filename, data) {
    // Define the header mapping
    const headerMap = {
      barangay: 'Barangay / Area',
      fieldType: 'Type',
      phosphorusContent: 'Phosphorus',
      nitrogenContent: 'Nitrogen',
      potassiumContent: 'Potassium',
      pH: 'pH',
      generalRating: 'General Rating',
      monthYear: 'Data Observed',
      season: 'Season Collected',
  };

  // Define the order of headers
  const headersToInclude = [
      'barangay',
      'fieldType',
      'phosphorusContent',
      'nitrogenContent',
      'potassiumContent',
      'pH',
      'generalRating',
      'monthYear',
      'season',
  ];


  filename = 'Soil Health_' + yearRange + "_" + filename.charAt(0).toUpperCase() + filename.slice(1);

    // Map headers to the desired names
    const headers = headersToInclude.map(key => headerMap[key]);

    // Helper function to escape CSV values
    function escapeCSVValue(value) {
        if (value === undefined || value === null) return '';
        if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
            value = `"${value.replace(/"/g, '""')}"`;
        }
        return value;
    }

    // Filter data to match the new headers and format values
    const csvRows = [
        headers.join(','),
        ...data.map(row => 
            headersToInclude.map(key => {
                const value = row[key] !== undefined ? row[key] : ''; // Ensure non-null values
                if (key === 'incomePerHectare' || key === 'benefitPerHectare' || key === 'price') {
                    return value !== '' ? `₱${parseFloat(value).toFixed(2)}` : '';
                }
                return escapeCSVValue(value);
            }).join(',')
        )
    ].join('\n');

    // Create a Blob and trigger download
    const blob = new Blob([csvRows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Optional: Log download action
    addDownload(filename, 'CSV');
}
  
  function downloadExcel(filename, data) {
    // Define the header mapping
    const headerMap = {
        barangay: 'Barangay / Area',
        fieldType: 'Type',
        phosphorusContent: 'Phosphorus',
        nitrogenContent: 'Nitrogen',
        potassiumContent: 'Potassium',
        pH: 'pH',
        generalRating: 'General Rating',
        monthYear: 'Data Observed',
        season: 'Season Collected',
    };

    // Define the order of headers
    const headersToInclude = [
        'barangay',
        'fieldType',
        'phosphorusContent',
        'nitrogenContent',
        'potassiumContent',
        'pH',
        'generalRating',
        'monthYear',
        'season',
    ];


    filename = 'Soil Health_' + yearRange + "_" + filename.charAt(0).toUpperCase() + filename.slice(1);

    // Map headers to the desired names
    const mappedHeaders = headersToInclude.map(key => headerMap[key]);

    // Filter data to match the new headers
    const filteredData = data.map(row => {
        const filteredRow = {};
        headersToInclude.forEach(key => {
            filteredRow[headerMap[key]] = row[key];
        });
        return filteredRow;
    });

    // Create a new workbook and add a worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sheet1');

    // Add filtered data to the worksheet
    worksheet.addRow(mappedHeaders);
    filteredData.forEach(row => {
        worksheet.addRow(headersToInclude.map(header => {
            const value = row[headerMap[header]];

            return value;
        }));
    });

    // Define header and data style
    const headerStyle = {
        font: {
            name: "Calibri",
            size: 12,
            bold: true,
            color: { argb: "FFFFFFFF" } // White color
        },
        fill: {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: "B1BA4D" } // Green fill color
        },
        alignment: { horizontal: 'center', vertical: 'middle' },
        border: {
            top: { style: 'thin', color: { argb: "FF000000" } }, // Black border
            right: { style: 'thin', color: { argb: "FF000000" } },
            bottom: { style: 'thin', color: { argb: "FF000000" } },
            left: { style: 'thin', color: { argb: "FF000000" } }
        }
    };

    const dataStyle = {
        font: {
            name: "Calibri",
            size: 11
        },
        alignment: { horizontal: 'center', vertical: 'middle', wrapText: true },
        border: {
            top: { style: 'thin', color: { argb: "FF000000" } }, // Black border
            right: { style: 'thin', color: { argb: "FF000000" } },
            bottom: { style: 'thin', color: { argb: "FF000000" } },
            left: { style: 'thin', color: { argb: "FF000000" } }
        }
    };

    // Apply style to header row
    const headerRow = worksheet.getRow(1);
    headerRow.eachCell({ includeEmpty: true }, (cell) => {
        cell.style = headerStyle;
    });
    headerRow.height = 20; // Set header row height

    // Apply style to data rows
    worksheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
        if (rowNumber > 1) { // Skip header row
            row.eachCell({ includeEmpty: true }, (cell) => {
                cell.style = dataStyle;
            });
        }
    });

    // Set column widths with padding to prevent overflow
    worksheet.columns = mappedHeaders.map(header => ({
        width: Math.max(header.length, 10) + 5 // Ensure minimum width
    }));

    // Write workbook to browser
    workbook.xlsx.writeBuffer().then(function(buffer) {
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    });
    addDownload(filename, 'XLSX');
}

  
  // Download PDF
  function downloadPDF(filename, data) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    filename = 'Soil Health_' + yearRange + "_" + filename.charAt(0).toUpperCase() + filename.slice(1);
  
    doc.autoTable({
      head: [['Barangay', 'Type', 'Phosphorus', 'Nitrogen', 'Potassium', 'pH', 'General Rating', 'Date Observed', 'Season Collected']],
      body: data.map(record => [
        record.barangay,
        record.fieldType,
        record.phosphorusContent,
        record.nitrogenContent,
        record.potassiumContent,
        record.pH,
        record.generalRating,
        record.monthYear,
        record.season,
      ]),
      startY: 10,
      margin: { top: 10, right: 10, bottom: 10, left: 10 },
      theme: 'grid',
    });
  
    doc.save(filename);
    addDownload(filename, 'PDF');
  }
});  