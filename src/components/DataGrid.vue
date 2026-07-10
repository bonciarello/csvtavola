<template>
  <div class="grid-wrapper">
    <div class="grid-toolbar">
      <div class="grid-toolbar-left">
        <h2 class="grid-title">Griglia dati</h2>
        <span class="grid-meta" v-if="headers.length">
          {{ rows.length }} righe &middot; {{ headers.length }} colonne
        </span>
      </div>
      <div class="grid-toolbar-actions">
        <button class="btn btn-outline btn-sm" @click="$emit('add-row')" title="Aggiungi una riga in fondo alla tabella">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Riga
        </button>
        <button class="btn btn-outline btn-sm" @click="$emit('add-column')" title="Aggiungi una colonna a destra">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Colonna
        </button>
        <button class="btn btn-ghost btn-danger btn-sm" @click="$emit('clear')" title="Rimuovi tutti i dati e ricomincia">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
          Svuota
        </button>
      </div>
    </div>

    <div class="grid-scroll" v-if="headers.length > 0">
      <table class="grid-table" role="grid" :aria-label="'Tabella dati con ' + headers.length + ' colonne e ' + rows.length + ' righe'">
        <thead>
          <tr>
            <th class="grid-th grid-th--index" scope="col" aria-label="Numero riga">#</th>
            <th
              v-for="(header, ci) in headers"
              :key="'h-' + ci"
              class="grid-th"
              scope="col"
            >
              <div class="grid-th-inner">
                <input
                  class="grid-input grid-input--header"
                  :value="header"
                  @input="e => $emit('update:header', ci, e.target.value)"
                  :aria-label="'Intestazione colonna ' + (ci + 1)"
                  type="text"
                />
                <button
                  class="grid-col-delete"
                  @click="$emit('delete-column', ci)"
                  :aria-label="'Elimina colonna ' + (ci + 1)"
                  title="Elimina questa colonna"
                  v-if="headers.length > 1"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, ri) in rows" :key="'r-' + ri">
            <td class="grid-td grid-td--index" :aria-label="'Riga ' + (ri + 1)">
              {{ ri + 1 }}
              <button
                class="grid-row-delete"
                @click="$emit('delete-row', ri)"
                :aria-label="'Elimina riga ' + (ri + 1)"
                title="Elimina questa riga"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </td>
            <td
              v-for="(cell, ci) in row"
              :key="'c-' + ri + '-' + ci"
              class="grid-td"
              :class="{ 'grid-td--empty': !cell }"
            >
              <input
                class="grid-input"
                :value="cell"
                @input="e => $emit('update:cell', ri, ci, e.target.value)"
                :aria-label="'Cella riga ' + (ri + 1) + ', colonna ' + (ci + 1)"
                type="text"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else class="grid-empty">
      <p>Nessun dato da mostrare. Carica un file CSV per iniziare.</p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  headers: { type: Array, required: true },
  rows: { type: Array, required: true }
});

defineEmits([
  'update:header',
  'update:cell',
  'add-row',
  'add-column',
  'delete-row',
  'delete-column',
  'clear'
]);
</script>

<style scoped>
.grid-wrapper {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.grid-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border-bottom: 1px solid var(--color-border-light);
  background: var(--color-surface-alt);
  flex-wrap: wrap;
}

.grid-toolbar-left {
  display: flex;
  align-items: baseline;
  gap: var(--space-2);
}

.grid-title {
  font-family: var(--font-display);
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-text);
}

.grid-meta {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  font-family: var(--font-mono);
}

.grid-toolbar-actions {
  display: flex;
  gap: var(--space-1);
}

.btn-sm {
  padding: var(--space-1) var(--space-2);
  min-height: 32px;
  font-size: var(--text-xs);
}

.grid-scroll {
  overflow: auto;
  max-height: 55vh;
  background:
    /* Graph paper texture */
    linear-gradient(rgba(37, 99, 235, 0.015) 1px, transparent 1px),
    linear-gradient(90deg, rgba(37, 99, 235, 0.015) 1px, transparent 1px);
  background-size: 20px 20px;
  background-position: -1px -1px;
}

