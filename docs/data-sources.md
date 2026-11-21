# BreatheWise AI — Data Sources & Calculation Standards

## 1. Environmental Telemetry Sources
- **Primary Live Feed:** Open-Meteo Air Quality API.
  - Ingests hourly ambient concentrations for $\text{PM}_{2.5}$, $\text{PM}_{10}$, $\text{NO}_2$, $\text{SO}_2$, $\text{CO}$, and $\text{O}_3$.
  - Free, open-access, zero API key barrier, global coverage.
- **Caching Layer:** In-memory sliding TTL cache (15 minutes) prevents excessive network calls and shields against rate-limiting.
- **Demonstration Mode:** Built-in fixtures representing real-world winter smog episodes (e.g., Delhi Post-Diwali Inversion Smog: PM2.5 = 385, AQI = 445).

---

## 2. Official CPCB NAQI Calculation Methodology

The Indian Central Pollution Control Board (CPCB) calculates the National Air Quality Index using piecewise linear interpolation across predefined pollutant concentration brackets:

$$I = \frac{I_{\text{high}} - I_{\text{low}}}{C_{\text{high}} - C_{\text{low}}} \times (C - C_{\text{low}}) + I_{\text{low}}$$

Where:
- $I$: Sub-index for the target pollutant
- $C$: Measured ambient concentration
- $C_{\text{low}}, C_{\text{high}}$: Concentration breakpoints enclosing $C$
- $I_{\text{low}}, I_{\text{high}}$: Corresponding index breakpoints

### Official CPCB Breakpoint Reference Table

| Category | AQI Range | PM2.5 (µg/m³) | PM10 (µg/m³) | NO2 (µg/m³) | SO2 (µg/m³) | CO (mg/m³) | O3 (µg/m³) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Good** | 0 – 50 | 0 – 30 | 0 – 50 | 0 – 40 | 0 – 40 | 0.0 – 1.0 | 0 – 50 |
| **Satisfactory** | 51 – 100 | 31 – 60 | 51 – 100 | 41 – 80 | 41 – 80 | 1.1 – 2.0 | 51 – 100 |
| **Moderate** | 101 – 200 | 61 – 90 | 101 – 250 | 81 – 180 | 81 – 380 | 2.1 – 10.0 | 101 – 168 |
| **Poor** | 201 – 300 | 91 – 120 | 251 – 350 | 181 – 280 | 381 – 800 | 10.1 – 17.0 | 169 – 208 |
| **Very Poor** | 301 – 400 | 121 – 250 | 351 – 430 | 281 – 400 | 801 – 1600 | 17.1 – 34.0 | 209 – 748 |
| **Severe** | 401 – 500 | 250+ | 430+ | 400+ | 1600+ | 34.0+ | 748+ |

---

## 3. Avoided Lung Inhalation Dose Formula

$$\text{Avoided Lung Inhalation Dose}\ (\mu\text{g}) = C_{\text{ambient}}\ (\mu\text{g/m}^3) \times \eta_{\text{filter}} \times V_E\ (\text{m}^3/\text{h}) \times T\ (\text{h})$$

- $\eta_{\text{filter}}$ (Filtration Efficiency):
  - Certified N95 / FFP2 Respirator: 95%
  - HEPA / Corsi-Rosenthal Box Purifier: 85% – 90%
  - Damp Mopping vs Dry Sweeping: 60%
  - Sealed Windows (Passive Building Envelope): 40%
- $V_E$ (Minute Ventilation Volume Rate, EPA Exposure Factors Handbook):
  - Resting / Sleep: 0.45 m³/h
  - Light Sedentary / Office: 0.60 m³/h
  - Moderate Walking / Chores: 1.20 m³/h
  - Aerobic Exercise / Running: 2.80 m³/h

---

## 4. Transit Modal Shift Emission Factors

Based on Automotive Research Association of India (ARAI), CPCB, and IPCC standards:

| Transit Mode | Average Occupancy | CO2e Factor (kg/pkm) | PM2.5 Factor (g/pkm) |
| :--- | :--- | :--- | :--- |
| **Personal Car (Petrol/Diesel)** | 1.2 passengers | 0.170 | 0.030 |
| **Two-Wheeler (Motorcycle)** | 1.1 passengers | 0.075 | 0.020 |
| **Carpool / Shared Cab** | 3.0 passengers | 0.055 | 0.010 |
| **Urban Bus (Electric / CNG)** | 40 passengers | 0.045 | 0.008 |
| **Metro / Electric Rail** | 800 passengers | 0.022 | 0.001 |
| **Walking / Cycling** | 1.0 person | 0.000 | 0.000 |
