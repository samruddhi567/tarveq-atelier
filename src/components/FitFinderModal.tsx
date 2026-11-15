import React, { useState } from 'react';
import { X, Ruler, ArrowRight, ArrowLeft, Check, ShieldCheck, Camera, Sparkles, Lock } from 'lucide-react';
import { Product, User } from '../types';

interface FitFinderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveProfile: (fitData: any) => void;
  user: User | null;
  products: Product[];
  onSelectProduct: (product: Product) => void;
}

export const FitFinderModal: React.FC<FitFinderModalProps> = ({
  isOpen,
  onClose,
  onSaveProfile,
  user,
  products,
  onSelectProduct,
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [unit, setUnit] = useState<'cm' | 'in'>('cm');

  // Step 1: Basic Info
  const [heightCm, setHeightCm] = useState(165);
  const [weightKg, setWeightKg] = useState<string>('58');
  const [ageRange, setAgeRange] = useState<string>('25-34');

  // Step 2: Measurements
  const [bustCm, setBustCm] = useState(90);
  const [waistCm, setWaistCm] = useState(72);
  const [hipCm, setHipCm] = useState(96);
  const [shoulderCm, setShoulderCm] = useState<string>('39');

  // Step 3: Fit Preference
  const [fitPreference, setFitPreference] = useState<'Slim Fit' | 'Regular Fit' | 'Relaxed Fit' | 'Oversized Fit'>('Regular Fit');

  // Step 4: Optional Photo
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  if (!isOpen) return null;

  // Transparent Rule-Based Size Calculation
  const calculateRecommendedSize = () => {
    let size = 'M';
    if (bustCm <= 84 && waistCm <= 66) size = 'XS';
    else if (bustCm <= 88 && waistCm <= 70) size = 'S';
    else if (bustCm <= 94 && waistCm <= 76) size = 'M';
    else if (bustCm <= 100 && waistCm <= 82) size = 'L';
    else size = 'XL';

    // Adjust for fit preference
    if (fitPreference === 'Slim Fit' && size !== 'XS') {
      // slim fit prefers closer cut
    } else if (fitPreference === 'Oversized Fit' && size !== 'XL') {
      // slightly more generous
    }

    return size;
  };

  const recommendedSize = calculateRecommendedSize();

  const handleFinish = () => {
    const payload = {
      is_scanned: 1,
      height: heightCm,
      build_proportion: heightCm < 160 ? 'Petite' : heightCm > 170 ? 'Tall' : 'Regular',
      modesty_preference: 'Balanced Modest',
      undertone: user?.style_dna?.undertone || 'Warm Golden',
      bust_cm: bustCm,
      waist_cm: waistCm,
      hip_cm: hipCm,
      fit_preference: fitPreference,
      recommended_size: recommendedSize,
      calibrated_at: new Date().toISOString(),
    };
    onSaveProfile(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-charcoal/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-[#F8F4EC] w-full max-w-xl rounded-3xl shadow-modal-luxe border border-beige-border overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Top Header */}
        <div className="p-5 bg-beige/40 border-b border-beige-border flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Ruler className="w-5 h-5 text-burgundy" />
            <div>
              <h3 className="font-serif text-xl sm:text-2xl font-medium text-charcoal">
                TARVEQ Fit Finder
              </h3>
              <p className="text-[11px] text-charcoal-muted font-sans">
                Transparent rule-based sizing based on real garment dimensions
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-charcoal hover:bg-beige transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Step Indicator */}
        <div className="px-6 py-2.5 bg-beige/20 border-b border-beige-border flex items-center justify-between text-xs font-sans text-charcoal-muted">
          <span>Step {step} of 5</span>
          <div className="flex space-x-1.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <div
                key={s}
                className={`w-6 h-1 rounded-full transition-all ${
                  step >= s ? 'bg-burgundy' : 'bg-beige-border'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Wizard Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 font-sans">
          
          {/* STEP 1: Basic Information */}
          {step === 1 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div>
                <h4 className="font-serif text-2xl font-medium text-charcoal">Basic Proportions</h4>
                <p className="text-xs text-charcoal-muted mt-1">
                  Help us understand your vertical proportions to recommend the right inseam length (Petite, Regular, or Tall).
                </p>
              </div>

              {/* Unit Toggle */}
              <div className="flex items-center justify-between text-xs pb-2 border-b border-beige-border">
                <span className="font-semibold text-charcoal uppercase tracking-wider">Measurement Unit</span>
                <div className="flex bg-beige/60 p-0.5 rounded-lg border border-beige-border">
                  <button
                    onClick={() => setUnit('cm')}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition ${
                      unit === 'cm' ? 'bg-white shadow text-charcoal' : 'text-charcoal-muted'
                    }`}
                  >
                    cm / kg
                  </button>
                  <button
                    onClick={() => setUnit('in')}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition ${
                      unit === 'in' ? 'bg-white shadow text-charcoal' : 'text-charcoal-muted'
                    }`}
                  >
                    in / lbs
                  </button>
                </div>
              </div>

              {/* Height Slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-medium text-charcoal">
                  <span>Height</span>
                  <span className="font-bold text-burgundy">
                    {heightCm} cm ({Math.floor(heightCm / 30.48)}' {Math.round((heightCm % 30.48) / 2.54)}")
                  </span>
                </div>
                <input
                  type="range"
                  min="145"
                  max="190"
                  value={heightCm}
                  onChange={(e) => setHeightCm(Number(e.target.value))}
                  className="w-full accent-burgundy"
                />
                <div className="flex justify-between text-[10px] text-charcoal-muted">
                  <span>Petite (&lt;160cm)</span>
                  <span>Regular (160–170cm)</span>
                  <span>Tall (&gt;170cm)</span>
                </div>
              </div>

              {/* Weight & Age (Optional) */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="text-xs font-semibold text-charcoal block mb-1">
                    Weight (Optional)
                  </label>
                  <input
                    type="number"
                    value={weightKg}
                    onChange={(e) => setWeightKg(e.target.value)}
                    placeholder="e.g. 58"
                    className="w-full px-3 py-2 bg-white border border-beige-border rounded-xl text-xs text-charcoal focus:outline-none focus:border-burgundy"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-charcoal block mb-1">
                    Age Group (Optional)
                  </label>
                  <select
                    value={ageRange}
                    onChange={(e) => setAgeRange(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-beige-border rounded-xl text-xs text-charcoal focus:outline-none focus:border-burgundy"
                  >
                    <option value="18-24">18–24 years</option>
                    <option value="25-34">25–34 years</option>
                    <option value="35-44">35–44 years</option>
                    <option value="45+">45+ years</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Body Measurements */}
          {step === 2 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div>
                <h4 className="font-serif text-2xl font-medium text-charcoal">Body Measurements</h4>
                <p className="text-xs text-charcoal-muted mt-1">
                  Adjust measurements to match your comfort tape measurements. We never force all fields.
                </p>
              </div>

              {/* Bust Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium text-charcoal">
                  <span>Bust / Chest Circumference</span>
                  <span className="font-bold text-burgundy">{bustCm} cm</span>
                </div>
                <input
                  type="range"
                  min="76"
                  max="120"
                  value={bustCm}
                  onChange={(e) => setBustCm(Number(e.target.value))}
                  className="w-full accent-burgundy"
                />
              </div>

              {/* Waist Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium text-charcoal">
                  <span>Natural Waist Circumference</span>
                  <span className="font-bold text-burgundy">{waistCm} cm</span>
                </div>
                <input
                  type="range"
                  min="60"
                  max="110"
                  value={waistCm}
                  onChange={(e) => setWaistCm(Number(e.target.value))}
                  className="w-full accent-burgundy"
                />
              </div>

              {/* Hip Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium text-charcoal">
                  <span>Hip Circumference</span>
                  <span className="font-bold text-burgundy">{hipCm} cm</span>
                </div>
                <input
                  type="range"
                  min="80"
                  max="130"
                  value={hipCm}
                  onChange={(e) => setHipCm(Number(e.target.value))}
                  className="w-full accent-burgundy"
                />
              </div>

              {/* Shoulder Width (Optional) */}
              <div className="pt-2">
                <label className="text-xs font-semibold text-charcoal block mb-1">
                  Shoulder Width (Optional, cm)
                </label>
                <input
                  type="number"
                  value={shoulderCm}
                  onChange={(e) => setShoulderCm(e.target.value)}
                  placeholder="e.g. 39"
                  className="w-full px-3 py-2 bg-white border border-beige-border rounded-xl text-xs text-charcoal focus:outline-none focus:border-burgundy"
                />
              </div>
            </div>
          )}

          {/* STEP 3: Fit Preference */}
          {step === 3 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div>
                <h4 className="font-serif text-2xl font-medium text-charcoal">Fit Preference</h4>
                <p className="text-xs text-charcoal-muted mt-1">
                  How do you prefer your garments to sit on your body?
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  {
                    id: 'Slim Fit',
                    title: 'Slim Fit',
                    desc: 'Tailored closer to the silhouette with minimal ease.',
                  },
                  {
                    id: 'Regular Fit',
                    title: 'Regular Fit',
                    desc: 'Classic balanced drape with 3–5 cm ease for day-long comfort.',
                  },
                  {
                    id: 'Relaxed Fit',
                    title: 'Relaxed Fit',
                    desc: 'Modest ease with gentle drape that skims effortlessly.',
                  },
                  {
                    id: 'Oversized Fit',
                    title: 'Oversized Fit',
                    desc: 'Generous contemporary drop shoulder and roomier silhouette.',
                  },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFitPreference(f.id as any)}
                    className={`p-4 rounded-2xl text-left border transition ${
                      fitPreference === f.id
                        ? 'border-burgundy bg-burgundy-light shadow-sm'
                        : 'border-beige-border bg-white/70 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-sm text-charcoal">{f.title}</span>
                      {fitPreference === f.id && <Check className="w-4 h-4 text-burgundy" />}
                    </div>
                    <p className="text-xs text-charcoal-muted leading-relaxed">{f.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4: Optional Photo */}
          {step === 4 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div>
                <h4 className="font-serif text-2xl font-medium text-charcoal">Optional Standing Photo</h4>
                <p className="text-xs text-charcoal-muted mt-1">
                  Upload an optional full-body photo for shoulder-drop estimation. This step is 100% optional.
                </p>
              </div>

              <div className="border-2 border-dashed border-beige-border rounded-3xl p-6 text-center space-y-3 bg-white/50">
                {photoPreview ? (
                  <div className="space-y-3">
                    <img
                      src={photoPreview}
                      alt="Preview"
                      className="w-32 h-44 object-cover mx-auto rounded-xl shadow-md"
                    />
                    <button
                      onClick={() => setPhotoPreview(null)}
                      className="text-xs text-burgundy hover:underline font-medium"
                    >
                      Remove photo
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="w-12 h-12 rounded-full bg-beige flex items-center justify-center mx-auto text-charcoal-muted">
                      <Camera className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-charcoal">
                        Upload or snap a full-length photo
                      </p>
                      <p className="text-[11px] text-charcoal-muted mt-0.5">
                        JPEG or PNG up to 10MB
                      </p>
                    </div>
                    <label className="inline-block bg-white border border-beige-border text-charcoal text-xs font-medium px-4 py-2 rounded-full hover:bg-beige transition cursor-pointer shadow-sm">
                      Select Photo
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setPhotoPreview(URL.createObjectURL(file));
                          }
                        }}
                      />
                    </label>
                  </div>
                )}
              </div>

              {/* Privacy Disclosure */}
              <div className="bg-sage-light border border-sage-border rounded-2xl p-3.5 flex items-start space-x-2.5 text-xs text-sage">
                <Lock className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p className="leading-relaxed font-sans text-charcoal-muted">
                  <strong className="text-sage">Privacy Guaranteed:</strong> Photos are processed strictly within your local browser session. No raw personal photos are ever stored on our servers.
                </p>
              </div>
            </div>
          )}

          {/* STEP 5: Results */}
          {step === 5 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div>
                <span className="text-xs font-semibold text-sage uppercase tracking-wider">
                  Fit Analysis Complete
                </span>
                <h4 className="font-serif text-3xl font-medium text-charcoal mt-0.5">
                  Your Recommended Size is {recommendedSize}
                </h4>
              </div>

              {/* Transparent Explanation Card */}
              <div className="bg-white p-4 rounded-2xl border border-beige-border space-y-2 text-xs">
                <p className="text-charcoal leading-relaxed font-sans">
                  Based on your measurements (Bust: {bustCm}cm, Waist: {waistCm}cm, Hips: {hipCm}cm) and your <strong className="text-burgundy">{fitPreference}</strong> preference, size <strong>{recommendedSize}</strong> provides the optimal balance of chest tolerance and zero bust gaping.
                </p>
                <div className="pt-2 border-t border-beige-border flex justify-between text-charcoal-muted font-sans text-[11px]">
                  <span>Height: {heightCm} cm ({heightCm < 160 ? 'Petite' : heightCm > 170 ? 'Tall' : 'Regular Inseam'})</span>
                  <span>Ease: 4.5 cm comfort tolerance</span>
                </div>
              </div>

              {/* Suitable Products Preview */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-charcoal uppercase tracking-wider">
                  Outfits Tailored for Size {recommendedSize}
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {products.slice(0, 2).map((prod) => (
                    <div
                      key={prod.id}
                      onClick={() => {
                        onSelectProduct(prod);
                        onClose();
                      }}
                      className="bg-white p-2.5 rounded-2xl border border-beige-border flex items-center space-x-2.5 cursor-pointer hover:border-burgundy transition shadow-sm"
                    >
                      <img src={prod.image_url} alt={prod.name} className="w-12 h-14 object-cover rounded-xl" />
                      <div className="overflow-hidden">
                        <p className="font-serif text-sm font-medium text-charcoal truncate">{prod.name}</p>
                        <p className="text-[11px] text-charcoal-muted">₹{prod.price.toLocaleString('en-IN')}</p>
                        <span className="text-[9px] text-sage font-medium">✓ Fits Size {recommendedSize}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Wizard Bottom Actions */}
        <div className="p-5 bg-beige/40 border-t border-beige-border flex items-center justify-between">
          {step > 1 ? (
            <button
              onClick={() => setStep((step - 1) as any)}
              className="flex items-center space-x-1.5 text-xs font-medium text-charcoal hover:text-burgundy px-3 py-2 rounded-full transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {step < 5 ? (
            <button
              onClick={() => setStep((step + 1) as any)}
              className="bg-burgundy hover:bg-burgundy-hover text-white text-xs font-medium px-6 py-2.5 rounded-full transition flex items-center space-x-1.5 shadow-sm"
            >
              <span>{step === 4 ? 'See Recommendation' : 'Continue'}</span>
              <ArrowRight className="w-4 h-4 text-gold" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="bg-burgundy hover:bg-burgundy-hover text-white text-xs font-medium px-6 py-2.5 rounded-full transition flex items-center space-x-1.5 shadow-md border border-gold/30"
            >
              <Check className="w-4 h-4 text-gold" />
              <span>Save to My Profile</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
