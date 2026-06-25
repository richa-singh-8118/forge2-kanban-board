<?php

namespace App\Http\Controllers;

use App\Models\Board;
use Illuminate\Http\Request;

class BoardController extends Controller
{
    public function index()
    {
        return response()->json(Board::all());
    }

    public function store(Request $request)
    {
        $validated = $request->validate(['name' => 'required|string|max:255']);
        $board = Board::create($validated);
        return response()->json($board, 201);
    }

    public function show(Board $board)
    {
        return response()->json($board->load(['lists' => function ($query) {
            $query->orderBy('position');
        }, 'lists.cards' => function ($query) {
            $query->orderBy('position');
        }, 'lists.cards.tags', 'lists.cards.member']));
    }

    public function update(Request $request, Board $board)
    {
        $validated = $request->validate(['name' => 'required|string|max:255']);
        $board->update($validated);
        return response()->json($board);
    }

    public function destroy(Board $board)
    {
        $board->delete();
        return response()->json(null, 204);
    }
}
