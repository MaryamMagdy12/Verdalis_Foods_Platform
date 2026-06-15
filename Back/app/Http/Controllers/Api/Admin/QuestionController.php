<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Mail\QuestionReplyMail;
use App\Models\Question;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class QuestionController extends Controller
{
    public function index(): JsonResponse
    {
        $questions = Question::with('product')->orderByDesc('created_at')->get();
        return response()->json(['data' => $questions]);
    }

    public function show(Question $question): JsonResponse
    {
        $question->load('product');
        return response()->json(['data' => $question]);
    }

    public function reply(Request $request, Question $question): JsonResponse
    {
        $request->validate(['reply' => 'required|string'], [
            'reply.required' => 'Please enter your reply message.',
            'reply.string' => 'Reply must be text.',
        ]);
        try {
            Mail::to($question->email)->send(new QuestionReplyMail($question, $request->reply));
        } catch (\Throwable $e) {
            Log::error('Question reply email failed', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return response()->json([
                'message' => 'Failed to send email: ' . $e->getMessage(),
            ], 500);
        }
        $question->update([
            'replied_at' => now(),
            'admin_reply' => $request->reply,
        ]);
        return response()->json(['message' => 'Reply sent.', 'data' => $question->fresh()]);
    }
}
