$(document).ready(function () {
    function appendFooter() {
        return new Promise((resolve) => {
            $(".footer-container").append(`
                <footer class="footer text-white">
                    <div class="container d-flex flex-column flex-md-row justify-content-between align-items-center py-1">
                        <div class="d-flex align-items-center mb-3 mb-md-0">
                            <span class="me-3">&copy; AgroConnect Cabuyao (<span id="yearData"></span>)</span>
                        </div>
                        <div class="d-flex flex-wrap align-items-center justify-content-center justify-content-md-end">
                            <p class="mb-0 me-4">
                                <i class="fas fa-map-marker-alt" data-toggle="tooltip" data-placement="top" title="Address: 3rd Floor Cabuyao Retail Plaza, Brgy. Dos, Cabuyao, Philippines, 4025"></i>
                            </p>
                            <p class="mb-0 me-4">
                                <a href="mailto:agricabuyao@gmail.com" class="text-white">
                                    <i class="fas fa-envelope" data-toggle="tooltip" data-placement="top" title="Email: agricabuyao@gmail.com"></i>
                                </a>
                            </p>
                            <p class="mb-0 me-4">
                                <i class="fas fa-phone-alt" data-toggle="tooltip" data-placement="top" title="Phone: (049) 5037796"></i>
                            </p>
                            <p class="mb-0">
                                <a href="https://www.facebook.com/cabuyaoagricultureoffice" target="_blank" class="text-white">
                                    <i class="fab fa-facebook" data-toggle="tooltip" data-placement="top" title="Facebook Page: Cabuyao Agriculture Office"></i>
                                </a>
                            </p>
                            <p class="mb-0 ms-4">
                                <a href="/management/login" target="_blank" class="text-white" data-toggle="tooltip" data-placement="top" title="Management Login">
                                    <i class="fas fa-user-cog"></i> <strong>MLogin</strong>
                                </a>
                            </p>
                        </div>
                    </div>
                </footer>
            `);

            // Initialize Bootstrap tooltips
            $('[data-toggle="tooltip"]').tooltip();

            resolve(); // Resolve the promise after appending
        });
    }

    function updateDateTime() {
        setInterval(() => {
            let now = new Date();
            let fullDateTime = now.toLocaleString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: true,
            });
            $("#yearData").text(fullDateTime); // Update the footer with full date and time
        }, 1000); // Update every second
    }

    // Append footer and then start updating the date and time interactively
    appendFooter().then(updateDateTime);
});
