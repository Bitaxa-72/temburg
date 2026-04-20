import { useState } from 'react';

interface Zone {
  id: string;
  name: string;
  nameEn: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  icon: string;
  description?: string;
}

const zones: Zone[] = [
  // Левая часть - бассейны
  { id: 'pool', name: 'Большой бассейн', nameEn: 'Main Pool', x: 50, y: 200, width: 180, height: 300, color: '#6BA3BE', icon: '🏊', description: '28-30°C' },
  { id: 'cold-bath', name: 'Холодная купель', nameEn: 'Cold Bath', x: 50, y: 520, width: 80, height: 60, color: '#4A90A4', icon: '❄️', description: '10-12°C' },
  { id: 'hot-bath', name: 'Горячая купель', nameEn: 'Hot Bath', x: 150, y: 520, width: 80, height: 60, color: '#C97B5D', icon: '🔥', description: '38-40°C' },
  { id: 'barrel1', name: 'Баня-бочка', nameEn: 'Barrel Sauna', x: 50, y: 130, width: 60, height: 50, color: '#8B6914', icon: '🛢️' },
  { id: 'barrel2', name: 'Баня-бочка', nameEn: 'Barrel Sauna', x: 130, y: 130, width: 60, height: 50, color: '#8B6914', icon: '🛢️' },

  // Терраса
  { id: 'terrace', name: 'Терраса', nameEn: 'Terrace', x: 50, y: 600, width: 180, height: 80, color: '#A67C52', icon: '☀️' },

  // Центральная часть - ресепшн и сервисы
  { id: 'reception', name: 'Ресепшн', nameEn: 'Reception', x: 280, y: 380, width: 120, height: 80, color: '#D4B896', icon: '🛎️' },
  { id: 'wardrobe', name: 'Гардероб', nameEn: 'Wardrobe', x: 280, y: 280, width: 100, height: 80, color: '#C9B896', icon: '🧥' },
  { id: 'showers', name: 'Душевые', nameEn: 'Showers', x: 400, y: 280, width: 60, height: 80, color: '#B8D4E3', icon: '🚿' },

  // Спа и массаж
  { id: 'spa', name: 'SPA кабинет', nameEn: 'SPA Room', x: 480, y: 280, width: 100, height: 80, color: '#E8D5C4', icon: '💆' },
  { id: 'massage', name: 'Массажный кабинет', nameEn: 'Massage', x: 480, y: 380, width: 100, height: 80, color: '#E8D5C4', icon: '💆‍♂️' },
  { id: 'yoga', name: 'Йога', nameEn: 'Yoga', x: 280, y: 180, width: 100, height: 80, color: '#D5E8D4', icon: '🧘' },

  // Верхняя часть - сауны
  { id: 'russian', name: 'Русская парная', nameEn: 'Russian Sauna', x: 280, y: 50, width: 90, height: 100, color: '#8B4513', icon: '🪵' },
  { id: 'village', name: 'Деревенская парная', nameEn: 'Village Sauna', x: 390, y: 50, width: 90, height: 100, color: '#A0522D', icon: '🏡' },
  { id: 'indian', name: 'Индийская парная', nameEn: 'Indian Sauna', x: 500, y: 50, width: 90, height: 100, color: '#CD853F', icon: '🕉️' },
  { id: 'sand', name: 'Песочная сауна', nameEn: 'Sand Sauna', x: 610, y: 50, width: 90, height: 100, color: '#DEB887', icon: '🏜️' },
  { id: 'herbal', name: 'Травяная сауна', nameEn: 'Herbal Sauna', x: 720, y: 50, width: 90, height: 100, color: '#6B8E23', icon: '🌿' },
  { id: 'siberian', name: 'Сибирская парная', nameEn: 'Siberian Sauna', x: 830, y: 50, width: 90, height: 100, color: '#2F4F4F', icon: '🌲' },
  { id: 'himalayan', name: 'Гималайская сауна', nameEn: 'Himalayan Sauna', x: 940, y: 50, width: 90, height: 100, color: '#DB7093', icon: '🏔️' },
  { id: 'shaman', name: 'Шаманская парная', nameEn: 'Shaman Sauna', x: 1050, y: 50, width: 90, height: 100, color: '#483D8B', icon: '🔮' },

  // Хаммам
  { id: 'hammam', name: 'Хаммам', nameEn: 'Hammam', x: 600, y: 380, width: 120, height: 100, color: '#4682B4', icon: '🌙' },

  // Правая часть - кафе и отдых
  { id: 'cafe', name: 'Кафе', nameEn: 'Cafe', x: 950, y: 280, width: 150, height: 180, color: '#D2691E', icon: '☕' },
  { id: 'rest1', name: 'Зона отдыха', nameEn: 'Rest Area', x: 750, y: 200, width: 120, height: 100, color: '#DEB887', icon: '🛋️' },
  { id: 'rest2', name: 'Зона отдыха у дуба', nameEn: 'Oak Rest Area', x: 750, y: 320, width: 150, height: 160, color: '#228B22', icon: '🌳' },

  // Детская зона
  { id: 'kids', name: 'Детский лабиринт', nameEn: 'Kids Area', x: 850, y: 500, width: 100, height: 80, color: '#FFB6C1', icon: '🧒' },
  { id: 'photo', name: 'Фотозона', nameEn: 'Photo Zone', x: 970, y: 500, width: 80, height: 80, color: '#FFA07A', icon: '📸' },

  // Бассейны справа
  { id: 'small-pool', name: 'Малый бассейн', nameEn: 'Small Pool', x: 750, y: 500, width: 80, height: 80, color: '#87CEEB', icon: '🏊‍♂️' },

  // Рыбки Гарра Руфа
  { id: 'fish', name: 'Рыбки Гарра Руфа', nameEn: 'Garra Rufa', x: 600, y: 200, width: 100, height: 60, color: '#20B2AA', icon: '🐟' },
];

