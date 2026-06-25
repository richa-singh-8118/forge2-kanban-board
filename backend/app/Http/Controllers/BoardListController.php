<?php

namespace App\Http\Controllers;

use App\Models\BoardList;
use Illuminate\Http\Request;

class BoardListController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'board_id' => 'required|exists:boards,id',
            'title' => 'required|string|max:255',
            'position' => 'integer'
        ]);

        if (!isset($validated['position'])) {
            $maxPosition = BoardList::where('board_id', $validated['board_id'])->max('position');
            $validated['position'] = $maxPosition !== null ? $maxPosition + 1 : 0;
        }

        $boardList = BoardList::create($validated);
        return response()->json($boardList, 201);
    }

    public function update(Request $request, BoardList $boardList)
    {
        $validated = $request->validate([
            'title' => 'string|max:255',
            'position' => 'integer'
        ]);

        $boardList->update($validated);
        return response()->json($boardList);
    }

    public function destroy(BoardList $boardList)
    {
        \Illuminate\Support\Facades\DB::transaction(function () use ($boardList) {
            BoardList::where('board_id', $boardList->board_id)
                ->where('position', '>', $boardList->position)
                ->decrement('position');
            $boardList->delete();
        });
        return response()->json(null, 204);
    }
}
