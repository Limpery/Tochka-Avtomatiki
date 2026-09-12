import css from './index.module.scss'

// Почему presentational Field: страницы используют useState, а не formik,
// общий лейбл+инпут убирает дубли инлайн-стилей без смены подхода к формам.
export const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <label className={css.field}>
    <span className={css.label}>{label}</span>
    {children}
  </label>
)
