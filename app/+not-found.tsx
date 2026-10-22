import { Redirect } from 'expo-router';

/** Qualquer rota desconhecida volta para a raiz, que decide pela sessão. */
export default function NotFound() {
  return <Redirect href="/" />;
}
