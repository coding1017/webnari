"use client";

import { useActionState, useState, useTransition } from "react";
import { createTerm, deleteTerm } from "@/app/admin/_actions/content";

export function GlossaryManager({ initialTerms }: { initialTerms: any[] }) {
  const [showAdd, setShowAdd] = useState(false);
  const [state, formAction, isPending] = useActionState(createTerm, { error: "" });
  const [deleting, startDelete] = useTransition();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-head text-2xl font-bold text-ww-white">Glossary</h1>
          <p className="text-sm text-ww-muted mt-0.5">{initialTerms.length} terms</p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)}
          className="px-4 py-2 bg-ww-purple hover:bg-ww-purple/80 text-white text-sm font-medium rounded-lg transition-colors">
          {showAdd ? "Cancel" : "+ Add Term"}
        </button>
      </div>

      {/* Add Form */}
      {showAdd && (
        <form action={formAction} className="bg-ww-dark border border-ww-border rounded-lg p-5 space-y-4 max-w-xl">
          {state.error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">{state.error}</div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ww-text mb-1">Term</label>
              <input name="term" required className="w-full px-3 py-2 bg-ww-surface border border-ww-border rounded-lg text-ww-white text-sm focus:outline-none focus:border-ww-purple" />
            </div>
            <div>
              <label className="block text-sm font-medium text-ww-text mb-1">Slug</label>
              <input name="slug" required className="w-full px-3 py-2 bg-ww-surface border border-ww-border rounded-lg text-ww-white text-sm focus:outline-none focus:border-ww-purple" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-ww-text mb-1">Definition</label>
            <textarea name="definition" rows={3} required className="w-full px-3 py-2 bg-ww-surface border border-ww-border rounded-lg text-ww-white text-sm focus:outline-none focus:border-ww-purple resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-ww-text mb-1">Category</label>
            <select name="category" className="w-full px-3 py-2 bg-ww-surface border border-ww-border rounded-lg text-ww-white text-sm focus:outline-none focus:border-ww-purple">
              <option value="techniques">Techniques</option>
              <option value="materials">Materials</option>
              <option value="tools">Tools</option>
              <option value="construction">Construction</option>
            </select>
          </div>
          <button type="submit" disabled={isPending}
            className="px-4 py-2 bg-ww-purple hover:bg-ww-purple/80 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors">
            {isPending ? "Adding..." : "Add Term"}
          </button>
        </form>
      )}

      {/* Terms Table */}
      <div className="bg-ww-dark border border-ww-border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-ww-border">
              <th className="text-left text-xs font-medium text-ww-muted uppercase px-4 py-3">Term</th>
              <th className="text-left text-xs font-medium text-ww-muted uppercase px-4 py-3">Category</th>
              <th className="text-left text-xs font-medium text-ww-muted uppercase px-4 py-3">Definition</th>
              <th className="text-right text-xs font-medium text-ww-muted uppercase px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {initialTerms.map((term) => (
              <tr key={term.id} className="border-b border-ww-border/50 last:border-0 hover:bg-ww-surface/30">
                <td className="px-4 py-3 text-sm font-medium text-ww-white">{term.term}</td>
                <td className="px-4 py-3 text-sm text-ww-text capitalize">{term.category}</td>
                <td className="px-4 py-3 text-sm text-ww-muted max-w-xs truncate">{term.definition}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    disabled={deleting}
                    onClick={() => startDelete(() => deleteTerm(term.id))}
                    className="text-xs text-red-400 hover:text-red-300 font-medium disabled:opacity-50"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
