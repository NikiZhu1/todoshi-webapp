import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { Avatar, Button, Dropdown, Skeleton, Space, Typography } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

import { useUsers } from '../Hooks/useUsers';

const { Text, Title } = Typography;

function MainTopBar() {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');

    const { logoutUser, GetUserIdFromJWT, getUserInfo } = useUsers();

    const profileMenuItems = [
        { key: 'settings', label: 'Настройки' },
        { key: 'logout', label: 'Выход', danger: true },
    ];

    useEffect(() => {
        const loadUser = async () => {
            const token = Cookies.get('token');
            const userId = GetUserIdFromJWT(token);
            if (!userId) {
                return;
            }

            try {
                const userInfo = await getUserInfo(userId);
                setUsername(
                    userInfo?.username ??
                    userInfo?.userName ??
                    userInfo?.name ??
                    'Пользователь'
                );
            } catch (error) {
                console.error('Ошибка загрузки имени пользователя:', error);
                setUsername('Пользователь');
            }
        };

        loadUser();
    }, []);

    const handleProfileMenuClick = ({ key }) => {
        if (key === 'settings') {
            navigate('/?openSettings=1');
            return;
        }

        if (key === 'logout') {
            logoutUser();
        }
    };

    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: '#F8FAFD',
                borderRadius: 14,
                border: '1px solid #e5e7eb',
                padding: '10px 12px',
            }}
        >
            <Space>
                <div
                    onClick={() => navigate('/')}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
                >
                    <img src="/logo512.png" alt="logo" height="32" />
                    <Title level={4} style={{ margin: 0 }}>TodoShi</Title>
                </div>
                <Button type='text' onClick={() => navigate('/time-plans')}>Временные планы</Button>
                <Button type='text' onClick={() => navigate('/calendars')}>Управление календарями</Button>
            </Space>

            <Dropdown
                menu={{ items: profileMenuItems, onClick: handleProfileMenuClick }}
                trigger={['hover']}
            >
                <Button size="large" type="text">
                    <Space>
                        <Avatar
                            size={26}
                            icon={<UserOutlined />}
                            style={{ background: '#f3f4f6', color: '#111827' }}
                        />
                        {username ? <Text strong>{username}</Text> : <Skeleton.Input active size="small" style={{ width: 120 }} />}
                    </Space>
                </Button>
            </Dropdown>
        </div>
    );
}

export default MainTopBar;
