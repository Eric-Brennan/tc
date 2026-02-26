// ============================================================
// Backward-compat re-export — use './client' directly
// ============================================================
export {
  listClients,
  getClientById,
  getCurrentClient,
  updateClientProfile,
  followTherapist,
  unfollowTherapist,
} from './client/profileService';
