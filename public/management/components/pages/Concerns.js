import { user } from '../HeaderSidebar.js';

export default function initDashboard() {
  let concerns = [];

  // Function to fetch concerns from the server and store in `concerns`
  function fetchContents() {
    return $.ajax({
      url: '/api/concerns',  // Laravel API endpoint
      method: 'GET'
    }).done(function(response) {
      concerns = response; // Store the fetched data
      displayContent(); // Display the content after fetching
    }).fail(function(xhr) {
      console.error('Error fetching content:', xhr);
    });
  }

  function displayContent(searchTerm = '') {
    let contentArray = searchContent(searchTerm); // Filter content based on search term
    let contentTable = $('#contentTable');
    contentTable.empty();

    contentArray.forEach((item) => {
      let row = `<tr data-index="${item.concernId}">
          <td>${item.title}</td>
        </tr>`;
      contentTable.append(row);
    });

    $('#contentTable').on('click', 'tr', function() {
      let concernId = $(this).data('index');
      showDetailView(concernId); // Updated to call showDetailView
    });
  }

  function getItemById(concernId) {
    return concerns.find(item => item.concernId === concernId) || {};
  }

  window.adminConcern = function(event)  {
    $(document).ready(function() {
      // Initial content
      $('#main-content').html(`
        <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
          <h1 class="h2">Concerns</h1>
        </div>
        <div class="row">
          <style>
            .table-striped tbody tr:hover {
              background-color: #f1f1f1;
              cursor: pointer;
            }
          </style>
          <div class="input-group">
            <div class="input-group-prepend">
              <span class="input-group-text border-0 bg-transparent"><i class="fas fa-search"></i></span>
            </div>
            <input placeholder="Search query..." type="text" class="form-control rounded-pill" id="search" name="search">
          </div>
          <div class="container-fluid mt-5">
            <table class="table table-custom">
              <tbody id="contentTable"></tbody>
            </table>
          </div>
        </div>
      `);
      
      $('#search').on('input', function() {
        let searchTerm = $('#search').val();
        displayContent(searchTerm);
      });
      
      // Fetch concerns initially
      fetchContents();
    });
  }

  function showDetailView(concernId) {
    // Fetch detailed content based on concernId
    let item = getItemById(concernId);

    // Determine if there's an image to show
    let imageHtml = item.attachment ? `<img width=300px class="img-fluid" src="${item.attachment}" alt="Image">` : '';

    $('#main-content').html(`
      <style>
        .card {
          display: flex;
          flex-direction: row;
          align-items: flex-start;
          gap: 1rem;
          margin: 1rem 0;
        }
        .card img {
          max-width: 300px;
          height: auto;
          margin-left: auto;
        }
        .card p {
          flex: 1;
          margin: 0;
        }
        .back-button {
          margin-bottom: 1rem;
          display: inline-block;
          cursor: pointer;
          color: #fff;
          text-decoration: none;
          font-weight: bold;
          background-color: #B1BA4D;
          border: 1px solid #007bff;
          border-radius: 5px;
          padding: 0.5rem 1rem;
          transition: all 0.3s ease;
        }
        .delete-button {
          margin-bottom: 1rem;
          display: inline-block;
          cursor: pointer;
          color: #fff;
          text-decoration: none;
          font-weight: bold;
          background-color: #dc3545;
          border: 1px solid #007bff;
          border-radius: 5px;
          padding: 0.5rem 1rem;
          transition: all 0.3s ease;
        }
      </style>
      <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
        <h1 class="h4">${item.title}</h1>
        <span class="back-button" onclick="adminConcern()">Back to List</span>
      </div>
      <div class="row">
        <div class="container-fluid">
          <div class="card p-5 text-justify">
            <p>${item.content}</p>
            ${imageHtml}
          </div>
        </div>
      </div>
      <div class="row text-right">
        <div class="container-fluid">
          <button class="delete-button" onclick="deleteConcern(${item.concernId})">Delete</button>
        </div>
      </div>

      <script>
        function deleteConcern(concernId) {
          if (confirm('Are you sure you want to delete this concern?')) {
            $.ajax({
              url: '/api/concerns/${concernId}',  // Laravel API endpoint with ID
              method: 'DELETE',
              success: function() {
                alert('Concern deleted successfully.');
                adminConcern(); // Refresh the list after deletion
              },
              error: function(xhr) {
                console.error('Error deleting content:', xhr);
              }
            });
          }
        }
        
      </script>
    `);
  }


  function searchContent(searchTerm) {
    const lowerCaseSearchTerm = searchTerm.toLowerCase(); // Convert search term to lowercase for case-insensitive search
    return concerns.filter(content => {
      return content.title.toLowerCase().includes(lowerCaseSearchTerm); // Assuming `title` is the field to search
    });
  }

    // Function to show modal with content details
    function showModal(concernId) {
      $.ajax({
        url: `/api/concerns/${concernId}`,  // Laravel API endpoint with ID
        method: 'GET',
        success: function(response) {
          let item = response;
          $('#modalTitle').text(item.title);
          $('#modalContent').text(item.content);

          if (item.attachment) {
            $('#modalImage').attr('src', item.attachment).show();
          } else {
            $('#modalImage').hide();
          }

          $('#contentModal').modal('show');
        },
        error: function(xhr) {
          console.error('Error fetching content:', xhr);
        }
      });
    }


  function agriculturistConcern() {
    $(document).ready(function() {
      $('#main-content').html(`
        <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
          <h1 class="h2">Concerns</h1>
        </div>
        <div class="row">
          <style>
            .form-control {
              border-radius: 20px;
            }

            .btn-custom {
              background-color: #008000; /* Green background */
              color: white; /* White text */
              border-radius: 25px; /* Circular shape */
              box-shadow: 0px 5px 5px rgba(0, 0, 0, 1); /* Shadow effect */
              border: none; /* No border */
              width: 80%; /* Full width */
              font-size: 15px; /* Adjust font size */
              font-weight: bold;
              display: block; /* Ensure block level display */
              margin: 0 auto; /* Center horizontally */
            }

            .btn-preview {
              background-color: #007bff; /* Blue background for preview button */
              color: white; /* White text */
              border-radius: 25px; /* Circular shape */
              border: none; /* No border */
              margin-left: 10px; /* Space between buttons */
            }

            .form-group {
              margin-bottom: 1.5rem; /* Add space between form groups */
            }

            .form-group label {
              text-align: right; /* Align labels to the right */
            }

            .form-group .col-sm-10 {
              padding-left: 15px; /* Add padding to align the inputs properly */
            }

            .card {
              width: 100%; /* Ensure card does not overflow */
            }

            .card-body {
              overflow-wrap: normal; /* Prevent word breaks */
              word-break: normal; /* Prevent word breaks */
              white-space: normal; /* Ensure text wraps properly */
            }

            .img-responsive {
              width: 100%;
              height: auto;
            }
          </style>

          <div class="container-fluid">
            <div class="row">
              <div class="col-md-12">
                <div class="card bg-white">
                  <div id="titleId" class="container-fluid bg-success text-white d-flex justify-content-center align-items-center">
                    <h4>Send Your Concerns</h4>
                  </div>
                  <div class="card-body d-flex flex-column align-items-center">
                    <form id="uploadForm">
                      <div class="form-group row">
                        <label for="title" class="col-sm-2 col-form-label">Subject</label>
                        <div class="col-sm-10">
                          <input type="text" class="form-control" id="title" required>
                        </div>
                      </div>
                      <div class="form-group row">
                        <label for="content" class="col-sm-2 col-form-label">Content</label>
                        <div class="col-sm-10">
                          <textarea class="form-control" id="content" rows="5" required></textarea>
                        </div>
                      </div>
                      <div class="form-group row">
                        <label for="attachment" class="col-sm-2 col-form-label">Image (optional)</label>
                        <div class="col-sm-7">
                          <input type="file" class="form-control-file" id="attachment" accept="image/*" onchange="previewImage(event)">
                          <small class="form-text text-muted">Please upload an attachment file (JPG, PNG, etc.).</small>
                        </div>
                        <div class="col-sm-3 text-right">
                          <button type="button" class="btn btn-preview" onclick="showPreview()">Preview</button>
                        </div>
                      </div>
                      <div class="form-group row">
                        <div class="col-sm-10 offset-sm-2">
                          <button type="submit" class="btn btn-custom">Submit</button>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Modal -->
        <div class="modal fade" id="imageModal" tabindex="-1" aria-labelledby="imageModalLabel" aria-hidden="true">
          <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" id="imageModalLabel">Image Preview</h5>
              </div>
              <div class="modal-body">
                <div class="card">
                  <div class="card-body">
                    <img id="modal-image" src="" alt="" class="img-responsive">
                  </div>
                </div>
              </div>
              <div class="modal-footer">
                <button id="btnCloseModal" type="button" class="btn btn-secondary">Close</button>
              </div>
            </div>
          </div>
        </div>
        <script>
              function showPreview() {
                var imageSrc = document.getElementById('modal-image').alt;
                if (imageSrc !== '') {
                  $('#imageModal').modal('show'); // Show the modal if there is a valid image src
                } else {
                  alert('Please select an image to preview.');
                }
              }

              function previewImage(event) {
                var reader = new FileReader();
                reader.onload = function() {
                  var output = document.getElementById('modal-image');
                  output.src = reader.result;
                  output.alt = 'Image Preview';
                };
                reader.readAsDataURL(event.target.files[0]);
              }
        </script>
      `);
      $(document).ready(function() {
        // Handle the click event on the close button
        $('#btnCloseModal').on('click', function() {
            $('#imageModal').modal('hide'); 
        });
      });

      $(document).ready(function() {
        // Function to save content to the server
        $('#uploadForm').on('submit', function(event) {
            event.preventDefault();
            
            let title = $('#title').val();
            let content = $('#content').val();
            let attachment = $('#attachment')[0].files[0];
            let attachmentData = '';
      
            if (attachment) {
                let reader = new FileReader();
                reader.onload = function(e) {
                    attachmentData = e.target.result;
                    sendContent(title, content, attachmentData);
                };
                reader.readAsDataURL(attachment);
            } else {
                sendContent(title, content);
            }
        });
      
        function sendContent(title, content, attachmentData = ' ') {
          const userId = user ? user.userId : null; // Ensure userId is obtained safely
          $.ajax({
            url: '/api/concerns',  // Laravel API endpoint
            method: 'POST',
            data: {
              userId: userId,
              title: title,
              content: content,
              attachment: attachmentData,
            },
            success: function(response) {
              // Handle success
              $('#uploadForm')[0].reset();
              $('#modal-image').attr('alt', '');
              $('#modal-image').attr('src', '').hide();
              displayContent(); // Refresh content display
              console.log(response);
            },
            error: function(xhr) {
              // Handle error
              console.error('Error saving content:', xhr);
            }
          });
        }
        // Initial display of content
        displayContent();
      });
    });
  }

  $(document).ready(function() {
    if (user.role === 'admin') {
      adminConcern();
    } else if (user.role === 'agriculturist') {
      agriculturistConcern();
    }
  });
}
