import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import dayjs from 'dayjs';
import {
    Button,
    Card,
    Col,
    DatePicker,
    Dropdown,
    Flex,
    Form,
    Input,
    InputNumber,
    Modal,
    Row,
    Select,
    Space,
    Switch,
    Typography,
    message,
} from 'antd';
import { PlusOutlined, ScheduleOutlined, UserOutlined } from '@ant-design/icons';

import TasksPanel from '../Components/TasksPanel';
import ScheduleCalendar from '../Components/ScheduleCalendar';
import { useTodos } from '../Hooks/useTodos';
import { useUsers } from '../Hooks/useUsers';
import { useScheduledTasks } from '../Hooks/useScheduledTasks';

const { Title, Text } = Typography;
const { TextArea } = Input;

function Base() {
    const [isCreateTodoModalOpen, setIsCreateTodoModalOpen] = useState(false);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [currentUserId, setCurrentUserId] = useState(null);

    const [createTodoForm] = Form.useForm();
    const [settingsForm] = Form.useForm();

    const {
        loading: todosLoading,
        userTodos,
        getUserTodos,
        createTodo,
        planTodos,
    } = useTodos();

    const {
        loading: scheduledTasksLoading,
        userScheduledTasks,
        getUserTasks,
    } = useScheduledTasks();

    const {
        loading: usersLoading,
        logoutUser,
        changeUsername,
        changePassword,
        GetUserIdFromJWT,
    } = useUsers();

    const pageLoading = todosLoading || scheduledTasksLoading || usersLoading;

    useEffect(() => {
        const bootstrap = async () => {
            const token = Cookies.get('token');
            const userId = GetUserIdFromJWT(token);

            if (!userId) {
                logoutUser();
                return;
            }

            setCurrentUserId(userId);

            try {
                await Promise.all([
                    getUserTodos(userId),
                    getUserTasks(userId),
                ]);
            } catch (error) {
                console.error('Ошибка загрузки данных главной страницы:', error);
                message.error('Не удалось загрузить данные');
            }
        };

        bootstrap();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const refreshMainData = async () => {
        if (!currentUserId) {
            return;
        }

        await Promise.all([
            getUserTodos(currentUserId),
            getUserTasks(currentUserId),
        ]);
    };

    const handlePlanTodos = async () => {
        try {
            await planTodos();
            await refreshMainData();
            message.success('Планирование выполнено');
        } catch (error) {
            console.error('Ошибка при планировании задач:', error);
            message.error('Не удалось запланировать задачи');
        }
    };

    const handleCreateTodo = async () => {
        try {
            const values = await createTodoForm.validateFields();

            const payload = {
                title: values.title?.trim(),
                notes: values.notes?.trim(),
                estimatedDurationMinutes: values.estimatedDurationMinutes,
                earliestStart: values.earliestStart?.toISOString(),
                deadline: values.deadline ? values.deadline.toISOString() : null,
                isSplittable: Boolean(values.isSplittable),
                isPinned: Boolean(values.isPinned),
                status: values.status,
                priority: values.priority,
                color: values.color || '#232323',
            };

            await createTodo(payload);
            createTodoForm.resetFields();
            setIsCreateTodoModalOpen(false);
            await refreshMainData();
            message.success('Задача создана');
        } catch (error) {
            console.error('Ошибка при создании задачи:', error);
            if (error?.errorFields) {
                return;
            }
            message.error('Не удалось создать задачу');
        }
    };

    const handleSaveSettings = async () => {
        try {
            const values = await settingsForm.validateFields();
            const token = Cookies.get('token');
            const userId = currentUserId ?? GetUserIdFromJWT(token);

            if (!userId) {
                message.error('Пользователь не определен');
                return;
            }

            let hasChanges = false;

            if (values.newUsername && values.newUsername.trim() !== '') {
                await changeUsername(token, userId, values.newUsername.trim());
                hasChanges = true;
            }

            if (values.oldPassword || values.newPassword || values.confirmPassword) {
                if (!values.oldPassword || !values.newPassword || !values.confirmPassword) {
                    message.error('Для смены пароля заполните все поля пароля');
                    return;
                }

                await changePassword(token, userId, values.oldPassword, values.newPassword);
                hasChanges = true;
            }

            if (!hasChanges) {
                message.info('Изменений нет');
                return;
            }

            settingsForm.resetFields();
            setIsSettingsModalOpen(false);
            message.success('Настройки обновлены');
        } catch (error) {
            console.error('Ошибка при изменении настроек:', error);
            if (error?.errorFields) {
                return;
            }
            message.error(error?.message || 'Не удалось сохранить настройки');
        }
    };

    return (
        <div
            style={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #171717 0%, #101010 58%, #2e2e2e 100%)',
                // paddingTop: '16px',
            }}
        >
            <div>
                {/* <Space direction="vertical" size={6} style={{ marginBottom: 14 }}>
                    <Title level={3} style={{ color: '#ffffff', margin: 0 }}>
                        TodoShi
                    </Title>
                </Space> */}

                <Row gutter={[16, 16]} style={{margin: '8px'}}>
                    <Col xs={24} lg={16}>
                        <ScheduleCalendar
                            tasks={userScheduledTasks}
                            loading={scheduledTasksLoading}
                        />
                    </Col>
                    <Col xs={24} lg={8}>
                        <Card
                            style={{
                                borderRadius: 14,
                                border: '1px solid #e5e7eb',
                                minHeight: '78vh',
                            }}
                            // styles={{ body: { padding: 20 } }}
                        >
                            <TasksPanel
                                todos={userTodos ?? []}
                                loading={pageLoading}
                                onPlanTodos={handlePlanTodos}
                                onOpenCreateTodo={() => setIsCreateTodoModalOpen(true)}
                                onOpenSettings={() => setIsSettingsModalOpen(true)}
                                onLogout={logoutUser}
                            />
                        
                        </Card>
                    </Col>
                </Row>
            </div>

            {/* Модальное окно создания */}
            <Modal
                title="Создать задачу"
                open={isCreateTodoModalOpen}
                onOk={handleCreateTodo}
                onCancel={() => setIsCreateTodoModalOpen(false)}
                okText="Создать"
                cancelText="Отмена"
            >
                <Form
                    form={createTodoForm}
                    layout="vertical"
                    initialValues={{
                        isSplittable: false,
                        isPinned: false,
                        status: 0,
                        priority: 1,
                        color: '#232323',
                    }}
                >
                    <Form.Item
                        label="Название"
                        name="title"
                        rules={[{ required: true, message: 'Введите название задачи' }]}
                    >
                        <Input placeholder="Например: Подготовить отчет" />
                    </Form.Item>

                    <Form.Item label="Заметки" name="notes">
                        <TextArea rows={3} placeholder="Дополнительные детали" />
                    </Form.Item>

                    <Row gutter={10}>
                        <Col span={12}>
                            <Form.Item
                                label="Длительность (минуты)"
                                name="estimatedDurationMinutes"
                                rules={[{ required: true, message: 'Укажите длительность задачи' }]}
                            >
                                <InputNumber min={5} step={5} style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="Приоритет" name="priority">
                                <Select
                                    options={[
                                        { label: 'Высокий', value: 0 },
                                        { label: 'Средний', value: 1 },
                                        { label: 'Низкий', value: 2 },
                                    ]}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={10}>
                        <Col span={12}>
                            <Form.Item
                                label="Когда начать?"
                                name="earliestStart"
                                rules={[{ required: true, message: 'Укажите время начала' }]}
                            >
                                <DatePicker format="DD.MM.YYYY" style={{ width: '100%' }} initialValues={dayjs()} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="Дедлайн" name="deadline">
                                <DatePicker showTime format="DD.MM.YYYY HH:mm" style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={10}>
                        <Col span={8}>
                            <Form.Item label="Цвет" name="color">
                                <Input type="color" style={{ height: 34 }} />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item label="Можно делить" name="isSplittable" valuePropName="checked">
                                <Switch />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item label="Закрепить" name="isPinned" valuePropName="checked">
                                <Switch />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Modal>

            <Modal
                title="Настройки профиля"
                open={isSettingsModalOpen}
                onOk={handleSaveSettings}
                onCancel={() => setIsSettingsModalOpen(false)}
                okText="Сохранить"
                cancelText="Отмена"
            >
                <Form form={settingsForm} layout="vertical">
                    <Form.Item label="Новое имя пользователя" name="newUsername">
                        <Input placeholder="Введите новое имя (необязательно)" />
                    </Form.Item>

                    <Form.Item label="Старый пароль" name="oldPassword">
                        <Input.Password placeholder="Старый пароль" />
                    </Form.Item>

                    <Form.Item label="Новый пароль" name="newPassword">
                        <Input.Password placeholder="Новый пароль" />
                    </Form.Item>

                    <Form.Item
                        label="Подтверждение пароля"
                        name="confirmPassword"
                        dependencies={['newPassword']}
                        rules={[
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('newPassword') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('Пароли не совпадают'));
                                },
                            }),
                        ]}
                    >
                        <Input.Password placeholder="Повторите новый пароль" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}

export default Base;
