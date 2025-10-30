// =============================================
// FILE: src/components/registration/PostRegistrationOnboarding.jsx
// Post-Registration Onboarding Wizard
// Guides users through initial setup after club creation
// =============================================

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getOnboardingTasks } from '@services/club-registration.js';
import { ArrowRight, CheckCircle2, Clock } from 'lucide-react';

export default function PostRegistrationOnboarding({ clubId, clubName }) {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const tasks = getOnboardingTasks();
  const [completedTasks, setCompletedTasks] = useState(new Set());

  const handleCompleteTask = (taskId) => {
    const newCompleted = new Set(completedTasks);
    newCompleted.add(taskId);
    setCompletedTasks(newCompleted);
  };

  const handleSkipTask = () => {
    if (currentStep < tasks.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleFinish();
    }
  };

  const handleFinish = () => {
    navigate(`/club/${clubId}/admin/dashboard`);
  };

  const currentTask = tasks[currentStep];
  const progress = Math.round(((currentStep + 1) / tasks.length) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 from-gray-900 via-gray-800 to-gray-900 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 text-white mb-2">
            Benvenuto in {clubName}!
          </h1>
          <p className="text-neutral-600 text-gray-300">
            Completa questi ultimi passaggi per iniziare
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-neutral-700 text-gray-300">
              Configurazione: {currentStep + 1} di {tasks.length}
            </p>
            <p className="text-sm font-semibold text-blue-600 text-blue-400">{progress}%</p>
          </div>
          <div className="w-full h-2 bg-gray-200 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Current Task */}
        <div className="bg-white bg-gray-800 rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-start gap-4 mb-6">
            <div className="text-5xl">{currentTask.icon}</div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-neutral-900 text-white mb-2">
                {currentTask.title}
              </h2>
              <p className="text-neutral-600 text-gray-300 mb-4">{currentTask.description}</p>
              <div className="flex items-center gap-4 text-sm text-gray-500 text-gray-400">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>Tempo stimato: {currentTask.timeEstimate}</span>
                </div>
                <div className="text-xs px-2 py-1 bg-blue-100 bg-blue-900/30 text-blue-700 text-blue-300 rounded">
                  Priorità {currentTask.priority}/3
                </div>
              </div>
            </div>
          </div>

          {/* Task Content */}
          <div className="bg-gray-50 bg-gray-700/50 rounded-lg p-6 mb-6">
            {currentTask.id === 'add-courts' && (
              <div className="space-y-3">
                <p className="text-sm text-neutral-700 text-gray-300">
                  Inizia aggiungendo i campi disponibili nel tuo circolo
                </p>
                <button
                  onClick={() => navigate(`/club/${clubId}/admin/courts`)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition-colors"
                >
                  Vai a Campi →
                </button>
              </div>
            )}

            {currentTask.id === 'add-instructors' && (
              <div className="space-y-3">
                <p className="text-sm text-neutral-700 text-gray-300">
                  Invita gli istruttori del tuo circolo
                </p>
                <button
                  onClick={() => navigate(`/club/${clubId}/admin/instructors`)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition-colors"
                >
                  Vai a Istruttori →
                </button>
              </div>
            )}

            {currentTask.id === 'verify-email' && (
              <div className="space-y-3">
                <p className="text-sm text-neutral-700 text-gray-300">
                  Controlla il tuo email e clicca il link di verifica che ti abbiamo inviato
                </p>
                <div className="bg-blue-50 bg-blue-900/20 border border-blue-200 border-blue-800 rounded p-3 text-sm text-blue-700 text-blue-300">
                  ℹ️ Non ricevi l&apos;email? Controlla la cartella spam o richiedine un altro
                </div>
              </div>
            )}

            {currentTask.id === 'set-availability' && (
              <div className="space-y-3">
                <p className="text-sm text-neutral-700 text-gray-300">
                  Imposta gli orari di disponibilità per i tuoi campi
                </p>
                <button
                  onClick={() => navigate(`/club/${clubId}/admin/availability`)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition-colors"
                >
                  Vai a Orari →
                </button>
              </div>
            )}

            {currentTask.id === 'setup-payment' && (
              <div className="space-y-3">
                <p className="text-sm text-neutral-700 text-gray-300">
                  Configura i metodi di pagamento per ricevere i pagamenti
                </p>
                <button
                  onClick={() => navigate(`/club/${clubId}/admin/payments`)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition-colors"
                >
                  Vai a Pagamenti →
                </button>
              </div>
            )}

            {currentTask.id === 'invite-members' && (
              <div className="space-y-3">
                <p className="text-sm text-neutral-700 text-gray-300">
                  Inizia a invitare i giocatori del tuo circolo
                </p>
                <button
                  onClick={() => navigate(`/club/${clubId}/admin/members`)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition-colors"
                >
                  Vai a Giocatori →
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={handleSkipTask}
            className="flex-1 border-2 border-gray-300 border-gray-600 text-neutral-700 text-gray-300 hover:bg-gray-50 hover:bg-gray-700 py-3 rounded-lg font-semibold transition-colors"
          >
            Salta per ora
          </button>
          <button
            onClick={() => {
              handleCompleteTask(currentTask.id);
              if (currentStep < tasks.length - 1) {
                setCurrentStep(currentStep + 1);
              } else {
                handleFinish();
              }
            }}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-5 h-5" />
            Completato
          </button>
        </div>

        {/* Tasks List */}
        <div className="mt-8 space-y-2">
          <p className="text-sm font-medium text-neutral-700 text-gray-300 mb-4">
            Tutti i compiti
          </p>
          <div className="grid gap-2">
            {tasks.map((task, index) => (
              <div
                key={task.id}
                className={`
                  p-3 rounded-lg flex items-center gap-3 cursor-pointer transition-all
                  ${
                    index === currentStep
                      ? 'bg-blue-100 bg-blue-900/30 border-2 border-blue-500'
                      : completedTasks.has(task.id)
                        ? 'bg-green-50 bg-green-900/20 border border-green-200 border-green-800'
                        : 'bg-gray-50 bg-gray-700/50 border border-gray-200 border-gray-600'
                  }
                `}
                onClick={() => setCurrentStep(index)}
              >
                <div className="text-xl">{task.icon}</div>
                <div className="flex-1">
                  <p className="font-medium text-neutral-900 text-white">{task.title}</p>
                </div>
                {completedTasks.has(task.id) && (
                  <CheckCircle2 className="w-5 h-5 text-green-600 text-green-400" />
                )}
                {index === currentStep && !completedTasks.has(task.id) && (
                  <div className="w-2 h-2 bg-blue-600 rounded-full" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Skip Onboarding */}
        <div className="mt-8 text-center">
          <button
            onClick={handleFinish}
            className="text-sm text-neutral-600 text-gray-400 hover:text-neutral-900 hover:text-white underline transition-colors"
          >
            Vai direttamente alla dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

