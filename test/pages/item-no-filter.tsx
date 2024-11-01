import { Command } from 'cmdk'
import * as React from 'react'

const Page = () => {
  return (
    <div>
      <Command>
        <Command.Input placeholder="Search…" />
        <Command.List>
          <Command.Empty>No results.</Command.Empty>
          <Command.Item>Item A</Command.Item>
          <Command.Item>Item B</Command.Item>
          <Command.Item shouldFilter={false}>Item C</Command.Item>
        </Command.List>
      </Command>
    </div>
  )
}

export default Page
