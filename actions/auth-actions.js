'use server';
import { redirect } from 'next/navigation';

import { hashUserPassword, verifyPassword } from "@/lib/hash";
import { createUser, getUserByEmail } from "@/lib/user";
import { createAuthSession, destroySession } from '@/lib/auth';

// Essa função é chamada no arquivo components/auth-form.js e deve ser passada como argumento para a função useFormState
export async function signup(prevState, formData) {
    const email = formData.get('email'); // o nome e-mail vem do input do formulário atraves do atributo name (name="email")
    const password = formData.get('password'); // o nome password vem do input do formulário atraves do atributo name (name="password")

    //validar os dados do formulário:
    let errors = {};

    if (!email.includes('@')) {
        errors.email = 'Please enter a valid email';
    }

    if (password.trim().length < 8) {
        errors.password = 'Password must be at least 8 characters';
    }

    if (Object.keys(errors).length > 0) {
        return { errors: errors };
    }

    //hash da senha do usuário: a funcao hashUserPassword está no arquivo lib/hash.js
    const hashedPassword = hashUserPassword(password);

    //create a new user:
    try {
        const id = await createUser(email, hashedPassword);
        console.log('User created with id:', id);
        //cria uma sessão de autenticação para o usuário recém-criado
        await createAuthSession(id);


        //após criar o usuário com sucesso, redireciona para a página de treinos
        redirect('/training'); //redireciona para a página inicial
    } catch (error) {
        if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            return {
                errors: {
                    email: 'Email already in use'
                }
            };
        }
        throw error;
    }
}

export async function login(prevState, formData){
    const email = formData.get('email');
    const password = formData.get('password');

    const existingUser = getUserByEmail(email);

    if (!existingUser) {
        return {
            errors: {
                email: 'Could not authenticate user, please check your credentials'
            }
        };
    }

    const isValidPassword = verifyPassword(existingUser.password, password);

    if (!isValidPassword) {
        return {
            errors: {
                password: 'Could not authenticate user, please check your credentials'
            }
        };
    }

    //cria uma sessão de autenticação para o usuário recém-logado
    await createAuthSession(existingUser.id);

    //após criar o usuário com sucesso, redireciona para a página de treinos
    redirect('/training'); //redireciona para a página inicial
}

export async function auth(mode, prevState, formData){
    if (mode === 'login') {
        return login(prevState, formData);
    } else if (mode === 'signup') {
        return signup(prevState, formData);
    }
}

export async function logout(){
    await destroySession();
    redirect('/'); //redireciona para a página inicial
}