import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DynamicPropertiesPanel, containsWikilinks } from './DynamicPropertiesPanel'
import type { VaultEntry } from '../types'

const makeEntry = (overrides: Partial<VaultEntry> = {}): VaultEntry => ({
  path: '/vault/note/test.md',
  filename: 'test.md',
  title: 'Test Note',
  isA: 'Note',
  aliases: [],
  belongsTo: [],
  relatedTo: [],
  status: 'Active',
  owner: null,
  cadence: null,
  archived: false,
  trashed: false,
  trashedAt: null,
  modifiedAt: 1700000000,
  createdAt: 1700000000,
  fileSize: 100,
  snippet: '',
  relationships: {},
  icon: null,
  color: null,
  order: null,
  ...overrides,
})

describe('containsWikilinks', () => {
  it('returns true for string wikilinks', () => {
    expect(containsWikilinks('[[My Note]]')).toBe(true)
  })

  it('returns false for non-wikilink strings', () => {
    expect(containsWikilinks('plain text')).toBe(false)
  })

  it('returns true for arrays containing wikilinks', () => {
    expect(containsWikilinks(['[[Note1]]', '[[Note2]]'])).toBe(true)
  })

  it('returns false for arrays without wikilinks', () => {
    expect(containsWikilinks(['tag1', 'tag2'])).toBe(false)
  })

  it('returns false for booleans', () => {
    expect(containsWikilinks(true)).toBe(false)
  })

  it('returns false for null', () => {
    expect(containsWikilinks(null)).toBe(false)
  })
})

