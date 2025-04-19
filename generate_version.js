import { execSync } from 'child_process';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { dirname } from 'path';

// Funkcja do pobrania ostatniego komentarza commita
function getLatestCommitMessage() {
  try {
    // Pobierz nazwę aktualnej gałęzi
    const branch = execSync('git rev-parse --abbrev-ref HEAD')
      .toString()
      .trim();

    // Pobierz hash commita
    const commitHash = execSync('git rev-parse --short HEAD').toString().trim();

    // Pobierz komentarz z ostatniego commita
    const commitMessage = execSync('git log -1 --pretty=%B').toString().trim();

    // Pobierz tag jeśli istnieje
    let tag = '';
    try {
      tag = execSync('git describe --tags --abbrev=0').toString().trim();
    } catch (e) {
      // Brak taga - ignorujemy błąd
    }

    // Sprawdź czy są niezcommitowane zmiany
    const hasChanges =
      execSync('git status --porcelain').toString().trim() !== '';

    // Konstruujemy nazwę wersji
    let version = 'dev';
    if (tag) {
      version = tag;
    }
    version += `-${commitHash}`;
    if (hasChanges) {
      version += ' wip';
    }

    return {
      version: version,
      message: commitMessage,
    };
  } catch (error) {
    console.error(
      'Błąd podczas pobierania informacji o commicie:',
      error.message
    );
    return {
      version: 'dev-unknown',
      message: 'Unknown commit',
    };
  }
}

// Funkcja do generowania pliku version.json
function generateVersionFile() {
  try {
    const commitInfo = getLatestCommitMessage();
    const timestamp = new Date().toISOString();
    const buildDate = new Date().toLocaleString('pl-PL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const versionData = {
      commit: `${commitInfo.version} - ${commitInfo.message}`,
      timestamp: timestamp,
      buildDate: buildDate,
    };

    // Zapisz dane do pliku version.json
    writeFileSync(
      'version.json',
      JSON.stringify(versionData, null, 2),
      'utf-8'
    );

    console.log('✅ Plik version.json został wygenerowany pomyślnie.');
    console.log(`📝 Commit: ${commitInfo.version}`);
    console.log(`🕒 Build Date: ${buildDate}`);
  } catch (error) {
    console.error(
      '❌ Błąd podczas generowania pliku version.json:',
      error.message
    );
  }
}

// Uruchom generowanie pliku
generateVersionFile();
