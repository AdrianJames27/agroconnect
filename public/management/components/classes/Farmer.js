import Dialog from '../helpers/Dialog.js';
import { addDownload } from '../../../js/fetch.js';
// Farmer.js
let farmers = [];
let barangayArray = [];

class Farmer {
  constructor(barangayId, farmerId, farmerName, fieldArea, fieldType, phoneNumber) {
    this.barangayId = barangayId;
    this.farmerId = farmerId;
    this.farmerName = farmerName;
    this.fieldArea = fieldArea;
    this.fieldType = fieldType;
    this.phoneNumber = phoneNumber !== null ? String(phoneNumber) : ' ';

  }

  createFarmer(farmer) {
    const existingFarmer = farmers.find(b => b.farmerName === farmer.farmerName);
    if (existingFarmer) {
      alert('Farmer already exists');
      return;
    }
  
    $.ajax({
      url: '/api/farmers',
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify(farmer),
      success: function(data) {
        console.log('Success:', data);
      },
      error: function(error) {
        console.error('Error:', error);
      }
    });
  }
  
  updateFarmer(updatedFarmer) {
    const existingFarmer = farmers.find(b => b.farmerName === updatedFarmer.farmerName);

    if (existingFarmer && existingFarmer.farmerId !== updatedFarmer.farmerId) {
      alert('Farmer already exists');
      return;
    }

    farmers = farmers.map(farmer =>
        farmer.farmerId === updatedFarmer.farmerId ? { ...farmer, ...updatedFarmer } : farmers
    );

    fetch(`/api/farmers/${updatedFarmer.farmerId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedFarmer),
    })
      .then(response => response.json())
      .then(data => {
        console.log('Success:', data);
      })
      .catch(error => {
        console.error('Error:', error);
      });
  }

  removeFarmer(farmerId) {
    fetch(`/api/farmers/${farmerId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      }
    })
      .then(response => {
        if (response.status === 204) {
          farmers = farmers.filter(farmer => farmer.farmerId !== farmer);
          console.log(`Farmer with ID ${farmerId} deleted.`);
        } else if (response.status === 404) {
          console.error(`Farmer with ID ${farmerId} not found.`);
        } else {
          console.error(`Failed to delete farmer with ID ${farmerId}.`);
        }
      })
      .catch(error => {
        console.error('Error:', error);
      });
  }
}

function getFarmer() {
  // Fetch farmers from Laravel backend
  $.ajaxSetup({
    headers: {
        'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
    }
  });

  // Fetch farmers from Laravel backend
  $.ajax({
    url: '/api/farmers', // Endpoint to fetch farmers
    method: 'GET',
    success: function(response) {
        // Assuming response is an array of farmers 
        let farmer = response;

        farmers = farmer;
        console.log(farmers);
    },
    error: function(xhr, status, error) {
        console.error('Error fetching farmers:', error);
    }
  });
}

getFarmer();

function getBarangayNames() {
    // Fetch barangays from Laravel backend
    $.ajaxSetup({
        headers: {
            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
        }
    });

    // Fetch barangays from Laravel backend
    $.ajax({
        url: '/api/barangays', // Endpoint to fetch barangays
        method: 'GET',
        success: function(response) {
            // Assuming response is an array of barangays 
            const barangays = response;
            barangayArray = barangays;
            console.log(barangays);

            // Populate select dropdown with barangays
            const barangaySelect = $('#barangay-option');
            barangaySelect.empty(); // Clear existing options
            barangaySelect.append(`<option value="" disabled selected>Select Barangay</option>`);
            barangays.forEach(b => {
                barangaySelect.append(`<option value="${b.barangayId}">${b.barangayName}</option>`);
            });
        },
        error: function(xhr, status, error) {
            console.error('Error fetching barangays:', error);
        }
    });
}

function searchFarmer(farmerName) {
  const foundFarmers = farmers.filter(farmer => 
    farmer.farmerName.toLowerCase().includes(farmerName.toLowerCase()));
  return foundFarmers;
}

function getBarangayName(id) {

    // Find the barangay object with the matching ID
    const barangay = barangayArray.find(barangay => barangay.barangayId === id);

    // Return the name of the barangay if found, or null if not found
    return barangay ? barangay.barangayName : null;
}

function getBarangayId(name) {

    // Find the barangay object with the matching ID
    const barangay = barangayArray.find(barangay => barangay.barangaName === name);

    // Return the name of the barangay if found, or null if not found
    return barangay ? barangay.barangayId: null;
}

