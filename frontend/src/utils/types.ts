export interface Member {
  id: number;
  name: string;
  email: string;
}

export interface Tag {
  id: number;
  name: string;
  color: string;
}

export interface Card {
  id: number;
  board_list_id: number;
  title: string;
  description: string | null;
  due_date: string | null;
  member_id: number | null;
  position: number;
  member?: Member;
  tags?: Tag[];
}

export interface BoardList {
  id: number;
  board_id: number;
  title: string;
  position: number;
  cards?: Card[];
}

export interface Board {
  id: number;
  name: string;
  lists?: BoardList[];
}
