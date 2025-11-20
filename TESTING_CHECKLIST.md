# TinyLink - Automated Testing Checklist

## Endpoint Testing Commands

### 1. Health Check
```bash
# Expected: 200 { "ok": true, "version": "1.0" }
curl http://localhost:3000/healthz
```

### 2. Create Link (Auto-generated code)
```bash
# Expected: 201 with new link object
curl -X POST http://localhost:3000/api/links \
  -H "Content-Type: application/json" \
  -d '{"target_url":"https://github.com"}'
```

### 3. Create Link (Custom code)
```bash
# Expected: 201 with link object
curl -X POST http://localhost:3000/api/links \
  -H "Content-Type: application/json" \
  -d '{"target_url":"https://google.com","short_code":"google"}'
```

### 4. Duplicate Code Error
```bash
# Expected: 409 { "error": "Code already exists" }
# Run after creating a link with "google" code above
curl -X POST http://localhost:3000/api/links \
  -H "Content-Type: application/json" \
  -d '{"target_url":"https://example.com","short_code":"google"}'
```

### 5. Invalid URL
```bash
# Expected: 400 { "error": "Invalid URL" }
curl -X POST http://localhost:3000/api/links \
  -H "Content-Type: application/json" \
  -d '{"target_url":"not-a-url"}'
```

### 6. Invalid Code Format
```bash
# Expected: 400 { "error": "Code must be 6-8 alphanumeric characters" }
curl -X POST http://localhost:3000/api/links \
  -H "Content-Type: application/json" \
  -d '{"target_url":"https://google.com","short_code":"abc"}'
```

### 7. List All Links
```bash
# Expected: 200 with array of link objects
curl http://localhost:3000/api/links
```

### 8. Get Link Stats
```bash
# Expected: 200 with link object (use an actual code from step 3)
curl http://localhost:3000/api/links/google
```

### 9. Get Non-existent Link
```bash
# Expected: 404 { "error": "Link not found" }
curl http://localhost:3000/api/links/nonexistent
```

### 10. Redirect (should increment clicks)
```bash
# Expected: 302 redirect to target URL
# Check click count before and after:
curl -L http://localhost:3000/google
# Then check stats: curl http://localhost:3000/api/links/google
# Verify total_clicks increased and last_clicked updated
```

### 11. Delete Link
```bash
# Expected: 200 { "message": "Link deleted successfully" }
curl -X DELETE http://localhost:3000/api/links/google
```

### 12. Verify Deleted Link Returns 404
```bash
# Expected: 404
curl http://localhost:3000/api/links/google
# Expected: 404 error page for redirect
curl http://localhost:3000/google
```

## UI Testing

### Dashboard Page (/)
- [ ] Page loads without errors
- [ ] Header displays "TinyLink - Create short, memorable links instantly"
- [ ] Form for creating links is visible
- [ ] Search box is visible
- [ ] Table shows "No links yet" when empty
- [ ] Table displays after creating a link

### Create Link Form
- [ ] Can enter URL and custom code
- [ ] Submit button creates link
- [ ] Success message appears after creation
- [ ] Form resets after submission
- [ ] Table updates with new link
- [ ] Search filters links correctly

