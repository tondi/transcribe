# Transcribe multiple files from wav to text with timestamps using Azure Speech Recognition API

Based on https://github.com/Azure-Samples/cognitive-services-speech-sdk/tree/master/quickstart/javascript/browser/from-file

## Requirements:
* A subscription key for the Speech service. See [Try the speech service for free](https://docs.microsoft.com/azure/cognitive-services/speech-service/get-started).
* Files prepared in format of wav, `16kHz sample rate` & `mono`

# Try it out for short example files
* run `npm install`
* replace `SUBSCRIPTION_KEY` & `SERVICE_REGION` with your Azure config
* run `node index.js`
* `example-*.wav.txt` output files are generated for default audio files

## Transcribe your files
* Put audio files in `wav` directory
* replace `SPEECH_RECOGNITION_LANGUAGE` with language your files are in

#### `node index.js`

Connects to Azure, runs this script and transcribes files step-by-step.

> For 1h long audio file, Azure needs about 20min to finish. Multiple files are transcripted in paralell, so fiveteen 1 hour files would still take about 20minutes. Each recognized sentence is incrementally appended to its newly created `source_file.wav.txt` file.

Notes:
* On MacOS you can easily convert to 16kHz & mono using iTunes (music.app) (https://support.apple.com/en-us/HT204310)
* `txt` files with the same name will be overriden on script run
* Pull Requests adding support for proggramatic `mp3 -> wav` conversion are welcome

![Result](https://github.com/tondi/transcribe/blob/master/result-screenshot.png?raw=true)
