'use client';

import { ChangeEvent, DragEvent, useEffect, useRef, useState } from 'react';
import { Film, ImagePlus, Sparkles, Upload, Wand2, Play, Download, RefreshCw } from 'lucide-react';

type JobState = 'idle' | 'ready' | 'generating' | 'done';

export default function Home() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [image, setImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [prompt, setPrompt] = useState('Slow cinematic camera push-in, natural movement, realistic lighting');
  const [duration, setDuration] = useState('5');
  const [aspect, setAspect] = useState('16:9');
  const [motion, setMotion] = useState('Cinematic');
  const [state, setState] = useState<JobState>('idle');
  const [error, setError] = useState('');

  useEffect(() => () => { if (image?.startsWith('blob:')) URL.revokeObjectURL(image); }, [image]);

  function acceptFile(next: File) {
    setError('');
    if (!next.type.startsWith('image/')) return setError('Please select a JPG, PNG, WEBP, or GIF image.');
    if (next.size > 20 * 1024 * 1024) return setError('Image must be smaller than 20 MB.');
    if (image?.startsWith('blob:')) URL.revokeObjectURL(image);
    setFile(next);
    setImage(URL.createObjectURL(next));
    setState('ready');
  }

  function onPick(e: ChangeEvent<HTMLInputElement>) {
    const next = e.target.files?.[0];
    if (next) acceptFile(next);
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const next = e.dataTransfer.files?.[0];
    if (next) acceptFile(next);
  }

  async function generate() {
    if (!file) return setError('Upload an image first.');
    setError('');
    setState('generating');
    const form = new FormData();
    form.append('image', file);
    form.append('prompt', prompt);
    form.append('duration', duration);
    form.append('aspectRatio', aspect);
    form.append('motion', motion);

    try {
      const response = await fetch('/api/generate', { method: 'POST', body: form });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Generation failed.');
      setState('done');
      if (data.videoUrl) window.open(data.videoUrl, '_blank');
    } catch (err) {
      setState('ready');
      setError(err instanceof Error ? err.message : 'Generation failed.');
    }
  }

  return (
    <main className="min-h-screen bg-[#070812] text-white">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-3"><div className="rounded-xl bg-violet-500/15 p-2 text-violet-300"><Film size={22} /></div><span className="text-lg font-bold tracking-tight">MotionForge</span></div>
        <div className="hidden items-center gap-8 text-sm text-white/60 md:flex"><span>Image to Video</span><span>Projects</span><span>API</span></div>
        <button className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium hover:bg-white/10">Sign in</button>
      </nav>

      <section className="mx-auto max-w-7xl px-6 pb-20 pt-8">
        <div className="mb-10 max-w-3xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/10 px-3 py-1.5 text-xs font-semibold text-violet-200"><Sparkles size={14} /> AI IMAGE → VIDEO</div>
          <h1 className="text-4xl font-black tracking-tight md:text-6xl">Bring your images to life.</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-white/55 md:text-lg">Upload one image, describe the motion, and generate a cinematic video. The UI is ready for your preferred video-generation provider.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.25fr_.75fr]">
          <div className="rounded-3xl border border-white/10 bg-white/[.035] p-4 shadow-2xl shadow-black/20">
            <div onDragOver={(e) => e.preventDefault()} onDrop={onDrop} onClick={() => inputRef.current?.click()} className="group relative flex min-h-[470px] cursor-pointer items-center justify-center overflow-hidden rounded-2xl border border-dashed border-white/15 bg-black/20 hover:border-violet-400/50">
              {image ? <img src={image} alt="Uploaded source" className="max-h-[470px] w-full object-contain" /> : <div className="text-center"><div className="mx-auto mb-5 w-fit rounded-2xl bg-violet-500/10 p-5 text-violet-300"><ImagePlus size={38} /></div><h2 className="text-xl font-bold">Drop your image here</h2><p className="mt-2 text-sm text-white/45">or click to browse · JPG, PNG, WEBP · up to 20 MB</p><div className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-black"><Upload size={16} /> Choose image</div></div>}
              <input ref={inputRef} type="file" accept="image/*" onChange={onPick} className="hidden" />
            </div>
            {image && <button onClick={(e) => { e.stopPropagation(); setImage(null); setFile(null); setState('idle'); }} className="mt-3 text-xs text-white/45 hover:text-white">Remove image</button>}
          </div>

          <aside className="rounded-3xl border border-white/10 bg-white/[.035] p-6">
            <div className="mb-6 flex items-center justify-between"><h2 className="font-bold">Generation settings</h2><span className="rounded-full bg-emerald-400/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-300">READY</span></div>
            <label className="mb-2 block text-xs font-semibold text-white/55">Motion prompt</label>
            <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={5} className="w-full resize-none rounded-2xl border border-white/10 bg-black/20 p-4 text-sm leading-6 outline-none placeholder:text-white/25 focus:border-violet-400/50" />

            <div className="mt-5 grid grid-cols-2 gap-3">
              <label className="text-xs text-white/55">Duration<select value={duration} onChange={(e) => setDuration(e.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-[#10111c] p-3 text-sm text-white outline-none"><option value="5">5 seconds</option><option value="8">8 seconds</option><option value="10">10 seconds</option></select></label>
              <label className="text-xs text-white/55">Aspect ratio<select value={aspect} onChange={(e) => setAspect(e.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-[#10111c] p-3 text-sm text-white outline-none"><option>16:9</option><option>9:16</option><option>1:1</option><option>4:5</option></select></label>
            </div>
            <label className="mt-5 block text-xs text-white/55">Motion style<select value={motion} onChange={(e) => setMotion(e.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-[#10111c] p-3 text-sm text-white outline-none"><option>Cinematic</option><option>Natural</option><option>Dynamic</option><option>Subtle</option></select></label>

            <button disabled={!file || state === 'generating'} onClick={generate} className="mt-7 flex w-full items-center justify-center gap-2 rounded-2xl bg-violet-500 px-5 py-4 font-bold text-white shadow-lg shadow-violet-500/20 transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-40">{state === 'generating' ? <><RefreshCw className="animate-spin" size={18} /> Generating…</> : <><Wand2 size={18} /> Generate video</>}</button>
            {state === 'done' && <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-400/10 p-3 text-sm text-emerald-300"><Play size={16} /> Generation complete.</div>}
            {error && <div className="mt-4 rounded-xl border border-red-400/15 bg-red-400/10 p-3 text-sm text-red-200">{error}</div>}
          </aside>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {['Consistent composition','Prompt-controlled motion','Provider-ready API'].map((x, i) => <div key={x} className="rounded-2xl border border-white/10 bg-white/[.025] p-5"><div className="mb-3 text-violet-300">{i === 0 ? <ImagePlus size={20}/> : i === 1 ? <Wand2 size={20}/> : <Download size={20}/>}</div><div className="font-semibold">{x}</div><p className="mt-1 text-sm text-white/40">Built as a clean foundation for production AI video workflows.</p></div>)}
        </div>
      </section>
    </main>
  );
}
