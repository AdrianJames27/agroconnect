import { getCrop, getProduction, getPest, getDisease, getProductions, getBarangay, getYearRange, addDownload, getUniqueCropNames} from './fetch.js';
import * as stats from './statistics.js';
import Dialog from '../management/components/helpers/Dialog.js';

let barangays = [];
let globalMap = null;
let downloadData;
let downloadYR;
let currentType;

$(document).ready(function() {
    $('#infoBtn').click(function() {
        let htmlScript = `
        <p>Welcome to the Map Trends page. This tool helps you analyze and visualize agricultural trends by barangay location using geo-tagging. Follow these instructions to use the tool effectively:</p>

        <ol>
          <li><strong>Select Your Parameters:</strong><br>
          Use the dropdown menus and filters to choose the specific criteria you want to analyze, such as production volume, pest occurrences, or disease incidents.</li>

          <li><strong>View Map Trends:</strong><br>
          The map will display barangays with geo-tags indicating the level of production volume, pest, and disease occurrences. Areas are categorized as:
            <ul>
              <li><strong>Low:</strong> Indicating minimal activity or low values in the selected criteria.</li>
              <li><strong>Moderate:</strong> Showing average levels of activity or medium values.</li>
              <li><strong>High:</strong> Highlighting areas with high levels of production, pest, or disease occurrences.</li>
            </ul>
          </li>

          <li><strong>Analyze Data:</strong><br>
          Utilize the map's visual representation to identify trends and patterns in different barangays. Click on specific geo-tags or areas for detailed information about production volume, pest occurrences, or disease incidents.</li>

          <li><strong>Explore Detailed Information:</strong><br>
          Clicking on a geo-tagged barangay will open a modal with more detailed information, such as:
            <ul>
              <li><strong>Production Volume:</strong> Detailed statistics on crop production in that barangay.</li>
              <li><strong>Pest and Disease Data:</strong> Information on pest and disease occurrences and their impact.</li>
              <li><strong>Additional Insights:</strong> Other relevant data points to help understand the local agricultural situation.</li>
            </ul>
          </li>

          <li><strong>Download Data:</strong><br>
          You can download the data in various formats for further analysis:
            <ul>
              <li><strong>CSV:</strong> Download raw data in CSV format for use in spreadsheet applications or data analysis tools.</li>
              <li><strong>Excel:</strong> Download the data in Excel format, which includes formatted tables for easy review and manipulation.</li>
              <li><strong>PDF:</strong> Download charts and visualizations in PDF format for easy sharing and reporting.</li>
            </ul>
          </li>
        </ol>

        <p>This tool is designed to provide a comprehensive view of agricultural trends by barangay, utilizing geo-tagging to make localized data analysis easier and more informative. The download options allow you to export and work with your data in multiple formats.</p>
        `;

        Dialog.showInfoModal(htmlScript);
    });
});


// Fetch initial barangay data
async function initializeBarangays() {
    try {
        barangays = await getBarangay();
    } catch (error) {
        console.error('Failed to initialize barangays:', error);
    }
}

// Initialize global map
function initializeGlobalMap() {
    if (!globalMap) {
        globalMap = L.map('map', { renderer: L.canvas() }).setView([14.2700, 121.1260], 11);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19
        }).addTo(globalMap);

        // Ensure the map is loaded initially
        globalMap.whenReady(() => globalMap.invalidateSize());
    }
}

// Define MapTrends class
class MapTrends {
    constructor(season, type, crop, category) {
        this.season = season.charAt(0).toUpperCase() + season.slice(1).toLowerCase();
        this.type = type;
        this.crop = crop.charAt(0).toUpperCase() + crop.slice(1);
        this.category = category;
    }

