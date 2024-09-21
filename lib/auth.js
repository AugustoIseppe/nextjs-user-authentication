import { cookies } from 'next/headers';
import { Lucia } from 'lucia';
import { BetterSqlite3Adapter } from '@lucia-auth/adapter-sqlite';

import db from './db';

const adapter = new BetterSqlite3Adapter(db, {
    user: 'users', //nome da tabela de usuários do banco de dados
    session: 'sessions' //nome da tabela de sessões do banco de dados (necessário criar essa tabela)
});

if (!adapter) {
    console.error('Adapter is not initialized');
}


const lucia = new Lucia(adapter, {
    sessionCookie: {
        expires: false,
        attributes: {
            secure: process.env.NODE_ENV === 'production', // se a aplicação estiver em produção, o cookie será seguro
        }
    }
});

export async function createAuthSession(userId) {
    try {
        const session = await lucia.createSession(userId, {});
        const sessionCookie = lucia.createSessionCookie(session.id);
        cookies().set(
            sessionCookie.name,
            sessionCookie.value,
            sessionCookie.attributes
        );
        console.log('SESSION CREATED:', session);
        console.log('SESSION COOKIE CREATED:', sessionCookie);
    } catch (error) {
        console.error("Error creating session:", error);
    }
}
