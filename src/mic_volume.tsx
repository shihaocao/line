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
        if (!this.analyser || !this.dataArray) {
            return 0; // Return 0 if the analyser is not initialized
        }

        this.analyser.getByteFrequencyData(this.dataArray);

        // Calculate the average volume
        const sum = this.dataArray.reduce((a, b) => a + b, 0);
        this.averageVolume = sum / this.dataArray.length;

        // Scale to 0-100
        var x = Math.round((this.averageVolume / 255) * 100);
        return 2*Math.sqrt(x)
    }
}
