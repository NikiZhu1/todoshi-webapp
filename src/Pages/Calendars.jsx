import { useEffect, useMemo, useState } from 'react';
import Cookies from 'js-cookie';
import {
    Button,
    Card,
    Form,
    Input,
    Modal,
    Popconfirm,
    Space,
    Table,
    Tag,
    Typography,
    message,
} from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

import { useUsers } from '../Hooks/useUsers';
import { useUserCalendars } from '../Hooks/useUserCalendars';

const { Text, Title } = Typography;

const detectCalendarFormat = (rawLink) => {
    const link = (rawLink ?? '').trim().toLowerCase().replace(/\/+$/, '');

    if (!link) {
        return null;
    }

    if (link.endsWith('calendar.google.com') || link.endsWith('gmail.com')) {
        return 'google';
    }

    if (link.startsWith('https://') && link.endsWith('.ics')) {
        return 'ics';
    }

    return null;
};

function Calendars() {
    const navigate = useNavigate();
    const { GetUserIdFromJWT } = useUsers();
    const {
        loading,
        userCalendars,
        getUserCalendars,
        addCalendar,
        updateCalendar,
        deleteCalendar,
    } = useUserCalendars();

    const [userId, setUserId] = useState(null);
    const [createForm] = Form.useForm();
    const [editForm] = Form.useForm();
    const [editingCalendar, setEditingCalendar] = useState(null);
    const [isEditOpen, setIsEditOpen] = useState(false);

    const refreshCalendars = async (id = userId) => {
        if (!id) {
            return;
        }
        await getUserCalendars(id);
    };

    useEffect(() => {
        const token = Cookies.get('token');
        const parsedUserId = GetUserIdFromJWT(token);

        if (!parsedUserId) {
            navigate('/login');
            return;
        }

        setUserId(parsedUserId);
        refreshCalendars(parsedUserId).catch((error) => {
            console.error('Ошибка загрузки календарей:', error);
            message.error('Не удалось загрузить календари');
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const createLinkValue = Form.useWatch('link', createForm);
    const createDetectedFormat = useMemo(
        () => detectCalendarFormat(createLinkValue),
        [createLinkValue]
    );

    const editLinkValue = Form.useWatch('link', editForm);
    const editDetectedFormat = useMemo(
        () => detectCalendarFormat(editLinkValue),
        [editLinkValue]
    );

    // Создание
    const handleCreate = async () => {
        try {
            const values = await createForm.validateFields();
            const format = detectCalendarFormat(values.link);
            if (!format) {
                message.error('Неверная ссылка календаря');
                return;
            }

            const calendarData = {
                title: values.title.trim(),
                format: format,
                link: values.link.trim(),
            }
            await addCalendar(calendarData);

            createForm.resetFields();
            await refreshCalendars();
            message.success('Календарь добавлен');
        } catch (error) {
            if (error?.errorFields) {
                return;
            }
            console.error('Ошибка создания календаря:', error);
            message.error('Не удалось добавить календарь');
        }
    };

    const openEdit = (calendar) => {
        setEditingCalendar(calendar);

        editForm.setFieldsValue({
            title: calendar?.title ?? '',
            link: calendar.format === 'ics' ? undefined : calendar?.link,
        });

        setIsEditOpen(true);
    };

    const handleSaveEdit = async () => {
        if (!editingCalendar?.userCalendarId) {
            return;
        }

        try {
            const values = await editForm.validateFields();

            // если ICS — обновляем только название
            if (editingCalendar.format === 'ics') {
                await updateCalendar(editingCalendar.userCalendarId, {
                    title: values.title.trim()
                });
            } else {
                if (values.link) {
                    const format = detectCalendarFormat(values.link);
                    if (!format) {
                        message.error('Неверная ссылка календаря');
                        return;
                    }
                }

                const link = values.link?.trim();

                await updateCalendar(editingCalendar.userCalendarId, {
                    title: values.title.trim(),
                    link: link || null,
                    format: link ? detectCalendarFormat(link) : null,
                });
            }
            setIsEditOpen(false);
            setEditingCalendar(null);
            await refreshCalendars();
            message.success('Календарь обновлён');
        } catch (error) {
            if (error?.errorFields) {
                return;
            }
            console.error('Ошибка обновления календаря:', error);
            message.error('Не удалось обновить календарь');
        }
    };

    const handleDelete = async (calendarId) => {
        try {
            await deleteCalendar(calendarId);
            await refreshCalendars();
            message.success('Календарь удалён');
        } catch (error) {
            console.error('Ошибка удаления календаря:', error);
            message.error('Не удалось удалить календарь');
        }
    };

    const columns = [
        {
            title: 'Название',
            dataIndex: 'title',
            key: 'title',
            width: '200px',
            render: (value) => <Text strong>{value}</Text>,
        },
        {
            title: 'Ссылка',
            dataIndex: 'link',
            key: 'link',
            ellipsis: true,
            render: (value, record) =>
                record.format === 'ics'
                ? 'https://•••••••••••.ics'
                : value,
        },
        {
            title: 'Формат',
            dataIndex: 'format',
            key: 'format',
            width: 130,
            render: (value) => (
                <Tag color={value === 'google' ? 'blue' : 'green'}>
                    {value === 'google' ? 'Google' : 'ICall'}
                </Tag>
            ),
        },
        {
            title: 'Действия',
            key: 'actions',
            width: 140,
            render: (_, record) => (
                <Space>
                    <Button type="text" icon={<EditOutlined />} onClick={() => openEdit(record)} />
                    <Popconfirm
                        title="Удалить календарь?"
                        okText="Удалить"
                        cancelText="Отмена"
                        onConfirm={() => handleDelete(record.userCalendarId)}
                    >
                        <Button type="text" danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div style={{ height: '100%' }}>
            <Card
                style={{ borderRadius: 14, height: '100%' }}
                styles={{ body: { display: 'flex', flexDirection: 'column', gap: 12, height: '100%' } }}
            >
                <div>
                    <Title level={4} style={{ margin: 0 }}>Управление календарями</Title>
                    <Text type="secondary">Добавляйте, редактируйте и удаляйте внешние календари</Text>
                </div>

                <Form form={createForm} layout="vertical">
                    <Space.Compact style={{ width: '100%' }}>
                        <Form.Item
                            name="title"
                            style={{ flex: 1, marginBottom: 0 }}
                            rules={[{ required: true, message: 'Введите название' }]}
                        >
                            <Input size="large" placeholder="Название календаря" />
                        </Form.Item>
                        <Form.Item
                            name="link"
                            style={{ flex: 2, marginBottom: 0 }}
                            rules={[{ required: true, message: 'Введите ссылку' }]}
                        >
                            <Input size="large" placeholder="Ссылка на календарь" />
                        </Form.Item>
                        <Button size="large" type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
                            Добавить
                        </Button>
                    </Space.Compact>
                    <div style={{ marginTop: 8 }}>
                        <Text type={createLinkValue && !createDetectedFormat ? 'danger' : 'secondary'}>
                            Формат: {createDetectedFormat ? createDetectedFormat : 'ссылка не распознана'}
                        </Text>
                    </div>
                </Form>

                <div style={{ flex: 1, minHeight: 0 }}>
                    <Table
                        rowKey="id"
                        loading={loading}
                        dataSource={userCalendars ?? []}
                        columns={columns}
                        pagination={false}
                        scroll={{ y: 'calc(100vh - 320px)' }}
                        locale={{ emptyText: 'Календари не найдены' }}
                    />
                </div>
            </Card>

            {/* Модалка редактирования */}
            <Modal
                title="Редактирование календаря"
                open={isEditOpen}
                onCancel={() => {
                    setIsEditOpen(false);
                    setEditingCalendar(null);
                }}
                onOk={handleSaveEdit}
                okText="Сохранить"
                cancelText="Отмена"
                destroyOnClose
            >
                <Form form={editForm} layout="vertical">
                    <Form.Item
                        name="title"
                        label="Название"
                        rules={[{ required: true, message: 'Введите название' }]}
                    >
                        <Input placeholder="Название календаря" />
                    </Form.Item>
                    {editingCalendar?.format === 'ics' ? (
                        <Form.Item label="Ссылка">
                            <Text type="secondary">
                                Ссылка скрыта. Воспользуйтесь добавлением, чтобы создать календарь с новой ссылкой
                            </Text>
                        </Form.Item>
                    ) : (
                        <Form.Item
                            name="link"
                            label="Ссылка"
                        >
                            <Input placeholder="Ссылка на календарь" />
                        </Form.Item>
                    )}
                </Form>
            </Modal>
        </div>
    );
}

export default Calendars;
