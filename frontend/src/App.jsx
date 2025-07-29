import React from 'react';
import ThemeProvider from './contexts/ThemeContext';
import ChatContainer from './components/ChatContainer';

function App() {
  return (
    <ThemeProvider>
      <div className="app">
        <ChatContainer />
      </div>
    </ThemeProvider>
  );
}

export default App;
