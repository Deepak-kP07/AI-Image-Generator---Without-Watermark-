
import React, { useEffect } from 'react';

interface LandingPageProps {
  onLaunch: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLaunch }) => {
  useEffect(() => {
    // Initialize AOS
    // @ts-ignore
    if (window.AOS) {
      // @ts-ignore
      window.AOS.init({
        duration: 800,
        once: true,
        easing: 'ease-out-cubic',
        offset: 50,
      });
    }
  }, []);

  const scrollToDemo = () => {
    const el = document.getElementById('demo-view');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-200 font-sans overflow-x-hidden">
      
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0B0F19]/80 backdrop-blur-lg border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo(0, 0)}>
             <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center font-bold text-white text-xl shadow-[0_0_20px_rgba(168,85,247,0.4)]">Z</div>
             <span className="font-bold text-2xl tracking-tight text-white">Zopkit</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <a href="#features" className="hover:text-cyan-400 transition-colors">Features</a>
            <button onClick={onLaunch} className="hover:text-cyan-400 transition-colors">Live Demo</button>
            <button onClick={onLaunch} className="hover:text-cyan-400 transition-colors">Creators</button>
          </div>
          <button 
            onClick={onLaunch}
            className="px-6 py-2.5 bg-white text-black font-bold rounded-full hover:bg-cyan-400 hover:shadow-[0_0_20px_rgba(34,211,238,0.5)] transition-all duration-300 transform hover:-translate-y-0.5"
          >
            Launch App
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-purple-600/20 rounded-full blur-[120px] -z-10 opacity-50"></div>
        <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-cyan-500/10 rounded-full blur-[100px] -z-10"></div>

        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div data-aos="fade-down" className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-cyan-400 text-xs font-semibold mb-8 uppercase tracking-widest backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            Now with Gemini Nano Banana
          </div>
          
          <h1 data-aos="fade-up" className="text-5xl md:text-7xl font-black text-white leading-tight mb-8 tracking-tight">
            Generate Unlimited AI Images <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">Zero Watermarks.</span>
          </h1>
          
          <p data-aos="fade-up" data-aos-delay="100" className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Powered by Gemini 2.5, Flux.1 & SDXL. Create, edit, watermark, and schedule your content. 
            All in one professional workspace.
          </p>
          
          <div data-aos="fade-up" data-aos-delay="200" className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
            <button 
              onClick={onLaunch}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-lg rounded-xl hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] transition-all duration-300 transform hover:-translate-y-1"
            >
              Open Zopkit AI Generator
            </button>
            <button 
              onClick={scrollToDemo}
              className="w-full sm:w-auto px-8 py-4 bg-[#1e293b] border border-slate-700 text-white font-semibold text-lg rounded-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2 group"
            >
              <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                 <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              </span>
              Watch Demo
            </button>
          </div>

          {/* Hero Mockup (Image) */}
          <div id="demo-view" data-aos="fade-up" data-aos-delay="300" className="relative mx-auto max-w-5xl animate-float group cursor-pointer" onClick={onLaunch}>
             <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
             
             {/* Replace this src with your generated UI image URL */}
             <img 
               src="https://res.cloudinary.com/dckm1rzyh/image/upload/v1765475325/ElevenLabs_image_google-nano-banana-pro__A_futuristi..._2025-12-11T17_41_11_uy09rj.jpg" 
               alt="Zopkit App Interface" 
               className="relative rounded-xl shadow-2xl border border-slate-700 w-full h-auto object-cover"
             />

             {/* Click to Try Overlay */}
             <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity rounded-xl">
                <button className="px-8 py-3 bg-white text-black font-bold rounded-full transform scale-95 group-hover:scale-105 transition-all shadow-[0_0_30px_rgba(255,255,255,0.3)]">
                   Click to Try Live
                </button>
             </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section id="features" className="py-24 bg-[#0B0F19] relative">
         <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
               <h2 data-aos="fade-up" className="text-3xl md:text-5xl font-bold text-white mb-4">Everything You Need</h2>
               <p data-aos="fade-up" className="text-slate-400 max-w-2xl mx-auto">Create professional visual assets without switching between 5 different tools.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {/* Feature 1 */}
               <div data-aos="fade-up" data-aos-delay="0" className="p-8 rounded-2xl bg-gradient-to-b from-slate-800/50 to-slate-900/50 border border-white/5 hover:border-cyan-500/50 transition-colors group">
                  <div className="w-12 h-12 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400 mb-6 group-hover:scale-110 transition-transform">
                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">Unlimited & Fast</h3>
                  <p className="text-slate-400 leading-relaxed">No credits, no waiting. Generate as many images as you need with Gemini Nano Banana optimized for speed.</p>
               </div>

               {/* Feature 2 */}
               <div data-aos="fade-up" data-aos-delay="100" className="p-8 rounded-2xl bg-gradient-to-b from-slate-800/50 to-slate-900/50 border border-white/5 hover:border-purple-500/50 transition-colors group">
                  <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 mb-6 group-hover:scale-110 transition-transform">
                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"></path></svg>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">Custom Watermarks</h3>
                  <p className="text-slate-400 leading-relaxed">Upload your logo, position it, resize it, and save presets. Your content, your branding, automatically applied.</p>
               </div>

               {/* Feature 3 */}
               <div data-aos="fade-up" data-aos-delay="200" className="p-8 rounded-2xl bg-gradient-to-b from-slate-800/50 to-slate-900/50 border border-white/5 hover:border-blue-500/50 transition-colors group">
                  <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 mb-6 group-hover:scale-110 transition-transform">
                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">Video Generation</h3>
                  <p className="text-slate-400 leading-relaxed">Create 1080p videos with Veo 3.1. Perfect for social media reels and shorts. Add sound effects instantly.</p>
               </div>
               
                {/* Feature 4 */}
               <div data-aos="fade-up" data-aos-delay="300" className="p-8 rounded-2xl bg-gradient-to-b from-slate-800/50 to-slate-900/50 border border-white/5 hover:border-green-500/50 transition-colors group">
                  <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center text-green-400 mb-6 group-hover:scale-110 transition-transform">
                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">Visual Editing</h3>
                  <p className="text-slate-400 leading-relaxed">Don't like the background? Upload an image and tell Zopkit to "make it cyberpunk" or "add a cat".</p>
               </div>

                {/* Feature 5 */}
               <div data-aos="fade-up" data-aos-delay="400" className="p-8 rounded-2xl bg-gradient-to-b from-slate-800/50 to-slate-900/50 border border-white/5 hover:border-pink-500/50 transition-colors group">
                  <div className="w-12 h-12 rounded-lg bg-pink-500/10 flex items-center justify-center text-pink-400 mb-6 group-hover:scale-110 transition-transform">
                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">Model Variety</h3>
                  <p className="text-slate-400 leading-relaxed">Switch between Gemini, Flux.1 Schnell, and SDXL. Find the perfect aesthetic for your project.</p>
               </div>

                {/* Feature 6 */}
               <div data-aos="fade-up" data-aos-delay="500" className="p-8 rounded-2xl bg-gradient-to-b from-slate-800/50 to-slate-900/50 border border-white/5 hover:border-yellow-500/50 transition-colors group">
                  <div className="w-12 h-12 rounded-lg bg-yellow-500/10 flex items-center justify-center text-yellow-400 mb-6 group-hover:scale-110 transition-transform">
                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">Easy Download</h3>
                  <p className="text-slate-400 leading-relaxed">One click to download high-res PNGs or WebMs. No hidden fees, no complicated export flows.</p>
               </div>
            </div>
         </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 border-t border-slate-800/50 bg-[#0B0F19]">
        <div className="max-w-7xl mx-auto px-6">
           <div className="text-center mb-16">
               <h2 data-aos="fade-up" className="text-3xl md:text-5xl font-bold text-white mb-4">Why Creators Love Zopkit</h2>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div data-aos="fade-up" className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
                 <div className="flex text-yellow-500 mb-4">★★★★★</div>
                 <p className="text-slate-300 mb-6">"Finally a tool where I can just add my logo automatically. The watermark feature saves me 2 hours a week on Photoshop."</p>
                 <div className="flex items-center gap-3">
                    <img 
                        src="https://res.cloudinary.com/dckm1rzyh/image/upload/v1750172100/3_wm1kc0.png" 
                        alt="Sarah Jenkins" 
                        className="w-10 h-10 rounded-full object-cover border border-slate-600"
                    />
                    <div>
                       <div className="text-white font-bold"> Jenkins</div>
                       <div className="text-xs text-slate-500">Social Media Manager</div>
                    </div>
                 </div>
              </div>

              <div data-aos="fade-up" data-aos-delay="100" className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
                 <div className="flex text-yellow-500 mb-4">★★★★★</div>
                 <p className="text-slate-300 mb-6">"The Gemini Nano Banana model is blazing fast. I use it for all my blog headers now. Super crisp results."</p>
                 <div className="flex items-center gap-3">
                    <img 
                        src="https://res.cloudinary.com/dckm1rzyh/image/upload/v1750172100/1_xddgqp.png" 
                        alt="Mike Chen" 
                        className="w-10 h-10 rounded-full object-cover border border-slate-600"
                    />
                    <div>
                       <div className="text-white font-bold">Mike </div>
                       <div className="text-xs text-slate-500">Content Creator</div>
                    </div>
                 </div>
              </div>

              <div data-aos="fade-up" data-aos-delay="200" className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
                 <div className="flex text-yellow-500 mb-4">★★★★★</div>
                 <p className="text-slate-300 mb-6">"Veo video generation is a game changer for my TikTok. It understands motion so well."</p>
                 <div className="flex items-center gap-3">
                    <img 
                        src="https://res.cloudinary.com/dckm1rzyh/image/upload/v1750172100/2_mom8fg.png" 
                        alt="Elena Rodriguez" 
                        className="w-10 h-10 rounded-full object-cover border border-slate-600"
                    />
                    <div>
                       <div className="text-white font-bold">Elena Rodriguez</div>
                       <div className="text-xs text-slate-500">Digital Artist</div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-purple-900/20"></div>
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
           <h2 data-aos="fade-up" className="text-4xl md:text-6xl font-black text-white mb-8">Start Generating Free</h2>
           <p data-aos="fade-up" className="text-xl text-slate-400 mb-10">No signup required. No credit card. Just pure creativity.</p>
           <button 
             onClick={onLaunch}
             className="px-10 py-5 bg-cyan-400 text-black font-black text-xl rounded-full hover:bg-cyan-300 hover:scale-105 transition-all shadow-[0_0_40px_rgba(34,211,238,0.4)]"
           >
             Launch Zopkit Now
           </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#05080f] py-12 border-t border-slate-900">
         <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo(0, 0)}>
               <div className="w-8 h-8 rounded bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center font-bold text-white text-sm">Z</div>
               <span className="font-bold text-white tracking-tight">Zopkit</span>
            </div>
            
            <div className="text-slate-500 text-sm">
               Made with 💙 by Deepak & team
            </div>

            <div className="flex gap-6 text-slate-400 text-sm">
               <a href="#" className="hover:text-white transition-colors">Privacy</a>
               <a href="#" className="hover:text-white transition-colors">Terms</a>
               <a href="#" className="hover:text-white transition-colors">Contact</a>
            </div>
         </div>
      </footer>

      {/* Floating CTA for Mobile */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 md:hidden z-50">
          <button 
             onClick={onLaunch}
             className="px-8 py-3 bg-cyan-400 text-black font-bold rounded-full shadow-2xl hover:bg-cyan-300"
          >
             Launch App
          </button>
      </div>

    </div>
  );
};
