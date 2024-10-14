import { User, getUser, searchUser, users } from '../classes/User.js';
import Dialog from '../helpers/Dialog.js';
export default function initDashboard() {

  $(document).ready(function() {
    // Function to initialize the manage users view
    function initializeManageUsersView() {
      $('#main-content').html(`
        <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
          <h1 class="h2">Manage Users</h1>
          <div class="input-group">
            <div class="input-group-prepend">
              <span class="input-group-text border-0 bg-transparent"><i class="fas fa-search"></i></span>
            </div>
            <input placeholder="Search username..." type="text" class="form-control rounded-pill" id="search" name="search">
          </div>
        </div>
      
        <div class="row d-flex justify-content-between align-items-start mt-5">
          <div class="col-md-4">
            <form id="userForm">
              <div class="mb-3">
                <input placeholder="First Name" type="text" class="form-control" id="firstName" name="firstName" required>
              </div>
              <div class="mb-3">
                <input placeholder="Last Name" type="text" class="form-control" id="lastName" name="lastName" required>
              </div>
              <input type="hidden" class="form-control" id="userId" name="userId">
              <div class="mb-3">
                <input placeholder="Username" type="text" class="form-control" id="username" name="username" required>
              </div>
              <div class="mb-3">
                <input placeholder="Password" type="password" class="form-control" id="password" name="password" required>
              </div>
              <button type="button" class="btn btn-custom" id="submitBtn">Add User</button>
              <button type="button" class="btn btn-custom mt-2" id="cancelBtn" style="display: none;">Cancel</button>
            </form>
          </div>
      
          <div class="col-md-8 actionBtn">
            <div class="d-flex justify-content-end align-items-center mb-2">
              <button id="editBtn" class="btn btn-warning" style="margin-right: 10px;" disabled>Edit</button>
              <button id="deleteBtn" class="btn btn-danger" disabled>Delete</button>
            </div>
      
            <div class="table-responsive">
              <table id="userTable" class="table table-custom text-center">
                <thead>
                  <tr style="background-color: #2774E9; color: white;">
                    <th scope="col">First Name</th>
                    <th scope="col">Last Name</th>
                    <th scope="col">Username</th>
                    <th scope="col">Role</th>
                    <th scope="col">Action</th>
                  </tr>
                </thead>
                <tbody id="userTableBody">
                  <!-- Table rows will be dynamically added here -->
                </tbody>
              </table>
            </div>
      
            <div class="text-right mt-3">
              <button id="prevBtn" class="btn btn-green mr-2">Previous</button>
              <button id="nextBtn" class="btn btn-green">Next</button>
            </div>
          </div>
        </div>
      `);
      

      var selectedRow = null;
      var pageSize = 5;
      var currentPage = 1;
      var user = null;

      async function displayUsers(username = null) {

        // Simulate a delay of 1 second
        await new Promise(resolve => setTimeout(resolve, 1000));

        $('#userTableBody').empty();
      
        var startIndex = (currentPage - 1) * pageSize;
        var endIndex = startIndex + pageSize;
        if (username) {
          // Display a single user if username is provided
            const foundUsers = searchUser(username);
            if (foundUsers.length > 0) {
              foundUsers.forEach(user => {
                $('#userTableBody').append(`
                  <tr data-index=${user.userId}>
                    <td style="display: none;">${user.userId}</td>
                    <td>${user.firstName}</td>
                    <td>${user.lastName}</td>
                    <td>${user.username}</td>                 
                    <td><button class="btn btn-sm btn-green">Change Password</button></td>
                  </tr>
                `);
              });
            } else {
              // Handle case where username is not provided
              $('#userTableBody').append(`
                <tr>
                  <td colspan="4">User not found!</td>
                </tr>
              `)
            }
        } else {
          // Display paginated users if no username is provided
          for (var i = startIndex; i < endIndex; i++) {
            if (i >= users.length) {
              break;
            }
            var user = users[i];
            $('#userTableBody').append(`
              <tr data-index=${user.userId}>
                <td style="display: none;">${user.userId}</td>
                <td>${user.firstName}</td>
                <td>${user.lastName}</td>
                <td>${user.username}</td>
                <td>${user.role}</td>
                <td><button class="btn btn-sm btn-green" onclick="changePassword(${user.userId})">Change Password</button></td>
              </tr>
            `);
          }
        }
      }

      window.changePassword = async function(userId) {
        const res = await Dialog.changePasswordDialog('Change Password', 'Input new password:');
        if (res.operation === Dialog.OK) {
            // Send an AJAX request to change the password
            $.ajax({
                url: `api/admin/change-password/${userId}`,
                type: 'POST',
                data: {
                    new_password: res.newPassword,
                },
                success: function(response) {
                    alert(response.message);
                },
                error: function(xhr) {
                    alert('Password change failed: ' + xhr.responseJSON.message);
                }
            });
        }
      };
      

      // Display initial users
      displayUsers();

      $('#search').on('input', function() {
        let searchTerm = $(this).val();
        displayUsers(searchTerm);
      });

      // Pagination: Previous button click handler
      $('#prevBtn').click(function() {
        if (currentPage > 1) {
          currentPage--;
          displayUsers();
        }
      });

      // Pagination: Next button click handler
      $('#nextBtn').click(function() {
        var totalPages = Math.ceil(users.length / pageSize);
        if (currentPage < totalPages) {
          currentPage++;
          displayUsers();
        }
      });

      // Form submission handler (Add or Update user)
      $('#submitBtn').click(function(event) {
        event.preventDefault();

        var userId = Number($('#userId').val());
        var firstName = $('#firstName').val();
        var lastName = $('#lastName').val();
        var username = $('#username').val();
        var role = $('#role').val();
        var password = $('#password').val();
        if (selectedRow !== null) {
          // Update existing user
          console.log(userId);
          let user = new User(userId, firstName, lastName, username, role);
          user.updateUser(user);
          selectedRow = null;
          $('#submitBtn').text('Add User');
          $('#cancelBtn').hide(); 
          $('#password').show();
          $('#password').attr('required', 'required');
          resetFields();
        } else {
          let user = new User(0, firstName, lastName, username, 'agriculturist', password);
          user.createUser(user);
        }

        // Clear form fields after submission
        $('#userForm')[0].reset();
        selectedRow = null;
        $('#userTableBody tr').removeClass('selected-row');
        getUser();
        displayUsers();
      });

      function resetFields() {
        // Reset UI states
        $('#editBtn').prop('disabled', true);
        $('#deleteBtn').prop('disabled', true);
        selectedRow = null;
        $('#userTableBody tr').removeClass('selected-row');
      }

      $('#editBtn').click(async function() { 
        // Open the confirmation dialog
        const result = await Dialog.confirmDialog(
            "Confirm Edit",
            "Are you sure you want to edit this user's details?"
        );
    
        // Check if the user clicked OK
        if (result.operation === 1) { 
            $('#editModal').modal('hide');
            $('#cancelBtn').show();
            $('#password').hide();
            $('#password').removeAttr('required');
            $('#userId').val(user.userId);
            $('#firstName').val(user.firstName);
            $('#lastName').val(user.lastName);
            $('#username').val(user.username);
            $('#submitBtn').text('Update User');
        }

        $('#cancelEdit').click(function() {
          resetFields();
        }); 

        $('#userTableBody tr').removeClass('selected-row');
        $('#editBtn').prop('disabled', true);
        $('#deleteBtn').prop('disabled', true);
    });    

    // Cancel button click handler
    $('#cancelBtn').click(function() {
        selectedRow = null;
        $('#userForm')[0].reset();
        $('#submitBtn').text('Add User');
        $('#cancelBtn').hide();
        $('#password').attr('required', 'required').show();
        $('#userTableBody tr').removeClass('selected-row');
        $('#editBtn').prop('disabled', true);
        $('#deleteBtn').prop('disabled', true);     
    });

    // Delete button click handler
    $('#deleteBtn').click(async function() {
      // Open the confirmation dialog
      const result = await Dialog.confirmDialog(
          "Confirm Deletion",
          "Are you sure you want to delete this user?"
      );

      // Check if the user clicked OK
      if (result.operation === 1) {
          // Proceed with deletion
          let userToDelete = new User();
          userToDelete.removeUser(user.userId);
          displayUsers();
          resetFields();
      } else {
          // If Cancel is clicked, do nothing or add additional handling if needed
          console.log("Delete action was canceled.");
      }
      $('#userTableBody tr').removeClass('selected-row');
      $('#editBtn').prop('disabled', true);
      $('#deleteBtn').prop('disabled', true);
    });


    // Row click handler (for selecting rows)
    $('#userTableBody').on('click', 'tr', function() {
      var $this = $(this);
      var userId = $this.data('index');
      user = users.find(u => u.userId === userId);
      selectedRow = userId;
      // Highlight selected row
      if (selectedRow !== null) {
          $('#userTableBody tr').removeClass('selected-row');
          $('#userTableBody tr').filter(function() {
            return parseInt($(this).find('td:eq(0)').text(), 10) === selectedRow;
          }).addClass('selected-row');
          $('#editBtn').prop('disabled', false);
        if (user.role !== 'admin') {
          $('#deleteBtn').prop('disabled', false);
        } else {
          $('#deleteBtn').prop('disabled', true);
        }
      } else {
        $('#userTableBody tr').removeClass('selected-row');
      }
    });

  }
    // Initialize manage users view when document is ready
    initializeManageUsersView();
  });
}