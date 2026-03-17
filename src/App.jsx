import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import Base from './Pages/Base';

import Login from './Pages/Login';
import Register from './Pages/Register';
import DayBoundsSetup from './Pages/DayBoundsSetup';

function App() {
  return (
        <ConfigProvider
            theme={{
                token: {
                    fontFamily: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif`,
                },
                components: {
                    Button: {
                        colorPrimary: '#232323',
                        algorithm: true,
                    },
                    Slider: {
                        railSize: 10,
                        handleSize: 20,
                        handleSizeHover: 20,
                    },
                },
            }}
        >
            <Router>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/day-setup" element={<DayBoundsSetup />} />
                    <Route path="/" element={<Base />} /> 
                </Routes>
            </Router>
        </ConfigProvider>
    );
}

export default App;
