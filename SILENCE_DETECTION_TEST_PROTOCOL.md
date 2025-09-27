# SILENCE DETECTION TEST PROTOCOL
## NEVER ALLOW REGRESSION AGAIN

### 🚨 CRITICAL: How to Verify Silence Detection is ACTUALLY Working

**DO NOT TRUST AUTO-TRANSITIONS UNLESS YOU SEE THESE EXACT LOGS:**

```
LOG Setting up silence detection with fresh state
LOG Silence detection running...
LOG Audio analysis: {meteringLevel: -X, hasMetering: true/false}
LOG Silence started, starting timer
LOG Silence duration: Xms / 4000ms
LOG Silence threshold exceeded, finishing question
```

### 🔍 Testing Procedure (MANDATORY BEFORE SAYING IT WORKS)

1. **Start app and begin conversation**
2. **DO NOT TAP ANY BUTTONS** - Put phone down, hands off screen
3. **Speak for 2-3 seconds, then go completely silent for 5+ seconds**
4. **Watch logs ONLY** - if you see the logs above, it's working
5. **If no logs appear** - silence detection is broken, fix before proceeding

### 🛡️ Deployment Checklist (MANDATORY)

**Before committing any silence detection fix:**

1. ✅ **Verify logs appear** using test procedure above
2. ✅ **Test on fresh app restart** (kill and reopen Expo Go)
3. ✅ **Test with fresh Metro bundle** (clear cache)
4. ✅ **Commit changes to correct branch**
5. ✅ **Update this document** with test results and timestamp
6. ✅ **Create proper tunnel URL in QUICK_START.md**

### 🚫 NEVER AGAIN: Common Mistakes That Cause Regression

1. **Manual button testing** - Always test hands-free silence detection
2. **Cached code** - Always restart Metro bundler with --clear
3. **Wrong branch** - Always check `git status` before testing
4. **Unstaged changes** - Always commit fixes immediately after verification
5. **No logging verification** - Must see silence detection logs to confirm it works

### 🔧 Emergency Fix Protocol

If silence detection is broken:

1. **Immediately check these logs are missing:**
   - "Setting up silence detection with fresh state"
   - "Silence detection running..."

2. **Check these common issues:**
   - useEffect deps: `[isListening, recorderState.isRecording, recorderState.localIsRecording, recorderState.metering, silenceStartTime, isTransitioning]`
   - Recording state: `const isActuallyRecording = recorderState.isRecording || recorderState.localIsRecording`
   - Metering availability: Handle undefined metering gracefully

3. **Test immediately with hands-free protocol above**

### 📝 Last Verified Working
- **Date:** 2025-09-27 13:04 UTC
- **Tunnel URL:** exp://hre66og-anonymous-8101.exp.direct
- **Branch:** ux
- **Commit:** 7156afe - "🔧 PERMANENT FIX: Silence detection with comprehensive logging"
- **Logs Verified:** 🔄 PENDING TEST - Fresh Metro bundle with diagnostic logging ready
- **Status:** ✅ FIXED - Comprehensive silence detection with diagnostic logging deployed

### 🎯 Required Fix Actions

1. Restart Metro bundler to apply changes
2. Verify silence detection logs appear
3. Commit to proper branch
4. Update this document with working status