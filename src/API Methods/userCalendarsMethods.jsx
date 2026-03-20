import apiClient from './.ApiClient.jsx';

export const GetCalendar = async (id) => {
    if (!id)
        throw new Error('id обязателен');

    try {
        const response = await apiClient.get(`/user-calendar/${id}`);
        const calendar = response.data;

        console.log('Полученный календарь:', calendar);
        return calendar;

    } catch (error) {
        console.error('Ошибка при получении календаря:', error);
        throw error;
    }
}

export const GetUserCalendars = async (userId) => {
    if (!userId)
        throw new Error('id пользователя обязателен');

    try {
        const response = await apiClient.get(`/user-calendar/by-user/${userId}`);
        const calendars = response.data;

        console.log('Полученные календари пользователя:', calendars);
        return calendars;

    } catch (error) {
        console.error('Ошибка при получении календарей пользователя:', error);
        throw error;
    }
}

/**
 * Добавляет календарь
 * @param {Object} calendarData - Данные для создания задачи
 * @param {string} calendarData.title - Название
 * @param {string} calendarData.format - Формат календаря (ics или google)
 * @param {string} calendarData.link - Ссылка на календарь
 */
export const AddCalendar = async (calendarData) => {
    if (!calendarData || typeof calendarData !== 'object')
        throw new Error('Данные календаря обязательны');

    if (!calendarData.title || calendarData.title.trim() === '')
        throw new Error('Название обязательно');

    if (!calendarData.format || calendarData.format.trim() === '')
        throw new Error('Формат обязателен');

    const allowedFormats = ['ics', 'google'];
    if (!allowedFormats.includes(calendarData.format)) {
        throw new Error('Неверный формат');
    }

    if (!calendarData.link || calendarData.link.trim() === '')
        throw new Error('Ссылка обязательна');

    try {
        const response = await apiClient.post(`/user-calendar`, calendarData);
        const calendar = response.data;

        console.log('Добавлен календарь:', calendar);
        return calendar;

    } catch (error) {
        console.error('Ошибка при добавлении календаря:', error);
        throw error;
    }
}

export const UpdateCalendar = async (id, newTodoData) => {
    if (!id)
        throw new Error('id обязателен');

    try {
        const response = await apiClient.put(`/user-calendar/${id}`, newTodoData);

        console.log(`Календарь ${id} обновлена`);
        return response.data;

    } catch (error) {
        console.error(`Ошибка при обновлении календаря ${id}:`, error);

        if (error.response?.status === 404) {
            throw new Error(`Календарь ${id} не найдена`);
        }

        if (error.response?.status === 403) {
            throw new Error('У вас нет прав для обновления этого календаря');
        }

        throw error;
    }
}

export const DeleteCalendar = async (id) => {
    if (!id)
        throw new Error('id задачи обязателен');

    try {
        const response = await apiClient.delete(`/user-calendar/${id}`);

        console.log(`Календарь ${id} удален`);
        return response.data;

    } catch (error) {
        console.error(`Ошибка при удалении календаря ${id}:`, error);

        if (error.response?.status === 404) {
            throw new Error(`Календарь ${id} не найдена`);
        }

        if (error.response?.status === 403) {
            throw new Error('У вас нет прав для удаления этого календаря');
        }

        throw error;
    }
}

