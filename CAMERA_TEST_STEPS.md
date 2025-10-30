# Camera Not Working - Test Steps

## 🔍 Debug Steps

### Step 1: Create a FRESH Meeting

**IMPORTANT:** The meeting you're testing might have been created BEFORE we added the templateId to the database. Create a new one:

1. **Go to Appointments**
2. **Click "Start Video Call" on any appointment**
3. **Use the NEW meeting link** (not old ones)

Example fresh meeting:
```
http://localhost:3000/meeting/[NEW-CODE]
```

---

### Step 2: Open Browser Console

**Before joining, open browser DevTools:**
1. Press **F12** (or Cmd+Option+I on Mac)
2. Go to **Console** tab
3. Keep it open while testing

---

### Step 3: Join Meeting & Check Console

**What to look for:**

#### ✅ Good Signs:
```
[MeetingRoom] Connected! Local peer: {name: "...", videoTrack: "...", audioTrack: "..."}
[MeetingRoom] Local video track: "track_id_here"
[MeetingRoom] Local audio track: "track_id_here"
[VideoTile] Peer: Your Name {videoEnabled: true, videoTrack: "track_id", ...}
```

#### ❌ Bad Signs:
```
[MeetingRoom] Local video track: undefined
[MeetingRoom] Local audio track: undefined
[VideoTile] Peer: Your Name {videoEnabled: false, videoTrack: null, ...}
```

---

### Step 4: Check Browser Permissions

**In address bar:**
- Look for camera icon
- Should show "Allowed" (green)
- If blocked, click → Allow

**Test permissions manually:**
```javascript
// Paste in console:
navigator.mediaDevices.getUserMedia({ video: true, audio: true })
  .then(stream => {
    console.log('✅ Camera access works!', stream);
    stream.getTracks().forEach(t => t.stop());
  })
  .catch(err => console.error('❌ Camera blocked:', err));
```

---

## 🎯 Key Differences: Patient Photo vs Meeting

### Patient Photo Capture (WORKS):
```typescript
// Manual, user-triggered
const startCamera = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: 'user', width: 1280, height: 720 },
    audio: false
  });
  videoRef.current.srcObject = stream;
};

// Video element
<video ref={videoRef} autoPlay playsInline muted />
```

### 100ms Meeting (NOT WORKING):
```typescript
// Automatic on join
await hmsActions.join({
  userName: displayName,
  authToken: authToken,
  settings: {
    isAudioMuted: false,
    isVideoMuted: false,
  }
});

// Video rendered by 100ms SDK
const { videoRef: hmsVideoRef } = useVideo({ trackId: peer.videoTrack });
<video ref={hmsVideoRef} autoPlay muted playsInline />
```

---

## 🔧 Potential Issues

### Issue 1: Old Meeting (No Template)
**Symptom:** Meeting was created before we added templateId
**Fix:** Create a new meeting from appointment

### Issue 2: Guest Role Can't Publish
**Symptom:** 100ms template blocks guest video
**Check:** Look at console for permission errors
**Fix:** May need to update template role permissions

### Issue 3: Browser Blocks Camera
**Symptom:** Permission denied error
**Fix:** 
1. Click camera icon in address bar
2. Select "Allow"
3. Refresh page

### Issue 4: 100ms SDK Not Getting Tracks
**Symptom:** `peer.videoTrack` is null/undefined
**Possible causes:**
- Join settings wrong
- Template role doesn't allow publishing
- SDK initialization failure

---

## 🧪 Quick Test: Does Camera Work At All?

### Test 1: Lobby Preview
1. Open meeting link
2. **DO YOU SEE YOURSELF in the lobby?**
   - ✅ YES → Camera works, issue is with 100ms SDK
   - ❌ NO → Camera permissions issue

### Test 2: After Joining
1. Join the meeting
2. **DO YOU SEE YOUR VIDEO TILE?**
   - ✅ YES with video → Fixed!
   - ✅ YES with avatar → Camera not publishing
   - ❌ NO tile → Not connected

---

## 📋 Checklist

**Before reporting "camera not working":**

- [ ] Used a FRESH meeting (created after template ID fix)
- [ ] Checked browser console for errors
- [ ] Verified camera icon shows "Allowed"
- [ ] Tested camera with getUserMedia manually
- [ ] Checked if lobby preview works
- [ ] Tried different browser (Chrome recommended)
- [ ] Closed other apps using camera
- [ ] Refreshed page with Ctrl+Shift+R

---

## 🆘 Share These If Camera Still Not Working

1. **Console logs:**
   ```
   Copy all logs starting with [MeetingRoom] and [VideoTile]
   ```

2. **Meeting code:**
   ```
   What meeting code are you using? (e.g., 96WZXDFG)
   ```

3. **Browser & OS:**
   ```
   Chrome 120 on macOS, Firefox 115 on Windows, etc.
   ```

4. **Lobby preview:**
   ```
   Does camera work in lobby? YES/NO
   ```

5. **Permission status:**
   ```
   What does camera icon in address bar show?
   ```

---

## 💡 Alternative: Fallback to Direct Camera Access

If 100ms SDK continues to fail, we can implement a fallback using the patient photo capture approach:

```typescript
// Fallback: Use direct getUserMedia if 100ms fails
if (!peer.videoTrack) {
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  videoRef.current.srcObject = stream;
}
```

This would bypass 100ms SDK and directly use browser APIs like patient photo capture does.

---

## 🚀 Next Steps

1. **Create NEW meeting** from appointment
2. **Open console** (F12)
3. **Join meeting** and watch console logs
4. **Share console output** with me
5. **Test manual camera access** (paste code above)

This will help identify if the issue is:
- 100ms SDK
- Browser permissions  
- Template role settings
- Old meeting without template

Let's debug together! 🔍
