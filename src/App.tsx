/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { 
  Heart, 
  MapPin, 
  Calendar, 
  Clock, 
  Copy, 
  Check, 
  Image as ImageIcon, 
  MessageSquare, 
  Gift, 
  Music, 
  Volume2, 
  VolumeX,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import confetti from 'canvas-confetti';

// --- Constants ---
const WEDDING_DATE = new Date('2026-06-02T09:00:00');
const BANK_ACCOUNTS = [
  {
    bankName: 'BCA',
    number: '2091070261',
    holder: 'Tia Khoerunnisa'
  },
  {
    bankName: 'Dana',
    number: '081944708949',
    holder: 'Tia Khoerunnisa'
  }
];
const BANK_NAME = 'Bank Central Asia (BCA)';
const ACCOUNT_HOLDER = 'Romeo & Juliet';

// --- Components ---

const CountdownTimer = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0, hours: 0, minutes: 0, seconds: 0
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const difference = WEDDING_DATE.getTime() - now.getTime();

      if (difference <= 0) {
        clearInterval(timer);
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex gap-4 md:gap-8 justify-center mt-8">
      {[
        { label: 'Days', value: timeLeft.days },
        { label: 'Hours', value: timeLeft.hours },
        { label: 'Mins', value: timeLeft.minutes },
        { label: 'Secs', value: timeLeft.seconds }
      ].map((item, idx) => (
        <div key={idx} className="flex flex-col items-center bg-white rounded-2xl border border-wedding-border p-5 md:p-6 min-w-20 md:min-w-28 shadow-md">
          <span className="text-4xl md:text-5xl font-serif text-wedding-primary mb-1">{item.value}</span>
          <span className="text-[10px] md:text-xs uppercase tracking-widest text-wedding-secondary font-bold">{item.label}</span>
        </div>
      ))}
    </div>
  );
};

