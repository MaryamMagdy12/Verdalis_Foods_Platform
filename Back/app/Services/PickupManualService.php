<?php

namespace App\Services;

use App\Mail\PickupManualMail;
use App\Models\Order;
use App\Models\Shipper;
use App\Support\ShipperPin;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class PickupManualService
{
    public const SERIAL_TTL_MINUTES = 15;

    public function assertShipperCredentials(Shipper $shipper, string $password, string $pin): void
    {
        if (! $shipper->password || ! Hash::check($password, $shipper->password)) {
            throw new \InvalidArgumentException('Invalid shipper password.');
        }

        if (! ShipperPin::matches($shipper->shipper_pin, $pin)) {
            throw new \InvalidArgumentException('Invalid company PIN.');
        }
    }

    public function issueSerial(Order $order, Shipper $shipper, string $password, string $pin, string $truckNumber): void
    {
        $this->assertShipperCredentials($shipper, $password, $pin);

        if (! $shipper->email) {
            throw new \InvalidArgumentException('Shipper account has no email on file.');
        }

        $serial = strtoupper(Str::random(8));

        $order->pickup_truck_number = trim($truckNumber);
        $order->pickup_serial_hash = Hash::make($serial);
        $order->pickup_serial_expires_at = now()->addMinutes(self::SERIAL_TTL_MINUTES);
        $order->pickup_serial_used_at = null;
        $order->save();

        try {
            Mail::to($shipper->email)->send(new PickupManualMail($order, $serial, $shipper));
        } catch (\Throwable $e) {
            Log::error('Manual pickup serial mail failed', [
                'order_id' => $order->id,
                'shipper_id' => $shipper->id,
                'error' => $e->getMessage(),
            ]);
            throw new \RuntimeException('Could not send pickup serial email. Try again.');
        }

        if (config('app.debug')) {
            Log::info('Manual pickup serial issued (local debug)', [
                'order_number' => $order->order_number,
                'shipper_email' => $shipper->email,
                'serial' => $serial,
                'expires_at' => $order->pickup_serial_expires_at?->toIso8601String(),
            ]);
        }
    }

    public function verifySerial(Order $order, Shipper $shipper, string $serial): void
    {
        if ($order->shipper_id !== $shipper->id) {
            throw new \InvalidArgumentException('Order not assigned to you.');
        }

        if (! $order->pickup_serial_hash) {
            throw new \InvalidArgumentException('Request a pickup serial first.');
        }

        if ($order->pickup_serial_used_at) {
            throw new \InvalidArgumentException('Pickup serial has already been used.');
        }

        if ($order->pickup_serial_expires_at?->isPast()) {
            throw new \InvalidArgumentException('Pickup serial has expired. Request a new one.');
        }

        if (! Hash::check(strtoupper(trim($serial)), $order->pickup_serial_hash)) {
            throw new \InvalidArgumentException('Invalid pickup serial.');
        }

        $order->pickup_serial_used_at = now();
        $order->save();
    }
}
