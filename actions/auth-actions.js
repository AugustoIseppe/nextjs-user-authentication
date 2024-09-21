'use server';

// Essa função é chamada no arquivo components/auth-form.js e deve ser passada como argumento para a função useFormState
export async function signup(prevState, formData) {
    const email = formData.get('email'); // o nome e-mail vem do input do formulário atraves do atributo name (name="email")
    const password = formData.get('password'); // o nome password vem do input do formulário atraves do atributo name (name="password")

    //validar os dados do formulário
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
    //create a new user
    
}