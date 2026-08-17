import * as yup from 'yup'

export const roleSchema = yup.object({
  clientIdInternal: yup.string().required('Client is required'),
  name: yup.string().trim().required('Role name is required'),
  description: yup.string().trim().optional(),
})

export type RoleFormValues = yup.InferType<typeof roleSchema>
