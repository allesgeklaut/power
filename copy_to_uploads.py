import shutil
import os

UPLOAD_DIR = "uploads"
CONSUMPTION_TARGET = os.path.join(UPLOAD_DIR, "last_consumption.xlsx")
PRICE_TARGET = os.path.join(UPLOAD_DIR, "last_prices.csv")

# Change these paths to where your files are downloaded
CONSUMPTION_SOURCE = r"C:\Users\krems\Downloads\verbrauch_anlage_919667.xlsx"
PRICE_SOURCE = r"C:\Users\krems\Downloads\EXAAD1P_2024-12-31T23_00_00Z_2025-12-31T23_00_00Z_15M_de_2025-10-12T16_03_21Z.csv"

os.makedirs(UPLOAD_DIR, exist_ok=True)

# Copy consumption file
if os.path.exists(CONSUMPTION_SOURCE):
    shutil.copy2(CONSUMPTION_SOURCE, CONSUMPTION_TARGET)
    print(f"Copied consumption file to {CONSUMPTION_TARGET}")
else:
    print(f"Consumption file not found: {CONSUMPTION_SOURCE}")

# Copy price file
if os.path.exists(PRICE_SOURCE):
    shutil.copy2(PRICE_SOURCE, PRICE_TARGET)
    print(f"Copied price file to {PRICE_TARGET}")
else:
    print(f"Price file not found: {PRICE_SOURCE}")
