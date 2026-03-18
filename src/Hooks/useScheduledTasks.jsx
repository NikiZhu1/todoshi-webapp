import { useState } from 'react';
import * as api from '../API Methods/scheduledTaskMethods.jsx'; 

export const useScheduledTasks = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [userScheduledTasks, setScheduledTasks] = useState([]);

    const execute = async (callback) => {
        setLoading(true);
        setError(null);

        try {
            return await callback();
        } catch (error) {
            setError(error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    /** Получить Todo */
    const getTask = (id) => 
        execute(async () => {
            const taskData = await api.GetScheduledTask(id);
            return taskData;
    });

    /** Получить задачи пользователя */ 
    const getUserTasks = (userId) =>
        execute(async () => {
            const taskData = await api.GetUserScheduledTasks(userId);
            setScheduledTasks(taskData ?? []);
            return taskData;
    });

    /** Создать */ 
    const createTask = (taskId, startTime, endTime) => 
        execute(async () => {
            const newTask = await api.AddScheduledTask(taskId, startTime, endTime);
            setScheduledTasks(prev => [...(prev ?? []), newTask]);
            return newTask;
    });

    /** Изменить */ 
    const updateTask = (id, taskId, startTime, endTime) =>
        execute(async () => {
            const response = await api.UpdateScheduledTask(id, taskId, startTime, endTime);
            setScheduledTasks((prev) =>
                (prev ?? []).map((task) =>
                    task?.id === id ? { ...task, taskId, startTime, endTime } : task
                )
            );
            return response;
    });

    /** Удалить */ 
    const deleteTask = (id) => 
        execute(async () => {
            const response = await api.DeleteScheduledTask(id);
            setScheduledTasks((prev) => (prev ?? []).filter((task) => task?.id !== id));
            return response;
    });

    return {
        loading,
        error,
        userScheduledTasks,
        getTask,
        getUserTasks,
        createTask,
        updateTask,
        deleteTask,
    };
};
