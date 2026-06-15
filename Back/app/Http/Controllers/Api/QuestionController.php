<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Question\StoreQuestionRequest;
use App\Models\Question;
use Illuminate\Http\JsonResponse;

class QuestionController extends Controller
{
    public function store(StoreQuestionRequest $request): JsonResponse
    {
        $q = Question::create($request->validated());

        return response()->json(['message' => 'Question submitted.', 'data' => ['id' => $q->id]], 201);
    }
}
