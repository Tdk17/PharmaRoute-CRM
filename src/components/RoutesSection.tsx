/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Navigation, 
  MapPin, 
  Play, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Compass, 
  ExternalLink, 
  Info, 
  ArrowRight,
  TrendingUp,
  Map,
  RotateCw
} from 'lucide-react';
import { DB } from '../services/db';
import { Pharmacy, Route, RouteStop, User } from '../types';

interface RoutesSectionProps {
  currentUser: User;
}

export default function RoutesSection({ currentUser }: RoutesSectionProps) {
  const pharmacies = DB.getPharmacies().filter(p => p.status === 'active' && (currentUser.roleType === 'admin' || p.assignedSellerId === currentUser.id));
  const activeRoutes = DB.getRoutes().filter(r => currentUser.roleType === 'admin' || r.sellerId === currentUser.id);

  // States
  const [selectedPharmacies, setSelectedPharmacies] = useState<Pharmacy[]>([]);
  const [currentPharmSelection, setCurrentPharmSelection] = useState('');
  const [routeDate, setRouteDate] = useState('2026-07-02');

  const [optimizedSequence, setOptimizedSequence] = useState<Pharmacy[]>([]);
  const [totalKm, setTotalKm] = useState(0);
  const [totalTime, setTotalTime] = useState(0); // in minutes
  
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Add pharmacy to draft list
  const handleAddStop = () => {
    if (!currentPharmSelection) return;
    const ph = pharmacies.find(p => p.id === currentPharmSelection);
    if (ph && !selectedPharmacies.some(item => item.id === ph.id)) {
      setSelectedPharmacies([...selectedPharmacies, ph]);
      setCurrentPharmSelection('');
      setErrorMsg('');
    }
  };

  const handleRemoveStop = (id: string) => {
    setSelectedPharmacies(selectedPharmacies.filter(p => p.id !== id));
    setOptimizedSequence([]);
  };

  // Nearest-Neighbor Geolocation optimization simulation
  const handleOptimizeRoute = () => {
    if (selectedPharmacies.length < 2) {
      setErrorMsg('Adicione pelo menos 2 farmácias na lista para otimizar.');
      return;
    }

    setErrorMsg('');
    
    // Sort based on distance to preceding node
    // Base reference point (São Paulo downtown -23.5505, -46.6333)
    let currentLat = -23.5505;
    let currentLng = -46.6333;

    const unvisited = [...selectedPharmacies];
    const sequence: Pharmacy[] = [];
    let calculatedKm = 0;

    const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
      // simplified Euclidean distance in km
      const dy = (lat2 - lat1) * 111;
      const dx = (lon2 - lon1) * 111 * Math.cos(lat1 * Math.PI / 180);
      return Math.sqrt(dx * dx + dy * dy);
    };

    while (unvisited.length > 0) {
      let nearestIndex = 0;
      let minDistance = Infinity;

      for (let i = 0; i < unvisited.length; i++) {
        const dist = getDistance(currentLat, currentLng, unvisited[i].latitude, unvisited[i].longitude);
        if (dist < minDistance) {
          minDistance = dist;
          nearestIndex = i;
        }
      }

      const nextNode = unvisited.splice(nearestIndex, 1)[0];
      sequence.push(nextNode);
      calculatedKm += minDistance;
      currentLat = nextNode.latitude;
      currentLng = nextNode.longitude;
    }

    // Add back return distance to SP base hub (optional loop closure)
    calculatedKm += getDistance(currentLat, currentLng, -23.5505, -46.6333) * 0.4; // partially weighted back to base

    setOptimizedSequence(sequence);
    setTotalKm(parseFloat(calculatedKm.toFixed(1)));
    setTotalTime(Math.round(calculatedKm * 1.5 + sequence.length * 15)); // 1.5 mins per km + 15 mins per pharmacy audit
  };

  const handleCreateRoute = () => {
    if (optimizedSequence.length === 0) {
      setErrorMsg('Otimize a sequência de paradas antes de criar a rota de atendimento.');
      return;
    }

    try {
      const pharmacyIds = optimizedSequence.map(p => p.id);

      DB.createRoute({
        companyId: 'company-1',
        sellerId: currentUser.id,
        routeDate: routeDate,
        title: `Rota Otimizada - ${new Date(routeDate).toLocaleDateString('pt-BR')}`,
        totalDistanceKm: totalKm,
        estimatedTimeMinutes: totalTime,
        createdBy: currentUser.id
      }, pharmacyIds);

      setSuccessMsg('Rota otimizada criada e salva na sua agenda de campo!');
      setSelectedPharmacies([]);
      setOptimizedSequence([]);
      
      setTimeout(() => {
        setSuccessMsg('');
      }, 3000);

    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao gerar rota comercial.');
    }
  };

  const handleStartRoute = (routeId: string) => {
    try {
      DB.updateRouteStatus(routeId, 'started');
    } catch (err: any) {
      alert(err.message || 'Falha ao iniciar trajeto.');
    }
  };

  // Render a mini interactive visual SVG graph representing coordinates
  const renderSVGMap = () => {
    if (optimizedSequence.length === 0) return null;

    // Normalize coordinates to fit beautiful SVG box (width: 300, height: 200)
    // SP latitudes are around -22 to -24, longitudes are around -45 to -48
    const lats = optimizedSequence.map(p => p.latitude);
    const lngs = optimizedSequence.map(p => p.longitude);

    const minLat = Math.min(...lats, -23.5505);
    const maxLat = Math.max(...lats, -23.5505);
    const minLng = Math.min(...lngs, -46.6333);
    const maxLng = Math.max(...lngs, -46.6333);

    const pad = 20;
    const w = 340;
    const h = 200;

    const getX = (lng: number) => {
      if (maxLng === minLng) return w / 2;
      return pad + ((lng - minLng) / (maxLng - minLng)) * (w - 2 * pad);
    };

    const getY = (lat: number) => {
      if (maxLat === minLat) return h / 2;
      // invert Y as higher latitude is more north
      return pad + (1 - (lat - minLat) / (maxLat - minLat)) * (h - 2 * pad);
    };

    const spX = getX(-46.6333);
    const spY = getY(-23.5505);

    // Build SVG path
    let pathD = `M ${spX} ${spY}`;
    optimizedSequence.forEach(p => {
      pathD += ` L ${getX(p.longitude)} ${getY(p.latitude)}`;
    });

    return (
      <svg className="w-full h-56 bg-slate-900 rounded-xl border border-slate-800" viewBox={`0 0 ${w} ${h}`}>
        {/* Grid dots */}
        <defs>
          <pattern id="dot-grid" width="15" height="15" patternUnits="userSpaceOnUse">
            <circle cx="1.5" cy="1.5" r="0.8" fill="#1e293b" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dot-grid)" rx="12" />

        {/* Path line connection */}
        <path d={pathD} fill="none" stroke="#0ea5e9" strokeWidth="2.2" strokeLinecap="round" strokeDasharray="4 3" className="animate-pulse" />

        {/* SP Base Station Node */}
        <circle cx={spX} cy={spY} r="5" fill="#f43f5e" />
        <text x={spX + 8} y={spY + 3} fill="#fda4af" fontSize="7" fontWeight="bold">SÃO PAULO HUB</text>

        {/* Waypoints */}
        {optimizedSequence.map((ph, idx) => {
          const x = getX(ph.longitude);
          const y = getY(ph.latitude);
          return (
            <g key={ph.id}>
              <circle cx={x} cy={y} r="4" fill="#10b981" />
              <circle cx={x} cy={y} r="8" fill="#10b981" fillOpacity="0.1" />
              <rect x={x - 4} y={y - 12} width="8" height="8" rx="2" fill="#047857" />
              <text x={x - 2} y={y - 6} fill="#ffffff" fontSize="5" fontWeight="black" textAnchor="middle">{idx + 1}</text>
              <text x={x + 7} y={y + 3} fill="#94a3b8" fontSize="6" fontWeight="semibold" className="truncate">{ph.name.split(' ')[0]}</text>
            </g>
          );
        })}
      </svg>
    );
  };

  return (
    <div className="space-y-6" id="routes-section">
      {/* Upper header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl border border-gray-100 shadow-3xs">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Roteirizador de Atendimento (TSP)</h1>
          <p className="text-xs text-gray-500 mt-1">Selecione pontos de venda, otimize o trajeto e evite percursos redundantes.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
        
        {/* Draft Planner and list stops */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-3xs space-y-4">
          <h2 className="font-bold text-gray-900 text-sm border-b border-gray-50 pb-2">1. Adicionar Paradas</h2>
          
          {errorMsg && (
            <div className="bg-red-50 text-red-700 p-2.5 rounded-lg border border-red-100 font-medium">
              ⚠️ {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="bg-green-50 text-green-700 p-2.5 rounded-lg border border-green-100 font-medium">
              ✓ {successMsg}
            </div>
          )}

          <div className="space-y-3">
            <div>
              <label className="block font-bold text-gray-400 mb-1">Data da Rota</label>
              <input 
                type="date" 
                className="w-full border border-gray-200 rounded-lg p-2.5 bg-slate-50/50"
                value={routeDate}
                onChange={(e) => setRouteDate(e.target.value)}
              />
            </div>

            <div>
              <label className="block font-bold text-gray-400 mb-1">Selecionar Farmácia Cliente</label>
              <div className="flex gap-1.5">
                <select 
                  className="flex-1 border border-gray-200 rounded-lg p-2.5 bg-white"
                  value={currentPharmSelection}
                  onChange={(e) => setCurrentPharmSelection(e.target.value)}
                >
                  <option value="">Selecione farmácia...</option>
                  {pharmacies.map(ph => (
                    <option key={ph.id} value={ph.id}>
                      {ph.name} ({ph.city})
                    </option>
                  ))}
                </select>
                <button 
                  onClick={handleAddStop}
                  className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold px-3 py-2.5 rounded-lg flex items-center justify-center cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Planned stops list */}
          <div className="pt-2">
            <span className="font-bold text-gray-400">Pontos Selecionados ({selectedPharmacies.length})</span>
            <div className="space-y-1.5 mt-2 max-h-48 overflow-y-auto pr-1">
              {selectedPharmacies.length === 0 ? (
                <p className="text-gray-400 italic text-[11px] py-4 text-center">Nenhuma farmácia adicionada ao trajeto.</p>
              ) : (
                selectedPharmacies.map((ph, idx) => (
                  <div key={ph.id} className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg flex justify-between items-center gap-2">
                    <div className="truncate">
                      <p className="font-bold text-gray-800 truncate">{ph.name}</p>
                      <span className="text-[10px] text-gray-400">{ph.city}</span>
                    </div>
                    <button 
                      onClick={() => handleRemoveStop(ph.id)}
                      className="text-red-500 hover:text-red-600 cursor-pointer p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {selectedPharmacies.length >= 2 && (
            <button 
              onClick={handleOptimizeRoute}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
            >
              <RotateCw className="w-4 h-4 text-indigo-400 animate-spin-slow" />
              Otimizar Ordem e Percurso
            </button>
          )}
        </div>

        {/* Optimized sequence display and preview */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-gray-100 shadow-3xs space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <h2 className="font-bold text-gray-900 text-sm border-b border-gray-50 pb-2">2. Trajeto Geográfico Otimizado</h2>
            
            {optimizedSequence.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div>
                  <span className="text-[10px] text-gray-400 uppercase font-bold">Sequência</span>
                  <p className="text-sm font-bold text-slate-800">{optimizedSequence.length} Paradas Programadas</p>
                </div>
                <div>
                  <span className="text-[10px] text-indigo-500 uppercase font-bold">Distância Total Estimada</span>
                  <p className="text-sm font-bold text-indigo-600">{totalKm} km</p>
                </div>
                <div>
                  <span className="text-[10px] text-emerald-500 uppercase font-bold">Tempo Condução + Auditoria</span>
                  <p className="text-sm font-bold text-emerald-600">~{Math.round(totalTime / 60)}h {totalTime % 60}m</p>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-100 flex gap-2">
                <Info className="w-5 h-5 shrink-0" />
                <p>
                  Utilizamos um modelo de otimização TSP (Problema do Caixeiro Viajante) pelo algoritmo do Vizinho Mais Próximo. Adicione locais e clique em "Otimizar Ordem" para ver o trajeto simulado.
                </p>
              </div>
            )}

            {renderSVGMap()}

            {/* Sequence order vertical flow */}
            {optimizedSequence.length > 0 && (
              <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                {optimizedSequence.map((ph, idx) => (
                  <div key={ph.id} className="flex items-center gap-2">
                    <span className="w-5 h-5 bg-emerald-500 text-white rounded-full flex items-center justify-center font-bold text-[10px] shrink-0">
                      {idx + 1}
                    </span>
                    <div className="flex-1 bg-slate-50 p-2 border border-slate-100 rounded-lg flex justify-between items-center text-[11px]">
                      <span className="font-bold text-slate-800 truncate">{ph.name}</span>
                      <span className="text-[10px] text-gray-400 font-mono">{ph.city} ({ph.latitude.toFixed(3)}, {ph.longitude.toFixed(3)})</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {optimizedSequence.length > 0 && (
            <button 
              onClick={handleCreateRoute}
              className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-indigo-500/15 cursor-pointer"
            >
              <Navigation className="w-4 h-4" />
              Salvar Rota de Viagem
            </button>
          )}
        </div>

      </div>

      {/* ACTIVE REGISTERED ROUTES HISTORY */}
      <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-3xs space-y-4 text-xs">
        <h3 className="font-bold text-gray-900 text-sm">Rotas e Itinerários Registrados</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeRoutes.length === 0 ? (
            <p className="text-gray-400 italic py-6 text-center md:col-span-2 bg-slate-50/50 rounded-xl border border-dashed border-gray-200">
              Nenhuma rota ativa salva no sistema.
            </p>
          ) : (
            activeRoutes.map(route => {
              const stops = DB.getRouteStops(route.id);
              const isPlanned = route.status === 'planned';
              const isInProgress = route.status === 'started';

              return (
                <div key={route.id} className="p-4 bg-slate-50 border border-slate-100 hover:border-slate-200 rounded-xl space-y-3.5">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-gray-800">{route.title}</h4>
                      <p className="text-[10px] text-gray-400">Criada para o dia: {new Date(route.routeDate).toLocaleDateString('pt-BR')}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                      isPlanned ? 'bg-indigo-50 text-indigo-700' : (isInProgress ? 'bg-amber-50 text-amber-700 animate-pulse' : 'bg-green-50 text-green-700')
                    }`}>
                      {route.status === 'planned' ? 'Planejado' : (route.status === 'started' ? 'Em Viagem' : 'Finalizado')}
                    </span>
                  </div>

                  <div className="flex justify-between text-[11px] text-gray-500 font-semibold">
                    <span>{stops.length} Paradas</span>
                    <span>{route.totalDistanceKm} km totais</span>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                    <span className="text-[10px] text-gray-400">Metas vinculadas</span>
                    {isPlanned && (
                      <button 
                        onClick={() => handleStartRoute(route.id)}
                        className="bg-indigo-500 hover:bg-indigo-600 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5" /> Iniciar Rota
                      </button>
                    )}
                    {isInProgress && (
                      <div className="text-[11px] font-bold text-amber-600 flex items-center gap-1">
                        <Compass className="w-4 h-4 animate-spin-slow" />
                        Acompanhe no dashboard principal!
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

    </div>
  );
}
