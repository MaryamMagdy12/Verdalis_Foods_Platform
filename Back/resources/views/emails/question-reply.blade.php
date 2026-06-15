<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reply to your question</title>
</head>
<body style="font-family: sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <h2>Reply to your question</h2>
    <p>Hello {{ $question->name }},</p>
    <p>Thank you for your question. Here is our reply:</p>
    <div style="background: #f5f5f5; padding: 15px; border-radius: 6px; margin: 15px 0;">
        {!! nl2br(e($reply)) !!}
    </div>
    <p>If you have any further questions, please don't hesitate to contact us again.</p>
    <p>Best regards,<br>{{ config('app.name') }}</p>
</body>
</html>
