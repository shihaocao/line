export class MicVolume {
    private audioContext: AudioContext | null = null;
    private analyser: AnalyserNode | null = null;
    private dataArray: Uint8Array | null = null;
    private averageVolume: number = 0;

    constructor(audioElement: HTMLAudioElement) {
        this.initAudio(audioElement);
    }

    // Initialize the audio element as the source
    private initAudio(audioElement: HTMLAudioElement): void {
        try {
            // Initialize AudioContext and AnalyserNode
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 256;

            // Create a MediaElementSource from the audio element
            const source = this.audioContext.createMediaElementSource(audioElement);
            source.connect(this.analyser);

            // Connect the analyser to the destination (to hear audio output)
            this.analyser.connect(this.audioContext.destination);

            // Create a data array for frequency data
            this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
        } catch (error) {
            console.error('Error initializing audio:', error);
            alert('Unable to initialize audio processing.');
        }
    }

    // Method to update and calculate the average volume
    public updateVolume(): number {
        let lowerFreq = 1000
        let upperFreq = 2000

        lowerFreq = 0
        upperFreq = 44000
        if (!this.analyser || !this.dataArray || !this.audioContext) {
            return 0; // Return 0 if the analyser is not initialized
        }

        this.analyser.getByteFrequencyData(this.dataArray);

        // Map the frequency bins to actual frequencies
        const sampleRate = this.audioContext.sampleRate;
        const binCount = this.analyser.frequencyBinCount;
        const binWidth = sampleRate / (2 * binCount); // Frequency range per bin

        // Calculate the range of bins to analyze
        const lowerBin = Math.floor(lowerFreq / binWidth);
        const upperBin = Math.ceil(upperFreq / binWidth);

        // Calculate the average volume within the specified frequency band
        const sum = this.dataArray
            .slice(lowerBin, upperBin)
            .reduce((a, b) => a + b, 0);
        const bandAverage = sum / (upperBin - lowerBin);

        // Scale to 0-100
        const scaledAverage = Math.round((bandAverage / 255) * 100);
        return 2 * Math.sqrt(scaledAverage);
    }
}
