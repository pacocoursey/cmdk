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
type DivProps = React.HTMLAttributes<HTMLDivElement>

type LoadingProps = Children & {
  /** Estimated progress of loading asynchronous options. */
  progress?: number
}
type EmptyProps = Children & DivProps & {}
type SeparatorProps = DivProps & {
  /** Whether this separator should always be rendered. Useful if you disable automatic filtering. */
  alwaysRender?: boolean
}
type DialogProps = RadixDialog.DialogProps & CommandProps
type ListProps = Children & DivProps & {}
type ItemProps = Children & {
  /** Whether this item is currently disabled. */
  disabled?: boolean
  /** Event handler for when this item is selected, either via click or keyboard selection. */
  onSelect?: (e?: unknown) => void
  /**
   * A unique value for this item.
   * If no value is provided, it will be inferred from `children` or the rendered `textContent`. If your `textContent` changes between renders, you _must_ provide a stable, unique `value`.
   */
  value?: string
}
type GroupProps = Children & {
  /** Optional heading to render for this group. */
  heading?: React.ReactNode
  /** If no heading is provided, you must provie a value that is unique for this group. */
  value?: string
}
type InputProps = Omit<React.HTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'type'> & {
  /**
   * Optional controlled state for the value of the search input.
   */
  value?: string
  /**
   * Event handler called when the search value changes.
   */
  onValueChange?: (search: string) => void
}
type CommandProps = Children & {
  /**
   * Accessible label for this command menu. Not shown visibly.
   */
  label?: string
  /**
   * Optionally set to `false` to turn off the automatic filtering and sorting.
   * If `false`, you must conditionally render valid items based on the search query yourself.
   */
  shouldFilter?: boolean
  /**
   * Custom filter function for whether each command menu item should matches the given search query.
   * By default, uses a simple `String.includes` filter.
   */
  filter?: (value: string, search: string) => boolean
  /**
   * Optional controlled state of the selected command menu item.
   */
  value?: string
  /**
   * Event handler called when the selected item of the menu changes.
   */
  onValueChange?: (value: string) => void
}

