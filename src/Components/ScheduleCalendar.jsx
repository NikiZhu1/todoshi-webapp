import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import { Empty, Spin, Card } from 'antd';

function ScheduleCalendar({ tasks = [], loading = false }) {
    const events = (tasks ?? [])
        .map((task) => ({
            id: String(task?.id),
            title: task?.task.title ?? `Задача #${task?.task.taskId }`,
            start: task?.startTime,
            end: task?.endTime,
            backgroundColor: task?.color ?? '#232323',
            borderColor: task?.color ?? '#232323',
        }))
        .filter((event) => Boolean(event.start));

    return (
        <Card
            style={{
                borderRadius: 14,
                border: '1px solid #e5e7eb',
                minHeight: '78vh',
            }}
        >

            {loading ? (
                <div style={{ height: 560, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Spin />
                </div>
            ) : events.length === 0 ? (
                <div style={{ height: 560, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Empty description="Нет запланированных задач" />
                </div>
            ) : (
                <FullCalendar
                    plugins={[dayGridPlugin, timeGridPlugin, listPlugin ]}
                    locale='ru'
                    firstDay='1'
                    nowIndicator={true}
                    initialView="dayGridMonth"
                    height='560px'
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
                />
            )}
        </Card>
    );
}

export default ScheduleCalendar;