describe('DynamicPropertiesPanel', () => {
  const onUpdateProperty = vi.fn()
  const onDeleteProperty = vi.fn()
  const onAddProperty = vi.fn()
  const onNavigate = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders type row', () => {
    render(
      <DynamicPropertiesPanel
        entry={makeEntry()}
        content="# Test\n\nSome words here"
        frontmatter={{ Status: 'Active' }}
        onUpdateProperty={onUpdateProperty}
      />
    )
    expect(screen.getByText('Type')).toBeInTheDocument()
    expect(screen.getByText('Note')).toBeInTheDocument()
  })

  it('renders word count', () => {
    render(
      <DynamicPropertiesPanel
        entry={makeEntry()}
        content="---\ntitle: Test\n---\nOne two three four"
        frontmatter={{}}
      />
    )
    expect(screen.getByText('Words')).toBeInTheDocument()
  })

  it('renders status as colored pill', () => {
    render(
      <DynamicPropertiesPanel
        entry={makeEntry()}
        content=""
        frontmatter={{ Status: 'Active' }}
      />
    )
    // Status rendered with CSS text-transform: uppercase, DOM text is still "Active"
    expect(screen.getByTitle('Active')).toBeInTheDocument()
  })

  it('renders properties from frontmatter', () => {
    render(
      <DynamicPropertiesPanel
        entry={makeEntry()}
        content=""
        frontmatter={{ cadence: 'Weekly', owner: 'Luca' }}
      />
    )
    expect(screen.getByText('cadence')).toBeInTheDocument()
    expect(screen.getByText('Weekly')).toBeInTheDocument()
    expect(screen.getByText('owner')).toBeInTheDocument()
    expect(screen.getByText('Luca')).toBeInTheDocument()
  })

  it('skips aliases and relationship keys', () => {
    render(
      <DynamicPropertiesPanel
        entry={makeEntry()}
        content=""
        frontmatter={{ aliases: ['AL'], 'Belongs to': '[[Something]]', cadence: 'Monthly' }}
      />
    )
    // aliases and "Belongs to" should be skipped
    expect(screen.queryByText('aliases')).not.toBeInTheDocument()
    expect(screen.queryByText('Belongs to')).not.toBeInTheDocument()
    expect(screen.getByText('cadence')).toBeInTheDocument()
  })

  it('renders boolean property as toggle', () => {
    render(
      <DynamicPropertiesPanel
        entry={makeEntry()}
        content=""
        frontmatter={{ archived: false }}
        onUpdateProperty={onUpdateProperty}
      />
    )
    // Boolean should show as Yes/No toggle
    const toggleBtn = screen.getByText('\u2717 No')
    fireEvent.click(toggleBtn)
    expect(onUpdateProperty).toHaveBeenCalledWith('archived', true)
  })

  it('renders array property as tag pills', () => {
    render(
      <DynamicPropertiesPanel
        entry={makeEntry()}
        content=""
        frontmatter={{ tags: ['ai', 'ml', 'deep-learning'] }}
        onUpdateProperty={onUpdateProperty}
      />
    )
    expect(screen.getByText('ai')).toBeInTheDocument()
    expect(screen.getByText('ml')).toBeInTheDocument()
    expect(screen.getByText('deep-learning')).toBeInTheDocument()
  })

  it('shows Add property button', () => {
    render(
      <DynamicPropertiesPanel
        entry={makeEntry()}
        content=""
        frontmatter={{}}
        onAddProperty={onAddProperty}
      />
    )
    expect(screen.getByText('+ Add property')).toBeInTheDocument()
  })

  it('opens add property form when button clicked', () => {
    render(
      <DynamicPropertiesPanel
        entry={makeEntry()}
        content=""
        frontmatter={{}}
        onAddProperty={onAddProperty}
      />
    )
    fireEvent.click(screen.getByText('+ Add property'))
    expect(screen.getByPlaceholderText('Property name')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Value')).toBeInTheDocument()
  })

  it('adds property via the add form', () => {
    render(
      <DynamicPropertiesPanel
        entry={makeEntry()}
        content=""
        frontmatter={{}}
        onAddProperty={onAddProperty}
      />
    )
    fireEvent.click(screen.getByText('+ Add property'))
    const keyInput = screen.getByPlaceholderText('Property name')
    const valueInput = screen.getByPlaceholderText('Value')
    fireEvent.change(keyInput, { target: { value: 'priority' } })
    fireEvent.change(valueInput, { target: { value: 'high' } })
    fireEvent.click(screen.getByText('Add'))
    expect(onAddProperty).toHaveBeenCalledWith('priority', 'high')
  })

  it('handles navigating to type via click', () => {
    render(
      <DynamicPropertiesPanel
        entry={makeEntry({ isA: 'Project' })}
        content=""
        frontmatter={{}}
        onNavigate={onNavigate}
      />
    )
    fireEvent.click(screen.getByText('Project'))
    expect(onNavigate).toHaveBeenCalledWith('type/project')
  })

  it('renders modified date', () => {
    render(
      <DynamicPropertiesPanel
        entry={makeEntry({ modifiedAt: 1700000000 })}
        content=""
        frontmatter={{}}
      />
    )
    expect(screen.getByText('Modified')).toBeInTheDocument()
  })

  it('handles editing status', () => {
    render(
      <DynamicPropertiesPanel
        entry={makeEntry()}
        content=""
        frontmatter={{ Status: 'Active' }}
        onUpdateProperty={onUpdateProperty}
      />
    )
    // Click status pill to start editing (rendered with CSS uppercase, DOM text is "Active")
    fireEvent.click(screen.getByTitle('Active'))
    // Should show edit input
    const input = screen.getByDisplayValue('Active')
    fireEvent.change(input, { target: { value: 'Done' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(onUpdateProperty).toHaveBeenCalledWith('Status', 'Done')
  })

  it('deletes property when delete button clicked', () => {
    render(
      <DynamicPropertiesPanel
        entry={makeEntry()}
        content=""
        frontmatter={{ custom_field: 'value' }}
        onDeleteProperty={onDeleteProperty}
        onUpdateProperty={onUpdateProperty}
      />
    )
    const deleteBtn = screen.getByTitle('Delete property')
    fireEvent.click(deleteBtn)
    expect(onDeleteProperty).toHaveBeenCalledWith('custom_field')
  })

  it('coerces true/false strings to booleans on save', () => {
    render(
      <DynamicPropertiesPanel
        entry={makeEntry()}
        content=""
        frontmatter={{ archived: 'false' }}
        onUpdateProperty={onUpdateProperty}
      />
    )
    // Edit the value
    fireEvent.click(screen.getByText('false'))
    const input = screen.getByDisplayValue('false')
    fireEvent.change(input, { target: { value: 'true' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(onUpdateProperty).toHaveBeenCalledWith('archived', true)
  })

  it('coerces numeric strings to numbers on save', () => {
    render(
      <DynamicPropertiesPanel
        entry={makeEntry()}
        content=""
        frontmatter={{ order: '3' }}
        onUpdateProperty={onUpdateProperty}
      />
    )
    fireEvent.click(screen.getByText('3'))
    const input = screen.getByDisplayValue('3')
    fireEvent.change(input, { target: { value: '5' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(onUpdateProperty).toHaveBeenCalledWith('order', 5)
  })

  it('cancels add form on Escape', () => {
    render(
      <DynamicPropertiesPanel
        entry={makeEntry()}
        content=""
        frontmatter={{}}
        onAddProperty={onAddProperty}
      />
    )
    fireEvent.click(screen.getByText('+ Add property'))
    const keyInput = screen.getByPlaceholderText('Property name')
    fireEvent.keyDown(keyInput, { key: 'Escape' })
    // Form should be hidden, button should reappear
    expect(screen.getByText('+ Add property')).toBeInTheDocument()
  })

  it('adds property on Enter in form', () => {
    render(
      <DynamicPropertiesPanel
        entry={makeEntry()}
        content=""
        frontmatter={{}}
        onAddProperty={onAddProperty}
      />
    )
    fireEvent.click(screen.getByText('+ Add property'))
    const keyInput = screen.getByPlaceholderText('Property name')
    const valueInput = screen.getByPlaceholderText('Value')
    fireEvent.change(keyInput, { target: { value: 'key' } })
    fireEvent.change(valueInput, { target: { value: 'val' } })
    fireEvent.keyDown(valueInput, { key: 'Enter' })
    expect(onAddProperty).toHaveBeenCalledWith('key', 'val')
  })

  it('handles comma-separated values as array', () => {
    render(
      <DynamicPropertiesPanel
        entry={makeEntry()}
        content=""
        frontmatter={{}}
        onAddProperty={onAddProperty}
      />
    )
    fireEvent.click(screen.getByText('+ Add property'))
    const keyInput = screen.getByPlaceholderText('Property name')
    const valueInput = screen.getByPlaceholderText('Value')
    fireEvent.change(keyInput, { target: { value: 'tags' } })
    fireEvent.change(valueInput, { target: { value: 'a, b, c' } })
    fireEvent.keyDown(valueInput, { key: 'Enter' })
    expect(onAddProperty).toHaveBeenCalledWith('tags', ['a', 'b', 'c'])
  })

  it('handles cancel button in add form', () => {
    render(
      <DynamicPropertiesPanel
        entry={makeEntry()}
        content=""
        frontmatter={{}}
        onAddProperty={onAddProperty}
      />
    )
    fireEvent.click(screen.getByText('+ Add property'))
    fireEvent.click(screen.getByText('Cancel'))
    expect(screen.getByText('+ Add property')).toBeInTheDocument()
  })
})