const legendItems = [
  { icon: '🛎️', label: 'Ресепшн', labelEn: 'Reception' },
  { icon: '☕', label: 'Кафе', labelEn: 'Cafe' },
  { icon: '🚿', label: 'Душевые', labelEn: 'Showers' },
  { icon: '🪵', label: 'Парные', labelEn: 'Saunas' },
  { icon: '🏊', label: 'Бассейны', labelEn: 'Pools' },
  { icon: '💆', label: 'SPA', labelEn: 'SPA' },
];

export default function IsometricMap() {
  const [hoveredZone, setHoveredZone] = useState<string | null>(null);
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);

  return (
    <div className="relative w-full overflow-hidden rounded-2xl bg-gradient-to-br from-[#2C2420] via-[#3D3530] to-[#2C2420] p-8">
      {/* Ambient lighting overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-amber-900/10 pointer-events-none" />

      {/* Map container with isometric transform */}
      <div className="relative mx-auto" style={{ maxWidth: '1200px' }}>
        <svg
          viewBox="0 0 1200 700"
          className="w-full h-auto"
          style={{
            filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.4))',
          }}
        >
          {/* Background floor */}
          <defs>
            {/* Wood texture pattern */}
            <pattern id="woodTexture" patternUnits="userSpaceOnUse" width="40" height="40">
              <rect width="40" height="40" fill="#5D4E37"/>
              <line x1="0" y1="10" x2="40" y2="10" stroke="#4A3F2F" strokeWidth="1" opacity="0.3"/>
              <line x1="0" y1="20" x2="40" y2="20" stroke="#4A3F2F" strokeWidth="1" opacity="0.3"/>
              <line x1="0" y1="30" x2="40" y2="30" stroke="#4A3F2F" strokeWidth="1" opacity="0.3"/>
            </pattern>

            {/* Stone texture */}
            <pattern id="stoneTexture" patternUnits="userSpaceOnUse" width="60" height="60">
              <rect width="60" height="60" fill="#6B5D4D"/>
              <circle cx="15" cy="15" r="2" fill="#5D4E37" opacity="0.3"/>
              <circle cx="45" cy="35" r="3" fill="#5D4E37" opacity="0.2"/>
              <circle cx="25" cy="50" r="2" fill="#5D4E37" opacity="0.3"/>
            </pattern>

            {/* Water pattern */}
            <linearGradient id="waterGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6BA3BE"/>
              <stop offset="50%" stopColor="#5A93AE"/>
              <stop offset="100%" stopColor="#4A839E"/>
            </linearGradient>

            {/* Warm glow */}
            <radialGradient id="warmGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFE4B5" stopOpacity="0.3"/>
              <stop offset="100%" stopColor="#FFE4B5" stopOpacity="0"/>
            </radialGradient>

            {/* Shadow filter */}
            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="4" dy="6" stdDeviation="4" floodColor="#000" floodOpacity="0.4"/>
            </filter>

            {/* Inner glow for rooms */}
            <filter id="innerGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="3" result="blur"/>
              <feOffset in="blur" dx="0" dy="0" result="offsetBlur"/>
              <feFlood floodColor="#FFE4B5" floodOpacity="0.5"/>
              <feComposite in2="offsetBlur" operator="in"/>
              <feMerge>
                <feMergeNode/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Main floor background */}
          <rect x="30" y="30" width="1140" height="640" rx="20" fill="url(#stoneTexture)" opacity="0.8"/>

          {/* Render zones */}
          {zones.map((zone) => {
            const isHovered = hoveredZone === zone.id;
            const isSelected = selectedZone?.id === zone.id;

            return (
              <g
                key={zone.id}
                onMouseEnter={() => setHoveredZone(zone.id)}
                onMouseLeave={() => setHoveredZone(null)}
                onClick={() => setSelectedZone(isSelected ? null : zone)}
                style={{ cursor: 'pointer' }}
              >
                {/* 3D base/shadow */}
                <rect
                  x={zone.x + 4}
                  y={zone.y + 6}
                  width={zone.width}
                  height={zone.height}
                  rx="8"
                  fill="#1a1512"
                  opacity="0.5"
                />

                {/* Main zone body */}
                <rect
                  x={zone.x}
                  y={zone.y}
                  width={zone.width}
                  height={zone.height}
                  rx="8"
                  fill={zone.color}
                  filter={isHovered || isSelected ? "url(#innerGlow)" : undefined}
                  style={{
                    transition: 'all 0.3s ease',
                    transform: isHovered ? 'translate(-2px, -2px)' : undefined,
                  }}
                />

                {/* Top highlight */}
                <rect
                  x={zone.x + 4}
                  y={zone.y + 4}
                  width={zone.width - 8}
                  height={8}
                  rx="4"
                  fill="white"
                  opacity="0.15"
                />

                {/* Border */}
                <rect
                  x={zone.x}
                  y={zone.y}
                  width={zone.width}
                  height={zone.height}
                  rx="8"
                  fill="none"
                  stroke={isHovered || isSelected ? "#FFE4B5" : "#2C2420"}
                  strokeWidth={isHovered || isSelected ? 3 : 2}
                  style={{ transition: 'all 0.3s ease' }}
                />

                {/* Zone icon */}
                <text
                  x={zone.x + zone.width / 2}
                  y={zone.y + zone.height / 2 - 10}
                  textAnchor="middle"
                  fontSize={Math.min(zone.width, zone.height) > 80 ? "28" : "20"}
                  style={{ pointerEvents: 'none' }}
                >
                  {zone.icon}
                </text>

                {/* Zone name */}
                <text
                  x={zone.x + zone.width / 2}
                  y={zone.y + zone.height / 2 + 15}
                  textAnchor="middle"
                  fill="#FBF9F4"
                  fontSize={zone.width > 100 ? "11" : "9"}
                  fontWeight="600"
                  style={{
                    pointerEvents: 'none',
                    textShadow: '0 1px 2px rgba(0,0,0,0.8)'
                  }}
                >
                  {zone.name}
                </text>

                {/* Temperature/description */}
                {zone.description && zone.width > 80 && (
                  <text
                    x={zone.x + zone.width / 2}
                    y={zone.y + zone.height / 2 + 30}
                    textAnchor="middle"
                    fill="#FFE4B5"
                    fontSize="10"
                    fontWeight="500"
                    style={{ pointerEvents: 'none' }}
                  >
                    {zone.description}
                  </text>
                )}

                {/* Ambient lights for saunas */}
                {zone.id.includes('sauna') || zone.id.includes('russian') || zone.id.includes('village') || zone.id.includes('indian') || zone.id.includes('shaman') || zone.id.includes('siberian') || zone.id.includes('himalayan') || zone.id.includes('herbal') || zone.id.includes('sand') ? (
                  <circle
                    cx={zone.x + zone.width - 15}
                    cy={zone.y + 15}
                    r="5"
                    fill="#FFB347"
                    opacity="0.8"
                  >
                    <animate attributeName="opacity" values="0.8;0.4;0.8" dur="2s" repeatCount="indefinite"/>
                  </circle>
                ) : null}

                {/* Steam effect for hot zones */}
                {(zone.id === 'hammam' || zone.id === 'hot-bath') && (
                  <>
                    {[0, 1, 2].map((i) => (
                      <circle
                        key={i}
                        cx={zone.x + 20 + i * 20}
                        cy={zone.y - 10}
                        r="4"
                        fill="white"
                        opacity="0.3"
                      >
                        <animate
                          attributeName="cy"
                          values={`${zone.y - 10};${zone.y - 25};${zone.y - 10}`}
                          dur={`${2 + i * 0.3}s`}
                          repeatCount="indefinite"
                        />
                        <animate
                          attributeName="opacity"
                          values="0.3;0;0.3"
                          dur={`${2 + i * 0.3}s`}
                          repeatCount="indefinite"
                        />
                      </circle>
                    ))}
                  </>
                )}

                {/* Water ripples for pools */}
                {(zone.id === 'pool' || zone.id === 'small-pool') && (
                  <>
                    <ellipse
                      cx={zone.x + zone.width / 2}
                      cy={zone.y + zone.height / 2}
                      rx="15"
                      ry="8"
                      fill="none"
                      stroke="white"
                      strokeWidth="1"
                      opacity="0.3"
                    >
                      <animate attributeName="rx" values="15;35;15" dur="3s" repeatCount="indefinite"/>
                      <animate attributeName="ry" values="8;18;8" dur="3s" repeatCount="indefinite"/>
                      <animate attributeName="opacity" values="0.3;0;0.3" dur="3s" repeatCount="indefinite"/>
                    </ellipse>
                  </>
                )}
              </g>
            );
          })}

          {/* Decorative trees */}
          <g opacity="0.9">
            {/* Big oak tree near rest area */}
            <circle cx="820" cy="400" r="50" fill="#228B22"/>
            <circle cx="820" cy="400" r="40" fill="#2E8B2E"/>
            <circle cx="810" cy="390" r="25" fill="#32CD32"/>
            <circle cx="830" cy="410" r="20" fill="#228B22"/>
            <rect x="815" y="440" width="10" height="30" fill="#8B4513"/>
          </g>

          {/* Palm trees on terrace */}
          {[70, 130, 190].map((x, i) => (
            <g key={i}>
              <rect x={x} y="640" width="8" height="25" fill="#8B7355"/>
              <ellipse cx={x + 4} cy="635" rx="15" ry="8" fill="#228B22"/>
              <ellipse cx={x - 5} cy="640" rx="12" ry="6" fill="#2E8B2E"/>
              <ellipse cx={x + 12} cy="640" rx="12" ry="6" fill="#32CD32"/>
            </g>
          ))}

          {/* Entrance marker */}
          <g>
            <rect x="350" y="480" width="80" height="40" rx="8" fill="#C4944E"/>
            <text x="390" y="505" textAnchor="middle" fill="#FBF9F4" fontSize="12" fontWeight="bold">
              ВХОД
            </text>
          </g>
        </svg>
      </div>

      {/* Legend */}
      <div className="mt-8 flex flex-wrap justify-center gap-6">
        {legendItems.map((item) => (
          <div
            key={item.label}
            className="flex items-center gap-2 px-4 py-2 bg-[#3D3530]/80 rounded-full border border-[#C4944E]/30"
          >
            <span className="text-xl">{item.icon}</span>
            <span className="text-sm text-[#FBF9F4] font-medium">{item.label}</span>
          </div>
        ))}
      </div>

      {/* Zone info popup */}
      {selectedZone && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 bg-[#2C2420]/95 backdrop-blur-sm rounded-xl p-6 border border-[#C4944E]/50 shadow-2xl max-w-sm">
          <button
            onClick={() => setSelectedZone(null)}
            className="absolute top-2 right-2 text-[#FBF9F4]/60 hover:text-[#FBF9F4] text-xl"
          >
            ×
          </button>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">{selectedZone.icon}</span>
            <div>
              <h3 className="text-lg font-bold text-[#FBF9F4] font-['Ikra_Slab']">
                {selectedZone.name}
              </h3>
              <p className="text-sm text-[#C4944E]">{selectedZone.nameEn}</p>
            </div>
          </div>
          {selectedZone.description && (
            <p className="text-[#FBF9F4]/80 mt-2">{selectedZone.description}</p>
          )}
        </div>
      )}
    </div>
  );
}
