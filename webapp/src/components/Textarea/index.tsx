import cn from 'classnames'
import type { FormikProps } from 'formik'
import css from './index.module.scss'

export const Textarea = ({ name, label, formik }: { name: string; label: string; formik: FormikProps<any> }) => {
  const value = formik.values[name]
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  const error = formik.errors[name] as string | undefined
  const touched = formik.touched[name]
  const invalid = !!touched && !!error
  const disabled = formik.isSubmitting
  return (
    <div className={cn({ [css.field]: true, [css.disabled]: disabled })}>
      <label className={css.label} htmlFor={name}>
        {label}
      </label>
      <textarea
        className={cn({
          [css.input]: true,
          [css.invalid]: invalid,
        })}
        onChange={(e) => {
          void formik.setFieldValue(name, e.target.value)
        }}
        value={value}
        id={name}
        disabled={formik.isSubmitting}
      />
      {invalid && <div className={css.error}>{error}</div>}
    </div>
  )
}