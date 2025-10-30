# Camera Not Working - Debug Guide

## 🔴 Issue

Camera is not showing video in the meeting room after joining.

## ✅ Fix Applied

Added explicit camera/mic permission request before joining the 100ms room:

**File:** `ehr-web/src/components/virtual-meetings/meeting-room.tsx` (lines 95-106)

```typescript
// Request camera/mic permissions explicitly before joining
try {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
  });
  // Stop the stream immediately - we just needed to get permission
  stream.getTracks().forEach(track => track.stop());
} catch (permError) {
  console.warn('Camera/mic permission denied:', permError);
  // Continue anyway - user might grant permission in 100ms prompt
}
```

---

## 🔍 Debugging Steps

### Step 1: Check Browser Console

Open browser DevTools (F12) → Console tab:

**Look for:**
```
✅ Good signs:
- [HMSSDKStore] Joined room successfully
- [HMSSDKStore] Local video track added
- [HMSSDKStore] Local audio track added

❌ Bad signs:
- "Camera/mic permission denied"
- "NotAllowedError: Permission denied"
- "NotFoundError: Requested device not found"
- "NotReadableError: Could not start video source"
```

### Step 2: Check Browser Permissions

1. Look for camera icon in address bar (should show "Allowed")
2. Click the camera icon → Check permissions:
   - Camera: ✅ Allow
   - Microphone: ✅ Allow

3. If blocked:
   - Click "Site settings"
   - Change Camera and Microphone to "Allow"
   - Refresh page and rejoin

### Step 3: Check Camera is Not Being Used

Close other apps that might be using the camera:
- Zoom
- Google Meet
- FaceTime
- Other browser tabs with video calls
- Skype
- Teams

### Step 4: Test Camera Outside Meeting

