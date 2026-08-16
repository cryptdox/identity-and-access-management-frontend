import * as yup from 'yup'

export const createGroupSchema = yup.object({
  name: yup.string().trim().required('Group name is required'),
  parentId: yup.string().optional(),
})

export type CreateGroupFormValues = yup.InferType<typeof createGroupSchema>
