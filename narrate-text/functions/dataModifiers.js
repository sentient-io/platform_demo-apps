/** State to hold and update user inputs or selections */
const state = {
  language: 'english',
  model: 'female_singaporean',
  pitch: 1,
  tempo: 1,
  text: '',
  wordLimit: 2000,
  inputPlaceholderText: 'Put some text here to convert to speech',
  userApiKey: '',
  userInput: {
    english: '',
    japanese: '',
    mandarin: '',
  },
  useProvidedText: true,
  providedText: {
    english:
      'Speech synthesis is the artificial production of human speech. A computer system used for this purpose is called a speech computer or speech synthesizer, and can be implemented in software or hardware products. A text-to-speech (TTS) system converts normal language text into speech; other systems render symbolic linguistic representations like phonetic transcriptions into speech.',
    japanese:
      '音声合成とは、人間の音声を人工的に作り出すことである。音声情報処理の一分野。音声合成器により合成された音声を合成音声（ごうせいおんせい）と呼ぶ。典型的にはテキスト（文章）を音声に変換できることから、しばしばテキスト音声合成またはText-To-Speech (TTS)とも呼ばれる。なお、歌声を合成するものは特に歌声合成と呼ばれる。また、音声を別の個人あるいはキャラクターの音声に変換する手法は声質変換と呼ばれる。',
    mandarin:
      '语音合成是将人类语音用人工的方式所产生。若是将电脑系统用在语音合成上，则称为语音合成器，而语音合成器可以用软/硬件所实现。文字转语音（Text-To-Speech，TTS）系统则是将一般语言的文字转换为语音，其他的系统可以描绘语言符号的表示方式，就像音标转换至语音一样。',
  },
  userInputCount: 0,

  /** Fore Firefox "Play / Pause" button to control audio */
  audioPlaying: false,

  /** e.g. English | Female Singaporean | Pitch: 1.5 | Tempo: 1.5 */
  resultDescription: '',
}

function fetchApiKeyFromSessionStorage() {
  const k = window.sessionStorage.getItem('sentientApiKey')
  state.userApiKey = k
}

/**
 * Detect if the demo app is running locally, if so, use session storage store
 * api key for developing convence.
 * */
if (
  location.hostname === 'localhost' ||
  location.hostname === '127.0.0.1' ||
  location.hostname === ''
) {
  fetchApiKeyFromSessionStorage()
}
