import { User } from '@/database/models/index';

declare module 'express-session' {
    interface SessionData {
        user: {
            id: User['id'];
            roleSpecificId: User['id'];
            email: User['email'];
            role: User['role'];
            enabled2FA: boolean;
            validated2FA: boolean;
            secretFor2FA?: string | null;
        };
    }
}
