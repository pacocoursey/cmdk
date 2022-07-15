import tinykeys from 'tinykeys'
import * as RadixDialog from '@radix-ui/react-dialog'
import * as React from 'react'

function useCommand() {
  const [state, setState] = React.useState(initialState)
  const context = React.useContext(CommandContext)

  React.useEffect(() => {
    return context.subscribe((state) => {
      setState({ ...state })
    })
  }, [])

  return state
}

const initialState = {
  search: '',
  selectedValue: '',
  filtered: { items: new Set(), groups: new Set() },
}

type Children = { children?: React.ReactNode }
type LoadingProps = Children & { progress?: number }
type EmptyProps = Children & {}
type SeparatorProps = { alwaysRender?: boolean }
type DialogProps = RadixDialog.DialogProps & { label?: string }
type ListProps = Children & {}
type ItemProps = Children & { disabled?: boolean; onSelect?: (e?: unknown) => void; value?: string }
type GroupProps = Children & { heading?: React.ReactNode; value?: string }
type InputProps = {}
type CommandProps = Children & {
  label?: string
  selectFirstItem?: boolean
  filter?: boolean
  onValueChange?: (v: string) => void
}

type Context = {
  item: (value: string, props: ItemProps) => void
  subscribe: (cb: (state: State, data: any) => void) => void
  itemRenderComplete: () => void
  set: {
    setSearch: (search: string) => void
    setSelectedValue: (value: string) => void
  }
  // Ids
  listId: string
  labelId: string
  inputId: string
}
type State = {
  search: string
  selectedValue: string
  filtered: { items: Set<any>; groups: Set<any> }
}

const GROUP_SELECTOR = `[cmdk-group]`
const GROUP_HEADING_SELECTOR = `[cmdk-group-heading]`
const ITEM_SELECTOR = `[cmdk-item]`
const VALID_ITEM_SELECTOR = `${ITEM_SELECTOR}:not([aria-disabled="true"])`
const SELECT_EVENT = `craft-item-select`
// @ts-ignore
const CommandContext = React.createContext<Context>(undefined)

