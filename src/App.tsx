import React, { useState, useEffect, useRef } from 'react';
import { ShoppingCart, User, Search, MessageSquare, X, Plus, Minus, Send, Package, CreditCard, Calendar, BarChart3, Settings, Truck, Store } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import MarketScene from './components/MarketScene';
import { useCartStore } from './store/useCartStore';
import { getShoppingAssistantResponse, getProductSuggestions } from './lib/gemini';
import { auth, db } from './lib/firebase';
import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [view, setView] = useState<'store' | 'admin'>('store');
  const [adminTab, setAdminTab] = useState<'overview' | 'products' | 'partners' | 'orders'>('overview');
  const [adminOrders, setAdminOrders] = useState([
    { id: '#8492', user: 'João Silva (Apto 102)', partner: 'Padaria Central', status: 'Em Separação', driver: 'Carlos M.', items: ['Pão Francês (10)', 'Leite Integral (2)'], total: 'R$ 15,00' },
    { id: '#8491', user: 'Maria Oliveira (Apto 405)', partner: 'Silva Mercado', status: 'Pronto', driver: 'Ana P.', items: ['Arroz Tio João (1)', 'Feijão Camil (2)'], total: 'R$ 42,50' },
    { id: '#8490', user: 'Pedro Santos (Apto 1201)', partner: 'Horti Vila', status: 'Entregue', driver: 'Carlos M.', items: ['Banana Nanica (1kg)', 'Maçã Gala (500g)'], total: 'R$ 12,80' },
  ]);
  const [selectedAdminOrder, setSelectedAdminOrder] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [notifications, setNotifications] = useState<{id: string, message: string, type: 'success' | 'error'}[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [chatMessages, setChatMessages] = useState<{id: string, role: string, content: string}[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);

  const { items, addItem, removeItem, updateQuantity, total, clearCart } = useCartStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        // Check if admin (for demo, we use the user email)
        const isUserAdmin = u.email === 'limadan389@gmail.com';
        setIsAdmin(isUserAdmin);

        const userRef = doc(db, 'users', u.uid);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) {
          await setDoc(userRef, {
            uid: u.uid,
            displayName: u.displayName,
            email: u.email,
            photoURL: u.photoURL,
            role: isUserAdmin ? 'admin' : 'customer',
            createdAt: serverTimestamp()
          });
        }
      } else {
        setIsAdmin(false);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (items.length > 0) {
      const fetchSuggestions = async () => {
        const productNames = items.map(i => i.name);
        const res = await getProductSuggestions(productNames);
        setSuggestions(res);
      };
      fetchSuggestions();
    } else {
      setSuggestions([]);
    }
  }, [items]);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;
    const userMsgId = Math.random().toString(36).substr(2, 9) + Date.now();
    const newMsg = { id: userMsgId, role: 'user', content: chatInput };
    setChatMessages(prev => [...prev, newMsg]);
    setChatInput('');
    setIsTyping(true);

    const history = chatMessages.map(m => ({
      role: m.role,
      parts: [{ text: m.content }]
    }));

    const response = await getShoppingAssistantResponse(chatInput, history);
    const modelMsgId = Math.random().toString(36).substr(2, 9) + Date.now();
    setChatMessages(prev => [...prev, { id: modelMsgId, role: 'model', content: response || '' }]);
    setIsTyping(false);
  };

  const addNotification = (message: string, type: 'success' | 'error' = 'success') => {
    const id = Math.random().toString(36).substr(2, 9) + Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden font-sans bg-slate-950 text-white">
      {/* Header */}
      <header className="absolute top-0 left-0 w-full z-50 p-4 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-xl">S</div>
          <h1 className="text-xl font-bold tracking-tight hidden sm:block">SuperMercado 3D</h1>
        </div>

        <div className="flex items-center gap-2">
          <nav className="flex bg-white/5 backdrop-blur-md rounded-full p-1 mr-4 border border-white/10">
            <button 
              onClick={() => setView('store')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${view === 'store' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              <Store size={14} /> Loja
            </button>
            {isAdmin && (
              <button 
                onClick={() => setView('admin')}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${view === 'admin' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                <BarChart3 size={14} /> Gestão
              </button>
            )}
          </nav>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsAssistantOpen(true)}
              className="p-2 hover:bg-white/10 rounded-full transition-colors relative"
            >
              <MessageSquare size={22} />
            </button>
            
            <button 
              onClick={() => setIsCartOpen(true)}
              className="p-2 hover:bg-white/10 rounded-full transition-colors relative"
            >
              <ShoppingCart size={22} />
              {items.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {items.reduce((acc, i) => acc + i.quantity, 0)}
                </span>
              )}
            </button>

            {user ? (
              <div className="flex items-center gap-2 bg-white/10 p-1 pr-3 rounded-full border border-white/10">
                <img src={user.photoURL || ''} alt="" className="w-7 h-7 rounded-full" referrerPolicy="no-referrer" />
                <span className="text-xs font-medium hidden md:block">{user.displayName?.split(' ')[0]}</span>
              </div>
            ) : (
              <button 
                onClick={handleLogin}
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-full text-xs font-bold transition-all"
              >
                Entrar
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="w-full h-full">
        {view === 'store' ? (
          <MarketScene onProductSelect={setSelectedProduct} />
        ) : (
          <div className="w-full h-full pt-24 px-6 overflow-y-auto bg-slate-950">
            <div className="max-w-6xl mx-auto space-y-8 pb-12">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-3xl font-bold">Painel Administrativo</h2>
                  <p className="text-slate-400">Cérebro Central do SuperMercado Digital</p>
                </div>
                <div className="flex gap-2 bg-white/5 p-1 rounded-2xl border border-white/10">
                  {[
                    { id: 'overview', label: 'Dashboard', icon: BarChart3 },
                    { id: 'products', label: 'Produtos', icon: Package },
                    { id: 'partners', label: 'Parceiros', icon: Store },
                    { id: 'orders', label: 'Processar Pedidos', icon: Truck },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setAdminTab(tab.id as any)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${adminTab === tab.id ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                    >
                      <tab.icon size={14} /> {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {adminTab === 'overview' && (
                <div className="space-y-8">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[
                      { label: 'Vendas Totais', value: 'R$ 12.450,00', trend: '+18%', icon: CreditCard, color: 'green' },
                      { label: 'Pedidos Ativos', value: '15', trend: 'Em tempo real', icon: Package, color: 'blue' },
                      { label: 'Parceiros', value: '8', trend: '2 pendentes', icon: Store, color: 'purple' },
                      { label: 'Usuários Ativos', value: '1.240', trend: '+5%', icon: User, color: 'orange' },
                    ].map((stat) => (
                      <div key={stat.label} className="bg-white/5 border border-white/10 p-6 rounded-3xl">
                        <div className="flex justify-between items-start mb-4">
                          <div className={`p-3 rounded-2xl bg-${stat.color}-600/20 text-${stat.color}-400`}>
                            <stat.icon size={24} />
                          </div>
                          <span className="text-[10px] font-bold text-green-400 bg-green-400/10 px-2 py-1 rounded-lg">{stat.trend}</span>
                        </div>
                        <p className="text-slate-400 text-sm font-medium">{stat.label}</p>
                        <p className="text-2xl font-bold mt-1">{stat.value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white/5 border border-white/10 p-8 rounded-3xl">
                      <h3 className="text-xl font-bold mb-6">Produtos Mais Vendidos</h3>
                      <div className="space-y-4">
                        {['Pão Francês', 'Arroz Tio João', 'Coca-Cola 2L', 'Leite Integral'].map((p, i) => (
                          <div key={p} className="flex items-center justify-between p-4 bg-black/20 rounded-2xl">
                            <span className="font-medium">{p}</span>
                            <span className="text-blue-400 font-bold">{120 - i * 20} un</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="bg-white/5 border border-white/10 p-8 rounded-3xl">
                      <h3 className="text-xl font-bold mb-6">Vendas por Condomínio</h3>
                      <div className="space-y-4">
                        {['Residencial Vista Alegre', 'Edifício Horizonte', 'Condomínio das Palmeiras'].map((c) => (
                          <div key={c} className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>{c}</span>
                              <span className="font-bold">{85 - (['Residencial Vista Alegre', 'Edifício Horizonte', 'Condomínio das Palmeiras'].indexOf(c)) * 15}%</span>
                            </div>
                            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-600" style={{ width: `${85 - (['Residencial Vista Alegre', 'Edifício Horizonte', 'Condomínio das Palmeiras'].indexOf(c)) * 15}%` }}></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {adminTab === 'products' && (
                <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
                  <div className="p-6 border-b border-white/10 flex justify-between items-center">
                    <h3 className="text-xl font-bold">Catálogo de Produtos</h3>
                    <button 
                      onClick={() => setIsProductModalOpen(true)}
                      className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all"
                    >
                      <Plus size={16} /> Novo Produto
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="text-slate-500 text-xs uppercase tracking-wider border-b border-white/5">
                          <th className="px-6 py-4">Produto</th>
                          <th className="px-6 py-4">Categoria</th>
                          <th className="px-6 py-4">Preço Base</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {[
                          { name: 'Arroz Tio João', cat: 'Mercearia', price: 'R$ 28,50', status: 'Ativo' },
                          { name: 'Pão Francês', cat: 'Padaria', price: 'R$ 0,50', status: 'Ativo' },
                          { name: 'Detergente Ypê', cat: 'Limpeza', price: 'R$ 2,40', status: 'Ativo' },
                        ].map((p) => (
                          <tr key={p.name} className="hover:bg-white/5 transition-colors">
                            <td className="px-6 py-4 font-medium">{p.name}</td>
                            <td className="px-6 py-4 text-slate-400">{p.cat}</td>
                            <td className="px-6 py-4 font-bold text-blue-400">{p.price}</td>
                            <td className="px-6 py-4">
                              <span className="bg-green-500/10 text-green-500 px-2 py-1 rounded-md text-[10px] font-bold">{p.status}</span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => addNotification(`Editando ${p.name}...`)}
                                  className="p-2 hover:bg-white/10 rounded-lg text-slate-400"
                                >
                                  <Settings size={14} />
                                </button>
                                <button 
                                  onClick={() => addNotification(`${p.name} removido com sucesso`, 'error')}
                                  className="p-2 hover:bg-red-500/10 rounded-lg text-red-500"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {adminTab === 'partners' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white/5 border border-white/10 p-8 rounded-3xl">
                    <h3 className="text-xl font-bold mb-6">Solicitações Pendentes</h3>
                    <div className="space-y-4">
                      {[
                        { name: 'Padaria do Bairro', type: 'Padaria', date: 'Hoje' },
                        { name: 'Mercado Popular', type: 'Mercado', date: 'Ontem' },
                      ].map((s) => (
                        <div key={s.name} className="p-4 bg-black/20 rounded-2xl border border-white/5 flex justify-between items-center">
                          <div>
                            <p className="font-bold">{s.name}</p>
                            <p className="text-xs text-slate-500">{s.type} • {s.date}</p>
                          </div>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => addNotification(`Parceiro ${s.name} aprovado!`)}
                              className="bg-green-600 hover:bg-green-700 p-2 rounded-lg"
                            >
                              <Plus size={14} />
                            </button>
                            <button 
                              onClick={() => addNotification(`Solicitação de ${s.name} rejeitada`, 'error')}
                              className="bg-red-600 hover:bg-red-700 p-2 rounded-lg"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white/5 border border-white/10 p-8 rounded-3xl">
                    <h3 className="text-xl font-bold mb-6">Parceiros Ativos</h3>
                    <div className="space-y-4">
                      {['Padaria Central', 'Mini Mercado Silva', 'Hortifruti da Vila'].map((p) => (
                        <div key={p} className="p-4 bg-black/20 rounded-2xl border border-white/5 flex justify-between items-center">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center">🏪</div>
                            <div>
                              <p className="font-bold">{p}</p>
                              <p className="text-xs text-slate-500">Ativo há 3 meses</p>
                            </div>
                          </div>
                          <button 
                            onClick={() => addNotification(`Parceiro ${p} bloqueado temporariamente`, 'error')}
                            className="text-xs font-bold text-red-500 hover:underline"
                          >
                            Bloquear
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {adminTab === 'orders' && (
                <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
                  <div className="p-6 border-b border-white/10 flex justify-between items-center">
                    <h3 className="text-xl font-bold">Gestão de Pedidos Pendentes</h3>
                    <div className="flex gap-2">
                      <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-bold">
                        {adminOrders.filter(o => o.status !== 'Entregue').length} Pendentes
                      </span>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="text-slate-500 text-xs uppercase tracking-wider border-b border-white/5">
                          <th className="px-6 py-4">ID Pedido</th>
                          <th className="px-6 py-4">Morador</th>
                          <th className="px-6 py-4">Parceiro</th>
                          <th className="px-6 py-4">Total</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {adminOrders.map((o) => (
                          <tr key={o.id} className="hover:bg-white/5 transition-colors">
                            <td className="px-6 py-4 font-mono text-blue-400">{o.id}</td>
                            <td className="px-6 py-4 font-medium">{o.user}</td>
                            <td className="px-6 py-4 text-slate-400">{o.partner}</td>
                            <td className="px-6 py-4 text-slate-400">{o.total}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${
                                o.status === 'Entregue' ? 'bg-green-500/10 text-green-500' : 
                                o.status === 'Pronto' ? 'bg-purple-500/10 text-purple-400' :
                                'bg-blue-500/10 text-blue-400'
                              }`}>
                                {o.status}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <button 
                                onClick={() => setSelectedAdminOrder(o)}
                                className="text-xs font-bold text-blue-400 hover:underline"
                              >
                                Gerenciar
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* UI Overlays (Cart, Assistant, Modals) */}
      <AnimatePresence>
        {/* Order Processing Modal */}
        <AnimatePresence>
          {selectedAdminOrder && (
            <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedAdminOrder(null)}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-lg bg-slate-900 border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl"
              >
                <div className="p-8">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-2xl font-bold mb-1">Processar Pedido {selectedAdminOrder.id}</h3>
                      <p className="text-slate-400 text-sm">{selectedAdminOrder.user}</p>
                    </div>
                    <button 
                      onClick={() => setSelectedAdminOrder(null)}
                      className="p-2 hover:bg-white/5 rounded-full transition-colors"
                    >
                      <X size={24} />
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Itens do Pedido</h4>
                      <ul className="space-y-2">
                        {selectedAdminOrder.items.map((item: string) => (
                          <li key={item} className="text-sm flex justify-between">
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-4 pt-4 border-t border-white/5 flex justify-between font-bold">
                        <span>Total</span>
                        <span className="text-blue-400">{selectedAdminOrder.total}</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Atualizar Status</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {['Em Separação', 'Pronto', 'Em Rota', 'Entregue'].map((status) => (
                          <button
                            key={status}
                            onClick={() => {
                              setAdminOrders(prev => prev.map(o => o.id === selectedAdminOrder.id ? { ...o, status } : o));
                              setSelectedAdminOrder(null);
                              addNotification(`Pedido ${selectedAdminOrder.id} atualizado para ${status}`);
                            }}
                            className={`p-3 rounded-xl text-xs font-bold transition-all border ${
                              selectedAdminOrder.status === status 
                                ? 'bg-blue-600 border-blue-500 text-white' 
                                : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20'
                            }`}
                          >
                            {status}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                      <button
                        onClick={() => {
                          setAdminOrders(prev => prev.map(o => o.id === selectedAdminOrder.id ? { ...o, status: 'Entregue' } : o));
                          setSelectedAdminOrder(null);
                          addNotification(`Pedido ${selectedAdminOrder.id} finalizado com sucesso!`);
                        }}
                        className="flex-1 bg-green-600 hover:bg-green-500 text-white py-4 rounded-2xl font-bold transition-all shadow-lg shadow-green-600/20"
                      >
                        Finalizar Pedido
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Notifications */}
        <div className="fixed top-20 right-6 z-[200] space-y-2 pointer-events-none">
          {notifications.map(n => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              className={`p-4 rounded-2xl shadow-xl border backdrop-blur-md pointer-events-auto flex items-center gap-3 ${n.type === 'success' ? 'bg-green-500/20 border-green-500/50 text-green-400' : 'bg-red-500/20 border-red-500/50 text-red-400'}`}
            >
              <div className={`w-2 h-2 rounded-full ${n.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <p className="text-xs font-bold">{n.message}</p>
            </motion.div>
          ))}
        </div>

        {/* New Product Modal */}
        {isProductModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
              className="bg-slate-900 border border-white/10 rounded-[2.5rem] p-8 max-w-lg w-full shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Cadastrar Novo Produto</h2>
                <button onClick={() => setIsProductModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full">
                  <X size={24} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Nome do Produto</label>
                  <input type="text" placeholder="Ex: Arroz Integral" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Categoria</label>
                    <select className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 appearance-none">
                      <option>Mercearia</option>
                      <option>Padaria</option>
                      <option>Bebidas</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Preço Base</label>
                    <input type="number" placeholder="0.00" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Descrição</label>
                  <textarea placeholder="Detalhes do produto..." className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 h-24 resize-none"></textarea>
                </div>
                
                <button 
                  onClick={() => {
                    addNotification('Produto cadastrado com sucesso!');
                    setIsProductModalOpen(false);
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 py-4 rounded-2xl font-bold transition-all mt-4"
                >
                  Salvar Produto
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Product Modal (Intelligent Catalog) */}
        {selectedProduct && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
              className="bg-slate-900 border border-white/10 rounded-[2.5rem] p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-4xl font-black tracking-tighter mb-2">{selectedProduct.name}</h2>
                  <p className="text-slate-400 font-medium">Selecione a marca e variação desejada</p>
                </div>
                <button onClick={() => setSelectedProduct(null)} className="p-3 hover:bg-white/10 rounded-full transition-colors">
                  <X size={28} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {selectedProduct.brands.map((brand: any) => (
                  <div key={brand.id} className="bg-white/5 border border-white/10 rounded-3xl p-5 flex flex-col hover:border-blue-500/50 transition-all group">
                    <div className="relative aspect-square rounded-2xl overflow-hidden mb-4 bg-slate-800">
                      <img 
                        src={brand.image} 
                        alt={brand.brandName} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1">
                        ⭐ {brand.rating}
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-bold text-lg">{brand.brandName}</h3>
                        <span className="text-xs font-bold text-blue-400 bg-blue-400/10 px-2 py-1 rounded-md">{brand.weight}</span>
                      </div>
                      <p className="text-xs text-slate-500 mb-3 line-clamp-2">{brand.description}</p>
                      
                      <div className="flex items-center gap-2 mb-4 text-[10px] font-bold text-slate-400">
                        <span className="flex items-center gap-1"><Store size={10} /> {brand.market}</span>
                        <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
                        <span>🔥 {brand.popularity}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                      <span className="text-xl font-black text-white">R$ {brand.price.toFixed(2)}</span>
                      <button 
                        onClick={() => {
                          addItem({
                            id: brand.id,
                            name: `${selectedProduct.name} - ${brand.brandName} (${brand.weight})`,
                            price: brand.price,
                            quantity: 1,
                            color: selectedProduct.color
                          } as any);
                          setSelectedProduct(null);
                        }}
                        className="bg-blue-600 hover:bg-blue-700 p-3 rounded-xl transition-all shadow-lg shadow-blue-600/20"
                      >
                        <Plus size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Shopping Cart Sidebar */}
        {isCartOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 z-[110] bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              className="fixed top-0 right-0 h-full w-full max-w-md z-[120] bg-slate-900 border-l border-white/10 shadow-2xl flex flex-col"
            >
              <div className="p-6 border-bottom border-white/5 flex justify-between items-center">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <ShoppingCart size={24} /> Seu Carrinho
                </h2>
                <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-white/10 rounded-full">
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {items.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-4">
                    <Package size={64} strokeWidth={1} />
                    <p>Seu carrinho está vazio</p>
                  </div>
                ) : (
                  items.map(item => (
                    <div key={item.id} className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl">
                      <div className="w-16 h-16 rounded-xl flex items-center justify-center text-2xl" style={{ backgroundColor: (item as any).color || '#333' }}>
                        📦
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold">{item.name}</h3>
                        <p className="text-blue-400 text-sm font-medium">R$ {item.price.toFixed(2)}</p>
                      </div>
                      <div className="flex items-center gap-3 bg-black/20 p-1 rounded-lg">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1 hover:bg-white/10 rounded"><Minus size={14}/></button>
                        <span className="w-4 text-center text-sm font-bold">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1 hover:bg-white/10 rounded"><Plus size={14}/></button>
                      </div>
                    </div>
                  ))
                )}

                {suggestions.length > 0 && (
                  <div className="mt-8 pt-8 border-t border-white/5">
                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Sugestões para você</h4>
                    <div className="space-y-3">
                      {suggestions.map((s) => (
                        <div key={s.name} className="bg-blue-600/10 border border-blue-600/20 p-3 rounded-xl">
                          <p className="text-sm font-bold text-blue-400">{s.name}</p>
                          <p className="text-xs text-slate-400">{s.reason}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 bg-slate-950/50 border-t border-white/10 space-y-4">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total</span>
                  <span className="text-blue-400 text-2xl">R$ {total.toFixed(2)}</span>
                </div>
                <button 
                  disabled={items.length === 0}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all"
                >
                  <CreditCard size={20} /> Finalizar Compra
                </button>
              </div>
            </motion.div>
          </>
        )}

        {/* AI Assistant Sidebar */}
        {isAssistantOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsAssistantOpen(false)}
              className="fixed inset-0 z-[110] bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              className="fixed top-0 right-0 h-full w-full max-w-md z-[120] bg-slate-900 border-l border-white/10 shadow-2xl flex flex-col"
            >
              <div className="p-6 border-bottom border-white/5 flex justify-between items-center bg-blue-600">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <MessageSquare size={24} /> Assistente de Compras
                </h2>
                <button onClick={() => setIsAssistantOpen(false)} className="p-2 hover:bg-white/10 rounded-full">
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-950/30">
                {chatMessages.length === 0 && (
                  <div className="text-center text-slate-400 py-10">
                    <p>Olá! Sou seu assistente inteligente. Como posso ajudar com suas compras hoje?</p>
                  </div>
                )}
                {chatMessages.map((m) => (
                  <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-4 rounded-2xl ${m.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white/10 text-slate-200 rounded-tl-none'}`}>
                      <p className="text-sm whitespace-pre-wrap">{m.content}</p>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white/10 p-4 rounded-2xl rounded-tl-none animate-pulse">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                        <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                        <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 bg-slate-900 border-t border-white/10">
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Pergunte sobre produtos..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-all"
                  />
                  <button 
                    onClick={handleSendMessage}
                    className="bg-blue-600 p-3 rounded-xl hover:bg-blue-700 transition-all"
                  >
                    <Send size={20} />
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Footer / Controls Info */}
      <div className="absolute bottom-4 left-4 z-50 pointer-events-none">
        <div className="bg-black/60 backdrop-blur-md p-3 rounded-2xl border border-white/10 text-[10px] uppercase tracking-widest text-slate-400 flex gap-4">
          <div className="flex items-center gap-1"><div className="w-2 h-2 bg-blue-500 rounded-full"></div> Clique para selecionar</div>
          <div className="flex items-center gap-1"><div className="w-2 h-2 bg-green-500 rounded-full"></div> Arraste para girar</div>
        </div>
      </div>
    </div>
  );
}
