<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreProjectRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'        => ['required', 'string', 'min:3', 'max:100'],
            'description' => ['nullable', 'string', 'max:1000'],
            'status'      => ['sometimes', Rule::in(['draft', 'in_progress', 'completed'])],
        ];
    }
}