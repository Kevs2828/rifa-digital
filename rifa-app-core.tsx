import React, { useState } from 'react';
import { Play, Trophy, RotateCcw, UserPlus, Users, X, History, BarChart3, Calendar, Award } from 'lucide-react';

export default function RifaApp() {
  const [participantes, setParticipantes] = useState([]);
  const [numeroGanador, setNumeroGanador] = useState(null);
  const [participanteGanador, setParticipanteGanador] = useState(null);
  const [sorteoEnProceso, setSorteoEnProceso] = useState(false);
  const [animacionNumero, setAnimacionNumero] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [nombreParticipante, setNombreParticipante] = useState('');
  const [cantidadNumeros, setCantidadNumeros] = useState(1);
  const [modoSeleccion, setModoSeleccion] = useState('automatico'); // 'automatico' o 'manual'
  const [numerosSeleccionados, setNumerosSeleccionados] = useState([]);
  const [historialRifas, setHistorialRifas] = useState([]);
  const [mostrarHistorial, setMostrarHistorial] = useState(false);

  // Obtener todos los números ocupados
  const numerosOcupados = participantes.flatMap(p => p.numeros);
  const numerosDisponibles = Array.from({length: 20}, (_, i) => i + 1)
    .filter(num => !numerosOcupados.includes(num));

  // Seleccionar/deseleccionar número manualmente
  const toggleNumeroSeleccionado = (numero) => {
    if (numerosOcupados.includes(numero)) return; // No permitir números ya ocupados
    
    if (numerosSeleccionados.includes(numero)) {
      setNumerosSeleccionados(numerosSeleccionados.filter(n => n !== numero));
    } else {
      if (numerosSeleccionados.length < 3) {
        setNumerosSeleccionados([...numerosSeleccionados, numero]);
      }
    }
  };

  // Agregar participante
  const agregarParticipante = () => {
    if (!nombreParticipante.trim()) return;
    
    let numerosAsignados = [];
    
    if (modoSeleccion === 'manual') {
      if (numerosSeleccionados.length === 0) {
        alert('Selecciona al menos un número');
        return;
      }
      numerosAsignados = [...numerosSeleccionados];
    } else {
      // Modo automático
      if (cantidadNumeros > numerosDisponibles.length) {
        alert(`Solo quedan ${numerosDisponibles.length} números disponibles`);
        return;
      }

      const disponibles = [...numerosDisponibles];
      for (let i = 0; i < cantidadNumeros; i++) {
        const indexRandom = Math.floor(Math.random() * disponibles.length);
        numerosAsignados.push(disponibles[indexRandom]);
        disponibles.splice(indexRandom, 1);
      }
    }

    const nuevoParticipante = {
      id: Date.now(),
      nombre: nombreParticipante.trim(),
      numeros: numerosAsignados.sort((a, b) => a - b)
    };

    setParticipantes([...participantes, nuevoParticipante]);
    setNombreParticipante('');
    setCantidadNumeros(1);
    setNumerosSeleccionados([]);
    setModoSeleccion('automatico');
    setMostrarFormulario(false);
  };

  // Eliminar participante
  const eliminarParticipante = (id) => {
    setParticipantes(participantes.filter(p => p.id !== id));
  };

  // Realizar sorteo con animación
  const realizarSorteo = () => {
    if (numerosOcupados.length === 0) return;
    
    setSorteoEnProceso(true);
    setNumeroGanador(null);
    setParticipanteGanador(null);
    
    let contador = 0;
    const duracionAnimacion = 3000;
    const intervalo = 100;
    
    const animacion = setInterval(() => {
      const numeroRandom = numerosOcupados[Math.floor(Math.random() * numerosOcupados.length)];
      setAnimacionNumero(numeroRandom);
      contador += intervalo;
      
      if (contador >= duracionAnimacion) {
        clearInterval(animacion);
        const ganador = numerosOcupados[Math.floor(Math.random() * numerosOcupados.length)];
        const participanteGanador = participantes.find(p => p.numeros.includes(ganador));
        
        // Guardar en historial
        const nuevaRifa = {
          id: Date.now(),
          fecha: new Date(),
          numeroGanador: ganador,
          participanteGanador: participanteGanador.nombre,
          totalParticipantes: participantes.length,
          numerosEnJuego: numerosOcupados.length,
          participantes: participantes.map(p => ({
            nombre: p.nombre,
            numeros: p.numeros
          }))
        };
        
        setHistorialRifas(prev => [nuevaRifa, ...prev]);
        setNumeroGanador(ganador);
        setParticipanteGanador(participanteGanador);
        setAnimacionNumero(null);
        setSorteoEnProceso(false);
      }
    }, intervalo);
  };

  // Reiniciar rifa
  const reiniciarRifa = () => {
    setParticipantes([]);
    setNumeroGanador(null);
    setParticipanteGanador(null);
    setAnimacionNumero(null);
    setSorteoEnProceso(false);
    setMostrarFormulario(false);
  };

  // Limpiar historial
  const limpiarHistorial = () => {
    if (window.confirm('¿Estás seguro de que quieres eliminar todo el historial?')) {
      setHistorialRifas([]);
    }
  };

  // Obtener estadísticas
  const obtenerEstadisticas = () => {
    if (historialRifas.length === 0) return null;
    
    const ganadores = {};
    historialRifas.forEach(rifa => {
      ganadores[rifa.participanteGanador] = (ganadores[rifa.participanteGanador] || 0) + 1;
    });
    
    const ganadorFrecuente = Object.entries(ganadores)
      .sort(([,a], [,b]) => b - a)[0];
    
    return {
      totalRifas: historialRifas.length,
      ganadorMasFrecuente: ganadorFrecuente ? ganadorFrecuente[0] : null,
      vecesGanadas: ganadorFrecuente ? ganadorFrecuente[1] : 0,
      promedioParticipantes: Math.round(
        historialRifas.reduce((sum, r) => sum + r.totalParticipantes, 0) / historialRifas.length
      )
    };
  };

  const estadisticas = obtenerEstadisticas();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-green-500 to-green-600 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-2 tracking-wide">
            🎲 RIFA DIGITAL 🎲
          </h1>
          <p className="text-lg text-green-100 font-medium">
            ¡Sorteos justos y emocionantes!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Panel de participantes e historial */}
          <div className="lg:col-span-1 space-y-6">
            {/* Panel de participantes */}
            <div className="bg-white rounded-3xl shadow-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-700 flex items-center gap-2">
                  <Users size={24} />
                  Participantes ({participantes.length})
                </h2>
                <button
                  onClick={() => setMostrarFormulario(!mostrarFormulario)}
                  className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-full transition-all duration-300 transform hover:scale-105"
                >
                  <UserPlus size={20} />
                </button>
              </div>

              {/* Formulario agregar participante */}
              {mostrarFormulario && (
                <div className="bg-green-50 rounded-xl p-4 mb-4">
                  <input
                    type="text"
                    placeholder="Nombre del participante"
                    value={nombreParticipante}
                    onChange={(e) => setNombreParticipante(e.target.value)}
                    className="w-full p-3 border border-green-300 rounded-lg mb-3 font-medium"
                    maxLength={20}
                  />
                  
                  {/* Selector de modo */}
                  <div className="mb-3">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Modo de selección
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setModoSeleccion('automatico');
                          setNumerosSeleccionados([]);
                        }}
                        className={`flex-1 py-2 px-3 rounded-lg font-medium transition-all ${
                          modoSeleccion === 'automatico' 
                            ? 'bg-green-500 text-white' 
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        🎲 Automático
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setModoSeleccion('manual');
                          setCantidadNumeros(1);
                        }}
                        className={`flex-1 py-2 px-3 rounded-lg font-medium transition-all ${
                          modoSeleccion === 'manual' 
                            ? 'bg-green-500 text-white' 
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        👆 Manual
                      </button>
                    </div>
                  </div>

                  {/* Selector automático */}
                  {modoSeleccion === 'automatico' && (
                    <div className="mb-3">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Números a comprar (Max. 3)
                      </label>
                      <select
                        value={cantidadNumeros}
                        onChange={(e) => setCantidadNumeros(parseInt(e.target.value))}
                        className="w-full p-3 border border-green-300 rounded-lg font-medium"
                      >
                        {[1, 2, 3].filter(n => n <= numerosDisponibles.length).map(n => (
                          <option key={n} value={n}>{n} número{n > 1 ? 's' : ''}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Selector manual */}
                  {modoSeleccion === 'manual' && (
                    <div className="mb-3">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Selecciona tus números ({numerosSeleccionados.length}/3)
                      </label>
                      <div className="grid grid-cols-5 gap-2 p-3 bg-white rounded-lg border border-green-300 max-h-32 overflow-y-auto">
                        {Array.from({length: 20}, (_, i) => i + 1).map((num) => {
                          const estaOcupado = numerosOcupados.includes(num);
                          const estaSeleccionado = numerosSeleccionados.includes(num);
                          
                          return (
                            <button
                              key={num}
                              type="button"
                              onClick={() => toggleNumeroSeleccionado(num)}
                              disabled={estaOcupado}
                              className={`
                                w-8 h-8 rounded-full text-xs font-bold transition-all duration-200
                                ${estaOcupado 
                                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                                  : estaSeleccionado
                                  ? 'bg-green-500 text-white scale-110 shadow-lg'
                                  : 'bg-gray-100 text-gray-700 hover:bg-green-200 hover:scale-105'
                                }
                              `}
                            >
                              {num}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={agregarParticipante}
                      disabled={
                        !nombreParticipante.trim() || 
                        (modoSeleccion === 'manual' && numerosSeleccionados.length === 0)
                      }
                      className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-bold py-2 rounded-lg"
                    >
                      Agregar
                    </button>
                    <button
                      onClick={() => {
                        setMostrarFormulario(false);
                        setNumerosSeleccionados([]);
                        setModoSeleccion('automatico');
                      }}
                      className="bg-gray-500 hover:bg-gray-600 text-white p-2 rounded-lg"
                    >
                      <X size={20} />
                    </button>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    Números disponibles: {numerosDisponibles.length}
                    {modoSeleccion === 'manual' && numerosSeleccionados.length > 0 && (
                      <span className="ml-2 text-green-600 font-semibold">
                        • Seleccionados: {numerosSeleccionados.join(', ')}
                      </span>
                    )}
                  </p>
                </div>
              )}

              {/* Lista de participantes */}
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {participantes.map((participante) => (
                  <div key={participante.id} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-800 truncate">
                        {participante.nombre}
                      </h3>
                      <button
                        onClick={() => eliminarParticipante(participante.id)}
                        className="text-red-500 hover:text-red-700 ml-2"
                        disabled={sorteoEnProceso}
                      >
                        <X size={16} />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {participante.numeros.map(num => (
                        <span
                          key={num}
                          className={`
                            px-2 py-1 rounded-full text-xs font-bold text-white
                            ${numeroGanador === num 
                              ? 'bg-gradient-to-r from-yellow-400 to-orange-500 animate-pulse' 
                              : 'bg-green-500'
                            }
                          `}
                        >
                          {num}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Panel de Historial */}
            <div className="bg-white rounded-3xl shadow-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-700 flex items-center gap-2">
                  <History size={24} />
                  Historial ({historialRifas.length})
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setMostrarHistorial(!mostrarHistorial)}
                    className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full transition-all duration-300 transform hover:scale-105"
                  >
                    <BarChart3 size={20} />
                  </button>
                  {historialRifas.length > 0 && (
                    <button
                      onClick={limpiarHistorial}
                      className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-all duration-300 transform hover:scale-105"
                    >
                      <X size={20} />
                    </button>
                  )}
                </div>
              </div>

              {/* Estadísticas */}
              {estadisticas && (
                <div className="bg-blue-50 rounded-xl p-4 mb-4">
                  <h3 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                    <Award size={16} />
                    Estadísticas
                  </h3>
                  <div className="text-sm text-blue-700 space-y-1">
                    <p>🎯 Total de rifas: <span className="font-bold">{estadisticas.totalRifas}</span></p>
                    <p>👑 Más afortunado: <span className="font-bold">{estadisticas.ganadorMasFrecuente}</span> ({estadisticas.vecesGanadas} veces)</p>
                    <p>👥 Promedio participantes: <span className="font-bold">{estadisticas.promedioParticipantes}</span></p>
                  </div>
                </div>
              )}

              {/* Lista de historial */}
              {mostrarHistorial && (
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {historialRifas.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">
                      No hay rifas realizadas aún
                    </p>
                  ) : (
                    historialRifas.map((rifa) => (
                      <div key={rifa.id} className="bg-gray-50 rounded-lg p-3 border-l-4 border-blue-400">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <Trophy size={16} className="text-yellow-500" />
                            <span className="font-semibold text-gray-800">
                              #{rifa.numeroGanador}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Calendar size={12} />
                            {rifa.fecha.toLocaleDateString()} {rifa.fecha.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </div>
                        </div>
                        <p className="font-medium text-green-600 mb-1">
                          🎉 {rifa.participanteGanador}
                        </p>
                        <p className="text-xs text-gray-600">
                          {rifa.totalParticipantes} participantes • {rifa.numerosEnJuego} números
                        </p>
                      </div>
                    ))
                  )}
                </div>
              )}

              {!mostrarHistorial && historialRifas.length > 0 && (
                <div className="text-center">
                  <button
                    onClick={() => setMostrarHistorial(true)}
                    className="text-blue-500 hover:text-blue-700 font-medium"
                  >
                    Ver {historialRifas.length} rifa{historialRifas.length > 1 ? 's' : ''}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Panel principal de sorteo */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-8">
              
              {/* Botones de control */}
              <div className="flex flex-wrap gap-4 justify-center mb-8">
                <button
                  onClick={realizarSorteo}
                  disabled={numerosOcupados.length === 0 || sorteoEnProceso}
                  className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-full flex items-center gap-2 transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  <Play size={20} />
                  {sorteoEnProceso ? 'Sorteando...' : 'Iniciar Sorteo'}
                </button>
                
                <button
                  onClick={reiniciarRifa}
                  className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  <RotateCcw size={20} />
                  Reiniciar Todo
                </button>
              </div>

              {/* Display de sorteo */}
              <div className="text-center mb-8">
                {sorteoEnProceso && (
                  <div className="mb-6">
                    <div className="text-6xl md:text-8xl font-black text-green-600 animate-bounce">
                      {animacionNumero}
                    </div>
                    <p className="text-xl text-gray-600 font-semibold mt-2">
                      🎰 Sorteando...
                    </p>
                  </div>
                )}
                
                {numeroGanador && participanteGanador && (
                  <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl p-6 animate-pulse">
                    <div className="flex items-center justify-center gap-3 mb-3">
                      <Trophy size={32} className="text-white" />
                      <h2 className="text-2xl font-bold text-white">¡GANADOR!</h2>
                      <Trophy size={32} className="text-white" />
                    </div>
                    <div className="text-4xl md:text-6xl font-black text-white mb-2">
                      #{numeroGanador}
                    </div>
                    <div className="text-2xl md:text-3xl font-bold text-yellow-100 mb-2">
                      🎉 {participanteGanador.nombre} 🎉
                    </div>
                    <p className="text-lg text-yellow-100 font-semibold">
                      ¡Felicitaciones!
                    </p>
                  </div>
                )}
              </div>

              {/* Grid de números */}
              <div>
                <h3 className="text-xl font-semibold text-center mb-4 text-gray-700">
                  Tablero de Números ({numerosOcupados.length}/20)
                </h3>
                <div className="grid grid-cols-5 md:grid-cols-10 gap-3 max-w-2xl mx-auto">
                  {Array.from({length: 20}, (_, i) => i + 1).map((num) => {
                    const participante = participantes.find(p => p.numeros.includes(num));
                    const estaOcupado = participante !== undefined;
                    const esGanador = numeroGanador === num;
                    
                    return (
                      <div
                        key={num}
                        className={`
                          w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg
                          transition-all duration-300 transform hover:scale-110 relative group
                          ${esGanador 
                            ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white animate-pulse scale-125' 
                            : estaOcupado 
                            ? 'bg-green-500 hover:bg-green-600 text-white'
                            : 'bg-gray-200 text-gray-500'
                          }
                        `}
                        title={estaOcupado ? `${participante.nombre}` : 'Disponible'}
                      >
                        {num}
                        {estaOcupado && (
                          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                            {participante.nombre}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="text-center text-green-100 mt-6">
          <p className="text-sm">
            👥 Máx. 3 números por persona • 🎯 Un solo ganador • ⚡ {numerosOcupados.length} números en juego
            {historialRifas.length > 0 && (
              <span className="ml-2">• 📊 {historialRifas.length} rifa{historialRifas.length > 1 ? 's' : ''} realizadas</span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}