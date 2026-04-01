const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';

const invitationService = {
  joinChamaByCode: async (inviteCode, role = 'member') => {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${API_BASE_URL}/invitation/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ inviteCode, role })
    });

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message);
    }
    
    return data.data;
  },

  getChamaByInviteCode: async (inviteCode) => {
    const response = await fetch(`${API_BASE_URL}/invitation/lookup/${inviteCode}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message);
    }
    
    return data.data;
  },

  regenerateInviteCode: async (chamaId) => {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${API_BASE_URL}/invitation/regenerate/${chamaId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message);
    }
    
    return data.data;
  }
};

export default invitationService;
