<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Foundation\Support\Providers\RouteServiceProvider as ServiceProvider;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Route;

class RouteServiceProvider extends ServiceProvider
{
    /**
     * The path to your application's "home" route.
     *
     * Typically, users are redirected here after authentication.
     *
     * @var string
     */
    public const HOME = '/home';

    /**
     * Define your route model bindings, pattern filters, and other route configuration.
     */
    public function boot(): void
    {
        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
        });

        $this->routes(function () {
            Route::middleware('api')
                ->prefix('api')
                ->group(base_path('routes/api.php'));

            Route::middleware('api')
                ->prefix('api/')
                ->group(base_path('routes/api/voucher.php'));

            Route::middleware('api')
                ->prefix('api/')
                ->group(base_path('routes/api/branch.php'));

            Route::middleware('api')
            ->prefix('api')
            ->group(base_path('routes/api/saleagent.php'));

            Route::middleware('api')
                ->prefix('api/')
                ->group(base_path('routes/api/user.php'));

            Route::middleware('api')
                ->prefix('api')
                ->group(base_path('routes/api/service.php'));

            Route::middleware('api')
                ->prefix('api')
                ->group(base_path('routes/api/tour.php'));

            Route::middleware('api')
            ->prefix('api')
            ->group(base_path('routes/api/booking.php'));

            Route::middleware('api')
            ->prefix('api')
            ->group(base_path('routes/api/bill.php'));

            Route::middleware('api')
            ->prefix('api')
            ->group(base_path('routes/api/refund.php'));

            Route::middleware('api')
            ->prefix('api')
            ->group(base_path('routes/api/statistic.php'));

            Route::middleware('web')
                ->group(base_path('routes/web.php'));

            Route::middleware('api')
                ->prefix('api')
                ->group(base_path('routes/api/checkin.php'));

            Route::middleware('api')
                ->prefix('api')
                ->group(base_path('routes/api/bookingactivity.php'));
            Route::middleware('api')
                ->prefix('api')
                ->group(base_path('routes/api/bookingtour.php'));
            Route::middleware('api')
                ->prefix('api')
                ->group(base_path('routes/api/changelogs.php'));
            Route::middleware('api')
                ->prefix('api')
                ->group(base_path('routes/api/bookingtourserviceuser.php'));
            Route::middleware('api')
                ->prefix('api')
                ->group(base_path('routes/api/message.php'));

        });
    }
}
