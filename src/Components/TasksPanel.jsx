import { useMemo, useState } from 'react';
import { Button, Collapse, Empty, Skeleton, Space, Tag, Typography } from 'antd';
import { CheckOutlined, PlusOutlined, RollbackOutlined, ScheduleOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const priorityToLabel = {
    0: { text: 'Высокий', color: 'red' },
    1: { text: 'Обычный', color: 'gold' },
    2: { text: 'Низкий', color: 'green' },
};

const statusToLabel = {
    0: { text: 'Незапланирована', color: 'red' },
    1: { text: 'В плане', color: 'blue' },
    2: { text: 'Выполнена', color: 'success' },
};

function TasksPanel({
    todos = [],
    loading = false,
    onPlanTodos,
    onOpenCreateTodo,
    onCompleteTodo,
    onRestoreTodo,
    onOpenTodoDetails,
}) {
    const [hoveredTodoId, setHoveredTodoId] = useState(null);

    const parseCreatedTime = (todo) => (
        new Date(todo?.created).getTime()
    );

    const sortedTodos = useMemo(
        () => [...(todos ?? [])].sort((a, b) => parseCreatedTime(b) - parseCreatedTime(a)),
        [todos]
    );

    const activeTodos = sortedTodos.filter((todo) => todo?.status !== 2);
    const completedTodos = sortedTodos.filter((todo) => todo?.status === 2);

    const formatDuration = (minutes) => {
        if (!minutes && minutes !== 0) {
            return null;
        }

        const total = Number(minutes);
        const hh = Math.floor(total / 60);
        const mm = total % 60;
        return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
    };

    const renderTodoBlock = (todo, isCompleted = false) => {
        const priority = priorityToLabel[todo?.priority] ?? { text: 'Не задан', color: 'default' };
        const status = statusToLabel[todo?.status] ?? { text: 'Не задан', color: 'default' };
        const duration = formatDuration(todo?.estimatedDurationMinutes);
        const isHovered = hoveredTodoId === todo?.id;

        return (
            <div
                key={todo?.id}
                onClick={() => onOpenTodoDetails?.(todo)}
                onMouseEnter={() => setHoveredTodoId(todo?.id)}
                onMouseLeave={() => setHoveredTodoId(null)}
                style={{
                    cursor: 'pointer',
                    border: isHovered ? '1px solid #d0d5dd' : '1px solid #ebedf0',
                    background: isHovered ? '#fafafa' : '#fff',
                    borderRadius: 10,
                    padding: 12,
                    marginBottom: 8,
                    transition: 'all .2s ease',
                    boxShadow: isHovered ? '0 4px 12px rgba(15, 23, 42, 0.08)' : 'none',
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                    <Space orientation="vertical" size={4} style={{ width: '100%' }}>
                        <Space>
                            <Text strong delete={isCompleted}>{todo?.title ?? 'Без названия'}</Text>
                            <Tag>{duration}</Tag>
                        </Space>
                        {todo?.notes ? <Text type="secondary">{todo.notes}</Text> : null}
                        <Space wrap>
                            <Tag color={isCompleted ? 'success' : status.color}>
                                {isCompleted ? 'Выполнена' : status.text}
                            </Tag>
                            <Tag color={priority.color}>Приоритет: {priority.text}</Tag>
                        </Space>
                    </Space>

                    {!isCompleted ? (
                        <Button
                            variant="outlined"
                            icon={<CheckOutlined />}
                            title="Завершить задачу"
                            onClick={(e) => {
                                e.stopPropagation();
                                onCompleteTodo?.(todo);
                            }}
                        />
                    ) : (
                        <Button
                            variant="outlined"
                            icon={<RollbackOutlined />}
                            title="Вернуть в текущие"
                            onClick={(e) => {
                                e.stopPropagation();
                                onRestoreTodo?.(todo);
                            }}
                        />
                    )}
                </div>
            </div>
        );
    };

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
                <Title level={4} style={{ margin: 0 }}>Ваши задачи</Title>
            </div>

            <Button
                type="primary"
                onClick={onPlanTodos}
                loading={loading}
                block
                size="large"
            >
                Распределить
            </Button>

            <Button
                icon={<PlusOutlined />}
                onClick={onOpenCreateTodo}
                block
                size="large"
                style={{ marginTop: 8, marginBottom: 12 }}
            >
                Добавить задачу
            </Button>

            <div style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
                <Text strong style={{ display: 'block', marginBottom: 8 }}>Текущие задачи</Text>
                {loading ? (
                    <Skeleton />
                ) : activeTodos.length === 0 ? (
                    <Empty description="Задач пока нет" />
                ) : (
                    <div>{activeTodos.map((todo) => renderTodoBlock(todo, false))}</div>
                )}

                <Collapse
                    style={{ marginTop: 12 }}
                    items={[
                        {
                            key: 'completed',
                            label: `Завершённые задачи (${completedTodos.length})`,
                            children: completedTodos.length === 0 ? (
                                <Empty description="Завершённых задач нет" />
                            ) : (
                                <div>{completedTodos.map((todo) => renderTodoBlock(todo, true))}</div>
                            ),
                        },
                    ]}
                />
            </div>
        </div>
    );
}

export default TasksPanel;
