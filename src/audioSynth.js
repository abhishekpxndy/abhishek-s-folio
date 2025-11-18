// Piano Sound Synthesizer using Web Audio API
// This replaces MP3 files with programmatically generated piano sounds

class PianoSynth {
    constructor() {
        this.audioContext = null;
        this.masterGain = null;
        this.initialized = false;
    }

    init() {
        if (this.initialized) return;
        
        try {
            // Create audio context (works on iOS)
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Master volume control
            this.masterGain = this.audioContext.createGain();
            this.masterGain.gain.value = 0.3;
            this.masterGain.connect(this.audioContext.destination);
            
            this.initialized = true;
        } catch (e) {
            console.error('Failed to initialize audio context:', e);
        }
    }

    // Convert note name to frequency (e.g., "C4" -> 261.63 Hz)
    noteToFrequency(note) {
        const noteMap = {
            'C': 0, 'c': 1, 'D': 2, 'd': 3, 'E': 4,
            'F': 5, 'f': 6, 'G': 7, 'g': 8, 'A': 9, 'a': 10, 'B': 11
        };
        
        // Extract note letter and octave (e.g., "C4" or "f3")
        const noteLetter = note.slice(0, -1);
        const octave = parseInt(note.slice(-1));
        
        if (!(noteLetter in noteMap)) {
            console.warn('Unknown note:', note);
            return 440; // Default to A4
        }
        
        const semitone = noteMap[noteLetter];
        // A4 = 440 Hz is our reference (octave 4, semitone 9)
        const semitonesFromA4 = (octave - 4) * 12 + (semitone - 9);
        
        return 440 * Math.pow(2, semitonesFromA4 / 12);
    }

    // Play a piano note with realistic envelope
    playNote(noteName, duration = 1.5) {
        if (!this.initialized || !this.audioContext) {
            console.warn('Audio context not initialized');
            return;
        }

        const now = this.audioContext.currentTime;
        const frequency = this.noteToFrequency(noteName);
        
        // Create oscillators for a richer piano sound (3 harmonics)
        const oscillators = [];
        const gains = [];
        
        // Fundamental frequency
        const osc1 = this.audioContext.createOscillator();
        osc1.type = 'triangle'; // Warmer than sine
        osc1.frequency.value = frequency;
        
        // Second harmonic (octave up, quieter)
        const osc2 = this.audioContext.createOscillator();
        osc2.type = 'sine';
        osc2.frequency.value = frequency * 2;
        
        // Third harmonic (adds brightness)
        const osc3 = this.audioContext.createOscillator();
        osc3.type = 'sine';
        osc3.frequency.value = frequency * 3;
        
        oscillators.push(osc1, osc2, osc3);
        
        // Create gain nodes for each oscillator
        const gain1 = this.audioContext.createGain();
        const gain2 = this.audioContext.createGain();
        const gain3 = this.audioContext.createGain();
        
        gains.push(gain1, gain2, gain3);
        
        // Connect oscillators to their gains
        osc1.connect(gain1);
        osc2.connect(gain2);
        osc3.connect(gain3);
        
        // Mix the harmonics (fundamental is loudest)
        gain1.gain.value = 0.4;
        gain2.gain.value = 0.15;
        gain3.gain.value = 0.08;
        
        // Create envelope gain for ADSR
        const envelopeGain = this.audioContext.createGain();
        envelopeGain.gain.value = 0;
        
        // Connect all gains to envelope
        gain1.connect(envelopeGain);
        gain2.connect(envelopeGain);
        gain3.connect(envelopeGain);
        
        // Add subtle reverb/delay effect
        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 3000 + frequency; // Brighter for higher notes
        filter.Q.value = 1;
        
        envelopeGain.connect(filter);
        filter.connect(this.masterGain);
        
        // Piano-like ADSR envelope
        const attackTime = 0.01;  // Very fast attack
        const decayTime = 0.1;    // Quick decay
        const sustainLevel = 0.4; // Lower sustain
        const releaseTime = 0.8;  // Long release (piano resonance)
        
        // Attack
        envelopeGain.gain.setValueAtTime(0, now);
        envelopeGain.gain.linearRampToValueAtTime(1, now + attackTime);
        
        // Decay to sustain
        envelopeGain.gain.linearRampToValueAtTime(sustainLevel, now + attackTime + decayTime);
        
        // Sustain (hold)
        const sustainDuration = Math.max(0.1, duration - attackTime - decayTime - releaseTime);
        
        // Release
        envelopeGain.gain.setValueAtTime(sustainLevel, now + attackTime + decayTime + sustainDuration);
        envelopeGain.gain.exponentialRampToValueAtTime(0.01, now + attackTime + decayTime + sustainDuration + releaseTime);
        
        // Start oscillators
        oscillators.forEach(osc => osc.start(now));
        
        // Stop oscillators after note finishes
        const stopTime = now + attackTime + decayTime + sustainDuration + releaseTime;
        oscillators.forEach(osc => osc.stop(stopTime));
        
        // Clean up
        setTimeout(() => {
            oscillators.forEach(osc => osc.disconnect());
            gains.forEach(gain => gain.disconnect());
            envelopeGain.disconnect();
            filter.disconnect();
        }, (stopTime - now + 0.1) * 1000);
    }

    // Resume audio context (required for iOS after user interaction)
    resume() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }

    // Set master volume (0 to 1)
    setVolume(volume) {
        if (this.masterGain) {
            this.masterGain.gain.value = Math.max(0, Math.min(1, volume));
        }
    }
}

// Create singleton instance
const pianoSynth = new PianoSynth();

export default pianoSynth;
