import { useState } from 'react';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import * as api from '../API Methods/userMethods.jsx'; 

export const useUsers = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Функция авторизации
    const loginUser = async (values) => {
        setLoading(true);
        setError(null);

        try {
            const token = await api.AuthenticateUser(values, false);

            // Сохраняем токен в cookies
            Cookies.remove('token', {
                expires: 1,
                sameSite: 'Strict',
                path: '/'
            });
            setTokenToCookie(token);

            
            console.log('Вход: ', values);
        }
        catch (error) {
            console.error(`Ошибка входа: `, error);
            throw error;
        }
        finally {
            setLoading(false);
        }
    }

    /** Функция регистрации */ 
    const registerUser = async (values) => {
        setLoading(true);
        setError(null);

        try {
            const token = await api.AuthenticateUser(values, true);

            // Сохраняем токен в cookies
            setTokenToCookie(token);
            console.log('Регистрация: ', values);
        }
        catch (error) {
            console.error(`Ошибка регистрации: `, error);
            throw error;
        }
        finally {
            setLoading(false);
        }
    }

    const setTokenToCookie = (token) => {
        Cookies.set('token', token, {
            expires: 1,
            sameSite: 'Strict',
            path: '/'
        });
    };

    // Функция выхода
    const logoutUser = () => {
        localStorage.clear();
        Cookies.remove('token', {
            sameSite: 'Strict'
        });

        navigate('/login')
    };

    /**  Получение информации о пользователе */
    const getUserInfo = async (userId) => {
        if (!userId) return null;

        try {
            const userInfo = await api.getUserInfo(userId);
            return userInfo;
                
        } catch (err) {
            console.error('Ошибка получения пользователя:', err);
            return null;
        }
    };

    const getUserByUsername = async (username) => {
        if (!username) return null;

        try {
            const userInfo = await api.getUserByUsername(username);
            return userInfo;
                
        } catch (err) {
            console.error('Ошибка получения пользователя:', err);
            return null;
        }
    };

    const GetUserIdFromJWT = (token) => {
        if (!token) return null;

        try {
            const userId = api.GetUserIdFromJWT(token);
            return userId;
        } catch (err) {
            console.error('Ошибка получения id из токена')
            return null;
        }
    }

    /** Сменить пароль */
    const changePassword = async (token, userId, oldPassword, newPassword) => {
        setLoading(true);
        setError(null);
        
        try {
            const updateData = {
                oldPassword: oldPassword,
                password: newPassword
            };
            
            const response = await api.updateUserData(userId, updateData);
            return response;
        } catch (err) {
            console.error('Ошибка при смене пароля:', err);
            
            if (err.response?.data) {
                throw new Error(err.response.data);
            }
            throw err;
        } finally {
            setLoading(false);
        }
    };

    /** Сменить логин */
    const changeUsername = async (token, userId, newUsername) => {
        setLoading(true);
        setError(null);
        
        try {
            const updateData = {
                userName: newUsername
            };
            
            const response = await api.updateUserData(userId, updateData);
            return response;
        } catch (err) {
            console.error('Ошибка при смене логина:', err);
            
            // Пробрасываем ошибку дальше для обработки в компоненте
            if (err.response?.data) {
                throw new Error(err.response.data);
            }
            throw err;
        } finally {
            setLoading(false);
        }
    }

    return {
        loading,
        error,
        loginUser,
        registerUser,
        logoutUser,
        getUserInfo,
        getUserByUsername,
        GetUserIdFromJWT,
        changePassword,
        changeUsername
    };
};
