import Dialog from '../helpers/Dialog.js';
import { addDownload, getYearRange } from '../../../js/fetch.js';
let productions = [];

class Production {
  constructor(recordId, barangay, cropName, variety, areaPlanted, monthPlanted, monthHarvested, volumeProduction, productionCost, price, volumeSold, season, monthYear) {
    this.recordId = recordId;
    this.barangay = barangay;
    this.cropName = cropName;
    this.variety = variety;
    this.areaPlanted = areaPlanted;
    this.monthPlanted = monthPlanted;
    this.monthHarvested = monthHarvested;
    this.volumeProduction = volumeProduction;
    this.productionCost = productionCost;
    this.volumeSold = volumeSold;
    this.price = price;
    this.season = season;
    this.monthYear = monthYear;
  }

   async addProduction(productions) {

      function chunkArray(array, size) {
          const result = [];
          for (let i = 0; i < array.length; i += size) {
              result.push(array.slice(i, i + size));
          }
          return result;
      }
      const batchSize = 20; // Size of each batch
      const totalRows = productions.length;
      const productionBatches = chunkArray(productions, batchSize);
      
      let processedRows = 0; // Keep track of the number of processed rows

      // Function to update progress message
      const updateProgressMessage = (start, end) => {
          $('#progressMessage').text(`Uploading ${start}-${end}/${totalRows}`);
      };

      // Show the loader and disable user interaction
      $('#loader').show();
      $('body').addClass('no-scroll'); // Optional: Add a class to disable scrolling

      for (const [index, batch] of productionBatches.entries()) {
          const start = processedRows + 1;
          const end = start + batch.length - 1;
          updateProgressMessage(start, end);

          try {
              await $.ajax({
                  url: '/api/productions-batch',
                  method: 'POST',
                  data: {
                      productionData: batch,
                      _token: $('meta[name="csrf-token"]').attr('content')
                  }
              });
              console.log(`Batch ${index + 1} sent successfully:`, batch);
              processedRows += batch.length;
          } catch (xhr) {
              console.error(`Error sending batch ${index + 1}:`, xhr.responseText);
              // Optionally handle the error or retry
          }
      }

      // Hide the loader and re-enable user interaction
      $('#loader').hide();
      $('body').removeClass('no-scroll'); // Remove the class to re-enable scrolling
      toastr.success('File uploaded successfully!', 'Success', {
        timeOut: 5000,  // 5 seconds
        positionClass: 'toast-top-center',
        toastClass: 'toast-success-custom'
      }); 

      getProduction();
  }

