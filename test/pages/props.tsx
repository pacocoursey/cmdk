import { Command } from 'cmdk'
import { useRouter } from 'next/router'
import * as React from 'react'

const Page = () => {
  const [value, setValue] = React.useState('ant')
  const [search, setSearch] = React.useState('')
  const [shouldFilter, setShouldFilter] = React.useState(true)
  const [customFilter, setCustomFilter] = React.useState(false)
  const router = useRouter()

  React.useEffect(() => {
    if (router.isReady) {
      setShouldFilter(router.query.shouldFilter === 'false' ? false : true)
      setCustomFilter(router.query.customFilter === 'true' ? true : false)
      setValue((router.query.initialValue as string) ?? 'ant')
    }
  }, [router.isReady])

  return (
    <div>
      <div data-testid="value">{value}</div>
      <div data-testid="search">{search}</div>

      <button data-testid="controlledValue" onClick={() => setValue('anteater')}>
        Change value
      </button>
      <button data-testid="controlledSearch" onClick={() => setSearch('eat')}>
        Change search value
      </button>

      <Command
        shouldFilter={shouldFilter}
        value={value}
        onValueChange={setValue}
        filter={
          customFilter
            ? (item: string | undefined, search: string | undefined) => {
                console.log(item, search)
                if (!search || !item) return 1
                return item.endsWith(search) ? 1 : 0
              }
            : undefined
        }
      >
        <Command.Input placeholder="Search…" value={search} onValueChange={setSearch} />
        <Command.List>
          <Command.Item>ant</Command.Item>
          <Command.Item>anteater</Command.Item>
        </Command.List>
      </Command>
    </div>
  )
}

export default Page
