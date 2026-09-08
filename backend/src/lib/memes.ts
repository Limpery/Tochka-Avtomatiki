import _ from 'lodash'

export const memes = _.times(100, (i) => ({
  name: `mem-name-${i}`,
  title: `Mem ${i}`,
  description: `Description ${i} ...`,
  text: _.times(100, (j) => `<p>Text paragraph ${j} of mem ${i}</p>`).join(''),
}))
