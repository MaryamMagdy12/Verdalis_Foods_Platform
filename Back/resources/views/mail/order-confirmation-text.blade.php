Hello{{ $clientName ? ' '.$clientName : '' }},

Thank you for your order with Verdalis Foods!

Order number: {{ $orderNumber }}
Status: {{ str_replace('_', ' ', $status) }}
Payment: {{ strtoupper($paymentMethod) }} ({{ str_replace('_', ' ', $paymentStatus) }})

Items:
@foreach ($items as $item)
- {{ $item->product_name }} × {{ $item->quantity }} — ${{ number_format((float) $item->line_total, 2) }}
@endforeach

Subtotal: ${{ number_format($subtotal, 2) }}
@if ($discount > 0)
Discount: -${{ number_format($discount, 2) }}
@endif
Tax: ${{ number_format($tax, 2) }}
Shipping: ${{ $shipping > 0 ? '$'.number_format($shipping, 2) : 'Free' }}
Total: ${{ number_format($total, 2) }}

Track your order:
Tracking token: {{ $trackingToken }}
Track online: {{ $trackUrl }}

You will also need the last 4 digits of the phone number on your account when tracking.

— Verdalis Foods
