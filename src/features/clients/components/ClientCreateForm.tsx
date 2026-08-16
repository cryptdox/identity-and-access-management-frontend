import { useFormik } from 'formik'
import { useNavigate } from 'react-router-dom'
import { createClientSchema, type CreateClientFormValues } from '@/features/clients/schemas/client.schema'
import { useClientMutations } from '@/features/clients/hooks/useClientMutations'
import { useRealmId } from '@/common/hooks/useRealmId'
import { Input } from '@/common/components/ui/Input'
import { Select } from '@/common/components/ui/Select'
import { Button } from '@/common/components/ui/Button'
import { getApiErrorMessage } from '@/common/utils/apiError'
import { useToast } from '@/common/hooks/useToast'

const initialValues: CreateClientFormValues = { clientId: '', name: '', type: 'PUBLIC', enabled: true }

const TYPE_OPTIONS = [
  { value: 'PUBLIC', label: 'Public (SPA, mobile — no secret)' },
  { value: 'CONFIDENTIAL', label: 'Confidential (server-side — has a secret)' },
]

export function ClientCreateForm() {
  const realmId = useRealmId()
  const { createClient, isCreating } = useClientMutations()
  const navigate = useNavigate()
  const toast = useToast()

  const formik = useFormik<CreateClientFormValues>({
    initialValues,
    validationSchema: createClientSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const client = await createClient({ realmId, ...values })
        if (client) navigate(`/r/${realmId}/clients/${client.clientIdInternal}`)
      } catch (err) {
        toast.error(getApiErrorMessage(err, 'Failed to create client'))
      } finally {
        setSubmitting(false)
      }
    },
  })

  return (
    <form onSubmit={formik.handleSubmit} className="flex max-w-lg flex-col gap-4">
      <Input
        label="Client ID"
        name="clientId"
        placeholder="e.g. my-app"
        value={formik.values.clientId}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.clientId ? formik.errors.clientId : undefined}
      />
      <Input
        label="Display name (optional)"
        name="name"
        value={formik.values.name}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
      />
      <Select label="Client type" name="type" options={TYPE_OPTIONS} value={formik.values.type} onChange={formik.handleChange} />

      <label className="flex items-center gap-2 text-sm text-text">
        <input
          type="checkbox"
          name="enabled"
          checked={formik.values.enabled}
          onChange={formik.handleChange}
          className="size-4 rounded border-border text-primary focus:ring-primary/30"
        />
        Enabled
      </label>

      <div className="mt-2 flex gap-2">
        <Button type="submit" loading={isCreating || formik.isSubmitting}>
          Create client
        </Button>
        <Button type="button" variant="outline" onClick={() => navigate(`/r/${realmId}/clients`)}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
