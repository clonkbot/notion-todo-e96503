import React, { useState, useEffect, useRef } from 'react'

interface Todo {
  id: string
  text: string
  completed: boolean
  createdAt: number
}

const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

const STORAGE_KEY = 'notion-todo-items'

function App() {
  const [todos, setTodos] = useState<Todo[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch {
        return []
      }
    }
    return []
  })
  const [newTodo, setNewTodo] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all')
  const inputRef = useRef<HTMLInputElement>(null)
  const editInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
  }, [todos])

  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus()
    }
  }, [editingId])

  const addTodo = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = newTodo.trim()
    if (!trimmed) return

    const todo: Todo = {
      id: generateId(),
      text: trimmed,
      completed: false,
      createdAt: Date.now(),
    }

    setTodos(prev => [todo, ...prev])
    setNewTodo('')
    inputRef.current?.focus()
  }

  const toggleTodo = (id: string) => {
    setTodos(prev =>
      prev.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    )
  }

  const deleteTodo = (id: string) => {
    setTodos(prev => prev.filter(todo => todo.id !== id))
  }

  const startEditing = (todo: Todo) => {
    setEditingId(todo.id)
    setEditText(todo.text)
  }

  const saveEdit = () => {
    if (!editingId) return
    const trimmed = editText.trim()
    if (trimmed) {
      setTodos(prev =>
        prev.map(todo =>
          todo.id === editingId ? { ...todo, text: trimmed } : todo
        )
      )
    }
    setEditingId(null)
    setEditText('')
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditText('')
  }

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveEdit()
    } else if (e.key === 'Escape') {
      cancelEdit()
    }
  }

  const clearCompleted = () => {
    setTodos(prev => prev.filter(todo => !todo.completed))
  }

  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') return !todo.completed
    if (filter === 'completed') return todo.completed
    return true
  })

  const activeCount = todos.filter(t => !t.completed).length
  const completedCount = todos.filter(t => t.completed).length

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-stone-800 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                />
              </svg>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-stone-800">
              My Tasks
            </h1>
          </div>
          <p className="text-stone-500 text-sm sm:text-base">
            {activeCount === 0
              ? 'All tasks completed! 🎉'
              : `${activeCount} task${activeCount === 1 ? '' : 's'} remaining`}
          </p>
        </header>

        {/* Add Todo Form */}
        <form onSubmit={addTodo} className="mb-6">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={newTodo}
                onChange={e => setNewTodo(e.target.value)}
                placeholder="Add a new task..."
                className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-300 focus:border-transparent transition-all text-base"
              />
            </div>
            <button
              type="submit"
              className="px-4 sm:px-6 py-3 bg-stone-800 text-white rounded-xl font-medium hover:bg-stone-700 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2 transition-all active:scale-95"
            >
              <span className="hidden sm:inline">Add Task</span>
              <svg
                className="w-5 h-5 sm:hidden"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </button>
          </div>
        </form>

        {/* Filter Tabs */}
        {todos.length > 0 && (
          <div className="flex gap-1 p-1 bg-stone-100 rounded-lg mb-4">
            {(['all', 'active', 'completed'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-all ${
                  filter === f
                    ? 'bg-white text-stone-800 shadow-sm'
                    : 'text-stone-500 hover:text-stone-700'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
                {f === 'active' && activeCount > 0 && (
                  <span className="ml-1.5 text-xs bg-stone-200 px-1.5 py-0.5 rounded-full">
                    {activeCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Todo List */}
        <div className="space-y-2">
          {filteredTodos.length === 0 && todos.length > 0 && (
            <div className="text-center py-12 text-stone-400">
              <p>No {filter} tasks</p>
            </div>
          )}

          {filteredTodos.map(todo => (
            <div
              key={todo.id}
              className={`group flex items-center gap-3 p-3 sm:p-4 bg-white border border-stone-200 rounded-xl hover:border-stone-300 transition-all ${
                todo.completed ? 'opacity-60' : ''
              }`}
            >
              {/* Checkbox */}
              <button
                onClick={() => toggleTodo(todo.id)}
                className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                  todo.completed
                    ? 'bg-stone-800 border-stone-800'
                    : 'border-stone-300 hover:border-stone-400'
                }`}
              >
                {todo.completed && (
                  <svg
                    className="w-3 h-3 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </button>

              {/* Text */}
              {editingId === todo.id ? (
                <input
                  ref={editInputRef}
                  type="text"
                  value={editText}
                  onChange={e => setEditText(e.target.value)}
                  onBlur={saveEdit}
                  onKeyDown={handleEditKeyDown}
                  className="flex-1 px-2 py-1 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-300 text-base"
                />
              ) : (
                <span
                  onClick={() => !todo.completed && startEditing(todo)}
                  className={`flex-1 cursor-pointer text-base ${
                    todo.completed
                      ? 'line-through text-stone-400'
                      : 'text-stone-700'
                  }`}
                >
                  {todo.text}
                </span>
              )}

              {/* Actions */}
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 sm:transition-opacity">
                {!todo.completed && editingId !== todo.id && (
                  <button
                    onClick={() => startEditing(todo)}
                    className="p-1.5 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg transition-all"
                    title="Edit"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </button>
                )}
                <button
                  onClick={() => deleteTodo(todo.id)}
                  className="p-1.5 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                  title="Delete"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>

              {/* Mobile action buttons - always visible */}
              <div className="flex gap-1 sm:hidden">
                <button
                  onClick={() => deleteTodo(todo.id)}
                  className="p-2 text-stone-400 hover:text-red-500 rounded-lg"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {todos.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-stone-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-stone-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-stone-700 mb-1">
              No tasks yet
            </h3>
            <p className="text-stone-500 text-sm">
              Add your first task to get started
            </p>
          </div>
        )}

        {/* Footer */}
        {completedCount > 0 && (
          <div className="mt-6 pt-4 border-t border-stone-200 flex justify-between items-center">
            <span className="text-sm text-stone-500">
              {completedCount} completed task{completedCount === 1 ? '' : 's'}
            </span>
            <button
              onClick={clearCompleted}
              className="text-sm text-stone-500 hover:text-red-500 transition-colors"
            >
              Clear completed
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default App