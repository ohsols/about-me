import React, { useState, useEffect, useRef } from 'react';
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
  Code,
  AlignLeft,
  Sliders,
  Braces,
  Terminal,
  Github,
  Sun,
  Moon
} from 'lucide-react';


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
    name: 'JavaScript',
    level: 'Language',
    icon: <Braces className="w-4 h-4 text-yellow-500" />
  },
  {
    name: 'TypeScript',
    level: 'Language',
    icon: <Code className="w-4 h-4 text-blue-500" />
  },
  {
    name: 'Python',
    level: 'Language',
    icon: <Terminal className="w-4 h-4 text-emerald-500" />
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
  <div className="fixed inset-0 -z-10 overflow-hidden bg-white dark:bg-zinc-950 transition-colors duration-500">
    <motion.div 
      animate={{ 
        scale: [1, 1.1, 1],
        opacity: [0.3, 0.5, 0.3],
      }}
      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-50 dark:bg-blue-950/20 rounded-full blur-[120px]" 
    />
    <motion.div 
      animate={{ 
        scale: [1, 1.2, 1],
        opacity: [0.3, 0.5, 0.3],
      }}
      transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-50 dark:bg-purple-950/20 rounded-full blur-[120px]" 
    />
  </div>
);

const SpotifyProgress = ({ start, end, song, artist }: { start: number; end: number; song: string; artist: string; }) => {
  const [now, setNow] = useState(Date.now());
  const [lyrics, setLyrics] = useState<{ time: number; text: string }[] | null>(null);
  const [loadingLyrics, setLoadingLyrics] = useState(false);
  const [isSynced, setIsSynced] = useState(false);
  const [showFullLyrics, setShowFullLyrics] = useState(false);
  const [syncOffset, setSyncOffset] = useState(() => {
    try {
      const saved = localStorage.getItem('lyrics_sync_offset');
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });

  const lyricsContainerRef = useRef<HTMLDivElement>(null);
  const lyricElementsRef = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const update = () => setNow(Date.now());
    update();
    const interval = setInterval(update, 50);
    return () => clearInterval(interval);
  }, []);

  const handleOffsetChange = (newOffset: number) => {
    setSyncOffset(newOffset);
    try {
      localStorage.setItem('lyrics_sync_offset', newOffset.toString());
    } catch (e) {
      console.warn('Could not save offset', e);
    }
  };

  useEffect(() => {
    if (!song || !artist) return;
    const fetchLyrics = async () => {
      setLoadingLyrics(true);
      try {
        let syncedLyrics = null;
        let plainLyrics = null;
        
        // Clean up song title & artist for better match rates
        const cleanSong = song.replace(/\(feat\.?.*?\)/i, '').replace(/\(.*?remaster.*?\)/i, '').replace(/- \w+ Mix/i, '').trim();
        const cleanArtist = artist.split(/,|\/|&|feat\.?/i)[0].trim();
        
        // 1. Try exact raw match
        let res = await fetch(`https://lrclib.net/api/get?track_name=${encodeURIComponent(song)}&artist_name=${encodeURIComponent(artist)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.syncedLyrics) syncedLyrics = data.syncedLyrics;
          if (data.plainLyrics) plainLyrics = data.plainLyrics;
        } else {
          // Try clean exact match
          res = await fetch(`https://lrclib.net/api/get?track_name=${encodeURIComponent(cleanSong)}&artist_name=${encodeURIComponent(cleanArtist)}`);
          if (res.ok) {
            const data = await res.json();
            if (data.syncedLyrics) syncedLyrics = data.syncedLyrics;
            if (data.plainLyrics) plainLyrics = data.plainLyrics;
          }
        }

        // 2. Try search fallback (useful for fuzzy matching)
        if (!syncedLyrics && !plainLyrics) {
          const searchRes = await fetch(`https://lrclib.net/api/search?q=${encodeURIComponent(cleanArtist + ' ' + cleanSong)}`);
          if (searchRes.ok) {
            const searchData = await searchRes.json();
            const match = searchData.find((track: any) => track.syncedLyrics || track.plainLyrics);
            if (match) {
              syncedLyrics = match.syncedLyrics;
              plainLyrics = match.plainLyrics;
            }
          }
        }

        if (syncedLyrics) {
          const lines = syncedLyrics.split('\n').map((line: string) => {
            const match = line.match(/\[(\d{1,2}):(\d{2})(?:\.(\d{2,3}))?\](.*)/);
            if (match) {
              const m = parseInt(match[1], 10);
              const s = parseInt(match[2], 10);
              const msStr = match[3] || '0';
              const ms = msStr.length === 2 ? parseInt(msStr, 10) * 10 : parseInt(msStr, 10);
              const time = m * 60000 + s * 1000 + ms;
              return { time, text: match[4].trim() };
            }
            return null;
          }).filter(Boolean) as { time: number; text: string }[];
          
          setLyrics([{ time: 0, text: '♪' }, ...lines]);
          setIsSynced(true);
        } else if (plainLyrics) {
          const lines = plainLyrics.split('\n').map((text: string) => ({ time: -1, text: text.trim() }));
          setLyrics(lines);
          setIsSynced(false);
        } else {
          setLyrics(null);
          setIsSynced(false);
        }
      } catch (e) {
        console.warn('Could not fetch lyrics', e);
        setLyrics(null);
        setIsSynced(false);
      } finally {
        setLoadingLyrics(false);
      }
    };
    
    // Reset lyrics and status to prevent visual flashing of other songs
    setLyrics(null);
    setIsSynced(false);
    fetchLyrics();
  }, [song, artist]);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(Math.max(0, ms) / 1000);
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const progressMs = start ? now - start : 0;
  const durationMs = (start && end) ? end - start : 0;
  const progressPercent = durationMs > 0 ? Math.min(100, Math.max(0, (progressMs / durationMs) * 100)) : 0;

  // Determine active index for synced lyrics
  let activeIndex = -1;
  let currentLyricText = '';
  if (lyrics && isSynced) {
    const adjustedProgressMs = progressMs + syncOffset;
    for (let i = 0; i < lyrics.length; i++) {
      if (lyrics[i].time <= adjustedProgressMs) {
        activeIndex = i;
      } else {
        break;
      }
    }
    if (activeIndex >= 0) {
      currentLyricText = lyrics[activeIndex].text;
    }
  }

  // Auto-scroll full lyrics container to center active lyric
  useEffect(() => {
    if (isSynced && activeIndex >= 0 && lyricElementsRef.current[activeIndex] && lyricsContainerRef.current) {
      const activeElement = lyricElementsRef.current[activeIndex];
      const container = lyricsContainerRef.current;
      
      const elementTop = activeElement.offsetTop;
      const elementHeight = activeElement.offsetHeight;
      const containerHeight = container.offsetHeight;
      
      container.scrollTo({
        top: elementTop - containerHeight / 2 + elementHeight / 2,
        behavior: 'smooth'
      });
    }
  }, [activeIndex, isSynced]);

  return (
    <div className="w-full mt-3 flex flex-col gap-1.5 transition-all">
      {/* Inline Single Line Lyric Preview */}
      {lyrics && isSynced && !showFullLyrics && (
        <div className="flex justify-center items-center h-4 w-full overflow-hidden relative mb-1">
          <AnimatePresence mode="popLayout">
            <motion.span
              key={currentLyricText}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="text-[11px] font-bold text-zinc-600 dark:text-zinc-300 line-clamp-1 italic absolute w-full text-center"
            >
              {currentLyricText || '♪'}
            </motion.span>
          </AnimatePresence>
        </div>
      )}

      {/* Progress Bar */}
      <div className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-850 rounded-full overflow-hidden">
        <div 
          className="h-full bg-green-500 rounded-full transition-all duration-100 ease-linear" 
          style={{ width: `${progressPercent}%` }} 
        />
      </div>

      {/* Timestamps and Toggle Lyrics control */}
      <div className="w-full flex justify-between items-center text-[10px] font-bold text-zinc-400 dark:text-zinc-550 font-mono">
        <span>{formatTime(progressMs)}</span>
        
        {/* Toggle Lyrics Button */}
        {lyrics ? (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowFullLyrics(!showFullLyrics);
            }}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30 border border-green-200 dark:border-green-800/30 transition-all cursor-pointer select-none font-bold text-[9px] uppercase tracking-wider"
          >
            <AlignLeft className="w-2.5 h-2.5" />
            {showFullLyrics ? 'Hide Lyrics' : 'Show Lyrics'}
          </button>
        ) : loadingLyrics ? (
          <span className="text-[9px] text-zinc-400 dark:text-zinc-550 uppercase tracking-wider flex items-center gap-1 animate-pulse">
            <Sparkles className="w-2.5 h-2.5 animate-spin" />
            Finding Lyrics...
          </span>
        ) : null}

        <span>{formatTime(durationMs)}</span>
      </div>

      {/* Sync calibration sliders when showing full synced lyrics */}
      {isSynced && showFullLyrics && (
        <div className="flex flex-col gap-1.5 p-2 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-black/[0.02] dark:border-white/5 mt-2 animate-fadeIn">
          <div className="flex items-center justify-between w-full text-[9px] font-black text-zinc-400 dark:text-zinc-550 uppercase tracking-widest px-1">
            <span className="flex items-center gap-1"><Sliders className="w-2.5 h-2.5" /> Sync Offset</span>
            <span className="text-green-600 dark:text-green-400 font-mono font-bold">
              {syncOffset === 0 ? 'Perfect Sync' : `${syncOffset > 0 ? '+' : ''}${(syncOffset / 1000).toFixed(1)}s`}
            </span>
          </div>
          <div className="flex items-center gap-1.5 w-full">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleOffsetChange(Math.max(-10000, syncOffset - 500));
              }}
              className="flex-1 py-1 rounded-md bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700/50 border border-black/[0.04] dark:border-white/5 text-[9.5px] font-black text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-all cursor-pointer"
            >
              -0.5s
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleOffsetChange(Math.max(-10000, syncOffset - 100));
              }}
              className="flex-1 py-1 rounded-md bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700/50 border border-black/[0.04] dark:border-white/5 text-[9.5px] font-black text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-all cursor-pointer"
            >
              -0.1s
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleOffsetChange(0);
              }}
              disabled={syncOffset === 0}
              className="px-2.5 py-1 rounded-md bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700/50 border border-black/[0.04] dark:border-white/5 text-[9.5px] font-black text-zinc-400 dark:text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 disabled:opacity-40 transition-all cursor-pointer"
            >
              Reset
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleOffsetChange(Math.min(10000, syncOffset + 100));
              }}
              className="flex-1 py-1 rounded-md bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700/50 border border-black/[0.04] dark:border-white/5 text-[9.5px] font-black text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-all cursor-pointer"
            >
              +0.1s
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleOffsetChange(Math.min(10000, syncOffset + 500));
              }}
              className="flex-1 py-1 rounded-md bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700/50 border border-black/[0.04] dark:border-white/5 text-[9.5px] font-black text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-all cursor-pointer"
            >
              +0.5s
            </button>
          </div>
        </div>
      )}

      {/* Expanded scrolling lyrics container */}
      <AnimatePresence>
        {showFullLyrics && lyrics && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 240 }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 150 }}
            className="w-full mt-2 rounded-xl bg-zinc-50/50 dark:bg-zinc-900/40 border border-black/[0.03] dark:border-white/5 overflow-hidden flex flex-col animate-fadeIn"
          >
            <div 
              ref={lyricsContainerRef}
              className="flex-1 overflow-y-auto py-20 px-4 scroll-smooth scrollbar-none flex flex-col gap-1 relative"
              style={{ contentVisibility: 'auto' }}
            >
              {isSynced ? (
                lyrics.map((line, idx) => {
                  const isActive = idx === activeIndex;
                  const isPast = idx < activeIndex;
                  return (
                    <button
                      key={idx}
                      ref={el => { lyricElementsRef.current[idx] = el; }}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        // Adjust the timing offset so this line becomes active instantly (highly engaging/intuitive way to lock sync!)
                        const lineTargetOffset = line.time - progressMs;
                        handleOffsetChange(lineTargetOffset);
                      }}
                      className={`w-full text-center py-2 px-3 rounded-lg transition-all duration-300 block outline-none select-none cursor-pointer ${
                        isActive 
                          ? 'text-green-500 font-extrabold text-[13.5px] scale-[1.03] drop-shadow-sm' 
                          : isPast 
                            ? 'text-zinc-500/80 dark:text-zinc-500 font-bold text-[12px]' 
                            : 'text-zinc-350 dark:text-zinc-600 hover:text-zinc-400 dark:hover:text-zinc-400 font-semibold text-[12px]'
                      }`}
                    >
                      {line.text || '♪'}
                    </button>
                  );
                })
              ) : (
                // Non-synced Plain lyrics fallback
                lyrics.map((line, idx) => (
                  <div 
                    key={idx}
                    className="w-full text-center py-1.5 px-3 text-zinc-600 dark:text-zinc-300 font-semibold text-[12px]"
                  >
                    {line.text}
                  </div>
                ))
              )}
            </div>
            
            {/* Plain Lyrics Indicator */}
            {!isSynced && (
              <div className="w-full py-1 text-center bg-zinc-100 dark:bg-zinc-800 border-t border-black/[0.02] dark:border-white/5 text-[8px] font-black uppercase text-zinc-400 dark:text-zinc-500 tracking-wider">
                Plain text lyrics (not synced)
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ProfileView: React.FC<{ discordId: string }> = ({ discordId }) => {
  const [mounted, setMounted] = useState(false);
  const [presence, setPresence] = useState<any>(null);

  useEffect(() => {
    setMounted(true);

    // Initial fetch from REST API for instantaneous load & absolute robustness
    const fetchPresenceREST = async () => {
      try {
        const res = await fetch(`https://api.lanyard.rest/v1/users/${discordId}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            setPresence(json.data);
          }
        }
      } catch (err) {
        console.warn('REST presence fetch failed:', err);
      }
    };

    fetchPresenceREST();

    // Setup periodic polling interval as solid fallback (useful under iframe/websocket blocks)
    const pollInterval = setInterval(fetchPresenceREST, 5000);

    let ws: WebSocket;
    let heartbeatInterval: NodeJS.Timeout;

    const connectWebSocket = () => {
      ws = new WebSocket('wss://api.lanyard.rest/socket');

      ws.onmessage = (event) => {
        try {
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
              // Extract data if it is wrapped in an ID keyed map
              if (d && typeof d === 'object') {
                if (d[discordId]) {
                  setPresence(d[discordId]);
                } else {
                  setPresence(d);
                }
              }
            }
          }
        } catch (e) {
          console.warn('Error parsing websocket payload:', e);
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
      clearInterval(pollInterval);
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

  // Support both direct presence shape and ID-wrapped shape
  const data = (presence && typeof presence === 'object' && presence[discordId]) ? presence[discordId] : presence;

  const discordUser = data?.discord_user;
  const status = data?.discord_status || 'offline';
  const activities = data?.activities || [];
  
  const hasSpotifyActivity = activities.some((a: any) => a.name === 'Spotify' || a.type === 2);
  const isListening = !!data?.listening_to_spotify || hasSpotifyActivity;

  let spotify = data?.spotify;
  if (!spotify && hasSpotifyActivity) {
    const spotifyAct = activities.find((a: any) => a.name === 'Spotify' || a.type === 2);
    if (spotifyAct) {
      let albumArt = '';
      if (spotifyAct.assets?.large_image) {
        if (spotifyAct.assets.large_image.startsWith('spotify:')) {
          albumArt = `https://i.scdn.co/image/${spotifyAct.assets.large_image.replace('spotify:', '')}`;
        } else {
          albumArt = spotifyAct.assets.large_image;
        }
      }
      spotify = {
        song: spotifyAct.details,
        artist: spotifyAct.state,
        album_art_url: albumArt,
        track_id: spotifyAct.sync_id || (spotifyAct.assets?.large_image?.startsWith('spotify:') ? spotifyAct.assets.large_image.replace('spotify:', '') : ''),
        timestamps: spotifyAct.timestamps
      };
    }
  }

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
            <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest whitespace-nowrap">Partners</span>
            <div className="h-px w-full bg-black/[0.05] dark:bg-white/5 md:hidden"></div>
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
                className="flex flex-col items-center gap-2 p-3 rounded-2xl border border-transparent bg-transparent hover:bg-white dark:hover:bg-zinc-900 hover:border-black/5 dark:hover:border-white/5 transition-all group hover:shadow-sm"
              >
                <div className="relative">
                  <div className="absolute -inset-1 bg-black/5 dark:bg-white/5 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <img 
                    src={partner.avatar} 
                    alt={partner.name}
                    className="relative w-10 h-10 rounded-full border border-transparent group-hover:border-black/5 dark:group-hover:border-white/5 object-cover transition-all"
                  />
                </div>
                <div className="text-center overflow-hidden w-full">
                  <h4 className="text-[10px] font-bold text-zinc-800 dark:text-zinc-300 truncate lowercase">{partner.name}</h4>
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
                    <div className="relative bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/5 px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-3 max-w-[220px]">
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
                        <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300 leading-snug text-left italic">
                          "{customStatusText}"
                        </span>
                      )}
                      {/* Tail */}
                      <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-white dark:bg-zinc-900 border-b border-l border-black/5 dark:border-white/5 rounded-full transform -rotate-45 shadow-sm" />
                      <div className="absolute -bottom-3 -left-3 w-1.5 h-1.5 bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/5 rounded-full" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="relative">
                {discordUser?.avatar ? (
                  <img 
                    src={`https://cdn.discordapp.com/avatars/${discordId}/${discordUser.avatar}.${discordUser.avatar.startsWith('a_') ? 'gif' : 'png'}?size=256`}
                    alt="Avatar" 
                    className="relative w-24 h-24 rounded-full border border-black/5 dark:border-white/5 bg-white dark:bg-zinc-900 object-cover shadow-xl"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full border border-black/5 dark:border-white/5 bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center shadow-xl overflow-hidden relative">
                    <img 
                      src={discordUser ? `https://cdn.discordapp.com/embed/avatars/${(parseInt(discordId) >> 22) % 6}.png` : "https://cdn.discordapp.com/embed/avatars/0.png"} 
                      className="w-full h-full object-cover" 
                      alt="Default Avatar"
                    />
                  </div>
                )}
                <div className={`absolute bottom-[-2px] right-[-2px] h-7 w-7 hover:w-24 rounded-full border-[3px] border-white dark:border-zinc-950 ${statusColors[status] || statusColors.offline} flex items-center transition-all duration-300 overflow-hidden group/status`}>
                  <div className="w-7 h-7 flex-shrink-0" />
                  <span className="text-white font-bold uppercase tracking-wider whitespace-nowrap opacity-0 group-hover/status:opacity-100 pr-3 -ml-7 pl-7 text-[10px] transition-all duration-300">
                    {status}
                  </span>
                </div>
              </div>
            </div>
            
            <h1 className="text-3xl font-black tracking-tighter mb-2 flex flex-col items-center gap-1">
              <div className="flex items-center gap-3">
                <span className="relative text-zinc-900 dark:text-zinc-100">
                  <span className="animate-rainbow bg-clip-text text-transparent bg-[length:400%_100%] drop-shadow-sm">
                    {discordId === '1500907003575537776' ? "var's alt acc" : (discordUser?.global_name || discordUser?.username || 'Unknown')}
                  </span>
                </span>
              </div>
              {discordUser?.username && (
                <span className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 opacity-60 tracking-tight -mt-1">
                  @{discordUser.username}
                </span>
              )}
            </h1>

            {/* Little Skills Icons under Username */}
            <div className="flex items-center justify-center gap-2 mt-2">
              {SKILLS.map((skill) => (
                <div key={skill.name} className="relative group/tooltip">
                  <div 
                    className="w-7 h-7 rounded-lg bg-zinc-100/50 hover:bg-zinc-100 dark:bg-zinc-900/50 dark:hover:bg-zinc-800 border border-black/[0.03] dark:border-white/5 flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100 hover:scale-110 transition-all cursor-help"
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
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.8 }}
            className={`w-full p-4 rounded-2xl border border-black/[0.05] dark:border-white/5 bg-white dark:bg-zinc-900 flex flex-col shadow-sm transition-all mb-12 ${isListening ? 'hover:shadow-md' : ''}`}
          >
            <a 
              href={isListening && spotify?.track_id ? `https://open.spotify.com/track/${spotify.track_id}` : undefined}
              target={isListening ? "_blank" : undefined}
              rel="noopener noreferrer"
              className={`flex items-center gap-4 w-full group ${isListening ? 'cursor-pointer' : 'cursor-default'}`}
            >
              <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-zinc-100 dark:bg-zinc-850">
                {isListening && spotify?.album_art_url ? (
                  <img src={spotify.album_art_url} alt="Album Art" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
                    <div className="w-6 h-6 rounded-lg bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
                  </div>
                )}
              </div>
              <div className="flex-1 overflow-hidden">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-full transition-colors ${isListening ? 'bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 border border-green-100 dark:border-green-800/30 group-hover:bg-green-100 dark:group-hover:bg-green-900/30' : 'bg-zinc-50 dark:bg-zinc-950 text-zinc-400 dark:text-zinc-500 border border-zinc-100 dark:border-white/5'}`}>
                    {isListening ? 'Currently Listening' : 'Not Listening'}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate leading-tight transition-colors group-hover:text-green-600 dark:group-hover:text-green-400 text-left">
                  {isListening ? spotify?.song : 'Spotify'}
                </h4>
                <p className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 truncate mt-0.5 uppercase tracking-tight text-left">
                  {isListening ? `by ${spotify?.artist}` : 'No music playing'}
                </p>
              </div>
              {isListening && (
                <div className="flex items-end gap-[3px] h-4 mb-1">
                  {[...Array(4)].map((_, i) => (
                    <div 
                      key={i}
                      className="w-1 bg-green-500/40 rounded-full transition-colors group-hover:bg-green-500/60 dark:group-hover:bg-green-400"
                      style={{ 
                        height: '8px',
                        animation: `music-bar 0.8s ease-in-out infinite`,
                        animationDelay: `${i * 0.15}s`
                      }}
                    />
                  ))}
                </div>
              )}
            </a>
            {isListening && spotify?.timestamps && (
              <SpotifyProgress 
                start={spotify.timestamps.start} 
                end={spotify.timestamps.end} 
                song={spotify.song} 
                artist={spotify.artist} 
              />
            )}
          </motion.div>

          {/* Socials & Projects Section */}
          <div className="w-full flex flex-col md:flex-row gap-8 mb-12">
            {/* Socials */}
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-4 mb-2">
                <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest whitespace-nowrap">Socials</span>
                <div className="h-px w-full bg-black/[0.05] dark:bg-white/5"></div>
              </div>
              
              <div className="flex flex-col gap-3">
                {/* Instagram Widget */}
                <motion.a
                  href={discordId === '924403274692575263' ? "https://www.instagram.com/vee.iive/" : "https://www.instagram.com/ohsols/"}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-4 p-4 rounded-2xl border border-transparent bg-transparent hover:bg-gradient-to-br hover:from-purple-50 hover:to-pink-50 dark:hover:from-purple-950/20 dark:hover:to-pink-950/20 hover:border-black/[0.05] dark:hover:border-white/5 transition-all group hover:shadow-md"
                >
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-800 flex items-center justify-center text-pink-500 shadow-sm transition-all group-hover:rotate-6">
                    <Instagram className="w-5 h-5" />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 transition-colors">Instagram</h3>
                    <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                      {discordId === '924403274692575263' ? '@vee.iive' : '@ohsols'}
                    </p>
                  </div>
                </motion.a>

                {/* Discord Widget */}
                <motion.a
                  href="https://discord.gg/czone"
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center gap-4 p-4 rounded-2xl border border-transparent bg-transparent hover:bg-gradient-to-br hover:from-indigo-50 hover:to-blue-50 dark:hover:from-indigo-950/20 dark:hover:to-blue-950/20 hover:border-black/[0.05] dark:hover:border-white/5 transition-all group hover:shadow-md"
                >
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-800 flex items-center justify-center text-[#5865F2] shadow-sm transition-all group-hover:scale-110 overflow-hidden">
                    <svg viewBox="0 0 127.14 96.36" className="w-5 h-5 fill-current">
                      <path d="M107.7,8.07A105.15,105.15,0,0,0,77.26,0a77.19,77.19,0,0,0-3.3,6.83A96.67,96.67,0,0,0,53.22,6.83,77.19,77.19,0,0,0,49.88,0,105.15,105.15,0,0,0,19.44,8.07C3.66,31.58-1.86,54.65,1,77.53A105.73,105.73,0,0,0,32,96.36a77.7,77.7,0,0,0,6.63-10.85,68.43,68.43,0,0,1-10.4-5c.87-.64,1.71-1.34,2.51-2a75.58,75.58,0,0,0,72.7,0c.8,2.07,1.64,2.77,2.51,2a68.43,68.43,0,0,1-10.4,5,77.7,77.7,0,0,0,6.63,10.85,105.73,105.73,0,0,0,31-18.83C129.87,48.5,123.6,25.68,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53S36.18,40.36,42.45,40.36,53.83,46,53.83,53,48.72,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.24,60,73.24,53S78.41,40.36,84.69,40.36,96.07,46,96.07,53,91,65.69,84.69,65.69Z" />
                    </svg>
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 transition-colors">Discord</h3>
                    <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Discord.gg/czone</p>
                  </div>
                </motion.a>

                {/* GitHub Widget */}
                <motion.a
                  href="https://github.com/ohsols"
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.25 }}
                  className="flex items-center gap-4 p-4 rounded-2xl border border-transparent bg-transparent hover:bg-gradient-to-br hover:from-zinc-50 hover:to-zinc-200 dark:hover:from-zinc-800/30 dark:hover:to-zinc-700/30 hover:border-black/[0.05] dark:hover:border-white/5 transition-all group hover:shadow-md"
                >
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-800 flex items-center justify-center text-zinc-900 dark:text-zinc-100 shadow-sm transition-all group-hover:scale-110 overflow-hidden">
                    <Github className="w-5 h-5" />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 transition-colors">GitHub</h3>
                    <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">github.com/ohsols</p>
                  </div>
                </motion.a>
              </div>
            </div>

            {/* Projects */}
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-4 mb-2">
                <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest whitespace-nowrap">Projects</span>
                <div className="h-px w-full bg-black/[0.05] dark:bg-white/5"></div>
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
                    className="flex flex-col gap-4 p-4 rounded-2xl border border-transparent bg-transparent hover:bg-white dark:hover:bg-zinc-900 hover:border-black/5 dark:hover:border-white/5 transition-all group hover:shadow-md h-full"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-800 flex items-center justify-center shadow-sm transition-all">
                        {project.icon}
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate transition-colors">{project.title}</h3>
                      </div>
                      <ChevronRight className="w-4 h-4 text-zinc-300 dark:text-zinc-650 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 group-hover:translate-x-1 transition-all" />
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

const CustomCursor: React.FC = () => {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;

    let mouseX = -100;
    let mouseY = -100;
    let currentX = -100;
    let currentY = -100;
    let isTouch = false;

    const onMouseMove = (e: MouseEvent) => {
      if (isTouch) return;
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursor.style.opacity = '1';
    };

    const onMouseLeave = () => {
      cursor.style.opacity = '0';
    };

    const onMouseEnter = () => {
      if (isTouch) return;
      cursor.style.opacity = '1';
    };

    const onTouchStart = () => {
      isTouch = true;
      cursor.style.opacity = '0';
    };

    const onTouchEnd = () => {
      // Keep hidden on touch end
      cursor.style.opacity = '0';
    };

    const render = () => {
      const dx = mouseX - currentX;
      const dy = mouseY - currentY;
      
      currentX += dx * 0.25;
      currentY += dy * 0.25;

      if (cursor) {
        cursor.style.left = `${currentX}px`;
        cursor.style.top = `${currentY}px`;
      }
      requestAnimationFrame(render);
    };

    const onMouseOver = (e: MouseEvent) => {
      if (isTouch) return;
      const target = e.target as HTMLElement;
      if (target.closest('a, button, [role="button"], input, select, textarea, .cursor-pointer')) {
        cursor.classList.add('scale-[1.35]');
      } else {
        cursor.classList.remove('scale-[1.35]');
      }
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);
    window.addEventListener('mouseover', onMouseOver, { passive: true });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });

    const animId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
      window.removeEventListener('mouseover', onMouseOver);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchend', onTouchEnd);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div
      ref={cursorRef}
      className="fixed pointer-events-none z-[9999] w-10 h-10 -translate-x-1/2 -translate-y-1/2 transition-transform duration-150 ease-out opacity-0 block"
      style={{
        left: '-100px',
        top: '-100px',
        willChange: 'left, top',
      }}
    >
      <img
        src="https://i.pinimg.com/originals/8d/d1/76/8dd176c04a07c37b80a640dbc73382ff.gif"
        alt="Custom Cursor"
        className="w-full h-full object-contain"
        referrerPolicy="no-referrer"
      />
    </div>
  );
};

const App: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem('theme');
      if (saved === 'dark' || saved === 'light') return saved;
      return 'dark';
    } catch {
      return 'dark';
    }
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('theme', theme);
    } catch {}
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  if (!mounted) return null;

  return (
    <div className="min-h-screen text-zinc-600 dark:text-zinc-400 font-sans selection:bg-blue-50 dark:selection:bg-zinc-800 selection:text-blue-600 dark:selection:text-zinc-200 relative overflow-x-hidden transition-colors duration-300">
      <BackgroundEffect />
      <CustomCursor />
      
      {/* Floating Theme Toggle */}
      <div className="absolute top-6 right-6 z-50">
        <button
          onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}
          className="p-3 rounded-full bg-white/80 dark:bg-zinc-900/80 hover:bg-white dark:hover:bg-zinc-900 border border-black/[0.05] dark:border-white/5 text-zinc-800 dark:text-zinc-200 hover:text-zinc-950 dark:hover:text-white hover:scale-105 active:scale-95 shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-center"
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
        >
          {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </button>
      </div>

      <div className="relative z-10 w-full flex min-h-[90vh] items-center justify-center p-6">
        <div className="w-full self-start">
          <ProfileView discordId="1448507472552661126" />
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
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.15s ease-out forwards;
        }
        .scrollbar-none {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-none::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default App;
