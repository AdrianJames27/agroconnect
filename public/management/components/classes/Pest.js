import Dialog from '../helpers/Dialog.js';
import { addDownload, getYearRange } from '../../../js/fetch.js';
let pests = [];

class Pest {
    constructor(recordId, barangay, cropName, pestName, totalPlanted, totalAffected, season, monthYear) {
      this.recordId = recordId;
      this.barangay = barangay;
      this.cropName = cropName;
      this.pestName = pestName;
      this.totalPlanted = totalPlanted;
      this.totalAffected = totalAffected;
      this.season = season;
      this.monthYear = monthYear;
    }
  
    async addPest(pests) {
      console.log(pests);
  
      $.ajax({
        url: '/api/pests-batch',
        method: 'POST',
        data: {
          pestData: pests, // Custom key for data
          _token: $('meta[name="csrf-token"]').attr('content')
        },
        success: function(response) {
          console.log(response);
        },
        error: function(xhr) {
          console.error(xhr.responseText);
        }
      });
  
      getPests();
    }
  
    updatePest(updatedPest) {
      const existingPest = pests.find(u => u.recordId === updatedPest.recordId);
  
      if (existingPest && existingPest.recordId !== updatedPest.recordId) {
        alert('Pest record ID already exists');
        return;
      }
  
      pests = pests.map(pest =>
        pest.recordId === updatedPest.recordId ? { ...pest, ...updatedPest } : pest
      );
  
      fetch(`/api/pests/${updatedPest.recordId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedPest),
      })
        .then(response => response.json())
        .then(data => {
          console.log('Success:', data);
        })
        .catch(error => {
          console.error('Error:', error);
        });
      getPests();
    }
  
    removePest(pests) {
      $.ajax({
        url: '/api/pestsByRecords',
        method: 'DELETE',
        data: {
          pestData: pests, // Custom key for data
          _token: $('meta[name="csrf-token"]').attr('content')
        },
        success: function(response) {
          console.log(response);
        },
        error: function(xhr) {
          console.error(xhr.responseText);
        }
      });
      getPests();
    }
  }
  
  function getPests() {
    // Fetch pests from Laravel backend
    $.ajaxSetup({
      headers: {
        'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
      }
    });
  
    $.ajax({
      url: '/api/pests',
      method: 'GET',
      success: function(response) {
        pests = response;
        console.log(pests);
      },
      error: function(xhr, status, error) {
        console.error('Error fetching pests:', error);
      }
    });
  }
  
  function initializeMethodsPest() {

    function searchPest(searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase(); // Convert search term to lowercase for case-insensitive search
      const foundPests = pests.filter(pest => {
        return Object.values(pest).some(value => 
          value.toString().toLowerCase().includes(lowerCaseSearchTerm)
        );
      });
      return foundPests;
    }
  
    var pageSize = 5;
    var currentPage = 1;
  
    async function displayPest(searchTerm = null) {
      // Simulate a delay of 1 second
      await new Promise(resolve => setTimeout(resolve, 1000));
  
      $('#pestTableBody').empty();
  
      var startIndex = (currentPage - 1) * pageSize;
      var endIndex = startIndex + pageSize;
  
      const foundPests = searchTerm ? searchPest(searchTerm) : pests;
  
      if (foundPests.length > 0) {
        for (var i = startIndex; i < endIndex; i++) {
          if (i >= foundPests.length) {
            break;
          }
          var pest = foundPests[i];
          $('#pestTableBody').append(`
            <tr data-index=${pest.pestId}>
              <td>${pest.barangay}</td>
              <td>${pest.cropName}</td>
              <td>${pest.pestName}</td>
              <td>${pest.totalPlanted}</td>
              <td>${pest.totalAffected}</td>
              <td>${pest.season}</td>
              <td>${pest.monthYear}</td>
            </tr>
          `);
        }
      } else {
        $('#pestTableBody').append(`
          <tr>
            <td colspan="7">No results found!</td>
          </tr>
        `);
      }

      // Reinitialize tablesorter after adding rows
      $('#pestTable').trigger('update');
    }
  
    $('#search').on('input', function() {
      let searchTerm = $('#search').val();
      displayPest(searchTerm);
    });
  
    // Pagination: Previous button click handler
    $('#prevBtn').click(function() {
      if (currentPage > 1) {
        currentPage--;
        displayPest($('#search').val());
      }
    });
  
    // Pagination: Next button click handler
    $('#nextBtn').click(function() {
      var totalPages = Math.ceil((searchPest($('#search').val()).length) / pageSize);
      if (currentPage < totalPages) {
        currentPage++;
        displayPest($('#search').val());
      }
    });

    $(document).ready(function() {
      $('.download-btn').click(function() {
          // Call the downloadDialog method and handle the promise
          Dialog.downloadDialog().then(format => {
              console.log(format);
              download(format, pests);
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
        const filename = `Pests Data ${yearRange}`;
    
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
      // Define the header mapping for pest data
      const headerMap = {
          barangay: 'Barangay',
          cropName: 'Crops Planted',
          pestName: 'Pest Observed',
          totalPlanted: 'Total no. of Trees/Plants Planted',
          totalAffected: 'Total no. of Trees/Plants Affected/Damaged',
          season: 'Season'
      };
  
      // Define the order of headers
      const headersToInclude = [
          'barangay',
          'cropName',
          'pestName',
          'totalPlanted',
          'totalAffected',
          'season'
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
  
      // Filter data to match the new headers
      const csvRows = [
          headers.join(','),
          ...data.map(row => 
              headersToInclude.map(key => {
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
    // Define the header mapping for pest data
    const headerMap = {
        barangay: 'Barangay',
        cropName: 'Crops Planted',
        pestName: 'Pest Observed',
        totalPlanted: 'Total no. of Trees/Plants Planted',
        totalAffected: 'Total no. of Trees/Plants Affected/Damaged',
        season: 'Season'
    };

    console.log(data);

    // Define the order of headers
    const headersToInclude = [
        'barangay',
        'cropName',
        'totalPlanted',
        'totalAffected',
        'pestName',
        'season'
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

  // Specify the columns you want to include in the PDF for pest data
  const columns = ['barangay', 'cropName', 'pestName', 'totalPlanted', 'totalAffected', 'season'];
  const headers = columns.map(formatHeader);

  // Create the table using only the specified columns
  doc.autoTable({
      head: [headers],
      body: data.map(row => 
          columns.map(key => row[key])
      ),
      theme: 'striped'
  });

  // Save the PDF with the filename
  doc.save(filename);
  addDownload(filename, 'PDF');
}

function formatHeader(key) {
  const headerMap = {
      barangay: 'Barangay',
      cropName: 'Crops Planted',
      pestName: 'Pest Observed',
      totalPlanted: 'Total no. of Trees/Plants Planted',
      totalAffected: 'Total no. of Trees/Plants Affected/Damaged',
      season: 'Season'
  };
  return headerMap[key] || key;
}


  
    getPests();
    displayPest();
  }
  
  
  async function processPestData(workbook, cellMappings, id, season, monthYear) {
    // Select the sheet you want to read from
    var sheetName = workbook.SheetNames[0]; // Assuming the first sheet
    var worksheet = workbook.Sheets[sheetName];   

    // Find the column index for 'Pest Observed' in cellMappings
    var pestColumn = getKeyBySubstring(cellMappings, 'Pest Observed');
    console.log(pestColumn);

    // Decode the range of the worksheet
    var range = XLSX.utils.decode_range(worksheet['!ref']);
    let pestDatas = [];

    // Loop through rows starting from the first row after the header
    for (var rowNum = range.s.r + 1; rowNum <= range.e.r; rowNum++) {
        // Check if the corresponding row in column 'Pest Observed' has a non-empty value
        var cellAddressPest = pestColumn.charAt(0) + (rowNum + 1); // Dynamically construct column 'Pest Observed' cell address
        var cellValuePest = worksheet[cellAddressPest] ? worksheet[cellAddressPest].v : '';

        // Skip rows where 'Pest Observed' is empty
        if (cellValuePest === '' || cellValuePest === 'None') {
            continue; // Skip this row if it doesn't meet the filter criteria
        }

        // Find the index of the column to the right of 'Pest Observed'
        var pestColumnIndex = XLSX.utils.decode_cell(pestColumn + '1').c;
        var totalPlantedColumn = XLSX.utils.encode_col(pestColumnIndex + 1) + (rowNum + 1); // Column to the right
        var totalAffectedColumn = XLSX.utils.encode_col(pestColumnIndex + 2) + (rowNum + 1); // Column to the next right

        // Read values based on the defined cell mappings
        var pestData = {};
        Object.keys(cellMappings).forEach(function(key) {
            var cellAddress = cellMappings[key].charAt(0) + (rowNum + 1); // Dynamically construct cell address based on key
            var cellValue = worksheet[cellAddress] ? worksheet[cellAddress].v : '';
            pestData[key] = cellValue; // Store value for the current key in pestData
        });

        // Add the values of 'Total no. of Trees/Plants Planted' and 'Total no. of Trees/Plants Affected/Damaged'
        pestData['TotalPlanted'] = worksheet[totalPlantedColumn] ? worksheet[totalPlantedColumn].v : 0;
        pestData['TotalAffected'] = worksheet[totalAffectedColumn] ? worksheet[totalAffectedColumn].v : 0;

        // Create a new Pest instance
        var pest = new Pest(
            id,
            getKeyBySubstring(pestData, 'Farm Location'),
            getKeyBySubstring(pestData, 'Crops Planted'),
            getKeyBySubstring(pestData, 'Pest Observed'),
            pestData['TotalPlanted'] || 0,
            pestData['TotalAffected'] || 0,
            season,
            monthYear,
        );

        // Add the new pest instance to pestDatas array
        pestDatas.push(pest);
    }

    if (pestDatas.length !== 0) {

      // Check if the record ID already exists in the pestDatas array
      var existingPest = pests.find(p => p.recordId === pestDatas[0].recordId);

      if (existingPest) {
          // Remove existing pest before adding the new one
          await pestDatas[0].removePest(pestDatas);
      }

      pestDatas[0].addPest(pestDatas.slice(2));
    }
    return pests;
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

  export { Pest, getPests, pests, initializeMethodsPest, processPestData };