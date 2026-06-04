import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Globe, 
  ChevronRight,
  Instagram
} from 'lucide-react';

const DISCORD_USER_ID = '1448507472552661126';

const PROJECTS = [
  {
    title: 'Chillzone',
    url: 'https://chillz0ne.dev',
    icon: <img src="https://raw.githubusercontent.com/ohsols/czonev2/refs/heads/main/public/logo.svg" className="w-5 h-5 rounded-sm object-contain" alt="chillzone" />
  }
];

const PARTNERS = [
  {
    name: 'Bloxcraft Studios',
    owner: 'THARUN9772',
    url: 'https://bloxcraft-ubg.pages.dev',
    avatar: 'https://bloxcraft-ubg.pages.dev/bloxcraft_transparent.png'
  },
  {
    name: 'SAM',
    owner: 'SAM',
    url: 'https://mkplaza.github.io/',
    avatar: 'https://cdn.jsdelivr.net/gh/MKPlaza/MKPlaza.github.io@main/Meta_Knight_Logo.webp'
  },
  {
    name: 'Krypthon',
    owner: 'Veteraning',
    url: 'https://www.krypt-on.top/',
    avatar: 'https://cdn.discordapp.com/icons/1474754840029823169/a_dd5f454a3a8995d76c2dc159a725a635.gif?size=1024'
  }
];

const BackgroundEffect = () => (
  <div className="fixed inset-0 -z-10 overflow-hidden bg-white">
    <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-50/20 rounded-full blur-[120px]" />
    <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-50/20 rounded-full blur-[120px]" />
  </div>
);

