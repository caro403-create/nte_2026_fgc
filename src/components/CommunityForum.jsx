import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  MessageSquare, PlusCircle, Heart, 
  Send, Image, Link as LinkIcon, BookOpen, TreePine, Bird, 
  BookHeart, Megaphone, Filter, TrendingUp, Clock, ChevronDown,
  ChevronUp, Leaf, MapPin, Sparkles, Eye, Upload, X, Languages, Loader2
} from 'lucide-react';
import { supabase } from '../utils/supabase';
import { translatePost, translateText } from '../utils/translate';

// Category config
const CATEGORIES = {
  'Saberes Ancestrales':   { icon: BookHeart,  color: '#8B5E3C', bg: '#FDF4EC', label_en: 'Ancestral Knowledge' },
  'Fauna y Ecosistema':    { icon: Bird,        color: '#2D6A4F', bg: '#EEF5E9', label_en: 'Fauna & Ecosystems' },
  'Historias y Cultura':   { icon: TreePine,    color: '#7C3AED', bg: '#F3EEFF', label_en: 'Stories & Culture' },
  'Noticias de la Comunidad': { icon: Megaphone, color: '#0369A1', bg: '#E0F2FE', label_en: 'Community News' },
};

const MOCK_POSTS = [
  {
    id: 'mock-1',
    author_id: 'bot-1',
    author_name: 'Don Carlos - Líder Comunitario',
    category: 'Saberes Ancestrales',
    title: 'Cómo interpretar el color de las nubes sobre el Nevado',
    content: 'Nuestros abuelos siempre nos decían que cuando las nubes sobre la cumbre se tornan de color gris oscuro con bordes amarillentos al atardecer, es señal de que los vientos fuertes bajarán hacia el valle en las próximas 48 horas. Es importante asegurar los techos.',
    location: 'Valle del Cauca',
    upvotes: 24,
    comment_count: 2,
    created_at: new Date(Date.now() - 86400000).toISOString(),
    is_mock: true
  },
  {
    id: 'mock-2',
    author_id: 'bot-2',
    author_name: 'MariaF',
    category: 'Fauna y Ecosistema',
    title: 'Avistamiento de Cóndor de los Andes y cambios de temperatura',
    content: 'Hoy durante nuestra caminata en el páramo notamos que los cóndores estaban volando mucho más bajo de lo normal. Los guardabosques locales me comentaron que esto suele ocurrir cuando hay una inversión térmica inusual. Estemos atentos a las heladas esta noche.',
    location: 'PNN Los Nevados',
    upvotes: 15,
    comment_count: 5,
    created_at: new Date(Date.now() - 172800000).toISOString(),
    is_mock: true
  },
  {
    id: 'mock-3',
    author_id: 'bot-3',
    author_name: 'Defensa Civil Local',
    category: 'Noticias de la Comunidad',
    title: 'Alerta temprana: Prevención de incendios forestales',
    content: 'Debido a la sequía prolongada de las últimas tres semanas, el riesgo de incendios ha subido a nivel extremo en nuestra jurisdicción. Solicitamos a todos los vecinos abstenerse de realizar quemas controladas o fogatas este fin de semana.',
    location: 'Zona Cafetera',
    upvotes: 42,
    comment_count: 12,
    created_at: new Date(Date.now() - 3600000).toISOString(),
    is_mock: true
  }
];

function timeAgo(dateStr, lang) {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return lang === 'en' ? 'Just now' : 'Ahora mismo';
  if (diffMins < 60) return lang === 'en' ? `${diffMins}m ago` : `hace ${diffMins}m`;
  if (diffHours < 24) return lang === 'en' ? `${diffHours}h ago` : `hace ${diffHours}h`;
  if (diffDays < 7) return lang === 'en' ? `${diffDays}d ago` : `hace ${diffDays}d`;
  return date.toLocaleDateString(lang === 'en' ? 'en-US' : 'es-CO', { month: 'short', day: 'numeric' });
}

