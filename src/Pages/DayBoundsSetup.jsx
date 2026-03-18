import { useState, useEffect } from 'react';
import { Button, Card, Checkbox, message, Slider, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';

import { useTimePlans } from '../Hooks/useTimePlans';
import { useTimeSlots } from '../Hooks/useTimeSlots';

const { Title, Text } = Typography;

const formatMinutesToTime = (totalMinutes) => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

function DayBoundsSetup() {
    const navigate = useNavigate();
    const [timeRange, setTimeRange] = useState([9 * 60, 18 * 60]);
    const [selectedDays, setSelectedDays] = useState([1, 2, 3, 4, 5]);

    const { loading: plansLoading, createPlan } = useTimePlans();
    const { loading: slotsLoading, createSlot } = useTimeSlots();

    const isLoading = plansLoading || slotsLoading;
    const weekDayOptions = [
        { label: 'Пн', value: 1 },
        { label: 'Вт', value: 2 },
        { label: 'Ср', value: 3 },
        { label: 'Чт', value: 4 },
        { label: 'Пт', value: 5 },
        { label: 'Сб', value: 6 },
        { label: 'Вс', value: 0 },
    ];

    useEffect(() => {
    }, []);

    const onContinue = async () => {
        if (selectedDays.length === 0) {
            message.error('Выберите хотя бы один день недели');
            return;
        }

        const plan = await createPlan('Любое время', true);
        const timePlanId = plan.id

        if (!timePlanId) {
            message.error('Не найден план пользователя для создания слотов');
            return;
        }

        const startTime = `${formatMinutesToTime(timeRange[0])}:00`;
        const endTime = `${formatMinutesToTime(timeRange[1])}:00`;

        const slotPayloads = selectedDays.map((dayOfWeek) => ({
            dayOfWeek,
            startTime,
            endTime,
        }));

        //Создание слотов
        try {
            await Promise.all(
                slotPayloads.map((slotData) => createSlot(timePlanId, slotData))
            );

            console.log({
                timePlanId,
                selectedDays,
                startTime,
                endTime,
            });
            message.success('Слоты успешно созданы');
            navigate('/');
        } catch (error) {
            console.error('Ошибка при создании слотов:', error);
            message.error('Не удалось создать слоты');
        }
    };

    const pageStyle = {
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #171717 0%, #0f0f0f 58%, #2e2e2e 100%)',
    };

    const shellStyle = {
        width: '100%',
        maxWidth: 980,
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 24,
    };

    const heroStyle = {
        color: '#f5f5f5',
        maxWidth: 430,
    };

    const badgeStyle = {
        display: 'inline-block',
        padding: '6px 12px',
        borderRadius: 999,
        background: '#2a2a2a',
        color: '#d9d9d9',
        fontSize: 12,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
    };

    const titleStyle = {
        color: '#ffffff',
        margin: '16px 0 10px',
        lineHeight: 1.1,
    };

    const textStyle = {
        margin: 0,
        color: '#bfbfbf',
        lineHeight: 1.5,
    };

    const cardStyle = {
        width: '100%',
        maxWidth: 500,
        borderRadius: 14,
        border: '1px solid #3a3a3a',
        boxShadow: '0 18px 45px rgba(0, 0, 0, 0.35)',
    };

    const questionTitleStyle = {
        marginTop: 0,
        marginBottom: 8,
    };

    const questionTextStyle = {
        display: 'block',
        marginBottom: 50,
        color: '#595959',
    };

    const currentRangeStyle = {
        marginTop: 8,
        marginBottom: 16,
        textAlign: 'center',
        fontWeight: 600,
    };

    const daysTitleStyle = {
        display: 'block',
        marginBottom: 10,
        fontWeight: 600,
    };

    const daysWrapStyle = {
        marginBottom: 24,
    };

    return (
        <div style={pageStyle}>
            <div style={shellStyle}>
                <section style={heroStyle}>
                    <span style={badgeStyle}>{`Настройка плана`}</span>
                    <h1 style={titleStyle}>Перед началом работы настройте свой план</h1>
                    <p style={textStyle}>
                        Укажите удобный интервал для работы, не волнуйтесь, после можно изменить в настройках.
                    </p>
                </section>

                <Card style={cardStyle}>
                    <Title level={3} style={questionTitleStyle}>Ваш временной план</Title>
                    <Text style={questionTextStyle}>
                        В какое время хотите начинать и заканчивать день?
                    </Text>

                    <Slider
                        range
                        min={0}
                        max={23 * 60 + 59}
                        step={15}
                        value={timeRange}
                        onChange={setTimeRange}
                        tooltip={{
                            formatter: (value) => formatMinutesToTime(value ?? 0),
                        }}
                    />

                    <div style={currentRangeStyle}>
                        {formatMinutesToTime(timeRange[0])} - {formatMinutesToTime(timeRange[1])}
                    </div>

                    <Text style={daysTitleStyle}>В какие дни планировать задачи?</Text>
                    <div style={daysWrapStyle}>
                        <Checkbox.Group
                            options={weekDayOptions}
                            value={selectedDays}
                            onChange={setSelectedDays}
                        />
                    </div>

                    <Button
                        type="primary"
                        size="large"
                        block
                        onClick={onContinue}
                        loading={isLoading}
                        style={{ backgroundColor: '#232323', borderColor: '#232323' }}
                    >
                        Продолжить
                    </Button>
                </Card>
            </div>
        </div>
    );
}

export default DayBoundsSetup;
