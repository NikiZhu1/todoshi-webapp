import { message } from 'antd';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

// Методы
import { useUsers } from '../Hooks/useUsers.jsx';

// Компоненты
import AuthForm from '../Components/AuthForm.jsx';

function Login() {
    const navigate = useNavigate();
    const { loading, loginUser} = useUsers();

    // Авторизация
    const onFinish = async (values) => {
        try {
            console.log(values)
            await loginUser(values, false);
            
            let username = values?.username || 'Пользователь';
            message.success(`Снова здравствуйте, ${username}!`);
            
            // Перенаправляем на главную страницу
            navigate('/');
        } catch (error) {
            console.error('Ошибка входа:', error);
            message.error(error.response?.data?.message || 'Неверный логин или пароль');
        }
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '20px'
        }}>
            <div style={{
                width: '100%',
                maxWidth: 400,
                background: 'white',
                padding: 40,
                borderRadius: 12,
                boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            }}>
                <AuthForm
                    title="Авторизация"
                    onFinish={onFinish}
                    buttonText="Войти"
                    linkText="Нет аккаунта? Зарегистрироваться"
                    linkTo="/register"
                    loading={loading}
                />
            </div>
        </div>
    );
}

export default Login;