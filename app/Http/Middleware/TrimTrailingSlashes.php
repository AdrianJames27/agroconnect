<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class TrimTrailingSlashes
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
        $path = $request->getPathInfo();

        // If the URL has multiple trailing slashes, redirect to the correct URL
        if ($path !== '/' && preg_match('/\/+$/', $path)) {
            return redirect(rtrim($path, '/'), 301);
        }

        return $next($request);
    }
}
