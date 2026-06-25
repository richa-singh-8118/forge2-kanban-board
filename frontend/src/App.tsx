import React from 'react';
import { KanbanProvider } from './context/KanbanContext';
import { HomePage } from './pages/HomePage';

function App() {
  return (
    <KanbanProvider>
      <HomePage />
    </KanbanProvider>
  );
}

export default App;
