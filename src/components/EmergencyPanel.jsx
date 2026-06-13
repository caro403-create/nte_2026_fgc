import { useState } from 'react';
import { Shield, AlertTriangle, Radio, MessageSquare, Send, Satellite, Plane, Phone, MapPin, Mic, Camera, QrCode, Clock, Wifi } from 'lucide-react';

export default function EmergencyPanel({ globalScore }) {
  const [reportState, setReportState] = useState('idle'); // idle, recording, saved

  const triggerEmergency = () => {
    // Visual confirmation only for the demo
    alert('¡Alerta de emergencia activada! Notificando a todos los canales.');
  };

  const handleReport = (e) => {
    e.preventDefault();
    setReportState('saved');
    setTimeout(() => setReportState('idle'), 5000);
  };

  // Status colors based on connection state
  const statusColors = {
    online: 'bg-emerald-500',
    waiting: 'bg-amber-500',
    offline: 'bg-slate-400'
  };

  return (
    <div className="bg-white border border-[#EEF5E9] rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.07)] p-6 flex flex-col gap-6 w-full">
      
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-[#E63946] mb-1">
          <Shield className="h-6 w-6 text-[#E63946]" />
          <h2 className="text-xl font-bold text-[#2D3436]">Alerta y contacto de emergencia</h2>
        </div>
        <p className="text-sm text-[#636E72]">
          Avisa a todos los canales a la vez. El sistema prioriza los que funcionan sin internet, para que la alerta llegue aunque no haya señal.
        </p>
      </div>

      {/* SOS Button */}
      <button 
        onClick={triggerEmergency}
        className="w-full bg-[#E63946]/10 hover:bg-[#E63946]/20 border border-[#E63946]/30 rounded-2xl p-5 flex items-center justify-center gap-4 transition-colors duration-200 group"
      >
        <div className="bg-[#E63946] text-white rounded-xl p-2 group-hover:scale-110 transition-transform">
          <AlertTriangle className="h-8 w-8" />
        </div>
        <div className="text-left">
          <div className="text-[#E63946] text-xl font-bold">Activar alerta de emergencia</div>
          <div className="text-[#E63946]/80 text-sm font-medium">Notifica todos los canales disponibles al mismo tiempo</div>
        </div>
      </button>

      {/* Channels & Timeline Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-2">
        
        {/* Left Col: Channels */}
        <div className="flex flex-col gap-4">
          <h3 className="text-sm font-bold text-[#636E72]">Canales de notificación (en orden de prioridad)</h3>
          
          <div className="flex flex-col gap-3">
            {[
              { id: 1, icon: Radio, name: 'Sirena física local', desc: 'Suena de inmediato en el lugar para avisar a quien esté cerca.', status: 'En línea', state: 'online' },
              { id: 2, icon: Radio, name: 'Red LoRa mesh', desc: 'Pasa la alerta de nodo en nodo hasta la estación base. No usa internet.', status: 'En línea', state: 'online' },
              { id: 3, icon: MessageSquare, name: 'Mensaje de texto (SMS)', desc: 'Envía texto con las coordenadas GPS al número de emergencias.', status: 'En espera', state: 'waiting' },
              { id: 4, icon: Send, name: 'Telegram a bomberos', desc: 'Manda un mensaje con la foto de la cámara al grupo de bomberos.', status: 'Sin conexión', state: 'offline' },
              { id: 5, icon: Satellite, name: 'Enlace satelital', desc: 'Respaldo para zonas sin cobertura celular ni WiFi.', status: 'En espera', state: 'waiting' },
              { id: 6, icon: Plane, name: 'Dron mensajero', desc: 'Lleva físicamente los datos al puesto de mando cuando todo lo demás falla.', status: 'En espera', state: 'waiting' }
            ].map((channel) => (
              <div key={channel.id} className="flex items-center gap-4 p-3 rounded-xl border border-[#EEF5E9] bg-[#F8FAF5] hover:bg-white transition-colors">
                <div className="w-6 text-center text-xs font-bold text-[#636E72]">{channel.id}</div>
                <div className="bg-[#EEF5E9] p-2 rounded-lg text-[#2D6A4F]">
                  <channel.icon className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <div className="font-bold text-sm text-[#2D3436]">{channel.name}</div>
                  <div className="text-xs text-[#636E72] leading-tight mt-0.5">{channel.desc}</div>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#2D3436]">
                  <div className={`w-2 h-2 rounded-full ${statusColors[channel.state]}`}></div>
                  {channel.status}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Col: Timeline */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-slate-500" />
            <h3 className="text-sm font-bold text-slate-700">Qué hace el sistema solo (sin señal)</h3>
          </div>
          <p className="text-xs text-slate-500 -mt-2">
            Cuando el riesgo supera 0.7, esto pasa automáticamente, segundo a segundo, sin que nadie tenga que hacer nada.
          </p>

          <div className="relative pl-4 mt-2 space-y-6 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
            {[
              { t: '0', title: 'Alarma detectada', desc: 'El score superó 0.7. El sistema inicia el protocolo automático.', active: globalScore >= 0.7 },
              { t: '3', title: 'Intento por internet', desc: 'Prueba enviar Telegram y SMS si hay WiFi, datos o señal celular.', active: globalScore >= 0.7 },
              { t: '8', title: 'Red LoRa mesh', desc: 'Encadena la alerta nodo a nodo hasta la estación base. Sin internet.', active: globalScore >= 0.7 },
              { t: '10', title: 'Sirena local', desc: 'Activa la sirena física del nodo para avisar a quien esté cerca.', active: globalScore >= 0.7 },
              { t: '30', title: 'Satélite o dron', desc: 'Si no hubo confirmación, usa enlace satelital o lanza el dron mensajero.', active: globalScore >= 0.7 }
            ].map((step, idx) => (
              <div key={idx} className={`relative flex items-start justify-start gap-4 ${step.active ? 'opacity-100' : 'opacity-40'}`}>
                <div className={`z-10 flex h-6 w-6 items-center justify-center rounded-full border-2 bg-white ${step.active ? 'border-red-500 text-red-500' : 'border-slate-300 text-slate-300'} font-bold text-[10px]`}>
                  t={step.t}
                </div>
                <div>
                  <div className={`text-sm font-bold ${step.active ? 'text-slate-800' : 'text-slate-500'}`}>{step.title}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{step.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <hr className="border-gray-100 my-2" />

      {/* Directory */}
      <div className="flex flex-col gap-4">
        <h3 className="text-sm font-bold text-slate-700">Directorio de respuesta rápida</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { name: 'Bomberos', number: '119', method: 'Llamada directa • Llega en 15-25 min', icon: Phone },
            { name: 'Defensa Civil', number: '144', method: 'Llamada directa • Llega en 20-30 min', icon: Phone },
            { name: 'CARDER (Corp. Ambiental)', number: '606 311 4000', method: 'Llamada / radio • Llega en 30-45 min', icon: Phone },
            { name: 'Coordinador zonal', number: 'Configurar número', method: 'Llamada / Telegram • Llega en inmediato', icon: Radio }
          ].map((contact, idx) => (
            <div key={idx} className="flex items-center gap-4 p-4 border border-[#EEF5E9] rounded-xl bg-white hover:bg-[#F8FAF5] hover:shadow-md transition-all cursor-pointer">
              <div className="bg-[#EEF5E9] text-[#2D6A4F] p-3 rounded-lg">
                <contact.icon className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-[#636E72]">{contact.name}</div>
                <div className="text-lg font-black text-[#2D3436]">{contact.number}</div>
                <div className="text-xs text-[#636E72] font-medium">{contact.method}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Offline Report Form */}
      <div className="mt-4 p-5 rounded-xl border border-dashed border-gray-300 bg-slate-50 flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-800">Reportar desde la comunidad</h3>
              <span className="text-[10px] font-bold bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Wifi className="h-3 w-3 opacity-50" />
                Funciona sin internet
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">¿Viste humo o fuego? Cualquier persona puede avisar. Se guarda en el teléfono y se envía solo cuando vuelve la señal.</p>
          </div>
          <QrCode className="h-8 w-8 text-slate-300" />
        </div>

        <form onSubmit={handleReport} className="flex flex-col gap-3">
          <div>
            <label className="text-xs font-bold text-slate-700 mb-1 block">¿Dónde lo viste?</label>
            <div className="relative">
              <input 
                type="text" 
                placeholder="Escribe el lugar o usa el GPS" 
                className="w-full bg-white border border-gray-300 text-sm rounded-lg px-3 py-2.5 outline-none focus:border-blue-500"
              />
              <button type="button" className="absolute right-2 top-1.5 p-1 text-slate-400 hover:text-blue-600 flex items-center gap-1 text-xs font-bold bg-slate-100 rounded px-2">
                <MapPin className="h-3 w-3" /> GPS
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button type="button" className="flex items-center justify-center gap-2 bg-white border border-gray-300 rounded-lg p-3 text-slate-600 hover:bg-slate-50 text-sm font-bold transition-colors">
              <Mic className="h-4 w-4" /> Grabar audio
            </button>
            <button type="button" className="flex items-center justify-center gap-2 bg-white border border-gray-300 rounded-lg p-3 text-slate-600 hover:bg-slate-50 text-sm font-bold transition-colors">
              <Camera className="h-4 w-4" /> Tomar foto
            </button>
          </div>

          <button 
            type="submit" 
            className={`w-full text-white font-bold rounded-lg p-3 mt-2 transition-colors ${reportState === 'saved' ? 'bg-emerald-500' : 'bg-slate-800 hover:bg-slate-700'}`}
          >
            {reportState === 'saved' ? 'Guardado para enviar (Offline)' : 'Enviar reporte'}
          </button>
        </form>
      </div>

    </div>
  );
}

