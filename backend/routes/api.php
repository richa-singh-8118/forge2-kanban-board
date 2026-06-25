<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\BoardController;
use App\Http\Controllers\BoardListController;
use App\Http\Controllers\CardController;
use App\Http\Controllers\MemberController;
use App\Http\Controllers\TagController;

// Since we are building an MVP without auth for now, we'll expose these publicly.
// If auth is added later, these can be wrapped in a 'auth:sanctum' middleware group.

Route::apiResource('boards', BoardController::class);
Route::apiResource('lists', BoardListController::class);
Route::apiResource('cards', CardController::class);
Route::apiResource('members', MemberController::class);
Route::apiResource('tags', TagController::class);

// Custom routes for cards
Route::put('cards/{card}/move', [CardController::class, 'move']);
Route::put('cards/{card}/assign', [CardController::class, 'assign']);
Route::post('cards/{card}/tags', [CardController::class, 'addTag']);
Route::delete('cards/{card}/tags/{tagId}', [CardController::class, 'removeTag']);
