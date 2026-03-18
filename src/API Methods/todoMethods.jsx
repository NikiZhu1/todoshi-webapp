import apiClient from './.ApiClient.jsx';

export const GetTodo = async (id) => {
    if (!id)
        throw new Error('id задачи обязателен');

    try {
        const response = await apiClient.get(`/todo/${id}`);
        const todo = response.data;

        console.log('Полученная задача:', todo);
        return todo;

    } catch (error) {
        console.error('Ошибка при получении задачи:', error);
        throw error;
    }
}

export const GetUserTodos = async (userId) => {
    if (!userId)
        throw new Error('id пользователя обязателен');

    try {
        const response = await apiClient.get(`/todo/by-user/${userId}`);
        const todos = response.data;

        console.log('Полученные задачи пользователя:', todos);
        return todos;

    } catch (error) {
        console.error('Ошибка при получении задач пользователя:', error);
        throw error;
    }
}

/**
 * Создает новую задачу
 * @param {Object} todoData - Данные для создания задачи
 * @param {string} todoData.title - Название плана
 * @param {string?} todoData.notes - Заметки задачи
 * @param {int} todoData.estimatedDurationMinutes - Длительность (минуты)
 * @param {dateTime} todoData.earliestStart - Дата начала задачи (yyyy-MM-ddThh:mm:ssZ)
 * @param {dateTime?} todoData.deadline - Дата конца задачи (yyyy-MM-ddThh:mm:ssZ)
 * @param {boolean?} todoData.isSplittable - Может ли задача разделяться
 * @param {boolean?} todoData.isPinned - Закреплена ли задача
 * @param {int} todoData.status - Статус задачи: 0 - незапланировано, 1 - запланировано, 2 - выполнено
 * @param {int} todoData.priority - Приоритет задачи: 0 - высокий , 1 - средний, 2 - низкий
 * @param {string} todoData.color - Цвет
 */
export const AddTodo = async (todoData) => {
    if (!todoData || typeof todoData !== 'object')
        throw new Error('Данные задачи обязательны');

    if (!todoData.title || todoData.title.trim() === '')
        throw new Error('Название задачи обязательно');

    try {
        const response = await apiClient.post(`/todo`, todoData);
        const todo = response.data;

        console.log('Создана задача:', todo);
        return todo;

    } catch (error) {
        console.error('Ошибка при создании задачи:', error);
        throw error;
    }
}

export const UpdateTodo = async (id, newTodoData) => {
    if (!id)
        throw new Error('id задачи обязателен');

    try {
        const response = await apiClient.put(`/todo/${id}`, newTodoData);

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

export const DeleteTodo = async (id) => {
    if (!id)
        throw new Error('id задачи обязателен');

    try {
        const response = await apiClient.delete(`/todo/${id}`);

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

export const Plan = async (timezone) => {
    try {
        const url = `/todo/plan?timeZoneId=${encodeURIComponent(timezone)}`

        const response = await apiClient.post(url, null);
        console.log(url)
        const plannedTodos = response.data;

        console.log('Получен спланированный список задач:', plannedTodos);
        return plannedTodos;

    } catch (error) {
        console.error('Ошибка при планировании задач:', error);
        throw error;
    }
}