const StoryTimeline = () => {
  const stories = [
    { year: '2020', title: 'The First Encounter', desc: 'Met in a quiet city library, a chance encounter that started a lifelong conversation.' },
    { year: '2022', title: 'Growing Closer', desc: 'Discovered a shared path and decided to walk it together hand in hand.' },
    { year: '2024', title: 'The Commitment', desc: 'Under the warmth of a setting sun, we chose our forever with a simple promise.' },
    { year: '2026', title: 'The Beginning', desc: 'A new chapter starts today, surrounded by the ones we love.' }
  ];

  return (
    <div className="relative mt-12 space-y-8 after:absolute after:inset-y-0 after:left-0 md:after:left-1/2 after:-ml-px after:w-px after:bg-wedding-border">
      {stories.map((story, idx) => (
        <div 
          key={idx} 
          className={`relative z-10 flex flex-col md:flex-row items-center gap-6 md:gap-12 ${idx % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}
          data-aos="fade-up"
        >
          <div className={`md:w-1/2 w-full pl-8 md:pl-0 flex justify-start ${idx % 2 === 0 ? 'md:justify-end md:text-right' : 'md:justify-start md:text-left'}`}>
            <div className="max-w-sm">
              <span className="text-wedding-primary font-serif italic text-sm mb-1 block">{story.year}</span>
              <h5 className="font-serif text-xl mb-2 text-[#333]">{story.title}</h5>
              <p className="text-wedding-secondary text-[11px] leading-relaxed uppercase tracking-wider">{story.desc}</p>
            </div>
          </div>
          <div className="absolute left-[-4px] md:left-1/2 md:-ml-[4px] top-0 w-2 h-2 bg-wedding-primary rounded-full ring-4 ring-wedding-bg"></div>
          <div className="md:w-1/2 hidden md:block"></div>
        </div>
      ))}
    </div>
  );
};

// --- Variants for Animations ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3,
      delayChildren: 0.5,
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 1.8,
      ease: [0.65, 0, 0.35, 1]
    }
  }
};

const nameVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 2,
      ease: [0.65, 0, 0.35, 1]
    }
  }
};

export default function App() {
  const namaTamu = new URLSearchParams(window.location.search).get('to') || 'Bapak/Ibu/Saudara/i';
  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [guestMessage, setGuestMessage] = useState('');
  const [messages, setMessages] = useState<{name: string, message: string, date: string}[]>([]);
  const [formErrors, setFormErrors] = useState<{name?: string; message?: string}>({});
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: false,
      mirror: true,
      easing: 'ease-out-cubic'
    });

    // Load messages from Supabase
    fetch('https://ijwvplcfljneboirjwvr.supabase.co/rest/v1/ucapan?order=created_at.desc', {
      method: 'GET',
      headers: {
        'apikey': 'sb_publishable_0bswJmpj_51qEJZNxlv4ug_tkfCR4Kn',
        'Authorization': 'Bearer sb_publishable_0bswJmpj_51qEJZNxlv4ug_tkfCR4Kn'
      }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const formattedMessages = data.map((item: any) => ({
            name: item.nama || 'Tamu',
            message: item.pesan || '',
            date: item.created_at ? new Date(item.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
          }));
          setMessages(formattedMessages);
        }
      })
      .catch(err => console.error("Failed to load messages from database:", err));

    const tryPlayAudio = () => {
      if (audioRef.current && !isPlaying) {
        audioRef.current.play()
          .then(() => setIsPlaying(true))
          .catch(() => {
            console.log("Autoplay blocked. Waiting for user interaction.");
          });
      }
    };

    tryPlayAudio();
    
    const handleFirstInteraction = () => {
      tryPlayAudio();
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
    };

    document.addEventListener('click', handleFirstInteraction);
    document.addEventListener('touchstart', handleFirstInteraction);

    return () => {
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
    };
  }, []); // Remove isPlaying from dependency to prevent loops

  const handleOpen = () => {
    // Play audio immediately for instant response
    if (audioRef.current) {
      audioRef.current.play().catch(e => console.log("Audio play failed:", e));
    }

    setIsOpen(true);
    setIsPlaying(true);
    
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(e => console.log("Video play failed:", e));
    }

    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#D4AF37', '#FFFBF0', '#F9F7F2']
    });
  };

  const toggleMusic = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play()
          .then(() => setIsPlaying(true))
          .catch(e => console.log("Toggle play failed:", e));
      }
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleGuestSubmit = async () => {
    const errors: {name?: string; message?: string} = {};
    if (!guestName.trim()) {
      errors.name = 'Nama lengkap harus diisi';
    }
    if (!guestMessage.trim()) {
      errors.message = 'Pesan atau doa harus diisi';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      const res = await fetch('https://ijwvplcfljneboirjwvr.supabase.co/rest/v1/ucapan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal',
          'apikey': 'sb_publishable_0bswJmpj_51qEJZNxlv4ug_tkfCR4Kn',
          'Authorization': 'Bearer sb_publishable_0bswJmpj_51qEJZNxlv4ug_tkfCR4Kn'
        },
        body: JSON.stringify({ nama: guestName, pesan: guestMessage })
      });

      if (!res.ok) throw new Error('Failed to post to Supabase');

      // Add new message to list locally so it appears immediately without refresh
      const newLocalMessage = {
        name: guestName,
        message: guestMessage,
        date: new Date().toISOString().split('T')[0]
      };
      
      setMessages(prev => [newLocalMessage, ...prev]);

      // Reset errors and clear form on success
      setFormErrors({});
      setGuestName('');
      setGuestMessage('');
      
      // Smooth scroll to top of section or show success state
      document.getElementById('buku-tamu')?.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
      console.error("Error submitting message:", error);
      alert('Maaf, terjadi kesalahan saat mengirim pesan.');
    }
  };

  return (
    <div className="min-h-screen">
      {/* Background Music */}
      <audio 
        ref={audioRef} 
        loop 
        autoPlay
        preload="auto"
        src="/assets/music/background.mp3" 
      />

      {/* Floating Music Toggle - Visible after open */}
      <AnimatePresence>
        {isOpen && (
          <motion.button 
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            onClick={toggleMusic}
            className="fixed top-6 right-6 z-[110] bg-white/80 backdrop-blur-md border border-wedding-border text-wedding-primary p-3 rounded-full shadow-sm hover:bg-wedding-accent transition-all group"
            aria-label={isPlaying ? "Pause Music" : "Play Music"}
          >
            <motion.div 
              animate={isPlaying ? { rotate: 360 } : { rotate: 0 }}
              transition={isPlaying ? { repeat: Infinity, duration: 4, ease: "linear" } : { duration: 0.5 }}
            >
              <Music size={18} className={isPlaying ? "text-wedding-primary" : "text-wedding-secondary opacity-50"} />
            </motion.div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Cover Overlay */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div 
            initial={{ y: 0, opacity: 1 }}
            exit={{ y: '-100%', opacity: 0 }}
            transition={{ duration: 1.5, ease: [0.65, 0, 0.35, 1] }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden"
          >
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 z-0">
              <img 
                src="/assets/images/gallery1.jpeg" 
                alt="Background" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px]"></div>
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60"></div>
            </div>
            
            <motion.div 
              className="relative z-10 text-center px-6"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div variants={itemVariants} className="mb-10">
                <div className="flex items-center justify-center gap-3">
                  <div className="w-8 h-px bg-wedding-secondary/50"></div>
                  <span className="tracking-[0.5em] text-xs text-white/90 uppercase font-bold drop-shadow-md">
                    The Wedding Invitation Of
                  </span>
                  <div className="w-8 h-px bg-wedding-secondary/50"></div>
                </div>
              </motion.div>

              <motion.h1 
                variants={nameVariants}
                className="font-serif italic text-7xl md:text-9xl text-white pb-6 drop-shadow-2xl"
              >
                Andri & Tia
              </motion.h1>

              <motion.div variants={itemVariants} className="mb-12">
                <p className="text-xs text-white/70 font-medium italic mt-6 tracking-[0.2em] uppercase">
                  Save The Date
                </p>
                 <div className="inline-block py-2 border-y border-wedding-secondary/30 px-6">
                  <p className="tracking-[0.4em] text-sm text-white font-bold uppercase">
                    Minggu 2 Juni 2026
                  </p>
                </div>
              </motion.div>
              
              <motion.div variants={itemVariants} className="pt-8 flex flex-col items-center gap-6">
                <div className="flex flex-col items-center gap-2">
                  <p className="text-xs text-white/80 font-medium tracking-[0.2em] uppercase">Kepada Yth,</p>
                  <p className="text-3xl md:text-5xl font-serif italic text-white font-bold capitalize drop-shadow-lg">{namaTamu}</p>
                </div>
                <motion.button 
                  onClick={handleOpen}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-wedding-secondary text-white px-14 py-4 rounded-full text-xs font-bold uppercase tracking-[0.4em] shadow-2xl hover:brightness-110 transition-all border border-white/10"
                >
                  Buka Undangan
                </motion.button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className={`transition-all duration-1000 ${isOpen ? 'opacity-100' : 'opacity-0 h-screen overflow-hidden'}`}>
        

        {/* Hero Section */}
        <section id="hero" className="relative h-screen w-full flex flex-col items-center justify-center text-center overflow-hidden bg-wedding-bg">
          {/* Main Hero Video */}
          <video 
            ref={videoRef}
            muted 
            playsInline
            preload="auto"
            disablePictureInPicture
            disableRemotePlayback
            className="absolute top-0 left-0 w-full h-full min-w-full min-h-full object-cover pointer-events-none"
            style={{ 
              transform: 'translate3d(0, 0, 0)', 
              willChange: 'transform',
              backfaceVisibility: 'hidden'
            }}
          >
            <source src="/assets/videos/intro2.mp4" type="video/mp4" />
          </video>
        </section>
        {/* Quran Verse Section */}
        <section className="section-padding bg-wedding-accent relative overflow-hidden">
          <div className="max-w-3xl mx-auto px-6 text-center" data-aos="fade-up">
            <div className="relative border border-wedding-secondary/30 rounded-3xl p-8 md:p-12 bg-white/40 backdrop-blur-sm shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)]">
              {/* Decorative corner elements */}
              <div className="absolute top-4 left-4 w-6 h-6 border-t border-l border-wedding-secondary/50 rounded-tl-xl"></div>
              <div className="absolute top-4 right-4 w-6 h-6 border-t border-r border-wedding-secondary/50 rounded-tr-xl"></div>
              <div className="absolute bottom-4 left-4 w-6 h-6 border-b border-l border-wedding-secondary/50 rounded-bl-xl"></div>
              <div className="absolute bottom-4 right-4 w-6 h-6 border-b border-r border-wedding-secondary/50 rounded-br-xl"></div>
              
              <div className="mb-8">
                <span className="font-serif text-5xl md:text-6xl text-wedding-primary">﷽</span>
              </div>
              <p className="text-[15px] md:text-lg text-wedding-primary/80 leading-relaxed font-medium mb-6 relative z-10">
                "Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu isteri-isteri dari jenismu sendiri, supaya kamu cenderung dan merasa tenteram kepadanya, dan dijadikan-Nya diantaramu rasa kasih dan sayang. Sesungguhnya pada yang demikian itu benar-benar terdapat tanda-tanda bagi kaum yang berfikir."
              </p>
              <p className="tracking-widest text-xs md:text-sm text-wedding-secondary font-bold uppercase">
                (QS. Ar-Rum: 21)
              </p>
            </div>
          </div>
        </section>

        {/* Profile Section */}
        <section id="profil" className="section-padding bg-wedding-bg relative">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-wedding-border to-transparent"></div>
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16" data-aos="fade-up">
              <span className="tracking-ultra text-xs text-wedding-secondary font-bold mb-3 block">Profil</span>
              <h2 className="text-5xl font-serif italic text-wedding-primary mb-4">Kedua Mempelai</h2>
              <div className="w-12 h-px bg-wedding-border mx-auto"></div>
            </div>

            <div className="grid md:grid-cols-2 gap-12 lg:gap-24 relative">
              {/* Bride */}
              <div className="flex flex-col items-center text-center space-y-6" data-aos="fade-up">
                <div className="w-48 h-64 rounded-[2rem] bg-wedding-accent overflow-hidden border border-wedding-border group shadow-sm">
                  <img src="/assets/images/gallery3.jpeg" className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700" alt="Andri" />
                </div>
                <div>
                  <h3 className="font-serif italic text-5xl mb-1 text-wedding-primary">Andri Herdiana</h3>
                  <p className="text-[13px] text-wedding-secondary font-bold tracking-widest">Putra dari Bapak Ade Iyus & Ibu Elin Marlina</p>
                </div>
              </div>

              {/* & Separator */}
              <div className="flex items-center justify-center md:absolute md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-10" data-aos="zoom-in" data-aos-delay="50">
                <div className="w-16 h-16 rounded-full bg-gray-200/50 backdrop-blur-md border border-white/40 shadow-[0_4px_15px_rgba(0,0,0,0.05)] flex items-center justify-center text-wedding-primary relative overflow-hidden group">
                  <div className="absolute inset-0 bg-wedding-accent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <span className="font-serif italic font-light text-5xl relative z-10">&amp;</span>
                </div>
              </div>

              {/* Groom */}
              <div className="flex flex-col items-center text-center space-y-6" data-aos="fade-up" data-aos-delay="100">
                <div className="w-48 h-64 rounded-[2rem] bg-wedding-accent overflow-hidden border border-wedding-border group shadow-sm">
                  <img src="/assets/images/gallery2.jpeg" className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700" alt="Tia" />
                </div>
                <div>
                  <h3 className="font-serif italic text-5xl mb-1 text-wedding-primary">Tia Khoerunnisa</h3>
                  <p className="text-[13px] text-wedding-secondary font-bold tracking-widest">Putra dari Bapak Budi Kurniawan & Ibu Ade Rin Rin</p>
                </div>
              </div>
            </div>
          </div>
        </section>


        {/* Events Section */}
        <section id="acara" className="section-padding bg-wedding-accent">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16" data-aos="fade-up">
              <span className="tracking-ultra text-[12px] text-wedding-secondary font-bold mb-3 block">Details</span>
              <h2 className="text-5xl font-serif italic text-wedding-primary mb-6">Lokasi Acara</h2>
              <div className="w-12 h-px bg-wedding-border mx-auto"></div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Event Card */}
              {[
                { 
                  title: 'Akad Nikah', 
                  time: '08:00 - 10:00 WIB', 
                  location: 'Gedung Al-Mukarramah, Manonjaya, Tasikmalaya',
                  mapUrl: 'https://maps.app.goo.gl/RSEPxMFNFayLmzAA6'
                },
                { 
                  title: 'Resepsi', 
                  time: '11:00 - 14:00 WIB', 
                  location: 'Gedung Al-Mukarramah, Manonjaya, Tasikmalaya',
                  mapUrl: 'https://maps.app.goo.gl/RSEPxMFNFayLmzAA6'
                }
              ].map((ev, i) => (
                <div key={i} className="bg-wedding-bg p-8 rounded-2xl border border-wedding-border text-center space-y-4" data-aos="fade-up" data-aos-delay={i * 100}>
                  <Heart className="w-7 h-7 text-wedding-primary mx-auto opacity-40" />
                  <h3 className="font-serif italic text-4xl text-wedding-primary">{ev.title}</h3>
                  <div className="text-[13px] text-wedding-secondary font-bold space-y-1">
                    <p>{ev.time}</p>
                    <p>{ev.location}</p>
                  </div>
                  <a 
                    href={ev.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full mt-4 border border-wedding-primary text-wedding-primary py-2 rounded-lg text-[11px] font-bold uppercase tracking-widest hover:bg-wedding-primary hover:text-white transition-all text-center"
                  >
                    Lihat Lokasi
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Countdown Section */}
        <section className="section-padding bg-wedding-accent relative overflow-hidden">
          {/* Subtle background decoration */}
          <div className="absolute top-[-10%] right-[-5%] w-64 h-64 bg-wedding-secondary/5 opacity-40 blur-3xl rounded-full"></div>
          <div className="absolute bottom-[-10%] left-[-5%] w-48 h-48 bg-wedding-primary/5 opacity-40 blur-3xl rounded-full"></div>
          
          <div className="max-w-4xl mx-auto relative z-10" data-aos="fade-up">
            <div className="mb-10">
              <span className="tracking-ultra text-[14px] text-wedding-secondary text-center font-bold mb-4 block">Save The Date</span>
              <div className="w-8 h-px bg-wedding-secondary/30 mx-auto"></div>
            </div>
            <CountdownTimer />
          </div>
        </section>

        {/* Gallery Section */}
        <section id="galeri" className="section-padding bg-wedding-bg">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16" data-aos="fade-up">
              <span className="tracking-ultra text-xs text-wedding-secondary font-bold mb-3 block">Memories</span>
              <h2 className="text-5xl font-serif italic text-wedding-primary mb-6">Galeri Foto</h2>
              <div className="w-12 h-px bg-wedding-border mx-auto"></div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <div key={n} className="bg-wedding-accent rounded-xl aspect-[3/4] overflow-hidden transition-all duration-700" data-aos="zoom-in">
                  <img 
                    src={`/assets/images/gallery${n}.jpeg`} 
                    className="w-full h-full object-cover" 
                    alt="Gallery" 
                    onError={(e) => {
                      e.currentTarget.src = `https://images.unsplash.com/photo-15${n}19225421980-715cb0215aed?q=80&w=2070&auto=format&fit=crop`;
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Guest Book Section */}
        <section id="buku-tamu" className="section-padding bg-wedding-accent">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-12" data-aos="fade-up">
              <span className="tracking-ultra text-xs text-wedding-secondary font-bold mb-3 block">Guestbook</span>
              <h2 className="text-5xl font-serif italic text-wedding-primary mb-4">Doa & Harapan</h2>
              <div className="w-8 h-px bg-wedding-border mx-auto"></div>
            </div>

            <div className="bg-wedding-bg p-6 rounded-2xl border border-wedding-border space-y-4" data-aos="fade-up">
              <div className="space-y-1">
                <input 
                  type="text" 
                  placeholder="Nama Lengkap" 
                  value={guestName}
                  onChange={(e) => {
                    setGuestName(e.target.value);
                    if (formErrors.name) setFormErrors(prev => ({ ...prev, name: undefined }));
                  }}
                  className={`w-full bg-white border ${formErrors.name ? 'border-red-400' : 'border-wedding-border'} text-[13px] p-4 rounded-xl outline-none focus:border-wedding-primary transition-all`} 
                />
                {formErrors.name && <p className="text-[10px] text-red-500 font-bold ml-2">{formErrors.name}</p>}
              </div>

              <div className="space-y-1">
                <textarea 
                  placeholder="Pesan & Doa Ucapan" 
                  value={guestMessage}
                  onChange={(e) => {
                    setGuestMessage(e.target.value);
                    if (formErrors.message) setFormErrors(prev => ({ ...prev, message: undefined }));
                  }}
                  className={`w-full bg-white border ${formErrors.message ? 'border-red-400' : 'border-wedding-border'} text-[13px] p-4 rounded-xl h-24 resize-none outline-none focus:border-wedding-primary transition-all`}
                ></textarea>
                {formErrors.message && <p className="text-[10px] text-red-500 font-bold ml-2">{formErrors.message}</p>}
              </div>

              <button 
                onClick={handleGuestSubmit}
                className="w-full bg-wedding-primary text-white py-4 rounded-xl text-xs font-bold uppercase tracking-ultra shadow-sm hover:bg-wedding-secondary transition-all"
              >
                Kirim Ucapan
              </button>
            </div>

            {/* Display Messages */}
            <div className="mt-10 space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {messages.map((msg, i) => (
                <div key={i} className="bg-white p-5 rounded-2xl border border-wedding-border shadow-sm" data-aos="fade-up">
                  <div className="flex justify-between items-start mb-2">
                    <h5 className="text-[13px] font-bold text-wedding-primary uppercase tracking-wider">{msg.name}</h5>
                    <span className="text-[10px] text-wedding-secondary opacity-60 font-medium">{msg.date}</span>
                  </div>
                  <p className="text-[14px] text-wedding-secondary italic leading-relaxed">"{msg.message}"</p>
                </div>
              ))}
              {messages.length === 0 && (
                <p className="text-center text-xs text-wedding-secondary italic opacity-50 py-10">Belum ada ucapan. Jadilah yang pertama memberikan doa!</p>
              )}
            </div>
          </div>
        </section>

        {/* Gift Section */}
        <section id="hadiah" className="section-padding bg-wedding-bg">
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-12" data-aos="fade-up">
              <span className="tracking-ultra text-xs text-wedding-secondary font-bold mb-3 block">Digital Envelope</span>
              <h2 className="text-5xl font-serif italic text-wedding-primary mb-4">Kado Pernikahan</h2>
              <div className="w-8 h-px bg-wedding-border mx-auto"></div>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {BANK_ACCOUNTS.map((acc, idx) => (
                <div key={idx} className="relative" data-aos="zoom-in" data-aos-delay={idx * 100}>
                  {/* BCA Card */}
                  <div className="w-full aspect-[1.58/1] bg-white rounded-2xl p-6 shadow-[0_15px_35px_rgba(0,0,0,0.06)] border border-gray-100 flex flex-col justify-between relative overflow-hidden group">
                    {/* Decorative background elements */}
                    <div className="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-gray-50/40 to-transparent pointer-events-none"></div>
                    <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-gray-50 rounded-full blur-3xl pointer-events-none"></div>
                    
                    {/* Top Section: Logo */}
                    <div className="flex justify-end relative z-10 h-5">
                      <img 
                        src={`/assets/images/${acc.bankName.toLowerCase()}-logo.svg`} 
                        alt={`${acc.bankName} Logo`} 
                        className="h-full object-contain drop-shadow-sm"
                      />
                    </div>
                    {/* Middle Section: Chip & Number */}
                    <div className="relative z-10 flex flex-col gap-3">
                      {/* Chip - Resized smaller */}
                      <div className="w-8 h-6 md:w-9 md:h-7 bg-gradient-to-br from-[#E2B659] via-[#F8E0A1] to-[#C19235] rounded-sm overflow-hidden shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] border border-[#B18933]/20">
                        <div className="w-full h-full opacity-40 grid grid-cols-3 grid-rows-3">
                          {[...Array(9)].map((_, i) => (
                            <div key={i} className="border-[0.2px] border-black/30"></div>
                          ))}
                        </div>
                      </div>

                      {/* Account Info */}
                      <div className="space-y-0.5">
                        <p className="text-[#374151] font-mono text-xl md:text-2xl tracking-[0.1em] font-medium">
                          {acc.number.match(/.{1,4}/g)?.join(' ')}
                        </p>
                        <p className="text-[#6B7280] text-xs md:text-[14px] font-sans uppercase tracking-[0.2em] font-bold opacity-80">
                          {acc.holder}
                        </p>
                      </div>
                    </div>
                    
                    {/* Bottom Section: Copy Button */}
                    <div className="flex justify-end relative z-10">
                      <button 
                        onClick={() => copyToClipboard(acc.number)}
                        className="flex items-center gap-2 bg-wedding-secondary hover:bg-wedding-primary text-white px-3.5 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all shadow-sm active:scale-95"
                      >
                        {isCopied ? (
                          <Check size={10} className="text-white" />
                        ) : (
                          <Copy size={10} className="text-white" />
                        )}
                        <span>{isCopied ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 text-center" data-aos="fade-up">
              <p className="text-xs text-wedding-secondary font-medium leading-relaxed italic opacity-80">
                Doa Restu Anda merupakan karunia yang sangat berarti bagi kami.<br/>
                Dan Jika memberi adalah ungkapan kasih Anda, kami ucapkan terima kasih.
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-20 border-t border-wedding-border text-center bg-wedding-accent px-6 relative overflow-hidden">
          {/* Decorative element */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-12 bg-gradient-to-b from-wedding-secondary/50 to-transparent"></div>
          
          <div className="max-w-4xl mx-auto flex flex-col items-center">
            {/* Footer Photo */}
            <div className="w-50 h-50 rounded-full overflow-hidden mb-8 border-4 border-white shadow-md mx-auto" data-aos="zoom-in">
              <img src="/assets/images/gallery1.jpeg" className="w-full h-full object-cover" alt="Andri & Tia" />
            </div>

            <h2 className="font-serif italic text-5xl md:text-6xl text-wedding-primary mb-10">Andri & Tia</h2>
            <div className="flex justify-center gap-6 mb-10 opacity-30">
              <Heart size={20} fill="currentColor" className="text-wedding-secondary" />
              <Heart size={20} fill="currentColor" className="text-wedding-secondary" />
              <Heart size={20} fill="currentColor" className="text-wedding-secondary" />
            </div>
            <p className="text-[11px] text-wedding-secondary uppercase tracking-[0.3em] font-medium opacity-60">&copy; 2026 The Wedding Journey • Andri & Tia</p>
          </div>
        </footer>

      </main>

      {/* Nav Menu (only mobile bottom fixed) */}
      {isOpen && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white/50 backdrop-blur-md border-t border-wedding-border flex justify-around py-3 px-4 z-[40] md:hidden">
          {[
            { id: 'hero', icon: <Heart size={18} />, label: 'Home' },
            { id: 'profil', icon: <Calendar size={18} />, label: 'Profile' },
            { id: 'acara', icon: <MapPin size={18} />, label: 'Event' },
            { id: 'galeri', icon: <ImageIcon size={18} />, label: 'Gallery' },
            { id: 'buku-tamu', icon: <MessageSquare size={18} />, label: 'Wishes' }
          ].map((item) => (
            <button 
              key={item.id}
              onClick={() => document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' })}
              className="flex flex-col items-center gap-1 text-wedding-secondary hover:text-wedding-primary transition-colors"
            >
              {item.icon}
              <span className="text-[10px] font-bold uppercase tracking-widest">{item.label}</span>
            </button>
          ))}
        </nav>
      )}
    </div>
  );
}
