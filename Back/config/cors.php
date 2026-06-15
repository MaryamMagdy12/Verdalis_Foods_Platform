<?php

$isProduction = env('APP_ENV') === 'production';

$localOrigins = 'http://localhost:5174,http://localhost:5175,http://localhost:5176,http://127.0.0.1:5174,http://127.0.0.1:5175,http://127.0.0.1:5176';

return [

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => array_values(array_filter(array_map(
        'trim',
        explode(',', env('CORS_ALLOWED_ORIGINS', $isProduction ? '' : $localOrigins))
    ))),

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,

];