    generateMapTrends(barangays, data, key, label) {
        $('title').empty();
        $('#title').html(`<p>${label}</p>`); // Update title
        $('.label-box').empty();

        // Initialize missing barangay data
        barangays.forEach(barangay => {
            if (!data.find(d => d.barangayName === barangay.barangayName)) {
                data.push({ barangay: barangay.barangayName, cropName: this.crop, season: this.season, [key]: 0 });
            }
        });


        // Parse key values to ensure they're numbers
        data.forEach(d => {
            d[key] = parseFloat(d[key]);
        });

        const keyArray = data.map(d => d[key]);
        console.log('Key Array:', keyArray); // Debugging

        const mean = keyArray.reduce((sum, value) => sum + value, 0) / keyArray.length;
        const stdDev = Math.sqrt(keyArray.map(value => Math.pow(value - mean, 2)).reduce((sum, value) => sum + value, 0) / keyArray.length);

        data.forEach(d => {
            d.zScore = (d[key] - mean) / stdDev;
        });

        function getColor(zScore) {
            if (zScore > 1.5) return '#0000FF'; // Blue
            if (zScore >= 0.5) return '#008000'; // Green
            return '#FF0000'; // Red
        }

        return {
            barangays,
            data,
            getColor
        };
    }

    displayMapTrends(barangays, data, key, label, text) {
        let markerLayerGroup = L.layerGroup().addTo(globalMap);

        // Close all open popups before adding new markers
        globalMap.eachLayer(layer => {
            if (layer instanceof L.CircleMarker && layer.isPopupOpen()) {
                layer.closePopup();
            }
        });

        const { barangays: updatedBarangays, data: updatedData, getColor } = this.generateMapTrends(barangays, data, key, label);

        setTimeout(() => {
            markerLayerGroup.clearLayers();

            updatedBarangays.forEach(barangay => {
                const { lat, lon } = getLatLon(barangay.coordinates);
                const locationData = updatedData.find(d => d.barangay === barangay.barangayName);
                if (locationData) {
                    const color = getColor(locationData.zScore);

                    var circleMarker = L.circleMarker([lat, lon], {
                        radius: 8,
                        color: 'black',
                        fillColor: color,
                        fillOpacity: 1
                    }).bindPopup(`<strong>${barangay.barangayName}:</strong><br>${text}: ${locationData[key]}`)
                      .on('popupopen', function () {
                          globalMap.panTo(circleMarker.getLatLng());
                      });

                    markerLayerGroup.addLayer(circleMarker);
                }
            });

            interpret(updatedData, key);
        }, 500); // Delay of 500 milliseconds
    }
}

function interpret(data, key) {
    // Check if data is empty
    if (data.length === 0) {
        return `
            <div class="alert alert-warning" role="alert">
                No data available.
            </div>
        `;
    }

    // Retrieve the crop name from the first entry
    const cropName = data[0].cropName;

    // Aggregate the specified key by barangay
    const aggregatedData = aggregateProduction(data, key);

    // Filter out barangays with positive and zero values
    const productiveData = aggregatedData.filter(d => d.total > 0);
    const nonProductiveData = aggregatedData.filter(d => d.total === 0);

    // Handle case where there is no productive data
    if (productiveData.length === 0) {
        return `
            <div class="alert alert-warning" role="alert">
                No productive data available for ${cropName}.
            </div>
        `;
    }

    // Sort the productive data in descending order by the specified key
    const sortedProductiveData = [...productiveData].sort((a, b) => b.total - a.total);

    // Calculate statistics
    const highestValue = sortedProductiveData[0].total;
    const lowestValue = sortedProductiveData[sortedProductiveData.length - 1].total;
    const averageValue = (sortedProductiveData.reduce((sum, d) => sum + d.total, 0) / sortedProductiveData.length).toFixed(2);

    // Create a Bootstrap styled output
    let interpretation = `
        <div class="container">
            <h3 class="text-primary" style="font-size: 1.8rem;">Crop Performance Analysis for <strong>${cropName}</strong></h3>
            <p style="font-size: 1rem;">This analysis provides a detailed breakdown of ${cropName}'s performance, highlighting trends and growth rates.</p>
            <ul class="list-group mb-4">
                <li class="list-group-item">
                    <strong>Highest ${formatKey(key)}:</strong> <span class="badge bg-success">${highestValue}</span>
                    <div>Barangays: ${sortedProductiveData.filter(d => d.total === highestValue).map(d => d.barangay).join(', ')}</div>
                </li>
                <li class="list-group-item">
                    <strong>Lowest ${formatKey(key)}:</strong> <span class="badge bg-danger">${lowestValue}</span>
                    <div>Barangays: ${sortedProductiveData.filter(d => d.total === lowestValue).map(d => d.barangay).join(', ')}</div>
                </li>
                <li class="list-group-item">
                    <strong>Average ${formatKey(key)}:</strong> <span class="badge bg-info">${averageValue}</span>
                </li>
            </ul>
            <h5 class="text-secondary">Productive Barangay Breakdown:</h5>
            <ul class="list-group">
                ${sortedProductiveData.map(d => `<li class="list-group-item">${d.barangay}: ${d.total}</li>`).join('')}
            </ul><br>
            ${nonProductiveData.length > 0 ? `<p class="text-danger">The following barangays reported no production: ${nonProductiveData.map(d => d.barangay).join(', ')}.</p>` : ''}
            <small class="text-muted">Note: Findings are based on available data only.</small>
        </div>
    `;

    $('#interpretation').html(interpretation);
}


