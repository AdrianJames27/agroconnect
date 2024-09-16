$(document).ready(function() {

    // Check if the user is logged in
    if (!sessionStorage.getItem('isLoggedIn')) {
        // If not logged in, redirect to login page
        window.location.href = '/management/login';
    } else {
        var user = JSON.parse(sessionStorage.getItem('user'));
        if (user && user.role === 'admin') {
            window.location.href = '/management/admin'; // Redirect to admin page
        } else if (user && user.role === 'agriculturist') {
            window.location.href = '/management/agriculturist'; // Redirect to user page
        }
    }
});
