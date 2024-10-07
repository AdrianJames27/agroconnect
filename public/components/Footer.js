import { getYearRange } from "../js/fetch.js";

$(document).ready(function () {
    function appendFooter() {
        return new Promise((resolve) => {
            $(".footer-container").append(`
                <footer class="footer">
                    <div class="container text-white d-flex justify-content-around align-items-center">
                        <div class="d-flex">
                            <span>&copy; AgroConnect Cabuyao (<span id="yearData"></span>)</span>
                        </div>
                        <div class="d-flex text-left">
                            <p class="mb-0 me-3">
                                <i class="fas fa-map-marker-alt" data-toggle="tooltip" data-placement="top" title="Address: 3rd Floor Cabuyao Retail Plaza, Brgy. Dos, Cabuyao, Philippines, 4025"></i>
                            </p>
                            <p class="mb-0 me-3">
                                <a href="mailto:agricabuyao@gmail.com">
                                    <i class="fas fa-envelope text-white" data-toggle="tooltip" data-placement="top" title="Email: agricabuyao@gmail.com"></i>
                                </a>
                            </p>
                            <p class="mb-0 me-3">
                                <i class="fas fa-phone-alt" data-toggle="tooltip" data-placement="top" title="Phone: (049) 5037796"></i>
                            </p>
                            <p class="mb-0">
                                <a href="https://www.facebook.com/cabuyaoagricultureoffice" target="_blank">
                                    <i class="fab fa-facebook text-white" data-toggle="tooltip" data-placement="top" title="Facebook Page: Cabuyao Agriculture Office"></i>
                                </a>
                            </p>
                        </div>
                    </div>
                </footer>

            `);
            $(document).ready(function () {
                // Initialize Bootstrap tooltips
                $('[data-toggle="tooltip"]').tooltip();
            });

            resolve(); // Resolve the promise after appending
        });
    }

    async function updateYearData() {
        try {
            let year = await getYearRange();
            $("#yearData").text(year); // Use text() to set text content
        } catch (error) {
            console.error("Error updating year data:", error);
        }
    }

    // Append footer and then update year data
    appendFooter().then(updateYearData);
});
