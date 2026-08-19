import * as yup from 'yup'

export const loginSchema = yup.object({
  crAccessCode: yup
    .string()
    .trim()
    .matches(/^[A-Za-z0-9]{4,6}$/, 'Enter the 4-6 character CR access code')
    .required('CR access code is required'),
  email: yup.string().trim().email('Enter a valid email').required('Email is required'),
  password: yup.string().required('Password is required'),
  rememberDevice: yup.boolean().default(false),
})

export type LoginFormValues = yup.InferType<typeof loginSchema>
