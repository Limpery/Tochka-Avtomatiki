import cn from 'classnames'
import css from './index.module.scss'

// Почему отдельный Card: единый контейнер для списков, форм и KPI —
// тень и скругления правятся в одном месте, а не в инлайн-стилях страниц.
export const Card = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn(css.card, className)}>{children}</div>
)
