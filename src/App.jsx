import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Share2, Plus, Trash2, ArrowRight, ArrowLeft, ArrowUp, ArrowDown, Sparkles, Volume2, VolumeX, Upload, X, Star, Edit3, ImagePlus, Book, Plane, Heart, GraduationCap, Film, Dumbbell, Lock, Bell, Check, ChevronRight, Lightbulb, Camera, Link, Copy, Loader2, Palette, LogOut, User, Crown, CreditCard } from 'lucide-react';

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
  const [slideTransitionStyle, setSlideTransitionStyle] = useState({}); // 0 = 3D slide, 1 = morph dissolve
  

  // Shareable wraps state
  const [wrapId, setWrapId] = useState(null);
  const [isViewMode, setIsViewMode] = useState(false);
  const [shareUrl, setShareUrl] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState(null);

  // Onboarding slideshow state
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showFormAfterOnboarding, setShowFormAfterOnboarding] = useState(false);

  // Loading screen state for heavy transitions
  const [isGeneratingWrap, setIsGeneratingWrap] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('mywrap_seen_onboarding') === 'true';
    }
    return false;
  });

  // Auth state
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [upgradeInfo, setUpgradeInfo] = useState({ count: 0, limit: 2 });

  // My Wraps state
  const [myWraps, setMyWraps] = useState([]);
  const [myWrapsLoading, setMyWrapsLoading] = useState(false);

  // CAW (Create a Wrapped) slide-based builder state
  const [cawSlide, setCawSlide] = useState(0); // 0: Basics, 1: Build, 2: Finishing Touches
  const [cawDirection, setCawDirection] = useState('next');
  const [customColor, setCustomColor] = useState(null); // User's custom color override
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(null); // template id when dialog is open

  // Animation state for content reordering
  const [movingContentIndex, setMovingContentIndex] = useState(null);

  // Scroll state for hiding nav buttons
  const [isScrolled, setIsScrolled] = useState(false);
  const scrollTimeoutRef = useRef(null);

  // Track if homepage animations have already played this session
  const homeAnimationsPlayed = useRef(false);

  // Track if confetti has already played for current wrap view
  const confettiPlayed = useRef(false);

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

  // Glow colors for Moments - 'auto' uses extracted photo color
  const momentGlowColors = [
    { id: 'auto', name: 'Auto', color: 'auto', glow: 'auto' }, // Extracted from photo
    { id: 'gold', name: 'Golden', color: '#fbbf24', glow: 'rgba(251, 191, 36, 0.6)' },
    { id: 'rose', name: 'Rose', color: '#f472b6', glow: 'rgba(244, 114, 182, 0.6)' },
    { id: 'cyan', name: 'Cyan', color: '#22d3ee', glow: 'rgba(34, 211, 238, 0.6)' },
    { id: 'violet', name: 'Violet', color: '#a78bfa', glow: 'rgba(167, 139, 250, 0.6)' },
    { id: 'emerald', name: 'Emerald', color: '#34d399', glow: 'rgba(52, 211, 153, 0.6)' },
    { id: 'white', name: 'White', color: '#f8fafc', glow: 'rgba(248, 250, 252, 0.5)' },
  ];

  // Extract dominant color from image using canvas sampling
  const extractDominantColor = useCallback((imageSrc) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          // Use small sample size for performance
          const sampleSize = 50;
          canvas.width = sampleSize;
          canvas.height = sampleSize;
          ctx.drawImage(img, 0, 0, sampleSize, sampleSize);

          const imageData = ctx.getImageData(0, 0, sampleSize, sampleSize);
          const data = imageData.data;

          // Simple average color with saturation boost
          let r = 0, g = 0, b = 0, count = 0;

          // Sample every 4th pixel for speed
          for (let i = 0; i < data.length; i += 16) {
            const pr = data[i];
            const pg = data[i + 1];
            const pb = data[i + 2];
            const pa = data[i + 3];

            // Skip transparent pixels
            if (pa < 128) continue;

            // Skip very dark or very light pixels (often backgrounds)
            const brightness = (pr + pg + pb) / 3;
            if (brightness < 30 || brightness > 230) continue;

            r += pr;
            g += pg;
            b += pb;
            count++;
          }

          if (count === 0) {
            resolve({ color: '#a78bfa', glow: 'rgba(167, 139, 250, 0.6)' }); // Fallback violet
            return;
          }

          r = Math.round(r / count);
          g = Math.round(g / count);
          b = Math.round(b / count);

          // Boost saturation slightly for more vibrant glow
          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);
          const satBoost = 1.2;

          if (max !== min) {
            const mid = (max + min) / 2;
            r = Math.min(255, Math.round(mid + (r - mid) * satBoost));
            g = Math.min(255, Math.round(mid + (g - mid) * satBoost));
            b = Math.min(255, Math.round(mid + (b - mid) * satBoost));
          }

          const hexColor = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
          const glowColor = `rgba(${r}, ${g}, ${b}, 0.6)`;

          resolve({ color: hexColor, glow: glowColor });
        } catch (e) {
          resolve({ color: '#a78bfa', glow: 'rgba(167, 139, 250, 0.6)' }); // Fallback
        }
      };
      img.onerror = () => {
        resolve({ color: '#a78bfa', glow: 'rgba(167, 139, 250, 0.6)' }); // Fallback
      };
      img.src = imageSrc;
    });
  }, []);

  // Color presets for CAW color picker
  const colorPresets = [
    { id: 'twilight', color: '#7c3aed', name: 'Twilight' },
    { id: 'crimson', color: '#dc2626', name: 'Crimson' },
    { id: 'ocean', color: '#2563eb', name: 'Ocean' },
    { id: 'forest', color: '#16a34a', name: 'Forest' },
    { id: 'golden', color: '#d97706', name: 'Golden' },
    { id: 'rose', color: '#ec4899', name: 'Rose' },
    { id: 'cyan', color: '#06b6d4', name: 'Cyan' },
    { id: 'midnight', color: '#171717', name: 'Midnight' },
  ];

  // Get effective color (custom override or mood-based)
  const getEffectiveColor = useCallback(() => {
    if (customColor) return customColor;
    const mood = moods.find(m => m.id === selectedMood);
    return mood?.colors[0] || '#7c3aed';
  }, [customColor, selectedMood]);

  // Get background colors based on effective color
  const getEffectiveBgColors = useCallback(() => {
    if (customColor) {
      // Generate darker shades from custom color for background
      return [
        customColor + '20', // 12% opacity
        customColor + '15', // 8% opacity
        customColor + '10', // 6% opacity
      ];
    }
    const mood = moods.find(m => m.id === selectedMood);
    return mood?.bgColors || ['#2e1065', '#3b0764', '#4a044e'];
  }, [customColor, selectedMood]);

  const [customMusicFile, setCustomMusicFile] = useState(null);

  const getMoodColors = (moodId) => moods.find(m => m.id === moodId)?.colors || ['#7c3aed', '#c4b5fd'];
  const getMoodBgColors = (moodId) => moods.find(m => m.id === moodId)?.bgColors || ['#2e1065', '#3b0764', '#4a044e'];

  // CAW Navigation
  const cawSlideNames = ['Basics', 'Build', 'Finishing Touches'];

  const nextCawSlide = useCallback(() => {
    if (cawSlide < 2) {
      setCawDirection('next');
      setCawSlide(prev => prev + 1);
    }
  }, [cawSlide]);

  const prevCawSlide = useCallback(() => {
    if (cawSlide > 0) {
      setCawDirection('prev');
      setCawSlide(prev => prev - 1);
    }
  }, [cawSlide]);

  const goToCawSlide = useCallback((index) => {
    if (index !== cawSlide && index >= 0 && index <= 2) {
      setCawDirection(index > cawSlide ? 'next' : 'prev');
      setCawSlide(index);
    }
  }, [cawSlide]);

  // Validate CAW slide before proceeding
  const canProceedFromSlide = useCallback((slideIndex) => {
    if (slideIndex === 0) {
      // Basics: need title
      return title.trim().length > 0;
    }
    if (slideIndex === 1) {
      // Build: need at least one stat or moment with content
      const hasValidStat = stats.some(s => s.label.trim() && s.value.trim());
      const hasValidMoment = moments.some(m => m.image);
      return hasValidStat || hasValidMoment;
    }
    return true;
  }, [title, stats, moments]);

  // Check if user has entered actual data (values or images), not just empty template labels
  const hasUserData = useCallback(() => {
    const hasStatData = stats.some(s => s.value.trim() !== '' || s.image);
    const hasMomentData = moments.some(m => m.image);
    return hasStatData || hasMomentData;
  }, [stats, moments]);

  // Apply template WITHOUT changing mood (used for both auto-switch and Replace All)
  const applyTemplate = (templateId) => {
    // If clicking the same template, uncheck it (clear stats and moments but keep mood)
    if (selectedTemplate === templateId) {
      setSelectedTemplate(null);
      setStats([{ label: '', value: '', image: null, note: '', isHighlight: false }]);
      setMoments([]);
      setContentOrder([{ type: 'stat', index: 0 }]);
      setTransitions({}); // Clear transitions when clearing template
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
      setTransitions({}); // Clear transitions when applying new template
      // NOTE: Do NOT change mood - keep user's selected mood
    }
  };

  // Handle template click - auto-switch if no data, show dialog if has data
  const handleTemplateClick = (templateId) => {
    if (hasUserData()) {
      // Show dialog with Add/Replace options
      setShowTemplateDialog(templateId);
    } else {
      // Auto-switch template without dialog (no data to lose)
      applyTemplate(templateId);
    }
  };

  // Set transition between content items (stats or moments) in builder
  // Uses contentOrder index, not stat index
  const setTransitionAfterContent = (afterContentIndex, transitionType) => {
    // Slide layout: [0: Title, 1: Content[0], 2: Content[1], ...]
    // Transition affects the slide ENTERING after this content
    // If button is after Content[0], affect Content[1] entering (slide 2)
    const destinationSlide = afterContentIndex + 2;
    setTransitions(prev => ({
      ...prev,
      [destinationSlide]: transitionType
    }));
    setShowTransitionPicker(null);
  };

  // Up/Down reordering for content items (replaces drag-and-drop for mobile reliability)
  const moveContentUp = useCallback((orderIndex) => {
    if (orderIndex <= 0) return;
    const newOrder = [...contentOrder];
    // Swap with previous item
    [newOrder[orderIndex - 1], newOrder[orderIndex]] = [newOrder[orderIndex], newOrder[orderIndex - 1]];
    setContentOrder(newOrder);
    // Clear transitions since order changed
    setTransitions({});
  }, [contentOrder]);

  const moveContentDown = useCallback((orderIndex) => {
    if (orderIndex >= contentOrder.length - 1) return;
    const newOrder = [...contentOrder];
    // Swap with next item
    [newOrder[orderIndex], newOrder[orderIndex + 1]] = [newOrder[orderIndex + 1], newOrder[orderIndex]];
    setContentOrder(newOrder);
    // Clear transitions since order changed
    setTransitions({});
  }, [contentOrder]);

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
    // Clear transitions since content order changed
    setTransitions({});
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
    // Default to 'auto' glow which extracts color from photo
    setMoments([...moments, { label: '', image: null, glowColor: 'auto', extractedColor: null }]);
    setContentOrder([...contentOrder, { type: 'moment', index: newIndex }]);
  };
  const removeMoment = (index) => {
    setMoments(moments.filter((_, i) => i !== index));
    // Update contentOrder: remove this moment and adjust indices for remaining moments
    setContentOrder(contentOrder
      .filter(item => !(item.type === 'moment' && item.index === index))
      .map(item => item.type === 'moment' && item.index > index ? { ...item, index: item.index - 1 } : item)
    );
    // Clear transitions since content order changed
    setTransitions({});
  };
  const updateMoment = (index, field, value) => {
    const newMoments = [...moments];
    newMoments[index][field] = value;
    setMoments(newMoments);
  };

  const [imageFormatError, setImageFormatError] = useState(null);

  const unsupportedFormats = ['image/heic', 'image/heif'];

  // Compress image with quality presets: 'high' for moments, 'medium' for stats, 'low' for cover
  const compressImage = useCallback((file, preset = 'medium') => {
    const presets = {
      high: { maxWidth: 1400, maxHeight: 1400, quality: 0.85 },   // Moments - high quality
      medium: { maxWidth: 1000, maxHeight: 1000, quality: 0.75 }, // Stats - good quality
      low: { maxWidth: 800, maxHeight: 800, quality: 0.7 },       // Cover - smaller
    };
    const { maxWidth, maxHeight, quality } = presets[preset] || presets.medium;

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Scale down if larger than max dimensions
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  }, []);

  const handleImageUpload = async (index, file) => {
    if (!file) return;

    const fileExtension = file.name.toLowerCase().split('.').pop();
    const isHeic = fileExtension === 'heic' || fileExtension === 'heif' || unsupportedFormats.includes(file.type);

    if (isHeic) {
      setImageFormatError('HEIC/HEIF format is not supported. Please use JPEG, PNG, GIF, or WebP.');
      setTimeout(() => setImageFormatError(null), 5000);
      return;
    }

    if (file.type.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(fileExtension)) {
      const compressed = await compressImage(file, 'medium'); // Stats - medium quality
      const newStats = [...stats]; newStats[index].image = compressed; setStats(newStats);
    } else {
      setImageFormatError('Unsupported image format. Please use JPEG, PNG, GIF, or WebP.');
      setTimeout(() => setImageFormatError(null), 5000);
    }
  };

  const handleCoverImageUpload = async (file) => {
    if (!file) return;

    const fileExtension = file.name.toLowerCase().split('.').pop();
    const isHeic = fileExtension === 'heic' || fileExtension === 'heif' || unsupportedFormats.includes(file.type);

    if (isHeic) {
      setImageFormatError('HEIC/HEIF format is not supported. Please use JPEG, PNG, GIF, or WebP.');
      setTimeout(() => setImageFormatError(null), 5000);
      return;
    }

    if (file.type.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(fileExtension)) {
      const compressed = await compressImage(file, 'low'); // Cover - smaller
      setCoverImage(compressed);
    } else {
      setImageFormatError('Unsupported image format. Please use JPEG, PNG, GIF, or WebP.');
      setTimeout(() => setImageFormatError(null), 5000);
    }
  };

  const removeImage = (index) => { const newStats = [...stats]; newStats[index].image = null; setStats(newStats); };

  // Moment image upload - also extracts dominant color for auto glow
  const handleMomentImageUpload = async (index, file) => {
    if (!file) return;
    const fileExtension = file.name.toLowerCase().split('.').pop();
    const isHeic = fileExtension === 'heic' || fileExtension === 'heif' || unsupportedFormats.includes(file.type);
    if (isHeic) {
      setImageFormatError('HEIC/HEIF format is not supported. Please use JPEG, PNG, GIF, or WebP.');
      setTimeout(() => setImageFormatError(null), 5000);
      return;
    }
    if (file.type.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(fileExtension)) {
      const compressed = await compressImage(file, 'high'); // Moments - high quality
      const newMoments = [...moments];
      newMoments[index].image = compressed;

      // Extract dominant color for auto glow (non-blocking)
      extractDominantColor(compressed).then(({ color, glow }) => {
        setMoments(prev => {
          const updated = [...prev];
          if (updated[index]) {
            updated[index].extractedColor = color;
            updated[index].extractedGlow = glow;
          }
          return updated;
        });
      });

      setMoments(newMoments);
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

    // Show loading screen immediately to mask heavy processing
    setIsGeneratingWrap(true);
    setLoadingMessage('Generating your wrap…');

    // Use requestAnimationFrame to ensure loading screen renders before heavy work
    requestAnimationFrame(() => {
      // Small delay to ensure smooth loading screen appearance
      setTimeout(() => {
        setStep('preview');
        setCurrentSlide(0);
        setViewedHighlights(new Set());
        setViewedBadges(new Set());
        setViewedReflection(false);
        setShowConfetti(false);
        setTextPlayedSlides(new Set());
        setSlideTextTheme({});
        starsShownForSlide.current = null;
        setStarsVisible(false);
        confettiPlayed.current = false;

        // Hide loading after a brief moment to ensure everything is ready
        requestAnimationFrame(() => {
          setTimeout(() => setIsGeneratingWrap(false), 300);
        });
      }, 100);
    });
  };

  const editWrapped = () => { setStep('input'); setShowConfetti(false); setAttemptedSubmit(false); setValidationErrors({}); };

  // Start creating - always shows onboarding tour first
  const startCreating = () => {
    setStep('input');
    // Always show tour first, defer CAW form mount until tour completes
    setShowOnboarding(true);
    setShowFormAfterOnboarding(false);
  };

  const resetWrapped = () => {
    setTitle(''); setDateRange(''); setCoverImage(null); setSelectedMood('twilight');
    setStats([{ label: '', value: '', image: null, note: '', isHighlight: false }]); setMoments([]); setBadges([]);
    setContentOrder([{ type: 'stat', index: 0 }]);
    setReflection(''); setSelectedMusic(''); setStep('home'); setCurrentSlide(0);
    setViewedHighlights(new Set()); setViewedBadges(new Set()); setViewedReflection(false);
    setShowConfetti(false); setAttemptedSubmit(false); setValidationErrors({}); setSelectedTemplate(null);
    setTransitions({}); setCustomMusicFile(null); starsShownForSlide.current = null; setStarsVisible(false);
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = ''; audioRef.current = null; }
    setAudioPlaying(false);
    confettiPlayed.current = false; // Reset confetti tracker
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

      // Initialize audio for shared wrap if music is set
      if (data.selectedMusic && data.selectedMusic !== 'none' && data.selectedMusic !== 'custom') {
        const track = musicTracks.find(t => t.id === data.selectedMusic);
        if (track?.url && track.url !== 'custom') {
          // Create audio but don't auto-play (user needs to interact first on mobile)
          const audio = new Audio();
          audio.src = track.url;
          audio.loop = true;
          audio.volume = 0.5;
          audioRef.current = audio;
          setAudioPlaying(false);
        }
      }

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

  // Hide native preloader once React mounts
  useEffect(() => {
    const preload = document.getElementById('preload');
    if (preload) {
      preload.classList.add('hidden');
      // Remove from DOM after fade transition
      setTimeout(() => preload.remove(), 300);
    }
  }, []);

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' });
        if (res.ok) {
          const userData = await res.json();
          setUser(userData);
        }
      } catch (err) {
        console.error('Auth check failed:', err);
      } finally {
        setAuthLoading(false);
      }
    };
    checkAuth();

    // Check for auth redirect params
    const params = new URLSearchParams(window.location.search);
    if (params.get('auth_success') === 'true') {
      // Re-check auth after successful login
      checkAuth();
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname);
    }
    if (params.get('auth_error')) {
      console.error('Auth error:', params.get('auth_error'));
      window.history.replaceState({}, '', window.location.pathname);
    }
    if (params.get('upgrade') === 'success') {
      // Re-check auth to get updated tier
      checkAuth();
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  // Mobile viewport height fix - accounts for dynamic browser UI (address bar, etc.)
  useEffect(() => {
    const setVH = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    setVH();
    window.addEventListener('resize', setVH);
    window.addEventListener('orientationchange', setVH);
    return () => {
      window.removeEventListener('resize', setVH);
      window.removeEventListener('orientationchange', setVH);
    };
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

  // Handle scroll to hide/show navigation buttons
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(true);
      // Clear existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      // Show buttons again after scrolling stops
      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolled(false);
      }, 1500);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

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

  // Upload a single image to blob storage and return the URL
  const uploadImageToBlob = useCallback(async (dataUrl, prefix = 'img') => {
    if (!dataUrl || !dataUrl.startsWith('data:')) return dataUrl;
    // If it's already a URL (not base64), return as-is
    if (dataUrl.startsWith('http')) return dataUrl;

    try {
      const res = await fetch(`${window.location.origin}/api/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: dataUrl, prefix }),
      });
      if (!res.ok) throw new Error('Upload failed');
      const { url } = await res.json();
      return url;
    } catch (err) {
      console.error('[uploadImageToBlob] Error:', err);
      return dataUrl; // Fall back to base64 if upload fails
    }
  }, []);

  // Save wrap and get shareable link
  const saveWrap = useCallback(async () => {
    if (isSaving) return;

    // Check if user is logged in
    if (!user) {
      setShowLoginModal(true);
      return;
    }

    // Check wrap limit for free users (pre-check before upload)
    if (user.tier === 'free') {
      try {
        const checkRes = await fetch('/api/wraps/my-wraps', { credentials: 'include' });
        if (checkRes.ok) {
          const { count, limit } = await checkRes.json();
          if (count >= limit) {
            setUpgradeInfo({ count, limit });
            setShowUpgradeModal(true);
            return;
          }
        }
      } catch (err) {
        console.error('[saveWrap] Limit check failed:', err);
      }
    }

    setIsSaving(true);

    try {
      console.log('[saveWrap] Uploading images to blob storage...');

      // Upload all images in parallel to blob storage first
      const [uploadedCover, ...uploadedStats] = await Promise.all([
        coverImage ? uploadImageToBlob(coverImage, 'cover') : null,
        ...validStats.map((stat, i) =>
          stat.image ? uploadImageToBlob(stat.image, `stat-${i}`) : Promise.resolve(null)
        )
      ]);

      const uploadedMoments = await Promise.all(
        validMoments.map((moment, i) =>
          moment.image ? uploadImageToBlob(moment.image, `moment-${i}`) : Promise.resolve(null)
        )
      );

      // Build stats with uploaded URLs
      const statsWithUrls = validStats.map((stat, i) => ({
        ...stat,
        image: uploadedStats[i] || null
      }));

      // Build moments with uploaded URLs
      const momentsWithUrls = validMoments.map((moment, i) => ({
        ...moment,
        image: uploadedMoments[i] || null
      }));

      const wrapData = {
        title,
        dateRange,
        selectedMood,
        stats: statsWithUrls,
        moments: momentsWithUrls,
        badges: validBadges,
        reflection,
        contentOrder: validContentOrder,
        coverImage: uploadedCover,
        selectedMusic,
        transitions,
      };

      console.log('[saveWrap] Images uploaded, saving wrap data...');

      // Use absolute URL to ensure mobile browsers resolve correctly
      const apiUrl = `${window.location.origin}/api/wraps/create`;
      console.log('[saveWrap] Calling API:', apiUrl);

      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(wrapData),
      });

      console.log('[saveWrap] Response status:', res.status);

      // Check if response is JSON (API might not be available locally)
      const contentType = res.headers.get('content-type');
      console.log('[saveWrap] Content-Type:', contentType);

      if (!contentType || !contentType.includes('application/json')) {
        // Log the actual response for debugging
        const text = await res.text().catch(() => 'Could not read response');
        console.error('[saveWrap] Non-JSON response:', text.substring(0, 500));
        throw new Error('API not available. Deploy to Vercel or run with `vercel dev` to enable sharing.');
      }

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        // Handle wrap limit reached
        if (errorData.limitReached) {
          setUpgradeInfo({ count: errorData.count, limit: errorData.limit });
          setShowUpgradeModal(true);
          setIsSaving(false);
          return;
        }
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
  }, [title, dateRange, selectedMood, validStats, validMoments, validBadges, reflection, validContentOrder, coverImage, selectedMusic, transitions, isSaving, uploadImageToBlob]);

  const executeTransition = useCallback((transitionData, _direction, callback, destSlide) => {
    const transitionType = transitionData?.type || transitionData || 'default';

    if (transitionType === 'drumroll') {
      setActiveTransition('drumroll');
      setDrumrollCount(3);
      setDrumrollReveal(false);
      setShowDrumrollGlitter(false);
      // Store destination so skipDrumroll can use it
      drumrollDestinationRef.current = destSlide;
      // Clear any previous drumroll timers
      if (drumrollIntervalRef.current) clearInterval(drumrollIntervalRef.current);
      drumrollTimeoutsRef.current.forEach(t => clearTimeout(t));
      drumrollTimeoutsRef.current = [];

      const countdown = setInterval(() => {
        setDrumrollCount(prev => {
          if (prev <= 1) {
            clearInterval(countdown);
            drumrollIntervalRef.current = null;
            drumrollDestinationRef.current = null; // Clear - callback will handle it
            callback();
            setDrumrollReveal(true);
            setDrumrollFading(true);
            setShowDrumrollGlitter(true);
            setActiveTransition(null); // Clear immediately so user can navigate
            const glitterTimeout = setTimeout(() => setShowDrumrollGlitter(false), 5500);
            drumrollTimeoutsRef.current.push(glitterTimeout);
            const clearTimeout2 = setTimeout(() => {
              setDrumrollFading(false);
              setDrumrollReveal(false);
            }, 6100);
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

  // Track the pending drumroll destination slide
  const drumrollDestinationRef = useRef(null);

  // Clean function to skip drumroll immediately - reveals the slide
  const skipDrumroll = useCallback(() => {
    if (drumrollIntervalRef.current) {
      clearInterval(drumrollIntervalRef.current);
      drumrollIntervalRef.current = null;
    }
    drumrollTimeoutsRef.current.forEach(t => clearTimeout(t));
    drumrollTimeoutsRef.current = [];
    // If we have a pending destination, go there now
    if (drumrollDestinationRef.current !== null) {
      setCurrentSlide(drumrollDestinationRef.current);
      drumrollDestinationRef.current = null;
    }
    setDrumrollFading(false);
    setDrumrollCount(0);
    setActiveTransition(null);
    setDrumrollReveal(true);
    setShowDrumrollGlitter(true);
    setTimeout(() => setShowDrumrollGlitter(false), 500);
  }, []);

  const nextSlide = useCallback(() => {
    // If drumroll is active, skip it (reveal slide) instead of navigating
    if (activeTransition === 'drumroll') {
      skipDrumroll();
      return; // Don't navigate, just reveal current slide
    }
    const canNavigate = !isAnimating;
    if (currentSlide < totalSlides - 1 && canNavigate) {
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
          // Only show confetti once per wrap view session
          if (destinationSlide === totalSlides - 1 && !confettiPlayed.current) {
            setShowConfetti(true);
            confettiPlayed.current = true;
          }
        } else {
          setTimeout(() => {
            setCurrentSlide(destinationSlide);
            setIsAnimating(false);
            // Only show confetti once per wrap view session
            if (destinationSlide === totalSlides - 1 && !confettiPlayed.current) {
              setShowConfetti(true);
              confettiPlayed.current = true;
            }
          }, (transitionData?.type || transitionData) === 'default' || !transitionData ? 400 : 100);
        }
      }, destinationSlide);
    }
  }, [currentSlide, totalSlides, isAnimating, activeTransition, transitions, executeTransition, skipDrumroll]);

  const prevSlide = useCallback(() => {
    // If drumroll is active, skip it (reveal slide) instead of navigating
    if (activeTransition === 'drumroll') {
      skipDrumroll();
      return; // Don't navigate, just reveal current slide
    }
    if (currentSlide > 0 && !isAnimating) {
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

  // Trigger stars for highlight slides - uses ref to prevent re-triggering
  useEffect(() => {
    if (currentSlideInfo.type !== 'stat') {
      setStarsVisible(false);
      return;
    }
    const statIndex = currentSlideInfo.index;
    const stat = validStats[statIndex];
    if (stat?.isHighlight && starsShownForSlide.current !== statIndex) {
      starsShownForSlide.current = statIndex;
      starsDataRef.current = Array.from({ length: 30 }, (_, i) => ({
        id: i, left: Math.random() * 100, delay: Math.random() * 3,
        duration: 2 + Math.random() * 2, size: 10 + Math.random() * 20
      }));
      setStarsVisible(true);
      setTimeout(() => setStarsVisible(false), 8000);
    } else if (!stat?.isHighlight) {
      setStarsVisible(false);
    }
  }, [currentSlide]);

  useEffect(() => {
    if (currentSlideInfo.type === 'stat') {
      const statIndex = currentSlideInfo.index;
      if (validStats[statIndex]?.isHighlight && !viewedHighlights.has(statIndex)) {
        const markTimeout = setTimeout(() => {
          setViewedHighlights(prev => new Set([...prev, statIndex]));
        }, 8000);
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
      }, 2000);
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
  // TransitionPickerModal - now uses contentOrder index
  const TransitionPickerModal = ({ contentIndex, onSelect, onClose }) => {
    // Slide layout: [0: Title, 1: Content[0], 2: Content[1], ...]
    const destinationSlide = contentIndex + 2;
    const currentTransition = transitions[destinationSlide];

    return (
      <div className={`fixed inset-0 z-50 flex items-center justify-center ${isSafari ? 'bg-black/60' : 'bg-black/40 backdrop-blur-sm'}`} onClick={onClose}>
        <div className={`rounded-2xl p-6 border border-white/20 max-w-sm w-full mx-4 shadow-2xl ${isSafari ? 'bg-gray-900/90' : 'bg-white/10 backdrop-blur-2xl'}`} onClick={e => e.stopPropagation()}>
          <h3 className="text-lg font-bold text-white/80 mb-5 text-center">Choose Transition</h3>
          <div className="space-y-2">
            {transitionTypes.map(t => (
              <button
                key={t.id}
                onClick={() => onSelect(contentIndex, t.id)}
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
    const [copyError, setCopyError] = useState(false);

    const handleCopy = async () => {
      try {
        // Try modern clipboard API first
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(url);
        } else {
          // Fallback for older browsers
          const textArea = document.createElement('textarea');
          textArea.value = url;
          textArea.style.position = 'fixed';
          textArea.style.left = '-999999px';
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
        }
        setCopied(true);
        setCopyError(false);
        setTimeout(() => setCopied(false), 2500);
      } catch (err) {
        console.error('Copy failed:', err);
        setCopyError(true);
        setTimeout(() => setCopyError(false), 2000);
      }
    };

    return (
      <div className={`fixed inset-0 z-50 flex items-center justify-center ${isSafari ? 'bg-black/60' : 'bg-black/40 backdrop-blur-sm'}`} onClick={onClose}>
        <div className={`rounded-2xl p-6 border border-white/20 max-w-md w-full mx-4 shadow-2xl ${isSafari ? 'bg-gray-900/95' : 'bg-white/10 backdrop-blur-2xl'}`} onClick={e => e.stopPropagation()}>
          <div className="text-center mb-6">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 transition-all duration-300 ${copied ? 'bg-green-500 scale-110' : 'bg-gradient-to-br from-green-400 to-emerald-500'}`}>
              <Check size={32} className={`text-white transition-transform duration-300 ${copied ? 'scale-125' : ''}`} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Your Wrap is Ready!</h3>
            <p className="text-white/60 text-sm">Share this link with friends so they can view your wrap.</p>
          </div>

          {/* Clickable URL box - click to copy */}
          <button
            onClick={handleCopy}
            className={`w-full bg-black/30 rounded-xl p-4 mb-4 text-left transition-all duration-200 hover:bg-black/40 active:scale-[0.98] border-2 ${copied ? 'border-green-500/50' : 'border-transparent'}`}
          >
            <div className="flex items-center gap-3">
              <Link size={18} className="text-white/50 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-mono truncate">{url}</p>
              </div>
              {copied && <Check size={16} className="text-green-400 flex-shrink-0 animate-bounce" />}
            </div>
          </button>

          <button
            onClick={handleCopy}
            className={`w-full py-4 rounded-xl font-bold text-base uppercase tracking-wide transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.97] ${
              copied ? 'bg-green-500 text-white scale-[1.02]' :
              copyError ? 'bg-red-500 text-white' :
              'bg-white text-black hover:bg-white/90 hover:scale-[1.01]'
            }`}
          >
            {copied ? <Check size={18} className="animate-bounce" /> : copyError ? <X size={18} /> : <Copy size={18} />}
            {copied ? 'Copied!' : copyError ? 'Try Again' : 'Copy Link'}
          </button>

          <button onClick={onClose} className="w-full mt-3 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-white/60 text-sm font-medium transition-colors border border-white/10">
            Close
          </button>
        </div>
      </div>
    );
  };

  // Login Modal - Google sign-in prompt
  const LoginModal = ({ onClose, message }) => {
    const handleGoogleLogin = () => {
      window.location.href = '/api/auth/google';
    };

    return (
      <div className={`fixed inset-0 z-50 flex items-center justify-center ${isSafari ? 'bg-black/60' : 'bg-black/40 backdrop-blur-sm'}`} onClick={onClose}>
        <div className={`rounded-2xl p-6 border border-white/20 max-w-sm w-full mx-4 shadow-2xl ${isSafari ? 'bg-gray-900/95' : 'bg-white/10 backdrop-blur-2xl'}`} onClick={e => e.stopPropagation()}>
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mx-auto mb-4">
              <User size={32} className="text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Sign In to MyWrap</h3>
            <p className="text-white/60 text-sm">{message || 'Sign in to save your wraps and access them anywhere.'}</p>
          </div>

          <button
            onClick={handleGoogleLogin}
            className="w-full py-4 bg-white text-black rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-white/90 transition-all active:scale-[0.98]"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <p className="text-white/40 text-xs text-center mt-4">
            Free to sign up. No password needed.
          </p>

          <button onClick={onClose} className="w-full mt-3 py-3 text-white/60 hover:text-white transition-colors text-sm">
            Maybe Later
          </button>
        </div>
      </div>
    );
  };

  // Upgrade Modal - Premium upgrade prompt (shown when free user hits limit)
  const UpgradeModal = ({ onClose, currentCount, limit }) => {
    const [loading, setLoading] = useState(false);

    const handleUpgrade = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/stripe/create-checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });
        const data = await res.json();
        if (data.url) {
          window.location.href = data.url;
        }
      } catch (err) {
        console.error('Upgrade error:', err);
        setLoading(false);
      }
    };

    return (
      <div className={`fixed inset-0 z-50 flex items-center justify-center ${isSafari ? 'bg-black/60' : 'bg-black/40 backdrop-blur-sm'}`} onClick={onClose}>
        <div className={`rounded-2xl p-6 border border-white/20 max-w-sm w-full mx-4 shadow-2xl ${isSafari ? 'bg-gray-900/95' : 'bg-white/10 backdrop-blur-2xl'}`} onClick={e => e.stopPropagation()}>
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center mx-auto mb-4">
              <Crown size={32} className="text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">You've Hit Your Limit!</h3>
            <p className="text-white/60 text-sm">
              Free accounts can save up to {limit} wraps. You have {currentCount}.
              Upgrade to Premium for unlimited wraps.
            </p>
          </div>

          <div className="bg-white/5 rounded-xl p-4 mb-6 border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <span className="text-white font-bold">MyWrap Premium</span>
              <span className="text-white">$4.99/month</span>
            </div>
            <ul className="space-y-2 text-white/70 text-sm">
              <li className="flex items-center gap-2"><Check size={14} className="text-green-400" /> Unlimited saved wraps</li>
              <li className="flex items-center gap-2"><Check size={14} className="text-green-400" /> Wraps never expire</li>
              <li className="flex items-center gap-2"><Check size={14} className="text-green-400" /> Priority support</li>
            </ul>
          </div>

          <button
            onClick={handleUpgrade}
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-black rounded-xl font-bold hover:opacity-90 transition-all disabled:opacity-50 active:scale-[0.98]"
          >
            {loading ? <Loader2 className="animate-spin mx-auto" size={20} /> : 'Upgrade to Premium'}
          </button>

          <button onClick={onClose} className="w-full mt-3 py-3 text-white/60 hover:text-white transition-colors text-sm">
            Maybe Later
          </button>
        </div>
      </div>
    );
  };

  // Account Menu - Dropdown for logged-in users
  const AccountMenu = ({ user: currentUser, onClose }) => {
    const menuRef = useRef(null);

    useEffect(() => {
      const handleClickOutside = (e) => {
        if (menuRef.current && !menuRef.current.contains(e.target)) {
          onClose();
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    const handleLogout = async () => {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
      setUser(null);
      onClose();
    };

    const handleManageSubscription = async () => {
      try {
        const res = await fetch('/api/stripe/create-portal', { method: 'POST', credentials: 'include' });
        const data = await res.json();
        if (data.url) {
          window.location.href = data.url;
        }
      } catch (err) {
        console.error('Portal error:', err);
      }
    };

    const handleMyWraps = () => {
      setStep('my-wraps');
      onClose();
    };

    return (
      <div ref={menuRef} className={`absolute top-14 right-0 border border-white/10 rounded-xl p-4 min-w-[220px] shadow-2xl z-50 ${isSafari ? 'bg-gray-900/98' : 'bg-gray-900/95 backdrop-blur-xl'}`}>
        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/10">
          <img src={currentUser.picture} alt="" className="w-10 h-10 rounded-full" />
          <div className="min-w-0">
            <p className="text-white font-medium truncate">{currentUser.name}</p>
            <p className="text-white/50 text-xs truncate">{currentUser.email}</p>
          </div>
        </div>

        {currentUser.tier === 'premium' && (
          <div className="mb-3 px-3 py-1.5 bg-gradient-to-r from-yellow-400/20 to-orange-500/20 rounded-lg border border-yellow-400/30">
            <span className="text-yellow-400 text-xs font-medium flex items-center gap-1.5">
              <Crown size={12} /> Premium Member
            </span>
          </div>
        )}

        <div className="space-y-1">
          <button
            onClick={handleMyWraps}
            className="w-full text-left px-3 py-2.5 text-white/80 hover:bg-white/10 rounded-lg transition-all flex items-center gap-2"
          >
            <Sparkles size={16} /> My Wraps
          </button>

          {currentUser.tier === 'free' && (
            <button
              onClick={() => { setShowUpgradeModal(true); onClose(); }}
              className="w-full text-left px-3 py-2.5 text-yellow-400 hover:bg-yellow-400/10 rounded-lg transition-all flex items-center gap-2"
            >
              <Crown size={16} /> Upgrade to Premium
            </button>
          )}

          {currentUser.tier === 'premium' && (
            <button
              onClick={handleManageSubscription}
              className="w-full text-left px-3 py-2.5 text-white/80 hover:bg-white/10 rounded-lg transition-all flex items-center gap-2"
            >
              <CreditCard size={16} /> Manage Subscription
            </button>
          )}

          <button
            onClick={handleLogout}
            className="w-full text-left px-3 py-2.5 text-red-400 hover:bg-red-400/10 rounded-lg transition-all flex items-center gap-2"
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </div>
    );
  };

  // Fetch user's wraps
  const fetchMyWraps = useCallback(async () => {
    if (!user) return;
    setMyWrapsLoading(true);
    try {
      const res = await fetch('/api/wraps/my-wraps', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setMyWraps(data.wraps);
        setUpgradeInfo({ count: data.count, limit: data.limit });
      }
    } catch (err) {
      console.error('Failed to fetch wraps:', err);
    } finally {
      setMyWrapsLoading(false);
    }
  }, [user]);

  // Fetch wraps when viewing my-wraps page
  useEffect(() => {
    if (step === 'my-wraps' && user) {
      fetchMyWraps();
    }
  }, [step, user, fetchMyWraps]);

  // Onboarding Slideshow - shows on first visit to explain features
  const OnboardingSlideshow = ({ onClose }) => {
    const [onboardingSlide, setOnboardingSlide] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);
    const [onboardingDirection, setOnboardingDirection] = useState('next');
    const autoPlayRef = useRef(null);

    const slides = [
      {
        id: 'welcome',
        title: 'MyWrap',
        subtitle: 'Create shareable recaps for any moment.',
        icon: null, // Uses logo instead
        visual: 'welcome',
        gradient: ['#2e1065', '#4a1d6a'],  // Darker purple tones
      },
      {
        id: 'stats',
        title: 'Stats',
        subtitle: 'Track your numbers, achievements, and milestones',
        icon: '📊',
        visual: 'stats',
        gradient: ['#f59e0b', '#ef4444'],
        example: { label: 'Books Read', value: '47' },
      },
      {
        id: 'highlights',
        title: 'Highlights',
        subtitle: 'Mark special stats with a golden glow effect',
        icon: '⭐',
        visual: 'highlight',
        gradient: ['#fbbf24', '#f59e0b'],
        example: { label: 'Favorite Book', value: 'The Midnight Library', isHighlight: true },
      },
      {
        id: 'moments',
        title: 'Moments',
        subtitle: 'Add photos to capture your favorite memories',
        icon: '📸',
        visual: 'moments',
        gradient: ['#ec4899', '#8b5cf6'],
      },
      {
        id: 'badges',
        title: 'Badges',
        subtitle: 'Celebrate achievements with fun emoji badges',
        icon: '🏆',
        visual: 'badges',
        gradient: ['#10b981', '#06b6d4'],
        badges: ['🎯', '💪', '🔥', '👑'],
      },
      {
        id: 'reflections',
        title: 'Reflections',
        subtitle: 'Share your thoughts and personal takeaways',
        icon: '💭',
        visual: 'reflections',
        gradient: ['#6366f1', '#8b5cf6'],
      },
      {
        id: 'transitions',
        title: 'Transitions',
        subtitle: 'Add dramatic effects between slides',
        icon: '🎬',
        visual: 'transitions',
        gradient: ['#f97316', '#dc2626'],
        transitions: ['Drumroll', 'Impact'],
      },
      {
        id: 'customize',
        title: 'Music & Moods',
        subtitle: 'Set the vibe with background music and color themes',
        icon: '🎵',
        visual: 'customize',
        gradient: ['#06b6d4', '#8b5cf6', '#ec4899'],
        moods: ['twilight', 'crimson', 'ocean', 'aurora'],
      },
      {
        id: 'share',
        title: 'Share Your Story',
        subtitle: 'Get a unique link to share with friends and family',
        icon: '🔗',
        visual: 'share',
        gradient: ['#22c55e', '#10b981'],
      },
    ];

    const totalSlides = slides.length;

    // Auto-advance slides - first slide is shorter (2.5s), others are 4s
    useEffect(() => {
      if (isAutoPlaying) {
        const duration = onboardingSlide === 0 ? 2500 : 4000;
        autoPlayRef.current = setTimeout(() => {
          setOnboardingDirection('next');
          setOnboardingSlide(prev => (prev + 1) % totalSlides);
        }, duration);
      }
      return () => {
        if (autoPlayRef.current) clearTimeout(autoPlayRef.current);
      };
    }, [isAutoPlaying, totalSlides, onboardingSlide]);

    const goToSlide = (index) => {
      setIsAutoPlaying(false);
      setOnboardingDirection(index > onboardingSlide ? 'next' : 'prev');
      setOnboardingSlide(index);
    };

    const nextOnboardingSlide = () => {
      setIsAutoPlaying(false);
      setOnboardingDirection('next');
      setOnboardingSlide(prev => (prev + 1) % totalSlides);
    };

    const prevOnboardingSlide = () => {
      setIsAutoPlaying(false);
      setOnboardingDirection('prev');
      setOnboardingSlide(prev => (prev - 1 + totalSlides) % totalSlides);
    };

    const handleClose = () => {
      localStorage.setItem('mywrap_seen_onboarding', 'true');
      setHasSeenOnboarding(true);
      onClose();
    };

    // Handle keyboard navigation
    useEffect(() => {
      const handleKeyDown = (e) => {
        if (e.key === 'ArrowRight' || e.key === ' ') {
          e.preventDefault();
          nextOnboardingSlide();
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          if (onboardingSlide > 0) {
            prevOnboardingSlide();
          }
        } else if (e.key === 'Escape') {
          handleClose();
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onboardingSlide]);

    // Handle tap on left/right side of screen
    const handleTapNavigation = (e) => {
      // Don't navigate if clicking on buttons or interactive elements
      if (e.target.closest('button')) return;

      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const width = rect.width;

      // Left third = previous, right two-thirds = next
      if (clickX < width * 0.33) {
        if (onboardingSlide > 0) {
          prevOnboardingSlide();
        }
      } else {
        nextOnboardingSlide();
      }
    };

    const slide = slides[onboardingSlide];

    // Visual content for each slide type
    const renderVisual = () => {
      switch (slide.visual) {
        case 'welcome':
          return (
            <div className="relative w-full h-56 flex flex-col items-center justify-center">
              {/* Logo container - bounce on entry only, no background effects */}
              <div className="relative flex flex-col items-center">
                <img
                  src="/MyWrap-Logo.png"
                  alt="MyWrap Logo"
                  className="w-36 h-36 object-contain drop-shadow-2xl animate-logo-bounce-entry"
                />
                {/* Tour indicator text */}
                <div className="mt-4 text-white/50 text-xs uppercase tracking-widest animate-fade-in-delayed">
                  Tour of Features
                </div>
              </div>
            </div>
          );

        case 'stats':
          return (
            <div className="relative w-full h-48 flex items-center justify-center px-6">
              <div className="w-full max-w-xs bg-black/40 backdrop-blur-xl rounded-2xl border border-white/20 p-5 shadow-2xl">
                <div className="text-white/50 text-xs uppercase tracking-wider mb-2 font-medium">{slide.example.label}</div>
                <div className="text-4xl font-black text-white mb-1">{slide.example.value}</div>
                <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full animate-stat-fill" style={{ width: '75%' }} />
                </div>
              </div>
            </div>
          );

        case 'highlight':
          return (
            <div className="relative w-full h-48 flex items-center justify-center px-6">
              <div className="w-full max-w-xs bg-black/40 backdrop-blur-xl rounded-2xl border-2 border-yellow-400/50 p-5 shadow-2xl relative overflow-hidden">
                {/* Golden glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 via-transparent to-amber-500/10 animate-glow-breathe" />
                <div className="absolute -top-2 -right-2 w-8 h-8 flex items-center justify-center">
                  <Star size={24} className="text-yellow-400 fill-yellow-400 animate-pulse" />
                </div>
                <div className="relative">
                  <div className="text-yellow-300/70 text-xs uppercase tracking-wider mb-2 font-medium">{slide.example.label}</div>
                  <div className="text-2xl font-black text-white">{slide.example.value}</div>
                </div>
              </div>
            </div>
          );

        case 'moments':
          return (
            <div className="relative w-full h-48 flex items-center justify-center px-6">
              <div className="relative">
                {/* Stacked photo effect */}
                <div className="absolute -rotate-6 -left-2 top-2 w-40 h-28 rounded-xl bg-gradient-to-br from-pink-500/40 to-purple-500/40 border border-white/20" />
                <div className="absolute rotate-3 left-2 -top-1 w-40 h-28 rounded-xl bg-gradient-to-br from-blue-500/40 to-cyan-500/40 border border-white/20" />
                <div className="relative w-44 h-32 rounded-xl bg-gradient-to-br from-violet-500/60 to-pink-500/60 border-2 border-white/30 flex items-center justify-center shadow-2xl">
                  <Camera size={32} className="text-white/80" />
                  <div className="absolute bottom-2 left-2 right-2 bg-black/40 rounded-lg px-2 py-1">
                    <p className="text-white text-xs font-medium truncate">Summer vacation 🌴</p>
                  </div>
                </div>
              </div>
            </div>
          );

        case 'badges':
          return (
            <div className="relative w-full h-48 flex items-center justify-center">
              <div className="flex gap-3">
                {slide.badges.map((badge, i) => (
                  <div
                    key={badge}
                    className="w-16 h-16 rounded-2xl bg-black/40 backdrop-blur border border-white/20 flex items-center justify-center text-3xl shadow-lg animate-badge-pop"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  >
                    {badge}
                  </div>
                ))}
              </div>
            </div>
          );

        case 'reflections':
          return (
            <div className="relative w-full h-48 flex items-center justify-center px-6">
              <div className="w-full max-w-xs bg-black/40 backdrop-blur-xl rounded-2xl border border-white/20 p-5 shadow-2xl">
                <div className="text-white/50 text-xs uppercase tracking-wider mb-3 font-medium flex items-center gap-2">
                  <Lightbulb size={14} /> Personal Reflection
                </div>
                <p className="text-white/90 text-sm italic leading-relaxed">
                  "This month taught me that growth isn't always linear, but every step forward counts..."
                </p>
                <div className="mt-3 flex justify-end">
                  <div className="text-white/40 text-xs">—January Wrap </div>
                </div>
              </div>
            </div>
          );

        case 'transitions':
          return (
            <div className="relative w-full h-48 flex flex-col items-center justify-center gap-4">
              {/* Transition effects demo */}
              <div className="flex gap-4">
                {/* Drumroll preview */}
                <div className="bg-black/40 backdrop-blur rounded-2xl p-4 border border-white/20 flex flex-col items-center gap-2 animate-transition-card" style={{ animationDelay: '0s' }}>
                  <div className="flex items-center gap-1.5">
                    <div className="text-2xl font-black text-orange-400 animate-countdown-3">3</div>
                    <div className="text-2xl font-black text-orange-300 animate-countdown-2">2</div>
                    <div className="text-2xl font-black text-orange-200 animate-countdown-1">1</div>
                  </div>
                  <span className="text-white/60 text-xs font-medium">Drumroll</span>
                </div>
                {/* Impact preview */}
                <div className="bg-black/40 backdrop-blur rounded-2xl p-4 border border-white/20 flex flex-col items-center gap-2 animate-transition-card" style={{ animationDelay: '0.2s' }}>
                  <div className="relative">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 animate-impact-demo" />
                    <div className="absolute inset-0 w-10 h-10 rounded-lg bg-red-400/30 animate-impact-ring" />
                  </div>
                  <span className="text-white/60 text-xs font-medium">Impact</span>
                </div>
              </div>
              <p className="text-white/40 text-xs text-center max-w-[200px]">Add between slides for dramatic reveals</p>
            </div>
          );

        case 'customize':
          return (
            <div className="relative w-full h-48 flex flex-col items-center justify-center gap-4">
              {/* Music visualization */}
              <div className="flex items-center gap-3 bg-black/40 backdrop-blur rounded-full px-4 py-2 border border-white/20">
                <Volume2 size={18} className="text-white/70" />
                <div className="flex items-end gap-0.5 h-5">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="w-1 bg-gradient-to-t from-cyan-400 to-purple-400 rounded-full animate-music-bar"
                      style={{
                        height: '100%',
                        animationDelay: `${i * 0.1}s`,
                      }}
                    />
                  ))}
                </div>
                <span className="text-white/70 text-sm">Lofi Beats</span>
              </div>
              {/* Mood colors */}
              <div className="flex gap-2">
                {slide.moods?.map((mood, i) => {
                  const moodData = moods.find(m => m.id === mood);
                  return (
                    <div
                      key={mood}
                      className="w-10 h-10 rounded-full border-2 border-white/30 shadow-lg animate-mood-pop"
                      style={{
                        background: `linear-gradient(135deg, ${moodData?.bgColors[0] || '#000'} 0%, ${moodData?.bgColors[1] || '#333'} 100%)`,
                        animationDelay: `${i * 0.1}s`,
                      }}
                    />
                  );
                })}
              </div>
            </div>
          );

        case 'share':
          return (
            <div className="relative w-full h-48 flex items-center justify-center px-6">
              <div className="w-full max-w-xs">
                <div className="bg-black/40 backdrop-blur-xl rounded-2xl border border-white/20 p-4 shadow-2xl mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                      <Link size={18} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white/50 text-xs">Your unique link</p>
                      <p className="text-white text-sm font-mono truncate">mywrap.app/w/abc123</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 justify-center">
                  <div className="px-4 py-2 bg-white/10 rounded-full text-white/70 text-xs flex items-center gap-1">
                    <Copy size={12} /> Copy
                  </div>
                  <div className="px-4 py-2 bg-white/10 rounded-full text-white/70 text-xs flex items-center gap-1">
                    <Share2 size={12} /> Share
                  </div>
                </div>
              </div>
            </div>
          );

        default:
          return null;
      }
    };

    return (
      <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 ${isSafari ? 'bg-black/80' : 'bg-black/80 backdrop-blur-md'}`}>
        {/* Main slideshow container - phone frame style */}
        <div
          className="relative w-full max-w-sm rounded-3xl border border-white/20 shadow-2xl overflow-hidden cursor-pointer"
          onClick={handleTapNavigation}
          style={{
            background: isSafari
              ? `linear-gradient(135deg, ${slide.gradient[0]}cc 0%, ${slide.gradient[1] || slide.gradient[0]}cc 100%)`
              : `linear-gradient(135deg, ${slide.gradient[0]}20 0%, ${slide.gradient[1] || slide.gradient[0]}20 100%)`,
            maxHeight: '85vh',
          }}
        >
          {/* Background gradient orbs - hide on Safari for welcome slide, static for other slides */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Left orb - hide completely on Safari for welcome slide */}
            {!(isSafari && slide.id === 'welcome') && (
              <div
                className={`absolute w-64 h-64 rounded-full ${isSafari ? 'opacity-15' : 'opacity-30 blur-3xl'} -top-20 -left-20 transition-all duration-1000`}
                style={{
                  background: slide.gradient[0],
                  filter: isSafari ? 'blur(60px)' : undefined,
                }}
              />
            )}
            <div
              className={`absolute w-64 h-64 rounded-full ${isSafari ? 'opacity-10' : 'opacity-30 blur-3xl'} -bottom-20 -right-20 transition-all duration-1000`}
              style={{
                background: slide.gradient[1] || slide.gradient[0],
                filter: isSafari ? 'blur(60px)' : undefined,
              }}
            />
          </div>

          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>

          {/* Progress bar */}
          <div className="absolute top-4 left-4 right-14 z-20 flex gap-1">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => goToSlide(i)}
                className="flex-1 h-1 rounded-full overflow-hidden bg-white/20 hover:bg-white/30 transition-colors"
              >
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    i < onboardingSlide ? 'w-full bg-white' :
                    i === onboardingSlide ? 'bg-white animate-progress-fill' : 'w-0'
                  }`}
                  style={i === onboardingSlide ? { animationDuration: '4s' } : {}}
                />
              </button>
            ))}
          </div>

          {/* Slide content */}
          <div className="relative pt-12 pb-6 px-6 min-h-[480px] flex flex-col">
            {/* Icon - only show if not welcome slide */}
            {slide.icon && (
              <div className="text-center mb-2">
                <span className="text-4xl">{slide.icon}</span>
              </div>
            )}

            {/* Title */}
            <h2 className={`text-2xl font-black text-white text-center mb-2 animate-fade-in-up ${!slide.icon ? 'mt-4' : ''}`}>
              {slide.title}
            </h2>

            {/* Subtitle */}
            <p className="text-white/60 text-center text-sm mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              {slide.subtitle}
            </p>

            {/* Visual content */}
            <div className="flex-1 flex items-center justify-center animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              {renderVisual()}
            </div>

            {/* Navigation arrows */}
            <div className="flex justify-between items-center mt-6">
              <button
                onClick={prevOnboardingSlide}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  onboardingSlide === 0 ? 'bg-white/5 text-white/30' : 'bg-white/10 text-white hover:bg-white/20'
                }`}
                disabled={onboardingSlide === 0}
              >
                <ArrowLeft size={18} />
              </button>

              {/* Slide counter */}
              <div className="text-white/40 text-sm font-medium">
                {onboardingSlide + 1} / {totalSlides}
              </div>

              {onboardingSlide === totalSlides - 1 ? (
                <button
                  onClick={handleClose}
                  className="px-5 py-2.5 rounded-full bg-white text-black font-bold text-sm hover:bg-white/90 transition-colors flex items-center gap-2"
                >
                  Get Started <ArrowRight size={16} />
                </button>
              ) : (
                <button
                  onClick={nextOnboardingSlide}
                  className="w-10 h-10 rounded-full bg-white/10 text-white hover:bg-white/20 flex items-center justify-center transition-all"
                >
                  <ArrowRight size={18} />
                </button>
              )}
            </div>
          </div>

          {/* Skip button */}
          {onboardingSlide < totalSlides - 1 && (
            <button
              onClick={handleClose}
              className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/40 text-xs hover:text-white/60 transition-colors"
            >
              Skip intro
            </button>
          )}
        </div>

        {/* Onboarding animations */}
        <style>{`
          @keyframes progress-fill {
            from { width: 0; }
            to { width: 100%; }
          }
          .animate-progress-fill {
            animation: progress-fill linear forwards;
          }
          @keyframes stat-fill {
            from { width: 0; }
            to { width: 75%; }
          }
          .animate-stat-fill {
            animation: stat-fill 1s ease-out forwards;
          }
          @keyframes badge-pop {
            0% { transform: scale(0) rotate(-10deg); opacity: 0; }
            60% { transform: scale(1.2) rotate(5deg); }
            100% { transform: scale(1) rotate(0deg); opacity: 1; }
          }
          .animate-badge-pop {
            animation: badge-pop 0.5s ease-out forwards;
            opacity: 0;
          }
          @keyframes mood-pop {
            0% { transform: scale(0); }
            60% { transform: scale(1.15); }
            100% { transform: scale(1); }
          }
          .animate-mood-pop {
            animation: mood-pop 0.4s ease-out forwards;
          }
          @keyframes music-bar {
            0%, 100% { height: 20%; }
            50% { height: 100%; }
          }
          .animate-music-bar {
            animation: music-bar 0.8s ease-in-out infinite;
          }
          @keyframes glow-breathe {
            0%, 100% { opacity: 0.3; }
            50% { opacity: 0.6; }
          }
          .animate-glow-breathe {
            animation: glow-breathe 2s ease-in-out infinite;
          }
          @keyframes logo-breathe {
            0%, 100% { opacity: 0.4; transform: scale(1); }
            50% { opacity: 0.7; transform: scale(1.1); }
          }
          .animate-logo-breathe {
            animation: logo-breathe 3s ease-in-out infinite;
          }
          @keyframes logo-pulse-safari {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.08); }
          }
          .animate-logo-pulse-safari {
            animation: logo-pulse-safari 2s ease-in-out infinite;
          }
          @keyframes logo-bounce-entry {
            0% { opacity: 0; transform: scale(0.3) translateY(30px); }
            50% { opacity: 1; transform: scale(1.1) translateY(-10px); }
            70% { transform: scale(0.95) translateY(5px); }
            100% { transform: scale(1) translateY(0); }
          }
          .animate-logo-bounce-entry {
            animation: logo-bounce-entry 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          }
          @keyframes fade-in-delayed {
            0% { opacity: 0; transform: translateY(10px); }
            100% { opacity: 0.5; transform: translateY(0); }
          }
          .animate-fade-in-delayed {
            animation: fade-in-delayed 0.5s ease-out 0.6s forwards;
            opacity: 0;
          }
          @keyframes float-dot {
            0%, 100% { transform: translateY(0) scale(1); opacity: 0.3; }
            50% { transform: translateY(-15px) scale(1.2); opacity: 0.6; }
          }
          .animate-float-dot {
            animation: float-dot ease-in-out infinite;
          }
          @keyframes wave-1 {
            0%, 100% { d: path('M0,100 Q100,60 200,100 T400,100'); }
            50% { d: path('M0,100 Q100,140 200,100 T400,100'); }
          }
          @keyframes wave-2 {
            0%, 100% { d: path('M0,120 Q100,80 200,120 T400,120'); }
            50% { d: path('M0,120 Q100,160 200,120 T400,120'); }
          }
          @keyframes wave-3 {
            0%, 100% { d: path('M0,80 Q100,40 200,80 T400,80'); }
            50% { d: path('M0,80 Q100,120 200,80 T400,80'); }
          }
          .animate-wave-1 { animation: wave-1 4s ease-in-out infinite; }
          .animate-wave-2 { animation: wave-2 5s ease-in-out infinite; animation-delay: 0.5s; }
          .animate-wave-3 { animation: wave-3 6s ease-in-out infinite; animation-delay: 1s; }
          @keyframes transition-card {
            0% { opacity: 0; transform: translateY(20px) scale(0.9); }
            100% { opacity: 1; transform: translateY(0) scale(1); }
          }
          .animate-transition-card {
            animation: transition-card 0.5s ease-out forwards;
            opacity: 0;
          }
          @keyframes countdown-3 {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.5; transform: scale(0.8); }
          }
          @keyframes countdown-2 {
            0%, 100% { opacity: 0.7; transform: scale(0.9); }
            50% { opacity: 1; transform: scale(1.1); }
          }
          @keyframes countdown-1 {
            0%, 100% { opacity: 0.5; transform: scale(0.8); }
            50% { opacity: 1; transform: scale(1.2); }
          }
          .animate-countdown-3 { animation: countdown-3 1.5s ease-in-out infinite; }
          .animate-countdown-2 { animation: countdown-2 1.5s ease-in-out infinite; animation-delay: 0.5s; }
          .animate-countdown-1 { animation: countdown-1 1.5s ease-in-out infinite; animation-delay: 1s; }
          @keyframes impact-demo {
            0%, 100% { transform: scale(1) translateY(0); }
            50% { transform: scale(1.2) translateY(-5px); }
          }
          @keyframes impact-ring {
            0%, 100% { transform: scale(1); opacity: 0.5; }
            50% { transform: scale(1.5); opacity: 0; }
          }
          .animate-impact-demo { animation: impact-demo 2s ease-in-out infinite; }
          .animate-impact-ring { animation: impact-ring 2s ease-in-out infinite; }
        `}</style>
      </div>
    );
  };

  // Transition button for builder - now uses contentOrder index instead of stat index
  const BuilderTransitionButton = ({ afterContentIndex, isLast }) => {
    if (isLast) return null;
    // Slide layout: [0: Title, 1: Content[0], 2: Content[1], ...]
    // Transition affects Content[afterContentIndex + 1] entering at slide afterContentIndex + 2
    const destinationSlide = afterContentIndex + 2;
    const currentTransition = transitions[destinationSlide];
    const transitionInfo = transitionTypes.find(t => t.id === (currentTransition?.type || currentTransition));
    return (
      <div className="flex justify-center py-2">
        <button
          onClick={() => setShowTransitionPicker(afterContentIndex)}
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

  // Loading screen for heavy transitions (wrap generation, etc.)
  const LoadingScreen = ({ message }) => (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/90 backdrop-blur-md">
      <div className="flex flex-col items-center gap-6">
        {/* Animated logo */}
        <div className="relative">
          <div className="absolute inset-0 w-24 h-24 rounded-full blur-2xl bg-purple-500/40 animate-pulse" />
          <img src="/MyWrap-Logo.png" alt="Loading" className="relative w-24 h-24 object-contain animate-bounce-slow" />
        </div>
        {/* Loading spinner */}
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-4 border-white/10" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-500 animate-spin" />
        </div>
        {/* Loading text */}
        <p className="text-white/80 text-lg font-medium animate-pulse">{message || 'Loading…'}</p>
      </div>
      <style>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-slow { animation: bounce-slow 2s ease-in-out infinite; }
      `}</style>
    </div>
  );

  // Typewriter effect - using direct DOM manipulation to avoid re-renders
  const typewriterRef = useRef(null);
  const typewriterStateRef = useRef({
    currentPhraseIndex: 0,
    charIndex: 0,
    isDeleting: false,
    isPaused: false,
    pauseUntil: 0
  });

  const typewriterPhrases = useMemo(() => [
    'track your moments, insights, and stats.',
    "Bethany's Birthday Party!! 🥳",
    'My NYC Move! 🗽',
    'Dating Era Recap ❤️',
    'Training for 10K 🏃‍♀️',
    'Hawaii Trip (Worst & Best Moments) 🏖️',
    '2026 Vision Board ⭐️',
    'Rejection Therapy Week 1 💪',
    'Social Media Content Recap 📸',
    'Family Reunion 2026 🧑‍🧑‍🧒‍🧒',
  ], []);

  // Typewriter animation using setInterval with direct DOM updates (no state re-renders)
  useEffect(() => {
    if (step !== 'home') return;

    // Check for reduced motion preference
    const prefersReducedMotion = typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion && typewriterRef.current) {
      typewriterRef.current.textContent = typewriterPhrases[0];
      return;
    }

    const interval = setInterval(() => {
      if (!typewriterRef.current) return;

      const state = typewriterStateRef.current;
      const now = Date.now();

      // Handle pause
      if (state.pauseUntil > now) return;

      const currentPhrase = typewriterPhrases[state.currentPhraseIndex];

      if (state.isDeleting) {
        // Deleting characters
        if (state.charIndex > 0) {
          state.charIndex--;
          typewriterRef.current.textContent = currentPhrase.slice(0, state.charIndex);
        } else {
          // Done deleting, move to next phrase
          state.isDeleting = false;
          state.currentPhraseIndex = (state.currentPhraseIndex + 1) % typewriterPhrases.length;
        }
      } else {
        // Typing characters
        if (state.charIndex < currentPhrase.length) {
          state.charIndex++;
          typewriterRef.current.textContent = currentPhrase.slice(0, state.charIndex);
        } else {
          // Done typing, pause then start deleting
          state.pauseUntil = now + 2000; // 2 second pause
          state.isDeleting = true;
        }
      }
    }, 50); // Base tick rate

    return () => clearInterval(interval);
  }, [step, typewriterPhrases]);

  // Typewriter display component - uses ref for text updates, no state
  const TypewriterText = () => (
    <span className="text-white/50">
      Your personalized recap:{' '}
      <span className="text-white/70 inline-block min-w-[1ch]">
        <span ref={typewriterRef}></span>
        <span className="animate-blink text-purple-400">|</span>
      </span>
      <style>{`
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
        .animate-blink { animation: blink 1s infinite; }
      `}</style>
    </span>
  );

  // Confetti particles - generated once and stored in ref to prevent regeneration on re-render
  const confettiParticlesRef = useRef(null);
  const confettiTimerRef = useRef(null);

  const hideConfetti = useCallback(() => {
    setShowConfetti(false);
  }, []);

  // Generate confetti particles once when shown
  useEffect(() => {
    if (showConfetti && !confettiParticlesRef.current) {
      const colors = ['#ff0080', '#ff8c00', '#ffef00', '#00ff88', '#00cfff', '#8000ff', '#ff006e', '#fb5607'];
      confettiParticlesRef.current = Array.from({ length: 150 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 2,
        duration: 2 + Math.random() * 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 8 + Math.random() * 12,
        rotation: Math.random() * 360,
        type: Math.random() > 0.5 ? 'square' : 'circle'
      }));
      // Auto-hide after animations complete (max delay 2s + max duration 4s + buffer)
      confettiTimerRef.current = setTimeout(hideConfetti, 6500);
    }
    if (!showConfetti) {
      confettiParticlesRef.current = null; // Reset for next time
    }
    return () => {
      if (confettiTimerRef.current) clearTimeout(confettiTimerRef.current);
    };
  }, [showConfetti, hideConfetti]);

  const Confetti = () => {
    const particles = confettiParticlesRef.current || [];
    return (<div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">{particles.map(p => (<div key={p.id} className="absolute animate-confetti" style={{ left: `${p.x}%`, top: '-20px', animationDelay: `${p.delay}s`, animationDuration: `${p.duration}s` }}><div style={{ width: p.size, height: p.size, backgroundColor: p.color, borderRadius: p.type === 'circle' ? '50%' : '2px', transform: `rotate(${p.rotation}deg)` }} /></div>))}<style>{`@keyframes confetti { 0% { transform: translateY(0) rotate(0deg) scale(1); opacity: 1; } 100% { transform: translateY(100vh) rotate(720deg) scale(0.5); opacity: 0; } } .animate-confetti { animation: confetti ease-out forwards; }`}</style></div>);
  };

  const Fireworks = () => {
    const [bursts, setBursts] = useState([]);
    useEffect(() => { const colors = ['#ff0080', '#ffef00', '#00ff88', '#00cfff', '#ff8c00', '#8000ff']; setBursts(Array.from({ length: 8 }, (_, i) => ({ id: i, x: 15 + Math.random() * 70, y: 15 + Math.random() * 50, delay: Math.random() * 1.5, color: colors[Math.floor(Math.random() * colors.length)], size: 80 + Math.random() * 60 }))); }, []);
    return (<div className="absolute inset-0 pointer-events-none overflow-hidden">{bursts.map(burst => (<div key={burst.id} className="absolute animate-firework" style={{ left: `${burst.x}%`, top: `${burst.y}%`, animationDelay: `${burst.delay}s` }}>{[...Array(12)].map((_, i) => (<div key={i} className="absolute w-2 h-2 rounded-full animate-spark" style={{ backgroundColor: burst.color, transform: `rotate(${i * 30}deg) translateY(-${burst.size / 2}px)`, animationDelay: `${burst.delay}s`, boxShadow: `0 0 6px ${burst.color}, 0 0 12px ${burst.color}` }} />))}</div>))}<style>{`@keyframes firework { 0% { transform: scale(0); opacity: 0; } 50% { transform: scale(1); opacity: 1; } 100% { transform: scale(1.5); opacity: 0; } } @keyframes spark { 0% { opacity: 1; } 100% { opacity: 0; } } .animate-firework { animation: firework 1.5s ease-out forwards; } .animate-spark { animation: spark 1s ease-out forwards; }`}</style></div>);
  };

  // Simple stars state - just track if showing and when started
  const [starsVisible, setStarsVisible] = useState(false);
  const starsDataRef = useRef(null);
  const starsShownForSlide = useRef(null);

  // Generate stars data once
  if (!starsDataRef.current) {
    starsDataRef.current = Array.from({ length: 30 }, (_, i) => ({
      id: i, left: Math.random() * 100, delay: Math.random() * 3,
      duration: 2 + Math.random() * 2, size: 10 + Math.random() * 20
    }));
  }

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
    // Use state to delay rendering until after mount to prevent flash
    const [isReady, setIsReady] = useState(false);
    useEffect(() => {
      const timer = setTimeout(() => setIsReady(true), 50);
      return () => clearTimeout(timer);
    }, []);
    if (!isReady) return null;
    return (<><div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none"><div className="absolute inset-0 animate-reflection-ring"><div className="absolute inset-[-2px] rounded-3xl border-4 border-white/80" style={{ background: 'conic-gradient(from 0deg, transparent 0deg, rgba(255, 255, 255, 0.6) 30deg, rgba(255, 255, 255, 0.9) 60deg, rgba(255, 255, 255, 0.6) 90deg, transparent 120deg)', mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', maskComposite: 'exclude', WebkitMaskComposite: 'xor', padding: '4px' }} /></div></div><div className="absolute inset-0 rounded-3xl animate-reflection-pulse pointer-events-none" style={{ boxShadow: '0 0 60px rgba(255, 255, 255, 0.4), 0 0 100px rgba(255, 255, 255, 0.2), inset 0 0 60px rgba(255, 255, 255, 0.1)' }} /><style>{`@keyframes reflection-ring { 0% { transform: rotate(0deg); opacity: 0; } 10% { opacity: 1; } 100% { transform: rotate(360deg); opacity: 0; } } @keyframes reflection-pulse { 0% { opacity: 0; } 50% { opacity: 1; } 100% { opacity: 0.5; } } .animate-reflection-ring { animation: reflection-ring 2s ease-out forwards; } .animate-reflection-pulse { animation: reflection-pulse 2s ease-out forwards; }`}</style></>);
  };

  const RainbowTitle = ({ children, hasCoverImage = false }) => {
    const titleLength = typeof children === 'string' ? children.length : 0;
    // Dynamically size based on title length
    const sizeClass = titleLength > 20
      ? 'text-3xl sm:text-4xl md:text-5xl'
      : titleLength > 12
        ? 'text-4xl sm:text-5xl md:text-6xl'
        : 'text-5xl sm:text-6xl md:text-7xl';

    // For Safari: use a simple pulsing text glow instead of animated rainbow background
    if (isSafari) {
      return (
        <div className="relative inline-block">
          <h1
            className={`relative ${sizeClass} font-black text-white tracking-tight leading-tight break-words max-w-full animate-text-glow-safari`}
            style={{ textShadow: '0 0 30px rgba(139, 92, 246, 0.8), 0 0 60px rgba(236, 72, 153, 0.6), 0 0 90px rgba(139, 92, 246, 0.4)' }}
          >
            {children}
          </h1>
          <style>{`
            @keyframes text-glow-safari {
              0%, 100% { text-shadow: 0 0 30px rgba(139, 92, 246, 0.8), 0 0 60px rgba(236, 72, 153, 0.6), 0 0 90px rgba(139, 92, 246, 0.4); }
              50% { text-shadow: 0 0 40px rgba(236, 72, 153, 0.9), 0 0 80px rgba(139, 92, 246, 0.7), 0 0 120px rgba(236, 72, 153, 0.5); }
            }
            .animate-text-glow-safari { animation: text-glow-safari 3s ease-in-out infinite; }
          `}</style>
        </div>
      );
    }

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

    // Handle 'auto' glow color - use extracted color from photo
    const isAutoGlow = moment.glowColor === 'auto';
    const glowConfig = isAutoGlow
      ? {
          id: 'auto',
          name: 'Auto',
          color: moment.extractedColor || '#a78bfa',
          glow: moment.extractedGlow || 'rgba(167, 139, 250, 0.6)'
        }
      : (momentGlowColors.find(g => g.id === moment.glowColor) || momentGlowColors[1]); // Fallback to gold (index 1)

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
          @keyframes moment-text {
            0% { opacity: 0; transform: translateY(20px); }
            50% { opacity: 0; transform: translateY(20px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          .animate-moment-zoom { animation: moment-zoom 1.2s ease-out forwards; }
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
      <div className={`relative bg-black/40 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 text-center border border-white/20 min-h-[600px] sm:min-h-[650px] flex flex-col justify-center overflow-hidden ${activeTransition === 'drumroll' ? 'drumroll-glow' : ''}`} style={{ boxShadow: '0 0 30px rgba(255, 255, 255, 0.08), 0 25px 50px -12px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.25), inset 0 -1px 0 rgba(0, 0, 0, 0.15)' }}>
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
          <div className="absolute inset-0 animate-badge-shine" style={{ background: 'linear-gradient(110deg, transparent 0%, transparent 40%, rgba(255,255,255,0.12) 50%, transparent 60%, transparent 100%)', backgroundSize: '200% 100%', backgroundPosition: '200% 0' }} />
          <div className="absolute inset-0 bg-gradient-to-b from-white/8 via-white/3 to-transparent" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/25 to-transparent" />
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
    <div className={`glass-card bg-black/40 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 text-center border min-h-[600px] sm:min-h-[650px] flex flex-col justify-center relative overflow-hidden ${!isFirstView ? 'border-white/35' : 'border-white/20'} ${activeTransition === 'drumroll' ? 'drumroll-glow' : ''}`} style={!isFirstView ? { boxShadow: '0 0 40px rgba(255, 255, 255, 0.25), 0 25px 50px -12px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.3), inset 0 -1px 0 rgba(0, 0, 0, 0.15)', animation: 'reflection-breathe 4s ease-in-out infinite' } : { boxShadow: '0 0 20px rgba(255, 255, 255, 0.1), 0 25px 50px -12px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.25), inset 0 -1px 0 rgba(0, 0, 0, 0.15)' }}>
      <ReflectionGlowRing isFirstView={isFirstView} /><FloatingSparkles />
      <div className="flex-1 flex flex-col items-center justify-center relative z-10">
        <div className="text-white/60 text-lg sm:text-xl font-bold uppercase tracking-wider mb-4 sm:mb-6 flex items-center gap-3"><Sparkles size={20} className="text-white/60" />Reflection<Sparkles size={20} className="text-white/60" /></div>
        <div className="text-2xl sm:text-3xl md:text-4xl font-medium text-white leading-relaxed max-w-lg italic px-2">"{reflection}"</div>
      </div>
      <div className="text-white/30 font-black text-sm uppercase tracking-widest mt-4 relative z-10">{dateRange || 'Wrapped'}</div>
      <style>{`@keyframes reflection-breathe { 0%, 100% { box-shadow: 0 0 40px rgba(255, 255, 255, 0.3), 0 0 80px rgba(255, 255, 255, 0.15), inset 0 0 40px rgba(255, 255, 255, 0.05); } 50% { box-shadow: 0 0 60px rgba(255, 255, 255, 0.4), 0 0 100px rgba(255, 255, 255, 0.2), inset 0 0 60px rgba(255, 255, 255, 0.08); } }`}</style>
    </div>
  );

  // Emoji picker position state for fixed positioning
  const [emojiPickerPosition, setEmojiPickerPosition] = useState({ top: 0, left: 0 });

  const EmojiPicker = ({ selectedEmoji, onSelect, onClose }) => {
    const [showMore, setShowMore] = useState(false);

    // Close on click outside
    useEffect(() => {
      const handleClickOutside = (e) => {
        if (!e.target.closest('.emoji-picker-container')) {
          onClose();
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('touchstart', handleClickOutside);
      };
    }, [onClose]);

    return (
      <div
        className="emoji-picker-container fixed rounded-xl border border-white/10 p-3 z-[9999] shadow-2xl bg-black/95 backdrop-blur-2xl"
        style={{
          width: '300px',
          maxWidth: 'calc(100vw - 32px)',
          top: `${emojiPickerPosition.top}px`,
          left: `${emojiPickerPosition.left}px`,
          transform: 'translateY(-100%) translateY(-8px)',
          pointerEvents: 'auto',
          backgroundColor: isSafari ? 'rgb(10, 10, 10)' : undefined,
        }}
      >
        <div className="flex flex-row flex-wrap gap-2">
          {quickEmojis.map(emoji => (
            <button key={emoji} onClick={() => { onSelect(emoji); onClose(); }} className={`w-11 h-11 text-xl rounded-lg hover:bg-white/20 transition-colors flex items-center justify-center ${selectedEmoji === emoji ? 'bg-white/30' : ''}`}>{emoji}</button>
          ))}
          <button onClick={() => setShowMore(!showMore)} className="w-11 h-11 text-lg rounded-lg hover:bg-white/20 transition-colors flex items-center justify-center bg-white/10 font-bold text-white">{showMore ? '−' : '+'}</button>
        </div>
        {showMore && (
          <div className="grid grid-cols-8 gap-1 max-h-48 overflow-y-auto pt-3 mt-3 border-t border-white/10">
            {moreEmojis.map((emoji, idx) => (
              <button key={`${emoji}-${idx}`} onClick={() => { onSelect(emoji); onClose(); }} className={`w-8 h-8 text-base rounded-lg hover:bg-white/20 transition-colors flex items-center justify-center ${selectedEmoji === emoji ? 'bg-white/30' : ''}`}>{emoji}</button>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Handle emoji button click - calculate position and show picker
  const handleEmojiButtonClick = (index, buttonRef) => {
    if (showEmojiPicker === index) {
      setShowEmojiPicker(null);
      return;
    }
    if (buttonRef) {
      const rect = buttonRef.getBoundingClientRect();
      setEmojiPickerPosition({
        top: rect.top,
        left: Math.min(rect.left, window.innerWidth - 316) // Keep within viewport
      });
    }
    setShowEmojiPicker(index);
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

  // No color filter needed - we'll match Chrome's look with proper noise overlay instead
  const safariColorBoostStyle = {};

  // Persistent animation time reference - ensures animations don't restart
  const auraAnimationStartTime = useRef(Date.now());

  const DynamicBackground = ({ moodId = 'twilight', offset = 0, showParticles = false }) => {
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

    // Mood-specific aura settings for premium look
    const moodAuraConfig = {
      midnight: { opacity1: 0.6, opacity2: 0.5, opacity3: 0.4, size1: '[38rem]', size2: '[32rem]', size3: '[26rem]', blur: 'blur-[80px]' },
      moonlight: { opacity1: 0.5, opacity2: 0.45, opacity3: 0.35, size1: '[36rem]', size2: '[30rem]', size3: '[24rem]', blur: 'blur-[70px]' },
      twilight: { opacity1: 0.65, opacity2: 0.55, opacity3: 0.45, size1: '[40rem]', size2: '[34rem]', size3: '[28rem]', blur: 'blur-[80px]' },
      crimson: { opacity1: 0.6, opacity2: 0.5, opacity3: 0.4, size1: '[38rem]', size2: '[32rem]', size3: '[26rem]', blur: 'blur-[75px]' },
      bronzed: { opacity1: 0.55, opacity2: 0.5, opacity3: 0.4, size1: '[36rem]', size2: '[30rem]', size3: '[24rem]', blur: 'blur-[70px]' },
      forest: { opacity1: 0.55, opacity2: 0.5, opacity3: 0.4, size1: '[36rem]', size2: '[30rem]', size3: '[24rem]', blur: 'blur-[70px]' },
      ocean: { opacity1: 0.6, opacity2: 0.5, opacity3: 0.4, size1: '[38rem]', size2: '[32rem]', size3: '[26rem]', blur: 'blur-[75px]' },
      aurora: { opacity1: 0.7, opacity2: 0.6, opacity3: 0.5, size1: '[42rem]', size2: '[36rem]', size3: '[30rem]', blur: 'blur-[85px]' },
    };
    const auraConfig = moodAuraConfig[moodId] || moodAuraConfig.twilight;

    // Safari/iOS optimized version - no blur, simpler animations, increased size and opacity
    if (isSafari) {
      return (
        <>
          <div className="fixed inset-0" style={{ background: `linear-gradient(135deg, ${bgColors[0]} 0%, ${bgColors[1]} 50%, ${bgColors[2]} 100%)` }} />
          <div className="fixed inset-0 overflow-hidden" key="aura-container-safari">
            <div
              key="blob-safari-1"
              className={`absolute w-[32rem] sm:w-${auraConfig.size1} h-[32rem] sm:h-${auraConfig.size1} rounded-full`}
              style={{
                ...positions.blob1,
                background: `radial-gradient(circle, ${color1} 0%, ${color1}90 25%, ${color1}40 50%, transparent 70%)`,
                opacity: auraConfig.opacity1,
                willChange: 'transform',
                animation: `blob-safari-1 30s ease-in-out infinite`,
                animationDelay: `${blobSafari1Delay}s`,
              }}
            />
            <div
              key="blob-safari-2"
              className={`absolute w-[28rem] sm:w-${auraConfig.size2} h-[28rem] sm:h-${auraConfig.size2} rounded-full`}
              style={{
                ...positions.blob2,
                background: `radial-gradient(circle, ${color2} 0%, ${color2}90 25%, ${color2}40 50%, transparent 70%)`,
                opacity: auraConfig.opacity2,
                willChange: 'transform',
                animation: `blob-safari-2 35s ease-in-out infinite`,
                animationDelay: `${blobSafari2Delay}s`,
              }}
            />
            {/* Third blob for all moods - adds depth */}
            <div
              key="blob-safari-3"
              className={`absolute w-[24rem] sm:w-${auraConfig.size3} h-[24rem] sm:h-${auraConfig.size3} rounded-full`}
              style={{
                ...positions.blob3,
                background: isRainbow
                  ? 'radial-gradient(circle, #00ff88 0%, #00ff8890 25%, #00ff8840 50%, transparent 70%)'
                  : `radial-gradient(circle, ${color1}cc 0%, ${color2}80 30%, transparent 65%)`,
                opacity: auraConfig.opacity3,
                willChange: 'transform',
                animation: `blob-safari-3 32s ease-in-out infinite`,
                animationDelay: `${blobSafari3Delay}s`,
              }}
            />
          </div>
        </>
      );
    }

    // Chrome/Firefox version - full effects with premium large auras and parallax layers
    return (
      <>
        <div className="fixed inset-0 transition-all duration-1000 ease-in-out" style={{ background: `linear-gradient(135deg, ${bgColors[0]} 0%, ${bgColors[1]} 50%, ${bgColors[2]} 100%)` }} />

        {/* Parallax Layer 1 - Far back, slow movement */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none parallax-layer-1">
          <div className="absolute w-[60rem] h-[60rem] rounded-full opacity-[0.08]" style={{ top: '-20%', left: '-20%', background: `radial-gradient(circle, ${color1}40 0%, transparent 70%)`, animation: 'parallax-drift-slow 40s ease-in-out infinite' }} />
          <div className="absolute w-[50rem] h-[50rem] rounded-full opacity-[0.06]" style={{ bottom: '-30%', right: '-20%', background: `radial-gradient(circle, ${color2}40 0%, transparent 70%)`, animation: 'parallax-drift-slow 45s ease-in-out infinite reverse' }} />
        </div>

        {/* Parallax Layer 2 - Mid layer, medium movement (only on preview) */}
        {showParticles && (
          <div className="fixed inset-0 overflow-hidden pointer-events-none parallax-layer-2">
            <div className="absolute w-4 h-4 rounded-full bg-white/20" style={{ top: '15%', left: '20%', animation: 'parallax-float-med 8s ease-in-out infinite' }} />
            <div className="absolute w-3 h-3 rounded-full bg-white/15" style={{ top: '60%', right: '15%', animation: 'parallax-float-med 10s ease-in-out infinite 2s' }} />
            <div className="absolute w-2 h-2 rounded-full bg-white/10" style={{ top: '35%', right: '30%', animation: 'parallax-float-med 12s ease-in-out infinite 4s' }} />
            <div className="absolute w-5 h-5 rounded-full bg-white/10" style={{ bottom: '25%', left: '15%', animation: 'parallax-float-med 9s ease-in-out infinite 1s' }} />
          </div>
        )}

        {/* Main aura container */}
        <div className="fixed inset-0 overflow-hidden" key="aura-container-chrome">
          <div
            key="blob-chrome-1"
            className={`absolute w-[32rem] sm:w-${auraConfig.size1} h-[32rem] sm:h-${auraConfig.size1} rounded-full mix-blend-screen filter ${auraConfig.blur}`}
            style={{
              ...positions.blob1,
              background: `linear-gradient(135deg, ${color1} 0%, ${color2} 100%)`,
              opacity: auraConfig.opacity1,
              willChange: 'transform',
              animation: `blob1 12s ease-in-out infinite`,
              animationDelay: `${blob1Delay}s`,
            }}
          />
          <div
            key="blob-chrome-2"
            className={`absolute w-[28rem] sm:w-${auraConfig.size2} h-[28rem] sm:h-${auraConfig.size2} rounded-full mix-blend-screen filter ${auraConfig.blur}`}
            style={{
              ...positions.blob2,
              background: `linear-gradient(135deg, ${color3} 0%, ${color4} 100%)`,
              opacity: auraConfig.opacity2,
              willChange: 'transform',
              animation: `blob2 15s ease-in-out infinite`,
              animationDelay: `${blob2Delay}s`,
            }}
          />
          {/* Third blob for all moods - adds premium depth */}
          <div
            key="blob-chrome-3"
            className={`absolute w-[24rem] sm:w-${auraConfig.size3} h-[24rem] sm:h-${auraConfig.size3} rounded-full mix-blend-screen filter ${auraConfig.blur}`}
            style={{
              ...positions.blob3,
              background: isRainbow
                ? 'linear-gradient(135deg, #00ff88 0%, #ff8c00 100%)'
                : `linear-gradient(135deg, ${color1}dd 0%, ${color2}bb 100%)`,
              opacity: auraConfig.opacity3,
              willChange: 'transform',
              animation: `blob3 13s ease-in-out infinite`,
              animationDelay: `${blob3Delay}s`,
            }}
          />
        </div>

        {/* Parallax Layer 3 - Front layer, fast movement (foreground particles - only on preview) */}
        {showParticles && (
          <div className="fixed inset-0 overflow-hidden pointer-events-none parallax-layer-3">
            <div className="absolute w-1 h-1 rounded-full bg-white/30" style={{ top: '10%', left: '40%', animation: 'parallax-twinkle 3s ease-in-out infinite' }} />
            <div className="absolute w-1 h-1 rounded-full bg-white/25" style={{ top: '70%', left: '60%', animation: 'parallax-twinkle 4s ease-in-out infinite 1s' }} />
            <div className="absolute w-1 h-1 rounded-full bg-white/20" style={{ top: '40%', right: '20%', animation: 'parallax-twinkle 3.5s ease-in-out infinite 0.5s' }} />
            <div className="absolute w-1 h-1 rounded-full bg-white/25" style={{ bottom: '30%', left: '30%', animation: 'parallax-twinkle 4.5s ease-in-out infinite 2s' }} />
          </div>
        )}

        <style>{`
          @keyframes parallax-drift-slow {
            0%, 100% { transform: translate(0, 0) scale(1); }
            50% { transform: translate(5%, 3%) scale(1.05); }
          }
          @keyframes parallax-float-med {
            0%, 100% { transform: translateY(0) translateX(0); opacity: 0.15; }
            50% { transform: translateY(-20px) translateX(10px); opacity: 0.3; }
          }
          @keyframes parallax-twinkle {
            0%, 100% { opacity: 0.2; transform: scale(1); }
            50% { opacity: 0.6; transform: scale(1.5); }
          }
        `}</style>
      </>
    );
  };

  const getDecorativeShapes = (index) => {
    // Intentional shape pairing: hollow + filled, large + small, opposite corners with subtle animation
    const shapes = [
      <><div className="absolute top-8 right-8 w-20 h-20 border-4 border-white/30 rounded-full animate-float-shape-1" /><div className="absolute bottom-8 left-8 w-16 h-16 bg-white/20 rotate-45 animate-float-shape-2" /><div className="absolute top-1/3 left-6 w-8 h-8 border-2 border-white/20 rounded-full animate-float-shape-3" /></>,
      <><div className="absolute top-10 left-10 w-24 h-24 border-4 border-white/30 rounded-full animate-float-shape-2" /><div className="absolute bottom-10 right-10 w-14 h-14 bg-white/20 rounded-full animate-float-shape-1" /><div className="absolute bottom-1/4 right-6 w-10 h-10 border-2 border-white/20 rotate-45 animate-float-shape-3" /></>,
      <><div className="absolute top-8 right-8 w-18 h-18 bg-white/20 rounded-lg rotate-12 animate-float-shape-3" /><div className="absolute bottom-8 left-8 w-16 h-16 border-4 border-white/30 rotate-45 animate-float-shape-1" /><div className="absolute top-1/2 right-4 w-6 h-6 bg-white/15 rounded-full animate-float-shape-2" /></>,
      <><div className="absolute top-6 left-1/4 w-12 h-12 border-3 border-white/25 rounded-full animate-float-shape-1" /><div className="absolute bottom-6 right-1/4 w-20 h-20 border-4 border-white/30 rotate-45 animate-float-shape-2" /><div className="absolute top-1/3 right-8 w-10 h-10 bg-white/15 rounded-lg animate-float-shape-3" /></>,
      <><div className="absolute bottom-12 left-6 w-16 h-16 bg-white/20 rounded-full animate-float-shape-2" /><div className="absolute top-12 right-6 w-14 h-14 border-4 border-white/30 rotate-12 animate-float-shape-1" /><div className="absolute bottom-1/3 right-1/4 w-8 h-8 border-2 border-white/20 rounded-full animate-float-shape-3" /></>
    ];
    return (
      <>
        {shapes[index % shapes.length]}
        <style>{`
          @keyframes float-shape-1 { 0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-8px) rotate(3deg); } }
          @keyframes float-shape-2 { 0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(6px) rotate(-2deg); } }
          @keyframes float-shape-3 { 0%, 100% { transform: translateY(0) scale(1); } 50% { transform: translateY(-4px) scale(1.05); } }
          .animate-float-shape-1 { animation: float-shape-1 6s ease-in-out infinite; }
          .animate-float-shape-2 { animation: float-shape-2 8s ease-in-out infinite 1s; }
          .animate-float-shape-3 { animation: float-shape-3 7s ease-in-out infinite 0.5s; }
        `}</style>
      </>
    );
  };

  const NoiseOverlay = () => {
    // High-quality static SVG noise - finer grain with higher frequency and more octaves
    return (
      <div
        className="fixed inset-0 opacity-[0.2] pointer-events-none z-[1]"
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 512 512\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'5\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")',
          backgroundSize: '512px 512px'
        }}
      />
    );
  };

  const getSlideAnimation = () => {
    if (!isAnimating) {
      // Don't animate in if we just finished a transition (prevents double animation)
      return '';
    }
    // Don't use slide animations during impact or drumroll - they have their own visuals
    if (activeTransition === 'impact' || activeTransition === 'drumroll') return '';

    // Get or assign a transition style for this slide (randomly alternate between 3D slide and morph)
    const transitionStyle = slideTransitionStyle[currentSlide] ?? (currentSlide % 3); // 0, 1 = 3D, 2 = morph
    if (slideTransitionStyle[currentSlide] === undefined) {
      setSlideTransitionStyle(prev => ({ ...prev, [currentSlide]: transitionStyle }));
    }

    // Use morph dissolve for every 3rd slide, 3D slide for others
    if (transitionStyle === 2) {
      return 'animate-morph-out';
    }
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
      <form onSubmit={handleSubmit} className="w-full max-w-xs px-4" onClick={e => e.stopPropagation()} onTouchStart={e => e.stopPropagation()}>
        <input
          ref={inputRef}
          type="email"
          inputMode="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onFocus={(e) => e.target.scrollIntoView({ behavior: 'smooth', block: 'center' })}
          placeholder="Enter your email"
          className="w-full px-4 py-3 rounded-xl bg-gray-800/90 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 mb-3 text-sm will-change-transform"
          style={{ fontSize: '16px' }} /* Prevents iOS zoom on focus */
          required
          autoComplete="email"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
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
    // Track animations - only animate on first visit or explicit navigation back
    const shouldAnimate = !homeAnimationsPlayed.current;

    // Mark animations as played after component mounts
    useEffect(() => {
      if (!homeAnimationsPlayed.current) {
        // Small delay to ensure animations complete before marking as played
        const timer = setTimeout(() => {
          homeAnimationsPlayed.current = true;
        }, 1500);
        return () => clearTimeout(timer);
      }
    }, []);

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
      'Analytics dashboard',
      'Personalized insights'
    ];

    return (
      <div className="min-h-screen relative overflow-hidden" style={safariColorBoostStyle}>
        <DynamicBackground moodId="twilight" />
        <NoiseOverlay forceShow={true} />

        {/* Auth Header */}
        {!authLoading && (
          <div className="fixed top-4 right-4 z-50">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowAccountMenu(!showAccountMenu)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-full border border-white/20 hover:bg-white/20 transition-all ${isSafari ? 'bg-gray-900/80' : 'bg-white/10 backdrop-blur-sm'}`}
                >
                  <img src={user.picture} alt="" className="w-6 h-6 rounded-full" />
                  <span className="text-white text-sm hidden sm:inline">{user.name?.split(' ')[0]}</span>
                  {user.tier === 'premium' && <Crown size={12} className="text-yellow-400" />}
                </button>
                {showAccountMenu && (
                  <AccountMenu user={user} onClose={() => setShowAccountMenu(false)} />
                )}
              </div>
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                className={`px-4 py-2 rounded-full border border-white/20 text-white text-sm hover:bg-white/20 transition-all ${isSafari ? 'bg-gray-900/80' : 'bg-white/10 backdrop-blur-sm'}`}
              >
                Sign In
              </button>
            )}
          </div>
        )}

        {/* Floating aura orbs for depth - more noticeable movement */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute w-[600px] h-[600px] rounded-full blur-[150px] landing-aura-1 opacity-25"
            style={{ background: 'radial-gradient(circle, rgba(139, 92, 246, 0.7) 0%, transparent 70%)', top: '-15%', left: '-15%' }} />
          <div className="absolute w-[500px] h-[500px] rounded-full blur-[130px] landing-aura-2 opacity-20"
            style={{ background: 'radial-gradient(circle, rgba(236, 72, 153, 0.6) 0%, transparent 70%)', bottom: '-10%', right: '-10%' }} />
          <div className="absolute w-[400px] h-[400px] rounded-full blur-[100px] landing-aura-3 opacity-15"
            style={{ background: 'radial-gradient(circle, rgba(59, 130, 246, 0.6) 0%, transparent 70%)', top: '35%', left: '55%' }} />
          <div className="absolute w-[350px] h-[350px] rounded-full blur-[90px] landing-aura-4 opacity-12"
            style={{ background: 'radial-gradient(circle, rgba(168, 85, 247, 0.5) 0%, transparent 70%)', top: '60%', left: '20%' }} />
        </div>

        <div className="relative z-10 min-h-screen flex flex-col">
          {/* Header with Logo */}
          <header className="pt-8 pb-2 px-6 text-center">
            <div className="relative inline-block mx-auto">
              {/* Glow behind logo */}
              <div className="absolute inset-0 w-20 h-20 sm:w-28 sm:h-28 rounded-full blur-2xl bg-purple-500/30 animate-pulse-slow" />
              {/* Logo with bounce animation - only on first visit */}
              <img src="/MyWrap.png" alt="MyWrap" className={`relative w-20 h-20 sm:w-28 sm:h-28 object-contain drop-shadow-2xl ${shouldAnimate ? 'animate-logo-bounce' : ''}`} />
            </div>
            <p className={`text-white/70 text-[10px] sm:text-xs font-medium uppercase tracking-widest mt-1 ${shouldAnimate ? 'animate-fade-in-up' : ''}`} style={shouldAnimate ? { animationDelay: '0.3s' } : { opacity: 1 }}>Your moments, wrapped up.</p>

            {/* What is a Wrapped? - with typewriter effect */}
            <div className={`mt-6 flex items-start justify-center gap-1.5 text-white/60 text-sm max-w-md mx-auto ${shouldAnimate ? 'animate-fade-in-up' : ''}`} style={shouldAnimate ? { animationDelay: '0.5s' } : { opacity: 1 }}>
              <p className="text-center">
                <TypewriterText />
              </p>
            </div>
          </header>

          {/* Main Content - Two Cards */}
          <main className="flex-1 flex items-center justify-center px-4 sm:px-8 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl w-full">

              {/* Wrapped Card - Active Product */}
              <div
                onClick={startCreating}
                className={`group relative rounded-3xl p-4 sm:p-6 cursor-pointer transition-all duration-500 hover:scale-[1.02] overflow-hidden ${shouldAnimate ? 'animate-fade-in-up' : ''}`}
                style={shouldAnimate ? { animationDelay: '0.6s' } : { opacity: 1 }}
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
                  <div className="flex items-center gap-3 mb-2 sm:mb-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30 group-hover:shadow-purple-500/50 transition-shadow duration-500">
                      <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white">My Wrap</h2>
                      <span className="text-[10px] sm:text-xs font-bold text-green-400 uppercase tracking-wider">Available Now</span>
                    </div>
                  </div>

                  <p className="text-white/70 mb-3 sm:mb-6 text-sm sm:text-base">Create a custom recap for your trip, fitness achievements, reading list—anything worth sharing.</p>

                  <ul className="space-y-1 sm:space-y-2 mb-3 sm:mb-6">
                    {wrappedFeatures.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-white/80 text-xs sm:text-sm">
                        <Check size={14} className="text-green-400 flex-shrink-0 sm:w-4 sm:h-4" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button with soft glow effect */}
                  <div className="inline-flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-3 bg-white/10 backdrop-blur-sm rounded-xl text-white font-bold text-sm sm:text-base transition-all duration-500 border border-white/20 group-hover:border-white/40 group-hover:bg-white/15 cta-glow">
                    <span>Start Creating</span>
                    <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform duration-300 sm:w-5 sm:h-5" />
                  </div>
                </div>
              </div>

              {/* Coming Soon Card - Productivity Tracking */}
              <div className={`group relative rounded-3xl p-4 sm:p-6 overflow-hidden ${shouldAnimate ? 'animate-fade-in-up' : ''}`} style={shouldAnimate ? { animationDelay: '0.8s' } : { opacity: 1 }}>
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
                  <div className="flex items-center gap-3 mb-2 sm:mb-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white">Wrap Up</h2>
                      <span className="text-[10px] sm:text-xs font-bold text-yellow-400 uppercase tracking-wider">Coming Soon</span>
                    </div>
                  </div>

                  <p className="text-white/70 mb-3 sm:mb-6 text-sm sm:text-base">Track your progress in real-time, get personalized insights, and automatic wraps generated for you.</p>

                  <ul className="space-y-1 sm:space-y-2 mb-3 sm:mb-6">
                    {comingSoonFeatures.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-white/60 text-xs sm:text-sm">
                        <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full border border-white/30 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <div className="flex items-center gap-2 text-white/50 font-bold text-sm">
                    <Lock size={14} className="sm:w-4 sm:h-4" />
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

          /* Landing page aura animations - more noticeable movement */
          @keyframes landing-aura-1 {
            0%, 100% { transform: translate(0, 0) scale(1); }
            20% { transform: translate(80px, -50px) scale(1.08); }
            40% { transform: translate(40px, 40px) scale(0.95); }
            60% { transform: translate(-60px, 20px) scale(1.05); }
            80% { transform: translate(-30px, -40px) scale(0.98); }
          }
          @keyframes landing-aura-2 {
            0%, 100% { transform: translate(0, 0) scale(1); }
            25% { transform: translate(-70px, 60px) scale(1.1); }
            50% { transform: translate(50px, 30px) scale(0.92); }
            75% { transform: translate(30px, -50px) scale(1.04); }
          }
          @keyframes landing-aura-3 {
            0%, 100% { transform: translate(0, 0) scale(1); }
            33% { transform: translate(50px, -70px) scale(1.06); }
            66% { transform: translate(-80px, 40px) scale(0.94); }
          }
          @keyframes landing-aura-4 {
            0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.12; }
            50% { transform: translate(-40px, -60px) scale(1.12); opacity: 0.18; }
          }
          .landing-aura-1 { animation: landing-aura-1 30s ease-in-out infinite; }
          .landing-aura-2 { animation: landing-aura-2 35s ease-in-out infinite; }
          .landing-aura-3 { animation: landing-aura-3 25s ease-in-out infinite; }
          .landing-aura-4 { animation: landing-aura-4 20s ease-in-out infinite; }

          /* Floating aura animations (legacy) */
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

          /* Smooth continuous aura animations - won't restart on interaction */
          @keyframes aura-float-1 {
            0%, 100% { transform: translate(0, 0) scale(1); }
            20% { transform: translate(60px, -40px) scale(1.05); }
            40% { transform: translate(30px, 30px) scale(0.98); }
            60% { transform: translate(-50px, 10px) scale(1.03); }
            80% { transform: translate(-20px, -50px) scale(0.97); }
          }
          @keyframes aura-float-2 {
            0%, 100% { transform: translate(0, 0) scale(1); }
            25% { transform: translate(-40px, 50px) scale(1.04); }
            50% { transform: translate(50px, 20px) scale(0.96); }
            75% { transform: translate(20px, -40px) scale(1.02); }
          }
          @keyframes aura-float-3 {
            0%, 100% { transform: translate(0, 0) scale(1); }
            33% { transform: translate(30px, -60px) scale(1.06); }
            66% { transform: translate(-60px, 30px) scale(0.94); }
          }
          @keyframes aura-pulse {
            0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.06; }
            50% { transform: translate(-50%, -50%) scale(1.2); opacity: 0.09; }
          }
          .aura-float-1 { animation: aura-float-1 45s ease-in-out infinite; }
          .aura-float-2 { animation: aura-float-2 55s ease-in-out infinite; }
          .aura-float-3 { animation: aura-float-3 35s ease-in-out infinite; }
          .aura-pulse { animation: aura-pulse 10s ease-in-out infinite; }

          /* Form card subtle glow */
          .form-card-glow {
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 80px rgba(139, 92, 246, 0.03);
          }

          /* Form entrance animation - more prominent slide-in */
          @keyframes form-entrance {
            0% { opacity: 0; transform: translateY(60px) scale(0.95); filter: blur(4px); }
            60% { opacity: 0.9; transform: translateY(-5px) scale(1.01); filter: blur(0); }
            100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
          }
          .animate-form-entrance { animation: form-entrance 1s cubic-bezier(0.16, 1, 0.3, 1) forwards; }

          /* Title slide-in animation */
          @keyframes title-slide-in {
            0% { opacity: 0; transform: translateY(-30px) scale(0.95); filter: blur(6px); }
            60% { opacity: 0.9; transform: translateY(4px) scale(1.01); filter: blur(0); }
            100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
          }
          .animate-title-slide-in { animation: title-slide-in 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.3s forwards; opacity: 0; }

          /* Subtitle slide-in animation */
          @keyframes subtitle-slide-in {
            0% { opacity: 0; transform: translateY(15px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          .animate-subtitle-slide-in { animation: subtitle-slide-in 0.6s ease-out 0.5s forwards; opacity: 0; }

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
      <div className="min-h-screen relative flex items-center justify-center" style={safariColorBoostStyle}>
        <DynamicBackground moodId="twilight" />
        <NoiseOverlay />
        <div className="relative z-10 text-center">
          <Loader2 size={48} className="text-white animate-spin mx-auto mb-4" />
          <p className="text-white/70 text-lg font-medium">Loading wrap...</p>
        </div>
      </div>
    );
  }

  // Loading screen during wrap generation (mobile performance fix)
  if (isGeneratingWrap) {
    return (
      <div className="min-h-screen relative" style={safariColorBoostStyle}>
        <DynamicBackground moodId={selectedMood} />
        <NoiseOverlay />
        <LoadingScreen message={loadingMessage} />
      </div>
    );
  }

  // Error screen when wrap not found
  if (loadError) {
    return (
      <div className="min-h-screen relative flex items-center justify-center" style={safariColorBoostStyle}>
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

  // My Wraps page - user's saved wraps
  if (step === 'my-wraps') {
    const moodColors = moods.find(m => m.id === 'twilight')?.colors || ['#7c3aed', '#c4b5fd'];

    const handleDeleteWrap = async (wrapId) => {
      if (!confirm('Are you sure you want to delete this wrap?')) return;
      try {
        const res = await fetch(`/api/wraps/${wrapId}/delete`, {
          method: 'DELETE',
          credentials: 'include',
        });
        if (res.ok) {
          setMyWraps(prev => prev.filter(w => w.id !== wrapId));
          setUpgradeInfo(prev => ({ ...prev, count: prev.count - 1 }));
        }
      } catch (err) {
        console.error('Delete failed:', err);
      }
    };

    const handleViewWrap = (wrapId) => {
      window.location.href = `/w/${wrapId}`;
    };

    return (
      <div className="min-h-screen relative" style={safariColorBoostStyle}>
        <DynamicBackground moodId="twilight" />
        <NoiseOverlay />

        <div className="relative z-10 max-w-4xl mx-auto px-4 py-8 sm:py-12">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => setStep('home')}
              className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Back</span>
            </button>

            {user?.tier === 'free' && (
              <button
                onClick={() => setShowUpgradeModal(true)}
                className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-black rounded-full text-sm font-bold hover:opacity-90 transition-all flex items-center gap-2"
              >
                <Crown size={14} />
                Upgrade
              </button>
            )}
          </div>

          {/* Title */}
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">My Wraps</h1>
            <p className="text-white/60">
              {user?.tier === 'free'
                ? `${upgradeInfo.count} of ${upgradeInfo.limit} wraps saved`
                : `${myWraps.length} wraps saved`
              }
            </p>
          </div>

          {/* Wraps Grid */}
          {myWrapsLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="animate-spin text-white" size={32} />
            </div>
          ) : myWraps.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4">
                <Sparkles size={32} className="text-white/40" />
              </div>
              <p className="text-white/50 mb-6">You haven't saved any wraps yet.</p>
              <button
                onClick={() => setStep('home')}
                className="px-6 py-3 bg-white text-black rounded-full font-bold hover:bg-white/90 transition-all"
              >
                Create Your First Wrap
              </button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {myWraps.map(wrap => {
                const wrapMood = moods.find(m => m.id === wrap.selectedMood) || moods[0];
                return (
                  <div
                    key={wrap.id}
                    className={`group relative rounded-2xl p-5 border border-white/10 transition-all hover:border-white/20 hover:scale-[1.02] cursor-pointer ${isSafari ? 'bg-gray-900/80' : 'bg-white/5 backdrop-blur-sm'}`}
                    onClick={() => handleViewWrap(wrap.id)}
                  >
                    {/* Mood accent */}
                    <div
                      className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
                      style={{ background: `linear-gradient(to right, ${wrapMood.colors[0]}, ${wrapMood.colors[1] || wrapMood.colors[0]})` }}
                    />

                    {/* Cover image or gradient */}
                    <div className="h-32 rounded-xl mb-4 overflow-hidden">
                      {wrap.coverImage ? (
                        <img src={wrap.coverImage} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div
                          className="w-full h-full"
                          style={{ background: `linear-gradient(135deg, ${wrapMood.bgColors[0]}, ${wrapMood.bgColors[1]})` }}
                        />
                      )}
                    </div>

                    {/* Content */}
                    <h3 className="text-lg font-bold text-white mb-1 truncate">{wrap.title}</h3>
                    {wrap.dateRange && (
                      <p className="text-white/50 text-sm mb-3">{wrap.dateRange}</p>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="text-white/40 text-xs">
                        {new Date(wrap.createdAt).toLocaleDateString()}
                      </span>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteWrap(wrap.id); }}
                        className="p-2 text-white/40 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modals */}
        {showUpgradeModal && (
          <UpgradeModal
            onClose={() => setShowUpgradeModal(false)}
            currentCount={upgradeInfo.count}
            limit={upgradeInfo.limit}
          />
        )}
      </div>
    );
  }

  // Home page
  if (step === 'home') {
    return (
      <>
        <HomePage />
        {/* Auth Modals */}
        {showLoginModal && (
          <LoginModal onClose={() => setShowLoginModal(false)} />
        )}
        {showUpgradeModal && (
          <UpgradeModal
            onClose={() => setShowUpgradeModal(false)}
            currentCount={upgradeInfo.count}
            limit={upgradeInfo.limit}
          />
        )}
      </>
    );
  }

  // CAW (Create a Wrapped) - Slide-based builder
  // IMPORTANT: All slide content is rendered inline to prevent focus loss on re-renders
  if (step === 'input') {
    const moodColors = moods.find(m => m.id === selectedMood)?.colors || ['#7c3aed', '#c4b5fd'];
    const moodBgColors = moods.find(m => m.id === selectedMood)?.bgColors || ['#2e1065', '#3b0764', '#4a044e'];

    return (
      <div className="min-h-screen relative transition-all duration-1000" style={safariColorBoostStyle}>
        {/* Original DynamicBackground - mood-based aurora gradients */}
        <DynamicBackground moodId={selectedMood} />
        <NoiseOverlay />

        {/* Mobile depth enhancement - extra layering for Safari/iOS */}
        {isSafari && (
          <>
            <div className="fixed inset-0 pointer-events-none z-[1]" style={{
              background: `
                radial-gradient(ellipse 120% 80% at 20% 10%, ${moodColors[0]}20 0%, transparent 50%),
                radial-gradient(ellipse 100% 100% at 80% 90%, ${moodColors[1]}15 0%, transparent 50%),
                radial-gradient(ellipse 80% 60% at 50% 50%, rgba(255, 255, 255, 0.03) 0%, transparent 40%)
              `
            }} />
            <div className="fixed inset-0 pointer-events-none z-[1] mobile-shimmer opacity-[0.06]" />
          </>
        )}

        {/* Ambient floating aura orbs - continuous smooth animation */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute w-[700px] h-[700px] rounded-full blur-[180px] aura-float-1 opacity-[0.12]"
            style={{ background: `radial-gradient(circle, ${moodColors[0]} 0%, transparent 70%)`, top: '-25%', left: '-20%' }} />
          <div className="absolute w-[600px] h-[600px] rounded-full blur-[150px] aura-float-2 opacity-[0.10]"
            style={{ background: `radial-gradient(circle, ${moodColors[1]} 0%, transparent 70%)`, bottom: '-20%', right: '-15%' }} />
          <div className="absolute w-[400px] h-[400px] rounded-full blur-[100px] aura-float-3 opacity-[0.08]"
            style={{ background: `radial-gradient(circle, ${moodColors[0]}80 0%, transparent 70%)`, top: '40%', right: '20%' }} />
          <div className="absolute w-[500px] h-[500px] rounded-full blur-[120px] aura-pulse opacity-[0.06]"
            style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.5) 0%, transparent 70%)', top: '30%', left: '40%' }} />
        </div>

        {/* Error notification */}
        {imageFormatError && (
          <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-[100] animate-fade-in-down">
            <div className="bg-red-500/90 backdrop-blur-sm text-white px-6 py-3 rounded-xl shadow-2xl border border-red-400/50 flex items-center gap-3">
              <X size={18} />
              <span className="font-medium">{imageFormatError}</span>
              <button onClick={() => setImageFormatError(null)} className="ml-2 hover:bg-white/20 rounded-full p-1"><X size={14} /></button>
            </div>
          </div>
        )}

        {/* Template dialog - only shows when user has data (via handleTemplateClick) */}
        {showTemplateDialog && (() => {
          const template = templates.find(t => t.id === showTemplateDialog);
          if (!template) return null;
          const handleAdd = () => {
            const newStats = template.stats.map(s => ({ ...s, image: null, note: '' }));
            const newMoments = template.moments ? template.moments.map(m => ({ ...m })) : [];
            // Keep existing stats/moments with data, add new template items
            const existingStatsWithData = stats.filter(s => s.value.trim() || s.image);
            const existingMomentsWithData = moments.filter(m => m.image);
            setStats([...existingStatsWithData, ...newStats]);
            setMoments([...existingMomentsWithData, ...newMoments]);
            // Rebuild content order: existing items first, then new template items
            const newContentOrder = [
              ...existingStatsWithData.map((_, i) => ({ type: 'stat', index: i })),
              ...existingMomentsWithData.map((_, i) => ({ type: 'moment', index: i })),
              ...newStats.map((_, i) => ({ type: 'stat', index: existingStatsWithData.length + i })),
              ...newMoments.map((_, i) => ({ type: 'moment', index: existingMomentsWithData.length + i }))
            ];
            setContentOrder(newContentOrder);
            setSelectedTemplate(showTemplateDialog);
            setTransitions({}); // Clear transitions when adding template
            setShowTemplateDialog(null);
          };
          // Replace All: uses applyTemplate which does NOT change mood
          const handleReplace = () => { applyTemplate(showTemplateDialog); setShowTemplateDialog(null); };
          return (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowTemplateDialog(null)}>
              <div className="bg-gray-900/95 border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold text-white mb-2">Apply {template.name} Template?</h3>
                <p className="text-white/60 mb-6">You have existing content. What would you like to do?</p>
                <div className="space-y-3">
                  <button onClick={handleAdd} className="w-full py-3 px-4 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/30 rounded-xl text-white font-medium transition-all">Add to Existing</button>
                  <button onClick={handleReplace} className="w-full py-3 px-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white font-medium transition-all">Replace All</button>
                  <button onClick={() => setShowTemplateDialog(null)} className="w-full py-3 px-4 text-white/60 hover:text-white transition-all">Cancel</button>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Transition picker modal */}
        {showTransitionPicker !== null && (
          <TransitionPickerModal contentIndex={showTransitionPicker} onSelect={setTransitionAfterContent} onClose={() => setShowTransitionPicker(null)} />
        )}

        {/* Music toggle */}
        {audioRef.current && (
          <button onClick={toggleMusic} className="fixed top-4 sm:top-6 right-4 sm:right-6 p-2 sm:p-3 bg-white/10 hover:bg-white/20 hover:scale-110 rounded-full text-white transition-all duration-300 backdrop-blur-sm border-2 border-white/20 z-50 group">
            {audioPlaying ? <Volume2 size={18} className="group-hover:animate-pulse" /> : <VolumeX size={18} />}
          </button>
        )}

        {/* Back to home button */}
        <button
          onClick={() => setStep('home')}
          className={`fixed top-4 sm:top-6 left-4 sm:left-6 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all duration-300 backdrop-blur-sm border-2 border-white/20 z-50 flex items-center justify-center
            ${isScrolled ? 'opacity-0 pointer-events-none -translate-y-2' : 'opacity-100 translate-y-0'}`}
        >
          <ArrowLeft size={20} className="sm:w-[18px] sm:h-[18px]" />
        </button>

        {/* Help/Tour button */}
        <button
          onClick={() => setShowOnboarding(true)}
          className={`fixed top-4 sm:top-6 left-16 sm:left-20 px-3 py-2 sm:py-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all duration-300 backdrop-blur-sm border-2 border-white/20 z-50 flex items-center gap-2 text-sm font-medium
            ${isScrolled ? 'opacity-0 pointer-events-none -translate-y-2' : 'opacity-100 translate-y-0'}`}
        >
          <Sparkles size={16} />
          <span className="hidden sm:inline">Tour</span>
        </button>

        {/* Form container with original frame and glow - visible during and after tour */}
        {showFormAfterOnboarding && (
          <div className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
            <div className={`backdrop-blur-2xl rounded-3xl border border-white/[0.08] shadow-2xl overflow-hidden relative form-card-glow animate-form-entrance`} style={{
              background: `linear-gradient(135deg, ${moodBgColors[0]}30 0%, ${moodBgColors[1]}20 50%, ${moodBgColors[2]}15 100%)`
            }}>
              {/* Subtle inner glow */}
              <div className="absolute inset-0 rounded-3xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] pointer-events-none" />

              {/* Header with progress dots */}
              <div className="p-6 sm:p-8 pb-4 border-b border-white/[0.06] relative">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-2 tracking-tight text-center animate-title-slide-in">Create Your Wrap</h1>
                <p className="text-white/60 text-base sm:text-lg text-center animate-subtitle-slide-in">
                  {cawSlide === 0 && "Set up your Wrapped's identity"}
                  {cawSlide === 1 && "Add your stats and moments"}
                  {cawSlide === 2 && "Add personality and polish"}
                </p>
                {/* Progress dots */}
                <div className="flex justify-center gap-3 mt-4">
                  {[0, 1, 2].map(i => (
                    <button
                      key={i}
                      onClick={() => goToCawSlide(i)}
                      className={`transition-all duration-300 ${cawSlide === i ? 'w-8 h-2 bg-white rounded-full' : 'w-2 h-2 bg-white/30 hover:bg-white/50 rounded-full'}`}
                    />
                  ))}
                </div>
              </div>

              {/* Slide content */}
              <div className="p-6 sm:p-8 pt-6">
                <div className="space-y-6 sm:space-y-8">
                  {/* SLIDE 0: Basics - Order: Title, Date Range, Mood, Cover Image */}
                  {cawSlide === 0 && (
                    <>
                      <div className="animate-section-fade-in" style={{ animationDelay: '0.2s' }}>
                        <FieldLabel required error={validationErrors.title}>Wrap Title</FieldLabel>
                        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="My Adventures" className={`w-full px-4 sm:px-5 py-3 sm:py-4 rounded-xl bg-white/[0.06] border text-white placeholder-white/40 focus:outline-none focus:bg-white/[0.08] focus:border-white/30 backdrop-blur-sm font-medium text-base sm:text-lg transition-all duration-300 shadow-[inset_0_1px_2px_rgba(0,0,0,0.1)] ${validationErrors.title ? 'border-red-500/50' : 'border-white/[0.08]'}`} />
                        {validationErrors.title && <p className="text-red-400 text-sm mt-2">Please enter a title for your Wrapped</p>}
                      </div>
                      <div className="animate-section-fade-in" style={{ animationDelay: '0.3s' }}>
                        <FieldLabel>Date Range <span className="text-white/40 font-normal normal-case">(optional)</span></FieldLabel>
                        <input type="text" value={dateRange} onChange={(e) => setDateRange(e.target.value)} placeholder="E.g., 2026 Q1, November, Fall Semester" className="w-full px-4 sm:px-5 py-3 sm:py-4 rounded-xl bg-white/[0.06] border border-white/[0.08] text-white placeholder-white/40 focus:outline-none focus:bg-white/[0.08] focus:border-white/30 backdrop-blur-sm font-medium text-base sm:text-lg transition-all duration-300 shadow-[inset_0_1px_2px_rgba(0,0,0,0.1)]" />
                      </div>
                      <div className="animate-section-fade-in" style={{ animationDelay: '0.4s' }}>
                        <FieldLabel>Choose your Wrap Mood</FieldLabel>
                        <MoodSelector selectedMood={selectedMood} onSelect={setSelectedMood} />
                      </div>
                      <div className="animate-section-fade-in" style={{ animationDelay: '0.5s' }}>
                        <FieldLabel>Cover Image <span className="text-white/40 font-normal normal-case">(optional)</span></FieldLabel>
                        <div className="flex items-center gap-4">
                          {coverImage ? (
                            <div className="relative">
                              <img src={coverImage} alt="Cover Preview" className="w-32 sm:w-40 h-20 sm:h-24 object-cover rounded-xl border border-white/[0.15]" />
                              <button onClick={() => setCoverImage(null)} className="absolute -top-2 -right-2 p-1 bg-red-500 hover:bg-red-600 rounded-full text-white transition-colors"><X size={16} /></button>
                            </div>
                          ) : (
                            <label className="flex items-center gap-2 sm:gap-3 px-4 sm:px-5 py-3 sm:py-4 bg-white/[0.06] hover:bg-white/[0.1] rounded-xl text-white/60 transition-all duration-300 border border-white/[0.08] hover:border-white/[0.15] cursor-pointer">
                              <ImagePlus size={20} />
                              <span className="font-medium text-sm sm:text-base">Upload Cover Image</span>
                              <input type="file" accept="image/*" onChange={(e) => handleCoverImageUpload(e.target.files[0])} className="hidden" />
                            </label>
                          )}
                        </div>
                      </div>
                    </>
                  )}

                  {/* SLIDE 1: Build - Unified contentOrder-based list with drag-drop */}
                  {cawSlide === 1 && (
                    <>
                      <div className="animate-section-fade-in" style={{ animationDelay: '0.1s' }}>
                        <FieldLabel>Quick Start Templates</FieldLabel>
                        <TemplateSelector selectedTemplate={selectedTemplate} onSelect={handleTemplateClick} />
                        <p className="text-white/40 text-xs mt-2 italic">Templates add suggested stats to complete.</p>
                      </div>
                      <div className="animate-section-fade-in" style={{ animationDelay: '0.2s' }}>
                        <FieldLabel required error={validationErrors.stats}>Your Content</FieldLabel>
                        {validationErrors.stats && <p className="text-red-400 text-sm mb-3">Please add at least one complete stat (label and value)</p>}
                        <p className="text-white/50 text-sm mb-1">Add <span className="text-white/70 font-medium">Stats</span> for numbers, metrics, or lists. Add <span className="text-white/70 font-medium">Moments</span> for photos, memories, or highlights.</p>
                        <p className="text-white/40 text-xs mb-3">Use ↑↓ to reorder • Add transitions between slides</p>
                        <div className="space-y-2">
                          {/* Unified content list based on contentOrder */}
                          {contentOrder.map((item, orderIndex) => {
                            const isFirst = orderIndex === 0;
                            const isLast = orderIndex === contentOrder.length - 1;
                            const isMoving = movingContentIndex === orderIndex;

                            if (item.type === 'stat') {
                              const stat = stats[item.index];
                              if (!stat) return null;
                              return (
                                <React.Fragment key={`content-${orderIndex}-stat-${item.index}`}>
                                  <div
                                    className={`relative space-y-3 p-4 pb-10 bg-white/[0.03] rounded-xl border border-white/[0.06] transition-all duration-200 hover:bg-white/[0.04] hover:border-white/[0.1] ${isMoving ? 'scale-[0.98] opacity-70' : ''}`}
                                  >
                                    {/* Up/Down reorder controls */}
                                    <div className="absolute top-2 left-2 flex flex-col gap-0.5">
                                      <button
                                        onClick={() => { setMovingContentIndex(orderIndex); moveContentUp(orderIndex); setTimeout(() => setMovingContentIndex(null), 200); }}
                                        disabled={isFirst}
                                        className={`p-1 rounded transition-all ${isFirst ? 'text-white/10 cursor-not-allowed' : 'text-white/40 hover:text-white/80 hover:bg-white/10'}`}
                                        title="Move up"
                                      >
                                        <ArrowUp size={14} />
                                      </button>
                                      <button
                                        onClick={() => { setMovingContentIndex(orderIndex); moveContentDown(orderIndex); setTimeout(() => setMovingContentIndex(null), 200); }}
                                        disabled={isLast}
                                        className={`p-1 rounded transition-all ${isLast ? 'text-white/10 cursor-not-allowed' : 'text-white/40 hover:text-white/80 hover:bg-white/10'}`}
                                        title="Move down"
                                      >
                                        <ArrowDown size={14} />
                                      </button>
                                    </div>
                                    <div className="absolute top-2 right-2 text-white/40 text-xs font-medium uppercase tracking-wide">Stat</div>
                                    <div className="flex flex-col gap-3 pt-6 pl-6 sm:pt-4 sm:pl-8">
                                      <input type="text" value={stat.label} onChange={(e) => updateStat(item.index, 'label', e.target.value)} placeholder="Stat Label (e.g., Books Read)" className={`w-full px-4 py-3 rounded-xl bg-white/[0.06] border text-white placeholder-white/40 focus:outline-none focus:bg-white/[0.08] focus:border-white/30 backdrop-blur-sm font-bold text-sm sm:text-base transition-all duration-300 shadow-[inset_0_1px_2px_rgba(0,0,0,0.1)] ${validationErrors[`stat-${item.index}-label`] ? 'border-red-500/50' : 'border-white/[0.08]'}`} style={{ fontSize: '16px' }} />
                                      <input type="text" value={stat.value} onChange={(e) => updateStat(item.index, 'value', e.target.value)} placeholder="Value (e.g., 42, Lagos, A+)" className={`w-full px-4 py-3 rounded-xl bg-white/[0.06] border text-white placeholder-white/40 focus:outline-none focus:bg-white/[0.08] focus:border-white/30 backdrop-blur-sm font-medium text-sm sm:text-base transition-all duration-300 shadow-[inset_0_1px_2px_rgba(0,0,0,0.1)] ${validationErrors[`stat-${item.index}-value`] ? 'border-red-500/50' : 'border-white/[0.08]'}`} style={{ fontSize: '16px' }} />
                                      <input type="text" value={stat.note || ''} onChange={(e) => updateStat(item.index, 'note', e.target.value)} placeholder="Extra Info (optional)" className="w-full px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.08] text-white placeholder-white/40 focus:outline-none focus:bg-white/[0.08] focus:border-white/30 backdrop-blur-sm font-medium text-sm transition-all duration-300 shadow-[inset_0_1px_2px_rgba(0,0,0,0.1)]" style={{ fontSize: '16px' }} />
                                    </div>
                                    <div className="flex items-center gap-2" title="Highlighted stats get a special golden glow and falling stars animation">
                                      <input type="checkbox" id={`highlight-${item.index}`} checked={stat.isHighlight} onChange={(e) => updateStat(item.index, 'isHighlight', e.target.checked)} className="w-5 h-5 rounded border-2 border-white/20 bg-white/10 checked:bg-yellow-400 checked:border-yellow-400 cursor-pointer" />
                                      <label htmlFor={`highlight-${item.index}`} className="text-white/80 text-sm font-medium cursor-pointer flex items-center gap-2"><Star size={16} className="text-yellow-300 fill-yellow-300" />Highlight this Stat</label>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      {stat.image ? (
                                        <div className="relative">
                                          <img src={stat.image} alt="Preview" className="w-24 sm:w-32 h-24 sm:h-32 object-cover rounded-lg border-2 border-white/20" />
                                          <button onClick={() => removeImage(item.index)} className="absolute top-1 right-1 sm:-top-2 sm:-right-2 p-1.5 sm:p-1 bg-red-500 hover:bg-red-600 rounded-full text-white transition-colors shadow-lg"><X size={14} className="sm:w-4 sm:h-4" /></button>
                                        </div>
                                      ) : (
                                        <label className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-3 bg-white/10 hover:bg-white/20 rounded-xl text-white/70 transition-colors border-2 border-white/20 cursor-pointer">
                                          <Upload size={16} />
                                          <span className="text-xs sm:text-sm font-medium">Add Image <span className="text-white/50">(optional)</span></span>
                                          <input type="file" accept="image/*" onChange={(e) => handleImageUpload(item.index, e.target.files[0])} className="hidden" />
                                        </label>
                                      )}
                                    </div>
                                    {contentOrder.length > 1 && (<button onClick={() => removeStat(item.index)} className="absolute bottom-2 right-2 p-1.5 bg-red-500/20 hover:bg-red-500/40 rounded-lg text-white/70 hover:text-white transition-colors"><Trash2 size={14} /></button>)}
                                  </div>
                                  <BuilderTransitionButton afterContentIndex={orderIndex} isLast={isLast} />
                                </React.Fragment>
                              );
                            } else if (item.type === 'moment') {
                              const moment = moments[item.index];
                              if (!moment) return null;
                              return (
                                <React.Fragment key={`content-${orderIndex}-moment-${item.index}`}>
                                  <div
                                    className={`relative p-4 pb-10 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-400/20 space-y-4 transition-all duration-200 ${isMoving ? 'scale-[0.98] opacity-70' : ''}`}
                                  >
                                    {/* Up/Down reorder controls */}
                                    <div className="absolute top-2 left-2 flex flex-col gap-0.5">
                                      <button
                                        onClick={() => { setMovingContentIndex(orderIndex); moveContentUp(orderIndex); setTimeout(() => setMovingContentIndex(null), 200); }}
                                        disabled={isFirst}
                                        className={`p-1 rounded transition-all ${isFirst ? 'text-white/10 cursor-not-allowed' : 'text-white/40 hover:text-white/80 hover:bg-white/10'}`}
                                        title="Move up"
                                      >
                                        <ArrowUp size={14} />
                                      </button>
                                      <button
                                        onClick={() => { setMovingContentIndex(orderIndex); moveContentDown(orderIndex); setTimeout(() => setMovingContentIndex(null), 200); }}
                                        disabled={isLast}
                                        className={`p-1 rounded transition-all ${isLast ? 'text-white/10 cursor-not-allowed' : 'text-white/40 hover:text-white/80 hover:bg-white/10'}`}
                                        title="Move down"
                                      >
                                        <ArrowDown size={14} />
                                      </button>
                                    </div>
                                    <div className="absolute top-2 right-2 text-purple-400/60 text-xs font-medium uppercase tracking-wide">Moment</div>
                                    <div className="flex flex-col sm:flex-row gap-4 pt-6 pl-6 sm:pt-4 sm:pl-8">
                                      {(() => {
                                        // Calculate glow style for preview (works with or without photo)
                                        const isAutoGlow = moment.glowColor === 'auto';
                                        const glowConfig = momentGlowColors.find(g => g.id === moment.glowColor) || momentGlowColors[1];
                                        const previewGlow = isAutoGlow
                                          ? (moment.extractedGlow || 'rgba(168, 85, 247, 0.5)')
                                          : glowConfig.glow;
                                        const previewBorder = isAutoGlow
                                          ? (moment.extractedColor || '#a855f7')
                                          : glowConfig.color;

                                        return moment.image ? (
                                          <div className="relative">
                                            <img
                                              src={moment.image}
                                              alt="Moment Preview"
                                              className="w-full sm:w-40 h-48 sm:h-52 object-cover rounded-xl border-2 transition-all duration-300"
                                              style={{
                                                borderColor: previewBorder,
                                                boxShadow: `0 0 20px ${previewGlow}, 0 0 40px ${previewGlow}`
                                              }}
                                            />
                                            <button onClick={() => updateMoment(item.index, 'image', null)} className="absolute top-2 right-2 p-1.5 bg-red-500 hover:bg-red-600 rounded-full text-white transition-colors shadow-lg"><X size={14} /></button>
                                          </div>
                                        ) : (
                                          <label
                                            className="flex flex-col items-center justify-center w-full sm:w-40 h-48 sm:h-52 bg-white/5 hover:bg-white/10 rounded-xl text-white/50 transition-all duration-300 border-2 border-dashed cursor-pointer"
                                            style={{
                                              borderColor: previewBorder,
                                              boxShadow: `0 0 15px ${previewGlow}, 0 0 30px ${previewGlow}`
                                            }}
                                          >
                                            <Camera size={32} className="mb-2 text-purple-400/60" />
                                            <span className="text-sm font-medium">Add Photo</span>
                                            <span className="text-xs text-white/40 mt-1">(Required)</span>
                                            <input type="file" accept="image/*" onChange={(e) => handleMomentImageUpload(item.index, e.target.files[0])} className="hidden" />
                                          </label>
                                        );
                                      })()}
                                      <div className="flex-1 space-y-3">
                                        <input type="text" value={moment.label || ''} onChange={(e) => updateMoment(item.index, 'label', e.target.value)} placeholder="A Moment Worth Remembering" className="w-full px-4 py-3 rounded-xl bg-white/10 border-2 border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400/50 backdrop-blur-sm font-medium text-sm sm:text-base" />
                                        <div>
                                          <span className="text-white/60 text-xs uppercase tracking-wide mb-2 block">Frame Glow</span>
                                          <div className="flex gap-2 flex-wrap items-center">
                                            {momentGlowColors.map(gc => {
                                              // For 'auto', show extracted color or gradient placeholder
                                              const isAuto = gc.id === 'auto';
                                              const autoColor = moment.extractedColor || '#888';
                                              const autoGlow = moment.extractedGlow || 'rgba(136, 136, 136, 0.6)';
                                              const bgStyle = isAuto
                                                ? { background: moment.image ? autoColor : 'linear-gradient(135deg, #f472b6, #22d3ee, #a78bfa)' }
                                                : { background: gc.color };
                                              const glowStyle = isAuto
                                                ? (moment.glowColor === gc.id && moment.image ? `0 0 15px ${autoGlow}` : 'none')
                                                : (moment.glowColor === gc.id ? `0 0 15px ${gc.glow}` : 'none');
                                              return (
                                                <button
                                                  key={gc.id}
                                                  onClick={() => updateMoment(item.index, 'glowColor', gc.id)}
                                                  className={`w-8 h-8 rounded-full border-2 transition-all relative ${moment.glowColor === gc.id ? 'border-white scale-110' : 'border-white/30 hover:border-white/60'}`}
                                                  style={{ ...bgStyle, boxShadow: glowStyle }}
                                                  title={isAuto ? 'Auto (from photo)' : gc.name}
                                                >
                                                  {isAuto && <span className="absolute inset-0 flex items-center justify-center text-white drop-shadow-md"><Sparkles size={12} /></span>}
                                                </button>
                                              );
                                            })}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    <button onClick={() => removeMoment(item.index)} className="absolute bottom-2 right-2 p-1.5 bg-red-500/20 hover:bg-red-500/40 rounded-lg text-white/70 hover:text-white transition-colors"><Trash2 size={14} /></button>
                                  </div>
                                  <BuilderTransitionButton afterContentIndex={orderIndex} isLast={isLast} />
                                </React.Fragment>
                              );
                            }
                            return null;
                          })}
                          <div className="flex gap-3 mt-4">
                            <button onClick={addStat} className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-white/[0.06] hover:bg-white/[0.1] rounded-xl text-white transition-all duration-300 border border-white/[0.08] hover:border-white/20 font-bold hover:shadow-[0_0_20px_rgba(255,255,255,0.05)]"><Plus size={20} />Add Stat</button>
                            <button onClick={addMoment} className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-purple-500/[0.08] hover:bg-purple-500/[0.15] rounded-xl text-white transition-all duration-300 border border-purple-400/[0.15] hover:border-purple-400/30 font-bold hover:shadow-[0_0_20px_rgba(139,92,246,0.1)]"><Camera size={20} />Add Moment</button>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {/* SLIDE 2: Finishing Touches */}
                  {cawSlide === 2 && (
                    <>
                      <div className="animate-section-fade-in overflow-visible" style={{ animationDelay: '0.1s', willChange: 'opacity, transform', position: 'relative', zIndex: showEmojiPicker !== null ? 50 : 1 }}>
                        <FieldLabel>Add a Badge to your Wrap</FieldLabel>
                        <p className="text-white/50 text-sm mb-3">Celebrate achievements with custom badges that appear as special slides.</p>
                        <div className="space-y-4 overflow-visible">
                          {badges.map((badge, index) => (
                            <div key={index} className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-3 overflow-visible relative" style={{ zIndex: showEmojiPicker === index ? 100 : 1 }}>
                              <div className="flex gap-3 items-start overflow-visible">
                                <div className="relative">
                                  <button
                                    onClick={(e) => handleEmojiButtonClick(index, e.currentTarget)}
                                    className="w-14 sm:w-16 h-14 sm:h-16 text-2xl sm:text-3xl rounded-xl bg-white/10 border-2 border-white/20 hover:bg-white/20 transition-colors flex items-center justify-center"
                                  >
                                    {badge.emoji}
                                  </button>
                                </div>
                                <div className="flex-1 space-y-2">
                                  <input type="text" value={badge.title} onChange={(e) => updateBadge(index, 'title', e.target.value)} placeholder="Badge Title (e.g., Top Reader)" className="w-full px-4 sm:px-5 py-3 rounded-xl bg-white/10 border-2 border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm font-medium text-sm sm:text-base" style={{ fontSize: '16px' }} />
                                  <input type="text" value={badge.subtext || ''} onChange={(e) => updateBadge(index, 'subtext', e.target.value)} placeholder="Subtext (Completed Reading Goal)" className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/80 placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 backdrop-blur-sm text-sm" style={{ fontSize: '16px' }} />
                                </div>
                                <button onClick={() => removeBadge(index)} className="px-4 py-3 bg-red-500/20 hover:bg-red-500/40 rounded-xl text-white transition-colors border-2 border-red-500/40"><Trash2 size={20} /></button>
                              </div>
                            </div>
                          ))}
                          <button onClick={addBadge} className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors border-2 border-white/20 font-bold"><Plus size={20} />Add Badge</button>
                        </div>
                      </div>
                      <div className="animate-section-fade-in" style={{ animationDelay: '0.2s', willChange: 'opacity, transform' }}>
                        <FieldLabel><span className="flex items-center gap-2"><Sparkles size={18} className="text-white/70" />Reflection</span></FieldLabel>
                        <p className="text-white/60 text-sm mb-3">What's something you learned?</p>
                        <textarea value={reflection} onChange={(e) => setReflection(e.target.value)} placeholder="Share a meaningful insight or lesson..." className="w-full px-4 sm:px-5 py-3 sm:py-4 rounded-xl bg-white/10 border-2 border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent backdrop-blur-sm font-medium text-base sm:text-lg min-h-[100px] sm:min-h-[120px] resize-none" style={{ fontSize: '16px' }} />
                      </div>
                      <div className="animate-section-fade-in" style={{ animationDelay: '0.3s', willChange: 'opacity, transform' }}>
                        <FieldLabel>Background Music</FieldLabel>
                        <p className="text-white/50 text-sm mb-3">Add a soundtrack that plays while viewing your Wrap.</p>
                        <select value={selectedMusic} onChange={(e) => handleMusicSelect(e.target.value)} className="w-full px-4 sm:px-5 py-3 sm:py-4 rounded-xl bg-white/[0.06] border border-white/[0.08] text-white focus:outline-none focus:bg-white/[0.08] focus:border-white/30 backdrop-blur-sm font-medium text-base sm:text-lg transition-all duration-300 shadow-[inset_0_1px_2px_rgba(0,0,0,0.1)]" style={{ fontSize: '16px' }}>
                          {musicTracks.map(track => (<option key={track.id} value={track.id} className="bg-gray-900 text-white">{track.name}</option>))}
                        </select>
                        {selectedMusic === 'custom' && (
                          <label className="mt-3 flex items-center gap-3 px-4 py-3 bg-white/[0.06] hover:bg-white/[0.1] rounded-xl text-white/60 transition-all duration-300 border border-dashed border-white/[0.15] hover:border-white/30 cursor-pointer">
                            <Upload size={20} />
                            <span className="font-medium">{customMusicFile ? customMusicFile.name : 'Choose audio file (.mp3, .wav, etc.)'}</span>
                            <input type="file" accept="audio/*" onChange={(e) => handleCustomMusicUpload(e.target.files[0])} className="hidden" />
                          </label>
                        )}
                        {audioRef.current && (<p className="text-white/40 text-sm mt-2">Use the speaker button to play/pause music</p>)}
                      </div>
                    </>
                  )}

                  {/* Navigation buttons */}
                  <div className="flex gap-3 pt-4">
                    {cawSlide > 0 && (
                      <button onClick={prevCawSlide} className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-all duration-300 backdrop-blur-sm border border-white/20 font-bold">
                        <ArrowLeft size={20} />
                        Back
                      </button>
                    )}
                    {cawSlide < 2 ? (
                      <button
                        onClick={nextCawSlide}
                        disabled={!canProceedFromSlide(cawSlide)}
                        className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold transition-all duration-300 ${canProceedFromSlide(cawSlide) ? 'bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm border border-white/30' : 'bg-white/5 text-white/30 cursor-not-allowed border border-white/10'}`}
                      >
                        Next: {cawSlideNames[cawSlide + 1]}
                        <ArrowRight size={20} />
                      </button>
                    ) : (
                      <button onClick={generateWrapped} className="flex-1 px-6 sm:px-8 py-4 sm:py-5 bg-white hover:bg-white/90 text-black font-black rounded-xl transition-all text-lg sm:text-xl shadow-xl hover:shadow-2xl hover:scale-[1.02] uppercase tracking-wide">
                        Generate My Wrap
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Create page animations */}
        <style>{`
          @keyframes aura-float-1 {
            0%, 100% { transform: translate(0, 0) scale(1); }
            20% { transform: translate(60px, -40px) scale(1.05); }
            40% { transform: translate(30px, 30px) scale(0.98); }
            60% { transform: translate(-50px, 10px) scale(1.03); }
            80% { transform: translate(-20px, -50px) scale(0.97); }
          }
          @keyframes aura-float-2 {
            0%, 100% { transform: translate(0, 0) scale(1); }
            25% { transform: translate(-40px, 50px) scale(1.04); }
            50% { transform: translate(50px, 20px) scale(0.96); }
            75% { transform: translate(20px, -40px) scale(1.02); }
          }
          @keyframes aura-float-3 {
            0%, 100% { transform: translate(0, 0) scale(1); }
            33% { transform: translate(30px, -60px) scale(1.06); }
            66% { transform: translate(-60px, 30px) scale(0.94); }
          }
          @keyframes aura-pulse {
            0%, 100% { opacity: 0.06; }
            50% { opacity: 0.12; }
          }
          .aura-float-1 { animation: aura-float-1 45s ease-in-out infinite; }
          .aura-float-2 { animation: aura-float-2 55s ease-in-out infinite; }
          .aura-float-3 { animation: aura-float-3 35s ease-in-out infinite; }
          .aura-pulse { animation: aura-pulse 8s ease-in-out infinite; }
          @keyframes mobile-shimmer {
            0%, 100% { background: radial-gradient(ellipse 60% 40% at 30% 30%, rgba(255,255,255,0.15) 0%, transparent 60%); }
            50% { background: radial-gradient(ellipse 60% 40% at 70% 60%, rgba(255,255,255,0.15) 0%, transparent 60%); }
          }
          .mobile-shimmer { animation: mobile-shimmer 15s ease-in-out infinite; }
          @keyframes form-glow-in {
            0% { box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0px rgba(139, 92, 246, 0); }
            100% { box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 60px rgba(139, 92, 246, 0.08), 0 0 120px rgba(139, 92, 246, 0.04); }
          }
          @keyframes form-glow-pulse {
            0%, 100% { box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 60px rgba(139, 92, 246, 0.06), 0 0 120px rgba(139, 92, 246, 0.03); }
            50% { box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 80px rgba(139, 92, 246, 0.1), 0 0 150px rgba(139, 92, 246, 0.05); }
          }
          .form-card-glow { animation: form-glow-in 1s ease-out forwards, form-glow-pulse 6s ease-in-out 1s infinite; }
          @keyframes form-entrance {
            0% { opacity: 0; transform: translateY(50px) scale(0.96); }
            100% { opacity: 1; transform: translateY(0) scale(1); }
          }
          .animate-form-entrance { animation: form-entrance 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
          @keyframes title-slide-in {
            0% { opacity: 0; transform: translateY(-25px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          @keyframes subtitle-slide-in {
            0% { opacity: 0; transform: translateY(15px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          .animate-title-slide-in { animation: title-slide-in 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.2s forwards; opacity: 0; }
          .animate-subtitle-slide-in { animation: subtitle-slide-in 0.6s ease-out 0.4s forwards; opacity: 0; }
          @keyframes section-fade-in {
            0% { opacity: 0; transform: translateY(12px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          .animate-section-fade-in { animation: section-fade-in 0.5s ease-out forwards; opacity: 0; }
        `}</style>

        {/* Emoji Picker - rendered at root level to avoid clipping */}
        {showEmojiPicker !== null && badges[showEmojiPicker] && (
          <EmojiPicker
            selectedEmoji={badges[showEmojiPicker].emoji}
            onSelect={(emoji) => updateBadge(showEmojiPicker, 'emoji', emoji)}
            onClose={() => setShowEmojiPicker(null)}
          />
        )}

        {/* Onboarding Slideshow - shows on Tour button click or first visit */}
        {showOnboarding && (
          <OnboardingSlideshow onClose={() => { setShowOnboarding(false); setShowFormAfterOnboarding(true); }} />
        )}

        {/* Auth Modals */}
        {showLoginModal && (
          <LoginModal onClose={() => setShowLoginModal(false)} />
        )}
        {showUpgradeModal && (
          <UpgradeModal
            onClose={() => setShowUpgradeModal(false)}
            currentCount={upgradeInfo.count}
            limit={upgradeInfo.limit}
          />
        )}
      </div>
    );
  }

  // Preview page
  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-3 sm:p-4" style={safariColorBoostStyle} onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
      <DynamicBackground moodId={selectedMood} showParticles={true} /><NoiseOverlay />
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
              <div ref={coverRef} className="glass-card relative bg-black/40 backdrop-blur-2xl rounded-3xl text-center border border-white/20 min-h-[600px] sm:min-h-[700px] flex flex-col items-center justify-center overflow-hidden" style={{ boxShadow: `0 0 30px ${moods.find(m => m.id === selectedMood)?.colors[0] || '#7c3aed'}15, 0 25px 50px -12px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.25), inset 0 -1px 0 rgba(0, 0, 0, 0.15)` }} onMouseMove={handleCoverMouseMove} onMouseLeave={() => setMousePosition({ x: 50, y: 50 })}>
                {/* Dynamic cinematic background */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
                  {/* Animated gradient mesh */}
                  <div className="absolute inset-0 animate-title-gradient" style={{ background: `radial-gradient(ellipse 80% 50% at 20% 20%, ${moods.find(m => m.id === selectedMood)?.colors[0] || '#7c3aed'}30 0%, transparent 50%), radial-gradient(ellipse 60% 60% at 80% 80%, ${moods.find(m => m.id === selectedMood)?.colors[1] || '#ec4899'}25 0%, transparent 50%)` }} />
                  {/* Glass wave effect */}
                  <div className="absolute inset-0 animate-glass-wave" style={{ background: `radial-gradient(ellipse 60% 40% at 30% 30%, rgba(255,255,255,0.08) 0%, transparent 50%), radial-gradient(ellipse 50% 50% at 70% 70%, rgba(255,255,255,0.06) 0%, transparent 50%)` }} />
                  {/* Spotlight follow cursor */}
                  <div className="absolute w-64 h-64 transition-all duration-500 ease-out" style={{ left: `${mousePosition.x}%`, top: `${mousePosition.y}%`, transform: 'translate(-50%, -50%)', background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.08) 30%, transparent 60%)', filter: 'blur(30px)' }} />
                  {/* Caustics shimmer */}
                  <div className="absolute inset-0 animate-caustics opacity-40" />
                  {/* Particle glow orbs */}
                  <div className="absolute w-4 h-4 rounded-full bg-white/30 blur-sm animate-particle-1" style={{ top: '20%', left: '15%' }} />
                  <div className="absolute w-3 h-3 rounded-full bg-white/20 blur-sm animate-particle-2" style={{ top: '70%', right: '20%' }} />
                  <div className="absolute w-5 h-5 rounded-full bg-white/25 blur-sm animate-particle-3" style={{ bottom: '25%', left: '25%' }} />
                </div>
                {coverImage && (<div className="absolute inset-0 z-0"><img src={coverImage} alt="Cover" className="w-full h-full object-cover opacity-40 animate-title-zoom" /><div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/60" /></div>)}
                <div className="relative z-10 flex flex-col items-center justify-center px-6 sm:px-8">
                  {/* "Wrapped" label with staggered entrance */}
                  <div className="text-2xl sm:text-3xl font-black text-white/70 tracking-[0.3em] uppercase mb-4 sm:mb-6 animate-title-label mt-8 sm:mt-12">Wrapped</div>
                  {/* Main title with dramatic reveal */}
                  <div className="mb-6 sm:mb-8 animate-title-main"><RainbowTitle hasCoverImage={!!coverImage}>{title}</RainbowTitle></div>
                  {/* Date with slide-up */}
                  {dateRange && <div className="text-lg sm:text-xl font-bold text-white/60 uppercase tracking-[0.2em] animate-title-date">{dateRange}</div>}
                  {/* Call to action with pulse */}
                  <div className="mt-8 sm:mt-12 flex items-center gap-2 text-white/40 text-sm animate-title-cta">
                    <span className="uppercase tracking-wider">Tap to explore</span>
                    <ArrowRight size={16} className="animate-bounce-x" />
                  </div>
                </div>
                <style>{`
                  @keyframes glass-wave { 0%, 100% { transform: translateX(-2%) translateY(-2%); } 25% { transform: translateX(2%) translateY(1%); } 50% { transform: translateX(-1%) translateY(2%); } 75% { transform: translateX(1%) translateY(-1%); } }
                  @keyframes caustics { 0%, 100% { background: radial-gradient(ellipse 80% 60% at 20% 40%, rgba(255,255,255,0.1) 0%, transparent 40%), radial-gradient(ellipse 60% 80% at 80% 60%, rgba(255,255,255,0.08) 0%, transparent 40%); } 33% { background: radial-gradient(ellipse 70% 50% at 60% 30%, rgba(255,255,255,0.12) 0%, transparent 40%), radial-gradient(ellipse 50% 70% at 40% 70%, rgba(255,255,255,0.06) 0%, transparent 40%); } 66% { background: radial-gradient(ellipse 90% 40% at 40% 60%, rgba(255,255,255,0.08) 0%, transparent 40%), radial-gradient(ellipse 40% 90% at 70% 40%, rgba(255,255,255,0.1) 0%, transparent 40%); } }
                  @keyframes float-gentle { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
                  @keyframes title-gradient { 0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.8; } 50% { transform: scale(1.1) rotate(2deg); opacity: 1; } }
                  @keyframes title-zoom { 0% { transform: scale(1.1); } 100% { transform: scale(1); } }
                  @keyframes title-label { 0% { opacity: 0; transform: translateY(-30px) scale(0.8); letter-spacing: 0.1em; } 100% { opacity: 0.7; transform: translateY(0) scale(1); letter-spacing: 0.3em; } }
                  @keyframes title-main { 0% { opacity: 0; transform: scale(0.7) translateY(20px); filter: blur(10px); } 50% { filter: blur(0); } 100% { opacity: 1; transform: scale(1) translateY(0); filter: blur(0); } }
                  @keyframes title-date { 0% { opacity: 0; transform: translateY(30px); } 100% { opacity: 0.6; transform: translateY(0); } }
                  @keyframes title-cta { 0% { opacity: 0; } 100% { opacity: 1; } }
                  @keyframes bounce-x { 0%, 100% { transform: translateX(0); } 50% { transform: translateX(5px); } }
                  @keyframes particle-1 { 0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.3; } 50% { transform: translate(20px, -30px) scale(1.5); opacity: 0.6; } }
                  @keyframes particle-2 { 0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.2; } 50% { transform: translate(-30px, 20px) scale(1.3); opacity: 0.5; } }
                  @keyframes particle-3 { 0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.25; } 50% { transform: translate(15px, 25px) scale(1.4); opacity: 0.55; } }
                  .animate-glass-wave { animation: glass-wave 8s ease-in-out infinite; }
                  .animate-caustics { animation: caustics 6s ease-in-out infinite; }
                  .animate-float-gentle { animation: float-gentle 4s ease-in-out infinite; }
                  .animate-title-gradient { animation: title-gradient 10s ease-in-out infinite; }
                  .animate-title-zoom { animation: title-zoom 1.5s ease-out forwards; }
                  .animate-title-label { animation: title-label 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.1s forwards; opacity: 0; }
                  .animate-title-main { animation: title-main 1s cubic-bezier(0.16, 1, 0.3, 1) 0.3s forwards; opacity: 0; }
                  .animate-title-date { animation: title-date 0.7s ease-out 0.6s forwards; opacity: 0; }
                  .animate-title-cta { animation: title-cta 0.5s ease-out 1s forwards; opacity: 0; }
                  .animate-bounce-x { animation: bounce-x 1.5s ease-in-out infinite; }
                  .animate-particle-1 { animation: particle-1 8s ease-in-out infinite; }
                  .animate-particle-2 { animation: particle-2 10s ease-in-out infinite 1s; }
                  .animate-particle-3 { animation: particle-3 9s ease-in-out infinite 2s; }
                `}</style>
              </div>
            )}

            {currentSlideInfo.type === 'stat' && (() => {
              const stat = validStats[currentSlideInfo.index]; const isLongText = stat.value.length > 50 || stat.value.includes(':') || stat.value.includes(','); const isHighlightFirstView = stat.isHighlight && !viewedHighlights.has(currentSlideInfo.index);
              // Don't show text reveal animations if impact already played for this slide
              const impactAlreadyPlayed = impactPlayedSlides.has(currentSlide);
              // Determine if this is a drumroll slide that just revealed
              const isDrumrollSlide = drumrollReveal && activeTransition === 'drumroll';
              // Regular text reveal for default transition slides (all stats including highlights)
              // Only show animations if this slide hasn't been animated yet
              const textAlreadyPlayed = textPlayedSlides.has(currentSlide);
              const showTextReveal = activeTransition !== 'impact' && activeTransition !== 'drumroll' && !impactAlreadyPlayed && !textAlreadyPlayed;
              // Cycle through 3 animation themes for variety on regular slides
              const textTheme = slideTextTheme[currentSlide] ?? currentSlideInfo.index % 3;
              // Regular slide animations (randomized) - for ALL stats including highlights
              const labelAnim = showTextReveal ? (textTheme === 0 ? 'animate-text-fade-in' : textTheme === 1 ? 'animate-text-slide-left' : 'animate-text-zoom-in') : '';
              const valueAnim = showTextReveal ? (textTheme === 0 ? 'animate-text-reveal' : textTheme === 1 ? 'animate-text-slide-right' : 'animate-text-zoom-reveal') : '';
              const noteAnim = showTextReveal ? (textTheme === 0 ? 'animate-text-fade-in-late' : textTheme === 1 ? 'animate-text-slide-left-late' : 'animate-text-zoom-late') : '';
              // Highlights also get glow + falling stars in addition to text animations
              // Drumroll uses a consistent zoom-in reveal animation
              const drumrollLabelAnim = isDrumrollSlide ? 'animate-drumroll-text-label' : '';
              const drumrollValueAnim = isDrumrollSlide ? 'animate-drumroll-text-value' : '';
              const drumrollNoteAnim = isDrumrollSlide ? 'animate-drumroll-text-note' : '';
              // Frame glow style - frosted glass with strong background separation
              const moodColors = moods.find(m => m.id === selectedMood)?.colors || ['#7c3aed', '#ec4899'];
              const primaryColor = moodColors[0] === 'rainbow' ? '#7c3aed' : moodColors[0];
              const frameGlowStyle = stat.isHighlight
                ? {
                    boxShadow: `0 0 50px rgba(250, 204, 21, 0.3), 0 0 100px rgba(250, 204, 21, 0.15), 0 25px 50px -12px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.3), inset 0 -1px 0 rgba(0, 0, 0, 0.2)`,
                    animation: 'glow-breathe 3s ease-in-out infinite'
                  }
                : {
                    boxShadow: `0 0 30px ${primaryColor}20, 0 25px 50px -12px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.25), inset 0 -1px 0 rgba(0, 0, 0, 0.15)`
                  };
              return (
                <div className={`glass-card bg-black/40 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 text-center border min-h-[600px] sm:min-h-[650px] flex flex-col justify-between relative overflow-hidden ${stat.isHighlight ? 'border-yellow-400/50' : 'border-white/20'} ${activeTransition === 'drumroll' ? 'drumroll-glow' : ''} ${activeTransition === 'impact' ? 'animate-impact-slam' : ''}`} style={frameGlowStyle}>
                  {/* Frosted glass overlay with soft inner glow */}
                  <div className="absolute inset-0 pointer-events-none rounded-3xl overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-white/5 to-transparent" />
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/30 to-transparent" />
                  </div>
                  {activeTransition === 'impact' && <ImpactDots />}
                  {showDrumrollGlitter && <DrumrollGlitter />}
                  {stat.isHighlight && isHighlightFirstView && starsVisible && (
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                      {starsDataRef.current.map(star => (
                        <div key={star.id} className="absolute animate-fall-star" style={{ left: `${star.left}%`, animationDelay: `${star.delay}s`, animationDuration: `${star.duration}s`, top: '-50px' }}>
                          <Star size={star.size} className="text-yellow-300 fill-yellow-300 drop-shadow-lg" style={{ filter: 'drop-shadow(0 0 8px rgba(253, 224, 71, 0.8))' }} />
                        </div>
                      ))}
                      <style>{`@keyframes fall-star { 0% { transform: translateY(-50px) rotate(0deg); opacity: 1; } 100% { transform: translateY(100vh) rotate(360deg); opacity: 0; } } .animate-fall-star { animation: fall-star linear forwards; }`}</style>
                    </div>
                  )}
                  {!stat.isHighlight && !isLongText && !stat.image && getDecorativeShapes(currentSlideInfo.index)}
                  <div className={`flex-1 flex flex-col justify-center space-y-4 sm:space-y-6 relative z-10 ${activeTransition === 'impact' ? 'animate-impact-text' : ''}`}>{stat.image && <div className="mb-4"><img src={stat.image} alt={stat.label} className="w-full max-w-sm mx-auto h-48 sm:h-64 object-cover rounded-2xl shadow-2xl border-2 border-white/20" /></div>}<div className={`text-white/70 text-lg sm:text-2xl font-bold uppercase tracking-wider ${labelAnim} ${drumrollLabelAnim}`}>{stat.label}</div><div className={`text-white ${valueAnim} ${drumrollValueAnim}`}>{formatValue(stat.value)}</div>{stat.note && <div className={`text-white/50 text-base sm:text-lg italic mt-4 max-w-md mx-auto px-2 ${noteAnim} ${drumrollNoteAnim}`}>({stat.note})</div>}</div>
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
              <div className="glass-card bg-black/40 backdrop-blur-2xl rounded-3xl p-6 sm:p-10 border border-white/20 min-h-[600px] sm:min-h-[650px] flex flex-col justify-center relative overflow-hidden" style={{ boxShadow: `0 0 30px ${moods.find(m => m.id === selectedMood)?.colors[0] || '#7c3aed'}15, 0 25px 50px -12px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.25), inset 0 -1px 0 rgba(0, 0, 0, 0.15)` }}>
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
        /* 3D Card Transform Animations - adds depth with perspective and rotation */
        @keyframes slide-out-left {
          0% { transform: perspective(1200px) translateX(0) rotateY(0deg) scale(1); opacity: 1; }
          100% { transform: perspective(1200px) translateX(-120px) rotateY(25deg) scale(0.85); opacity: 0; }
        }
        @keyframes slide-out-right {
          0% { transform: perspective(1200px) translateX(0) rotateY(0deg) scale(1); opacity: 1; }
          100% { transform: perspective(1200px) translateX(120px) rotateY(-25deg) scale(0.85); opacity: 0; }
        }
        @keyframes slide-in {
          0% { transform: perspective(1200px) translateX(60px) rotateY(-15deg) scale(0.9); opacity: 0; }
          60% { transform: perspective(1200px) translateX(-5px) rotateY(3deg) scale(1.02); opacity: 0.9; }
          100% { transform: perspective(1200px) translateX(0) rotateY(0deg) scale(1); opacity: 1; }
        }
        @keyframes slide-in-reverse {
          0% { transform: perspective(1200px) translateX(-60px) rotateY(15deg) scale(0.9); opacity: 0; }
          60% { transform: perspective(1200px) translateX(5px) rotateY(-3deg) scale(1.02); opacity: 0.9; }
          100% { transform: perspective(1200px) translateX(0) rotateY(0deg) scale(1); opacity: 1; }
        }
        /* Morphing dissolve transitions */
        @keyframes morph-out {
          0% { transform: scale(1); opacity: 1; filter: blur(0); clip-path: inset(0 0 0 0 round 24px); }
          50% { transform: scale(0.95); opacity: 0.7; filter: blur(4px); clip-path: inset(5% 5% 5% 5% round 24px); }
          100% { transform: scale(0.85); opacity: 0; filter: blur(12px); clip-path: inset(15% 15% 15% 15% round 24px); }
        }
        @keyframes morph-in {
          0% { transform: scale(1.15); opacity: 0; filter: blur(12px); clip-path: inset(15% 15% 15% 15% round 24px); }
          50% { transform: scale(1.05); opacity: 0.7; filter: blur(4px); clip-path: inset(5% 5% 5% 5% round 24px); }
          100% { transform: scale(1); opacity: 1; filter: blur(0); clip-path: inset(0 0 0 0 round 24px); }
        }
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
        .animate-slide-out-left { animation: slide-out-left 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards; transform-style: preserve-3d; }
        .animate-slide-out-right { animation: slide-out-right 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards; transform-style: preserve-3d; }
        .animate-slide-in { animation: slide-in 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards; transform-style: preserve-3d; }
        .animate-slide-in-reverse { animation: slide-in-reverse 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards; transform-style: preserve-3d; }
        .animate-morph-out { animation: morph-out 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
        .animate-morph-in { animation: morph-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
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
        /* Glassmorphism enhanced effects */
        @keyframes glass-shimmer {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .animate-glass-shimmer { animation: glass-shimmer 15s linear infinite; }
        .glass-card {
          backdrop-filter: blur(24px) saturate(180%);
          -webkit-backdrop-filter: blur(24px) saturate(180%);
        }
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

      {/* Share Modal - shows after saving wrap */}
      {shareModalOpen && shareUrl && (
        <ShareModal url={shareUrl} onClose={() => setShareModalOpen(false)} />
      )}

      {/* Onboarding Slideshow - shows on first visit */}
      {showOnboarding && (
        <OnboardingSlideshow onClose={() => { setShowOnboarding(false); setShowFormAfterOnboarding(true); }} />
      )}
    </div>
  );
}
