<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reply to your message</title>
</head>
<body style="font-family: sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <h2>Reply to your contact message</h2>
    <p>Hello {{ $contactMessage->name }},</p>
    <p>Thank you for getting in touch. Here is our reply:</p>
    <div style="font-weight: bold;">Your message was:</div>
    <div style="background: #004212; padding: 15px; border-radius: 6px; margin: 15px 0; color: #fff;">
        {!! nl2br(e($contactMessage->message)) !!}
    </div>
    <div style="font-weight: bold;">Our reply is:</div>
    <div style="background: #f5f5f5; padding: 15px; border-radius: 6px; margin: 15px 0;">
        {!! nl2br(e($reply)) !!}
    </div>
    <p>If you have any further questions, please don't hesitate to contact us again.</p>
    <p>Best regards,<br>{{ config('app.name') }}</p>
</body>
</html>
