import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Search, 
  Library, 
  Plus, 
  Heart, 
  Download, 
  User,
  ChevronRight,
  ChevronDown,
  Cog,
  Disc3,
  Users,
  Crown,
  BarChart3,
  Music,
  X
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useSidebar } from '../../store/SidebarContext';
import { useMusic } from '../../store/MusicContext';

const Sidebar = ({ isOpen, onToggle }) => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { isSidebarOpen } = useSidebar();
  // استخدام useMusic مع معالجة الأخطاء
  let likedTracks = [];
  try {
    const musicContext = useMusic();
    likedTracks = musicContext.likedTracks || [];
  } catch (error) {
    console.warn('MusicContext not available in Sidebar:', error);
    // استخدام localStorage كبديل
    try {
      const storedLiked = localStorage.getItem('likedTracks');
      if (storedLiked) {
        likedTracks = JSON.parse(storedLiked);
      }
    } catch (e) {
      console.warn('Could not load liked tracks from localStorage:', e);
    }
  }
  const [isLibraryExpanded, setIsLibraryExpanded] = useState(true);
  const [isUserExpanded, setIsUserExpanded] = useState(true);
  const [subscribedArtists, setSubscribedArtists] = useState([]);
  const [userPlaylists, setUserPlaylists] = useState([]);
  const [isSubscriptionsExpanded, setIsSubscriptionsExpanded] = useState(true);

  const isActive = (path) => location.pathname === path;

  // Charger les artistes abonnés
  useEffect(() => {
    const loadSubscribedArtists = async () => {
      try {
        // Essayer d'abord l'API
        const response = await fetch('http://localhost:5000/api/users/following', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token') || localStorage.getItem('authToken')}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('📱 Sidebar - API response:', data);
          const artists = data.following || [];
          
          // Traiter les données comme dans Library.jsx
          console.log('📱 Sidebar - Processing artists:', artists);
          const processedArtists = artists.map(artist => {
            console.log('📱 Sidebar - Processing individual artist:', {
              _id: artist._id,
              username: artist.username,
              profilePicture: artist.profilePicture
            });
            return {
            _id: artist._id,
            id: artist._id,
            name: artist.username || 'Artiste inconnu',
            avatar: artist.profilePicture ? 
              (artist.profilePicture.startsWith('http') ? 
                artist.profilePicture : 
                `http://localhost:5000${artist.profilePicture}`) : 
              `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face&${Math.random()}`,
            profilePicture: artist.profilePicture ? 
              (artist.profilePicture.startsWith('http') ? 
                artist.profilePicture : 
                `http://localhost:5000${artist.profilePicture}`) : 
              `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face&${Math.random()}`,
            followers: artist.followers ? artist.followers.length : Math.floor(Math.random() * 10000) + 1000,
            bio: artist.bio || ''
          };
          });
          
          setSubscribedArtists(processedArtists);
          console.log('📱 Sidebar - Processed artists:', processedArtists);
        } else {
          console.log('📱 Sidebar - API failed, using localStorage fallback');
          // Fallback vers localStorage
          const artists = JSON.parse(localStorage.getItem('subscribedArtists') || '[]');
          console.log('📱 Sidebar - localStorage fallback artists:', artists);
          setSubscribedArtists(artists);
        }
      } catch (error) {
        console.error('📱 Sidebar - Error loading subscribed artists:', error);
        // Fallback vers localStorage
        try {
          const artists = JSON.parse(localStorage.getItem('subscribedArtists') || '[]');
          setSubscribedArtists(artists);
        } catch (localError) {
          console.error('📱 Sidebar - localStorage fallback also failed:', localError);
          setSubscribedArtists([]);
        }
      }
    };

    loadSubscribedArtists();
    
    // Écouter les changements dans localStorage
    const handleStorageChange = () => {
      loadSubscribedArtists();
    };

    // Écouter les événements de follow/unfollow d'artistes
    const handleArtistFollowed = (event) => {
      console.log('📱 Sidebar - Artist followed event received:', event.detail);
      loadSubscribedArtists();
    };

    const handleArtistUnfollowed = (event) => {
      console.log('📱 Sidebar - Artist unfollowed event received:', event.detail);
      loadSubscribedArtists();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('localStorageChange', handleStorageChange);
    window.addEventListener('artistFollowed', handleArtistFollowed);
    window.addEventListener('artistUnfollowed', handleArtistUnfollowed);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('localStorageChange', handleStorageChange);
      window.removeEventListener('artistFollowed', handleArtistFollowed);
      window.removeEventListener('artistUnfollowed', handleArtistUnfollowed);
    };
  }, []);

  // Charger les playlists de l'utilisateur
  useEffect(() => {
    const loadUserPlaylists = () => {
      try {
        const playlists = JSON.parse(localStorage.getItem('userPlaylists') || '[]');
        console.log('📱 Sidebar - Loading playlists from localStorage:', playlists);
        setUserPlaylists(playlists);
        console.log('📱 Sidebar - Playlists loaded:', playlists.length);
      } catch (error) {
        console.error('Erreur lors du chargement des playlists:', error);
      }
    };

    loadUserPlaylists();
    
    // Écouter les changements dans localStorage
    const handleStorageChange = () => {
      console.log('📱 Sidebar - localStorageChange event received');
      loadUserPlaylists();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('localStorageChange', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('localStorageChange', handleStorageChange);
    };
  }, []);

  const handleLogout = () => {
    // Logique de déconnexion
    navigate('/login');
  };

  const handleProfileClick = () => {
    console.log('Profile clicked - navigating to /profile');
    console.log('Current user:', user);
    console.log('Current location:', location.pathname);
    navigate('/profile');
  };

  const handleSettingsClick = () => {
    console.log('Settings clicked - navigating to /settings');
    navigate('/settings');
  };

  const handleUnsubscribe = (artistId) => {
    const updatedArtists = subscribedArtists.filter(artist => artist._id !== artistId);
    setSubscribedArtists(updatedArtists);
    localStorage.setItem('subscribedArtists', JSON.stringify(updatedArtists));
    
    // Déclencher l'événement pour mettre à jour le sidebar
    window.dispatchEvent(new Event('localStorageChange'));
    
    console.log('🎤 Unsubscribed from artist:', artistId);
  };

  return (
    <>
    <div className={`
      fixed lg:static inset-y-0 left-0 z-[9998] 
      w-64 bg-black border-r border-gray-800/50
      transform transition-transform duration-300 ease-in-out
      ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
    `} style={{ margin: 0, padding: 0, marginLeft: 0, marginRight: 0 , height: '100%' }}>
      <div className="flex flex-col h-full">
        {/* Logo et navigation principale */}
        <div className="flex-shrink-0 p-6">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white" onClick={() => navigate('/')}>SoundWave</h1>
          </div>
          
          <nav className="space-y-2">
            <Link
              to="/"
              className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                isActive('/') 
                  ? 'bg-gray-800 text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              <Home className="h-5 w-5" />
              <span>Accueil</span>
            </Link>
            
            <Link
              to="/search"
              className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                isActive('/search') 
                  ? 'bg-gray-800 text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              <Search className="h-5 w-5" />
              <span>Rechercher</span>
            </Link>
            
            <Link
              to="/library"
              className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                isActive('/library') 
                  ? 'bg-gray-800 text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              <Library className="h-5 w-5" />
              <span>Votre Bibliothèque</span>
            </Link>
            
            <Link
              to="/subscriptions"
              className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                isActive('/subscriptions') 
                  ? 'bg-gray-800 text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              <Crown className="h-5 w-5" />
              <span>Abonnements</span>
            </Link>

            {/* Lien vers le tableau de bord artiste */}
            {(user?.role === 'artist' || user?.role === 'admin') && (
              <Link
                to="/artist-dashboard"
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive('/artist-dashboard') 
                    ? 'bg-gray-800 text-white' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                <BarChart3 className="h-5 w-5" />
                <span>Tableau de bord</span>
              </Link>
            )}
          </nav>
        </div>

        {/* Section Bibliothèque - avec flex-1 pour occuper l'espace disponible */}
        <div className="flex-1 px-6 overflow-y-auto">
          <div className="space-y-2">
            <button
              onClick={() => setIsLibraryExpanded(!isLibraryExpanded)}
              className="flex items-center justify-between w-full px-3 py-2 text-gray-400 hover:text-white transition-colors"
            >
              <span className="font-medium">Bibliothèque</span>
              {isLibraryExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
            
            {isLibraryExpanded && (
              <div className="ml-4 space-y-2">
                <Link
                  to="/create-playlist"
                  className="flex items-center space-x-3 px-3 py-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span className="text-sm">Créer une playlist</span>
                </Link>
                
                <Link
                  to="/liked-songs"
                  className="flex items-center space-x-3 px-3 py-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors"
                >
                  <Heart className="h-4 w-4" />
                  <span className="text-sm">Titres likés</span>
                  <span className="ml-auto text-xs bg-gray-700 px-2 py-1 rounded-full">
                    {likedTracks.length}
                  </span>
                </Link>

                {/* Artistes abonnés */}
                {subscribedArtists.length > 0 && (
                  <div className="space-y-1">
                    <div 
                      className="flex items-center justify-between px-3 py-1 cursor-pointer"
                      onClick={() => setIsSubscriptionsExpanded(!isSubscriptionsExpanded)}
                    >
                      <div className="text-xs text-gray-500 font-medium">
                        Artistes abonnés ({subscribedArtists.length})
                      </div>
                      {isSubscriptionsExpanded ? (
                        <ChevronDown className="h-3 w-3 text-gray-500" />
                      ) : (
                        <ChevronRight className="h-3 w-3 text-gray-500" />
                      )}
                    </div>
                    
                    {isSubscriptionsExpanded && (
                      <div className="space-y-1">
                        {subscribedArtists.slice(0, 5).map((artist) => {
                          console.log('📱 Sidebar - Rendering artist:', {
                            _id: artist._id,
                            name: artist.name,
                            profilePicture: artist.profilePicture
                          });
                          return (
                          <div
                            key={artist._id || artist.id}
                            className="group flex items-center space-x-3 px-3 py-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors"
                          >
                            <Link
                              to={`/artist/${artist._id || artist.id}`}
                              onClick={() => {
                                console.log('📱 Sidebar - Navigating to artist:', artist._id || artist.id, 'name:', artist.name);
                              }}
                              className="flex items-center space-x-3 flex-1 min-w-0"
                            >
                              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                                {artist.profilePicture ? (
                                  <img 
                                    src={artist.profilePicture}
                                    alt={artist.username || artist.name}
                                    className="w-full h-full rounded-full object-cover"
                                    onError={(e) => {
                                      console.log('📱 Sidebar - Image failed to load:', artist.profilePicture);
                                      e.target.style.display = 'none';
                                      e.target.nextSibling.style.display = 'flex';
                                    }}
                                    onLoad={() => {
                                      console.log('📱 Sidebar - Image loaded successfully:', artist.profilePicture);
                                    }}
                                  />
                                ) : null}
                                <span className="text-xs font-bold text-white hidden">
                                  {(artist.username || artist.name || 'A').charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <span className="text-sm truncate">{artist.username || artist.name}</span>
                            </Link>
                            
                            {/* Bouton de désabonnement */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUnsubscribe(artist._id || artist.id);
                              }}
                              className="opacity-0 group-hover:opacity-100 p-1 text-red-400 hover:text-red-300 transition-all"
                              title="Se désabonner"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                          );
                        })}
                        
                        {subscribedArtists.length > 5 && (
                          <div className="text-xs text-gray-500 px-3 py-1">
                            +{subscribedArtists.length - 5} autres...
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Playlists de l'utilisateur */}
                {userPlaylists.length > 0 && (
                  <div className="space-y-1">
                    <div className="text-xs text-gray-500 px-3 py-1 font-medium">
                      Mes playlists
                    </div>
                    {userPlaylists.map((playlist) => (
                      <Link
                        key={playlist._id || playlist.id}
                        to={`/playlist/${playlist._id || playlist.id}`}
                        className="flex items-center space-x-3 px-3 py-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors"
                      >
                        <Music className="h-4 w-4" />
                        <span className="text-sm truncate">{playlist.name}</span>
                        <span className="ml-auto text-xs bg-gray-700 px-2 py-1 rounded-full">
                          {playlist.songs?.length || 0}
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
                
                <Link
                  to="/downloads"
                  className="flex items-center space-x-3 px-3 py-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors"
                >
                  <Download className="h-4 w-4" />
                  <span className="text-sm">Téléchargements</span>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Section Utilisateur - collée en bas (sticky) */}
        <div className="mt-auto sticky bottom-0 bg-black p-4 pb-2 border-t border-gray-800/50">
          {/* Profil utilisateur principal */}
          <div className="p-3 bg-gray-800/50 rounded-lg mb-3">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-black font-bold text-sm">
                  {user?.username?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium text-sm truncate">
                  {user?.username || 'Utilisateur'}
                </p>
                <p className="text-gray-400 text-xs truncate">
                  {user?.email ? user.email.substring(0, 20) + '...' : 'email@example.com'}
                </p>
              </div>
              <button
                onClick={handleProfileClick}
                className="text-gray-400 hover:text-white transition-colors flex-shrink-0"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Options utilisateur simples */}
          <div className="space-y-2">
            <button
              onClick={handleProfileClick}
              className="w-full flex items-center space-x-2 px-3 py-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors text-left"
            >
              <User className="h-4 w-4" />
              <span className="text-sm">Profil</span>
            </button>
            
            <button
              onClick={handleSettingsClick}
              className="w-full flex items-center space-x-2 px-3 py-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors text-left"
            >
              <Cog className="h-4 w-4" />
              <span className="text-sm">Paramètres</span>
            </button>
          </div>
        </div>
      </div>
    </div>
    {/* Mobile bottom navigation removed per user request */}
    </>
  );
};

export default Sidebar;