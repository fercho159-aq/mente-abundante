import { redirect } from 'next/navigation';
import { getCurrentUser, User } from '@/lib/auth';
import AppNavbar from '@/components/AppNavbar';
import styles from './layout.module.css';

export const dynamic = 'force-dynamic';

export default async function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const user = await getCurrentUser();

    if (!user) {
        redirect('/');
    }

    return (
        <div className={styles.appContainer}>
            <AppNavbar user={user} />
            <main className={styles.main}>{children}</main>
        </div>
    );
}
