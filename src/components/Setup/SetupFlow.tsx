import React, { useState, useRef } from 'react';
import type { AppConfig } from '../../types';

const DEFAULT_CONFIG: Omit<AppConfig, 'setupComplete' | 'createdAt'> = {
  vision: '',
  visionWhy: '',
  visionPhoto: null,
  compassQuestion: '',
  sleepGoalHours: 7.5,
  waterGoalGlasses: 8,
  morningNotifTime: '08:00',
  afternoonNotifTime: '13:00',
  nightNotifTime: '20:00',
  notificationsEnabled: false,
};

interface Props {
  onComplete: (config: AppConfig) => void;
}

export default function SetupFlow({ onComplete }: Props) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<typeof DEFAULT_CONFIG>({ ...DEFAULT_CONFIG });
  const fileRef = useRef<HTMLInputElement>(null);
  const totalSteps = 3;

  const update = <K extends keyof typeof DEFAULT_CONFIG>(key: K, value: (typeof DEFAULT_CONFIG)[K]) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => update('visionPhoto', ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const canNext = () => {
    if (step === 0) return data.vision.trim().length > 0 && data.visionWhy.trim().length > 0;
    if (step === 2) return data.compassQuestion.trim().length > 0;
    return true;
  };

  const next = () => {
    if (step < totalSteps - 1) setStep(step + 1);
    else finish();
  };

  const finish = () => {
    onComplete({
      ...data,
      setupComplete: true,
      createdAt: new Date().toISOString(),
    });
  };

  return (
    <div className="setup-page">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 13, color: 'var(--color-gray-400)', fontWeight: 500 }}>
          {step + 1} / {totalSteps}
        </div>
        <div className="setup-progress">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div key={i} className={`setup-progress-bar ${i <= step ? 'done' : ''}`} />
          ))}
        </div>
      </div>

      {step === 0 && (
        <StepVision data={data} update={update} fileRef={fileRef} onPhotoChange={handlePhoto} />
      )}
      {step === 1 && (
        <StepDefaults data={data} update={update} />
      )}
      {step === 2 && (
        <StepCompass data={data} update={update} />
      )}

      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <button className="btn-primary" onClick={next} disabled={!canNext()} type="button">
          {step === totalSteps - 1 ? 'Comenzar mi viaje' : 'Continuar'}
        </button>
        {step > 0 && (
          <button className="btn-ghost" onClick={() => setStep(step - 1)} type="button">
            Volver
          </button>
        )}
      </div>
    </div>
  );
}

interface StepProps {
  data: typeof DEFAULT_CONFIG;
  update: <K extends keyof typeof DEFAULT_CONFIG>(key: K, value: (typeof DEFAULT_CONFIG)[K]) => void;
}

function StepVision({ data, update, fileRef, onPhotoChange }: StepProps & {
  fileRef: React.RefObject<HTMLInputElement>;
  onPhotoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, flex: 1 }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-red)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
          Paso 1
        </div>
        <h1 className="setup-title">Tu mejor versión</h1>
        <p className="setup-subtitle" style={{ marginTop: 8 }}>
          Define quién quieres ser. Esta visión te acompañará cada día.
        </p>
      </div>

      <div className="form-group">
        <label className="form-label">¿Cuál es tu mejor versión?</label>
        <textarea
          className="textarea"
          placeholder="Ej: La versión de mí que tiene energía, claridad mental y cuida su cuerpo cada día..."
          value={data.vision}
          onChange={(e) => update('vision', e.target.value)}
          rows={3}
        />
      </div>

      <div className="form-group">
        <label className="form-label">¿Por qué quieres lograr esto?</label>
        <span className="form-hint">Tu razón honesta. No tienes que compartirla con nadie.</span>
        <textarea
          className="textarea"
          placeholder="Ej: Porque quiero tener energía para estar presente con mi familia y rendir en mi trabajo..."
          value={data.visionWhy}
          onChange={(e) => update('visionWhy', e.target.value)}
          rows={3}
        />
      </div>

      <div className="form-group">
        <label className="form-label">Foto (opcional)</label>
        <span className="form-hint">Un selfie o imagen que represente tu meta. Aparecerá en tu dashboard.</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 4 }}>
          {data.visionPhoto ? (
            <img
              src={data.visionPhoto}
              alt="Tu visión"
              style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--color-red)' }}
            />
          ) : (
            <div
              style={{
                width: 64, height: 64, borderRadius: '50%', background: 'var(--color-gray-100)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '2px dashed var(--color-gray-200)', cursor: 'pointer', flexShrink: 0
              }}
              onClick={() => fileRef.current?.click()}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-gray-400)" strokeWidth={2}>
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
          )}
          <button
            className="btn-secondary"
            style={{ width: 'auto', flex: 1 }}
            onClick={() => fileRef.current?.click()}
            type="button"
          >
            {data.visionPhoto ? 'Cambiar foto' : 'Agregar foto'}
          </button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="user"
          style={{ display: 'none' }}
          onChange={onPhotoChange}
        />
      </div>
    </div>
  );
}

