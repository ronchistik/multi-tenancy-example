# Craft.js Integration Complete! 🎉

## What Was Done

Successfully integrated **Craft.js** page builder and converted FlightsPage to JSON-driven dynamic rendering!

---

## Key Changes

### 1. ✅ Installed Craft.js
- Added `@craftjs/core` and `@craftjs/utils` to the web app

### 2. ✅ Created Craft.js-Compatible Components
Created new modular components in `apps/web/src/components/Page/`:
- **Container** - Generic container for layout
- **PageTitle** - Dynamic page heading
- **FlightSearchForm** - Search form with state management
- **FlightResults** - Results display (cards or table)

Each component:
- Has Craft.js `.craft` configuration
- Includes custom settings panel
- Accepts both static props (from JSON) and runtime props (injected)
- Respects tenant design tokens

### 3. ✅ Added Page Configs to Tenant Registry
Updated `apps/api/src/platform/tenant/tenant.types.ts`:
- Added `PageConfig` type
- Added `pages` field to `Tenant` and `PublicTenantConfig`

Created `apps/api/src/platform/pages/defaultPages.ts`:
- `createDefaultFlightsPage()` - Default flights page config
- `createDefaultStaysPage()` - Placeholder for stays page

Updated all 3 tenants in registry with default page configs.

### 4. ✅ Built Page Renderer
Created `apps/web/src/pages/PageRenderer.tsx`:
- Reads JSON page config
- Renders components dynamically using Craft.js
- Injects runtime props (config, API client, state)
- Read-only mode for viewing

### 5. ✅ Built Visual Page Editor
Created `apps/web/src/pages/PageEditor.tsx`:
- Full visual editor with drag-drop
- **Left panel**: Component toolbox (filtered by tenant permissions)
- **Center panel**: Live canvas
- **Right panel**: Component settings
- **Features**: Save, Undo, Redo
- Respects tenant design tokens throughout

### 6. ✅ Integrated with App
Updated `apps/web/src/app.tsx`:
- Uses PageEditor when clicking "🎨 Page Builder"
- Falls back to old PageBuilder if no JSON config

Updated `apps/web/src/pages/TenantShell.tsx`:
- Uses PageRenderer for flights if page config exists
- Falls back to hardcoded FlightsPage if not

---

## How It Works

### JSON-Driven Pages

Each tenant now has page configs stored as Craft.js serialized JSON:

```json
{
  "ROOT": {
    "type": { "resolvedName": "Container" },
    "nodes": ["page-title", "search-form", "results"]
  },
  "page-title": {
    "type": { "resolvedName": "PageTitle" },
    "props": { "text": "", "align": "left" }
  },
  "search-form": {
    "type": { "resolvedName": "FlightSearchForm" },
    "props": { "defaultOrigin": "JFK" }
  },
  "results": {
    "type": { "resolvedName": "FlightResults" }
  }
}
```

### Runtime Props Injection

**Static props** (in JSON):
- `text`, `align`, `defaultOrigin`, etc.
- Serializable, stored in database

**Runtime props** (injected by renderer):
- `config` - Tenant configuration
- `onSearch` - API call function
- `offers` - Search results
- `loading`, `error` - State

The renderer wraps components with runtime props:

```tsx
const resolver = {
  FlightSearchForm: (props) => (
    <FlightSearchForm
      {...props}          // Static from JSON
      config={config}     // Injected
      onSearch={handleSearch} // Injected
    />
  )
};
```

### Tenant Permissions Enforced

The toolbox only shows components the tenant can use:

```tsx
const components = [
  { name: 'Flight Search', enabled: config.enabledVerticals.includes('flights') },
  { name: 'Hotel Search', enabled: config.enabledVerticals.includes('stays') },
];
```

SaverTrips (flights only) won't see hotel components!

---

## How to Use

### 1. Run the App

```bash
pnpm dev
```

### 2. Click "🎨 Page Builder"

You'll see the Craft.js visual editor!

### 3. Edit Your Page

**Left Panel - Add Components:**
- Drag components from the toolbox
- Only enabled verticals shown

**Center Panel - Edit:**
- Click components to select
- Drag to reorder
- See live preview with tenant design tokens

**Right Panel - Settings:**
- Edit component properties
- Save page
- Undo/Redo

### 4. View Result

Close the editor to see your custom page!

---

## Architecture Benefits

### ✅ Multi-Tenant Ready
- Each tenant can have different page layouts
- Design tokens automatically applied
- Permissions enforced at component level

### ✅ JSON-Driven
- Pages stored as JSON (can be in database)
- No code deployment needed for page changes
- Version control friendly

### ✅ Type-Safe
- Full TypeScript support
- Component props validated
- Runtime vs static props separated

### ✅ Extensible
- Easy to add new components
- Pluggable architecture
- Custom settings panels

---

## What's Next?

### To Fully Productionize:

1. **Add Backend API**
   ```typescript
   // Save page config
   PUT /api/config/pages/flights
   Body: { serializedState: "..." }
   
   // Get page config
   GET /api/config/pages/flights
   ```

2. **Add More Components**
   - Hero blocks
   - Text blocks
   - Image components
   - Custom CTAs
   - Stay search/results (mirroring flights)

3. **Add Component Templates**
   - Pre-built page templates per tenant
   - "Budget Search Page"
   - "Luxury Travel Hub"
   - "Corporate Dashboard"

4. **Add Responsive Controls**
   - Mobile/tablet/desktop views
   - Breakpoint-specific props

5. **Add Validation**
   - Ensure pages have required components
   - Validate component combinations

---

## File Structure

```
apps/
├─ api/
│  └─ src/
│     └─ platform/
│        ├─ pages/
│        │  └─ defaultPages.ts          # Default page configs
│        └─ tenant/
│           ├─ tenant.types.ts          # Added PageConfig type
│           └─ tenant.registry.ts       # Added pages to tenants
│
└─ web/
   └─ src/
      ├─ components/
      │  └─ Page/
      │     ├─ Container.tsx             # NEW
      │     ├─ PageTitle.tsx             # NEW
      │     ├─ FlightSearchForm.tsx      # NEW
      │     └─ FlightResults.tsx         # NEW
      │
      └─ pages/
         ├─ PageRenderer.tsx              # NEW - Renders from JSON
         ├─ PageEditor.tsx                # NEW - Visual editor
         ├─ TenantShell.tsx               # UPDATED - Uses renderer
         └─ FlightsPage.tsx               # KEPT - Fallback
```

---

## Current State

### ✅ Working:
- FlightsPage is JSON-driven
- Craft.js editor functional
- All 3 tenants have default configs
- Design tokens applied everywhere
- Tenant permissions enforced
- TypeScript compiles successfully

### 📝 TODO (Future):
- StaysPage JSON conversion
- Backend save API
- More components
- Templates
- Responsive tools

---

## Testing

Try this:

1. **Run the app**: `pnpm dev`
2. **Pick a tenant**: Try SaverTrips
3. **Open builder**: Click "🎨 Page Builder"
4. **Edit page**:
   - Click "Page Title" to select it
   - Change properties in right panel
   - Drag components to reorder
5. **See it live**: Close editor

Everything respects the tenant's design tokens automatically!

---

## Summary

You now have:
- ✅ **JSON-driven pages** (no hardcoded layouts)
- ✅ **Visual Craft.js editor** (drag-drop, live preview)
- ✅ **Tenant-aware** (permissions, design tokens)
- ✅ **Type-safe** (full TypeScript)
- ✅ **Extensible** (easy to add components)

FlightsPage is now fully dynamic and editable! 🚀

**Next**: Do the same for StaysPage, or add more component types!

