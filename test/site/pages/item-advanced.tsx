import { Command } from 'cmdk'
import * as React from 'react'

const Page = () => {
  const [count, setCount] = React.useState(0)

  return (
    <div>
      <button data-testid="increment" onClick={() => setCount((c) => c + 1)}>
        Increment count
      </button>

      <Command>
        <Command.Input placeholder="Search…" />
        <Command.List>
          <Command.Empty>No results.</Command.Empty>
          <Command.Item>Item A {count}</Command.Item>
          <Command.Item>Item B {count}</Command.Item>
        </Command.List>
      </Command>
    </div>
  )
}

export default Page
