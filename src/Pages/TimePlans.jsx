import { useEffect, useMemo, useState } from 'react';
import Cookies from 'js-cookie';
import dayjs from 'dayjs';
import {
    Button,
    Card,
    Col,
    Empty,
    Input,
    List,
    Popconfirm,
    Row,
    Space,
    Tag,
    TimePicker,
    Typography,
    message,
} from 'antd';
import { ArrowLeftOutlined, DeleteOutlined, PlusOutlined, SaveOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

import { useTimePlans } from '../Hooks/useTimePlans';
import { useTimeSlots } from '../Hooks/useTimeSlots';
import { useUsers } from '../Hooks/useUsers';

const { Title, Text } = Typography;

const weekDays = [
    { value: 1, label: 'Понедельник' },
    { value: 2, label: 'Вторник' },
    { value: 3, label: 'Среда' },
    { value: 4, label: 'Четверг' },
    { value: 5, label: 'Пятница' },
    { value: 6, label: 'Суббота' },
    { value: 0, label: 'Воскресенье' },
];

const toTimeValue = (timeString) => {
    if (!timeString) {
        return null;
    }
    return dayjs(`2000-01-01T${timeString}`);
};

const toApiTime = (value) => `${value.format('HH:mm')}:00`;

function buildDayDrafts(plan) {
    const drafts = {};

    weekDays.forEach((day) => {
        drafts[day.value] = {
            slotId: null,
            startTime: null,
            endTime: null,
        };
    });

    (plan?.slots ?? []).forEach((slot) => {
        if (!drafts[slot.dayOfWeek]) {
            drafts[slot.dayOfWeek] = { slotId: null, startTime: null, endTime: null };
        }

        if (!drafts[slot.dayOfWeek].slotId) {
            drafts[slot.dayOfWeek] = {
                slotId: slot.id,
                startTime: slot.startTime,
                endTime: slot.endTime,
            };
        }
    });

    return drafts;
}

function TimePlans() {
    const navigate = useNavigate();

    const [currentUserId, setCurrentUserId] = useState(null);
    const [newPlanName, setNewPlanName] = useState('');
    const [selectedPlanId, setSelectedPlanId] = useState(null);
    const [selectedPlanName, setSelectedPlanName] = useState('');
    const [dayDrafts, setDayDrafts] = useState({});

    const {
        loading: plansLoading,
        userPlans,
        getUserPlans,
        createPlan,
        updatePlan,
        deletePlan,
    } = useTimePlans();

    const {
        loading: slotsLoading,
        createSlot,
        updateSlot,
    } = useTimeSlots();

    const { GetUserIdFromJWT } = useUsers();

    const loading = plansLoading || slotsLoading;

    const selectedPlan = useMemo(
        () => (userPlans ?? []).find((plan) => plan.id === selectedPlanId) ?? null,
        [userPlans, selectedPlanId]
    );

    const refreshPlans = async (userId = currentUserId) => {
        if (!userId) {
            return;
        }
        await getUserPlans(userId);
    };

    useEffect(() => {
        const token = Cookies.get('token');
        const userId = GetUserIdFromJWT(token);

        if (!userId) {
            navigate('/login');
            return;
        }

        setCurrentUserId(userId);
        refreshPlans(userId).catch((error) => {
            console.error('Ошибка загрузки временных планов:', error);
            message.error('Не удалось загрузить временные планы');
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!selectedPlanId && (userPlans?.length ?? 0) > 0) {
            setSelectedPlanId(userPlans[0].id);
        }

        if (selectedPlanId && !(userPlans ?? []).some((plan) => plan.id === selectedPlanId)) {
            setSelectedPlanId((userPlans?.[0]?.id) ?? null);
        }

        if ((userPlans?.length ?? 0) === 0) {
            setSelectedPlanId(null);
        }
    }, [userPlans, selectedPlanId]);

    useEffect(() => {
        if (!selectedPlan) {
            setSelectedPlanName('');
            setDayDrafts({});
            return;
        }

        setSelectedPlanName(selectedPlan.name ?? '');
        setDayDrafts(buildDayDrafts(selectedPlan));
    }, [selectedPlan]);

    const handleCreatePlan = async () => {
        const name = newPlanName.trim();

        if (!name) {
            message.error('Введите название плана');
            return;
        }

        try {
            const newPlan = await createPlan(name, false);
            setNewPlanName('');
            await refreshPlans();
            if (newPlan?.id) {
                setSelectedPlanId(newPlan.id);
            }
            message.success('План создан');
        } catch (error) {
            console.error('Ошибка создания плана:', error);
            message.error('Не удалось создать план');
        }
    };

    const handleSavePlanName = async () => {
        if (!selectedPlan) {
            return;
        }

        const name = selectedPlanName.trim();
        if (!name) {
            message.error('Название плана не может быть пустым');
            return;
        }

        try {
            await updatePlan(selectedPlan.id, { name });
            await refreshPlans();
            message.success('Название плана обновлено');
        } catch (error) {
            console.error('Ошибка обновления плана:', error);
            message.error('Не удалось обновить название плана');
        }
    };

    const handleDeletePlan = async (plan) => {
        if (!plan || plan.isDefault) {
            message.warning('План по умолчанию удалять нельзя');
            return;
        }

        try {
            await deletePlan(plan.id);
            await refreshPlans();
            message.success('План удалён');
        } catch (error) {
            console.error('Ошибка удаления плана:', error);
            message.error('Не удалось удалить план');
        }
    };

    const updateDayDraft = (dayOfWeek, patch) => {
        setDayDrafts((prev) => ({
            ...prev,
            [dayOfWeek]: {
                ...(prev[dayOfWeek] ?? { slotId: null, startTime: null, endTime: null }),
                ...patch,
            },
        }));
    };

    const handleSaveDay = async (dayOfWeek) => {
        if (!selectedPlan) {
            return;
        }

        const draft = dayDrafts[dayOfWeek];
        if (!draft?.startTime || !draft?.endTime) {
            message.warning('Для сохранения укажите время начала и окончания');
            return;
        }

        try {
            if (draft.slotId) {
                await updateSlot(draft.slotId, {
                    dayOfWeek,
                    startTime: draft.startTime,
                    endTime: draft.endTime,
                });
            } else {
                await createSlot(selectedPlan.id, {
                    dayOfWeek,
                    startTime: draft.startTime,
                    endTime: draft.endTime,
                });
            }

            await refreshPlans();
            message.success('Слот сохранён');
        } catch (error) {
            console.error('Ошибка сохранения слота:', error);
            message.error('Не удалось сохранить слот');
        }
    };

    return (
        <div
            style={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #171717 0%, #101010 58%, #2e2e2e 100%)',
                padding: 10,
            }}
        >
            <Row gutter={[12, 12]} style={{ height: 'calc(100vh - 20px)' }}>
                <Col xs={24} lg={8} style={{ height: '100%' }}>
                    <Card style={{ height: '100%', borderRadius: 14 }} styles={{ body: { height: '100%', display: 'flex', flexDirection: 'column' } }}>
                        <Space direction="vertical" size={10} style={{ width: '100%' }}>
                            <Space>
                                <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/')}>
                                    Назад
                                </Button>
                                <Title level={4} style={{ margin: 0 }}>Планы</Title>
                            </Space>

                            <Space.Compact style={{ width: '100%' }}>
                                <Input
                                    placeholder="Название нового плана"
                                    value={newPlanName}
                                    onChange={(e) => setNewPlanName(e.target.value)}
                                    onPressEnter={handleCreatePlan}
                                />
                                <Button type="primary" icon={<PlusOutlined />} onClick={handleCreatePlan} />
                            </Space.Compact>
                        </Space>

                        <div style={{ marginTop: 12, flex: 1, minHeight: 0, overflowY: 'auto' }}>
                            <List
                                loading={loading}
                                dataSource={userPlans ?? []}
                                locale={{ emptyText: <Empty description="Планов нет" /> }}
                                renderItem={(plan) => (
                                    <List.Item
                                        onClick={() => setSelectedPlanId(plan.id)}
                                        style={{
                                            cursor: 'pointer',
                                            borderRadius: 8,
                                            paddingInline: 10,
                                            backgroundColor: plan.id === selectedPlanId ? '#f3f4f6' : 'transparent',
                                        }}
                                        actions={[
                                            plan.isDefault ? <Tag key="default" color="blue">По умолчанию</Tag> : null,
                                            !plan.isDefault ? (
                                                <Popconfirm
                                                    key="delete"
                                                    title="Удалить план?"
                                                    onConfirm={() => handleDeletePlan(plan)}
                                                    okText="Удалить"
                                                    cancelText="Отмена"
                                                >
                                                    <Button
                                                        type="text"
                                                        danger
                                                        icon={<DeleteOutlined />}
                                                        onClick={(e) => e.stopPropagation()}
                                                    />
                                                </Popconfirm>
                                            ) : null,
                                        ].filter(Boolean)}
                                    >
                                        <Text strong={plan.id === selectedPlanId}>{plan.name}</Text>
                                    </List.Item>
                                )}
                            />
                        </div>
                    </Card>
                </Col>

                <Col xs={24} lg={16} style={{ height: '100%' }}>
                    <Card style={{ height: '100%', borderRadius: 14 }} styles={{ body: { height: '100%', display: 'flex', flexDirection: 'column' } }}>
                        {!selectedPlan ? (
                            <Empty description="Выберите план слева" />
                        ) : (
                            <Space direction="vertical" size={12} style={{ width: '100%', height: '100%' }}>
                                <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                                    <Title level={4} style={{ margin: 0 }}>
                                        Настройка слотов
                                    </Title>
                                    {selectedPlan.isDefault ? <Tag color="blue">План по умолчанию</Tag> : null}
                                </Space>

                                <Space.Compact style={{ width: '100%' }}>
                                    <Input
                                        value={selectedPlanName}
                                        onChange={(e) => setSelectedPlanName(e.target.value)}
                                        placeholder="Название плана"
                                    />
                                    <Button icon={<SaveOutlined />} onClick={handleSavePlanName}>
                                        Сохранить название
                                    </Button>
                                </Space.Compact>

                                <div style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
                                    <Space direction="vertical" size={10} style={{ width: '100%' }}>
                                        {weekDays.map((day) => {
                                            const draft = dayDrafts[day.value] ?? {
                                                slotId: null,
                                                startTime: null,
                                                endTime: null,
                                            };

                                            return (
                                                <div
                                                    key={day.value}
                                                    style={{
                                                        display: 'flex',
                                                        flexWrap: 'wrap',
                                                        gap: 10,
                                                        alignItems: 'center',
                                                        padding: 10,
                                                        border: '1px solid #f0f0f0',
                                                        borderRadius: 8,
                                                    }}
                                                >
                                                    <Text strong style={{ minWidth: 170 }}>{day.label}</Text>
                                                    <TimePicker
                                                        style={{ minWidth: 130, flex: '1 1 130px' }}
                                                        format="HH:mm"
                                                        value={toTimeValue(draft.startTime)}
                                                        onChange={(value) =>
                                                            updateDayDraft(day.value, {
                                                                startTime: value ? toApiTime(value) : null,
                                                            })
                                                        }
                                                    />
                                                    <TimePicker
                                                        style={{ minWidth: 130, flex: '1 1 130px' }}
                                                        format="HH:mm"
                                                        value={toTimeValue(draft.endTime)}
                                                        onChange={(value) =>
                                                            updateDayDraft(day.value, {
                                                                endTime: value ? toApiTime(value) : null,
                                                            })
                                                        }
                                                    />
                                                    <Button onClick={() => handleSaveDay(day.value)}>
                                                        Сохранить
                                                    </Button>
                                                </div>
                                            );
                                        })}
                                    </Space>
                                </div>
                            </Space>
                        )}
                    </Card>
                </Col>
            </Row>
        </div>
    );
}

export default TimePlans;
