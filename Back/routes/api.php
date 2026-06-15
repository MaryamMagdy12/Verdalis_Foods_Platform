<?php

use Illuminate\Support\Facades\Route;

// Public catalog
Route::get('/products', [App\Http\Controllers\Api\ProductController::class, 'index']);
Route::get('/products/lookup', [App\Http\Controllers\Api\ProductController::class, 'lookup']);
Route::get('/products/highlighted', [App\Http\Controllers\Api\ProductController::class, 'highlighted']);
Route::get('/products/home-catalog', [App\Http\Controllers\Api\ProductController::class, 'homeCatalog']);
Route::get('/products/random', [App\Http\Controllers\Api\ProductController::class, 'random']);
Route::get('/products/{product}', [App\Http\Controllers\Api\ProductController::class, 'show']);
Route::get('/categories', [App\Http\Controllers\Api\CategoryController::class, 'index']);
Route::get('/categories/{category}', [App\Http\Controllers\Api\CategoryController::class, 'show']);
Route::get('/stores', [App\Http\Controllers\Api\StoreController::class, 'index']);
Route::get('/settings/warehouse', [App\Http\Controllers\Api\SettingController::class, 'warehouse']);
Route::post('/contact', [App\Http\Controllers\Api\ContactController::class, 'store'])->middleware('throttle:contact');
Route::post('/questions', [App\Http\Controllers\Api\QuestionController::class, 'store'])->middleware('throttle:contact');

// Payment webhook (no auth)
Route::post('/webhooks/stripe', [App\Http\Controllers\Api\StripeWebhookController::class, 'handle']);

// Auth
Route::post('/auth/register', [App\Http\Controllers\Api\AuthController::class, 'register'])->middleware('throttle:auth');
Route::post('/auth/register/verify', [App\Http\Controllers\Api\AuthController::class, 'registerVerify'])->middleware('throttle:otp');
Route::post('/auth/otp/resend', [App\Http\Controllers\Api\AuthController::class, 'resendOtp'])->middleware('throttle:otp');
Route::post('/auth/login', [App\Http\Controllers\Api\AuthController::class, 'login'])->middleware('throttle:auth');
Route::post('/auth/login/verify', [App\Http\Controllers\Api\AuthController::class, 'loginVerify'])->middleware('throttle:otp');
Route::post('/auth/google', [App\Http\Controllers\Api\AuthController::class, 'google'])->middleware('throttle:auth');
Route::post('/auth/forgot-password', [App\Http\Controllers\Api\AuthController::class, 'forgotPassword'])->middleware('throttle:password-reset');
Route::post('/auth/reset-password', [App\Http\Controllers\Api\AuthController::class, 'resetPassword'])->middleware('throttle:otp');
Route::post('/auth/shipper/login', [App\Http\Controllers\Api\AuthController::class, 'shipperLogin'])->middleware('throttle:auth');

Route::get('/orders/track', [App\Http\Controllers\Api\OrderController::class, 'track'])->middleware('throttle:track');

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [App\Http\Controllers\Api\AuthController::class, 'logout']);
    Route::get('/auth/me', [App\Http\Controllers\Api\AuthController::class, 'me']);
    Route::patch('/auth/profile/complete', [App\Http\Controllers\Api\ProfileController::class, 'complete']);
    Route::post('/auth/profile/photo', [App\Http\Controllers\Api\ProfileController::class, 'uploadPhoto']);

    Route::get('/orders', [App\Http\Controllers\Api\OrderController::class, 'index']);
    Route::post('/orders', [App\Http\Controllers\Api\OrderController::class, 'store']);
    Route::get('/orders/{order}', [App\Http\Controllers\Api\OrderController::class, 'show']);
    Route::post('/orders/{order}/checkout-session', [App\Http\Controllers\Api\OrderController::class, 'checkoutSession']);

    Route::get('/notifications', [App\Http\Controllers\Api\NotificationController::class, 'index']);
    Route::post('/notifications/read-all', [App\Http\Controllers\Api\NotificationController::class, 'markAllRead']);

    Route::apiResource('addresses', App\Http\Controllers\Api\AddressController::class)->except(['show']);
});

Route::prefix('shipper')->middleware(['auth:sanctum', 'role:shipper'])->group(function () {
    Route::get('/me', [App\Http\Controllers\Api\AuthController::class, 'me']);
    Route::get('/orders/today', [App\Http\Controllers\Api\ShipperController::class, 'todayOrders']);
    Route::get('/orders/{order:order_number}', [App\Http\Controllers\Api\ShipperController::class, 'show']);
    Route::post('/orders/{order:order_number}/resend-otp', [App\Http\Controllers\Api\ShipperController::class, 'resendDeliveryOtp'])->middleware('throttle:otp');
    Route::post('/pickup', [App\Http\Controllers\Api\ShipperController::class, 'scanPickup'])->middleware('throttle:shipper-scan');
    Route::post('/pickup/manual/request', [App\Http\Controllers\Api\ShipperController::class, 'requestManualPickup'])->middleware('throttle:otp');
    Route::post('/pickup/manual/confirm', [App\Http\Controllers\Api\ShipperController::class, 'confirmManualPickup'])->middleware('throttle:shipper-scan');
    Route::post('/deliver', [App\Http\Controllers\Api\ShipperController::class, 'confirmDelivery'])->middleware('throttle:deliver');
    Route::post('/failed', [App\Http\Controllers\Api\ShipperController::class, 'failedDelivery']);
    Route::get('/history', [App\Http\Controllers\Api\ShipperController::class, 'history']);
    Route::get('/performance', [App\Http\Controllers\Api\ShipperController::class, 'performance']);
});

