export const App = () => {
  const mems = [
    {
      id: 1,
      title: 'Mem 1',
      description: 'Description 1 ...',
    },
    {
      id: 2,
      title: 'Mem 2',
      description: 'Description 2 ...',
    },
    {
      id: 3,
      title: 'Mem 3',
      description: 'Description 3 ...',
    },
    {
      id: 4,
      title: 'Mem 4',
      description: 'Description 4 ...',
    },
    {
      id: 5,
      title: 'Mem 5',
      description: 'Description 5 ...',
    },
  ]
  return (
    <div>
      <h1>MemMemory</h1>
      <div>
        {mems.map((mem) => {
          return (
            <div key={mem.id}>
              <h2>{mem.title}</h2>
              <p>{mem.description}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default App
