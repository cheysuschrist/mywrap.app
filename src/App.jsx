import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Share2, Plus, Trash2, ArrowRight, ArrowLeft, Sparkles, Volume2, VolumeX, Upload, X, Star, Edit3, ImagePlus, Book, Plane, Heart, GraduationCap, Film, Dumbbell, Lock, Bell, Check, ChevronRight } from 'lucide-react';

export default function App() {
  const [step, setStep] = useState('home');
  const [title, setTitle] = useState('');
  const [dateRange, setDateRange] = useState('');
  const [coverImage, setCoverImage] = useState(null);
  const [selectedMood, setSelectedMood] = useState('twilight');
  const [stats, setStats] = useState([{ label: '', value: '', image: null, note: '', isHighlight: false }]);
  const [badges, setBadges] = useState([]);
  const [reflection, setReflection] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedMusic, setSelectedMusic] = useState('');
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [viewedHighlights, setViewedHighlights] = useState(new Set());
  const [viewedBadges, setViewedBadges] = useState(new Set());
  const [viewedReflection, setViewedReflection] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(null);
  const [slideDirection, setSlideDirection] = useState('next');
  const [isAnimating, setIsAnimating] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [auraOffset, setAuraOffset] = useState(0);
  const [validationErrors, setValidationErrors] = useState({});
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  
  // Transition system
  const [transitions, setTransitions] = useState({});
  const [showTransitionPicker, setShowTransitionPicker] = useState(null);
  const [activeTransition, setActiveTransition] = useState(null);
  const [drumrollCount, setDrumrollCount] = useState(0);
  
  // Homepage state
  const [notifyEmail, setNotifyEmail] = useState('');
  const [emailSubmitted, setEmailSubmitted] = useState(false);

  const coverRef = useRef(null);
  const audioRef = useRef(null);

  const transitionTypes = [
    { id: 'default', name: 'Smooth Slide', description: 'Clean slide transition' },
    { id: 'drumroll', name: 'Drumroll Please', description: '3-2-1 countdown reveal' },
    { id: 'impact', name: 'Impact', description: 'Dramatic drop-in effect' },
  ];


  const templates = [
    { id: 'romance', name: 'Romance', icon: Heart, color: '#ec4899', mood: 'crimson',
      stats: [{ label: 'Favorite Moment', value: '', isHighlight: true }, { label: 'Dates', value: '', isHighlight: false }, { label: 'Biggest Romantic Discovery', value: '', isHighlight: false }] },
    { id: 'books', name: 'Books', icon: Book, color: '#8b5cf6', mood: 'twilight',
      stats: [{ label: 'Favorite Book', value: '', isHighlight: true }, { label: 'Books Read', value: '', isHighlight: false }, { label: 'Pages Read', value: '', isHighlight: false }, { label: 'Authors Discovered', value: '', isHighlight: false }] },
    { id: 'travel', name: 'Travel', icon: Plane, color: '#06b6d4', mood: 'aurora',
      stats: [{ label: 'Favorite Travel Moment', value: '', isHighlight: true }, { label: 'Places Visited', value: '', isHighlight: false }, { label: 'Favorite Photo Taken', value: '', isHighlight: false }] },
    { id: 'study', name: 'Study', icon: GraduationCap, color: '#10b981', mood: 'ocean',
      stats: [{ label: 'Biggest Breakthrough', value: '', isHighlight: true }, { label: 'Favorite Time to Study', value: '', isHighlight: false }, { label: 'Biggest Accomplishment', value: '', isHighlight: false }] },
    { id: 'movies', name: 'Movies', icon: Film, color: '#f59e0b', mood: 'bronzed',
      stats: [{ label: 'Favorite Movie', value: '', isHighlight: true }, { label: 'Movies Watched', value: '', isHighlight: false }, { label: 'Least Favorite Movie', value: '', isHighlight: false }, { label: 'Most Watched Genre', value: '', isHighlight: false }] },
    { id: 'fitness', name: 'Fitness', icon: Dumbbell, color: '#ef4444', mood: 'midnight',
      stats: [{ label: 'Personal Record', value: '', isHighlight: true }, { label: 'Biggest Accomplishment', value: '', isHighlight: false }, { label: 'Next Fitness Goal', value: '', isHighlight: false }] },
  ];

  const moods = [
    { id: 'crimson', name: 'Crimson Glow', colors: ['#dc2626', '#ec4899'], bgColors: ['#450a0a', '#831843', '#4a044e'], description: 'Warm, intimate, passionate' },
    { id: 'bronzed', name: 'Bronzed', colors: ['#d97706', '#fbbf24'], bgColors: ['#451a03', '#78350f', '#422006'], description: 'Luxurious, radiant, golden' },
    { id: 'forest', name: 'Forest Mist', colors: ['#16a34a', '#14b8a6'], bgColors: ['#052e16', '#134e4a', '#042f2e'], description: 'Calm, grounded, nature-inspired' },
    { id: 'ocean', name: 'Ocean Wave', colors: ['#2563eb', '#38bdf8'], bgColors: ['#1e1b4b', '#172554', '#0c4a6e'], description: 'Cool, serene, reflective' },
    { id: 'twilight', name: 'Twilight', colors: ['#7c3aed', '#c4b5fd'], bgColors: ['#2e1065', '#3b0764', '#4a044e'], description: 'Creative, dreamy, mystical' },
    { id: 'midnight', name: 'Midnight', colors: ['#171717', '#6b7280'], bgColors: ['#0a0a0a', '#171717', '#1f2937'], description: 'Bold, sophisticated' },
    { id: 'moonlight', name: 'Moonlight', colors: ['#f8fafc', '#cbd5e1'], bgColors: ['#1e293b', '#334155', '#475569'], description: 'Pure, minimalist' },
    { id: 'aurora', name: 'Aurora', colors: ['rainbow'], bgColors: ['#2e1065', '#1e3a5f', '#134e4a'], description: 'Vibrant, magical, dynamic' },
  ];

  const quickEmojis = ['🏆', '📚', '🏋️', '💕', '💰'];
  const moreEmojis = [
    '⭐', '🎯', '🔥', '💪', '🎉', '👑', '💎', '🌟', '✨', '🚀',
    '🏃‍♂️', '🚴‍♂️', '🏊‍♂️', '🧘‍♂️', '💇‍♂️', '🕺', '🧑‍⚕️', '👨‍🍳', '👨‍💻', '👨‍🎓',
    '🏃‍♀️', '🚴‍♀️', '🏊‍♀️', '🧘‍♀️', '💇‍♀️', '💃', '👩‍⚕️', '👩‍🍳', '👩‍💻', '👩‍🎓',
    '❤️', '💕', '💖', '💍', '👶', '👨‍👩‍👧‍👦', '💋', '🥰', '😍', '💑',
    '⚽', '🏀', '🎾', '🏈', '🥇', '🏅', '🎖️', '🏆', '💪', '🧗',
    '✈️', '🚗', '⛵', '🏠', '🏖️', '🏔️', '🗽', '🎡', '🌍', '🧳',
    '🌈', '☀️', '🌙', '⚡', '🌸', '🌺', '🍀', '🦋', '🌊', '🔆',
    '🎬', '🎤', '🎧', '🎮', '📱', '💻', '📷', '🎨', '🎸', '🎹',
    '📖', '🎓', '💼', '📝', '💡', '🔮', '📊', '🛠️', '✏️', '🎯',
    '🍑', '🍆', '🎂', '🍝', '♻️', '🛍️', '🩻', '🔑',
  ];

  const musicTracks = [
    { id: 'none', name: 'No Music', url: '' },
    { id: 'lofi1', name: 'Lofi Beat - Ellexess', url: 'https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3' },
    { id: 'lofi2', name: 'Goldn - Praz Khanal', url: 'https://cdn.pixabay.com/audio/2022/08/04/audio_2dde668d05.mp3' },
    { id: 'lofi3', name: 'Desperate Decision - Aleksey Chistilin', url: 'https://cdn.pixabay.com/audio/2022/08/02/audio_884fe92c21.mp3' },
    { id: 'lofi4', name: 'Folk King - Tommy Road', url: 'https://cdn.pixabay.com/audio/2022/01/18/audio_d0a13f69d2.mp3' },
    { id: 'custom', name: '💿 Upload Your Own Music', url: 'custom' },
  ];
  
  const [customMusicFile, setCustomMusicFile] = useState(null);

  const getMoodColors = (moodId) => moods.find(m => m.id === moodId)?.colors || ['#7c3aed', '#c4b5fd'];
  const getMoodBgColors = (moodId) => moods.find(m => m.id === moodId)?.bgColors || ['#2e1065', '#3b0764', '#4a044e'];

  const applyTemplate = (templateId) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(templateId);
      setStats(template.stats.map(s => ({ ...s, image: null, note: '' })));
      setSelectedMood(template.mood);
    }
  };

  // Set transition between stats (used in builder)
  const setTransitionBetweenStats = (afterStatIndex, transitionType) => {
    // The transition button is shown AFTER a stat at index afterStatIndex
    // We want the transition to affect the NEXT stat entering
    // Slide layout: [0: Title, 1: Stat0, 2: Stat1, 3: Stat2, ...]
    // If button is after Stat0 (afterStatIndex=0), we want to affect Stat1 entering (slide 2)
    // Formula: afterStatIndex + 2 (next stat index + 1 for title offset)
    const destinationSlide = afterStatIndex + 2;
    setTransitions(prev => ({
      ...prev,
      [destinationSlide]: transitionType
    }));
    setShowTransitionPicker(null);
  };

  const addStat = () => setStats([...stats, { label: '', value: '', image: null, note: '', isHighlight: false }]);
  const removeStat = (index) => setStats(stats.filter((_, i) => i !== index));
  const updateStat = (index, field, value) => {
    const newStats = [...stats];
    newStats[index][field] = value;
    setStats(newStats);
    if (attemptedSubmit && (field === 'label' || field === 'value')) validateForm();
  };

  const addBadge = () => setBadges([...badges, { emoji: '🏆', title: '', subtext: '' }]);
  const removeBadge = (index) => setBadges(badges.filter((_, i) => i !== index));
  const updateBadge = (index, field, value) => {
    const newBadges = [...badges];
    newBadges[index][field] = value;
    setBadges(newBadges);
  };

  const handleImageUpload = (index, file) => {
    if (file?.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => { const newStats = [...stats]; newStats[index].image = e.target.result; setStats(newStats); };
      reader.readAsDataURL(file);
    }
  };

  const handleCoverImageUpload = (file) => {
    if (file?.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setCoverImage(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (index) => { const newStats = [...stats]; newStats[index].image = null; setStats(newStats); };

  // Music handling - toggle only via button
  const handleMusicSelect = (musicId) => {
    setSelectedMusic(musicId);
    
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current = null;
    }
    
    if (musicId === 'custom') {
      setAudioPlaying(false);
      return;
    }
    
    if (musicId && musicId !== 'none') {
      const track = musicTracks.find(t => t.id === musicId);
      if (track?.url && track.url !== 'custom') {
        createAudio(track.url);
      }
    } else {
      setAudioPlaying(false);
    }
  };
  
  const handleCustomMusicUpload = (file) => {
    if (file && file.type.startsWith('audio/')) {
      const url = URL.createObjectURL(file);
      setCustomMusicFile(file);
      createAudio(url);
    }
  };
  
  const createAudio = (url) => {
    const audio = new Audio();
    audio.src = url;
    audio.loop = true;
    audio.volume = 0.5;
    audioRef.current = audio;
    setAudioPlaying(false); // Don't auto-play
  };

  const toggleMusic = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    if (audioPlaying) {
      audio.pause();
      setAudioPlaying(false);
    } else {
      audio.play()
        .then(() => setAudioPlaying(true))
        .catch(e => console.error('Play failed:', e.message));
    }
  }, [audioPlaying]);

  const validateForm = () => {
    const errors = {};
    if (!title.trim()) errors.title = true;
    if (!dateRange.trim()) errors.dateRange = true;
    const hasValidStat = stats.some(s => s.label.trim() && s.value.trim());
    if (!hasValidStat) { errors.stats = true; stats.forEach((stat, index) => { if (!stat.label.trim()) errors[`stat-${index}-label`] = true; if (!stat.value.trim()) errors[`stat-${index}-value`] = true; }); }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const generateWrapped = () => {
    setAttemptedSubmit(true);
    if (!validateForm()) return;
    setStep('preview'); setCurrentSlide(0); setViewedHighlights(new Set()); setViewedBadges(new Set());
    setViewedReflection(false); setShowConfetti(false); setAuraOffset(0);
  };

  const editWrapped = () => { setStep('input'); setShowConfetti(false); setAttemptedSubmit(false); setValidationErrors({}); };

  const resetWrapped = () => {
    setTitle(''); setDateRange(''); setCoverImage(null); setSelectedMood('twilight');
    setStats([{ label: '', value: '', image: null, note: '', isHighlight: false }]); setBadges([]);
    setReflection(''); setSelectedMusic(''); setStep('input'); setCurrentSlide(0);
    setViewedHighlights(new Set()); setViewedBadges(new Set()); setViewedReflection(false);
    setShowConfetti(false); setAttemptedSubmit(false); setValidationErrors({}); setSelectedTemplate(null);
    setTransitions({}); setCustomMusicFile(null);
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = ''; audioRef.current = null; }
    setAudioPlaying(false);
  };

  useEffect(() => { if (attemptedSubmit) validateForm(); }, [title, dateRange, stats, attemptedSubmit]);

  const validStats = stats.filter(s => s.label && s.value);
  const validBadges = badges.filter(b => b.emoji && b.title);
  const hasReflection = reflection.trim() !== '';
  const totalSlides = validStats.length + validBadges.length + (hasReflection ? 1 : 0) + 2;

  const executeTransition = useCallback((transitionData, direction, callback) => {
    const transitionType = transitionData?.type || transitionData || 'default';

    if (transitionType === 'drumroll') {
      setActiveTransition('drumroll');
      setDrumrollCount(3);
      const countdown = setInterval(() => {
        setDrumrollCount(prev => {
          if (prev <= 1) {
            clearInterval(countdown);
            setTimeout(() => {
              setActiveTransition(null);
              callback();
            }, 600);
            return 0;
          }
          return prev - 1;
        });
      }, 800);
    } else if (transitionType === 'impact') {
      setActiveTransition('impact');
      // Immediate callback to start the drop-in animation
      callback();
      // Clear impact transition after shake completes
      setTimeout(() => {
        setActiveTransition(null);
      }, 800);
    } else {
      callback();
    }
  }, []);

  const nextSlide = useCallback(() => {
    const isBlocking = activeTransition === 'drumroll'; // Only drumroll blocks navigation
    if (currentSlide < totalSlides - 1 && !isAnimating && !isBlocking) {
      const destinationSlide = currentSlide + 1;
      const transitionData = transitions[destinationSlide];
      setSlideDirection('next');
      setIsAnimating(true);
      setAuraOffset(prev => prev + 120);
      
      executeTransition(transitionData, 'next', () => {
        setTimeout(() => {
          setCurrentSlide(destinationSlide);
          setIsAnimating(false);
          if (destinationSlide === totalSlides - 1) setShowConfetti(true);
        }, (transitionData?.type || transitionData) === 'default' || !transitionData ? 400 : 100);
      });
    }
  }, [currentSlide, totalSlides, isAnimating, activeTransition, transitions, executeTransition]);

  const prevSlide = useCallback(() => {
    const isBlocking = activeTransition === 'drumroll'; // Only drumroll blocks navigation
    if (currentSlide > 0 && !isAnimating && !isBlocking) {
      setSlideDirection('prev'); setIsAnimating(true); setShowConfetti(false); setAuraOffset(prev => prev - 80);
      setTimeout(() => { setCurrentSlide(prev => prev - 1); setIsAnimating(false); }, 400);
    }
  }, [currentSlide, isAnimating, activeTransition]);

  useEffect(() => {
    const handleKeyDown = (e) => { if (step !== 'preview') return; if (e.key === 'ArrowRight') nextSlide(); else if (e.key === 'ArrowLeft') prevSlide(); };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [step, nextSlide, prevSlide]);

  const minSwipeDistance = 50;
  const onTouchStart = (e) => { setTouchEnd(null); setTouchStart(e.targetTouches[0].clientX); };
  const onTouchMove = (e) => { setTouchEnd(e.targetTouches[0].clientX); };
  const onTouchEnd = () => { if (!touchStart || !touchEnd) return; const distance = touchStart - touchEnd; if (distance > minSwipeDistance && step === 'preview') nextSlide(); if (distance < -minSwipeDistance && step === 'preview') prevSlide(); };

  const handleCoverMouseMove = (e) => { 
    // Skip on Safari/iOS for performance
    if (isSafari || !coverRef.current) return; 
    const rect = coverRef.current.getBoundingClientRect(); 
    setMousePosition({ x: ((e.clientX - rect.left) / rect.width) * 100, y: ((e.clientY - rect.top) / rect.height) * 100 }); 
  };

  const shareWrapped = () => { navigator.clipboard.writeText(window.location.href); alert('Link copied to clipboard!'); };

  const getSlideType = (slideIndex) => {
    if (slideIndex === 0) return { type: 'title' };
    if (slideIndex <= validStats.length) return { type: 'stat', index: slideIndex - 1 };
    const afterStats = slideIndex - validStats.length - 1;
    if (afterStats < validBadges.length) return { type: 'badge', index: afterStats };
    if (hasReflection && afterStats - validBadges.length === 0) return { type: 'reflection' };
    return { type: 'summary' };
  };

  const currentSlideInfo = getSlideType(currentSlide);

  useEffect(() => {
    if (currentSlideInfo.type === 'stat') { const statIndex = currentSlideInfo.index; if (validStats[statIndex]?.isHighlight && !viewedHighlights.has(statIndex)) { setViewedHighlights(prev => new Set([...prev, statIndex])); } }
    if (currentSlideInfo.type === 'badge') { const badgeIndex = currentSlideInfo.index; if (!viewedBadges.has(badgeIndex)) { setViewedBadges(prev => new Set([...prev, badgeIndex])); } }
    if (currentSlideInfo.type === 'reflection' && !viewedReflection) { setViewedReflection(true); }
  }, [currentSlide, currentSlideInfo, validStats, viewedHighlights, viewedBadges, viewedReflection]);

  const formatValue = (value) => {
    if (!isNaN(value) && value.trim() !== '') return <div className="text-6xl sm:text-8xl font-black tracking-tight">{value}</div>;
    if (value.includes(':') || value.includes(',')) {
      const parts = value.split(':');
      if (parts.length > 1) {
        const items = parts[1].split(',').map(item => item.trim()).filter(item => item);
        return (<div className="text-left max-w-md mx-auto px-2"><div className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">{parts[0].trim()}</div><ul className="space-y-2 sm:space-y-3">{items.map((item, idx) => (<li key={idx} className="text-lg sm:text-2xl font-medium flex items-start"><span className="mr-3 sm:mr-4 text-2xl sm:text-3xl">•</span><span>{item}</span></li>))}</ul></div>);
      } else {
        const items = value.split(',').map(item => item.trim()).filter(item => item);
        return (<ul className="space-y-2 sm:space-y-3 text-left max-w-md mx-auto px-2">{items.map((item, idx) => (<li key={idx} className="text-lg sm:text-2xl font-medium flex items-start"><span className="mr-3 sm:mr-4 text-2xl sm:text-3xl">•</span><span>{item}</span></li>))}</ul>);
      }
    }
    return <div className="text-3xl sm:text-5xl font-bold leading-tight max-w-lg px-2">{value}</div>;
  };

  // Impact Transition - Screen shake effect for dramatic entry
  const ImpactShake = () => {
    return (
      <div className="fixed inset-0 pointer-events-none z-50 animate-screen-shake">
        <style>{`
          @keyframes screen-shake {
            0%, 100% { transform: translate(0, 0); }
            10% { transform: translate(-2px, 2px); }
            20% { transform: translate(2px, -2px); }
            30% { transform: translate(-2px, -2px); }
            40% { transform: translate(2px, 2px); }
            50% { transform: translate(-1px, 1px); }
            60% { transform: translate(1px, -1px); }
            70% { transform: translate(-1px, -1px); }
            80% { transform: translate(1px, 1px); }
            90% { transform: translate(0, 0); }
          }
          .animate-screen-shake {
            animation: screen-shake 0.4s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
          }
        `}</style>
      </div>
    );
  };

  // Drumroll Overlay
  const DrumrollOverlay = ({ count }) => (
    <div className="fixed inset-0 z-40 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="absolute w-96 h-96 rounded-full blur-3xl animate-spotlight opacity-30" 
        style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.4) 0%, transparent 70%)' }} />
      {count > 0 && (
        <div className="relative z-10 text-[120px] sm:text-[150px] font-black text-white animate-drumroll-number"
          style={{ textShadow: '0 0 60px rgba(255,255,255,0.5), 0 0 120px rgba(255,255,255,0.3)' }}>
          {count}
        </div>
      )}
      <style>{`
        @keyframes spotlight { 0%, 100% { transform: translate(-50%, -50%); left: 30%; top: 40%; } 25% { left: 70%; top: 30%; } 50% { left: 60%; top: 60%; } 75% { left: 40%; top: 50%; } }
        @keyframes drumroll-number { 0% { transform: scale(0.3); opacity: 0; } 30% { transform: scale(1.1); opacity: 1; } 50% { transform: scale(0.95); } 70% { transform: scale(1.02); } 100% { transform: scale(1); opacity: 1; } }
        .animate-spotlight { animation: spotlight 3s ease-in-out infinite; }
        .animate-drumroll-number { animation: drumroll-number 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
      `}</style>
    </div>
  );

  // Transition Picker Modal
  const TransitionPickerModal = ({ statIndex, onSelect, onClose }) => {
    const destinationSlide = statIndex + 2;
    const currentTransition = transitions[destinationSlide];

    return (
      <div className={`fixed inset-0 z-50 flex items-center justify-center ${isSafari ? 'bg-black/60' : 'bg-black/40 backdrop-blur-sm'}`} onClick={onClose}>
        <div className={`rounded-2xl p-6 border border-white/20 max-w-sm w-full mx-4 shadow-2xl ${isSafari ? 'bg-gray-900/90' : 'bg-white/10 backdrop-blur-2xl'}`} onClick={e => e.stopPropagation()}>
          <h3 className="text-lg font-bold text-white/80 mb-5 text-center">Choose Transition</h3>
          <div className="space-y-2">
            {transitionTypes.map(t => (
              <button
                key={t.id}
                onClick={() => onSelect(statIndex, t.id)}
                className={`w-full p-4 rounded-xl border transition-all text-center ${currentTransition?.type === t.id || currentTransition === t.id ? 'bg-white/25 border-white/40' : 'bg-white/5 border-white/10 hover:bg-white/15 hover:border-white/25'}`}
              >
                <div className="text-white font-bold text-lg">{t.name}</div>
                <div className="text-white/50 text-sm mt-1">{t.description}</div>
              </button>
            ))}
          </div>
          <button onClick={onClose} className="w-full mt-5 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-white/60 text-sm font-medium transition-colors border border-white/10">Cancel</button>
        </div>
      </div>
    );
  };

  // Transition button for builder
  const BuilderTransitionButton = ({ afterStatIndex, isLast }) => {
    if (isLast) return null;
    const destinationSlide = afterStatIndex + 2;
    const currentTransition = transitions[destinationSlide];
    const transitionInfo = transitionTypes.find(t => t.id === (currentTransition?.type || currentTransition));
    return (
      <div className="flex justify-center py-2">
        <button 
          onClick={() => setShowTransitionPicker(afterStatIndex)}
          className="group flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 hover:border-white/30 transition-all"
        >
          <Plus size={14} className="text-white/40 group-hover:text-white/80" />
          {currentTransition && (currentTransition?.type || currentTransition) !== 'default' ? (
            <span className="text-xs text-white/60 group-hover:text-white/90 font-medium flex items-center gap-1">
              {transitionInfo?.name}
              {currentTransition?.emoji && <span className="text-sm">{currentTransition.emoji}</span>}
            </span>
          ) : (
            <span className="text-xs text-white/40 group-hover:text-white/70">Add Transition</span>
          )}
        </button>
      </div>
    );
  };

  const Confetti = () => {
    const [particles, setParticles] = useState([]);
    useEffect(() => { const colors = ['#ff0080', '#ff8c00', '#ffef00', '#00ff88', '#00cfff', '#8000ff', '#ff006e', '#fb5607']; setParticles(Array.from({ length: 150 }, (_, i) => ({ id: i, x: Math.random() * 100, delay: Math.random() * 2, duration: 2 + Math.random() * 2, color: colors[Math.floor(Math.random() * colors.length)], size: 8 + Math.random() * 12, rotation: Math.random() * 360, type: Math.random() > 0.5 ? 'square' : 'circle' }))); }, []);
    return (<div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">{particles.map(p => (<div key={p.id} className="absolute animate-confetti" style={{ left: `${p.x}%`, top: '-20px', animationDelay: `${p.delay}s`, animationDuration: `${p.duration}s` }}><div style={{ width: p.size, height: p.size, backgroundColor: p.color, borderRadius: p.type === 'circle' ? '50%' : '2px', transform: `rotate(${p.rotation}deg)` }} /></div>))}<style>{`@keyframes confetti { 0% { transform: translateY(0) rotate(0deg) scale(1); opacity: 1; } 100% { transform: translateY(100vh) rotate(720deg) scale(0.5); opacity: 0; } } .animate-confetti { animation: confetti ease-out forwards; }`}</style></div>);
  };

  const Fireworks = () => {
    const [bursts, setBursts] = useState([]);
    useEffect(() => { const colors = ['#ff0080', '#ffef00', '#00ff88', '#00cfff', '#ff8c00', '#8000ff']; setBursts(Array.from({ length: 8 }, (_, i) => ({ id: i, x: 15 + Math.random() * 70, y: 15 + Math.random() * 50, delay: Math.random() * 1.5, color: colors[Math.floor(Math.random() * colors.length)], size: 80 + Math.random() * 60 }))); }, []);
    return (<div className="absolute inset-0 pointer-events-none overflow-hidden">{bursts.map(burst => (<div key={burst.id} className="absolute animate-firework" style={{ left: `${burst.x}%`, top: `${burst.y}%`, animationDelay: `${burst.delay}s` }}>{[...Array(12)].map((_, i) => (<div key={i} className="absolute w-2 h-2 rounded-full animate-spark" style={{ backgroundColor: burst.color, transform: `rotate(${i * 30}deg) translateY(-${burst.size / 2}px)`, animationDelay: `${burst.delay}s`, boxShadow: `0 0 6px ${burst.color}, 0 0 12px ${burst.color}` }} />))}</div>))}<style>{`@keyframes firework { 0% { transform: scale(0); opacity: 0; } 50% { transform: scale(1); opacity: 1; } 100% { transform: scale(1.5); opacity: 0; } } @keyframes spark { 0% { opacity: 1; } 100% { opacity: 0; } } .animate-firework { animation: firework 1.5s ease-out forwards; } .animate-spark { animation: spark 1s ease-out forwards; }`}</style></div>);
  };

  const FallingStars = () => {
    const [stars, setStars] = useState([]);
    useEffect(() => { setStars(Array.from({ length: 30 }, (_, i) => ({ id: i, left: Math.random() * 100, delay: Math.random() * 3, duration: 2 + Math.random() * 2, size: 10 + Math.random() * 20 }))); }, []);
    return (<div className="absolute inset-0 pointer-events-none overflow-hidden">{stars.map(star => (<div key={star.id} className="absolute animate-fall" style={{ left: `${star.left}%`, animationDelay: `${star.delay}s`, animationDuration: `${star.duration}s`, top: '-50px' }}><Star size={star.size} className="text-yellow-300 fill-yellow-300 drop-shadow-lg" style={{ filter: 'drop-shadow(0 0 8px rgba(253, 224, 71, 0.8))' }} /></div>))}<style>{`@keyframes fall { 0% { transform: translateY(-50px) rotate(0deg); opacity: 1; } 100% { transform: translateY(100vh) rotate(360deg); opacity: 0; } } .animate-fall { animation: fall linear forwards; }`}</style></div>);
  };

  const FloatingSparkles = () => {
    const [sparkles, setSparkles] = useState([]);
    useEffect(() => { setSparkles(Array.from({ length: 20 }, (_, i) => ({ id: i, left: Math.random() * 100, top: Math.random() * 100, delay: Math.random() * 5, duration: 3 + Math.random() * 4, size: 4 + Math.random() * 8 }))); }, []);
    return (<div className="absolute inset-0 pointer-events-none overflow-hidden">{sparkles.map(sparkle => (<div key={sparkle.id} className="absolute animate-sparkle-float" style={{ left: `${sparkle.left}%`, top: `${sparkle.top}%`, animationDelay: `${sparkle.delay}s`, animationDuration: `${sparkle.duration}s` }}><div className="rounded-full bg-white" style={{ width: sparkle.size, height: sparkle.size, boxShadow: '0 0 10px rgba(255,255,255,0.8), 0 0 20px rgba(255,255,255,0.4)' }} /></div>))}<style>{`@keyframes sparkle-float { 0%, 100% { opacity: 0; transform: translateY(0) scale(0.5); } 25% { opacity: 0.8; transform: translateY(-10px) scale(1); } 50% { opacity: 0.4; transform: translateY(-5px) scale(0.8); } 75% { opacity: 0.6; transform: translateY(-15px) scale(0.9); } } .animate-sparkle-float { animation: sparkle-float ease-in-out infinite; }`}</style></div>);
  };

  const HighlightGlowRing = ({ isFirstView }) => {
    if (!isFirstView) return null;
    return (<><div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none"><div className="absolute inset-0 animate-glow-ring"><div className="absolute inset-[-2px] rounded-3xl border-4 border-yellow-400/80" style={{ background: 'conic-gradient(from 0deg, transparent 0deg, rgba(250, 204, 21, 0.8) 30deg, rgba(250, 204, 21, 1) 60deg, rgba(250, 204, 21, 0.8) 90deg, transparent 120deg)', mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', maskComposite: 'exclude', WebkitMaskComposite: 'xor', padding: '4px' }} /></div></div><div className="absolute inset-0 rounded-3xl animate-glow-pulse pointer-events-none" style={{ boxShadow: '0 0 80px rgba(250, 204, 21, 0.6), 0 0 120px rgba(250, 204, 21, 0.4), inset 0 0 80px rgba(250, 204, 21, 0.15)' }} /><style>{`@keyframes glow-ring { 0% { transform: rotate(0deg); opacity: 1; } 100% { transform: rotate(360deg); opacity: 0; } } @keyframes glow-pulse { 0% { opacity: 0; } 50% { opacity: 1; } 100% { opacity: 0.6; } } .animate-glow-ring { animation: glow-ring 1.5s ease-out forwards; } .animate-glow-pulse { animation: glow-pulse 1.5s ease-out forwards; }`}</style></>);
  };

  const ReflectionGlowRing = ({ isFirstView }) => {
    if (!isFirstView) return null;
    return (<><div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none"><div className="absolute inset-0 animate-reflection-ring"><div className="absolute inset-[-2px] rounded-3xl border-4 border-white/80" style={{ background: 'conic-gradient(from 0deg, transparent 0deg, rgba(255, 255, 255, 0.6) 30deg, rgba(255, 255, 255, 0.9) 60deg, rgba(255, 255, 255, 0.6) 90deg, transparent 120deg)', mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', maskComposite: 'exclude', WebkitMaskComposite: 'xor', padding: '4px' }} /></div></div><div className="absolute inset-0 rounded-3xl animate-reflection-pulse pointer-events-none" style={{ boxShadow: '0 0 60px rgba(255, 255, 255, 0.4), 0 0 100px rgba(255, 255, 255, 0.2), inset 0 0 60px rgba(255, 255, 255, 0.1)' }} /><style>{`@keyframes reflection-ring { 0% { transform: rotate(0deg); opacity: 1; } 100% { transform: rotate(360deg); opacity: 0; } } @keyframes reflection-pulse { 0% { opacity: 0; } 50% { opacity: 1; } 100% { opacity: 0.5; } } .animate-reflection-ring { animation: reflection-ring 2s ease-out forwards; } .animate-reflection-pulse { animation: reflection-pulse 2s ease-out forwards; }`}</style></>);
  };

  const RainbowTitle = ({ children }) => (
    <div className="relative inline-block">
      <div className="absolute inset-0 blur-3xl opacity-70 animate-rainbow-glow" style={{ background: 'linear-gradient(90deg, #ff0080, #ff8c00, #ffef00, #00ff88, #00cfff, #8000ff, #ff0080)', backgroundSize: '200% 100%' }} />
      <h1 className="relative text-5xl sm:text-7xl md:text-8xl font-black text-white tracking-tight leading-none break-words max-w-full drop-shadow-2xl">{children}</h1>
      <style>{`@keyframes rainbow-glow { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } } .animate-rainbow-glow { animation: rainbow-glow 3s ease-in-out infinite; }`}</style>
    </div>
  );

  const BadgeSlide = ({ badge, isFirstView, dateRange }) => {
    const [shouldAnimate] = useState(isFirstView);
    return (
      <div className="relative bg-gradient-to-br from-white/8 to-white/3 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 text-center shadow-2xl border border-white/15 min-h-[600px] sm:min-h-[650px] flex flex-col justify-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
          <div className="absolute inset-0 animate-badge-shine" style={{ background: 'linear-gradient(110deg, transparent 0%, transparent 40%, rgba(255,255,255,0.2) 50%, transparent 60%, transparent 100%)', backgroundSize: '200% 100%', backgroundPosition: '200% 0' }} />
          <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-white/8 to-transparent" />
        </div>
        {shouldAnimate && <Fireworks />}
        <div className="flex-1 flex flex-col items-center justify-center relative z-10">
          <div className="text-white/50 text-lg sm:text-xl font-bold uppercase tracking-wider mb-4">Earned Badge</div>
          <div className={`relative ${shouldAnimate ? 'animate-emoji-entrance' : ''}`}>
            <div className="absolute inset-0 blur-2xl bg-white/20 rounded-full animate-emoji-glow" />
            <div className="relative text-[100px] sm:text-[140px] leading-none mb-6 sm:mb-8" style={{ filter: 'drop-shadow(0 0 20px rgba(255,255,255,0.3))' }}>{badge.emoji}</div>
            {shouldAnimate && (<div className="absolute inset-0 flex items-center justify-center">{[...Array(8)].map((_, i) => (<div key={i} className="absolute w-3 h-3 bg-white rounded-full animate-sparkle-burst" style={{ animationDelay: `${0.3 + i * 0.05}s`, transform: `rotate(${i * 45}deg) translateY(-80px)` }} />))}</div>)}
          </div>
          <div className={`text-2xl sm:text-3xl font-black text-white uppercase tracking-wider ${shouldAnimate ? 'animate-badge-title' : ''}`}>{badge.title}</div>
          {badge.subtext && <div className={`text-base sm:text-lg text-white/60 mt-2 ${shouldAnimate ? 'animate-badge-title' : ''}`} style={{ animationDelay: '0.2s' }}>{badge.subtext}</div>}
        </div>
        <div className="text-white/30 font-black text-sm uppercase tracking-widest mt-4 relative z-10">{dateRange || 'Wrapped'}</div>
        <style>{`
          @keyframes badge-shine { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
          @keyframes emoji-entrance { 0% { transform: scale(0) rotate(-180deg); opacity: 0; } 50% { transform: scale(1.3) rotate(10deg); opacity: 1; } 70% { transform: scale(0.9) rotate(-5deg); } 85% { transform: scale(1.1) rotate(2deg); } 100% { transform: scale(1) rotate(0deg); } }
          @keyframes emoji-glow { 0%, 100% { opacity: 0.2; transform: scale(0.8); } 50% { opacity: 0.4; transform: scale(1.1); } }
          @keyframes sparkle-burst { 0% { opacity: 0; transform: rotate(var(--rotation, 0deg)) translateY(0) scale(0); } 50% { opacity: 1; transform: rotate(var(--rotation, 0deg)) translateY(-100px) scale(1); } 100% { opacity: 0; transform: rotate(var(--rotation, 0deg)) translateY(-120px) scale(0); } }
          @keyframes badge-title { 0% { opacity: 0; transform: translateY(30px); } 60% { opacity: 0; transform: translateY(30px); } 100% { opacity: 1; transform: translateY(0); } }
          .animate-badge-shine { animation: badge-shine 4s ease-in-out infinite; animation-delay: 1.5s; }
          .animate-emoji-entrance { animation: emoji-entrance 1s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
          .animate-emoji-glow { animation: emoji-glow 3s ease-in-out infinite; }
          .animate-sparkle-burst { animation: sparkle-burst 0.8s ease-out forwards; }
          .animate-badge-title { animation: badge-title 1.2s ease-out forwards; }
        `}</style>
      </div>
    );
  };

  const ReflectionSlide = ({ reflection, isFirstView, dateRange }) => (
    <div className={`bg-black/40 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 text-center shadow-2xl border-2 min-h-[600px] sm:min-h-[650px] flex flex-col justify-center relative overflow-hidden ${!isFirstView ? 'border-white/50' : 'border-white/30'}`} style={!isFirstView ? { boxShadow: '0 0 40px rgba(255, 255, 255, 0.3), 0 0 80px rgba(255, 255, 255, 0.15), inset 0 0 40px rgba(255, 255, 255, 0.05)', animation: 'reflection-breathe 4s ease-in-out infinite' } : {}}>
      <ReflectionGlowRing isFirstView={isFirstView} /><FloatingSparkles />
      <div className="flex-1 flex flex-col items-center justify-center relative z-10">
        <div className="text-white/60 text-lg sm:text-xl font-bold uppercase tracking-wider mb-4 sm:mb-6 flex items-center gap-3"><Sparkles size={20} className="text-white/60" />Reflection<Sparkles size={20} className="text-white/60" /></div>
        <div className="text-2xl sm:text-3xl md:text-4xl font-medium text-white leading-relaxed max-w-lg italic px-2">"{reflection}"</div>
      </div>
      <div className="text-white/30 font-black text-sm uppercase tracking-widest mt-4 relative z-10">{dateRange || 'Wrapped'}</div>
      <style>{`@keyframes reflection-breathe { 0%, 100% { box-shadow: 0 0 40px rgba(255, 255, 255, 0.3), 0 0 80px rgba(255, 255, 255, 0.15), inset 0 0 40px rgba(255, 255, 255, 0.05); } 50% { box-shadow: 0 0 60px rgba(255, 255, 255, 0.4), 0 0 100px rgba(255, 255, 255, 0.2), inset 0 0 60px rgba(255, 255, 255, 0.08); } }`}</style>
    </div>
  );

  const EmojiPicker = ({ selectedEmoji, onSelect, onClose }) => {
    const [showMore, setShowMore] = useState(false);
    return (
      <div className="absolute top-full left-0 mt-2 bg-black/70 backdrop-blur-2xl rounded-xl border border-white/10 p-3 z-50 shadow-2xl">
        <div className="flex gap-2 mb-2">{quickEmojis.map(emoji => (<button key={emoji} onClick={() => { onSelect(emoji); onClose(); }} className={`w-11 h-11 text-xl rounded-lg hover:bg-white/20 transition-colors flex items-center justify-center ${selectedEmoji === emoji ? 'bg-white/30' : ''}`}>{emoji}</button>))}<button onClick={() => setShowMore(!showMore)} className="w-11 h-11 text-lg rounded-lg hover:bg-white/20 transition-colors flex items-center justify-center bg-white/10 font-bold text-white">+</button></div>
        {showMore && (<div className="grid grid-cols-10 gap-1 max-h-52 overflow-y-auto pt-2 border-t border-white/10">{moreEmojis.map((emoji, idx) => (<button key={`${emoji}-${idx}`} onClick={() => { onSelect(emoji); onClose(); }} className={`w-8 h-8 text-base rounded-lg hover:bg-white/20 transition-colors flex items-center justify-center ${selectedEmoji === emoji ? 'bg-white/30' : ''}`}>{emoji}</button>))}</div>)}
      </div>
    );
  };

  const MoodSelector = ({ selectedMood, onSelect }) => (
    <div className="grid grid-cols-4 gap-2 sm:gap-3">{moods.map(mood => (<button key={mood.id} onClick={() => onSelect(mood.id)} className={`flex flex-col items-center p-2 sm:p-3 rounded-xl transition-all ${selectedMood === mood.id ? 'bg-white/20 border-2 border-white/50 scale-105' : 'bg-white/5 border-2 border-white/10 hover:bg-white/10'}`}><div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full mb-1 sm:mb-2 shadow-lg" style={{ background: mood.colors[0] === 'rainbow' ? 'conic-gradient(#ff0080, #ff8c00, #ffef00, #00ff88, #00cfff, #8000ff, #ff0080)' : `linear-gradient(135deg, ${mood.colors[0]} 50%, ${mood.colors[1]} 50%)` }} /><span className="text-white text-[10px] sm:text-xs font-bold">{mood.name}</span><span className="text-white/50 text-[8px] sm:text-[10px] text-center mt-0.5 sm:mt-1 leading-tight hidden sm:block">{mood.description}</span></button>))}</div>
  );

  const TemplateSelector = ({ selectedTemplate, onSelect }) => (
    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3">{templates.map(template => { const Icon = template.icon; return (<button key={template.id} onClick={() => onSelect(template.id)} className={`flex flex-col items-center p-3 sm:p-4 rounded-xl transition-all ${selectedTemplate === template.id ? 'bg-white/20 border-2 scale-105' : 'bg-white/5 border-2 border-white/10 hover:bg-white/10'}`} style={{ borderColor: selectedTemplate === template.id ? template.color : undefined }}><Icon size={24} style={{ color: template.color }} /><span className="text-white text-xs font-bold mt-2">{template.name}</span></button>); })}</div>
  );

  const ProgressDots = ({ current, total }) => (<div className="flex items-center justify-center gap-1.5">{Array.from({ length: total }, (_, i) => (<div key={i} className={`rounded-full transition-all duration-300 ${i === current ? 'w-6 h-2 bg-white' : i < current ? 'w-2 h-2 bg-white/60' : 'w-2 h-2 bg-white/30'}`} />))}</div>);

  // Detect Safari/iOS for performance optimizations
  const isSafari = typeof navigator !== 'undefined' && (/^((?!chrome|android).)*safari/i.test(navigator.userAgent) || /iPad|iPhone|iPod/.test(navigator.userAgent));

  const DynamicBackground = ({ moodId = 'twilight', offset = 0 }) => {
    const bgColors = getMoodBgColors(moodId);
    const auraColors = getMoodColors(moodId);
    const isRainbow = auraColors[0] === 'rainbow';
    const color1 = isRainbow ? '#ff0080' : auraColors[0];
    const color2 = isRainbow ? '#00cfff' : auraColors[1];
    const color3 = isRainbow ? '#ffef00' : auraColors[0];
    const color4 = isRainbow ? '#8000ff' : auraColors[1];

    // Mood-specific aura positioning
    const auraPositions = {
      crimson: { blob1: { top: '-20%', left: '-20%' }, blob2: { bottom: '-20%', right: '-20%' }, blob3: { top: '50%', left: '50%' } },
      bronzed: { blob1: { top: '-20%', right: '-20%' }, blob2: { bottom: '-20%', left: '-20%' }, blob3: { top: '50%', left: '50%' } },
      forest: { blob1: { top: '50%', left: '-20%' }, blob2: { top: '50%', right: '-20%' }, blob3: { top: '-10%', left: '50%' } },
      ocean: { blob1: { bottom: '-10%', left: '50%' }, blob2: { top: '-20%', right: '-20%' }, blob3: { top: '50%', left: '-20%' } },
      twilight: { blob1: { top: '-10%', left: '50%' }, blob2: { bottom: '-20%', left: '-20%' }, blob3: { top: '50%', right: '-20%' } },
      midnight: { blob1: { top: '50%', left: '50%' }, blob2: { top: '-20%', left: '-20%' }, blob3: { bottom: '-20%', right: '-20%' } },
      moonlight: { blob1: { top: '-20%', right: '-20%' }, blob2: { top: '50%', left: '-20%' }, blob3: { bottom: '-10%', left: '50%' } },
      aurora: { blob1: { top: '50%', left: '50%' }, blob2: { top: '-20%', left: '-20%' }, blob3: { bottom: '-20%', right: '-20%' } }
    };
    const positions = auraPositions[moodId] || auraPositions.twilight;

    // Safari/iOS optimized version - no blur, simpler animations, increased size and opacity
    if (isSafari) {
      return (
        <>
          <div className="fixed inset-0" style={{ background: `linear-gradient(135deg, ${bgColors[0]} 0%, ${bgColors[1]} 50%, ${bgColors[2]} 100%)` }} />
          <div className="fixed inset-0 overflow-hidden">
            <div
              className="absolute w-96 sm:w-[28rem] h-96 sm:h-[28rem] rounded-full opacity-50 animate-blob-safari-1"
              style={{
                ...positions.blob1,
                background: `radial-gradient(circle, ${color1} 0%, ${color1}80 30%, transparent 70%)`,
                willChange: 'transform',
              }}
            />
            <div
              className="absolute w-80 sm:w-96 h-80 sm:h-96 rounded-full opacity-50 animate-blob-safari-2"
              style={{
                ...positions.blob2,
                background: `radial-gradient(circle, ${color2} 0%, ${color2}80 30%, transparent 70%)`,
                willChange: 'transform',
              }}
            />
            {isRainbow && (
              <div
                className="absolute w-72 sm:w-80 h-72 sm:h-80 rounded-full opacity-45 animate-blob-safari-3"
                style={{
                  ...positions.blob3,
                  background: 'radial-gradient(circle, #00ff88 0%, #ff8c0080 30%, transparent 70%)',
                  willChange: 'transform',
                }}
              />
            )}
          </div>
        </>
      );
    }

    // Chrome/Firefox version - full effects with increased size
    return (
      <>
        <div className="fixed inset-0 transition-all duration-1000 ease-in-out" style={{ background: `linear-gradient(135deg, ${bgColors[0]} 0%, ${bgColors[1]} 50%, ${bgColors[2]} 100%)` }} />
        <div className="fixed inset-0 overflow-hidden">
          <div
            className="absolute w-96 sm:w-[28rem] h-96 sm:h-[28rem] rounded-full mix-blend-screen filter blur-3xl opacity-70 animate-blob1"
            style={{
              ...positions.blob1,
              background: `linear-gradient(135deg, ${color1} 0%, ${color2} 100%)`,
              transform: `translate(${offset * 0.5}px, ${offset * 0.3}px)`,
              willChange: 'transform',
            }}
          />
          <div
            className="absolute w-80 sm:w-96 h-80 sm:h-96 rounded-full mix-blend-screen filter blur-3xl opacity-70 animate-blob2"
            style={{
              ...positions.blob2,
              background: `linear-gradient(135deg, ${color3} 0%, ${color4} 100%)`,
              transform: `translate(${-offset * 0.3}px, ${offset * 0.4}px)`,
              willChange: 'transform',
            }}
          />
          {isRainbow && (
            <div
              className="absolute w-72 sm:w-80 h-72 sm:h-80 rounded-full mix-blend-screen filter blur-3xl opacity-60 animate-blob3"
              style={{
                ...positions.blob3,
                background: 'linear-gradient(135deg, #00ff88 0%, #ff8c00 100%)',
                transform: `translate(${offset * 0.4}px, ${-offset * 0.2}px)`,
                willChange: 'transform',
              }}
            />
          )}
        </div>
      </>
    );
  };

  const getDecorativeShapes = (index) => {
    // Intentional shape pairing: hollow + filled, large + small, opposite corners
    const shapes = [<><div className="absolute top-8 right-8 w-20 h-20 border-4 border-white/25 rounded-full"></div><div className="absolute bottom-8 left-8 w-16 h-16 bg-white/15 rotate-45"></div></>, <><div className="absolute top-10 left-10 w-24 h-24 border-4 border-white/25 rounded-full"></div><div className="absolute bottom-10 right-10 w-14 h-14 bg-white/15 rounded-full"></div></>, <><div className="absolute top-8 right-8 w-18 h-18 bg-white/15 rounded-lg rotate-12"></div><div className="absolute bottom-8 left-8 w-16 h-16 border-4 border-white/25 rotate-45"></div></>];
    return shapes[index % shapes.length];
  };

  const NoiseOverlay = ({ forceShow = false }) => {
    // Safari/mobile: Skip noise entirely (renders poorly)
    // Chrome: Always show noise
    if (isSafari) {
      return null; // No noise on Safari/mobile
    }
    // Chrome only - high-quality noise
    return (
      <div className="fixed inset-0 opacity-[0.25] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'2.5\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")', backgroundSize: '200px 200px' }} />
    );
  };

  const getSlideAnimation = () => {
    if (!isAnimating) {
      // If we just used impact transition, use the drop-in animation
      if (activeTransition === 'impact') return 'animate-impact-drop';
      // Don't animate in if we just finished a transition (prevents double animation)
      return '';
    }
    return slideDirection === 'next' ? 'animate-slide-out-left' : 'animate-slide-out-right';
  };

  const FieldLabel = ({ children, required = false, error = false }) => (<label className={`block mb-3 font-bold text-base sm:text-lg uppercase tracking-wide ${error ? 'text-red-400' : 'text-white'}`}>{children}{required && <span className="text-red-400 ml-1">*</span>}</label>);

  // Homepage Component
  const HomePage = () => {
    const wrappedFeatures = [
      'Custom stat tracking',
      'Beautiful themes & moods',
      'Animated transitions',
      'Badge achievements',
      'Personal reflections',
      'Share with friends'
    ];

    const comingSoonFeatures = [
      'Real-time productivity tracking',
      'Automatic daily/weekly wraps',
      'Goal setting & progress',
      'Analytics dashboard'
    ];

    const handleNotifySubmit = (e) => {
      e.preventDefault();
      if (notifyEmail) {
        setEmailSubmitted(true);
        // Here you would typically send this to your backend
        console.log('Email submitted:', notifyEmail);
      }
    };

    return (
      <div className="min-h-screen relative overflow-hidden">
        <DynamicBackground moodId="twilight" />
        <NoiseOverlay forceShow={true} />
        
        <div className="relative z-10 min-h-screen flex flex-col">
          {/* Header with Logo */}
          <header className="pt-8 pb-2 px-6 text-center">
            <img src="/MyWrap.png" alt="MyWrap" className="w-20 h-20 sm:w-28 sm:h-28 object-contain mx-auto" />
            <p className="text-white/70 text-base sm:text-lg font-medium -mt-1">Your moments, wrapped</p>
          </header>

          {/* Main Content - Two Cards */}
          <main className="flex-1 flex items-center justify-center px-4 sm:px-8 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl w-full">
              
              {/* Wrapped Card - Active Product */}
              <div 
                onClick={() => setStep('input')}
                className="group relative bg-white/5 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 border border-white/10 cursor-pointer transition-all duration-500 hover:bg-white/10 hover:border-white/30 hover:scale-[1.02] hover:shadow-2xl overflow-hidden"
              >
                {/* Animated highlight border on hover */}
                <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                  <div className="absolute inset-0 rounded-3xl animate-border-glow" style={{
                    background: 'linear-gradient(90deg, transparent, rgba(139, 92, 246, 0.5), transparent)',
                    backgroundSize: '200% 100%'
                  }} />
                </div>
                
                {/* Sparkle effects on hover */}
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-500 transform group-hover:rotate-12">
                  <Sparkles className="w-6 h-6 text-purple-400" />
                </div>
                <div className="absolute bottom-6 left-6 opacity-0 group-hover:opacity-100 transition-all duration-700 delay-100 transform group-hover:-rotate-12">
                  <Sparkles className="w-5 h-5 text-pink-400" />
                </div>

                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-black text-white">Wrapped</h2>
                      <span className="text-xs font-bold text-green-400 uppercase tracking-wider">Available Now</span>
                    </div>
                  </div>
                  
                  <p className="text-white/70 mb-6">Create a custom wrapped for your trip, fitness achievements, reading list—anything worth sharing.</p>
                  
                  <ul className="space-y-2 mb-6">
                    {wrappedFeatures.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-white/80 text-sm">
                        <Check size={16} className="text-green-400 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  
                  <div className="flex items-center gap-2 text-white font-bold group-hover:gap-3 transition-all">
                    <span>Start Creating</span>
                    <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>

              {/* Coming Soon Card - Productivity Tracking */}
              <div className="group relative bg-white/5 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 border border-white/10 overflow-hidden">
                {/* Blur overlay on hover */}
                <div className="absolute inset-0 bg-black/70 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-500 z-20 flex flex-col items-center justify-center rounded-3xl">
                  <Lock className="w-12 h-12 text-white/80 mb-4" />
                  <h3 className="text-xl font-bold text-white mb-4">Coming Soon</h3>
                  
                  {!emailSubmitted ? (
                    <form onSubmit={handleNotifySubmit} className="w-full max-w-xs px-4" onClick={e => e.stopPropagation()}>
                      <input
                        type="email"
                        value={notifyEmail}
                        onChange={(e) => setNotifyEmail(e.target.value)}
                        placeholder="Enter your email"
                        className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 mb-3 text-sm"
                        required
                      />
                      <button
                        type="submit"
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 hover:bg-purple-500 rounded-xl text-white font-bold transition-colors text-sm"
                      >
                        <Bell size={16} />
                        Get Notified
                      </button>
                    </form>
                  ) : (
                    <div className="text-center px-4">
                      <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-3">
                        <Check className="w-6 h-6 text-green-400" />
                      </div>
                      <p className="text-white/80 text-sm">We'll notify you when it's ready!</p>
                    </div>
                  )}
                </div>

                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
                      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-black text-white">Productivity</h2>
                      <span className="text-xs font-bold text-yellow-400 uppercase tracking-wider">Coming Soon</span>
                    </div>
                  </div>
                  
                  <p className="text-white/70 mb-6">Track your progress in real-time and get automatic wraps generated for you.</p>
                  
                  <ul className="space-y-2 mb-6">
                    {comingSoonFeatures.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-white/60 text-sm">
                        <div className="w-4 h-4 rounded-full border border-white/30 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  
                  <div className="flex items-center gap-2 text-white/50 font-bold">
                    <Lock size={16} />
                    <span>Hover to get notified</span>
                  </div>
                </div>
              </div>
            </div>
          </main>

          {/* Footer */}
          <footer className="py-6 text-center">
            <p className="text-white/40 text-sm">made with 💜 from <a href="https://hellochidera.com" target="_blank" rel="noopener noreferrer" className="hover:text-white/60 underline transition-colors">hellochidera.com</a></p>
          </footer>
        </div>

        <style>{`
          @keyframes border-glow {
            0%, 100% { background-position: -200% 0; }
            50% { background-position: 200% 0; }
          }
          .animate-border-glow { animation: border-glow 3s ease-in-out infinite; }
        `}</style>
      </div>
    );
  };

  // Home page
  if (step === 'home') {
    return <HomePage />;
  }

  // Input/builder page
  if (step === 'input') {
    return (
      <div className="min-h-screen relative transition-all duration-1000">
        <DynamicBackground moodId={selectedMood} /><NoiseOverlay />
        {showTransitionPicker !== null && (
          <TransitionPickerModal 
            statIndex={showTransitionPicker} 
            onSelect={setTransitionBetweenStats} 
            onClose={() => setShowTransitionPicker(null)} 
          />
        )}
        {audioRef.current && (<button onClick={toggleMusic} className="fixed top-4 sm:top-6 right-4 sm:right-6 p-2 sm:p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors backdrop-blur-sm border-2 border-white/20 z-50">{audioPlaying ? <Volume2 size={18} /> : <VolumeX size={18} />}</button>)}
        
        {/* Back to home button */}
        <button
          onClick={() => setStep('home')}
          disabled={showTransitionPicker !== null}
          className={`fixed top-4 sm:top-6 left-4 sm:left-6 p-2 sm:p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors backdrop-blur-sm border-2 border-white/20 z-50
            ${showTransitionPicker !== null ? 'pointer-events-none opacity-30' : ''}`}
        >
          <ArrowLeft size={18} />
        </button>
        
        <div className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="bg-black/30 backdrop-blur-2xl rounded-3xl border-2 border-white/20 shadow-2xl overflow-hidden relative">
            <div className="p-6 sm:p-8 pb-4 border-b border-white/10">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-2 tracking-tight text-center">Create Your Wrapped</h1>
              <p className="text-white/80 text-base sm:text-lg text-center">Track anything you want and share it with friends</p>
            </div>
            <div className="p-6 sm:p-8 pt-6">
              <div className="space-y-6 sm:space-y-8">
                <div><FieldLabel>Quick Start Templates</FieldLabel><TemplateSelector selectedTemplate={selectedTemplate} onSelect={applyTemplate} /></div>
                <div><FieldLabel required error={validationErrors.title}>Wrapped Title</FieldLabel><input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="My Adventures" className={`w-full px-4 sm:px-5 py-3 sm:py-4 rounded-xl bg-white/10 border-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent backdrop-blur-sm font-medium text-base sm:text-lg transition-colors ${validationErrors.title ? 'border-red-500' : 'border-white/20'}`} />{validationErrors.title && <p className="text-red-400 text-sm mt-2">Please enter a title for your Wrapped</p>}</div>
                <div><FieldLabel>Add Cover Image <span className="text-white/50 font-normal normal-case">(optional)</span></FieldLabel><div className="flex items-center gap-4">{coverImage ? (<div className="relative"><img src={coverImage} alt="Cover Preview" className="w-32 sm:w-40 h-20 sm:h-24 object-cover rounded-xl border-2 border-white/20" /><button onClick={() => setCoverImage(null)} className="absolute -top-2 -right-2 p-1 bg-red-500 hover:bg-red-600 rounded-full text-white transition-colors"><X size={16} /></button></div>) : (<label className="flex items-center gap-2 sm:gap-3 px-4 sm:px-5 py-3 sm:py-4 bg-white/10 hover:bg-white/20 rounded-xl text-white/70 transition-colors border-2 border-white/20 cursor-pointer"><ImagePlus size={20} /><span className="font-medium text-sm sm:text-base">Upload Cover Image</span><input type="file" accept="image/*" onChange={(e) => handleCoverImageUpload(e.target.files[0])} className="hidden" /></label>)}</div></div>
                <div><FieldLabel required error={validationErrors.dateRange}>Date Range</FieldLabel><input type="text" value={dateRange} onChange={(e) => setDateRange(e.target.value)} placeholder="E.g., 2026 Q1, November, Fall Semester" className={`w-full px-4 sm:px-5 py-3 sm:py-4 rounded-xl bg-white/10 border-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent backdrop-blur-sm font-medium text-base sm:text-lg transition-colors ${validationErrors.dateRange ? 'border-red-500' : 'border-white/20'}`} />{validationErrors.dateRange && <p className="text-red-400 text-sm mt-2">Please enter a date range</p>}</div>
                
                {/* Stats with transition buttons between them */}
                <div>
                  <FieldLabel required error={validationErrors.stats}>Your Stats</FieldLabel>
                  {validationErrors.stats && <p className="text-red-400 text-sm mb-3">Please add at least one complete stat (label and value)</p>}
                  <div className="space-y-2">
                    {stats.map((stat, index) => (
                      <React.Fragment key={index}>
                        <div className="space-y-3 p-4 bg-white/5 rounded-xl border border-white/10">
                          <div className="flex flex-col sm:flex-row gap-3">
                            <input type="text" value={stat.label} onChange={(e) => updateStat(index, 'label', e.target.value)} placeholder="Stat Label (e.g., Books Read)" className={`flex-1 px-4 sm:px-5 py-3 sm:py-4 rounded-xl bg-white/10 border-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm font-medium text-sm sm:text-base transition-colors ${validationErrors[`stat-${index}-label`] ? 'border-red-500' : 'border-white/20'}`} />
                            <input type="text" value={stat.value} onChange={(e) => updateStat(index, 'value', e.target.value)} placeholder="Value (e.g., 42, Lagos, A+)" className={`flex-1 px-4 sm:px-5 py-3 sm:py-4 rounded-xl bg-white/10 border-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm font-medium text-sm sm:text-base transition-colors ${validationErrors[`stat-${index}-value`] ? 'border-red-500' : 'border-white/20'}`} />
                            {stats.length > 1 && (<button onClick={() => removeStat(index)} className="px-4 py-3 sm:py-4 bg-red-500/20 hover:bg-red-500/40 rounded-xl text-white transition-colors border-2 border-red-500/40 self-start sm:self-auto"><Trash2 size={20} /></button>)}
                          </div>
                          <input type="text" value={stat.note} onChange={(e) => updateStat(index, 'note', e.target.value)} placeholder="Extra Info (optional)" className="w-full px-4 sm:px-5 py-2 sm:py-3 rounded-xl bg-white/10 border-2 border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm font-medium text-sm" />
                          <div className="flex items-center gap-2">
                            <input type="checkbox" id={`highlight-${index}`} checked={stat.isHighlight} onChange={(e) => updateStat(index, 'isHighlight', e.target.checked)} className="w-5 h-5 rounded border-2 border-white/20 bg-white/10 checked:bg-yellow-400 checked:border-yellow-400 cursor-pointer" />
                            <label htmlFor={`highlight-${index}`} className="text-white/80 text-sm font-medium cursor-pointer flex items-center gap-2"><Star size={16} className="text-yellow-300 fill-yellow-300" />Highlight this Stat</label>
                          </div>
                          <div className="flex items-center gap-3">
                            {stat.image ? (<div className="relative"><img src={stat.image} alt="Preview" className="w-24 sm:w-32 h-24 sm:h-32 object-cover rounded-lg border-2 border-white/20" /><button onClick={() => removeImage(index)} className="absolute -top-2 -right-2 p-1 bg-red-500 hover:bg-red-600 rounded-full text-white transition-colors"><X size={16} /></button></div>) : (<label className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-3 bg-white/10 hover:bg-white/20 rounded-xl text-white/70 transition-colors border-2 border-white/20 cursor-pointer"><Upload size={16} /><span className="text-xs sm:text-sm font-medium">Add Image</span><input type="file" accept="image/*" onChange={(e) => handleImageUpload(index, e.target.files[0])} className="hidden" /></label>)}
                          </div>
                        </div>
                        {/* Transition button between stats (not after last stat) */}
                        <BuilderTransitionButton afterStatIndex={index} isLast={index === stats.length - 1} />
                      </React.Fragment>
                    ))}
                    <button onClick={addStat} className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors border-2 border-white/20 font-bold mt-4"><Plus size={20} />Add Another Stat</button>
                  </div>
                </div>

                <div><FieldLabel>Add a Badge to your Wrap</FieldLabel><div className="space-y-4">{badges.map((badge, index) => (<div key={index} className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-3"><div className="flex gap-3 items-start"><div className="relative"><button onClick={() => setShowEmojiPicker(showEmojiPicker === index ? null : index)} className="w-14 sm:w-16 h-14 sm:h-16 text-2xl sm:text-3xl rounded-xl bg-white/10 border-2 border-white/20 hover:bg-white/20 transition-colors flex items-center justify-center">{badge.emoji}</button>{showEmojiPicker === index && <EmojiPicker selectedEmoji={badge.emoji} onSelect={(emoji) => updateBadge(index, 'emoji', emoji)} onClose={() => setShowEmojiPicker(null)} />}</div><div className="flex-1 space-y-2"><input type="text" value={badge.title} onChange={(e) => updateBadge(index, 'title', e.target.value)} placeholder="Badge Title (e.g., Top Reader)" className="w-full px-4 sm:px-5 py-3 rounded-xl bg-white/10 border-2 border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm font-medium text-sm sm:text-base" /><input type="text" value={badge.subtext || ''} onChange={(e) => updateBadge(index, 'subtext', e.target.value)} placeholder="Subtext (optional, e.g., 52 books this year)" className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/80 placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 backdrop-blur-sm text-sm" /></div><button onClick={() => removeBadge(index)} className="px-4 py-3 bg-red-500/20 hover:bg-red-500/40 rounded-xl text-white transition-colors border-2 border-red-500/40"><Trash2 size={20} /></button></div></div>))}<button onClick={addBadge} className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors border-2 border-white/20 font-bold"><Plus size={20} />Add Badge</button></div></div>
                <div><FieldLabel>Background Music</FieldLabel><select value={selectedMusic} onChange={(e) => handleMusicSelect(e.target.value)} className="w-full px-4 sm:px-5 py-3 sm:py-4 rounded-xl bg-white/10 border-2 border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent backdrop-blur-sm font-medium text-base sm:text-lg">{musicTracks.map(track => (<option key={track.id} value={track.id} className="bg-gray-900 text-white">{track.name}</option>))}</select>{selectedMusic === 'custom' && (<label className="mt-3 flex items-center gap-3 px-4 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-white/70 transition-colors border-2 border-dashed border-white/30 cursor-pointer"><Upload size={20} /><span className="font-medium">{customMusicFile ? customMusicFile.name : 'Choose audio file (.mp3, .wav, etc.)'}</span><input type="file" accept="audio/*" onChange={(e) => handleCustomMusicUpload(e.target.files[0])} className="hidden" /></label>)}{audioRef.current && (<p className="text-white/50 text-sm mt-2">Use the speaker button to play/pause music</p>)}</div>
                <div><FieldLabel><span className="flex items-center gap-2"><Sparkles size={18} className="text-white/70" />Reflection</span></FieldLabel><p className="text-white/60 text-sm mb-3">What's something you learned?</p><textarea value={reflection} onChange={(e) => setReflection(e.target.value)} placeholder="Share a meaningful insight or lesson..." className="w-full px-4 sm:px-5 py-3 sm:py-4 rounded-xl bg-white/10 border-2 border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent backdrop-blur-sm font-medium text-base sm:text-lg min-h-[100px] sm:min-h-[120px] resize-none" /></div>
                <div><FieldLabel>Choose your Wrapped Mood</FieldLabel><MoodSelector selectedMood={selectedMood} onSelect={setSelectedMood} /></div>
                <button onClick={generateWrapped} className="w-full px-6 sm:px-8 py-4 sm:py-5 bg-white hover:bg-white/90 text-black font-black rounded-xl transition-all text-lg sm:text-xl shadow-xl hover:shadow-2xl hover:scale-[1.02] uppercase tracking-wide">Generate My Wrapped</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Preview page
  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-3 sm:p-4" onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
      <DynamicBackground moodId={selectedMood} offset={auraOffset} /><NoiseOverlay />
      {showConfetti && <Confetti />}
      {activeTransition === 'drumroll' && <DrumrollOverlay count={drumrollCount} />}
      {activeTransition === 'impact' && <ImpactShake />}

      <div className="relative z-10 w-full max-w-md mx-auto">
        <div className="fixed top-4 sm:top-6 right-4 sm:right-6 flex gap-2 sm:gap-3 z-50">
          <button onClick={editWrapped} className="p-3 sm:p-4 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors backdrop-blur-sm border-2 border-white/20" title="Edit Wrapped"><Edit3 size={20} /></button>
          {audioRef.current && (<button onClick={toggleMusic} className="p-3 sm:p-4 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors backdrop-blur-sm border-2 border-white/20">{audioPlaying ? <Volume2 size={20} /> : <VolumeX size={20} />}</button>)}
        </div>

        {/* Main slide content */}
        <div onClick={nextSlide} className={`transition-all duration-500 ${getSlideAnimation()} relative cursor-pointer`} style={{ transformStyle: 'preserve-3d' }} key={currentSlide}>
            {currentSlideInfo.type === 'title' && (
              <div ref={coverRef} className="relative bg-black/40 backdrop-blur-2xl rounded-3xl text-center shadow-2xl border-2 border-white/30 min-h-[600px] sm:min-h-[700px] flex flex-col items-center justify-center overflow-hidden" onMouseMove={handleCoverMouseMove} onMouseLeave={() => setMousePosition({ x: 50, y: 50 })}>
                <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl"><div className="absolute inset-0 animate-glass-wave" style={{ background: `radial-gradient(ellipse 60% 40% at 30% 30%, rgba(255,255,255,0.08) 0%, transparent 50%), radial-gradient(ellipse 50% 50% at 70% 70%, rgba(255,255,255,0.06) 0%, transparent 50%)` }} /><div className="absolute w-48 h-48 transition-all duration-300 ease-out" style={{ left: `${mousePosition.x}%`, top: `${mousePosition.y}%`, transform: 'translate(-50%, -50%)', background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 40%, transparent 70%)', filter: 'blur(20px)' }} /><div className="absolute inset-0 animate-caustics opacity-30" /></div>
                {coverImage && (<div className="absolute inset-0 z-0"><img src={coverImage} alt="Cover" className="w-full h-full object-cover opacity-40" /><div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/60" /></div>)}
                <div className="relative z-10 flex flex-col items-center justify-center px-6 sm:px-8"><div className="text-2xl sm:text-3xl font-black text-white/70 tracking-[0.3em] uppercase mb-6 sm:mb-8 animate-float-gentle">Wrapped</div><div className="mb-6 sm:mb-8"><RainbowTitle>{title}</RainbowTitle></div>{dateRange && <div className="text-lg sm:text-xl font-bold text-white/60 uppercase tracking-[0.2em]">{dateRange}</div>}<div className="mt-8 sm:mt-12 flex items-center gap-2 text-white/40 text-sm"><span className="uppercase tracking-wider">Tap or swipe to explore</span><ArrowRight size={16} /></div></div>
                <style>{`@keyframes glass-wave { 0%, 100% { transform: translateX(-2%) translateY(-2%); } 25% { transform: translateX(2%) translateY(1%); } 50% { transform: translateX(-1%) translateY(2%); } 75% { transform: translateX(1%) translateY(-1%); } } @keyframes caustics { 0%, 100% { background: radial-gradient(ellipse 80% 60% at 20% 40%, rgba(255,255,255,0.1) 0%, transparent 40%), radial-gradient(ellipse 60% 80% at 80% 60%, rgba(255,255,255,0.08) 0%, transparent 40%); } 33% { background: radial-gradient(ellipse 70% 50% at 60% 30%, rgba(255,255,255,0.12) 0%, transparent 40%), radial-gradient(ellipse 50% 70% at 40% 70%, rgba(255,255,255,0.06) 0%, transparent 40%); } 66% { background: radial-gradient(ellipse 90% 40% at 40% 60%, rgba(255,255,255,0.08) 0%, transparent 40%), radial-gradient(ellipse 40% 90% at 70% 40%, rgba(255,255,255,0.1) 0%, transparent 40%); } } @keyframes float-gentle { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } } .animate-glass-wave { animation: glass-wave 8s ease-in-out infinite; } .animate-caustics { animation: caustics 6s ease-in-out infinite; } .animate-float-gentle { animation: float-gentle 4s ease-in-out infinite; }`}</style>
              </div>
            )}

            {currentSlideInfo.type === 'stat' && (() => {
              const stat = validStats[currentSlideInfo.index]; const isLongText = stat.value.length > 50 || stat.value.includes(':') || stat.value.includes(','); const isFirstView = stat.isHighlight && !viewedHighlights.has(currentSlideInfo.index);
              return (
                <div className={`bg-black/40 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 text-center shadow-2xl border-2 min-h-[600px] sm:min-h-[650px] flex flex-col justify-between relative overflow-hidden ${stat.isHighlight ? 'border-yellow-400/60' : 'border-white/30'}`} style={stat.isHighlight && !isFirstView ? { boxShadow: '0 0 60px rgba(250, 204, 21, 0.4), 0 0 100px rgba(250, 204, 21, 0.2), inset 0 0 60px rgba(250, 204, 21, 0.1)', animation: 'glow-breathe 3s ease-in-out infinite' } : {}}>
                  {stat.isHighlight && <HighlightGlowRing isFirstView={isFirstView} />}{stat.isHighlight && <FallingStars />}{!stat.isHighlight && !isLongText && !stat.image && getDecorativeShapes(currentSlideInfo.index)}
                  <div className={`flex-1 flex flex-col justify-center space-y-4 sm:space-y-6 relative z-10 ${activeTransition === 'impact' ? 'impact-text-stamp' : ''}`}>{stat.image && <div className="mb-4"><img src={stat.image} alt={stat.label} className="w-full max-w-sm mx-auto h-48 sm:h-64 object-cover rounded-2xl shadow-2xl border-2 border-white/20" /></div>}<div className="text-white/70 text-lg sm:text-2xl font-bold uppercase tracking-wider">{stat.label}</div><div className="text-white">{formatValue(stat.value)}</div>{stat.note && <div className="text-white/50 text-base sm:text-lg italic mt-4 max-w-md mx-auto px-2">({stat.note})</div>}</div>
                  <div className="text-white/30 font-black text-sm uppercase tracking-widest mt-4 relative z-10">{dateRange || 'Wrapped'}</div>
                  <style>{`@keyframes glow-breathe { 0%, 100% { box-shadow: 0 0 60px rgba(250, 204, 21, 0.4), 0 0 100px rgba(250, 204, 21, 0.2), inset 0 0 60px rgba(250, 204, 21, 0.1); } 50% { box-shadow: 0 0 80px rgba(250, 204, 21, 0.6), 0 0 120px rgba(250, 204, 21, 0.3), inset 0 0 80px rgba(250, 204, 21, 0.15); } }`}</style>
                </div>
              );
            })()}

            {currentSlideInfo.type === 'badge' && validBadges[currentSlideInfo.index] && (
              <BadgeSlide badge={validBadges[currentSlideInfo.index]} isFirstView={!viewedBadges.has(currentSlideInfo.index)} dateRange={dateRange} />
            )}

            {currentSlideInfo.type === 'reflection' && (
              <ReflectionSlide reflection={reflection} isFirstView={!viewedReflection} dateRange={dateRange} />
            )}

            {currentSlideInfo.type === 'summary' && (
              <div className="bg-black/40 backdrop-blur-2xl rounded-3xl p-6 sm:p-10 shadow-2xl border-2 border-white/30 min-h-[600px] sm:min-h-[650px] flex flex-col justify-center relative overflow-hidden">
                <div className="text-center mb-6 sm:mb-8"><h2 className="text-3xl sm:text-5xl font-black text-white mb-3 sm:mb-4 tracking-tight">{title}</h2>{dateRange && <div className="text-lg sm:text-xl text-white/70 uppercase tracking-wide">{dateRange}</div>}</div>
                <div className="space-y-3 sm:space-y-4 max-h-[300px] sm:max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">{validStats.map((stat, index) => (<div key={index} className={`bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4 border flex items-center gap-3 sm:gap-4 ${stat.isHighlight ? 'border-yellow-400/40' : 'border-white/20'}`}>{stat.image && <img src={stat.image} alt={stat.label} className="w-12 sm:w-16 h-12 sm:h-16 object-cover rounded-lg" />}<div className="flex-1 text-left min-w-0"><div className="text-white/70 text-xs sm:text-sm font-semibold uppercase tracking-wide flex items-center gap-2">{stat.isHighlight && <Star size={12} className="text-yellow-300 fill-yellow-300 flex-shrink-0" />}<span className="truncate">{stat.label}</span></div><div className="text-white text-base sm:text-lg font-bold truncate">{stat.value.length > 40 ? stat.value.substring(0, 40) + '...' : stat.value}</div>{stat.note && <div className="text-white/50 text-xs sm:text-sm italic mt-1 truncate">{stat.note.length > 50 ? stat.note.substring(0, 50) + '...' : stat.note}</div>}</div></div>))}{validBadges.length > 0 && (<div className="pt-4 border-t border-white/20"><div className="text-white/50 text-xs uppercase tracking-wider mb-3">Badges Earned</div><div className="flex flex-wrap gap-2 sm:gap-3">{validBadges.map((badge, index) => (<div key={index} className="bg-white/10 rounded-xl px-3 sm:px-4 py-2 flex items-center gap-2 border border-white/20"><span className="text-xl sm:text-2xl">{badge.emoji}</span><span className="text-white font-semibold text-sm sm:text-base">{badge.title}</span></div>))}</div></div>)}{hasReflection && (<div className="pt-4 border-t border-white/20"><div className="text-white/50 text-xs uppercase tracking-wider mb-3 flex items-center gap-2"><Sparkles size={12} />Reflection</div><div className="text-white/80 italic text-sm sm:text-base">"{reflection.length > 100 ? reflection.substring(0, 100) + '...' : reflection}"</div></div>)}</div>
                <div className="mt-6 sm:mt-8 text-center"><div className="text-white/50 text-sm uppercase tracking-widest">That's a wrap!</div></div>
              </div>
            )}
          </div>

        <div className="flex justify-between items-center mt-6 sm:mt-8">
          <button onClick={prevSlide} disabled={currentSlide === 0 || isAnimating || activeTransition === 'drumroll'} className="p-3 sm:p-4 bg-white/10 hover:bg-white/20 disabled:bg-white/5 disabled:cursor-not-allowed rounded-full text-white transition-colors backdrop-blur-sm border-2 border-white/20"><ArrowLeft size={24} /></button>
          <ProgressDots current={currentSlide} total={totalSlides} />
          {currentSlide < totalSlides - 1 ? (<button onClick={nextSlide} disabled={isAnimating || activeTransition === 'drumroll'} className="p-3 sm:p-4 bg-white/10 hover:bg-white/20 disabled:bg-white/5 rounded-full text-white transition-colors backdrop-blur-sm border-2 border-white/20"><ArrowRight size={24} /></button>) : (<button onClick={shareWrapped} className="flex items-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 bg-white hover:bg-white/90 rounded-full text-black font-black transition-all shadow-xl hover:shadow-2xl hover:scale-105 uppercase tracking-wide text-sm sm:text-base"><Share2 size={18} />Share</button>)}
        </div>

        {currentSlideInfo.type === 'summary' && (<button onClick={resetWrapped} className="w-full mt-4 sm:mt-6 px-6 py-3 sm:py-4 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors backdrop-blur-sm border-2 border-white/20 font-bold uppercase tracking-wide text-sm sm:text-base">Create New Wrapped</button>)}
      </div>

      <style>{`
        @keyframes slide-out-left { 0% { transform: translateX(0) scale(1); opacity: 1; } 100% { transform: translateX(-100px) scale(0.9); opacity: 0; } }
        @keyframes slide-out-right { 0% { transform: translateX(0) scale(1); opacity: 1; } 100% { transform: translateX(100px) scale(0.9); opacity: 0; } }
        @keyframes slide-in { 0% { transform: translateX(50px) scale(0.95); opacity: 0; } 100% { transform: translateX(0) scale(1); opacity: 1; } }
        @keyframes impact-drop {
          0% { transform: translateY(-120vh) scale(1); opacity: 1; }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }
        @keyframes text-stamp {
          0% { transform: scale(1.4); opacity: 0.7; }
          60% { transform: scale(1.4); opacity: 0.7; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes blob1 { 0%, 100% { transform: translate(0%, 0%); } 25% { transform: translate(40%, 30%); } 50% { transform: translate(20%, 50%); } 75% { transform: translate(50%, 20%); } }
        @keyframes blob2 { 0%, 100% { transform: translate(0%, 0%); } 25% { transform: translate(-30%, -40%); } 50% { transform: translate(-20%, -50%); } 75% { transform: translate(-50%, -20%); } }
        @keyframes blob3 { 0%, 100% { transform: translate(0%, 0%); } 33% { transform: translate(30%, -30%); } 66% { transform: translate(-30%, 30%); } }
        @keyframes blob-safari-1 { 0%, 100% { transform: translate(0%, 0%); } 50% { transform: translate(10%, 15%); } }
        @keyframes blob-safari-2 { 0%, 100% { transform: translate(0%, 0%); } 50% { transform: translate(-10%, -10%); } }
        @keyframes blob-safari-3 { 0%, 100% { transform: translate(0%, 0%); } 50% { transform: translate(5%, -12%); } }
        .animate-slide-out-left { animation: slide-out-left 0.5s ease-out forwards; }
        .animate-slide-out-right { animation: slide-out-right 0.5s ease-out forwards; }
        .animate-slide-in { animation: slide-in 0.5s ease-out forwards; }
        .animate-impact-drop { animation: impact-drop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
        .impact-text-stamp { animation: text-stamp 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
        .animate-blob1 { animation: blob1 20s ease-in-out infinite; }
        .animate-blob2 { animation: blob2 25s ease-in-out infinite; }
        .animate-blob3 { animation: blob3 22s ease-in-out infinite; }
        .animate-blob-safari-1 { animation: blob-safari-1 30s ease-in-out infinite; }
        .animate-blob-safari-2 { animation: blob-safari-2 35s ease-in-out infinite; }
        .animate-blob-safari-3 { animation: blob-safari-3 32s ease-in-out infinite; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.1); border-radius: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.3); border-radius: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.5); }
      `}</style>
    </div>
  );
}
