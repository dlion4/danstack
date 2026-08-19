Here's the massively advanced GrowMO blueprint — expanded from 16 to **28 pages** with deep Kenyan localization, flexible crop modules, granular financial flows, predictive intelligence, and every workflow a farmer would ever need.

---

# GrowMO — Advanced Comprehensive Platform Blueprint v2.0
## 28-Page Layout & Data Architecture for Kenyan Farmers

---

## PAGE 1: Onboarding & Farm Profile (Enhanced)

**Purpose:** Multi-step intelligent onboarding that captures everything needed to personalize the entire platform — from soil to market.

### Section 1.1: Identity & KYC
| Field | Type | Validation | Notes |
|-------|------|------------|-------|
| Full name | Text | Required | As per ID |
| National ID number | Text | 8-digit validation | Optional but unlocks loans |
| Phone number | Tel | +254 format | Primary login & M-Pesa |
| Alternative phone | Tel | Optional | Backup for alerts |
| Email | Email | Optional | For PDF reports |
| Date of birth | Date | Required | For demographics |
| Gender | Select | Male/Female/Non-binary | For gender-specific programs |
| Preferred language | Select | English / Kiswahili / Kalenjin / Kikuyu / Luhya / Luo / Swahili | Affects all UI text |
| Literacy level | Select | High / Medium / Low | Changes UI complexity |
| Profile photo | Upload | Optional | For team views |

### Section 1.2: Farm Location & Mapping
| Field | Type | Details |
|-------|------|---------|
| County | Dropdown | All 47 Kenyan counties |
| Sub-county | Dropdown | Auto-populated from county |
| Ward | Dropdown | Auto-populated from sub-county |
| Village/location | Text | Free text |
| GPS coordinates | Auto-capture | Lat/Long from phone GPS |
| Farm name | Text | Farmer's chosen name |
| Number of plots | Number | 1–50 |
| Total acreage | Number | Sum of all plots |
| Plot mapping | Map interface | Tap/draw boundaries on satellite map, each plot gets a name, size auto-calculated |

**Plot Detail Sub-form (repeats per plot):**
| Field | Details |
|-------|---------|
| Plot name | e.g., "Shamba ya kwa nyumba" |
| Plot size | Auto from map or manual entry (acres) |
| Soil type | Loam / Clay / Sandy / Red volcanic / Black cotton / Sandy loam / Clay loam |
| Soil pH | If known (5.0–8.5) |
| Slope | Flat / Gentle / Moderate / Steep |
| Water source | Rain-fed / River / Stream / Borehole / Dam / Pan / Irrigation scheme / None |
| Irrigation type | Drip / Sprinkler / Furrow / Flooding / None |
| Current use | Fallow / Cropland / Pasture / Forest |
| Access road | All-weather / Seasonal / No road |
| Distance to nearest market (km) | Number |
| Distance to nearest all-weather road (km) | Number |

### Section 1.3: Agro-Ecological Zone Classification
System auto-classifies based on GPS + altitude + rainfall data:

| Zone Code | Zone Name | Altitude (m) | Rainfall (mm/yr) | Temperature (°C) | Example Counties |
|-----------|-----------|-------------|-------------------|-------------------|------------------|
| LH1 | Upper Highland | >2200 | >1400 | 10–18 | Uasin Gishu (Timboroa), Nyandarua (Kipipiri) |
| LH2 | Lower Highland | 1900–2200 | 1000–1400 | 14–20 | Kericho, Nandi, parts of Nakuru |
| UM1 | Upper Midland | 1500–1900 | 900–1200 | 16–22 | Kiambu, Nyeri, Murang'a, Meru |
| UM2 | Lower Midland | 1200–1500 | 700–1000 | 18–24 | Kakamega, Bungoma, Vihiga, Kisii |
| UM3 | Lower Midland Dry | 1200–1500 | 500–700 | 20–25 | Machakos, Kitui, Makueni |
| LM1 | Low Midland | 900–1200 | 600–900 | 22–26 | Kisumu, Siaya, Homa Bay |
| LM2 | Low Midland Dry | 600–900 | 400–600 | 24–28 | Mbeere, Mwingi, parts of Tana River |
| LM3 | Low Midland Arid | 600–900 | 250–400 | 25–30 | Garissa, Wajir (riverine) |
| LM4 | Low Midland Very Arid | <600 | <250 | 28–35 | Turkana, Mandera, Marsabit |
| CL1 | Coastal Lowland | 0–400 | 800–1200 | 25–32 | Kilifi, Kwale, Lamu |
| CL2 | Coastal Lowland Dry | 0–400 | 400–800 | 26–34 | Taita Taveta (low), parts of Kwale |

### Section 1.4: Farm Assets Inventory
| Category | Items (toggle on/off) | Quantity | Condition | Estimated Value (KES) |
|----------|----------------------|----------|-----------|-----------------------|
| Power & Tillage | Tractor, Ox-plough, Hand hoe, Rototiller | | New/Good/Fair/Poor | |
| Irrigation | Drip kit, Sprinkler, Pump (diesel/solar/electric), Water tank, Pipes | | | |
| Structures | Greenhouse (size), Shade net, Store/granary, Poultry house, Cow shed | | | |
| Transport | Pickup, Motorcycle (boda boda), Wheelbarrow, Animal-drawn cart | | | |
| Processing | Maize mill, Thresher, Dryer, Grader, Crates, Sacks | | | |
| Livestock | Cattle (dairy/beef), Goats, Sheep, Poultry, Pigs, Bees (hives) | Breed, count | | |
| Technology | Smartphone, Feature phone, Solar panel, Radio | | | |

### Section 1.5: Crop History (Last 3–5 Seasons)
| Season | Crop | Variety | Acreage | Yield | Price Received | Challenges | Satisfaction (1–5) |
|--------|------|---------|---------|-------|----------------|------------|---------------------|
| SR 2024 | Cabbage | Gloria F1 | 0.5 | 7,000 heads | KES 25/head | Black rot, low prices | 3 |
| LR 2024 | Maize | H6213 | 2 | 18 bags | KES 3,200/bag | Fall Armyworm | 2 |
| SR 2023 | Beans | Rosecoco | 1 | 6 bags | KES 7,000/bag | Poor germination | 2 |

### Section 1.6: Farming Goals & Preferences
| Field | Options |
|-------|---------|
| Primary goal | Subsistence / Commercial / Export / Contract farming / Mixed |
| Target income/season (KES) | Free number input |
| Preferred crops | Multi-select from crop library |
| Organic preference | Conventional / Organic / Transitioning to organic |
| Certification interest | GlobalG.A.P / KS1758 / Organic / None |
| Labour model | Family only / Family + casuals / Full hired labour |
| Market preference | Local market / Broker / Cooperative / Direct to supermarket / Export / Online |
| Risk tolerance | Low (safe varieties) / Medium / High (new varieties, high input) |
| Join farmer group | Yes/No — if yes, suggest nearby groups |

### Section 1.7: M-Pesa & Financial Setup
| Field | Details |
|-------|---------|
| M-Pesa phone number | Pre-filled from signup |
| M-Pesa registered name | Text input |
| Bank account (optional) | Bank name, branch, account number |
| GrowMO Wallet PIN | 4-digit PIN setup |
| Enable auto-pay | Toggle on/off |

### Onboarding Completion Flow
1. Step 1: Phone + OTP verification
2. Step 2: Basic identity (name, ID, language, literacy)
3. Step 3: Farm location + GPS capture + plot mapping
4. Step 4: Soil & water details per plot
5. Step 5: Asset inventory (quick-tap checklist)
6. Step 6: Crop history (optional, can skip)
7. Step 7: Goals & preferences
8. Step 8: M-Pesa setup + wallet PIN
9. **System generates:** Agro-ecological zone, recommended crops, weather summary, and navigates to Dashboard

---

## PAGE 2: Dashboard Home (Enhanced)

**Purpose:** The farmer's daily command center — everything at a glance without scrolling endlessly.

### Section 2.1: Header Bar
| Element | Details |
|---------|---------|
| Farm name & logo | "Mary's Farm — Kiambu" |
| Weather icon + temp | ☁️ 24°C |
| Wallet balance chip | KES 35,000 (tappable → Page 14) |
| Notification bell | Red badge with count |
| Profile avatar | Tappable → Page 15 |
| Language toggle | EN | SW |

### Section 2.2: Weather Hero Card (Full Width)
| Data Point | Display |
|------------|---------|
| Location | Kiambu County, Githunguri |
| Current temp | 24°C |
| Feels like | 22°C |
| Humidity | 78% |
| Wind | 12 km/h NE |
| Rainfall (last 24h) | 5.2 mm |
| Rainfall probability today | 70% |
| Weather icon | Animated cloud with rain |
| Seasonal status | "Short rains active — Week 3" |
| 3-day mini forecast | Today: 🌧️ 22°C / Tomorrow: 🌧️ 21°C / Day after: ⛅ 23°C |
| Crop-specific weather alert | "High humidity + rain = black rot risk for cabbage. Apply Mancozeb within 48hrs." |

### Section 2.3: Active Crops Carousel (Horizontal Scroll)
Each crop card shows:
| Element | Example |
|---------|---------|
| Crop icon | 🥬 |
| Crop name | Cabbage — Gloria F1 |
| Plot | "Plot 1: Shamba ya nyumba" |
| Growth stage | Vegetative Phase |
| Day counter | Day 24 of 90 |
| Progress bar | 27% filled, color-coded by stage |
| Next task due | "Top dress CAN — in 3 days" |
| Status indicator | 🟢 Healthy / 🟡 Attention / 🔴 Problem |
| Tap action | Opens Page 4 (Crop Management) |

### Section 2.4: Today's Tasks (Priority Ordered)
| Priority | Task | Crop | Time | Assigned To | Status |
|----------|------|------|------|-------------|--------|
| 🔴 Urgent | Scout for Diamondback moth | Cabbage | 8:00 AM | Self | Pending |
| 🟡 Due today | Apply Mancozeb fungicide | Cabbage | 10:00 AM | Worker: John | Scheduled |
| 🟢 Upcoming | Collect manure from dairy farm | Cabbage | 2:00 PM | Self | Pending |
| 🟢 Upcoming | Pay John for yesterday's weeding | — | Anytime | — | Unpaid |

Each task is tappable to expand with full details, notes, input quantities, and completion button.

### Section 2.5: Financial Snapshot (Compact)
| Metric | Value | Trend |
|--------|-------|-------|
| Wallet balance | KES 35,000 | — |
| Season budget (Cabbage) | KES 56,000 | — |
| Spent to date | KES 22,000 | — |
| Remaining | KES 34,000 | — |
| Unpaid obligations | KES 4,500 | 🔴 |
| Projected revenue | KES 240,000 | — |
| Projected profit | KES 184,000 | ↑ |

Mini donut chart: Budget spent vs remaining.

### Section 2.6: AI Insights Strip (Scrollable Horizontal Cards)
| Card | Content |
|------|---------|
| 💡 Tip | "Your cabbage is entering the heading stage in 10 days. Reduce nitrogen, increase potassium with foliar feed for tighter heads." |
| ⚠️ Warning | "Fall Armyworm reported in neighboring farms in Limuru. Scout your maize immediately." |
| 📈 Market | "Cabbage prices at Marikiti dropped 15% this week due to high supply. Consider storing or finding alternative market." |
| 🌧️ Weather | "Dry spell expected from Dec 15–28. Plan irrigation for cabbage." |
| 👥 Benchmark | "Your cabbage cost per head is KES 3.50. Top farmers in Kiambu achieve KES 2.80. Consider bulk manure purchase." |

### Section 2.7: Market Ticker (Compact Horizontal Scroll)
| Crop | Market | Price | Change |
|------|--------|-------|--------|
| Cabbage | Marikiti | KES 30/head | ↓ -5 |
| Tomato | Kangemi | KES 3,200/crate | ↑ +400 |
| Maize | Eldoret | KES 3,500/bag | → 0 |
| Beans | Nakuru | KES 7,500/bag | ↑ +500 |

### Section 2.8: Quick Actions Grid (2×3)
| Icon | Action | Destination |
|------|--------|-------------|
| ➕ | Add New Crop | Page 3 |
| 💰 | Record Expense | Page 7 |
| 👷 | Pay Labour | Page 6 |
| 🤖 | Ask AI | Page 9 |
| 📊 | View Analytics | Page 11 |
| 🛒 | Check Market | Page 10 |

### Section 2.9: Upcoming Payments (Mini List)
| Pay To | Amount | Date | Status |
|--------|--------|------|--------|
| John Mwangi (weeding) | KES 500 | Today | ⏳ Scheduled |
| Agro-vet (CAN fertilizer) | KES 5,000 | 28 Oct | 📋 Pending |
| Peter Kamau (transport) | KES 3,000 | 15 Jan | 🔮 Future |

### Section 2.10: Seasonal Timeline (Mini Gantt)
A horizontal bar showing all active crops on a calendar timeline:
```
Oct        Nov        Dec        Jan
|----------|----------|----------|----------|
Cabbage    [====VEG====][==HEAD==][HARV]
Maize      [==PLANT==][===VEG===][TASS][HARV]
```

---

## PAGE 3: Crop Planner & Variety Selector (Enhanced)

**Purpose:** The farmer's pre-planting decision engine — choose the right crop, variety, and planting window with full cost/revenue projections.

### Section 3.1: Crop Group Selector (Top Tabs)
| Tab | Icon | Crops Included |
|-----|------|----------------|
| 🌾 Grains | Maize, Wheat, Rice, Sorghum, Millet, Barley, Oats |
| 🥬 Vegetables | Cabbage, Kale (Sukuma), Spinach, Tomato, Onion, Capsicum, Eggplant, cucumber, lettuce |
| 🥔 Tubers & Roots | Potato, Sweet Potato, Cassava, Carrot, Beetroot, Radish |
| 🫘 Legumes | Beans (dry & green), Peas, Groundnuts, Cowpeas, Green grams, Pigeon peas, Soya beans |
| 🌳 Fruits | Avocado, Mango, Banana, Papaya, Pineapple, Citrus, Passion fruit, Strawberry, Watermelon |
| 🌿 Long-Season/Industrial | Sugarcane, Tea, Coffee, Pyrethrum, Sisal, Cotton, Tobacco |
| 🌸 Herbs & Spices | Basil, Coriander, Rosemary, Chili, Turmeric, Ginger, Vanilla |
| 🌱 Pasture & Fodder | Napier grass, Boma Rhodes, Lucerne, Brachiaria, Sorghum Sudan grass |

### Section 3.2: Crop Cards Grid (Within Selected Group)
Each crop card shows:
| Element | Example (Cabbage) |
|---------|-------------------|
| Image | Photo of healthy cabbage |
| Name | Cabbage |
| Kiswahili name | Kabichi |
| Maturity | 75–90 days |
| Best zones | UM1, UM2, LH2 |
| Seasons | Short rains (Oct–Dec), Long rains (Mar–May), Year-round (irrigated) |
| Est. cost/acre | KES 50,000–70,000 |
| Est. yield/acre | 15,000–20,000 heads |
| Est. revenue/acre | KES 375,000–800,000 |
| Difficulty | ⭐⭐ (Easy) |
| Water needs | Moderate |
| Popularity in county | 85% of vegetable farmers in Kiambu grow cabbage |
| Tap action | Opens Crop Detail Sheet |

