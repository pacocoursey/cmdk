import tinykeys from 'tinykeys'
import * as RadixDialog from '@radix-ui/react-dialog'
import * as React from 'react'
import commandScore from 'command-score'

function useCommand() {
  return useSelector((state) => state)
}

const initialState: State = {
  search: '',
  selectedValue: '',
  filtered: { count: 0, items: new Map(), groups: new Set() },
  shouldFilter: true,
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
  onSelect?: (value: string) => void
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
type InputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'type'> & {
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
   * It should return a number between 0 and 1, with 1 being the best match and 0 being hidden entirely.
   * By default, uses the `command-score` library.
   */
  filter?: (value: string, search: string) => number
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
  item: (id: string, value: string, groupId: string) => () => void
  group: (id: string, value: string) => () => void
  label: string
  // Ids
  listId: string
  labelId: string
  inputId: string
}
type State = {
  search: string
  selectedValue: string
  filtered: { count: number; items: Map<string, number>; groups: Set<string> }
  shouldFilter: boolean
}
type Store = {
  subscribe: (callback: () => void) => () => void
  snapshot: () => State
  setState: (key: keyof State, value: any) => void
  emit: () => void
}

const GROUP_SELECTOR = `[cmdk-group=""]`
const GROUP_ITEMS_SELECTOR = `[cmdk-group-items=""]`
const GROUP_HEADING_SELECTOR = `[cmdk-group-heading=""]`
const ITEM_SELECTOR = `[cmdk-item=""]`
const VALID_ITEM_SELECTOR = `${ITEM_SELECTOR}:not([aria-disabled="true"])`
const SELECT_EVENT = `cmdk-item-select`
const defaultFilter: CommandProps['filter'] = (value, search) => commandScore(value, search)

// @ts-ignore
const CommandContext = React.createContext<Context>(undefined)
// @ts-ignore
const StoreContext = React.createContext<Store>(undefined)
// @ts-ignore
const GroupContext = React.createContext<string>(undefined)

const Command = React.forwardRef<HTMLDivElement, CommandProps>((props, forwardedRef) => {
  const ref = React.useRef<HTMLDivElement>(null)
  const state = useLazyRef<State>(() => ({ ...initialState }))
  const allItems = useLazyRef<Set<string>>(() => new Set()) // [...itemIds]
  const allGroups = useLazyRef<Map<string, Set<string>>>(() => new Map()) // groupId → [...itemIds]
  const ids = useLazyRef<Map<string, string>>(() => new Map()) // id → value
  const listeners = useLazyRef<Set<() => void>>(() => new Set())
  const propsRef = useAsRef(props)

  const listId = React.useId()
  const labelId = React.useId()
  const inputId = React.useId()

  /** Controlled mode `value` handling. */
  useLayoutEffect(() => {
    if (props.value !== undefined) {
      const value = props.value.trim().toLowerCase()
      state.current.selectedValue = value
      scrollSelectedIntoView()
      store.emit()
    }
  }, [props.value])

  const scheduled = useLazyRef(() => new Map())
  const schedule = (id: string, cb: () => void) => {
    const existing = scheduled.current.get(id)
    clearTimeout(existing)
    scheduled.current.set(id, setTimeout(cb, 1))
  }

  const store: Store = React.useMemo(() => {
    return {
      subscribe: (cb) => {
        listeners.current.add(cb)
        return () => listeners.current.delete(cb)
      },
      snapshot: () => {
        return state.current
      },
      setState: (key, value) => {
        if (Object.is(state.current[key], value)) return
        // @ts-ignore
        state.current[key] = value

        if (key === 'search') {
          // Filter synchronously before emitting back to children
          filterItems(true)

          // Defer this update because it can be huge!
          // Okay to have 1 frame between the input updating and the items
          schedule('searchChange', () => {
            store.emit()

            // Schedule a layout effect for after the children have finished rendering
            // but before paint so that we read up-to-date DOM state
            schedule('afterSearchChange', () => {
              sort()
              selectFirstItem(true)
            })
          })

          return
        } else if (key === 'selectedValue') {
          if (propsRef.current?.value !== undefined) {
            // If controlled, just call the callback instead of updating state internally
            propsRef.current.onValueChange?.(value)
            return
          } else {
            // Scroll the selected item into view
            scrollSelectedIntoView()
          }
        }

        // Notify subscribers that state has changed
        store.emit()
      },
      emit: () => {
        listeners.current.forEach((l) => l())
      },
      get shouldFilter() {
        return propsRef.current.shouldFilter
      },
    }
  }, [])

  const context: Context = React.useMemo(
    () => ({
      item: (id, value, groupId) => {
        allItems.current.add(id)
        ids.current.set(id, value)
        state.current.filtered.items.set(id, score(value))

        // Register this item within the group
        if (groupId) {
          if (!allGroups.current.has(groupId)) {
            allGroups.current.set(groupId, new Set([id]))
          } else {
            allGroups.current.get(groupId).add(id)
          }
        }

        // Consider the search query is "3"
        // then a new item is rendered with a value that matches "3"
        // We need to filter to ensure that item is shown
        schedule('itemAdd', () => {
          filterItems()
          store.emit()

          schedule('afterItemAdd', () => {
            sort()
            selectFirstItem(false)
          })
        })

        return () => {
          // Reduce count
          if (state.current.filtered.items.get(id) > 0) {
            state.current.filtered.count = Math.max(0, state.current.filtered.count - 1)
          }

          // The item removed could have been the selected one,
          // so selection should be moved to the next valid
          schedule('itemRemove', () => {
            selectFirstItem(false)
          })

          ids.current.delete(id)
          allItems.current.delete(id)
          state.current.filtered.items.delete(id)
        }
      },
      group: (id, value) => {
        ids.current.set(id, value)
        allGroups.current.set(id, new Set())

        return () => {
          ids.current.delete(id)
          allGroups.current.delete(id)
        }
      },
      label: props.label || props['aria-label'],
      listId,
      inputId,
      labelId,
    }),
    []
  )

  function score(value: string) {
    const filter = propsRef.current?.filter ?? defaultFilter
    return filter(value, state.current.search)
  }

  /** Sorts items by score, and groups by highest item score. */
  function sort() {
    if (
      !state.current.search ||
      // Explicitly false, because true | undefined is the default
      propsRef.current.shouldFilter === false
    ) {
      return
    }

    const scores = state.current.filtered.items

    // Sort the groups
    const groups: [string, number][] = []
    state.current.filtered.groups.forEach((value) => {
      const items = allGroups.current.get(value)

      // Get the maximum score of the group's items
      let max = 0
      items.forEach((item) => {
        const score = scores.get(item)
        max = Math.max(score, max)
      })

      groups.push([value, max])
    })

    // Sort items within groups to bottom
    // Sort items outside of groups
    // Sort groups to bottom (pushes all non-grouped items to the top)
    const list = ref.current.querySelector('[cmdk-list-sizer=""]')

    // Sort the items
    getValidItems()
      .sort((a, b) => {
        const valueA = a.getAttribute('data-value')
        const valueB = b.getAttribute('data-value')
        return (scores.get(valueB) ?? 0) - (scores.get(valueA) ?? 0)
      })
      .forEach((item) => {
        const group = item.closest(GROUP_ITEMS_SELECTOR)

        if (group) {
          group.appendChild(item.parentElement === group ? item : item.closest(`${GROUP_ITEMS_SELECTOR} > *`))
        } else {
          list.appendChild(item.parentElement === list ? item : item.closest(`${GROUP_ITEMS_SELECTOR} > *`))
        }
      })

    groups
      .sort((a, b) => b[1] - a[1])
      .forEach((group) => {
        const element = ref.current.querySelector(`${GROUP_SELECTOR}[data-value="${group[0]}"]`)
        element?.parentElement.appendChild(element)
      })
  }

  function selectFirstItem(overwrite: boolean = true) {
    const selected = state.current.selectedValue

    // Do not override existing, selected value is still valid
    if (!overwrite && selected && state.current.filtered.items.has(selected)) {
      return
    }

    const item = getValidItems().find((item) => !item.ariaDisabled)
    const value = item?.getAttribute('data-value')

    if (value) {
      store.setState('selectedValue', value)
    }
  }

  /** Filters the current items. */
  function filterItems(updateItems = false) {
    if (
      !state.current.search ||
      // Explicitly false, because true | undefined is the default
      propsRef.current.shouldFilter === false
    ) {
      state.current.filtered.count = allItems.current.size
      // Do nothing, each item will know to show itself because search is empty
      return
    }

    // Reset the groups
    state.current.filtered.groups = new Set()
    let itemCount = 0

    // Check which items should be included
    if (updateItems) {
      for (const id of allItems.current) {
        const value = ids.current.get(id)
        const rank = score(value)
        state.current.filtered.items.set(id, rank)
        if (rank > 0) itemCount++
      }
    }

    // Check which groups have at least 1 item shown
    for (const [groupId, group] of allGroups.current) {
      for (const itemId of group) {
        if (state.current.filtered.items.get(itemId) > 0) {
          state.current.filtered.groups.add(groupId)
          break
        }
      }
    }

    state.current.filtered.count = itemCount
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

  function getItemByValue(value: string) {
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

  function updateSelectedToIndex(index: number) {
    const items = getValidItems()
    const item = items[index]
    if (!item) return
    store.setState('selectedValue', item.getAttribute('data-value'))
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
    store.setState('selectedValue', newSelected.getAttribute('data-value'))
  }

  function updateSelectedToGroup(change: number) {
    const selected = getSelectedItem()
    let group = selected?.closest(GROUP_SELECTOR)

    if (!group) return updateSelectedByChange(change)

    let item: HTMLElement

    while (group && !item) {
      group = change > 0 ? findNextSibling(group, GROUP_SELECTOR) : findPreviousSibling(group, GROUP_SELECTOR)
      item = group?.querySelector(VALID_ITEM_SELECTOR)
    }

    if (item) {
      store.setState('selectedValue', item.getAttribute('data-value'))
    }
  }

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

  const { label, children, value: _, onValueChange: __, filter: ___, shouldFilter: ____, ...etc } = props

  return (
    <div ref={mergeRefs([ref, forwardedRef])} {...etc} cmdk-root="">
      <label
        cmdk-label=""
        htmlFor={context.inputId}
        id={context.labelId}
        // Screen reader only
        style={srOnlyStyles}
      >
        {props.label}
      </label>
      <StoreContext.Provider value={store}>
        <CommandContext.Provider value={context}>{props.children}</CommandContext.Provider>
      </StoreContext.Provider>
    </div>
  )
})

/**
 * Command menu item. Becomes active on pointer enter or through keyboard navigation.
 * Preferably pass a `value`, otherwise the value will be inferred from `children` or
 * the rendered item's `textContent`.
 */
const Item = React.forwardRef<HTMLDivElement, ItemProps>((props, forwardedRef) => {
  const id = React.useId()
  const ref = React.useRef<HTMLDivElement>(null)
  const groupId = React.useContext(GroupContext)
  const context = React.useContext(CommandContext)
  const propsRef = useAsRef(props)
  const value = useValue(ref, [props.value, props.children, ref])

  const store = useStore()
  const selected = useSelector((state) => state.selectedValue && state.selectedValue === value)
  const render = useSelector((state) =>
    state.shouldFilter === false ? true : !state.search ? true : state.filtered.items.get(id) > 0
  )

  useLayoutEffect(() => {
    if (value) {
      return context.item(id, value, groupId)
    }
  }, [value])

  React.useEffect(() => {
    const element = ref.current
    if (!element || props.disabled) return
    element.addEventListener(SELECT_EVENT, onSelect)
    return () => element.removeEventListener(SELECT_EVENT, onSelect)
  }, [render, props.onSelect, props.disabled, value])

  function onSelect() {
    propsRef.current.onSelect?.(value)
  }

  function select() {
    store.setState('selectedValue', value)
  }

  if (!render) return null

  return (
    <div
      ref={mergeRefs([ref, forwardedRef])}
      cmdk-item=""
      role="option"
      aria-disabled={props.disabled || undefined}
      aria-selected={selected || undefined}
      onPointerMove={props.disabled ? undefined : select}
      onClick={props.disabled ? undefined : onSelect}
    >
      {props.children}
    </div>
  )
})

/**
 * Group command menu items together with a heading.
 * Grouped items are always shown together.
 */
const Group = React.forwardRef<HTMLDivElement, GroupProps>((props, forwardedRef) => {
  const { heading, children, ...etc } = props
  const id = React.useId()
  const ref = React.useRef<HTMLDivElement>(null)
  const headingRef = React.useRef<HTMLDivElement>(null)
  const headingId = React.useId()
  const context = React.useContext(CommandContext)
  const value = useValue(ref, [props.value, props.heading, headingRef])
  const render = useSelector((state) => (!state.search ? true : state.filtered.groups.has(value)))

  useLayoutEffect(() => {
    if (value) {
      return context.group(id, value)
    }
  }, [value])

  return (
    <div
      ref={mergeRefs([ref, forwardedRef])}
      {...etc}
      cmdk-group=""
      role="presentation"
      hidden={render ? undefined : true}
    >
      {heading && (
        <div ref={headingRef} cmdk-group-heading="" aria-hidden id={headingId}>
          {heading}
        </div>
      )}
      <div cmdk-group-items="" role="group" aria-labelledby={heading ? headingId : undefined}>
        <GroupContext.Provider value={id}>{children}</GroupContext.Provider>
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
  const render = useSelector((state) => !state.search)

  if (!alwaysRender && !render) return null
  return <div ref={mergeRefs([ref, forwardedRef])} {...etc} cmdk-separator="" role="separator" />
})

/**
 * Command menu input.
 * All props are forwarded to the underyling `input` element.
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>((props, forwardedRef) => {
  const { onValueChange, ...etc } = props
  const isControlled = props.value != null
  const store = useStore()
  const search = useSelector((state) => state.search)
  const context = React.useContext(CommandContext)

  useLayoutEffect(() => {
    if (props.value != null) {
      store.setState('search', props.value)
    }
  }, [props.value])

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
        if (!isControlled) {
          store.setState('search', e.target.value)
        }

        onValueChange?.(e.target.value)
      }}
    />
  )
})

/**
 * Contains `Item`, `Group`, and `Separator`.
 * Use the `--cmdk-list-height` CSS variable to animate height based on the number of results.
 */
const List = React.forwardRef<HTMLDivElement, ListProps>((props, forwardedRef) => {
  const { children, ...etc } = props
  const ref = React.useRef<HTMLDivElement>(null)
  const height = React.useRef<HTMLDivElement>(null)
  const context = React.useContext(CommandContext)

  React.useEffect(() => {
    if (height.current && ref.current) {
      const el = height.current
      const wrapper = ref.current
      const observer = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const box = entry.contentBoxSize?.[0] || entry.contentRect
          const height = 'blockSize' in box ? box.blockSize : box.height
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
  const render = useSelector((state) => state.filtered.count === 0)

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

const useLayoutEffect = typeof window === 'undefined' ? React.useEffect : React.useLayoutEffect

function useLazyRef<T>(fn: () => T) {
  const ref = React.useRef<T>()

  if (!ref.current) {
    ref.current = fn()
  }

  return ref as React.MutableRefObject<T>
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

const useStore = () => React.useContext(StoreContext)

/** Run a selector against the store state. */
function useSelector(selector: (state: State) => any) {
  const store = useStore()

  return React.useSyncExternalStore(
    store.subscribe,
    () => selector(store.snapshot()),
    () => selector(store.snapshot())
  )
}

function useValue(
  ref: React.RefObject<HTMLElement>,
  deps: (string | React.ReactNode | React.RefObject<HTMLElement>)[]
) {
  const [value, setValue] = React.useState<string>()

  useLayoutEffect(() => {
    const value = getValue(deps)
    ref.current?.setAttribute('data-value', value)
    setValue(value)
  })

  return value
}

function getValue(parts: (string | React.ReactNode | React.RefObject<HTMLElement>)[]) {
  for (const part of parts) {
    if (typeof part === 'string') {
      return part.trim().toLowerCase()
    }

    if (typeof part === 'object' && 'current' in part && part.current) {
      return part.current.textContent?.trim().toLowerCase()
    }
  }
}

const srOnlyStyles = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: '0',
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  borderWidth: '0',
} as const
