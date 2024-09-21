import { redirect } from 'next/navigation';

import { verifyAuth } from '@/lib/auth';
import { getTrainings } from '@/lib/training';

export default async function TrainingPage() {
  //antes de qualquer coisa, eu devo usar a função verifyAuth() para verificar se o usuário está logado
  //se não estiver logado, eu redireciono ele para a página de login
  //se estiver logado, eu continuo com o código normalmente
  const result = await verifyAuth();

  if(!result.user){
    return redirect('/');
  }


  const trainingSessions = getTrainings();

  return (
    <main>
      <h1>Find your favorite activity</h1>
      <ul id="training-sessions">
        {trainingSessions.map((training) => (
          <li key={training.id}>
            <img src={`/trainings/${training.image}`} alt={training.title} />
            <div>
              <h2>{training.title}</h2>
              <p>{training.description}</p>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
