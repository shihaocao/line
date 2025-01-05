pactl load-module module-null-sink sink_name=mix-for-virtual-mic \
sink_properties=device.description=Mix-for-Virtual-Microphone

pactl load-module module-virtual-source source_name=VirtualMic source_properties=device.description="Virtual_Microphone"

pactl load-module module-null-sink sink_name=silence \
sink_properties=device.description=silent-sink-for-echo-cancel

pactl load-module module-echo-cancel sink_name=virtual-microphone source_name=virtual-microphone source_master=alsa_output.pci-0000_00_1f.3-platform-skl_hda_dsp_generic.HiFi__hw_sofhdadsp__sink.monitor sink_master=silence aec_method=null source_properties=device.description=Virtual-Microphone-EC sink_properties=device.description=Virtual-Microphone-EC