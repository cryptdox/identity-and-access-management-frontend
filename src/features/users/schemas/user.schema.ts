import * as yup from 'yup'

export const createUserSchema = yup.object({
  username: yup.string().trim().required('Username is required'),
  email: yup.string().trim().email('Enter a valid email').required('Email is required'),
  password: yup.string().min(8, 'At least 8 characters').optional(),
  enabled: yup.boolean().default(true),
})

export type CreateUserFormValues = yup.InferType<typeof createUserSchema>
