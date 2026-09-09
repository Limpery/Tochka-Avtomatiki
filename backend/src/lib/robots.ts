import _ from 'lodash'

export const robots = _.times(100, (i) => ({
  name: `robot-name-${i}`,
  title: `Robot ${i}`,
  description: `Description ${i} ...`,
  text: _.times(100, (j) => `<p>Text paragraph ${j} of robot ${i}</p>`).join(''),
}))
