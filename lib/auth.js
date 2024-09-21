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

//cria uma sessão de autenticação para o usuário
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

//verifica se o usuário está autenticado
export async function verifyAuth(){
    //obtém o cookie de sessão
    const sessionCookie = cookies().get(lucia.sessionCookieName);

    //se não houver cookie de sessão, o usuário não está autenticado e retorna null
    if(!sessionCookie){
        return {
            user: null,
            session: null
        };
    }

    //se houver id de sessão
    const sessionId = sessionCookie.value;

    if(!sessionId){
        return {
            user: null,
            session: null
        };
    }


    //Se tiver um cookie de sessão e um ID de sessão, verifica se a sessão é válida
    const result = await lucia.validateSession(sessionId);

    try {

        if (result.session && result.session.fresh) {
            const sessionCookie = lucia.createSessionCookie(result.session.id);
            cookies().set(
                sessionCookie.name,
                sessionCookie.value,
                sessionCookie.attributes
            );
        }

        if (!result.session) {
            const sessionCookie = lucia.createSessionCookie();
            cookies().set(
                sessionCookie.name,
                sessionCookie.value,
                sessionCookie.attributes
            );
        }
    } catch (error) {

    }
    return result;
}

//encerra a sessão de autenticação do usuário
export async function destroySession(){
    const { session } = await verifyAuth();
    
    if(!session){
        return {
            error: 'Unauthorized',
        };
    }

    await lucia.invalidateSession(session.id);

    const sessionCookie = lucia.createBlankSessionCookie();
    cookies().set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes
    );
}