// Function to format the key
function formatKey(key) {
    // Add space before each uppercase letter
    const formattedKey = key.replace(/([A-Z])/g, ' $1').trim();
    
    // Capitalize the first letter
    return formattedKey.charAt(0).toUpperCase() + formattedKey.slice(1);
}

// Function to aggregate any specified key by barangay
function aggregateProduction(data, key) {
    const aggregatedData = {};

    // Iterate through each data entry
    data.forEach(entry => {
        const barangay = entry.barangay;
        const value = entry[key] || 0; // Use 0 if the value is undefined

        // Aggregate the specified key by barangay
        if (!aggregatedData[barangay]) {
            aggregatedData[barangay] = {
                barangay: barangay,
                total: 0
            };
        }
        aggregatedData[barangay].total += value;
    });

    // Convert aggregatedData object back to an array
    return Object.values(aggregatedData);
}



// Function to update crop options based on type and season
async function updateCropOptions() {
  const type = $('#type').val().toLowerCase();
  const season = $('#season').val().toLowerCase();
  let options = '';

  try {
      const uniqueCropNames = await getUniqueCropNames(season, type);

      if (uniqueCropNames.length > 0) {
          options = uniqueCropNames.length > 0 
              ? uniqueCropNames.map(cropName => `<option value="${cropName}">${cropName.charAt(0).toUpperCase() + cropName.slice(1)}</option>`).join('')
              : '<option value="">No crops available</option>';
      } else {
          options = '<option value="">No crops available</option>';
      }
  } catch (error) {
      console.error('Failed to update crop options:', error);
      options = '<option value="">Error loading crops</option>';
  }

  $('#crop').html(options);
}

// Handle category change and display results
async function handleCategoryChange() {
    const season = $('#season').val();
    const type = $('#type').val();
    const crop = $('#crop').val();
    const category = $('#category').val();

    let categoryText, dataset = [], data = [], key, yearRange, text;
    yearRange = await getYearRange();
    downloadYR = yearRange;
    switch (category) {
        case 'area_planted':
            key = "areaPlanted";
            data = await getProduction(crop, season);   
            categoryText = `Area Planted Per Barangay (${yearRange})`;
            dataset = stats.countAverageAreaPlantedBarangay(data);
            text = "area planted";
            break;
        case 'production_volume':
            key = "volumeProductionPerHectare";
            data = await getProduction(crop, season);
            categoryText = `Production Volume per Hectare Per Barangay (${yearRange})`;
            dataset = stats.averageVolumeProductionBarangay(data);
            text = "production volume per hectare";
            break;
        case 'pest_occurrence':
            key = "pestOccurrence";
            data = await getPest(crop, season);
            categoryText = `Pest Occurrence Per Barangay (${yearRange})`;
            dataset = stats.countPestOccurrenceBarangay(data);
            text = "pest occurrence";
            break;
        case 'disease_occurrence':
            key = "diseaseOccurrence";
            data = await getDisease(crop, season);
            categoryText = `Disease Occurrence Per Barangay (${yearRange})`;
            dataset = stats.countDiseaseOccurrenceBarangay(data);
            text = "disease occurrence";
            break;
        case 'price_income_per_hectare':
            key = "incomePerHectare";
            data = await getProduction(crop, season);
            categoryText = `Price Income per Hectare Per Barangay (${yearRange})`;
            dataset = stats.priceIncomePerHectareBarangay(data);
            text = "price income per hectare";
            break;
        case 'profit_per_hectare':
            key = "profitPerHectare";
            data = await getProduction(crop, season);
            categoryText = `Profit per Hectare Per Barangay (${yearRange})`;
            dataset = stats.profitPerHectareBarangay(data);
            text = "profit per hectare";
            break;
        default:
            categoryText = 'Category not recognized';
    }

    if (dataset.length !== 0 && crop !== null) {
        $('#unavailable').hide();
        $('.available').show();
        const mt = new MapTrends(season, type, crop, categoryText);
        mt.displayMapTrends(barangays, dataset, key, categoryText, text);
        currentType = key;
        downloadData = dataset;
    } else {
        $('.available').hide();
        $('#unavailable').show();
    }
}

