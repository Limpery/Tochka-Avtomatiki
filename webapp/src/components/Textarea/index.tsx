import type { FormikProps } from 'formik'

export const Textarea = ({ label, name, formik }: { name: string; label: string; formik: FormikProps<any> }) => {
  const value = formik.values[name]
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  const error = formik.errors[name] as string
  const touched = formik.touched[name]
  return (
    <div style={{ marginBottom: 10 }}>
      <label htmlFor={name}>{label}</label>
      <br />
      <textarea
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
      {!!touched && !!error && <div style={{ color: 'red' }}>{error}</div>}
    </div>
  )
}
