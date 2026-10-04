import test from 'node:test'
import assert from 'node:assert/strict'

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3001'

class CookieJar {
  constructor() {
    this.cookies = new Map()
  }

  setFromHeaders(headers) {
    const setCookieHeaders = typeof headers.getSetCookie === 'function'
      ? headers.getSetCookie()
      : (headers.get('set-cookie') ? [headers.get('set-cookie')] : [])

    for (const header of setCookieHeaders) {
      const parts = header.split(';')
      const [nameValue] = parts
      const eqIdx = nameValue.indexOf('=')
      if (eqIdx !== -1) {
        const key = nameValue.substring(0, eqIdx).trim()
        const val = nameValue.substring(eqIdx + 1).trim()
        const maxAgeMatch = header.match(/Max-Age=([-\d]+)/i)
        if (maxAgeMatch && parseInt(maxAgeMatch[1], 10) <= 0) {
          this.cookies.delete(key)
        } else if (!val) {
          this.cookies.delete(key)
        } else {
          this.cookies.set(key, val)
        }
      }
    }
  }

  getCookieHeader() {
    return Array.from(this.cookies.entries())
      .map(([k, v]) => `${k}=${v}`)
      .join('; ')
  }
}

test('TaskFlow API & Auth Test Suite', async (t) => {
  const jar = new CookieJar()
  const uniqueId = Date.now()
  const testUser = {
    name: `Test User ${uniqueId}`,
    email: `test_${uniqueId}@example.com`,
    password: 'password12345',
  }

  await t.test('1. Health Check Endpoint', async () => {
    const res = await fetch(`${BASE_URL}/api/health`)
    assert.equal(res.status, 200, 'Health check should return 200')
    const data = await res.json()
    assert.equal(data.ok, true, 'Health check should return ok: true')
  })

  await t.test('2. Health Check Database Ping', async () => {
    const res = await fetch(`${BASE_URL}/api/health?db=1`)
    assert.equal(res.status, 200, 'Health check with DB ping should return 200')
    const data = await res.json()
    assert.equal(data.ok, true, 'Health check ok should be true')
    assert.equal(data.db, 'ok', 'DB status should be ok')
  })

  await t.test('3. Registration - Reject Invalid Email', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/sign-up/email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Origin: BASE_URL,
      },
      body: JSON.stringify({
        email: 'invalid-email-format',
        password: 'password12345',
        name: 'Invalid Email',
      }),
    })
    assert.notEqual(res.status, 200, 'Invalid email sign-up should fail')
  })

  await t.test('4. Registration - Reject Short Password (< 8 chars)', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/sign-up/email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Origin: BASE_URL,
      },
      body: JSON.stringify({
        email: `short_${uniqueId}@example.com`,
        password: '123',
        name: 'Short Pass',
      }),
    })
    assert.notEqual(res.status, 200, 'Short password sign-up should fail')
  })

  await t.test('5. Registration - Successful Sign Up', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/sign-up/email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Origin: BASE_URL,
      },
      body: JSON.stringify(testUser),
    })
    assert.equal(res.status, 200, 'Sign up should return 200')
    const data = await res.json()
    assert.ok(data.user, 'Sign up response should contain user object')
    assert.equal(data.user.email, testUser.email, 'User email should match')
    assert.equal(data.user.name, testUser.name, 'User name should match')
    assert.equal(data.token, null, 'autoSignIn is false, token should be null')
  })

  await t.test('6. Login - Reject Non-Existent User', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/sign-in/email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Origin: BASE_URL,
      },
      body: JSON.stringify({
        email: `nonexistent_${uniqueId}@example.com`,
        password: 'password12345',
      }),
    })
    assert.notEqual(res.status, 200, 'Non-existent user login should fail')
  })

  await t.test('7. Login - Reject Invalid Password', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/sign-in/email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Origin: BASE_URL,
      },
      body: JSON.stringify({
        email: testUser.email,
        password: 'wrongpassword',
      }),
    })
    assert.notEqual(res.status, 200, 'Invalid password should fail')
  })

  await t.test('8. Login - Successful Sign In', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/sign-in/email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Origin: BASE_URL,
      },
      body: JSON.stringify({
        email: testUser.email,
        password: testUser.password,
      }),
    })
    assert.equal(res.status, 200, 'Sign in should return 200')
    jar.setFromHeaders(res.headers)
    assert.ok(jar.cookies.has('better-auth.session_token'), 'Cookie jar must contain session token')
  })

  await t.test('9. Session - Retrieve Active Session', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/get-session`, {
      headers: {
        Origin: BASE_URL,
        Cookie: jar.getCookieHeader(),
      },
    })
    assert.equal(res.status, 200, 'Get session should return 200')
    const data = await res.json()
    assert.ok(data?.session, 'Session object should exist')
    assert.equal(data?.user?.email, testUser.email, 'Session user email should match')
  })

  await t.test('10. Session - Reject Unauthorized Request', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/get-session`, {
      headers: {
        Origin: BASE_URL,
      },
    })
    const data = await res.json()
    assert.equal(data, null, 'Unauthenticated get-session should return null')
  })

  await t.test('11. Logout - Successful Sign Out', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/sign-out`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Origin: BASE_URL,
        Cookie: jar.getCookieHeader(),
      },
      body: JSON.stringify({}),
    })
    assert.equal(res.status, 200, 'Sign out should return 200')
    jar.setFromHeaders(res.headers)
  })

  await t.test('12. Session - Inactive After Sign Out', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/get-session`, {
      headers: {
        Origin: BASE_URL,
        Cookie: jar.getCookieHeader(),
      },
    })
    const data = await res.json()
    assert.equal(data, null, 'Session should be null after sign out')
  })
})