type Context = {
  item: (value: string, props: ItemProps) => () => void
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
const SELECT_EVENT = `cmdk-item-select`
// @ts-ignore
/** @private */
const CommandContext = React.createContext<Context>(undefined)
const defaultFilter: CommandProps['filter'] = (value, search) => value.toLowerCase().includes(search.toLowerCase())

const Command = React.forwardRef<HTMLDivElement, CommandProps>((props, forwardedRef) => {
  const ref = React.useRef<HTMLDivElement>(null)
  const state = useLazyRef<State>(() => initialState)
  const allItems = useLazyRef<Set<any>>(() => new Set())
  const allGroups = useLazyRef<Map<string, any>>(() => new Map())
  const listeners = useLazyRef<Set<(state: State, data: any) => void>>(() => new Set())
  const propsRef = useAsRef(props)

  const listId = React.useId()
  const labelId = React.useId()
  const inputId = React.useId()

  /** Controlled mode `value` handling. */
  useLayoutEffect(() => {
    state.current.selectedValue = props.value
    scrollSelectedIntoView()
    emit()
  }, [props.value])

  // The order of these `useTriggerLayoutEffect`s matter!
  // Filtering should happen before emitting, otherwise filtered will be out of date
  // and the wrong items could show.

  const filterEffect = useTriggerLayoutEffect(() => {
    filterItems()
  })

  // Emit to items. This is _batched_, regardless of how many items re-rendered or state changes
  // If 200 items have mounted, we should still only emit once (at the end, hence layout effect)
  const emit = useTriggerLayoutEffect<string>((data) => {
    React.startTransition(() => {
      for (const listener of listeners.current) {
        listener(state.current, data)
      }
    })
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
            emit('search')
          }),
        setSelectedValue: (value) => {
          // If controlled, just call the callback instead of updating state internally
          if (propsRef.current?.value != null) {
            propsRef.current.onValueChange?.(value)
          } else {
            updateState('selectedValue', value, () => {
              scrollSelectedIntoView()
              emit()
              propsRef.current.onValueChange?.(value)
            })
          }
        },
      },
      itemRenderComplete: () => {
        selectFirstItem()
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
      propsRef.current.shouldFilter === false
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
      const filter = propsRef.current?.filter ?? defaultFilter

      if (filter(item, state.current.search)) {
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

    // No results...
    // TODO
    // if (items.size === 0) {
    //   state.current.selectedValue = undefined
    // }

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

  const { label, children, value: _, onValueChange: __, filter: ___, ...etc } = props

  return (
    <div ref={mergeRefs([ref, forwardedRef])} {...etc} cmdk-root="">
      <label
        cmdk-label=""
        htmlFor={context.inputId}
        id={context.labelId}
        // Screen reader only
        style={{
          position: 'absolute',
          width: '1px',
          height: '1px',
          padding: '0',
          margin: '-1px',
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          borderWidth: '0',
        }}
      >
        {props.label}
      </label>
      <CommandContext.Provider value={context}>
        {props.children}
        <Notifier />
      </CommandContext.Provider>
    </div>
  )
})

/** @private */
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

/**
 * Contains `Item`, `Group`, and `Separator`.
 * Use the `--cmdk-list-height` CSS variable to animate height based on the number of results.
 */
const List = React.forwardRef<HTMLDivElement, ListProps>((props, forwardedRef) => {
  const { children, ...etc } = props
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
      ref={mergeRefs([ref, forwardedRef])}
      {...etc}
      cmdk-list=""
      role="listbox"
      aria-label="Suggestions"
      id={context.listId}
      aria-labelledby={context.inputId}
    >
      <div ref={height} cmdk-list-sizer="">
        {children}
      </div>
    </div>
  )
})

/**
 * Command menu item. Becomes active on pointer enter or through keyboard navigation.
 * Preferably pass a `value`, otherwise the value will be inferred from `children` or
 * the rendered item's `textContent`.
 */
const Item = React.forwardRef<HTMLDivElement, ItemProps>((props, forwardedRef) => {
  const ref = React.useRef<HTMLDivElement>(null)
  const context = React.useContext(CommandContext)
  const [render, setRender] = React.useState(true)
  const [selected, setSelected] = React.useState(false)
  const propsRef = useAsRef(props)
  const valueId = useHTMLId()

  const value = React.useMemo(() => {
    if (typeof props.children === 'string') {
      return props.children.toLowerCase()
    }

    if (props.value) {
      return props.value.toLowerCase()
    }

    if (ref.current) {
      return ref.current?.textContent?.trim().toLowerCase()
    }

    return valueId
  }, [props.children, props.value, valueId])

  useLayoutEffect(() => {
    if (ref.current) {
      ref.current.setAttribute('data-value', value)
    }

    return context.item(value, propsRef.current)
  }, [value])

  useLayoutEffect(() => {
    return context.subscribe((state) => {
      if (!state.search) setRender(true)
      else setRender(state.filtered.items.has(value))
      setSelected(state.selectedValue === value)
    })
  }, [value])

  useLayoutEffect(() => {
    const element = ref.current
    if (!element || props.disabled) return
    element.addEventListener(SELECT_EVENT, onSelect)
    return () => element.removeEventListener(SELECT_EVENT, onSelect)
  }, [props.onSelect, props.disabled])

  function onSelect() {
    propsRef.current.onSelect?.()
  }

  function select() {
    context.set.setSelectedValue(value)
  }

  if (!render) return null

  return (
    <div
      ref={mergeRefs([ref, forwardedRef])}
      cmdk-item=""
      role="option"
      aria-disabled={props.disabled || undefined}
      aria-selected={selected || undefined}
      // data-value={value}
      onPointerMove={props.disabled ? undefined : select}
      onClick={props.disabled ? undefined : props.onSelect}
    >
      {props.children}
    </div>
  )
})

/**
 * Command menu input.
 * All props are forwarded to the underyling `input` element.
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>((props, forwardedRef) => {
  const { onValueChange, ...etc } = props
  const isControlled = props.value != null
  const [search, setSearch] = React.useState('')
  const context = React.useContext(CommandContext)

  return (
    <input
      ref={forwardedRef}
      {...etc}
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
      value={isControlled ? props.value : search}
      onChange={(e) => {
        context.set.setSearch(e.target.value)
        setSearch(e.target.value)
        onValueChange?.(e.target.value)
      }}
    />
  )
})

/**
 * Group command menu items together with a heading.
 * Grouped items are always shown together.
 */
const Group = React.forwardRef<HTMLDivElement, GroupProps>((props, forwardedRef) => {
  const { heading, children, ...etc } = props
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
    <div
      ref={forwardedRef}
      {...etc}
      cmdk-group=""
      data-value={value}
      role="presentation"
      hidden={render ? undefined : true}
    >
      {heading && (
        <div cmdk-group-heading="" aria-hidden id={headingId}>
          {heading}
        </div>
      )}
      <div key={groupId} role="group" aria-labelledby={heading ? headingId : undefined}>
        {children}
      </div>
    </div>
  )
})

