import streamlit as st
import pandas as pd
import os
import shutil

# Directory for persistent uploads
upload_dir = "uploads"
os.makedirs(upload_dir, exist_ok=True)
cons_path = os.path.join(upload_dir, "last_consumption.xlsx")
price_path = os.path.join(upload_dir, "last_prices.csv")
import plotly.graph_objects as go
from cost_calculator import PowerCostCalculator


st.title("Stromverbrauch & Kosten Analyse")
st.markdown("""
**Datenquellen für den manuellen Download:**
- [Marktpreise (APG)](https://markt.apg.at/transparenz/uebertragung/day-ahead-preise/)
- [Verbrauchsdaten (Ökostrom)](https://mein.oekostrom.at/a-p/)

*Hinweis: Es gibt keine API für diese Daten, daher müssen die Dateien manuell heruntergeladen und hier hochgeladen werden.*
""")

st.sidebar.header("Dateien hochladen")
cons_file = st.sidebar.file_uploader("Verbrauchsdaten (.xlsx)", type=["xlsx"], key="cons_file")
price_file = st.sidebar.file_uploader("Preisdaten (.csv)", type=["csv"], key="price_file")

# Directory for persistent uploads

# --- Button to copy all files from a download folder to uploads ---
st.sidebar.header("Dateien automatisch kopieren")
download_folder = st.sidebar.text_input("Pfad zum Download-Ordner", value=os.path.expanduser(r"~\Downloads_powerdata"), help="Pfad zum Ordner, in dem die heruntergeladenen Dateien gespeichert werden.")
if st.sidebar.button("Alle Dateien aus Download-Ordner in Uploads kopieren"):
    if os.path.exists(download_folder):
        files = [f for f in os.listdir(download_folder) if os.path.isfile(os.path.join(download_folder, f))]
        for f in files:
            src = os.path.join(download_folder, f)
            dst = os.path.join(upload_dir, f)
            # TODO Rename to last_consumption.xlsx and last_prices.csv based on file type
            shutil.copy2(src, dst)
        st.sidebar.success(f"{len(files)} Dateien nach '{upload_dir}' kopiert.")
    else:
        st.sidebar.error("Download-Ordner existiert nicht.")

# Save uploaded files to disk and always use disk files
if cons_file:
    with open(cons_path, "wb") as f:
        f.write(cons_file.getbuffer())
if price_file:
    with open(price_path, "wb") as f:
        f.write(price_file.getbuffer())

