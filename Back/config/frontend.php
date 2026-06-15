<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Frontend application URLs
    |--------------------------------------------------------------------------
    |
    | Used for email links, Stripe redirects, and CORS-related documentation.
    | Set each to the production Vercel URL in production.
    |
    */

    'client_url' => rtrim(env('FRONTEND_URL', env('CLIENT_URL', 'http://localhost:5174')), '/'),

    'admin_url' => rtrim(env('ADMIN_URL', 'http://localhost:5175'), '/'),

    'shipper_url' => rtrim(env('SHIPPER_URL', 'http://localhost:5176'), '/'),

];