const App: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const [presence, setPresence] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
    
    const fetchPresence = async () => {
      try {
        const response = await fetch(`https://api.lanyard.rest/v1/users/${DISCORD_USER_ID}`);
        const data = await response.json();
        if (data.success) {
          setPresence(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch Discord presence:', error);
      }
    };

    fetchPresence();
    const interval = setInterval(fetchPresence, 10000);
    return () => clearInterval(interval);
  }, []);

  if (!mounted) return null;

  const discordUser = presence?.discord_user;
  const spotify = presence?.spotify;
  const isListening = !!presence?.listening_to_spotify;
  const status = presence?.discord_status || 'offline';
  const activities = presence?.activities || [];
  const customStatus = activities.find((a: any) => a.type === 4)?.state;

  const customStatusActivity = activities.find((a: any) => a.type === 4);
  const customStatusText = customStatusActivity?.state;
  const customStatusEmoji = customStatusActivity?.emoji;

  const statusColors: any = {
    online: 'bg-green-500',
    idle: 'bg-yellow-500',
    dnd: 'bg-red-500',
    offline: 'bg-zinc-400'
  };

  return (
    <div className="min-h-screen text-zinc-600 font-sans selection:bg-blue-50 selection:text-blue-600">
      <BackgroundEffect />
      
      <main className="max-w-6xl mx-auto px-6 py-20 flex flex-col md:flex-row gap-12 items-start justify-center">
        {/* Partners Column (Left) */}
        <div className="w-full md:w-32 flex-shrink-0 flex flex-col items-start">
          <div className="flex items-center gap-4 mb-6 w-full">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest whitespace-nowrap">Partners</span>
            <div className="h-px w-full bg-black/[0.05] md:hidden"></div>
          </div>
          <div className="flex flex-col gap-4 w-full">
            {PARTNERS.map((partner, index) => (
              <motion.a
                key={partner.name}
                href={partner.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + index * 0.1, duration: 0.5 }}
                className="flex flex-col items-center gap-2 p-3 rounded-2xl border border-transparent bg-transparent hover:bg-white hover:border-black/5 transition-all group hover:shadow-sm"
              >
                <div className="relative">
                  <div className="absolute -inset-1 bg-black/5 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <img 
                    src={partner.avatar} 
                    alt={partner.name}
                    className="relative w-10 h-10 rounded-full border border-transparent group-hover:border-black/5 object-cover transition-all"
                  />
                </div>
                <div className="text-center overflow-hidden w-full">
                  <h4 className="text-[10px] font-bold text-zinc-800 truncate lowercase">{partner.name}</h4>
                </div>
              </motion.a>
            ))}
          </div>
        </div>

        {/* Content Column (Center/Right) */}
        <div className="flex-1 max-w-2xl w-full flex flex-col items-center">
          {/* Profile Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col items-center text-center mb-12"
          >
            <div className="relative group mb-6">
              <div className={`absolute -inset-1 rounded-full blur opacity-20 group-hover:opacity-40 animate-pulse transition duration-1000 group-hover:duration-200 ${status === 'online' ? 'bg-green-400' : 'bg-blue-400'}`}></div>
              
              {/* Thought Bubble */}
              <AnimatePresence>
                {(customStatusText || customStatusEmoji) && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8, x: 20, y: 10 }}
                    animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="absolute -top-12 -right-48 z-20 hidden md:flex flex-col items-start gap-1"
                  >
                    <div className="relative bg-white border border-black/5 px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-3 max-w-[220px]">
                      <div className="flex-shrink-0">
                        {customStatusEmoji && (
                          customStatusEmoji.id ? (
                            <img 
                              src={`https://cdn.discordapp.com/emojis/${customStatusEmoji.id}.${customStatusEmoji.animated ? 'gif' : 'png'}`} 
                              alt={customStatusEmoji.name}
                              className="w-5 h-5 object-contain"
                            />
                          ) : (
                            <span className="text-lg">{customStatusEmoji.name}</span>
                          )
                        )}
                      </div>
                      {customStatusText && (
                        <span className="text-sm font-bold text-zinc-700 leading-snug text-left italic">
                          "{customStatusText}"
                        </span>
                      )}
                      {/* Tail */}
                      <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-white border-b border-l border-black/5 rounded-full transform -rotate-45 shadow-sm" />
                      <div className="absolute -bottom-3 -left-3 w-1.5 h-1.5 bg-white border border-black/5 rounded-full" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="relative">
                {discordUser?.avatar ? (
                  <img 
                    src={`https://cdn.discordapp.com/avatars/${DISCORD_USER_ID}/${discordUser.avatar}.${discordUser.avatar.startsWith('a_') ? 'gif' : 'png'}?size=256`}
                    alt="Avatar" 
                    className="relative w-24 h-24 rounded-full border border-black/5 bg-white object-cover shadow-xl"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full border border-black/5 bg-zinc-50 flex items-center justify-center shadow-xl overflow-hidden relative">
                    <img 
                      src={discordUser ? `https://cdn.discordapp.com/embed/avatars/${(parseInt(DISCORD_USER_ID) >> 22) % 6}.png` : "https://cdn.discordapp.com/embed/avatars/0.png"} 
                      className="w-full h-full object-cover" 
                      alt="Default Avatar"
                    />
                  </div>
                )}
                <div className={`absolute bottom-1 right-1 w-6 h-6 rounded-full border-4 border-white ${statusColors[status] || statusColors.offline}`}></div>
              </div>
            </div>
            
            <h1 className="text-3xl font-black tracking-tighter mb-2 flex flex-col items-center gap-1">
              <div className="flex items-center gap-3">
                <span className="relative text-zinc-900">
                  <span className="animate-rainbow bg-clip-text text-transparent bg-[length:400%_100%] drop-shadow-sm">
                    {discordUser?.global_name || discordUser?.username || 'ohsols'}
                  </span>
                </span>
              </div>
              {discordUser?.username && (
                <span className="text-[11px] font-bold text-zinc-400 opacity-60 tracking-tight -mt-1">
                  @{discordUser.username}
                </span>
              )}
            </h1>
          </motion.div>

          {/* Currently Listening */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.8 }}
            className="w-full p-4 rounded-2xl border border-black/[0.05] bg-white flex items-center gap-4 group cursor-default shadow-sm hover:shadow-md transition-all mb-12"
          >
            <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-zinc-100">
              {isListening && spotify?.album_art_url ? (
                <img src={spotify.album_art_url} alt="Album Art" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-zinc-50">
                  <div className="w-6 h-6 rounded-lg bg-zinc-200 animate-pulse" />
                </div>
              )}
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-full ${isListening ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-zinc-50 text-zinc-400 border border-zinc-100'}`}>
                  {isListening ? 'Currently Listening' : 'Not Listening'}
                </span>
              </div>
              <h4 className="text-sm font-bold text-zinc-900 truncate leading-tight">
                {isListening ? spotify?.song : 'Spotify'}
              </h4>
              <p className="text-[11px] font-bold text-zinc-400 truncate mt-0.5 uppercase tracking-tight">
                {isListening ? `by ${spotify?.artist}` : 'No music playing'}
              </p>
            </div>
            {isListening && (
              <div className="flex items-end gap-[3px] h-4 mb-1">
                {[...Array(4)].map((_, i) => (
                  <div 
                    key={i}
                    className="w-1 bg-green-500/40 rounded-full"
                    style={{ 
                      height: '8px',
                      animation: `music-bar 0.8s ease-in-out infinite`,
                      animationDelay: `${i * 0.15}s`
                    }}
                  />
                ))}
              </div>
            )}
          </motion.div>

          {/* Socials & Projects Section */}
          <div className="w-full flex flex-col md:flex-row gap-8 mb-12">
            {/* Socials */}
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-4 mb-2">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest whitespace-nowrap">Socials</span>
                <div className="h-px w-full bg-black/[0.05]"></div>
              </div>
              
              <div className="flex flex-col gap-3">
                {/* Instagram Widget */}
                <motion.a
                  href="https://www.instagram.com/krevetaa/"
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-4 p-4 rounded-2xl border border-transparent bg-transparent hover:bg-gradient-to-br hover:from-purple-50 hover:to-pink-50 hover:border-black/[0.05] transition-all group hover:shadow-md"
                >
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-pink-500 shadow-sm transition-all group-hover:rotate-6">
                    <Instagram className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-zinc-900 transition-colors">Instagram</h3>
                  </div>
                </motion.a>

                {/* Discord Server Widget */}
                <motion.a
                  href="https://discord.gg/cuHARsXESW"
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                  className="flex items-center gap-4 p-4 rounded-2xl border border-transparent bg-transparent hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 hover:border-black/[0.05] transition-all group hover:shadow-md"
                >
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-indigo-500 shadow-sm transition-all group-hover:-rotate-6">
                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.196.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-zinc-900 transition-colors">Discord Server</h3>
                  </div>
                </motion.a>

                {/* TikTok Widget */}
                <motion.a
                  href="https://www.tiktok.com/@.tsjmuram74a74qm47wk47qk?_r=1&_t=ZP-96viJ9Ya4II"
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center gap-4 p-4 rounded-2xl border border-transparent bg-transparent hover:bg-gradient-to-br hover:from-zinc-50 hover:to-zinc-200 hover:border-black/[0.05] transition-all group hover:shadow-md"
                >
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-black shadow-sm transition-all group-hover:scale-110 overflow-hidden">
                    <svg viewBox="0 0 448 512" className="w-5 h-5 fill-current">
                      <path d="M448,209.91a210.06,210.06,0,0,1-122.77-39.25V349.38A162.55,162.55,0,1,1,185,188.31V278.2a74.62,74.62,0,1,0,52.23,71.18V0l88,0a121.18,121.18,0,0,0,1.86,22.17h0A122.18,122.18,0,0,0,381,102.39a121.43,121.43,0,0,0,67,20.14Z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-zinc-900 transition-colors">TikTok</h3>
                  </div>
                </motion.a>
              </div>
            </div>

            {/* Projects */}
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-4 mb-2">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest whitespace-nowrap">Projects</span>
                <div className="h-px w-full bg-black/[0.05]"></div>
              </div>

              <div className="space-y-3">
                {PROJECTS.map((project, index) => (
                  <motion.a
                    key={project.title}
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.1, duration: 0.5 }}
                    className="flex flex-col gap-4 p-4 rounded-2xl border border-transparent bg-transparent hover:bg-white hover:border-black/5 transition-all group hover:shadow-md h-full"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm transition-all">
                        {project.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-bold text-zinc-900 truncate transition-colors">{project.title}</h3>
                      </div>
                      <ChevronRight className="w-4 h-4 text-zinc-300 group-hover:text-zinc-900 group-hover:translate-x-1 transition-all" />
                    </div>
                  </motion.a>
                ))}
              </div>
            </div>
          </div>


        </div>
      </main>

      <style>{`
        @keyframes music-bar {
          0%, 100% { height: 8px; }
          50% { height: 16px; }
        }
        .animate-spin-slow {
          animation: spin 12s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default App;
