<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class AttachSanctumTokenFromCookie
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next)
    {
        // Check if the 'auth_token' cookie exists
        $token = $request->cookie('auth_token');

        if ($token) {
            // Set the token in the Authorization header as a Bearer token
            $request->headers->set('Authorization', 'Bearer ' . $token);
        }

        return $next($request);
    }
}
