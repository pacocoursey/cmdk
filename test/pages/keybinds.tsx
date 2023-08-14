import { Command } from 'cmdk'
import { useRouter } from 'next/router'
import * as React from 'react'

const Page = () => {
  const {
    query: { noVim },
  } = useRouter()
  return (
    <div>
      <Command vimBindings={!noVim}>
        <Command.Input />
        <Command.List>
          <Command.Empty>No results.</Command.Empty>

          <Command.Item value="disabled" disabled>
            Disabled
          </Command.Item>

          <Command.Item value="first">First</Command.Item>

          <Command.Group heading="Letters">
            <Command.Item>A</Command.Item>
            <Command.Item>B</Command.Item>
            <Command.Item>Z</Command.Item>
          </Command.Group>

          <Command.Group heading="Fruits">
            <Command.Item>Apple</Command.Item>
            <Command.Item>Banana</Command.Item>
            <Command.Item>Orange</Command.Item>
            <Command.Item disabled>Dragon Fruit</Command.Item>
            <Command.Item>Pear</Command.Item>
          </Command.Group>

          <Command.Item value="last">Last</Command.Item>

          <Command.Item value="disabled-3" disabled>
            Disabled 3
          </Command.Item>
        </Command.List>
      </Command>
    </div>
  )
}

export default Page
