<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // 60 requests on public pages
        RateLimiter::for('api', function ($request) {
            return Limit::perMinute(60)
                ->by($request->user()?->id ?: $request->ip());
        });

        // 5 requests for sign up and login in 15 minute
        RateLimiter::for('auth', function ($request) {
            return Limit::perMinutes(15, 5)->by($request->ip());
        });
    }
}
