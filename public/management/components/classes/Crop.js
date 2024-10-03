import Dialog from "../helpers/Dialog.js";

// Crop.js
let crops = [];

class Crop {
    constructor(
        cropId,
        cropName,
        cropType,
        scientificName,
        plantingSeason,
        growthDuration,
        unit,
        weight,
        cropImg
    ) {
        this.cropId = cropId;
        this.cropName = cropName;
        this.cropType = cropType;
        this.scientificName = scientificName; // Added scientific name
        this.plantingSeason = plantingSeason; // Added planting season
        this.growthDuration = growthDuration; // Added growth duration in days
        this.unit = unit; // Added unit (e.g., kg, lbs)
        this.weight = weight; // Added weight
        this.cropImg = cropImg;
    }

    async createCrop(crop) {
        // Check for duplicates based on both cropName and variety
        const existingCrop = crops.find((c) => c.cropName === crop.cropName);
        if (existingCrop) {
            alert("Crop with the same name already exists");
            return;
        }

        // Show the static uploading message
        $("#progressMessage").text("Uploading...");
        $("#loader").show(); // Show the loader
        $("body").addClass("no-scroll"); // Optional: Add a class to disable scrolling

        try {
            await $.ajax({
                url: "/api/crops",
                type: "POST",
                contentType: "application/json",
                data: JSON.stringify(crop),
            });
            console.log("Success:", crop);
            toastr.success("Crop added successfully!", "Success", {
                timeOut: 5000, // 5 seconds
                positionClass: "toast-top-center",
                toastClass: "toast-success-custom",
            });
        } catch (error) {
            console.error("Error:", error);
            toastr.error("Failed to add crop. Please try again.", "Error", {
                timeOut: 5000, // 5 seconds
                positionClass: "toast-top-center",
                toastClass: "toast-error-custom",
            });
        } finally {
            // Hide the loader and re-enable user interaction
            $("#loader").hide();
            $("body").removeClass("no-scroll"); // Remove the class to re-enable scrolling
            $("#progressMessage").text(""); // Clear the progress message
        }
    }

