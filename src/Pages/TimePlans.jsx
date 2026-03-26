import { useEffect, useMemo, useState } from 'react';
import Cookies from 'js-cookie';
import dayjs from 'dayjs';
import {
    Button,
    Card,
    Col,
    Empty,
    Flex,
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
import { CloseOutlined, DeleteOutlined, PlusOutlined, SaveOutlined } from '@ant-design/icons';
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
    const [isSaving, setIsSaving] = useState(false);

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
        deleteSlot,
    } = useTimeSlots();

    const { GetUserIdFromJWT } = useUsers();

    const loading = plansLoading || slotsLoading || isSaving;

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

    const handleDeleteDaySlotDraft = (dayOfWeek) => {
        const currentDraft = dayDrafts[dayOfWeek] ?? { slotId: null, startTime: null, endTime: null };
        if (!currentDraft.startTime && !currentDraft.endTime && !currentDraft.slotId) {
            return;
        }

        updateDayDraft(dayOfWeek, {
            startTime: null,
            endTime: null,
        });
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

    const handleSavePlan = async () => {
        if (!selectedPlan) {
            return;
        }

        const name = selectedPlanName.trim();
        if (!name) {
            message.error('Название плана не может быть пустым');
            return;
        }

        const originalDrafts = buildDayDrafts(selectedPlan);
        const nameChanged = (selectedPlan.name ?? '') !== name;

        for (const day of weekDays) {
            const draft = dayDrafts[day.value] ?? { slotId: null, startTime: null, endTime: null };
            const hasStart = Boolean(draft.startTime);
            const hasEnd = Boolean(draft.endTime);

            if (hasStart !== hasEnd) {
                message.warning(`Для дня "${day.label}" укажите и начало, и конец слота`);
                return;
            }

            if (hasStart && hasEnd) {
                const start = toTimeValue(draft.startTime);
                const end = toTimeValue(draft.endTime);
                if (!start || !end || !end.isAfter(start)) {
                    message.warning(`Для дня "${day.label}" время окончания должно быть позже начала`);
                    return;
                }
            }
        }

        const hasSlotChanges = weekDays.some((day) => {
            const draft = dayDrafts[day.value] ?? { slotId: null, startTime: null, endTime: null };
            const original = originalDrafts[day.value] ?? { slotId: null, startTime: null, endTime: null };

            return (
                draft.slotId !== original.slotId ||
                draft.startTime !== original.startTime ||
                draft.endTime !== original.endTime
            );
        });

        if (!nameChanged && !hasSlotChanges) {
            message.info('Изменений нет');
            return;
        }

        try {
            setIsSaving(true);

            if (nameChanged) {
                await updatePlan(selectedPlan.id, { name });
            }

            for (const day of weekDays) {
                const draft = dayDrafts[day.value] ?? { slotId: null, startTime: null, endTime: null };
                const original = originalDrafts[day.value] ?? { slotId: null, startTime: null, endTime: null };

                const isChanged =
                    draft.slotId !== original.slotId ||
                    draft.startTime !== original.startTime ||
                    draft.endTime !== original.endTime;

                if (!isChanged) {
                    continue;
                }

                if (draft.startTime && draft.endTime) {
                    if (draft.slotId) {
                        await updateSlot(draft.slotId, {
                            dayOfWeek: day.value,
                            startTime: draft.startTime,
                            endTime: draft.endTime,
                        });
                    } else {
                        await createSlot(selectedPlan.id, {
                            dayOfWeek: day.value,
                            startTime: draft.startTime,
                            endTime: draft.endTime,
                        });
                    }
                    continue;
                }

                if (draft.slotId) {
                    await deleteSlot(draft.slotId);
                }
            }

            await refreshPlans();
            message.success('План и слоты сохранены');
        } catch (error) {
            console.error('Ошибка сохранения плана и слотов:', error);
            message.error('Не удалось сохранить изменения');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div
            style={{
                height: '100%',
            }}
        >
            <Row gutter={[12, 12]} style={{ height: '100%' }}>
                <Col xs={24} lg={8} style={{ height: '100%' }}>
                    <Card style={{ height: '100%', borderRadius: 14 }} styles={{ body: { height: '100%', display: 'flex', flexDirection: 'column' } }}>
                        <Space orientation="vertical" size={10} style={{ width: '100%' }}>
                            <Flex vertical>
                                <Title level={4} style={{ margin: 0 }}>Ваши планы</Title>
                                <Text type='secondary' style={{ margin: 0 }}>Создайте новый временный план или настройте существующие</Text>
                            </Flex>

                            <Space.Compact style={{ width: '100%' }}>
                                <Input
                                    size='large'
                                    placeholder="Название нового плана"
                                    value={newPlanName}
                                    onChange={(e) => setNewPlanName(e.target.value)}
                                    onPressEnter={handleCreatePlan}
                                />
                                <Button size='large' type="primary" icon={<PlusOutlined />} onClick={handleCreatePlan} />
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
                                        Настройка плана
                                    </Title>
                                    <Button
                                        type="primary"
                                        icon={<SaveOutlined />}
                                        loading={loading}
                                        onClick={handleSavePlan}
                                    >
                                        Применить изменения
                                    </Button>
                                </Space>

                                <Space orientation="vertical" style={{ width: '100%' }}>
                                    <Text type='secondary'>Название плана</Text>
                                    <Input
                                        value={selectedPlanName}
                                        onChange={(e) => setSelectedPlanName(e.target.value)}
                                        placeholder="Название плана"
                                        // size='large'
                                    />
                                </Space>

                                <div style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
                                    <Space orientation="vertical" size={10} style={{ width: '100%' }}>
                                        <Text type='secondary'>Настройка слотов</Text>
                                        {weekDays.map((day) => {
                                            const draft = dayDrafts[day.value] ?? {
                                                slotId: null,
                                                startTime: null,
                                                endTime: null,
                                            };
                                            const hasSlot = Boolean(draft.startTime && draft.endTime);
                                            const canDelete = Boolean(draft.startTime || draft.endTime || draft.slotId);

                                            return (
                                                <div
                                                    key={day.value}
                                                    style={{
                                                        display: 'flex',
                                                        flexWrap: 'wrap',
                                                        gap: 10,
                                                        alignItems: 'center',
                                                        padding: 10,
                                                        border: hasSlot ? '1px solid #f0f0f0' : '1px solid #d9d9d9',
                                                        borderRadius: 8,
                                                        backgroundColor: hasSlot ? '#ffffff' : '#f5f5f5',
                                                    }}
                                                >
                                                    <Text strong style={{ minWidth: 170 }}>{day.label}</Text>
                                                    <TimePicker
                                                        style={{ minWidth: 130, flex: '1 1 130px' }}
                                                        format="HH:mm"
                                                        placeholder="Начало"
                                                        minuteStep='5'
                                                        showNow={false}
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
                                                        placeholder="Конец"
                                                        minuteStep='5'
                                                        showNow={false}
                                                        value={toTimeValue(draft.endTime)}
                                                        onChange={(value) =>
                                                            updateDayDraft(day.value, {
                                                                endTime: value ? toApiTime(value) : null,
                                                            })
                                                        }
                                                    />
                                                    <Button
                                                        danger
                                                        icon={<CloseOutlined />}
                                                        disabled={!canDelete}
                                                        onClick={() => handleDeleteDaySlotDraft(day.value)}
                                                    >
                                                    </Button>
                                                </div>
                                            );
                                        })}
                                    </Space>
                                </div>
                                <Text type='secondary'>Удаление плана</Text>
                                {selectedPlan.isDefault ? 
                                    <Text>Данный план по умолчанию, его невозможно удалить</Text> 
                                    : (
                                        <Flex vertical gap='8px'>
                                        <Text>{`При удалении плана все задачи, которые связаны с ним,\n назначатся на план по умолчанию`}</Text>
                                        <Popconfirm
                                            key="delete"
                                            title="Удалить план?"
                                            onConfirm={() => handleDeletePlan(selectedPlan)}
                                            okText="Удалить"
                                            cancelText="Отмена"
                                        >
                                            <Button
                                                style={{width: 'fit-content'}}
                                                danger
                                                icon={<DeleteOutlined />}
                                                onClick={(e) => e.stopPropagation()}
                                            >Удалить план</Button>
                                        </Popconfirm>
                                        </Flex>
                                    )}
                            </Space>
                        )}
                    </Card>
                </Col>
            </Row>
        </div>
    );
}

export default TimePlans;
