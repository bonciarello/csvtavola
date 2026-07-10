<template>
  <div class="uploader" :class="{ 'is-dragover': isDragover }">
    <div
      class="uploader-zone"
      @dragover.prevent="onDragOver"
      @dragleave.prevent="onDragLeave"
      @drop.prevent="onDrop"
      @click="triggerInput"
      role="button"
      tabindex="0"
      :aria-label="hasData ? 'Carica un altro file CSV' : 'Carica un file CSV. Formati supportati: CSV con virgola, punto e virgola o tab.'"
      @keydown.enter.prevent="triggerInput"
      @keydown.space.prevent="triggerInput"
    >
      <div class="uploader-icon" aria-hidden="true">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M8 36h24a4 4 0 004-4V16L24 4H12a4 4 0 00-4 4v24a4 4 0 004 4z" />
          <path d="M24 4v12h12" />
          <line x1="16" y1="22" x2="24" y2="22" />
          <line x1="20" y1="18" x2="20" y2="26" />
        </svg>
      </div>
      <p class="uploader-title" v-if="!hasData">
        Trascina qui il tuo CSV
      </p>
      <p class="uploader-title" v-else>
        CSV caricato — trascina un altro file per sostituirlo
      </p>
      <p class="uploader-hint">
        oppure <span class="uploader-link">sfoglia i file</span> — CSV, TSV, o delimitato da punto e virgola
      </p>
      <input
        ref="fileInput"
        type="file"
        accept=".csv,.tsv,.txt,text/csv,text/tab-separated-values"
        class="sr-only"
        id="csv-file-input"
        @change="onFileChange"
      />
    </div>
    <p v-if="error" class="uploader-error" role="alert">{{ error }}</p>
    <p v-if="fileName && !error" class="uploader-filename" aria-live="polite">
      <span class="uploader-filename-icon" aria-hidden="true">📄</span>
      {{ fileName }}
      <span class="uploader-filename-meta">{{ rowCount }} righe &middot; {{ colCount }} colonne</span>
    </p>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { parseCSV, detectDelimiter } from '../utils/csv.js';

const emit = defineEmits(['csv-parsed']);

const props = defineProps({
  hasData: { type: Boolean, default: false },
  fileName: { type: String, default: '' },
  rowCount: { type: Number, default: 0 },
  colCount: { type: Number, default: 0 }
});

const fileInput = ref(null);
const isDragover = ref(false);
const error = ref('');

function triggerInput() {
  fileInput.value?.click();
}

function onDragOver(e) {
  isDragover.value = true;
  e.dataTransfer.dropEffect = 'copy';
}

function onDragLeave() {
  isDragover.value = false;
}

function onDrop(e) {
  isDragover.value = false;
  const file = e.dataTransfer?.files?.[0];
  if (file) processFile(file);
}

function onFileChange(e) {
  const file = e.target?.files?.[0];
  if (file) processFile(file);
  // Reset input so the same file can be re-selected
  if (fileInput.value) fileInput.value.value = '';
}

function processFile(file) {
  error.value = '';

  if (!file.name.match(/\.(csv|tsv|txt)$/i) && file.type !== 'text/csv' && file.type !== 'text/tab-separated-values' && file.type !== 'text/plain') {
    // Still allow it — might be a CSV without extension
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const text = e.target.result;
      if (!text || text.trim().length === 0) {
        error.value = 'Il file è vuoto. Carica un CSV con almeno una riga di intestazione e una di dati.';
        return;
      }
      const { headers, rows } = parseCSV(text);
      if (headers.length === 0) {
        error.value = 'Nessuna intestazione trovata. Il file deve contenere almeno una riga con i nomi delle colonne.';
        return;
      }
      emit('csv-parsed', { headers, rows, fileName: file.name });
    } catch (err) {
      error.value = 'Errore nella lettura del file: ' + err.message;
    }
  };
  reader.onerror = () => {
    error.value = 'Impossibile leggere il file. Verifica che non sia corrotto e riprova.';
  };
  reader.readAsText(file, 'UTF-8');
}
</script>

<style scoped>
.uploader {
  margin-bottom: var(--space-4);
}

.uploader-zone {
  border: 2px dashed var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-6) var(--space-4);
  text-align: center;
  cursor: pointer;
  transition: border-color var(--transition-fast), background var(--transition-fast);
  background: var(--color-surface);
  position: relative;
}

.uploader-zone:hover,
.uploader-zone:focus-visible {
  border-color: var(--color-primary);
  background: var(--color-primary-pale);
}

.is-dragover .uploader-zone {
  border-color: var(--color-primary);
  background: var(--color-primary-pale);
  border-style: solid;
}

.uploader-icon {
  color: var(--color-text-muted);
  margin: 0 auto var(--space-3);
  transition: color var(--transition-fast);
}

.uploader-zone:hover .uploader-icon,
.is-dragover .uploader-icon {
  color: var(--color-primary);
}

.uploader-title {
  font-family: var(--font-display);
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: var(--space-1);
}

.uploader-hint {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  line-height: 1.5;
}

.uploader-link {
  color: var(--color-primary);
  font-weight: 500;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.uploader-error {
  margin-top: var(--space-2);
  padding: var(--space-2) var(--space-3);
  background: var(--color-accent-pale);
  color: var(--color-accent);
  border-radius: var(--radius-sm);
  font-size: var(--text-sm);
  font-weight: 500;
}

.uploader-filename {
  margin-top: var(--space-2);
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  display: flex;
  align-items: center;
  gap: var(--space-1);
}

.uploader-filename-icon {
  font-size: var(--text-base);
}

.uploader-filename-meta {
  margin-left: var(--space-2);
  color: var(--color-text-subtle);
}

@media (max-width: 640px) {
  .uploader-zone {
    padding: var(--space-4) var(--space-3);
  }

  .uploader-title {
    font-size: var(--text-base);
  }
}
</style>
