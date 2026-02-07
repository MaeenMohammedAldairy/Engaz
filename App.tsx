
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Todo, FilterType, Priority, Category, SortType } from './types';

const Icons = {
  Work: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  Personal: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  Study: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
  Other: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-7.714 2.143L11 21l-2.286-6.857L1 12l7.714-2.143L11 3z" />
    </svg>
  ),
};

const CATEGORIES: { value: Category; label: string; icon: React.ReactNode; color: string }[] = [
  { value: 'Work', label: 'عمل', icon: <Icons.Work />, color: 'text-blue-600 bg-blue-50 border-blue-100' },
  { value: 'Personal', label: 'شخصي', icon: <Icons.Personal />, color: 'text-green-600 bg-green-50 border-green-100' },
  { value: 'Study', label: 'دراسة', icon: <Icons.Study />, color: 'text-purple-600 bg-purple-50 border-purple-100' },
  { value: 'Other', label: 'أخرى', icon: <Icons.Other />, color: 'text-slate-600 bg-slate-50 border-slate-100' },
];

const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>(() => {
    const saved = localStorage.getItem('todos_v2');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [inputValue, setInputValue] = useState('');
  const [inputPriority, setInputPriority] = useState<Priority>('Medium');
  const [inputCategory, setInputCategory] = useState<Category>('Work');
  const [filter, setFilter] = useState<FilterType>('All');
  const [sortBy, setSortBy] = useState<SortType>('Newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.setItem('todos_v2', JSON.stringify(todos));
  }, [todos]);

  const addTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    const newTodo: Todo = {
      id: crypto.randomUUID(),
      text: inputValue,
      completed: false,
      priority: inputPriority,
      category: inputCategory,
      createdAt: Date.now(),
    };
    setTodos([newTodo, ...todos]);
    setInputValue('');
  };

  const deleteTodo = (id: string) => setTodos(todos.filter(t => t.id !== id));
  const toggleTodo = (id: string) => setTodos(todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  const clearCompleted = () => setTodos(todos.filter(t => !t.completed));

  const filteredAndSortedTodos = useMemo(() => {
    let result = todos.filter(t => {
      const matchesFilter = filter === 'All' || (filter === 'Active' ? !t.completed : t.completed);
      const matchesSearch = t.text.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });

    if (sortBy === 'Priority') {
      const priorityMap = { High: 3, Medium: 2, Low: 1 };
      result.sort((a, b) => priorityMap[b.priority] - priorityMap[a.priority]);
    } else {
      result.sort((a, b) => b.createdAt - a.createdAt);
    }
    return result;
  }, [todos, filter, searchQuery, sortBy]);

  const stats = {
    total: todos.length,
    completed: todos.filter(t => t.completed).length,
    percent: todos.length ? Math.round((todos.filter(t => t.completed).length / todos.length) * 100) : 0
  };

  const focusInput = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => inputRef.current?.focus(), 300);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-24 md:pb-12 px-4 font-['Tajawal'] antialiased">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Sticky Header */}
        <header className="sticky top-0 z-40 bg-[#f8fafc]/90 backdrop-blur-lg pt-8 pb-4 transition-all">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-right">
              <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 flex items-center gap-3">
                <span className="bg-clip-text text-transparent bg-gradient-to-l from-indigo-600 to-violet-600">إنجاز Pro</span>
              </h1>
              <p className="text-slate-500 font-medium mt-1 text-sm">نظّم مهامك، حقق أهدافك</p>
            </div>
            
            <div className="flex items-center gap-4 bg-white/80 p-2.5 rounded-2xl border border-white shadow-xl shadow-slate-200/50">
              <div className="text-left px-2 border-r border-slate-100 pr-4">
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">الإنجاز</p>
                <p className="text-2xl font-black text-indigo-600 leading-none">{stats.percent}%</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 shadow-lg shadow-indigo-200 flex items-center justify-center text-white shrink-0">
                 <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                 </svg>
              </div>
            </div>
          </div>
        </header>

        {/* Input Section */}
        <section id="add-task" className="bg-white rounded-[2.5rem] p-5 md:p-8 shadow-sm border border-slate-100 ring-1 ring-slate-200/50">
          <form onSubmit={addTodo} className="space-y-5">
            <div className="relative group">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="ما هي المهمة القادمة؟"
                className="w-full bg-slate-50 border-2 border-transparent rounded-2xl px-6 py-3.5 md:py-4 outline-none focus:border-indigo-100 focus:bg-white focus:ring-4 focus:ring-indigo-50/50 text-base md:text-lg transition-all pr-14 text-right"
              />
              <div className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex-1 flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide no-scrollbar -mx-2 px-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setInputCategory(cat.value)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border-2 ${
                      inputCategory === cat.value 
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-sm' 
                        : 'border-transparent bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600'
                    }`}
                  >
                    <span className={inputCategory === cat.value ? 'text-indigo-600' : 'text-slate-400'}>
                      {cat.icon}
                    </span>
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>
              
              <div className="flex items-center gap-2 w-full md:w-auto">
                <select 
                  value={inputPriority}
                  onChange={(e) => setInputPriority(e.target.value as Priority)}
                  className="flex-1 md:flex-none bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-xs font-bold outline-none cursor-pointer text-slate-600 transition-colors hover:bg-slate-100"
                >
                  <option value="Low">منخفضة</option>
                  <option value="Medium">متوسطة</option>
                  <option value="High">عالية</option>
                </select>
                <button 
                  type="submit"
                  disabled={!inputValue.trim()}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white h-11 px-6 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100 transition-all active:scale-95 whitespace-nowrap"
                >
                  <span className="font-bold ml-2">إضافة</span>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
            </div>
          </form>
        </section>

        {/* Desktop Controls */}
        <div className="hidden md:flex bg-white/80 backdrop-blur-md p-4 rounded-3xl border border-white gap-4 items-center shadow-sm">
          <div className="relative flex-1">
            <input 
              type="text" 
              placeholder="ابحث في مهامك..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-100 rounded-2xl py-2.5 px-12 outline-none focus:ring-4 focus:ring-indigo-50 transition-all text-sm text-right"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          <div className="flex gap-2">
            <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value as FilterType)}
              className="bg-white border border-slate-100 rounded-xl px-4 py-2 text-xs font-bold outline-none cursor-pointer"
            >
              <option value="All">الكل</option>
              <option value="Active">النشطة</option>
              <option value="Completed">المكتملة</option>
            </select>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value as SortType)}
              className="bg-white border border-slate-100 rounded-xl px-4 py-2 text-xs font-bold outline-none cursor-pointer"
            >
              <option value="Newest">الأحدث</option>
              <option value="Priority">الأولوية</option>
            </select>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden relative px-1">
          <input 
            type="text" 
            placeholder="ابحث..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-100 rounded-2xl py-3 px-12 outline-none text-sm text-right shadow-sm focus:ring-4 focus:ring-indigo-50 transition-all"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
             <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
          </div>
        </div>

        {/* List Content */}
        <div className="space-y-3 pb-8">
          {filteredAndSortedTodos.length > 0 ? (
            filteredAndSortedTodos.map((todo) => {
              const category = CATEGORIES.find(c => c.value === todo.category) || CATEGORIES[3];
              return (
                <div 
                  key={todo.id}
                  className={`group bg-white rounded-3xl p-4 md:p-5 flex items-center gap-4 border border-transparent shadow-sm hover:shadow-xl hover:shadow-indigo-50/30 transition-all duration-300 ${todo.completed ? 'opacity-50 bg-slate-50/50' : 'hover:scale-[1.01]'}`}
                >
                  <button 
                    onClick={() => toggleTodo(todo.id)}
                    className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all shrink-0 ${
                      todo.completed ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-200 hover:border-indigo-400 bg-white shadow-sm'
                    }`}
                  >
                    {todo.completed && (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>

                  <div className="flex-1 min-w-0 text-right">
                    {editingId === todo.id ? (
                      <input
                        autoFocus
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        onBlur={() => {
                          setTodos(todos.map(t => t.id === todo.id ? { ...t, text: editingText } : t));
                          setEditingId(null);
                        }}
                        onKeyDown={(e) => e.key === 'Enter' && setEditingId(null)}
                        className="w-full bg-slate-50 border-2 border-indigo-100 rounded-xl px-3 py-1.5 outline-none text-slate-800 font-medium"
                      />
                    ) : (
                      <div className="flex flex-col gap-1.5">
                        <span className={`text-sm md:text-base font-bold truncate transition-all ${todo.completed ? 'line-through text-slate-400 italic' : 'text-slate-800'}`}>
                          {todo.text}
                        </span>
                        <div className="flex items-center justify-end gap-2">
                          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase border ${category.color}`}>
                            {category.icon}
                            <span>{category.label}</span>
                          </div>
                          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase ${
                            todo.priority === 'High' ? 'bg-rose-50 text-rose-600 border-rose-100' : todo.priority === 'Medium' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-sky-50 text-sky-600 border-sky-100'
                          } border`}>
                            {todo.priority === 'High' ? 'عالية' : todo.priority === 'Medium' ? 'متوسطة' : 'منخفضة'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => { setEditingId(todo.id); setEditingText(todo.text); }}
                      className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button 
                      onClick={() => deleteTodo(todo.id)}
                      className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="bg-white/40 border-2 border-dashed border-slate-200 rounded-[3rem] py-16 md:py-20 text-center space-y-5">
              <div className="bg-white w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center mx-auto shadow-xl shadow-slate-200/50 text-slate-300">
                <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="px-6">
                <h3 className="text-lg font-black text-slate-600">لا يوجد مهام حالياً</h3>
                <p className="text-slate-400 mt-2 max-w-[240px] mx-auto text-xs leading-relaxed">سجل إنجازاتك الصغيرة لتكبر يوماً بعد يوم.</p>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Bottom Navigation */}
        <nav className="md:hidden fixed bottom-6 left-6 right-6 z-50">
          <div className="bg-white/95 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl shadow-indigo-300/40 border border-white p-2.5 flex items-center justify-between h-18">
            <button 
              onClick={() => setFilter('All')}
              className={`flex-1 flex flex-col items-center gap-1 transition-all py-1 rounded-2xl ${filter === 'All' ? 'text-indigo-600 bg-indigo-50/50' : 'text-slate-400'}`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
              <span className="text-[9px] font-black">الكل</span>
            </button>
            <button 
              onClick={() => setFilter('Active')}
              className={`flex-1 flex flex-col items-center gap-1 transition-all py-1 rounded-2xl ${filter === 'Active' ? 'text-indigo-600 bg-indigo-50/50' : 'text-slate-400'}`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-[9px] font-black">نشط</span>
            </button>

            {/* Central Add Circle */}
            <button 
              onClick={focusInput}
              className="w-14 h-14 bg-gradient-to-tr from-indigo-600 to-violet-700 rounded-full shadow-lg shadow-indigo-300 flex items-center justify-center text-white -translate-y-5 border-4 border-[#f8fafc] active:scale-90 transition-all"
            >
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>

            <button 
              onClick={() => setFilter('Completed')}
              className={`flex-1 flex flex-col items-center gap-1 transition-all py-1 rounded-2xl ${filter === 'Completed' ? 'text-indigo-600 bg-indigo-50/50' : 'text-slate-400'}`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-[9px] font-black">تم</span>
            </button>
            <button 
              onClick={() => setSortBy(prev => prev === 'Newest' ? 'Priority' : 'Newest')}
              className={`flex-1 flex flex-col items-center gap-1 transition-all py-1 rounded-2xl ${sortBy === 'Priority' ? 'text-violet-600' : 'text-slate-400'}`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
              </svg>
              <span className="text-[9px] font-black">ترتيب</span>
            </button>
          </div>
        </nav>

        <footer className="text-center pt-8 pb-12 opacity-30 hidden md:block select-none">
          <p className="text-slate-400 text-xs font-bold tracking-[0.2em] uppercase">إنجاز Pro • Premium Productivity</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
