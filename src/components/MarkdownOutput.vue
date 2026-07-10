<template>
  <div class="md-output">
    <div class="md-toolbar">
      <div class="md-toolbar-left">
        <h2 class="md-title">Markdown</h2>
        <span class="md-meta" v-if="markdown">
          {{ lineCount }} righe &middot; {{ charCount }} caratteri
        </span>
      </div>
      <div class="md-toolbar-actions">
        <button
          class="btn btn-primary btn-sm"
          @click="copyToClipboard"
          :disabled="!markdown"
          :title="copied ? 'Copiato!' : 'Copia il codice Markdown negli appunti'"
        >
          <svg v-if="!copied" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
          <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
          {{ copied ? 'Copiato' : 'Copia' }}
        </button>
        <button
          class="btn btn-accent btn-sm"
          @click="downloadMd"
          :disabled="!markdown"
          title="Scarica il file README.md"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Scarica .md
        </button>
      </div>
    </div>

    <div class="md-preview-container" v-if="markdown">
      <pre class="md-code" tabindex="0" aria-label="Codice Markdown generato"><code>{{ markdown }}</code></pre>
    </div>

    <div v-else class="md-empty">
      <p>Carica un CSV per generare la tabella Markdown.</p>
      <p class="md-empty-hint">Il codice apparirà qui in tempo reale mentre modifichi i dati.</p>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';

const props = defineProps({
  markdown: { type: String, default: '' }
});

const copied = ref(false);

const lineCount = computed(() => props.markdown ? props.markdown.split('\n').length : 0);
const charCount = computed(() => props.markdown.length);

let copyTimer = null;

async function copyToClipboard() {
  if (!props.markdown) return;
  try {
    await navigator.clipboard.writeText(props.markdown);
    copied.value = true;
    clearTimeout(copyTimer);
    copyTimer = setTimeout(() => { copied.value = false; }, 2000);
  } catch {
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = props.markdown;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      copied.value = true;
      clearTimeout(copyTimer);
      copyTimer = setTimeout(() => { copied.value = false; }, 2000);
    } catch {
      // Copy failed silently
    }
    document.body.removeChild(textarea);
  }
}

function downloadMd() {
  if (!props.markdown) return;
  const blob = new Blob([props.markdown], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'tabella.md';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
</script>

<style scoped>
.md-output {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.md-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border-bottom: 1px solid var(--color-border-light);
  background: var(--color-surface-alt);
  flex-wrap: wrap;
}

.md-toolbar-left {
  display: flex;
  align-items: baseline;
  gap: var(--space-2);
}

.md-title {
  font-family: var(--font-display);
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-text);
}

.md-meta {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  font-family: var(--font-mono);
}

.md-toolbar-actions {
  display: flex;
  gap: var(--space-1);
}

.md-preview-container {
  overflow: auto;
  max-height: 55vh;
  background: var(--color-surface-grid);
}

.md-code {
  padding: var(--space-4);
  margin: 0;
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  line-height: 1.7;
  color: var(--color-text);
  white-space: pre;
  overflow-x: auto;
  tab-size: 2;
  outline: none;
  min-height: 120px;
}

.md-code:focus-visible {
  box-shadow: inset 0 0 0 2px var(--color-primary-ring);
}

.md-empty {
  padding: var(--space-8);
  text-align: center;
  color: var(--color-text-muted);
  font-size: var(--text-sm);
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.md-empty-hint {
  font-size: var(--text-xs);
  color: var(--color-text-subtle);
  margin-top: var(--space-1);
}

@media (max-width: 640px) {
  .md-preview-container {
    max-height: 35vh;
  }

  .md-code {
    font-size: var(--text-xs);
    padding: var(--space-2);
  }
}
</style>
