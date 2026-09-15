import type { Lang } from './types.js';

/**
 * Kamus antarmuka. Semua teks UI tinggal di sini supaya mudah diterjemahkan
 * dan mudah diaudit kelengkapannya (lihat tests/i18n.test.ts).
 * Interface dictionary. All UI text lives here so it is easy to translate and
 * to audit for completeness.
 */

const id = {
  'app.tagline': 'Jalur belajar di terminal — offline, gratis, untuk semua kalangan.',
  'app.footer': '↑↓ pilih · Enter lanjut · Esc/E keluar',
  'app.footerInput': 'Ketik angka lalu Enter · Esc batal',

  'common.back': 'Kembali',
  'common.quit': 'Keluar',
  'common.continue': 'Lanjut',
  'common.retry': 'Ulangi',
  'common.exit': 'Keluar',
  'common.correct': 'Benar',
  'common.wrong': 'Kurang tepat',
  'common.of': 'dari',
  'common.minutes': 'mnt',
  'common.error': 'Terjadi kesalahan',
  'common.cancel': 'Dibatalkan',
  'common.ok': 'OK',
  'common.pressAny': 'Tekan tombol apa saja...',

  'menu.title': 'Stasiun Utama',
  'menu.subtitle': 'Mau belajar apa hari ini?',
  'menu.pickTrack': 'Mulai jalur belajar',
  'menu.pickTrackHint': 'Materi + kuis per stasiun',
  'menu.quiz': 'Latihan kuis',
  'menu.quizHint': 'Langsung uji pemahaman',
  'menu.cards': 'Kartu hafalan',
  'menu.cardsHint': 'Bolak-balik kartu, hafalkan',
  'menu.review': 'Tinjau yang sulit',
  'menu.reviewHint': 'Pengulangan berjarak (spaced repetition)',
  'menu.progress': 'Lihat kemajuan',
  'menu.progressHint': 'Statistik & riwayat belajarmu',
  'menu.language': 'Ganti bahasa',
  'menu.languageHint': 'Indonesia / English',
  'menu.about': 'Tentang Railway',
  'menu.aboutHint': 'Cara kerja & lisensi',

  'tracks.title': 'Pilih jalur',
  'tracks.empty': 'Belum ada jalur. Tambahkan berkas JSON di src/content/.',
  'tracks.stations': 'stasiun',
  'tracks.questions': 'soal',
  'tracks.minutes': 'mnt',
  'tracks.chooseHint': 'Pilih jalur untuk melihat detail & mulai.',

  'level.pemula': 'Pemula',
  'level.menengah': 'Menengah',
  'level.lanjutan': 'Lanjutan',

  'track.title': 'Detail jalur',
  'track.start': 'Mulai dari awal',
  'track.continueAt': 'Lanjut ke stasiun {index}',
  'track.quizOnly': 'Kuis saja',
  'track.cardsOnly': 'Kartu saja',
  'track.stationList': 'Daftar stasiun',
  'track.done': 'Selesai {done}/{total} stasiun',
  'track.completed': 'Tuntas 🎉',
  'track.lastScore': 'Skor terakhir {score}/{total}',

  'lesson.stationOf': 'Stasiun {index} dari {total}',
  'lesson.points': 'Yang perlu kamu tahu',
  'lesson.toQuiz': 'Siap? Tekan Enter untuk kuis stasiun ini.',
  'lesson.learned': 'Stasiun selesai. Materi tersimpan di kemajuanmu.',

  'quiz.title': 'Kuis',
  'quiz.progress': 'Soal {index}/{total}',
  'quiz.choose': 'Pilih jawaban dengan angka 1–{max} atau panah + Enter.',
  'quiz.explain': 'Pembahasan',
  'quiz.next': 'Tekan Enter untuk soal berikutnya.',
  'quiz.finish': 'Tekan Enter untuk melihat hasil.',
  'quiz.result': 'Hasil kuis',
  'quiz.perfect': 'Sempurna! Semua jawaban benar. 🚂',
  'quiz.great': 'Bagus sekali! Sedikit lagi tuntas.',
  'quiz.keepGoing': 'Masih ada yang perlu diulang — coba tinjau lagi ya.',
  'quiz.saved': 'Skor tersimpan di {path}',
  'quiz.noQuestions': 'Jalur ini belum punya soal.',
  'quiz.answerKey': 'Kunci jawaban',

  'cards.title': 'Kartu hafalan',
  'cards.progress': 'Kartu {index}/{total}',
  'cards.flip': 'Tekan spasi/Enter untuk membalik kartu.',
  'cards.next': '← → geser · Enter/Spasi balik · Esc selesai',
  'cards.done': 'Semua kartu sudah dilihat.',

  'review.title': 'Tinjau yang sulit',
  'review.dueCount': '{count} soal siap ditinjau sekarang.',
  'review.noneDue': 'Tidak ada soal yang jatuh tempo. Bagus! 🎉',
  'review.hint': 'Fokus pada soal yang sering salah atau sudah lama tidak muncul.',
  'review.mistake': 'Pernah salah {times}x',
  'review.neverSeen': 'Belum pernah dikerjakan',
  'review.lastSeen': 'Terakhir {when}',
  'review.daysAgo': '{days} hari lalu',
  'review.today': 'hari ini',

  'progress.title': 'Kemajuan belajar',
  'progress.empty': 'Belum ada kemajuan. Mulai satu jalur dulu, yuk!',
  'progress.totalTime': 'Total waktu belajar',
  'progress.streak': 'Rangkaian hari',
  'progress.best': 'Terbaik',
  'progress.accuracy': 'Akurasi',
  'progress.questions': 'Soal dikerjakan',
  'progress.trackRow': '{emoji} {title}',
  'progress.detail': '{done}/{total} stasiun · {correct}/{answered} soal benar',
  'progress.file': 'Data tersimpan di {path}',
  'progress.reset': 'Hapus semua data kemajuan?',
  'progress.resetDone': 'Data kemajuan dihapus.',
  'progress.day': 'hari',

  'lang.title': 'Pilih bahasa / Select language',
  'lang.current': 'Bahasa aktif: {lang}',
  'lang.changed': 'Bahasa diubah ke {lang}.',
  'lang.id': 'Bahasa Indonesia',
  'lang.en': 'English',
  'lang.hint': 'Perubahan langsung diterapkan & disimpan.',

  'about.title': 'Tentang Railway',
  'about.body':
    'Railway = sekumpulan jalur belajar (rel) yang bisa ditempuh siapa saja.\n' +
    'Setiap jalur terdiri dari stasiun: baca materi, kerjakan kuis, ulangi dengan kartu.\n' +
    'Semua berjalan offline, tanpa akun, tanpa biaya.',
  'about.offline': 'Mode offline',
  'about.offlineYes': 'Ya, 100% lokal',
  'about.data': 'Data kamu',
  'about.dataBody': 'Tersimpan lokal di komputer sendiri',
  'about.license': 'Lisensi MIT — bebas pakai & ubah',

  'cli.unknown': 'Perintah tidak dikenal: {command}',
  'cli.suggest': 'Maksudmu: {suggestion}?',
  'cli.trackNotFound': 'Jalur "{id}" tidak ditemukan.',
  'cli.availableTracks': 'Jalur tersedia: {list}',
  'cli.langUsage': 'Pilih bahasa: id atau en.',
  'cli.noTty': 'Mode interaktif butuh terminal (TTY). Gunakan salah satu perintah di bawah.',
  'cli.resetConfirm': 'Tambahkan --ya untuk mengonfirmasi penghapusan data.',
  'cli.bye': 'Sampai jumpa di stasiun berikutnya! 🚂',
} as const;

