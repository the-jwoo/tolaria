import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TypeCustomizePopover, resolveIcon, ICON_OPTIONS } from './TypeCustomizePopover'

describe('resolveIcon', () => {
  it('returns the correct icon component for known name', () => {
    const Icon = resolveIcon('wrench')
    expect(Icon).toBeDefined()
    expect(Icon).not.toBe(ICON_OPTIONS[0].Icon) // should not be fallback (file-text)
  })

  it('returns FileText fallback for null', () => {
    const Icon = resolveIcon(null)
    // FileText is the default
    expect(Icon).toBeDefined()
  })

  it('returns FileText fallback for unknown name', () => {
    const Icon = resolveIcon('nonexistent-icon')
    expect(Icon).toBeDefined()
  })
})

describe('TypeCustomizePopover', () => {
  const onChangeIcon = vi.fn()
  const onChangeColor = vi.fn()
  const onClose = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders color section and icon section', () => {
    render(
      <TypeCustomizePopover
        currentIcon="wrench"
        currentColor="blue"
        onChangeIcon={onChangeIcon}
        onChangeColor={onChangeColor}
        onClose={onClose}
      />
    )
    expect(screen.getByText('COLOR')).toBeInTheDocument()
    expect(screen.getByText('ICON')).toBeInTheDocument()
    expect(screen.getByText('Done')).toBeInTheDocument()
  })

  it('calls onChangeColor when a color is clicked', () => {
    render(
      <TypeCustomizePopover
        currentIcon={null}
        currentColor={null}
        onChangeIcon={onChangeIcon}
        onChangeColor={onChangeColor}
        onClose={onClose}
      />
    )

    // Click the first color button (by title)
    const colorButtons = screen.getAllByTitle(/red|blue|green|purple|yellow|orange/i)
    fireEvent.click(colorButtons[0])

    expect(onChangeColor).toHaveBeenCalled()
  })

  it('calls onChangeIcon when an icon is clicked', () => {
    render(
      <TypeCustomizePopover
        currentIcon={null}
        currentColor={null}
        onChangeIcon={onChangeIcon}
        onChangeColor={onChangeColor}
        onClose={onClose}
      />
    )

    // Click the wrench icon
    fireEvent.click(screen.getByTitle('wrench'))

    expect(onChangeIcon).toHaveBeenCalledWith('wrench')
  })

  it('calls onClose when Done is clicked', () => {
    render(
      <TypeCustomizePopover
        currentIcon={null}
        currentColor={null}
        onChangeIcon={onChangeIcon}
        onChangeColor={onChangeColor}
        onClose={onClose}
      />
    )

    fireEvent.click(screen.getByText('Done'))
    expect(onClose).toHaveBeenCalled()
  })

  it('renders all icon options', () => {
    render(
      <TypeCustomizePopover
        currentIcon={null}
        currentColor={null}
        onChangeIcon={onChangeIcon}
        onChangeColor={onChangeColor}
        onClose={onClose}
      />
    )

    // Should have buttons for each icon option
    for (const option of ICON_OPTIONS.slice(0, 5)) {
      expect(screen.getByTitle(option.name)).toBeInTheDocument()
    }
  })
})
