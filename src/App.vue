<template>
  <div class="app">
    <header class="app-header">
      <div class="app-header-inner">
        <div class="app-brand">
          <h1 class="app-logo">CSV<span class="app-logo-accent">Tavola</span></h1>
          <p class="app-tagline">Converti CSV in tabelle Markdown — modifica i dati prima di esportare</p>
        </div>
      </div>
    </header>

    <main class="app-main">
      <CsvUploader
        :has-data="hasData"
        :file-name="fileName"
        :row-count="rows.length"
        :col-count="headers.length"
        @csv-parsed="onCsvParsed"
      />

      <div v-if="hasData" class="app-panels">
        <DataGrid
          :headers="headers"
          :rows="rows"
          @update:header="updateHeader"
          @update:cell="updateCell"
          @add-row="addRow"
          @add-column="addColumn"
          @delete-row="deleteRow"
          @delete-column="deleteColumn"
          @clear="clearAll"
        />

        <MarkdownOutput
          :markdown="markdown"
        />
      </div>

      <div v-if="hasData" class="app-quickstart">
        <details class="quickstart-details">
          <summary class="quickstart-summary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
            Come usare la tabella Markdown generata
          </summary>
          <div class="quickstart-content">
            <p>Incolla il codice in qualsiasi file <code>.md</code> (README, documentazione, issue GitHub, wiki). Le tabelle Markdown sono supportate da GitHub, GitLab, Bitbucket, Notion, Obsidian e praticamente ogni piattaforma che renderizza Markdown.</p>
            <p><strong>Suggerimento:</strong> puoi modificare le celle e le intestazioni direttamente nella griglia qui sopra — il Markdown si aggiorna in tempo reale.</p>
          </div>
        </details>
      </div>
    </main>

    <footer class="app-footer">
      <p>CSVTavola &mdash; strumento gratuito per convertire CSV in tabelle Markdown. Nessun dato viene inviato a server esterni: tutto avviene nel tuo browser.</p>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import CsvUploader from './components/CsvUploader.vue';
import DataGrid from './components/DataGrid.vue';
import MarkdownOutput from './components/MarkdownOutput.vue';
import { generateMarkdown } from './utils/csv.js';

const headers = ref([]);
const rows = ref([]);
const fileName = ref('');
const hasData = computed(() => headers.value.length > 0);

const markdown = computed(() => {
  if (headers.value.length === 0) return '';
  return generateMarkdown(headers.value, rows.value);
});

function onCsvParsed({ headers: h, rows: r, fileName: fn }) {
  headers.value = [...h];
  rows.value = r.map((row) => [...row]);
  fileName.value = fn;
}

function updateHeader(colIndex, value) {
  headers.value[colIndex] = value;
  // Trigger reactivity
  headers.value = [...headers.value];
}

function updateCell(rowIndex, colIndex, value) {
  rows.value[rowIndex][colIndex] = value;
  // Trigger reactivity
  rows.value = rows.value.map((r) => [...r]);
}

function addRow() {
  const newRow = new Array(headers.value.length).fill('');
  rows.value = [...rows.value, newRow];
}

function addColumn() {
  const colName = 'Colonna ' + (headers.value.length + 1);
  headers.value = [...headers.value, colName];
  rows.value = rows.value.map((r) => [...r, '']);
}

function deleteRow(rowIndex) {
  if (rows.value.length <= 1) return;
  rows.value = rows.value.filter((_, i) => i !== rowIndex);
}

function deleteColumn(colIndex) {
  if (headers.value.length <= 1) return;
  headers.value = headers.value.filter((_, i) => i !== colIndex);
  rows.value = rows.value.map((r) => r.filter((_, i) => i !== colIndex));
}

function clearAll() {
  headers.value = [];
  rows.value = [];
  fileName.value = '';
}
</script>

<style scoped>
/* ---- App Layout ---- */
.app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  max-width: 1440px;
  margin: 0 auto;
  width: 100%;
}

/* ---- Header ---- */
.app-header {
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border-light);
  padding: var(--space-4) var(--space-4);
}

.app-header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.app-brand {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.app-logo {
  font-family: var(--font-display);
  font-size: var(--text-2xl);
  font-weight: 700;
  color: var(--color-text);
  line-height: 1.1;
  letter-spacing: -0.02em;
}

.app-logo-accent {
  color: var(--color-primary);
  font-weight: 500;
}

.app-tagline {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  line-height: 1.4;
}

/* ---- Main ---- */
.app-main {
  flex: 1;
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

/* ---- Panels (side-by-side) ---- */
.app-panels {
  display: flex;
  gap: var(--space-4);
  flex: 1;
  min-height: 0;
}

.app-panels > * {
  flex: 1;
  min-width: 0;
}

/* ---- Quickstart ---- */
.app-quickstart {
  margin-top: 0;
}

.quickstart-details {
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
  background: var(--color-surface);
}

.quickstart-summary {
  padding: var(--space-2) var(--space-3);
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: var(--space-2);
  user-select: none;
  list-style: none;
}

.quickstart-summary::-webkit-details-marker {
  display: none;
}

.quickstart-summary:hover {
  color: var(--color-text);
}

.quickstart-content {
  padding: var(--space-2) var(--space-3) var(--space-4);
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  line-height: 1.7;
}

.quickstart-content p {
  margin-bottom: var(--space-2);
}

.quickstart-content code {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  background: var(--color-surface-alt);
  padding: 1px 4px;
  border-radius: 3px;
}

/* ---- Footer ---- */
.app-footer {
  border-top: 1px solid var(--color-border-light);
  padding: var(--space-3) var(--space-4);
  text-align: center;
  font-size: var(--text-xs);
  color: var(--color-text-subtle);
  line-height: 1.5;
}

/* ---- Responsive ---- */
@media (max-width: 768px) {
  .app-panels {
    flex-direction: column;
  }

  .app-header {
    padding: var(--space-3);
  }

  .app-main {
    padding: var(--space-3);
    gap: var(--space-3);
  }

  .app-logo {
    font-size: var(--text-xl);
  }
}

@media (max-width: 480px) {
  .app-header {
    padding: var(--space-2);
  }

  .app-main {
    padding: var(--space-2);
    gap: var(--space-2);
  }

  .app-logo {
    font-size: var(--text-lg);
  }

  .app-tagline {
    font-size: var(--text-xs);
  }
}
</style>
