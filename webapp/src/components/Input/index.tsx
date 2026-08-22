import cn from 'classnames'
import type { FormikProps } from 'formik'
import css from './index.module.scss'

export const Input = ({
  label,
  name,
  formik,
  maxWidth,
}: {
  name: string
  label: string
  formik: FormikProps<any>
  maxWidth?: number
}) => {
  const value = formik.values[name]
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  const error = formik.errors[name] as string
  const touched = formik.touched[name]
  const disabled = formik.isSubmitting
  const invalid = !!touched && !!error
  return (
    <div className={cn({ [css.field]: true, [css.disabled]: disabled })}>
      <label className={css.label} htmlFor={name}>
        {label}
      </label>
      <input
        className={cn({ [css.input]: true, [css.invalid]: invalid })}
        style={{ maxWidth }}
        type="text"
        onChange={(e) => {
          void formik.setFieldValue(name, e.target.value)
        }}
        onBlur={() => {
          void formik.setFieldTouched(name)
        }}
        value={value}
        name={name}
        id={name}
        disabled={formik.isSubmitting}
      />
      {!!touched && !!error && <div className={css.error}>{error}</div>}
    </div>
  )
}
