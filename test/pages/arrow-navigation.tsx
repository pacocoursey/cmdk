import { Command } from 'cmdk'
import { useRouter } from 'next/router'
import * as React from 'react'

const Page = () => {
  const {
    query: { type },
  } = useRouter()

  const arrowNavigationType = type as 'vertical' | 'horizontal' | 'both'

  return (
    <Command arrowNavigationType={arrowNavigationType}>
      <Command.Input />
      <Command.List>
        <Command.Empty>No results.</Command.Empty>

        <Command.Item value="first">First Item</Command.Item>

        <Command.Group heading="Group 1">
          <Command.Item>Item A</Command.Item>
          <Command.Item>Item B</Command.Item>
          <Command.Item>Item C</Command.Item>
        </Command.Group>

        <Command.Group heading="Group 2">
          <Command.Item>Item 1</Command.Item>
          <Command.Item>Item 2</Command.Item>
          <Command.Item disabled>Disabled Item</Command.Item>
          <Command.Item>Item 3</Command.Item>
        </Command.Group>

        <Command.Item value="last">Last Item</Command.Item>
      </Command.List>
    </Command>
  )
}

export default Page
