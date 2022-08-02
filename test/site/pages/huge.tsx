import { Command } from 'cmdk'
import * as React from 'react'

const items = new Array(1000).fill(0)

const Page = () => {
  return (
    <div>
      <React.Profiler
        id="huge-command"
        onRender={(id, phase, actualDuration, baseDuration, startTime, commitTime, interactions) => {
          console.log({ phase, actualDuration, baseDuration })
        }}
      >
        <Command>
          <Command.Input placeholder="Search…" />
          <Command.List>
            {items.map((_, i) => {
              return <Item key={`item-${i}`} />
            })}
          </Command.List>
        </Command>
      </React.Profiler>
    </div>
  )
}

const Item = () => {
  const id = React.useId()

  return <Command.Item key={id}>Item {id}</Command.Item>
}

export default Page
