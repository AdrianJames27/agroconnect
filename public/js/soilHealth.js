import { addDownload, getYearRange } from './fetch.js';
import Dialog from '../management/components/helpers/Dialog.js';

$(document).ready(function() {
  let vegetablesData, riceData, fruitsData;
  let currentDataType;
  let yearRange;
  let printDownload = [];
  
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
  
          // Prepare data for the doughnut chart
          const chartData = {
              labels: ['Phosphorus', 'Nitrogen', 'Potassium', 'pH', 'General Rating'],
              datasets: [{
                  label: 'Average Nutrient Levels',
                  data: [
                      averages.phosphorus.percentage,
                      averages.nitrogen.percentage,
                      averages.potassium.percentage,
                      averages.ph.percentage,
                      averages.generalRating.percentage
                  ],
                  backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#FF9F40'],
                  hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#FF9F40']
              }]
          };
  
          // Chart configuration
          const config = {
              type: 'doughnut',
              data: chartData,
              options: {
                  responsive: true,
                  plugins: {
                      legend: {
                          position: 'top',
                      },
                      title: {
                          display: true,
                          text: 'Nutrient Averages'
                      },
                      tooltip: {
                          callbacks: {
                              label: function(context) {
                                  const label = context.chart.data.labels[context.dataIndex];
                                  let nutrientValue;
                                  switch(label) {
                                      case 'Phosphorus':
                                          nutrientValue = averages.phosphorus.value;
                                          break;
                                      case 'Nitrogen':
                                          nutrientValue = averages.nitrogen.value;
                                          break;
                                      case 'Potassium':
                                          nutrientValue = averages.potassium.value;
                                          break;
                                      case 'pH':
                                          nutrientValue = averages.ph.value;
                                          break;
                                      case 'General Rating':
                                          nutrientValue = averages.generalRating.value;
                                          break;
                                  }
                                  return `${label} - ${nutrientValue} (${context.formattedValue}%)`;
                              }
                          }
                      },
                      datalabels: {
                        color: 'white', // Change datalabels color to white
                    }
                  }
              },
              plugins: [ChartDataLabels] // Register the plugin
          };
  
          // Destroy the existing chart instance if it exists
          const doughnut = Chart.getChart(`${type}Chart`);
          if (doughnut) {
              doughnut.destroy(); // Destroy the existing chart instance
          }
  
          // Create the new chart
          new Chart(
              document.getElementById(`${type}Chart`),
              config
          );
  
          // Create nutrient breakdown by crop type
          const breakdownContainer = $(`#${type}Breakdown`);
          breakdownContainer.empty(); // Clear previous breakdown
  
  
          const recommendations = {
            rice: {
                npk: {
                    nitrogen: {
                        level: "High",
                        description: "Nitrogen is crucial for rice, promoting leaf and tiller growth, and enhancing grain yield. Rice plants typically require higher nitrogen levels, particularly during the vegetative stage for robust growth and development."
                    },
                    phosphorus: {
                        level: "Moderate",
                        description: "Phosphorus supports root development and early growth in rice plants. It is also important for energy transfer and grain formation. Rice usually needs moderate amounts of phosphorus."
                    },
                    potassium: {
                        level: "Moderate to High",
                        description: "Potassium is essential for improving disease resistance, water regulation, and grain quality in rice. It helps in strengthening plant cells and is important for grain filling, so moderate to high levels of potassium are required."
                    }
                },
                ph: {
                    level: "Moderate",
                    description: "A pH level between 5.5 and 7.0 is considered moderate, supporting nutrient availability for rice."
                },
                generalRating: {
                    rating: "Moderate",
                    description: "A general rating of 'Moderate' is optimal for rice. High nutrient levels can lead to lodging."
                }
            },
            vegetables: {
                npk: {
                    nitrogen: {
                        level: "Moderate to High",
                        description: "Vegetables generally require balanced NPK ratios. Leafy greens benefit from higher nitrogen levels, while root vegetables thrive on higher potassium."
                    },
                    phosphorus: {
                        level: "Moderate",
                        description: "Phosphorus is vital for root development and flower formation in many vegetable crops."
                    },
                    potassium: {
                        level: "Moderate",
                        description: "Adequate potassium is crucial for water regulation and overall plant health."
                    }
                },
                ph: {
                    level: "Moderate",
                    description: "A pH of 6.0 to 7.0 is considered moderate and is ideal for most vegetables, promoting nutrient uptake."
                },
                generalRating: {
                    rating: "High",
                    description: "Aim for a general rating of 'High' to ensure optimal growth and yield for most vegetable crops."
                }
            },
            fruits: {
                npk: {
                    nitrogen: {
                        level: "Moderate",
                        description: "Fruits generally benefit from moderate nitrogen levels to support leaf growth without sacrificing fruit development."
                    },
                    phosphorus: {
                        level: "Moderate",
                        description: "Important during the flowering stage to promote fruit set and development."
                    },
                    potassium: {
                        level: "High",
                        description: "Essential for fruit quality and yield, especially during the maturation phase."
                    }
                },
                ph: {
                    level: "Moderate",
                    description: "A slightly acidic pH of 6.0 to 6.8 is considered moderate for many fruit-bearing plants, helping to maximize nutrient absorption."
                },
                generalRating: {
                    rating: "Moderate to High",
                    description: "A general rating of 'Moderate' to 'High' is recommended for fruit crops, as it ensures good growth and quality."
                }
            }
        };
        
      // Function to get background color based on the nutrient value
function getNutrientColor(value) {
    switch (value) {
        case 'Low':
            return { background: 'bg-red', textColor: 'text-white' }; // Red for Low
        case 'Moderately Low':
            return { background: 'bg-yellow', textColor: 'text-dark' }; // Yellow for Moderately Low
        case 'Moderately High':
            return { background: 'bg-aero', textColor: 'text-white' }; // Blue for Moderately High
        case 'High':
            return { background: 'bg-success', textColor: 'text-white' }; // Green for High
        default:
            return { background: 'bg-light', textColor: 'text-dark' }; // Default light background if none matches
    }
}

// Build the HTML with the dynamic background colors
const breakdownHtml = `
    <div class="container mt-4">
        <h4>${type.charAt(0).toUpperCase() + type.slice(1)} Nutrients</h4>
        <hr />
        <div class="card mb-3">
            <div class="card-body">
                <div class="${getNutrientColor(averages.nitrogen.value).background} ${getNutrientColor(averages.nitrogen.value).textColor} p-2">
                    <p><strong>Nitrogen:</strong> <span class="small">${averages.nitrogen.value}</span> <span class="badge text-white bg-secondary">${averages.nitrogen.percentage}%</span></p>
                    <p class="small">${recommendations[type].npk.nitrogen.description}</p>
                    <p class="small"><strong>Recommended Level:</strong> ${recommendations[type].npk.nitrogen.level}</p>
                </div>
                <hr />

                <div class="${getNutrientColor(averages.phosphorus.value).background} ${getNutrientColor(averages.phosphorus.value).textColor} p-2">
                    <p><strong>Phosphorus:</strong> <span class="small">${averages.phosphorus.value}</span> <span class="badge text-white bg-secondary">${averages.phosphorus.percentage}%</span></p>
                    <p class="small">${recommendations[type].npk.phosphorus.description}</p>
                    <p class="small"><strong>Recommended Level:</strong> ${recommendations[type].npk.phosphorus.level}</p>
                </div>
                <hr />
                
                <div class="${getNutrientColor(averages.potassium.value).background} ${getNutrientColor(averages.potassium.value).textColor} p-2">
                    <p><strong>Potassium:</strong> <span class="small">${averages.potassium.value}</span> <span class="badge text-white bg-secondary">${averages.potassium.percentage}%</span></p>
                    <p class="small">${recommendations[type].npk.potassium.description}</p>
                    <p class="small"><strong>Recommended Level:</strong> ${recommendations[type].npk.potassium.level}</p>
                </div>
                <hr />
                
                <div class="${getNutrientColor(averages.ph.value).background} ${getNutrientColor(averages.ph.value).textColor} p-2">
                    <p><strong>pH:</strong> <span class="small">${averages.ph.value}</span> <span class="badge text-white bg-secondary">${averages.ph.percentage}%</span></p>
                    <p class="small">${recommendations[type].ph.description}</p>
                    <p class="small"><strong>Recommended Level:</strong> ${recommendations[type].ph.level}</p>
                </div>
                <hr />
                
                <div class="${getNutrientColor(averages.generalRating.value).background} ${getNutrientColor(averages.generalRating.value).textColor} p-2">
                    <p><strong>General Rating:</strong> <span class="small">${averages.generalRating.value}</span> <span class="badge text-white bg-secondary">${averages.generalRating.percentage}%</span></p>
                    <p class="small">${recommendations[type].generalRating.description}</p>
                    <p class="small"><strong>Recommended Level:</strong> ${recommendations[type].generalRating.rating}</p>
                </div>
            </div>
        </div>
    </div>
`;



        // Create an object for printDataSoil
        let printDataSoil = {
            config,
            breakdownHtml
        };

        // Switch statement to determine the type and push the data into the printDownload array
        switch(type) {
            case 'vegetables':
            case 'rice':
            case 'fruits':
                printDownload.push({
                    type,
                    printDataSoil
                });
                break;
        }
    
   
          breakdownContainer.append(breakdownHtml);
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
    const itemType = `${type.toLowerCase()}`;
    if (format === 'csv') {
      downloadCSV(filename, data);
    } else if (format === 'xlsx') {
      downloadExcel(filename, data);
    } else if (format === 'pdf') {
      downloadPDF(filename, itemType);
    }
  }
  
  function downloadCSV(filename, data) {
    // Define the filename with 'Soil Health' and capitalize the first letter
    filename = 'Soil Health_' + yearRange + "_" + filename.charAt(0).toUpperCase() + filename.slice(1);

    // Automatically extract headers from the first data row and remove the last two columns
    const headers = Object.keys(data[0]).slice(0, -2);

    // Remove the first two rows and the last two rows from the data
    const filteredData = data.slice(2, -2);

    // Sort the data by monthYear field
    const sortedData = filteredData.sort((a, b) => {
        const dateA = new Date(a.monthYear); // Convert monthYear to a Date object
        const dateB = new Date(b.monthYear);
        return dateA - dateB; // Sort in ascending order
    });

    // Helper function to escape CSV values
    function escapeCSVValue(value) {
        if (value === undefined || value === null) return '';
        if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
            value = `"${value.replace(/"/g, '""')}"`;
        }
        return value;
    }

    // Format the data rows for CSV, removing the last two columns from each row
    const csvRows = [
        headers.join(','), // Join headers to form the first row
        ...sortedData.map(row => 
            headers.map(key => {
                const value = row[key] !== undefined ? row[key] : ''; // Ensure non-null values
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
    // Define the filename with 'Soil Health' and capitalize the first letter
    filename = 'Soil Health_' + yearRange + "_" + filename.charAt(0).toUpperCase() + filename.slice(1);

    // Automatically extract headers from the first data row, removing first two and last two columns
    const headers = Object.keys(data[0]).slice(2, -2);

    // Sort the data by monthYear field
    const sortedData = data.slice(2, -2).sort((a, b) => {
        const dateA = new Date(a.monthYear); // Convert monthYear to Date object
        const dateB = new Date(b.monthYear);
        return dateA - dateB; // Sort in ascending order
    });

    // Create a new workbook and add a worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sheet1');

    // Add headers to the worksheet
    worksheet.addRow(headers);

    // Add data rows to the worksheet
    sortedData.forEach(row => {
        const rowData = headers.map(header => row[header]);
        worksheet.addRow(rowData);
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
    worksheet.columns = headers.map(header => ({
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

    // Optional: Log download action
    addDownload(filename, 'XLSX');
}

function downloadPDF(filename, type) {
    console.log(type);
    
    // Retrieve the correct printDataSoil based on the type from printDownload array
    const printDataSoilEntry = printDownload.find(entry => entry.type === type);

    // Check if the entry exists
    if (printDataSoilEntry) {
        // Store the corresponding printDataSoil in sessionStorage
        sessionStorage.setItem('printDataSoil', JSON.stringify(printDataSoilEntry.printDataSoil));

        // Open print page
        const printWindow = window.open('/print-soil-health', '_blank');
        printWindow.onload = function() {
            printWindow.print();
        };

        // Call addDownload function with the filename and type
        addDownload(filename, 'PDF');
    } else {
        console.error('No print data found for type:', type);
    }
}

});  