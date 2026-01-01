<?php

use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        api: __DIR__ . '/../routes/api.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);

        $middleware->web(append: [
            HandleAppearance::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);
        $middleware->validateCsrfTokens(except: [
            'api/*',
        ]);

        // Konfigurasi redirect untuk guest middleware pada guard agent
        $middleware->redirectGuestsTo(function ($request) {
            // Jika mengakses route agent, redirect ke agent login
            if ($request->routeIs('agent.*')) {
                return route('agent.login');
            }
            // Default redirect ke login biasa
            return route('login');
        });

        // Konfigurasi redirect untuk authenticated users yang akses guest pages
        $middleware->redirectUsersTo(function ($request) {
            // Jika mengakses route agent, redirect ke agent dashboard
            if ($request->routeIs('agent.*')) {
                return route('agent.dashboard');
            }
            // Default redirect ke dashboard biasa
            return route('dashboard');
        });
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
