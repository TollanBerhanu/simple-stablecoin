import React from 'react';
import {
    BrowserRouter as Router,
    Routes,
    Route
} from 'react-router-dom';
import Layout from './Layout/Layout';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="*" element={
          <div>
            <Layout />
          </div>
        }/>
      </Routes>
    </Router>
  );
}

export default App;