### Form Validation
- [ ] Error message if URL is missing
- [ ] Error message if URL is invalid (no http://)
- [ ] Error message if code is too short (<6 chars)
- [ ] Error message if code is too long (>8 chars)
- [ ] Error message if code contains invalid characters
- [ ] Error message if code already exists (409)

### Dashboard Table
- [ ] Shows short code
- [ ] Shows target URL (truncated with ellipsis if long)
- [ ] Shows total clicks count
- [ ] Shows last clicked date/time
- [ ] Shows "Never" if not clicked
- [ ] View Stats button navigates to /code/:code
- [ ] Copy Link button copies to clipboard
- [ ] Delete button removes link with confirmation

### Stats Page (/code/:code)
- [ ] Page loads correctly
- [ ] Shows short code
- [ ] Shows full target URL
- [ ] Shows total clicks
- [ ] Shows last clicked timestamp
- [ ] Shows creation date
- [ ] Visit Link button opens target URL
- [ ] Copy buttons work
- [ ] Delete button removes link
- [ ] Back button returns to dashboard

### Responsive Design
- [ ] Page works on mobile (320px width)
- [ ] Page works on tablet (768px width)
- [ ] Page works on desktop (1200px+ width)
- [ ] Header is readable on all sizes
- [ ] Form inputs are full width on mobile
- [ ] Table is readable on mobile (may scroll)
- [ ] Buttons are touch-friendly

## Spec Compliance Verification

### Routes
- [ ] GET / → Dashboard
- [ ] GET /code/:code → Stats page
- [ ] GET /:code → Redirect (302)
- [ ] GET /healthz → 200 { "ok": true, "version": "1.0" }

### API Endpoints
- [ ] POST /api/links → 201 on success, 400 on invalid, 409 on duplicate
- [ ] GET /api/links → 200 with all links
- [ ] GET /api/links/:code → 200 with stats, 404 if not found
- [ ] DELETE /api/links/:code → 200 on success, 404 if not found

### Code Format
- [ ] Generated codes are 6-8 alphanumeric characters
- [ ] Custom codes validated as [A-Za-z0-9]{6,8}
- [ ] Codes are globally unique (409 on duplicate)

### Click Tracking
- [ ] Visiting /:code increments total_clicks by 1
- [ ] Visiting /:code updates last_clicked to current timestamp
- [ ] Stats page shows updated values immediately

### Error Handling
- [ ] Invalid URLs return 400
- [ ] Invalid codes return 400
- [ ] Duplicate codes return 409
- [ ] Non-existent links return 404
- [ ] Deleted links return 404 on subsequent access

## Performance Checks

- [ ] Homepage loads in < 1 second
- [ ] Creating a link takes < 500ms
- [ ] Redirect is instant (< 100ms)
- [ ] Search/filter is responsive
- [ ] No console errors in browser
- [ ] No memory leaks (check with DevTools)

## Cross-browser Testing

- [ ] Works in Chrome
- [ ] Works in Firefox
- [ ] Works in Safari
- [ ] Works in Edge
- [ ] Works on mobile browsers

## Security Checks

- [ ] No SQL injection vulnerabilities (using parameterized queries)
- [ ] No XSS vulnerabilities (proper escaping in JS)
- [ ] CORS not needed (same-origin)
- [ ] No sensitive data in console logs
- [ ] Database passwords not exposed in frontend

## Database Verification

```sql
-- Connect to database
psql -U postgres -d tinylink_db

-- Check table exists
\dt

-- Check table structure
\d links

-- Check index exists
\di

-- Sample query
SELECT * FROM links;

-- Count total links
SELECT COUNT(*) FROM links;
```

## Deployment Checklist

- [ ] .env.example provided with all required variables
- [ ] DATABASE_URL uses correct PostgreSQL connection string
- [ ] NODE_ENV can be set to production
- [ ] Server starts without errors
- [ ] All endpoints are accessible
- [ ] Database initializes automatically
- [ ] No hardcoded secrets in code
- [ ] No git ignored files are required for runtime

## Final Verification

1. **Start Fresh**
   - Delete database
   - Create new database
   - Start server
   - Verify all endpoints work

2. **Full User Flow**
   - Create 3-5 short links
   - Visit each link and verify clicks increment
   - Search and filter links
   - View stats for each link
   - Delete a link and verify 404
   - Reload page and verify data persists

3. **Error Cases**
   - Try invalid URLs
   - Try duplicate codes
   - Try invalid code formats
   - Try accessing deleted links
   - Try very long URLs

4. **Performance**
   - Create 100+ links and verify performance
   - Check database query times
   - Verify no N+1 queries

5. **Documentation**
   - README.md is complete and accurate
   - .env.example has all required variables
   - Code is well-commented
   - API responses match spec
