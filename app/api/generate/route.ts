import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const form = await request.formData();
  const image = form.get('image');
  const prompt = String(form.get('prompt') || '');
  const duration = String(form.get('duration') || '5');
  const aspectRatio = String(form.get('aspectRatio') || '16:9');
  const motion = String(form.get('motion') || 'Cinematic');

  if (!(image instanceof File)) {
    return NextResponse.json({ error: 'No image was uploaded.' }, { status: 400 });
  }

  // Provider-neutral adapter. Set VIDEO_PROVIDER_URL and VIDEO_PROVIDER_API_KEY
  // to connect your preferred image-to-video service without changing the UI.
  const providerUrl = process.env.VIDEO_PROVIDER_URL;
  const providerKey = process.env.VIDEO_PROVIDER_API_KEY;

  if (!providerUrl || !providerKey) {
    return NextResponse.json({
      error: 'Video provider is not configured yet. Add VIDEO_PROVIDER_URL and VIDEO_PROVIDER_API_KEY to .env.local, then restart the app.'
    }, { status: 501 });
  }

  const payload = new FormData();
  payload.append('image', image);
  payload.append('prompt', prompt);
  payload.append('duration', duration);
  payload.append('aspectRatio', aspectRatio);
  payload.append('motion', motion);

  const providerResponse = await fetch(providerUrl, {
    method: 'POST',
    headers: { Authorization: `Bearer ${providerKey}` },
    body: payload,
  });

  const text = await providerResponse.text();
  let data: unknown = text;
  try { data = JSON.parse(text); } catch { /* provider returned non-JSON */ }

  if (!providerResponse.ok) {
    return NextResponse.json({ error: 'The video provider rejected the request.', details: data }, { status: providerResponse.status });
  }

  return NextResponse.json(data);
}
