import sys
import numpy as np
import matplotlib.pyplot as plt
from matplotlib.animation import FuncAnimation
from PyQt5.QtWidgets import QApplication, QVBoxLayout, QPushButton, QWidget, QLabel
from pydub import AudioSegment
from scipy.fftpack import fft
import wave
import pyaudio
import queue
import threading


def mp3_to_wav(mp3_file, wav_file):
    """Converts an MP3 file to WAV format."""
    audio = AudioSegment.from_mp3(mp3_file)
    audio.export(wav_file, format="wav")


def audio_playback(wf, stream, chunk, data_queue):
    """Streams audio and queues chunks for visualization."""
    try:
        while True:
            data = wf.readframes(chunk)
            if len(data) < chunk * wf.getsampwidth():
                break
            stream.write(data)
            data_queue.put(data)  # Queue the audio data for visualization
    finally:
        stream.stop_stream()
        stream.close()
        wf.close()


def start_audio_visualization():
    """Processes audio and visualizes the frequency spectrum."""
    mp3_file = "src/audio/as_the_world_falls_down_aaron_richards_cover.mp3"  # Replace with your hardcoded MP3 file path
    wav_file = "temp_audio.wav"
    mp3_to_wav(mp3_file, wav_file)

    # Open the WAV file
    wf = wave.open(wav_file, 'rb')

    # PyAudio stream setup
    p = pyaudio.PyAudio()
    stream = p.open(
        format=p.get_format_from_width(wf.getsampwidth()),
        channels=wf.getnchannels(),
        rate=wf.getframerate(),
        output=True
    )

    chunk = 1024
    rate = wf.getframerate()
    freqs = np.fft.rfftfreq(chunk, d=1 / rate)

    data_queue = queue.Queue()

    # Start audio playback in a separate thread
    threading.Thread(target=audio_playback, args=(wf, stream, chunk, data_queue), daemon=True).start()

    # Set up the plot
    fig, ax = plt.subplots()
    line, = ax.plot(freqs, np.zeros(len(freqs)))
    ax.set_xlim(0, rate / 2)
    ax.set_ylim(0, 1000)
    ax.set_xlabel("Frequency (Hz)")
    ax.set_ylabel("Power")
    ax.set_title("Frequency vs Power")

    def update(frame):
        """Updates the frequency spectrum plot."""
        try:
            data = data_queue.get_nowait()  # Get audio data from the queue
            audio_data = np.frombuffer(data, dtype=np.int16)
            fft_data = np.abs(fft(audio_data)[:len(freqs)])
            line.set_ydata(fft_data)
        except queue.Empty:
            pass
        return line,

    # Use FuncAnimation for real-time updates
    ani = FuncAnimation(fig, update, interval=30)
    # plt.show()


# PyQt5 GUI setup
app = QApplication(sys.argv)
window = QWidget()
window.setWindowTitle("Audio Frequency Visualizer")
layout = QVBoxLayout()

label = QLabel("Click the button below to start audio visualization:")
layout.addWidget(label)

button = QPushButton("Start Visualization")
button.clicked.connect(start_audio_visualization)
layout.addWidget(button)

window.setLayout(layout)
window.show()

from matplotlib.backends.backend_qt5agg import FigureCanvasQTAgg as FigureCanvas

class PlotWindow(QWidget):
    def __init__(self):
        super().__init__()
        self.figure, self.ax = plt.subplots()
        self.canvas = FigureCanvas(self.figure)
        layout = QVBoxLayout()
        layout.addWidget(self.canvas)
        self.setLayout(layout)

    def update_plot(self, data):
        # Update logic for the plot
        pass

# Replace plt.show() with a custom PyQt window for plotting
plot_window = PlotWindow()
plot_window.show()


sys.exit(app.exec_())