// Initialize with default crop options and attach event listeners
$(document).ready(async function () {
    await initializeGlobalMap();
    await initializeBarangays();
    await updateCropOptions();
    await handleCategoryChange();

    // Attach event listener to #type element
    $('#type').on('change', function() {
        updateCropOptions().then(() => handleCategoryChange());

    });

    // Attach event listener to #season element
    $('#season').on('change', function() {
        updateCropOptions().then(() => handleCategoryChange());
    
    });
    $('#type, #category, #crop, #season').on('change', handleCategoryChange);

    $(document).ready(function() {
        $('.download-btn').click(function() {
            // Call the downloadDialog method and handle the promise
            Dialog.downloadDialog().then(format => {
                console.log(format);  // This will log the format (e.g., 'csv', 'xlsx', or 'pdf')
                download(format, currentType, downloadData);
            }).catch(error => {
                console.error('Error:', error);  // Handle any errors that occur
            });
        });
    });
});

// Parse latitude and longitude from coordinate string
function getLatLon(coordinate) {
    const [lat, lon] = coordinate.split(',').map(parseFloat);
    return { lat, lon };
}

// Function to determine the rate based on zScore
function getRate(zScore) {
  if (zScore > 1.5) return 'High'; 
  if (zScore >= 0.5) return 'Moderate'; 
  return 'Low'; 
}

async function download(format, type, data) {
    const filename = `${type.toLowerCase()}.${format}`;
    // Extract barangay and rate
    let pdfData = data.map(item => ({
      barangay: item.barangay,
      rate: getRate(item.zScore)
    }));

    if (format === 'csv') {
      downloadCSV(filename, data);
    } else if (format === 'xlsx') {
      downloadExcel(filename, data);
    } else if (format === 'pdf') {
      globalMap.whenReady(() => {
  // Set the view of the map
  globalMap.setView([14.2700, 121.1260], 11);
  
  // Close all open popups
  globalMap.eachLayer(layer => {
    if (layer instanceof L.CircleMarker && layer.isPopupOpen()) {
      layer.closePopup();
    }
  });

  // Delay to ensure all popups are closed before starting the download
  setTimeout(() => {
    downloadPDF(filename, pdfData);
  }, 1000); // Adjust the delay as needed
});

    }
  }

function formatHeader(key) {
  return key.replace(/([a-z])([A-Z])/g, '$1 $2')
            .replace(/_/g, ' ')
            .replace(/\b\w/g, char => char.toUpperCase());
}

