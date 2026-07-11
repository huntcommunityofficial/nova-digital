<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'price' => 'sometimes|numeric|min:0',
            'status' => 'sometimes|string|in:pending,awaiting_payment,paid,in_progress,completed,cancelled,quote_requested,quoted,confirmed,rejected',
            'details' => 'sometimes|array',
        ];
    }
}
