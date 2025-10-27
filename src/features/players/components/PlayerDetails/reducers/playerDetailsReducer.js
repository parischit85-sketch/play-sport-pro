// =============================================
// FILE: playerDetailsReducer.js
// State management centralizzato per PlayerDetails
// Creato: 2025-10-15 - Refactoring PlayerDetails (Task 1.2)
// =============================================

/**
 * Action types per reducer
 */
export const ACTIONS = {
  // Tab navigation
  SET_ACTIVE_TAB: 'SET_ACTIVE_TAB',
  
  // Edit mode
  TOGGLE_EDIT_MODE: 'TOGGLE_EDIT_MODE',
  CANCEL_EDIT: 'CANCEL_EDIT',
  UPDATE_FORM_FIELD: 'UPDATE_FORM_FIELD',
  SET_FORM_ERRORS: 'SET_FORM_ERRORS',
  CLEAR_ERRORS: 'CLEAR_ERRORS',
  
  // Account linking
  START_LINKING: 'START_LINKING',
  CANCEL_LINKING: 'CANCEL_LINKING',
  SET_ACCOUNTS: 'SET_ACCOUNTS',
  SET_ACCOUNT_SEARCH: 'SET_ACCOUNT_SEARCH',
  SET_LINK_EMAIL: 'SET_LINK_EMAIL',
  
  // Loading states
  SET_LOADING: 'SET_LOADING',
  
  // Success/Error
  SET_SUCCESS: 'SET_SUCCESS',
  SET_ERROR: 'SET_ERROR',
  CLEAR_MESSAGE: 'CLEAR_MESSAGE',
};

/**
 * Initial state
 */
export const createInitialState = (player) => ({
  // Tab state
  activeTab: 'overview',
  
  // Edit mode state
  isEditMode: false,
  editFormData: {},
  editErrors: {},
  isDirty: false,
  
  // Account linking state
  linking: {
    isOpen: false,
    email: '',
    search: '',
    accounts: [],
  },
  
  // Loading states
  loading: {
    saving: false,
    linking: false,
    unlinking: false,
    loadingAccounts: false,
  },
  
  // Messages
  successMessage: null,
  errorMessage: null,
});

/**
 * Helper: Deep set nested property
 */
function setNestedProperty(obj, path, value) {
  const keys = path.split('.');
  const lastKey = keys.pop();
  const target = keys.reduce((acc, key) => {
    if (!acc[key]) acc[key] = {};
    return acc[key];
  }, obj);
  target[lastKey] = value;
  return obj;
}

/**
 * Helper: Check if form is dirty
 */
function checkIsDirty(formData, originalPlayer) {
  // Simple shallow comparison for now
  // In production, use deep equality check
  return Object.keys(formData).some(
    key => formData[key] !== originalPlayer[key]
  );
}

/**
 * Main reducer
 */
