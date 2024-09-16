export let user;

$(document).ready(function() {
    async function getCsrfToken() {
        return $('meta[name="csrf-token"]').attr('content');
    }
    
    async function requestCsrfCookie() {
        return $.ajax({
            url: '/api/csrf-cookie',
            type: 'GET',
            xhrFields: {
                withCredentials: true
            }
        });
    }
    
    async function checkToken() {
        const token = await getCsrfToken();
        return $.ajax({
            url: '/api/check-user',
            type: 'GET',
            xhrFields: {
                withCredentials: true
            },
            headers: {
                'X-CSRF-TOKEN': token
            }
        });
    }
    
    async function initialize() {
        try {
            await requestCsrfCookie();
            const response = await checkToken();
            
            if (response.message !== 'Invalid Token') {
                user = response.user;
                load();
            } else {
                window.location.href = '/management/login'; 
            }
        } catch (error) {
            console.error('An error occurred:', error);
            window.location.href = '/management/login'; 
        }
    }
    
    // Initialize CSRF token handling and token validation
    initialize(); 

    function load() {
            
        // Set default hash to #dashboard if no hash is present
        if (!window.location.hash) {
            window.location.hash = '#dashboard';
        }

        // Function to load content from a JavaScript module file into main content area
        async function loadContent(url) {
            try {
                // Dynamically import the module
                const module = await import(url);

                // Assuming your module has a default export or named exports
                if (module.default) {
                    module.default(); // Call the default export function if it exists
                }
            } catch (error) {
                console.error(`Failed to load module from ${url}:`, error);
            }
        }

        
        $('head').prepend(`
            <link rel="icon" href="../../../img/logo.png" type="image/png">   
        `);
        $('body').prepend(`
            <div class="wrapper">
                <!-- Header -->
                <div class="header">
                    <header class="header d-flex justify-content-between align-items-center" style="background-color: #008000;">
                        <div class="header d-flex align-items-center p-2">
                            <!-- Burger Menu Icon for smaller screens -->
                            <button class="navbar-toggler d-md-none mr-3" type="button" data-toggle="collapse" data-target="#sidebar" aria-controls="sidebar" aria-expanded="false" aria-label="Toggle navigation">
                                <span class="navbar-toggler-icon"><i class="fas fa-bars"></i></span>
                            </button>
                            <img src="../img/logo.png" alt="Logo" class="header-logo d-none d-md-block">
                            <h3 id="appName" class="pl-3 d-none d-md-block">AgroConnect Cabuyao</h3> <!-- Hidden on small screens -->
                        </div>
                        <div class="pr-4 d-flex align-items-center">
                            <span class="username font-weight-bold">${user.username}</span>
                            <span class="user-icon ml-3">
                                <i class="fas fa-user-circle"></i>
                            </span>
                        </div>
                    </header>
                </div>
        
                <!-- Sidebar and Content Wrapper -->
                <div class="content-wrapper d-flex">
                    <!-- Sidebar -->
                    <nav id="sidebar" class="sidebar collapse">
                        <!-- Close button for small screens -->
                        <button class="btn-close d-md-none" aria-label="Close" type="button">
                            <i class="fas fa-times"></i>
                        </button>
                        <!-- Logo for small screens -->
                        <div class="d-md-none text-center my-3">
                            <img src="../img/logo.png" alt="Logo" class="sidebar-logo">
                        </div>
                        <div>
                            <ul class="nav flex-column mt-4" id="sidebar-links">
                                <!-- Links will be dynamically added here -->
                            </ul>
                            <ul class="nav flex-column logout">
                                <li class="nav-item mt-auto">
                                    <a class="nav-link" href="#">
                                        <i class="fas fa-sign-out-alt"></i>
                                        Logout
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </nav>
        
                    <!-- Main Content Area -->
                    <main role="main" id="main-content" class="content ml-sm-auto col-lg-10 pr-4">
                        <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                            <h1 class="h2">Main Content</h1>
                        </div>
                        <div class="row">
                            <div class="col-md-12">
                                <p>Content area below the header and sidebar.</p>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
            <script>
                $(document).ready(function() {
                     // Close sidebar when close button is clicked
                    $('.btn-close').on('click', function() {
                        $('#sidebar').collapse('hide');
                    });

                    // Close sidebar when any sidebar link is clicked
                    $('#sidebar').on('click', '.nav-link', function() {
                        $('#sidebar').collapse('hide');
                    });
                });
            </script>
        `);
        
        

        // Determine which sidebar links to show based on user role
        function initializeSidebar() {
            var links = [
                { id: 'dashboard-link', href: '#dashboard', icon: 'fas fa-tachometer-alt', text: 'Dashboard' },
                { id: 'manage-users-link', href: '#manage-users', icon: 'fas fa-users', text: 'Manage Users' },
                { id: 'maintenance-link', href: '#maintenance', icon: 'fas fa-wrench', text: 'Maintenance' },
                { id: 'data-entries-link', href: '#data-entries', icon: 'fas fa-database', text: 'Data Entries' },
                { id: 'concerns-link', href: '#concerns', icon: 'fas fa-exclamation-triangle', text: 'Concerns' }
            ];
            console.log(user);
            // Filter links based on user role
            if (user.role === 'admin') {
                
                links.forEach(link => {
                    $('#sidebar-links').append(`
                        <li class="nav-item mt-3">
                            <a id="${link.id}" class="nav-link" href="${link.href}">
                                <i class="${link.icon}"></i>
                                ${link.text}
                            </a>
                        </li>
                    `);
                });
            } else if (user.role === 'agriculturist') {
                const agriculturistLinks = [
                    links[0], // Dashboard
                    links[2], // Maintenance
                    links[4]  // Concerns
                ];
                agriculturistLinks.forEach(link => {
                    $('#sidebar-links').append(`
                        <li class="nav-item mt-3">
                            <a id="${link.id}" class="nav-link" href="${link.href}">
                                <i class="${link.icon}"></i>
                                ${link.text}
                            </a>
                        </li>
                    `);
                });
            }
        }
        async function loadDefaultContent() {
            const hash = window.location.hash;
            let modulePath;
        
            // Determine which module to load based on the URL hash
            switch (hash) {
                case '#dashboard':
                    modulePath = '../components/pages/Dashboard.js';
                    await loadContent(modulePath);
                    setActiveLink('#dashboard-link');
                    break;
                case '#manage-users':
                    modulePath = '../components/pages/ManageUsers.js';
                    await loadContent(modulePath);
                    setActiveLink('#manage-users-link');
                    break;
                case '#maintenance':
                    modulePath = '../components/pages/Maintenance.js';
                    await loadContent(modulePath);
                    setActiveLink('#maintenance-link');
                    break;
                case '#data-entries':
                    modulePath = '../components/pages/DataEntries.js';
                    await loadContent(modulePath);
                    setActiveLink('#data-entries-link');
                    break;
                case '#concerns':
                    modulePath = '../components/pages/Concerns.js';
                    await loadContent(modulePath);
                    setActiveLink('#concerns-link');
                    break;
                default:
                    modulePath = '../components/pages/Dashboard.js';
                    await loadContent(modulePath);
                    setActiveLink('#dashboard-link');
                    break;
            }
        }
        
        // Example function to set the active link
        function setActiveLink(selector) {
            // Remove active class from all links
            $('.nav-link').removeClass('active');
            // Add active class to the selected link
            $(selector).addClass('active');
        }
        
        // Call loadDefaultContent when the page loads
        $(document).ready(function() {
            loadDefaultContent();
        
            // Also handle hash change if user navigates using browser history
            $(window).on('hashchange', function() {
                loadDefaultContent();
            });
        });

        // Initialize sidebar based on user role
        initializeSidebar();

        // Logout button click event
        $('.logout a').on('click', function() {
            $.ajax({
                url: '/api/logout', // Route to handle logout
                type: 'POST',
                xhrFields: {
                    withCredentials: true, // Ensure cookies are sent with the request
                },
                headers: {
                    'X-CSRF-TOKEN': getCsrfToken() // Include CSRF token if required
                },
                success: function(response) {
                    if (response.success) {
                        alert('You have been logged out.');
                        window.location.href = '/management/login'; // Redirect to login page
                    } else {
                        alert('Logout failed: ' + response.message);
                    }
                },
                error: function(xhr) {
                    alert('Logout failed: ' + xhr.responseJSON.message);
                }
            });
        });
    }

});

