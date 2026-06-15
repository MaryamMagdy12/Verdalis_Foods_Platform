<?php

namespace App\Mail;

use App\Models\Order;
use App\Models\Shipper;
use App\Services\PickupManualService;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PickupManualMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Order $order,
        public string $serial,
        public Shipper $shipper,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Pickup serial — '.$this->order->order_number,
        );
    }

    public function content(): Content
    {
        return new Content(
            text: 'mail.pickup-manual-text',
            with: [
                'shipperName' => $this->shipper->name,
                'orderNumber' => $this->order->order_number,
                'truckNumber' => $this->order->pickup_truck_number,
                'serial' => $this->serial,
                'expiresMinutes' => PickupManualService::SERIAL_TTL_MINUTES,
            ],
        );
    }
}
