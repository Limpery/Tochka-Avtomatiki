import { useParams } from 'react-router-dom'
import type { ViewMemeRouteParams } from '../../lib/routes'
export const ViewMemePage = () => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  const { nameMem } = useParams() as ViewMemeRouteParams
  return (
  <div>
    <h1>{nameMem}</h1>
    <p>Mem 1 content</p>
    <div>
      <p>Text paragraph 1 of mem 1 ...</p>
      <p>Text paragraph 2 of mem 1 ...</p>
      <p>Text paragraph 3 of mem 1 ...</p>
    </div>
    
  </div>)
}