export function playerDetailsReducer(state, action) {
  switch (action.type) {
    // ==================== TAB NAVIGATION ====================
    case ACTIONS.SET_ACTIVE_TAB:
      return {
        ...state,
        activeTab: action.payload,
      };

    // ==================== EDIT MODE ====================
    case ACTIONS.TOGGLE_EDIT_MODE: {
      const { player } = action.payload;
      
      if (state.isEditMode) {
        // Closing edit mode - check dirty state
        if (state.isDirty) {
          // Parent component should handle confirmation
          return state;
        }
        return {
          ...state,
          isEditMode: false,
          editFormData: {},
          editErrors: {},
          isDirty: false,
        };
      } else {
        // Opening edit mode - initialize form with robust fallbacks (legacy-safe)
        const fullName = player.name || player.displayName || player.userName || '';
        const derivedFirst = player.firstName || (fullName ? fullName.split(' ')[0] : '');
        const derivedLast =
          player.lastName || (fullName ? fullName.split(' ').slice(1).join(' ') : '');
        const resolvedEmail = player.email || player.linkedAccountEmail || '';
        const resolvedPhone = player.phone || player.userPhone || '';

        return {
          ...state,
          isEditMode: true,
          editFormData: {
            name: fullName,
            firstName: derivedFirst,
            lastName: derivedLast,
            email: resolvedEmail,
            phone: resolvedPhone,
            dateOfBirth: player.dateOfBirth || '',
            category: player.category || 'adult',
            gender: player.gender || 'male',
            fiscalCode: player.fiscalCode || '',
            address: {
              street: player.address?.street || '',
              city: player.address?.city || '',
              province: player.address?.province || '',
              postalCode: player.address?.postalCode || '',
              country: player.address?.country || 'Italia',
            },
            tags: player.tags || [],
            playingPreferences: Array.isArray(player.playingPreferences)
              ? player.playingPreferences
              : [],
            preferences: {
              emailNotifications: player.preferences?.emailNotifications ?? true,
              smsNotifications: player.preferences?.smsNotifications ?? false,
              whatsappNotifications: player.preferences?.whatsappNotifications ?? false,
            },
            isActive: player.isActive !== false,
            tournamentData: {
              isParticipant: player.tournamentData?.isParticipant ?? false,
            },
          },
          editErrors: {},
          isDirty: false,
        };
      }
    }

    case ACTIONS.CANCEL_EDIT:
      return {
        ...state,
        isEditMode: false,
        editFormData: {},
        editErrors: {},
        isDirty: false,
      };

    case ACTIONS.UPDATE_FORM_FIELD: {
      const { field, value } = action.payload;
      const newFormData = { ...state.editFormData };
      
      // Handle nested fields (e.g., 'address.city')
      if (field.includes('.')) {
        setNestedProperty(newFormData, field, value);
      } else {
        newFormData[field] = value;
      }

      return {
        ...state,
        editFormData: newFormData,
        isDirty: true, // Any change marks as dirty
        editErrors: {
          ...state.editErrors,
          [field]: undefined, // Clear error for this field
        },
      };
    }

    case ACTIONS.SET_FORM_ERRORS:
      return {
        ...state,
        editErrors: action.payload,
      };

    case ACTIONS.CLEAR_ERRORS:
      return {
        ...state,
        editErrors: {},
      };

    // ==================== ACCOUNT LINKING ====================
    case ACTIONS.START_LINKING:
      return {
        ...state,
        linking: {
          ...state.linking,
          isOpen: true,
          accounts: action.payload?.accounts || [],
        },
      };

    case ACTIONS.CANCEL_LINKING:
      return {
        ...state,
        linking: {
          isOpen: false,
          email: '',
          search: '',
          accounts: [],
        },
      };

    case ACTIONS.SET_ACCOUNTS:
      return {
        ...state,
        linking: {
          ...state.linking,
          accounts: action.payload,
        },
      };

    case ACTIONS.SET_ACCOUNT_SEARCH:
      return {
        ...state,
        linking: {
          ...state.linking,
          search: action.payload,
        },
      };

    case ACTIONS.SET_LINK_EMAIL:
      return {
        ...state,
        linking: {
          ...state.linking,
          email: action.payload,
        },
      };

    // ==================== LOADING STATES ====================
    case ACTIONS.SET_LOADING: {
      const loadingUpdates = action.payload;
      return {
        ...state,
        loading: {
          ...state.loading,
          ...loadingUpdates,
        },
      };
    }

    // ==================== MESSAGES ====================
    case ACTIONS.SET_SUCCESS:
      return {
        ...state,
        successMessage: action.payload,
        errorMessage: null,
      };

    case ACTIONS.SET_ERROR:
      return {
        ...state,
        errorMessage: action.payload,
        successMessage: null,
      };

    case ACTIONS.CLEAR_MESSAGE:
      return {
        ...state,
        successMessage: null,
        errorMessage: null,
      };

    default:
      return state;
  }
}

/**
 * Validation functions
 */
export function validateEditForm(formData) {
  const errors = {};

  // Email validation
  if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    errors.email = 'Email non valida';
  }

  // Phone validation (Italian format)
  if (formData.phone && !/^[+]?[0-9\s-()]{8,}$/.test(formData.phone)) {
    errors.phone = 'Telefono non valido';
  }

  // Fiscal code validation (Italian)
  if (formData.fiscalCode && formData.fiscalCode.length > 0 && formData.fiscalCode.length !== 16) {
    errors.fiscalCode = 'Codice fiscale deve essere 16 caratteri';
  }

  // Required fields
  if (!formData.firstName?.trim()) {
    errors.firstName = 'Nome obbligatorio';
  }

  if (!formData.lastName?.trim()) {
    errors.lastName = 'Cognome obbligatorio';
  }

  return errors;
}

/**
 * Action creators (optional helpers)
 */
export const actions = {
  setActiveTab: (tab) => ({
    type: ACTIONS.SET_ACTIVE_TAB,
    payload: tab,
  }),

  toggleEditMode: (player) => ({
    type: ACTIONS.TOGGLE_EDIT_MODE,
    payload: { player },
  }),

  cancelEdit: () => ({
    type: ACTIONS.CANCEL_EDIT,
  }),

  updateFormField: (field, value) => ({
    type: ACTIONS.UPDATE_FORM_FIELD,
    payload: { field, value },
  }),

  setFormErrors: (errors) => ({
    type: ACTIONS.SET_FORM_ERRORS,
    payload: errors,
  }),

  setLoading: (loadingStates) => ({
    type: ACTIONS.SET_LOADING,
    payload: loadingStates,
  }),

  setSuccess: (message) => ({
    type: ACTIONS.SET_SUCCESS,
    payload: message,
  }),

  setError: (message) => ({
    type: ACTIONS.SET_ERROR,
    payload: message,
  }),
};

export default playerDetailsReducer;