function initializeMethodsFarmer() {
    var selectedRow = null;
    var pageSize = 5;
    var currentPage = 1;
    var farmer = null;
    var isEdit = false;

    async function displayFarmers(farmerName = null) {

      // Simulate a delay of 1 second
      await new Promise(resolve => setTimeout(resolve, 1000));

      $('#farmerTableBody').empty();
    
      var startIndex = (currentPage - 1) * pageSize;
      var endIndex = startIndex + pageSize;
      if (farmerName) {
        // Display a single farmer if farmerName is provided
          const foundfarmers = searchfarmer(farmerName);
          if (foundfarmers.length > 0) {
            foundfarmers.forEach(farmer => {
              $('#farmerTableBody').append(`
                <tr data-index=${farmer.farmerId}>
                  <td style="display: none;">${farmer.farmerId}</td>
                  <td>${getBarangayName(farmer.barangayId)}</td>
                  <td>${farmer.farmerName}</td>
                  <td>${farmer.fieldArea}</td>
                  <td>${farmer.fieldType}</td>
                  <td>${farmer.phoneNumber !== null ? farmer.phoneNumber : ''}</td>
                </tr>
              `);
            });
          } else {
            // Handle case where farmerName is not provided
            $('#farmerTableBody').append(`
              <tr>
                <td colspan="4">farmer not found!</td>
              </tr>
            `)
          }
      } else {
        // Display paginated farmers if no farmerName is provided
        for (var i = startIndex; i < endIndex; i++) {
          if (i >= farmers.length) {
            break;
          }
          var farmer = farmers[i];
          $('#farmerTableBody').append(`
            <tr data-index=${farmer.farmerId}>
              <td style="display: none;">${farmer.farmerId}</td>
                <td data-barangay-id=${farmer.barangayId}>${getBarangayName(farmer.barangayId)}</td>
                <td>${farmer.farmerName}</td>
                <td>${farmer.fieldArea}</td>
                <td>${farmer.fieldType}</td>
                <td>${farmer.phoneNumber !== null ? farmer.phoneNumber : 'NA'}</td>
                </tr>
            </tr>
          `);
        }
      }
    }
    

    // Display initial farmers
    displayFarmers();

    $('#search').on('input', function() {
      let farmerName = $('#search').val();
      displayFarmers(farmerName);
    });

    // Pagination: Previous button click handler
    $('#prevBtn').click(function() {
      if (currentPage > 1) {
        currentPage--;
        displayFarmers();
      }
    });

    // Pagination: Next button click handler
    $('#nextBtn').click(function() {
      var totalPages = Math.ceil(farmers.length / pageSize);
      if (currentPage < totalPages) {
        currentPage++;
        displayFarmers();
      }
    });

    // Form submission handler (Add or Update farmer)
    $('#submitBtn').click(function(event) {
      event.preventDefault();

      var farmerId = Number($('#farmerId').val());
      var farmerName = $('#farmerName').val();
      var fieldArea = parseInt($('#fieldArea').val(), 10);
      var fieldType= $('#fieldType').val();
      var phoneNumber= $('#phoneNumber').val();
      var barangayId = parseInt($('#barangay-option').val(), 10);
      if (selectedRow !== null && isEdit) {

        let farmer = new Farmer(barangayId, farmerId, farmerName, fieldArea, fieldType, phoneNumber);
        console.log(farmer);
        farmer.updateFarmer(farmer);
        selectedRow = null;
        $('#submitBtn').text('Add farmer');
        $('#cancelBtn').hide(); 
        resetFields();
        isEdit = false;
      } else {
        let farmer = new Farmer(barangayId, farmerId, farmerName, fieldArea, fieldType, phoneNumber);
        console.log(farmer);
        farmer.createFarmer(farmer);
      }

      // Clear form fields after submission
      $('#farmerForm')[0].reset();
      selectedRow = null;
      $('#farmerTableBody tr').removeClass('selected-row');
      $('#editBtn').prop('disabled', true);
      $('#deleteBtn').prop('disabled', true);
      getFarmer();
      displayFarmers();
    });

    function resetFields() {
      // Reset UI states
      $('#editBtn').prop('disabled', true);
      $('#deleteBtn').prop('disabled', true);
      selectedRow = null;
      $('#farmerTableBody tr').removeClass('selected-row');
    }

    $('#editBtn').click(async function() { 
      // Open the confirmation dialog
      const result = await Dialog.confirmDialog(
          "Confirm Edit",
          "Are you sure you want to edit this farmer's details?"
      );
  
      // Check if the user clicked OK
      if (result.operation === 1) {
          // Proceed with editing
          $('#editModal').modal('hide');
          $('#cancelBtn').show();
          $('#farmerId').val(farmer.farmerId);
          $('#farmerName').val(farmer.farmerName);
          $('#fieldArea').val(farmer.fieldArea);
          $('#fieldType').val(farmer.fieldType);
          $('#phoneNumber').val(farmer.phoneNumber);
          $('#barangay-option').val(farmer.barangayId);
          $('#submitBtn').text('Update Farmer');
      } else {
          // If Cancel is clicked, do nothing or add additional handling if needed
          console.log("Edit action was canceled.");
      }
      $('#farmerTableBody tr').removeClass('selected-row');
      $('#editBtn').prop('disabled', true);
      $('#deleteBtn').prop('disabled', true);
  });
  
  $('#cancelEdit').click(function() {
      resetFields();
  });
  

    // Cancel button click handler
    $('#cancelBtn').click(function() {
   
      selectedRow = null;
      $('#farmerForm')[0].reset();
      $('#submitBtn').text('Add Farmer');
      $('#cancelBtn').hide();
      $('#farmerTableBody tr').removeClass('selected-row');
      $('#editBtn').prop('disabled', true);
      $('#deleteBtn').prop('disabled', true);
    });

    $('#deleteBtn').click(async function() {
      // Open the confirmation dialog
      const result = await Dialog.confirmDialog(
          "Confirm Deletion",
          "Are you sure you want to delete this farmer?"
      );
  
      // Check if the user clicked OK
      if (result.operation === 1) {
          // Proceed with deletion
          let farmerToDelete = new Farmer();
          farmerToDelete.removeFarmer(farmer.farmerId);
          getFarmer();
          displayFarmers();
          resetFields();
          isEdit = true;
      } else {
          // If Cancel is clicked, do nothing or add additional handling if needed
          console.log("Delete action was canceled.");
          $('#editBtn').prop('disabled', true);
          $('#deleteBtn').prop('disabled', true);
      }
  });
  
  $('#cancelDelete').click(function() {
      resetFields();
  });
  

// Row click handler (for selecting rows)
$('#farmerTableBody').on('click', 'tr', function() {
    var $this = $(this);
    var farmerId = $this.data('index');
    farmer = farmers.find(u => u.farmerId === farmerId);
    selectedRow = farmerId;
    // Highlight selected row
    if (selectedRow !== null) {
    $('#farmerTableBody tr').removeClass('selected-row');
    $('#farmerTableBody tr').filter(function() {
      return parseInt($(this).find('td:eq(0)').text(), 10) === selectedRow;
    }).addClass('selected-row');
    $('#editBtn').prop('disabled', false);
    $('#deleteBtn').prop('disabled', false);
  } else {
    $('#farmerTableBody tr').removeClass('selected-row');
  }

});

$(document).ready(function() {
  $('.download-btn').click(function() {
      // Call the downloadDialog method and handle the promise
      Dialog.downloadDialog().then(format => {
          console.log(format);
          download(format, farmers);
      }).catch(error => {
          console.error('Error:', error);  // Handle any errors that occur
      });
  });
});

function download(format, data) {
  const filename = `FARMER MASTERLIST`;
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
  // Define the header mapping for farmer data
  const headerMap = {
      barangayId: 'Barangay',
      farmerName: 'Farmer Name',
      fieldArea: 'Field Area',
      fieldType: 'Field Type',
      phoneNumber: 'Phone Number'
  };

  // Define the order of headers
  const headersToInclude = [
      'barangayId',
      'farmerName',
      'fieldArea',
      'fieldType',
      'phoneNumber'
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
      headers.join(','), // Add the header row
      ...data.map(row =>
          headersToInclude.map(key => {
              let value = row[key] !== undefined ? row[key] : ''; // Ensure non-null values

              // Replace 'barangayId' with corresponding barangay name
              if (key === 'barangayId' && value !== '') {
                  value = getBarangayName(value);
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
  // Define the header mapping for farmer data
  const headerMap = {
      barangayId: 'Barangay',
      farmerName: 'Farmer Name',
      fieldArea: 'Field Area',
      fieldType: 'Field Type',
      phoneNumber: 'Phone Number'
  };

  // Define the order of headers
  const headersToInclude = [
      'barangayId',
      'farmerName',
      'fieldArea',
      'fieldType',
      'phoneNumber'
  ];

  // Map headers to the desired names
  const mappedHeaders = headersToInclude.map(key => headerMap[key]);

  // Filter data to match the new headers
  const filteredData = data.map(row => {
      const filteredRow = {};
      headersToInclude.forEach(key => {
          // Replace 'barangayId' with the corresponding barangay name
          filteredRow[headerMap[key]] = key === 'barangayId' ? getBarangayName(row[key]) : row[key];
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
          return row[headerMap[header]] !== undefined ? row[headerMap[header]] : '';
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

  // Specify the columns you want to include in the PDF for farmer data
  const columns = ['barangayId', 'farmerName', 'fieldArea', 'fieldType', 'phoneNumber'];
  const headers = columns.map(formatHeader);

  // Create the table using only the specified columns
  doc.autoTable({
      head: [headers],
      body: data.map(row => 
          columns.map(key => key === 'barangayId' ? getBarangayName(row[key]) : row[key])
      ),
      theme: 'striped'
  });

  // Save the PDF with the season selection in the filename
  doc.save(filename);
  addDownload(filename, 'PDF');
}

function formatHeader(key) {
  const headerMap = {
      barangayId: 'Barangay',
      farmerName: 'Farmer Name',
      fieldArea: 'Field Area',
      fieldType: 'Field Type',
      phoneNumber: 'Phone Number'
  };
  return headerMap[key] || key;
}

}

export { Farmer, getFarmer, searchFarmer, farmers, barangayArray, initializeMethodsFarmer, getBarangayId, getBarangayNames };