### Section 3.3: Crop Detail Sheet (Bottom Sheet or Full Page)
**For Cabbage in Kiambu County:**

**3.3.1 Overview**
| Data | Value |
|------|-------|
| Scientific name | Brassica oleracea var. capitata |
| Kiswahili | Kabichi |
| Family | Brassicaceae |
| Origin | Mediterranean |
| Grown in Kenya | Nationwide, major: Kiambu, Nyandarua, Nakuru, Meru, Kisii |

**3.3.2 Variety Comparison Table**
| Variety | Company | Maturity (days) | Head Weight (kg) | Yield/Acre (heads) | Price/10g (KES) | Disease Resistance | Suitability |
|---------|---------|-----------------|-------------------|---------------------|------------------|-------------------|-------------|
| Gloria F1 | Simlaw | 75–80 | 1.5–2.5 | 16,000–18,000 | 800 | Black rot tolerant | Open field, highland |
| Pruktor F1 | East African Seed | 80–85 | 2.0–3.0 | 14,000–16,000 | 1,000 | Very good | Open field, mid-altitude |
| Riana F1 | Kenya Seed | 70–75 | 1.2–2.0 | 18,000–20,000 | 600 | Moderate | Quick maturing, short rains |
| Copenhagen Market | OP | 65–70 | 1.0–1.5 | 15,000–17,000 | 200 | Low | Budget option |
| Golden Acre | OP | 60–65 | 0.8–1.5 | 16,000–18,000 | 150 | Low | Earliest, small heads |

**AI Highlight:** "For your Kiambu farm (UM1, 1800m), Gloria F1 gives best balance of yield, disease resistance, and market preference. Marikiti buyers pay 10% more for Gloria F1 vs open-pollinated."

**3.3.3 Planting Calendar (Kiambu-Specific)**
| Season | Planting Window | Harvest Window | Risk | Recommendation |
|--------|-----------------|----------------|------|----------------|
| Long rains | March 1–April 15 | June–July | Waterlogging in heavy clay | ✅ Good — ensure drainage |
| Short rains | October 1–November 15 | January–February | Black rot in wet Nov | ✅ Best — plan fungicide |
| Irrigated (dry season) | June–August | September–October | High irrigation cost, heat stress | ⚠️ Only with reliable water |
| Irrigated (hot dry) | January–February | April–May | Aphid pressure, heat | ⚠️ Moderate risk |

**3.3.4 Full Cost Estimate per Acre (Dynamic Calculator)**
| Item | Quantity | Unit Price (KES) | Total (KES) | When Needed |
|------|----------|-------------------|-------------|-------------|
| Land preparation (ploughing) | 1 acre | 4,000 | 4,000 | Week -2 |
| Harrowing & ridging | 1 acre | 2,000 | 2,000 | Week -1 |
| Farmyard manure | 5 tonnes | 6,000/tonne | 30,000 | Week -1 |
| DAP fertilizer (basal) | 50 kg | 6,500 | 6,500 | Planting day |
| Cabbage seed (Gloria F1) | 200g (4 sachets × 50g) | 800/sachet | 3,200 | Nursery (4 weeks before) |
| Nursery trays/pots | 500 | 10 | 5,000 | Nursery |
| CAN fertilizer (top dress 1) | 50 kg | 5,000 | 5,000 | Week 3 |
| CAN fertilizer (top dress 2) | 25 kg | 2,500 | 2,500 | Week 6 |
| Foliar feed (potassium) | 2 litres | 1,200 | 2,400 | Week 7–8 |
| Mancozeb (fungicide) | 2 kg | 1,000 | 2,000 | Week 4, 6, 8 |
| Duduthrin (insecticide) | 1 litre | 1,500 | 1,500 | As needed |
| Labour: Nursery | 5 days × 1 worker | 500/day | 2,500 | Week -4 to -1 |
| Labour: Transplanting | 1 day × 5 workers | 500/day | 2,500 | Planting day |
| Labour: Weeding 1 | 1 day × 4 workers | 500/day | 2,000 | Week 4 |
| Labour: Weeding 2 | 1 day × 3 workers | 500/day | 1,500 | Week 7 |
| Labour: Spraying | 3 sessions × 1 worker | 500/session | 1,500 | Weeks 4, 6, 8 |
| Labour: Harvest | 1 day × 6 workers | 600/day | 3,600 | Week 11 |
| Crates/sacks | 400 crates | 50 | 20,000 | Harvest |
| Transport to market | 1 trip | 5,000 | 5,000 | Harvest |
| **TOTAL** | | | **101,700** | |

**Cost per head:** KES 101,700 ÷ 17,000 heads = **KES 5.98/head**

**3.3.5 Revenue Projection (Dynamic)**
| Scenario | Price/Head | Yield (heads) | Gross Revenue | Net Profit | ROI |
|----------|-----------|---------------|---------------|------------|-----|
| Best case | KES 45 | 18,000 | KES 810,000 | KES 708,300 | 696% |
| Average case | KES 30 | 17,000 | KES 510,000 | KES 408,300 | 401% |
| Worst case | KES 15 | 12,000 | KES 180,000 | KES 78,300 | 77% |
| Current market | KES 30 | — | KES 510,000 | KES 408,300 | 401% |

