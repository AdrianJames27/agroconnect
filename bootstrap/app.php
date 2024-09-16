<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use App\Http\Middleware\CheckUserSession;
use App\Http\Middleware\AttachSanctumTokenFromCookie;
use App\Http\Middleware\TrimTrailingSlashes;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        api: __DIR__ . '/../routes/api.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->api(prepend: [
            AttachSanctumTokenFromCookie::class,
        ]);
        $middleware->alias([
            'check.user' => CheckUserSession::class,
            'trailing.slash' => TrimTrailingSlashes::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
