const express = require("express");
const multer = require("multer");
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");
const { exec } = require("child_process");
const { SpeechClient } = require("@google-cloud/speech");
const { Translate } = require("@google-cloud/translate").v2;
const { TextToSpeechClient } = require("@google-cloud/text-to-speech");
const fs = require("fs");

const app = express();
const upload = multer({ dest: "uploads/" });
const port = 5173;


// Configure Google Cloud
const speechClient = new SpeechClient();
const translateClient = new Translate();
const textToSpeechClient = new TextToSpeechClient();

const supportedLanguages = {
  en: { language: "English", voice: "en-US-Wavenet-D" },
  es: { language: "Spanish", voice: "es-ES-Standard-A" },
  fr: { language: "French", voice: "fr-FR-Standard-A" },
  de: { language: "German", voice: "de-DE-Standard-A" },
  hi: { language: "Hindi", voice: "hi-IN-Standard-A" },
  zh: { language: "Chinese", voice: "zh-CN-Standard-A" },
  ja: { language: "Japanese", voice: "ja-JP-Standard-A" },
  ru: { language: "Russian", voice: "ru-RU-Standard-A" },
  ar: { language: "Arabic", voice: "ar-XA-Standard-A" },
  pt: { language: "Portuguese", voice: "pt-BR-Standard-A" },
};

app.use(express.json());

app.post("/dub", upload.single("videoFile"), async (req, res) => {
  try {
    const { file } = req;
    const videoPath = file.path;
    const audioPath = "audio.wav";
    const translatedAudioPath = "translated_audio.mp3";
    const outputVideoPath = "dubbed_video.mp4";

    // Extract audio from video
    await extractAudio(videoPath, audioPath);

    // Convert speech to text
    const transcript = await speechToText(audioPath, "en-US");

    // Translate text
    const translatedText = await translateText(transcript, "es");

    // Convert text to speech
    await textToSpeech(translatedText, translatedAudioPath, "es-ES", "es-ES-Standard-A");

    // Merge audio with video
    await mergeAudioVideo(videoPath, translatedAudioPath, outputVideoPath);

    res.json({ dubbedVideoUrl: `http://localhost:5000/${outputVideoPath}` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error processing video" });
  }
});

const extractAudio = (videoPath, audioPath) => {
  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .output(audioPath)
      .on("end", () => resolve())
      .on("error", (err) => reject(err))
      .run();
  });
};

const speechToText = async (audioPath, languageCode) => {
  const audioBytes = fs.readFileSync(audioPath).toString("base64");

  const request = {
    audio: { content: audioBytes },
    config: { languageCode },
  };

  const [response] = await speechClient.recognize(request);
  const transcription = response.results.map((result) => result.alternatives[0].transcript).join("\n");

  return transcription;
};

const translateText = async (text, targetLanguage) => {
  const [translation] = await translateClient.translate(text, targetLanguage);
  return translation;
};

const textToSpeech = async (text, outputPath, languageCode, voiceName) => {
  const request = {
    input: { text },
    voice: { languageCode, name: voiceName },
    audioConfig: { audioEncoding: "MP3" },
  };

  const [response] = await textToSpeechClient.synthesizeSpeech(request);
  fs.writeFileSync(outputPath, response.audioContent);
};

const mergeAudioVideo = (videoPath, audioPath, outputPath) => {
  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .addInput(audioPath)
      .output(outputPath)
      .on("end", () => resolve())
      .on("error", (err) => reject(err))
      .run();
  });
};

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
