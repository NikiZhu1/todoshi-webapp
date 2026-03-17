import { Card, message } from 'antd';
import { useNavigate } from 'react-router-dom';

// Методы
import { useUsers } from '../Hooks/useUsers.jsx';
import { useTimePlans } from '../Hooks/useTimePlans.jsx';

// Компоненты
import AuthForm from '../Components/AuthForm.jsx';

function Register() {
    const navigate = useNavigate();
    const { loading, registerUser } = useUsers();
    const { createPlan } = useTimePlans();

    // Регистрация
    const onFinish = async (values) => {
        try {
            // Проверяем совпадение паролей
            if (values.password !== values.confirmPassword) {
                message.error('Пароли не совпадают!');
                return;
            }

            await registerUser(values);
            await createPlan('Любое время', true);
            
            message.success(`Добро пожаловать, ${values.username}!`);
            
            // Перенаправляем на страницу первичной настройки дня
            navigate('/day-setup');
        } catch (error) {
            console.error('Ошибка регистрации:', error);
            
            let errorMessage = 'Ошибка регистрации';
            
            if (error.response?.status === 400) {
                errorMessage = error.response.data?.message || 'Пользователь с таким именем уже существует';
            } else if (error.response?.status === 409) {
                errorMessage = 'Пользователь с таким именем уже существует';
            }
            
            message.error(errorMessage);
        }
    };

    const pageStyle = {
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #171717 0%, #0f0f0f 58%, #2e2e2e 100%)',
    };

    const shellStyle = {
        width: '100%',
        maxWidth: 980,
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 24,
    };

    const heroStyle = {
        color: '#f5f5f5',
        maxWidth: 430,
    };

    const badgeStyle = {
        display: 'inline-block',
        padding: '6px 12px',
        borderRadius: 999,
        background: '#2a2a2a',
        color: '#d9d9d9',
        fontSize: 12,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
    };

    const titleStyle = {
        color: '#ffffff',
        margin: '16px 0 10px',
        lineHeight: 1.1,
    };

    const textStyle = {
        margin: 0,
        color: '#bfbfbf',
        lineHeight: 1.5,
    };

    const cardStyle = {
        width: '100%',
        maxWidth: 430,
        borderRadius: 14,
        border: '1px solid #3a3a3a',
        boxShadow: '0 18px 45px rgba(0, 0, 0, 0.35)',
    };

    return (
        <div style={pageStyle}>
            <div style={shellStyle}>
                <section style={heroStyle}>
                    <span style={badgeStyle}>TodoShi</span>
                    <h1 style={titleStyle}>Распределяйте свои задачи автоматически</h1>
                    <p style={textStyle}>
                        Быстрая регистрация и после зададим несколько вопросов для лёгкого начала.
                    </p>
                </section>
                <Card style={cardStyle}>
                    <AuthForm 
                        title="Регистрация"
                        subtitle="Создайте профиль для работы"
                        onFinish={onFinish}
                        buttonText="Зарегистрироваться" 
                        linkText="Уже есть аккаунт? Войти" 
                        linkTo="/login"
                        isRegistration={true}
                        loading={loading}
                    />
                </Card>
            </div> 
        </div>
    );
}

export default Register;
