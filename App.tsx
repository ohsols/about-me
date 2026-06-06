import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Globe, 
  ChevronRight,
  Instagram,
  ChevronLeft,
  Brain,
  Cpu,
  Layers,
  Activity,
  Sparkles,
  Code
} from 'lucide-react';

const PROFILES = [
  '1448507472552661126',
  '1500907003575537776',
  '924403274692575263'
];

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

const SKILLS = [
  {
    name: 'React',
    level: 'UI Library',
    icon: <Cpu className="w-4 h-4 text-sky-500" />
  },
  {
    name: 'Vibe Coding',
    level: 'Smart Tooling',
    icon: <Brain className="w-4 h-4 text-purple-500" />
  },
  {
    name: 'TypeScript',
    level: 'Language',
    icon: <Code className="w-4 h-4 text-blue-500" />
  },
  {
    name: 'Tailwind CSS',
    level: 'Styling',
    icon: <Layers className="w-4 h-4 text-teal-400" />
  },
  {
    name: 'Framer Motion',
    level: 'Animations',
    icon: <Sparkles className="w-4 h-4 text-amber-500" />
  }
];

const BackgroundEffect = () => (
  <div className="fixed inset-0 -z-10 overflow-hidden bg-white">
    <motion.div 
      animate={{ 
        scale: [1, 1.1, 1],
        opacity: [0.3, 0.5, 0.3],
      }}
      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-50 rounded-full blur-[120px]" 
    />
    <motion.div 
      animate={{ 
        scale: [1, 1.2, 1],
        opacity: [0.3, 0.5, 0.3],
      }}
      transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-50 rounded-full blur-[120px]" 
    />
  </div>
);

const SpotifyProgress = ({ start, end, song, artist }: { start: number; end: number; song: string; artist: string; }) => {
  const [now, setNow] = useState(Date.now());
  const [lyrics, setLyrics] = useState<{ time: number, text: string }[] | null>(null);

  useEffect(() => {
    const update = () => setNow(Date.now());
    update();
    const interval = setInterval(update, 50);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!song || !artist) return;
    const fetchLyrics = async () => {
      try {
        let syncedLyrics = null;
        // Clean up song title for better match rates
        const cleanSong = song.replace(/\(feat\.?.*?\)/i, '').replace(/\(.*?remaster.*?\)/i, '').trim();
        
        // 1. Try exact match
        const res = await fetch(`https://lrclib.net/api/get?track_name=${encodeURIComponent(cleanSong)}&artist_name=${encodeURIComponent(artist)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.syncedLyrics) syncedLyrics = data.syncedLyrics;
        }

        // 2. Try search fallback (useful for fuzzy matching)
        if (!syncedLyrics) {
          const searchRes = await fetch(`https://lrclib.net/api/search?q=${encodeURIComponent(artist + ' ' + cleanSong)}`);
          if (searchRes.ok) {
            const searchData = await searchRes.json();
            const match = searchData.find((track: any) => track.syncedLyrics);
            if (match) syncedLyrics = match.syncedLyrics;
          }
        }

        if (syncedLyrics) {
          const lines = syncedLyrics.split('\n').map((line: string) => {
            const match = line.match(/\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/);
            if (match) {
              const m = parseInt(match[1]);
              const s = parseInt(match[2]);
              const msStr = match[3];
              const ms = msStr.length === 2 ? parseInt(msStr) * 10 : parseInt(msStr);
              const time = m * 60000 + s * 1000 + ms;
              return { time, text: match[4].trim() };
            }
            return null;
          }).filter(Boolean) as {time: number, text: string}[];
          
          setLyrics([{time: 0, text: '♪'}, ...lines]);
        } else {
          setLyrics(null);
        }
      } catch(e) {
        console.warn('Could not fetch lyrics');
      }
    };
    fetchLyrics();
  }, [song, artist]);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(Math.max(0, ms) / 1000);
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const progressMs = now - start;
  const durationMs = end - start;
  const progressPercent = Math.min(100, Math.max(0, (progressMs / durationMs) * 100));

  let currentLyricText = '';
  if (lyrics) {
     const pastLyrics = lyrics.filter(l => l.time <= progressMs + 2000); 
     if (pastLyrics.length > 0) {
        currentLyricText = pastLyrics[pastLyrics.length - 1].text;
     }
  }

  return (
    <div className="w-full mt-3 flex flex-col gap-1.5 transition-all">
      {lyrics && (
        <div className="flex justify-center items-center h-4 w-full overflow-hidden relative mb-1">
          <AnimatePresence mode="popLayout">
            <motion.span
              key={currentLyricText}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="text-[11px] font-bold text-zinc-600 line-clamp-1 italic absolute w-full text-center"
            >
              {currentLyricText || '♪'}
            </motion.span>
          </AnimatePresence>
        </div>
      )}
      <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden">
        <div 
          className="h-full bg-green-500 rounded-full" 
          style={{ width: `${progressPercent}%` }} 
        />
      </div>
      <div className="w-full flex justify-between text-[10px] font-bold text-zinc-400 font-mono">
        <span>{formatTime(progressMs)}</span>
        <span>{formatTime(durationMs)}</span>
      </div>
    </div>
  );
};

