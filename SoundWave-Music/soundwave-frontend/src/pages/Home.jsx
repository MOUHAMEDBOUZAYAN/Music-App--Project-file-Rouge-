import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Play, 
  Heart, 
  Plus,
  ArrowRight,
  TrendingUp,
  Clock,
  Music2
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useMusic } from '../store/MusicContext';
import { useDeezer } from '../store/DeezerContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Home = () => {
  const { user } = useAuth();
  const { playTrack, addToQueue, toggleLike, likedTracks } = useMusic();
  const { 
    newReleases, 
    featuredPlaylists, 
    popularAlbums, 
    popularArtists, 
    loading: deezerLoading, 
    error: deezerError 
  } = useDeezer();
  const navigate = useNavigate();
  
  const [currentFilter, setCurrentFilter] = useState('Tout');

  useEffect(() => {
    console.log('🔍 Home - État des données Deezer:');
    console.log('📀 newReleases:', newReleases);
    console.log('🎵 featuredPlaylists:', featuredPlaylists);
    console.log('💿 popularAlbums:', popularAlbums);
    console.log('👤 popularArtists:', popularArtists);
    console.log('⏳ loading:', deezerLoading);
    console.log('❌ error:', deezerError);
  }, [newReleases, featuredPlaylists, popularAlbums, popularArtists, deezerLoading, deezerError]);

  const handlePlaySong = (song) => {
    const deezerSong = {
      _id: song.id,
      title: song.title || song.name,
      artist: song.artist?.name || song.artists?.[0]?.name || 'Artiste inconnu',
      cover: song.cover || song.album?.cover || song.images?.[0]?.url,
      audioUrl: song.preview || song.preview_url,
      duration: song.duration || song.duration_ms,
      album: song.album?.title || song.album?.name,
      deezerId: song.id,
      isDeezer: true
    };
    
    playTrack(deezerSong);
    toast.success(`Lecture de ${deezerSong.title}`);
  };

  const handleAddToQueue = (song) => {
    const deezerSong = {
      _id: song.id,
      title: song.title || song.name,
      artist: song.artist?.name || song.artists?.[0]?.name || 'Artiste inconnu',
      cover: song.cover || song.album?.cover || song.images?.[0]?.url,
      audioUrl: song.preview || song.preview_url,
      duration: song.duration || song.duration_ms,
      album: song.album?.title || song.album?.name,
      deezerId: song.id,
      isDeezer: true
    };
    
    addToQueue(deezerSong);
    toast.success('Ajouté à la file d\'attente');
  };

  const handleToggleLike = (songId) => {
    toggleLike(songId);
  };

  if (deezerLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Chargement de votre musique...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bemusic-primary text-bemusic-primary overflow-x-hidden">
      {/* Header avec recherche */}
      <div className="sticky top-0 z-10 bg-bemusic-primary/95 backdrop-blur-sm border-b border-bemusic-tertiary/20">
        <div className="px-4 lg:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex space-x-2">
                <button className="p-2 rounded-full bg-bemusic-secondary hover:bg-bemusic-tertiary transition-colors">
                  <TrendingUp className="h-5 w-5" />
                </button>
                <button className="p-2 rounded-full bg-bemusic-secondary hover:bg-bemusic-tertiary transition-colors">
                  <Clock className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <div className="flex-1 max-w-2xl mx-4 lg:mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-bemusic-tertiary" />
                <input
                  type="text"
                  placeholder="Que souhaitez-vous écouter ou regarder ?"
                  className="w-full bg-bemusic-secondary text-bemusic-primary placeholder-bemusic-tertiary rounded-full pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent-bemusic"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button className="p-2 rounded-full bg-bemusic-secondary hover:bg-bemusic-tertiary transition-colors">
                <Music2 className="h-5 w-5" />
              </button>
              <div className="w-8 h-8 bg-gradient-to-r from-accent-bemusic to-blue-500 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-white">{user?.username?.charAt(0) || 'U'}</span>
              </div>
            </div>
          </div>

          {/* Filtres */}
          <div className="flex space-x-4 mt-4 overflow-x-auto pb-2">
            {['Tout', 'Musique', 'Podcasts', 'Deezer'].map((filter) => (
              <button
                key={filter}
                onClick={() => setCurrentFilter(filter)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                  currentFilter === filter
                    ? 'bg-accent-bemusic text-white'
                    : 'bg-bemusic-secondary text-bemusic-tertiary hover:bg-bemusic-tertiary hover:text-bemusic-primary'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="px-4 lg:px-6 py-6 lg:py-8 space-y-6 lg:space-y-8 pb-24">
        {/* Section Bienvenue */}
        <section>
          <h1 className="text-2xl lg:text-3xl font-bold mb-6">
            Bonjour, {user?.username || 'Utilisateur'} 🎵
          </h1>
          <p className="text-bemusic-tertiary">Découvrez la musique qui vous correspond sur Deezer</p>
        </section>

        {/* Section Artistes populaires */}
        {popularArtists.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-bemusic-primary">Artistes populaires</h2>
              <button className="text-sm text-bemusic-tertiary hover:text-bemusic-primary transition-colors flex items-center">
                Tout afficher <ArrowRight className="h-4 w-4 ml-1" />
              </button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
              {popularArtists.map((artist) => (
                <div key={artist.id} className="group cursor-pointer">
                  <div className="relative mb-3">
                    <div className="aspect-square bg-bemusic-tertiary/20 rounded-lg overflow-hidden border border-bemusic-tertiary/30">
                      <img
                        src={artist.picture || artist.cover || `https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop`}
                        alt={artist.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    </div>
                    
                    {/* Bouton play */}
                    <button 
                      onClick={() => handlePlaySong(artist)}
                      className="absolute bottom-2 right-2 w-12 h-12 bg-accent-bemusic rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110 hover:bg-accent-bemusic/80 shadow-lg"
                    >
                      <Play className="h-6 w-6 text-bemusic-primary ml-1" />
                    </button>
                  </div>
                  
                  <h3 className="font-semibold text-sm mb-1 truncate group-hover:text-accent-bemusic transition-colors text-bemusic-primary">
                    {artist.name}
                  </h3>
                  <p className="text-xs text-bemusic-tertiary truncate">
                    Artiste
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Section Nouvelles sorties */}
        {newReleases.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-bemusic-primary">Nouvelles sorties</h2>
              <button className="text-sm text-bemusic-tertiary hover:text-bemusic-primary transition-colors flex items-center">
                Tout afficher <ArrowRight className="h-4 w-4 ml-1" />
              </button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
              {newReleases.map((track) => (
                <div key={track.id} className="group cursor-pointer">
                  <div className="relative mb-3">
                    <div className="aspect-square bg-bemusic-tertiary/20 rounded-lg overflow-hidden border border-bemusic-tertiary/30">
                      <img
                        src={track.album?.cover || track.cover || `https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop`}
                        alt={track.title || track.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    </div>
                    
                    {/* Bouton play */}
                    <button 
                      onClick={() => handlePlaySong(track)}
                      className="absolute bottom-2 right-2 w-12 h-12 bg-accent-bemusic rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110 hover:bg-accent-bemusic/80 shadow-lg"
                    >
                      <Play className="h-6 w-6 text-bemusic-primary ml-1" />
                    </button>
                  </div>
                  
                  <h3 className="font-semibold text-sm mb-1 truncate group-hover:text-accent-bemusic transition-colors text-bemusic-primary">
                    {track.title || track.name}
                  </h3>
                  <p className="text-xs text-bemusic-tertiary truncate">
                    {track.artist?.name || 'Artiste inconnu'}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Section Playlists en vedette */}
        {featuredPlaylists.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-bemusic-primary">Playlists en vedette</h2>
              <button className="text-sm text-bemusic-tertiary hover:text-bemusic-primary transition-colors flex items-center">
                Tout afficher <ArrowRight className="h-4 w-4 ml-1" />
              </button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
              {featuredPlaylists.map((playlist) => (
                <div key={playlist.id} className="group cursor-pointer">
                  <div className="relative mb-3">
                    <div className="aspect-square bg-bemusic-tertiary/20 rounded-lg overflow-hidden border border-bemusic-tertiary/30">
                      <img
                        src={playlist.picture || playlist.cover || `https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop`}
                        alt={playlist.title || playlist.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    </div>
                    
                    {/* Bouton play */}
                    <button 
                      onClick={() => handlePlaySong(playlist)}
                      className="absolute bottom-2 right-2 w-12 h-12 bg-accent-bemusic rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110 hover:bg-accent-bemusic/80 shadow-lg"
                    >
                      <Play className="h-6 w-6 text-bemusic-primary ml-1" />
                    </button>
                  </div>
                  
                  <h3 className="font-semibold text-sm mb-1 truncate group-hover:text-accent-bemusic transition-colors text-bemusic-primary">
                    {playlist.title || playlist.name}
                  </h3>
                  <p className="text-xs text-bemusic-tertiary truncate">
                    {playlist.description || 'Playlist Deezer'}
                  </p>
                  {playlist.nb_tracks && (
                    <p className="text-xs text-bemusic-tertiary/70 mt-1">
                      {playlist.nb_tracks} chansons
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Message si pas de données */}
        {newReleases.length === 0 && popularArtists.length === 0 && featuredPlaylists.length === 0 && (
          <section className="text-center py-16">
            <div className="max-w-md mx-auto">
              <Music2 className="h-16 w-16 text-bemusic-tertiary mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-bemusic-primary mb-2">
                Aucune musique disponible
              </h3>
              <p className="text-bemusic-tertiary mb-6">
                Connectez-vous à Deezer pour découvrir de la musique personnalisée
              </p>
              <button 
                onClick={() => navigate('/spotify-login')}
                className="bg-accent-bemusic text-white px-6 py-3 rounded-full font-medium hover:bg-accent-bemusic/80 transition-colors"
              >
                Se connecter à Deezer
              </button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default Home; 