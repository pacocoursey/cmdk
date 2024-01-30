import * as React from 'react'
import { Command } from 'cmdk'
import * as Portal from '@radix-ui/react-portal'

const Page = () => {
  const [render, setRender] = React.useState(false)
  React.useEffect(() => setRender(true), [])
  if (!render) return null

  return (
    <div>
      <Command className="root">
        <Command.Input placeholder="Search…" className="input" />

        <Portal.Root data-portal="true">
          <Command.List className="list">
            <Command.Item className="item">Apple</Command.Item>
            <Command.Item className="item">Banana</Command.Item>
            <Command.Item className="item">Cherry</Command.Item>
            <Command.Item className="item">Dragonfruit</Command.Item>
            <Command.Item className="item">Elderberry</Command.Item>
            <Command.Item className="item">Fig</Command.Item>
            <Command.Item className="item">Grape</Command.Item>
            <Command.Item className="item">Honeydew</Command.Item>
            <Command.Item className="item">Jackfruit</Command.Item>
            <Command.Item className="item">Kiwi</Command.Item>
            <Command.Item className="item">Lemon</Command.Item>
            <Command.Item className="item">Mango</Command.Item>
            <Command.Item className="item">Nectarine</Command.Item>
            <Command.Item className="item">Orange</Command.Item>
            <Command.Item className="item">Papaya</Command.Item>
            <Command.Item className="item">Quince</Command.Item>
            <Command.Item className="item">Raspberry</Command.Item>
            <Command.Item className="item">Strawberry</Command.Item>
            <Command.Item className="item">Tangerine</Command.Item>
            <Command.Item className="item">Ugli</Command.Item>
            <Command.Item className="item">Watermelon</Command.Item>
            <Command.Item className="item">Xigua</Command.Item>
            <Command.Item className="item">Yuzu</Command.Item>
            <Command.Item className="item">Zucchini</Command.Item>
          </Command.List>
        </Portal.Root>
      </Command>
    </div>
  )
}

export default Page