function StepDefaults({ data, update }: StepProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, flex: 1 }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-red)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
          Paso 2
        </div>
        <h1 className="setup-title">Tus metas base</h1>
        <p className="setup-subtitle" style={{ marginTop: 8 }}>
          Configura tus defaults. Puedes cambiarlos después.
        </p>
      </div>

      <div className="form-group">
        <label className="form-label">Horas de sueño meta</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <input
            type="range"
            className="slider"
            min={4}
            max={10}
            step={0.5}
            value={data.sleepGoalHours}
            onChange={(e) => update('sleepGoalHours', Number(e.target.value))}
            style={{ flex: 1 }}
          />
          <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-red)', minWidth: 40 }}>
            {data.sleepGoalHours}h
          </span>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Vasos de agua meta por día</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <input
            type="range"
            className="slider"
            min={4}
            max={14}
            step={1}
            value={data.waterGoalGlasses}
            onChange={(e) => update('waterGoalGlasses', Number(e.target.value))}
            style={{ flex: 1 }}
          />
          <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-red)', minWidth: 40 }}>
            {data.waterGoalGlasses}
          </span>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Recordatorios (opt-in)</label>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0' }}>
          <span style={{ fontSize: 15 }}>Activar recordatorios</span>
          <button
            type="button"
            onClick={() => update('notificationsEnabled', !data.notificationsEnabled)}
            style={{
              width: 48, height: 28, borderRadius: 14,
              background: data.notificationsEnabled ? 'var(--color-red)' : 'var(--color-gray-200)',
              position: 'relative', transition: 'background 200ms'
            }}
          >
            <div style={{
              position: 'absolute', top: 3, left: data.notificationsEnabled ? 23 : 3,
              width: 22, height: 22, borderRadius: '50%', background: 'white',
              transition: 'left 200ms', boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
            }} />
          </button>
        </div>
      </div>

      {data.notificationsEnabled && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { key: 'morningNotifTime' as const, label: 'Check-in mañana' },
            { key: 'afternoonNotifTime' as const, label: 'Check-in tarde' },
            { key: 'nightNotifTime' as const, label: 'Check-in noche' },
          ].map(({ key, label }) => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 14, color: 'var(--color-gray-600)' }}>{label}</span>
              <input
                type="time"
                className="input"
                style={{ width: 'auto' }}
                value={data[key] as string}
                onChange={(e) => update(key, e.target.value)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StepCompass({ data, update }: StepProps) {
  const EXAMPLES = [
    'Hice ejercicio + comí bien + dormí 7 horas',
    'Terminé mis tareas más importantes del día',
    'Estuve presente con las personas que importan',
    'Mantuve mi energía alta todo el día',
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, flex: 1 }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-red)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
          Paso 3
        </div>
        <h1 className="setup-title">Tu pregunta brújula</h1>
        <p className="setup-subtitle" style={{ marginTop: 8 }}>
          ¿Qué significa para ti "ser tu mejor versión" en una sola acción concreta?
          Esta pregunta cierra cada día.
        </p>
      </div>

      <div className="form-group">
        <label className="form-label">Define tu mejor día en una frase</label>
        <textarea
          className="textarea"
          placeholder="Ej: Que haya hecho ejercicio + comido bien + dormido 7h"
          value={data.compassQuestion}
          onChange={(e) => update('compassQuestion', e.target.value)}
          rows={2}
        />
      </div>

      <div>
        <p style={{ fontSize: 13, color: 'var(--color-gray-400)', marginBottom: 10 }}>Ejemplos rápidos:</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => update('compassQuestion', ex)}
              style={{
                textAlign: 'left',
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                border: `1.5px solid ${data.compassQuestion === ex ? 'var(--color-red)' : 'var(--color-gray-200)'}`,
                background: data.compassQuestion === ex ? '#FFEBEE' : 'var(--color-white)',
                fontSize: 14,
                color: data.compassQuestion === ex ? 'var(--color-red)' : 'var(--color-dark)',
                transition: 'all 150ms',
              }}
            >
              {ex}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
