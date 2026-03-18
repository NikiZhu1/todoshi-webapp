import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import {
    Button,
    Card,
    Col,
    DatePicker,
    Form,
    Input,
    InputNumber,
    Popconfirm,
    Modal,
    Row,
    Select,
    Space,
    Switch,
    Tag,
    message,
    Flex,
    Typography,
    Splitter,
    Divider,
} from 'antd';

import TasksPanel from '../Components/TasksPanel';
import ScheduleCalendar from '../Components/ScheduleCalendar';
import { useTodos } from '../Hooks/useTodos';
import { useUsers } from '../Hooks/useUsers';
import { useScheduledTasks } from '../Hooks/useScheduledTasks';
import { useTimePlans } from '../Hooks/useTimePlans';

const { TextArea } = Input;
const { Title, Text } = Typography;

function Base() {
    const navigate = useNavigate();
    const [isCreateTodoModalOpen, setIsCreateTodoModalOpen] = useState(false);
    const [isEditTodoModalOpen, setIsEditTodoModalOpen] = useState(false);
    const [isScheduledEventModalOpen, setIsScheduledEventModalOpen] = useState(false);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [selectedTodo, setSelectedTodo] = useState(null);
    const [selectedScheduledEvent, setSelectedScheduledEvent] = useState(null);

    const [createTodoForm] = Form.useForm();
    const [editTodoForm] = Form.useForm();
    const [scheduledEventForm] = Form.useForm();
    const [settingsForm] = Form.useForm();
    const selectedColor = Form.useWatch('color', createTodoForm);
    const selectedEditColor = Form.useWatch('color', editTodoForm);

    const colorOptions = ['#232323', '#1677ff', '#13c2c2', '#52c41a', '#faad14', '#f5222d'];

    const {
        loading: todosLoading,
        userTodos,
        getUserTodos,
        createTodo,
        updateTodo,
        deleteTodo,
        planTodos,
    } = useTodos();

    const {
        loading: scheduledTasksLoading,
        userScheduledTasks,
        getUserTasks,
        updateTask,
        deleteTask,
    } = useScheduledTasks();

    const {
        loading: usersLoading,
        logoutUser,
        changeUsername,
        changePassword,
        GetUserIdFromJWT,
    } = useUsers();

    const {
        loading: plansLoading,
        userPlans,
        getUserPlans,
    } = useTimePlans();

    const pageLoading = todosLoading || scheduledTasksLoading || usersLoading || plansLoading;
    const dayLabels = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
    const priorityLabels = {
        0: 'Высокий',
        1: 'Средний',
        2: 'Низкий',
    };

    //Информация о плане
    const getPlanSlotsInfo = (plan) => {
    const slots = plan?.slots ?? [];
    if (slots.length === 0) return 'Слотов нет';

    const dayMap = {
        1: 'Пн',
        2: 'Вт',
        3: 'Ср',
        4: 'Чт',
        5: 'Пт',
        6: 'Сб',
        0: 'Вс'
    };

    // нормализуем дни (вс = 7 для сортировки)
    const normalizeDay = (d) => (d === 0 ? 7 : d);

    const sorted = [...slots].sort(
        (a, b) => normalizeDay(a.dayOfWeek) - normalizeDay(b.dayOfWeek)
    );

    // группируем по времени
    const groups = {};

    sorted.forEach((slot) => {
        const start = slot.startTime?.slice(0, 5) ?? '--:--';
        const end = slot.endTime?.slice(0, 5) ?? '--:--';
        const key = `${start}-${end}`;

        if (!groups[key]) {
            groups[key] = [];
        }

        groups[key].push(normalizeDay(slot.dayOfWeek));
    });

    // превращаем дни в диапазоны
    const formatDays = (days) => {
        const sortedDays = [...days].sort((a, b) => a - b);
        const ranges = [];

        let start = sortedDays[0];
        let prev = start;

        for (let i = 1; i < sortedDays.length; i++) {
            const curr = sortedDays[i];

            if (curr === prev + 1) {
                prev = curr;
            } else {
                ranges.push([start, prev]);
                start = curr;
                prev = curr;
            }
        }

        ranges.push([start, prev]);

        return ranges
            .map(([s, e]) => {
                if (s === e) return dayMap[s % 7];
                return `${dayMap[s % 7]}-${dayMap[e % 7]}`;
            })
            .join(', ');
    };

    // собираем итог
    const result = Object.entries(groups).map(([time, days]) => {
        return `${formatDays(days)} ${time}`;
    });

    return result.join(', ');
    };

    const planOptions = (userPlans ?? []).map((plan) => ({
        value: plan.id,
        label: (
        <Flex vertical>
            <Space size={6} wrap>
                <span>{plan.name}</span>
                {plan.isDefault ? <Tag color="blue">По умолчанию</Tag> : null}
            </Space>
            <span style={{ color: '#6b7280', fontSize: 12 }}>{getPlanSlotsInfo(plan)}</span>
        </Flex>
        ),
    }));

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
                    getUserPlans(userId),
                ]);
            } catch (error) {
                console.error('Ошибка загрузки данных главной страницы:', error);
                message.error('Не удалось загрузить данные');
            }
        };

        bootstrap();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!isCreateTodoModalOpen) {
            return;
        }

        const currentPlanId = createTodoForm.getFieldValue('timePlanId');
        if (currentPlanId) {
            return;
        }

        const defaultPlan = (userPlans ?? []).find((plan) => plan.isDefault) ?? userPlans?.[0];
        if (defaultPlan?.id) {
            createTodoForm.setFieldValue('timePlanId', defaultPlan.id);
        }
    }, [isCreateTodoModalOpen, userPlans, createTodoForm]);

    const refreshMainData = async () => {
        if (!currentUserId) {
            return;
        }

        await Promise.all([
            getUserTodos(currentUserId),
            getUserTasks(currentUserId),
        ]);
    };

    const normalizeDate = (value) => {
        if (!value) {
            return null;
        }

        if (dayjs.isDayjs(value)) {
            return value.toISOString();
        }

        return value;
    };

    const buildTodoPayload = (source, overrides = {}) => ({
        title: source?.title?.trim() ?? '',
        notes: source?.notes?.trim() ?? '',
        estimatedDurationMinutes: source?.estimatedDurationMinutes,
        earliestStart: normalizeDate(source?.earliestStart),
        deadline: normalizeDate(source?.deadline),
        isSplittable: Boolean(source?.isSplittable),
        isPinned: Boolean(source?.isPinned),
        status: source?.status ?? 0,
        priority: source?.priority ?? 1,
        timePlanId: source?.timePlanId,
        color: source?.color || '#232323',
        ...overrides,
    });

    const getDurationMinutes = (startIso, endIso) => {
        if (!startIso || !endIso) {
            return null;
        }

        const diff = dayjs(endIso).diff(dayjs(startIso), 'minute');
        return diff > 0 ? diff : null;
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
                timePlanId: values.timePlanId,
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

    const handleCompleteTodo = async (todo) => {
        try {
            const payload = buildTodoPayload(todo, { status: 2 });
            await updateTodo(todo.id, payload);
            await refreshMainData();
            message.success('Задача завершена');
        } catch (error) {
            console.error('Ошибка при завершении задачи:', error);
            message.error('Не удалось завершить задачу');
        }
    };

    const handleRestoreTodo = async (todo) => {
        try {
            const payload = buildTodoPayload(todo, { status: 0 });
            await updateTodo(todo.id, payload);
            await refreshMainData();
            message.success('Задача возвращена в текущие');
        } catch (error) {
            console.error('Ошибка при возврате задачи:', error);
            message.error('Не удалось вернуть задачу');
        }
    };

    const handleOpenTodoDetails = (todo) => {
        setSelectedTodo(todo);
        editTodoForm.setFieldsValue({
            title: todo?.title ?? '',
            notes: todo?.notes ?? '',
            estimatedDurationMinutes: todo?.estimatedDurationMinutes ?? 30,
            earliestStart: todo?.earliestStart ? dayjs(todo.earliestStart) : null,
            deadline: todo?.deadline ? dayjs(todo.deadline) : null,
            isSplittable: Boolean(todo?.isSplittable),
            isPinned: Boolean(todo?.isPinned),
            status: todo?.status ?? 0,
            priority: todo?.priority ?? 1,
            timePlanId: todo?.timePlanId ?? todo?.timePlan?.id,
            color: todo?.color || '#232323',
        });
        setIsEditTodoModalOpen(true);
    };

    const handleSaveTodoChanges = async () => {
        if (!selectedTodo?.id) {
            return;
        }

        try {
            const values = await editTodoForm.validateFields();
            const payload = buildTodoPayload(values);
            await updateTodo(selectedTodo.id, payload);

            setIsEditTodoModalOpen(false);
            setSelectedTodo(null);
            editTodoForm.resetFields();
            await refreshMainData();
            message.success('Задача обновлена');
        } catch (error) {
            console.error('Ошибка при обновлении задачи:', error);
            if (error?.errorFields) {
                return;
            }
            message.error('Не удалось обновить задачу');
        }
    };

    const handleCalendarEventDrop = async (info) => {
        const scheduled = info.event.extendedProps?.scheduledTask;
        const task = info.event.extendedProps?.task;
        const start = info.event.start?.toISOString();
        const end = info.event.end?.toISOString();

        if (!scheduled?.id || !task?.id || !start || !end) {
            info.revert();
            return;
        }

        try {
            await updateTask(scheduled.id, scheduled.taskId ?? task.id, start, end);
            await updateTodo(task.id, buildTodoPayload(task, { isPinned: true }));
            await refreshMainData();
            message.success('Событие перемещено');
        } catch (error) {
            info.revert();
            console.error('Ошибка при переносе события:', error);
            message.error('Не удалось переместить событие');
        }
    };

    const handleCalendarEventResize = async (info) => {
        const scheduled = info.event.extendedProps?.scheduledTask;
        const task = info.event.extendedProps?.task;
        const start = info.event.start?.toISOString();
        const end = info.event.end?.toISOString();

        if (!scheduled?.id || !task?.id || !start || !end) {
            info.revert();
            return;
        }

        const newDuration = getDurationMinutes(start, end);

        try {
            await updateTask(scheduled.id, scheduled.taskId ?? task.id, start, end);
            await updateTodo(
                task.id,
                buildTodoPayload(task, {
                    isPinned: true,
                    estimatedDurationMinutes: newDuration ?? task?.estimatedDurationMinutes,
                })
            );
            await refreshMainData();
            message.success('Длительность события обновлена');
        } catch (error) {
            info.revert();
            console.error('Ошибка при изменении длительности события:', error);
            message.error('Не удалось изменить длительность');
        }
    };

    //при нажатии на событие в календаре
    const handleCalendarEventClick = (info) => {
        const scheduled = info.event.extendedProps?.scheduledTask;
        const task = info.event.extendedProps?.task;

        if (!scheduled?.id || !task?.id) {
            return;
        }

        const start = info.event.start;
        const fallbackEnd = start
            ? dayjs(start).add(task?.estimatedDurationMinutes ?? 30, 'minute')
            : null;
        const end = info.event.end ? dayjs(info.event.end) : fallbackEnd;

        setSelectedScheduledEvent({
            scheduledTaskId: scheduled.id,
            taskId: task.id,
            task,
        });

        scheduledEventForm.setFieldsValue({
            isPinned: Boolean(task?.isPinned),
            isSplittable: Boolean(task?.isSplittable),
            startTime: start ? dayjs(start) : null,
            endTime: end,
        });

        setIsScheduledEventModalOpen(true);
    };

    const handleOpenTaskEditFromEvent = () => {
        if (!selectedScheduledEvent?.task) {
            return;
        }

        const task = selectedScheduledEvent.task;
        setIsScheduledEventModalOpen(false);
        setSelectedScheduledEvent(null);
        scheduledEventForm.resetFields();
        handleOpenTodoDetails(task);
    };

    const handleSaveScheduledEvent = async () => {
        if (!selectedScheduledEvent?.scheduledTaskId || !selectedScheduledEvent?.taskId) {
            return;
        }

        try {
            const values = await scheduledEventForm.validateFields();
            const start = values.startTime?.toISOString();
            const end = values.endTime?.toISOString();
            const duration = getDurationMinutes(start, end);

            await updateTask(
                selectedScheduledEvent.scheduledTaskId,
                selectedScheduledEvent.taskId,
                start,
                end
            );

            await updateTodo(
                selectedScheduledEvent.taskId,
                buildTodoPayload(selectedScheduledEvent.task, {
                    isPinned: Boolean(values.isPinned),
                    isSplittable: Boolean(values.isSplittable),
                    estimatedDurationMinutes:
                        duration ?? selectedScheduledEvent.task?.estimatedDurationMinutes,
                })
            );

            setIsScheduledEventModalOpen(false);
            setSelectedScheduledEvent(null);
            scheduledEventForm.resetFields();
            await refreshMainData();
            message.success('Событие обновлено');
        } catch (error) {
            console.error('Ошибка при сохранении события:', error);
            if (error?.errorFields) {
                return;
            }
            message.error('Не удалось сохранить событие');
        }
    };

    const handleDeleteScheduledEvent = async () => {
        if (!selectedScheduledEvent?.scheduledTaskId || !selectedScheduledEvent?.taskId) {
            return;
        }

        try {
            await deleteTask(selectedScheduledEvent.scheduledTaskId);
            await updateTodo(
                selectedScheduledEvent.taskId,
                buildTodoPayload(selectedScheduledEvent.task, {
                    status: 0,
                    isPinned: false,
                })
            );
            setIsScheduledEventModalOpen(false);
            setSelectedScheduledEvent(null);
            scheduledEventForm.resetFields();
            await refreshMainData();
            message.success('Событие удалено');
        } catch (error) {
            console.error('Ошибка при удалении события:', error);
            message.error('Не удалось удалить событие');
        }
    };

    const handleDeleteTodo = async () => {
        if (!selectedTodo?.id) {
            return;
        }

        try {
            await deleteTodo(selectedTodo.id);
            setIsEditTodoModalOpen(false);
            setSelectedTodo(null);
            editTodoForm.resetFields();
            await refreshMainData();
            message.success('Задача удалена');
        } catch (error) {
            console.error('Ошибка при удалении задачи:', error);
            message.error('Не удалось удалить задачу');
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

    const scheduledTaskInfo = selectedScheduledEvent?.task;
    const scheduledPlanId = scheduledTaskInfo?.timePlanId ?? scheduledTaskInfo?.timePlan?.id;
    const scheduledPlan = (userPlans ?? []).find((plan) => plan.id === scheduledPlanId);
    const scheduledPriority = priorityLabels[scheduledTaskInfo?.priority] ?? 'Не задан';
    const scheduledNotes = scheduledTaskInfo?.notes?.trim();

    return (
        <div
            style={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #171717 0%, #101010 58%, #2e2e2e 100%)',
                padding: '10px',
            }}
        >
            <div style={{ height: 'calc(100vh - 20px)' }}>
                <Row gutter={[12, 12]} style={{ height: '100%' }}>
                    <Col xs={24} lg={16} style={{ height: '100%' }}>
                        <ScheduleCalendar
                            tasks={userScheduledTasks}
                            defaultPlan={userPlans?.find((plan) => plan.isDefault) ?? userPlans?.[0]}
                            // loading={scheduledTasksLoading}
                            onEventDrop={handleCalendarEventDrop}
                            onEventResize={handleCalendarEventResize}
                            onEventClick={handleCalendarEventClick}
                        />
                    </Col>
                    <Col xs={24} lg={8} style={{ height: '100%' }}>
                        <Card
                            style={{
                                borderRadius: 14,
                                border: '1px solid #e5e7eb',
                                height: '100%',
                            }}
                            styles={{ body: { padding: 16, height: '100%' } }}
                        >
                            <TasksPanel
                                todos={userTodos ?? []}
                                loading={pageLoading}
                                onPlanTodos={handlePlanTodos}
                                onOpenCreateTodo={() => setIsCreateTodoModalOpen(true)}
                                onCompleteTodo={handleCompleteTodo}
                                onRestoreTodo={handleRestoreTodo}
                                onOpenTodoDetails={handleOpenTodoDetails}
                                onOpenTimePlans={() => navigate('/time-plans')}
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
                        earliestStart: dayjs(),
                        color: '#232323',
                    }}
                >
                    <Form.Item
                        label="Название"
                        name="title"
                        rules={[{ required: true, message: 'Введите название задачи' }]}
                    >
                        <Input size='large' variant="underlined" placeholder="Например: Подготовить отчет" />
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

                    <Form.Item
                        label="Временной план"
                        name="timePlanId"
                        rules={[{ required: true, message: 'Выберите временной план' }]}
                    >
                        <Select
                            placeholder="Выберите план"
                            options={planOptions}
                        />
                    </Form.Item>

                    <Row gutter={10}>
                        <Col span={12}>
                            <Form.Item
                                label="Когда начать?"
                                name="earliestStart"
                                rules={[{ required: true, message: 'Укажите время начала' }]}
                            >
                                <DatePicker format="DD.MM.YYYY" style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="Дедлайн" name="deadline">
                                <DatePicker showTime format="DD.MM.YYYY HH:mm" style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={10}>
                        <Col span={24}>
                            <Form.Item label="Цвет" name="color">
                                <Space size={10} wrap>
                                    {colorOptions.map((color) => (
                                        <Button
                                            key={color}
                                            shape="circle"
                                            type="default"
                                            onClick={() => createTodoForm.setFieldValue('color', color)}
                                            style={{
                                                width: 30,
                                                height: 30,
                                                padding: 0,
                                                backgroundColor: color,
                                                border: selectedColor === color ? '2px solid #111' : '1px solid #d9d9d9',
                                                borderRadius: selectedColor === color && '4px',
                                            }}
                                            aria-label={`Выбрать цвет ${color}`}
                                        />
                                    ))}
                                </Space>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={10}>
                        <Col span={12}>
                            <Form.Item label="Можно делить" name="isSplittable" valuePropName="checked">
                                <Switch />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="Закрепить" name="isPinned" valuePropName="checked">
                                <Switch />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Modal>
            
            {/* Настройки профиля */}
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
            
            {/* Открытие события календаря */}
            <Modal
                title={null}
                open={isScheduledEventModalOpen}
                closeIcon={null}
                onOk={handleSaveScheduledEvent}
                onCancel={() => {
                    setIsScheduledEventModalOpen(false);
                    setSelectedScheduledEvent(null);
                    scheduledEventForm.resetFields();
                }}
                okText="Сохранить"
                cancelText="Отмена"
                footer={
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                        <Popconfirm
                            title="Удалить событие?"
                            okText="Удалить"
                            cancelText="Отмена"
                            onConfirm={handleDeleteScheduledEvent}
                        >
                            <Button danger>Удалить</Button>
                        </Popconfirm>
                        <Space>
                            <Button
                                onClick={() => {
                                    setIsScheduledEventModalOpen(false);
                                    setSelectedScheduledEvent(null);
                                    scheduledEventForm.resetFields();
                                }}
                            >
                                Отмена
                            </Button>
                            <Button type="primary" onClick={handleSaveScheduledEvent}>
                                Сохранить
                            </Button>
                        </Space>
                    </div>
                }
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14, gap: 12 }}>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        <div
                            style={{
                                width: 14,
                                height: 14,
                                borderRadius: 3,
                                background: scheduledTaskInfo?.color || '#232323',
                                border: '1px solid #d1d5db',
                                marginTop: 2,
                            }}
                        />
                        <Title level={4} style={{ margin: 0 }}>
                            {scheduledTaskInfo?.title || 'Событие'}
                        </Title>
                    </div>
                    <Button onClick={handleOpenTaskEditFromEvent}>Редактировать</Button>
                </div>
                
                <Text type="secondary">{scheduledNotes || 'Нет заметок'}</Text>

                <Space orientation="vertical" size={4} style={{ marginTop: 24, width: '100%' }}>
                    <Flex vertical>
                        <Space size={6} wrap>
                            <Text>{scheduledPlan?.name}</Text>
                            {scheduledPlan?.isDefault ? <Tag color="blue">По умолчанию</Tag> : null}
                        </Space>
                        <span style={{ color: '#6b7280', fontSize: 12 }}>{getPlanSlotsInfo(scheduledPlan)}</span>
                    </Flex>
                    
                    <Text type="secondary">Приоритет: {scheduledPriority}</Text>
                </Space>

                <Divider/>

                <Form form={scheduledEventForm} layout="vertical">
                    <Row gutter={10}>
                        <Col span={12}>
                            <Form.Item label="Закреплена" name="isPinned" valuePropName="checked">
                                <Switch />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="Разрешить разделение" name="isSplittable" valuePropName="checked">
                                <Switch />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={10}>
                        <Col span={12}>
                            <Form.Item
                                label="Начало"
                                name="startTime"
                                rules={[{ required: true, message: 'Укажите время начала' }]}
                            >
                                <DatePicker showTime format="DD.MM.YYYY HH:mm" style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="Окончание"
                                name="endTime"
                                rules={[{ required: true, message: 'Укажите время окончания' }]}
                            >
                                <DatePicker showTime format="DD.MM.YYYY HH:mm" style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Modal>
            
            {/* Редактирование задачи модалка */}
            <Modal
                title="Редактирование задачи"
                open={isEditTodoModalOpen}
                onCancel={() => {
                    setIsEditTodoModalOpen(false);
                    setSelectedTodo(null);
                }}
                footer={
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                        <Popconfirm
                            title="Удалить задачу?"
                            description="Действие нельзя отменить"
                            okText="Удалить"
                            cancelText="Отмена"
                            onConfirm={handleDeleteTodo}
                        >
                            <Button danger>Удалить</Button>
                        </Popconfirm>
                        <Space>
                            <Button
                                onClick={() => {
                                    setIsEditTodoModalOpen(false);
                                    setSelectedTodo(null);
                                }}
                            >
                                Отмена
                            </Button>
                            <Button type="primary" onClick={handleSaveTodoChanges}>
                                Сохранить
                            </Button>
                        </Space>
                    </div>
                }
            >
                <Form form={editTodoForm} layout="vertical">
                    <Form.Item
                        label="Название"
                        name="title"
                        rules={[{ required: true, message: 'Введите название задачи' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item label="Заметки" name="notes">
                        <TextArea rows={3} />
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

                    <Form.Item
                        label="Временной план"
                        name="timePlanId"
                        rules={[{ required: true, message: 'Выберите временной план' }]}
                    >
                        <Select
                            options={planOptions}
                        />
                    </Form.Item>

                    <Row gutter={10}>
                        <Col span={12}>
                            <Form.Item
                                label="Старт"
                                name="earliestStart"
                                rules={[{ required: true, message: 'Укажите время начала' }]}
                            >
                                <DatePicker showTime format="DD.MM.YYYY HH:mm" style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="Дедлайн" name="deadline">
                                <DatePicker showTime format="DD.MM.YYYY HH:mm" style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={10}>
                        <Col span={24}>
                            <Form.Item label="Цвет" name="color">
                                <Space size={10} wrap>
                                    {colorOptions.map((color) => (
                                        <Button
                                            key={color}
                                            shape="circle"
                                            type="default"
                                            onClick={() => editTodoForm.setFieldValue('color', color)}
                                            style={{
                                                width: 30,
                                                height: 30,
                                                padding: 0,
                                                backgroundColor: color,
                                                border: selectedEditColor === color ? '2px solid #111' : '1px solid #d9d9d9',
                                                borderRadius: selectedEditColor === color && '4px',
                                            }}
                                        />
                                    ))}
                                </Space>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={10}>
                        <Col span={12}>
                            <Form.Item label="Можно делить" name="isSplittable" valuePropName="checked">
                                <Switch />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="Закрепить" name="isPinned" valuePropName="checked">
                                <Switch />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Modal>
        </div>
    );
}

export default Base;