Route::post('/admin/login', [App\Http\Controllers\Api\Admin\AuthController::class, 'login'])->middleware('throttle:auth');

Route::prefix('admin')->middleware(['auth:sanctum', 'admin.inactivity', 'admin'])->group(function () {
    Route::post('/logout', [App\Http\Controllers\Api\Admin\AuthController::class, 'logout']);
    Route::get('/me', [App\Http\Controllers\Api\Admin\AuthController::class, 'me']);

    Route::get('/analytics', [App\Http\Controllers\Api\Admin\DashboardController::class, 'analytics']);

    Route::apiResource('products', App\Http\Controllers\Api\Admin\ProductController::class);
    Route::apiResource('categories', App\Http\Controllers\Api\Admin\CategoryController::class);
    Route::apiResource('stores', App\Http\Controllers\Api\Admin\StoreController::class);

    Route::get('/orders', [App\Http\Controllers\Api\Admin\OrderController::class, 'index']);
    Route::get('/orders/{order}', [App\Http\Controllers\Api\Admin\OrderController::class, 'show']);
    Route::patch('/orders/{order}/status', [App\Http\Controllers\Api\Admin\OrderController::class, 'updateStatus']);
    Route::patch('/orders/{order}/assign-shipper', [App\Http\Controllers\Api\Admin\OrderController::class, 'assignShipper']);

    Route::get('/clients', [App\Http\Controllers\Api\Admin\ClientController::class, 'index']);
    Route::get('/clients/{client}', [App\Http\Controllers\Api\Admin\ClientController::class, 'show']);
    Route::delete('/clients/{client}', [App\Http\Controllers\Api\Admin\ClientController::class, 'destroy']);

    Route::get('/retailers', [App\Http\Controllers\Api\Admin\RetailerController::class, 'index']);
    Route::post('/retailers/{retailer}/approve', [App\Http\Controllers\Api\Admin\RetailerController::class, 'approve']);
    Route::post('/retailers/{retailer}/reject', [App\Http\Controllers\Api\Admin\RetailerController::class, 'reject']);
    Route::delete('/retailers/{retailer}', [App\Http\Controllers\Api\Admin\RetailerController::class, 'destroy']);

    Route::get('/admins', [App\Http\Controllers\Api\Admin\AdminUserController::class, 'index']);
    Route::post('/admins', [App\Http\Controllers\Api\Admin\AdminUserController::class, 'store']);
    Route::get('/admins/{admin}', [App\Http\Controllers\Api\Admin\AdminUserController::class, 'show']);
    Route::put('/admins/{admin}', [App\Http\Controllers\Api\Admin\AdminUserController::class, 'update']);
    Route::delete('/admins/{admin}', [App\Http\Controllers\Api\Admin\AdminUserController::class, 'destroy']);

    Route::get('/shippers', [App\Http\Controllers\Api\Admin\ShipperController::class, 'index']);
    Route::post('/shippers', [App\Http\Controllers\Api\Admin\ShipperController::class, 'store']);
    Route::get('/shippers/{shipper}', [App\Http\Controllers\Api\Admin\ShipperController::class, 'show']);
    Route::put('/shippers/{shipper}', [App\Http\Controllers\Api\Admin\ShipperController::class, 'update']);
    Route::delete('/shippers/{shipper}', [App\Http\Controllers\Api\Admin\ShipperController::class, 'destroy']);
    Route::get('/shippers/{shipper}/identity', [App\Http\Controllers\Api\Admin\ShipperController::class, 'downloadIdentity']);
    Route::get('/shippers/{shipper}/certificates/{index}', [App\Http\Controllers\Api\Admin\ShipperController::class, 'downloadCertificate'])->whereNumber('index');

    Route::get('/payments', [App\Http\Controllers\Api\Admin\PaymentController::class, 'index']);
    Route::patch('/payments/{order}', [App\Http\Controllers\Api\Admin\PaymentController::class, 'updateStatus']);
    Route::post('/payments/{order}/confirm', [App\Http\Controllers\Api\Admin\PaymentController::class, 'confirm']);

    Route::get('/stock-alerts', [App\Http\Controllers\Api\Admin\StockAlertController::class, 'index']);

    Route::get('contact-messages', [App\Http\Controllers\Api\Admin\ContactMessageController::class, 'index']);
    Route::get('contact-messages/{contactMessage}', [App\Http\Controllers\Api\Admin\ContactMessageController::class, 'show']);
    Route::post('contact-messages/{contactMessage}/reply', [App\Http\Controllers\Api\Admin\ContactMessageController::class, 'reply']);

    Route::get('questions', [App\Http\Controllers\Api\Admin\QuestionController::class, 'index']);
    Route::get('questions/{question}', [App\Http\Controllers\Api\Admin\QuestionController::class, 'show']);
    Route::post('questions/{question}/reply', [App\Http\Controllers\Api\Admin\QuestionController::class, 'reply']);

    Route::get('settings/warehouse', [App\Http\Controllers\Api\Admin\SettingController::class, 'getWarehouse']);
    Route::put('settings/warehouse', [App\Http\Controllers\Api\Admin\SettingController::class, 'updateWarehouse']);
});

if (app()->environment('local')) {
    Route::get('/test-mail', function () {
        $to = request('to', config('mail.from.address'));
        try {
            \Illuminate\Support\Facades\Mail::raw('Test email from Verdalis Foods.', function ($m) use ($to) {
                $m->to($to)->subject('Verdalis Foods – Test mail');
            });
            return response()->json(['message' => 'Test email sent to ' . $to]);
        } catch (\Throwable $e) {
            return response()->json(['message' => 'Failed to send email.'], 500);
        }
    });
}
