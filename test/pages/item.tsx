import { Command } from 'cmdk'
import * as React from 'react'

const Page = () => {
  const [unmount, setUnmount] = React.useState(false)
  const [mount, setMount] = React.useState(false)
  const [many, setMany] = React.useState(false)
  const [forceMount, setForceMount] = React.useState(false)

  return (
    <div>
      <button data-testid="mount" onClick={() => setMount(!mount)}>
        Toggle item B
      </button>

      <button data-testid="unmount" onClick={() => setUnmount(!unmount)}>
        Toggle item A
      </button>

      <button data-testid="many" onClick={() => setMany(!many)}>
        Toggle many items
      </button>

      <button data-testid="forceMount" onClick={() => setForceMount(!forceMount)}>
        Force mount item A
      </button>

      <Command>
        <Command.Input placeholder="Search…" />
        <Command.List>
          <Command.Empty>No results.</Command.Empty>
          {!unmount && <Command.Item forceMount={forceMount}>A</Command.Item>}
          {many && (
            <>
              <Command.Item>1</Command.Item>
              <Command.Item>2</Command.Item>
              <Command.Item>3</Command.Item>
            </>
          )}
          {mount && <Command.Item>B</Command.Item>}
        </Command.List>
      </Command>
    </div>
  )
}

export default Page
