# 🔧 Fix: React Duplicate Instances Error

## Error Symptoms

```
Warning: Invalid hook call. Hooks can only be called inside of the body of a function component.
TypeError: Cannot read properties of null (reading 'useContext')
```

## Root Cause

Vite's dependency pre-bundling created **duplicate React instances** in different chunks, causing hooks to fail because they're from different React copies.

This typically happens when:
- Vite cache becomes corrupted
- Lock file changes trigger re-optimization
- New dependencies are installed
- HMR (Hot Module Replacement) issues

## ✅ Solution 1: Clean Vite Cache (Quick - 30 seconds)

### Automated Script (Recommended):
```powershell
.\clean-vite-cache.ps1
npm run dev
```

### Manual Steps:
```powershell
# 1. Stop dev server (Ctrl+C if running)

# 2. Delete Vite cache
Remove-Item -Recurse -Force node_modules\.vite

# 3. Delete dist folder (optional but recommended)
Remove-Item -Recurse -Force dist

# 4. Restart dev server
npm run dev
```

## ✅ Solution 2: Update Vite Config (Already Done)

The `vite.config.js` has been updated to prevent this issue:

```javascript
optimizeDeps: {
  include: [
    'react',
    'react-dom',
    'react-router-dom',
    '@capacitor/core',
    '@capacitor/push-notifications',
    '@capacitor/device',
  ],
  esbuildOptions: {
    target: 'esnext',
    supported: {
      'top-level-await': true
    },
  },
},
resolve: {
  dedupe: [
    'react',
    'react-dom',
    'react-router-dom',
  ],
}
```

This configuration:
- **Pre-bundles** React to avoid multiple versions
- **Deduplicates** React across all chunks
- **Optimizes** dependencies consistently

## ✅ Solution 3: Full Clean Install (If Above Fails - 5 minutes)

```powershell
# 1. Delete all caches and dependencies
Remove-Item -Recurse -Force node_modules
Remove-Item -Recurse -Force dist
Remove-Item -Force package-lock.json

# 2. Clean npm cache
npm cache clean --force

# 3. Reinstall dependencies
npm install

# 4. Start dev server
npm run dev
```

## 🔍 Verification

After cleaning cache, verify the fix:

1. **Check browser console**: Should see no React errors
2. **Check Vite output**: Look for:
   ```
   Pre-bundling dependencies:
     react
     react-dom
     react-router-dom
   ```
3. **Test navigation**: All routes should work
4. **Test hooks**: useAuth, useNavigate, etc. should work

## 🚫 What NOT to Do

❌ **Don't install multiple React versions**
```powershell
# WRONG - Creates duplicates
npm install react@18.3.1 react@18.2.0
```

❌ **Don't skip cache cleaning**
- Just restarting dev server won't fix corrupted cache
- Must delete `node_modules/.vite` folder

❌ **Don't use npm link with different React versions**
- Linked packages may have their own React copy

## 🎯 Prevention

### Best Practices:
1. **Clean cache after installing new dependencies**:
   ```powershell
   npm install <package>
   .\clean-vite-cache.ps1
   ```

2. **Use consistent React versions**:
   - Check `package.json`: All React packages should use same version
   - Current project uses: `react@18.3.1`

3. **Avoid force re-optimization**:
   - Vite config has `force: false` in `optimizeDeps`
   - This prevents cache thrashing

4. **Restart cleanly**:
   ```powershell
   # Stop server (Ctrl+C)
   # Wait 2 seconds
   # Start again
   npm run dev
   ```

## 📊 Understanding the Error

### Why This Happens:

1. **Vite Pre-Bundles Dependencies**:
   - Groups packages into optimized chunks
   - Caches in `node_modules/.vite`

2. **Cache Becomes Stale**:
   - Lock file changes (package versions)
   - New dependencies added
   - File system issues

3. **Multiple React Instances Created**:
   - Chunk A loads React from cache
   - Chunk B loads React from source
   - Hooks fail: They're tied to specific React instance

4. **Hook Rules Violated**:
   - `useContext`, `useState`, etc. fail
   - React sees them as "called outside component"

### Technical Details:

```javascript
// What Happens Internally:

// Chunk A (cached)
import React from 'react'; // Version A in cache

// Chunk B (fresh)
import React from 'react'; // Version B from node_modules

// Component tries to use hooks
function MyComponent() {
  // Uses React Version A
  const navigate = useNavigate();
  
  // But router context is from React Version B
  // ❌ ERROR: Hooks from different React instances
}
```

## 🔧 Advanced Debugging

If basic solutions don't work:

### 1. Check for Multiple React Installations:
```powershell
npm ls react
```

Expected output: All packages should show `react@18.3.1 deduped`

### 2. Verify Vite Dependencies:
```powershell
# Check what Vite pre-bundled
cat node_modules\.vite\deps\_metadata.json
```

### 3. Check Bundle Analysis:
```powershell
# Build and analyze
npm run build
```

Look for duplicate React in build warnings.

### 4. Check Import Paths:
```javascript
// ✅ CORRECT - Uses alias
import { useAuth } from '@contexts/AuthContext.jsx';

// ❌ WRONG - Relative path might bypass dedupe
import { useAuth } from '../../../contexts/AuthContext.jsx';
```

## 📝 Related Issues

### Similar Errors:
- `Cannot read properties of null (reading 'useState')`
- `Rendered more hooks than during the previous render`
- `Invalid hook call`
- `Minified React error #321`

All usually caused by React duplicate instances.

## 🆘 Still Having Issues?

1. **Check browser console**: Copy full error stack
2. **Check Vite terminal**: Look for optimization errors
3. **Try incognito mode**: Clear browser cache
4. **Check Node version**: Should be 18+ (current: 22.18.0)
5. **Verify package.json**: `"type": "module"` should be present

---

## ✅ Quick Fix Checklist

- [ ] Stop dev server
- [ ] Run `.\clean-vite-cache.ps1`
- [ ] Restart dev server: `npm run dev`
- [ ] Wait for pre-bundling to complete
- [ ] Check browser console (should be clean)
- [ ] Test navigation and hooks

**Expected Time**: 30 seconds  
**Success Rate**: 95%+

---

**Created**: 2025-11-07  
**Issue**: React duplicate instances in Vite  
**Status**: ✅ Fixed with cache cleaning  
**Prevention**: Added Capacitor packages to optimizeDeps