    updateCrop(updatedCrop) {
        // Check for duplicates based on both cropName and variety, excluding the current crop
        const existingCrop = crops.find(
            (c) =>
                c.cropName === updatedCrop.cropName &&
                c.cropId !== updatedCrop.cropId
        );
        if (existingCrop) {
            alert("Crop with the same name already exists");
            return;
        }

        // Update the crop in the local crops array
        crops = crops.map((crop) =>
            crop.cropId === updatedCrop.cropId
                ? { ...crop, ...updatedCrop }
                : crop
        );

        fetch(`/api/crops/${updatedCrop.cropId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(updatedCrop),
        })
            .then((response) => response.json())
            .then((data) => {
                console.log("Success:", data);
            })
            .catch((error) => {
                console.error("Error:", error);
            });
    }

    removeCrop(cropId) {
        fetch(`/api/crops/${cropId}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then((response) => {
                if (response.status === 204) {
                    crops = crops.filter((crop) => crop.cropId !== cropId);
                    console.log(`Crop with ID ${cropId} deleted.`);
                } else if (response.status === 404) {
                    console.error(`Crop with ID ${cropId} not found.`);
                } else {
                    console.error(`Failed to delete crop with ID ${cropId}.`);
                }
            })
            .catch((error) => {
                console.error("Error:", error);
            });
    }
}

function getCrop() {
    // Fetch crops from Laravel backend
    $.ajaxSetup({
        headers: {
            "X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr("content"),
        },
    });

    // Fetch crops from Laravel backend
    $.ajax({
        url: "/api/crops", // Endpoint to fetch crops
        method: "GET",
        success: function (response) {
            // Assuming response is an array of crops
            let crop = response;

            crops = crop;
            console.log(crops);
        },
        error: function (xhr, status, error) {
            console.error("Error fetching crops:", error);
        },
    });
}

getCrop();

function searchCrop(cropName) {
    const foundCrops = crops.filter((crop) =>
        crop.cropName.toLowerCase().includes(cropName.toLowerCase())
    );
    return foundCrops;
}

function initializeMethodsCrop() {
    var selectedRow = null;
    var pageSize = 5;
    var currentPage = 1;
    var isEdit = false;
    var crop = null;

    async function displayCrops(cropName = null) {
        // Simulate a delay of 1 second
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Clear the table body
        $("#cropTableBody").empty();

        var startIndex = (currentPage - 1) * pageSize;
        var endIndex = startIndex + pageSize;

        if (cropName) {
            // Display a single crop if cropName is provided
            const foundCrops = searchCrop(cropName);
            if (foundCrops.length > 0) {
                foundCrops.forEach((crop) => {
                    $("#cropTableBody").append(`
                      <tr data-index=${crop.cropId} class="text-center">
                        <td style="display: none;">${crop.cropId}</td>
                        <td><img src="${crop.cropImg}" alt="${crop.cropName}" class="img-thumbnail" width="50" height="50"></td>
                        <td>${crop.cropName}</td>
                        <td>${crop.cropType}</td>
                        <td>${crop.scientificName}</td> <!-- Display scientific name -->
                        <td>${crop.plantingSeason}</td> <!-- Display planting season -->
                        <td>${crop.growthDuration} days</td> <!-- Display growth duration -->
                        <td>${crop.unit}</td> <!-- Display unit -->
                        <td>${crop.weight}</td> <!-- Display weight -->
                      </tr>
                  `);
                });
            } else {
                // Handle case where cropName is not found
                $("#cropTableBody").append(`
                  <tr>
                      <td colspan="9">Crop not found!</td>
                  </tr>
              `);
            }
        } else {
            // Display paginated crops if no cropName is provided
            for (var i = startIndex; i < endIndex; i++) {
                if (i >= crops.length) {
                    break;
                }
                var crop = crops[i];
                $("#cropTableBody").append(`
                   <tr data-index=${crop.cropId} class="text-center">
                        <td style="display: none;">${crop.cropId}</td>
                        <td><img src="${crop.cropImg}" alt="${crop.cropName}" class="img-thumbnail" width="50" height="50"></td>
                        <td>${crop.cropName}</td>
                        <td>${crop.cropType}</td>
                        <td>${crop.scientificName}</td> <!-- Display scientific name -->
                        <td>${crop.plantingSeason}</td> <!-- Display planting season -->
                        <td>${crop.growthDuration} days</td> <!-- Display growth duration -->
                        <td>${crop.unit}</td> <!-- Display unit -->
                        <td>${crop.weight}</td> <!-- Display weight -->
                   </tr>
              `);
            }
        }
    }

    // Display initial crops
    displayCrops();

    $("#search").on("input", function () {
        let cropName = $("#search").val();
        displayCrops(cropName);
    });

    // Pagination: Previous button click handler
    $("#prevBtn").click(function () {
        if (currentPage > 1) {
            currentPage--;
            displayCrops();
        }
    });

    // Pagination: Next button click handler
    $("#nextBtn").click(function () {
        var totalPages = Math.ceil(crops.length / pageSize);
        if (currentPage < totalPages) {
            currentPage++;
            displayCrops();
        }
    });

    let prevCropImg = "";

    // Form submission handler (Add or Update crop)
    $("#submitBtn").click(function (event) {
        event.preventDefault();

        var cropId = Number($("#cropId").val());
        var cropName = $("#cropName").val();
        var cropType = $("#cropType").val();
        var scientificName = $("#scientificName").val();
        var plantingSeason = $("#plantingSeason").val();
        var growthDuration = $("#growthDuration").val();
        var unit = $("#unit").val();
        var weight = $("#weight").val();

        // Get the file input element and the selected file
        var cropImgFile = document.getElementById("cropImg").files[0];
        var cropImgBase64 = null; // Initialize as null
        console.log(selectedRow);
        if (cropImgFile) {
            var reader = new FileReader();
            reader.onloadend = function () {
                cropImgBase64 = reader.result; // This is the base64 string

                // Create the Crop object with the base64 image string
                let crop = new Crop(
                    cropId,
                    cropName,
                    cropType,
                    scientificName,
                    plantingSeason,
                    growthDuration,
                    unit,
                    weight,
                    cropImgBase64
                );

                if (selectedRow !== null && isEdit) {
                    crop.updateCrop(crop);
                    selectedRow = null;
                    $("#submitBtn").text("Add crop");
                    $("#cancelBtn").hide();
                    isEdit = false;
                } else {
                    crop.createCrop(crop);
                }

                getCrop();
                displayCrops();

                // Clear form fields after submission
                $("#cropForm")[0].reset();
                $("#cropTableBody tr").removeClass("selected-row");
            };

            // Read the image file as a data URL (base64)
            reader.readAsDataURL(cropImgFile);
        } else {
            // Handle form submission without a new image
            // Use null for image when no new image is provided during update
            if (selectedRow !== null && isEdit) {
                let crop = new Crop(
                    cropId,
                    cropName,
                    cropType,
                    scientificName,
                    plantingSeason,
                    growthDuration,
                    unit,
                    weight,
                    prevCropImg
                );
                crop.updateCrop(crop);
                selectedRow = null;
                $("#submitBtn").text("Add crop");
                $("#cancelBtn").hide();
                isEdit = false;
            } else {
                let crop = new Crop(
                    cropId,
                    cropName,
                    cropType,
                    scientificName,
                    plantingSeason,
                    growthDuration,
                    unit,
                    weight,
                    null
                );
                crop.createCrop(crop);
            }

            getCrop();
            displayCrops();
            prevCropImg = "";

            // Clear form fields after submission
            $("#cropForm")[0].reset();
            $("#lblCropImg").val("Upload Image:");
            $("#cropTableBody tr").removeClass("selected-row");
            $("#editBtn").prop("disabled", true);
            $("#deleteBtn").prop("disabled", true);
        }
    });

    function resetFields() {
        // Reset UI states
        $("#editBtn").prop("disabled", true);
        $("#deleteBtn").prop("disabled", true);
        selectedRow = null;
        $("#cropTableBody tr").removeClass("selected-row");
    }

    $("#editBtn").click(async function () {
        // Open the confirmation dialog
        const result = await Dialog.confirmDialog(
            "Confirm Edit",
            "Are you sure you want to edit this crop's details?"
        );

        // Check if the user clicked OK
        if (result.operation === 1) {
            $("#editModal").modal("hide");
            $("#cancelBtn").show();
            $("#cropId").val(crop.cropId);
            $("#cropName").val(crop.cropName);
            $("#cropType").val(crop.cropType);
            $("#scientificName").val(crop.scientificName);
            $("#plantingSeason").val(crop.plantingSeason);
            $("#growthDuration").val(crop.growthDuration);
            $("#unit").val(crop.unit);
            $("#weight").val(crop.weight);
            prevCropImg = crop.cropImg;
            $("#lblCropImg").text("Upload New Image (Optional):");
            isEdit = true;

            $("#type").val(crop.type);
            $("#submitBtn").text("Update Crop");
        }
        $("#cropTableBody tr").removeClass("selected-row");
        $("#editBtn").prop("disabled", true);
        $("#deleteBtn").prop("disabled", true);
    });

    // Cancel button click handler
    $("#cancelEdit").click(function () {
        resetFields();
        $("#cropTableBody tr").removeClass("selected-row");
        $("#editBtn").prop("disabled", true);
        $("#deleteBtn").prop("disabled", true);
    });

    // Cancel button click handler
    $("#cancelBtn").click(function () {
        selectedRow = null;
        $("#cropForm")[0].reset();
        $("#submitBtn").text("Add Crop");
        $("#cancelBtn").hide();
        $("#cropTableBody tr").removeClass("selected-row");
        $("#editBtn").prop("disabled", true);
        $("#deleteBtn").prop("disabled", true);
    });

    // Delete button click handler
    $("#deleteBtn").click(async function () {
        // Open the confirmation dialog
        const result = await Dialog.confirmDialog(
            "Confirm Deletion",
            "Are you sure you want to delete this crop?"
        );

        // Check if the user clicked OK
        if (result.operation === 1) {
            let cropToDelete = new Crop();
            cropToDelete.removeCrop(crop.cropId);
            getCrop();
            displayCrops();
            resetFields();
        } else {
            // If Cancel is clicked, do nothing or add additional handling if needed
            console.log("Delete action was canceled.");
            $("#cropTableBody tr").removeClass("selected-row");
            $("#editBtn").prop("disabled", true);
            $("#deleteBtn").prop("disabled", true);
        }
    });

    // Row click handler (for selecting rows)
    $("#cropTableBody").on("click", "tr", function () {
        var $this = $(this);
        var cropId = $this.data("index");
        crop = crops.find((u) => u.cropId === cropId);
        selectedRow = cropId;
        // Highlight selected row
        if (selectedRow !== null) {
            $("#cropTableBody tr").removeClass("selected-row");
            $("#cropTableBody tr")
                .filter(function () {
                    return (
                        parseInt($(this).find("td:eq(0)").text(), 10) ===
                        selectedRow
                    );
                })
                .addClass("selected-row");
            $("#editBtn").prop("disabled", false);
            $("#deleteBtn").prop("disabled", false);
        } else {
            $("#cropTableBody tr").removeClass("selected-row");
        }
    });
}

export { Crop, getCrop, searchCrop, initializeMethodsCrop, crops };
