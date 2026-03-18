import { Card, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useTimePlans } from '../Hooks/useTimePlans.jsx';

// Методы
import { useUsers } from '../Hooks/useUsers.jsx';

// Компоненты
import AuthForm from '../Components/AuthForm.jsx';

function Login() {
    const navigate = useNavigate();
    const { loading, loginUser} = useUsers();
    const { createPlan } = useTimePlans();

    // Авторизация
    const onFinish = async (values) => {
        try {
            console.log(values)
            await loginUser(values, false);
            await createPlan('Любое время', true);
            
            let username = values?.username || 'Пользователь';
            message.success(`Снова здравствуйте, ${username}!`);
            
            // Перенаправляем на главную страницу
            navigate('/');
        } catch (error) {
            console.error('Ошибка входа:', error);
            message.error(error.response?.data?.message || 'Неверный логин или пароль');
        }
    };

    const pageStyle = {
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #1a1a1a 0%, #101010 55%, #2b2b2b 100%)',
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
                    <h1 style={titleStyle}>Новые задачи ждут своего распределения</h1>
                    <p style={textStyle}>
                        Легко добавляйте новые задачи и планируйте их в своём календаре.
                    </p>
                </section>
                <Card style={cardStyle}>
                    <AuthForm
                        title="Авторизация"
                        subtitle="Рады видеть вас снова"
                        onFinish={onFinish}
                        buttonText="Войти"
                        linkText="Нет аккаунта? Зарегистрироваться"
                        linkTo="/register"
                        loading={loading}
                    />
                </Card>
            </div>
        </div>
    );
}

export default Login;
