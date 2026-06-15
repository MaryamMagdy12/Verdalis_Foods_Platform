<?php

namespace App\Mail;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OrderConfirmationMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Order $order) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Order confirmed — '.$this->order->order_number,
        );
    }

    public function content(): Content
    {
        $frontend = rtrim((string) env('FRONTEND_URL', 'http://localhost:5174'), '/');
        $trackUrl = $frontend.'/track-order?order='.urlencode($this->order->order_number)
            .'&token='.urlencode((string) $this->order->tracking_token);

        return new Content(
            text: 'mail.order-confirmation-text',
            with: [
                'clientName' => $this->order->client?->name,
                'orderNumber' => $this->order->order_number,
                'trackingToken' => $this->order->tracking_token,
                'trackUrl' => $trackUrl,
                'paymentMethod' => $this->order->payment_method,
                'paymentStatus' => $this->order->payment_status,
                'status' => $this->order->status,
                'subtotal' => (float) $this->order->subtotal,
                'tax' => (float) $this->order->tax,
                'shipping' => (float) $this->order->shipping,
                'discount' => (float) $this->order->discount,
                'total' => (float) $this->order->total,
                'items' => $this->order->items,
            ],
        );
    }
}
