function sendConcern() {
    // Show the concerns modal when the "Send Feedback" button is clicked
    $("#concernsModal").modal("show");
}

function previewImage(event) {
    var reader = new FileReader();
    reader.onload = function () {
        var output = document.getElementById("modal-image");
        output.src = reader.result;
        output.alt = "Image Preview";
    };
    reader.readAsDataURL(event.target.files[0]);
}

function showPreview() {
    var imageAlt = document.getElementById("modal-image").alt;
    if (imageAlt !== "") {
        $("#imageModal").modal("show");
    } else {
        alert("Please select an image to preview.");
    }
}

$(document).ready(function () {
    // Handle form submission
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
        // Generate a random anonymous name using Faker.js
        const anonymousName = "anonymous-" + uuid.v4(); // Generate random anonymous UUID-based ID

        $.ajax({
            url: "/api/concerns", // Laravel API endpoint
            method: "POST",
            data: {
                name: anonymousName, // Use generated anonymous name
                title: title,
                content: content,
                attachment: attachmentData,
            },
            success: function (response) {
                // Handle success
                $("#uploadForm")[0].reset();
                $("#modal-image").attr("alt", "");
                $("#modal-image").attr("src", "").hide();
                toastr.success("Form submitted successfully!", "Success", {
                    timeOut: 5000, // 5 seconds
                    positionClass: "toast-top-center",
                    toastClass: "toast-success-custom",
                });
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
});
