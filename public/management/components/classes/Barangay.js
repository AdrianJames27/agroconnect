import Dialog from '../helpers/Dialog.js';

// Barangay.js
let barangays = [];

class Barangay {
  constructor(barangayId, barangayName, coordinates) {
    this.barangayId = barangayId;
    this.barangayName = barangayName;
    //get from leaflet
    this.coordinates = coordinates;
  }

  createBarangay(barangay) {
    const existingBarangay = barangays.find(b => b.barangayName === barangay.barangayName);
    if (existingBarangay) {
      alert('Barangay already exists');
      return;
    }

    fetch('/api/barangays', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(barangay),
    })
      .then(response => response.json())
      .then(data => {
        console.log('Success:', data);
      })
      .catch(error => {
        console.error('Error:', error);
      });
  }

  updateBarangay(updatedBarangay) {
    const existingBarangay = barangays.find(b => b.barangayName === updatedBarangay.barangayName);

    if (existingBarangay && existingBarangay.barangayId !== updatedBarangay.barangayId) {
      alert('Barangay already exists');
      return;
    }

    barangays = barangays.map(barangay =>
        barangay.barangayId === updatedBarangay.barangayId ? { ...barangay, ...updatedBarangay } : barangays
    );

    fetch(`/api/barangays/${updatedBarangay.barangayId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedBarangay),
    })
      .then(response => response.json())
      .then(data => {
        console.log('Success:', data);
      })
      .catch(error => {
        console.error('Error:', error);
      });
  }

  removeBarangay(barangayId) {
    fetch(`/api/barangays/${barangayId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      }
    })
      .then(response => {
        if (response.status === 204) {
          barangays = barangays.filter(barangay => barangay.barangayId !== barangay);
          console.log(`Barangay with ID ${barangayId} deleted.`);
        } else if (response.status === 404) {
          console.error(`Barangay with ID ${barangayId} not found.`);
        } else {
          console.error(`Failed to delete barangay with ID ${barangayId}.`);
        }
      })
      .catch(error => {
        console.error('Error:', error);
      });
  }
}

function getBarangay() {
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
        let barangay = response;

        barangays = barangay;
        console.log(barangays);
    },
    error: function(xhr, status, error) {
        console.error('Error fetching barangays:', error);
    }
  });
}

getBarangay();