function Command(props: CommandProps) {
  const ref = React.useRef<HTMLDivElement>(null)
  const state = useLazyRef<State>(() => initialState)
  const allItems = useLazyRef<Set<any>>(() => new Set())
  const allGroups = useLazyRef<Map<string, any>>(() => new Map())
  const listeners = useLazyRef<Set<(state: State, data: any) => void>>(() => new Set())
  const propsRef = useAsRef(props)

  const listId = React.useId()
  const labelId = React.useId()
  const inputId = React.useId()

  // Emit to items. This is _batched_, regardless of how many items re-rendered or state changes
  // If 200 items have mounted, we should still only emit once (at the end, hence layout effect)
  const emit = useTriggerLayoutEffect<string>((data) => {
    React.startTransition(() => {
      for (const listener of listeners.current) {
        listener(state.current, data)
      }
    })
  })

  const filterEffect = useTriggerLayoutEffect(() => {
    filterItems()
  })

  const context: Context = React.useMemo(
    () => ({
      item: (value, props) => {
        allItems.current.add(value)

        // Nothing is currently selected, select this one
        if (!state.current.selectedValue && !props.disabled) {
          state.current.selectedValue = value
        }

        // Item was added, so we should filter and notify
        filterEffect()
        emit()

        return () => {
          allItems.current.delete(value)

          // Removed item was the selected one
          if (value === state.current.selectedValue) {
            updateSelectedByChange(1)
          }

          emit()
        }
      },
      subscribe: (cb) => {
        listeners.current.add(cb)
        return () => listeners.current.delete(cb)
      },
      set: {
        setSearch: (value) =>
          updateState('search', value, () => {
            filterItems()
            propsRef.current.onValueChange?.(value)
            emit('search')
          }),
        setSelectedValue: (value) => {
          updateState('selectedValue', value, () => {
            scrollSelectedIntoView()
            emit()
          })
        },
      },
      itemRenderComplete: () => {
        if (propsRef.current.selectFirstItem !== false) selectFirstItem()
      },
      label: props.label || props['aria-label'],
      listId,
      inputId,
      labelId,
    }),
    []
  )

  // Focus the first valid item
  function selectFirstItem() {
    const item = getValidItems()[0]

    if (item) {
      context.set.setSelectedValue(item.getAttribute('data-value')!)
    }
  }

  function filterItems() {
    if (
      !state.current.search ||
      // Explicitly false, because true | undefined is the default
      propsRef.current.filter === false
    ) {
      state.current.filtered = {
        items: allItems.current,
        groups: new Set(Object.keys(allGroups.current)),
      }
      return
    }

    const items = new Set()
    const groups = new Set()

    // Check which items should be included
    for (const item of allItems.current) {
      if (item.includes(state.current.search)) {
        items.add(item)
      }
    }

    // Check which groups have at least 1 item shown
    for (const [name, group] of allGroups.current) {
      for (const value of group) {
        if (items.has(value)) {
          groups.add(name)
          break
        }
      }
    }

    state.current.filtered = { items, groups }
  }

  function scrollSelectedIntoView() {
    const item = getItemByValue(state.current.selectedValue)

    if (item) {
      if (item.parentElement?.firstChild === item) {
        // First item in Group, ensure heading is in view
        item.closest(GROUP_SELECTOR)?.querySelector(GROUP_HEADING_SELECTOR)?.scrollIntoView({ block: 'nearest' })
      }

      // Ensure the item is always in view
      item.scrollIntoView({ block: 'nearest' })
    }
  }

  /** Getters */

  function getItemByValue(value) {
    if (!ref.current) return null
    return ref.current.querySelector(`${ITEM_SELECTOR}[data-value="${value}"]`)
  }

  function getSelectedItem() {
    if (!ref.current) return null
    return ref.current.querySelector(`${ITEM_SELECTOR}[aria-selected="true"]`)
  }

  function getValidItems() {
    if (!ref.current) return []
    return Array.from(ref.current.querySelectorAll(VALID_ITEM_SELECTOR))
  }

  /** Setters */

  function updateState(key: keyof State, value: any, cb?: () => void) {
    if (Object.is(state.current[key], value)) return
    state.current[key] = value
    cb?.()
  }

  function updateSelectedToIndex(index: number) {
    const items = getValidItems()
    const item = items[index]
    if (!item) return
    const selectedValue = item.getAttribute('data-value')!
    context.set.setSelectedValue(selectedValue)
  }

  function updateSelectedByChange(change: number) {
    if (!change) return

    const items = getValidItems()
    if (!items.length) return

    // If nothing selected yet, choose first or last
    const selected = getSelectedItem()
    const index = items.findIndex((item) => item === selected)
    if (!selected) {
      return updateSelectedToIndex(change > 0 ? 0 : items.length - 1)
    }

    // Get item at this index
    const newSelected = items[index + change]
    if (!newSelected) return

    const newSelectedValue = newSelected.getAttribute('data-value')!
    context.set.setSelectedValue(newSelectedValue)
  }

  function updateSelectedToGroup(change: number) {
    const selected = getSelectedItem()
    let group = selected?.closest(GROUP_SELECTOR)

    if (!group) return updateSelectedToIndex(change)

    let item

    while (group && !item) {
      group = change > 0 ? findNextSibling(group, GROUP_SELECTOR) : findPreviousSibling(group, GROUP_SELECTOR)
      item = group?.querySelector(VALID_ITEM_SELECTOR)
    }

    const value = item?.getAttribute('data-value')
    if (value) context.set.setSelectedValue(value)
  }

  /** Effects */

  // Cache all items and groups
  useLayoutEffect(() => {
    if (!ref.current) return

    const data = new Map()
    const groups = Array.from(ref.current.querySelectorAll(GROUP_SELECTOR))

    for (const group of groups) {
      const value = group.getAttribute('data-value')
      const items = Array.from(group.querySelectorAll(ITEM_SELECTOR))
      const itemValues = items.map((item) => item.getAttribute('data-value'))
      data.set(value, itemValues)
    }

    allGroups.current = data
    allItems.current = new Set(
      Array.from(ref.current.querySelectorAll(ITEM_SELECTOR)).map((item) => item.getAttribute('data-value'))
    )
  }, [])

  useLayoutEffect(() => {
    if (ref.current) {
      return keys(
        ref.current,
        {
          ArrowDown: () => updateSelectedByChange(1),
          ArrowUp: () => updateSelectedByChange(-1),
          Home: () => updateSelectedToIndex(0),
          End: () => updateSelectedToIndex(getValidItems().length - 1),
          '$mod+ArrowDown': () => updateSelectedToIndex(getValidItems().length - 1),
          '$mod+ArrowUp': () => updateSelectedToIndex(0),
          'Alt+ArrowDown': () => updateSelectedToGroup(1),
          'Alt+ArrowUp': () => updateSelectedToGroup(-1),
          Enter: (e) => {
            const item = getSelectedItem()
            if (item) {
              e.preventDefault()
              const event = new Event(SELECT_EVENT)
              item.dispatchEvent(event)
            }
          },
        },
        { preventDefault: true }
      )
    }
  }, [])

  const { label, children, ...rest } = props

  return (
    <div ref={ref} cmdk-root="" {...rest}>
      <label cmdk-label="" craft-sr-only="" htmlFor={context.inputId} id={context.labelId}>
        {props.label}
      </label>
      <CommandContext.Provider value={context}>
        {props.children}
        {propsRef.current.selectFirstItem !== false && <Notifier />}
      </CommandContext.Provider>
    </div>
  )
}

