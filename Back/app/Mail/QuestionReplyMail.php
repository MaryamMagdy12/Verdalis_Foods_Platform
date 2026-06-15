<?php

namespace App\Mail;

use App\Models\Question;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class QuestionReplyMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Question $question,
        public string $reply
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Re: Your question',
            replyTo: [config('mail.from.address')],
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.question-reply',
        );
    }
}
