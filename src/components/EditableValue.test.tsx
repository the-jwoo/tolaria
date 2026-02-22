import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { EditableValue, TagPillList } from './EditableValue'

describe('EditableValue', () => {
  const onSave = vi.fn()
  const onCancel = vi.fn()
  const onStartEdit = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('displays value text in view mode', () => {
    render(<EditableValue value="Active" onSave={onSave} onCancel={onCancel} isEditing={false} onStartEdit={onStartEdit} />)
    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  it('displays em-dash when value is empty', () => {
    render(<EditableValue value="" onSave={onSave} onCancel={onCancel} isEditing={false} onStartEdit={onStartEdit} />)
    expect(screen.getByText('\u2014')).toBeInTheDocument()
  })

  it('calls onStartEdit when clicked in view mode', () => {
    render(<EditableValue value="Active" onSave={onSave} onCancel={onCancel} isEditing={false} onStartEdit={onStartEdit} />)
    fireEvent.click(screen.getByText('Active'))
    expect(onStartEdit).toHaveBeenCalled()
  })

  it('shows input in editing mode', () => {
    render(<EditableValue value="Active" onSave={onSave} onCancel={onCancel} isEditing={true} onStartEdit={onStartEdit} />)
    const input = screen.getByDisplayValue('Active')
    expect(input).toBeInTheDocument()
    expect(input.tagName).toBe('INPUT')
  })

  it('calls onSave when Enter is pressed', () => {
    render(<EditableValue value="Active" onSave={onSave} onCancel={onCancel} isEditing={true} onStartEdit={onStartEdit} />)
    const input = screen.getByDisplayValue('Active')
    fireEvent.change(input, { target: { value: 'Done' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(onSave).toHaveBeenCalledWith('Done')
  })

  it('calls onCancel and resets when Escape is pressed', () => {
    render(<EditableValue value="Active" onSave={onSave} onCancel={onCancel} isEditing={true} onStartEdit={onStartEdit} />)
    const input = screen.getByDisplayValue('Active')
    fireEvent.change(input, { target: { value: 'Changed' } })
    fireEvent.keyDown(input, { key: 'Escape' })
    expect(onCancel).toHaveBeenCalled()
  })

  it('calls onSave on blur', () => {
    render(<EditableValue value="Active" onSave={onSave} onCancel={onCancel} isEditing={true} onStartEdit={onStartEdit} />)
    const input = screen.getByDisplayValue('Active')
    fireEvent.change(input, { target: { value: 'Paused' } })
    fireEvent.blur(input)
    expect(onSave).toHaveBeenCalledWith('Paused')
  })
})

describe('TagPillList', () => {
  const onSave = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders all items as pills', () => {
    render(<TagPillList items={['Tag1', 'Tag2', 'Tag3']} onSave={onSave} label="Tags" />)
    expect(screen.getByText('Tag1')).toBeInTheDocument()
    expect(screen.getByText('Tag2')).toBeInTheDocument()
    expect(screen.getByText('Tag3')).toBeInTheDocument()
  })

  it('shows add button with + text', () => {
    render(<TagPillList items={['A']} onSave={onSave} label="Tags" />)
    expect(screen.getByTitle('Add tags')).toBeInTheDocument()
  })

  it('shows add input when + button is clicked', () => {
    render(<TagPillList items={[]} onSave={onSave} label="Tags" />)
    fireEvent.click(screen.getByTitle('Add tags'))
    expect(screen.getByPlaceholderText('Tags...')).toBeInTheDocument()
  })

  it('adds new item on Enter in add input', () => {
    render(<TagPillList items={['A']} onSave={onSave} label="Tags" />)
    fireEvent.click(screen.getByTitle('Add tags'))
    const input = screen.getByPlaceholderText('Tags...')
    fireEvent.change(input, { target: { value: 'NewTag' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(onSave).toHaveBeenCalledWith(['A', 'NewTag'])
  })

  it('cancels add on Escape', () => {
    render(<TagPillList items={['A']} onSave={onSave} label="Tags" />)
    fireEvent.click(screen.getByTitle('Add tags'))
    const input = screen.getByPlaceholderText('Tags...')
    fireEvent.keyDown(input, { key: 'Escape' })
    expect(onSave).not.toHaveBeenCalled()
    // Add button should reappear
    expect(screen.getByTitle('Add tags')).toBeInTheDocument()
  })

  it('deletes item when X button is clicked', () => {
    render(<TagPillList items={['A', 'B', 'C']} onSave={onSave} label="Tags" />)
    const removeButtons = screen.getAllByTitle('Remove')
    fireEvent.click(removeButtons[1]) // Remove B
    expect(onSave).toHaveBeenCalledWith(['A', 'C'])
  })

  it('enters edit mode when clicking a pill', () => {
    render(<TagPillList items={['Hello', 'World']} onSave={onSave} label="Tags" />)
    fireEvent.click(screen.getByText('Hello'))
    expect(screen.getByDisplayValue('Hello')).toBeInTheDocument()
  })

  it('saves edit on Enter', () => {
    render(<TagPillList items={['Old']} onSave={onSave} label="Tags" />)
    fireEvent.click(screen.getByText('Old'))
    const input = screen.getByDisplayValue('Old')
    fireEvent.change(input, { target: { value: 'New' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(onSave).toHaveBeenCalledWith(['New'])
  })

  it('removes item when edit value is cleared', () => {
    render(<TagPillList items={['Remove', 'Keep']} onSave={onSave} label="Tags" />)
    fireEvent.click(screen.getByText('Remove'))
    const input = screen.getByDisplayValue('Remove')
    fireEvent.change(input, { target: { value: '' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(onSave).toHaveBeenCalledWith(['Keep'])
  })

  it('cancels edit on Escape', () => {
    render(<TagPillList items={['Stay']} onSave={onSave} label="Tags" />)
    fireEvent.click(screen.getByText('Stay'))
    const input = screen.getByDisplayValue('Stay')
    fireEvent.keyDown(input, { key: 'Escape' })
    expect(onSave).not.toHaveBeenCalled()
    // Pill should reappear
    expect(screen.getByText('Stay')).toBeInTheDocument()
  })

  it('adds item on blur when input has value', () => {
    render(<TagPillList items={[]} onSave={onSave} label="Tags" />)
    fireEvent.click(screen.getByTitle('Add tags'))
    const input = screen.getByPlaceholderText('Tags...')
    fireEvent.change(input, { target: { value: 'BlurAdd' } })
    fireEvent.blur(input)
    expect(onSave).toHaveBeenCalledWith(['BlurAdd'])
  })

  it('cancels add on blur when input is empty', () => {
    render(<TagPillList items={[]} onSave={onSave} label="Tags" />)
    fireEvent.click(screen.getByTitle('Add tags'))
    const input = screen.getByPlaceholderText('Tags...')
    fireEvent.blur(input)
    expect(onSave).not.toHaveBeenCalled()
  })
})
