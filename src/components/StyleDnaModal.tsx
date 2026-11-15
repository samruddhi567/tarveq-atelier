import React, { useState, useRef, useEffect } from 'react';
import { X, Camera, Sparkles, CheckCircle2, Shield, RefreshCw, Wand2, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { StyleDnaPayload, User } from '../types';

interface StyleDnaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCalibrateSuccess: (updatedUser: User, paletteData: any) => void;
  currentUser: User | null;
}

export const StyleDnaModal: React.FC<StyleDnaModalProps> = ({
  isOpen,
  onClose,
  onCalibrateSuccess,
  currentUser,
}) => {
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanProgress, setScanProgress] = useState<number>(0);
  const [scanMessage, setScanMessage] = useState<string>('Align shoulders & face in frame');

  // Input states
  const [height, setHeight] = useState<number>(currentUser?.style_dna?.height || 162);
  const [buildProportion, setBuildProportion] = useState<'Petite' | 'Regular' | 'Tall'>(
    currentUser?.style_dna?.build_proportion || 'Regular'
  );
  const [modestyPreference, setModestyPreference] = useState<'Full Coverage' | 'Balanced Modest' | 'Relaxed'>(
    currentUser?.style_dna?.modesty_preference || 'Balanced Modest'
  );
  const [skinUndertone, setSkinUndertone] = useState<'Warm Golden' | 'Olive' | 'Deep Espresso' | 'Cool'>(
    currentUser?.style_dna?.undertone || 'Warm Golden'
  );

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
    }
  }, [isOpen]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setCameraActive(true);
        drawWireframeOverlay();
      }
    } catch (err: any) {
      console.warn('Webcam permission denied or not available:', err);
      setCameraError('Webcam not active. Use the 1-Click Simulation below for instant investor demo!');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    setCameraActive(false);
  };

  const drawWireframeOverlay = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let tick = 0;
    const render = () => {
      tick += 0.05;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const w = canvas.width;
      const h = canvas.height;
      const centerX = w / 2;
      const centerY = h * 0.42;

      ctx.strokeStyle = '#B8925A';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);

      // Face Oval Mesh
      ctx.beginPath();
      ctx.ellipse(centerX, centerY - 20, 55, 75, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Shoulder alignment line
      ctx.strokeStyle = '#3F5945';
      ctx.setLineDash([]);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(centerX - 100, centerY + 85);
      ctx.lineTo(centerX + 100, centerY + 85);
      ctx.stroke();

      // Landmark Dots
      ctx.fillStyle = '#B8925A';
      const points = [
        [centerX, centerY - 60],
        [centerX - 25, centerY - 25],
        [centerX + 25, centerY - 25],
        [centerX, centerY],
        [centerX, centerY + 30],
        [centerX - 95, centerY + 85],
        [centerX + 95, centerY + 85],
      ];

      points.forEach(([x, y]) => {
        ctx.beginPath();
        ctx.arc(x, y, 3.5, 0, Math.PI * 2);
        ctx.fill();
      });

      // Animated scanning line
      const scanY = (Math.sin(tick) * 0.5 + 0.5) * h;
      ctx.strokeStyle = 'rgba(122, 46, 46, 0.7)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(20, scanY);
      ctx.lineTo(w - 20, scanY);
      ctx.stroke();

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();
  };

  const handleSimulateScan = (presetUndertone?: 'Warm Golden' | 'Olive' | 'Deep Espresso' | 'Cool') => {
    setIsScanning(true);
    setScanProgress(15);
    setScanMessage('Calibrating white-balance against Indian undertone baseline...');

    const chosenUndertone = presetUndertone || 'Warm Golden';
    setSkinUndertone(chosenUndertone);

    setTimeout(() => {
      setScanProgress(55);
      setScanMessage('Extracting biometric shoulder drop & 0.72 South Asian waist curve...');
    }, 600);

    setTimeout(() => {
      setScanProgress(90);
      setScanMessage('Synthesizing zero-return match profile...');
    }, 1200);

    setTimeout(() => {
      setScanProgress(100);
      setIsScanning(false);
      submitCalibration(chosenUndertone);
    }, 1700);
  };

  const submitCalibration = async (overrideUndertone?: 'Warm Golden' | 'Olive' | 'Deep Espresso' | 'Cool') => {
    const finalUndertone = overrideUndertone || skinUndertone;
    const payload: StyleDnaPayload = {
      userId: currentUser?.id || 'user-customer-demo',
      height,
      buildProportion,
      modestyPreference,
      skinUndertone: finalUndertone,
      shoulderCm: buildProportion === 'Petite' ? 36.5 : buildProportion === 'Tall' ? 40.5 : 38.5,
      waistCm: 72.0,
      hipCm: 98.0,
    };

    try {
      const res = await fetch('/api/style-dna', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        confetti({
          particleCount: 65,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#7A2E2E', '#3F5945', '#B8925A', '#261B18'],
        });

        stopCamera();
        onCalibrateSuccess(data.user, data.palette);
      }
    } catch (err) {
      console.error('Failed to submit style DNA:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#261B18]/75 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-[#FBF8F3] w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-modal-luxe max-h-[94vh] flex flex-col overflow-hidden border border-[#B8925A]">
        {/* Header */}
        <div className="p-4 bg-[#F3ECE1] border-b border-[#E8DFC8] flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="bg-[#7A2E2E] text-[#FBF8F3] text-[10px] uppercase font-serif font-bold tracking-wider px-2 py-0.5 rounded">
                TARVEQ Biometrics
              </span>
              <span className="text-xs text-[#3F5945] font-serif font-bold">3-Second Fit DNA</span>
            </div>
            <h2 className="font-serif text-xl font-bold text-[#261B18] mt-0.5">
              Body Geometry & Undertone Scan
            </h2>
          </div>

          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-1 rounded-full text-[#5C4D48] hover:text-[#261B18] hover:bg-[#E8DFC8] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Privacy Guarantee */}
          <div className="bg-[#F9F4EB] p-3 rounded-xl border border-[#B8925A]/40 flex items-start space-x-2.5 text-xs text-[#5C4D48]">
            <Shield className="w-4 h-4 text-[#3F5945] shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-[#261B18] font-serif">100% On-Device Privacy Promise</p>
              <p className="text-[11px] text-[#5C4D48] font-sans">
                Camera processing runs client-side in real-time. Zero photos or videos are ever uploaded or saved.
              </p>
            </div>
          </div>

          {/* Camera / Simulation Area */}
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-[#261B18] shadow-inner flex flex-col items-center justify-center text-center p-4 border border-[#B8925A]/30">
            {cameraActive ? (
              <>
                <video
                  ref={videoRef}
                  playsInline
                  muted
                  className="absolute inset-0 w-full h-full object-cover mirror"
                  style={{ transform: 'scaleX(-1)' }}
                />
                <canvas
                  ref={canvasRef}
                  width={360}
                  height={270}
                  className="absolute inset-0 w-full h-full pointer-events-none"
                />
              </>
            ) : (
              <div className="space-y-3 z-10">
                <div className="w-16 h-16 rounded-full bg-[#F3ECE1]/20 border border-[#B8925A]/40 flex items-center justify-center mx-auto text-white">
                  <Camera className="w-8 h-8 text-[#B8925A]" />
                </div>
                <div>
                  <h3 className="text-white font-serif text-lg font-bold">
                    Webcam or Instant Demo
                  </h3>
                  <p className="text-xs text-white/70 max-w-xs mx-auto mt-1 font-sans">
                    Launch camera for live posture wireframe tracking or run the instant simulation.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 justify-center pt-2">
                  <button
                    onClick={startCamera}
                    className="bg-[#FBF8F3] text-[#261B18] text-xs font-serif font-bold uppercase tracking-wider px-4 py-2 rounded-full hover:bg-[#F3ECE1] transition flex items-center space-x-1.5 shadow"
                  >
                    <Camera className="w-3.5 h-3.5 text-[#7A2E2E]" />
                    <span>Launch Webcam</span>
                  </button>

                  <button
                    onClick={() => handleSimulateScan()}
                    disabled={isScanning}
                    className="bg-[#7A2E2E] hover:bg-[#632323] text-white text-xs font-serif font-bold uppercase tracking-wider px-4 py-2 rounded-full transition flex items-center space-x-1.5 shadow border border-[#B8925A]"
                  >
                    <Wand2 className="w-3.5 h-3.5 text-[#B8925A]" />
                    <span>Simulate Indian Scan (1-Click)</span>
                  </button>
                </div>

                {cameraError && (
                  <p className="text-[11px] text-[#B8925A] bg-[#261B18]/90 px-3 py-1 rounded-full inline-block mt-2 font-mono">
                    {cameraError}
                  </p>
                )}
              </div>
            )}

            {/* Scanning Progress */}
            {isScanning && (
              <div className="absolute inset-0 bg-[#261B18]/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-white z-20">
                <RefreshCw className="w-8 h-8 text-[#B8925A] animate-spin mb-3" />
                <p className="font-serif text-sm font-bold text-[#F9F4EB]">{scanMessage}</p>
                <div className="w-48 bg-white/20 h-1.5 rounded-full overflow-hidden mt-3">
                  <div
                    className="bg-[#B8925A] h-full rounded-full transition-all duration-300"
                    style={{ width: `${scanProgress}%` }}
                  ></div>
                </div>
                <span className="text-[10px] text-white/80 mt-1 font-mono">{scanProgress}% calibrated</span>
              </div>
            )}
          </div>

          {/* Biometric Controls */}
          <div className="space-y-4 pt-2 font-sans">
            <h3 className="font-serif text-base font-bold text-[#261B18] border-b border-[#E8DFC8] pb-1">
              Biometric Calibration & Melanin Index
            </h3>

            {/* Undertone */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#261B18]">
                  Skin Undertone (Spectrophotometer)
                </label>
                <span className="text-[11px] text-[#7A2E2E] font-serif font-bold">Zero Color Clash</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'Warm Golden', name: 'Warm Golden', sub: 'Honey & Peaches', color: '#D49B45' },
                  { id: 'Olive', name: 'Olive Undertone', sub: 'Subtle Neutral Green', color: '#7A7550' },
                  { id: 'Deep Espresso', name: 'Deep Espresso', sub: 'Melanin Rich', color: '#3D2B24' },
                  { id: 'Cool', name: 'Cool Alabaster', sub: 'Rose & Slate', color: '#C49B90' },
                ].map((tone) => (
                  <button
                    key={tone.id}
                    onClick={() => setSkinUndertone(tone.id as any)}
                    className={`p-2.5 rounded-xl border text-left flex items-center space-x-2.5 transition ${
                      skinUndertone === tone.id
                        ? 'bg-[#261B18] text-[#FBF8F3] border-[#261B18] shadow-sm'
                        : 'bg-[#F3ECE1] hover:bg-[#E8DFC8] border-[#E8DFC8] text-[#261B18]'
                    }`}
                  >
                    <span
                      className="w-4 h-4 rounded-full border border-white/50 shrink-0"
                      style={{ backgroundColor: tone.color }}
                    ></span>
                    <div>
                      <div className="text-xs font-semibold">{tone.name}</div>
                      <div className="text-[10px] opacity-75">{tone.sub}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Build Proportion */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#261B18]">
                  Build Proportion (Torso-to-Inseam)
                </label>
                <span className="text-[11px] text-[#5C4D48]">Indian Demographic</span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {(['Petite', 'Regular', 'Tall'] as const).map((prop) => (
                  <button
                    key={prop}
                    onClick={() => setBuildProportion(prop)}
                    className={`py-2 px-2 rounded-xl text-xs font-medium border text-center transition ${
                      buildProportion === prop
                        ? 'bg-[#261B18] text-[#FBF8F3] border-[#261B18] shadow-sm'
                        : 'bg-[#F3ECE1] hover:bg-[#E8DFC8] border-[#E8DFC8] text-[#261B18]'
                    }`}
                  >
                    <div className="font-semibold">{prop}</div>
                    <div className="text-[10px] opacity-75">
                      {prop === 'Petite' ? 'Under 5\'3"' : prop === 'Regular' ? '5\'3" - 5\'7"' : 'Above 5\'7"'}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Height Slider */}
            <div>
              <div className="flex justify-between items-center mb-1 text-xs">
                <span className="font-bold text-[#261B18] uppercase">Height</span>
                <span className="font-serif font-bold text-[#7A2E2E] text-sm">
                  {height} cm ({Math.floor(height / 30.48)}' {Math.round((height % 30.48) / 2.54)}")
                </span>
              </div>
              <input
                type="range"
                min={148}
                max={182}
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
                className="w-full accent-[#7A2E2E] cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Modal Footer CTA */}
        <div className="p-4 bg-[#F3ECE1] border-t border-[#E8DFC8] flex items-center justify-between">
          <button
            onClick={() => handleSimulateScan('Warm Golden')}
            className="text-xs font-serif font-bold text-[#7A2E2E] hover:underline"
          >
            Quick Preset: Warm Golden
          </button>

          <button
            onClick={() => submitCalibration()}
            disabled={isScanning}
            className="bg-[#7A2E2E] hover:bg-[#632323] text-white font-serif tracking-wider uppercase font-bold text-xs px-6 py-3 rounded-xl transition flex items-center space-x-2 shadow-elevated-luxe border border-[#B8925A]"
          >
            <Sparkles className="w-4 h-4 text-[#B8925A]" />
            <span>Lock Style DNA & Calibrate</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
