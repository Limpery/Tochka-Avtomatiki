import { zCreateRobotTrpcInput } from '@tochka-avtomatiki/backend/src/router/createRobot/input'
import { useFormik } from 'formik'
import { Segment } from '../../components/Segment'
import { Input } from '../../components/Input'
import { Textarea } from '../../components/Textarea'
import { withZodSchema } from 'formik-validator-zod'
import { trpc } from '../../lib/trpc'
import { useState } from 'react'
import { Alert } from '../../components/Alert'
import { Button } from '../../components/Button'
import { FormItems } from '../../components/FormItems'

export const NewRobotPage = () => {
  const [succesMessageVisible, setSuccessMessageVisible] = useState(false)
  const [submittingError, setSubmittingError] = useState<string | null>(null)
  const createRobot = trpc.createRobot.useMutation()
  const formik = useFormik({
    initialValues: {
      name: '',
      title: '',
      description: '',
      text: '',
    },
    validate: withZodSchema(zCreateRobotTrpcInput),
    onSubmit: async (values) => {
      try {
        await createRobot.mutateAsync(values)
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
    <Segment title="New Robot">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          formik.handleSubmit()
        }}
      >
        <FormItems>
          <Input name="name" label="Name" formik={formik} />
          <Input name="title" label="Title" formik={formik} />
          <Input name="description" label="Description" formik={formik} maxWidth={500} />
          <Textarea name="text" label="Text" formik={formik} />
          {!formik.isValid && !!formik.submitCount && <div style={{ color: 'red' }}>Some fields are invalid</div>}
          {!!submittingError && <Alert color={'red'}>Error: {submittingError}</Alert>}
          {succesMessageVisible && <Alert color={'green'}>Robot created</Alert>}
          <Button loading={formik.isSubmitting}>Create Robot </Button>
        </FormItems>
      </form>
    </Segment>
  )
}
