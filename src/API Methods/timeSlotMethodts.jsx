import apiClient from './.ApiClient.jsx';

/**
 * Создает новый слот
 * @param {Object} slotData - Данные для создания временного слота
 * @param {int} slotData.dayOfWeek - День недели (0-6)
 * @param {time} slotData.startTime - Время начала слота (hh:mm:ss)
 * @param {time} slotData.endTime - Время конца слота (hh:mm:ss)
 */
export const AddSlot = async (timePlanId, slotData) => {
    if (!timePlanId)
        throw new Error('id временного плана обязательно');

    if (slotData?.dayOfWeek === undefined || slotData?.dayOfWeek === null)
        throw new Error('День недели обязателен');

    const payload = {
        dayOfWeek: slotData.dayOfWeek,
        startTime: slotData.startTime,
        endTime: slotData.endTime
    };

    try {
        const response = await apiClient.post(`/timeslot/${timePlanId}`, payload);
        const timeslot = response.data;

        console.log('Создан слот:', timeslot);
        return timeslot;

    } catch (error) {
        console.error('Ошибка при создании слота:', error);
        throw error;
    }
}

export const UpdateSlot = async (id, newSlotData) => {
    if (!id)
        throw new Error('id слота обязателен');

    try {
        const response = await apiClient.put(`/timeslot/${id}`, newSlotData);

        console.log(`Слот ${id} обновлен`);
        return response;

    } catch (error) {
        console.error(`Ошибка при обновлении слота ${id}:`, error);

        if (error.response?.status === 404) {
            throw new Error(`Слот ${id} не найден`);
        }

        if (error.response?.status === 403) {
            throw new Error('У вас нет прав для обновления этого слота');
        }

        throw error;
    }
}

export const DeleteSlot = async (id) => {
    if (!id)
        throw new Error('id слота обязателен');

    try {
        const response = await apiClient.delete(`/timeslot/${id}`);

        console.log(`Слот ${id} удален`);
        return response;

    } catch (error) {
        console.error(`Ошибка при удалении слота ${id}:`, error);

        if (error.response?.status === 404) {
            throw new Error(`Слот ${id} не найден`);
        }

        if (error.response?.status === 403) {
            throw new Error('У вас нет прав для удаления этого слота');
        }

        throw error;
    }
}
