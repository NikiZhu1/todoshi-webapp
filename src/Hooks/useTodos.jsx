import { useState } from 'react';
import * as api from '../API Methods/todoMethods.jsx'; 

export const useTodos = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [userTodos, setUserTodos] = useState();

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
    const getTodo = (id) => 
        execute(async () => {
            const todoData = await api.GetTodo(id);
            return todoData;
    });

    /** Получить задачи пользователя */ 
    const getUserTodos = (userId) =>
        execute(async () => {
            const todoData = await api.GetUserTodos(userId);
            setUserTodos(todoData);
            return todoData;
    });

    /** Создать */ 
    const createTodo = (todoData) => 
        execute(async () => {
            const newTodo = await api.AddTodo(todoData);
            setUserTodos(prev => [...(prev ?? []), newTodo]);
            return newTodo;
    });

    /** Изменить */ 
    const updateTodo = (id, newTodoData) =>
        execute(async () => {
            const response = await api.UpdateTodo(id, newTodoData);
            setUserTodos((prev) =>
                (prev ?? []).map((todo) =>
                    todo?.id === id ? { ...todo, ...newTodoData } : todo
                )
            );
            return response;
    });

    /** Удалить */ 
    const deleteTodo = (id) => 
        execute(async () => {
            const responce = await api.DeleteTodo(id);
            setUserTodos((prev) => (prev ?? []).filter((todo) => todo?.id !== id));
            return responce;
    });

    /** План */ 
    const planTodo = async (calendarEvents) => 
        execute(async () => {
            const response = await api.Plan('Asia/Yekaterinburg', calendarEvents);
            return response;
    });

    const planTodos = planTodo;


    return {
        loading,
        error,
        userTodos,
        getTodo,
        getUserTodos,
        createTodo,
        updateTodo,
        deleteTodo,
        planTodo,
        planTodos,
    };
};
