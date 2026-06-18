import React, { useState, useCallback } from 'react';
import type { DailyEntry, AppConfig } from '../../types';
import { getTodayStr } from '../../utils/dateUtils';
import { calculateScore } from '../../utils/scoring';
import Toggle from '../Common/Toggle';
import Slider from '../Common/Slider';
import Counter from '../Common/Counter';
import CheckInComplete from './CheckInComplete';

interface Props {
  config: AppConfig;
  existingEntry: DailyEntry | null;
  onComplete: (entry: DailyEntry) => void;
  onCancel: () => void;
}

type StepId =
  | 'sleptWell' | 'sleepHours' | 'water' | 'meditated'
  | 'meals' | 'focus'
  | 'exercised' | 'mealsCount' | 'moodNight' | 'moodWord' | 'compass';

interface Step {
  id: StepId;
  question: string;
  hint?: string;
  session: 'morning' | 'afternoon' | 'night';
}

const STEPS: Step[] = [
  { id: 'sleptWell', question: '¿Dormiste bien anoche?', hint: 'Cómo se sintió tu sueño', session: 'morning' },
  { id: 'sleepHours', question: '¿Cuántas horas dormiste?', session: 'morning' },
  { id: 'water', question: '¿Cuántos vasos de agua llevas hoy?', hint: 'Puedes actualizar esto en la noche', session: 'morning' },
  { id: 'meditated', question: '¿Meditaste hoy?', hint: 'Aunque sea 5 minutos cuenta', session: 'morning' },
  { id: 'meals', question: '¿Cómo va tu alimentación hoy?', session: 'afternoon' },
  { id: 'focus', question: '¿Cómo está tu enfoque hoy?', hint: '1 = muy disperso, 10 = totalmente concentrado', session: 'afternoon' },
  { id: 'exercised', question: '¿Hiciste ejercicio hoy?', hint: 'Caminar 30 min también cuenta', session: 'night' },
  { id: 'mealsCount', question: '¿Cuántas comidas saludables tuviste hoy?', hint: 'De un total de 5 (desayuno, snack, almuerzo, merienda, cena)', session: 'night' },
  { id: 'moodNight', question: '¿Cómo terminaste el día emocionalmente?', hint: '1 = muy mal, 10 = excelente', session: 'night' },
  { id: 'moodWord', question: 'En una palabra: ¿cómo te sientes ahora?', hint: 'Lo primero que se te viene a la mente', session: 'night' },
  { id: 'compass', question: '', session: 'night' }, // dynamic
];