function escapeCSVValue(value) {
  if (typeof value === 'string' && (value.includes(',') || value.includes('\n') || value.includes('"'))) {
    value = '"' + value.replace(/"/g, '""') + '"';
  }
  return `"${value}"`; // Enclose each value in double quotes
}

function downloadCSV(filename, data) {
  // Define the header mapping
  const headerMap = {
      barangay: 'Barangay / Area',
      cropName: 'Crop Name',
      season: 'Season',
      volumeProductionPerHectare: 'Average Volume Production (mt/ha)',
      incomePerHectare: 'Average Income / ha',
      profitPerHectare: 'Average Profit / ha',
      price: 'Price (kg)',
      pestOccurrence: 'Pest Observed',
      diseaseOccurrence: 'Disease Observed',
      totalPlanted: 'Total Planted'
  };

  // Always include these three headers
  const alwaysIncludedHeaders = ['barangay', 'cropName', 'season'];

  // Dynamically include other headers based on filename
  const additionalHeaders = [];

  const filenameLower = filename.toLowerCase();

  if (filenameLower.includes('volumeproductionperhectare')) {
      additionalHeaders.push('volumeProductionPerHectare');
  }
  if (filenameLower.includes('incomeperhectare')) {
      additionalHeaders.push('incomePerHectare');
  }
  if (filenameLower.includes('profitperhectare')) {
      additionalHeaders.push('profitPerHectare');
  }
  if (filenameLower.includes('price')) {
      additionalHeaders.push('price');
  }
  if (filenameLower.includes('pestoccurrence')) {
      additionalHeaders.push('pestOccurrence');
  }
  if (filenameLower.includes('diseaseoccurrence')) {
      additionalHeaders.push('diseaseOccurrence');
  }
  if (filenameLower.includes('totalplanted')) {
      additionalHeaders.push('totalPlanted');
  }

  // Define the order of headers to include (first three + dynamically added)
  const headersToInclude = [...alwaysIncludedHeaders, ...additionalHeaders];

  // Map headers to the desired names
  const mappedHeaders = headersToInclude.map(key => headerMap[key]);

  // Convert data to CSV format
  const csvData = [
      // Add the header row
      mappedHeaders.join(','),
      // Add the data rows
      ...data.map(row => headersToInclude.map(key => {
          const value = row[key];

          // Format specific columns with peso sign
          if (key === 'incomePerHectare' || key === 'profitPerHectare' || key === 'price') {
              return value ? `"₱${parseFloat(value).toFixed(2)}"` : '';
          }
          // Escape and format other values
          return escapeCSVValue(value);
      }).join(','))
  ].join('\n');

  // Create CSV download
  const blob = new Blob([csvData], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  let season = $("#season").val();
  season = season.charAt(0).toUpperCase() + season.slice(1);
  a.download = season + "_" + downloadYR + "_" + filename.charAt(0).toUpperCase() + filename.slice(1) + ".csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  addDownload(filename, 'CSV');
}


function downloadExcel(filename, data) {
  // Define the header mapping
  const headerMap = {
      barangay: 'Barangay / Area',
      cropName: 'Crop Name',
      season: 'Season',
      volumeProductionPerHectare: 'Average Volume Production (mt/ha)',
      incomePerHectare: 'Average Income / ha',
      profitPerHectare: 'Average Profit / ha',
      price: 'Price (kg)',
      pestOccurrence: 'Pest Observed',
      diseaseOccurrence: 'Disease Observed',
      totalPlanted: 'Total Planted',
  };

  // Always include these three headers
  const alwaysIncludedHeaders = ['barangay', 'cropName', 'season'];

  // Dynamically include other headers based on filename
  const additionalHeaders = [];
  
  const filenameLower = filename.toLowerCase();

  if (filenameLower.includes('volumeproductionperhectare')) {
      additionalHeaders.push('volumeProductionPerHectare');
  }
  if (filenameLower.includes('incomeperhectare')) {
      additionalHeaders.push('incomePerHectare');
  }
  if (filenameLower.includes('profitperhectare')) {
      additionalHeaders.push('profitPerHectare');
  }
  if (filenameLower.includes('price')) {
      additionalHeaders.push('price');
  }
  if (filenameLower.includes('pestoccurrence')) {
      additionalHeaders.push('pestOccurrence');
  }
  if (filenameLower.includes('diseaseoccurrence')) {
      additionalHeaders.push('diseaseOccurrence');
  }
  if (filenameLower.includes('totalplanted')) {
      additionalHeaders.push('totalPlanted');
  }

  // Define the order of headers to include (first three + dynamically added)
  const headersToInclude = [...alwaysIncludedHeaders, ...additionalHeaders];

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
          // Format specific columns with peso sign
          if (header === 'incomePerHectare' || header === 'profitPerHectare' || header === 'price') {
              return value ? `₱${parseFloat(value).toFixed(2)}` : '';
          }
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
      let season = $("#season").val();
      season = season.charAt(0).toUpperCase() + season.slice(1)
      a.download = season + "_" + downloadYR + "_" + filename.charAt(0).toUpperCase() + filename.slice(1);
      a.click();
      URL.revokeObjectURL(url);
  });
  addDownload(filename, 'XLSX');
}


