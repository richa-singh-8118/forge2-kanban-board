<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BoardList extends Model
{
    protected $fillable = ['board_id', 'title', 'position'];

    public function board()
    {
        return $this->belongsTo(Board::class);
    }

    public function cards()
    {
        return $this->hasMany(Card::class)->orderBy('position');
    }
}
