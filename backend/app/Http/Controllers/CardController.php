<?php

namespace App\Http\Controllers;

use App\Models\Card;
use Illuminate\Http\Request;

class CardController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'board_list_id' => 'required|exists:board_lists,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'due_date' => 'nullable|date',
            'member_id' => 'nullable|exists:members,id',
            'position' => 'integer'
        ]);

        if (!isset($validated['position'])) {
            $maxPosition = Card::where('board_list_id', $validated['board_list_id'])->max('position');
            $validated['position'] = $maxPosition !== null ? $maxPosition + 1 : 0;
        }

        $card = Card::create($validated);
        return response()->json($card->load('tags', 'member'), 201);
    }

    public function show(Card $card)
    {
        return response()->json($card->load('tags', 'member'));
    }

    public function update(Request $request, Card $card)
    {
        $validated = $request->validate([
            'title' => 'string|max:255',
            'description' => 'nullable|string',
            'due_date' => 'nullable|date',
        ]);
        $card->update($validated);
        return response()->json($card->load('tags', 'member'));
    }

    public function destroy(Card $card)
    {
        \Illuminate\Support\Facades\DB::transaction(function () use ($card) {
            Card::where('board_list_id', $card->board_list_id)
                ->where('position', '>', $card->position)
                ->decrement('position');
            $card->delete();
        });
        return response()->json(null, 204);
    }

    public function move(Request $request, Card $card)
    {
        $validated = $request->validate([
            'board_list_id' => 'required|exists:board_lists,id',
            'position' => 'required|integer|min:0'
        ]);

        $oldListId = $card->board_list_id;
        $newListId = $validated['board_list_id'];
        $oldPosition = $card->position;
        $newPosition = $validated['position'];

        \Illuminate\Support\Facades\DB::transaction(function () use ($card, $oldListId, $newListId, $oldPosition, $newPosition) {
            if ($oldListId === $newListId) {
                // Moving within the same list
                if ($oldPosition < $newPosition) {
                    // Moving down/right: shift other cards up (decrement position)
                    Card::where('board_list_id', $oldListId)
                        ->where('id', '!=', $card->id)
                        ->whereBetween('position', [$oldPosition + 1, $newPosition])
                        ->decrement('position');
                } elseif ($oldPosition > $newPosition) {
                    // Moving up/left: shift other cards down (increment position)
                    Card::where('board_list_id', $oldListId)
                        ->where('id', '!=', $card->id)
                        ->whereBetween('position', [$newPosition, $oldPosition - 1])
                        ->increment('position');
                }
            } else {
                // Moving to a different list
                // 1. Shift cards in the source list down (decrement position) for cards that were after the moved card
                Card::where('board_list_id', $oldListId)
                    ->where('position', '>', $oldPosition)
                    ->decrement('position');

                // 2. Shift cards in the target list up (increment position) for cards starting at newPosition
                Card::where('board_list_id', $newListId)
                    ->where('position', '>=', $newPosition)
                    ->increment('position');
            }

            // 3. Update the moved card itself
            $card->update([
                'board_list_id' => $newListId,
                'position' => $newPosition
            ]);
        });

        return response()->json($card->load('tags', 'member'));
    }

    public function assign(Request $request, Card $card)
    {
        $validated = $request->validate([
            'member_id' => 'nullable|exists:members,id'
        ]);
        $card->update($validated);
        return response()->json($card->load('member'));
    }

    public function addTag(Request $request, Card $card)
    {
        $validated = $request->validate(['tag_id' => 'required|exists:tags,id']);
        $card->tags()->syncWithoutDetaching([$validated['tag_id']]);
        return response()->json($card->load('tags'));
    }

    public function removeTag(Card $card, $tagId)
    {
        $card->tags()->detach($tagId);
        return response()->json($card->load('tags'));
    }
}
