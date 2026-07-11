<?php

use App\Http\Controllers\AdminChatController;
use App\Http\Controllers\AdminUserController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\BlogController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\OrderController;
use App\Http\Middleware\EnsureIsAdmin;
use Illuminate\Support\Facades\Route;

// BLOGS CRUD
Route::post('/admin/blog/store', [BlogController::class, 'store']);
Route::get('/admin/blog/index', [BlogController::class, 'index']);
Route::get('/admin/blog/show/{blog}', [BlogController::class, 'show']);
Route::delete('/admin/blog/destroy/{blog}', [BlogController::class, 'destroy']);
Route::get('/admin/blog/edit/{blog}', [BlogController::class, 'edit']);
Route::post('/admin/blog/update/{blog}', [BlogController::class, 'update']);

// USERS
Route::middleware('throttle:auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
});
Route::get('/user', function () {
    return response()->json(auth()->user());
})->middleware('auth', 'throttle:api');

Route::post('/logout', [AuthController::class, 'logout'])->middleware(['throttle:api']);

// ORDERS — logged-in users, own orders only
Route::middleware(['auth:sanctum', 'throttle:api'])->group(function () {
    Route::post('/orders', [OrderController::class, 'store']);
    Route::get('/orders/mine', [OrderController::class, 'myOrders']);
    Route::get('/orders/{order}', [OrderController::class, 'show']);
    Route::patch('/orders/{order}/confirm', [OrderController::class, 'confirm']);
    Route::patch('/orders/{order}/reject', [OrderController::class, 'reject']);
    Route::post('/orders/{order}/receipt', [OrderController::class, 'uploadReceipt']);
    Route::delete('/orders/{order}/receipt', [OrderController::class, 'deleteReceipt']);
});

// ORDERS — admin only
Route::middleware(['auth:sanctum', 'throttle:api', EnsureIsAdmin::class])->group(function () {
    Route::get('/admin/orders', [OrderController::class, 'index']);
    Route::patch('/admin/orders/{order}', [OrderController::class, 'update']);
    Route::delete('/admin/orders/{order}', [OrderController::class, 'destroy']);
    Route::get('/admin/orders/{order}/chat', [AdminChatController::class, 'orderMessages']);
    Route::post('/admin/orders/{order}/chat', [AdminChatController::class, 'orderReply']);
    Route::post('/admin/orders/{order}/receipt/review', [OrderController::class, 'reviewReceipt']);
    Route::post('/admin/orders/{order}/deliverable', [OrderController::class, 'uploadDeliverable']);
    Route::delete('/admin/orders/{order}/deliverable', [OrderController::class, 'deleteDeliverable']);
});

// User chat (logged in only)
Route::middleware(['auth:sanctum', 'throttle:api'])->group(function () {
    Route::get('/chat/session', [ChatController::class, 'getSession']);
    Route::get('/chat/messages', [ChatController::class, 'messages']);
    Route::post('/chat/send', [ChatController::class, 'send']);
    Route::get('/orders/{order}/chat', [ChatController::class, 'orderMessages']);
    Route::post('/orders/{order}/chat', [ChatController::class, 'orderSend']);
});

// Admin chat
Route::middleware(['auth:sanctum', 'throttle:api', EnsureIsAdmin::class])->group(function () {
    Route::get('/admin/chat/sessions', [AdminChatController::class, 'sessions']);
    Route::get('/admin/chat/sessions/{session}/messages', [AdminChatController::class, 'messages']);
    Route::post('/admin/chat/sessions/{session}/reply', [AdminChatController::class, 'reply']);
    Route::patch('/admin/chat/sessions/{session}/close', [AdminChatController::class, 'close']);
    Route::get('/admin/chat/unread', [AdminChatController::class, 'unreadCount']);
    Route::patch('/admin/chat/sessions/{session}/reopen', [AdminChatController::class, 'reopen']);
    Route::get('/admin/contacts', [ContactController::class, 'index']);
    Route::patch('/admin/contacts/{contact}', [ContactController::class, 'update']);
});
Route::post('/contact', [ContactController::class, 'store'])->middleware('throttle:api');

Route::middleware(['auth:sanctum', 'throttle:api'])->group(function () {
    Route::patch('/user/password', [AuthController::class, 'changePassword'])->middleware(['auth:sanctum', 'throttle:api']);
    Route::delete('/user', [AuthController::class, 'deleteAccount'])->middleware(['auth:sanctum', 'throttle:api']);
    Route::patch('/user', [AuthController::class, 'updateProfile']);
});

Route::middleware(['auth:sanctum', 'throttle:api', EnsureIsAdmin::class])->group(function () {
    Route::get('/admin/users', [AdminUserController::class, 'index']);
    Route::patch('/admin/users/{user}', [AdminUserController::class, 'update']);
    Route::delete('/admin/users/{user}', [AdminUserController::class, 'destroy']);
});
