import * as yup from 'yup'

export const createClientSchema = yup.object({
  clientId: yup.string().trim().required('Client ID is required'),
  name: yup.string().trim().optional(),
  type: yup.mixed<'PUBLIC' | 'CONFIDENTIAL'>().oneOf(['PUBLIC', 'CONFIDENTIAL']).required(),
  enabled: yup.boolean().default(true),
})

export type CreateClientFormValues = yup.InferType<typeof createClientSchema>