function Notifier() {
  const context = React.useContext(CommandContext)

  const trigger = useTriggerLayoutEffect(() => {
    context.itemRenderComplete()
  })

  useLayoutEffect(() => {
    return context.subscribe((_, value) => {
      if (value === 'search') {
        trigger()
      }
    })
  }, [])

  return null
}

function List(props: ListProps) {
  const ref = React.useRef<HTMLDivElement>(null)
  const height = React.useRef<HTMLDivElement>(null)
  const context = React.useContext(CommandContext)

  useLayoutEffect(() => {
    if (height.current && ref.current) {
      const el = height.current
      const wrapper = ref.current
      const observer = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const box = entry.contentBoxSize?.[0] || entry.contentBoxSize || entry.contentRect
          // @ts-ignore
          const height = box?.blockSize ?? box?.heightblockSize
          wrapper.style.setProperty(`--cmdk-list-height`, height + 'px')
        }
      })
      observer.observe(el, { box: 'border-box' })
      return () => observer.unobserve(el)
    }
  }, [])

  return (
    <div
      ref={ref}
      cmdk-list=""
      role="listbox"
      aria-label="Suggestions"
      id={context.listId}
      aria-labelledby={context.inputId}
    >
      <div ref={height} cmdk-list-sizer="">
        {props.children}
      </div>
    </div>
  )
}

function Item(props: ItemProps) {
  const ref = React.useRef<HTMLDivElement>(null)
  const context = React.useContext(CommandContext)
  const [render, setRender] = React.useState(true)
  const [selected, setSelected] = React.useState(false)
  const value = typeof props.children === 'string' ? props.children.toLowerCase() : props.value?.toLowerCase()

  const propsRef = useAsRef(props)

  useLayoutEffect(() => {
    return context.item(value!, propsRef.current)
  }, [])

  useLayoutEffect(() => {
    const element = ref.current
    if (!element || props.disabled) return
    element.addEventListener(SELECT_EVENT, onSelect)
    return () => element.removeEventListener(SELECT_EVENT, onSelect)
  }, [props.onSelect, props.disabled])

  useLayoutEffect(() => {
    return context.subscribe((state) => {
      if (!state.search) setRender(true)
      else setRender(state.filtered.items.has(value))
      setSelected(state.selectedValue === value)
    })
  }, [])

  function onSelect() {
    propsRef.current.onSelect?.()
  }

  function select() {
    context.set.setSelectedValue(value!)
  }

  if (!render) return null

  return (
    <div
      ref={ref}
      cmdk-item=""
      role="option"
      aria-disabled={props.disabled || undefined}
      aria-selected={selected || undefined}
      data-value={value}
      onPointerMove={props.disabled ? undefined : select}
      onClick={props.disabled ? undefined : props.onSelect}
    >
      {props.children}
    </div>
  )
}

function Input(props: InputProps) {
  const [search, setSearch] = React.useState('')
  const context = React.useContext(CommandContext)

  return (
    <input
      {...props}
      cmdk-input=""
      autoComplete="off"
      autoCorrect="off"
      spellCheck={false}
      aria-autocomplete="list"
      role="combobox"
      aria-expanded={true}
      aria-controls={context.listId}
      aria-labelledby={context.labelId}
      id={context.inputId}
      type="text"
      value={search}
      onChange={(e) => {
        context.set.setSearch(e.target.value)
        setSearch(e.target.value)
      }}
    />
  )
}

