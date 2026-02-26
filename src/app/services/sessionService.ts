// ============================================================
// Backward-compat re-export — use './shared/sessionService'
// and './therapist/workshopService' directly
// ============================================================
export {
  listVideoSessions,
  getVideoSessionById,
  createVideoSession,
  updateVideoSession,
  deleteVideoSession,
} from './shared/sessionService';

export {
  listWorkshops,
  getWorkshopById,
  createWorkshop,
  updateWorkshop,
  registerForWorkshop,
  unregisterFromWorkshop,
  deleteWorkshop,
} from './therapist/workshopService';
