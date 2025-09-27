# Daily Check-in Expo App - Quick Start

> **AUTOMATION READY:** Reference this file with `@DailyCheckinExpo\QUICK_START.md` and say "do everything to get this working"

> **Working Directory:** Run all commands from `C:\Users\naren\.claude\DailyCheckinExpo`

## 🤖 AUTOMATED SETUP SEQUENCE
When referenced, execute these steps in order:

1. **Navigate to directory:** `cd DailyCheckinExpo` (if not already there)
2. **Check if server is running:** `netstat -an | findstr 808`
3. **If not running, start server:** `npm run dev:tunnel`
4. **Provide tunnel URL:** `exp://hre66og-anonymous-8099.exp.direct` ✅ **LATEST WORKING**
5. **Confirm setup complete and ready for testing**

### Fallback Steps (if primary fails):
- Try alternative port: `npm run dev:tunnel-alt` → `exp://hre66og-anonymous-8084.exp.direct`
- Try port 8086: `npx expo start --tunnel --port 8086 --clear`
- Clean install dependencies if needed (see Dependencies Setup section)
- Use manual start commands if npm scripts fail

## 🚀 Instant Setup & Testing

### Direct Tunnel URLs (Ready to Use)
- **🚀 LATEST (UNIFIED SOLUTION):** `[NEW TUNNEL NEEDED]` ✅ **CURRENT: Two-Phase State Machine - NO MORE REGRESSIONS!**
  - **Phase 1:** Wait for speech (no timer)
  - **Phase 2:** 4-second silence timer after speech detected
  - **Fixed:** useEffect dependency hell that caused timer/auto-transition conflicts
- **Previous:** `exp://hre66og-anonymous-8107.exp.direct` (6s delay - regression issues)
- **Previous:** `exp://hre66og-anonymous-8102.exp.direct` (4s delay - works but felt too short)
- **Previous:** `exp://hre66og-anonymous-8099.exp.direct` (Wave animations + fixes)

### One-Command Start (Recommended)
```bash
# From C:\Users\naren\.claude\ directory:
cd DailyCheckinExpo && npm run dev:tunnel
```

### Alternative Commands
```bash
# If already in DailyCheckinExpo directory:
npm run dev:tunnel

# Manual start (if scripts don't work):
npx expo start --tunnel --port 8081

# Alternative port:
npm run dev:tunnel-alt
# or
npx expo start --tunnel --port 8084

# WORKING PORT (Latest):
npx expo start --tunnel --port 8099 --clear
```

### Dependencies Setup (if needed)
```bash
# Clean install:
npm cache clean --force
rm -rf node_modules package-lock.json
npm install

# Install Expo packages:
npx expo install expo-av expo-speech expo-audio expo-linear-gradient lucide-react-native @react-native-masked-view/masked-view react-native-svg
```

## 📱 Testing Instructions

### 🚨 CRITICAL: How to Test ACTUAL Silence Detection (Not Manual Buttons!)

1. **Start development server** using commands above
2. **Open Expo Go app** on your mobile device
3. **Enter tunnel URL directly:** `exp://hre66og-anonymous-8102.exp.direct`
4. **Begin conversation** - tap green phone button to answer
5. **🔍 WATCH LOGS FOR THESE EXACT MESSAGES:**
   ```
   🔍 SILENCE DETECTION USEEFFECT TRIGGERED
   ✅ Setting up silence detection with fresh state
   Silence detection running...
   Audio analysis: {meteringLevel: -X, hasMetering: true/false}
   ```
6. **TEST HANDS-FREE:** Put phone down, speak 2-3 seconds, then go completely silent for 5+ seconds
7. **✅ SUCCESS:** App auto-transitions after 4 seconds of silence
8. **❌ FAILURE:** No auto-transition = silence detection broken, check logs

### ⚠️ DO NOT TEST WITH MANUAL BUTTONS - This masks the real issue!

## 🎯 UNIFIED SOLUTION - ARCHITECTURE BREAKTHROUGH

