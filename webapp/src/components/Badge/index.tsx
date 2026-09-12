import cn from 'classnames'
import css from './index.module.scss'

type Tone = 'info' | 'success' | 'warning' | 'accent' | 'muted'

// Почему Badge компонентам, а не строками: рейтинг, совместимость и теги
// встречаются в каталоге, деталке и сравнении — тон задаётся семантикой.
export const Badge = ({ tone = 'muted', children }: { tone?: Tone; children: React.ReactNode }) => (
  <span className={cn(css.badge, css[tone])}>{children}</span>
)
