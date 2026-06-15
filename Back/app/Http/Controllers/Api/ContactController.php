<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Contact\StoreContactRequest;
use App\Models\ContactMessage;
use Illuminate\Http\JsonResponse;

class ContactController extends Controller
{
    public function store(StoreContactRequest $request): JsonResponse
    {
        $msg = ContactMessage::create($request->validated());

        return response()->json(['message' => 'Message sent.', 'data' => ['id' => $msg->id]], 201);
    }
}
