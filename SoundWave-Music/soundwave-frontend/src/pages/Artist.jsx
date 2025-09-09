import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Play, 
  Heart, 
  MoreHorizontal, 
  ArrowLeft,
  Clock,
  Music2,
  Users,
  CheckCircle,
  Plus,
  ChevronRight,
  ChevronDown,
  Mail,
  Music,
  MapPin,
  Disc,
  Calendar,
  Phone
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useMusic } from '../store/MusicContext';
import toast from 'react-hot-toast';

const Artist = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { playTrack, addToQueue, toggleLike, likedTracks } = useMusic();
  
  const handleToggleLike = async (track) => {
    try {
      const trackId = track._id || track.id;
      const wasLiked = likedTracks.includes(trackId);
      
      console.log('🎤 Artist - handleToggleLike called:', { track, trackId, wasLiked });
      
      await toggleLike(track);
      
      if (wasLiked) {
        toast.success('Retiré des favoris');
      } else {
        toast.success('Ajouté aux favoris');
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour des favoris:', error);
      toast.error('Erreur lors de la mise à jour des favoris');
    }
  };
  
  const [artist, setArtist] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [topTracks, setTopTracks] = useState([]);
  const [tracksLoading, setTracksLoading] = useState(false);
  const [relatedArtists, setRelatedArtists] = useState([]);
  const [activeTab, setActiveTab] = useState('popular');
  const [displayedTracks, setDisplayedTracks] = useState(5); // Nombre de pistes affichées
  const [albums, setAlbums] = useState([]);
  const [albumsLoading, setAlbumsLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState('popular'); // Filtre actif pour la discographie
  const [showMoreInfo, setShowMoreInfo] = useState(false); // State for "Plus d'infos" expanded view
  const [isSubscribed, setIsSubscribed] = useState(false); // State for subscription status

  // Vérifier si l'artiste est déjà abonné au chargement
  useEffect(() => {
    const subscribedArtists = JSON.parse(localStorage.getItem('subscribedArtists') || '[]');
    const isAlreadySubscribed = subscribedArtists.some(a => a.id === id);
    setIsSubscribed(isAlreadySubscribed);
  }, [id]);

  // Format mm:ss
  const formatDuration = (seconds) => {
    if (!seconds && seconds !== 0) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  // Charger infos artiste + top tracks + artistes similaires
  useEffect(() => {
    const loadArtist = async () => {
      if (!id) return;
      setTracksLoading(true);
      setAlbumsLoading(true);
      
      try {
        console.log('🎵 Chargement des données de l\'artiste:', id);
        
        // Charger les informations de l'artiste depuis le backend
        console.log('🔍 Recherche de l\'artiste avec ID:', id);
        
        // Essayer d'abord l'endpoint des artistes
        let artistResponse = await fetch(`http://localhost:5000/api/artists/${id}`);
        console.log('📡 Réponse artiste (artists):', artistResponse.status, artistResponse.statusText);
        
        if (!artistResponse.ok) {
          // Si pas trouvé, essayer l'endpoint des utilisateurs
          console.log('🔄 Tentative avec l\'endpoint utilisateurs...');
          artistResponse = await fetch(`http://localhost:5000/api/users/${id}`);
          console.log('📡 Réponse artiste (users):', artistResponse.status, artistResponse.statusText);
        }
        
        if (artistResponse.ok) {
          const artistData = await artistResponse.json();
          console.log('✅ Artiste chargé:', artistData);
          setArtist(artistData.data || artistData);
        } else {
          console.error('❌ Erreur chargement artiste:', artistResponse.status);
          const errorText = await artistResponse.text();
          console.error('❌ Détails de l\'erreur:', errorText);
          
          // Créer un artiste par défaut si non trouvé
          setArtist({
            _id: id,
            username: 'Artiste inconnu',
            name: 'Artiste inconnu',
            bio: 'Aucune information disponible',
            profilePicture: null,
            role: 'artist'
          });
        }

        // Charger les chansons de l'artiste
        console.log('🎵 Recherche des chansons de l\'artiste:', id);
        const songsResponse = await fetch(`http://localhost:5000/api/artists/${id}/songs`);
        console.log('📡 Réponse chansons:', songsResponse.status, songsResponse.statusText);
        
        if (songsResponse.ok) {
          const songsData = await songsResponse.json();
          console.log('✅ Chansons chargées:', songsData);
          setTopTracks(songsData.data || songsData || []);
        } else {
          console.log('ℹ️ Aucune chanson trouvée pour cet artiste');
          const errorText = await songsResponse.text();
          console.log('ℹ️ Détails de l\'erreur chansons:', errorText);
          setTopTracks([]);
        }

        // Charger les albums de l'artiste
        console.log('💿 Recherche des albums de l\'artiste:', id);
        const albumsResponse = await fetch(`http://localhost:5000/api/artists/${id}/albums`);
        console.log('📡 Réponse albums:', albumsResponse.status, albumsResponse.statusText);
        
        if (albumsResponse.ok) {
          const albumsData = await albumsResponse.json();
          console.log('✅ Albums chargés:', albumsData);
          setAlbums(albumsData.data || albumsData || []);
        } else {
          console.log('ℹ️ Aucun album trouvé pour cet artiste');
          const errorText = await albumsResponse.text();
          console.log('ℹ️ Détails de l\'erreur albums:', errorText);
          setAlbums([]);
        }

        // Pour l'instant, pas d'artistes similaires
        setRelatedArtists([]);

      } catch (e) {
        console.error('❌ Erreur chargement artiste/top tracks:', e);
        toast.error("Impossible de charger les titres de l'artiste");
      } finally {
        setTracksLoading(false);
        setAlbumsLoading(false);
      }
    };

    loadArtist();
  }, [id]);

  const handlePlaySong = (track) => {
    if (!track?.audioUrl) {
      toast.error("Fichier audio non disponible pour cette piste");
      return;
    }
    const song = {
      _id: track._id,
      title: track.title,
      artist: track.artist?.username || artist?.username || 'Artiste inconnu',
      cover: track.coverImage ? `http://localhost:5000${track.coverImage}` : null,
      album: track.album || '',
      duration: track.duration || 0,
      audioUrl: `http://localhost:5000${track.audioUrl}`,
    };
    playTrack(song);
    setIsPlaying(true);
    toast.success(`Lecture de ${track.title}`);
  };

  const handleAddToQueue = (track) => {
    if (!track?.audioUrl) {
      toast.error("Fichier audio non disponible pour cette piste");
      return;
    }
    const song = {
      _id: track._id,
      title: track.title,
      artist: track.artist?.username || artist?.username || 'Artiste inconnu',
      cover: track.coverImage ? `http://localhost:5000${track.coverImage}` : null,
      album: track.album || '',
      duration: track.duration || 0,
      audioUrl: `http://localhost:5000${track.audioUrl}`,
    };
    addToQueue(song);
    toast.success('Ajouté à la file d\'attente');
  };

  const handleToggleFollow = () => {
    setIsFollowing(!isFollowing);
    toast.success(isFollowing ? 'Désabonné' : 'Abonné');
  };

  const handleSubscribe = () => {
    if (!artist) return;
    
    const subscribedArtists = JSON.parse(localStorage.getItem('subscribedArtists') || '[]');
    
    if (isSubscribed) {
      // Désabonner
      const updatedArtists = subscribedArtists.filter(a => a.id !== artist.id);
      localStorage.setItem('subscribedArtists', JSON.stringify(updatedArtists));
      setIsSubscribed(false);
      toast.success(`Désabonné de ${artist.name}`);
    } else {
      // S'abonner
      const newSubscribedArtist = {
        id: artist.id,
        name: artist.name,
        picture: artist.picture || artist.cover,
        nb_fan: artist.nb_fan,
        date: new Date().toISOString()
      };
      const updatedArtists = [...subscribedArtists, newSubscribedArtist];
      localStorage.setItem('subscribedArtists', JSON.stringify(updatedArtists));
      setIsSubscribed(true);
      toast.success(`Abonné à ${artist.name} ! Vous recevrez les notifications.`);
    }
  };

  const handlePlayArtist = () => {
    if (topTracks.length > 0) {
      handlePlaySong(topTracks[0]);
    }
  };

  const handleShowMore = () => {
    // Afficher 10 pistes de plus, ou toutes si moins de 10 restent
    const remaining = topTracks.length - displayedTracks;
    if (remaining <= 10) {
      setDisplayedTracks(topTracks.length); // Afficher toutes les pistes
    } else {
      setDisplayedTracks(prev => prev + 10); // Afficher 10 de plus
    }
  };

  if (!artist) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Chargement de l'artiste...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pb-48 md:pb-32">
      {/* Header avec bouton retour seulement - Style Spotify */}
      <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-xl border-b border-gray-800/50">
        <div className="px-6 py-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-white" />
          </button>
        </div>
      </div>

      {/* Bannière de l'artiste - Style Spotify exact */}
      <div className="relative h-96">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black"></div>
        <img
          src={artist.profilePicture ? `http://localhost:5000${artist.profilePicture}` : `https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200&h=400&fit=crop&crop=center`}
          alt={artist.username || artist.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = `https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200&h=400&fit=crop&crop=center`;
          }}
        />
        
        {/* Badge Artiste vérifié - Style Spotify */}
        <div className="absolute top-6 left-6 flex items-center space-x-2 bg-blue-500/90 backdrop-blur-sm px-3 py-1 rounded-full">
          <CheckCircle className="h-4 w-4 text-white" />
          <span className="text-xs font-medium text-white">Artiste vérifié</span>
        </div>

        {/* Informations de l'artiste - Style Spotify */}
        <div className="absolute bottom-6 left-6 right-6">
          <h1 className="text-5xl font-bold mb-2 text-white">
            {artist?.username || artist?.name || 'Artiste'}
          </h1>
          <p className="text-gray-300 text-lg mb-2">
            {topTracks.length} chanson{topTracks.length > 1 ? 's' : ''} • {albums.length} album{albums.length > 1 ? 's' : ''}
          </p>
          {artist?.bio && (
            <p className="text-gray-300 text-sm max-w-2xl line-clamp-2">
              {artist.bio}
            </p>
          )}
        </div>
      </div>

      {/* Actions (favori comme Spotify) */}
      <div className="px-6 pt-3">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleToggleFollow}
            className={`p-3 rounded-full transition-colors ${
              isFollowing ? 'bg-green-500 text-black' : 'bg-gray-800 text-white hover:bg-gray-700'
            }`}
            aria-label={isFollowing ? 'Retirer des favoris' : 'Ajouter aux favoris'}
            title={isFollowing ? 'Retirer des favoris' : 'Ajouter aux favoris'}
          >
            <Heart className={`h-5 w-5 ${isFollowing ? 'fill-current' : ''}`} />
          </button>
          
          {/* Nouveau bouton S'abonner */}
          <button
            onClick={handleSubscribe}
            className={`px-4 py-3 rounded-full transition-colors ${
              isSubscribed ? 'bg-red-500 text-white hover:bg-red-400' : 'bg-green-500 text-black font-medium hover:bg-green-400'
            }`}
            aria-label={isSubscribed ? 'Désabonner' : 'S\'abonner'}
            title={isSubscribed ? 'Désabonner' : 'S\'abonner'}
          >
            {isSubscribed ? 'Désabonner' : 'S\'abonner'}
          </button>
          
          <button className="p-3 rounded-full bg-gray-800 text-white hover:bg-gray-700" aria-label="Partager">
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17V7h2v7.17l3.59-3.59L17 10l-5 5z"/>
            </svg>
          </button>
          <button className="p-3 rounded-full bg-gray-800 text-white hover:bg-gray-700" aria-label="Plus d'options">
            <MoreHorizontal className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Bouton de lecture principal - Style Spotify exact */}
      <div className="px-6 pt-4">
        <button
          onClick={handlePlayArtist}
          className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center shadow-xl hover:scale-105 hover:bg-green-400 transition-all duration-200"
          aria-label="Lecture aléatoire"
        >
          <Play className="h-8 w-8 text-black ml-1" />
        </button>
      </div>

      {/* Logo de l'app */}
      <div className="px-6 pt-3">
        <div className="flex items-center space-x-2">
          <img src="/icons/LogoS.svg" alt="SoundWave" className="w-6 h-6" />
          <span className="text-gray-400 text-sm">SoundWave</span>
        </div>
      </div>

      {/* Description de l'artiste - Style Spotify */}
      <div className="px-6 pt-2">
        <p className="text-gray-300 text-sm leading-relaxed">
          {artist.name} est un artiste urbain marocain qui mélange avec brio le rap traditionnel et les sonorités modernes. 
          Ses textes percutants et ses mélodies entraînantes ont conquis des millions d'auditeurs à travers le monde.
        </p>
      </div>

      {/* Statistiques de l'artiste - Style Spotify */}
      <div className="px-6 pt-4">
        <div className="flex items-center space-x-6 text-sm">
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-gray-400" />
            <span className="text-gray-400">
              {artist?.monthlyListeners ? artist.monthlyListeners.toLocaleString('fr-FR') : 
               artist?.nb_fan ? artist.nb_fan.toLocaleString('fr-FR') : 
               Math.floor(Math.random() * 500000 + 100000).toLocaleString('fr-FR')} auditeurs mensuels
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Music className="w-4 h-4 text-gray-400" />
            <span className="text-gray-400">
              {topTracks.length} titres populaires
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Disc className="w-4 h-4 text-gray-400" />
            <span className="text-gray-400">
              {albums.length} albums
            </span>
          </div>
        </div>
      </div>

      {/* Section Chansons populaires - Style Spotify exact avec numérotation 1-5 */}
      <div className="px-6 py-6">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">Populaires</h2>
          {tracksLoading ? (
            <div className="text-gray-400">Chargement des titres…</div>
          ) : topTracks.length === 0 ? (
            <div className="text-center py-12">
              <Music className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Aucune chanson disponible</h3>
              <p className="text-gray-400">Cet artiste n'a pas encore publié de chansons</p>
            </div>
          ) : (
            <>
              {/* Liste compacte mobile comme Spotify */}
              <div className="md:hidden divide-y divide-gray-800 rounded-lg overflow-hidden bg-transparent">
                {topTracks.slice(0, displayedTracks).map((track, index) => (
                  <div key={track._id} className="flex items-center px-3 py-3 hover:bg-gray-800/50 transition-colors">
                    <span className="w-6 text-gray-400 mr-3 text-sm font-medium">{index + 1}</span>
                    <div className="w-12 h-12 rounded bg-gray-800 overflow-hidden mr-3 flex-shrink-0">
                      <img 
                        src={track.coverImage ? `http://localhost:5000${track.coverImage}` : 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100&h=100&fit=crop'} 
                        alt={track.title} 
                        className="w-full h-full object-cover" 
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100&h=100&fit=crop';
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-white text-sm font-medium truncate">{track.title}</div>
                      <div className="text-gray-400 text-xs truncate">{track.album || 'Album inconnu'}</div>
                    </div>
                    <div className="ml-3 flex items-center space-x-3">
                      <button onClick={() => handleToggleLike(track)} className="text-gray-300 hover:text-white transition-colors">
                        <Heart className="h-4 w-4" />
                      </button>
                      <button onClick={() => handlePlaySong(track)} className="w-8 h-8 rounded-full bg-green-500 text-black flex items-center justify-center hover:scale-105 transition-transform">
                        <Play className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Liste desktop actuelle */}
              <div className="hidden md:block space-y-1">
                {topTracks.slice(0, displayedTracks).map((track, index) => (
                  <div 
                    key={track._id} 
                    className="group flex items-center p-4 rounded-lg hover:bg-gray-800/50 transition-colors cursor-pointer"
                  >
                    <div className="w-8 h-8 flex items-center justify-center text-gray-400 group-hover:text-white transition-colors font-medium flex-shrink-0 mr-8">
                      {index + 1}
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg overflow-hidden flex-shrink-0 mr-12">
                      <img 
                        src={track.coverImage ? `http://localhost:5000${track.coverImage}` : 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100&h=100&fit=crop'} 
                        alt={track.title} 
                        className="w-full h-full object-cover" 
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100&h=100&fit=crop';
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0 mr-8">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium text-white truncate">{track.title}</h3>
                      </div>
                      <p className="text-sm text-gray-400 truncate">{track.album || 'Album inconnu'}</p>
                    </div>
                    <div className="flex items-center space-x-8 text-sm text-gray-400 flex-shrink-0">
                      <span className="hidden lg:block w-24 text-right mr-8">{track.plays || '—'}</span>
                      <span className="w-16 text-right mr-8">{formatDuration(track.duration)}</span>
                      <div className="flex items-center space-x-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={(e) => { e.stopPropagation(); handlePlaySong(track); }} className="p-2 rounded-full bg-green-500 hover:bg-green-400 transition-colors">
                          <Play className="h-4 w-4 text-black ml-0.5" />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleAddToQueue(track); }} className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors">
                          <Music2 className="h-4 w-4 text-white" />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleToggleLike(track); }} className={`p-2 rounded-full transition-colors ${likedTracks.includes(String(track._id)) ? 'bg-red-500 hover:bg-red-400' : 'bg-gray-700 hover:bg-gray-600'}`}>
                          <Heart className={`h-4 w-4 ${likedTracks.includes(String(track._id)) ? 'text-white fill-white' : 'text-white'}`} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {topTracks.length === 0 && (<div className="text-gray-400">Aucun titre disponible.</div>)}
              {topTracks.length > displayedTracks && (
                <button onClick={handleShowMore} className="text-gray-400 hover:text-white text-sm font-medium mt-4 px-4 py-2 rounded-lg hover:bg-gray-800/50 transition-all duration-200 flex items-center space-x-2">
                  <span>Afficher plus</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              )}
            </>
          )}
        </div>

        {/* Section Discographie - Style Spotify exact */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">Discographie</h2>
          
          {/* Tabs - Style Spotify */}
          <div className="flex space-x-8 mb-6 border-b border-gray-800">
            {[
              { key: 'popular', label: 'Sorties populaires' },
              { key: 'albums', label: 'Albums' },
              { key: 'singles', label: 'Singles et EP' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveFilter(tab.key)}
                className={`pb-2 font-medium transition-colors ${
                  activeFilter === tab.key
                    ? 'text-white border-b-2 border-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Albums/Releases - Style Spotify avec scroll horizontal */}
          {albumsLoading ? (
            <div className="text-gray-400">Chargement des albums...</div>
          ) : (
            <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide">
              {(() => {
                const filteredAlbums = albums.filter(album => {
                  const shouldInclude = (() => {
                    switch (activeFilter) {
                      case 'popular':
                        return true; // Tous les albums
                      case 'albums':
                        return album.genre && album.genre.includes('Album');
                      case 'singles':
                        return album.genre && (album.genre.includes('Single') || album.genre.includes('EP'));
                      default:
                        return true;
                    }
                  })();
                  
                  console.log(`Album "${album.title}" (genre: ${album.genre}) - Filter: ${activeFilter} - Include: ${shouldInclude}`);
                  return shouldInclude;
                });
                
                console.log('=== FILTER DEBUG ===');
                console.log('Active filter:', activeFilter);
                console.log('Total albums:', albums.length);
                console.log('Filtered albums:', filteredAlbums.length);
                console.log('All album genres:', albums.map(a => a.genre));
                console.log('Filtered album genres:', filteredAlbums.map(a => a.genre));
                console.log('Albums count by genre:', {
                  'Album': albums.filter(a => a.genre && a.genre.includes('Album')).length,
                  'Single': albums.filter(a => a.genre && a.genre.includes('Single')).length,
                  'EP': albums.filter(a => a.genre && a.genre.includes('EP')).length
                });
                console.log('=== END FILTER DEBUG ===');
                
                if (filteredAlbums.length === 0) {
                  return (
                    <div className="w-full text-center py-8">
                      <p className="text-gray-400 text-lg">
                        {activeFilter === 'albums' && 'Aucun album trouvé'}
                        {activeFilter === 'singles' && 'Aucun single ou EP trouvé'}
                        {activeFilter === 'popular' && 'Aucun album trouvé'}
                      </p>
                    </div>
                  );
                }
                
                return filteredAlbums.map((album, index) => (
                  <div key={album._id} className="flex-shrink-0 w-48 group cursor-pointer">
                    <div className="relative mb-3">
                      <div className="aspect-square bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg overflow-hidden border border-gray-700 group-hover:border-green-500 transition-all duration-300 shadow-xl group-hover:shadow-green-500/25">
                        <img
                          src={album.coverImage ? `http://localhost:5000${album.coverImage}` : `https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop&v=${index + 1}`}
                          alt={album.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.target.src = `https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop&v=${index + 1}`;
                          }}
                        />
                      </div>
                      
                      {/* Bouton play - Style Spotify */}
                      <button 
                        onClick={() => {
                          // Jouer la première chanson de l'album si disponible
                          if (album.songs && album.songs.length > 0) {
                            handlePlaySong(album.songs[0]);
                          } else {
                            toast.error('Aucune chanson disponible dans cet album');
                          }
                        }}
                        className="absolute bottom-3 right-3 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 hover:bg-green-400 shadow-2xl"
                      >
                        <Play className="h-6 w-6 text-black ml-0.5" />
                      </button>
                    </div>
                    
                    <h3 className="font-bold text-sm mb-1 truncate group-hover:text-green-400 transition-colors text-white">
                      {album.title}
                    </h3>
                    <p className="text-sm text-gray-400 truncate">
                      {album.releaseYear || new Date().getFullYear()} • {album.genre || 'Album'}
                    </p>
                  </div>
                ));
              })()}
            </div>
          )}
          
          {albums.length > 0 && (
            <button className="text-gray-400 hover:text-white text-sm font-medium mt-4 flex items-center">
              Tout afficher <ChevronRight className="h-4 w-4 ml-1" />
            </button>
          )}
        </div>

        {/* Section "Avec [nom]" - Style Spotify */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">Avec {artist.name}</h2>
          <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide">
            {[
              { 
                id: '1',
                title: `This Is ${artist.name}`, 
                subtitle: `${artist.name}. Les titres incontournables, réunis...`, 
                cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop&v=80',
                type: 'Playlist'
              },
              { 
                id: '2',
                title: `Radio ${artist.name}`, 
                subtitle: 'Avec Inkonnu, Shaw, Snor et bien d\'autres...', 
                cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop&v=81',
                type: 'Playlist'
              },
              { 
                id: '3',
                title: 'Hit Maghribi', 
                subtitle: 'From Morocco to the world. Cover: 7ari,..', 
                cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop&v=82',
                type: 'Playlist'
              },
              { 
                id: '4',
                title: 'ABATERA', 
                subtitle: `Cover: ${artist.name}`, 
                cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop&v=83',
                type: 'Playlist'
              },
              { 
                id: '5',
                title: 'Hot Hits Morocco', 
                subtitle: 'Les hits du moment. Cover: TIF, ElGrandeToto', 
                cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop&v=84',
                type: 'Playlist'
              },
              { 
                id: '6',
                title: 'SEHD', 
                subtitle: 'Vibrez au rythme des morceaux urbains et Af..', 
                cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop&v=85',
                type: 'Playlist'
              },
              { 
                id: '7',
                title: 'Moroccan Rap Essentials', 
                subtitle: 'Les titres cultes du Hip-Hop Marocain...', 
                cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop&v=86',
                type: 'Playlist'
              },
              { 
                id: '8',
                title: 'Urban Vibes Morocco', 
                subtitle: 'Le meilleur du rap urbain marocain...', 
                cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop&v=87',
                type: 'Playlist'
              }
            ].map((playlist, index) => (
              <div key={playlist.id} className="flex-shrink-0 w-48 group cursor-pointer">
                <div className="relative mb-3">
                  <div className="aspect-square bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg overflow-hidden border border-gray-700 group-hover:border-green-500 transition-all duration-300 shadow-xl group-hover:shadow-green-500/25">
                    <img
                      src={playlist.cover}
                      alt={playlist.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  
                  <button className="absolute bottom-3 right-3 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 hover:bg-green-400 shadow-2xl">
                    <Play className="h-6 w-6 text-black ml-0.5" />
                  </button>
                </div>
                
                <h3 className="font-bold text-sm mb-1 truncate group-hover:text-green-400 transition-colors text-white">
                  {playlist.title}
                </h3>
                <p className="text-sm text-gray-400 truncate leading-tight">
                  {playlist.subtitle}
                </p>
              </div>
            ))}
          </div>
          
          <button className="text-gray-400 hover:text-white text-sm font-medium mt-4 flex items-center">
            Tout afficher <ChevronRight className="h-4 w-4 ml-1" />
          </button>
        </div>

        {/* Section "Plus d'infos" - Style Spotify amélioré */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">Plus d'infos</h2>
          
          {/* Carte principale améliorée - Style Spotify */}
          <div className="bg-gray-800/50 rounded-lg p-8 border border-gray-700/50 hover:bg-gray-800/70 transition-all duration-300 cursor-pointer group" onClick={() => setShowMoreInfo(!showMoreInfo)}>
            <div className="flex items-start space-x-16">
              {/* Image circulaire plus grande - Style amélioré */}
              <div className="w-40 h-40 bg-white rounded-full overflow-hidden flex-shrink-0 shadow-2xl group-hover:scale-105 transition-transform duration-300">
                <img
                  src={artist.picture || artist.cover || `https://picsum.photos/400/400?random=artist`}
                  alt={artist.name}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Informations améliorées */}
              <div className="flex-1 ml-8">
                <h3 className="text-4xl font-bold mb-8 text-white group-hover:text-blue-400 transition-colors duration-300">{artist.name}</h3>
                <p className="text-gray-300 text-xl mb-8">
                  {artist?.monthlyListeners ? artist.monthlyListeners.toLocaleString('fr-FR') : 
                   artist?.nb_fan ? artist.nb_fan.toLocaleString('fr-FR') : 
                   Math.floor(Math.random() * 500000 + 100000).toLocaleString('fr-FR')} auditeurs mensuels
                </p>
                
                {/* Indicateur pour plus d'infos */}
                <div className="flex items-center space-x-3 text-blue-400 group-hover:text-blue-300 transition-colors duration-300">
                  <span className="text-sm font-medium">
                    {showMoreInfo ? 'Masquer les détails' : 'Cliquer pour plus d\'infos'}
                  </span>
                  <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${showMoreInfo ? 'rotate-180' : ''}`} />
                </div>
              </div>
            </div>
            
            {/* Informations détaillées - Affichage conditionnel */}
            {showMoreInfo && (
              <div className="mt-10 pt-8 border-t border-gray-700/50 animate-in slide-in-from-top-2 duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="flex items-center space-x-4">
                      <Mail className="w-6 h-6 text-blue-400" />
                      <div>
                        <p className="text-gray-400 text-sm font-medium mb-1">Contact Business</p>
                        <p className="text-white text-base">contact@{artist?.username?.toLowerCase() || artist?.name?.toLowerCase() || 'artiste'}.com</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <Music className="w-6 h-6 text-green-400" />
                      <div>
                        <p className="text-gray-400 text-sm font-medium mb-1">Genre Principal</p>
                        <p className="text-white text-base">
                          {topTracks.length > 0 && topTracks[0]?.genre ? topTracks[0].genre : 'Hip-Hop, Rap, Urban'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <MapPin className="w-6 h-6 text-red-400" />
                      <div>
                        <p className="text-gray-400 text-sm font-medium mb-1">Localisation</p>
                        <p className="text-white text-base">Morocco</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="flex items-center space-x-4">
                      <Disc className="w-6 h-6 text-purple-400" />
                      <div>
                        <p className="text-gray-400 text-sm font-medium mb-1">Label</p>
                        <p className="text-white text-base">Independent</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <Calendar className="w-6 h-6 text-yellow-400" />
                      <div>
                        <p className="text-gray-400 text-sm font-medium mb-1">Début de carrière</p>
                        <p className="text-white text-base">2018</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <Users className="w-6 h-6 text-pink-400" />
                      <div>
                        <p className="text-gray-400 text-sm font-medium mb-1">Auditeurs mensuels</p>
                        <p className="text-white text-base">
                          {artist?.monthlyListeners ? artist.monthlyListeners.toLocaleString('fr-FR') : 
                           artist?.nb_fan ? artist.nb_fan.toLocaleString('fr-FR') : 
                           Math.floor(Math.random() * 500000 + 100000).toLocaleString('fr-FR')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Section "Découvert sur" - Style Spotify amélioré */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">Découvert sur</h2>
          <div className="flex space-x-4 overflow-x-auto pb-4">
            {[
              { 
                title: 'Ek Tha Raja', 
                subtitle: '2024 • Album', 
                cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop&v=60',
                type: 'Album'
              },
              { 
                title: 'ICEBERG', 
                subtitle: '2024 • Album', 
                cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop&v=61',
                type: 'Album'
              },
              { 
                title: '101', 
                subtitle: '2025 • Album', 
                cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop&v=62',
                type: 'Album'
              },
              { 
                title: 'Hybrid', 
                subtitle: '2024 • Album', 
                cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop&v=63',
                type: 'Album',
                explicit: true
              },
              { 
                title: 'PIZZA KEBAB Vol. 1', 
                subtitle: '2023 • Album', 
                cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop&v=64',
                type: 'Album',
                explicit: true
              },
              { 
                title: 'Moroccan Dream', 
                subtitle: '2020 • Album', 
                cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop&v=65',
                type: 'Album'
              },
              { 
                title: 'Urban Vibes', 
                subtitle: '2023 • EP', 
                cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop&v=66',
                type: 'EP'
              },
              { 
                title: 'Street Poetry', 
                subtitle: '2022 • Album', 
                cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop&v=67',
                type: 'Album'
              }
            ].map((release, index) => (
              <div key={index} className="flex-shrink-0 w-48 group cursor-pointer">
                <div className="relative mb-3">
                  <div className="aspect-square bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg overflow-hidden border border-gray-700 group-hover:border-green-500 transition-all duration-300 shadow-xl group-hover:shadow-green-500/25">
                    <img
                      src={release.cover}
                      alt={release.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    
                    {/* Badge Explicit si nécessaire */}
                    {release.explicit && (
                      <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded font-medium">
                        E
                      </div>
                    )}
                  </div>
                  
                  {/* Bouton play - Style Spotify */}
                  <button className="absolute bottom-3 right-3 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 hover:bg-green-400 shadow-2xl">
                    <Play className="h-6 w-6 text-black ml-0.5" />
                  </button>
                </div>
                
                <h3 className="font-bold text-sm mb-1 truncate group-hover:text-green-400 transition-colors text-white">
                  {release.title}
                </h3>
                <p className="text-sm text-gray-400 truncate">
                  {release.subtitle}
                </p>
              </div>
            ))}
          </div>
          
          <button className="text-gray-400 hover:text-white text-sm font-medium mt-4 flex items-center">
            Tout afficher <ChevronRight className="h-4 w-4 ml-1" />
          </button>
        </div>

        {/* Section "Les fans aiment aussi" - Style Spotify avec vraies images */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">Les fans aiment aussi</h2>
          <div className="flex space-x-4 overflow-x-auto pb-4">
            {relatedArtists.map((relatedArtist, index) => (
              <div key={relatedArtist.id} className="flex-shrink-0 text-center group cursor-pointer">
                <div className="w-24 h-24 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full overflow-hidden mb-3 group-hover:border-2 group-hover:border-green-500 transition-all duration-300">
                  <img
                    src={relatedArtist.picture || `https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop&v=${index + 30}`}
                    alt={relatedArtist.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                
                <h3 className="font-medium text-sm text-white group-hover:text-green-400 transition-colors">
                  {relatedArtist.name}
                </h3>
                <p className="text-xs text-gray-400">Artiste</p>
              </div>
            ))}
          </div>
          
          <button className="text-gray-400 hover:text-white text-sm font-medium mt-4 flex items-center">
            Tout afficher <ChevronRight className="h-4 w-4 ml-1" />
          </button>
        </div>

        {/* Section "Playlists recommandées" - Style Spotify */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">Playlists recommandées</h2>
          <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide">
            {[
              { 
                title: 'Moroccan Hip-Hop Mix', 
                subtitle: 'Le meilleur du rap marocain', 
                cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop&v=90',
                type: 'Playlist'
              },
              { 
                title: 'Urban Morocco', 
                subtitle: 'Vibes urbaines du Maroc', 
                cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop&v=91',
                type: 'Playlist'
              },
              { 
                title: 'Rap Essentials', 
                subtitle: 'Les classiques du rap', 
                cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop&v=92',
                type: 'Playlist'
              },
              { 
                title: 'Moroccan Vibes', 
                subtitle: 'Culture et musique du Maroc', 
                cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop&v=93',
                type: 'Playlist'
              }
            ].map((playlist, index) => (
              <div key={index} className="flex-shrink-0 w-48 group cursor-pointer">
                <div className="relative mb-3">
                  <div className="aspect-square bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg overflow-hidden border border-gray-700 group-hover:border-green-500 transition-all duration-300 shadow-xl group-hover:shadow-green-500/25">
                    <img
                      src={playlist.cover}
                      alt={playlist.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  
                  <button className="absolute bottom-3 right-3 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 hover:bg-green-400 shadow-2xl">
                    <Play className="h-6 w-6 text-black ml-0.5" />
                  </button>
                </div>
                
                <h3 className="font-bold text-sm mb-1 truncate group-hover:text-green-400 transition-colors text-white">
                  {playlist.title}
                </h3>
                <p className="text-sm text-gray-400 truncate leading-tight">
                  {playlist.subtitle}
                </p>
              </div>
            ))}
          </div>
          
          <button className="text-gray-400 hover:text-white text-sm font-medium mt-4 flex items-center">
            Tout afficher <ChevronRight className="h-4 w-4 ml-1" />
          </button>
        </div>

        {/* Section "Apparaît sur" - Style Spotify amélioré */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">Apparaît sur</h2>
          <div className="flex space-x-4 overflow-x-auto pb-4">
            {[
              { 
                title: 'Colors', 
                year: '2021', 
                type: 'Album', 
                cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop&v=70',
                artist: 'Various Artists'
              },
              { 
                title: 'Moroccan Dream', 
                year: '2020', 
                type: 'Album', 
                cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop&v=71',
                artist: 'Morocco Collective'
              },
              { 
                title: 'VENOM', 
                year: '2022', 
                type: 'Album', 
                cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop&v=72',
                artist: 'Urban Records'
              },
              { 
                title: 'BALA W FAS', 
                year: '2025', 
                type: 'Album', 
                cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop&v=73',
                artist: 'Moroccan Vibes'
              },
              { 
                title: 'Ghandirha', 
                year: '2020', 
                type: 'Single', 
                cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop&v=74',
                artist: 'Hip-Hop Morocco'
              },
              { 
                title: '6 Fi9', 
                year: '2023', 
                type: 'Single', 
                cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop&v=75',
                artist: 'Urban Morocco'
              }
            ].map((release, index) => (
              <div key={index} className="flex-shrink-0 w-48 group cursor-pointer">
                <div className="relative mb-3">
                  <div className="aspect-square bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg overflow-hidden border border-gray-700 group-hover:border-green-500 transition-all duration-300">
                    <img
                      src={release.cover}
                      alt={release.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  
                  <button className="absolute bottom-3 right-3 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 hover:bg-green-400 shadow-2xl">
                    <Play className="h-6 w-6 text-black ml-0.5" />
                  </button>
                </div>
                
                <h3 className="font-bold text-sm mb-1 truncate group-hover:text-green-400 transition-colors text-white">
                  {release.title}
                </h3>
                <p className="text-sm text-gray-400 truncate">
                  {release.artist} • {release.year} • {release.type}
                </p>
              </div>
            ))}
          </div>
          
          <button className="text-gray-400 hover:text-white text-sm font-medium mt-4 flex items-center">
            Tout afficher <ChevronRight className="h-4 w-4 ml-1" />
          </button>
        </div>

        {/* Section finale - Informations supplémentaires */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">Informations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-800/30 rounded-lg p-6 border border-gray-700/50">
              <h3 className="text-lg font-semibold mb-4 text-white">Biographie</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                {artist?.bio || 
                 `${artist?.username || artist?.name || 'Cet artiste'} est un talent musical qui s'est fait connaître grâce à son style unique et ses créations originales. ${artist?.username || artist?.name || 'L\'artiste'} a commencé sa carrière musicale et continue de captiver son public avec des mélodies entraînantes et des textes percutants.`}
              </p>
            </div>
            
            <div className="bg-gray-800/30 rounded-lg p-6 border border-gray-700/50">
              <h3 className="text-lg font-semibold mb-4 text-white">Récompenses</h3>
              <div className="space-y-2 text-sm text-gray-300">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>Meilleur artiste urbain 2024</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>Album de l'année - ICEBERG</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>Révélation de l'année 2020</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section finale - Liens sociaux et contact */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">Liens et contact</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-800/30 rounded-lg p-6 border border-gray-700/50">
              <h3 className="text-lg font-semibold mb-4 text-white">Réseaux sociaux</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center space-x-3 text-gray-300 hover:text-white transition-colors cursor-pointer">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">f</span>
                  </div>
                  <span>Facebook</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-300 hover:text-white transition-colors cursor-pointer">
                  <div className="w-8 h-8 bg-blue-400 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">t</span>
                  </div>
                  <span>Twitter</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-300 hover:text-white transition-colors cursor-pointer">
                  <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">ig</span>
                  </div>
                  <span>Instagram</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800/30 rounded-lg p-6 border border-gray-700/50">
              <h3 className="text-lg font-semibold mb-4 text-white">Contact professionnel</h3>
              <div className="space-y-3 text-sm text-gray-300">
                <div className="flex items-center space-x-3">
                  <Mail className="w-4 h-4 text-green-400" />
                  <span>contact@{artist.name?.toLowerCase()}.com</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="w-4 h-4 text-green-400" />
                  <span>+212 6 XX XX XX XX</span>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="w-4 h-4 text-green-400" />
                  <span>Casablanca, Maroc</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800/30 rounded-lg p-6 border border-gray-700/50">
              <h3 className="text-lg font-semibold mb-4 text-white">Statistiques</h3>
              <div className="space-y-3 text-sm text-gray-300">
                <div className="flex justify-between">
                  <span>Écoutes totales</span>
                  <span className="font-semibold">2.5M+</span>
                </div>
                <div className="flex justify-between">
                  <span>Abonnés</span>
                  <span className="font-semibold">150K+</span>
                </div>
                <div className="flex justify-between">
                  <span>Pays</span>
                  <span className="font-semibold">45+</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        


      </div>
    </div>
  );
};

export default Artist; 