# Always use files from disk if present
if os.path.exists(cons_path) and os.path.exists(price_path):
    # Check if files are not empty
    def file_not_empty(f):
        return os.path.getsize(f) > 0

    if not file_not_empty(cons_path):
        st.error("Die Verbrauchsdaten-Datei ist leer oder ungültig.")
        st.stop()
    if not file_not_empty(price_path):
        st.error("Die Preisdaten-Datei ist leer oder ungültig.")
        st.stop()

    df = pd.read_excel(cons_path)
    price_df = pd.read_csv(price_path, sep=";", decimal=",")
    df["timestamp"] = pd.to_datetime(df["Timestamp"], unit="s", errors="coerce")
    df["Verbrauch"] = df["Verbrauch"].astype(str).str.replace(",", ".").astype(float)
    df = df.dropna(subset=["timestamp", "Verbrauch"])
    df["hhmm"] = df["timestamp"].dt.strftime("%H:%M")

    # Zeitspalte korrekt parsen
    if '\ufeffZeit von [CET/CEST]' in price_df.columns:
        price_df['timestamp'] = pd.to_datetime(price_df['\ufeffZeit von [CET/CEST]'], format="%d.%m.%Y %H:%M:%S", errors="coerce")
    else:
        price_df['timestamp'] = pd.to_datetime(price_df['Zeit von [CET/CEST]'], format="%d.%m.%Y %H:%M:%S", errors="coerce")
    price_df['Preis MC Auktion [EUR/MWh]'] = price_df['Preis MC Auktion [EUR/MWh]'].astype(str).str.replace(',', '.').astype(float)

    # Zeitraum-Auswahl
    # --- Flexible Datumsbereich-Auswahl ---
    st.sidebar.header("Zeitraum auswählen")
    min_date = df["timestamp"].min().date()
    max_date = df["timestamp"].max().date()
    today = pd.Timestamp.today().date()
    latest_month = max_date.month
    latest_year = max_date.year
    default_start = pd.Timestamp(year=latest_year, month=latest_month, day=1).date()
    default_end = max_date

    quick = st.sidebar.radio("Schnellauswahl", ["Benutzerdefiniert", "Diesen Monat", "Letzten Monat", "Alle Daten"], index=0, key="date_quick_select")
    if quick == "Diesen Monat":
        start_date = default_start
        end_date = max_date
    elif quick == "Letzten Monat":
        last_month = (pd.Timestamp(default_start) - pd.offsets.MonthBegin(1)).date()
        start_date = last_month.replace(day=1)
        end_date = (pd.Timestamp(start_date) + pd.offsets.MonthEnd(0)).date()
    elif quick == "Alle Daten":
        start_date = min_date
        end_date = max_date
    else:
        start_date = st.sidebar.date_input("Startdatum", value=default_start, min_value=min_date, max_value=max_date)
        end_date = st.sidebar.date_input("Enddatum", value=default_end, min_value=min_date, max_value=max_date)
    # Ensure both are datetime.date
    if isinstance(start_date, pd.Timestamp):
        start_date = start_date.date()
    if isinstance(end_date, pd.Timestamp):
        end_date = end_date.date()
    df_range = df[(df["timestamp"].dt.date >= start_date) & (df["timestamp"].dt.date <= end_date)]

    # --- Allgemeine Verbrauchs- und Kostenstatistiken ---
    st.header("Überblick")
    total_consumption = df_range["Verbrauch"].sum()
    avg_consumption = df_range["Verbrauch"].mean()
    min_consumption = df_range["Verbrauch"].min()
    max_consumption = df_range["Verbrauch"].max()

    # Kostenberechnung für den gewählten Bereich
    cost_calc = PowerCostCalculator(
        consumption_df=df_range,
        price_df=price_df,
        price_col='Preis MC Auktion [EUR/MWh]',
        consumption_col='Verbrauch',
        timestamp_col='timestamp',
        fixed_fee=2.16,
        variable_fee_per_kwh=0.018
    )
    monthly_costs = cost_calc.get_monthly_costs()
    total_cost = monthly_costs.sum()

    col1, col2 = st.columns(2)
    col1.metric("Gesamtverbrauch", f"{total_consumption:.2f} kWh")
    col2.metric("Gesamtkosten", f"{total_cost:.2f} EUR")
    st.markdown(f"**Durchschnittlicher Verbrauch:** {avg_consumption:.2f} kWh pro Messung")
    st.markdown(f"**Minimaler Verbrauch:** {min_consumption:.2f} kWh")
    st.markdown(f"**Maximaler Verbrauch:** {max_consumption:.2f} kWh")

    # --- Verbrauchsdiagramm ---
    st.subheader(f"Stromverbrauch im gewählten Zeitraum: {start_date} bis {end_date}")
    total_by_time = df_range.groupby("hhmm")["Verbrauch"].sum().sort_index()
    fig = go.Figure()
    fig.add_bar(x=total_by_time.index, y=total_by_time.values, marker_color="#36a2eb", name="Verbrauch pro Zeit-Slot", hovertemplate="%{x}: %{y:.2f} kWh")
    fig.update_layout(
        xaxis_title="Zeit (hh:mm)",
        yaxis_title="Verbrauch (kWh)",
        title="Verbrauch pro Zeit-Slot",
        bargap=0.15,
        template="plotly_white",
        font=dict(family="Arial", size=14),
        margin=dict(t=60, b=120)
    )
    fig.update_xaxes(tickangle=90)
    st.plotly_chart(fig, use_container_width=True)

    # --- Kostenberechnung ---
    cost_calc = PowerCostCalculator(
        consumption_df=df_range,
        price_df=price_df,
        price_col='Preis MC Auktion [EUR/MWh]',
        consumption_col='Verbrauch',
        timestamp_col='timestamp',
        fixed_fee=2.16,
        variable_fee_per_kwh=0.018
    )
    monthly_costs = cost_calc.get_monthly_costs()
    st.subheader("Monatliche Stromkosten inkl. Gebühren")
    fig2 = go.Figure()
    fig2.add_bar(x=[str(m) for m in monthly_costs.index], y=monthly_costs.values, marker_color="#4bc0c0", name="Kosten", hovertemplate="%{x}: %{y:.2f} EUR")
    for i, v in enumerate(monthly_costs.values):
        fig2.add_annotation(x=str(monthly_costs.index[i]), y=v, text=f"{v:.2f} EUR", showarrow=False, yshift=15, font=dict(size=13, color="#222"))
    fig2.update_layout(
        yaxis_title="Kosten (EUR)",
        title="Monatliche Stromkosten inkl. Gebühren",
        template="plotly_white",
        font=dict(family="Arial", size=14),
        margin=dict(t=60, b=80)
    )
    st.plotly_chart(fig2, use_container_width=True)

    # --- Analyse: Teure vs. günstige Stunden ---
    from datetime import time
    def is_expensive_hour(hhmm):
        t = pd.to_datetime(hhmm, format="%H:%M").time()
        morning = time(7,0) <= t < time(10,1)
        evening = time(18,0) <= t < time(20,1)
        return morning or evening
    df_range["expensive"] = df_range["hhmm"].apply(is_expensive_hour)
    expensive_consumption = df_range[df_range["expensive"]]["Verbrauch"].sum()
    cheap_consumption = df_range[~df_range["expensive"]]["Verbrauch"].sum()
    total = expensive_consumption + cheap_consumption
    expensive_pct = 100 * expensive_consumption / total if total > 0 else 0
    cheap_pct = 100 * cheap_consumption / total if total > 0 else 0
    st.subheader("Vergleich: Teure vs. Günstige Stunden")
    fig3 = go.Figure()
    fig3.add_bar(x=["Teure Stunden", "Günstige Stunden"], y=[expensive_consumption, cheap_consumption], marker_color=["#ff9800", "#8bc34a"], name="Verbrauch")
    fig3.add_annotation(x="Teure Stunden", y=expensive_consumption, text=f"{expensive_consumption:.2f} kWh<br>({expensive_pct:.1f}%)", showarrow=False, yshift=20, font=dict(size=14, color="#222"))
    fig3.add_annotation(x="Günstige Stunden", y=cheap_consumption, text=f"{cheap_consumption:.2f} kWh<br>({cheap_pct:.1f}%)", showarrow=False, yshift=20, font=dict(size=14, color="#222"))
    fig3.update_layout(
        yaxis_title="Verbrauch (kWh)",
        title="Stromverbrauch: Teure vs. Günstige Stunden",
        template="plotly_white",
        font=dict(family="Arial", size=14),
        margin=dict(t=60, b=60)
    )
    st.plotly_chart(fig3, use_container_width=True)
else:
    st.info("Bitte laden Sie sowohl Verbrauchs- als auch Preisdaten hoch.")