Open: `chrome://settings/content/camera` (or your browser's settings)

Or test here: https://www.webcamtests.com/

If camera doesn't work outside the meeting, it's a system/browser issue.

### Step 5: Check 100ms Console Logs

Look for these specific 100ms logs:

```javascript
// Good:
[HMSSDKStore] Adding local track: video
[HMSSDKStore] Adding local track: audio
[HMSSDKStore] Peer video enabled: true

// Bad:
[HMSSDKStore] Failed to get user media
[HMSSDKStore] Track publish failed
```

---

## 🛠️ Common Issues & Fixes

### Issue 1: "Permission Denied" Error

**Cause:** Browser blocked camera/mic access

**Fix:**
1. Click camera icon in address bar
2. Allow camera and microphone
3. Refresh page
4. Rejoin meeting

### Issue 2: Camera Shows in Lobby But Not in Meeting

**Cause:** Lobby stream was stopped, browser didn't grant permission again

**Fix (already applied):**
- Updated code to request permission right before joining
- If still not working, try these steps:
  1. Clear browser permissions: Settings → Privacy → Clear browsing data → Cached images and Site settings
  2. Restart browser
  3. Visit meeting link again
  4. Grant permissions when prompted

### Issue 3: Black Video / No Video Feed

**Cause:**
- Camera is being used by another app
- Browser doesn't have permission
- 100ms failed to get track

**Fix:**
1. Close all other apps using camera
2. Check browser console for errors
3. Try different browser (Chrome, Firefox, Safari)
4. Check system camera permissions (System Preferences → Security & Privacy → Camera)

### Issue 4: Video Works for Others But Not for You

**Cause:** Your local video track isn't being published

**Check:**
1. In meeting, look at control bar
2. Is video button showing as "off" (red)? Click it to enable
3. Check if `isLocalVideoEnabled` is `false` in console

**Console test:**
```javascript
// In browser console:
console.log('Video enabled:', window.HMS?.store?.getState()?.settings?.isVideoEnabled);
```

### Issue 5: HTTPS Required Error

**Cause:** Some browsers require HTTPS for camera access

**Fix:**
- Development: Use `https://localhost:3000` instead of `http://`
- Or use Chrome with flag: `chrome://flags/#unsafely-treat-insecure-origin-as-secure`
- Production: Always use HTTPS

---

## 🧪 Quick Test Script

Paste this in browser console to test camera access:

```javascript
// Test 1: Check if camera is available
navigator.mediaDevices.enumerateDevices()
  .then(devices => {
    const cameras = devices.filter(d => d.kind === 'videoinput');
    console.log(`Found ${cameras.length} camera(s):`, cameras);
  });

// Test 2: Try to get camera stream
navigator.mediaDevices.getUserMedia({ video: true, audio: true })
  .then(stream => {
    console.log('✅ Camera access granted!', stream);
    stream.getTracks().forEach(track => {
      console.log(`Track: ${track.kind}, enabled: ${track.enabled}, readyState: ${track.readyState}`);
      track.stop();
    });
  })
  .catch(err => {
    console.error('❌ Camera access denied:', err.name, err.message);
  });

// Test 3: Check 100ms state (if in meeting)
if (window.HMS) {
  const state = window.HMS.store.getState();
  console.log('100ms local peer:', state.localPeer);
  console.log('Video track:', state.localPeer?.videoTrack);
  console.log('Audio track:', state.localPeer?.audioTrack);
}
```

---

## 🎯 Expected Behavior

### In Lobby:
1. Camera preview shows ✅
2. Can toggle camera on/off ✅
3. Can toggle mic on/off ✅
4. Video shows in real-time ✅

### After Joining:
1. Your video tile appears ✅
2. Video is playing (not frozen) ✅
3. Other participants can see you ✅
4. Control bar shows video as "on" (blue/white) ✅

---

## 🚀 Alternative: Use Different Browser

If camera still doesn't work, try:

### Chrome (Recommended)
- Best 100ms support
- Most reliable WebRTC
- Latest features

### Firefox
- Good WebRTC support
- May have stricter permissions

### Safari (macOS)
- Requires user gesture for permissions
- May need manual permission grant

### Edge
- Similar to Chrome (Chromium-based)
- Good WebRTC support

---

## 📋 Checklist

After making changes:

- [ ] Refreshed the page
- [ ] Cleared browser cache
- [ ] Granted camera/mic permissions
- [ ] Closed other apps using camera
- [ ] Checked browser console for errors
- [ ] Tested camera outside meeting (webcamtests.com)
- [ ] Video shows in lobby preview
- [ ] Video shows after joining meeting
- [ ] Other participants can see video
- [ ] Can toggle video on/off in meeting

---

## 🆘 Still Not Working?

### Check Backend Logs

```bash
cd ehr-api
npm run dev

# Look for:
# ✓ 100ms client initialized
# Creating 100ms room with template_id
# ✅ 100ms room created: [ID]
# ✓ Generated auth token for participant
```

### Check Network Tab

1. Open DevTools → Network tab
2. Filter: "100ms" or "init"
3. Look for failed requests (red)
4. Check response body for errors

### Enable 100ms Debug Logs

Add this to `meeting-room.tsx`:

```typescript
import { HMSLogLevel } from '@100mslive/react-sdk';

// In joinRoom function:
await hmsActions.setLogLevel(HMSLogLevel.VERBOSE);
```

This will show detailed 100ms logs in console.

---

## 💡 Pro Tips

1. **Use Chrome for testing** - Best WebRTC support
2. **Always use HTTPS in production** - Required for camera
3. **Test in incognito** - Rules out extension conflicts
4. **Check system permissions** - Some OS block camera access
5. **Restart browser** - Clears permission cache

---

## 📞 Need More Help?

If camera still doesn't work after all these steps:

1. **Share browser console logs** - Copy/paste errors
2. **Share network requests** - Export HAR file
3. **Test different device** - Phone, tablet, different computer
4. **Check 100ms status** - https://status.100ms.live/

---

## ✅ Summary

**What I Fixed:**
- Added explicit camera/mic permission request before joining
- Updated error messages to mention permissions
- Added `initialSettings` to ensure video starts unmuted

**What You Should Check:**
1. Browser permissions (camera icon in address bar)
2. Browser console for errors
3. Other apps not using camera
4. Try different browser if needed

**Expected Result:**
Camera and mic should work in both lobby and meeting room! 🎥✅
