Hello{{ $shipperName ? ' '.$shipperName : '' }},

Manual warehouse pickup confirmation for order {{ $orderNumber }}.

Truck number: {{ $truckNumber }}

Your one-time pickup serial (valid {{ $expiresMinutes }} minutes):

{{ $serial }}

Enter this serial in the shipper app to confirm pickup. This code can only be used once.

— Verdalis Foods
