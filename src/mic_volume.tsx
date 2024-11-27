export class MicVolume {
    private audioContext: AudioContext | null = null;
    private analyser: AnalyserNode | null = null;
    private dataArray: Uint8Array | null = null;
    private averageVolume: number = 0;

    constructor() {
        this.initMic();
    }

    // Initialize the microphone
    private async initMic(): Promise<void> {
        try {
            // Request microphone access
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });

            // Initialize AudioContext and AnalyserNode
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 256;

            // Connect the microphone to the analyser
            const microphone = this.audioContext.createMediaStreamSource(stream);
            microphone.connect(this.analyser);

            // Create a data array for frequency data
            this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
        } catch (error) {
            console.error('Error accessing microphone:', error);
            alert('Unable to access microphone. Please check your permissions.');
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
        return Math.round((this.averageVolume / 255) * 100);
    }
}
