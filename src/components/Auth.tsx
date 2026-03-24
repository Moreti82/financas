import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { DollarSign, AlertCircle, Check } from 'lucide-react';

const EMOJI_AVATARS = [
  { emoji: '💀', bg: 'fca5a5' },
  { emoji: '❤️', bg: 'f9a8d4' },
  { emoji: '🐶', bg: 'fde047' },
  { emoji: '🚀', bg: '6ee7b7' },
  { emoji: '🐱', bg: '93c5fd' },
  { emoji: '👽', bg: 'd8b4fe' },
  { emoji: '🔥', bg: 'ffedd5' },
  { emoji: '🤖', bg: 'e5e7eb' }
].map(({ emoji, bg }) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" fill="#${bg}" rx="50"/>
  <text x="50%" y="54%" font-size="55" dominant-baseline="middle" text-anchor="middle">${emoji}</text>
</svg>
`)}`.trim());

const MALE_AVATARS = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=b6e3f4',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Jack&backgroundColor=c0aede',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Oliver&backgroundColor=d1d4f9',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Liam&backgroundColor=ffb6b9',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Noah&backgroundColor=b6e3f4'
];

const FEMALE_AVATARS = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Mia&backgroundColor=ffdfbf',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Sophia&backgroundColor=f4d150',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Avery&backgroundColor=b6e3f4',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma&backgroundColor=d1d4f9',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Isabella&backgroundColor=ffdfbf'
];

const ALL_AVATARS = [...MALE_AVATARS, ...FEMALE_AVATARS, ...EMOJI_AVATARS];

export function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState<string>('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, signInWithGoogle } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!isLogin && !selectedAvatar) {
      setError('Por favor, escolha um avatar para o seu perfil.');
      return;
    }
    
    setLoading(true);

    try {
      const { error } = await (isLogin ? signIn(email, password) : signUp(email, password));

      if (error) {
        setError(error.message);
      } else if (!isLogin) {
        if (selectedAvatar) {
          // Save avatar locally tied to the user email
          localStorage.setItem(`avatar_${email}`, selectedAvatar);
        }
        
        // Limpar os campos do formulário e voltar para aba login
        setEmail('');
        setPassword('');
        setSelectedAvatar('');
        setIsLogin(true); // Volta para aba 'Entrar'
      }
    } catch (err) {
      setError('Ocorreu um erro. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full my-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4 shadow-lg shadow-blue-600/30">
            <DollarSign className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">FinançasPro</h1>
          <p className="text-slate-600">Gerencie suas finanças com inteligência</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
          <div className="flex gap-2 mb-6 p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2.5 px-4 rounded-lg font-medium transition-all ${
                isLogin
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2.5 px-4 rounded-lg font-medium transition-all ${
                !isLogin
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Registrar
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <label className="block text-sm font-medium text-slate-700 mb-4 text-center">
                  Escolha o seu Avatar
                </label>
                
                {/* Visualizador do Avatar Selecionado Centralizado */}
                {selectedAvatar && (
                   <div className="flex justify-center mb-6 animate-in zoom-in duration-300">
                     <div className="relative w-24 h-24 rounded-full ring-4 ring-blue-500 shadow-xl shadow-blue-500/30">
                       <img src={selectedAvatar} alt="Selecionado" className="w-full h-full rounded-full" />
                       <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1.5 border-2 border-white">
                         <Check className="w-4 h-4 text-white" />
                       </div>
                     </div>
                   </div>
                )}
                
                <div className="grid grid-cols-6 gap-2 sm:gap-3 px-2 pb-4">
                  {ALL_AVATARS.map((avatar, idx) => {
                    const isSelected = selectedAvatar === avatar;
                    return (
                      <button
                        key={`avatar-${idx}`}
                        type="button"
                        onClick={() => setSelectedAvatar(avatar)}
                        className={`relative rounded-full aspect-square transition-all duration-300 ease-out flex items-center justify-center
                          ${isSelected 
                            ? 'scale-125 z-20 shadow-lg ring-2 ring-blue-500 ring-offset-2 opacity-100' 
                            : 'scale-90 hover:scale-110 opacity-60 hover:opacity-100 z-10 hover:ring-2 ring-slate-200'
                          }
                        `}
                      >
                        <img 
                          src={avatar} 
                          alt={`Avatar ${idx + 1}`} 
                          className="w-full h-full rounded-full pointer-events-none" 
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400 bg-slate-50"
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                Senha
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400 bg-slate-50"
                placeholder="••••••"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-600/30 hover:shadow-xl hover:shadow-blue-600/40 hover:-translate-y-0.5 active:translate-y-0"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Processando...</span>
                </div>
              ) : (
                isLogin ? 'Entrar no Sistema' : 'Criar minha conta'
              )}
            </button>
          </form>

          <div className="mt-6 flex items-center mb-6">
            <div className="flex-1 border-t border-slate-200"></div>
            <span className="px-3 text-sm text-slate-400 font-medium">OU</span>
            <div className="flex-1 border-t border-slate-200"></div>
          </div>

          <button
            type="button"
            onClick={async () => {
              setLoading(true);
              try {
                const { error: googleError } = await signInWithGoogle();
                if (googleError) setError(googleError.message);
              } catch (err) {
                setError('Um erro inesperado ocorreu no login do Google.');
              } finally {
                setLoading(false);
              }
            }}
            disabled={loading}
            className="w-full py-3.5 px-4 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium rounded-xl transition-all shadow-sm flex items-center justify-center gap-3 active:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              <path d="M1 1h22v22H1z" fill="none"/>
            </svg>
            Entrar com Google
          </button>
        </div>
        
        <p className="text-center mt-8 text-sm text-slate-500">
          FinançasPro © 2024. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
}