**3.3.6 "Plant This Crop" Button**
Tapping opens a confirmation sheet:
- Select plot (from farmer's plots)
- Select variety
- Select planting date (or "Recommended: October 20")
- Select acreage within plot
- Review cost estimate
- Confirm → Crop created in Page 4 with full auto-generated plan

---

## PAGE 4: Crop Management & Growth Tracker (Enhanced)

**Purpose:** The living dashboard for each active crop — from soil to harvest. Fully modular so a cabbage farmer sees different widgets than a maize farmer.

### Section 4.1: Crop Header
| Element | Details |
|---------|---------|
| Crop name & variety | Cabbage — Gloria F1 |
| Plot name & size | Plot 1: Shamba ya nyumba — 0.5 acre |
| Planting date | October 20, 2026 |
| Expected harvest | January 18, 2027 (90 days) |
| Days elapsed | 24 |
| Days remaining | 66 |
| Overall health score | 85/100 (🟢 Good) |
| Weather for this crop | Mini 3-month forecast inline |
| Action buttons | Edit crop | Archive | Delete |

### Section 4.2: Growth Timeline (Visual)
A horizontal or vertical timeline with stages:

```
✅ Nursery        ✅ Transplanting    🔄 Vegetative       ⬜ Heading       ⬜ Maturity    ⬜ Harvest
Sep 20 - Oct 20   Oct 20             Oct 20 - Nov 20    Nov 20 - Dec 20  Dec 20 - Jan 10  Jan 15-18
[================] [==================] [===▶============] [===============] [============] [========]
```

Each stage node is tappable to expand with:
- Stage description
- Duration
- Key activities
- Required inputs
- Weather considerations
- Common problems

### Section 4.3: Current Stage Deep-Dive (Vegetative Phase)
| Data Point | Value |
|------------|-------|
| Stage name | Vegetative Growth |
| Started | October 20 |
| Ends | November 20 (estimated) |
| Duration | 30 days |
| Days in stage | 4 of 30 |
| Key activities | Weeding, top dressing CAN, pest scouting, irrigation |
| Next stage | Heading (Nov 20) |
| Conditions needed | 15–25°C, adequate moisture, nitrogen for leaf growth |

### Section 4.4: Task Checklist (Auto-Generated & Dynamic)

**Completed Tasks (Greyed/Checked):**
| Date | Task | Input Used | Labour | Cost | Done By | Notes |
|------|------|------------|--------|------|---------|-------|
| Sep 20 | Prepare nursery bed | — | Self | KES 0 | Mary | Used shade net |
| Sep 20 | Sow Gloria F1 seeds | 4 sachets (200g) | Self | KES 3,200 | Mary | Spacing 5cm |
| Oct 1–19 | Water nursery daily | — | Self | KES 0 | Mary | Morning only |
| Oct 20 | Prepare field (plough, harrow, make beds) | — | 2 workers × 1 day | KES 1,000 | John + Peter | Beds 1m wide |
| Oct 20 | Apply manure to beds | 2.5 tonnes | 2 workers × 1 day | KES 15,000 + KES 1,000 | John + Peter | Well-rotted |
| Oct 20 | Apply DAP basal | 25 kg | Self | KES 3,250 | Mary | Mixed in soil |
| Oct 20 | Transplant seedlings | — | 5 workers × 1 day | KES 2,500 | John + 4 others | Spacing 45cm × 45cm |

**Pending Tasks (Active/Upcoming):**
| Date | Task | Input Needed | Labour Needed | Est. Cost | Priority | Status |
|------|------|-------------|---------------|-----------|----------|--------|
| Oct 25 | First weeding | — | 3 workers × 1 day | KES 1,500 | High | ⏳ Upcoming |
| Nov 3 | Top dress CAN (1st) | 25 kg CAN | 1 worker | KES 2,750 | High | 📋 Planned |
| Nov 5 | Scout for Diamondback moth | — | Self | KES 0 | High | 📋 Planned |
| Nov 10 | Second weeding | — | 2 workers × 1 day | KES 1,000 | Medium | 📋 Planned |
| Nov 15 | Spray Mancozeb (black rot prevention) | 500g Mancozeb | 1 worker | KES 1,000 | High | 📋 Planned |
| Nov 20 | Top dress CAN (2nd) | 12.5 kg CAN | Self | KES 1,250 | Medium | 📋 Planned |
| Dec 1 | Spray Mancozeb (2nd application) | 500g Mancozeb | 1 worker | KES 1,000 | Medium | 📋 Planned |
| Dec 10 | Apply potassium foliar feed | 1 litre | Self | KES 1,200 | Medium | 📋 Planned |
| Dec 15 | Scout for aphids | — | Self | KES 0 | Low | 📋 Planned |
| Jan 10 | Stop irrigation (pre-harvest) | — | — | KES 0 | Medium | 📋 Planned |
| Jan 15 | Harvest | Crates, labour | 6 workers × 1 day | KES 3,600 + KES 10,000 crates | High | 📋 Planned |
| Jan 15 | Transport to market | — | 1 boda/truck | KES 2,500 | High | 📋 Planned |

Each task has:
- ✅ Mark Complete button (with optional photo upload, notes, actual cost)
- ⏭️ Skip button (with reason)
- ✏️ Edit button
- 📅 Reschedule button

### Section 4.5: Modular Widgets (Farmer Can Add/Remove)

**Available Widgets for Vegetables:**
| Widget | Default On? | Description |
|--------|-------------|-------------|
| Nursery Tracker | ✅ | Seed sowing, germination rate, seedling health |
| Transplanting Log | ✅ | Date, survival rate, spacing |
| Fertilizer Schedule | ✅ | All fertilizer applications with dates, rates, type |
| Pest & Disease Monitor | ✅ | Scouting records, identification, treatment |
| Weed Management | ✅ | Weeding schedule, method (hand/herbicide) |
| Irrigation Log | ✅ | Amount, frequency, source |
| Staking/Trellising | ❌ | (For tomatoes) — hidden for cabbage |
| Pruning | ❌ | (For tomatoes, fruits) — hidden for cabbage |
| Spraying Records | ✅ | Pesticide/fungicide applications, PHI tracking |
| Harvest Tracker | ✅ | Expected date, actual, quantity, quality |
| Post-Harvest Handling | ✅ | Grading, packing, storage, transport |
| Soil Moisture | ⚠️ | If soil sensor connected |
| Growth Photos | ✅ | Weekly photo timeline |
| Cost Tracker (per crop) | ✅ | Running total vs budget |
| Weather Overlay | ✅ | Rainfall received vs needed |
| Yield Prediction | ✅ | AI-updated based on conditions |
| Compare to Benchmark | ✅ | vs other Kiambu cabbage farmers |

**Widget Management UI:**
A "Customize View" button opens a drag-and-drop panel:
```
[✅] Fertilizer Schedule     [↑] [↓] [—]
[✅] Pest & Disease Monitor  [↑] [↓] [—]
[❌] Staking/Trellising      [+]
[❌] Pruning                 [+]
[✅] Irrigation Log          [↑] [↓] [—]
[✅] Harvest Tracker         [↑] [↓] [—]
```

**For Grains (Maize), the default widgets would be different:**
| Widget | Default On? |
|--------|-------------|
| Land Preparation | ✅ |
| Planting Log | ✅ |
| Germination Rate | ✅ |
| Fertilizer Schedule (DAP + CAN) | ✅ |
| Weed Control | ✅ |
| Fall Armyworm Monitor | ✅ |
| Tasseling & Silking Tracker | ✅ |
| Grain Filling Monitor | ✅ |
| Moisture Content Tracker | ✅ |
| Harvest & Threshing | ✅ |
| Drying & Storage | ✅ |
| Staking/Trellising | ❌ (never shown) |
| Nursery Tracker | ❌ (never shown) |

**For Long-Season Crops (Sugarcane):**
| Widget | Default On? |
|--------|-------------|
| Land Preparation & Ridges | ✅ |
| Planting (Setts) | ✅ |
| Germination & Tillering | ✅ |
| Fertilizer Schedule (multi-year) | ✅ |
| Weed Control (ratoon management) | ✅ |
| Irrigation/Rainfall Log | ✅ |
| Pest (Stem Borer) & Disease | ✅ |
| Ratoon Cycle Tracker | ✅ |
| Trashing | ✅ |
| Harvest Cycle (when mature) | ✅ |
| Transport to Factory | ✅ |
| Factory Payment Tracking | ✅ |

### Section 4.6: Fertilizer Schedule Widget (Expanded)
| # | Date | Stage | Fertilizer | Rate | Method | Purpose | Actual Date | Actual Cost |
|---|------|-------|------------|------|--------|---------|-------------|-------------|
| 1 | Oct 20 | Planting | DAP | 50 kg/acre → 25 kg for 0.5ac | Basal in planting hole | Root development | Oct 20 ✅ | KES 3,250 |
| 2 | Nov 3 | Vegetative (2 wks) | CAN | 50 kg/acre → 25 kg | Side dress along rows | Leaf growth | — | — |
| 3 | Nov 20 | Late vegetative | CAN | 25 kg/acre → 12.5 kg | Side dress | Sustained growth | — | — |
| 4 | Dec 10 | Pre-heading | Potassium foliar | 1L/acre → 0.5L | Foliar spray | Head formation | — | — |

**AI Recommendation inline:** "Based on your soil test (pH 5.8, low calcium), consider adding 50 kg/acre of agricultural lime during land prep next season. Also, your manure application is adequate — no need for additional organic matter."

### Section 4.7: Pest & Disease Monitor Widget (Expanded)
**Common Pests for Cabbage in Kiambu:**
| Pest | Risk Level (Current) | Identification | Damage | Treatment | Cost |
|------|---------------------|----------------|--------|-----------|------|
| Diamondback moth | 🟡 Medium | Small green caterpillars, windowed leaves | Holes in leaves, stunting | Duduthrin 1.5ml/20L, spray evening | KES 1,500/session |
| Aphids | 🟢 Low | Green clusters on undersides | Curling, honeydew, sooty mold | Imidacloprid 10ml/20L | KES 800/session |
| Cutworms | 🟢 Low (past risk) | Cut seedlings at base | Seedling death | Dust at planting base | KES 500 |
| Bagrada bug | 🟡 Medium | Black/orange bugs | Wilting, dead hearts | Lambda-cyhalothrin | KES 1,200 |

**Common Diseases for Cabbage in Kiambu:**
| Disease | Risk Level | Symptoms | Prevention | Treatment | PHI |
|---------|-----------|----------|------------|-----------|-----|
| Black rot (Xanthomonas) | 🔴 High (wet season) | V-shaped yellow lesions from margins | Copper-based spray, avoid overhead watering | Mancozeb 50g/20L | 14 days |
| Clubroot | 🟢 Low | Swollen roots, wilting | Lime application, crop rotation | None (preventive) | — |
| Downy mildew | 🟡 Medium | Yellow patches on upper leaf, gray fuzz below | Adequate spacing, fungicide | Metalaxyl + Mancozeb | 14 days |
| Alternaria leaf spot | 🟡 Medium | Dark spots with concentric rings | Remove infected leaves | Mancozeb | 14 days |

**Scouting Log:**
| Date | Found | Severity (1–10) | Area Affected | Action Taken | Photo |
|------|-------|-------------------|---------------|--------------|-------|
| Oct 25 | 2 Diamondback moth larvae | 2 | 10% of plot | Monitored, no spray yet | 📷 |
| Nov 8 | Black rot on 5 plants | 4 | 5% of plot | Removed infected plants, sprayed Mancozeb | 📷 |
| Nov 15 | Aphids on 3 plants | 3 | 2% of plot | Sprayed Imidacloprid | 📷 |

### Section 4.8: Weather Overlay Widget
| Period | Rainfall Needed | Rainfall Received | Deficit/Surplus | Impact |
|--------|----------------|-------------------|-----------------|--------|
| Week 1 (Oct 20–26) | 15 mm | 18 mm | +3 mm ✅ | Good establishment |
| Week 2 (Oct 27–Nov 2) | 15 mm | 12 mm | -3 mm ⚠️ | Slight stress, water if possible |
| Week 3 (Nov 3–9) | 20 mm | — | — | Forecast: 25 mm ✅ |
| Week 4 (Nov 10–16) | 20 mm | — | — | Forecast: 30 mm ✅ |
| Month 1 total | 70 mm | 30 mm so far | —40 mm | ⚠️ Below normal, monitor |

### Section 4.9: Growth Photo Timeline
| Date | Photo | Stage | Notes |
|------|-------|-------|-------|
| Oct 20 | [📷] | Transplanting | Seedlings 10cm tall, good root system |
| Oct 27 | [📷] | Vegetative Day 7 | New leaves forming, no stress |
| Nov 3 | [📷] | Vegetative Day 14 | 5–6 leaves, healthy green |
| Nov 10 | [📷] | Vegetative Day 21 | — |
| Nov 17 | [📷] | Vegetative Day 28 | — |
| Nov 24 | [📷] | Heading Day 5 | First signs of head formation |
| Dec 8 | [📷] | Heading Day 19 | Heads filling well |
| Dec 22 | [📷] | Heading Day 33 | Firm heads, almost mature |
| Jan 15 | [📷] | Harvest | Ready for harvest |

### Section 4.10: Yield Prediction Widget (AI-Updated)
| Factor | Current Status | Impact on Yield |
|--------|---------------|-----------------|
| Weather | Slightly below rainfall | -5% |
| Pest pressure | Low to moderate | -2% |
| Disease pressure | Moderate (black rot) | -8% |
| Fertilizer timing | On schedule | 0% |
| Weed management | Good | 0% |
| Variety potential | Gloria F1, 17,000 heads/acre | Baseline |
| **Predicted yield** | | **14,500 heads (0.5 acre)** |
| **Predicted revenue** | At KES 30/head | **KES 435,000** |
| **Confidence** | | 72% |

Updates weekly as conditions change.

---

## PAGE 5: Inputs & Inventory Management (Enhanced)

**Purpose:** Complete input supply chain management — from knowing what to buy, to tracking stock, to recording application.

### Section 5.1: Input Catalog (Searchable, Filterable)
**Categories with full Kenyan market data:**

**5.1.1 Fertilizers**
| Product | NPK | Company | Bag Size | Price Range (KES) | Best For |
|---------|-----|---------|----------|-------------------|----------|
| DAP | 18:46:0 | Various (KEL, Yara, Tokai) | 50 kg | 6,000–7,500 | Basal for most crops |
| CAN | 26:0:0 | Various | 50 kg | 4,500–5,500 | Top dressing (nitrogen) |
| NPK 17:17:17 | 17:17:17 | Various | 50 kg | 6,500–7,500 | Balanced, vegetative stage |
| NPK 23:23:0 | 23:23:0 | YaraMila | 50 kg | 7,000–8,500 | Cereals, legumes |
| Urea | 46:0:0 | Various | 50 kg | 5,000–6,000 | High nitrogen need crops |
| Mavuno Plus | Custom blend | KEL | 50 kg | 5,500–6,500 | Cereals (maize, wheat) |
| Triple Super Phosphate (TSP) | 0:46:0 | Various | 50 kg | 5,500–7,000 | Root crops, low-P soils |
| Muriate of Potash (MOP) | 0:0:60 | Various | 50 kg | 6,000–7,500 | Fruiting/heading stage |
| Sulphate of Ammonia (SA) | 21:0:0 + 24%S | Various | 50 kg | 4,000–5,000 | Crops needing sulphur |
| Calcium Ammonium Nitrate (CAN) | 26:0:0 | Various | 50 kg | 4,500–5,500 | Top dressing |
| YaraMila UNIK | 15:10:20 + micros | Yara | 50 kg | 8,000–9,500 | Vegetables, fruits |
| Farmyard Manure | Organic | Local farms | Tonne | 5,000–8,000 | Soil improvement, all crops |
| Poultry Manure | Organic | Local farms | Tonne | 4,000–6,000 | High nitrogen organic |
| Compost | Organic | On-farm | Tonne | 2,000–3,000 | Soil health |

**5.1.2 Seeds (Certified)**
| Crop | Variety | Company | Pack Size | Price (KES) | Maturity | Zone Suitability |
|------|---------|---------|-----------|-------------|----------|------------------|
| Maize | H6213 | Kenya Seed | 10 kg | 3,500 | 4 months | Highland, midland |
| Maize | SC Duma 43 | Kenya Seed | 2 kg | 800 | 3 months | Drought-tolerant, low-midland |
| Maize | Pwani Hybrid 4 | KALRO | 5 kg | 1,500 | 3.5 months | Coastal lowland |
| Maize | WH505 | Western Seed | 2 kg | 750 | 3 months | Western Kenya, midland |
| Bean | Rosecoco | Kenya Seed | 2 kg | 1,200 | 3 months | Nationwide |
| Bean | Wairimu | KALRO | 2 kg | 1,000 | 2.5 months | Highland |
| Cabbage | Gloria F1 | Simlaw | 10 g | 800 | 75 days | Highland, midland |
| Cabbage | Riana F1 | Kenya Seed | 10 g | 600 | 70 days | Quick maturing |
| Tomato | Kilele F1 | Simlaw | 5 g | 1,500 | 75 days | Open field, greenhouse |
| Tomato | Rio Grande | Various | 10 g | 800 | 80 days | Open field, determinate |
| Onion | Red Creole | Various | 100 g | 500 | 90 days | Short day, nationwide |
| Potato | Shangi | Various | 50 kg | 4,000–6,000 | 3 months | Highland, most popular |
| Sukuma Wiki | Thousand Headed | Various | 50 g | 300 | Perennial | Nationwide |
| Kale | Collard Mfalme | KALRO | 50 g | 400 | 60 days | Nationwide |
| Carrot | Nantes | Various | 100 g | 400 | 70 days | Highland |
| Spinach | Fordhook Giant | Various | 50 g | 300 | 45 days | Nationwide |

**5.1.3 Crop Protection (Pesticides, Fungicides, Herbicides)**
| Product | Type | Active Ingredient | Target | Pack Size | Price (KES) | PHI (days) |
|---------|------|-------------------|--------|-----------|-------------|------------|
| Duduthrin 1.75 EC | Insecticide | Cypermethrin | Broad-spectrum insects | 250 ml | 1,200 | 7 |
| Alpha Super 5 EC | Insecticide | Alpha-cypermethrin | Fall Armyworm, caterpillars | 250 ml | 1,500 | 7 |
| Imidacloprid 200 SL | Insecticide | Imidacloprid | Aphids, whiteflies | 100 ml | 800 | 21 |
| Tafgor 50 EC | Insecticide | Dimethoate | Aphids, thrips | 1 litre | 1,500 | 14 |
| Mancozeb 80 WP | Fungicide | Mancozeb | Early/late blight, black rot | 1 kg | 800 | 14 |
| Ridomil Gold MZ | Fungicide | Metalaxyl-M + Mancozeb | Downy mildew, Phytophthora | 1 kg | 2,500 | 14 |
| Copper Oxychloride | Fungicide | Copper | Bacterial diseases | 1 kg | 600 | 7 |
| Glyphosate 480 SL | Herbicide | Glyphosate | Annual & perennial weeds | 1 litre | 1,500 | Pre-plant only |
| 2,4-D Amine | Herbicide | 2,4-D | Broadleaf weeds in maize | 1 litre | 800 | Pre-tasseling |
| Catapult 240 EC | Herbicide | Atrazine + Alachlor | Pre-emergence in maize | 1 litre | 2,000 | Pre-emergence |
| Warrior 700 WG | Herbicide | Metsulfuron | Post-emergence in wheat | 100 g | 3,000 | — |

**5.1.4 Foliar Feeds & Micronutrients**
| Product | NPK/Content | Company | Size | Price (KES) | Use |
|---------|-------------|---------|------|-------------|-----|
| Easygro Vegetative | 20:20:20 + micros | Tagro | 1 litre | 1,000 | Vegetative growth |
| Easygro Flower & Fruit | 12:61:61 + micros | Tagro | 1 litre | 1,200 | Flowering/fruiting |
| Bayfolan | NPK + micros | Bayer | 1 litre | 1,500 | General foliar |
| Optima Plus | Calcium + Boron | Various | 1 litre | 900 | Fruit quality, prevents cracking |
| Zincrex | Zinc EDTA | Various | 500 ml | 600 | Zinc deficiency |
| Magnesium Sulphate (Epsom salt) | Mg + S | Various | 1 kg | 200 | Mg deficiency |

### Section 5.2: My Inventory (Stock Dashboard)
| Input | Stock On Hand | Unit | Reorder Level | Status | Allocated To | Storage Location |
|-------|--------------|------|---------------|--------|--------------|------------------|
| DAP 50kg | 1 bag | Bag | 1 bag | 🟡 Low | Cabbage (basal) | Main store |
| CAN 50kg | 0 bags | Bag | 1 bag | 🔴 Out | Cabbage (top dress) | — |
| Mancozeb 80WP | 1.5 kg | Kg | 0.5 kg | 🟢 OK | Cabbage (spray) | Main store |
| Duduthrin | 200 ml | Ml | 100 ml | 🟢 OK | Cabbage (spray) | Main store |
| Cabbage seed Gloria F1 | 2 sachets (100g) | Sachet | 1 sachet | 🟢 OK | Future planting | Cool dry |
| Manure | 0 tonnes | Tonne | 2 tonnes | 🔴 Out | — | — |
| Crates | 0 | Crate | 50 | 🔴 Out | Cabbage harvest | — |

**Actions:** Order (links to supplier), Record Usage, Adjust Stock, Transfer between plots.

### Section 5.3: AI-Generated Purchase List
"Based on your crop schedule, you need to buy these in the next 14 days:"

| Input | Quantity Needed | When | Est. Cost | Suggested Supplier | Order Button |
|-------|----------------|------|-----------|-------------------|--------------|
| CAN 50kg | 1 bag | By Nov 3 | KES 5,000 | Githunguri Agro-vet (0.5 km) | [Order] |
| Manure | 2 tonnes | By Nov 1 | KES 12,000 | Kiambu Dairy Farm (3 km) | [Order] |
| Crates | 200 | By Jan 10 | KES 10,000 | Ruiru Plastics (8 km) | [Order] |

### Section 5.4: Input Application Log (Per Crop)
| Date | Crop | Input | Quantity Used | Rate/Acre | Method | Applied By | Weather | Notes |
|------|------|-------|--------------|-----------|--------|------------|---------|-------|
| Oct 20 | Cabbage | DAP | 25 kg | 50 kg/acre | Basal in hole | Mary | Dry, 24°C | Mixed with soil |
| Nov 3 | Cabbage | CAN | 25 kg | 50 kg/acre | Side dress | Mary | Light rain | 10 cm from stem |
| Nov 15 | Cabbage | Mancozeb | 250 g | 500 g/acre | Foliar spray | John | Cloudy | Evening spray, no rain for 6hrs |
| Dec 1 | Cabbage | Mancozeb | 250 g | 500 g/acre | Foliar spray | John | Dry | 2nd application |
| Dec 10 | Cabbage | Potassium foliar | 500 ml | 1 L/acre | Foliar spray | Mary | Dry | Heading stage |

### Section 5.5: Supplier Directory
| Supplier Name | Type | Location | Distance | Phone | Products | Rating |
|---------------|------|----------|----------|-------|----------|--------|
| Githunguri Agro-vet | Agro-vet | Githunguri Town | 0.5 km | 0712XXX | Seeds, fertilizer, chemicals | 4.5★ |
| Kiambu Farmers Centre | Agro-vet | Kiambu Town | 5 km | 0722XXX | Full range, bulk | 4.2★ |
| Yara Distributor (Nairobi) | Fertilizer specialist | Industrial Area | 30 km | 0733XXX | Yara brands, bulk | 4.8★ |
| Kenya Seed Depot | Seed company | Kiambu | 4 km | 0744XXX | Certified seeds | 4.0★ |
| Mary's Dairy Farm | Manure supplier | Adjacent farm | 0.3 km | 0755XXX | Farmyard manure | 4.7★ |

### Section 5.6: Input Cost Analytics
| Chart/Metric | Details |
|-------------|---------|
| Cost by category | Pie chart: Fertilizer 45%, Pesticides 20%, Seeds 10%, Manure 25% |
| Cost per acre | Bar chart comparing seasons |
| Price trends | Line chart: DAP price last 6 months |
| Savings opportunities | "Buy CAN in bulk (5+ bags) from Yara distributor: save KES 500/bag" |

---

## PAGE 6: Labor Management & Payroll (Enhanced)

**Purpose:** Complete labour lifecycle — from hiring to paying, with M-Pesa integration and cost forecasting.

### Section 6.1: Worker Directory
| Field | Details |
|-------|---------|
| Worker ID | Auto-generated (W-001) |
| Full name | John Mwangi Kamau |
| Phone number | 0712345678 |
| M-Pesa registered name | John Mwangi |
| National ID | 12345678 |
| Location/Village | Githunguri |
| Primary skills | Weeding, transplanting, spraying, harvesting |
| Daily rate | KES 500 |
| Piece rate options | Weeding: KES 1,500/acre, Harvesting cabbage: KES 2/head |
| Preferred payment | M-Pesa to 0712345678 |
| Payment frequency | Daily / Weekly / End of task |
| Performance rating | 4.2★ (from 15 tasks) |
| Total earned this season | KES 8,500 |
| Total tasks completed | 15 |
| Photo | Optional |
| Notes | "Reliable, comes early. Good at transplanting." |

### Section 6.2: Task Scheduler (Full Detail)
**Create Task Form:**
| Field | Type | Options |
|-------|------|---------|
| Task name | Text | Free text or select from templates |
| Task type | Dropdown | Weeding, Planting, Transplanting, Spraying, Harvesting, Land prep, Irrigation, Transport, Other |
| Linked crop | Dropdown | Cabbage (Plot 1), Maize (Plot 2), None |
| Date | Date picker | |
| Start time | Time picker | |
| Expected duration | Dropdown | 2 hrs, 4 hrs, Half day, Full day, Multi-day |
| Number of workers | Number | |
| Assign workers | Multi-select | From worker directory |
| Rate type | Toggle | Daily rate / Piece rate |
| Rate amount | Number | KES |
| Estimated total cost | Auto-calculated | Workers × rate |
| Budget category | Dropdown | Aligned with Page 7 budget |
| Payment method | Dropdown | Pay via GrowMO wallet (M-Pesa) / Manual (I'll pay offline) / Pay later |
| Payment timing | Dropdown | Pay now / Pay on completion / Pay on scheduled date |
| Special instructions | Text | "Bring own jembe", "Wear gloves for spraying" |
| Required tools | Checklist | Jembe, panga, knapsack sprayer, crates, sacks |

**Task Templates (Pre-built):**
| Template | Default Workers | Default Duration | Default Rate |
|----------|----------------|------------------|--------------|
| Weeding (vegetables, per acre) | 3–4 | 1 day | Daily rate |
| Weeding (maize, per acre) | 2–3 | 1 day | Daily rate |
| Transplanting (cabbage/tomato, per acre) | 5–6 | 1 day | Daily rate |
| Planting maize (per acre) | 2 | 1 day | Daily rate |
| Spraying (per acre) | 1 | 2–4 hrs | Daily rate |
| Harvesting cabbage (per acre) | 6–8 | 1 day | Daily or piece rate |
| Harvesting maize (per acre) | 4–6 | 1–2 days | Daily rate |
| Ploughing (tractor) | 1 (operator) | 2–3 hrs | Per acre rate |
| Land prep with ox | 1 (ploughman) | 1 day | Daily rate |

### Section 6.3: Labour Calendar View
A monthly calendar showing all tasks color-coded:
- 🟢 Completed tasks
- 🟡 Today's tasks
- 🔴 Overdue tasks
- 🔵 Upcoming tasks
- Tap a day to see all tasks, tap a task to see details

### Section 6.4: Attendance & Task Completion
When a task is scheduled:
1. Workers receive SMS: "You have a task: Weeding cabbage at Mary's Farm, Oct 25, 8:00 AM. Reply YES to confirm."
2. Worker replies YES → confirmed
3. On the day, farmer marks attendance: Present/Absent
4. Task completion: Farmer marks Complete with:
   - Actual hours worked
   - Actual workers who showed up
   - Quality rating (1–5)
   - Photos of completed work
   - Notes
5. If auto-pay is enabled → payment triggered
6. Worker receives SMS: "Task completed. KES 500 sent to your M-Pesa. Receipt: QJK3L5X7YZ"

### Section 6.5: Payroll Dashboard
| Metric | Value |
|--------|-------|
| Total wages this season | KES 42,000 |
| Wages paid | KES 38,000 |
| Wages pending | KES 4,500 |
| Wages scheduled (future) | KES 15,000 |
| Labour cost per acre (season) | KES 84,000 (2 crops, 1 acre total) |
| Labour as % of total cost | 37% |
| Workers active this week | 4 |

**Pending Payments Table:**
| Worker | Task | Amount | Due Date | Status | Action |
|--------|------|--------|----------|--------|--------|
| John Mwangi | Weeding cabbage | KES 500 | Oct 25 | ✅ Paid (M-Pesa: QJK3L5X7YZ) | View receipt |
| Peter Kamau | Weeding cabbage | KES 500 | Oct 25 | ⏳ Scheduled (auto-pay Nov 1) | Pay now |
| Grace Wanjiku | Transplanting | KES 500 | Oct 20 | ✅ Paid (Manual: M-Pesa SHK4RT9) | View receipt |
| Samuel Njoroge | Spraying | KES 500 | Nov 15 | 🔮 Future | Edit |
| John + Peter + Grace + Samuel | Harvest cabbage | KES 3,600 | Jan 15 | 🔮 Future | Edit |

### Section 6.6: Labour Cost Forecast (Per Crop, Full Season)
**Cabbage 0.5 acre — Full Season Labour Forecast:**
| Task | Workers | Days | Rate/Day | Total (KES) | When |
|------|---------|------|----------|-------------|------|
| Nursery preparation | 1 | 1 | 500 | 500 | Sep 20 |
| Nursery watering (30 days) | Self | 30 | 0 | 0 | Sep 20–Oct 20 |
| Land preparation | 2 | 1 | 500 | 1,000 | Oct 20 |
| Manure spreading | 2 | 1 | 500 | 1,000 | Oct 20 |
| Transplanting | 5 | 1 | 500 | 2,500 | Oct 20 |
| Weeding 1 | 3 | 1 | 500 | 1,500 | Oct 25 |
| Top dressing + weeding 2 | 3 | 1 | 500 | 1,500 | Nov 3 |
| Spraying 1 | 1 | 0.5 | 500 | 250 | Nov 15 |
| Weeding 3 | 2 | 1 | 500 | 1,000 | Nov 20 |
| Spraying 2 | 1 | 0.5 | 500 | 250 | Dec 1 |
| Foliar application | Self | 0.5 | 0 | 0 | Dec 10 |
| Harvest | 6 | 1 | 600 | 3,600 | Jan 15 |
| Loading & transport | 2 | 0.5 | 500 | 500 | Jan 15 |
| **TOTAL** | | | | **14,600** | |

### Section 6.7: County Labour Rate Benchmarks
| County | Weeding (KES/day) | Planting (KES/day) | Harvesting (KES/day) | Spraying (KES/day) | Ploughing (KES/acre) |
|--------|-------------------|-------------------|---------------------|-------------------|---------------------|
| Kiambu | 500–700 | 500–700 | 600–800 | 600–800 | 3,500–4,500 |
| Uasin Gishu | 400–600 | 400–600 | 500–700 | 500–700 | 3,000–4,000 |
| Nakuru | 450–650 | 450–650 | 550–750 | 550–750 | 3,000–4,000 |
| Kakamega | 400–550 | 400–550 | 450–600 | 500–650 | 2,500–3,500 |
| Machakos | 400–500 | 400–500 | 450–550 | 450–550 | 2,500–3,500 |
| Kisumu | 400–600 | 400–600 | 500–700 | 500–700 | 3,000–4,000 |
| Mombasa | 500–700 | 500–700 | 600–800 | 600–800 | 3,500–5,000 |
| Nairobi | 600–800 | 600–800 | 700–1,000 | 700–1,000 | 4,000–5,000 |

**AI Insight:** "You're paying KES 500/day for weeding in Kiambu. The average for your area is KES 550. Your rates are competitive — good for worker retention."

---

## PAGE 7: Financial Management & Budgeting (Enhanced)

**Purpose:** The farmer's complete financial command center — budgeting, expense tracking, income, cash flow, and profitability.

### Section 7.1: Farm Wallet
| Element | Details |
|---------|---------|
| Available balance | KES 35,000 |
| Allocated to budgets | KES 20,000 (locked for specific purposes) |
| Unallocated | KES 15,000 (freely available) |
| Pending deductions | KES 4,500 (scheduled payments) |
| Effective available | KES 10,500 |
| Deposit button | "Add Money via M-Pesa" |
| Withdraw button | "Send to M-Pesa" |
| Transaction count today | 2 |

**Wallet Activity Feed (Latest 5):**
| Time | Type | Description | Amount | Balance After |
|------|------|-------------|--------|---------------|
| 10:30 AM | Out | Paid John Mwangi (weeding) — M-Pesa | -KES 500 | 35,000 |
| 9:00 AM | In | Deposit from M-Pesa | +KES 10,000 | 35,500 |
| Yesterday | Out | Paid Githunguri Agro-vet (DAP) — Manual | -KES 6,500 | 25,500 |
| Oct 20 | Out | Paid workers (transplanting × 5) — M-Pesa | -KES 2,500 | 32,000 |
| Oct 18 | In | Deposit from M-Pesa | +KES 50,000 | 34,500 |

### Section 7.2: Budget Planner (Per Crop/Season)

**Budget Creation Form:**
| Field | Details |
|-------|---------|
| Budget name | "Cabbage Season SR 2026 — Plot 1" |
| Linked crop | Cabbage — Gloria F1 |
| Plot | Plot 1 (0.5 acre) |
| Season | Short Rains 2026 |
| Total budget | KES 56,000 |
| Start date | October 1 |
| End date | January 31 |
| Fund source | GrowMO wallet |

**Budget Category Allocation:**
| Category | Allocated (KES) | % of Budget | Spent (KES) | Remaining (KES) | Status |
|----------|----------------|-------------|-------------|-----------------|--------|
| Land preparation | 5,000 | 9% | 4,000 | 1,000 | 🟢 On track |
| Seeds & nursery | 3,000 | 5% | 3,200 | -200 | 🔴 Over budget |
| Fertilizers | 12,000 | 21% | 6,250 | 5,750 | 🟢 On track |
| Pesticides & chemicals | 5,000 | 9% | 1,500 | 3,500 | 🟢 Under budget |
| Manure | 15,000 | 27% | 15,000 | 0 | 🟢 Spent |
| Labour | 14,000 | 25% | 6,000 | 8,000 | 🟢 On track |
| Irrigation | 2,000 | 4% | 0 | 2,000 | ⬜ Not started |
| Harvest & post-harvest | 15,000 | — | 0 | 15,000 | 🔮 Future |
| Transport | 3,000 | — | 0 | 3,000 | 🔮 Future |
| **TOTAL** | **56,000** | | **35,950** | **20,050** | |

**Budget Visualization:**
- Donut chart: Spent vs remaining by category
- Bar chart: Planned vs actual per category
- Timeline: Spending over time vs planned spending curve

**Budget Alerts:**
- 🔴 "Seeds & nursery is KES 200 over budget. Seed price was higher than estimated."
- 🟡 "Fertilizer spend is on track but CAN purchase (KES 5,000) is due in 1 week."
- 🟢 "Labour spend is 43% of budget with 66% of season remaining — good pace."

### Section 7.3: Expense Recording

**Quick Expense Entry:**
| Field | Type |
|-------|------|
| Amount (KES) | Number |
| Category | Dropdown: Inputs, Labour, Transport, Equipment, Fees, Other |
| Sub-category | Dropdown: Fertilizer, Pesticide, Seed, Manure, etc. |
| Linked crop | Dropdown: Cabbage, Maize, None |
| Linked budget | Dropdown: Cabbage SR 2026, None |
| Supplier/Payee | Text or select from directory |
| Payment method | Cash / M-Pesa (manual) / GrowMO wallet (auto) |
| M-Pesa receipt code | Text (optional, for manual entries) |
| Date | Date picker |
| Notes | Text |
| Receipt photo | Camera upload |

**Expense Log Table:**
| Date | Description | Category | Crop | Amount | Method | Receipt | Budget |
|------|-------------|----------|------|--------|--------|---------|--------|
| Oct 20 | DAP 50kg — 1 bag | Fertilizer | Cabbage | 6,500 | Manual M-Pesa | SHK4RT9 | Cabbage SR |
| Oct 20 | Cabbage seed Gloria F1 × 4 | Seed | Cabbage | 3,200 | Cash | — | Cabbage SR |
| Oct 20 | Manure 2.5 tonnes | Manure | Cabbage | 15,000 | Cash | — | Cabbage SR |
| Oct 20 | Workers: transplanting × 5 | Labour | Cabbage | 2,500 | GrowMO wallet | QJK3L5X7YZ | Cabbage SR |
| Oct 25 | Workers: weeding × 3 | Labour | Cabbage | 1,500 | GrowMO wallet | PLM8NR2KQW | Cabbage SR |
| Oct 25 | Lunch for workers | Other | — | 300 | Cash | — | — |

### Section 7.4: Income Recording
| Date | Source | Crop | Quantity | Unit Price | Total (KES) | Payment Method | Buyer | Status |
|------|--------|------|----------|------------|-------------|----------------|-------|--------|
| Jan 15 | Cabbage sale | Cabbage | 5,000 heads | KES 30 | 150,000 | M-Pesa | Marikiti broker | ✅ Received |
| Jan 16 | Cabbage sale | Cabbage | 3,000 heads | KES 28 | 84,000 | Cash | Walk-in buyer | ✅ Received |
| Jan 20 | Cabbage sale | Cabbage | 2,000 heads | KES 25 | 50,000 | M-Pesa | Restaurant order | ⏳ Pending |

### Section 7.5: Cash Flow Forecast
**Monthly projection for Cabbage season:**

| Month | Inflows (KES) | Outflows (KES) | Net (KES) | Cumulative |
|-------|---------------|----------------|-----------|------------|
| October | 0 | -27,700 | -27,700 | -27,700 |
| November | 0 | -8,250 | -8,250 | -35,950 |
| December | 0 | -3,450 | -3,450 | -39,400 |
| January | +284,000 | -21,100 | +262,900 | +223,500 |

**Chart:** Stacked bar chart with green (income) and red (expenses) bars.

### Section 7.6: Profit & Loss Statement (Per Crop)
**Cabbage — 0.5 Acre — Short Rains 2026:**

| Line Item | Budgeted | Actual | Variance |
|-----------|----------|--------|----------|
| **REVENUE** | | | |
| Cabbage sales — Marikiti | 240,000 | 234,000 | -6,000 |
| Cabbage sales — direct | 0 | 84,000 | +84,000 |
| **Total Revenue** | **240,000** | **318,000** | **+78,000** |
| | | | |
| **COST OF PRODUCTION** | | | |
| Land preparation | 5,000 | 4,000 | -1,000 |
| Seeds & nursery | 3,000 | 3,200 | +200 |
| Fertilizers | 12,000 | 9,500 | -2,500 |
| Pesticides | 5,000 | 3,500 | -1,500 |
| Manure | 15,000 | 15,000 | 0 |
| Labour | 14,000 | 14,600 | +600 |
| Irrigation | 2,000 | 1,500 | -500 |
| Harvest & post-harvest | 15,000 | 16,000 | +1,000 |
| Transport | 3,000 | 2,500 | -500 |
| **Total COP** | **74,000** | **69,800** | **-4,200** |
| | | | |
| **GROSS PROFIT** | | **248,200** | |
| Less: Contingency/unexpected | | -2,000 | |
| **NET PROFIT** | | **246,200** | |
| **ROI** | | **353%** | |
| **Profit per head** | | **KES 30.78** | |
| **Cost per head** | | **KES 8.73** | |

### Section 7.7: Auto-Pay Rules Engine
| Rule Name | Trigger | Action | Amount | Status |
|-----------|---------|--------|--------|--------|
| Pay workers on task completion | Task marked "Complete" | Send M-Pesa to assigned workers | Per task rate | ✅ Active |
| Weekly labour settlement | Every Friday 5 PM | Pay all unpaid tasks for the week | Sum of tasks | ⏸️ Paused |
| Input purchase approval | Expense > KES 5,000 | Require PIN confirmation before payment | Per expense | ✅ Active |
| Budget limit alert | Category spend > 90% of budget | Send push notification | — | ✅ Active |
| Budget hard stop | Category spend > 100% of budget | Block wallet payment (manual only) | — | ⏸️ Paused |

### Section 7.8: Multi-Crop Financial Overview
If farmer has multiple crops:
| Crop | Budget | Spent | Revenue | Profit | ROI |
|------|--------|-------|---------|--------|-----|
| Cabbage 0.5ac | 74,000 | 69,800 | 318,000 | 248,200 | 353% |
| Maize 2ac | 80,000 | 72,000 | 70,000 | -2,000 | -3% |
| **Farm Total** | **154,000** | **141,800** | **388,000** | **246,200** | **174%** |

---

## PAGE 8: Weather & Climate Intelligence (Enhanced)

**Purpose:** Hyper-local weather data with crop-specific impact analysis and seasonal predictions.

### Section 8.1: Current Conditions (Live)
| Parameter | Value | Unit | 24hr Change |
|-----------|-------|------|-------------|
| Temperature | 24 | °C | +1°C |
| Feels like | 22 | °C | — |
| Humidity | 78 | % | +5% |
| Wind speed | 12 | km/h | -3 |
| Wind direction | NE | — | — |
| Rainfall (24hr) | 5.2 | mm | — |
| Rainfall (7 days) | 28 | mm | — |
| Soil temperature | 20 | °C | — |
| Soil moisture | 65 | % | +8% |
| UV index | 6 | Moderate | — |
| Evapotranspiration | 3.5 | mm/day | — |
| Dew point | 19 | °C | — |
| Visibility | 8 | km | — |
| Atmospheric pressure | 1015 | hPa | — |

**Data sources:** Kenya Met Department, IBM Weather Company, NASA POWER, local weather stations.

### Section 8.2: 7-Day Forecast (Detailed)
| Day | Icon | Min (°C) | Max (°C) | Rain (%) | Rain (mm) | Wind (km/h) | Humidity (%) | Crop Impact |
|-----|------|----------|----------|----------|-----------|-------------|-------------|-------------|
| Today | 🌧️ | 16 | 24 | 70% | 8–15 | 12 NE | 78 | Good for cabbage, spray after rain |
| Tomorrow | 🌧️ | 15 | 22 | 80% | 10–20 | 15 NE | 82 | Black rot risk — monitor |
| Day 3 | ⛅ | 14 | 23 | 40% | 0–5 | 10 E | 70 | Good spraying window |
| Day 4 | ☀️ | 15 | 25 | 10% | 0 | 8 SE | 60 | Irrigate if needed |
| Day 5 | ☀️ | 16 | 26 | 5% | 0 | 10 SE | 55 | Dry, monitor soil moisture |
| Day 6 | ⛅ | 15 | 24 | 30% | 0–3 | 12 E | 65 | — |
| Day 7 | 🌧️ | 14 | 22 | 60% | 5–10 | 18 NE | 75 | Rain returning |

### Section 8.3: Seasonal Forecast (3-Month Outlook)
**Source:** Kenya Met Department Seasonal Forecast + GrowMO AI interpretation

**Short Rains 2026 (October–December) — Kiambu County:**
| Parameter | October | November | December |
|-----------|---------|----------|----------|
| Rainfall (mm) | 100–150 | 150–250 | 80–140 |
| vs Long-term average | Near normal | Above normal | Near normal |
| Temperature range | 18–26°C | 17–25°C | 18–26°C |
| Onset of rains | Week 1 October ✅ | — | — |
| Cessation | — | — | Mid-December |
| Dry spell risk | Low | Low | Moderate (mid-Dec) |
| Flood risk | Low | Moderate | Low |
| Expected rainy days | 12–15 | 15–20 | 8–12 |

**GrowMO AI Seasonal Advisory for Cabbage (Kiambu, planted Oct 20):**
| Risk | Level | Advisory |
|------|-------|----------|
| Black rot | 🔴 High | Above-normal rain in November = high humidity. Spray Mancozeb every 14 days. Ensure plant spacing 45cm × 45cm for airflow. |
| Waterlogging | 🟡 Medium | If clay soil, ensure drainage channels. Raised beds are essential. |
| Diamondback moth | 🟡 Medium | Wet weather favors caterpillars. Scout twice weekly from Week 3. |
| Cutworm | 🟢 Low | Past transplanting stage, risk reduced. |
| Dry spell (Dec) | 🟡 Medium | Plan supplementary irrigation for heading stage. |
| Harvest rain damage | 🟢 Low | January forecast is dry — good for harvest. |

### Section 8.4: Crop-Specific Weather Prediction Engine

**How it works:** When a farmer plants a crop, the system generates a weather prediction for the ENTIRE crop duration, tailored to that crop's growth stages.

**Example 1: Cabbage (Short-season, 90 days, Kiambu, planted Oct 20)**
| Period | Days | Stage | Predicted Rain (mm) | Predicted Temp | Crop Need | Match | Advisory |
|--------|------|-------|---------------------|----------------|-----------|-------|----------|
| Oct 20–Nov 2 | 1–14 | Establishment | 30–50 | 18–24°C | Moist soil for root growth | ✅ Good | No irrigation needed |
| Nov 3–Nov 16 | 15–28 | Vegetative | 50–80 | 17–24°C | Adequate moisture, nitrogen | ✅ Good | Apply CAN, weed control |
| Nov 17–Nov 30 | 29–42 | Late vegetative | 60–100 | 17–25°C | Continued moisture | ✅ Good | Watch for black rot |
| Dec 1–Dec 14 | 43–56 | Early heading | 40–70 | 18–26°C | Moderate moisture | ⚠️ Decreasing | May need irrigation |
| Dec 15–Dec 28 | 57–70 | Heading | 15–30 | 18–27°C | Moderate moisture | ⚠️ Low | Irrigate! Dry spell likely |
| Dec 29–Jan 11 | 71–84 | Maturity | 10–20 | 17–27°C | Low water OK | ✅ Good | Reduce irrigation |
| Jan 12–Jan 18 | 85–90 | Harvest | 5–10 | 17–28°C | Dry weather ideal | ✅ Perfect | Harvest in dry conditions |

**Example 2: Maize (Medium-season, 120 days, Uasin Gishu, planted Oct 15)**
| Period | Days | Stage | Predicted Rain | Temp | Advisory |
|--------|------|-------|---------------|------|----------|
| Oct 15–Oct 28 | 1–14 | Germination | 25–40 mm | 15–22°C | Good moisture for germination |
| Oct 29–Nov 25 | 15–42 | Vegetative | 80–130 mm | 14–22°C | Top dress CAN at Week 5–6 |
| Nov 26–Dec 16 | 43–63 | Tasseling | 50–80 mm | 14–24°C | Critical — water stress reduces grain fill |
| Dec 17–Jan 8 | 64–85 | Silking & grain fill | 30–60 mm | 15–25°C | Moisture critical for grain filling |
| Jan 9–Feb 12 | 86–120 | Maturity & dry-down | 20–40 mm | 15–26°C | Stop irrigation, let dry for harvest |

**Example 3: Sugarcane (Long-season, 18 months, Kakamega, planted Oct 2026)**
| Period | Months | Stage | Predicted Rain Pattern | Advisory |
|--------|--------|-------|----------------------|----------|
| Oct–Dec 2026 | 0–3 | Germination | Short rains: 300–500 mm | Good establishment |
| Jan–Feb 2027 | 3–5 | Tillering | Hot dry: 50–100 mm | Irrigate if possible, weed control critical |
| Mar–May 2027 | 5–8 | Grand growth | Long rains: 400–700 mm | Peak growth, apply N fertilizer |
| Jun–Aug 2027 | 8–11 | Grand growth | Cool dry: 100–200 mm | Irrigate for sustained growth |
| Sep–Oct 2027 | 11–13 | Maturation | Short rains: 200–350 mm | Reduce nitrogen, increase potassium |
| Nov 2027–Jan 2028 | 13–15 | Ripening | Short rains taper: 100–200 mm | Stop irrigation for sugar concentration |
| Feb–Mar 2028 | 15–18 | Harvest ready | Hot dry: 50–100 mm | Harvest during dry weather for better sucrose |

### Section 8.5: Planting Window Advisor
| County | Crop | Best Window | Good Window | Risky Window | Avoid |
|--------|------|-------------|-------------|--------------|-------|
| Kiambu | Cabbage | Oct 1–Nov 15 | Mar 1–Apr 15 | Jun–Aug (irrigated only) | Jan–Feb (too hot, aphids) |
| Kiambu | Maize | Mar 15–Apr 15 | Oct 15–Nov 15 | — | May–Sep (wrong season) |
| Uasin Gishu | Maize | Mar 1–Apr 15 | Oct 15–Nov 15 | — | May–Sep |
| Kakamega | Sugarcane | Oct–Nov | Mar–May | Jan–Feb (dry) | — |
| Machakos | Sorghum | Oct 15–Nov 30 | Mar 1–Apr 15 | — | May–Sep (too dry without irrigation) |
| Kilifi | Cashew | — | — | — | Perennial, rainfall dependent |
| Nyandarua | Potato | Mar 1–Apr 30 | Oct 1–Nov 30 | — | May–Sep (too cold/wet for some varieties) |
| Kisumu | Rice (NIB) | Aug–Sep | Jan–Feb | — | Dry periods |

### Section 8.6: Extreme Weather Alerts
| Alert Type | Severity | Message | Action |
|------------|----------|---------|--------|
| 🟡 Heavy rain | Moderate | "20–30 mm expected in next 6 hours in Kiambu. Check drainage in cabbage field." | Check drainage |
| 🔴 Flood warning | High | "River Githurai rising. Low-lying farms in Githunguri sub-county at risk." | Move livestock, secure inputs |
| 🟡 Dry spell | Moderate | "No significant rain expected for 14 days from Dec 15. Cabbage in heading stage needs irrigation." | Plan irrigation |
| 🔴 Frost alert | High | "Temperatures may drop to 2°C in Nyandarua tonight. Frost risk for potatoes and beans." | Cover crops, delay planting |
| 🟡 Wind warning | Moderate | "Strong winds (40 km/h) expected. Secure greenhouse structures." | Secure structures |
| 🔴 Hail | High | "Hail possible in Kericho highlands this afternoon. Protect tea and vegetables." | Cover if possible |

### Section 8.7: Historical Weather Data (For Planning)
| Month | Avg Rainfall (mm) | Avg Min Temp | Avg Max Temp | Rainy Days | Dry Spell Probability |
|-------|-------------------|--------------|--------------|------------|----------------------|
| Jan | 40 | 12 | 25 | 5 | 60% |
| Feb | 30 | 13 | 27 | 3 | 75% |
| Mar | 80 | 14 | 26 | 10 | 20% |
| Apr | 200 | 14 | 24 | 18 | 5% |
| May | 180 | 13 | 23 | 16 | 10% |
| Jun | 50 | 11 | 22 | 5 | 40% |
| Jul | 30 | 10 | 21 | 3 | 60% |
| Aug | 30 | 10 | 22 | 3 | 55% |
| Sep | 40 | 11 | 24 | 5 | 45% |
| Oct | 120 | 13 | 24 | 12 | 15% |
| Nov | 180 | 13 | 23 | 16 | 10% |
| Dec | 90 | 12 | 24 | 9 | 25% |

---

## PAGE 9: AI Advisor & Predictive Engine (Enhanced)

**Purpose:** The farmer's personal agronomist — always available, always learning, always optimizing.

### Section 9.1: AI Chat Interface
**Full conversational AI in English and Kiswahili:**

**Example Conversations:**

**Farmer:** "Nataka kupanda mahindi ekari moja hapa Uasin Gishu. Nina bajeti ya KES 40,000. Ni aina gani ya mbegu nzuri?"

**GrowMO AI:** "Habari! Kwa Uasin Gishu (Upper Highland, altitude ~2,100m), ninapendekeza:

1. **H6213** (Kenya Seed) — KES 3,500/begi 10kg
   - Yield: 25–35 begi/ekari
   - Maturity: 4 months
   - Drought tolerant, good for your zone

2. **SC Duma 43** (Kenya Seed) — KES 800/begi 2kg
   - Yield: 20–28 begi/ekari
   - Maturity: 3 months (quick)
   - Very drought tolerant

Kwa bajeti yako ya KES 40,000, H6213 inafaa zaidi kwa mapato ya juu. Bajeti yako itagawanywa:
- Mbegu: KES 3,500
- DAP: KES 7,000
- CAN: KES 5,500
- Herbicide: KES 2,500
- Labour: KES 18,000
- Contingency: KES 3,500
- Jumla: KES 40,000

Mapato yanayotarajiwa: 25 begi × KES 3,500 = KES 87,500
Faida: KES 47,500

Unataka nikupe mpango kamili wa msimu?"

---

**Farmer:** "Wachungaji wangu wa mboga wanahitaji kulipwa jumla ya KES 3,000 leo. Watatu. Nambari zao ni 0712345678, 0723456789, 0734567890. Lipa sasa."

**GrowMO AI:** "Sawa, nitalipa KES 1,000 kwa kila mfanyakazi:

1. 0712***5678 → KES 1,000
2. 0723***6789 → KES 1,000
3. 0734***7890 → KES 1,000

Jumla: KES 3,000

[Confirm Payment] — Weka PIN yako ya GrowMO"

---

**Farmer:** "Nina cabbage zangu zimeanza kuonyesha makala ya manjano. Ni nini hiyo?"

**GrowMO AI:** "Kutokana na maelezo yako, huenda ni **Black Rot** (Xanthomonas campestris), ambayo ni ugonjwa wa kawaida sana kwa cabbage wakati wa mvua nyingi.

**Dalili:** Vipele vya umbo la 'V' vurugu, vya manjano kutoka mwisho wa jani, kisha vya kahawia/kijivu.

**Kitendo cha haraka:**
1. Ondoa mmea wowote ulioathirika vibaya na uumie (usiuzime komposti)
2. Rukia **Mancozeb 80WP** kwa kiwango cha 50g kwa lita 20 za maji
3. Rukia asubuhi au jioni, sio wakati wa jua kali
5. Usirukie ikiwa mvua inatarajiwa ndani ya saa 6
6. Tenga siku 14 kati ya kurukia na mavuno (PHI = 14 days)

**Kuzuia mbeleni:**
- Hakikisha spacing ya 45cm × 45cm kwa hewa nzuri
- Epuka kunyunyuzia maji juu ya majani (use drip irrigation)
- Panda varieti zilizo na ustahimilivu kama Gloria F1

Unaweza piga picha na kutuma kwa uchambuzi zaidi?"

### Section 9.2: Crop Plan Generator
**Input Form:**
| Field | Value |
|-------|-------|
| Crop | Maize |
| Acreage | 2 acres |
| County | Uasin Gishu |
| Planting month | March |
| Budget | KES 80,000 |
| Soil type | Loam |
| Water source | Rain-fed |
| Goal | Maximum profit |

**Generated Full Season Plan:**
| Week | Date | Activity | Input | Qty | Cost (KES) | Labour | Labour Cost |
|------|------|----------|-------|-----|------------|--------|-------------|
| -2 | Mar 1–7 | Land preparation (plough) | — | — | 6,000 | Tractor | 6,000 |
| -1 | Mar 8–14 | Harrowing, make furrows | — | — | 3,000 | Tractor | 3,000 |
| 0 | Mar 20 | Planting | H6213 seed | 20 kg | 7,000 | 4 workers | 2,000 |
| 0 | Mar 20 | Apply DAP | DAP 50kg | 2 bags | 14,000 | 2 workers | 1,000 |
| 0 | Mar 20 | Apply herbicide (pre-emerge) | Catapult | 2L | 4,000 | 1 worker | 500 |
| 3 | Apr 10 | First weeding | — | — | — | 6 workers | 3,000 |
| 5 | Apr 24 | Top dress CAN | CAN 50kg | 2 bags | 10,000 | 2 workers | 1,000 |
| 6 | May 1 | Second weeding | — | — | — | 4 workers | 2,000 |
| 8 | May 15 | Scout for FAW | — | — | — | Self | 0 |
| 10 | May 29 | Third weeding if needed | — | — | — | 3 workers | 1,500 |
| 12 | Jun 12 | Tasseling — monitor moisture | — | — | — | Self | 0 |
| 16 | Jul 10 | Check moisture content | — | — | — | Self | 0 |
| 18 | Jul 24 | Harvest | — | — | — | 8 workers × 2 days | 8,000 |
| 18 | Jul 24 | Threshing & shelling | — | — | 2,000 | — | — |
| 18 | Jul 26 | Drying | — | — | — | — | — |
| 19 | Aug 2 | Bagging & storage | Sacks | 60 | 6,000 | 2 workers | 1,000 |
| | | **TOTALS** | | | **52,000** | | **29,000** |
| | | **GRAND TOTAL** | | | **81,000** | | |

**Revenue Projection:**
| Scenario | Yield/Acre | Total Yield | Price/Bag | Revenue | Profit | ROI |
|----------|-----------|-------------|-----------|---------|--------|-----|
| Best | 35 bags | 70 bags | KES 3,800 | 266,000 | 185,000 | 228% |
| Average | 28 bags | 56 bags | KES 3,500 | 196,000 | 115,000 | 142% |
| Worst | 18 bags | 36 bags | KES 3,000 | 108,000 | 27,000 | 33% |

### Section 9.3: Pest & Disease Risk Prediction
| Crop | County | Current Risk | 7-Day Forecast | Recommended Action |
|------|--------|-------------|----------------|-------------------|
| Cabbage | Kiambu | Black rot: 🔴 High | Rain + humidity → risk increasing | Spray Mancozeb immediately |
| Maize | Uasin Gishu | Fall Armyworm: 🟡 Medium | Warm temps → egg laying | Install pheromone traps, scout |
| Tomato | Kirinyaga | Late blight: 🟡 Medium | Rain expected → sporulation | Preventive Mancozeb spray |
| Potato | Nyandarua | Early blight: 🟢 Low | Dry conditions | Monitor, no action needed |
| Beans | Machakos | Bean fly: 🟡 Medium | Warm, dry | Apply seed treatment at planting |

### Section 9.4: Market Price Forecast
| Crop | Current Price | 1-Month Forecast | 3-Month Forecast | Trend | Advice |
|------|--------------|-------------------|-------------------|-------|--------|
| Cabbage (Marikiti) | KES 30/head | KES 25–35 | KES 20–40 | ↔️ Stable | Supply increasing, may dip in Dec |
| Tomato (Kangemi) | KES 3,200/crate | KES 2,800–3,500 | KES 4,000–5,000 | ↑ Rising | Dry season coming = less supply = higher prices |
| Maize (Eldoret) | KES 3,500/bag | KES 3,200–3,800 | KES 3,000–3,500 | ↓ Slight dip | Harvest season in Rift = more supply |
| Beans (Nakuru) | KES 7,500/bag | KES 7,000–8,000 | KES 8,000–9,000 | ↑ Rising | Off-season, limited supply |

### Section 9.5: Benchmarking Engine
**"How do I compare?"**

| Metric | Your Farm | County Average | Top 10% | Difference |
|--------|-----------|----------------|---------|------------|
| Cabbage yield/acre | 16,000 heads | 12,000 heads | 20,000 heads | +33% vs average |
| Cost per head | KES 5.98 | KES 8.50 | KES 4.50 | -30% vs average ✅ |
| Labour efficiency | 85 heads/worker/day | 60 heads/worker/day | 120 heads/worker/day | +42% vs average |
| Fertilizer use efficiency | 0.003 kg fertilizer/head | 0.005 kg/head | 0.002 kg/head | -40% vs average ✅ |
| Time to harvest | 90 days | 95 days | 82 days | -5% vs average ✅ |
| Post-harvest loss | 8% | 20% | 3% | -60% vs average ✅ |
| Selling price achieved | KES 30/head | KES 25/head | KES 35/head | +20% vs average ✅ |

**AI Summary:** "You're performing above average in 6 of 7 metrics. Your biggest opportunity is increasing yield toward the top 10% — consider closer spacing (40cm × 40cm instead of 45cm × 45cm) with adequate fertilizer. Also, selling directly to restaurants instead of brokers could increase your price by 20%."

### Section 9.6: Input Optimization
**"What's the best fertilizer program for my cabbage?"**

| Approach | Fertilizer | Rate/Acre | Cost/Acre | Expected Yield Impact | Recommendation |
|----------|------------|-----------|-----------|----------------------|----------------|
| Basic | DAP only | 50 kg | 6,500 | Baseline (12,000 heads) | ❌ Suboptimal |
| Standard | DAP + 1× CAN | 50 + 50 kg | 11,500 | +20% (14,400 heads) | ⚠️ OK |
| Optimal | DAP + 2× CAN + K foliar | 50 + 75 + 2L | 16,900 | +40% (16,800 heads) | ✅ Recommended |
| Premium | DAP + 2× CAN + K foliar + micronutrients | 50 + 75 + 2L + 1L | 18,900 | +45% (17,400 heads) | 💰 Marginal return low |

**AI Pick:** "Go with **Optimal** — the KES 2,000 extra for micronutrients only adds 600 heads (KES 18,000 revenue). Not worth it for first season. Focus on the Optimal plan."

---

## PAGE 10: Market & Sales (Enhanced)

**Purpose:** End-to-end market access — from knowing prices to closing sales to delivering produce.

### Section 10.1: Live Market Prices Dashboard
**Major Kenyan Markets — Real-Time:**

| Crop | Unit | Nairobi (Marikiti) | Nairobi (Wakulima) | Kangemi | Mombasa (Kongowea) | Kisumu (Kibos) | Eldoret | Nakuru | Thika |
|------|------|--------------------|--------------------|---------|--------------------|----------------|---------|--------|-------|
| Cabbage | Head | 25–40 | 20–35 | 25–40 | 20–35 | 25–35 | 30–45 | 25–40 | 20–35 |
| Sukuma Wiki | Bundle | 10–20 | 8–15 | 10–20 | 8–15 | 10–15 | 10–20 | 10–18 | 8–15 |
| Tomato | 64kg crate | 2,500–5,000 | 2,000–4,500 | 2,800–5,500 | 2,000–4,500 | 2,500–4,000 | 2,000–3,500 | 2,200–4,000 | 2,500–5,000 |
| Onion | 50kg bag | 4,000–7,000 | 3,500–6,500 | 4,500–7,500 | 3,000–6,000 | 3,500–6,000 | 3,500–6,500 | 4,000–7,000 | 4,000–7,000 |
| Maize | 90kg bag | 3,000–4,500 | 3,000–4,000 | 3,200–4,500 | 3,200–4,000 | 3,000–4,200 | 3,200–4,500 | 3,000–4,200 | 3,000–4,000 |
| Beans | 90kg bag | 6,000–9,000 | 5,500–8,500 | 6,500–9,500 | 5,500–8,000 | 5,000–7,500 | 6,000–8,500 | 5,500–8,000 | 6,000–8,500 |
| Potatoes | 50kg bag | 1,500–2,500 | 1,200–2,200 | 1,500–2,500 | 1,800–3,000 | 1,500–2,500 | 1,500–2,200 | 1,400–2,200 | 1,500–2,500 |
| Carrot | 50kg bag | 2,000–3,500 | 1,800–3,000 | 2,200–3,800 | 2,000–3,500 | 1,800–3,000 | 2,000–3,200 | 2,000–3,500 | 2,000–3,000 |
| Capsicum | Kg | 40–80 | 35–70 | 45–90 | 30–60 | 35–70 | 35–65 | 40–80 | 40–85 |
| Avocado | Piece (Hass) | 15–50 | 12–45 | 18–55 | 10–30 | 12–35 | 15–40 | 15–45 | 15–50 |

**Price Change Indicators:** 🟢 Price up vs last week | 🔴 Price down | ↔️ Stable

### Section 10.2: Price Trend Charts
**Interactive charts showing:**
- Last 7 days (daily)
- Last 30 days (daily)
- Last 12 months (weekly)
- Same period last year (comparison)
- Seasonal pattern (multi-year average)

**Example: Cabbage Price at Marikiti — Last 12 Months**
```
KES/head
50 |     *
45 |    * *
40 |   *   *
35 |  *     *     * *
30 | *       *   *   *   *
25 |*         * *       * *
20 |                      * *     *
15 |                        * * * *
   +--+--+--+--+--+--+--+--+--+--+--+--+
   J  F  M  A  M  J  J  A  S  O  N  D
```
**Insight:** "Cabbage prices peak in Jan–Feb (dry season, low supply) and dip in Jun–Aug (cool dry, some irrigated supply). Planting in Oct–Nov positions you for the Jan price peak."

### Section 10.3: Best Market Recommendation
**AI suggests optimal market based on:**
- Distance from farm
- Current prices
- Transport cost
- Historical price trends
- Buyer reliability ratings

**Example Output:**
| Rank | Market | Distance | Price/Head | Transport Cost | Net Price/Head | Recommendation |
|------|--------|----------|------------|----------------|----------------|----------------|
| 1 | Thika | 15 km | KES 30 | KES 0.50/head | KES 29.50 | ✅ Best — close + good price |
| 2 | Marikiti (Nairobi) | 40 km | KES 35 | KES 2.00/head | KES 33.00 | 💰 Higher price but more transport |
| 3 | Kangemi | 35 km | KES 32 | KES 1.75/head | KES 30.25 | ⚠️ Similar to Marikiti, less volume |
| 4 | Nakuru | 60 km | KES 30 | KES 3.00/head | KES 27.00 | ❌ Too far for same price |

### Section 10.4: Buyer Directory
| Buyer Type | Name/Category | Location | Crops Wanted | Min Quantity | Payment Terms | Contact | Rating |
|------------|--------------|----------|--------------|--------------|---------------|---------|--------|
| Broker | Kamau Brokers | Marikiti | All vegetables | 500 kg+ | Cash on delivery | 0712XXX | 3.5★ |
| Supermarket | Tuskys/Naivas procurement | Nairobi | Cabbage, tomato, kale | 1 tonne+/week | 30-day invoice | procurement@xxx | 4.0★ |
| Restaurant | Karen Greens Restaurant | Karen | Cabbage, herbs | 50–100 heads/week | Weekly M-Pesa | 0733XXX | 4.8★ |
| Exporter | Vegpro Ltd | Nairobi | French beans, avocado, baby corn | Contract | 45-day invoice | 020XXX | 4.5★ |
| Processor | Mumias Sugar | Kakamega | Sugarcane | Tonne | Per tonne rate | — | 3.8★ |
| Cooperative | Kiambu Farmers Coop | Kiambu | Mixed | Any | Weekly settlement | 0722XXX | 4.2★ |
| Online | Twiga Foods | Nairobi | All vegetables | 100 kg+ | 7-day payment | app.twiga | 4.0★ |
| Direct consumer | WhatsApp group | Local | Small quantities | Any | Cash/M-Pesa | — | — |

### Section 10.5: Harvest Sales Planner
**For Cabbage (0.5 acre, expected harvest Jan 15):**

| Scenario | Quantity | Price/Head | Gross Revenue | Transport | Market Fees | Net Revenue |
|----------|----------|------------|---------------|-----------|-------------|-------------|
| Sell all at Marikiti | 14,500 heads | KES 30 | 435,000 | 29,000 | 4,350 | 401,650 |
| Split: 50% Marikiti + 50% direct | 7,250 each | KES 30 + KES 35 | 471,250 | 14,500 | 2,175 | 454,575 |
| Sell all direct to restaurants | 14,500 heads | KES 35 | 507,500 | 7,250 | 0 | 500,250 |
| Store 2 weeks, sell at peak | 14,500 heads | KES 40 (predicted) | 580,000 | 29,000 | 5,800 | 545,200 |
| | | | | | | |
| AI Recommendation | | | **Store 2 weeks** | | | **+KES 143,550 vs immediate Marikiti** |

### Section 10.6: Sales Recording
| Field | Details |
|-------|---------|
| Date | Jan 15, 2027 |
| Crop | Cabbage — Gloria F1 |
| Quantity sold | 5,000 heads |
| Unit | Head |
| Price per unit | KES 30 |
| Total amount | KES 150,000 |
| Buyer | Kamau Brokers, Marikiti |
| Buyer phone | 0712XXX |
| Payment method | M-Pesa |
| M-Pesa receipt | SHK7PQ2RT |
| Payment status | ✅ Received |
| Transport cost | KES 10,000 |
| Market fees | KES 1,500 |
| Net income | KES 138,500 |
| Quality grade | A (firm, no damage) |
| Notes | "Buyer complained about size variation — sort better next time" |

### Section 10.7: Contract Farming Board
**Available Contracts (filtered by farmer's county and crops):**

| Contract | Company | Crop | Acreage | Duration | Price Guarantee | Requirements | Apply |
|----------|---------|------|---------|----------|-----------------|--------------|-------|
| French beans export | Vegpro Ltd | French beans (Julien) | 0.5+ acre | 6 months | KES 80/kg | GlobalG.A.P certification, specific variety | [Apply] |
| Sugarcane supply | Butali Sugar | Sugarcane | 2+ acres | 4 years | KES 4,200/tonne | Registered with factory, specific variety | [Apply] |
| Avocado supply | Kakuzi Ltd | Hass avocado | 1+ acre | 5 years | Market price + 10% | Organic preferred, specific grades | [Apply] |
| Tomato supply | Kenyan Kitchen Ltd | Tomatoes | 0.5+ acre | 1 year | KES 40/kg min | Consistent supply, minimum 200kg/week | [Apply] |

---

## PAGE 11: Analytics & Reporting (Enhanced)

**Purpose:** Deep insights into farm performance through charts, KPIs, and exportable reports.

### Section 11.1: Farm Overview KPIs
| KPI | Value | vs Last Season | vs County Average |
|-----|-------|----------------|-------------------|
| Total acreage under production | 2.5 acres | +0.5 | — |
| Active crops | 3 | +1 | — |
| Total revenue (YTD) | KES 580,000 | +45% | +30% |
| Total expenses (YTD) | KES 210,000 | +20% | -5% |
| Net profit (YTD) | KES 370,000 | +65% | +55% |
| Overall ROI | 176% | +30pp | +40pp |
| Labour cost as % of revenue | 15% | -3pp | -8pp |
| Post-harvest loss rate | 8% | -5pp | -12pp |

### Section 11.2: Crop Performance Comparison
| Crop | Yield/Acre | Cost/Acre | Revenue/Acre | Profit/Acre | ROI | Rank |
|------|-----------|-----------|-------------|-------------|-----|------|
| Cabbage | 29,000 heads | KES 139,600 | KES 870,000 | KES 730,400 | 523% | 🥇 |
| Maize | 18 bags | KES 40,000 | KES 63,000 | KES 23,000 | 58% | 🥉 |
| Tomato | 20 tonnes | KES 150,000 | KES 800,000 | KES 650,000 | 433% | 🥈 |

**Charts:**
- Bar chart: Revenue per crop
- Bar chart: Cost per crop
- Bar chart: ROI per crop
- Pie chart: Revenue mix

### Section 11.3: Cost Analysis
**Cost Breakdown (All Crops, YTD):**
| Category | Amount (KES) | % of Total | vs Budget |
|----------|-------------|------------|-----------|
| Fertilizers | 65,000 | 31% | -5% |
| Labour | 42,000 | 20% | +2% |
| Seeds | 18,000 | 9% | -10% |
| Pesticides | 25,000 | 12% | +8% |
| Manure | 30,000 | 14% | 0% |
| Transport | 15,000 | 7% | +15% |
| Equipment | 8,000 | 4% | — |
| Other | 7,000 | 3% | — |
| **TOTAL** | **210,000** | **100%** | |

**Charts:**
- Pie chart: Cost by category
- Stacked bar: Cost by category per crop
- Line chart: Cumulative spending vs budget over time

### Section 11.4: Revenue Analysis
| Month | Cabbage | Maize | Tomato | Total | Target | Variance |
|-------|---------|-------|--------|-------|--------|----------|
| Jul | 0 | 63,000 | 0 | 63,000 | 50,000 | +13,000 ✅ |
| Aug | 0 | 0 | 200,000 | 200,000 | 150,000 | +50,000 ✅ |
| Sep | 0 | 0 | 317,000 | 317,000 | 200,000 | +117,000 ✅ |
| Oct | 0 | 0 | 0 | 0 | 50,000 | -50,000 🔴 |
| Nov | 0 | 0 | 0 | 0 | 0 | 0 |
| Dec | 0 | 0 | 0 | 0 | 50,000 | -50,000 🔴 |
| Jan (proj) | 435,000 | 0 | 0 | 435,000 | 200,000 | +235,000 ✅ |

### Section 11.5: Labour Efficiency
| Metric | Value |
|--------|-------|
| Total labour cost (YTD) | KES 42,000 |
| Total labour days | 84 |
| Cost per labour day | KES 500 |
| Revenue per labour day | KES 6,905 |
| Workers employed | 6 unique |
| Best worker (by tasks completed) | John Mwangi — 22 tasks |
| Highest rated worker | Grace Wanjiku — 4.8★ |
| Attendance rate | 92% |

### Section 11.6: Weather Impact Analysis
| Season | Rainfall (Actual) | Rainfall (Normal) | Deviation | Yield Impact | Notes |
|--------|-------------------|-------------------|-----------|--------------|-------|
| SR 2026 (Cabbage) | 280 mm (Oct–Dec) | 320 mm | -13% | -5% estimated | Slightly dry, compensated with irrigation |
| LR 2026 (Maize) | 350 mm (Mar–May) | 400 mm | -13% | -10% estimated | Dry spell in April affected tasseling |

### Section 11.7: Custom Report Builder
| Filter | Options |
|--------|---------|
| Date range | Picker |
| Crops | Multi-select |
| Plots | Multi-select |
| Metrics | Revenue, Cost, Profit, Yield, Labour, Inputs, Weather |
| Compare to | Last season, County average, Top farmers |
| Chart types | Bar, Line, Pie, Table, Area |
| Export format | PDF, Excel, CSV |
| Share | Email, WhatsApp, Download |

### Section 11.8: Pre-Built Reports
| Report Name | Contents | Use Case |
|-------------|----------|----------|
| Season Summary | Full P&L per crop, yield, costs, weather impact | Season review, planning |
| Loan Application Report | Farm profile, yield history, revenue, assets | Bank/cooperative loan |
| Crop Performance Card | Single crop: all metrics from planting to sale | Benchmarking, improvement |
| Financial Statement | Income statement, balance sheet, cash flow | Accounting, tax |
| Input Usage Report | All inputs used, costs, efficiency | Optimization |
| Labour Report | Attendance, wages, efficiency, worker ratings | Payroll audit |
| Compliance Report | Spray records, PHI, soil tests, certifications | KEPHIS, GlobalG.A.P, KS1758 |
| Market Analysis | Price trends, sales by market, buyer performance | Sales strategy |

---

## PAGE 12: Records, Traceability & Compliance (Enhanced)

**Purpose:** Digital farm record-keeping that meets Kenyan and international standards.

### Section 12.1: Farm Diary
| Date | Entry Type | Content | Linked Crop | Photo | Location |
|------|-----------|---------|-------------|-------|----------|
| Oct 20 | Activity | Transplanted 4,000 cabbage seedlings to Plot 1 | Cabbage | 📷 | Plot 1 |
| Oct 25 | Observation | Noticed 3 plants with cutworm damage | Cabbage | 📷 | Plot 1, NW corner |
| Oct 28 | Weather event | Heavy rain overnight, some waterlogging in low area | Cabbage | — | Plot 1 |
| Nov 5 | Decision | Decided to skip second weeding, weeds minimal | Cabbage | — | — |
| Nov 10 | Market observation | Cabbage prices at Thika down to KES 22/head | Cabbage | — | Thika market |
| Nov 15 | Problem | Black rot found on 5 plants, removed and burned | Cabbage | 📷 | Plot 1, center |

### Section 12.2: Complete Spray Record (Compliance-Grade)
| # | Date | Crop & Plot | Pest/Disease | Product Name | Active Ingredient | Batch No. | Rate | Volume Mixed | Area Treated | Applicator | PPE Used? | Wind | Temp | Pre-Harvest Interval | Re-Entry Interval | Next Safe Harvest |
|---|------|-------------|--------------|-------------|-------------------|-----------|------|-------------|-------------|------------|-----------|------|------|---------------------|-------------------|-------------------|
| 1 | Nov 15 | Cabbage, Plot 1 | Black rot | Mancozeb 80WP | Mancozeb 800g/kg | MB2026-11 | 50g/20L | 100L | 0.5 acre | John Mwangi | ✅ Gloves, mask, overalls | 5 km/h NE | 22°C | 14 days | 24 hours | Nov 29 |
| 2 | Dec 1 | Cabbage, Plot 1 | Black rot (preventive) | Mancozeb 80WP | Mancozeb 800g/kg | MB2026-11 | 50g/20L | 100L | 0.5 acre | John Mwangi | ✅ | 8 km/h E | 24°C | 14 days | 24 hours | Dec 15 |
| 3 | Dec 15 | Cabbage, Plot 1 | Aphids | Imidacloprid 200SL | Imidacloprid 200g/L | IP2026-08 | 10ml/20L | 100L | 0.5 acre | Self | ✅ | 3 km/h SE | 25°C | 21 days | 24 hours | Jan 5 |
| 4 | Jan 15 | PLANNED HARVEST | — | — | — | — | — | — | — | — | — | — | — | — | — | ✅ SAFE (all PHIs cleared) |

**Compliance Check Status:** ✅ All spray records complete. ✅ All PHIs respected. ✅ Harvest date is safe.

### Section 12.3: Input Purchase Records
| Date | Input | Supplier | Invoice No. | Qty | Unit Price | Total | Batch/Lot No. | Expiry | Cert No. | Receipt |
|------|-------|----------|-------------|-----|------------|-------|---------------|--------|----------|---------|
| Oct 18 | DAP 50kg | Githunguri Agro-vet | INV-4521 | 1 bag | 6,500 | 6,500 | DAP-KEL-2026-09 | Dec 2028 | KEPHIS-FC-1234 | 📷 |
| Oct 18 | Mancozeb 80WP | Githunguri Agro-vet | INV-4521 | 2 kg | 800/kg | 1,600 | MB2026-11 | Jun 2028 | PCPB-8765 | 📷 |
| Oct 15 | Cabbage Gloria F1 | Kenya Seed Depot | KS-78912 | 4 × 10g | 800 | 3,200 | CS-F1-2026-06 | Dec 2027 | KEPHIS-SC-5678 | 📷 |

### Section 12.4: Harvest & Batch Traceability
**Batch ID:** GRM-KMB-2027-001
| Data Point | Value |
|------------|-------|
| Farm | Mary's Farm, Githunguri, Kiambu |
| Farmer | Mary Wanjiku, ID 12345678 |
| Crop | Cabbage — Gloria F1 |
| Plot | Plot 1, 0.5 acre |
| Planting date | October 20, 2026 |
| Harvest date | January 15, 2027 |
| Quantity | 14,500 heads |
| Grade | A: 10,000, B: 3,500, C: 1,000 |
| Inputs used | DAP 25kg, CAN 37.5kg, Mancozeb 1kg, Imidacloprid 50ml, Manure 2.5T |
| Spray records | 3 applications (see spray record) |
| Last spray date | December 15 (Imidacloprid, PHI 21 days → safe Jan 5) |
| Soil test | pH 5.8, done Sep 2026 |
| QR code | Links to full digital record |
| Destination | Marikiti Market via Kamau Brokers |

### Section 12.5: Certification Tracker
| Certification | Status | Requirements | Progress | Due Date |
|---------------|--------|--------------|----------|----------|
| KS1758 (Horticulture) | 🟡 In Progress | Spray records, hygiene, traceability | 70% complete | Mar 2027 |
| GlobalG.A.P | ⬜ Not started | Full record-keeping, audits, training | 0% | — |
| Organic (KOA) | ⬜ Not started | 3-year conversion, no synthetic inputs | 0% | — |
| KEPHIS Seed Dealer | ✅ N/A | — | — | — |
| PCPB User Certificate | ✅ Active | Valid pesticide use training | Renewed Oct 2026 | Oct 2027 |

**KS1758 Checklist:**
- [x] Farm registration with county
- [x] Spray records maintained
- [x] Input purchase records with receipts
- [x] Pre-harvest intervals respected
- [x] Harvest hygiene (clean containers, no ground contact)
- [x] Traceability system (batch IDs, QR codes)
- [ ] Worker health & safety training
- [ ] Water quality testing
- [ ] Post-harvest handling SOPs documented
- [ ] Internal audit completed
- [ ] External audit scheduled

### Section 12.6: Soil Test Records
| Date | Lab | Plot | pH | N (ppm) | P (ppm) | K (ppm) | Ca | Mg | Organic Matter | Recommendation |
|------|-----|------|-----|---------|---------|---------|----|----|----------------|----------------|
| Sep 2026 | KALRO Lab | Plot 1 | 5.8 | 15 (Low) | 25 (Medium) | 180 (High) | 1200 | 200 | 3.2% (Medium) | Lime 2T/acre, DAP at planting, CAN top dress |
| Mar 2025 | KALRO Lab | Plot 1 | 5.5 | 12 (Low) | 20 (Medium) | 160 (High) | 1100 | 180 | 2.8% (Low) | Lime, manure, DAP |

**Trend:** pH improved from 5.5 to 5.8 after manure application. Organic matter improved. Continue liming programme.

---

## PAGE 13: Community, Learning & Benchmarking (Enhanced)

**Purpose:** Social learning, extension content, and peer comparison.

### Section 13.1: Discussion Forums
**Forum Categories:**
| Category | Sub-Forums | Members | Active Threads |
|----------|-----------|---------|----------------|
| 🌾 Crops | Maize, Vegetables, Potatoes, Fruits, Sugarcane, Beans | 12,000 | 340 |
| 📍 County Groups | Kiambu, Uasin Gishu, Kakamega, Nakuru, etc. (47 counties) | 8,500 | 210 |
| 💰 Business | Markets, Pricing, Buyers, Contracts | 5,200 | 150 |
| 🐛 Pests & Diseases | Identification, Treatment, Prevention | 6,800 | 280 |
| 💡 Techniques | Irrigation, Organic farming, Greenhouse, Conservation ag | 4,100 | 95 |
| 📚 Ask the Expert | Agronomist Q&A | 9,000 | 420 |

**Sample Thread:**
> **Title:** Black rot kwa cabbage Kiambu — nifanye nini?
> **Posted by:** @maryWanjiku — Nov 12, 2026
> **Content:** "Wameanza kuonekana makala ya V yarangi kwa cabbage zangu wiki hii. mvua imekuwa ikinyesha sana. Nimefungua thread hii..."
>
> **Reply 1:** @johnFarmer — "Same hapa Limuru. Nimerukia Mancozeb wiki iliyopita, inasaidia lakini haishiki kabisa. Jaribu kuongeza spacing."
>
> **Reply 2:** @agronomistPeter (Verified Agronomist) — "Hiyo ni Black rot sure. Fanya hivi: 1) Ondoa mimea yote iliyoathirika na uume. 2) Rukia Mancozeb 50g/20L kila siku 14. 3) Hakikisha hakuna maji yanayosimama kwenye shamba. 4) Epuka kunyunyuzia juu ya majani."

### Section 13.2: Extension Library
**Content Categories:**
| Category | Format | Language | Count | Source |
|----------|--------|----------|-------|--------|
| Crop production guides | PDF | EN/SW | 120 | KALRO, MoA |
| Video tutorials | Video (2–10 min) | EN/SW | 85 | KALRO, Farmshine, GrowMO |
| Pest & disease ID cards | Image + text | EN/SW | 200 | KALRO, CABI, PCPB |
| Fertilizer application guides | PDF | EN/SW | 45 | KEL, Yara, KALRO |
| Weather & climate guides | PDF | EN/SW | 20 | Kenya Met |
| Market information | PDF + video | EN/SW | 30 | MoA, KAM |
| Soil management | PDF | EN/SW | 25 | KALRO, FAO |
| Post-harvest handling | Video + PDF | EN/SW | 35 | KALRO, Uni of Nairobi |
| Financial literacy | Video | SW | 15 | GrowMO, Equity Bank |
| Certification guides | PDF | EN | 10 | KEPHIS, GlobalG.A.P |

**Example Video:** "Jinsi ya kudhibiti Fall Armyworm kwa mahindi" — 8 min, Kiswahili, by KALRO
**Example Guide:** "Cabbage Production Guide — Kiambu County" — PDF, 12 pages, by KALRO + GrowMO

### Section 13.3: Agronomist Connect
| Service | Details | Cost |
|---------|---------|------|
| Chat with agronomist | Text/chat, response within 2 hours | Free (2/month), KES 50/session after |
| Photo diagnosis | Send photo, get pest/disease ID + treatment | Free (3/month), KES 30 after |
| Voice call | 15-minute phone consultation | KES 100 |
| Field visit | Agronomist visits your farm | KES 500–2,000 (by distance) |
| Season-long consultation | Dedicated agronomist for full season | KES 5,000–15,000/season |

### Section 13.4: Farmer Groups
| Group Name | County | Crop Focus | Members | Activities | Join |
|------------|--------|------------|---------|------------|------|
| Kiambu Vegetable Farmers | Kiambu | Vegetables | 245 | Group buying, collective marketing, training | [Join] |
| Uasin Gishu Maize Growers | Uasin Gishu | Maize | 1,200 | Bulk input purchase, transport sharing | [Join] |
| Nyandarua Potato Association | Nyandarua | Potatoes | 890 | Cooperative marketing, warehouse receipt | [Join] |
| Women in Horticulture KE | National | Mixed horticulture | 3,400 | Training, market access, grants | [Join] |
| Organic Farmers Kenya | National | Organic | 1,100 | Certification support, premium markets | [Join] |

**Group Features:**
- Shared chat
- Group buying (bulk input orders at discount)
- Collective marketing (aggregate produce for better prices)
- Group financials (contributions, loans)
- Training events calendar
- Performance benchmarking within group

### Section 13.5: Success Stories
| Farmer | County | Crop | Achievement | Income | Story |
|--------|--------|------|-------------|--------|-------|
| Mary Wanjiku | Kiambu | Cabbage, Tomato | From 0.25ac to 2ac in 2 years using GrowMO | KES 1.2M/year | "I used to guess everything. Now I plan, track, and sell smart." |
| Joseph Kipchoge | Uasin Gishu | Maize | Increased yield from 15 to 32 bags/acre | KES 450,000/season | "The AI told me exactly when to top dress. Made all the difference." |
| Fatuma Hassan | Mombasa | Vegetables | First woman in her village to export | KES 800,000/year | "GrowMO helped me get GlobalG.A.P certified and connect to an exporter." |

---

## PAGE 14: Payments, Wallet & Mobile Money (Enhanced)

**Purpose:** Complete financial transactions hub with M-Pesa Daraja integration.

### Section 14.1: Wallet Dashboard
| Element | Value |
|---------|-------|
| Available balance | KES 35,000 |
| In allocated budgets | KES 20,000 |
| Free balance | KES 15,000 |
| Pending outflows | KES 4,500 |
| Effective available | KES 10,500 |
| Monthly deposit total | KES 60,000 |
| Monthly spend total | KES 35,500 |

### Section 14.2: Deposit Money
| Method | Flow | Min | Max | Fee | Speed |
|--------|------|-----|-----|------|-------|
| M-Pesa STK Push | Enter amount → STK push → enter PIN → confirmed | KES 100 | KES 150,000 | Free | Instant |
| M-Pesa Paybill | Send to Paybill XXXXXX, Acc: Phone number | KES 100 | KES 150,000 | Free | 5–10 min |
| Bank transfer | KCB, Equity, Co-op, NCBA — enter details | KES 500 | KES 1,000,000 | KES 50 | 1–4 hours |
| Agent deposit | Visit GrowMO agent, pay cash | KES 100 | KES 50,000 | KES 20 | Instant |
| Card (Visa/Mastercard) | Enter card details | KES 100 | KES 100,000 | 1.5% | Instant |

### Section 14.3: Send Money / Pay
| Type | Recipient | Flow |
|------|-----------|------|
| Pay worker (M-Pesa B2C) | Phone number | Enter number → amount → confirm PIN → M-Pesa sent |
| Pay supplier (M-Pesa B2B) | Paybill/Till number | Enter Till → amount → account ref → confirm PIN |
| Transfer to bank | Bank account | Select bank → enter details → amount → confirm |
| Send to another GrowMO user | Phone number | Enter number → amount → confirm (instant, free) |
| Pay bill (utilities) | KPLC, Water, etc. | Select biller → enter account → amount → pay |

### Section 14.4: Auto-Pay Management
| Rule | Trigger | Recipients | Amount | Status | Last Triggered |
|------|---------|------------|--------|--------|----------------|
| Pay on task complete | Task marked "Complete" | Assigned workers | Per task rate | ✅ Active | Oct 25 |
| Weekly labour payout | Every Friday 5 PM | All unpaid workers | Sum of week | ⏸️ Paused | — |
| Input purchase auto-pay | Budget category + approved supplier | Supplier Till | Invoice amount | ✅ Active | Oct 18 |
| Subscription renewal | Monthly, 1st | GrowMO | KES 299 | ✅ Active | Oct 1 |

### Section 14.5: Transaction History (Full)
| Date | Type | Description | Amount | Balance After | Method | Ref No. | Status |
|------|------|-------------|--------|---------------|--------|---------|--------|
| Oct 25, 10:30 | Out | Labour: John Mwangi (weeding) | -500 | 35,000 | M-Pesa B2C | QJK3L5X7YZ | ✅ Success |
| Oct 25, 10:30 | Out | Labour: Peter Kamau (weeding) | -500 | 35,500 | M-Pesa B2C | PLM8NR2KQW | ✅ Success |
| Oct 25, 10:30 | Out | Labour: Grace Wanjiku (weeding) | -500 | 36,000 | M-Pesa B2C | RTY9PV3NXM | ✅ Success |
| Oct 25, 9:00 | In | Deposit from M-Pesa | +10,000 | 36,500 | M-Pesa C2B | SHK4RT9AB | ✅ Success |
| Oct 18, 3:00 | Out | Input: Githunguri Agro-vet (DAP) | -6,500 | 26,500 | M-Pesa B2B | TLL5MN8PQR | ✅ Success |
| Oct 18, 2:00 | In | Deposit from M-Pesa | +50,000 | 33,000 | M-Pesa C2B | NMP7QW3ERT | ✅ Success |
| Oct 1 | Out | Subscription: GrowMO Premium | -299 | 33,299 | Internal | SUB-2026-10 | ✅ Success |

**Filters:** Date range, type (in/out), method, status, linked crop, linked budget

### Section 14.6: Budget Allocation
| Budget | Allocated | Spent From Allocation | Remaining in Budget | Available in Wallet |
|--------|-----------|----------------------|---------------------|---------------------|
| Cabbage SR 2026 | 20,000 | 15,000 | 5,000 | ✅ |
| Maize LR 2027 | 0 | 0 | 0 | — |
| General farm | 0 | 0 | 0 | — |

### Section 14.7: Security & Controls
| Feature | Details |
|---------|---------|
| Wallet PIN | 4-digit, required for all transactions |
| Biometric | Fingerprint/face for app login (optional) |
| Transaction limits | Daily: KES 50,000, Monthly: KES 500,000 (configurable) |
| Approval required | Transactions > KES 5,000 require second PIN entry |
| Recipient whitelist | Only pay saved workers/suppliers (optional) |
| Freeze wallet | Instant freeze via app or SMS |
| Fraud alerts | SMS for any transaction, unusual activity detection |
| Session timeout | Auto-logout after 5 minutes of inactivity |

---

## PAGE 15: Settings, Team & Permissions (Enhanced)

**Purpose:** Account management, team collaboration, and data control.

### Section 15.1: Profile Settings
All fields from onboarding (Page 1, Section 1.1) — editable.

### Section 15.2: Farm Settings
Edit all plot details, add/remove plots, update soil data, change farm name.

### Section 15.3: Team Management
**Add Team Member:**
| Field | Details |
|-------|---------|
| Name | Peter Kamau |
| Phone | 0723456789 |
| Role | Farm Manager / Agronomist / Accountant / Worker / Viewer |
| Permissions | See below |
| Plots accessible | All / Selected plots |
| Crops accessible | All / Selected crops |
| Financial access | Full / View only / None |
| Payment authority | Can initiate payments / Can approve / None |
| Valid from | Oct 1, 2026 |
| Valid until | Indefinite / Specific date |

**Role Permission Matrix:**

| Feature | Owner | Manager | Agronomist | Accountant | Worker | Viewer |
|---------|-------|---------|------------|------------|--------|--------|
| Dashboard | Full | Full | Full | View only | Tasks only | View only |
| Crop management | Full | Full | Full | View only | — | View only |
| Input management | Full | Full | View + recommend | View only | — | View only |
| Labour scheduling | Full | Full | View only | View only | Own tasks | View only |
| Labour payment | Full | Initiate | — | Full | — | — |
| Financial management | Full | View + record | — | Full | — | — |
| Wallet | Full | View only | — | View only | — | — |
| Pay workers | Full | Initiate | — | Initiate | — | — |
| Market & sales | Full | Full | — | Full | — | View only |
| Analytics | Full | Full | View only | Full | — | View only |
| Records & compliance | Full | Full | Full | Full | — | View only |
| Settings | Full | — | — | — | — | — |
| Add/remove team | Full | — | — | — | — | — |

### Section 15.4: Notification Preferences
| Channel | Type | Toggle |
|---------|------|--------|
| Push | Task reminders | ✅ |
| Push | Weather alerts | ✅ |
| Push | Payment confirmations | ✅ |
| Push | Market price changes | ❌ |
| Push | AI tips | ✅ |
| SMS | Weather warnings (extreme only) | ✅ |
| SMS | Payment sent/received | ✅ |
| SMS | Task reminders (if no internet for 2 hrs) | ✅ |
| WhatsApp | Weekly summary | ❌ |
| WhatsApp | Market price update | ✅ |
| Email | Monthly report | ✅ |
| Email | Loan/grant opportunities | ✅ |

### Section 15.5: Data & Privacy
| Setting | Options |
|---------|---------|
| Share data with county extension | Yes/No |
| Share anonymized data for benchmarks | Yes/No |
| Share data with buyers (for traceability) | Yes/No — select which buyers |
| Data retention | Keep all / Auto-delete after 3 years / Custom |
| Export all data | Download ZIP (CSV + photos) |
| Delete account | Full deletion after 30-day grace |

### Section 15.6: Subscription Plans
| Feature | Free | Premium (KES 299/mo) | Enterprise (KES 999/mo) |
|---------|------|----------------------|------------------------|
| Crops managed | 2 | Unlimited | Unlimited |
| Plots | 2 | 10 | Unlimited |
| AI advisor (chats/month) | 5 | 50 | Unlimited |
| Weather forecasts | 3-day | 7-day + seasonal | 7-day + seasonal + custom |
| Market prices | 1 market | 5 markets | All markets |
| Analytics | Basic | Advanced | Advanced + custom |
| Reports | 2/month | Unlimited | Unlimited + branded |
| Team members | 1 (self) | 3 | 10 |
| Agronomist chat | — | 2/month | 10/month |
| Auto-pay | — | ✅ | ✅ |
| API access | — | — | ✅ |
| Priority support | — | ✅ | ✅ |
| White-label | — | — | ✅ |

---

## PAGE 16: Mobile, Offline, USSD & SMS Channels (Enhanced)

**Purpose:** Ensure every farmer can access GrowMO regardless of device or connectivity.

### Section 16.1: PWA Offline Mode
| Feature | Offline Capability | Sync Behavior |
|---------|-------------------|---------------|
| View crop plans | ✅ Full | — |
| View task list | ✅ Full | — |
| Mark task complete | ✅ Cached | Syncs when online |
| Record expense | ✅ Cached | Syncs when online |
| Take photos | ✅ Full | Uploads when online |
| View weather | ❌ Shows last cached | Refreshes when online |
| AI chat | ❌ | Queues when online |
| Payments | ❌ | Queues when online |
| Market prices | ❌ Shows last cached | Refreshes when online |

**Offline Indicator:** Banner at top: "🌍 You're offline. Changes will sync when connected."

### Section 16.2: USSD Menu (*384#)
```
GrowMO — *384#
------------------
1. Angalia hali ya hewa (Weather)
2. Shughuli za leo (Today's tasks)
3. Pesa zangu (Wallet balance)
4. Bei za soko (Market prices)
5. Uliza GrowMO AI (Ask AI)
6. Malipo (Payments)
7. Mmea wangu (My crops)
8. Saidia/Help

> Select: 1

Kiambu: 24°C, Mvua 70%. 
Cabbage: Rukia fungicide baada ya mvua.
Jengo la siku 3: J3 ☁️22°C, J4 🌧️21°C, J5 ⛅23°C

0. Rudi | 00. Ondoka
```

```
> Select: 5

Uliza GrowMO AI:
Andika ujumbe wako:
> Mahindi yangu ina wadudu wadogo wenye mabaka mekundu, nifanye nini?

GrowMO: Hiyo ni Fall Armyworm. Fanya hivi:
1. Rukia Alpha Super 5EC, 15ml/20L
2. Rukia asubuhi au jioni
3. Piga dawa kwenye kitovu cha mmea
4. Kama ni wengi sana, pata mshauri wa agronomist

0. Rudi | 00. Ondoka
```

### Section 16.3: SMS Commands
| Command | Action | Response |
|---------|--------|----------|
| SMS "WEATHER" to 20550 | Get current weather for registered location | "Kiambu: 24°C, 70% rain..." |
| SMS "TASKS" to 20550 | Get today's pending tasks | "1. Weed cabbage (Plot 1)..." |
| SMS "BALANCE" to 20550 | Get wallet balance | "Salio lako: KES 35,000" |
| SMS "PRICE cabbage" to 20550 | Get current cabbage price | "Cabbage Marikiti: KES 30/head..." |
| SMS "PAY 0712345678 500" to 20550 | Pay KES 500 to number | "Confirm: Pay KES 500 to 0712***5678? Reply YES" |
| SMS "CROP cabbage" to 20550 | Get cabbage crop status | "Cabbage: Day 24/90, Vegetative. Next: Top dress CAN in 3 days." |

### Section 16.4: WhatsApp Chatbot
- Farmer adds GrowMO number to WhatsApp
- Can send text, voice notes, photos
- Bot responds in selected language
- Photo diagnosis: Send photo of pest/disease → AI identifies + recommends treatment
- Voice notes: Farmer speaks in Kiswahili → transcribed → AI responds

### Section 16.5: Agent Network
| Agent Feature | Details |
|---------------|---------|
| Agent registration | KYC, training, smartphone provided |
| Services | Help farmer onboard, deposit cash, assist with transactions |
| Commission | KES 10–50 per transaction |
| Agent app | Separate app with farmer management, cash handling, reporting |
| Agent locator | Farmer can find nearest agent via USSD or app |
| Target agents | Agro-vet shops, M-Pesa agents, community leaders, church groups |

---

## PAGE 17: Soil Health & Testing Management (NEW)

**Purpose:** Track soil health, manage soil tests, and get fertilizer recommendations based on actual soil data.

### Section 17.1: Soil Test Scheduler
| Field | Details |
|-------|---------|
| Plot | Select plot |
| Last test date | Sep 2026 |
| Recommended next test | Sep 2027 (annual) |
| Test type | Basic (pH, N, P, K) / Comprehensive (+ Ca, Mg, S, micros) / Specialized (heavy metals, pathogens) |
| Lab | KALRO Lab / University of Nairobi / CropNutrition Lab / County lab |
| Cost | Basic: KES 2,000, Comprehensive: KES 5,000 |
| Book test | [Schedule] → generates sample collection instructions |

### Section 17.2: Soil Test Results Dashboard
| Parameter | Value | Status | Optimal Range (Cabbage) | Recommendation |
|-----------|-------|--------|------------------------|----------------|
| pH | 5.8 | 🟡 Slightly low | 6.0–7.0 | Apply 2 tonnes/acre agricultural lime |
| Organic Matter |