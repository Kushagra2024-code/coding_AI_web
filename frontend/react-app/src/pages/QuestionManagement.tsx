import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createCodingQuestion } from '../api/coding'
import Layout from '../components/common/Layout'
import type { Difficulty, TestCase } from '../types/api'

export default function QuestionManagement() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    title: '',
    difficulty: 'medium' as Difficulty,
    tags: '',
    description: '',
    constraints: '',
    sampleInput: '',
    sampleOutput: '',
  })

  const [visibleTests, setVisibleTests] = useState<TestCase[]>([{ input: '', output: '' }])
  const [hiddenTests, setHiddenTests] = useState<TestCase[]>([{ input: '', output: '' }])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleTestChange = (
    type: 'visible' | 'hidden',
    index: number,
    field: keyof TestCase,
    value: string
  ) => {
    const setter = type === 'visible' ? setVisibleTests : setHiddenTests
    setter((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], [field]: value }
      return next
    })
  }

  const addTest = (type: 'visible' | 'hidden') => {
    const setter = type === 'visible' ? setVisibleTests : setHiddenTests
    setter((prev) => [...prev, { input: '', output: '' }])
  }

  const removeTest = (type: 'visible' | 'hidden', index: number) => {
    const setter = type === 'visible' ? setVisibleTests : setHiddenTests
    setter((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const payload = {
        ...formData,
        tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean),
        constraints: formData.constraints.split('\n').map((c) => c.trim()).filter(Boolean),
        visibleTests,
        hiddenTests,
      }

      await createCodingQuestion(payload)
      setSuccess('Question added successfully!')
      // Reset form or navigate
      setTimeout(() => navigate('/coding'), 2000)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add question')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div className="mx-auto max-w-4xl space-y-8 pb-12">
        <header>
          <h1 className="text-3xl font-bold text-white">Question Management</h1>
          <p className="text-slate-400">Add new coding challenges to the platform.</p>
        </header>

        {error && (
          <div className="rounded-lg border border-rose-500/50 bg-rose-500/10 p-4 text-rose-200">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-lg border border-emerald-500/50 bg-emerald-500/10 p-4 text-emerald-200">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 space-y-4">
            <h2 className="text-lg font-semibold text-slate-200">Basic Info</h2>
            
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Title</label>
                <input
                  required
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2.5 text-slate-200"
                  placeholder="e.g. Reverse Linked List"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Difficulty</label>
                <select
                  name="difficulty"
                  value={formData.difficulty}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2.5 text-slate-200"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Tags (comma separated)</label>
              <input
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2.5 text-slate-200"
                placeholder="e.g. linked-list, recursion, pointers"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Description</label>
              <textarea
                required
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2.5 text-slate-200"
                placeholder="Problem explanation..."
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Constraints (one per line)</label>
              <textarea
                name="constraints"
                rows={3}
                value={formData.constraints}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2.5 text-slate-200"
                placeholder="1 <= n <= 10^5..."
              />
            </div>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 space-y-4">
            <h2 className="text-lg font-semibold text-slate-200">Sample I/O</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Sample Input</label>
                <textarea
                  required
                  name="sampleInput"
                  value={formData.sampleInput}
                  onChange={handleInputChange}
                  className="w-full font-mono text-xs rounded-lg border border-slate-700 bg-slate-950 p-2.5 text-slate-200"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Sample Output</label>
                <textarea
                  required
                  name="sampleOutput"
                  value={formData.sampleOutput}
                  onChange={handleInputChange}
                  className="w-full font-mono text-xs rounded-lg border border-slate-700 bg-slate-950 p-2.5 text-slate-200"
                />
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-200">Visible Test Cases</h2>
              <button
                type="button"
                onClick={() => addTest('visible')}
                className="text-xs font-bold text-emerald-400 hover:text-emerald-300"
              >
                + Add Test
              </button>
            </div>
            <div className="space-y-3">
              {visibleTests.map((test, i) => (
                <div key={i} className="flex gap-4 rounded-xl border border-slate-800 bg-slate-900/30 p-4">
                  <div className="flex-1 space-y-2">
                    <input
                      placeholder="Input"
                      value={test.input}
                      onChange={(e) => handleTestChange('visible', i, 'input', e.target.value)}
                      className="w-full font-mono text-xs rounded border border-slate-700 bg-slate-950 p-2 text-slate-300"
                    />
                    <input
                      placeholder="Output"
                      value={test.output}
                      onChange={(e) => handleTestChange('visible', i, 'output', e.target.value)}
                      className="w-full font-mono text-xs rounded border border-slate-700 bg-slate-950 p-2 text-slate-300"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeTest('visible', i)}
                    className="text-slate-500 hover:text-rose-400"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-200">Hidden Test Cases</h2>
              <button
                type="button"
                onClick={() => addTest('hidden')}
                className="text-xs font-bold text-slate-400 hover:text-white"
              >
                + Add Test
              </button>
            </div>
            <div className="space-y-3">
              {hiddenTests.map((test, i) => (
                <div key={i} className="flex gap-4 rounded-xl border border-slate-800 bg-slate-900/30 p-4">
                  <div className="flex-1 space-y-2">
                    <input
                      placeholder="Input"
                      value={test.input}
                      onChange={(e) => handleTestChange('hidden', i, 'input', e.target.value)}
                      className="w-full font-mono text-xs rounded border border-slate-700 bg-slate-950 p-2 text-slate-300"
                    />
                    <input
                      placeholder="Output"
                      value={test.output}
                      onChange={(e) => handleTestChange('hidden', i, 'output', e.target.value)}
                      className="w-full font-mono text-xs rounded border border-slate-700 bg-slate-950 p-2 text-slate-300"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeTest('hidden', i)}
                    className="text-slate-500 hover:text-rose-400"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </section>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-emerald-600 py-4 font-bold text-white transition-colors hover:bg-emerald-500 disabled:opacity-50"
          >
            {loading ? 'Adding Question...' : 'Add Question to Platform'}
          </button>
        </form>
      </div>
    </Layout>
  )
}
