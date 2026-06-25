import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
  headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
});

async function runTests() {
  try {
    console.log("1. Creating Board...");
    const board = (await api.post('/boards', { name: 'E2E Test Board' })).data;
    console.log(`Board Created: ID ${board.id}`);

    console.log("2. Creating List 1...");
    const list1 = (await api.post('/lists', { board_id: board.id, title: 'To Do' })).data;
    console.log(`List 1 Created: ID ${list1.id}`);

    console.log("3. Creating List 2...");
    const list2 = (await api.post('/lists', { board_id: board.id, title: 'In Progress' })).data;
    console.log(`List 2 Created: ID ${list2.id}`);

    console.log("4. Creating Card...");
    const card = (await api.post('/cards', { board_list_id: list1.id, title: 'Test E2E Card' })).data;
    console.log(`Card Created: ID ${card.id} in List ${card.board_list_id}`);

    console.log("5. Moving Card between Lists...");
    const movedCard = (await api.put(`/cards/${card.id}/move`, { board_list_id: list2.id, position: 0 })).data;
    console.log(`Card Moved: Now in List ${movedCard.board_list_id}`);
    if (movedCard.board_list_id !== list2.id) throw new Error("Move failed");

    console.log("6. Assigning Member...");
    let member;
    const members = (await api.get('/members')).data;
    if (members.length > 0) member = members[0];
    else member = (await api.post('/members', { name: 'Test User', email: 'test@example.com' })).data;
    
    const assignedCard = (await api.put(`/cards/${card.id}/assign`, { member_id: member.id })).data;
    console.log(`Member Assigned: ID ${assignedCard.member_id}`);
    if (assignedCard.member_id !== member.id) throw new Error("Assign failed");

    console.log("7. Setting Due Date...");
    const due_date = new Date(Date.now() + 86400000).toISOString().split('T')[0]; // Tomorrow
    const updatedCard = (await api.put(`/cards/${card.id}`, { title: 'Test E2E Card', due_date })).data;
    console.log(`Due Date Set: ${updatedCard.due_date}`);
    if (!updatedCard.due_date) throw new Error("Due date failed");

    console.log("8. Adding Tags...");
    let tag;
    const tags = (await api.get('/tags')).data;
    if (tags.length > 0) tag = tags[0];
    else tag = (await api.post('/tags', { name: 'E2E Tag', color: '#000000' })).data;
    
    await api.post(`/cards/${card.id}/tags`, { tag_id: tag.id });
    console.log(`Tag Added: ID ${tag.id}`);

    // Verify Board State
    const finalBoard = (await api.get(`/boards/${board.id}`)).data;
    const finalCard = finalBoard.lists.find(l => l.id === list2.id).cards.find(c => c.id === card.id);
    if (!finalCard) throw new Error("Card not found in the correct list upon fetch");
    if (finalCard.tags.length === 0) throw new Error("Tags not attached on fetch");

    console.log("--- E2E Tests Completed Successfully! ---");
    
    await api.delete(`/boards/${board.id}`);
    console.log("Cleanup: Test Board Deleted.");
  } catch (error) {
    console.error("TEST FAILED:", error.message);
    if (error.response) console.error(error.response.data);
    process.exit(1);
  }
}
runTests();
