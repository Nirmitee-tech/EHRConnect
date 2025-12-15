# Docker Hub Access Token Setup

## ⚠️ IMPORTANT: Use Token, Not Password!

**Your Docker Hub Account:**
- Username: `jitendratech`

**❌ DON'T use the password in GitHub Actions!**
**✅ Instead, create an access token:**

---

## 📝 Step-by-Step Guide

### Step 1: Login to Docker Hub

1. Go to https://hub.docker.com
2. Login with:
   - Username: `jitendratech`

### Step 2: Navigate to Security Settings

1. Click on your profile (top right)
2. Click "Account Settings"
3. Click "Security" in left sidebar
4. Or direct link: https://hub.docker.com/settings/security

### Step 3: Create New Access Token

1. Click **"New Access Token"** button

2. Fill in the form:
   ```
   Access Token Description: github-actions-ehr-connect
   Access permissions: Read, Write, Delete
   ```

3. Click **"Generate"**

4. **COPY THE TOKEN IMMEDIATELY!**
   - It looks like: `dckr_pat_AbCdEf123456...`
   - You won't be able to see it again!
   - Save it somewhere secure

### Step 4: Add to GitHub Secrets

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"**

4. Add first secret:
   ```
   Name: DOCKERHUB_USERNAME
   Value: jitendratech
   ```
   Click "Add secret"

5. Add second secret:
   ```
   Name: DOCKERHUB_TOKEN
   Value: <paste-the-token-you-copied>
   ```
   Click "Add secret"

---

## ✅ Verification

Your GitHub secrets should look like this:

```
Secrets
├── DOCKERHUB_USERNAME  (jitendratech)
└── DOCKERHUB_TOKEN     (dckr_pat_...)
```

---

## 🔒 Why Use Access Token?

### Security Benefits

1. **Limited Scope**: Token only has permissions you grant
2. **Revokable**: Can be deleted without changing password
3. **Auditable**: Can track which token is used where
4. **Best Practice**: Recommended by Docker Hub

### Password vs Token

| Feature | Password | Access Token |
|---------|----------|--------------|
| Login to website | ✅ Yes | ❌ No |
| Use in CI/CD | ⚠️ Not recommended | ✅ Yes |
| Revokable | ❌ Changes password | ✅ Delete token only |
| Scoped permissions | ❌ Full access | ✅ Limited access |
| Multiple tokens | ❌ One password | ✅ Many tokens |

---

## 🔄 If Token is Lost

Don't worry! Just create a new one:

1. Go to https://hub.docker.com/settings/security
2. (Optional) Delete old token
3. Create new token (same steps as above)
4. Update GitHub secret with new token

---

## 🎯 What to Do Next

After adding secrets to GitHub:

1. **Trigger a build**:
   ```bash
   git push origin develop
   ```

2. **Verify in GitHub Actions**:
   - Go to Actions tab
   - Watch workflow run
   - Should see: "Login to Docker Hub" ✅

3. **Check Docker Hub**:
   - Go to https://hub.docker.com/u/jitendratech
   - Should see new tags appear after build

---

## 🐛 Troubleshooting

### Error: "unauthorized: incorrect username or password"

**Cause**: Token is wrong or expired

**Solution**:
1. Generate new token
2. Update DOCKERHUB_TOKEN secret in GitHub
3. Re-run workflow

### Error: "pull access denied"

**Cause**: Token doesn't have Read permission

**Solution**:
1. Create new token with Read, Write, Delete
2. Update secret
3. Re-run workflow

### Build succeeds but images not on Docker Hub

**Cause**: Token doesn't have Write permission

**Solution**:
1. Create new token with Write permission
2. Update secret
3. Re-run workflow

---

## 📚 Additional Resources

- [Docker Hub Access Tokens Docs](https://docs.docker.com/docker-hub/access-tokens/)
- [GitHub Secrets Documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- Our full guide: [GITHUB_ACTIONS_SETUP.md](./GITHUB_ACTIONS_SETUP.md)

---

## ✅ Quick Checklist

Setup complete when:

- [ ] Logged into Docker Hub
- [ ] Created access token
- [ ] Saved token securely
- [ ] Added DOCKERHUB_USERNAME to GitHub secrets
- [ ] Added DOCKERHUB_TOKEN to GitHub secrets
- [ ] Pushed code to trigger build
- [ ] Build succeeded in GitHub Actions
- [ ] Images appear on Docker Hub

---

**Remember**: Never commit passwords or tokens to git! Always use GitHub Secrets.
