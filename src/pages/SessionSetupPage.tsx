import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useParticipantStore } from '../stores/participantStore';
import { useExerciseStore } from '../stores/exerciseStore';
import { useSessionStore } from '../stores/sessionStore';
import { Topbar } from '../components/layout/Topbar';
import { PageContainer } from '../components/layout/PageContainer';
import { Stepper } from '../components/layout/Stepper';
import { ParticipantStep } from '../components/participants/ParticipantStep';
import { ExerciseStep } from '../components/exercises/ExerciseStep';
import { SettingsStep } from '../components/session/SettingsStep';
import { Button } from '../components/ui/Button';

const steps = [
  { number: 1, label: 'Teilnehmer' },
  { number: 2, label: '\u00dcbungen' },
  { number: 3, label: 'Settings' },
];

export function SessionSetupPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { people, selectedIds, loadPeople } = useParticipantStore();
  const { sessionExercises, loadExercises } = useExerciseStore();
  const { createSession } = useSessionStore();
  const [step, setStep] = useState(1);

  useEffect(() => {
    if (!user) return;
    loadPeople(user.uid);
    loadExercises(user.uid);
  }, [user]);

  const canProceedStep1 = selectedIds.size > 0;
  const canProceedStep2 = sessionExercises.length > 0;

  const handleStart = () => {
    const selectedPeople = people.filter((p) => selectedIds.has(p.id));
    createSession(
      selectedPeople.map((p) => p.id),
      selectedPeople.map((p) => p.displayName),
      sessionExercises
    );
    navigate('/session/live');
  };

  return (
    <div className="min-h-screen">
      <Topbar />
      <PageContainer>
        <Stepper steps={steps} currentStep={step} />

        <div className="mt-6">
          {step === 1 && <ParticipantStep />}
          {step === 2 && <ExerciseStep />}
          {step === 3 && <SettingsStep />}
        </div>

        <div className="flex justify-between mt-8 pt-6 border-t-3 border-dark">
          <div>
            {step > 1 && (
              <Button variant="ghost" onClick={() => setStep(step - 1)}>
                Zur{'\u00fc'}ck
              </Button>
            )}
          </div>
          <div className="flex gap-3">
            {step < 3 && (
              <Button
                onClick={() => setStep(step + 1)}
                disabled={step === 1 ? !canProceedStep1 : !canProceedStep2}
              >
                Weiter
              </Button>
            )}
            {step === 3 && (
              <Button onClick={handleStart} disabled={!canProceedStep2}>
                Session starten!
              </Button>
            )}
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
