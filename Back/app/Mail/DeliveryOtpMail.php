<?php

namespace App\Mail;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class DeliveryOtpMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Order $order, public string $code) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Your Verdalis Foods delivery code — '.$this->order->order_number,
        );
    }

    public function content(): Content
    {
        return new Content(
            text: 'mail.delivery-otp-text',
            with: [
                'code' => $this->code,
                'orderNumber' => $this->order->order_number,
                'clientName' => $this->order->client?->name,
            ],
        );
    }
}
