import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import ruRU from 'antd/locale/ru_RU';
import Base from './Pages/Base';

import Login from './Pages/Login';
import Register from './Pages/Register';
import DayBoundsSetup from './Pages/DayBoundsSetup';
import TimePlans from './Pages/TimePlans';
import Calendars from './Pages/Calendars';
import MainTopBar from './Components/MainTopBar';

function AppShell() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #171717 0%, #101010 58%, #2e2e2e 100%)',
        padding: '10px',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
      }}
    >
      <MainTopBar />
      <div style={{ flex: 1, minHeight: 0 }}>
        <Outlet />
      </div>
    </div>
  );
}

function App() {
  return (
        <ConfigProvider
            locale={ruRU}
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
                    <Route element={<AppShell />}>
                        <Route path="/time-plans" element={<TimePlans />} />
                        <Route path="/calendars" element={<Calendars />} />
                        <Route path="/" element={<Base />} />
                    </Route>
                </Routes>
            </Router>
        </ConfigProvider>
    );
}

export default App;
