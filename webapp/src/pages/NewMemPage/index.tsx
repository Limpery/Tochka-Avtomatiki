import { zCreateMemTrpcInput } from '@memmemory/backend/src/router/createMem/input'
import { useFormik } from 'formik'
import { Segment } from '../../components/Segment'
import { Input } from '../../components/Input'
import { Textarea } from '../../components/Textarea'
import { withZodSchema } from 'formik-validator-zod'
import { trpc } from '../../lib/trpc'
import { useState } from 'react'

export const NewMemPage = () => {
  const [succesMessageVisible, setSuccessMessageVisible] = useState(false)
  const [submittingError, setSubmittingError] = useState<string | null>(null)
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
      try {
        await createMem.mutateAsync(values)
        formik.resetForm()
        setSuccessMessageVisible(true)
        setTimeout(() => {
          setSuccessMessageVisible(false)
        }, 3000)
      } catch (error: any) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        setSubmittingError(error.message)
        setTimeout(() => {
          setSubmittingError(null)
        }, 3000)
      }
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
        {!!submittingError && <div style={{ color: 'red' }}>Error: {submittingError}</div>}
        {succesMessageVisible && <div style={{ color: 'green' }}>Mem created</div>}
        <button type="submit" disabled={formik.isSubmitting}>
          {formik.isSubmitting ? 'Submitting...' : 'Create Mem'}
        </button>
      </form>
    </Segment>
  )
}