async function fetchCoordinates(locationName) {
  locationName = `${locationName}, Cabuyao, Laguna, Philippines`;
  console.log(locationName);
  const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationName)}`);
  const data = await response.json();
  if (data && data.length > 0) {
    return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
  }
  return null;
}

async function getCoordinates(locationName) {
  const coordinates = await fetchCoordinates(locationName);
  if (coordinates) {
    const formattedCoordinates = `${coordinates[0]},${coordinates[1]}`;
    console.log(`Coordinates: ${formattedCoordinates}`);
    return formattedCoordinates;
  } else {
    console.log('Location not found.');
    return 'Location not found.';
  }
}

function searchBarangay(barangayName) {
  const foundBarangays = barangays.filter(barangay => 
    barangay.barangayName.toLowerCase().includes(barangayName.toLowerCase()));
  return foundBarangays;
}

function initializeMethodsBarangay() {
    var selectedRow = null;
    var pageSize = 5;
    var currentPage = 1;
    var barangay = null;
    var isEdit = false;

    async function displayBarangays(barangayName = null) {

      // Simulate a delay of 1 second
      await new Promise(resolve => setTimeout(resolve, 1000));

      $('#barangayTableBody').empty();
    
      var startIndex = (currentPage - 1) * pageSize;
      var endIndex = startIndex + pageSize;
      if (barangayName) {
        // Display a single barangay if barangayName is provided
          const foundbarangays = searchbarangay(barangayName);
          if (foundbarangays.length > 0) {
            foundbarangays.forEach(barangay => {
              $('#barangayTableBody').append(`
                <tr data-index=${barangay.barangayId}>
                  <td style="display: none;">${barangay.barangayId}</td>
                  <td>${barangay.barangayName}</td>
                  <td>${barangay.coordinates}</td>
                </tr>
              `);
            });
          } else {
            // Handle case where barangayName is not provided
            $('#barangayTableBody').append(`
              <tr>
                <td colspan="4">barangay not found!</td>
              </tr>
            `)
          }
      } else {
        // Display paginated barangays if no barangayName is provided
        for (var i = startIndex; i < endIndex; i++) {
          if (i >= barangays.length) {
            break;
          }
          var barangay = barangays[i];
          $('#barangayTableBody').append(`
            <tr data-index=${barangay.barangayId}>
              <td style="display: none;">${barangay.barangayId}</td>
              <td>${barangay.barangayName}</td>
              <td>${barangay.coordinates}</td>
            </tr>
          `);
        }
      }
    }
    

    // Display initial barangays
    displayBarangays();

    $('#search').on('input', function() {
      let barangayName = $('#search').val();
      displaybarangays(barangayName);
    });

    // Pagination: Previous button click handler
    $('#prevBtn').click(function() {
      if (currentPage > 1) {
        currentPage--;
        displaybarangays();
      }
    });

    // Pagination: Next button click handler
    $('#nextBtn').click(function() {
      var totalPages = Math.ceil(barangays.length / pageSize);
      if (currentPage < totalPages) {
        currentPage++;
        displayBarangays();
      }
    });

    // Form submission handler (Add or Update barangay)
    $('#submitBtn').click(function(event) {
      event.preventDefault();

      var barangayId = Number($('#barangayId').val());
      var barangayName = $('#barangayName').val();
      if (selectedRow !== null && isEdit) {
        // Update existing barangay
        getCoordinates(barangayName).then(result => {
          coordinates = result; 
          if (coordinates === 'Location not found.') {
            alert('Unknown location in Cabuyao');
            return;
          } 
          let barangay = new Barangay(barangayId, barangayName, coordinates);
          barangay.updateBarangay(barangay);
          getBarangay();
          displayBarangays();
        });
        selectedRow = null;
        $('#submitBtn').text('Add barangay');
        $('#cancelBtn').hide(); 
        resetFields();
        isEdit = false;
      } else {
        var coordinates = '';
        getCoordinates(barangayName).then(result => {
          coordinates = result; 
          if (coordinates === 'Location not found.') {
            alert('Unknown location in Cabuyao');
            return;
          } 
          let barangay = new Barangay(barangayId, barangayName, coordinates);
          barangay.createBarangay(barangay);
          getBarangay();
          displayBarangays();
        });
      }

      // Clear form fields after submission
      $('#barangayForm')[0].reset();
      selectedRow = null;
      $('#barangayTableBody tr').removeClass('selected-row');
      $('#editBtn').prop('disabled', true);
      $('#deleteBtn').prop('disabled', true);
    });

    function resetFields() {
      // Reset UI states
      $('#editBtn').prop('disabled', true);
      $('#deleteBtn').prop('disabled', true);
      selectedRow = null;
      $('#barangayTableBody tr').removeClass('selected-row');
    }

    $('#editBtn').click(async function() { 
      // Open the confirmation dialog
      const result = await Dialog.confirmDialog(
          "Confirm Edit",
          "Are you sure you want to edit this barangay's details?"
      );
  
      // Check if the user clicked OK
      if (result.operation === 1) { 
          $('#editModal').modal('hide');
          $('#cancelBtn').show();
          $('#barangayId').val(barangay.barangayId);
          $('#barangayName').val(barangay.barangayName);
          $('#submitBtn').text('Update Barangay');
          isEdit = true;
      }
      $('#barangayTableBody tr').removeClass('selected-row');
      $('#editBtn').prop('disabled', true);
      $('#deleteBtn').prop('disabled', true);
  });
  
  // Cancel button click handler
  $('#cancelEdit').click(function() {
      resetFields();
  });
  

    // Cancel button click handler
    $('#cancelBtn').click(function() {
      selectedRow = null;
      $('#barangayForm')[0].reset();
      $('#submitBtn').text('Add Barangay');
      $('#cancelBtn').hide();
      $('#barangayTableBody tr').removeClass('selected-row');
      $('#editBtn').prop('disabled', true);
      $('#deleteBtn').prop('disabled', true);
    });

// Delete button click handler
$('#deleteBtn').click(async function() {
  // Open the confirmation dialog
  const result = await Dialog.confirmDialog(
      "Confirm Deletion",
      "Are you sure you want to delete this barangay?"
  );

  // Check if the user clicked OK
  if (result.operation === 1) {
      // Close the modal
      $('#deleteModal').modal('hide');

      // Proceed with deletion
      let barangayToDelete = new Barangay();
      barangayToDelete.removeBarangay(barangay.barangayId);
      getBarangay();
      displayBarangays();
      resetFields();
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
$('#barangayTableBody').on('click', 'tr', function() {
  var $this = $(this);
  var barangayId = $this.data('index');
  barangay = barangays.find(u => u.barangayId === barangayId);
  selectedRow = barangayId;
  // Highlight selected row
  if (selectedRow !== null) {
  $('#barangayTableBody tr').removeClass('selected-row');
  $('#barangayTableBody tr').filter(function() {
    return parseInt($(this).find('td:eq(0)').text(), 10) === selectedRow;
  }).addClass('selected-row');
  $('#editBtn').prop('disabled', false);
  $('#deleteBtn').prop('disabled', false);
} else {
  $('#barangayTableBody tr').removeClass('selected-row');
}

});
}

export { Barangay, getBarangay, searchBarangay, barangays, initializeMethodsBarangay };
