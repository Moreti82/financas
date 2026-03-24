import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X, Home, Plus, Settings, LogOut, Shield, Moon, Sun } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useUserProfile } from '../hooks/useUserProfile';

interface MobileMenuProps {
  darkMode: boolean;
  setDarkMode: (mode: boolean) => void;
}

export function MobileMenu({ darkMode, setDarkMode }: MobileMenuProps) {
  const { user, signOut } = useAuth();
  const { isAdmin } = useUserProfile();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { icon: Home, label: 'Dashboard', href: '/' },
    { icon: Plus, label: 'Nova Transação', href: '#', action: 'transaction' },
    { icon: Settings, label: 'Configurações', href: '#', action: 'settings' },
  ];

  if (isAdmin) {
    menuItems.push({ icon: Shield, label: 'Admin', href: '/admin' });
  }

  menuItems.push({ icon: LogOut, label: 'Sair', href: '#', action: 'logout' });

  const handleItemClick = (item: any) => {
    setIsOpen(false);
    
    if (item.action === 'logout') {
      signOut();
    } else if (item.action === 'transaction') {
      // Trigger transaction modal
      document.getElementById('new-transaction-btn')?.click();
    } else if (item.href && item.href !== '#') {
      navigate(item.href);
    }
  };

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`lg:hidden p-2 ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-white text-slate-600'} rounded-lg border ${darkMode ? 'border-gray-600' : 'border-slate-200'} hover:shadow-md transition-all`}
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu Panel */}
          <div className={`fixed right-0 top-0 h-full w-72 ${darkMode ? 'bg-slate-900' : 'bg-white'} shadow-[0_0_60px_rgba(0,0,0,0.4)] transform transition-transform duration-300 border-l ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
            {/* Header */}
            <div className={`flex items-center justify-between p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Menu</h2>
              <button
                onClick={() => setIsOpen(false)}
                className={`p-2 ${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-900'} rounded-lg`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* User Info */}
            <div className={`p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} flex items-center justify-center`}>
                  <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {user?.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'} truncate`}>
                    {user?.email}
                  </p>
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {isAdmin ? 'Administrador' : 'Usuário'}
                  </p>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <nav className="p-4 space-y-2">
              {menuItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <button
                    key={index}
                    onClick={() => handleItemClick(item)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      darkMode 
                        ? 'text-gray-300 hover:bg-gray-700' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Theme Toggle */}
            <div className={`p-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  darkMode 
                    ? 'text-gray-300 hover:bg-gray-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                <span className="font-medium">
                  {darkMode ? 'Modo Claro' : 'Modo Escuro'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
