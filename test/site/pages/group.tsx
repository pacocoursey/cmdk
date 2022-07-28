import { Command } from 'cmdk'
import * as React from 'react'

const Page = () => {
  return (
    <div>
      <Command>
        <Command.Input placeholder="Search…" />
        <Command.List>
          <Command.Empty>No results.</Command.Empty>
          <Command.Group heading="Animals">
            <Command.Item>Giraffe</Command.Item>
            <Command.Item>Chicken</Command.Item>
          </Command.Group>

          <Command.Group heading="Letters">
            <Command.Item>A</Command.Item>
            <Command.Item>B</Command.Item>
            <Command.Item>Z</Command.Item>
          </Command.Group>
        </Command.List>
      </Command>
    </div>
  )
}

export default Page
