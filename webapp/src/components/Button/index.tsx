import cn from 'classnames'
import css from './index.module.scss'

export const Button = ({
  children,
  loading = false,
  onClick,
  disabled,
  type = 'button',
}: {
  children: React.ReactNode
  loading?: boolean
  onClick?: () => void | Promise<void>
  disabled?: boolean
  type?: 'button' | 'submit'
}) => {
  const isDisabled = loading || disabled
  return (
    <button
      className={cn({ [css.button]: true, [css.disabled]: isDisabled })}
      type={type}
      disabled={isDisabled}
      onClick={() => {
        void onClick?.()
      }}
    >
      {loading ? 'Submitting...' : children}
    </button>
  )
}
