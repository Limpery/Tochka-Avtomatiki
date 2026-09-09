const getRouteParams = <T extends Record<string, boolean>>(object: T) =>
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  Object.keys(object).reduce((acc, key) => ({ ...acc, [key]: `:${key}` }), {}) as Record<keyof T, string>

export const getAllRobotsRoute = () => '/'

export const viewRobotRouteParams = getRouteParams({ nameRobot: true })
export type ViewRobotRouteParams = typeof viewRobotRouteParams
export const getViewRobotRoute = (nameRobot: string) => `/robots/${nameRobot}`

export const getNewRobotRoute = () => '/robots/new'
