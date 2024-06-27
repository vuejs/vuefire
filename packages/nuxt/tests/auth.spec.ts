import { describe, expect, it } from 'vitest'
import { createPage, setup } from '@nuxt/test-utils/e2e'
import { createResolver } from '@nuxt/kit'

const { resolve } = createResolver(import.meta.url)

await setup({
  rootDir: resolve('../playground'),
  build: false,
  server: true,
  browser: true,
  dev: true,

  browserOptions: {
    type: 'chromium',
    launch: {
      headless: true,
    },
  },
})

describe('auth/multi-tenancy', async () => {
  it('should create a default tenant token if no tenant is specified', async () => {
    const page = await createPage('/authentication')

    // 1. Sign out, clear tenant to start clean
    await page.getByTestId('sign-out').click()
    await page.getByTestId('tenant').clear()

    // 2. Ensure test account exists
    const signupResponse = page.waitForResponse((r) =>
      r.url().includes('accounts:signUp')
    )
    await page.getByTestId('email-signup').fill('test@test.com')
    await page.getByTestId('password-signup').fill('testtest')
    await page.getByTestId('submit-signup').click()
    await signupResponse

    // 3. Log in with test account, check tenant
    // Call to sign in is 'accounts:signInWithPassword', but we need __session call to get user info
    const signinResponse = page.waitForResponse((r) =>
      r.url().includes('/api/__session')
    )
    await page.getByTestId('email-signin').fill('test@test.com')
    await page.getByTestId('password-signin').fill('testtest')
    await page.getByTestId('submit-signin').click()
    await signinResponse

    // 4. Assert user does in fact not have a tenant id
    const userData = await page.getByTestId('user-data-client').textContent()

    expect(userData).toBeTruthy()
    if (!userData) return

    const user = JSON.parse(userData)
    expect(user.tenantId).toBeUndefined()
  })

  it('should create token with tenantId if tenant name is specified', async () => {
    const page = await createPage('/authentication')
    const tenantName = 'tenant A'

    // 1. Sign out, clear tenant to start clean
    await page.getByTestId('sign-out').click()
    await page.getByTestId('tenant').clear()
    await page.getByTestId('tenant').fill(tenantName)

    // 2. Ensure test account exists
    const signupResponse = page.waitForResponse((r) =>
      r.url().includes('accounts:signUp')
    )
    await page.getByTestId('email-signup').fill('test@test.com')
    await page.getByTestId('password-signup').fill('testtest')
    await page.getByTestId('submit-signup').click()
    await signupResponse

    // 3. Log in with test account, check tenant
    // Call to sign in is 'accounts:signInWithPassword', but we need __session call to get user info
    const signinResponse = page.waitForResponse((r) =>
      r.url().includes('/api/__session')
    )
    await page.getByTestId('email-signin').fill('test@test.com')
    await page.getByTestId('password-signin').fill('testtest')
    await page.getByTestId('submit-signin').click()
    await signinResponse

    // 4. Assert user does in fact not have a tenant id
    const userData = await page.getByTestId('user-data-client').textContent()

    expect(userData).toBeTruthy()
    if (!userData) return

    const user = JSON.parse(userData)
    expect(user.tenantId).toEqual(tenantName)
  })

  it('should return tenantId in server render', async () => {
    const page = await createPage('/authentication')
    const tenantName = 'tenant A'

    // 1. Sign out, clear tenant to start clean
    await page.getByTestId('sign-out').click()
    await page.getByTestId('tenant').clear()
    await page.getByTestId('tenant').fill(tenantName)

    // 2. Ensure test account exists
    const signupResponse = page.waitForResponse((r) =>
      r.url().includes('accounts:signUp')
    )
    await page.getByTestId('email-signup').fill('test@test.com')
    await page.getByTestId('password-signup').fill('testtest')
    await page.getByTestId('submit-signup').click()
    await signupResponse

    // 3. Log in with test account, check tenant
    // Call to sign in is 'accounts:signInWithPassword', but we need __session call to get user info
    const signinResponse = page.waitForResponse((r) =>
      r.url().includes('/api/__session')
    )
    await page.getByTestId('email-signin').fill('test@test.com')
    await page.getByTestId('password-signin').fill('testtest')
    await page.getByTestId('submit-signin').click()
    await signinResponse

    // 4. Reload the page to trigger server render
    await page.reload({ waitUntil: 'domcontentloaded' })

    const serverUserData = await page
      .getByTestId('user-data-server')
      .textContent()

    expect(serverUserData).toBeTruthy()
    if (!serverUserData) return

    const serverUser = JSON.parse(serverUserData)
    expect(serverUser.tenantId).toEqual(tenantName)
  })
})
