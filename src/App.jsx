import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Share2, Plus, Trash2, ArrowRight, ArrowLeft, Sparkles, Volume2, VolumeX, Upload, X, Star, Edit3, ImagePlus, Book, Plane, Heart, GraduationCap, Film, Dumbbell, Lock, Bell, Check, ChevronRight, Lightbulb, Camera, Link, Copy, Loader2 } from 'lucide-react';

export default function App() {
  const [step, setStep] = useState('home');
  const [title, setTitle] = useState('');
  const [dateRange, setDateRange] = useState('');
  const [coverImage, setCoverImage] = useState(null);
  const [selectedMood, setSelectedMood] = useState('twilight');
  const [stats, setStats] = useState([{ label: '', value: '', image: null, note: '', isHighlight: false }]);
  const [moments, setMoments] = useState([]);
  // Content order tracks the sequence of stats and moments: [{type: 'stat', index: 0}, {type: 'moment', index: 0}, ...]
  const [contentOrder, setContentOrder] = useState([{ type: 'stat', index: 0 }]);
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
  const [drumrollFading, setDrumrollFading] = useState(false);
  const [drumrollReveal, setDrumrollReveal] = useState(false);
  const [showDrumrollGlitter, setShowDrumrollGlitter] = useState(false);

  // Summary navigation
  const [navigatedFromSummary, setNavigatedFromSummary] = useState(false);

  // Track which slides have had their impact animation played
  const [impactPlayedSlides, setImpactPlayedSlides] = useState(new Set());
  const [textPlayedSlides, setTextPlayedSlides] = useState(new Set());
  const [slideTextTheme, setSlideTextTheme] = useState({});
  

  // Shareable wraps state
  const [wrapId, setWrapId] = useState(null);
  const [isViewMode, setIsViewMode] = useState(false);
  const [shareUrl, setShareUrl] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState(null);

  const coverRef = useRef(null);
  const audioRef = useRef(null);
  const drumrollIntervalRef = useRef(null);
  const drumrollTimeoutsRef = useRef([]);

  const transitionTypes = [
    { id: 'default', name: 'Smooth Slide', description: 'Clean slide transition' },
    { id: 'drumroll', name: 'Drumroll Please', description: '3-2-1 countdown reveal' },
    { id: 'impact', name: 'Impact', description: 'Dramatic drop-in effect' },
  ];


  const templates = [
    { id: 'romance', name: 'Romance', icon: Heart, color: '#ec4899', mood: 'crimson',
      stats: [{ label: 'Favorite Moment', value: '', isHighlight: true }, { label: 'Dates', value: '', isHighlight: false }, { label: 'Biggest Romantic Discovery', value: '', isHighlight: false }],
      moments: [] },
    { id: 'books', name: 'Books', icon: Book, color: '#8b5cf6', mood: 'twilight',
      stats: [{ label: 'Favorite Book', value: '', isHighlight: true }, { label: 'Books Read', value: '', isHighlight: false }, { label: 'Pages Read', value: '', isHighlight: false }, { label: 'Authors Discovered', value: '', isHighlight: false }],
      moments: [] },
    { id: 'travel', name: 'Travel', icon: Plane, color: '#06b6d4', mood: 'aurora',
      stats: [{ label: 'Favorite Travel Moment', value: '', isHighlight: true }, { label: 'Places Visited', value: '', isHighlight: false }],
      moments: [{ label: 'A Moment Worth Remembering', image: null, glowColor: 'cyan' }] },
    { id: 'study', name: 'Study', icon: GraduationCap, color: '#10b981', mood: 'ocean',
      stats: [{ label: 'Biggest Breakthrough', value: '', isHighlight: true }, { label: 'Favorite Time to Study', value: '', isHighlight: false }, { label: 'Biggest Accomplishment', value: '', isHighlight: false }],
      moments: [] },
    { id: 'movies', name: 'Movies', icon: Film, color: '#f59e0b', mood: 'bronzed',
      stats: [{ label: 'Favorite Movie', value: '', isHighlight: true }, { label: 'Movies Watched', value: '', isHighlight: false }, { label: 'Least Favorite Movie', value: '', isHighlight: false }, { label: 'Most Watched Genre', value: '', isHighlight: false }],
      moments: [] },
    { id: 'fitness', name: 'Fitness', icon: Dumbbell, color: '#ef4444', mood: 'midnight',
      stats: [{ label: 'Personal Record', value: '', isHighlight: true }, { label: 'Biggest Accomplishment', value: '', isHighlight: false }, { label: 'Next Fitness Goal', value: '', isHighlight: false }],
      moments: [] },
  ];

  const moods = [
    { id: 'crimson', name: 'Crimson Glow', colors: ['#dc2626', '#ec4899'], bgColors: ['#450a0a', '#831843', '#4a044e'], description: 'Warm, intimate, passionate' },
    { id: 'bronzed', name: 'Bronzed', colors: ['#d97706', '#fbbf24'], bgColors: ['#451a03', '#78350f', '#422006'], description: 'Luxurious, radiant, golden' },
    { id: 'forest', name: 'Forest Mist', colors: ['#16a34a', '#14b8a6'], bgColors: ['#052e16', '#134e4a', '#042f2e'], description: 'Calm, grounded, nature-inspired' },
    { id: 'ocean', name: 'Ocean Wave', colors: ['#2563eb', '#38bdf8'], bgColors: ['#1e1b4b', '#172554', '#0c4a6e'], description: 'Cool, serene, reflective' },
    { id: 'twilight', name: 'Twilight', colors: ['#7c3aed', '#c4b5fd'], bgColors: ['#2e1065', '#6d195fff', '#4a044e'], description: 'Creative, dreamy, mystical' },
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
    { id: 'sweet', name: 'Sweet Life - AlexGrohl', url: '/sweet-life-luxury-chill-438146.mp3' },
    { id: 'groovy', name: 'Groovy Vibes - Pumpupthemind', url: '/groovy-vibes-231539.mp3' },
    { id: 'hype', name: 'Hype - kontraa', url: '/hype-drill-music-438398.mp3' },
    { id: 'futuristic', name: 'Futuristic Beat - NverAvetyanMusic', url: '/futuristic-beat-146661.mp3' },
    { id: 'lost', name: 'Lost in the Soul - Eliza_music', url: '/lost-in-the-soul-438449.mp3' },
    { id: 'custom', name: 'Upload Your Own Music', url: 'custom' },
  ];

  // Glow colors for Moments
  const momentGlowColors = [
    { id: 'gold', name: 'Golden', color: '#fbbf24', glow: 'rgba(251, 191, 36, 0.6)' },
    { id: 'rose', name: 'Rose', color: '#f472b6', glow: 'rgba(244, 114, 182, 0.6)' },
    { id: 'cyan', name: 'Cyan', color: '#22d3ee', glow: 'rgba(34, 211, 238, 0.6)' },
    { id: 'violet', name: 'Violet', color: '#a78bfa', glow: 'rgba(167, 139, 250, 0.6)' },
    { id: 'emerald', name: 'Emerald', color: '#34d399', glow: 'rgba(52, 211, 153, 0.6)' },
    { id: 'white', name: 'White', color: '#f8fafc', glow: 'rgba(248, 250, 252, 0.5)' },
  ];
  
  const [customMusicFile, setCustomMusicFile] = useState(null);

  const getMoodColors = (moodId) => moods.find(m => m.id === moodId)?.colors || ['#7c3aed', '#c4b5fd'];
  const getMoodBgColors = (moodId) => moods.find(m => m.id === moodId)?.bgColors || ['#2e1065', '#3b0764', '#4a044e'];

  const applyTemplate = (templateId) => {
    // If clicking the same template, uncheck it (clear stats and moments but keep mood)
    if (selectedTemplate === templateId) {
      setSelectedTemplate(null);
      setStats([{ label: '', value: '', image: null, note: '', isHighlight: false }]);
      setMoments([]);
      setContentOrder([{ type: 'stat', index: 0 }]);
      // Keep the current mood - don't reset it
      return;
    }

    const template = templates.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(templateId);
      const newStats = template.stats.map(s => ({ ...s, image: null, note: '' }));
      const newMoments = template.moments ? template.moments.map(m => ({ ...m })) : [];
      setStats(newStats);
      setMoments(newMoments);
      // Build content order: all stats first, then all moments
      const newContentOrder = [
        ...newStats.map((_, i) => ({ type: 'stat', index: i })),
        ...newMoments.map((_, i) => ({ type: 'moment', index: i }))
      ];
      setContentOrder(newContentOrder);
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

  const addStat = () => {
    const newIndex = stats.length;
    setStats([...stats, { label: '', value: '', image: null, note: '', isHighlight: false }]);
    setContentOrder([...contentOrder, { type: 'stat', index: newIndex }]);
  };
  const removeStat = (index) => {
    setStats(stats.filter((_, i) => i !== index));
    // Update contentOrder: remove this stat and adjust indices for remaining stats
    setContentOrder(contentOrder
      .filter(item => !(item.type === 'stat' && item.index === index))
      .map(item => item.type === 'stat' && item.index > index ? { ...item, index: item.index - 1 } : item)
    );
  };
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

  // Moment functions
  const addMoment = () => {
    const newIndex = moments.length;
    setMoments([...moments, { label: '', image: null, glowColor: 'gold' }]);
    setContentOrder([...contentOrder, { type: 'moment', index: newIndex }]);
  };
  const removeMoment = (index) => {
    setMoments(moments.filter((_, i) => i !== index));
    // Update contentOrder: remove this moment and adjust indices for remaining moments
    setContentOrder(contentOrder
      .filter(item => !(item.type === 'moment' && item.index === index))
      .map(item => item.type === 'moment' && item.index > index ? { ...item, index: item.index - 1 } : item)
    );
  };
  const updateMoment = (index, field, value) => {
    const newMoments = [...moments];
    newMoments[index][field] = value;
    setMoments(newMoments);
  };

  const [imageFormatError, setImageFormatError] = useState(null);

  const unsupportedFormats = ['image/heic', 'image/heif'];

  const handleImageUpload = (index, file) => {
    if (!file) return;

    const fileExtension = file.name.toLowerCase().split('.').pop();
    const isHeic = fileExtension === 'heic' || fileExtension === 'heif' || unsupportedFormats.includes(file.type);

    if (isHeic) {
      setImageFormatError('HEIC/HEIF format is not supported. Please use JPEG, PNG, GIF, or WebP.');
      setTimeout(() => setImageFormatError(null), 5000);
      return;
    }

    if (file.type.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(fileExtension)) {
      const reader = new FileReader();
      reader.onload = (e) => { const newStats = [...stats]; newStats[index].image = e.target.result; setStats(newStats); };
      reader.readAsDataURL(file);
    } else {
      setImageFormatError('Unsupported image format. Please use JPEG, PNG, GIF, or WebP.');
      setTimeout(() => setImageFormatError(null), 5000);
    }
  };

  const handleCoverImageUpload = (file) => {
    if (!file) return;

    const fileExtension = file.name.toLowerCase().split('.').pop();
    const isHeic = fileExtension === 'heic' || fileExtension === 'heif' || unsupportedFormats.includes(file.type);

    if (isHeic) {
      setImageFormatError('HEIC/HEIF format is not supported. Please use JPEG, PNG, GIF, or WebP.');
      setTimeout(() => setImageFormatError(null), 5000);
      return;
    }

    if (file.type.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(fileExtension)) {
      const reader = new FileReader();
      reader.onload = (e) => setCoverImage(e.target.result);
      reader.readAsDataURL(file);
    } else {
      setImageFormatError('Unsupported image format. Please use JPEG, PNG, GIF, or WebP.');
      setTimeout(() => setImageFormatError(null), 5000);
    }
  };

  const removeImage = (index) => { const newStats = [...stats]; newStats[index].image = null; setStats(newStats); };

  // Moment image upload
  const handleMomentImageUpload = (index, file) => {
    if (!file) return;
    const fileExtension = file.name.toLowerCase().split('.').pop();
    const isHeic = fileExtension === 'heic' || fileExtension === 'heif' || unsupportedFormats.includes(file.type);
    if (isHeic) {
      setImageFormatError('HEIC/HEIF format is not supported. Please use JPEG, PNG, GIF, or WebP.');
      setTimeout(() => setImageFormatError(null), 5000);
      return;
    }
    if (file.type.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(fileExtension)) {
      const reader = new FileReader();
      reader.onload = (e) => { const newMoments = [...moments]; newMoments[index].image = e.target.result; setMoments(newMoments); };
      reader.readAsDataURL(file);
    } else {
      setImageFormatError('Unsupported image format. Please use JPEG, PNG, GIF, or WebP.');
      setTimeout(() => setImageFormatError(null), 5000);
    }
  };

  // Music handling - toggle only via button
  const handleMusicSelect = (musicId) => {
    const wasPlaying = audioPlaying;
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
        createAudio(track.url, wasPlaying);
      }
    } else {
      setAudioPlaying(false);
    }
  };
  
  const handleCustomMusicUpload = (file) => {
    if (!file) return;

    // Check if it's an audio file by type or extension
    const audioExtensions = ['mp3', 'wav', 'ogg', 'm4a', 'aac', 'flac', 'wma', 'webm'];
    const fileExtension = file.name.toLowerCase().split('.').pop();
    const isAudioFile = file.type.startsWith('audio/') || audioExtensions.includes(fileExtension);

    if (isAudioFile) {
      // Clean up previous audio object URL if it exists
      if (audioRef.current?.src?.startsWith('blob:')) {
        URL.revokeObjectURL(audioRef.current.src);
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      const url = URL.createObjectURL(file);
      setCustomMusicFile(file);
      createAudio(url, false);
    }
  };

  const createAudio = (url, shouldPlay = false) => {
    const audio = new Audio();
    audio.src = url;
    audio.loop = true;
    audio.volume = 0.5;
    audioRef.current = audio;

    if (shouldPlay) {
      audio.play().then(() => {
        setAudioPlaying(true);
      }).catch(err => {
        console.error('Audio playback failed:', err);
        setAudioPlaying(false);
      });
    } else {
      setAudioPlaying(false); // Don't auto-play
    }
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
    setStats([{ label: '', value: '', image: null, note: '', isHighlight: false }]); setMoments([]); setBadges([]);
    setContentOrder([{ type: 'stat', index: 0 }]);
    setReflection(''); setSelectedMusic(''); setStep('input'); setCurrentSlide(0);
    setViewedHighlights(new Set()); setViewedBadges(new Set()); setViewedReflection(false);
    setShowConfetti(false); setAttemptedSubmit(false); setValidationErrors({}); setSelectedTemplate(null);
    setTransitions({}); setCustomMusicFile(null);
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = ''; audioRef.current = null; }
    setAudioPlaying(false);
    // Reset shareable state
    setWrapId(null); setIsViewMode(false); setShareUrl(null); setShareModalOpen(false);
    // Navigate to home and clear URL
    window.history.pushState({}, '', '/');
  };

  // Load a shared wrap from the API
  const loadWrap = useCallback(async (id) => {
    setIsLoading(true);
    setLoadError(null);
    console.log('[loadWrap] Fetching wrap:', id);

    try {
      const res = await fetch(`/api/wraps/${id}`);
      console.log('[loadWrap] Response status:', res.status);

      // Check if response is JSON
      const contentType = res.headers.get('content-type');
      console.log('[loadWrap] Content-Type:', contentType);

      if (!contentType || !contentType.includes('application/json')) {
        // Try to get error text for debugging
        const text = await res.text().catch(() => '');
        console.error('[loadWrap] Non-JSON response:', text.substring(0, 200));
        setLoadError('Unable to connect to the server. Please try again later.');
        setIsLoading(false);
        return;
      }

      const data = await res.json();
      console.log('[loadWrap] Response data:', { hasError: !!data.error, hasTitle: !!data.title });

      if (!res.ok) {
        if (res.status === 404) {
          setLoadError('This wrap was not found or may have expired.');
        } else if (res.status === 503) {
          setLoadError(data.message || 'Service temporarily unavailable. Please try again later.');
        } else {
          setLoadError(data.message || data.error || 'Failed to load wrap. Please try again.');
        }
        setIsLoading(false);
        return;
      }

      // Populate state with loaded data
      setTitle(data.title || '');
      setDateRange(data.dateRange || '');
      setCoverImage(data.coverImage || null);
      setSelectedMood(data.selectedMood || 'twilight');
      setStats(data.stats || [{ label: '', value: '', image: null, note: '', isHighlight: false }]);
      setMoments(data.moments || []);
      setBadges(data.badges || []);
      setReflection(data.reflection || '');
      setContentOrder(data.contentOrder || [{ type: 'stat', index: 0 }]);
      setSelectedMusic(data.selectedMusic || '');
      setTransitions(data.transitions || {});

      // Set view mode and navigate to preview
      setWrapId(id);
      setIsViewMode(true);
      setStep('preview');
      setCurrentSlide(0);
      setIsLoading(false);
      console.log('[loadWrap] Wrap loaded successfully');
    } catch (error) {
      console.error('[loadWrap] Error:', error);
      setLoadError('Unable to connect to the server. Please check your connection and try again.');
      setIsLoading(false);
    }
  }, []);

  // Check URL on mount for shared wrap
  useEffect(() => {
    const path = window.location.pathname;
    const match = path.match(/^\/w\/([a-zA-Z0-9_-]+)$/);
    if (match) {
      loadWrap(match[1]);
    }
  }, [loadWrap]);

  useEffect(() => { if (attemptedSubmit) validateForm(); }, [title, dateRange, stats, attemptedSubmit]);

  const validStats = stats.filter(s => s.label && s.value);
  const validMoments = moments.filter(m => m.label && m.image);
  const validBadges = badges.filter(b => b.emoji && b.title);
  const hasReflection = reflection.trim() !== '';

  // Build valid content order - filters contentOrder to only include valid items
  const validContentOrder = contentOrder.filter(item => {
    if (item.type === 'stat') return stats[item.index]?.label && stats[item.index]?.value;
    if (item.type === 'moment') return moments[item.index]?.label && moments[item.index]?.image;
    return false;
  });

  const totalSlides = validContentOrder.length + validBadges.length + (hasReflection ? 1 : 0) + 2;

  // Save wrap and get shareable link
  const saveWrap = useCallback(async () => {
    if (isSaving) return;
    setIsSaving(true);

    try {
      const wrapData = {
        title,
        dateRange,
        selectedMood,
        stats: validStats,
        moments: validMoments,
        badges: validBadges,
        reflection,
        contentOrder: validContentOrder,
        coverImage,
        selectedMusic,
        transitions,
      };

      const res = await fetch('/api/wraps/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(wrapData),
      });

      // Check if response is JSON (API might not be available locally)
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('API not available. Deploy to Vercel or run with `vercel dev` to enable sharing.');
      }

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to save wrap');
      }

      const { id, url } = await res.json();
      setWrapId(id);
      setShareUrl(url);
      setShareModalOpen(true);

      // Update URL without reloading
      window.history.pushState({}, '', `/w/${id}`);
    } catch (error) {
      console.error('Error saving wrap:', error);
      // Show more helpful error message
      const isLocalDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      if (isLocalDev && error.message.includes('API not available')) {
        alert('Sharing requires the Vercel backend.\n\nTo test locally, run: vercel dev\n\nOr deploy to Vercel to enable sharing.');
      } else {
        alert(error.message || 'Failed to save wrap. Please try again.');
      }
    } finally {
      setIsSaving(false);
    }
  }, [title, dateRange, selectedMood, validStats, validMoments, validBadges, reflection, validContentOrder, coverImage, selectedMusic, transitions, isSaving]);

  const executeTransition = useCallback((transitionData, _direction, callback, destSlide) => {
    const transitionType = transitionData?.type || transitionData || 'default';

    if (transitionType === 'drumroll') {
      setActiveTransition('drumroll');
      setDrumrollCount(3);
      setDrumrollReveal(false);
      setShowDrumrollGlitter(false);
      // Clear any previous drumroll timers
      if (drumrollIntervalRef.current) clearInterval(drumrollIntervalRef.current);
      drumrollTimeoutsRef.current.forEach(t => clearTimeout(t));
      drumrollTimeoutsRef.current = [];

      const countdown = setInterval(() => {
        setDrumrollCount(prev => {
          if (prev <= 1) {
            clearInterval(countdown);
            drumrollIntervalRef.current = null;
            callback();
            setDrumrollReveal(true);
            setDrumrollFading(true);
            setShowDrumrollGlitter(true);
            const glitterTimeout = setTimeout(() => setShowDrumrollGlitter(false), 5500);
            drumrollTimeoutsRef.current.push(glitterTimeout);
            const clearTimeoutMs = 600 + 5500;
            const clearTimeout2 = setTimeout(() => {
              setDrumrollFading(false);
              setActiveTransition(null);
              setDrumrollReveal(false);
            }, clearTimeoutMs);
            drumrollTimeoutsRef.current.push(clearTimeout2);
            return 0;
          }
          return prev - 1;
        });
      }, 800);
      drumrollIntervalRef.current = countdown;
    } else if (transitionType === 'impact') {
      // First change the slide, then show impact animation on the new slide
      callback();
      // Small delay to let slide change, then trigger impact animation
      setTimeout(() => {
        setActiveTransition('impact');
        // Mark this slide as having played its impact animation (only if destSlide provided)
        if (typeof destSlide === 'number') {
          setImpactPlayedSlides(prev => new Set([...prev, destSlide]));
        }
        // Clear impact transition after animation completes (longer duration for savoring)
        setTimeout(() => {
          setActiveTransition(null);
        }, 2500);
      }, 50);
    } else {
      callback();
    }
  }, []);

  // Clean function to skip drumroll immediately
  const skipDrumroll = useCallback(() => {
    if (drumrollIntervalRef.current) {
      clearInterval(drumrollIntervalRef.current);
      drumrollIntervalRef.current = null;
    }
    drumrollTimeoutsRef.current.forEach(t => clearTimeout(t));
    drumrollTimeoutsRef.current = [];
    setActiveTransition(null);
    setDrumrollFading(false);
    setDrumrollReveal(false);
    setDrumrollCount(0);
    setShowDrumrollGlitter(false);
  }, []);

  const nextSlide = useCallback(() => {
    // Allow navigation during drumroll transition
    const canNavigate = !isAnimating || activeTransition === 'drumroll';
    if (currentSlide < totalSlides - 1 && canNavigate) {
      // If skipping during drumroll, clean up immediately
      if (activeTransition === 'drumroll') {
        skipDrumroll();
      }
      // Clear drumroll sparkles when moving to next slide
      setShowDrumrollGlitter(false);
      const destinationSlide = currentSlide + 1;
      const transitionData = transitions[destinationSlide];
      setSlideDirection('next');
      // If this transition is a drumroll, don't set isAnimating so user can navigate during countdown
      const isDrum = (transitionData?.type || transitionData) === 'drumroll';
      if (!isDrum) setIsAnimating(true);

      executeTransition(transitionData, 'next', () => {
        if (isDrum) {
          // For drumroll: reveal the slide immediately (under the overlay) and allow a soft fade-in
          setCurrentSlide(destinationSlide);
          // keep isAnimating as false so user can navigate while drumroll is running
          setIsAnimating(false);
          setDrumrollReveal(true);
          if (destinationSlide === totalSlides - 1) setShowConfetti(true);
        } else {
          setTimeout(() => {
            setCurrentSlide(destinationSlide);
            setIsAnimating(false);
            if (destinationSlide === totalSlides - 1) setShowConfetti(true);
          }, (transitionData?.type || transitionData) === 'default' || !transitionData ? 400 : 100);
        }
      }, destinationSlide);
    }
  }, [currentSlide, totalSlides, isAnimating, activeTransition, transitions, executeTransition, skipDrumroll]);

  const prevSlide = useCallback(() => {
    // Allow navigation during drumroll transition
    const canNavigate = !isAnimating || activeTransition === 'drumroll';
    if (currentSlide > 0 && canNavigate) {
      // If skipping during drumroll, clean up immediately
      if (activeTransition === 'drumroll') {
        skipDrumroll();
      }
      // Clear drumroll sparkles when moving to prev slide
      setShowDrumrollGlitter(false);
      setDrumrollReveal(false);
      setSlideDirection('prev'); setIsAnimating(true); setShowConfetti(false);
      setTimeout(() => { setCurrentSlide(prev => prev - 1); setIsAnimating(false); }, 400);
    }
  }, [currentSlide, isAnimating, activeTransition, skipDrumroll]);

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

  // Share button handler - saves wrap if not already saved, then shows modal
  const shareWrapped = async () => {
    if (shareUrl) {
      // Already saved, just open the modal
      setShareModalOpen(true);
    } else {
      // Save and get shareable link
      await saveWrap();
    }
  };

  // Copy share URL to clipboard
  const copyShareUrl = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
    }
  };

  const navigateToSlideFromSummary = (slideIndex) => {
    setNavigatedFromSummary(true);
    setSlideDirection('prev');
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentSlide(slideIndex);
      setIsAnimating(false);
    }, 400);
  };

  const returnToSummary = () => {
    setNavigatedFromSummary(false);
    setSlideDirection('next');
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentSlide(totalSlides - 1);
      setIsAnimating(false);
    }, 400);
  };

  const getSlideType = (slideIndex) => {
    if (slideIndex === 0) return { type: 'title' };
    // Content slides (stats and moments interleaved)
    const contentIndex = slideIndex - 1;
    if (contentIndex < validContentOrder.length) {
      const item = validContentOrder[contentIndex];
      return { type: item.type, index: item.index, contentIndex };
    }
    // After content: badges, reflection, summary
    const afterContent = contentIndex - validContentOrder.length;
    if (afterContent < validBadges.length) return { type: 'badge', index: afterContent };
    if (hasReflection && afterContent - validBadges.length === 0) return { type: 'reflection' };
    return { type: 'summary' };
  };

  const currentSlideInfo = getSlideType(currentSlide);

  useEffect(() => {
    if (currentSlideInfo.type === 'stat') {
      const statIndex = currentSlideInfo.index;
      if (validStats[statIndex]?.isHighlight && !viewedHighlights.has(statIndex)) {
        // delay marking highlights as viewed so highlight animations (glow + stars) can play
        const markTimeout = setTimeout(() => {
          setViewedHighlights(prev => new Set([...prev, statIndex]));
        }, 1200);
        return () => clearTimeout(markTimeout);
      }
    }
    if (currentSlideInfo.type === 'badge') { const badgeIndex = currentSlideInfo.index; if (!viewedBadges.has(badgeIndex)) { setViewedBadges(prev => new Set([...prev, badgeIndex])); } }
    if (currentSlideInfo.type === 'reflection' && !viewedReflection) { setViewedReflection(true); }
  }, [currentSlide, currentSlideInfo, validStats, viewedHighlights, viewedBadges, viewedReflection]);

  // Mark non-highlight text reveal as played shortly after it starts to avoid replaying
  useEffect(() => {
    if (currentSlideInfo.type !== 'stat') return;
    const statIndex = currentSlideInfo.index;
    const stat = validStats[statIndex];
    if (!stat) return;
    const impactAlreadyPlayed = impactPlayedSlides.has(currentSlide);
    const wouldShowTextReveal = activeTransition !== 'impact' && activeTransition !== 'drumroll' && !impactAlreadyPlayed && !textPlayedSlides.has(currentSlide);
    if (wouldShowTextReveal) {
      // assign a randomized theme for this slide if not already set (and no custom transition)
      const transitionData = transitions[currentSlide];
      if (!slideTextTheme[currentSlide] && (!transitionData || (transitionData?.type || transitionData) === 'default')) {
        setSlideTextTheme(prev => ({ ...prev, [currentSlide]: Math.floor(Math.random() * 3) }));
      }
      const t = setTimeout(() => {
        setTextPlayedSlides(prev => new Set([...prev, currentSlide]));
      }, 80);
      return () => clearTimeout(t);
    }
  }, [currentSlide, currentSlideInfo, validStats, activeTransition, impactPlayedSlides, textPlayedSlides]);

  // Ensure a randomized text theme exists for slides without a custom transition when first entering
  useEffect(() => {
    const sd = currentSlide;
    const transitionData = transitions[sd];
    const slideInfo = getSlideType(sd);
    if (slideInfo.type !== 'stat') return;
    const stat = validStats[slideInfo.index];
    if (!stat) return;
    if (slideTextTheme[sd] !== undefined) return; // already assigned
    if (transitionData && (transitionData?.type || transitionData) !== 'default') return; // has custom transition
    // assign now so the animation theme is randomized but stable on first view
    setSlideTextTheme(prev => ({ ...prev, [sd]: Math.floor(Math.random() * 3) }));
  }, [currentSlide, transitions, validStats, slideTextTheme]);

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

  // Impact Transition - Dust particles floating away from the sides of the frame
  const ImpactDots = () => {
    // Create multiple waves of dust particles for extended effect
    // Wave 1: Immediate after slam
    // Wave 2: Slightly delayed for continuous effect
    const createWave = (waveDelay) => {
      const leftDots = Array.from({ length: 12 }, (_, i) => ({
        id: `left-w${waveDelay}-${i}`,
        side: 'left',
        startY: 5 + Math.random() * 90,
        tx: -(60 + Math.random() * 100),
        ty: (Math.random() - 0.5) * 80,
        delay: 0.5 + waveDelay + Math.random() * 0.3,
        size: 2 + Math.random() * 4,
        duration: 1.5 + Math.random() * 0.8,
      }));

      const rightDots = Array.from({ length: 12 }, (_, i) => ({
        id: `right-w${waveDelay}-${i}`,
        side: 'right',
        startY: 5 + Math.random() * 90,
        tx: 60 + Math.random() * 100,
        ty: (Math.random() - 0.5) * 80,
        delay: 0.5 + waveDelay + Math.random() * 0.3,
        size: 2 + Math.random() * 4,
        duration: 1.5 + Math.random() * 0.8,
      }));

      return [...leftDots, ...rightDots];
    };

    // Create 3 waves of dots for extended duration
    const allDots = [...createWave(0), ...createWave(0.6), ...createWave(1.2)];

    return (
      <div className="absolute inset-0 pointer-events-none z-20 overflow-visible">
        {allDots.map((dot) => (
          <div
            key={dot.id}
            className="absolute bg-white rounded-full opacity-0"
            style={{
              width: dot.size,
              height: dot.size,
              left: dot.side === 'left' ? '-5px' : 'auto',
              right: dot.side === 'right' ? '-5px' : 'auto',
              top: `${dot.startY}%`,
              animation: `impact-dust ${dot.duration}s ease-out forwards`,
              animationDelay: `${dot.delay}s`,
              '--tx': `${dot.tx}px`,
              '--ty': `${dot.ty}px`,
              boxShadow: '0 0 4px rgba(255,255,255,0.8)',
            }}
          />
        ))}
        <style>{`
          @keyframes impact-dust {
            0% { opacity: 0; transform: translate(0, 0) scale(0.5); }
            15% { opacity: 0.9; transform: translate(calc(var(--tx) * 0.1), calc(var(--ty) * 0.1)) scale(1); }
            100% { opacity: 0; transform: translate(var(--tx), var(--ty)) scale(0.2); }
          }
        `}</style>
      </div>
    );
  };

  // Drumroll Sparkle effect - sparkles on outside edges of frame for 5 seconds
  const DrumrollGlitter = () => {
    // Create multiple waves of sparkles along the edges
    const createSparkleWave = (waveIndex) => {
      const sparkles = [];
      const sparklesPerWave = 20;

      for (let i = 0; i < sparklesPerWave; i++) {
        // Distribute sparkles along the 4 edges
        const edge = i % 4;
        let x, y;

        if (edge === 0) { // Top edge
          x = Math.random() * 100;
          y = -5 - Math.random() * 15;
        } else if (edge === 1) { // Right edge
          x = 105 + Math.random() * 15;
          y = Math.random() * 100;
        } else if (edge === 2) { // Bottom edge
          x = Math.random() * 100;
          y = 105 + Math.random() * 15;
        } else { // Left edge
          x = -5 - Math.random() * 15;
          y = Math.random() * 100;
        }

        sparkles.push({
          id: `wave${waveIndex}-${i}`,
          x,
          y,
          delay: waveIndex * 0.8 + Math.random() * 0.6,
          size: 3 + Math.random() * 5,
          duration: 1.2 + Math.random() * 0.8,
        });
      }
      return sparkles;
    };

    // Create 5 waves of sparkles for 5 seconds of effect
    const allSparkles = [
      ...createSparkleWave(0),
      ...createSparkleWave(1),
      ...createSparkleWave(2),
      ...createSparkleWave(3),
      ...createSparkleWave(4),
    ];

    return (
      <div className="absolute inset-0 pointer-events-none z-30 overflow-visible">
        {allSparkles.map((s) => (
          <div
            key={s.id}
            className="absolute animate-drumroll-sparkle"
            style={{
              left: `${s.x}%`,
              top: `${s.y}%`,
              width: s.size,
              height: s.size,
              animationDelay: `${s.delay}s`,
              animationDuration: `${s.duration}s`,
            }}
          >
            {/* 4-point star shape */}
            <svg viewBox="0 0 24 24" fill="white" className="w-full h-full">
              <path d="M12 0L14 10L24 12L14 14L12 24L10 14L0 12L10 10Z" />
            </svg>
          </div>
        ))}
        <style>{`
          @keyframes drumroll-sparkle {
            0% { opacity: 0; transform: scale(0) rotate(0deg); }
            20% { opacity: 1; transform: scale(1.2) rotate(45deg); }
            50% { opacity: 1; transform: scale(1) rotate(90deg); }
            100% { opacity: 0; transform: scale(0.3) rotate(180deg); }
          }
          .animate-drumroll-sparkle {
            animation: drumroll-sparkle ease-out forwards;
            filter: drop-shadow(0 0 4px rgba(255,255,255,0.9)) drop-shadow(0 0 8px rgba(255,255,255,0.6));
          }
        `}</style>
      </div>
    );
  };

  // Track if we just finished drumroll for glitter effect
  

  // Drumroll Overlay
  const DrumrollOverlay = ({ count, fading, onSkip }) => {
    // glitter is managed by the executeTransition handler to keep glow+glitter in sync

    return (
      <div
        className="fixed inset-0 z-40 flex items-center justify-center cursor-pointer"
        style={{ transition: 'opacity 600ms ease', opacity: fading ? 0 : 1 }}
        onClick={onSkip}
      >
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
        {/* Skip hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/50 text-sm uppercase tracking-wider animate-pulse">
          Tap to skip
        </div>
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
  };

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

  // Share Modal - shows shareable link after saving
  const ShareModal = ({ url, onClose }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };

    return (
      <div className={`fixed inset-0 z-50 flex items-center justify-center ${isSafari ? 'bg-black/60' : 'bg-black/40 backdrop-blur-sm'}`} onClick={onClose}>
        <div className={`rounded-2xl p-6 border border-white/20 max-w-md w-full mx-4 shadow-2xl ${isSafari ? 'bg-gray-900/95' : 'bg-white/10 backdrop-blur-2xl'}`} onClick={e => e.stopPropagation()}>
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center mx-auto mb-4">
              <Check size={32} className="text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Your Wrap is Ready!</h3>
            <p className="text-white/60 text-sm">Share this link with friends so they can view your wrap.</p>
          </div>

          <div className="bg-black/30 rounded-xl p-4 mb-4">
            <div className="flex items-center gap-3">
              <Link size={18} className="text-white/50 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-mono truncate">{url}</p>
              </div>
            </div>
          </div>

          <button
            onClick={handleCopy}
            className={`w-full py-4 rounded-xl font-bold text-base uppercase tracking-wide transition-all flex items-center justify-center gap-2 ${copied ? 'bg-green-500 text-white' : 'bg-white text-black hover:bg-white/90'}`}
          >
            {copied ? <Check size={18} /> : <Copy size={18} />}
            {copied ? 'Copied!' : 'Copy Link'}
          </button>

          <button onClick={onClose} className="w-full mt-3 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-white/60 text-sm font-medium transition-colors border border-white/10">
            Close
          </button>
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
          title="Add a special transition effect between slides (drumroll countdown, impact slam, etc.)"
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
    // Always render glow DOM but only run animations when isFirstView is true so the DOM isn't unmounted/remounted
    return (<><div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none"><div className={`absolute inset-0 ${isFirstView ? 'animate-glow-ring' : ''}`}><div className="absolute inset-[-2px] rounded-3xl border-4 border-yellow-400/80" style={{ background: 'conic-gradient(from 0deg, transparent 0deg, rgba(250, 204, 21, 0.8) 30deg, rgba(250, 204, 21, 1) 60deg, rgba(250, 204, 21, 0.8) 90deg, transparent 120deg)', mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', maskComposite: 'exclude', WebkitMaskComposite: 'xor', padding: '4px' }} /></div></div><div className={`absolute inset-0 rounded-3xl ${isFirstView ? 'animate-glow-pulse' : ''} pointer-events-none`} style={{ boxShadow: '0 0 80px rgba(250, 204, 21, 0.6), 0 0 120px rgba(250, 204, 21, 0.4), inset 0 0 80px rgba(250, 204, 21, 0.15)' }} /><style>{`@keyframes glow-ring { 0% { transform: rotate(0deg); opacity: 1; } 100% { transform: rotate(360deg); opacity: 0; } } @keyframes glow-pulse { 0% { opacity: 0; } 50% { opacity: 1; } 100% { opacity: 0.6; } } .animate-glow-ring { animation: glow-ring 1.5s ease-out forwards; } .animate-glow-pulse { animation: glow-pulse 1.5s ease-out forwards; }`}</style></>);
  };

  const ReflectionGlowRing = ({ isFirstView }) => {
    if (!isFirstView) return null;
    return (<><div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none"><div className="absolute inset-0 animate-reflection-ring"><div className="absolute inset-[-2px] rounded-3xl border-4 border-white/80" style={{ background: 'conic-gradient(from 0deg, transparent 0deg, rgba(255, 255, 255, 0.6) 30deg, rgba(255, 255, 255, 0.9) 60deg, rgba(255, 255, 255, 0.6) 90deg, transparent 120deg)', mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', maskComposite: 'exclude', WebkitMaskComposite: 'xor', padding: '4px' }} /></div></div><div className="absolute inset-0 rounded-3xl animate-reflection-pulse pointer-events-none" style={{ boxShadow: '0 0 60px rgba(255, 255, 255, 0.4), 0 0 100px rgba(255, 255, 255, 0.2), inset 0 0 60px rgba(255, 255, 255, 0.1)' }} /><style>{`@keyframes reflection-ring { 0% { transform: rotate(0deg); opacity: 1; } 100% { transform: rotate(360deg); opacity: 0; } } @keyframes reflection-pulse { 0% { opacity: 0; } 50% { opacity: 1; } 100% { opacity: 0.5; } } .animate-reflection-ring { animation: reflection-ring 2s ease-out forwards; } .animate-reflection-pulse { animation: reflection-pulse 2s ease-out forwards; }`}</style></>);
  };

  const RainbowTitle = ({ children, hasCoverImage = false }) => {
    const titleLength = typeof children === 'string' ? children.length : 0;
    // Dynamically size based on title length
    const sizeClass = titleLength > 20
      ? 'text-3xl sm:text-4xl md:text-5xl'
      : titleLength > 12
        ? 'text-4xl sm:text-5xl md:text-6xl'
        : 'text-5xl sm:text-6xl md:text-7xl';

    // Use white aura when cover image is present, rainbow otherwise
    const auraStyle = hasCoverImage
      ? { background: 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.4) 50%, transparent 70%)' }
      : { background: 'linear-gradient(90deg, #ff0080, #ff8c00, #ffef00, #00ff88, #00cfff, #8000ff, #ff0080)', backgroundSize: '200% 100%' };

    return (
      <div className="relative inline-block">
        <div className={`absolute inset-0 blur-3xl opacity-70 ${!hasCoverImage ? 'animate-rainbow-glow' : ''}`} style={auraStyle} />
        <h1 className={`relative ${sizeClass} font-black text-white tracking-tight leading-tight break-words max-w-full drop-shadow-2xl`}>{children}</h1>
        <style>{`@keyframes rainbow-glow { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } } .animate-rainbow-glow { animation: rainbow-glow 3s ease-in-out infinite; }`}</style>
      </div>
    );
  };

  const playBadgeSound = useCallback(() => {
    const sound = new Audio('/shine-11-268907.mp3');
    sound.volume = 0.5;
    sound.play().catch(err => console.log('Badge sound play failed:', err));
  }, []);

  // Moment Slide - immersive photo-first experience
  const MomentSlide = ({ moment, isFirstView, dateRange }) => {
    const [shouldAnimate] = useState(isFirstView);
    const glowConfig = momentGlowColors.find(g => g.id === moment.glowColor) || momentGlowColors[0];

    return (
      <div
        className={`relative rounded-3xl overflow-hidden shadow-2xl min-h-[600px] sm:min-h-[650px] flex flex-col ${activeTransition === 'drumroll' ? 'drumroll-glow' : ''} ${activeTransition === 'impact' ? 'animate-impact-slam' : ''}`}
        style={{
          boxShadow: `0 0 60px ${glowConfig.glow}, 0 0 120px ${glowConfig.glow.replace('0.6', '0.3')}`,
        }}
      >
        {/* Full-bleed image - optimized for vertical photos */}
        <div className="absolute inset-0">
          <img
            src={moment.image}
            alt={moment.label}
            className={`w-full h-full object-cover ${shouldAnimate ? 'animate-moment-zoom' : ''}`}
          />
          {/* Subtle gradient for text readability - only at bottom */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        </div>

        {/* Glowing frame border */}
        <div
          className="absolute inset-0 rounded-3xl pointer-events-none"
          style={{
            boxShadow: `inset 0 0 30px ${glowConfig.glow}, inset 0 0 60px ${glowConfig.glow.replace('0.6', '0.2')}`,
            border: `2px solid ${glowConfig.color}40`,
          }}
        />

        {/* Animated glow ring on first view */}
        {shouldAnimate && (
          <div className="absolute inset-0 rounded-3xl pointer-events-none overflow-hidden">
            <div
              className="absolute inset-[-2px] rounded-3xl animate-moment-glow-ring"
              style={{
                background: `conic-gradient(from 0deg, transparent 0deg, ${glowConfig.color}80 30deg, ${glowConfig.color} 60deg, ${glowConfig.color}80 90deg, transparent 120deg)`,
                mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                maskComposite: 'exclude',
                WebkitMaskComposite: 'xor',
                padding: '3px',
              }}
            />
          </div>
        )}

        {/* Content overlay at bottom */}
        <div className="relative z-10 mt-auto p-6 sm:p-8">
          <div className={`${shouldAnimate ? 'animate-moment-text' : ''}`}>
            <div className="text-white/60 text-sm font-bold uppercase tracking-widest mb-2">A Moment</div>
            <h2
              className="text-2xl sm:text-3xl md:text-4xl font-black text-white leading-tight"
              style={{ textShadow: '0 2px 20px rgba(0,0,0,0.5)' }}
            >
              {moment.label}
            </h2>
          </div>
          <div className="text-white/40 font-bold text-sm uppercase tracking-widest mt-6">{dateRange || 'Wrapped'}</div>
        </div>

        <style>{`
          @keyframes moment-zoom {
            0% { transform: scale(1.1); opacity: 0.8; }
            100% { transform: scale(1); opacity: 1; }
          }
          @keyframes moment-glow-ring {
            0% { transform: rotate(0deg); opacity: 1; }
            100% { transform: rotate(360deg); opacity: 0; }
          }
          @keyframes moment-text {
            0% { opacity: 0; transform: translateY(20px); }
            50% { opacity: 0; transform: translateY(20px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          .animate-moment-zoom { animation: moment-zoom 1.2s ease-out forwards; }
          .animate-moment-glow-ring { animation: moment-glow-ring 1.8s ease-out forwards; }
          .animate-moment-text { animation: moment-text 1.4s ease-out forwards; }
        `}</style>
      </div>
    );
  };

  const BadgeSlide = ({ badge, isFirstView, dateRange }) => {
    const [shouldAnimate] = useState(isFirstView);

    useEffect(() => {
      if (shouldAnimate) {
        playBadgeSound();
      }
    }, [shouldAnimate]);

    return (
      <div className={`relative bg-gradient-to-br from-white/8 to-white/3 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 text-center shadow-2xl border border-white/15 min-h-[600px] sm:min-h-[650px] flex flex-col justify-center overflow-hidden ${activeTransition === 'drumroll' ? 'drumroll-glow' : ''}`}>
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
    <div className={`bg-black/40 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 text-center shadow-2xl border-2 min-h-[600px] sm:min-h-[650px] flex flex-col justify-center relative overflow-hidden ${!isFirstView ? 'border-white/50' : 'border-white/30'} ${activeTransition === 'drumroll' ? 'drumroll-glow' : ''}`} style={!isFirstView ? { boxShadow: '0 0 40px rgba(255, 255, 255, 0.3), 0 0 80px rgba(255, 255, 255, 0.15), inset 0 0 40px rgba(255, 255, 255, 0.05)', animation: 'reflection-breathe 4s ease-in-out infinite' } : {}}>
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
      <div className={`absolute top-full left-0 mt-2 rounded-xl border border-white/10 p-3 z-50 shadow-2xl ${isSafari ? 'bg-gray-900/95' : 'bg-black/70 backdrop-blur-2xl'}`} style={{ minWidth: '280px' }}>
        <div className="flex flex-row flex-wrap gap-2">
          {quickEmojis.map(emoji => (
            <button key={emoji} onClick={() => { onSelect(emoji); onClose(); }} className={`w-11 h-11 text-xl rounded-lg hover:bg-white/20 transition-colors flex items-center justify-center ${selectedEmoji === emoji ? 'bg-white/30' : ''}`}>{emoji}</button>
          ))}
          <button onClick={() => setShowMore(!showMore)} className="w-11 h-11 text-lg rounded-lg hover:bg-white/20 transition-colors flex items-center justify-center bg-white/10 font-bold text-white">{showMore ? '−' : '+'}</button>
        </div>
        {showMore && (
          <div className="grid grid-cols-10 gap-1 max-h-48 overflow-y-auto pt-3 mt-3 border-t border-white/10">
            {moreEmojis.map((emoji, idx) => (
              <button key={`${emoji}-${idx}`} onClick={() => { onSelect(emoji); onClose(); }} className={`w-8 h-8 text-base rounded-lg hover:bg-white/20 transition-colors flex items-center justify-center ${selectedEmoji === emoji ? 'bg-white/30' : ''}`}>{emoji}</button>
            ))}
          </div>
        )}
      </div>
    );
  };

  const MoodSelector = ({ selectedMood, onSelect }) => (
    <div className="grid grid-cols-4 gap-2 sm:gap-3">{moods.map((mood, i) => (<button key={mood.id} onClick={() => onSelect(mood.id)} className={`group flex flex-col items-center p-2 sm:p-3 rounded-xl transition-all duration-300 animate-fade-in-up ${selectedMood === mood.id ? 'bg-white/15 border border-white/30 scale-105' : 'bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] hover:border-white/[0.12]'}`} style={{ animationDelay: `${i * 0.04}s`, boxShadow: selectedMood === mood.id ? `0 0 25px ${mood.colors[0] === 'rainbow' ? 'rgba(139,92,246,0.2)' : mood.colors[0]}25` : undefined }}><div className="relative"><div className="absolute inset-0 rounded-full blur-md opacity-0 group-hover:opacity-50 transition-opacity duration-500" style={{ background: mood.colors[0] === 'rainbow' ? 'conic-gradient(#ff0080, #00cfff, #ffef00, #ff0080)' : mood.colors[0] }} /><div className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-full mb-1 sm:mb-2 shadow-lg transition-transform duration-300 group-hover:scale-110" style={{ background: mood.colors[0] === 'rainbow' ? 'conic-gradient(#ff0080, #ff8c00, #ffef00, #00ff88, #00cfff, #8000ff, #ff0080)' : `linear-gradient(135deg, ${mood.colors[0]} 50%, ${mood.colors[1]} 50%)` }} /></div><span className="text-white text-[10px] sm:text-xs font-bold">{mood.name}</span><span className="text-white/50 text-[8px] sm:text-[10px] text-center mt-0.5 sm:mt-1 leading-tight hidden sm:block">{mood.description}</span></button>))}</div>
  );

  const TemplateSelector = ({ selectedTemplate, onSelect }) => (
    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3">{templates.map((template, i) => { const Icon = template.icon; return (<button key={template.id} onClick={() => onSelect(template.id)} className={`group flex flex-col items-center p-3 sm:p-4 rounded-xl transition-all duration-300 animate-fade-in-up ${selectedTemplate === template.id ? 'bg-white/15 border border-white/30 scale-105' : 'bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] hover:border-white/[0.12]'}`} style={{ animationDelay: `${i * 0.05}s`, borderColor: selectedTemplate === template.id ? `${template.color}60` : undefined, boxShadow: selectedTemplate === template.id ? `0 0 20px ${template.color}20, 0 0 40px ${template.color}10` : undefined }}><div className="relative"><div className="absolute inset-0 rounded-full blur-lg opacity-0 group-hover:opacity-40 transition-opacity duration-500" style={{ background: template.color }} /><Icon size={24} className="relative transition-transform duration-300 group-hover:scale-110" style={{ color: template.color }} /></div><span className="text-white text-xs font-bold mt-2">{template.name}</span></button>); })}</div>
  );

  const ProgressDots = ({ current, total }) => (<div className="flex items-center justify-center gap-1.5">{Array.from({ length: total }, (_, i) => (<div key={i} className={`rounded-full transition-all duration-300 ${i === current ? 'w-6 h-2 bg-white' : i < current ? 'w-2 h-2 bg-white/60' : 'w-2 h-2 bg-white/30'}`} />))}</div>);

  // Detect Safari/iOS for performance optimizations
  const isSafari = typeof navigator !== 'undefined' && (/^((?!chrome|android).)*safari/i.test(navigator.userAgent) || /iPad|iPhone|iPod/.test(navigator.userAgent));

  // Persistent animation time reference - ensures animations don't restart
  const auraAnimationStartTime = useRef(Date.now());

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

    // Calculate negative animation delay to maintain continuity on re-render
    // This makes the animation "continue" from where it would have been
    const elapsedSeconds = (Date.now() - auraAnimationStartTime.current) / 1000;
    const blob1Delay = -(elapsedSeconds % 12); // 12s animation
    const blob2Delay = -(elapsedSeconds % 15); // 15s animation
    const blob3Delay = -(elapsedSeconds % 13); // 13s animation
    const blobSafari1Delay = -(elapsedSeconds % 30);
    const blobSafari2Delay = -(elapsedSeconds % 35);
    const blobSafari3Delay = -(elapsedSeconds % 32);

    // Safari/iOS optimized version - no blur, simpler animations, increased size and opacity
    if (isSafari) {
      return (
        <>
          <div className="fixed inset-0" style={{ background: `linear-gradient(135deg, ${bgColors[0]} 0%, ${bgColors[1]} 50%, ${bgColors[2]} 100%)` }} />
          <div className="fixed inset-0 overflow-hidden" key="aura-container-safari">
            <div
              key="blob-safari-1"
              className="absolute w-96 sm:w-[28rem] h-96 sm:h-[28rem] rounded-full opacity-50"
              style={{
                ...positions.blob1,
                background: `radial-gradient(circle, ${color1} 0%, ${color1}80 30%, transparent 70%)`,
                willChange: 'transform',
                animation: `blob-safari-1 30s ease-in-out infinite`,
                animationDelay: `${blobSafari1Delay}s`,
              }}
            />
            <div
              key="blob-safari-2"
              className="absolute w-80 sm:w-96 h-80 sm:h-96 rounded-full opacity-50"
              style={{
                ...positions.blob2,
                background: `radial-gradient(circle, ${color2} 0%, ${color2}80 30%, transparent 70%)`,
                willChange: 'transform',
                animation: `blob-safari-2 35s ease-in-out infinite`,
                animationDelay: `${blobSafari2Delay}s`,
              }}
            />
            {isRainbow && (
              <div
                key="blob-safari-3"
                className="absolute w-72 sm:w-80 h-72 sm:h-80 rounded-full opacity-45"
                style={{
                  ...positions.blob3,
                  background: 'radial-gradient(circle, #00ff88 0%, #ff8c0080 30%, transparent 70%)',
                  willChange: 'transform',
                  animation: `blob-safari-3 32s ease-in-out infinite`,
                  animationDelay: `${blobSafari3Delay}s`,
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
        <div className="fixed inset-0 overflow-hidden" key="aura-container-chrome">
          <div
            key="blob-chrome-1"
            className="absolute w-96 sm:w-[28rem] h-96 sm:h-[28rem] rounded-full mix-blend-screen filter blur-3xl opacity-70"
            style={{
              ...positions.blob1,
              background: `linear-gradient(135deg, ${color1} 0%, ${color2} 100%)`,
              willChange: 'transform',
              animation: `blob1 12s ease-in-out infinite`,
              animationDelay: `${blob1Delay}s`,
            }}
          />
          <div
            key="blob-chrome-2"
            className="absolute w-80 sm:w-96 h-80 sm:h-96 rounded-full mix-blend-screen filter blur-3xl opacity-70"
            style={{
              ...positions.blob2,
              background: `linear-gradient(135deg, ${color3} 0%, ${color4} 100%)`,
              willChange: 'transform',
              animation: `blob2 15s ease-in-out infinite`,
              animationDelay: `${blob2Delay}s`,
            }}
          />
          {isRainbow && (
            <div
              key="blob-chrome-3"
              className="absolute w-72 sm:w-80 h-72 sm:h-80 rounded-full mix-blend-screen filter blur-3xl opacity-60"
              style={{
                ...positions.blob3,
                background: 'linear-gradient(135deg, #00ff88 0%, #ff8c00 100%)',
                willChange: 'transform',
                animation: `blob3 13s ease-in-out infinite`,
                animationDelay: `${blob3Delay}s`,
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

  const NoiseOverlay = () => {
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
      // Don't animate in if we just finished a transition (prevents double animation)
      return '';
    }
    // Don't use slide animations during impact or drumroll - they have their own visuals
    if (activeTransition === 'impact' || activeTransition === 'drumroll') return '';
    return slideDirection === 'next' ? 'animate-slide-out-left' : 'animate-slide-out-right';
  };

  const FieldLabel = ({ children, required = false, error = false }) => (<label className={`block mb-3 font-bold text-base sm:text-lg uppercase tracking-wide ${error ? 'text-red-400' : 'text-white'}`}>{children}{required && <span className="text-red-400 ml-1">*</span>}</label>);

  // Email form component - isolated to prevent focus loss
  const EmailNotifyForm = React.memo(({ onSuccess }) => {
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState(null);
    const inputRef = useRef(null);

    const handleSubmit = async (e) => {
      e.preventDefault();
      if (!email || isSubmitting) return;

      setIsSubmitting(true);
      setError(null);
      console.log('[EmailNotifyForm] Submitting email');

      try {
        const res = await fetch('/api/notify/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });

        const contentType = res.headers.get('content-type');
        console.log('[EmailNotifyForm] Response:', res.status, contentType);

        if (!contentType || !contentType.includes('application/json')) {
          // API not available (local dev) - still show success for UX
          console.log('[EmailNotifyForm] API not available locally');
          setSubmitted(true);
          onSuccess?.();
          return;
        }

        const data = await res.json();

        if (res.ok) {
          console.log('[EmailNotifyForm] Success');
          setSubmitted(true);
          onSuccess?.();
        } else {
          console.error('[EmailNotifyForm] Error:', data);
          setError(data.message || data.error || 'Failed to subscribe');
        }
      } catch (err) {
        console.error('[EmailNotifyForm] Network error:', err);
        // Network error (local dev) - show success for better UX
        setSubmitted(true);
        onSuccess?.();
      } finally {
        setIsSubmitting(false);
      }
    };

    if (submitted) {
      return (
        <div className="text-center px-4 animate-fade-in">
          <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-3">
            <Check className="w-6 h-6 text-green-400" />
          </div>
          <p className="text-white/80 text-sm">We'll notify you when it's ready!</p>
        </div>
      );
    }

    return (
      <form onSubmit={handleSubmit} className="w-full max-w-xs px-4" onClick={e => e.stopPropagation()}>
        <input
          ref={inputRef}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          className="w-full px-4 py-3 rounded-xl bg-gray-800/90 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 mb-3 text-sm transition-all"
          required
          autoComplete="email"
        />
        {error && (
          <p className="text-red-400 text-xs mb-2">{error}</p>
        )}
        <button
          type="submit"
          disabled={isSubmitting || !email}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 hover:bg-purple-500 disabled:bg-purple-600/50 disabled:cursor-not-allowed rounded-xl text-white font-bold transition-all text-sm transform hover:scale-[1.02] active:scale-[0.98]"
        >
          {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Bell size={16} />}
          {isSubmitting ? 'Subscribing...' : 'Get Notified'}
        </button>
      </form>
    );
  });

  // Homepage Component
  const HomePage = () => {
    const wrappedFeatures = [
      'Custom stat tracking',
      'Choose your own themes',
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

    return (
      <div className="min-h-screen relative overflow-hidden">
        <DynamicBackground moodId="twilight" />
        <NoiseOverlay forceShow={true} />

        {/* Floating aura orbs for depth */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute w-[500px] h-[500px] rounded-full blur-[120px] animate-float-slow opacity-20"
            style={{ background: 'radial-gradient(circle, rgba(139, 92, 246, 0.6) 0%, transparent 70%)', top: '-10%', left: '-10%' }} />
          <div className="absolute w-[400px] h-[400px] rounded-full blur-[100px] animate-float-slower opacity-15"
            style={{ background: 'radial-gradient(circle, rgba(236, 72, 153, 0.5) 0%, transparent 70%)', bottom: '-5%', right: '-5%' }} />
          <div className="absolute w-[300px] h-[300px] rounded-full blur-[80px] animate-float-medium opacity-10"
            style={{ background: 'radial-gradient(circle, rgba(59, 130, 246, 0.5) 0%, transparent 70%)', top: '40%', left: '60%' }} />
        </div>

        <div className="relative z-10 min-h-screen flex flex-col">
          {/* Header with Logo */}
          <header className="pt-8 pb-2 px-6 text-center">
            <div className="relative inline-block mx-auto">
              {/* Glow behind logo */}
              <div className="absolute inset-0 w-20 h-20 sm:w-28 sm:h-28 rounded-full blur-2xl bg-purple-500/30 animate-pulse-slow" />
              {/* Logo with bounce animation */}
              <img src="/MyWrap.png" alt="MyWrap" className="relative w-20 h-20 sm:w-28 sm:h-28 object-contain animate-logo-bounce drop-shadow-2xl" />
            </div>
            <p className="text-white/70 text-[10px] sm:text-xs font-medium uppercase tracking-widest mt-1 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>Your moments, wrapped.</p>

            {/* What is a Wrapped? */}
            <div className="mt-6 flex items-start justify-center gap-1.5 text-white/60 text-sm max-w-md mx-auto animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
              <p>
                <span className="text-white/50">Your personalized recap: track your moments, insights, and stats.</span>
              </p>
            </div>
          </header>

          {/* Main Content - Two Cards */}
          <main className="flex-1 flex items-center justify-center px-4 sm:px-8 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl w-full">

              {/* Wrapped Card - Active Product */}
              <div
                onClick={() => setStep('input')}
                className="group relative rounded-3xl p-6 sm:p-8 cursor-pointer transition-all duration-500 hover:scale-[1.02] overflow-hidden animate-fade-in-up"
                style={{ animationDelay: '0.6s' }}
              >
                {/* Card background with layered depth */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-2xl rounded-3xl border border-white/10 group-hover:border-white/30 transition-all duration-500" />
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-pink-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Inner shadow for depth */}
                <div className="absolute inset-[1px] rounded-3xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]" />

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
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30 group-hover:shadow-purple-500/50 transition-shadow duration-500">
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

                  {/* CTA Button with soft glow effect */}
                  <div className="inline-flex items-center gap-2 px-5 py-3 bg-white/10 backdrop-blur-sm rounded-xl text-white font-bold transition-all duration-500 border border-white/20 group-hover:border-white/40 group-hover:bg-white/15 cta-glow">
                    <span>Start Creating</span>
                    <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </div>
              </div>

              {/* Coming Soon Card - Productivity Tracking */}
              <div className="group relative rounded-3xl p-6 sm:p-8 overflow-hidden animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
                {/* Card background with layered depth */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-2xl rounded-3xl border border-white/10 transition-all duration-500" />
                <div className="absolute inset-[1px] rounded-3xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]" />

                {/* Blur overlay on hover */}
                <div className="absolute inset-0 bg-black/70 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-500 z-20 flex flex-col items-center justify-center rounded-3xl">
                  <Lock className="w-12 h-12 text-white/80 mb-4 animate-bounce-subtle" />
                  <h3 className="text-xl font-bold text-white mb-4">Coming Soon</h3>
                  <EmailNotifyForm />
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
                  
                  <p className="text-white/70 mb-6">Track your progress in real-time, get personalized insights, and automatic wraps generated for you.</p>

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
          @keyframes logo-bounce {
            0% { transform: translateY(-30px); opacity: 0; }
            50% { transform: translateY(8px); opacity: 1; }
            70% { transform: translateY(-4px); }
            85% { transform: translateY(2px); }
            100% { transform: translateY(0); opacity: 1; }
          }
          .animate-logo-bounce { animation: logo-bounce 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }

          /* Floating aura animations */
          @keyframes float-slow {
            0%, 100% { transform: translate(0, 0) scale(1); }
            33% { transform: translate(30px, -20px) scale(1.05); }
            66% { transform: translate(-20px, 15px) scale(0.95); }
          }
          .animate-float-slow { animation: float-slow 20s ease-in-out infinite; }

          @keyframes float-slower {
            0%, 100% { transform: translate(0, 0) scale(1); }
            50% { transform: translate(-40px, 30px) scale(1.1); }
          }
          .animate-float-slower { animation: float-slower 25s ease-in-out infinite; }

          @keyframes float-medium {
            0%, 100% { transform: translate(0, 0); }
            25% { transform: translate(20px, -30px); }
            50% { transform: translate(-15px, -20px); }
            75% { transform: translate(25px, 10px); }
          }
          .animate-float-medium { animation: float-medium 15s ease-in-out infinite; }

          /* Fade in up animation */
          @keyframes fade-in-up {
            0% { opacity: 0; transform: translateY(20px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in-up { animation: fade-in-up 0.6s ease-out forwards; opacity: 0; }

          /* Fade in animation */
          @keyframes fade-in {
            0% { opacity: 0; }
            100% { opacity: 1; }
          }
          .animate-fade-in { animation: fade-in 0.4s ease-out forwards; }

          /* Pulse slow */
          @keyframes pulse-slow {
            0%, 100% { opacity: 0.3; transform: scale(1); }
            50% { opacity: 0.5; transform: scale(1.1); }
          }
          .animate-pulse-slow { animation: pulse-slow 3s ease-in-out infinite; }

          /* Bounce subtle */
          @keyframes bounce-subtle {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-5px); }
          }
          .animate-bounce-subtle { animation: bounce-subtle 2s ease-in-out infinite; }

          /* CTA soft glow */
          .cta-glow {
            box-shadow: 0 0 20px rgba(139, 92, 246, 0.15), 0 0 40px rgba(139, 92, 246, 0.05);
            transition: box-shadow 0.5s ease, background 0.3s ease, border-color 0.3s ease;
          }
          .cta-glow:hover, .group:hover .cta-glow {
            box-shadow: 0 0 30px rgba(139, 92, 246, 0.25), 0 0 60px rgba(139, 92, 246, 0.1);
          }

          /* Ambient drift animations for create page */
          @keyframes drift-slow {
            0%, 100% { transform: translate(0, 0) rotate(0deg); }
            25% { transform: translate(40px, -30px) rotate(2deg); }
            50% { transform: translate(20px, 20px) rotate(-1deg); }
            75% { transform: translate(-30px, -10px) rotate(1deg); }
          }
          .animate-drift-slow { animation: drift-slow 30s ease-in-out infinite; }

          @keyframes drift-slower {
            0%, 100% { transform: translate(0, 0) rotate(0deg); }
            33% { transform: translate(-50px, 40px) rotate(-2deg); }
            66% { transform: translate(30px, -20px) rotate(1deg); }
          }
          .animate-drift-slower { animation: drift-slower 40s ease-in-out infinite; }

          @keyframes breathe {
            0%, 100% { opacity: 0.05; transform: scale(1); }
            50% { opacity: 0.08; transform: scale(1.15); }
          }
          .animate-breathe { animation: breathe 8s ease-in-out infinite; }

          /* Form card subtle glow */
          .form-card-glow {
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 80px rgba(139, 92, 246, 0.03);
          }

          /* Form entrance animation */
          @keyframes form-entrance {
            0% { opacity: 0; transform: translateY(30px) scale(0.98); }
            100% { opacity: 1; transform: translateY(0) scale(1); }
          }
          .animate-form-entrance { animation: form-entrance 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }

          /* Text reveal animations */
          @keyframes text-reveal {
            0% { opacity: 0; transform: translateY(15px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          .animate-text-reveal { animation: text-reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.2s forwards; opacity: 0; }
          .animate-text-reveal-delay { animation: text-reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.35s forwards; opacity: 0; }

          /* Section fade in animation */
          @keyframes section-fade-in {
            0% { opacity: 0; transform: translateY(12px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          .animate-section-fade-in { animation: section-fade-in 0.5s ease-out forwards; opacity: 0; }
        `}</style>
      </div>
    );
  };

  // Loading screen when fetching a shared wrap
  if (isLoading) {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        <DynamicBackground moodId="twilight" />
        <NoiseOverlay />
        <div className="relative z-10 text-center">
          <Loader2 size={48} className="text-white animate-spin mx-auto mb-4" />
          <p className="text-white/70 text-lg font-medium">Loading wrap...</p>
        </div>
      </div>
    );
  }

  // Error screen when wrap not found
  if (loadError) {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        <DynamicBackground moodId="twilight" />
        <NoiseOverlay />
        <div className="relative z-10 text-center max-w-md mx-auto px-6">
          <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-6">
            <X size={40} className="text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Wrap Not Found</h2>
          <p className="text-white/60 mb-8">{loadError}</p>
          <button
            onClick={() => { setLoadError(null); setStep('home'); window.history.pushState({}, '', '/'); }}
            className="px-8 py-4 bg-white hover:bg-white/90 rounded-full text-black font-bold transition-all"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  // Home page
  if (step === 'home') {
    return <HomePage />;
  }

  // Input/builder page
  if (step === 'input') {
    return (
      <div className="min-h-screen relative transition-all duration-1000">
        <DynamicBackground moodId={selectedMood} /><NoiseOverlay />

        {/* Ambient floating orbs for depth and motion */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute w-[600px] h-[600px] rounded-full blur-[150px] animate-drift-slow opacity-[0.08]"
            style={{ background: `radial-gradient(circle, ${moods.find(m => m.id === selectedMood)?.colors[0] || '#7c3aed'} 0%, transparent 70%)`, top: '-20%', left: '-15%' }} />
          <div className="absolute w-[500px] h-[500px] rounded-full blur-[120px] animate-drift-slower opacity-[0.06]"
            style={{ background: `radial-gradient(circle, ${moods.find(m => m.id === selectedMood)?.colors[1] || '#c4b5fd'} 0%, transparent 70%)`, bottom: '-15%', right: '-10%' }} />
          <div className="absolute w-[300px] h-[300px] rounded-full blur-[80px] animate-breathe opacity-[0.05]"
            style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.4) 0%, transparent 70%)', top: '30%', left: '50%' }} />
        </div>

        {/* Image format error notification */}
        {imageFormatError && (
          <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-[100] animate-fade-in-down">
            <div className="bg-red-500/90 backdrop-blur-sm text-white px-6 py-3 rounded-xl shadow-2xl border border-red-400/50 flex items-center gap-3">
              <X size={18} />
              <span className="font-medium">{imageFormatError}</span>
              <button onClick={() => setImageFormatError(null)} className="ml-2 hover:bg-white/20 rounded-full p-1 transition-colors">
                <X size={14} />
              </button>
            </div>
          </div>
        )}

        {showTransitionPicker !== null && (
          <TransitionPickerModal
            statIndex={showTransitionPicker}
            onSelect={setTransitionBetweenStats}
            onClose={() => setShowTransitionPicker(null)}
          />
        )}
        {shareModalOpen && shareUrl && (
          <ShareModal url={shareUrl} onClose={() => setShareModalOpen(false)} />
        )}
        {audioRef.current && (<button onClick={toggleMusic} className="fixed top-4 sm:top-6 right-4 sm:right-6 p-2 sm:p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors backdrop-blur-sm border-2 border-white/20 z-50">{audioPlaying ? <Volume2 size={18} /> : <VolumeX size={18} />}</button>)}
        
        {/* Back to home button */}
        <button
          onClick={() => setStep('home')}
          disabled={showTransitionPicker !== null}
          className={`fixed top-4 sm:top-6 left-4 sm:left-6 p-3 sm:p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors backdrop-blur-sm border-2 border-white/20 z-50 flex items-center justify-center
            ${showTransitionPicker !== null ? 'pointer-events-none opacity-30' : ''}`}
        >
          <ArrowLeft size={20} className="sm:w-[18px] sm:h-[18px]" />
        </button>
        
        <div className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="backdrop-blur-2xl rounded-3xl border border-white/[0.08] shadow-2xl overflow-hidden relative form-card-glow animate-form-entrance" style={{
            background: `linear-gradient(135deg, ${moods.find(m => m.id === selectedMood)?.bgColors[0] || '#2e1065'}30 0%, ${moods.find(m => m.id === selectedMood)?.bgColors[1] || '#3b0764'}20 50%, ${moods.find(m => m.id === selectedMood)?.bgColors[2] || '#4a044e'}15 100%)`
          }}>
            {/* Subtle inner glow */}
            <div className="absolute inset-0 rounded-3xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] pointer-events-none" />
            <div className="p-6 sm:p-8 pb-4 border-b border-white/[0.06] relative">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-2 tracking-tight text-center animate-text-reveal">Create Your Wrapped</h1>
              <p className="text-white/60 text-base sm:text-lg text-center animate-text-reveal-delay">Track anything you want and share it with friends</p>
            </div>
            <div className="p-6 sm:p-8 pt-6">
              <div className="space-y-6 sm:space-y-8">
                <div title="Pick a template to auto-fill suggested stats for your topic" className="animate-section-fade-in" style={{ animationDelay: '0.2s' }}><FieldLabel>Quick Start Templates</FieldLabel><TemplateSelector selectedTemplate={selectedTemplate} onSelect={applyTemplate} /><p className="text-white/40 text-xs mt-2 italic">Note: Switching between templates removes stats data.</p></div>
                <div className="animate-section-fade-in" style={{ animationDelay: '0.3s' }}><FieldLabel required error={validationErrors.title}>Wrapped Title</FieldLabel><input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="My Adventures" className={`w-full px-4 sm:px-5 py-3 sm:py-4 rounded-xl bg-white/[0.06] border text-white placeholder-white/40 focus:outline-none focus:bg-white/[0.08] focus:border-white/30 focus:shadow-[0_0_20px_rgba(255,255,255,0.05)] backdrop-blur-sm font-medium text-base sm:text-lg transition-all duration-300 shadow-[inset_0_1px_2px_rgba(0,0,0,0.1)] ${validationErrors.title ? 'border-red-500/50' : 'border-white/[0.08]'}`} />{validationErrors.title && <p className="text-red-400 text-sm mt-2">Please enter a title for your Wrapped</p>}</div>
                <div className="animate-section-fade-in" style={{ animationDelay: '0.4s' }}><FieldLabel>Add Cover Image <span className="text-white/40 font-normal normal-case">(optional)</span></FieldLabel><div className="flex items-center gap-4">{coverImage ? (<div className="relative"><img src={coverImage} alt="Cover Preview" className="w-32 sm:w-40 h-20 sm:h-24 object-cover rounded-xl border border-white/[0.15]" /><button onClick={() => setCoverImage(null)} className="absolute -top-2 -right-2 p-1 bg-red-500 hover:bg-red-600 rounded-full text-white transition-colors"><X size={16} /></button></div>) : (<label className="flex items-center gap-2 sm:gap-3 px-4 sm:px-5 py-3 sm:py-4 bg-white/[0.06] hover:bg-white/[0.1] rounded-xl text-white/60 transition-all duration-300 border border-white/[0.08] hover:border-white/[0.15] cursor-pointer"><ImagePlus size={20} /><span className="font-medium text-sm sm:text-base">Upload Cover Image</span><input type="file" accept="image/*" onChange={(e) => handleCoverImageUpload(e.target.files[0])} className="hidden" /></label>)}</div></div>
                <div className="animate-section-fade-in" style={{ animationDelay: '0.5s' }}><FieldLabel required error={validationErrors.dateRange}>Date Range</FieldLabel><input type="text" value={dateRange} onChange={(e) => setDateRange(e.target.value)} placeholder="E.g., 2026 Q1, November, Fall Semester" className={`w-full px-4 sm:px-5 py-3 sm:py-4 rounded-xl bg-white/[0.06] border text-white placeholder-white/40 focus:outline-none focus:bg-white/[0.08] focus:border-white/30 focus:shadow-[0_0_20px_rgba(255,255,255,0.05)] backdrop-blur-sm font-medium text-base sm:text-lg transition-all duration-300 shadow-[inset_0_1px_2px_rgba(0,0,0,0.1)] ${validationErrors.dateRange ? 'border-red-500/50' : 'border-white/[0.08]'}`} />{validationErrors.dateRange && <p className="text-red-400 text-sm mt-2">Please enter a date range</p>}</div>

                <div className="animate-section-fade-in" style={{ animationDelay: '0.6s' }}><FieldLabel>Background Music</FieldLabel><select value={selectedMusic} onChange={(e) => handleMusicSelect(e.target.value)} className="w-full px-4 sm:px-5 py-3 sm:py-4 rounded-xl bg-white/[0.06] border border-white/[0.08] text-white focus:outline-none focus:bg-white/[0.08] focus:border-white/30 focus:shadow-[0_0_20px_rgba(255,255,255,0.05)] backdrop-blur-sm font-medium text-base sm:text-lg transition-all duration-300 shadow-[inset_0_1px_2px_rgba(0,0,0,0.1)]">{musicTracks.map(track => (<option key={track.id} value={track.id} className="bg-gray-900 text-white">{track.name}</option>))}</select>{selectedMusic === 'custom' && (<label className="mt-3 flex items-center gap-3 px-4 py-3 bg-white/[0.06] hover:bg-white/[0.1] rounded-xl text-white/60 transition-all duration-300 border border-dashed border-white/[0.15] hover:border-white/30 cursor-pointer"><Upload size={20} /><span className="font-medium">{customMusicFile ? customMusicFile.name : 'Choose audio file (.mp3, .wav, etc.)'}</span><input type="file" accept="audio/*" onChange={(e) => handleCustomMusicUpload(e.target.files[0])} className="hidden" /></label>)}{audioRef.current && (<p className="text-white/40 text-sm mt-2">Use the speaker button to play/pause music</p>)}</div>

                {/* Stats with transition buttons between them */}
                <div className="animate-section-fade-in" style={{ animationDelay: '0.7s' }}>
                  <FieldLabel required error={validationErrors.stats}>Your Stats</FieldLabel>
                  {validationErrors.stats && <p className="text-red-400 text-sm mb-3">Please add at least one complete stat (label and value)</p>}
                  <div className="space-y-2">
                    {stats.map((stat, index) => (
                      <React.Fragment key={index}>
                        <div className="relative space-y-3 p-4 pb-10 bg-white/[0.03] rounded-xl border border-white/[0.06] transition-all duration-300 hover:bg-white/[0.04] hover:border-white/[0.1]">
                          <div className="flex flex-col sm:flex-row gap-3">
                            <input type="text" value={stat.label} onChange={(e) => updateStat(index, 'label', e.target.value)} placeholder="Stat Label (e.g., Books Read)" className={`flex-1 px-4 sm:px-5 py-3 sm:py-4 rounded-xl bg-white/[0.06] border text-white placeholder-white/40 focus:outline-none focus:bg-white/[0.08] focus:border-white/30 focus:shadow-[0_0_15px_rgba(255,255,255,0.04)] backdrop-blur-sm font-bold text-sm sm:text-base transition-all duration-300 shadow-[inset_0_1px_2px_rgba(0,0,0,0.1)] ${validationErrors[`stat-${index}-label`] ? 'border-red-500/50' : 'border-white/[0.08]'}`} />
                            <input type="text" value={stat.value} onChange={(e) => updateStat(index, 'value', e.target.value)} placeholder="Value (e.g., 42, Lagos, A+)" className={`flex-1 px-4 sm:px-5 py-3 sm:py-4 rounded-xl bg-white/[0.06] border text-white placeholder-white/40 focus:outline-none focus:bg-white/[0.08] focus:border-white/30 focus:shadow-[0_0_15px_rgba(255,255,255,0.04)] backdrop-blur-sm font-medium text-sm sm:text-base transition-all duration-300 shadow-[inset_0_1px_2px_rgba(0,0,0,0.1)] ${validationErrors[`stat-${index}-value`] ? 'border-red-500/50' : 'border-white/[0.08]'}`} />
                          </div>
                          <input type="text" value={stat.note} onChange={(e) => updateStat(index, 'note', e.target.value)} placeholder="Extra Info (optional)" className="w-full px-4 sm:px-5 py-2 sm:py-3 rounded-xl bg-white/[0.06] border border-white/[0.08] text-white placeholder-white/40 focus:outline-none focus:bg-white/[0.08] focus:border-white/30 focus:shadow-[0_0_15px_rgba(255,255,255,0.04)] backdrop-blur-sm font-medium text-sm transition-all duration-300 shadow-[inset_0_1px_2px_rgba(0,0,0,0.1)]" />
                          <div className="flex items-center gap-2" title="Highlighted stats get a special golden glow and falling stars animation">
                            <input type="checkbox" id={`highlight-${index}`} checked={stat.isHighlight} onChange={(e) => updateStat(index, 'isHighlight', e.target.checked)} className="w-5 h-5 rounded border-2 border-white/20 bg-white/10 checked:bg-yellow-400 checked:border-yellow-400 cursor-pointer" />
                            <label htmlFor={`highlight-${index}`} className="text-white/80 text-sm font-medium cursor-pointer flex items-center gap-2"><Star size={16} className="text-yellow-300 fill-yellow-300" />Highlight this Stat</label>
                          </div>
                          <div className="flex items-center gap-3">
                            {stat.image ? (<div className="relative"><img src={stat.image} alt="Preview" className="w-24 sm:w-32 h-24 sm:h-32 object-cover rounded-lg border-2 border-white/20" /><button onClick={() => removeImage(index)} className="absolute top-1 right-1 sm:-top-2 sm:-right-2 p-1.5 sm:p-1 bg-red-500 hover:bg-red-600 rounded-full text-white transition-colors shadow-lg"><X size={14} className="sm:w-4 sm:h-4" /></button></div>) : (<label className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-3 bg-white/10 hover:bg-white/20 rounded-xl text-white/70 transition-colors border-2 border-white/20 cursor-pointer"><Upload size={16} /><span className="text-xs sm:text-sm font-medium">Add Image <span className="text-white/50">(optional)</span></span><input type="file" accept="image/*" onChange={(e) => handleImageUpload(index, e.target.files[0])} className="hidden" /></label>)}
                          </div>
                          {stats.length > 1 && (<button onClick={() => removeStat(index)} className="absolute bottom-2 right-2 p-1.5 bg-red-500/20 hover:bg-red-500/40 rounded-lg text-white/70 hover:text-white transition-colors"><Trash2 size={14} /></button>)}
                        </div>
                        {/* Transition button between stats (not after last stat) */}
                        <BuilderTransitionButton afterStatIndex={index} isLast={index === stats.length - 1} />
                      </React.Fragment>
                    ))}
                    <div className="flex gap-3 mt-4">
                      <button onClick={addStat} className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-white/[0.06] hover:bg-white/[0.1] rounded-xl text-white transition-all duration-300 border border-white/[0.08] hover:border-white/20 font-bold hover:shadow-[0_0_20px_rgba(255,255,255,0.05)]"><Plus size={20} />Add Stat</button>
                      <button onClick={addMoment} className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-purple-500/[0.08] hover:bg-purple-500/[0.15] rounded-xl text-white transition-all duration-300 border border-purple-400/[0.15] hover:border-purple-400/30 font-bold hover:shadow-[0_0_20px_rgba(139,92,246,0.1)]"><Camera size={20} />Add Moment</button>
                    </div>
                  </div>
                </div>

                {/* Moments Section */}
                {moments.length > 0 && (
                  <div>
                    <FieldLabel>
                      <span className="flex items-center gap-2">
                        <Camera size={18} className="text-purple-400" />
                        Your Moments
                      </span>
                    </FieldLabel>
                    <p className="text-white/60 text-sm mb-3">Photo-first memories that mattered enough to pause.</p>
                    <div className="space-y-4">
                      {moments.map((moment, index) => (
                        <div key={index} className="relative p-4 pb-10 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-400/20 space-y-4">
                          {/* Image upload area */}
                          <div className="flex flex-col sm:flex-row gap-4">
                            {moment.image ? (
                              <div className="relative">
                                <img src={moment.image} alt="Moment Preview" className="w-full sm:w-40 h-48 sm:h-52 object-cover rounded-xl border-2 border-white/20" />
                                <button onClick={() => updateMoment(index, 'image', null)} className="absolute top-2 right-2 p-1.5 bg-red-500 hover:bg-red-600 rounded-full text-white transition-colors shadow-lg"><X size={14} /></button>
                              </div>
                            ) : (
                              <label className="flex flex-col items-center justify-center w-full sm:w-40 h-48 sm:h-52 bg-white/5 hover:bg-white/10 rounded-xl text-white/50 transition-colors border-2 border-dashed border-purple-400/30 cursor-pointer">
                                <Camera size={32} className="mb-2 text-purple-400/60" />
                                <span className="text-sm font-medium">Add Photo</span>
                                <span className="text-xs text-white/40 mt-1">(Required)</span>
                                <input type="file" accept="image/*" onChange={(e) => handleMomentImageUpload(index, e.target.files[0])} className="hidden" />
                              </label>
                            )}
                            <div className="flex-1 space-y-3">
                              <input
                                type="text"
                                value={moment.label}
                                onChange={(e) => updateMoment(index, 'label', e.target.value)}
                                placeholder="A Moment Worth Remembering"
                                className="w-full px-4 py-3 rounded-xl bg-white/10 border-2 border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400/50 backdrop-blur-sm font-medium text-sm sm:text-base"
                              />
                              {/* Glow color selector */}
                              <div>
                                <span className="text-white/60 text-xs uppercase tracking-wide mb-2 block">Frame Glow</span>
                                <div className="flex gap-2 flex-wrap">
                                  {momentGlowColors.map(gc => (
                                    <button
                                      key={gc.id}
                                      onClick={() => updateMoment(index, 'glowColor', gc.id)}
                                      className={`w-8 h-8 rounded-full border-2 transition-all ${moment.glowColor === gc.id ? 'border-white scale-110' : 'border-white/30 hover:border-white/60'}`}
                                      style={{ background: gc.color, boxShadow: moment.glowColor === gc.id ? `0 0 15px ${gc.glow}` : 'none' }}
                                      title={gc.name}
                                    />
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                          {/* Delete button */}
                          <button onClick={() => removeMoment(index)} className="absolute bottom-2 right-2 p-1.5 bg-red-500/20 hover:bg-red-500/40 rounded-lg text-white/70 hover:text-white transition-colors"><Trash2 size={14} /></button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div><FieldLabel>Add a Badge to your Wrap</FieldLabel><div className="space-y-4">{badges.map((badge, index) => (<div key={index} className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-3"><div className="flex gap-3 items-start"><div className="relative"><button onClick={() => setShowEmojiPicker(showEmojiPicker === index ? null : index)} className="w-14 sm:w-16 h-14 sm:h-16 text-2xl sm:text-3xl rounded-xl bg-white/10 border-2 border-white/20 hover:bg-white/20 transition-colors flex items-center justify-center">{badge.emoji}</button>{showEmojiPicker === index && <EmojiPicker selectedEmoji={badge.emoji} onSelect={(emoji) => updateBadge(index, 'emoji', emoji)} onClose={() => setShowEmojiPicker(null)} />}</div><div className="flex-1 space-y-2"><input type="text" value={badge.title} onChange={(e) => updateBadge(index, 'title', e.target.value)} placeholder="Badge Title (e.g., Top Reader)" className="w-full px-4 sm:px-5 py-3 rounded-xl bg-white/10 border-2 border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm font-medium text-sm sm:text-base" /><input type="text" value={badge.subtext || ''} onChange={(e) => updateBadge(index, 'subtext', e.target.value)} placeholder="Subtext (Completed Reading Goal)" className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/80 placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 backdrop-blur-sm text-sm" /></div><button onClick={() => removeBadge(index)} className="px-4 py-3 bg-red-500/20 hover:bg-red-500/40 rounded-xl text-white transition-colors border-2 border-red-500/40"><Trash2 size={20} /></button></div></div>))}<button onClick={addBadge} className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors border-2 border-white/20 font-bold"><Plus size={20} />Add Badge</button></div></div>
                <div title="Add a personal reflection that will appear as a special sparkle slide at the end"><FieldLabel><span className="flex items-center gap-2"><Sparkles size={18} className="text-white/70" />Reflection</span></FieldLabel><p className="text-white/60 text-sm mb-3">What's something you learned?</p><textarea value={reflection} onChange={(e) => setReflection(e.target.value)} placeholder="Share a meaningful insight or lesson..." className="w-full px-4 sm:px-5 py-3 sm:py-4 rounded-xl bg-white/10 border-2 border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent backdrop-blur-sm font-medium text-base sm:text-lg min-h-[100px] sm:min-h-[120px] resize-none" /></div>
                <div title="Choose the color theme and atmosphere for your Wrapped"><FieldLabel>Choose your Wrapped Mood</FieldLabel><MoodSelector selectedMood={selectedMood} onSelect={setSelectedMood} /></div>
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
      <DynamicBackground moodId={selectedMood} /><NoiseOverlay />
      {showConfetti && <Confetti />}
      {activeTransition === 'drumroll' && <DrumrollOverlay count={drumrollCount} fading={drumrollFading} onSkip={nextSlide} />}

      <div className="relative z-10 w-full max-w-md mx-auto">
        <div className="fixed top-4 sm:top-6 right-4 sm:right-6 flex gap-2 sm:gap-3 z-50">
          {!isViewMode && <button onClick={editWrapped} className="p-3 sm:p-4 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors backdrop-blur-sm border-2 border-white/20" title="Edit Wrapped"><Edit3 size={20} /></button>}
          {audioRef.current && (<button onClick={toggleMusic} className="p-3 sm:p-4 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors backdrop-blur-sm border-2 border-white/20">{audioPlaying ? <Volume2 size={20} /> : <VolumeX size={20} />}</button>)}
        </div>

        {/* Main slide content */}
        <div onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const clickX = e.clientX - rect.left;
          const midpoint = rect.width / 2;
          if (clickX < midpoint) {
            prevSlide();
          } else {
            nextSlide();
          }
        }} className={`transition-all duration-500 ${getSlideAnimation()} relative cursor-pointer`} style={{ transformStyle: 'preserve-3d', transitionProperty: 'opacity', transitionDuration: '300ms', opacity: (activeTransition === 'drumroll' && !drumrollReveal) ? 0 : 1 }} key={currentSlide}>
            {currentSlideInfo.type === 'title' && (
              <div ref={coverRef} className="relative bg-black/40 backdrop-blur-2xl rounded-3xl text-center shadow-2xl border-2 border-white/30 min-h-[600px] sm:min-h-[700px] flex flex-col items-center justify-center overflow-hidden" onMouseMove={handleCoverMouseMove} onMouseLeave={() => setMousePosition({ x: 50, y: 50 })}>
                <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl"><div className="absolute inset-0 animate-glass-wave" style={{ background: `radial-gradient(ellipse 60% 40% at 30% 30%, rgba(255,255,255,0.08) 0%, transparent 50%), radial-gradient(ellipse 50% 50% at 70% 70%, rgba(255,255,255,0.06) 0%, transparent 50%)` }} /><div className="absolute w-48 h-48 transition-all duration-300 ease-out" style={{ left: `${mousePosition.x}%`, top: `${mousePosition.y}%`, transform: 'translate(-50%, -50%)', background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 40%, transparent 70%)', filter: 'blur(20px)' }} /><div className="absolute inset-0 animate-caustics opacity-30" /></div>
                {coverImage && (<div className="absolute inset-0 z-0"><img src={coverImage} alt="Cover" className="w-full h-full object-cover opacity-40" /><div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/60" /></div>)}
                <div className="relative z-10 flex flex-col items-center justify-center px-6 sm:px-8"><div className="text-2xl sm:text-3xl font-black text-white/70 tracking-[0.3em] uppercase mb-4 sm:mb-6 animate-float-gentle mt-8 sm:mt-12">Wrapped</div><div className="mb-6 sm:mb-8"><RainbowTitle hasCoverImage={!!coverImage}>{title}</RainbowTitle></div>{dateRange && <div className="text-lg sm:text-xl font-bold text-white/60 uppercase tracking-[0.2em]">{dateRange}</div>}<div className="mt-8 sm:mt-12 flex items-center gap-2 text-white/40 text-sm"><span className="uppercase tracking-wider">Tap to explore</span><ArrowRight size={16} /></div></div>
                <style>{`@keyframes glass-wave { 0%, 100% { transform: translateX(-2%) translateY(-2%); } 25% { transform: translateX(2%) translateY(1%); } 50% { transform: translateX(-1%) translateY(2%); } 75% { transform: translateX(1%) translateY(-1%); } } @keyframes caustics { 0%, 100% { background: radial-gradient(ellipse 80% 60% at 20% 40%, rgba(255,255,255,0.1) 0%, transparent 40%), radial-gradient(ellipse 60% 80% at 80% 60%, rgba(255,255,255,0.08) 0%, transparent 40%); } 33% { background: radial-gradient(ellipse 70% 50% at 60% 30%, rgba(255,255,255,0.12) 0%, transparent 40%), radial-gradient(ellipse 50% 70% at 40% 70%, rgba(255,255,255,0.06) 0%, transparent 40%); } 66% { background: radial-gradient(ellipse 90% 40% at 40% 60%, rgba(255,255,255,0.08) 0%, transparent 40%), radial-gradient(ellipse 40% 90% at 70% 40%, rgba(255,255,255,0.1) 0%, transparent 40%); } } @keyframes float-gentle { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } } .animate-glass-wave { animation: glass-wave 8s ease-in-out infinite; } .animate-caustics { animation: caustics 6s ease-in-out infinite; } .animate-float-gentle { animation: float-gentle 4s ease-in-out infinite; }`}</style>
              </div>
            )}

            {currentSlideInfo.type === 'stat' && (() => {
              const stat = validStats[currentSlideInfo.index]; const isLongText = stat.value.length > 50 || stat.value.includes(':') || stat.value.includes(','); const isFirstView = stat.isHighlight && !viewedHighlights.has(currentSlideInfo.index);
              // Don't show text reveal animations if impact already played for this slide
              const impactAlreadyPlayed = impactPlayedSlides.has(currentSlide);
              // Determine if this is a drumroll slide that just revealed
              const isDrumrollSlide = drumrollReveal && activeTransition === 'drumroll';
              // Regular text reveal for default transition slides (all stats including highlights)
              // Always show text animations on non-transition slides (removed textPlayedSlides check)
              const showTextReveal = activeTransition !== 'impact' && activeTransition !== 'drumroll' && !impactAlreadyPlayed;
              // Cycle through 3 animation themes for variety on regular slides
              const textTheme = slideTextTheme[currentSlide] ?? currentSlideInfo.index % 3;
              // Highlight slides get their own special elevated animation
              const isHighlightWithDefaultTransition = stat.isHighlight && (!transitions[currentSlide] || (transitions[currentSlide]?.type || transitions[currentSlide]) === 'default');
              // Regular slide animations (randomized) - for non-highlight slides
              const labelAnim = showTextReveal && !isHighlightWithDefaultTransition ? (textTheme === 0 ? 'animate-text-fade-in' : textTheme === 1 ? 'animate-text-slide-left' : 'animate-text-zoom-in') : '';
              const valueAnim = showTextReveal && !isHighlightWithDefaultTransition ? (textTheme === 0 ? 'animate-text-reveal' : textTheme === 1 ? 'animate-text-slide-right' : 'animate-text-zoom-reveal') : '';
              const noteAnim = showTextReveal && !isHighlightWithDefaultTransition ? (textTheme === 0 ? 'animate-text-fade-in-late' : textTheme === 1 ? 'animate-text-slide-left-late' : 'animate-text-zoom-late') : '';
              // Special highlight animations - elevated, intentional, more expressive
              const highlightLabelAnim = showTextReveal && isHighlightWithDefaultTransition ? 'animate-highlight-label' : '';
              const highlightValueAnim = showTextReveal && isHighlightWithDefaultTransition ? 'animate-highlight-value' : '';
              const highlightNoteAnim = showTextReveal && isHighlightWithDefaultTransition ? 'animate-highlight-note' : '';
              // Drumroll uses a consistent zoom-in reveal animation
              const drumrollLabelAnim = isDrumrollSlide ? 'animate-drumroll-text-label' : '';
              const drumrollValueAnim = isDrumrollSlide ? 'animate-drumroll-text-value' : '';
              const drumrollNoteAnim = isDrumrollSlide ? 'animate-drumroll-text-note' : '';
              return (
                <div className={`bg-black/40 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 text-center shadow-2xl border-2 min-h-[600px] sm:min-h-[650px] flex flex-col justify-between relative ${stat.isHighlight ? 'border-yellow-400/60' : 'border-white/30'} ${activeTransition === 'drumroll' ? 'drumroll-glow' : ''} ${activeTransition === 'impact' ? 'animate-impact-slam' : ''}`} style={stat.isHighlight && !isFirstView ? { boxShadow: '0 0 60px rgba(250, 204, 21, 0.4), 0 0 100px rgba(250, 204, 21, 0.2), inset 0 0 60px rgba(250, 204, 21, 0.1)', animation: 'glow-breathe 3s ease-in-out infinite' } : {}}>
                  {activeTransition === 'impact' && <ImpactDots />}
                  {showDrumrollGlitter && <DrumrollGlitter />}
                  {stat.isHighlight && <FallingStars />}
                  {!stat.isHighlight && !isLongText && !stat.image && getDecorativeShapes(currentSlideInfo.index)}
                  <div className={`flex-1 flex flex-col justify-center space-y-4 sm:space-y-6 relative z-10 ${activeTransition === 'impact' ? 'animate-impact-text' : ''}`}>{stat.image && <div className="mb-4"><img src={stat.image} alt={stat.label} className="w-full max-w-sm mx-auto h-48 sm:h-64 object-cover rounded-2xl shadow-2xl border-2 border-white/20" /></div>}<div className={`text-white/70 text-lg sm:text-2xl font-bold uppercase tracking-wider ${labelAnim} ${highlightLabelAnim} ${drumrollLabelAnim}`}>{stat.label}</div><div className={`text-white ${valueAnim} ${highlightValueAnim} ${drumrollValueAnim}`}>{formatValue(stat.value)}</div>{stat.note && <div className={`text-white/50 text-base sm:text-lg italic mt-4 max-w-md mx-auto px-2 ${noteAnim} ${highlightNoteAnim} ${drumrollNoteAnim}`}>({stat.note})</div>}</div>
                  <div className="text-white/30 font-black text-sm uppercase tracking-widest mt-4 relative z-10">{dateRange || 'Wrapped'}</div>
                  <style>{`@keyframes glow-breathe { 0%, 100% { box-shadow: 0 0 60px rgba(250, 204, 21, 0.4), 0 0 100px rgba(250, 204, 21, 0.2), inset 0 0 60px rgba(250, 204, 21, 0.1); } 50% { box-shadow: 0 0 80px rgba(250, 204, 21, 0.6), 0 0 120px rgba(250, 204, 21, 0.3), inset 0 0 80px rgba(250, 204, 21, 0.15); } }`}</style>
                </div>
              );
            })()}

            {currentSlideInfo.type === 'moment' && validMoments[currentSlideInfo.index] && (
              <MomentSlide moment={validMoments[currentSlideInfo.index]} isFirstView={true} dateRange={dateRange} />
            )}

            {currentSlideInfo.type === 'badge' && validBadges[currentSlideInfo.index] && (
              <BadgeSlide badge={validBadges[currentSlideInfo.index]} isFirstView={!viewedBadges.has(currentSlideInfo.index)} dateRange={dateRange} />
            )}

            {currentSlideInfo.type === 'reflection' && (
              <ReflectionSlide reflection={reflection} isFirstView={!viewedReflection} dateRange={dateRange} />
            )}

            {currentSlideInfo.type === 'summary' && (
              <div className="bg-black/40 backdrop-blur-2xl rounded-3xl p-6 sm:p-10 shadow-2xl border-2 border-white/30 min-h-[600px] sm:min-h-[650px] flex flex-col justify-center relative overflow-hidden">
                {coverImage && (
                  <div className="flex justify-center mb-4 sm:mb-6">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-4 border-white/30 shadow-xl">
                      <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
                    </div>
                  </div>
                )}
                <div className="text-center mb-6 sm:mb-8"><h2 className="text-3xl sm:text-5xl font-black text-white mb-3 sm:mb-4 tracking-tight">{title}</h2>{dateRange && <div className="text-lg sm:text-xl text-white/70 uppercase tracking-wide">{dateRange}</div>}</div>
                <div className="space-y-3 sm:space-y-4 max-h-[300px] sm:max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                  {/* Content (Stats and Moments interleaved) */}
                  {validContentOrder.map((item, contentIdx) => {
                    if (item.type === 'stat') {
                      const stat = stats[item.index];
                      return (
                        <div key={`content-${contentIdx}`} onClick={(e) => { e.stopPropagation(); navigateToSlideFromSummary(contentIdx + 1); }} className={`bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4 border flex items-center gap-3 sm:gap-4 cursor-pointer hover:bg-white/20 transition-all hover:scale-[1.02] ${stat.isHighlight ? 'border-yellow-400/40' : 'border-white/20'}`}>
                          {stat.image && <img src={stat.image} alt={stat.label} className="w-12 sm:w-16 h-12 sm:h-16 object-cover rounded-lg" />}
                          <div className="flex-1 text-left min-w-0">
                            <div className="text-white/70 text-xs sm:text-sm font-semibold uppercase tracking-wide flex items-center gap-2">{stat.isHighlight && <Star size={12} className="text-yellow-300 fill-yellow-300 flex-shrink-0" />}<span className="truncate">{stat.label}</span></div>
                            <div className="text-white text-base sm:text-lg font-bold truncate">{stat.value.length > 40 ? stat.value.substring(0, 40) + '...' : stat.value}</div>
                            {stat.note && <div className="text-white/50 text-xs sm:text-sm italic mt-1 truncate">{stat.note.length > 50 ? stat.note.substring(0, 50) + '...' : stat.note}</div>}
                          </div>
                          <ChevronRight size={16} className="text-white/40 flex-shrink-0" />
                        </div>
                      );
                    } else {
                      const moment = moments[item.index];
                      const glowConfig = momentGlowColors.find(g => g.id === moment.glowColor) || momentGlowColors[0];
                      return (
                        <div key={`content-${contentIdx}`} onClick={(e) => { e.stopPropagation(); navigateToSlideFromSummary(contentIdx + 1); }} className="bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4 border flex items-center gap-3 sm:gap-4 cursor-pointer hover:bg-white/20 transition-all hover:scale-[1.02]" style={{ borderColor: `${glowConfig.color}40` }}>
                          <img src={moment.image} alt={moment.label} className="w-12 sm:w-16 h-12 sm:h-16 object-cover rounded-lg" style={{ boxShadow: `0 0 10px ${glowConfig.glow}` }} />
                          <div className="flex-1 text-left min-w-0">
                            <div className="text-white/70 text-xs sm:text-sm font-semibold uppercase tracking-wide flex items-center gap-2"><Camera size={12} style={{ color: glowConfig.color }} /><span className="truncate">{moment.label}</span></div>
                          </div>
                          <ChevronRight size={16} className="text-white/40 flex-shrink-0" />
                        </div>
                      );
                    }
                  })}
                  {/* Badges */}
                  {validBadges.length > 0 && (
                    <div className="pt-4 border-t border-white/20">
                      <div className="text-white/50 text-xs uppercase tracking-wider mb-3">Badges Earned</div>
                      <div className="flex flex-wrap gap-2 sm:gap-3">
                        {validBadges.map((badge, index) => (
                          <div key={`badge-${index}`} onClick={(e) => { e.stopPropagation(); navigateToSlideFromSummary(validContentOrder.length + 1 + index); }} className="bg-white/10 rounded-xl px-3 sm:px-4 py-2 flex items-center gap-2 border border-white/20 cursor-pointer hover:bg-white/20 transition-all">
                            <span className="text-xl sm:text-2xl">{badge.emoji}</span>
                            <span className="text-white font-semibold text-sm sm:text-base">{badge.title}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {/* Reflection */}
                  {hasReflection && (
                    <div onClick={(e) => { e.stopPropagation(); navigateToSlideFromSummary(validContentOrder.length + validBadges.length + 1); }} className="pt-4 border-t border-white/20 cursor-pointer hover:bg-white/5 rounded-lg transition-all -mx-2 px-2 py-2">
                      <div className="text-white/50 text-xs uppercase tracking-wider mb-3 flex items-center gap-2"><Sparkles size={12} />Reflection</div>
                      <div className="text-white/80 italic text-sm sm:text-base">"{reflection.length > 100 ? reflection.substring(0, 100) + '...' : reflection}"</div>
                    </div>
                  )}
                </div>
                <div className="mt-6 sm:mt-8 text-center"><div className="text-white/50 text-sm uppercase tracking-widest">That's a wrap!</div></div>
              </div>
            )}
          </div>

        <div className="flex justify-center sm:justify-between items-center mt-6 sm:mt-8">
          <button onClick={(e) => { e.stopPropagation(); prevSlide(); }} disabled={currentSlide === 0 || (isAnimating && activeTransition !== 'drumroll')} className="hidden sm:flex p-3 sm:p-4 bg-white/10 hover:bg-white/20 disabled:bg-white/5 disabled:cursor-not-allowed rounded-full text-white transition-colors backdrop-blur-sm border-2 border-white/20"><ArrowLeft size={24} /></button>
          <ProgressDots current={currentSlide} total={totalSlides} />
          {currentSlide < totalSlides - 1 ? (<button onClick={(e) => { e.stopPropagation(); nextSlide(); }} disabled={(isAnimating && activeTransition !== 'drumroll')} className="hidden sm:flex p-3 sm:p-4 bg-white/10 hover:bg-white/20 disabled:bg-white/5 rounded-full text-white transition-colors backdrop-blur-sm border-2 border-white/20"><ArrowRight size={24} /></button>) : (<button onClick={(e) => { e.stopPropagation(); shareWrapped(); }} disabled={isSaving} className="flex items-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 bg-white hover:bg-white/90 disabled:bg-white/70 rounded-full text-black font-black transition-all shadow-xl hover:shadow-2xl hover:scale-105 disabled:scale-100 uppercase tracking-wide text-sm sm:text-base ml-auto sm:ml-0">{isSaving ? <Loader2 size={18} className="animate-spin" /> : <Share2 size={18} />}{isSaving ? 'Saving...' : 'Share'}</button>)}
        </div>

        {currentSlideInfo.type === 'summary' && (<button onClick={resetWrapped} className="w-full mt-4 sm:mt-6 px-6 py-3 sm:py-4 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors backdrop-blur-sm border-2 border-white/20 font-bold uppercase tracking-wide text-sm sm:text-base">{isViewMode ? 'Create Your Own Wrapped' : 'Create New Wrapped'}</button>)}

        {/* Back to Summary button when navigated from summary */}
        {navigatedFromSummary && currentSlideInfo.type !== 'summary' && (
          <button
            onClick={(e) => { e.stopPropagation(); returnToSummary(); }}
            className="w-full mt-4 sm:mt-6 px-6 py-3 sm:py-4 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors backdrop-blur-sm border-2 border-white/20 font-bold uppercase tracking-wide text-sm sm:text-base flex items-center justify-center gap-2"
          >
            <ArrowLeft size={18} />
            Back to Summary
          </button>
        )}
      </div>

      <style>{`
        @keyframes slide-out-left { 0% { transform: translateX(0) scale(1); opacity: 1; } 100% { transform: translateX(-100px) scale(0.9); opacity: 0; } }
        @keyframes slide-out-right { 0% { transform: translateX(0) scale(1); opacity: 1; } 100% { transform: translateX(100px) scale(0.9); opacity: 0; } }
        @keyframes slide-in { 0% { transform: translateX(50px) scale(0.95); opacity: 0; } 100% { transform: translateX(0) scale(1); opacity: 1; } }
        /* Impact slam animation - frame scales from big to small with satisfying weight */
        @keyframes impact-slam {
          0% { transform: scale(1.4); opacity: 0.6; }
          50% { transform: scale(0.96); opacity: 1; }
          70% { transform: scale(1.03); }
          85% { transform: scale(0.99); }
          100% { transform: scale(1); opacity: 1; }
        }
        /* Impact text animation - appears after frame slam */
        @keyframes impact-text {
          0%, 50% { opacity: 0; transform: scale(1.15); }
          80% { opacity: 1; transform: scale(0.98); }
          100% { opacity: 1; transform: scale(1); }
        }
        .animate-impact-slam { animation: impact-slam 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
        .animate-impact-text { animation: impact-text 1s ease-out forwards; }
        .animate-impact-text { animation: impact-text 0.7s ease-out forwards; }
        /* Theme 1: Fade-in with vertical movement */
        @keyframes text-fade-in {
          0%, 30% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes text-reveal {
          0%, 60% { opacity: 0; transform: scale(0.8); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes text-fade-in-late {
          0%, 80% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        /* Theme 2: Slide-in from sides with blur */
        @keyframes text-slide-left {
          0%, 30% { opacity: 0; transform: translateX(-40px); filter: blur(4px); }
          100% { opacity: 1; transform: translateX(0); filter: blur(0); }
        }
        @keyframes text-slide-right {
          0%, 60% { opacity: 0; transform: translateX(40px); filter: blur(4px); }
          100% { opacity: 1; transform: translateX(0); filter: blur(0); }
        }
        @keyframes text-slide-left-late {
          0%, 80% { opacity: 0; transform: translateX(-30px); filter: blur(4px); }
          100% { opacity: 1; transform: translateX(0); filter: blur(0); }
        }

        /* Theme 3: Zoom + rotate reveal */
        @keyframes text-zoom-in {
          0%, 30% { opacity: 0; transform: scale(0.5) rotate(-5deg); }
          100% { opacity: 1; transform: scale(1) rotate(0deg); }
        }
        @keyframes text-zoom-reveal {
          0%, 60% { opacity: 0; transform: scale(1.3) rotate(3deg); }
          100% { opacity: 1; transform: scale(1) rotate(0deg); }
        }
        @keyframes text-zoom-late {
          0%, 80% { opacity: 0; transform: scale(0.7) rotate(-3deg); }
          100% { opacity: 1; transform: scale(1) rotate(0deg); }
        }
        @keyframes drumroll-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(192, 192, 192, 0.3), 0 0 40px rgba(192, 192, 192, 0.2), inset 0 0 20px rgba(192, 192, 192, 0.1); }
          50% { box-shadow: 0 0 40px rgba(192, 192, 192, 0.6), 0 0 80px rgba(192, 192, 192, 0.4), inset 0 0 40px rgba(192, 192, 192, 0.2); }
        }
        /* Create page entry animations */
        @keyframes title-fade-in {
          0% { opacity: 0; transform: translateY(-20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes subtitle-fade-in {
          0%, 30% { opacity: 0; transform: translateY(-10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes border-travel {
          0% { --border-angle: 0deg; }
          100% { --border-angle: 360deg; }
        }
        @property --border-angle {
          syntax: '<angle>';
          initial-value: 0deg;
          inherits: false;
        }
        .animate-title-fade-in { animation: title-fade-in 0.8s ease-out forwards; }
        .animate-subtitle-fade-in { animation: subtitle-fade-in 1s ease-out forwards; }
        .animate-border-travel { animation: border-travel 8s linear infinite; }
        @keyframes logo-shine {
          0% { transform: translateX(-100%) skewX(-20deg); }
          100% { transform: translateX(100%) skewX(-20deg); }
        }
        @keyframes blob1 { 0%, 100% { transform: translate(0%, 0%); } 25% { transform: translate(60%, 40%); } 50% { transform: translate(30%, 70%); } 75% { transform: translate(70%, 30%); } }
        @keyframes blob2 { 0%, 100% { transform: translate(0%, 0%); } 25% { transform: translate(-50%, -60%); } 50% { transform: translate(-30%, -70%); } 75% { transform: translate(-70%, -30%); } }
        @keyframes blob3 { 0%, 100% { transform: translate(0%, 0%); } 33% { transform: translate(50%, -50%); } 66% { transform: translate(-50%, 50%); } }
        @keyframes blob-safari-1 { 0%, 100% { transform: translate(0%, 0%); } 50% { transform: translate(10%, 15%); } }
        @keyframes blob-safari-2 { 0%, 100% { transform: translate(0%, 0%); } 50% { transform: translate(-10%, -10%); } }
        @keyframes blob-safari-3 { 0%, 100% { transform: translate(0%, 0%); } 50% { transform: translate(5%, -12%); } }
        .animate-slide-out-left { animation: slide-out-left 0.5s ease-out forwards; }
        .animate-slide-out-right { animation: slide-out-right 0.5s ease-out forwards; }
        .animate-slide-in { animation: slide-in 0.5s ease-out forwards; }
        .animate-impact-slam { animation: impact-slam 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
        .impact-text-stamp { animation: text-stamp 0.9s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
        /* Theme 1 classes */
        .animate-text-fade-in { animation: text-fade-in 0.8s ease-out forwards; }
        .animate-text-reveal { animation: text-reveal 1.2s ease-out forwards; }
        .animate-text-fade-in-late { animation: text-fade-in-late 1.0s ease-out forwards; }
        /* Theme 2 classes */
        .animate-text-slide-left { animation: text-slide-left 0.8s ease-out forwards; }
        .animate-text-slide-right { animation: text-slide-right 1.2s ease-out forwards; }
        .animate-text-slide-left-late { animation: text-slide-left-late 1.0s ease-out forwards; }
        /* Theme 3 classes */
        .animate-text-zoom-in { animation: text-zoom-in 0.8s ease-out forwards; }
        .animate-text-zoom-reveal { animation: text-zoom-reveal 1.2s ease-out forwards; }
        .animate-text-zoom-late { animation: text-zoom-late 1.0s ease-out forwards; }
        /* Highlight-specific animations - elevated, golden, expressive */
        @keyframes highlight-label {
          0% { opacity: 0; transform: translateY(-30px) scale(0.9); filter: blur(8px); }
          40% { opacity: 0.6; transform: translateY(5px) scale(1.02); filter: blur(2px); }
          70% { opacity: 0.9; transform: translateY(-2px) scale(0.99); filter: blur(0); }
          100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
        }
        @keyframes highlight-value {
          0% { opacity: 0; transform: scale(0.3) rotate(-8deg); filter: blur(12px) brightness(1.5); }
          30% { opacity: 0; transform: scale(0.5) rotate(-4deg); filter: blur(8px) brightness(1.3); }
          60% { opacity: 0.8; transform: scale(1.08) rotate(2deg); filter: blur(0) brightness(1.1); }
          80% { opacity: 1; transform: scale(0.97) rotate(-1deg); filter: blur(0) brightness(1); }
          100% { opacity: 1; transform: scale(1) rotate(0deg); filter: blur(0) brightness(1); }
        }
        @keyframes highlight-note {
          0%, 60% { opacity: 0; transform: translateY(20px) scale(0.95); }
          80% { opacity: 0.8; transform: translateY(-3px) scale(1.01); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-highlight-label { animation: highlight-label 0.9s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
        .animate-highlight-value { animation: highlight-value 1.4s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
        .animate-highlight-note { animation: highlight-note 1.1s ease-out forwards; }
        .drumroll-glow { animation: drumroll-glow 2s ease-in-out infinite; }
        /* Drumroll text reveal animations - consistent scale-up effect */
        @keyframes drumroll-text-label { 0% { opacity: 0; transform: scale(0.8); } 100% { opacity: 1; transform: scale(1); } }
        @keyframes drumroll-text-value { 0% { opacity: 0; transform: scale(0.6); } 100% { opacity: 1; transform: scale(1); } }
        @keyframes drumroll-text-note { 0% { opacity: 0; transform: scale(0.9); } 100% { opacity: 1; transform: scale(1); } }
        .animate-drumroll-text-label { animation: drumroll-text-label 0.6s ease-out forwards; animation-delay: 0.1s; opacity: 0; }
        .animate-drumroll-text-value { animation: drumroll-text-value 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; animation-delay: 0.3s; opacity: 0; }
        .animate-drumroll-text-note { animation: drumroll-text-note 0.6s ease-out forwards; animation-delay: 0.5s; opacity: 0; }
        .animate-logo-shine { animation: logo-shine 3s ease-in-out infinite; animation-delay: 2s; }
        .animate-blob1 { animation: blob1 12s ease-in-out infinite; }
        .animate-blob2 { animation: blob2 15s ease-in-out infinite; }
        .animate-blob3 { animation: blob3 13s ease-in-out infinite; }
        .animate-blob-safari-1 { animation: blob-safari-1 30s ease-in-out infinite; }
        .animate-blob-safari-2 { animation: blob-safari-2 35s ease-in-out infinite; }
        .animate-blob-safari-3 { animation: blob-safari-3 32s ease-in-out infinite; }
        @keyframes fade-in-down {
          0% { opacity: 0; transform: translate(-50%, -20px); }
          100% { opacity: 1; transform: translate(-50%, 0); }
        }
        .animate-fade-in-down { animation: fade-in-down 0.3s ease-out forwards; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.1); border-radius: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.3); border-radius: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.5); }
      `}</style>
    </div>
  );
}