    updateProduction(updatedProduction) {
      const existingProduction = productions.find(u => u.productionId === updatedProduction.productionId);

      if (existingProduction && existingProduction.productionId !== updatedProduction.productionId) {
        alert('Production ID already exists');
        return;
      }

      productions = productions.map(production =>
        production.recordId === updatedProduction.recordId ? { ...production, ...updatedProduction } : production
      );

      fetch(`/api/productions/${updatedProduction.productionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedProduction),
      })
        .then(response => response.json())
        .then(data => {
          console.log('Success:', data);
        })
        .catch(error => {
          console.error('Error:', error);
        });
        getProduction();
    }

    removeProduction(productions) {
        $.ajax({
          url: '/api/productionsByRecords',
          method: 'DELETE',
          data: {
              productionData: productions, // Custom key for data
              _token: $('meta[name="csrf-token"]').attr('content')
          },
          success: function(response) {
              console.log(response);
          },
          error: function(xhr) {
              console.error(xhr.responseText);
          }
        });
        getProduction();
    }
  }

async function getProduction() {
  // Fetch productions from Laravel backend
  $.ajaxSetup({
    headers: {
        'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
    }
  });

  $.ajax({
    url: '/api/productions',
    method: 'GET',
    success: function(response) {
        // Assuming response is an array of productions [{...fields...}, ...]
        productions = response;
        console.log('ajax get production');
        console.log(productions);
    },
    error: function(xhr, status, error) {
        console.error('Error fetching productions:', error);
    }
  });
}

function initializeMethodsProduction(){
  
  function searchProduction(searchTerm) {
    const lowerCaseSearchTerm = searchTerm.toLowerCase(); // Convert search term to lowercase for case-insensitive search
    const foundProductions = productions.filter(production => {
      return Object.values(production).some(value => 
        value.toString().toLowerCase().includes(lowerCaseSearchTerm)
      );
    });
    return foundProductions;
  }

  var pageSize = 5;
  var currentPage = 1;

  async function displayProduction(searchTerm = null) {
    // Simulate a delay of 1 second
    await new Promise(resolve => setTimeout(resolve, 3000));

    $('#productionTableBody').empty();

    var startIndex = (currentPage - 1) * pageSize;
    var endIndex = startIndex + pageSize;

    const foundProductions = searchTerm ? searchProduction(searchTerm) : productions;

    if (foundProductions.length > 0) {
      for (var i = startIndex; i < endIndex; i++) {
        if (i >= foundProductions.length) {
          break;
        }
        var production = foundProductions[i];
        $('#productionTableBody').append(`
          <tr data-index=${production.productionId}>
            <td>${production.barangay}</td>
            <td>${production.cropName}</td>
            <td>${production.variety}</td>
            <td>${production.areaPlanted}</td>
            <td>${production.monthPlanted}</td>
            <td>${production.monthHarvested}</td>
            <td>${production.volumeProduction}</td>
            <td>₱${production.productionCost}</td>
            <td>₱${production.price}</td>
            <td>${production.volumeSold}</td>
            <td>${production.season}</td>
            <td>${production.monthYear}</td>
          </tr>
        `);
      }
    } else {
      $('#productionTableBody').append(`
        <tr>
          <td colspan="12">No results found!</td>
        </tr>
      `);
    }

     // Reinitialize tablesorter after adding rows
     $('#productionTable').trigger('update');
  }

  $('#search').on('input', function() {
    let searchTerm = $('#search').val();
    displayProduction(searchTerm);
  });

  // Pagination: Previous button click handler
  $('#prevBtn').click(function() {
    if (currentPage > 1) {
      currentPage--;
      displayProduction($('#search').val());
    }
  });

  // Pagination: Next button click handler
  $('#nextBtn').click(function() {
    var totalPages = Math.ceil((searchProduction($('#search').val()).length) / pageSize);
    if (currentPage < totalPages) {
      currentPage++;
      displayProduction($('#search').val());
    }
  });

  $(document).ready(function() {
    $('.download-btn').click(function() {
        // Call the downloadDialog method and handle the promise
        Dialog.downloadDialog().then(format => {
            console.log(format);
            download(format, productions);
        }).catch(error => {
            console.error('Error:', error);  // Handle any errors that occur
        });
    });
  });
  
  let yearRange = '';
  
  // Fetch year range once and store it
  async function initializeYearRange() {
      yearRange = await getYearRange();
  }
  
  // Call this function when your app or page loads
  initializeYearRange();
  
  // Modified download function that uses the stored yearRange
  function download(format, data) {
      // Construct the filename using the stored yearRange
      const filename = `Production Data ${yearRange}`;
  
      // Call the appropriate download function based on the format
      if (format === 'csv') {
          downloadCSV(filename, data);
      } else if (format === 'xlsx') {
          downloadExcel(filename, data);
      } else if (format === 'pdf') {
          downloadPDF(filename, data);
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
    return value; // Return escaped value
  }
  
  function downloadCSV(filename, data) {
    // Define the header mapping for production data
    const headerMap = {
        barangay: 'Barangay',
        cropName: 'Commodity',
        variety: 'Variety',
        areaPlanted: 'Area Planted (ha)',
        monthPlanted: 'Month Planted',
        monthHarvested: 'Month Harvested',
        volumeProduction: 'Volume of Production (ha)',
        productionCost: 'Cost of Production',
        price: 'Farm Gate Price',
        volumeSold: 'Volume Sold (ha)',
        season: 'Season',
        monthYear: 'Month Year'
    };

    // Define the order of headers
    const headersToInclude = [
        'barangay',
        'cropName',
        'variety',
        'areaPlanted',
        'monthPlanted',
        'monthHarvested',
        'volumeProduction',
        'productionCost',
        'price',
        'volumeSold',
        'season',
        'monthYear'
    ];

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
                let value = row[key] !== undefined ? row[key] : ''; // Ensure non-null values

                // Format specific columns with peso sign
                if (key === 'productionCost' || key === 'price') {
                    return value ? `₱${parseFloat(value).toFixed(2)}` : '';
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
  // Define the header mapping for production data
  const headerMap = {
      barangay: 'Barangay',
      cropName: 'Commodity',
      variety: 'Variety',
      areaPlanted: 'Area Planted (ha)',
      monthPlanted: 'Month Planted',
      monthHarvested: 'Month Harvested',
      volumeProduction: 'Volume of Production (ha)',
      productionCost: 'Cost of Production',
      price: 'Farm Gate Price',
      volumeSold: 'Volume Sold (ha)',
      season: 'Season',
      monthYear: 'Month Year'
  };

  // Define the order of headers
  const headersToInclude = [
      'barangay',
      'cropName',
      'variety',
      'areaPlanted',
      'monthPlanted',
      'monthHarvested',
      'volumeProduction',
      'productionCost',
      'price',
      'volumeSold',
      'season',
      'monthYear'
  ];

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
  const worksheet = workbook.addWorksheet(filename);

  // Add filtered data to the worksheet
  worksheet.addRow(mappedHeaders);
  filteredData.forEach(row => {
      worksheet.addRow(headersToInclude.map(header => {
          const value = row[headerMap[header]];
          // Format specific columns with peso sign
          if (header === 'productionCost' || header === 'price') {
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
          fgColor: { argb: "203764" }
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

function downloadPDF(filename, data) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  // Specify the columns you want to include in the PDF for production data
  const columns = ['barangay', 'cropName', 'variety', 'areaPlanted', 'monthPlanted', 'monthHarvested', 'volumeProduction', 'productionCost', 'price', 'volumeSold', 'season', 'monthYear'];
  const headers = columns.map(formatHeader);

  // Create the table using only the specified columns
  doc.autoTable({
      head: [headers],
      body: data.map(row => 
          columns.map(key => {
              let value = row[key];
              return value;
          })
      ),
      theme: 'striped'
  });

  // Save the PDF with the season selection in the filename
  doc.save(filename);
  addDownload(filename, 'PDF');
}

function formatHeader(key) {
  const headerMap = {
      barangay: 'Barangay',
      cropName: 'Commodity',
      variety: 'Variety',
      areaPlanted: 'Area Planted (ha)',
      monthPlanted: 'Month Planted',
      monthHarvested: 'Month Harvested',
      volumeProduction: 'Volume of Production (ha)',
      productionCost: 'Cost of Production',
      price: 'Farm Gate Price',
      volumeSold: 'Volume Sold (ha)',
      season: 'Season',
      monthYear: 'Month Year'
  };
  return headerMap[key] || key;
}

  getProduction();
  displayProduction();
}


// Function to build and return table rows as an array of Production instances
// Function to build and return table rows as an array of Production instances
async function processProductionData(workbook, cellMappings, id, season, monthYear) {
  // Select the sheet you want to read from
  var sheetName = workbook.SheetNames[0]; // Assuming the first sheet
  var worksheet = workbook.Sheets[sheetName];

  // Find the column index for 'Volume of Production' in cellMappings (or any other key you want to check)
  var productionVolumeColumn = getKeyBySubstring(cellMappings, 'Volume of Production');
  console.log(productionVolumeColumn);

  // Decode the range of the worksheet
  var range = XLSX.utils.decode_range(worksheet['!ref']);
  let productionDatas = [];

  // Loop through rows starting from the first row after the header
  for (var rowNum = range.s.r + 1; rowNum <= range.e.r; rowNum++) {
      // Check if the corresponding row in column 'Volume of Production' has a numeric value or valid range
      var cellAddressProduction = productionVolumeColumn.charAt(0) + (rowNum + 1); // Dynamically construct column 'Volume of Production' cell address
      var cellValueProduction = worksheet[cellAddressProduction] ? worksheet[cellAddressProduction].v : '';

      // Check if the value is numeric or a valid range
      if (!isNumeric(cellValueProduction)) {
          continue; // Skip this row if it doesn't meet the filter criteria
      }

      // Read values based on the defined cell mappings
      var productionData = {};
      Object.keys(cellMappings).forEach(function(key) {
          var cellAddress = cellMappings[key].charAt(0) + (rowNum + 1); // Dynamically construct cell address based on key
          var cellValue = worksheet[cellAddress] ? worksheet[cellAddress].v : '';
          productionData[key] = cellValue; // Store value for the current key in productionData
      });

      // Create a new Production instance
      var production = new Production(
          id,
          getKeyBySubstring(productionData, 'Barangay'),
          getKeyBySubstring(productionData, 'Commodity'),
          getKeyBySubstring(productionData, 'Variety'),
          getKeyBySubstring(productionData, 'Area Planted'),
          getKeyBySubstring(productionData, 'Month Planted'),
          getKeyBySubstring(productionData, 'Month Harvested'),
          getKeyBySubstring(productionData, 'Volume of Production'),
          getKeyBySubstring(productionData, 'Cost of Production'),
          String(getKeyBySubstring(productionData, 'Farm Gate Price')),
          getKeyBySubstring(productionData, 'Volume Sold'),
          season,
          monthYear,
      );

      // Add the new production instance to productionDatas array
      productionDatas.push(production);
  }

  // Check if the record ID already exists in the productionDatas array
  var existingProduction = productions.find(p => p.recordId === productionDatas[0].recordId);

  if (existingProduction) {
      // Remove existing production before adding the new one
      await productionDatas[0].removeProduction(productionDatas);
  }

  productionDatas[0].addProduction(productionDatas);
  return productions;
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

export { Production, getProduction, productions, initializeMethodsProduction, processProductionData };