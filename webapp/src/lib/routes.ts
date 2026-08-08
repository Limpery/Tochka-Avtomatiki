const getRouteParams = <T extends Record<string, boolean>>(object: T) =>
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  Object.keys(object).reduce((acc, key) => ({ ...acc, [key]: `:${key}` }), {}) as Record<keyof T, string>

export const getAllMemesRoute = () => '/'

export const viewMemeRouteParams = getRouteParams({ nameMem: true })
export type ViewMemeRouteParams = typeof viewMemeRouteParams
export const getViewMemeRoute = (nameMem: string) => `/memes/${nameMem}`

export const getNewMemeRoute = () => '/memes/new'
