<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OtpMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $code,
        public string $purpose,
    ) {}

    public function envelope(): Envelope
    {
        $subject = match ($this->purpose) {
            'register' => 'Verify your Verdalis Foods registration',
            'password_reset' => 'Reset your Verdalis Foods password',
            'admin_login' => 'Admin sign-in verification code',
            'shipper_login' => 'Shipper sign-in verification code',
            default => 'Your Verdalis Foods sign-in code',
        };

        return new Envelope(subject: $subject);
    }

    public function content(): Content
    {
        return new Content(
            text: 'mail.otp-text',
        );
    }
}