.grid-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  line-height: 1.4;
  white-space: nowrap;
}

.grid-th {
  position: sticky;
  top: 0;
  z-index: 2;
  background: var(--color-surface-alt);
  border-bottom: 2px solid var(--color-border);
  padding: 0;
  min-width: 120px;
}

.grid-th--index {
  min-width: 52px;
  max-width: 52px;
  width: 52px;
  text-align: center;
  font-size: var(--text-xs);
  color: var(--color-text-subtle);
  font-family: var(--font-body);
  font-weight: 500;
  border-right: 1px solid var(--color-border-light);
  padding: var(--space-1) var(--space-2);
}

.grid-th-inner {
  display: flex;
  align-items: center;
  gap: 0;
}

.grid-col-delete {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  min-width: 28px;
  height: 38px;
  border: none;
  background: transparent;
  color: var(--color-text-subtle);
  cursor: pointer;
  opacity: 0;
  transition: opacity var(--transition-fast), color var(--transition-fast);
  border-radius: var(--radius-sm);
}

.grid-th:hover .grid-col-delete,
.grid-col-delete:focus-visible {
  opacity: 1;
}

.grid-col-delete:hover {
  color: var(--color-accent);
  background: var(--color-accent-pale);
}

.grid-td {
  padding: 0;
  border-bottom: 1px solid var(--color-border-light);
  border-right: 1px solid var(--color-border-light);
  position: relative;
}

.grid-td:last-child {
  border-right: none;
}

.grid-td--index {
  min-width: 52px;
  max-width: 52px;
  width: 52px;
  text-align: center;
  font-size: var(--text-xs);
  color: var(--color-text-subtle);
  font-family: var(--font-body);
  font-weight: 400;
  border-right: 1px solid var(--color-border-light);
  padding: var(--space-1);
  position: relative;
}

.grid-td--index:hover .grid-row-delete,
.grid-row-delete:focus-visible {
  opacity: 1;
}

.grid-row-delete {
  position: absolute;
  right: 2px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: none;
  background: var(--color-surface);
  color: var(--color-text-subtle);
  cursor: pointer;
  opacity: 0;
  transition: opacity var(--transition-fast), color var(--transition-fast);
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-sm);
}

.grid-row-delete:hover {
  color: var(--color-accent);
  background: var(--color-accent-pale);
}

.grid-input {
  width: 100%;
  min-width: 120px;
  border: 2px solid transparent;
  border-radius: var(--radius-sm);
  background: transparent;
  padding: var(--space-1) var(--space-2);
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  color: var(--color-text);
  line-height: 2;
  transition: border-color var(--transition-fast), background var(--transition-fast), box-shadow var(--transition-fast);
  outline: none;
}

.grid-input:hover {
  background: var(--color-primary-pale);
  border-color: var(--color-border);
}

.grid-input:focus {
  background: #fff;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px var(--color-primary-ring);
  z-index: 1;
  position: relative;
}

.grid-input--header {
  font-weight: 600;
  color: var(--color-primary);
  letter-spacing: 0.01em;
}

.grid-input--header:hover {
  background: rgba(37, 99, 235, 0.04);
}

.grid-input--header:focus {
  color: var(--color-text);
}

/* Alternating row colors */
.grid-table tbody tr:nth-child(even) .grid-td {
  background: var(--color-surface-grid);
}

.grid-table tbody tr:nth-child(even) .grid-td--index {
  background: var(--color-surface-alt);
}

.grid-empty {
  padding: var(--space-8);
  text-align: center;
  color: var(--color-text-muted);
  font-size: var(--text-sm);
}

@media (max-width: 640px) {
  .grid-scroll {
    max-height: 40vh;
  }

  .grid-toolbar {
    padding: var(--space-2);
  }

  .grid-table {
    font-size: var(--text-xs);
  }

  .grid-input {
    font-size: var(--text-xs);
    min-width: 100px;
    padding: var(--space-1);
  }

  .grid-th {
    min-width: 100px;
  }
}
</style>
