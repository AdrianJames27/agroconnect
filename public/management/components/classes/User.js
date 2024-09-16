// User.js
let users = [];

class User {
  constructor(userId, firstName, lastName, username, role, password = '') {
    this.userId = userId;
    this.firstName = firstName;
    this.lastName = lastName;
    this.username = username;
    this.role = role;
    this.password = password;
  }

  createUser(user) {
    const existingUser = users.find(u => u.username === user.username);
    if (existingUser) {
      alert('Username already exists');
      return;
    }

    fetch('/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(user),
    })
      .then(response => response.json())
      .then(data => {
        console.log('Success:', data);
      })
      .catch(error => {
        console.error('Error:', error);
      });
  }

  updateUser(updatedUser) {
    const existingUser = users.find(u => u.username === updatedUser.username);

    if (existingUser && existingUser.userId !== updatedUser.userId) {
      alert('Username already exists');
      return;
    }

    users = users.map(user =>
      user.userId === updatedUser.userId ? { ...user, ...updatedUser } : user
    );

    fetch(`/api/users/${updatedUser.userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedUser),
    })
      .then(response => response.json())
      .then(data => {
        console.log('Success:', data);
      })
      .catch(error => {
        console.error('Error:', error);
      });
  }

  removeUser(userId) {
    fetch(`/api/users/${userId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      }
    })
      .then(response => {
        if (response.status === 204) {
          users = users.filter(user => user.userId !== userId);
          console.log(`User with ID ${userId} deleted.`);
        } else if (response.status === 404) {
          console.error(`User with ID ${userId} not found.`);
        } else {
          console.error(`Failed to delete user with ID ${userId}.`);
        }
      })
      .catch(error => {
        console.error('Error:', error);
      });
  }
}

function getUser() {
  // Fetch users from Laravel backend
  $.ajaxSetup({
    headers: {
        'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
    }
  });

  // Fetch users from Laravel backend
  $.ajax({
    url: '/api/users', // Endpoint to fetch users
    method: 'GET',
    success: function(response) {
        // Assuming response is an array of users [{firstName, lastName, username, role}, ...]
        let user = response;

        users = user;
        console.log(users);
    },
    error: function(xhr, status, error) {
        console.error('Error fetching users:', error);
    }
  });
}

getUser();

function searchUser(searchTerm) {
  const lowerCaseSearchTerm = searchTerm.toLowerCase(); // Convert search term to lowercase for case-insensitive search
  
  const foundUsers = users.filter(user => {
    return Object.values(user).some(value => 
      value && value.toString().toLowerCase().includes(lowerCaseSearchTerm)
    );
  });

  return foundUsers;
}


export { User, getUser, searchUser, users };