/**
 * A visual and semantic separator between items or groups.
 * Visible when the search query is empty or `alwaysRender` is true, hidden otherwise.
 */
const Separator = React.forwardRef<HTMLDivElement, SeparatorProps>((props, forwardedRef) => {
  const { alwaysRender, ...etc } = props
  const ref = React.useRef<HTMLDivElement>(null)
  const context = React.useContext(CommandContext)
  const [render, setRender] = React.useState(true)

  useLayoutEffect(() => {
    return context.subscribe((state) => {
      setRender(!state.search)
    })
  }, [])

  if (!alwaysRender && !render) return null
  return <div ref={mergeRefs([ref, forwardedRef])} {...etc} cmdk-separator="" role="separator" />
})

/**
 * Renders the command menu in a Radix Dialog.
 */
const Dialog = React.forwardRef<HTMLDivElement, DialogProps>((props, forwardedRef) => {
  const { open, onOpenChange, ...etc } = props
  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay cmdk-overlay="" />
        <RadixDialog.Content aria-label={props.label} cmdk-dialog="">
          <Command ref={forwardedRef} {...etc} />
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  )
})

/**
 * Automatically renders when there are no results for the search query.
 */
const Empty = React.forwardRef<HTMLDivElement, EmptyProps>((props, forwardedRef) => {
  const [render, setRender] = React.useState(false)
  const context = React.useContext(CommandContext)

  useLayoutEffect(() => {
    return context.subscribe((state) => {
      setRender(Boolean(state.search) && state.filtered.items.size === 0)
    })
  }, [])

  if (!render) return null
  return <div ref={forwardedRef} {...props} cmdk-empty="" role="presentation" />
})

/**
 * You should conditionally render this with `progress` while loading asynchronous items.
 */
const Loading = React.forwardRef<HTMLDivElement, LoadingProps>((props, forwardedRef) => {
  const { progress, children, ...etc } = props

  return (
    <div
      ref={forwardedRef}
      {...etc}
      cmdk-loading=""
      role="progressbar"
      aria-valuenow={progress}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Loading..."
    >
      <div aria-hidden>{children}</div>
    </div>
  )
})

// Command.displayName = 'Command'
// List.displayName = 'CommandList'
// Item.displayName = 'CommandItem'
// Group.displayName = 'CommandGroup'
// Separator.displayName = 'CommandSeparator'
// Dialog.displayName = 'CommandDialog'
// Empty.displayName = 'CommandEmpty'
// Loading.displayName = 'CommandLoading'
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

const idReplacer = /:/g
const useHTMLId = () => {
  const id = React.useId()
  return id.replace(idReplacer, '_')
}

// ESM is still a nightmare with Next.js so I'm just gonna copy the package code in
// https://github.com/gregberge/react-merge-refs
// Copyright (c) 2020 Greg Bergé
function mergeRefs<T = any>(refs: Array<React.MutableRefObject<T> | React.LegacyRef<T>>): React.RefCallback<T> {
  return (value) => {
    refs.forEach((ref) => {
      if (typeof ref === 'function') {
        ref(value)
      } else if (ref != null) {
        ;(ref as React.MutableRefObject<T | null>).current = value
      }
    })
  }
}
