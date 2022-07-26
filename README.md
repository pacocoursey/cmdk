# ⌘K

Composable command palette React component. You provide the items and it filters and sorts the results for you.

```bash
$ yarn add cmdk
```

Usage:

```tsx
<Command.Dialog open={open} onOpenChange={setOpen}>
  <Command.Input />
  <Command.List>
    {loading && <Command.Loading>Hang on…</Command.Loading>}
    <Command.Empty>No results found.</Command.Empty>

    <Command.Group heading="Letters">
      <Command.Item>a</Command.Item>
      <Command.Item>b</Command.Item>
      <Command.Separator />
      <Command.Item>c</Command.Item>
    </Command.Group>

    <Command.Item>Ungrouped</Command.Item>
  </Command.List>
</Command.Dialog>
```

To render inline, replace `Command.Dialog` with just `Command`. ⌘K supports a fully composable API, meaning you can wrap items in other components or even static JSX:

```tsx
<Command.List>
  <DocsItems />
  <UserItems />
  {settingsItems}
</Command.List>
```

## Parts

### Command `[cmdk-root]`

Render this to show the command menu inline, or use [Dialog](#dialog) to render in a elevated context.

### Dialog `[cmdk-dialog]` `[cmdk-overlay]`

Props are forwarded to [Command](#command). Composes Radix UI's Dialog component. The overlay is always rendered. See the [Radix Documentation](https://www.radix-ui.com/docs/primitives/components/dialog) for more information.

### Popover `[cmdk-popover]`

Props are forwarded to [Command](#command). Composes Radix UI's Popover component. The popover is always portalled. See the [Radix Documentation](https://www.radix-ui.com/docs/primitives/components/popover) for more information.

### Trigger `[cmdk-trigger]`

Composes Radix UI's Popover Trigger component. See the [Radix Documentation](https://www.radix-ui.com/docs/primitives/components/popover#trigger) for more information.

### Input `[cmdk-input]`

All props are forwarded to the underlying `input` element.

### List `[cmdk-list]`

Animate height using the `--cmdk-list-height` CSS variable.

### Item `[cmdk-item]` `[aria-disabled?]` `[aria-selected?]`

Item that becomes active on pointer enter.

### Group `[cmdk-group]`

Groups items together with the given `heading` (`[cmdk-group-heading]`).

### Separator `[cmdk-separator]`

Visible when the search query is empty or `alwaysRender` is true, hidden otherwise.

### Empty `[cmdk-empty]`

Automatically renders when there are no results for the search query.

### Loading `[cmdk-loading]`

You should conditionally render this with `progress` while loading asynchronous items.

## FAQ

**Virtualization?** No. Good performance up to 2,000-3,000 items, though.

**Filter/sort items manually?** Yes. Pass `filter={false}` to [Command](#command). Better performance and bring your own virtualization this way.

**React 18 safe?** Yes, as far as I can tell. Uses React 18 features like `useId` and `startTransition`.

**Concurrent mode safe?** Probably not. It uses risky refs and manual DOM ordering.

**Server component?** No, it's a client component.

**Unstyled?** Yes, use the listed CSS selectors.

**Hydration mismatch?** Yes. Only render when mounted on client, or use [Dialog](#dialog) which handles this automatically.

**React strict mode safe?** Yes, as far as I can tell. Proceed with caution.

**Weird/wrong behavior?** Make sure your `Command.Item` have a `key` and unique `value`.

## History

Written in 2019 by Paco ([@pacocoursey](https://twitter.com/pacocoursey)) to see if a composable combobox API was possible. Used for the Vercel command menu and autocomplete by Rauno ([@raunofreiberg](https://twitter.com/raunofreiberg)) in 2020. Re-written independently in 2022 with a simpler and more performant approach. Ideas from Shu ([@shuding\_](https://twitter.com/shuding_)).

[use-descendants](https://github.com/pacocoursey/use-descendants) was extracted from the 2019 version.
