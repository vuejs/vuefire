import { VueFireNuxtModuleOptions } from '../module'

export function isServiceAccountConfigured(options: VueFireNuxtModuleOptions) {
  const hasServiceAccountFile =
    typeof process.env.GOOGLE_APPLICATION_CREDENTIALS === 'string' &&
    process.env.GOOGLE_APPLICATION_CREDENTIALS.length > 0

  if (hasServiceAccountFile) {
    return true
  }

  if (typeof options.admin?.serviceAccount === 'object') {
    if (
      options.admin.serviceAccount.clientEmail?.length &&
      options.admin.serviceAccount.privateKey?.length &&
      options.admin.serviceAccount.projectId?.length
    ) {
      return true
    }
  }

  return false
}
