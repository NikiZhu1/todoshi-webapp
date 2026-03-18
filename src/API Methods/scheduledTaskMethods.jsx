import apiClient from './.ApiClient.jsx';

export const GetScheduledTask = async (id) => {
    if (!id)
        throw new Error('id задачи обязателен');

    try {
        const response = await apiClient.get(`/scheduledtask/${id}`);
        const todo = response.data;

        console.log('Полученная задача:', todo);
        return todo;

    } catch (error) {
        console.error('Ошибка при получении задачи:', error);
        throw error;
    }
}

export const GetUserScheduledTasks = async (userId) => {
    if (!userId)
        throw new Error('id пользователя обязателен');

    try {
        const response = await apiClient.get(`/scheduledtask/by-user/${userId}`);
        const todos = response.data;

        console.log('Полученные задачи пользователя:', todos);
        return todos;

    } catch (error) {
        console.error('Ошибка при получении задач пользователя:', error);
        throw error;
    }
}

export const GetScheduledTasksByTodo = async (todoId) => {
    if (!userId)
        throw new Error('id задачи обязателен');

    try {
        const response = await apiClient.get(`/scheduledtask/by-task/${todoId}`);
        const todos = response.data;

        console.log('Полученные задачи:', todos);
        return todos;

    } catch (error) {
        console.error('Ошибка при получении задач:', error);
        throw error;
    }
}

/**
 * Создает новую задачу в календарь
 * @param {Object} taskId - Id todo
 * @param {string} startTime - Время начала задачи
 * @param {string} endTime - Время завершения задачи
 */
export const AddScheduledTask = async (taskId, startTime, endTime) => {
    if (!taskId || !startTime || !endTime)
        throw new Error('Данные задачи обязательны');

    try {
        const response = await apiClient.post(`/scheduledtask`, {
            taskId: taskId,
            startTime: startTime,
            endTime: endTime
        });
        const todo = response.data;

        console.log('Создана задача:', todo);
        return todo;

    } catch (error) {
        console.error('Ошибка при создании задачи:', error);
        throw error;
    }
}

export const UpdateScheduledTask = async (taskId, startTime, endTime) => {
    if (!id)
        throw new Error('id задачи обязателен');

    try {
        const response = await apiClient.put(`/scheduledtask/${id}`, {
            taskId: taskId,
            startTime: startTime,
            endTime: endTime
        });

        console.log(`Задача ${id} обновлена`);
        return response.data;

    } catch (error) {
        console.error(`Ошибка при обновлении задачи ${id}:`, error);

        if (error.response?.status === 404) {
            throw new Error(`Задача ${id} не найдена`);
        }

        if (error.response?.status === 403) {
            throw new Error('У вас нет прав для обновления этой задачи');
        }

        throw error;
    }
}

export const DeleteScheduledTask = async (id) => {
    if (!id)
        throw new Error('id задачи обязателен');

    try {
        const response = await apiClient.delete(`/scheduledtask/${id}`);

        console.log(`Задача ${id} удалена`);
        return response.data;

    } catch (error) {
        console.error(`Ошибка при удалении задачи ${id}:`, error);

        if (error.response?.status === 404) {
            throw new Error(`Задача ${id} не найдена`);
        }

        if (error.response?.status === 403) {
            throw new Error('У вас нет прав для удаления этой задачи');
        }

        throw error;
    }
}
