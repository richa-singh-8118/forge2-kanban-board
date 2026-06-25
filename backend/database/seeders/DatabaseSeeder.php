<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Board;
use App\Models\BoardList;
use App\Models\Card;
use App\Models\Member;
use App\Models\Tag;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Members
        $richa = Member::create(['name' => 'Richa Singh', 'email' => 'richa@example.com']);
        $rahul = Member::create(['name' => 'Rahul Sharma', 'email' => 'rahul@example.com']);
        $aman  = Member::create(['name' => 'Aman Gupta', 'email' => 'aman@example.com']);
        $priya = Member::create(['name' => 'Priya Verma', 'email' => 'priya@example.com']);

        // Tags
        $bug      = Tag::create(['name' => 'Bug',      'color' => '#ef4444']); // Red
        $feature  = Tag::create(['name' => 'Feature',  'color' => '#3b82f6']); // Blue
        $design   = Tag::create(['name' => 'Design',   'color' => '#a855f7']); // Purple
        $backend  = Tag::create(['name' => 'Backend',  'color' => '#10b981']); // Green
        $frontend = Tag::create(['name' => 'Frontend', 'color' => '#f97316']); // Orange
        $urgent   = Tag::create(['name' => 'Urgent',   'color' => '#ef4444']); // Red

        // Board
        $board = Board::create(['name' => 'Forge 2 Qualifier']);

        // Lists
        $todo       = BoardList::create(['board_id' => $board->id, 'title' => 'To Do',       'position' => 0]);
        $inProgress = BoardList::create(['board_id' => $board->id, 'title' => 'In Progress', 'position' => 1]);
        $done       = BoardList::create(['board_id' => $board->id, 'title' => 'Done',        'position' => 2]);

        // Cards
        $c1 = Card::create([
            'board_list_id' => $todo->id,
            'title' => 'Setup Laravel Backend',
            'description' => 'Create API and database models',
            'due_date' => '2026-06-25 00:00:00', // Due 25 Jun 2026
            'member_id' => $richa->id,
            'position' => 0
        ]);
        $c1->tags()->attach([$backend->id]);

        $c2 = Card::create([
            'board_list_id' => $todo->id,
            'title' => 'Build React UI',
            'description' => 'Create Kanban frontend',
            'due_date' => '2026-06-26 00:00:00', // Due 26 Jun 2026
            'member_id' => $rahul->id,
            'position' => 1
        ]);
        $c2->tags()->attach([$frontend->id]);

        $c3 = Card::create([
            'board_list_id' => $todo->id,
            'title' => 'Implement Drag & Drop',
            'description' => 'Move cards between lists',
            'due_date' => '2026-06-27 00:00:00', // Due 27 Jun 2026
            'member_id' => $aman->id,
            'position' => 2
        ]);
        $c3->tags()->attach([$feature->id]);
    }
}
