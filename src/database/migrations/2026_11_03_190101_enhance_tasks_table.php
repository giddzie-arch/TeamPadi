<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->foreignId('assigned_to')->nullable()->after('project_id')->constrained('users')->nullOnDelete();
            $table->enum('status', ['todo', 'in_progress', 'done'])->default('todo')->after('title');
            $table->enum('priority', ['low', 'medium', 'high'])->default('medium')->after('status');
        });
    }

    public function down(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->dropForeign(['assigned_to']);
            $table->dropColumn(['assigned_to', 'status', 'priority']);
        });
    }
};