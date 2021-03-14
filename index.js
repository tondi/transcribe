const Mp32Wav = require('mp3-to-wav')

// replace with your own subscription key,
// service region (e.g., "westus"), and
// the name of the file you want to run
// through the speech recognizer.
var SUBSCRIPTION_KEY = '';
var SERVICE_REGION = "westeurope";
// Replace with your desired language
var SPEECH_RECOGNITION_LANGUAGE = "en-US";

// From Azure time format to hh:mm:ss
function parseOffset(time) {
  let sec = Math.floor(time / 10000000);
  let hrs = Math.floor(sec / 3600);
  sec -= hrs * 3600;
  let min = Math.floor(sec / 60);
  sec -= min * 60;

  sec = '' + sec;
  sec = ('00' + sec).substring(sec.length);

  if (hrs > 0) {
    min = '' + min;
    min = ('00' + min).substring(min.length);
    return hrs + ":" + min + ":" + sec;
  }
  else {
    return min + ":" + sec;
  }
}


(function () {
  "use strict";

  var sdk = require("microsoft-cognitiveservices-speech-sdk");
  var fs = require("fs");

  var subscriptionKey = SUBSCRIPTION_KEY;
  var serviceRegion = SERVICE_REGION; // e.g., "westus"
  var speechConfig = sdk.SpeechConfig.fromSubscription(subscriptionKey, serviceRegion);
  speechConfig.speechRecognitionLanguage = SPEECH_RECOGNITION_LANGUAGE;

  console.log(speechConfig);

  function exec(sourceFile) {

    if(!sourceFile.endsWith('wav')) return;
    if(sourceFile.startsWith('.')) return;

    const filename = sourceFile;
    const transcriptFile = `${filename}.txt`; 

    var pushStream = sdk.AudioInputStream.createPushStream();

    fs.createReadStream(filename).on('data', function (arrayBuffer) {
      pushStream.write(arrayBuffer.slice());
    }).on('end', function () {
      pushStream.close();
    });

    console.log("Now recognizing from: " + filename);

    var audioConfig = sdk.AudioConfig.fromStreamInput(pushStream);

    speechConfig.setProperty(sdk.PropertyId.SpeechServiceConnection_InitialSilenceTimeoutMs, "10000000"); // 10000s
    speechConfig.setProperty(sdk.PropertyId.SpeechServiceConnection_EndSilenceTimeoutMs, "10000000"); // 10000s
    
    var recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);

    console.log(recognizer);

    fs.writeFile(transcriptFile, '', function(){console.log('done')})
    fs.appendFileSync(transcriptFile, `Source: ${filename}\nTranscription start: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}\n\n`);

    recognizer.recognized = (s, e) => {
      console.log(e)

      if (e.result.reason === sdk.ResultReason.NoMatch) {
        const noMatchDetail = sdk.NoMatchDetails.fromResult(e.result);
        console.log("(recognized)  Reason: " + sdk.ResultReason[e.result.reason] + " | NoMatchReason: " + sdk.NoMatchReason[noMatchDetail.reason]);
      } else {
        const line = `${parseOffset(e.result.offset)} ${e.result.text}\n`;

        fs.appendFileSync(transcriptFile, line);
        console.log(line);
      }
    };

    recognizer.canceled = (s, e) => {
      let str = "(cancel) Reason: " + sdk.CancellationReason[e.reason];
      if (e.reason === sdk.CancellationReason.Error) {
        str += ": " + e.errorDetails;
      }
      console.log(str);
    };

    recognizer.speechEndDetected = (s, e) => {
      console.log(`(speechEndDetected) SessionId: ${e.sessionId}`);
      // do not terminate recognizer - let it run till end of file
      // recognizer = undefined;
    };

    recognizer.startContinuousRecognitionAsync(() => {
      console.log('Recognition started');
    },
      err => {
        console.trace("err - " + err);
        recognizer.close();
        recognizer = undefined;
      });

  }

  fs.readdir('wav', (err, files) => {
    files.forEach(file => {
      try {
        exec(`wav/${file}`);
      } catch (e) {
        console.error(e);
      }
    });
  });

}());
