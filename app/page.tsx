import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import LoginForm from '@/components/LoginForm';

export const metadata = {
    title: 'Iniciar Sesión | Mente Abundante',
    description: 'Accede a tu cuenta para comenzar tu transformación personal',
};

export default async function LoginPage() {
    // If already logged in, redirect to app
    const user = await getCurrentUser();
    if (user) {
        redirect('/app');
    }

    return <LoginForm />;
}
