import { Button, Card, Dropdown, Empty, List, Space, Tag, Typography } from 'antd';
import { PlusOutlined, ScheduleOutlined, UserOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const priorityToLabel = {
    0: { text: 'Высокий', color: 'red' },
    1: { text: 'Средний', color: 'gold' },
    2: { text: 'Низкий', color: 'green' },
};

const statusToLabel = {
    0: { text: 'Незапланирована', color: 'default' },
    1: { text: 'Запланирована', color: 'blue' },
    2: { text: 'Выполнена', color: 'success' },
};

function TasksPanel({
    todos = [],
    loading = false,
    onPlanTodos,
    onOpenCreateTodo,
    onOpenSettings,
    onLogout,
}) {
    const menuItems = [
        { key: 'timePlans', label: 'Временные планы' },
        { key: 'settings', label: 'Настройки' },
        { key: 'logout', label: 'Выход', danger: 'true' },
    ];

    const handleMenuClick = ({ key }) => {
        if (key === 'settings') {
            onOpenSettings?.();
            return;
        }

        if (key === 'logout') {
            onLogout?.();
        }
    };

    return (
        <div>
            <Space direction="vertical" size={12} style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Title level={4} style={{ margin: 0 }}>Ваши задачи</Title>
                    <Dropdown menu={{ items: menuItems, onClick: handleMenuClick }} trigger={['click']}>
                        <Button icon={<UserOutlined />}>Профиль</Button>
                    </Dropdown>
                </div>

                <Button
                    type="primary"
                    icon={<ScheduleOutlined />}
                    onClick={onPlanTodos}
                    loading={loading}
                    block
                    size='large'
                >
                    Запланировать
                </Button>

                <Button
                    icon={<PlusOutlined />}
                    onClick={onOpenCreateTodo}
                    block
                    size='large'
                >
                    Создать задачу
                </Button>

                <List
                    loading={loading}
                    dataSource={todos}
                    locale={{ emptyText: <Empty description="Задач пока нет" /> }}
                    renderItem={(todo) => {
                        const priority = priorityToLabel[todo?.priority] ?? { text: 'Не задан', color: 'default' };
                        const status = statusToLabel[todo?.status] ?? { text: 'Не задан', color: 'default' };

                        return (
                            <List.Item>
                                <Space direction="vertical" size={4} style={{ width: '100%' }}>
                                    <Text strong>{todo?.title ?? 'Без названия'}</Text>
                                    {todo?.notes ? <Text type="secondary">{todo.notes}</Text> : null}
                                    <Space wrap>
                                        <Tag color={priority.color}>Приоритет: {priority.text}</Tag>
                                        <Tag color={status.color}>Статус: {status.text}</Tag>
                                        {todo?.estimatedDurationMinutes ? (
                                            <Tag>{todo.estimatedDurationMinutes} мин</Tag>
                                        ) : null}
                                    </Space>
                                </Space>
                            </List.Item>
                        );
                    }}
                />
            </Space>
        </div>
    );
}

export default TasksPanel;
