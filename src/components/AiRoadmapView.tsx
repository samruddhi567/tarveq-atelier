import React from 'react';
import { Sparkles, Shield, Cpu, Eye, Palette, Layers, Terminal, ArrowRight, ExternalLink } from 'lucide-react';

export const AiRoadmapView: React.FC<{ onBackToStore: () => void }> = ({ onBackToStore }) => {
  return (
    <div className="min-h-screen bg-[#FBF8F3] text-[#261B18] font-sans pb-16">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#7A2E2E] via-[#5E2222] to-[#261B18] text-white py-14 px-6 text-center space-y-3 relative overflow-hidden">
        <div className="max-w-3xl mx-auto space-y-3 relative z-10">
          <div className="inline-flex items-center space-x-2 bg-[#B8925A]/20 text-[#B8925A] px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border border-[#B8925A]/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Open-Source AI Architecture</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-wide">
            TARVEQ Atelier AI Engine
          </h1>
          <p className="text-xs sm:text-sm text-[#F3ECE1]/80 max-w-xl mx-auto leading-relaxed">
            Privacy-preserving in-browser edge vision, CIELAB colorimetry, SigLIP visual embeddings, and LangChain atelier stylist intelligence.
          </p>
          <div className="pt-2">
            <button
              onClick={onBackToStore}
              className="py-2 px-5 bg-[#B8925A] hover:bg-[#A37E47] text-[#261B18] text-xs font-bold rounded-full transition shadow-sm"
            >
              ← Return to Boutique
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 pt-10 space-y-8">
        
        {/* Core Principles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 bg-white rounded-2xl border border-[#F3ECE1] space-y-2 shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-[#3F5945]/10 flex items-center justify-center text-[#3F5945]">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-[#261B18]">Zero-Frame Edge Privacy</h3>
            <p className="text-xs text-[#261B18]/70 leading-relaxed">
              No live webcam feeds or uploaded raw body photographs are ever sent to backend servers. Vision models execute entirely on your device's browser sandbox.
            </p>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-[#F3ECE1] space-y-2 shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-[#7A2E2E]/10 flex items-center justify-center text-[#7A2E2E]">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-[#261B18]">Lightweight Railway Deployment</h3>
            <p className="text-xs text-[#261B18]/70 leading-relaxed">
              Heavy neural processing runs in-browser (Wasm/WebGL) while server inference offloads to Hugging Face serverless APIs, keeping cloud hosting lean and scalable.
            </p>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-[#F3ECE1] space-y-2 shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-[#B8925A]/10 flex items-center justify-center text-[#B8925A]">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-[#261B18]">Padmora Warm Soft-Luxe Tone</h3>
            <p className="text-xs text-[#261B18]/70 leading-relaxed">
              Language models are prompted with a respectful Indian atelier persona, providing tailoring insights on fabric GSM, modesty drape, and undertone harmonies.
            </p>
          </div>
        </div>

        {/* 4 Active Open-Source AI Integrations */}
        <div className="space-y-4">
          <h2 className="font-serif text-2xl font-bold text-[#261B18]">
            Active Open-Source Model Integrations
          </h2>

          <div className="space-y-4">
            
            {/* 1. MediaPipe Edge Vision */}
            <div className="p-6 bg-white rounded-3xl border border-[#F3ECE1] space-y-3 shadow-sm">
              <div className="flex items-center justify-between border-b border-[#F3ECE1] pb-3">
                <div className="flex items-center space-x-2.5">
                  <Eye className="w-5 h-5 text-[#7A2E2E]" />
                  <h3 className="font-serif text-base font-bold text-[#261B18]">
                    1. In-Browser Edge Body & Undertone Scanner
                  </h3>
                </div>
                <span className="text-[10px] bg-[#3F5945]/10 text-[#3F5945] font-mono px-2 py-0.5 rounded-full font-bold">
                  @mediapipe/tasks-vision
                </span>
              </div>
              <p className="text-xs text-[#261B18]/80 leading-relaxed">
                Runs Google MediaPipe <strong>PoseLandmarker</strong> and <strong>FaceLandmarker</strong> Wasm models on the client device. It measures shoulder-to-hip and torso-to-leg ratios in real time to deduce modest build proportions without manual tape measurements.
              </p>
            </div>

            {/* 2. CIELAB Colorimetry */}
            <div className="p-6 bg-white rounded-3xl border border-[#F3ECE1] space-y-3 shadow-sm">
              <div className="flex items-center justify-between border-b border-[#F3ECE1] pb-3">
                <div className="flex items-center space-x-2.5">
                  <Palette className="w-5 h-5 text-[#B8925A]" />
                  <h3 className="font-serif text-base font-bold text-[#261B18]">
                    2. CIELAB ($L^*a^*b^*$) Indian Undertone Math
                  </h3>
                </div>
                <span className="text-[10px] bg-[#B8925A]/20 text-[#B8925A] font-mono px-2 py-0.5 rounded-full font-bold">
                  Pure TypeScript Math
                </span>
              </div>
              <p className="text-xs text-[#261B18]/80 leading-relaxed">
                Samples cheek ROI pixels from FaceLandmarker and converts standard sRGB through CIE XYZ (D65 illuminant) to perceptually uniform <strong>CIELAB ($L^*, a^*, b^*$)</strong>. Accurately maps complex South Asian complexions into <em>Warm Golden</em>, <em>Olive Neutral</em>, <em>Deep Espresso</em>, and <em>Cool Rosy</em>.
              </p>
            </div>

            {/* 3. SigLIP / CLIP Embeddings */}
            <div className="p-6 bg-white rounded-3xl border border-[#F3ECE1] space-y-3 shadow-sm">
              <div className="flex items-center justify-between border-b border-[#F3ECE1] pb-3">
                <div className="flex items-center space-x-2.5">
                  <Layers className="w-5 h-5 text-[#3F5945]" />
                  <h3 className="font-serif text-base font-bold text-[#261B18]">
                    3. Wardrobe Vault Background Cutout & SigLIP Matcher
                  </h3>
                </div>
                <span className="text-[10px] bg-[#7A2E2E]/10 text-[#7A2E2E] font-mono px-2 py-0.5 rounded-full font-bold">
                  @imgly/background-removal + SigLIP
                </span>
              </div>
              <p className="text-xs text-[#261B18]/80 leading-relaxed">
                Users can upload photos of clothes they already own. <strong>@imgly/background-removal</strong> removes the background locally in the browser, creating a clean transparent cutout. The server then computes visual feature embeddings using <strong>google/siglip-base-patch16-224</strong> to score styling compatibility against the TARVEQ boutique catalog.
              </p>
            </div>

            {/* 4. LangChain Stylist & Copywriter */}
            <div className="p-6 bg-white rounded-3xl border border-[#F3ECE1] space-y-3 shadow-sm">
              <div className="flex items-center justify-between border-b border-[#F3ECE1] pb-3">
                <div className="flex items-center space-x-2.5">
                  <Terminal className="w-5 h-5 text-[#7A2E2E]" />
                  <h3 className="font-serif text-base font-bold text-[#261B18]">
                    4. LangChain Stylist Chatbot & Admin Copywriter
                  </h3>
                </div>
                <span className="text-[10px] bg-[#B8925A]/20 text-[#261B18] font-mono px-2 py-0.5 rounded-full font-bold">
                  langchain + Qwen 2.5 / Llama 3.1
                </span>
              </div>
              <p className="text-xs text-[#261B18]/80 leading-relaxed">
                Connects <strong>Qwen/Qwen2.5-7B-Instruct</strong> and <strong>meta-llama/Llama-3.1-8B-Instruct</strong> through LangChain. Injects user Style DNA, Wardrobe Vault items, live SQLite inventory, and active order tracking into the prompt to provide warm, contextual styling conversations and 1-click admin editorial descriptions.
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