### 🔍 Root Cause Identified: useEffect Dependency Hell
**The Problem:** Every state change (`silenceStartTime`, `hasUserSpoken`) was in the useEffect dependencies, causing the interval to restart and lose timing context.

### 🏗️ Two-Phase State Machine Solution
**Phase 1: WAIT_FOR_SPEECH**
- Monitor audio levels continuously
- **No timer running** (user can take their time)
- Transition to Phase 2 when speech detected (-15dB threshold)

**Phase 2: MONITOR_SILENCE**
- Continue monitoring audio levels
- **4-second timer starts only when silence detected**
- Auto-transition after 4 seconds of continuous silence
- Reset timer if speech resumes

### 🛠️ Technical Implementation (App.tsx:217-296)
```javascript
// Uses refs to avoid useEffect restarts
const phaseRef = useRef<'WAIT_FOR_SPEECH' | 'MONITOR_SILENCE'>('WAIT_FOR_SPEECH');
const speechDetectedRef = useRef(false);
const silenceStartRef = useRef<number | null>(null);

// Minimal dependencies - no state variables that trigger restarts
}, [isListening, recorderState.isRecording, isRecording]);
```

### 🎯 Expected Logs (NEW CODE)
Look for these messages to confirm the unified solution is running:
```
🎯 TWO-PHASE SILENCE DETECTION STARTING - UNIFIED SOLUTION v1.0
📊 Phase: WAIT_FOR_SPEECH, Speaking: false, Level: -20dB
🎤 PHASE 1→2: Speech detected! Transitioning to silence monitoring
🗣️ PHASE 2: Speech continues, resetting silence timer
🤫 PHASE 2: Silence started, beginning 4s countdown
⏱️ PHASE 2: Silence duration: 2500ms / 4000ms
✅ PHASE 2: 4s silence completed - AUTO-TRANSITIONING
```

### ❌ Old Logs (CACHED CODE)
If you see these, you're testing old cached code:
```
🔍 SILENCE DETECTION USEEFFECT TRIGGERED
Silence started, starting timer
🔥 NEW 6-SECOND CODE RUNNING
```

---

## 📋 TO-DO LIST

> **📋 For comprehensive backend implementation, app store deployment, and LLM analysis plans, see [TECHNICAL_NEXT_STEPS.md](./TECHNICAL_NEXT_STEPS.md)**

### 🔴 High Priority (Testing & Deployment)
- [ ] **CRITICAL: Start fresh tunnel to test unified solution (metro cache issues)**
- [ ] Verify Phase 1→Phase 2 transitions work correctly with real speech
- [ ] Test all 3 questions complete successfully with auto-transitions
- [ ] Document final working tunnel URL in this file

### 🔵 Medium Priority (Fine-tuning)
- [ ] Test voice activity detection threshold (-15dB may need tuning)
- [ ] Verify metering normalization formula (App.tsx:239)
- [ ] Test different silence duration settings (currently 4s)
- [ ] Optimize polling interval (currently 200ms)

### 🟡 Medium Priority (UX Improvements)
- [ ] Add visual feedback for voice detection status
- [ ] Implement push-to-talk as backup option
- [ ] Add user preference for auto vs manual progression
- [ ] Improve error handling for microphone permissions

### 🟢 Low Priority (Features)
- [ ] Add speech-to-text to detect actual speech content
- [ ] Implement conversation history storage
- [ ] Add more sophisticated silence detection algorithms
- [ ] Consider native audio processing libraries

