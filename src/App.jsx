import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Base from './Pages/Base';

import Login from './Pages/Login';
import Register from './Pages/Register';

function App() {
  return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/" element={<Base />} /> 
            </Routes>
        </Router>
    );
}

export default App;
