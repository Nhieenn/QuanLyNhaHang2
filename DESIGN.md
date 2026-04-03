```markdown
# Design System Specification: The Elevated Organic POS

## 1. Overview & Creative North Star
This design system is built upon the "Creative North Star" of **The Curated Canvas**. We are moving away from the cluttered, industrial aesthetic of legacy Point-of-Sale systems toward an experience that feels as intentional as a Michelin-star menu. 

The system leverages **Friendly Neubrutalism**: it retains the bold, flat geometry and high-contrast accessibility of classic neubrutalism but softens the "harshness" through a sophisticated cream-based palette and generous, editorial whitespace. By utilizing intentional asymmetry and tonal layering rather than rigid borders, we create a tool that feels less like a spreadsheet and more like a premium digital assistant for hospitality professionals.

---

## 2. Colors & Surface Philosophy
The palette is rooted in warmth. We avoid "digital pure white" in favor of organic creams and utilize a "Fresh Teal" primary to evoke a sense of calm and cleanliness.

### The "No-Line" Rule
To achieve a high-end editorial feel, **1px solid borders are strictly prohibited for sectioning.** Boundaries between the Left Sidebar, Top Header, and Main Content must be defined solely through background color shifts. 
- Use `surface` (#f7f6f3) for the primary background.
- Use `surface_container_low` (#f1f1ee) for secondary panels like the Sidebar.
- Use `surface_container_highest` (#ddddd9) to define interactive zones without adding visual noise.

### Surface Hierarchy & Nesting
Treat the tablet UI as a series of physical layers. 
- **Tier 1 (Base):** `surface` - The foundation of the app.
- **Tier 2 (Panels):** `surface_container` - Used for the persistent Left Sidebar and Header.
- **Tier 3 (Interactive):** `surface_container_lowest` (#ffffff) - Reserved for high-priority cards or input fields to make them "pop" against the cream background.

### Signature Textures
While the system is "flat," we introduce "Visual Soul" through tonal washes. For primary action buttons, do not use a simple flat fill; instead, use a subtle transition from `primary` (#006760) to `primary_dim` (#005a54) to provide a tactile, pressable quality that purely flat designs lack.

---

## 3. Typography
Our typography pairing is designed for high-speed legibility under cafe lighting while maintaining an editorial edge.

*   **Display & Headlines:** *Plus Jakarta Sans*. This is our "Brand Voice." Its modern, geometric curves provide the "Friendly" in our Neubrutalism.
    *   `display-lg`: 3.5rem (Use sparingly for totals or large numeric feedback).
    *   `headline-md`: 1.75rem (Used for section titles like "Table Map").
*   **Body & UI Labels:** *Work Sans*. A workhorse typeface chosen for its high x-height and exceptional readability on 4:3 tablet screens.
    *   `title-md`: 1.125rem (Primary UI text, button labels).
    *   `body-md`: 0.875rem (Secondary details, ingredient lists).

---

## 4. Elevation & Depth
We eschew traditional "Drop Shadows" in favor of **Tonal Layering** and **Ambient Light.**

-   **The Layering Principle:** To lift a card, place a `surface_container_lowest` (#ffffff) element on a `surface_container` (#e8e8e5) background. This creates a natural, soft lift.
-   **Ambient Shadows:** For floating modals or urgent notifications, use an extra-diffused shadow. 
    *   *Formula:* Blur: 24px, Opacity: 6%, Color: `on_surface` (#2e2f2d). This mimics natural light rather than a digital effect.
-   **Glassmorphism:** For the "Kitchen KDS" or "Order Overlay," use a backdrop-blur (12px) with `surface_container_lowest` at 85% opacity. This keeps the user grounded in their current context while focusing on the task.

---

## 5. Components

### 5.1 Buttons (The High-Contrast Action)
Buttons must feel substantial and tactile.
-   **Primary:** `primary` (#006760) background with `on_primary` (#bffff6) text. Roundedness: `md` (0.75rem / 12px).
-   **Secondary:** `primary_container` (#73f1e4) background. No border.
-   **Tertiary:** Text-only using `primary` color, bold weight.

### 5.2 The Sidebar (The Navigation Spine)
-   **Structure:** Occupies the left-most column. Background: `surface_container` (#e8e8e5).
-   **Active State:** Use a `primary_fixed` (#73f1e4) pill-shaped background behind the icon. 
-   **Separation:** No dividers. Use `Spacing 6` (2rem) between nav items to allow for "fat-finger" touch accuracy.

### 5.3 Table Map Cards
-   **Shape:** `xl` (1.5rem / 24px) rounded corners.
-   **Occupied State:** `tertiary_container` (#ff928f) to indicate warmth/activity.
-   **Available State:** `surface_container_lowest` (#ffffff) with a `primary` (#006760) label.
-   **Constraint:** Never use a border to define a table. Use the color block of the table itself against the `surface` background.

### 5.4 Input Fields
-   **Style:** `surface_container_highest` (#ddddd9) fills.
-   **Focus State:** A "Ghost Border" using `outline` (#767775) at 20% opacity. 
-   **Error State:** `error_container` (#fb5151) background with `on_error_container` text.

---

## 6. Do's and Don'ts

### Do
*   **Do** use `Spacing 8` (2.75rem) for outer page margins to ensure the app feels premium and uncrowded.
*   **Do** utilize `surface_variant` (#ddddd9) for inactive/empty states (e.g., an empty seat at a table).
*   **Do** align all text to a rigorous baseline to maintain the editorial "grid" feel.

### Don't
*   **Don't** use black (#000000) for text. Use `on_surface` (#2e2f2d) to maintain the soft, organic tone of the design system.
*   **Don't** use dividers or lines to separate list items. Use vertical spacing (e.g., `Spacing 3`) or alternating subtle shifts between `surface` and `surface_container_low`.
*   **Don't** use standard "Material Blue" for links or actions. Every interactive element must stay within the Teal/Cream/Charcoal ecosystem.

---

## 7. Layout Specification (4:3 Landscape)
-   **Top Header:** 80px height. Fixed. Use `surface_container_low` (#f1f1ee).
-   **Left Sidebar:** 240px width. Fixed. Use `surface_container` (#e8e8e5).
-   **Main Content Area:** Fluid. Should feature a minimum of 32px (`Spacing 10`) padding from all edges to avoid "touch-dead" zones near the tablet bezel.