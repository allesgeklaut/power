from cost_calculator import PowerCostCalculator

import pandas as pd
import matplotlib.pyplot as plt

# TODO plot monthly consumption alongside costs
# TODO tidy up code in this file
# TODO order of fees on bottom in plots
# TODO automate data fetching from URLs

# === XLSX einlesen ===
df = pd.read_excel("verbrauch_anlage_919667.xlsx")

# Zeitspalte aus Unix-Timestamp (zweite Spalte) umwandeln
df["timestamp"] = pd.to_datetime(df["Timestamp"], unit="s", errors="coerce")

# Verfügbare Monate extrahieren
available_months = df["timestamp"].dt.to_period("M").dropna().unique()
available_months_str = sorted([str(m) for m in available_months])
print("Verfügbare Monate im Datensatz:")
for idx, m in enumerate(available_months_str):
    print(f"[{idx}] {m}")

# Benutzer nach Startmonat fragen (Auswahl per Nummer)
choice = input("Bitte wählen Sie den Startmonat durch Eingabe der Nummer: ")
if choice:
    choice_idx = int(choice)
else:
    choice_idx = 0

if 0 <= choice_idx < len(available_months_str):
    start_month = available_months_str[choice_idx]
    start_date = pd.Timestamp(start_month + "-01")
    df = df[df["timestamp"] >= start_date]
else:
    choice_idx = 0
    print("Ungültige Auswahl. Es werden alle Daten verwendet.")

# Verbrauchsspalte in float umwandeln (Komma als Dezimaltrenner)
df["Verbrauch"] = df["Verbrauch"].str.replace(",", ".").astype(float)

# Ungültige Werte entfernen
df = df.dropna(subset=["timestamp", "Verbrauch"])

# Zeit als hh:mm extrahieren
df["hhmm"] = df["timestamp"].dt.strftime("%H:%M")

# Gesamter Verbrauch pro Zeit-Slot (hh:mm) für ausgewählten Zeitraum
total_by_time_selected = df.groupby("hhmm")["Verbrauch"].sum().sort_index()

# Gesamter Verbrauch pro Zeit-Slot (hh:mm) für alle Daten
df_all = pd.read_excel("verbrauch_anlage_919667.xlsx")
df_all["timestamp"] = pd.to_datetime(
    df_all["Timestamp"], unit="s", errors="coerce")
df_all["Verbrauch"] = df_all["Verbrauch"].str.replace(",", ".").astype(float)
df_all = df_all.dropna(subset=["timestamp", "Verbrauch"])
df_all["hhmm"] = df_all["timestamp"].dt.strftime("%H:%M")
total_by_time_all = df_all.groupby("hhmm")["Verbrauch"].sum().sort_index()

# Gesamter Stromverbrauch berechnen
total_consumption_selected = df["Verbrauch"].sum()
total_consumption_all = df_all["Verbrauch"].sum()
print(f"Gesamter Stromverbrauch seit {available_months_str[choice_idx]}: {
      total_consumption_selected:.2f} kWh")
print(f"Gesamter Stromverbrauch insgesamt: {total_consumption_all:.2f} kWh")

# --- Kostenberechnung mit Marktpreisen ---
# Lade Preisdaten
price_df = pd.read_csv(
    "EXAAD1P_2024-12-31T23_00_00Z_2025-12-31T23_00_00Z_15M_de_2025-10-22T20_37_02Z.csv",
    sep=';',
    decimal=','
)
# Zeitspalte korrekt parsen
price_df['timestamp'] = pd.to_datetime(
    price_df['\ufeffZeit von [CET/CEST]'], format="%d.%m.%Y %H:%M:%S", errors="coerce")
# Preis umwandeln (Komma als Dezimaltrenner)
price_df['Preis MC Auktion [EUR/MWh]'] = price_df['Preis MC Auktion [EUR/MWh]'].astype(
    str).str.replace(',', '.').astype(float)

# Initialisiere und nutze die Kostenklasse
cost_calc = PowerCostCalculator(
    consumption_df=df,
    price_df=price_df,
    price_col='Preis MC Auktion [EUR/MWh]',
    consumption_col='Verbrauch',
    timestamp_col='timestamp',
    fixed_fee=2.16,
    variable_fee_per_kwh=0.018
)
cost_calc.print_monthly_costs()
cost_calc.plot_monthly_costs()

# Vergleichsdiagramm zeichnen
# Normalisiere das Gesamtprofil auf die Summe des ausgewählten Zeitraums
scaling_factor = total_consumption_selected / \
    total_consumption_all if total_consumption_all > 0 else 1
total_by_time_all_normalized = total_by_time_all * scaling_factor

plt.figure(figsize=(16, 6))
plt.bar(total_by_time_selected.index, total_by_time_selected.values,
        color="skyblue", edgecolor="black", label="Ausgewählter Zeitraum")
plt.plot(total_by_time_all_normalized.index, total_by_time_all_normalized.values,
         color="red", linestyle="--", linewidth=2, alpha=0.7, label="Gesamtes Jahr (normalisiert)")

plt.xlabel("Zeit (hh:mm)")
plt.ylabel("Gesamter Verbrauch (kWh)")
plt.title(f"Vergleich Stromverbrauch pro Zeit-Slot\nSeit {available_months_str[choice_idx]}: {
          total_consumption_selected:.2f} kWh, Gesamt: {total_consumption_all:.2f} kWh")
plt.xticks(rotation=90)
plt.grid(axis="y", linestyle="--", alpha=0.7)
plt.legend()
plt.tight_layout()

# --- Analyse: Verbrauch teure vs. günstige Stunden ---
# Definiere teure Stunden als Zeitbereiche


def is_expensive_hour(hhmm):
    from datetime import time
    t = pd.to_datetime(hhmm, format="%H:%M").time()
    morning = time(7, 0) <= t < time(10, 1)  # 07:00 bis 10:00 inkl. 10:00
    evening = time(18, 0) <= t < time(20, 1)  # 18:00 bis 20:00 inkl. 20:00
    return morning or evening


expensive_mask = df["hhmm"].apply(is_expensive_hour)
expensive_consumption = df[expensive_mask]["Verbrauch"].sum()
cheap_consumption = df[~expensive_mask]["Verbrauch"].sum()
total = expensive_consumption + cheap_consumption
expensive_pct = 100 * expensive_consumption / total if total > 0 else 0
cheap_pct = 100 * cheap_consumption / total if total > 0 else 0
print(f"Teure Stunden: {expensive_consumption:.2f} kWh ({expensive_pct:.1f}%)")
print(f"Günstige Stunden: {cheap_consumption:.2f} kWh ({cheap_pct:.1f}%)")

# Barplot für Vergleich
plt.figure(figsize=(6, 8))  # mehr Höhe
bars = plt.bar(["Teure Stunden", "Günstige Stunden"], [
               expensive_consumption, cheap_consumption], color=["orange", "lightgreen"])
plt.ylabel("Verbrauch (kWh)")
plt.title("Vergleich Stromverbrauch: Teure vs. Günstige Stunden")
for i, v, pct in zip([0, 1], [expensive_consumption, cheap_consumption], [expensive_pct, cheap_pct]):
    plt.text(i, v + max(cheap_consumption, expensive_consumption)*0.05 +
             1, f"{v:.2f} kWh\n({pct:.1f}%)", ha="center", fontweight="bold")
plt.ylim(0, max(cheap_consumption, expensive_consumption)
         * 1.25)  # mehr Platz nach oben
plt.tight_layout()
plt.show()
