import api from './api';

const invitationService = {
  joinChamaByCode: async (inviteCode, role = 'member') => {
    const response = await api.post('/invitation/join', { inviteCode, role });
    return response.data.data;
  },

  getChamaByInviteCode: async (inviteCode) => {
    const response = await api.get(`/invitation/lookup/${inviteCode}`);
    return response.data.data;
  },

  regenerateInviteCode: async (chamaId) => {
    const response = await api.post(`/invitation/regenerate/${chamaId}`);
    return response.data.data;
  }
};

export default invitationService;