const ProfileView: React.FC<{ discordId: string }> = ({ discordId }) => {
  const [mounted, setMounted] = useState(false);
  const [presence, setPresence] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
    let ws: WebSocket;
    let heartbeatInterval: NodeJS.Timeout;

    const connectWebSocket = () => {
      ws = new WebSocket('wss://api.lanyard.rest/socket');

      ws.onmessage = (event) => {
        const { op, d, t } = JSON.parse(event.data);

        if (op === 1) {
          // Setup heartbeat interval
          heartbeatInterval = setInterval(() => {
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({ op: 3 }));
            }
          }, d.heartbeat_interval);
        } else if (op === 0) {
          if (t === 'INIT_STATE' || t === 'PRESENCE_UPDATE') {
            setPresence(d);
          }
        }
      };

      ws.onopen = () => {
        ws.send(JSON.stringify({
          op: 2,
          d: { subscribe_to_id: discordId }
        }));
      };

      ws.onclose = () => {
        clearInterval(heartbeatInterval);
        setTimeout(connectWebSocket, 3000); // Reconnect after 3s
      };
    };

    connectWebSocket();

    return () => {
      if (ws) ws.close();
      if (heartbeatInterval) clearInterval(heartbeatInterval);
    };
  }, [discordId]);

  if (!mounted) return null;
  
  if (!presence) {
    return (
      <div className="w-full flex items-center justify-center py-20 text-zinc-400 font-medium">
        Loading...
      </div>
    );
  }

  const discordUser = presence.discord_user;
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
    <>
      <motion.main 
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: { staggerChildren: 0.15 }
          }
        }}
        className="max-w-6xl mx-auto px-6 py-20 flex flex-col md:flex-row gap-12 items-start justify-center"
      >
        {/* Partners Column (Left) */}
        <motion.div 
          variants={{
            hidden: { opacity: 0, x: -20 },
            visible: { opacity: 1, x: 0 }
          }}
          className="w-full md:w-32 flex-shrink-0 flex flex-col items-start"
        >
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
        </motion.div>

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
                    src={`https://cdn.discordapp.com/avatars/${discordId}/${discordUser.avatar}.${discordUser.avatar.startsWith('a_') ? 'gif' : 'png'}?size=256`}
                    alt="Avatar" 
                    className="relative w-24 h-24 rounded-full border border-black/5 bg-white object-cover shadow-xl"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full border border-black/5 bg-zinc-50 flex items-center justify-center shadow-xl overflow-hidden relative">
                    <img 
                      src={discordUser ? `https://cdn.discordapp.com/embed/avatars/${(parseInt(discordId) >> 22) % 6}.png` : "https://cdn.discordapp.com/embed/avatars/0.png"} 
                      className="w-full h-full object-cover" 
                      alt="Default Avatar"
                    />
                  </div>
                )}
                <div className={`absolute bottom-[-2px] right-[-2px] h-7 w-7 hover:w-24 rounded-full border-[3px] border-white ${statusColors[status] || statusColors.offline} flex items-center transition-all duration-300 overflow-hidden group/status`}>
                  <div className="w-7 h-7 flex-shrink-0" />
                  <span className="text-white font-bold uppercase tracking-wider whitespace-nowrap opacity-0 group-hover/status:opacity-100 pr-3 -ml-7 pl-7 text-[10px] transition-all duration-300">
                    {status}
                  </span>
                </div>
              </div>
            </div>
            
            <h1 className="text-3xl font-black tracking-tighter mb-2 flex flex-col items-center gap-1">
              <div className="flex items-center gap-3">
                <span className="relative text-zinc-900">
                  <span className="animate-rainbow bg-clip-text text-transparent bg-[length:400%_100%] drop-shadow-sm">
                    {discordId === '1500907003575537776' ? "var's alt acc" : (discordUser?.global_name || discordUser?.username || 'Unknown')}
                  </span>
                </span>
              </div>
              {discordUser?.username && (
                <span className="text-[11px] font-bold text-zinc-400 opacity-60 tracking-tight -mt-1">
                  @{discordUser.username}
                </span>
              )}
            </h1>

            {/* Little Skills Icons under Username */}
            <div className="flex items-center justify-center gap-2 mt-2">
              {SKILLS.map((skill) => (
                <div key={skill.name} className="relative group/tooltip">
                  <div 
                    className="w-7 h-7 rounded-lg bg-zinc-100/50 hover:bg-zinc-100 border border-black/[0.03] flex items-center justify-center text-zinc-600 hover:text-zinc-950 hover:scale-110 transition-all cursor-help"
                  >
                    {skill.icon}
                  </div>
                  {/* Modern custom tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 bg-zinc-900/95 backdrop-blur-sm text-white text-[10px] font-semibold tracking-normal rounded-lg opacity-0 pointer-events-none group-hover/tooltip:opacity-100 scale-90 group-hover/tooltip:scale-100 transition-all duration-200 z-50 shadow-md whitespace-nowrap">
                    <div className="relative flex flex-col items-center">
                      <span>{skill.name}</span>
                      {/* Tooltip Chevron/Arrow indicator */}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-zinc-900/95 rotate-45 mt-0.5" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Currently Listening */}
          <motion.a 
            href={isListening && spotify?.track_id ? `https://open.spotify.com/track/${spotify.track_id}` : undefined}
            target={isListening ? "_blank" : undefined}
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.8 }}
            className={`w-full p-4 rounded-2xl border border-black/[0.05] bg-white flex flex-col group shadow-sm transition-all mb-12 ${isListening ? 'hover:shadow-md cursor-pointer hover:border-green-500/20' : 'cursor-default'}`}
          >
            <div className="flex items-center gap-4 w-full">
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
                  <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-full transition-colors ${isListening ? 'bg-green-50 text-green-600 border border-green-100 group-hover:bg-green-100' : 'bg-zinc-50 text-zinc-400 border border-zinc-100'}`}>
                    {isListening ? 'Currently Listening' : 'Not Listening'}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-zinc-900 truncate leading-tight transition-colors group-hover:text-green-600">
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
                      className="w-1 bg-green-500/40 rounded-full transition-colors group-hover:bg-green-500/60"
                      style={{ 
                        height: '8px',
                        animation: `music-bar 0.8s ease-in-out infinite`,
                        animationDelay: `${i * 0.15}s`
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
            {isListening && spotify?.timestamps && (
              <SpotifyProgress 
                start={spotify.timestamps.start} 
                end={spotify.timestamps.end} 
                song={spotify.song} 
                artist={spotify.artist} 
              />
            )}
          </motion.a>

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
                  href={discordId === '924403274692575263' ? "https://www.instagram.com/vee.iive/" : "https://www.instagram.com/krevetaa/"}
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
                {discordId !== '924403274692575263' && (
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
                )}

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
      </motion.main>
    </>
  );
};

const App: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const [pageIndicator, setPageIndicator] = useState(0);

  useEffect(() => {
    setMounted(true);
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        setPageIndicator(prev => Math.min(prev + 1, PROFILES.length));
      } else if (e.key === 'ArrowLeft') {
        setPageIndicator(prev => Math.max(prev - 1, 0));
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen text-zinc-600 font-sans selection:bg-blue-50 selection:text-blue-600 relative overflow-x-hidden">
      <BackgroundEffect />
      
      <AnimatePresence mode="wait">
        <motion.div
          key={pageIndicator}
          initial={{ opacity: 0, x: 40, filter: 'blur(15px)' }}
          animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, x: -40, filter: 'blur(15px)' }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }} 
          className="relative z-10 w-full flex min-h-[90vh] items-center justify-center p-6"
        >
          {pageIndicator === 0 ? (
            <div className="flex flex-col items-center justify-center w-full text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="flex flex-col gap-4 text-zinc-500 font-medium"
              >
                <div className="flex items-center gap-4 hover:text-zinc-900 transition-colors cursor-pointer" onClick={() => setPageIndicator(1)}>
                  <span className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-900 text-sm font-bold">1</span>
                  <span>Sols Socials</span>
                </div>
                <div className="flex items-center gap-4 hover:text-zinc-900 transition-colors cursor-pointer" onClick={() => setPageIndicator(2)}>
                  <span className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-900 text-sm font-bold">2</span>
                  <span>Sols Alt Discord Acc</span>
                </div>
                <div className="flex items-center gap-4 hover:text-zinc-900 transition-colors cursor-pointer" onClick={() => setPageIndicator(3)}>
                  <span className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-900 text-sm font-bold">3</span>
                  <span>Viera Socials</span>
                </div>
              </motion.div>
            </div>
          ) : (
            <div className="w-full self-start">
              <ProfileView discordId={PROFILES[pageIndicator - 1]} />
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Book Navigation Controls */}
      <div className="fixed bottom-8 left-0 right-0 flex justify-center z-50 pointer-events-none">
        <div className="bg-white/80 backdrop-blur-md rounded-full border border-black/5 p-2 flex items-center gap-4 shadow-xl pointer-events-auto">
          {Array.from({ length: PROFILES.length + 1 }).map((_, i) => (
            <React.Fragment key={i}>
              {i > 0 && <div className="w-px h-4 bg-zinc-200" />}
              <button 
                onClick={() => setPageIndicator(i)}
                className={`w-10 h-10 rounded-full flex flex-shrink-0 items-center justify-center transition-all outline-none ${pageIndicator === i ? 'bg-zinc-900 text-white' : 'bg-transparent text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100'}`}
              >
                {i}
              </button>
            </React.Fragment>
          ))}
        </div>
      </div>

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
