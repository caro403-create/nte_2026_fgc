import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { CheckCircle, Circle, Plus, Trash2, Database, AlertCircle, RefreshCw, Lock } from 'lucide-react';
import { translations } from '../utils/translations';

export default function SupabaseTodos({ lang, isLoggedIn, isBrigadista }) {
  const [todos, setTodos] = useState([]);
  const [newTodoName, setNewTodoName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUsingFallback, setIsUsingFallback] = useState(false);
  const t = translations[lang || 'es'];

  // Mock fallback data in case the user hasn't created the table in Supabase yet
  const fallbackTodos = [
    { id: 1, name: lang === 'en' ? 'Check Node 03 sensor' : 'Revisar sensor del Nodo 03', completed: false },
    { id: 2, name: lang === 'en' ? 'Calibrate CO sensor in zone C4' : 'Calibrar sensor de CO en zona C4', completed: true },
    { id: 3, name: lang === 'en' ? 'Charge reconnaissance drone batteries' : 'Cargar baterías del dron de reconocimiento', completed: false }
  ];

  async function fetchTodos() {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .order('id', { ascending: true });

      if (error) {
        if (error.code === 'PGRST205') {
          console.warn("Supabase: Table 'todos' not found. Using fallback mockup data.");
          setTodos(fallbackTodos);
          setIsUsingFallback(true);
        } else {
          throw error;
        }
      } else {
        setTodos(data || []);
        setIsUsingFallback(false);
      }
    } catch (err) {
      console.error('Error connecting to Supabase:', err);
      setError(err.message || 'Error de conexión');
      setTodos(fallbackTodos);
      setIsUsingFallback(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTodos();
  }, [lang]);

  const verifyBrigadistaPermission = () => {
    if (!isLoggedIn) return false;
    if (!isBrigadista) {
      alert(
        lang === 'en' 
          ? "Permission Denied: Editing prevention checklists is restricted to official Brigades." 
          : "Acceso denegado: La edición de tareas de prevención está restringida a brigadistas oficiales y coordinadores."
      );
      return false;
    }
    return true;
  };

  async function handleAddTodo(e) {
    e.preventDefault();
    if (!isLoggedIn) return;
    if (!verifyBrigadistaPermission()) return;
    if (!newTodoName.trim()) return;

    if (isUsingFallback) {
      const newLocalTodo = {
        id: Date.now(),
        name: newTodoName,
        completed: false
      };
      setTodos([...todos, newLocalTodo]);
      setNewTodoName('');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('todos')
        .insert([{ name: newTodoName }])
        .select();

      if (error) throw error;
      if (data) {
        setTodos([...todos, ...data]);
      }
      setNewTodoName('');
    } catch (err) {
      alert('Error: ' + err.message);
    }
  }

  async function handleToggleTodo(id, currentCompleted) {
    if (!isLoggedIn) return;
    if (!verifyBrigadistaPermission()) return;

    if (isUsingFallback) {
      setTodos(todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
      return;
    }

    try {
      const { error } = await supabase
        .from('todos')
        .update({ completed: !currentCompleted })
        .eq('id', id);

      if (error) {
        const { error: deleteError } = await supabase
          .from('todos')
          .delete()
          .eq('id', id);
        if (deleteError) throw deleteError;
        setTodos(todos.filter(t => t.id !== id));
      } else {
        setTodos(todos.map(t => t.id === id ? { ...t, completed: !currentCompleted } : t));
      }
    } catch (err) {
      console.error(err);
      setTodos(todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    }
  }

  async function handleDeleteTodo(id) {
    if (!isLoggedIn) return;
    if (!verifyBrigadistaPermission()) return;

    if (isUsingFallback) {
      setTodos(todos.filter(t => t.id !== id));
      return;
    }

    try {
      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setTodos(todos.filter(t => t.id !== id));
    } catch (err) {
      alert('Error: ' + err.message);
    }
  }

  return (
    <div className="bg-white border border-[#EEF5E9] rounded-2xl p-6 flex flex-col gap-4 shadow-[0_2px_12px_rgba(0,0,0,0.07)] text-left">
      
      {/* Title Header */}
      <div className="flex items-center justify-between border-b border-[#EEF5E9] pb-3">
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5 text-[#2D6A4F]" />
          <h3 className="text-md font-bold text-[#2D3436]">
            {t.todoTitle}
          </h3>
        </div>
        
        <button 
          onClick={fetchTodos}
          className="p-1 hover:bg-[#EEF5E9] rounded-full transition-colors duration-200"
          title={lang === 'en' ? "Sync with Supabase" : "Sincronizar con Supabase"}
        >
          <RefreshCw className={`h-4 w-4 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Fallback info warning */}
      {isUsingFallback && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 text-[11px] p-3 rounded-xl flex gap-2">
          <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
          <div>
            <span className="font-bold">{lang === 'en' ? 'Demo / Local Mode:' : 'Modo Demo / Local:'}</span> {t.todoDemoWarn}
          </div>
        </div>
      )}

      {/* Add Todo Form / Locked Warning */}
      {isLoggedIn ? (
        isBrigadista ? (
          <form onSubmit={handleAddTodo} className="flex gap-2">
            <input
              type="text"
              value={newTodoName}
              onChange={(e) => setNewTodoName(e.target.value)}
              placeholder={t.todoPlaceholder}
              className="flex-1 px-4 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#2D6A4F] focus:border-transparent bg-slate-50"
            />
            <button
              type="submit"
              className="bg-[#2D6A4F] hover:bg-[#1E4635] text-white p-2 rounded-xl transition-all duration-200 shadow-sm hover:shadow flex items-center justify-center shrink-0 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
            </button>
          </form>
        ) : (
          <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-xs text-slate-500 font-bold flex items-center gap-2">
            <Lock className="h-4 w-4 text-slate-400 shrink-0" />
            <span>{lang === 'en' ? "ReadOnly: Restructured for Brigades" : "Lectura: Tareas restringidas para Brigadas"}</span>
          </div>
        )
      ) : (
        <div className="bg-[#F8FAF5] border border-[#EEF5E9] p-3 rounded-xl text-center text-xs text-slate-500 font-bold flex items-center justify-center gap-2">
          <Lock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          <span>{t.todoReadOnlyWarn}</span>
        </div>
      )}

      {/* Todos List */}
      <div className="max-h-[160px] overflow-y-auto pr-1">
        {loading ? (
          <div className="text-center py-4 text-xs text-slate-400">{t.todoLoading}</div>
        ) : todos.length === 0 ? (
          <div className="text-center py-4 text-xs text-slate-400">{t.todoEmpty}</div>
        ) : (
          <ul className="flex flex-col gap-2">
            {todos.map((todo) => (
              <li
                key={todo.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-[#F8FAF5] border border-[#EEF5E9] group transition-all duration-200 hover:border-slate-300"
              >
                <div 
                  onClick={() => handleToggleTodo(todo.id, todo.completed)}
                  className={`flex items-center gap-2.5 flex-1 ${isLoggedIn && isBrigadista ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                >
                  {todo.completed ? (
                    <CheckCircle className="h-4 w-4 text-[#2D6A4F] shrink-0" />
                  ) : (
                    <Circle className="h-4 w-4 text-slate-400 shrink-0" />
                  )}
                  <span className={`text-xs ${todo.completed ? 'line-through text-slate-400' : 'text-[#2D3436] font-medium'}`}>
                    {todo.name}
                  </span>
                </div>

                {isLoggedIn && isBrigadista && (
                  <button
                    onClick={() => handleDeleteTodo(todo.id)}
                    className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all duration-200 p-1 rounded-md cursor-pointer"
                    title={lang === 'en' ? "Delete task" : "Eliminar tarea"}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
