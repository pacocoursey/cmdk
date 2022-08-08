# Architecture

> Document is a work in progress!

⌘K is born from a simple constraint: can you write a combobox with filtering and sorting using the [compound component](https://kentcdodds.com/blog/compound-components-with-react-hooks) approach? We didn't want to render items manually from an array:

```tsx
// No
<>
  {items.map((item) => {
    return <div>{item}</div>
  })}
</>
```

We didn't want to provide a render prop:

```tsx
// No
onItemRender={({ item }) => {
  return <div>{item}</div>
}}
```

Instead, we wanted to render components:

```tsx
// Yes
<Item>My item</Item>
```

Especially, we wanted full component composition:

```tsx
// YES
<>
  <BlogItems />
  {staticItems}
</>
```

Compound components are natural and easy to write. A few months after exploring this library, we were pleased to see [Radix UI](https://www.radix-ui.com) released using this exact approach of component structure – setting the standard for ease of use and composability.

However, for a combobox, it is a terrible, terrible constraint that we've spent 2 years fighting.

## Approach

⌘K always keeps every item and group rendered in the React tree. Each item and group adds or removes itself from the DOM based on the search input. The DOM is authoritative. Item selection order is based on the DOM order, which is based on the React render order, which the consumer provides.

### Discarded approach

We did not use `React.Children` iteration because it will not support component composition. There is no way to "peek inside" the items contained within `<BlogItems />`, so those items cannot be filtered.

We did not use an object-based data array for each item, like `{ name: "Logout", action: () => logout() }` because this is strict and limiting. In reality, the interface of those objects grows with edge-cases, like `image`, `detailedSubTitle`, `hideWhenRootSearch`, etc. We prefer that you have full control of item rendering, including icons, keyboard shortcuts, and styling. Don't want an item shown? Don't render it. Only want to show an item under condition xyz? Render it.

We did not use a render prop because they are an inelegant pattern and quickly fall to long, centralised if-else logic chains. For example, if you want a fancy sparkle rainbow item, you need a new if statement to render that item specially.

The original approach for tracking which item was selected was to keep an index 0..n. But it's impossible to know which Item is in which position within the React tree when React Strict Mode is enabled, because `useEffect` runs twice and `useRef` cannot be used for stable IDs. <sup>This may be possible with `useId`, now.</sup> We created [use-descendants](https://github.com/pacocoursey/use-descendants) to track relative component indeces, but abandoned it because it could not work in Strict Mode, and will be incompatible with upcoming concurrent mode. Now, we track the selected item with its value, because it is stable across item mounts and unmounts.

## Example

```tsx
<Input value="b" />
<List>
  <Item>A</Item>
  <Item>B</Item>
</List>
```

The "A" item should not be shown! But we cannot remove it from the React tree, because the user controls it. In most cases, this is easy because the rendered items is sourced from a backing data array:

```tsx
<>
  {['A', 'B'].map((item) => {
    if (matches(item, search)) {
      return <Item>{item}</Item>
    }
  })}
</>
```

But in our case, the item will remain in the React tree and just be removed from the DOM:

```tsx
<List>
  {/* returns `null`, no DOM created */}
  <Item>A</Item>
  <Item>B</Item>
</List>
```

## Performance

This is more expensive memory wise, because if there are 2,000 items but the list is filtered to only 2 items, we still allocate memory for 2,000 instances of the Item component. But it's our only option! Thankfully we can still keep the DOM size to 2 items.

## Groups

Item mount informs both the root and the parent group, which keeps track of items within it. Each group informs the root.
