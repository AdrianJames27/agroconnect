<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\User;

class CheckUserSession
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next)
    {
        // Retrieve the token from the cookie
        $token = $request->cookie('auth_token');

        if (!$token) {
            // Token is missing
            return response()->json(['message' => 'No Token Provided'], 401);
        }

        // Extract the actual token part after '|'
        $tokenParts = explode('|', $token, 2);
        $actualToken = isset($tokenParts[1]) ? $tokenParts[1] : '';

        // Hash the token for comparison
        $hashedToken = hash('sha256', $actualToken);

        // Retrieve the token record from the database
        $tokenRecord = DB::table('personal_access_tokens')
            ->where('token', $hashedToken)
            ->first();

        if (!$tokenRecord) {
            // Token not found in the database
            return response()->json(['message' => 'Invalid Token'], 401);
        }

        // Retrieve the user using the tokenable_id
        $user = User::find($tokenRecord->tokenable_id);

        if (!$user) {
            // User not found
            return response()->json(['message' => 'User not found'], 404);
        }

        // Set the user in the request attributes for further use
        $request->attributes->set('user', $user);

        // Proceed to the next middleware or request handler
        return $next($request);
    }
}
