# Design Guidelines for Organizational Climate Analysis Platform

## Design Approach
**Selected Approach**: Design System (Material Design)
**Justification**: This enterprise-focused application prioritizes utility, data visualization, and professional credibility. Material Design provides excellent patterns for data-heavy interfaces and dashboard layouts.

## Core Design Elements

### Color Palette
**Primary Colors**:
- Light mode: 234 100% 20% (deep blue)
- Dark mode: 220 50% 85% (soft blue-gray)

**Accent Colors**: 
- Success: 142 76% 36% (professional green)
- Warning: 45 93% 47% (amber)
- Error: 0 84% 60% (coral red)

**Background Colors**:
- Light mode: Clean whites and 220 14% 96% (light gray)
- Dark mode: 220 13% 9% (charcoal) with 220 13% 14% (slightly lighter panels)

### Typography
- **Primary Font**: Inter (Google Fonts)
- **Headers**: 600-700 weight, various sizes (text-2xl to text-4xl)
- **Body Text**: 400-500 weight, text-sm to text-base
- **Data/Metrics**: 500-600 weight for emphasis

### Layout System
**Spacing Primitives**: Use Tailwind units of 4, 6, 8, and 12
- Component spacing: p-4, p-6
- Section spacing: mb-8, mt-12
- Grid gaps: gap-6, gap-8

### Component Library

**Dashboard Layout**:
- Header with company branding and connection status
- Sidebar navigation (collapsible on mobile)
- Main content area with card-based layout
- Status indicators for API connections

**Data Visualization Cards**:
- Clean white/dark cards with subtle shadows
- KPI cards with large numbers and trend indicators
- Progress bars for OKR completion
- List components for strengths/weaknesses

**Forms & Controls**:
- Minimalist input fields with clear labels
- Toggle switches for real-time updates
- Action buttons with loading states
- Connection status badges

**Navigation**:
- Primary: Dashboard, Analysis, Reports, Settings
- Breadcrumb navigation for deep sections
- Active state indicators

## Content Organization

**Dashboard Sections** (Maximum 4 main areas):
1. **Connection Status Header** - Microsoft 365 and OpenAI connection indicators
2. **Executive Summary** - Culture type, overall health score, last updated
3. **Key Metrics Grid** - KPIs and OKRs in card format
4. **Insights Panel** - Strengths, weaknesses, and recommendations

**Visual Hierarchy**:
- Large metrics dominate attention
- Secondary information in muted colors
- Clear section separation with whitespace
- Consistent card-based layout

## Professional Requirements

**Enterprise Aesthetics**:
- Clean, trustworthy design language
- Consistent spacing and alignment
- Subtle animations only for loading states
- High contrast for accessibility compliance

**Data Presentation**:
- Clear typography hierarchy for readability
- Color-coded status indicators
- Progress visualization for OKRs
- Tabular data with proper formatting

**Error Handling**:
- Graceful degradation when APIs fail
- Clear error messages with next steps
- Loading states for data processing
- Connection retry mechanisms

## Images
No hero images required. This is a utility-focused dashboard application that should prioritize data visualization over decorative imagery. Use only:
- Small status icons for connection states
- Company logo in header (user-provided)
- Simple chart/graph visualizations for KPIs

The design should convey professionalism, reliability, and analytical precision appropriate for enterprise organizational analysis.