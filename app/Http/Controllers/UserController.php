<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class UserController extends Controller
{

    public function index()
    {
        // Get all users, excluding those with the role 'guest', with admins first, ordered by their ID in descending order
        $users = User::where('role', '<>', 'guest') // Exclude users with the role 'guest'
            ->orderByRaw("CASE WHEN role = 'admin' THEN 0 ELSE 1 END") // Order by role, admins first
            ->orderBy('userId', 'desc') // Then order by userId in descending order
            ->get();

        return response()->json($users, 200);
    }


    public function store(Request $request)
    {
        $request->validate([
            'firstName' => 'required|string',
            'lastName' => 'required|string',
            'username' => 'required|unique:users,username',
            'password' => 'required|min:8',
            'role' => 'required',
        ]);

        // Accessing input data using $request->input('fieldName')
        $user = new User([
            'firstName' => $request->input('firstName'),
            'lastName' => $request->input('lastName'),
            'username' => $request->input('username'),
            'password' => Hash::make($request->input('password')),
            'role' => $request->input('role'),
        ]);

        $user->save();

        return response()->json($user, 201);
    }

    public function show($id)
    {
        $user = User::findOrFail($id);
        return response()->json($user, 200);
    }

    public function update(Request $request, $id)
    {
        // Find user by ID
        $user = User::findOrFail($id);

        // Validate request data
        $request->validate([
            'firstName' => 'string',
            'lastName' => 'string',
            'role' => 'in:agriculturist',
            'password' => 'nullable|string|min:4', // Ensure minimum length for password if required
        ]);

        // Update user attributes
        $user->fill($request->only(['firstName', 'lastName', 'username', 'role']));

        // Check if password is provided and update if it has a value
        if ($request->has('password') && !empty($request->password)) {
            $user->password = Hash::make($request->password); // Hash the password
        }

        // Save updated user to the database
        $user->save();

        // Return JSON response with the updated user and status code 200 (OK)
        return response()->json($user, 200);
    }

    public function destroy($id)
    {
        $user = User::find($id);
        if ($user) {
            $user->delete();
            return response()->json(null, 204);
        } else {
            return response()->json(['message' => 'User not found'], 404);
        }
    }


    public function login(Request $request)
    {
        // Validate request input
        $request->validate([
            'username' => 'required|string',
            'password' => 'required|string',
        ]);

        // Find the user by username
        $user = User::where('username', $request->username)->first();

        // Check if user exists and password is correct
        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'username' => ['The provided credentials are incorrect.'],
            ]);
        }

        // Create a new token
        $token = $user->createToken('Personal Access Token', [], now()->addDays(7))->plainTextToken;

        // Set a session cookie to store the token (no expiration set, so it will expire when the browser is closed)
        $cookie = cookie('auth_token', $token, 0, null, null, false, true); // HttpOnly = true

        // Return the user and token information with the cookie
        return response()->json([
            'user' => $user,
            'token' => $token
        ])->cookie($cookie);
    }


    /**
     * Log out the user.
     */
    public function logout(Request $request)
    {
        // Revoke the token that was used to authenticate the current request
        $request->user()->currentAccessToken()->delete();

        // Create a cookie that expires in the past to clear it
        $cookie = cookie('auth_token', '', -1); // Set an expiration date in the past

        return response()->json([
            'message' => 'Successfully logged out',
            'success' => true // Indicate success
        ])->withCookie($cookie);
    }

    public function adminChangePassword(Request $request, User $user)
    {
        // Validate the request
        $request->validate([
            'new_password' => 'required|min:8',
        ]);

        // Update the user's password
        $user->password = Hash::make($request->new_password);
        $user->save();

        return response()->json(['message' => 'Password change successfully'], 200);
    }
}
