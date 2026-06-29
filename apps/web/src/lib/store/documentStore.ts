'use client'

/**
 * documentStore.ts — Zustand global store for the Canvas Editor
 *
 * Holds the in-memory DocumentAST that the canvas editor operates on.
 * This is the single source of truth on the client side during an editing session.
 * Every canvas action mutates this store, and the store syncs mutations back to the
 * API via the onSave callbacks registered by the editor.
 *
 * Source: .agent/DOCUMENT_MEMORY.md, .agent/CANVAS_EDITOR.md
 */

import { create } from 'zustand'
import { subscribeWithSelector, devtools } from 'zustand/middleware'
import type {
  DocumentAST,
  PageNode,
  ThemeId,
  ContentElement,
} from '@repo/document-model'

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type EditorStatus =
  | 'idle'
  | 'loading'
  | 'ready'
  | 'saving'
  | 'regenerating'
  | 'exporting'
  | 'error'

interface DocumentStoreState {
  // Core document
  document: DocumentAST | null
  documentId: string | null

  // Editor state
  selectedPageId: string | null
  status: EditorStatus
  error: string | null
  qualityScore: number | null
  isDirty: boolean

  // Actions
  loadDocument: (doc: DocumentAST) => void
  setSelectedPage: (pageId: string) => void
  setTheme: (themeId: ThemeId) => void
  movePage: (fromIndex: number, toIndex: number) => void
  duplicatePage: (pageId: string) => void
  deletePage: (pageId: string) => void
  updatePageElement: (
    pageId: string,
    elementId: string,
    patch: Partial<ContentElement['content']>,
  ) => void
  setStatus: (status: EditorStatus, error?: string) => void
  setQualityScore: (score: number) => void
  markClean: () => void
  reset: () => void
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function reorderPages(pages: PageNode[]): PageNode[] {
  return pages.map((p, i) => ({ ...p, pageNumber: i + 1 }))
}

// ─────────────────────────────────────────────────────────────────────────────
// STORE
// ─────────────────────────────────────────────────────────────────────────────

export const useDocumentStore = create<DocumentStoreState>()(
  devtools(
    subscribeWithSelector((set) => ({
      document: null,
      documentId: null,
      selectedPageId: null,
      status: 'idle',
      error: null,
      qualityScore: null,
      isDirty: false,

      loadDocument: (doc) =>
        set({
          document: doc,
          documentId: doc.id,
          selectedPageId: doc.pages[0]?.id ?? null,
          status: 'ready',
          error: null,
          isDirty: false,
        }),

      setSelectedPage: (pageId) => set({ selectedPageId: pageId }),

      setTheme: (themeId) =>
        set((state) => {
          if (!state.document) return state
          return {
            document: {
              ...state.document,
              theme: { ...state.document.theme, id: themeId },
            },
            isDirty: true,
          }
        }),

      movePage: (fromIndex, toIndex) =>
        set((state) => {
          if (!state.document) return state
          const pages = [...state.document.pages]
          const [moved] = pages.splice(fromIndex, 1)
          if (!moved) return state
          pages.splice(toIndex, 0, moved)
          return {
            document: { ...state.document, pages: reorderPages(pages) },
            isDirty: true,
          }
        }),

      duplicatePage: (pageId) =>
        set((state) => {
          if (!state.document) return state
          const idx = state.document.pages.findIndex((p) => p.id === pageId)
          if (idx === -1) return state
          const original = state.document.pages[idx]!
          const clone: PageNode = {
            ...original,
            id: crypto.randomUUID(),
            pageNumber: original.pageNumber + 1,
          }
          const pages = [
            ...state.document.pages.slice(0, idx + 1),
            clone,
            ...state.document.pages.slice(idx + 1),
          ]
          return {
            document: { ...state.document, pages: reorderPages(pages) },
            selectedPageId: clone.id,
            isDirty: true,
          }
        }),

      deletePage: (pageId) =>
        set((state) => {
          if (!state.document || state.document.pages.length <= 1) return state
          const idx = state.document.pages.findIndex((p) => p.id === pageId)
          const pages = state.document.pages.filter((p) => p.id !== pageId)
          const nextSelected = pages[Math.max(0, idx - 1)]?.id ?? null
          return {
            document: { ...state.document, pages: reorderPages(pages) },
            selectedPageId: nextSelected,
            isDirty: true,
          }
        }),

      updatePageElement: (pageId, elementId, patch) =>
        set((state) => {
          if (!state.document) return state
          const pages = state.document.pages.map((page) => {
            if (page.id !== pageId) return page
            const elements = page.elements.map((el) => {
              if (el.id !== elementId) return el
              return { ...el, content: { ...el.content, ...patch } }
            })
            return { ...page, elements } as PageNode
          })
          return {
            document: { ...state.document, pages },
            isDirty: true,
          }
        }),

      setStatus: (status, error) => set({ status, error: error ?? null }),

      setQualityScore: (score) => set({ qualityScore: score }),

      markClean: () => set({ isDirty: false }),

      reset: () =>
        set({
          document: null,
          documentId: null,
          selectedPageId: null,
          status: 'idle',
          error: null,
          qualityScore: null,
          isDirty: false,
        }),
    })),
    { name: 'DocumentStore' },
  ),
)
