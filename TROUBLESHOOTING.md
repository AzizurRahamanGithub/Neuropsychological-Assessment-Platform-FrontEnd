# NeuroPsych Platform - Troubleshooting Guide

## Quick Checklist - All Pages Should Now Work ✅

If you're running the app and all pages are working, you're done! The platform is ready to use.

---

## Common Issues & Solutions

### Issue 1: "Module not found" errors
**Error:** `Module not found: Can't resolve '@/components/ui/...'`

**Solution:**
- The UI components are part of the default Next.js shadcn setup
- Ensure you're using the correct v0 project (components should auto-exist)
- If missing, the components are available in your project structure under `/components/ui/`

---

### Issue 2: "useSearchParams must be wrapped in Suspense"
**Error:** `Error: useSearchParams() must be wrapped in a Suspense boundary`

**Status:** ✅ **FIXED**
- Both `/admin/dashboard/patients/page.tsx` and `/admin/dashboard/results/page.tsx` are now properly wrapped
- Created loading.tsx files in both directories

---

### Issue 3: API calls failing with 404
**Error:** `POST http://localhost:8000/api/auth/login/ 404 (Not Found)`

**Solution:**
- This is expected - the **backend is not yet running**
- The frontend is fully functional with mock data
- All pages show mock data and don't require the backend
- When you're ready to connect the backend:
  1. Follow `BACKEND_SETUP.md` to set up Django
  2. Update `API_BASE_URL` in `/src/config/app.ts` to point to your Django backend
  3. The mock data will be replaced with real API calls

---

### Issue 4: localStorage errors (about auth tokens)
**Error:** `localStorage is not defined` in console

**Solution:**
- This only appears during next.js build time
- It's not an issue - the code is client-side only (`'use client'`)
- The error won't affect functionality when running with `npm run dev`

**Why it happens:**
- Server components try to initialize code, but localStorage is browser-only
- The `'use client'` directive prevents this on actual page loads
- To prevent build warnings, auth tokens are checked before localStorage access

---

### Issue 5: "Expected an assignment or function call"
**Error:** Component syntax errors in TypeScript

**Solution:**
- All pages have been verified and fixed
- If you see this, try:
  1. Clear .next cache: `rm -rf .next`
  2. Restart dev server: `npm run dev`
  3. Clear browser cache (Ctrl+Shift+Del)

---

### Issue 6: Mobile responsiveness issues
**Symptom:** Layout looks broken on mobile

**Solution:**
- All pages use Tailwind CSS with responsive prefixes
- Ensure viewport meta tag is in layout.tsx (it should be)
- Check browser dev tools - toggle device toolbar
- The UI is fully responsive (mobile-first design)

---

### Issue 7: Translations not showing
**Error:** English text showing instead of Italian

**Solution:**
- Translation files are at:
  - `/public/locales/it.json` (Italian)
  - `/public/locales/en.json` (English)
- The translation hook loads these files on demand
- Clear browser cache if translations don't load
- Check browser console for any fetch errors

---

### Issue 8: Auto-save not working in questionnaire
**Symptom:** Changes not being saved when filling questionnaire

**Solution:**
- Auto-save is simulated (saves to browser memory, not backend)
- Look for the "Salvato ✓" indicator at the top of questionnaire page
- When backend is ready, this will save to database
- Mock implementation shows 5-second debounce between saves

---

### Issue 9: Chart/graph components not rendering
**Error:** React component rendering errors in results

**Solution:**
- Charts use Recharts (included in default project)
- If charts don't show:
  1. Ensure recharts is installed: `npm list recharts`
  2. Clear .next: `rm -rf .next`
  3. Restart dev server

---

### Issue 10: Sidebar navigation not working
**Symptom:** Clicking sidebar links doesn't navigate

**Solution:**
- Check that you're in the admin dashboard (after login)
- The layout wraps the content - ensure you're viewing:
  - `/admin/dashboard` (has layout)
  - `/admin/dashboard/patients`
  - `/admin/dashboard/questionnaires`
  - `/admin/dashboard/results`
- If navigation still doesn't work:
  1. Check browser console for errors
  2. Verify Next.js router is working (`npm run dev`)
  3. Test by directly accessing URLs

---

## Testing the Application

### Test Scenario 1: Browse the App
1. ✅ Visit `http://localhost:3000`
2. ✅ Click "Clinician Dashboard"
3. ✅ Try different sidebar options
4. ✅ All pages should load instantly with mock data

### Test Scenario 2: Fill a Questionnaire
1. ✅ From home page, click any questionnaire link
2. ✅ Or visit `/questionnaire/test-token`
3. ✅ Fill in questions (auto-saves every 5 seconds)
4. ✅ Progress bar shows completion
5. ✅ Submit to see success page

### Test Scenario 3: Patient Management
1. ✅ Login at `/admin/login` (mock login - any email/password)
2. ✅ View patients list
3. ✅ Click patient to see detail page
4. ✅ Try assigning questionnaires
5. ✅ Export results as Word or CSV

---

## Performance Issues

### Slow page loads?
- Check network tab: should load in <1 second with mock data
- If slower:
  1. Check browser extensions (some slow dev servers)
  2. Clear cache: `npm run dev` with `--reset` flag
  3. Check CPU usage - might be building in background

### High memory usage?
- Normal for Next.js dev server with hot reload
- If excessive:
  1. Restart dev server
  2. Close other browser tabs
  3. Check for infinite loops in console

---

## Getting Help

### Check These Files First:
1. **General questions:** See `README.md`
2. **API integration:** See `BACKEND_SETUP.md`
3. **Development:** See `DEVELOPER_GUIDE.md`
4. **Type errors:** Check `/src/types/index.ts`
5. **Configuration:** Check `/src/config/app.ts`

### Debug Mode:
Enable detailed logging by adding to pages:
```typescript
console.log("[v0] Debug info:", variableName);
```

### Console Inspection:
1. Open browser DevTools (F12)
2. Check Console tab for errors
3. Check Network tab for API calls
4. Check Application tab for localStorage/cookies

---

## Deployment Checklist

Before deploying to production:

- [ ] Backend API is running
- [ ] Update `API_BASE_URL` in `/src/config/app.ts`
- [ ] Database migrations are complete
- [ ] Environment variables are set (see `BACKEND_SETUP.md`)
- [ ] All API endpoints are tested
- [ ] SSL certificate is valid (for HTTPS)
- [ ] Database backups are configured
- [ ] Logging and monitoring are set up
- [ ] Email configuration is ready (for questionnaire links)

---

## Still Having Issues?

1. **Check the console** (F12) for specific error messages
2. **Review the corresponding page file** in `/app/`
3. **Check library files** in `/src/lib/` and `/src/hooks/`
4. **Read the comprehensive guides:**
   - `IMPLEMENTATION_SUMMARY.md` - What was built
   - `DEVELOPER_GUIDE.md` - How to extend
   - `BACKEND_SETUP.md` - Backend setup

---

## Success Indicators ✅

Your app is working correctly if you see:
- ✅ Home page loads with branding
- ✅ Admin login page is accessible
- ✅ Dashboard with mock patient and questionnaire data
- ✅ Patient list shows 4 sample patients
- ✅ Questionnaire pages load with mock data
- ✅ Auto-save indicator appears
- ✅ Results page shows sample results
- ✅ No red error messages in console

**All pages are now verified and ready to use!** 🎉
