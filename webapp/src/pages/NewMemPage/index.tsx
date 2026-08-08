import { zCreateMemTrpcInput } from '@memmemory/backend/src/router/createMem/input'
import { useFormik } from 'formik'
import { Segment } from '../../components/Segment'
import { Input } from '../../components/Input'
import { Textarea } from '../../components/Textarea'
import { withZodSchema } from 'formik-validator-zod'
import { trpc } from '../../lib/trpc'

export const NewMemPage = () => {
  const createMem = trpc.createMem.useMutation()
  const formik = useFormik({
    initialValues: {
      name: '',
      title: '',
      description: '',
      text: '',
    },
    validate: withZodSchema(zCreateMemTrpcInput),
    onSubmit: async (values) => {
      await createMem.mutateAsync(values)
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
        <Input name="title" label="Title" formik={formik} />
        <Input name="description" label="Description" formik={formik} />
        <Textarea name="text" label="Text" formik={formik} />
        {!formik.isValid && !!formik.submitCount && <div style={{ color: 'red' }}>Some fields are invalid</div>}

        <button type="submit">Create mem</button>
      </form>
    </Segment>
  )
}
