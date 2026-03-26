import apiClient from './.ApiClient.jsx';
import { jwtDecode } from 'jwt-decode';

export const AuthenticateUser = async (values, isRegistration) => {
    try {
        let url = '/user/login';
        if (isRegistration) 
            url = '/user/register';

        const username = values.username;
        const password = values.password;

        const response = await apiClient.post(url, {
            "username": username,
            "password": password
        });

        // Получаем JWT токен из ответа на авторизацию
        const token = response.data.token;
        if (!token) {
            throw new Error('Токен отсутствует в ответе сервера');
        }

        return token;
    }
    catch (error) {
        console.error('Ошибка аутентификации:', error.response?.data || error.message);
        throw error;
    }
};

export const GetUserIdFromJWT = (token) => {
    try {
        const decoded = jwtDecode(token);
        const userId = decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];
        
        if (userId) {
            return parseInt(userId);
        }
        return null;
    } catch (decodeError) {
        console.error('Ошибка при декодировании токена:', decodeError);
        return null;
    }
};

export const getUserInfo = async (userId) => {
    try {
        const response = await apiClient.get(`/user/${userId}`);
        return response.data;
    }
    catch (error) {
        console.error(`Ошибка при получении информации пользователя #${userId}`, error);
        throw error;
    }
};

export const getUserByUsername = async (username) => {
    try {
        const response = await apiClient.get(`/user/by-username/?username=${username}`);
        return response.data;
    }
    catch (error) {
        console.error(`Ошибка при получении информации пользователя #${username}`, error);
        throw error;
    }
};

export const updateUserData = async (userId, userData) => {
    try {
        const payload = {};
        
        // Если передаем имя пользователя
        if (userData.userName !== undefined) {
            payload.userName = userData.userName;
        }
        
        // Если передаем старый пароль (для смены пароля)
        if (userData.oldPassword !== undefined) {
            payload.oldPassword = userData.oldPassword;
        }
        
        // Если передаем новый пароль
        if (userData.password !== undefined) {
            payload.password = userData.password;
        }

        console.log('Отправка запроса на обновление пользователя:', {
            url: `/user/${userId}`,
            method: 'PUT',
            data: payload
        });

        const response = await apiClient.put(`/user/${userId}`, payload);
        
        console.log('Успешный ответ от сервера:', response.data);
        return response.data;
    } catch (error) {
        console.error(`Ошибка при обновлении профиля пользователя ${userId}:`, error);
        
        const apiError = new Error(error.response?.data?.message || error.message);
        apiError.response = error.response;
        apiError.status = error.response?.status;
        
        throw apiError;
    }
};
