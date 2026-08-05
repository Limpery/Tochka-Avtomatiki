import { useFormik } from 'formik'
import { Segment } from '../../components/Segment'
import { Input } from '../../components/Input'
import { Textarea } from '../../components/Textarea'

export const NewMemPage = () => {
  const formik = useFormik({
    initialValues: {
      name: '',
      meme: '',
      description: '',
      text: '',
    },
    onSubmit: (values) => {
      // eslint-disable-next-line no-console
      console.log('Submitted', values)
    },
  })

  return (
    <Segment title="New Mem">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          formik.handleSubmit()
        }}
      >
        <Input name="name" label="Name" formik={formik} />
        <Input name="meme" label="Meme" formik={formik} />
        <Input name="description" label="Description" formik={formik} />
        <Textarea name="text" label="Text" formik={formik} />

        <button type="submit">Create mem</button>
      </form>
    </Segment>
  )
}
