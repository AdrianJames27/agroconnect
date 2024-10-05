import { user } from "../HeaderSidebar.js";

export default function initDashboard() {
    let concerns = [];

    // Function to fetch concerns from the server and store in `concerns`
    function fetchContents() {
        return $.ajax({
            url: "/api/concerns", // Laravel API endpoint
            method: "GET",
        })
            .done(function (response) {
                concerns = response; // Store the fetched data
                displayContent(); // Display the content after fetching
            })
            .fail(function (xhr) {
                console.error("Error fetching content:", xhr);
            });
    }

    function displayContent(searchTerm = "") {
        let contentArray = searchContent(searchTerm); // Filter content based on search term
        let contentTable = $("#contentTable");
        contentTable.empty();

        contentArray.forEach((item) => {
            let statusBadge;

            // Determine the badge class based on the status
            switch (
                item.status.toLowerCase() // Ensure case-insensitivity
            ) {
                case "read":
                    statusBadge = "badge bg-secondary"; // Gray badge for read
                    break;
                case "unread":
                    statusBadge = "badge bg-danger"; // Red badge for unread
                    break;
                case "resolved":
                    statusBadge = "badge bg-success"; // Green badge for resolved
                    break;
                default:
                    statusBadge = "badge bg-light text-dark"; // Light gray badge for unknown status
            }
            let row = `<tr data-index="${item.concernId}">
              <td>${item.title}</td>
              <td><span class="${statusBadge}">${item.status}</span></td>
          </tr>`;

            contentTable.append(row);
        });

        $("#contentTable").on("click", "tr", function () {
            let concernId = $(this).data("index");
            showDetailView(concernId); // Updated to call showDetailView
        });
    }

    function getItemById(concernId) {
        return concerns.find((item) => item.concernId === concernId) || {};
    }
    window.adminConcern = function (event) {
        $(document).ready(function () {
            // Initial content
            $("#main-content").html(`
              <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                  <h1 class="h2">Concerns</h1>
              </div>
              <div class="row">
                  <style>
                      .table-striped {
                          border-collapse: collapse; /* Ensures no double borders */
                      }
                      .table-striped th, .table-striped td {
                          border: 1px solid #dee2e6; /* Standard border for table cells */
                          padding: 12px; /* Padding for table cells */
                          text-align: left; /* Left align text */
                      }
                      .table-striped th {
                          background-color: #f8f9fa; /* Light gray background for header */
                          font-weight: bold; /* Bold header text */
                      }
                      .table-striped tbody tr:hover {
                          background-color: #e9ecef; /* Lighter hover effect */
                          cursor: pointer;
                      }
                      .table-custom {
                          border-radius: 0.5rem; /* Rounded corners for the table */
                          overflow: hidden; /* Ensure rounded corners are visible */
                      }
                      .input-group {
                          width: 100%; /* Full width for input group */
                      }
                      #search {
                          flex: 1; /* Allow the search input to grow */
                      }
                      #clearSearchBtn {
                          background-color: #dc3545; /* Bootstrap danger color */
                          color: white; /* White text for better contrast */
                      }
                      #clearSearchBtn:hover {
                          background-color: #c82333; /* Darker shade on hover */
                      }
                  </style>
                  <div class="container-fluid mb-4">
                      <div class="input-group">
                          <div class="input-group-prepend">
                              <span class="input-group-text border-0 bg-transparent"><i class="fas fa-search"></i></span>
                          </div>
                          <input placeholder="Search query..." type="text" class="form-control rounded-pill" id="search" name="search">
                          <div class="input-group-append ml-3">
                              <button class="btn rounded-pill" id="clearSearchBtn">Clear</button>
                          </div>
                      </div>
                  </div>
                  <div class="container-fluid">
                      <table class="table table-striped table-hover table-custom">
                          <thead class="thead-dark">
                              <tr>
                                  <th scope="col">Title</th>
                                  <th scope="col">Status</th>
                              </tr>
                          </thead>
                          <tbody id="contentTable"></tbody>
                      </table>
                  </div>
              </div>
          `);

            $("#search").on("input", function () {
                let searchTerm = $("#search").val();
                displayContent(searchTerm);
            });

            // Clear search input
            $("#clearSearchBtn").on("click", function () {
                $("#search").val("");
                displayContent("");
            });

            // Fetch concerns initially
            fetchContents();
        });
    };

    function showDetailView(concernId) {
        // Fetch detailed content based on concernId
        let item = getItemById(concernId);

        // Check if the item's status is 'unread' and update it to 'read' if necessary
        if (item.status === "unread") {
            $.ajax({
                url: `/api/concerns/${concernId}/status`, // Update the status endpoint
                method: "PUT",
                contentType: "application/json",
                data: JSON.stringify({ status: "1" }), // Set status to '1' for "read"
                success: function () {
                    console.log("Status updated to read.");
                },
                error: function (xhr) {
                    console.error("Error updating status:", xhr);
                },
            });
        }

        // Determine if there's an image to show
        let imageHtml = item.attachment
            ? `<img class="img-fluid rounded" src="${item.attachment}" alt="Image" style="max-width: 300px;">`
            : "";

        // Determine the badge based on the item's status
        let badgeHtml =
            item.status === "resolved"
                ? '<span class="badge bg-success">Resolved</span>'
                : '<span class="badge bg-danger">Unresolved</span>';

        $("#main-content").html(`
        <style>
          .card {
            margin: 1rem 0;
            border: 1px solid #dee2e6;
            border-radius: 0.375rem;
            box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.1);
          }
          .back-button, .delete-button, .resolve-button {
            margin-bottom: 1rem;
            color: #fff;
            font-weight: bold;
            border-radius: 5px;
            padding: 0.5rem 1rem;
            transition: all 0.3s ease;
          }
          .back-button {
            background-color: #B1BA4D;
          }
          .delete-button {
            background-color: #dc3545;
          }
          .resolve-button {
            background-color: #28a745; /* Green color for resolve */
          }
        </style>
        <div class="container">
          <div class="d-flex justify-content-between align-items-center pt-3 pb-2 mb-3">
            <h1 class="h4">From User: ${item.name} ${badgeHtml}</h1>
            <span class="back-button btn" onclick="adminConcern()">Back to List</span>
          </div>
          <div class="row">
            <div class="col">
              <div class="card p-4">
                <p class="text-justify">${item.content}</p>
                ${imageHtml}
              </div>
            </div>
          </div>
          <div class="row text-right">
            <div class="col">
              <button class="delete-button btn" onclick="deleteConcern(${item.concernId})">Delete</button>
              <button class="resolve-button btn" onclick="resolveConcern(${item.concernId})">Resolve</button>
            </div>
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

          function resolveConcern(concernId) {
            if (confirm('Are you sure you want to mark this concern as resolved?')) {
              $.ajax({
                url: '/api/concerns/${concernId}/status',  // Update the status endpoint
                method: 'PUT',
                contentType: 'application/json',
                data: JSON.stringify({ status: '2' }),  // Set status to '2' for "resolved"
                success: function() {
                  alert('Concern marked as resolved.');
                  adminConcern(); // Refresh the list after resolution
                },
                error: function(xhr) {
                  console.error('Error updating status to resolved:', xhr);
                }
              });
            }
          }
        </script>
    `);
    }

    function searchContent(searchTerm) {
        const lowerCaseSearchTerm = searchTerm.toLowerCase(); // Convert search term to lowercase for case-insensitive search
        return concerns.filter((content) => {
            return content.title.toLowerCase().includes(lowerCaseSearchTerm); // Assuming `title` is the field to search
        });
    }

    // Function to show modal with content details
    function showModal(concernId) {
        $.ajax({
            url: `/api/concerns/${concernId}`, // Laravel API endpoint with ID
            method: "GET",
            success: function (response) {
                let item = response;
                $("#modalTitle").text(item.title);
                $("#modalContent").text(item.content);

                if (item.attachment) {
                    $("#modalImage").attr("src", item.attachment).show();
                } else {
                    $("#modalImage").hide();
                }

                $("#contentModal").modal("show");
            },
            error: function (xhr) {
                console.error("Error fetching content:", xhr);
            },
        });
    }

    function agriculturistConcern() {
        $(document).ready(function () {
            $("#main-content").html(`
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
            $(document).ready(function () {
                // Handle the click event on the close button
                $("#btnCloseModal").on("click", function () {
                    $("#imageModal").modal("hide");
                });
            });

            $(document).ready(function () {
                // Function to save content to the server
                // Handle form submission
                $("#uploadForm").on("submit", function (event) {
                    event.preventDefault();

                    let title = $("#title").val();
                    let content = $("#content").val();
                    let attachment = $("#attachment")[0].files[0];
                    let attachmentData = "";

                    if (attachment) {
                        let reader = new FileReader();
                        reader.onload = function (e) {
                            let img = new Image();
                            img.src = e.target.result;

                            img.onload = function () {
                                let canvas = document.createElement("canvas");
                                let ctx = canvas.getContext("2d");

                                // Set canvas size to the image size
                                canvas.width = img.width;
                                canvas.height = img.height;

                                // Draw image to canvas
                                ctx.drawImage(img, 0, 0);

                                // Convert canvas to WebP and get data URL
                                attachmentData = canvas.toDataURL("image/webp");

                                // Send the content along with WebP image
                                sendContent(title, content, attachmentData);
                            };
                        };
                        reader.readAsDataURL(attachment);
                    } else {
                        sendContent(title, content);
                    }
                });

                function sendContent(title, content, attachmentData = " ") {
                    // If userId is available, use it, otherwise generate an anonymous name
                    const userName = user
                        ? user.firstName + " " + user.lastName
                        : "Unknown User";

                    $.ajax({
                        url: "/api/concerns", // Laravel API endpoint
                        method: "POST",
                        data: {
                            name: userName, // Pass either userId or random anonymous name
                            title: title,
                            content: content,
                            attachment: attachmentData,
                        },
                        success: function (response) {
                            // Handle success
                            $("#uploadForm")[0].reset();
                            $("#modal-image").attr("alt", "");
                            $("#modal-image").attr("src", "").hide();
                            displayContent(); // Refresh content display
                            console.log(response);
                            toastr.success(
                                "Form submitted successfully!",
                                "Success",
                                {
                                    timeOut: 5000, // 5 seconds
                                    positionClass: "toast-top-center",
                                    toastClass: "toast-success-custom",
                                }
                            );
                        },
                        error: function (xhr) {
                            // Handle error
                            console.error("Error saving content:", xhr);
                            toastr.error("Something went wrong.", "Error", {
                                timeOut: 5000, // 5 seconds
                                positionClass: "toast-center-center",
                                toastClass: "toast-error-custom", // Custom error color
                            });
                        },
                    });
                }

                // Initial display of content
                displayContent();
            });
        });
    }

    $(document).ready(function () {
        if (user.role === "admin") {
            adminConcern();
        } else if (user.role === "agriculturist") {
            agriculturistConcern();
        }
    });
}
