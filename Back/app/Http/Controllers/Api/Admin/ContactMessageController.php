<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Mail\ContactReplyMail;
use App\Models\ContactMessage;
use App\Models\Question;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class ContactMessageController extends Controller
{
    /**
     * Return all contact messages and questions in one list (from both contact forms).
     * Each item has a "type" field: "contact" or "question" so the dashboard can
     * show real data from both forms and use the correct reply endpoint.
     */
    public function index(): JsonResponse
    {
        $contactMessages = ContactMessage::orderByDesc('created_at')->get()
            ->map(fn (ContactMessage $m) => [
                'id' => $m->id,
                'type' => 'contact',
                'name' => $m->name,
                'company_name' => $m->company_name,
                'phone' => $m->phone,
                'address' => $m->address,
                'email' => $m->email,
                'message' => $m->message,
                'replied_at' => $m->replied_at?->toIso8601String(),
                'admin_reply' => $m->admin_reply,
                'created_at' => $m->created_at->toIso8601String(),
            ]);

        $questions = Question::orderByDesc('created_at')->get()
            ->map(fn (Question $q) => [
                'id' => $q->id,
                'type' => 'question',
                'name' => $q->name,
                'company_name' => null,
                'phone' => null,
                'address' => null,
                'email' => $q->email,
                'message' => $q->message,
                'product_id' => $q->product_id,
                'replied_at' => $q->replied_at?->toIso8601String(),
                'admin_reply' => $q->admin_reply,
                'created_at' => $q->created_at->toIso8601String(),
            ]);

        $data = $contactMessages->concat($questions)
            ->sortByDesc('created_at')
            ->values()
            ->all();

        return response()->json(['data' => $data]);
    }

    public function show(ContactMessage $contactMessage): JsonResponse
    {
        return response()->json(['data' => $contactMessage]);
    }

    public function reply(Request $request, ContactMessage $contactMessage): JsonResponse
    {
        $request->validate(['reply' => 'required|string'], [
            'reply.required' => 'Please enter your reply message.',
            'reply.string' => 'Reply must be text.',
        ]);
        $email = $contactMessage->email ?? null;
        if (!$email) {
            return response()->json(['message' => 'No email to reply to.'], 422);
        }
        try {
            Mail::to($email)->send(new ContactReplyMail($contactMessage, $request->reply));
        } catch (\Throwable $e) {
            Log::error('Contact reply email failed', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return response()->json([
                'message' => 'Failed to send email: ' . $e->getMessage(),
            ], 500);
        }
        $contactMessage->update([
            'replied_at' => now(),
            'admin_reply' => $request->reply,
        ]);
        return response()->json(['message' => 'Reply sent.', 'data' => $contactMessage->fresh()]);
    }
}
