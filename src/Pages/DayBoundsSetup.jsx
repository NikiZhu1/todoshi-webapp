import { useState, useEffect } from 'react';
import { Button, Card, Slider, Typography } from 'antd';

import { useTimePlans } from '../Hooks/useTimePlans';
import { useTimeSlots } from '../Hooks/useTimeSlots'

const { Title, Text } = Typography;

const formatMinutesToTime = (totalMinutes) => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

function DayBoundsSetup() {
    const [timeRange, setTimeRange] = useState([9 * 60, 18 * 60]);

    const {userPlans} = useTimePlans();
    const {loading, createSlot} = useTimeSlots();


    useEffect(() => {
        // checkPlan();
    }, []);

    // const checkPlan = async () => {
    //     const plan = await getTodo(1);
    //     console.log(plan);
    // }

    const onContinue = async () => {
        const startTime = formatMinutesToTime(timeRange[0]);
        const endTime = formatMinutesToTime(timeRange[1]);

        console.log({
            startTime,
            endTime,
        });
        
        const userplan = userPlans
        await createSlot()
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
        marginBottom: 22,
        textAlign: 'center',
        fontWeight: 600,
    };

    return (
        <div style={pageStyle}>
            <div style={shellStyle}>
                <section style={heroStyle}>
                    <span style={badgeStyle}>Настройка плана</span>
                    <p></p>
                    <h1 style={titleStyle}>Перед начало работы настройте свой план</h1>
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

                    <Button
                        type="primary"
                        size="large"
                        block
                        onClick={onContinue}
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
