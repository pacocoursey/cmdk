import * as React from 'react'
import { Command } from 'cmdk'
import { useTheme } from 'next-themes'

// Alphabet
const list = `ABCDEFGHIJKLMNOPQRSTUVWXYZ`.split('')
const list2 = ['Apple', 'Banana', 'Cherry', 'Date', 'Elderberry', 'Fig', 'Grape', 'Honeydew', 'Icaco', 'Jujube']

const Asset = () => {
  return (
    <div
      style={{
        width: 100,
        height: 100,
        borderRadius: 4,
        background: 'red',
        flexShrink: 0,
      }}
    />
  )
}

export function RaycastCMDKGrid() {
  const [value, setValue] = React.useState('linear')
  const inputRef = React.useRef<HTMLInputElement | null>(null)
  const listRef = React.useRef(null)

  React.useEffect(() => {
    inputRef?.current?.focus()
  }, [])

  return (
    <div className="raycast-grid">
      <Command value={value} onValueChange={(v) => setValue(v)}>
        <div cmdk-raycast-top-shine="" />
        <Command.Input ref={inputRef} autoFocus placeholder="Search for apps and commands..." />
        <hr cmdk-raycast-loader="" />
        <Command.Grid columns={5} ref={listRef}>
          <Command.Empty>No results found.</Command.Empty>
          <Command.Group heading="Alphabet">
            {list.map((item) => {
              return (
                <Command.Item key={item} value={item}>
                  <Asset />
                  <span>{item}</span>
                </Command.Item>
              )
            })}
          </Command.Group>

          <Command.Group heading="Fruits">
            {list2.map((item) => {
              return (
                <Command.Item key={item} value={item}>
                  <Asset />
                  <span>{item}</span>
                </Command.Item>
              )
            })}
          </Command.Group>
        </Command.Grid>
      </Command>
    </div>
  )
}
