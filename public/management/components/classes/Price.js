import Dialog from '../helpers/Dialog.js';
import { addDownload, getYearRange } from '../../../js/fetch.js';
let prices = [];

class Price {
  constructor(recordId, cropName, price, season, monthYear) {
    this.recordId = recordId;
    this.cropName = cropName;
    this.price = price;
    this.season = season;
    this.monthYear = monthYear;
  }

    async addPrice(prices) {
      function chunkArray(array, size) {
          const result = [];
          for (let i = 0; i < array.length; i += size) {
              result.push(array.slice(i, i + size));
          }
          return result;
      }

      const batchSize = 20; // Size of each batch
      const totalRows = prices.length;
      const priceBatches = chunkArray(prices, batchSize);

      let processedRows = 0; // Keep track of the number of processed rows

      // Function to update progress message
      const updateProgressMessage = (start, end) => {
          $('#progressMessage').text(`Uploading ${start}-${end}/${totalRows}`);
      };

      // Show the loader and disable user interaction
      $('#loader').show();
      $('body').addClass('no-scroll'); // Optional: Add a class to disable scrolling

      for (const [index, batch] of priceBatches.entries()) {
          const start = processedRows + 1;
          const end = start + batch.length - 1;
          updateProgressMessage(start, end);

          try {
              await $.ajax({
                  url: '/api/prices-batch',
                  method: 'POST',
                  data: {
                      priceData: batch,
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
      toastr.success('Prices uploaded successfully!', 'Success', {
          timeOut: 5000,  // 5 seconds
          positionClass: 'toast-top-center',
          toastClass: 'toast-success-custom'
      });

      getPrices();
  }


  updatePrice(updatedPrice) {
    const existingPrice = prices.find(p => p.recordId === updatedPrice.recordId);

    if (existingPrice && existingPrice.recordId !== updatedPrice.recordId) {
      alert('Price ID already exists');
      return;
    }

    prices = prices.map(price =>
      price.recordId === updatedPrice.recordId ? { ...price, ...updatedPrice } : price
    );

    fetch(`/api/prices/${updatedPrice.recordId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedPrice),
    })
      .then(response => response.json())
      .then(data => {
        console.log('Success:', data);
      })
      .catch(error => {
        console.error('Error:', error);
      });
    getPrices();
  }

  removePrice(prices) {
    $.ajax({
      url: '/api/pricesByRecords',
      method: 'DELETE',
      data: {
        priceData: prices, // Custom key for data
        _token: $('meta[name="csrf-token"]').attr('content')
      },
      success: function(response) {
        console.log(response);
      },
      error: function(xhr) {
        console.error(xhr.responseText);
      }
    });
    getPrices();
  }
}

function getPrices() {
  // Fetch prices from Laravel backend
  $.ajaxSetup({
    headers: {
      'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
    }
  });

  $.ajax({
    url: '/api/prices',
    method: 'GET',
    success: function(response) {
      // Assuming response is an array of prices [{...fields...}, ...]
      prices = response;
      console.log(prices);
    },
    error: function(xhr, status, error) {
      console.error('Error fetching prices:', error);
    }
  });
}

function initializeMethodsPrice() {

  function searchPrice(searchTerm) {
    const lowerCaseSearchTerm = searchTerm.toLowerCase(); // Convert search term to lowercase for case-insensitive search
    const foundPrices = prices.filter(price => {
      return Object.values(price).some(value => 
        value.toString().toLowerCase().includes(lowerCaseSearchTerm)
      );
    });
    return foundPrices;
  }

  var pageSize = 5;
  var currentPage = 1;

  async function displayPrice(searchTerm = null) {
    // Simulate a delay of 1 second
    await new Promise(resolve => setTimeout(resolve, 1000));

    $('#priceTableBody').empty();

    var startIndex = (currentPage - 1) * pageSize;
    var endIndex = startIndex + pageSize;

    const foundPrices = searchTerm ? searchPrice(searchTerm) : prices;

    if (foundPrices.length > 0) {
      for (var i = startIndex; i < endIndex; i++) {
        if (i >= foundPrices.length) {
          break;
        }
        var price = foundPrices[i];
        $('#priceTableBody').append(`
          <tr data-index=${price.priceId}>
            <td>${price.cropName}</td>
            <td>₱${price.price}</td>
            <td>${price.season}</td>
            <td>${price.monthYear}</td>
          </tr>
        `);
      }
    } else {
      $('#priceTableBody').append(`
        <tr>
          <td colspan="4">No results found!</td>
        </tr>
      `);
    }

     // Reinitialize tablesorter after adding rows
     $('#priceTable').trigger('update');
  }

  $('#search').on('input', function() {
    let searchTerm = $('#search').val();
    displayPrice(searchTerm);
  });

  // Pagination: Previous button click handler
  $('#prevBtn').click(function() {
    if (currentPage > 1) {
      currentPage--;
      displayPrice($('#search').val());
    }
  });

  // Pagination: Next button click handler
  $('#nextBtn').click(function() {
    var totalPages = Math.ceil((searchPrice($('#search').val()).length) / pageSize);
    if (currentPage < totalPages) {
      currentPage++;
      displayPrice($('#search').val());
    }
  });

  $(document).ready(function() {
    $('.download-btn').click(function() {
        // Call the downloadDialog method and handle the promise
        Dialog.downloadDialog().then(format => {
            console.log(format);
            download(format, prices);
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
      const filename = `Prices Data ${yearRange}`;
  
      // Call the appropriate download function based on the format
      if (format === 'csv') {
          downloadCSV(filename, data);
      } else if (format === 'xlsx') {
          downloadExcel(filename, data);
      } else if (format === 'pdf') {
          downloadPDF(filename, data);
      }
  }

  function downloadCSV(filename, data) {
    // Define the header mapping for price data
    const headerMap = {
        cropName: 'Commodity',
        price: 'Farm Gate Price',
        season: 'Season',
        monthYear: 'Month Year'
    };

    // Define the order of headers
    const headersToInclude = [
        'cropName',
        'price',
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
                if (key === 'price') {
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
  // Define the header mapping for price data
  const headerMap = {
      cropName: 'Commodity',
      price: 'Farm Gate Price',
      season: 'Season',
      monthYear: 'Month Year'
  };

  // Define the order of headers
  const headersToInclude = [
      'cropName',
      'price',
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
          if (header === 'price') {
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

  // Specify the columns you want to include in the PDF for price data
  const columns = ['cropName', 'price', 'season', 'monthYear'];
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

  // Save the PDF with the filename
  doc.save(filename);
  addDownload(filename, 'PDF');
}

function formatHeader(key) {
  const headerMap = {
      cropName: 'Commodity',
      price: 'Farm Gate Price',
      season: 'Season',
      monthYear: 'Month Year'
  };
  return headerMap[key] || key;
}


  getPrices();
  displayPrice();
}

// Function to check if the data is numeric or a valid range
function isNumeric(data) {
  // Check if the data is a single number
  if (!isNaN(data) && !isNaN(parseFloat(data))) {
      return true;
  }

  // Check if the data is a range in the format 'number-number'
  const rangePattern = /^\d+-\d+$/;
  if (rangePattern.test(data)) {
      const [start, end] = data.split('-').map(Number);
      // Ensure both parts of the range are valid numbers and the range is valid
      if (!isNaN(start) && !isNaN(end) && start <= end) {
          return true;
      }
  }

  // If neither check passed, return false
  return false;
}

// Function to build and return table rows as an array of Price instances
async function processPriceData(workbook, cellMappings, id, season, monthYear) {
  // Select the sheet you want to read from
  var sheetName = workbook.SheetNames[0]; // Assuming the first sheet
  var worksheet = workbook.Sheets[sheetName];   

  // Find the column index for 'Price' in cellMappings
  var priceColumn = getKeyBySubstring(cellMappings, 'Farm Gate Price');
  console.log(priceColumn);

  // Decode the range of the worksheet
  var range = XLSX.utils.decode_range(worksheet['!ref']);
  let priceDatas = [];

  // Loop through rows starting from the first row after the header
  for (var rowNum = range.s.r + 1; rowNum <= range.e.r; rowNum++) {
      // Check if the corresponding row in column 'Price' has a numeric value or valid range
      var cellAddressPrice = priceColumn.charAt(0) + (rowNum + 1); // Dynamically construct column 'Price' cell address
      var cellValuePrice = worksheet[cellAddressPrice] ? worksheet[cellAddressPrice].v : '';

      // Check if the value is numeric or a valid range
      if (!isNumeric(cellValuePrice)) {
          continue; // Skip this row if it doesn't meet the filter criteria
      }

      // Read values based on the defined cell mappings
      var priceData = {};
      Object.keys(cellMappings).forEach(function(key) {
          var cellAddress = cellMappings[key].charAt(0) + (rowNum + 1); // Dynamically construct cell address based on key
          
          var cellValue = worksheet[cellAddress] ? worksheet[cellAddress].v : '';
          priceData[key] = cellValue; // Store value for the current key in priceData
      });

      // Create a new Price instance
      var price = new Price(
          id,
          getKeyBySubstring(priceData, 'Commodity'),
          String(getKeyBySubstring(priceData, 'Farm Gate Price')),
          season,
          monthYear,
      );

      // Add the new price instance to priceDatas array using addPrice method
      priceDatas.push(price);
  }

  // Check if the record ID already exists in the priceDatas array
  var existingPrice = prices.find(p => p.recordId === priceDatas[0].recordId);

  if (existingPrice) {
      // Remove existing price before adding the new one
      await priceDatas[0].removePrice(priceDatas);
  }

  priceDatas[0].addPrice(priceDatas);
  return prices;
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
export { Price, getPrices, prices, initializeMethodsPrice, processPriceData };