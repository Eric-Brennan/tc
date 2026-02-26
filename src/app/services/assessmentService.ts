// ============================================================
// Backward-compat re-export — use './client/assessmentService'
// and './therapist/sessionNoteService' directly
// ============================================================

// Assessments
export {
  listAssessments,
  getAssessmentById,
  createAssessment,
} from './client/assessmentService';

// Session Notes (therapist)
export {
  listSessionNotes,
  getSessionNoteById,
  createSessionNote,
  updateSessionNote,
  deleteSessionNote,
} from './therapist/sessionNoteService';

// Client Notes
export {
  listClientNotes,
  createClientNote,
} from './client/noteService';
