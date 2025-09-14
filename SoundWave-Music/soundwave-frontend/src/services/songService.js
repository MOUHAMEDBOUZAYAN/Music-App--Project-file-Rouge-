import api from './api';

const songService = {
  // Uploader une chanson
  uploadSong: async (formData) => {
    console.log('🎵 Uploading song with formData:', formData);
    const response = await api.post('/songs', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    console.log('✅ Song uploaded successfully:', response.data);
    return response.data;
  },

  // Obtenir toutes les chansons
  getAllSongs: async (params = {}) => {
    const response = await api.get('/songs/all', { params });
    return response.data;
  },

  // Rechercher des chansons
  searchSongs: async (params = {}) => {
    try {
      console.log('🔍 Searching songs with params:', params);
      const response = await api.get('/search/songs', { params });
      console.log('🔍 Songs search response:', response.data);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('❌ Error searching songs:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Erreur lors de la recherche de chansons'
      };
    }
  },

  // Obtenir les chansons de l'utilisateur connecté
  getUserSongs: async (params = {}) => {
    const response = await api.get('/songs/user', { params });
    return response.data;
  },

  // Supprimer une chanson
  deleteSong: async (songId) => {
    const response = await api.delete(`/songs/${songId}`);
    return response.data;
  },

  // Obtenir les chansons tendance
  getTrendingSongs: async (params = {}) => {
    const response = await api.get('/songs/trending', { params });
    return response.data;
  },

  // Obtenir les chansons likées
  getLikedSongs: async () => {
    const response = await api.get('/songs/liked');
    return response.data;
  },

  // Rechercher des chansons (fonction alternative)
  searchSongsByQuery: async (query, params = {}) => {
    console.log('🔍 songService.searchSongsByQuery called with:', query);
    const response = await api.get('/search/songs', { 
      params: { q: query, ...params } 
    });
    console.log('🔍 songService response:', response.data);
    return response.data;
  },

  // Obtenir une chanson par ID
  getSongById: async (id) => {
    const response = await api.get(`/songs/${id}`);
    return response.data;
  },

  // Mettre à jour une chanson
  updateSong: async (id, data) => {
    const response = await api.put(`/songs/${id}`, data);
    return response.data;
  },

  // Supprimer une chanson
  deleteSong: async (id) => {
    const response = await api.delete(`/songs/${id}`);
    return response.data;
  },

  // Aimer/ne plus aimer une chanson
  likeSong: async (id) => {
    const response = await api.post(`/songs/${id}/like`);
    return response.data;
  },

  // Ajouter un commentaire
  addComment: async (id, content) => {
    const response = await api.post(`/songs/${id}/comment`, { content });
    return response.data;
  },
};

export { songService };