function buildBlankEntry(date: string): DailyEntry {
  return {
    date,
    sleptWell: null,
    sleepHours: null,
    waterGlasses: 0,
    meditated: null,
    mealsCumplied: null,
    focus: null,
    exercised: null,
    mealsCount: null,
    mealFailReason: null,
    moodNight: null,
    moodWord: null,
    compassAnswer: null,
    score: null,
    sleepDetail: null,
    dietDetail: null,
    moodDetail: null,
    productivityDetail: null,
    wellbeingDetail: null,
    weeklyGood: null,
    weeklyBad: null,
    weeklyChange: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export default function CheckInFlow({ config, existingEntry, onComplete, onCancel }: Props) {
  const today = getTodayStr();
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<DailyEntry>(existingEntry ?? buildBlankEntry(today));
  const [showMealFailReason, setShowMealFailReason] = useState(false);
  const [done, setDone] = useState(false);
  const [finalEntry, setFinalEntry] = useState<DailyEntry | null>(null);

  const totalSteps = STEPS.length;
  const step = STEPS[currentStep];

  const update = useCallback(<K extends keyof DailyEntry>(key: K, value: DailyEntry[K]) => {
    setData((prev) => ({ ...prev, [key]: value }));
  }, []);

  const canContinue = (): boolean => {
    switch (step.id) {
      case 'sleptWell': return data.sleptWell !== null;
      case 'sleepHours': return data.sleepHours !== null;
      case 'water': return true;
      case 'meditated': return data.meditated !== null;
      case 'meals': return data.mealsCumplied !== null;
      case 'focus': return data.focus !== null;
      case 'exercised': return data.exercised !== null;
      case 'mealsCount': return data.mealsCount !== null;
      case 'moodNight': return data.moodNight !== null;
      case 'moodWord': return (data.moodWord?.trim().length ?? 0) > 0;
      case 'compass': return data.compassAnswer !== null;
      default: return true;
    }
  };

  const goNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      finish();
    }
  };

  const goBack = () => {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
    else onCancel();
  };

  const finish = () => {
    const entry: DailyEntry = {
      ...data,
      updatedAt: new Date().toISOString(),
    };
    const score = calculateScore(entry, config);
    entry.score = score;
    setFinalEntry(entry);
    setDone(true);
  };

  const handleDoneClose = () => {
    if (finalEntry) onComplete(finalEntry);
  };

  if (done && finalEntry) {
    return <CheckInComplete entry={finalEntry} config={config} onClose={handleDoneClose} />;
  }

  const progress = ((currentStep) / totalSteps) * 100;

  return (
    <div className="page" style={{ paddingBottom: 0 }}>
      {/* Header */}
      <div style={{ padding: '16px 20px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <button onClick={goBack} type="button" style={{ padding: '8px 0', color: 'var(--color-gray-600)', fontSize: 14 }}>
            ← Atrás
          </button>
          <span style={{ fontSize: 13, color: 'var(--color-gray-400)', fontWeight: 500 }}>
            {currentStep + 1} de {totalSteps}
          </span>
          <button onClick={onCancel} type="button" style={{ padding: '8px 0', color: 'var(--color-gray-400)', fontSize: 14 }}>
            Salir
          </button>
        </div>

        {/* Progress bar */}
        <div style={{ height: 3, background: 'var(--color-gray-200)', borderRadius: 2, overflow: 'hidden' }}>
          <div
            style={{
              height: '100%',
              width: `${progress}%`,
              background: 'var(--color-red)',
              borderRadius: 2,
              transition: 'width 200ms ease',
            }}
          />
        </div>

        {/* Step dots */}
        <div className="step-indicator" style={{ marginTop: 10, justifyContent: 'center' }}>
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`step-dot ${i < currentStep ? 'done' : ''}`}
              style={{
                width: i === currentStep ? 20 : 8,
                background: i === currentStep ? 'var(--color-red)' : i < currentStep ? 'var(--color-red)' : 'var(--color-gray-200)',
              }}
            />
          ))}
        </div>
      </div>

      {/* Step content */}
      <div className="checkin-step slide-enter" key={currentStep}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-red)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
            {step.session === 'morning' ? 'Mañana' : step.session === 'afternoon' ? 'Tarde' : 'Noche'}
          </div>
          <h2 className="checkin-question">
            {step.id === 'compass' ? `¿Hoy te acercaste a tu mejor versión?` : step.question}
          </h2>
          {step.id === 'compass' && config.compassQuestion && (
            <p style={{ fontSize: 14, color: 'var(--color-gray-600)', marginTop: 8, lineHeight: 1.5, fontStyle: 'italic' }}>
              "{config.compassQuestion}"
            </p>
          )}
          {step.hint && step.id !== 'compass' && (
            <p className="checkin-hint" style={{ marginTop: 6 }}>{step.hint}</p>
          )}
        </div>

        <div style={{ flex: 1 }}>
          <StepInput
            step={step}
            data={data}
            config={config}
            update={update}
            showMealFailReason={showMealFailReason}
            setShowMealFailReason={setShowMealFailReason}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingBottom: 24 }}>
          <button
            className="btn-primary"
            onClick={goNext}
            disabled={!canContinue()}
            type="button"
          >
            {currentStep === totalSteps - 1 ? 'Guardar mi día' : 'Continuar'}
          </button>
          {currentStep < totalSteps - 1 && (
            <button className="btn-ghost" onClick={goNext} type="button" style={{ textAlign: 'center' }}>
              Saltar por ahora
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

interface StepInputProps {
  step: Step;
  data: DailyEntry;
  config: AppConfig;
  update: <K extends keyof DailyEntry>(key: K, value: DailyEntry[K]) => void;
  showMealFailReason: boolean;
  setShowMealFailReason: (v: boolean) => void;
}

function StepInput({ step, data, config, update, showMealFailReason, setShowMealFailReason }: StepInputProps) {
  switch (step.id) {
    case 'sleptWell':
      return (
        <Toggle
          options={[
            { value: 'true', label: 'Sí, bien', type: 'yes' },
            { value: 'false', label: 'No mucho', type: 'no' },
          ]}
          value={data.sleptWell === null ? null : String(data.sleptWell)}
          onChange={(v) => update('sleptWell', v === 'true')}
        />
      );

    case 'sleepHours':
      return (
        <Slider
          min={0}
          max={12}
          step={0.5}
          value={data.sleepHours ?? config.sleepGoalHours}
          onChange={(v) => update('sleepHours', v)}
          valueFormat={(v) => `${v}h`}
          leftLabel="0h"
          rightLabel="12h"
        />
      );

    case 'water':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
          <Counter
            value={data.waterGlasses}
            min={0}
            max={20}
            onChange={(v) => update('waterGlasses', v)}
            suffix=" vasos"
          />
          <div style={{ fontSize: 13, color: 'var(--color-gray-400)' }}>
            Meta: {config.waterGoalGlasses} vasos
          </div>
          <div style={{ width: '100%', height: 8, background: 'var(--color-gray-100)', borderRadius: 4, overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: `${Math.min((data.waterGlasses / config.waterGoalGlasses) * 100, 100)}%`,
                background: data.waterGlasses >= config.waterGoalGlasses ? 'var(--color-green)' : 'var(--color-red)',
                borderRadius: 4,
                transition: 'width 200ms ease',
              }}
            />
          </div>
        </div>
      );

    case 'meditated':
      return (
        <Toggle
          options={[
            { value: 'true', label: 'Sí', type: 'yes' },
            { value: 'false', label: 'No', type: 'no' },
          ]}
          value={data.meditated === null ? null : String(data.meditated)}
          onChange={(v) => update('meditated', v === 'true')}
        />
      );

    case 'meals':
      return (
        <Toggle
          options={[
            { value: 'yes', label: 'Bien', type: 'yes' },
            { value: 'partial', label: 'Más o menos', type: 'partial' },
            { value: 'no', label: 'Mal', type: 'no' },
          ]}
          value={data.mealsCumplied}
          onChange={(v) => update('mealsCumplied', v as DailyEntry['mealsCumplied'])}
        />
      );

    case 'focus':
      return (
        <Slider
          min={1}
          max={10}
          step={1}
          value={data.focus ?? 5}
          onChange={(v) => update('focus', v)}
          leftLabel="Disperso"
          rightLabel="Total enfoque"
        />
      );

    case 'exercised':
      return (
        <Toggle
          options={[
            { value: 'true', label: 'Sí', type: 'yes' },
            { value: 'false', label: 'No', type: 'no' },
          ]}
          value={data.exercised === null ? null : String(data.exercised)}
          onChange={(v) => update('exercised', v === 'true')}
        />
      );

    case 'mealsCount': {
      const count = data.mealsCount ?? 3;
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center' }}>
            <Counter
              value={count}
              min={0}
              max={5}
              onChange={(v) => {
                update('mealsCount', v);
                setShowMealFailReason(v < 5);
              }}
              suffix="/5"
            />
          </div>
          {showMealFailReason && count < 5 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <span style={{ fontSize: 13, color: 'var(--color-gray-600)', fontWeight: 500 }}>¿Qué pasó? (opcional)</span>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {['Antojo', 'Sin tiempo', 'Estrés', 'Social', 'Olvido', 'Otro'].map((reason) => (
                  <button
                    key={reason}
                    type="button"
                    onClick={() => update('mealFailReason', reason)}
                    style={{
                      padding: '10px 8px',
                      borderRadius: 'var(--radius-sm)',
                      border: `1.5px solid ${data.mealFailReason === reason ? 'var(--color-red)' : 'var(--color-gray-200)'}`,
                      background: data.mealFailReason === reason ? '#FFEBEE' : 'white',
                      fontSize: 13,
                      color: data.mealFailReason === reason ? 'var(--color-red)' : 'var(--color-dark)',
                      transition: 'all 150ms',
                    }}
                  >
                    {reason}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }

    case 'moodNight':
      return (
        <Slider
          min={1}
          max={10}
          step={1}
          value={data.moodNight ?? 5}
          onChange={(v) => update('moodNight', v)}
          leftLabel="Muy mal"
          rightLabel="Excelente"
        />
      );

    case 'moodWord':
      return (
        <input
          className="input"
          type="text"
          placeholder="Ej: tranquilo, cansado, motivado..."
          value={data.moodWord ?? ''}
          onChange={(e) => update('moodWord', e.target.value)}
          autoFocus
          maxLength={30}
          style={{ fontSize: 18, padding: '16px 14px' }}
        />
      );

    case 'compass':
      return (
        <Toggle
          options={[
            { value: 'true', label: 'Sí, me acerqué', type: 'yes' },
            { value: 'false', label: 'Hoy no tanto', type: 'no' },
          ]}
          value={data.compassAnswer === null ? null : String(data.compassAnswer)}
          onChange={(v) => update('compassAnswer', v === 'true')}
        />
      );

    default:
      return null;
  }
}
