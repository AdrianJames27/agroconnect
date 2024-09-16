import { getYearRange } from "../js/fetch.js";

$(document).ready(function() {
    function appendFooter() {
        return new Promise((resolve) => {
            $('.footer-container').append(`
                <footer class="footer">
                    <div class="container text-white">
                        &copy; AgroConnect Cabuyao (<span id="yearData"></span>)
                    </div>
                </footer>
            `);
            resolve(); // Resolve the promise after appending
        });
    }

    async function updateYearData() {
        try {
            let year = await getYearRange();
            $('#yearData').text(year); // Use text() to set text content
        } catch (error) {
            console.error('Error updating year data:', error);
        }
    }

    // Append footer and then update year data
    appendFooter().then(updateYearData);
});