export default function CommunityForum({ user, isBrigadista, lang }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [expandedPost, setExpandedPost] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [postComments, setPostComments] = useState({});

  // New post form
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState('Saberes Ancestrales');
  const [newArticleUrl, setNewArticleUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Image upload
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Auto-translation state: { [postId]: { title, content } }
  const [autoTranslations, setAutoTranslations] = useState({});
  const [translatingIds, setTranslatingIds] = useState(new Set());
  // Comment translations: { [commentId]: translatedContent }
  const [commentTranslations, setCommentTranslations] = useState({});
  const [translatingCommentIds, setTranslatingCommentIds] = useState(new Set());

  const isLoggedIn = !!user;

  // ---- FETCH POSTS ----
  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const { data: postsData, error: postsError } = await supabase
        .from('community_posts').select('*').order('created_at', { ascending: false });
      if (postsError) throw postsError;

      const { data: commentCounts } = await supabase.from('community_comments').select('post_id');
      const { data: likeCounts } = await supabase.from('community_likes').select('post_id, user_email');

      const enriched = (postsData || []).map(post => {
        const comments = (commentCounts || []).filter(c => c.post_id === post.id);
        const likes = (likeCounts || []).filter(l => l.post_id === post.id);
        const userLiked = user ? likes.some(l => l.user_email === user.email) : false;
        return { ...post, comment_count: comments.length, like_count: likes.length, user_liked: userLiked };
      });
      
      if (enriched.length === 0) {
        setPosts(MOCK_POSTS);
      } else {
        setPosts(enriched);
      }
    } catch (err) {
      console.error('Error fetching community posts:', err);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  // ---- AUTO-TRANSLATE POSTS when lang=en ----
  useEffect(() => {
    if (lang !== 'en' || posts.length === 0) return;

    // Find posts that need auto-translation (no manual title_en and not yet translated)
    const needsTranslation = posts.filter(
      p => !p.title_en && !autoTranslations[p.id] && !translatingIds.has(p.id)
    );

    if (needsTranslation.length === 0) return;

    // Translate up to 3 posts at a time to avoid flooding the API
    const batch = needsTranslation.slice(0, 3);
    const batchIds = new Set(batch.map(p => p.id));
    setTranslatingIds(prev => new Set([...prev, ...batchIds]));

    Promise.all(
      batch.map(async (post) => {
        const result = await translatePost(post.title, post.content);
        return { id: post.id, ...result };
      })
    ).then(results => {
      setAutoTranslations(prev => {
        const updated = { ...prev };
        results.forEach(r => { updated[r.id] = { title: r.title, content: r.content }; });
        return updated;
      });
      setTranslatingIds(prev => {
        const updated = new Set(prev);
        results.forEach(r => updated.delete(r.id));
        return updated;
      });
    });
  }, [lang, posts, autoTranslations, translatingIds]);

  // ---- AUTO-TRANSLATE COMMENTS when lang=en and expanded ----
  useEffect(() => {
    if (lang !== 'en' || expandedPost === null) return;

    const comments = postComments[expandedPost] || [];
    const needsTranslation = comments.filter(
      c => !c.content_en && !commentTranslations[c.id] && !translatingCommentIds.has(c.id)
    );

    if (needsTranslation.length === 0) return;

    const batch = needsTranslation.slice(0, 5);
    const batchIds = new Set(batch.map(c => c.id));
    setTranslatingCommentIds(prev => new Set([...prev, ...batchIds]));

    Promise.all(
      batch.map(async (c) => {
        const translated = await translateText(c.content);
        return { id: c.id, content: translated };
      })
    ).then(results => {
      setCommentTranslations(prev => {
        const updated = { ...prev };
        results.forEach(r => { updated[r.id] = r.content; });
        return updated;
      });
      setTranslatingCommentIds(prev => {
        const updated = new Set(prev);
        results.forEach(r => updated.delete(r.id));
        return updated;
      });
    });
  }, [lang, expandedPost, postComments, commentTranslations, translatingCommentIds]);

  // Filtered & sorted
  const displayPosts = posts
    .filter(p => activeFilter === 'all' || p.category === activeFilter)
    .sort((a, b) => {
      if (sortBy === 'popular') return b.like_count - a.like_count;
      return new Date(b.created_at) - new Date(a.created_at);
    });

  // ---- IMAGE UPLOAD ----
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert(lang === 'en' ? 'Only JPG, PNG, GIF and WebP images are allowed.' : 'Solo se permiten imágenes JPG, PNG, GIF y WebP.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert(lang === 'en' ? 'Image must be under 5MB.' : 'La imagen debe ser menor a 5MB.');
      return;
    }
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setSelectedFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const uploadImage = async () => {
    if (!selectedFile || !user) return null;
    setUploading(true);
    try {
      const ext = selectedFile.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('community-images').upload(fileName, selectedFile, { cacheControl: '3600', upsert: false });
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage.from('community-images').getPublicUrl(fileName);
      return urlData.publicUrl;
    } catch (err) {
      console.error('Upload error:', err);
      alert(lang === 'en' ? 'Error uploading image: ' + err.message : 'Error al subir imagen: ' + err.message);
      return null;
    } finally {
      setUploading(false);
    }
  };

  // ---- CREATE POST ----
  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!isLoggedIn || submitting) return;
    setSubmitting(true);
    try {
      let imageUrl = null;
      if (selectedFile) imageUrl = await uploadImage();

      const { error } = await supabase.from('community_posts').insert([{
        title: newTitle, content: newContent, category: newCategory,
        image_url: imageUrl, article_url: newArticleUrl.trim() || null,
        author_name: user.user_metadata?.full_name || user.email.split('@')[0],
        author_email: user.email, author_id: user.id
      }]);
      if (error) throw error;
      setNewTitle(''); setNewContent(''); setNewArticleUrl('');
      clearImage(); setShowCreateForm(false);
      await fetchPosts();
    } catch (err) {
      alert(lang === 'en' ? 'Error: ' + err.message : 'Error: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // ---- LIKES ----
  const handleLike = async (postId) => {
    if (!isLoggedIn) return;
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    try {
      if (post.user_liked) {
        await supabase.from('community_likes').delete().eq('post_id', postId).eq('user_email', user.email);
      } else {
        await supabase.from('community_likes').insert([{ post_id: postId, user_id: user.id, user_email: user.email }]);
      }
      setPosts(prev => prev.map(p => {
        if (p.id === postId) return { ...p, like_count: p.user_liked ? p.like_count - 1 : p.like_count + 1, user_liked: !p.user_liked };
        return p;
      }));
    } catch (err) { console.error('Like error:', err); }
  };

  // ---- COMMENTS ----
  const loadComments = async (postId) => {
    try {
      const { data, error } = await supabase.from('community_comments').select('*')
        .eq('post_id', postId).order('created_at', { ascending: true });
      if (error) throw error;
      setPostComments(prev => ({ ...prev, [postId]: data || [] }));
    } catch (err) { console.error('Error loading comments:', err); }
  };

  const toggleComments = (postId) => {
    if (expandedPost === postId) { setExpandedPost(null); }
    else { setExpandedPost(postId); loadComments(postId); }
  };

  const handleAddComment = async (postId) => {
    if (!commentText.trim() || !isLoggedIn) return;
    try {
      const { error } = await supabase.from('community_comments').insert([{
        post_id: postId, content: commentText,
        author_name: user.user_metadata?.full_name || user.email.split('@')[0],
        author_email: user.email, author_id: user.id
      }]);
      if (error) throw error;
      setCommentText('');
      loadComments(postId);
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, comment_count: p.comment_count + 1 } : p));
    } catch (err) { console.error('Error adding comment:', err); }
  };

  const getCategoryConfig = (cat) => CATEGORIES[cat] || CATEGORIES['Saberes Ancestrales'];

  // ---- Helper: resolve post text based on lang ----
  const getPostText = (post) => {
    // Priority: 1) Manual DB translation, 2) Auto-translation, 3) Original
    if (lang === 'en') {
      if (post.title_en) return { title: post.title_en, content: post.content_en || post.content, source: 'db' };
      if (autoTranslations[post.id]) return { title: autoTranslations[post.id].title, content: autoTranslations[post.id].content, source: 'auto' };
      if (translatingIds.has(post.id)) return { title: post.title, content: post.content, source: 'loading' };
    }
    return { title: post.title, content: post.content, source: 'original' };
  };

  const getCommentText = (comment) => {
    if (lang === 'en') {
      if (comment.content_en) return { text: comment.content_en, source: 'db' };
      if (commentTranslations[comment.id]) return { text: commentTranslations[comment.id], source: 'auto' };
      if (translatingCommentIds.has(comment.id)) return { text: comment.content, source: 'loading' };
    }
    return { text: comment.content, source: 'original' };
  };

  return (
    <div className="bg-gradient-to-b from-[#F8FAF5] to-[#EEF5E9]/30 min-h-screen text-left">

      {/* Hero Banner */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1B4332] via-[#2D6A4F] to-[#40916C]"></div>
        <div className="absolute inset-0 opacity-[0.08]" style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M30 5 L35 15 L30 25 L25 15 Z\' fill=\'%23fff\' opacity=\'0.3\'/%3E%3Cpath d=\'M10 35 L15 45 L10 55 L5 45 Z\' fill=\'%23fff\' opacity=\'0.2\'/%3E%3Cpath d=\'M50 35 L55 45 L50 55 L45 45 Z\' fill=\'%23fff\' opacity=\'0.2\'/%3E%3C/svg%3E")', backgroundSize: '60px 60px'}}></div>
        
        <div className="relative z-10 max-w-6xl mx-auto px-6 py-16">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div className="max-w-xl">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur flex items-center justify-center">
                  <Leaf className="h-4 w-4 text-[#B7E4C7]" />
                </div>
                <span className="text-[10px] tracking-[0.25em] text-[#B7E4C7] font-bold font-mono uppercase">
                  {lang === 'en' ? "COMMUNITY PLAZA" : "PLAZA COMUNITARIA"}
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-serif-editorial text-white mb-4 leading-tight">
                {lang === 'en' 
                  ? <>Voices of the <em className="text-[#B7E4C7]">territory</em></>
                  : <>Voces del <em className="text-[#B7E4C7]">territorio</em></>}
              </h1>
              <p className="text-sm text-white/70 leading-relaxed font-light max-w-md">
                {lang === 'en' 
                  ? "Share ancestral knowledge, document stories, protect biodiversity. Every voice strengthens the forest."
                  : "Comparte saberes ancestrales, documenta historias, protege la biodiversidad. Cada voz fortalece el bosque."}
              </p>
            </div>
            <div className="flex gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-white font-mono">{posts.length}</div>
                <div className="text-[10px] text-white/50 font-bold uppercase tracking-wider mt-1">{lang === 'en' ? 'Stories' : 'Historias'}</div>
              </div>
              <div className="w-px bg-white/10"></div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white font-mono">{posts.reduce((acc, p) => acc + p.comment_count, 0)}</div>
                <div className="text-[10px] text-white/50 font-bold uppercase tracking-wider mt-1">{lang === 'en' ? 'Comments' : 'Comentarios'}</div>
              </div>
              <div className="w-px bg-white/10"></div>
              <div className="text-center">
                <div className="text-3xl font-bold text-[#B7E4C7] font-mono">{new Set(posts.map(p => p.author_email)).size}</div>
                <div className="text-[10px] text-white/50 font-bold uppercase tracking-wider mt-1">{lang === 'en' ? 'Members' : 'Miembros'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="sticky top-[72px] z-30 bg-white/90 backdrop-blur-xl border-b border-[#EEF5E9] shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            <button onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition-all cursor-pointer ${activeFilter === 'all' ? 'bg-[#2D6A4F] text-white shadow-sm' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
              {lang === 'en' ? 'All' : 'Todos'}
            </button>
            {Object.entries(CATEGORIES).map(([key, cfg]) => {
              const Icon = cfg.icon;
              return (
                <button key={key} onClick={() => setActiveFilter(key)}
                  className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${activeFilter === key ? 'shadow-sm text-white' : 'text-slate-500 hover:opacity-80'}`}
                  style={activeFilter === key ? { backgroundColor: cfg.color } : { backgroundColor: cfg.bg, color: cfg.color }}>
                  <Icon className="h-3 w-3" />
                  <span className="hidden sm:inline">{lang === 'en' ? cfg.label_en : key}</span>
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-slate-100 rounded-full p-0.5">
              <button onClick={() => setSortBy('recent')}
                className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 ${sortBy === 'recent' ? 'bg-white text-[#2D3436] shadow-sm' : 'text-slate-400'}`}>
                <Clock className="h-3 w-3" />{lang === 'en' ? 'Recent' : 'Recientes'}
              </button>
              <button onClick={() => setSortBy('popular')}
                className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 ${sortBy === 'popular' ? 'bg-white text-[#2D3436] shadow-sm' : 'text-slate-400'}`}>
                <TrendingUp className="h-3 w-3" />Popular
              </button>
            </div>
            {isLoggedIn && (
              <button onClick={() => setShowCreateForm(!showCreateForm)}
                className="bg-[#2D6A4F] hover:bg-[#1E4635] text-white px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all shadow-sm cursor-pointer flex items-center gap-1.5">
                <PlusCircle className="h-3.5 w-3.5" />{lang === 'en' ? 'New Post' : 'Publicar'}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        
        {/* Guest Warning */}
        {!isLoggedIn && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/60 text-amber-900 text-xs p-4 rounded-2xl flex gap-3 items-center mb-6 shadow-xs">
            <div className="bg-amber-100 p-2 rounded-xl shrink-0"><Eye className="h-4 w-4 text-amber-600" /></div>
            <div>
              <span className="font-bold">{lang === 'en' ? "Read-Only Mode" : "Modo de Lectura"}</span>
              <span className="text-amber-700 font-light ml-1">
                — {lang === 'en' ? "Log in to share your stories, images and participate in discussions." : "Inicia sesión para compartir historias, imágenes y participar en las discusiones."}
              </span>
            </div>
          </div>
        )}

        {/* ========== CREATE POST FORM ========== */}
        {showCreateForm && isLoggedIn && (
          <div className="bg-white border border-[#EEF5E9] rounded-3xl p-8 mb-8 shadow-md">
            <div className="flex items-center gap-3 mb-6 border-b border-[#EEF5E9] pb-5">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2D6A4F] to-[#52B788] flex items-center justify-center text-white font-bold text-sm">
                {(user.email || '?')[0].toUpperCase()}
              </div>
              <div>
                <span className="text-sm font-bold text-[#2D3436] block">{lang === 'en' ? 'Share with the community' : 'Comparte con la comunidad'}</span>
                <span className="text-[10px] text-slate-400 font-mono">{user.email}</span>
              </div>
            </div>

            <form onSubmit={handleCreatePost} className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
              <div className="md:col-span-2">
                <input type="text" required value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
                  placeholder={lang === 'en' ? "What do you want to share?" : "¿Qué quieres compartir con la comunidad?"}
                  className="w-full px-5 py-4 bg-[#F8FAF5] border border-[#EEF5E9] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/30 text-sm font-medium placeholder:text-slate-300" />
              </div>
              
              <div>
                <label className="font-bold text-slate-400 uppercase tracking-wider font-mono text-[9px] block mb-2">{lang === 'en' ? "CATEGORY" : "CATEGORÍA"}</label>
                <select value={newCategory} onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-4 py-3 bg-[#F8FAF5] border border-[#EEF5E9] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/30">
                  {Object.keys(CATEGORIES).map(cat => (
                    <option key={cat} value={cat}>{lang === 'en' ? CATEGORIES[cat].label_en : cat}</option>
                  ))}
                </select>
              </div>

              {/* IMAGE UPLOAD */}
              <div>
                <label className="font-bold text-slate-400 uppercase tracking-wider font-mono text-[9px] block mb-2 flex items-center gap-1">
                  <Image className="h-3 w-3" /> {lang === 'en' ? "UPLOAD IMAGE (OPTIONAL)" : "SUBIR IMAGEN (OPCIONAL)"}
                </label>
                {imagePreview ? (
                  <div className="relative rounded-xl overflow-hidden border border-[#EEF5E9]">
                    <img src={imagePreview} alt="Preview" className="w-full h-32 object-cover" />
                    <button type="button" onClick={clearImage}
                      className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white p-1 rounded-full transition-colors cursor-pointer">
                      <X className="h-3.5 w-3.5" />
                    </button>
                    <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[9px] px-2 py-0.5 rounded-full font-mono">
                      {(selectedFile?.size / 1024).toFixed(0)} KB
                    </div>
                  </div>
                ) : (
                  <button type="button" onClick={() => fileInputRef.current?.click()}
                    className="w-full px-4 py-6 bg-[#F8FAF5] border-2 border-dashed border-[#EEF5E9] rounded-xl hover:border-[#2D6A4F]/30 transition-colors cursor-pointer flex flex-col items-center gap-2 text-slate-400 hover:text-[#2D6A4F]">
                    <Upload className="h-5 w-5" />
                    <span className="text-[10px] font-bold">{lang === 'en' ? 'Click to select an image' : 'Clic para seleccionar imagen'}</span>
                    <span className="text-[9px] text-slate-300">JPG, PNG, GIF, WebP · Max 5MB</span>
                  </button>
                )}
                <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp" onChange={handleFileSelect} className="hidden" />
              </div>

              <div className="md:col-span-2">
                <label className="font-bold text-slate-400 uppercase tracking-wider font-mono text-[9px] block mb-2 flex items-center gap-1">
                  <LinkIcon className="h-3 w-3" /> {lang === 'en' ? "ARTICLE LINK (OPTIONAL)" : "ENLACE ARTÍCULO (OPCIONAL)"}
                </label>
                <input type="url" value={newArticleUrl} onChange={(e) => setNewArticleUrl(e.target.value)} placeholder="https://..."
                  className="w-full px-4 py-3 bg-[#F8FAF5] border border-[#EEF5E9] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/30" />
              </div>

              <div className="md:col-span-2">
                <textarea required rows={5} value={newContent} onChange={(e) => setNewContent(e.target.value)}
                  placeholder={lang === 'en' ? "Tell the story, share knowledge, describe what you saw..." : "Cuenta la historia, comparte el saber, describe lo que observaste..."}
                  className="w-full px-5 py-4 bg-[#F8FAF5] border border-[#EEF5E9] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/30 resize-none placeholder:text-slate-300" />
              </div>

              <div className="md:col-span-2 flex justify-end gap-3">
                <button type="button" onClick={() => { setShowCreateForm(false); clearImage(); }}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer">
                  {lang === 'en' ? 'Cancel' : 'Cancelar'}
                </button>
                <button type="submit" disabled={submitting || uploading}
                  className="bg-[#2D6A4F] hover:bg-[#1E4635] text-white px-6 py-2.5 rounded-xl font-bold uppercase text-[10px] tracking-wider transition-all shadow-sm cursor-pointer disabled:opacity-50 flex items-center gap-2">
                  {(submitting || uploading) ? (
                    <><Loader2 className="h-3.5 w-3.5 animate-spin" /> {uploading ? (lang === 'en' ? 'Uploading...' : 'Subiendo...') : (lang === 'en' ? 'Publishing...' : 'Publicando...')}</>
                  ) : (
                    <><Sparkles className="h-3.5 w-3.5" /> {lang === 'en' ? 'Publish' : 'Publicar'}</>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ========== POST FEED ========== */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-10 h-10 border-3 border-[#2D6A4F]/20 border-t-[#2D6A4F] rounded-full animate-spin"></div>
            <span className="text-xs text-slate-400 font-mono">{lang === 'en' ? 'Loading stories...' : 'Cargando historias...'}</span>
          </div>
        ) : displayPosts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
            <div className="w-16 h-16 rounded-full bg-[#EEF5E9] flex items-center justify-center">
              <TreePine className="h-8 w-8 text-[#2D6A4F]/40" />
            </div>
            <h3 className="text-sm font-bold text-slate-500">{lang === 'en' ? 'No stories yet in this category' : 'No hay historias en esta categoría'}</h3>
            <p className="text-xs text-slate-400 max-w-xs font-light">{lang === 'en' ? 'Be the first to share knowledge.' : 'Sé el primero en compartir saberes.'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {displayPosts.map((post) => {
              const catConfig = getCategoryConfig(post.category);
              const CatIcon = catConfig.icon;
              const comments = postComments[post.id] || [];
              const isExpanded = expandedPost === post.id;
              const { title: postTitle, content: postContent, source: postSource } = getPostText(post);

              return (
                <article key={post.id}
                  className="bg-white rounded-3xl border border-[#EEF5E9] shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group">

                  {post.image_url && (
                    <div className="w-full h-64 overflow-hidden relative">
                      <img src={post.image_url} alt={postTitle}
                        className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700"
                        onError={(e) => { e.target.parentElement.style.display = 'none'; }} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                    </div>
                  )}

                  <div className="p-6 md:p-8">
                    {/* Category & Date & Translation */}
                    <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold"
                          style={{ backgroundColor: catConfig.bg, color: catConfig.color }}>
                          <CatIcon className="h-3 w-3" />
                          {lang === 'en' ? catConfig.label_en : post.category}
                        </span>
                        {/* Translation badge */}
                        {postSource === 'db' && lang === 'en' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-blue-50 text-blue-500 border border-blue-100">
                            <Languages className="h-2.5 w-2.5" /> Translated
                          </span>
                        )}
                        {postSource === 'auto' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-violet-50 text-violet-500 border border-violet-100">
                            <Languages className="h-2.5 w-2.5" /> Auto-translated
                          </span>
                        )}
                        {postSource === 'loading' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-50 text-slate-400 border border-slate-100">
                            <Loader2 className="h-2.5 w-2.5 animate-spin" /> Translating...
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                        <Clock className="h-3 w-3" />{timeAgo(post.created_at, lang)}
                      </span>
                    </div>

                    <h2 className="text-lg md:text-xl font-bold text-[#1B4332] mb-3 leading-snug">{postTitle}</h2>

                    <p className="text-sm text-slate-600 leading-relaxed font-light whitespace-pre-line mb-4"
                      style={{ display: '-webkit-box', WebkitLineClamp: isExpanded ? 'unset' : 4, WebkitBoxOrient: 'vertical', overflow: isExpanded ? 'visible' : 'hidden' }}>
                      {postContent}
                    </p>

                    {post.article_url && (
                      <a href={post.article_url} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-xs font-bold text-[#2D6A4F] hover:text-[#1E4635] bg-[#EEF5E9]/60 hover:bg-[#EEF5E9] border border-[#2D6A4F]/10 rounded-xl px-4 py-2 transition-all mb-4">
                        <BookOpen className="h-4 w-4" />{lang === 'en' ? 'Read Source' : 'Leer Fuente'}
                      </a>
                    )}

                    {/* Author & Actions */}
                    <div className="flex items-center justify-between border-t border-[#EEF5E9] pt-4 mt-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-[10px] uppercase shadow-sm"
                          style={{ background: `linear-gradient(135deg, ${catConfig.color}, ${catConfig.color}CC)` }}>
                          {post.author_name.charAt(0)}
                        </div>
                        <div>
                          <span className="text-xs font-bold text-[#2D3436] block">{post.author_name}</span>
                          <span className="text-[9px] text-slate-400 flex items-center gap-1"><MapPin className="h-2.5 w-2.5" /> Valle del Cauca</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button onClick={() => handleLike(post.id)} disabled={!isLoggedIn}
                          className={`flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer px-3 py-1.5 rounded-full ${post.user_liked ? 'bg-red-50 text-red-500' : 'text-slate-400 hover:text-red-500 hover:bg-red-50'} ${!isLoggedIn ? 'opacity-50 cursor-not-allowed' : ''}`}>
                          <Heart className={`h-4 w-4 ${post.user_liked ? 'fill-red-500' : ''}`} /><span>{post.like_count}</span>
                        </button>
                        <button onClick={() => toggleComments(post.id)}
                          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-[#2D6A4F] hover:bg-[#EEF5E9] font-bold transition-all cursor-pointer px-3 py-1.5 rounded-full">
                          <MessageSquare className="h-4 w-4" /><span>{post.comment_count}</span>
                          {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                        </button>
                      </div>
                    </div>

                    {/* Comments */}
                    {isExpanded && (
                      <div className="mt-5 pt-5 border-t border-[#EEF5E9]">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.15em] font-mono block mb-4">
                          {lang === 'en' ? 'DISCUSSION' : 'DISCUSIÓN'} ({post.comment_count})
                        </span>
                        
                        {comments.length === 0 ? (
                          <p className="text-xs text-slate-400 italic font-light py-4 text-center">
                            {lang === 'en' ? "No comments yet. Start the conversation!" : "Sin comentarios aún. ¡Inicia la conversación!"}
                          </p>
                        ) : (
                          <div className="flex flex-col gap-3 mb-4">
                            {comments.map((c) => {
                              const { text: cText, source: cSource } = getCommentText(c);
                              return (
                                <div key={c.id} className="flex gap-3">
                                  <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-[9px] font-bold uppercase shrink-0 mt-0.5">
                                    {c.author_name.charAt(0)}
                                  </div>
                                  <div className="flex-1 bg-[#F8FAF5] rounded-2xl rounded-tl-sm px-4 py-3">
                                    <div className="flex justify-between items-center mb-1 gap-2">
                                      <span className="text-[11px] font-bold text-[#2D3436]">{c.author_name}</span>
                                      <div className="flex items-center gap-1.5">
                                        {cSource === 'auto' && (
                                          <span className="text-[8px] text-violet-400 flex items-center gap-0.5"><Languages className="h-2 w-2" /> Auto</span>
                                        )}
                                        {cSource === 'db' && lang === 'en' && (
                                          <span className="text-[8px] text-blue-400 flex items-center gap-0.5"><Languages className="h-2 w-2" /> EN</span>
                                        )}
                                        {cSource === 'loading' && (
                                          <Loader2 className="h-2.5 w-2.5 animate-spin text-slate-300" />
                                        )}
                                        <span className="text-[9px] text-slate-400 font-mono">{timeAgo(c.created_at, lang)}</span>
                                      </div>
                                    </div>
                                    <p className="text-xs text-slate-600 font-light leading-relaxed">{cText}</p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {isLoggedIn ? (
                          <div className="flex gap-3 items-start">
                            <div className="w-7 h-7 rounded-full bg-[#2D6A4F] text-white flex items-center justify-center text-[9px] font-bold uppercase shrink-0">
                              {(user.email || '?')[0].toUpperCase()}
                            </div>
                            <div className="flex-1 flex gap-2">
                              <input type="text" value={commentText} onChange={(e) => setCommentText(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                                placeholder={lang === 'en' ? "Add to the discussion..." : "Aporta a la discusión..."}
                                className="flex-1 px-4 py-2.5 bg-white border border-[#EEF5E9] rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20 placeholder:text-slate-300" />
                              <button onClick={() => handleAddComment(post.id)}
                                className="bg-[#2D6A4F] hover:bg-[#1E4635] text-white p-2.5 rounded-xl transition-colors cursor-pointer shadow-sm">
                                <Send className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-3 text-[10px] text-slate-400 font-medium bg-slate-50 rounded-xl">
                            {lang === 'en' ? "Log in to join the conversation" : "Inicia sesión para participar en la conversación"}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