type UiKey = keyof typeof id;

const en: Record<UiKey, string> = {
  'app.tagline': 'A learning track in your terminal — offline, free, for everyone.',
  'app.footer': '↑↓ select · Enter continue · Esc/E quit',
  'app.footerInput': 'Type a number then Enter · Esc cancel',

  'common.back': 'Back',
  'common.quit': 'Quit',
  'common.continue': 'Continue',
  'common.retry': 'Retry',
  'common.exit': 'Exit',
  'common.correct': 'Correct',
  'common.wrong': 'Not quite',
  'common.of': 'of',
  'common.minutes': 'min',
  'common.error': 'Something went wrong',
  'common.cancel': 'Cancelled',
  'common.ok': 'OK',
  'common.pressAny': 'Press any key...',

  'menu.title': 'Main Station',
  'menu.subtitle': 'What would you like to learn today?',
  'menu.pickTrack': 'Start a learning track',
  'menu.pickTrackHint': 'Lessons + quiz at every station',
  'menu.quiz': 'Practice quiz',
  'menu.quizHint': 'Test your understanding right away',
  'menu.cards': 'Flashcards',
  'menu.cardsHint': 'Flip cards and memorise',
  'menu.review': 'Review the hard ones',
  'menu.reviewHint': 'Spaced repetition drill',
  'review.hint': 'Focus on questions you get wrong or have not seen in a while.',
  'review.title': 'Review the hard ones',
  'review.dueCount': '{count} questions are due for review.',
  'review.noneDue': 'Nothing due right now. Nice work! 🎉',
  'review.mistake': 'Missed {times}x',
  'review.neverSeen': 'Never attempted',
  'review.lastSeen': 'Last seen {when}',
  'review.daysAgo': '{days} days ago',
  'review.today': 'today',

  'menu.progress': 'See progress',
  'menu.progressHint': 'Your stats & learning history',
  'menu.language': 'Change language',
  'menu.languageHint': 'Indonesia / English',
  'menu.about': 'About Railway',
  'menu.aboutHint': 'How it works & licence',

  'tracks.title': 'Choose a track',
  'tracks.empty': 'No tracks yet. Add a JSON file under src/content/.',
  'tracks.stations': 'stations',
  'tracks.questions': 'questions',
  'tracks.minutes': 'min',
  'tracks.chooseHint': 'Pick a track to see details and start.',

  'level.pemula': 'Beginner',
  'level.menengah': 'Intermediate',
  'level.lanjutan': 'Advanced',

  'track.title': 'Track details',
  'track.start': 'Start from the beginning',
  'track.continueAt': 'Continue at station {index}',
  'track.quizOnly': 'Quiz only',
  'track.cardsOnly': 'Cards only',
  'track.stationList': 'Stations',
  'track.done': 'Finished {done}/{total} stations',
  'track.completed': 'Completed 🎉',
  'track.lastScore': 'Last score {score}/{total}',

  'lesson.stationOf': 'Station {index} of {total}',
  'lesson.points': 'What you need to know',
  'lesson.toQuiz': 'Ready? Press Enter for this station quiz.',
  'lesson.learned': 'Station complete. Saved to your progress.',

  'quiz.title': 'Quiz',
  'quiz.progress': 'Question {index}/{total}',
  'quiz.choose': 'Pick an answer with 1–{max} or arrows + Enter.',
  'quiz.explain': 'Explanation',
  'quiz.next': 'Press Enter for the next question.',
  'quiz.finish': 'Press Enter to see your result.',
  'quiz.result': 'Quiz result',
  'quiz.perfect': 'Perfect! Every answer is correct. 🚂',
  'quiz.great': 'Great job! You are almost there.',
  'quiz.keepGoing': 'Some questions need another look — try the review mode.',
  'quiz.saved': 'Score stored at {path}',
  'quiz.noQuestions': 'This track has no questions yet.',
  'quiz.answerKey': 'Answer key',

  'cards.title': 'Flashcards',
  'cards.progress': 'Card {index}/{total}',
  'cards.flip': 'Press space/Enter to flip the card.',
  'cards.next': '← → move · Enter/Space flip · Esc finish',
  'cards.done': 'You have seen every card.',

  'progress.title': 'Learning progress',
  'progress.empty': 'No progress yet. Start a track first!',
  'progress.totalTime': 'Total study time',
  'progress.streak': 'Day streak',
  'progress.best': 'Best',
  'progress.accuracy': 'Accuracy',
  'progress.questions': 'Questions answered',
  'progress.trackRow': '{emoji} {title}',
  'progress.detail': '{done}/{total} stations · {correct}/{answered} correct',
  'progress.file': 'Data stored at {path}',
  'progress.reset': 'Delete all progress data?',
  'progress.resetDone': 'Progress data deleted.',
  'progress.day': 'days',

  'lang.title': 'Pilih bahasa / Select language',
  'lang.current': 'Active language: {lang}',
  'lang.changed': 'Language switched to {lang}.',
  'lang.id': 'Bahasa Indonesia',
  'lang.en': 'English',
  'lang.hint': 'Applied and saved immediately.',

  'about.title': 'About Railway',
  'about.body':
    'Railway is a set of learning tracks (rails) anyone can ride.\n' +
    'Each track is made of stations: read the lesson, take the quiz, review with cards.\n' +
    'Everything runs offline, with no account and no cost.',
  'about.offline': 'Offline mode',
  'about.offlineYes': 'Yes, 100% local',
  'about.data': 'Your data',
  'about.dataBody': 'Stored locally on your own machine',
  'about.license': 'MIT licence — free to use and modify',

  'cli.unknown': 'Unknown command: {command}',
  'cli.suggest': 'Did you mean: {suggestion}?',
  'cli.trackNotFound': 'Track "{id}" not found.',
  'cli.availableTracks': 'Available tracks: {list}',
  'cli.langUsage': 'Choose a language: id or en.',
  'cli.noTty': 'Interactive mode needs a terminal (TTY). Try one of the commands below.',
  'cli.resetConfirm': 'Add --ya to confirm the deletion.',
  'cli.bye': 'See you at the next station! 🚂',
};

const dictionaries: Record<Lang, Record<UiKey, string>> = { id, en };

export const UI_KEYS = Object.keys(id) as UiKey[];

/** Menerjemahkan kunci UI. Translate a UI key. */
export function t(lang: Lang, key: UiKey, params?: Record<string, string | number>): string {
  const raw = dictionaries[lang][key] ?? dictionaries.id[key] ?? String(key);
  if (!params) return raw;
  return raw.replace(/\{(\w+)\}/g, (match, name: string) => {
    const value = params[name];
    return value === undefined ? match : String(value);
  });
}

export function dictionaryOf(lang: Lang): Record<UiKey, string> {
  return dictionaries[lang];
}
