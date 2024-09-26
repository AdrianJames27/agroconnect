$(document).ready(function() {

    $('head').prepend(`
        <link rel="icon" href="../img/logo.png" type="image/png">   
    `);

    $('body').prepend(`
        <!-- Loading screen -->
        <div id="loadingScreen" class="loading-overlay">
            <div class="spinner-container">
                <div class="spinner-grow" role="status"></div>
                <div class="spinner-grow" role="status"></div>
                <div class="spinner-grow" role="status"></div>
                <p class="loading-message">Please wait while we load content...</p>
            </div>
        </div>
    `);
    
    $(window).on('load', function() {
        // Wait for 2 seconds after all content is fully loaded
        setTimeout(function() {
            $("#loadingScreen").fadeOut();
        }, 2000); // 2 seconds delay
    });
    
    
    
    // Prepend header structure with navigation links to the body
    $('.header-container').prepend(`
<div class="container-fluid p-0">
    <header class="navbar navbar-expand-lg navbar-dark" style="background-color: #008000;">
        <a class="navbar-brand d-flex align-items-center" href="#">
            <img src="img/logo.png" alt="Logo" class="header-logo">
            <h3 id="appName" class="pl-3 mb-0 d-none d-lg-block">AgroConnect Cabuyao</h3>
        </a>
        <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
            <ul class="navbar-nav ml-auto text-center">
                <li class="nav-item">
                    <a class="nav-link text-white" href="/">Home</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link text-white" href="/seasonal-trends">Seasonal Trends</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link text-white" href="/top-crops">Top Crops</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link text-white" href="/map-trends">Map Trends</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link text-white" href="/weather-forecast">Weather Forecast</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link text-white" href="/soil-health">Soil Health</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link text-white" href="/contact-us">Contact Us</a>
                </li>
            </ul>
        </div>
    </header>
</div>


        </div>
        <script>
$(document).ready(function() {
    function updateActiveClass() {
        var path = window.location.pathname;
        if ($(window).width() < 992) { // Bootstrap's lg breakpoint is 992px
            $('.nav-link').each(function() {
                if (this.pathname === path) {
                    $(this).attr('aria-current', 'page');
                    $(this).closest('.nav-item').addClass('active'); // Add active class to parent nav-item
                } else {
                    $(this).closest('.nav-item').removeClass('active'); // Remove active class if not matching
                }
            });
        } else {
            $('.nav-link').each(function() {
                if (this.pathname === path) {
                    $(this).attr('aria-current', 'page');
                    $(this).addClass('active');
                } else {
                    $(this).removeClass('active'); // Remove active class if not matching
                }
            });
        }
    }

    // Call the function on page load
    updateActiveClass();

    // Bind the function to the window resize event
    $(window).resize(function() {
        updateActiveClass();
    });
});
   
        </script>
    `);
});