import * as yup from 'yup'

export const createRealmSchema = yup.object({
  name: yup.string().trim().required('Realm name is required'),
  description: yup.string().trim().optional(),
  superAdmin: yup.object({
    username: yup.string().trim().required('Username is required'),
    email: yup.string().trim().email('Enter a valid email').required('Email is required'),
    password: yup.string().min(8, 'At least 8 characters').required('Password is required'),
  }),
})

export type CreateRealmFormValues = yup.InferType<typeof createRealmSchema>

export const updateRealmSchema = yup.object({
  name: yup.string().trim().required('Realm name is required'),
  enabled: yup.boolean().default(true),
})

export type UpdateRealmFormValues = yup.InferType<typeof updateRealmSchema>
