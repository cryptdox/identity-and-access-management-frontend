import * as yup from 'yup'

export const loginSchema = yup.object({
  realmName: yup.string().trim().required('Realm is required'),
  email: yup.string().trim().email('Enter a valid email').required('Email is required'),
  password: yup.string().required('Password is required'),
  rememberDevice: yup.boolean().default(false),
})

export type LoginFormValues = yup.InferType<typeof loginSchema>
