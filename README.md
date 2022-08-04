# ⌘K ![cmdk minzip package size](https://img.shields.io/bundlephobia/minzip/cmdk) ![Version](https://img.shields.io/npm/v/cmdk.svg?colorB=green)

Composable command palette React component. Render items to be filtered and sorted automatically. ⌘K supports a fully composable API <sup>[How?](/ARCHITECTURE.md)</sup>, you can wrap items in other components or even as static JSX. Check out the [examples](#) to try it yourself.

```bash
$ npm install cmdk
```

Usage:

```tsx
import { Command } from 'cmdk'

const CommandMenu = () => {
  return (
    <Command>
      <Command.Input />
      <Command.List>
        <Command.Empty>No results found.</Command.Empty>

        <Command.Group heading="Letters">
          <Command.Item>a</Command.Item>
          <Command.Item>b</Command.Item>
          <Command.Separator />
          <Command.Item>c</Command.Item>
        </Command.Group>

        <Command.Item>Apple</Command.Item>
      </Command.List>
    </Command>
  )
}
```

Or as a dialog:

```tsx
import { Command } from 'cmdk'

const CommandMenu = () => {
  const [open, setOpen] = React.useState(false)

  // Toggle the menu when ⌘K is pressed
  React.useEffect(() => {
    const down = (e) => {
      if (e.key === 'k' && e.metaKey) {
        setOpen((open) => !open)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  return (
    <Command.Dialog open={open} onOpenChange={setOpen}>
      <Command.Input />
      <Command.List>
        <Command.Empty>No results found.</Command.Empty>

        <Command.Group heading="Letters">
          <Command.Item>a</Command.Item>
          <Command.Item>b</Command.Item>
          <Command.Separator />
          <Command.Item>c</Command.Item>
        </Command.Group>

        <Command.Item>Apple</Command.Item>
      </Command.List>
    </Command.Dialog>
  )
}
```

## Parts

All parts forward props, including `ref`, to the appropriate element.

### Command `[cmdk-root]`

Render this to show the command menu inline, or use [Dialog](#dialog) to render in a elevated context.

### Dialog `[cmdk-dialog]` `[cmdk-overlay]`

Props are forwarded to [Command](#command). Composes Radix UI's Dialog component. The overlay is always rendered. See the [Radix Documentation](https://www.radix-ui.com/docs/primitives/components/dialog) for more information. Can be controlled with the `open` and `onOpenChange` props.

```tsx
const [open, setOpen] = React.useState(false)

return (
  <Command.Dialog open={open} onOpenChange={setOpen}>
    ...
  </Command.Dialog>
)
```

### Input `[cmdk-input]`

All props are forwarded to the underlying `input` element. Can be controlled with the `value` and `onValueChange` props.

```tsx
const [search, setSearch] = React.useState('')

return <Command.Input value={search} onValueChange={setSearch} />
```

### List `[cmdk-list]`

Contains items and groups. Animate height using the `--cmdk-list-height` CSS variable.

```css
[cmdk-list] {
  min-height: 300px;
  height: var(--cmdk-list-height);
  max-height: 500px;
  transition: height 100ms ease;
}
```

To scroll item into view earlier near the edges of the viewport, use scroll-padding:

```css
[cmdk-list] {
  scroll-padding-block-start: 8px;
  scroll-padding-block-end: 8px;
}
```

### Item `[cmdk-item]` `[aria-disabled?]` `[aria-selected?]`

Item that becomes active on pointer enter. You should provide a unique `value` for each item, but it will be automatically inferred from the `.textContent`.

```tsx
<Command.Item
  onSelect={(value) => console.log('Selected', value)}
  // Value is implicity "apple" because of the provided text content
>
  Apple
</Command.Item>
```

### Group `[cmdk-group]`

Groups items together with the given `heading` (`[cmdk-group-heading]`).

```tsx
<Command.Group heading="Fruit">
  <Command.Item>Apple</Command.Item>
</Command.Group>
```

### Separator `[cmdk-separator]`

Visible when the search query is empty or `alwaysRender` is true, hidden otherwise.

### Empty `[cmdk-empty]`

Automatically renders when there are no results for the search query.

### Loading `[cmdk-loading]`

You should conditionally render this with `progress` while loading asynchronous items.

```tsx
const [loading, setLoading] = React.useState(false)

return <Command.List>{loading && <Command.Loading>Hang on…</Command.Loading>}</Command.List>
```

### `useCmdk(state => state.selectedField)`

Hook that composes [`useSyncExternalStore`](https://reactjs.org/docs/hooks-reference.html#usesyncexternalstore). Pass a function that returns a slice of the command menu state to re-render when that slice changes. This hook is provided for advanced use cases and should not be commonly used.

A good use case would be to render a more detailed empty state, like so:

```tsx
const search = useCmdk((state) => state.search)
return <Command.Empty>No results found for "{search}".</Command.Empty>
```

## Examples

Code snippets for common use cases.

### Pages

Often selecting one item should navigate deeper, with a more refined set of items. We call these sets "pages", and they can be implemented with simple state:

```tsx
const ref = React.useRef(null)
const [open, setOpen] = React.useState(false)
const [search, setSearch] = React.useState('')
const [pages, setPages] = React.useState([])
const page = pages[pages.length - 1]

React.useEffect(() => {
  function down(e) {
    // Escape goes to previous page
    // Backspaces goes to previous page when search is empty
    if (e.key === 'Escape' || (e.key === 'Backspace' && !search)) {
      e.preventDefault()
      setPages((pages) => pages.slice(0, -1))
    }
  }

  const element = ref.current
  element.addEventListener('keydown', down)
  return () => element.removeEventListener('keydown', down)
}, [search])

return (
  // TODO: use `onKeyDown` here instead?
  <Command ref={ref}>
    <Command.Input />
    <Command.List>
      {!page && (
        <>
          <Command.Item onSelect={() => setPages([...pages, 'projects'])}>Search projects…</Command.Item>
          <Command.Item onSelect={() => setPages([...pages, 'teams'])}>Join a team…</Command.Item>
        </>
      )}

      {page === 'projects' && (
        <>
          <Command.Item>Project A</Command.Item>
          <Command.Item>Project B</Command.Item>
        </>
      )}

      {page === 'teams' && (
        <>
          <Command.Item>Team 1</Command.Item>
          <Command.Item>Team 2</Command.Item>
        </>
      )}
    </Command.List>
  </Command>
)
```

### Show sub-items when searching

If your items have nested sub-items that you only want to reveal when searching, render based on the search state:

```tsx
const SubItem = (props) => {
  const search = useCmdk((state) => state.search)
  if (!search) return null
  return <Command.Item {...props} />
}

return (
  <Command>
    <Command.Input />
    <Command.List>
      <Command.Item>Change theme…</Command.Item>
      <SubItem>Change theme to dark</SubItem>
      <SubItem>Change theme to light</SubItem>
    </Command.List>
  </Command>
)
```

### Vim style keybindings

Currently not possible.

## FAQ

**Accessible?** Yes. Labeling, aria attributes, and DOM ordering tested with Voice Over and Chrome DevTools. [Dialog](#dialog) composes an accessible Dialog implementation.

**Virtualization?** No. Good performance up to 2,000-3,000 items, though. Read below to bring your own.

**Filter/sort items manually?** Yes. Pass `shouldFilter={false}` to [Command](#command). Better memory usage and performance. Bring your own virtualization this way.

**React 18 safe?** Yes, required. Uses React 18 hooks like `useId` and `useSyncExternalStore`.

**Unstyled?** Yes, use the listed CSS selectors.

**Hydration mismatch?** No, likely a bug in your code. Ensure the `open` prop to `Command.Dialog` is `false` on the server.

**React strict mode safe?** Yes. Open an issue if you notice an issue.

**Weird/wrong behavior?** Make sure your `Command.Item` has a `key` and unique `value`.

**Concurrent mode safe?** Maybe, but concurrent mode is not yet real. Uses risky approaches like manual DOM ordering.

**React server component?** No, it's a client component.

**Listen for ⌘K automatically?** No, do it yourself to have full control over keybind context.

## History

Written in 2019 by Paco ([@pacocoursey](https://twitter.com/pacocoursey)) to see if a composable combobox API was possible. Used for the Vercel command menu and autocomplete by Rauno ([@raunofreiberg](https://twitter.com/raunofreiberg)) in 2020. Re-written independently in 2022 with a simpler and more performant approach. Ideas and help from Shu ([@shuding\_](https://twitter.com/shuding_)).

[use-descendants](https://github.com/pacocoursey/use-descendants) was extracted from the 2019 version.