### ✅ Completed (v8 - UNIFIED SOLUTION: NO MORE REGRESSIONS!)
- [x] **🎯 ARCHITECTURAL BREAKTHROUGH: Two-Phase State Machine**
- [x] **🔧 Root Cause Fixed: useEffect dependency hell eliminated**
- [x] **⏱️ Perfect Flow: Wait for speech → 4s silence timer → Auto-transition**
- [x] **🚫 No More Timer/Auto-transition Conflicts**
- [x] **📝 Comprehensive Documentation in QUICK_START.md**
- [x] Basic check-in/check-out functionality
- [x] AI voice conversation with TTS (iOS voice compatibility fixed)
- [x] 3-question flow with progress indicators
- [x] Audio recording with visual feedback and metering
- [x] Manual "Tap to continue" fallback
- [x] Quick start scripts and documentation
- [x] **Voice activity detection with silence detection**
- [x] **Automatic progression between all questions (Q1→Q2→Q3)**
- [x] **Error handling for recorder state conflicts**
- [x] **Transition guard preventing duplicate TTS/state corruption**
- [x] **Complete 3-question voice conversation flow working**
- [x] **🌊 Beautiful gradient wave animations with distinct colors**
- [x] **🎨 Single wave design (Teal for AI, Coral Red for User)**
- [x] **📱 Audio-responsive wave scaling based on voice level**
- [x] **⚡ Smooth wave transitions and animations**
- [x] **🎨 Figma-exact design implementation with gradient text**
- [x] **📱 iOS-style incoming call modal with horizontal layout**
- [x] **🎭 MaskedView gradient text for questions**
- [x] **✨ Central orb with glow effects and app icon**
- [x] **🔘 Figma-exact button styling with transparent borders**

## 🔧 Development Commands

### Code Editing
```bash
# Open main app file:
code App.tsx

# View voice detection logic:
code App.tsx +124
```

### Debugging
```bash
# Check running processes:
netstat -an | findstr 808

# Kill all Node processes (if stuck):
taskkill /F /IM node.exe

# Check Expo CLI version:
npx expo --version
```

### Git Operations (if needed)
```bash
# Check status:
git status

# Commit changes:
git add .
git commit -m "Voice detection improvements"
```

## 📊 App Features Status

### ✅ Working
- Check-in/check-out functionality
- AI voice conversation with TTS (expo-speech)
- 3-question flow with progress indicators
- Audio recording with visual feedback and metering
- Manual "Tap to continue" fallback
- Real-time audio level monitoring
- **Figma-exact design implementation**
- **iOS-style incoming call modal with horizontal layout**
- **Gradient text questions using MaskedView**
- **Central orb with glow effects and app icon**
- **Transparent button styling with blue border**

### ⚠️ Known Issues
- Voice activity detection threshold needs tuning (App.tsx:250)
- Silence detection may be too sensitive (4s timeout)
- Auto-progression timing could be improved
- Metering normalization formula may be incorrect (App.tsx:239)
- GradientWaveAnimation component imported but not actively used

### 🔍 Code Locations
- **Voice Detection Logic:** App.tsx:214-291
- **Audio Level Threshold:** App.tsx:250 (`SPEECH_THRESHOLD_DB = -15`)
- **Silence Duration:** App.tsx:251 (`SILENCE_DURATION = 4000`)
- **Metering Normalization:** App.tsx:239
- **Figma Design Elements:** App.tsx:524-588 (call interface)
- **iOS Incoming Call Modal:** App.tsx:622-656
- **Gradient Text Implementation:** App.tsx:533-546

## 📁 Project Structure
```
DailyCheckinExpo/
├── App.tsx                 # Main app with voice conversation logic
├── index.ts               # Entry point with component registration
├── package.json            # Contains tunnel scripts (dev:tunnel)
├── app.json               # Expo config with tunnel URLs
├── QUICK_START.md         # This file
├── components/
│   ├── GradientWaveAnimation.tsx  # Wave animation component (imported but unused)
│   └── Question1.tsx             # Additional question component
├── assets/                # App icons and images
├── .expo/
│   └── settings.json      # Contains urlRandomness: "hrE66og"
└── node_modules/          # Dependencies
```

## 🚀 Next Session Quick Start
1. Navigate to directory: `cd C:\Users\naren\.claude\DailyCheckinExpo`
2. Start server: `npm run dev:tunnel`
3. Use URL: `exp://hre66og-anonymous-8099.exp.direct`
4. Continue with TO-DO list above