function downloadPDF(filename, data) {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();
    const margin = 10; // Margin from the page edges
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    let currentY = margin + 20;

    // Capture a section and return its image data
    function captureSection(selector) {
        return html2canvas(document.querySelector(selector), {
            background: 'transparent',
            useCORS: true,
            scale: 2
        }).then(canvas => canvas.toDataURL('image/png'));
    }

    // Add an image to the PDF
    function addImageToPDF(imgData, x, y, width, height) {
        pdf.addImage(imgData, 'PNG', x, y, width, height, undefined, 'NONE');
    }

    // Add title to the PDF with text size 12
    function addTitle() {
        return new Promise((resolve) => {
            const titleText = document.querySelector('#title').innerText;
            pdf.setFontSize(12); // Set title font size to 12
            pdf.setFont('helvetica', 'bold');
            const titleWidth = pdf.getTextWidth(titleText); // Get the width of the title
            const titleX = (pageWidth - titleWidth) / 2; // Center the title
            pdf.text(titleText, titleX, currentY); // Add title text to PDF
            currentY += 15; // Increase the Y position for the next element
            resolve(); // Resolve the promise
        });
    }

    // Add legend card to the PDF using html2canvas
    function addLegendCard() {
        return captureSection('.legend-card').then(imgData => {
            const legendWidth = 180 / 3;
            const legendHeight = 40 / 3;
            const legendX = (pageWidth - legendWidth) / 2; // Center legend
            addImageToPDF(imgData, legendX, currentY, legendWidth, legendHeight);
            currentY += legendHeight + 10; // Update current Y position
        });
    }

    // Add map to the PDF with adjusted size
    function addMap() {
        return captureSection('#map').then(imgData => {
            const imgWidth = 120; // Adjusted width for the map
            const imgHeight = 90; // Adjusted height for the map
            const mapX = (pageWidth - imgWidth) / 2; // Center the map horizontally
            addImageToPDF(imgData, mapX, currentY, imgWidth, imgHeight);
            currentY += imgHeight + 10; // Update current Y position
        });
    }

    // Add interpretation text as an image to the PDF
    function addInterpretationText() {
        return captureSection('#interpretation').then(imgData => {
            const imgWidth = pageWidth - 2 * margin; // Full width minus margins
            const imgHeight = (imgWidth / 2); // Maintain aspect ratio, adjust height as needed
            const interpretationX = (pageWidth - imgWidth) / 2; // Center horizontally
            addImageToPDF(imgData, interpretationX, currentY, imgWidth, imgHeight);
            currentY += imgHeight + 10; // Update current Y position
        });
    }

    // Add a table to the next page in the PDF
    function addTable() {
        pdf.addPage(); // Start a new page for the table
        const keys = Object.keys(data[0]).filter(key => key !== 'remarks');
        const rows = data.map(item => keys.map(key => item[key]));

        pdf.autoTable({
            head: [['Barangay (Area)', 'Rating']],
            body: rows,
            startY: margin,
            margin: { left: margin, right: margin },
            theme: 'grid',
            styles: {
                cellPadding: 2,
                fontSize: 10 // Smaller font size for table
            },
            headStyles: {
                fillColor: [22, 160, 133], // Custom header color
                textColor: [255, 255, 255] // White text
            },
            alternateRowStyles: {
                fillColor: [240, 240, 240] // Light gray for alternating rows
            }
        });
    }

    // Prepare filename based on the selected season
    let season = $("#season").val();
    season = season.charAt(0).toUpperCase() + season.slice(1);
    filename = season + "_" + downloadYR + "_" + filename.charAt(0).toUpperCase() + filename.slice(1);

    try {
        addTitle() // Add title at the start of the PDF
            .then(addLegendCard) // Add legend card
            .then(addMap) // Add map
            .then(addInterpretationText) // Add interpretation text
            .then(addTable) // Add table on the next page
            .finally(() => pdf.save(filename))
            .catch(err => console.error('Error generating PDF:', err));
    } catch (err) {
        console.error('Error generating PDF:', err);
    }

    addDownload(filename, 'PDF');
}
