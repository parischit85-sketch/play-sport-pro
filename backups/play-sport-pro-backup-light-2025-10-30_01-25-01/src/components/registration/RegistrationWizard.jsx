// =============================================
// FILE: src/components/registration/RegistrationWizard.jsx
// Multi-step registration wizard with progress tracking
// =============================================
import React, { useState, useEffect } from 'react';
import PasswordStrengthMeter from './PasswordStrengthMeter';
import EmailValidator from './EmailValidator';
import PhoneInput from './PhoneInput';
import AddressAutocomplete from './AddressAutocomplete';
import DragDropUpload from './DragDropUpload';
import TermsOfService from './TermsOfService';

const STEPS = [
  { id: 1, title: 'Account', icon: '👤' },
  { id: 2, title: 'Dati Personali', icon: '📝' },
  { id: 3, title: 'Contatti', icon: '📱' },
  { id: 4, title: 'Conferma', icon: '✓' },
];

/**
 * Multi-step registration wizard
 * @param {Object} formData - Current form data
 * @param {Function} onChange - Callback when form data changes
 * @param {Function} onSubmit - Callback when form is submitted
 * @param {boolean} isClub - Whether registering as a club
 * @param {Object} errors - Validation errors
 */
export default function RegistrationWizard({
  formData,
  onChange,
  onSubmit,
  isClub = false,
  errors = {},
}) {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [stepErrors, setStepErrors] = useState({});

  // Update field value
  const handleFieldChange = (field, value) => {
    onChange({ ...formData, [field]: value });
  };

  // Validate current step
  const validateStep = (stepId) => {
    const stepErrors = {};

    switch (stepId) {
      case 1: // Account
        if (!formData.email) stepErrors.email = 'Email obbligatoria';
        if (!formData.password) stepErrors.password = 'Password obbligatoria';
        if (formData.password && formData.password.length < 6) {
          stepErrors.password = 'Password troppo corta (min 6 caratteri)';
        }
        break;

      case 2: // Dati Personali
        if (!formData.firstName) stepErrors.firstName = 'Nome obbligatorio';
        if (!formData.lastName) stepErrors.lastName = 'Cognome obbligatorio';
        if (isClub && !formData.clubName) {
          stepErrors.clubName = 'Nome circolo obbligatorio';
        }
        break;

      case 3: // Contatti
        if (!formData.phone) stepErrors.phone = 'Telefono obbligatorio';
        if (!formData.address) stepErrors.address = 'Indirizzo obbligatorio';
        break;

      case 4: // Conferma
        if (!formData.termsAccepted) {
          stepErrors.termsAccepted = 'Devi accettare i termini';
        }
        break;

      default:
        break;
    }

    return stepErrors;
  };

  // Go to next step
  const handleNext = () => {
    const errors = validateStep(currentStep);
    if (Object.keys(errors).length > 0) {
      setStepErrors({ ...stepErrors, [currentStep]: errors });
      return;
    }

    // Mark step as completed
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps([...completedSteps, currentStep]);
    }

    // Clear errors
    setStepErrors({ ...stepErrors, [currentStep]: {} });

    // Move to next step
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  // Go to previous step
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Go to specific step (only if already completed)
  const handleStepClick = (stepId) => {
    if (completedSteps.includes(stepId) || stepId <= currentStep) {
      setCurrentStep(stepId);
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate all steps
    let hasErrors = false;
    const allErrors = {};

    STEPS.forEach((step) => {
      const errors = validateStep(step.id);
      if (Object.keys(errors).length > 0) {
        allErrors[step.id] = errors;
        hasErrors = true;
      }
    });

    if (hasErrors) {
      setStepErrors(allErrors);
      // Go to first step with errors
      const firstErrorStep = Object.keys(allErrors)[0];
      setCurrentStep(parseInt(firstErrorStep));
      return;
    }

    onSubmit(formData);
  };

  return (
    <div className="registration-wizard">
      {/* Progress Bar */}
      <div className="progress-container">
        <div className="steps">
          {STEPS.map((step, index) => (
            <React.Fragment key={step.id}>
              <div
                className={`step ${currentStep === step.id ? 'active' : ''} ${
                  completedSteps.includes(step.id) ? 'completed' : ''
                }`}
                onClick={() => handleStepClick(step.id)}
              >
                <div className="step-icon">{step.icon}</div>
                <div className="step-title">{step.title}</div>
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className={`step-connector ${
                    completedSteps.includes(step.id) ? 'completed' : ''
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <form onSubmit={handleSubmit} className="wizard-form">
        {/* Step 1: Account */}
        {currentStep === 1 && (
          <div className="step-content">
            <h3>Crea il tuo Account</h3>

            <div className="form-group">
              <label>Email *</label>
              <EmailValidator
                email={formData.email || ''}
                onChange={(value) => handleFieldChange('email', value)}
                onValidationChange={(validation) => {
                  if (!validation?.isValid) {
                    setStepErrors({
                      ...stepErrors,
                      [currentStep]: {
                        ...stepErrors[currentStep],
                        email: validation?.error || 'Email non valida',
                      },
                    });
                  }
                }}
              />
              {stepErrors[currentStep]?.email && (
                <span className="error">{stepErrors[currentStep].email}</span>
              )}
            </div>

            <div className="form-group">
              <label>Password *</label>
              <input
                type="password"
                value={formData.password || ''}
                onChange={(e) => handleFieldChange('password', e.target.value)}
                className="form-input"
              />
              <PasswordStrengthMeter
                password={formData.password || ''}
                onStrengthChange={(strength) => {
                  handleFieldChange('passwordStrength', strength);
                }}
              />
              {stepErrors[currentStep]?.password && (
                <span className="error">{stepErrors[currentStep].password}</span>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Personal Data */}
        {currentStep === 2 && (
          <div className="step-content">
            <h3>Dati Personali</h3>

            {isClub && (
              <div className="form-group">
                <label>Nome Circolo *</label>
                <input
                  type="text"
                  value={formData.clubName || ''}
                  onChange={(e) => handleFieldChange('clubName', e.target.value)}
                  className="form-input"
                />
                {stepErrors[currentStep]?.clubName && (
                  <span className="error">{stepErrors[currentStep].clubName}</span>
                )}
              </div>
            )}

            <div className="form-row">
              <div className="form-group">
                <label>Nome *</label>
                <input
                  type="text"
                  value={formData.firstName || ''}
                  onChange={(e) => handleFieldChange('firstName', e.target.value)}
                  className="form-input"
                />
                {stepErrors[currentStep]?.firstName && (
                  <span className="error">{stepErrors[currentStep].firstName}</span>
                )}
              </div>

              <div className="form-group">
                <label>Cognome *</label>
                <input
                  type="text"
                  value={formData.lastName || ''}
                  onChange={(e) => handleFieldChange('lastName', e.target.value)}
                  className="form-input"
                />
                {stepErrors[currentStep]?.lastName && (
                  <span className="error">{stepErrors[currentStep].lastName}</span>
                )}
              </div>
            </div>

            {isClub && (
              <div className="form-group">
                <label>Logo Circolo</label>
                <DragDropUpload
                  onFileSelect={(file) => handleFieldChange('logo', file)}
                  currentImage={formData.logoPreview}
                />
              </div>
            )}
          </div>
        )}

        {/* Step 3: Contact Info */}
        {currentStep === 3 && (
          <div className="step-content">
            <h3>Informazioni di Contatto</h3>

            <div className="form-group">
              <label>Telefono *</label>
              <PhoneInput
                value={formData.phone || ''}
                onChange={(value) => handleFieldChange('phone', value)}
                country="IT"
                onValidationChange={(validation) => {
                  if (!validation?.isValid) {
                    setStepErrors({
                      ...stepErrors,
                      [currentStep]: {
                        ...stepErrors[currentStep],
                        phone: validation?.error || 'Telefono non valido',
                      },
                    });
                  }
                }}
              />
              {stepErrors[currentStep]?.phone && (
                <span className="error">{stepErrors[currentStep].phone}</span>
              )}
            </div>

            <div className="form-group">
              <label>Indirizzo *</label>
              <AddressAutocomplete
                value={formData.address || ''}
                onChange={(value) => handleFieldChange('address', value)}
                onAddressSelect={(addressData) => {
                  handleFieldChange('addressDetails', addressData);
                  handleFieldChange('city', addressData.city);
                  handleFieldChange('province', addressData.province);
                  handleFieldChange('postalCode', addressData.postalCode);
                }}
                placeholder="Via, Numero Civico, Città"
              />
              {stepErrors[currentStep]?.address && (
                <span className="error">{stepErrors[currentStep].address}</span>
              )}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Città</label>
                <input
                  type="text"
                  value={formData.city || ''}
                  onChange={(e) => handleFieldChange('city', e.target.value)}
                  className="form-input"
                  disabled
                />
              </div>

              <div className="form-group">
                <label>Provincia</label>
                <input
                  type="text"
                  value={formData.province || ''}
                  onChange={(e) => handleFieldChange('province', e.target.value)}
                  className="form-input"
                  maxLength="2"
                  disabled
                />
              </div>

              <div className="form-group">
                <label>CAP</label>
                <input
                  type="text"
                  value={formData.postalCode || ''}
                  onChange={(e) => handleFieldChange('postalCode', e.target.value)}
                  className="form-input"
                  maxLength="5"
                  disabled
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Confirmation */}
        {currentStep === 4 && (
          <div className="step-content">
            <h3>Conferma Registrazione</h3>

            <div className="summary">
              <h4>Riepilogo Dati</h4>
              <div className="summary-item">
                <strong>Email:</strong> {formData.email}
              </div>
              <div className="summary-item">
                <strong>Nome:</strong> {formData.firstName} {formData.lastName}
              </div>
              {isClub && (
                <div className="summary-item">
                  <strong>Circolo:</strong> {formData.clubName}
                </div>
              )}
              <div className="summary-item">
                <strong>Telefono:</strong> {formData.phone}
              </div>
              <div className="summary-item">
                <strong>Indirizzo:</strong> {formData.address}
              </div>
            </div>

            <div className="form-group">
              <TermsOfService
                accepted={formData.termsAccepted || false}
                onAcceptanceChange={(accepted, timestamp) => {
                  handleFieldChange('termsAccepted', accepted);
                  handleFieldChange('termsAcceptedAt', timestamp);
                }}
              />
              {stepErrors[currentStep]?.termsAccepted && (
                <span className="error">{stepErrors[currentStep].termsAccepted}</span>
              )}
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="wizard-actions">
          {currentStep > 1 && (
            <button type="button" onClick={handleBack} className="btn-back">
              ← Indietro
            </button>
          )}

          {currentStep < STEPS.length ? (
            <button type="button" onClick={handleNext} className="btn-next">
              Avanti →
            </button>
          ) : (
            <button type="submit" className="btn-submit">
              Completa Registrazione
            </button>
          )}
        </div>
      </form>

      <style jsx>{`
        .registration-wizard {
          max-width: 800px;
          margin: 0 auto;
          padding: 2rem 1rem;
        }

        .progress-container {
          margin-bottom: 3rem;
        }

        .steps {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .step {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          flex: 1;
          max-width: 120px;
        }

        .step-icon {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background-color: var(--color-bg-light, #f0f0f0);
          color: var(--color-text-light, #999);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          transition: all 0.3s ease;
          border: 2px solid transparent;
        }

        .step.active .step-icon {
          background-color: var(--color-primary, #007bff);
          color: white;
          border-color: var(--color-primary, #007bff);
          transform: scale(1.1);
        }

        .step.completed .step-icon {
          background-color: var(--color-success, #4caf50);
          color: white;
        }

        .step-title {
          font-size: 0.875rem;
          color: var(--color-text-light, #666);
          text-align: center;
        }

        .step.active .step-title {
          color: var(--color-primary, #007bff);
          font-weight: 600;
        }

        .step-connector {
          flex: 1;
          height: 2px;
          background-color: var(--color-bg-light, #e0e0e0);
          margin: 0 0.5rem;
          margin-top: -24px;
        }

        .step-connector.completed {
          background-color: var(--color-success, #4caf50);
        }

        .wizard-form {
          background-color: white;
          padding: 2rem;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .step-content {
          min-height: 400px;
        }

        .step-content h3 {
          font-size: 1.5rem;
          margin-bottom: 1.5rem;
          color: var(--color-text, #333);
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-group label {
          display: block;
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: var(--color-text, #333);
        }

        .form-input {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid var(--color-border, #ccc);
          border-radius: 6px;
          font-size: 1rem;
        }

        .form-input:focus {
          outline: none;
          border-color: var(--color-primary, #007bff);
        }

        .form-input:disabled {
          background-color: var(--color-bg-disabled, #f5f5f5);
          cursor: not-allowed;
        }

        .form-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 1rem;
        }

        .error {
          display: block;
          color: var(--color-error, #dc3545);
          font-size: 0.875rem;
          margin-top: 0.25rem;
        }

        .summary {
          padding: 1.5rem;
          background-color: var(--color-bg-light, #f9f9f9);
          border-radius: 8px;
          margin-bottom: 1.5rem;
        }

        .summary h4 {
          margin-top: 0;
          margin-bottom: 1rem;
          color: var(--color-text, #333);
        }

        .summary-item {
          margin-bottom: 0.75rem;
          font-size: 1rem;
        }

        .summary-item strong {
          color: var(--color-text-light, #666);
          margin-right: 0.5rem;
        }

        .wizard-actions {
          display: flex;
          justify-content: space-between;
          gap: 1rem;
          margin-top: 2rem;
          padding-top: 1.5rem;
          border-top: 1px solid var(--color-border, #e0e0e0);
        }

        .btn-back,
        .btn-next,
        .btn-submit {
          padding: 0.75rem 2rem;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
        }

        .btn-back {
          background-color: transparent;
          color: var(--color-text, #333);
          border: 1px solid var(--color-border, #ccc);
        }

        .btn-back:hover {
          background-color: var(--color-bg-light, #f5f5f5);
        }

        .btn-next,
        .btn-submit {
          background-color: var(--color-primary, #007bff);
          color: white;
          margin-left: auto;
        }

        .btn-next:hover,
        .btn-submit:hover {
          background-color: var(--color-primary-dark, #0056b3);
          transform: translateY(-2px);
        }

        /* Mobile responsive */
        @media (max-width: 768px) {
          .registration-wizard {
            padding: 1rem 0.5rem;
          }

          .wizard-form {
            padding: 1.5rem 1rem;
          }

          .step-title {
            font-size: 0.75rem;
          }

          .step-icon {
            width: 40px;
            height: 40px;
            font-size: 1.25rem;
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          .wizard-actions {
            flex-direction: column;
          }

          .btn-next,
          .btn-submit {
            margin-left: 0;
          }
        }

        /* Dark mode */
        @media (prefers-color-scheme: dark) {
          .wizard-form {
            background-color: var(--color-bg-dark, #2a2a2a);
          }

          .summary {
            background-color: var(--color-bg-dark-light, #333);
          }
        }
      `}</style>
    </div>
  );
}

