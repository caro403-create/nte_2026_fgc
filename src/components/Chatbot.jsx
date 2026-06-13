import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Flame } from 'lucide-react';

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, sender: 'bot', text: '¡Hola! Soy el asistente virtual del Sistema de Defensa Activa. ¿Tienes alguna pregunta sobre prevención de incendios o cómo usar el dashboard?' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Mock response logic based on keywords
  const generateBotResponse = (userInput) => {
    const input = userInput.toLowerCase();
    
    if (input.includes('hola') || input.includes('saludos')) {
      return "¡Hola! ¿En qué te puedo ayudar hoy?";
    }
    if (input.includes('fuego') || input.includes('incendio')) {
      return "Si reportas un incendio, presiona el botón SOS en el Panel de Emergencia. Si estás cerca, aléjate rápidamente contra la dirección del viento y busca zonas despejadas.";
    }
    if (input.includes('preven') || input.includes('evitar')) {
      return "Para prevenir incendios forestales:\n1. No hagas fogatas en época seca.\n2. No arrojes vidrio ni colillas.\n3. Mantén limpios los terrenos de maleza seca.";
    }
    if (input.includes('evacuar') || input.includes('escape')) {
      return "En caso de evacuación, mantén la calma. Usa nuestro mapa para ver las 'Rutas de Evacuación' (puntos verdes). Cúbrete boca y nariz con un paño húmedo.";
    }
    if (input.includes('sensor') || input.includes('funciona') || input.includes('dashboard')) {
      return "El sistema usa sensores IoT (miden calor, gases como CO/VOC) y satélites de la NASA. Si el nivel de riesgo ('Score') sube mucho, se activan alertas automáticas.";
    }
    
    // Default fallback
    return "Es una pregunta interesante. Como soy un asistente de demostración, mis conocimientos son limitados. Intenta preguntarme sobre prevención, evacuación o cómo funcionan los sensores.";
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const newUserMsg = { id: Date.now(), sender: 'user', text: inputValue };
    setMessages(prev => [...prev, newUserMsg]);
    setInputValue('');
    setIsTyping(true);

    // Simulate network delay
    setTimeout(() => {
      const responseText = generateBotResponse(newUserMsg.text);
      const newBotMsg = { id: Date.now() + 1, sender: 'bot', text: responseText };
      setMessages(prev => [...prev, newBotMsg]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 p-4 rounded-full bg-[#2D6A4F] text-white shadow-[0_4px_16px_rgba(45,106,79,0.4)] hover:bg-[#1E4D3A] hover:scale-105 transition-all duration-300 ${isOpen ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 opacity-100'}`}
        aria-label="Abrir asistente de incendios"
      >
        <MessageCircle className="h-7 w-7" />
        
        {/* Unread badge / pulse effect */}
        <span className="absolute top-0 right-0 flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#F4A261] border-2 border-[#2D6A4F]"></span>
        </span>
      </button>

      {/* Chat Window */}
      <div 
        className={`fixed bottom-6 right-6 z-50 w-full max-w-[360px] h-[500px] max-h-[80vh] flex flex-col bg-white border border-[#EEF5E9] rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all duration-300 origin-bottom-right ${isOpen ? 'scale-100 opacity-100' : 'scale-50 opacity-0 pointer-events-none'}`}
      >
        {/* Header */}
        <div className="bg-[#2D6A4F] text-white p-4 rounded-t-2xl flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
              <Flame className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Asistente Forestal</h3>
              <p className="text-xs text-white/80 font-medium">Guía y Prevención</p>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 bg-[#F8FAF5] custom-scrollbar flex flex-col gap-4">
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex gap-3 max-w-[85%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
            >
              {/* Avatar */}
              <div className={`shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${msg.sender === 'bot' ? 'bg-[#EEF5E9] text-[#2D6A4F]' : 'bg-[#E2E8F0] text-[#64748B]'}`}>
                {msg.sender === 'bot' ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
              </div>
              
              {/* Message Bubble */}
              <div 
                className={`p-3 rounded-2xl text-sm leading-relaxed ${
                  msg.sender === 'user' 
                    ? 'bg-[#2D6A4F] text-white rounded-tr-sm' 
                    : 'bg-white border border-[#EEF5E9] text-[#2D3436] rounded-tl-sm shadow-sm'
                }`}
                style={{ whiteSpace: 'pre-line' }}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex gap-3 max-w-[85%]">
              <div className="shrink-0 h-8 w-8 rounded-full flex items-center justify-center bg-[#EEF5E9] text-[#2D6A4F]">
                <Bot className="h-4 w-4" />
              </div>
              <div className="p-4 rounded-2xl bg-white border border-[#EEF5E9] rounded-tl-sm shadow-sm flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#52B788] animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#52B788] animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#52B788] animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-[#EEF5E9] rounded-b-2xl flex gap-2 shrink-0">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Pregunta sobre prevención..."
            className="flex-1 bg-[#F8FAF5] border border-[#EEF5E9] rounded-xl px-4 py-2 text-sm text-[#2D3436] placeholder:text-[#636E72] focus:outline-none focus:border-[#52B788] focus:ring-1 focus:ring-[#52B788] transition-all"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isTyping}
            className="p-3 rounded-xl bg-[#2D6A4F] text-white hover:bg-[#1E4D3A] disabled:opacity-50 disabled:hover:bg-[#2D6A4F] transition-colors shrink-0"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </>
  );
}
