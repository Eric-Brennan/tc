// ============================================================
// Backward-compat re-export — use './therapist' directly
// ============================================================
export {
  listTherapists,
  getTherapistById,
  getCurrentTherapist,
  getCurrentTherapistExtended,
  updateTherapistProfile,
  updateTherapistExtendedProfile,
} from './therapist/profileService';

export {
  createSessionRate,
  updateSessionRate,
  deleteSessionRate,
} from './therapist/sessionRateService';

export {
  updateAvailability,
  getAvailability,
} from './therapist/availabilityService';
