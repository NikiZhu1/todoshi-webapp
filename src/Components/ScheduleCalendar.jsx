import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import { Empty, Spin, Card } from 'antd';

function ScheduleCalendar({ tasks = [], defaultPlan, loading = false }) {
    const events = (tasks ?? [])
        .map((task) => ({
            id: String(task?.id),
            title: task?.task?.title ?? `Задача #${task?.task?.taskId}`,
            start: task?.startTime,
            end: task?.endTime,
            backgroundColor: task?.task?.color ?? '#232323',
            borderColor: task?.task?.color ?? '#232323',
        }))
        .filter((event) => Boolean(event.start));
    
    const getBusinessHours = (plan) => {
        const slots = plan?.slots ?? [];
        if (slots.length === 0) return [];

        // нормализуем дни (вс = 7, чтобы корректно сортировать)
        const normalizeDay = (d) => (d === 0 ? 7 : d);

        // группируем по времени
        const groups = {};

        slots.forEach((slot) => {
            const start = slot.startTime?.slice(0, 5);
            const end = slot.endTime?.slice(0, 5);
            const key = `${start}-${end}`;

            if (!groups[key]) {
                groups[key] = {
                    days: [],
                    startTime: start,
                    endTime: end
                };
            }

            groups[key].days.push(normalizeDay(slot.dayOfWeek));
        });

        // превращаем в формат FullCalendar
        return Object.values(groups).map(group => ({
            daysOfWeek: group.days
                .sort((a, b) => a - b)
                .map(d => (d === 7 ? 0 : d)), // возвращаем вс обратно в 0
            startTime: group.startTime,
            endTime: group.endTime
        }));
    };

    return (
        <Card
            style={{
                borderRadius: 14,
                border: '1px solid #e5e7eb',
                height: '100%',
            }}
            styles={{ body: { padding: 16, height: '100%' } }}
        >

            {loading ? (
                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Spin />
                </div>
            ) : (
                <FullCalendar
                    plugins={[dayGridPlugin, timeGridPlugin, listPlugin ]}
                    locale='ru'
                    timeZone='local'
                    firstDay='1'
                    nowIndicator={true}
                    initialView="timeGridWeek"
                    height='100%'
                    events={events}
                    headerToolbar={{
                        left: 'prev,next today',
                        center: 'title',
                        right: 'dayGridMonth,timeGridWeek,listMonth',
                    }}
                    buttonText={{
                        today:    'Сегодня',
                        month:    'Месяц',
                        week:     'Неделя',
                        day:      'День',
                        list:     'Список'
                    }}
                    businessHours={getBusinessHours(defaultPlan)}
                />
            )}
        </Card>
    );
}

export default ScheduleCalendar;
