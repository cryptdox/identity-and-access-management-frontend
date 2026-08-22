import * as yup from 'yup'

export const requestRealmSchema = yup.object({
  realmName: yup.string().trim().min(2, 'Enter your organization name').required('Organization name is required'),
  adminUsername: yup.string().trim().min(2, 'Enter a username').required('Username is required'),
  adminEmail: yup.string().trim().email('Enter a valid email').required('Email is required'),
  adminPassword: yup.string().min(8, 'At least 8 characters').required('Password is required'),
})

// Not yup.InferType — .required() there only guarantees the field at runtime,
// not in the static type (a known yup gotcha), which left these all-optional
// and broke spreading `values` straight into RequestRealmDto's required fields.
export interface RequestRealmFormValues {
  realmName: string
  adminUsername: string
  adminEmail: string
  adminPassword: string
}
