document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    if (!sessionStorage.getItem('isLoggedIn') || sessionStorage.getItem('isLoggedIn') !== 'true') {
        console.log('User not logged in. Redirecting to login page...');
        redirectToLogin();
    } else {
        // User is logged in, check user role
        var user = JSON.parse(sessionStorage.getItem('user'));
        if (!user) {
            console.log('User information not found. Redirecting to login page...');
            redirectToLogin();
        } else if (user.role === 'admin') {
            // Add further admin page initialization logic here
            console.log('Admin page loaded.');
        } else if (user.role === 'agriculturist') {
            // Add further agriculturist page initialization logic here
            console.log('Agriculturist page loaded.');
        } else {
            // If the user role does not match, redirect to login page
            console.log('Unauthorized role. Redirecting to login page...');
            redirectToLogin();
        }
    }
});

function redirectToLogin() {
    console.error('Redirecting to login page...');
    window.location.href = '/management/login';
}
