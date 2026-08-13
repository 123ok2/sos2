// Web Audio API Synthesizer & Speech Assistant for AI SafetyNet

let audioCtx: AudioContext | null = null;
let sirenOscillator1: OscillatorNode | null = null;
let sirenOscillator2: OscillatorNode | null = null;
let sirenGainNode: GainNode | null = null;
let sirenTimer: any = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playEmergencySiren() {
  stopEmergencySiren();
  try {
    const ctx = getAudioContext();
    sirenGainNode = ctx.createGain();
    sirenGainNode.gain.setValueAtTime(0.6, ctx.currentTime);
    sirenGainNode.connect(ctx.destination);

    sirenOscillator1 = ctx.createOscillator();
    sirenOscillator1.type = "sawtooth";
    sirenOscillator1.connect(sirenGainNode);

    sirenOscillator2 = ctx.createOscillator();
    sirenOscillator2.type = "sine";
    sirenOscillator2.connect(sirenGainNode);

    let high = false;
    sirenOscillator1.frequency.setValueAtTime(800, ctx.currentTime);
    sirenOscillator2.frequency.setValueAtTime(850, ctx.currentTime);

    sirenOscillator1.start();
    sirenOscillator2.start();

    sirenTimer = setInterval(() => {
      if (!sirenGainNode || !audioCtx) return;
      const now = audioCtx.currentTime;
      high = !high;
      const targetFreq = high ? 1200 : 600;
      sirenOscillator1?.frequency.exponentialRampToValueAtTime(targetFreq, now + 0.3);
      sirenOscillator2?.frequency.exponentialRampToValueAtTime(targetFreq + 50, now + 0.3);
    }, 400);
  } catch (err) {
    console.error("Failed to start siren:", err);
  }
}

export function stopEmergencySiren() {
  if (sirenTimer) {
    clearInterval(sirenTimer);
    sirenTimer = null;
  }
  if (sirenOscillator1) {
    try {
      sirenOscillator1.stop();
      sirenOscillator1.disconnect();
    } catch (e) {}
    sirenOscillator1 = null;
  }
  if (sirenOscillator2) {
    try {
      sirenOscillator2.stop();
      sirenOscillator2.disconnect();
    } catch (e) {}
    sirenOscillator2 = null;
  }
  if (sirenGainNode) {
    try {
      sirenGainNode.disconnect();
    } catch (e) {}
    sirenGainNode = null;
  }
}

export function playCountdownBeep(highPitch = false) {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(highPitch ? 1000 : 500, ctx.currentTime);

    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  } catch (err) {
    console.error("Error playing countdown beep", err);
  }
}

// Text-to-Speech Assistant
export function speakText(text: string, lang = "vi-VN", rate = 0.95) {
  if (!("speechSynthesis" in window)) {
    console.warn("SpeechSynthesis is not supported in this browser");
    return;
  }

  window.speechSynthesis.cancel(); // stop current utterance
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = rate;

  // Find Vietnamese voice if available
  const voices = window.speechSynthesis.getVoices();
  const viVoice = voices.find((v) => v.lang.includes("vi") || v.lang.includes("VI"));
  if (viVoice) {
    utterance.voice = viVoice;
  }

  window.speechSynthesis.speak(utterance);
}

export function stopSpeech() {
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}
