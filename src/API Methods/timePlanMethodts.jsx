import apiClient from './.ApiClient.jsx';

export const GetPlan = async (id) => {
    if(!id)
        throw new Error('id плана обязателен');

    try {
        const response = await apiClient.get(`/timeplan/${id}`);
        const timeplan = response.data;

        console.log('Полученный таймплан:', timeplan);
        return timeplan;

    } catch (error) {
        console.error('Ошибка при получении плана:', error);
        throw error;
    }
}

export const GetUserPlan = async (userId) => {
    if(!userId)
        throw new Error('id пользователя обязателен');

    try {
        const response = await apiClient.get(`/timeplan/by-user/${userId}`);
        const timeplans = response.data;

        console.log('Полученный таймплан:', timeplans);
        return timeplans;

    } catch (error) {
        console.error('Ошибка при получении планов пользователя:', error);
        throw error;
    }
}

/**
 * Создает новый план
 * @param {Object} planData - Данные для создания временного плана
 * @param {string} planData.name - Название плана
 * @param {boolean} planData.isDefault - План по умолчанию
 */
export const AddPlan = async (planData) => {
    if(!planData.name || planData.name.trim() === '')
        throw new Error('Название плана обязательно');

    const payload = {
        name: planData.name,
        isDefault: planData.isDefault || false
    };

    try {
        const response = await apiClient.post(`/timeplan`, payload);
        const timeplan = response.data;

        console.log('Создан таймплан:', timeplan);
        return timeplan;

    } catch (error) {
        console.error('Ошибка при создании плана:', error);
        throw error;
    }
}

/**
 * Обоновляет план
 * @param {Object} newPlanData - Новые данные плана
 * @param {string} newPlanData.name - Название плана
 * @param {boolean} newPlanData.isDefault - План по умолчанию
 */
export const UpdatePlan = async (id, newPlanData) => {
    if (!id)
        throw new Error('id плана обязателен')

    try {
        const response = await apiClient.put(`/timeplan/${id}`, newPlanData);

        console.log(`План ${id} обновлен`);
        return response;

    } catch (error) {
    console.error(`Ошибка при обновлении квиза ${id}:`, error);
    
    if (error.response?.status === 404) {
        throw new Error(`План ${id} не найден`);
    }
    
    if (error.response?.status === 403) {
        throw new Error('У вас нет прав для обновления этого плана');
    }
    
    throw error;
    }
}

/** Удаляет план */
export const DeletePlan = async (id) => {
        if (!id)
        throw new Error('id плана обязателен')

    try {
        const response = await apiClient.delete(`/timeplan/${id}`);

        console.log(`План ${id} удалён`);
        return response;

    } catch (error) {
    console.error(`Ошибка при удалении квиза ${id}:`, error);
    
    if (error.response?.status === 404) {
        throw new Error(`План ${id} не найден`);
    }
    
    if (error.response?.status === 403) {
        throw new Error('У вас нет прав на удаление этого плана');
    }
    
    throw error;
    }
}