function Group(props: GroupProps) {
  const groupId = React.useId()
  const headingId = React.useId()
  const context = React.useContext(CommandContext)
  const [render, setRender] = React.useState(true)
  const value = typeof props.heading === 'string' ? props.heading.toLowerCase() : props.value?.toLowerCase()

  useLayoutEffect(() => {
    return context.subscribe((state) => {
      if (!state.search) setRender(true)
      else setRender(state.filtered.groups.has(value))
    })
  }, [])

  return (
    <div cmdk-group="" data-value={value} role="presentation" hidden={render ? undefined : true}>
      {props.heading && (
        <div cmdk-group-heading="" aria-hidden id={headingId}>
          {props.heading}
        </div>
      )}
      <div key={groupId} role="group" aria-labelledby={props.heading ? headingId : undefined}>
        {props.children}
      </div>
    </div>
  )
}

function Separator(props: SeparatorProps) {
  const ref = React.useRef<HTMLDivElement>(null)
  const context = React.useContext(CommandContext)
  const [render, setRender] = React.useState(true)

  useLayoutEffect(() => {
    return context.subscribe((state) => {
      setRender(!state.search)
    })
  }, [])

  if (!props.alwaysRender && !render) return null

  return <div ref={ref} cmdk-separator="" role="separator" />
}

function Dialog(props: DialogProps) {
  return (
    <RadixDialog.Root open={props.open} onOpenChange={props.onOpenChange}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay cmdk-overlay="" />
        <RadixDialog.Content aria-label={props.label} cmdk-dialog="">
          <Command {...props} />
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  )
}

function Empty(props: EmptyProps) {
  const [render, setRender] = React.useState(false)
  const context = React.useContext(CommandContext)

  useLayoutEffect(() => {
    return context.subscribe((state) => {
      setRender(Boolean(state.search) && state.filtered.items.size === 0)
    })
  }, [])

  if (!render) return null

  return (
    <div cmdk-empty="" role="presentation">
      {props.children}
    </div>
  )
}

function Loading(props: LoadingProps) {
  return (
    <div
      cmdk-loading=""
      role="progressbar"
      aria-valuenow={props.progress}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Loading..."
    >
      <div aria-hidden>{props.children}</div>
    </div>
  )
}

const pkg = Object.assign(Command, {
  List,
  Item,
  Input,
  Group,
  Separator,
  Dialog,
  Empty,
  Loading,
})
export { useCommand }
export { pkg as Command }

/**
 *
 *
 * Helpers
 *
 *
 */

function keys(
  element: HTMLElement,
  handlers: Record<string, (e: KeyboardEvent) => void> = {},
  opts: { preventDefault?: boolean } = {}
) {
  if (opts.preventDefault) {
    for (const key in handlers) {
      const callback = handlers[key]
      handlers[key] = (e) => {
        callback(e)
        e.preventDefault()
      }
    }
  }

  return tinykeys(element, handlers)
}

function findNextSibling(el: Element, selector: string) {
  let sibling = el.nextElementSibling

  while (sibling) {
    if (sibling.matches(selector)) return sibling
    sibling = sibling.nextElementSibling
  }
}

function findPreviousSibling(el: Element, selector: string) {
  let sibling = el.previousElementSibling

  while (sibling) {
    if (sibling.matches(selector)) return sibling
    sibling = sibling.previousElementSibling
  }
}

function useAsRef<T>(data: T) {
  const ref = React.useRef<T>(data)

  useLayoutEffect(() => {
    ref.current = data
  })

  return ref
}

function noop() {}

function useTriggerLayoutEffect<T>(effect: (data?: T) => void = noop) {
  const [value, rerender] = React.useState<{}>()
  const argsRef = React.useRef<IArguments>()

  useLayoutEffect(() => {
    return effect.apply(null, argsRef.current)
  }, [value])

  return React.useCallback<(data?: T) => void>(function () {
    argsRef.current = arguments
    rerender({})
  }, [])
}

const useLayoutEffect = typeof window === 'undefined' ? React.useEffect : React.useLayoutEffect

function useLazyRef<T>(fn: () => T) {
  const ref = React.useRef<T>()

  if (!ref.current) {
    ref.current = fn()
  }

  return ref as React.MutableRefObject<T>
}
