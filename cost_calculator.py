"""
Data sources:
- Market prices: https://markt.apg.at/transparenz/uebertragung/day-ahead-preise/
- Consumption: https://mein.oekostrom.at/a-p/
"""
import pandas as pd

class PowerCostCalculator:
    """
    PowerCostCalculator calculates the actual electricity cost based on consumption and market price data.
    It merges consumption and price data by timestamp, applies market and provider fees, and summarizes monthly costs.

    Parameters
    ----------
    consumption_df : pd.DataFrame
        DataFrame containing consumption data with a timestamp column.
    price_df : pd.DataFrame
        DataFrame containing market price data with a timestamp column.
    price_col : str
        Name of the column in price_df with market prices (EUR/MWh).
    consumption_col : str
        Name of the column in consumption_df with consumption values (kWh).
    timestamp_col : str
        Name of the column in both DataFrames with timestamps.
    fixed_fee : float
        Monthly fixed fee from provider (EUR).
    variable_fee_per_kwh : float
        Variable fee per kWh from provider (EUR/kWh).
    """
    def __init__(self, consumption_df, price_df, price_col='Preis MC Auktion [EUR/MWh]', consumption_col='Verbrauch', timestamp_col='timestamp', fixed_fee=2.16, variable_fee_per_kwh=0.018):
        self.consumption_df = consumption_df.copy()
        self.price_df = price_df.copy()
        self.price_col = price_col
        self.consumption_col = consumption_col
        self.timestamp_col = timestamp_col
        self.fixed_fee = fixed_fee
        self.variable_fee_per_kwh = variable_fee_per_kwh
        self.merged_df = None

    def merge_data(self):
        """
        Merge consumption and price data on the timestamp column.
        Result is stored in self.merged_df.
        """
        # Ensure timestamps are in datetime format
        self.consumption_df[self.timestamp_col] = pd.to_datetime(self.consumption_df[self.timestamp_col])
        self.price_df[self.timestamp_col] = pd.to_datetime(self.price_df[self.timestamp_col])
        # Merge on timestamp (inner join)
        self.merged_df = pd.merge(self.consumption_df, self.price_df[[self.timestamp_col, self.price_col]], on=self.timestamp_col, how='inner')

    def calculate_costs(self):
        """
        Calculate market cost, provider variable fee, and total cost for each row.
        Returns merged DataFrame with cost columns.
        """
        if self.merged_df is None:
            self.merge_data()
        # Calculate cost per row
        self.merged_df['market_cost'] = self.merged_df[self.consumption_col] * (self.merged_df[self.price_col] / 1000)
        self.merged_df['variable_fee'] = self.merged_df[self.consumption_col] * self.variable_fee_per_kwh
        self.merged_df['total_cost'] = self.merged_df['market_cost'] + self.merged_df['variable_fee']
        return self.merged_df

    def monthly_total(self):
        """
        Calculate total monthly cost (market + provider fees).
        Returns a Series indexed by month with total cost per month.
        """
        df = self.calculate_costs()
        # Group by month
        df['month'] = df[self.timestamp_col].dt.to_period('M')
        monthly_cost = df.groupby('month')['total_cost'].sum() + self.fixed_fee
        return monthly_cost

    def print_monthly_costs(self):
        """
        Print monthly electricity costs including provider fees.
        """
        monthly_cost = self.monthly_total()
        print('Monatliche Stromkosten inkl. Gebühren:')
        for month, cost in monthly_cost.items():
            print(f'{month}: {cost:.2f} EUR')

    def get_monthly_costs(self):
        """
        Return monthly electricity costs as a Series.
        """
        return self.monthly_total()

    def plot_monthly_costs(self):
        """
        Plot monthly costs, showing market cost, fixed fee, and variable fee as stacked bars.
        """
        df = self.calculate_costs()
        df['month'] = df[self.timestamp_col].dt.to_period('M')
        # Sum market and variable fees per month
        monthly_market = df.groupby('month')['market_cost'].sum()
        monthly_variable = df.groupby('month')['variable_fee'].sum()
        # Fixed fee is the same for each month
        months = monthly_market.index.astype(str)
        monthly_fixed = pd.Series([self.fixed_fee]*len(months), index=months)
        # Prepare data for stacked bar plot
        import matplotlib.pyplot as plt
        plt.figure(figsize=(10,6))
        plt.bar(months, monthly_market, label='Marktpreis', color='skyblue')
        plt.bar(months, monthly_variable, bottom=monthly_market, label='Variabler Anbieterpreis', color='orange')
        plt.bar(months, monthly_fixed, bottom=monthly_market+monthly_variable, label='Fixer Anbieterpreis', color='lightgreen')
        plt.ylabel('Kosten (EUR)')
        plt.title('Monatliche Stromkosten: Markt, Anbieter Fix & Variabel')
        plt.legend()
        plt.tight_layout()

        # --- Visualisierung der monatlichen Kosten als Balkendiagramm mit Labels ---
        monthly_costs = self.monthly_total()
        # plt.figure(figsize=(8,6))
        # bars = plt.bar([str(m) for m in monthly_costs.index], monthly_costs.values, color="cornflowerblue")
        # plt.ylabel("Kosten (EUR)")
        # plt.title("Monatliche Stromkosten inkl. Gebühren")
        for i, v in enumerate(monthly_costs.values):
            plt.text(i, v + max(monthly_costs.values)*0.02 + 0.5, f"{v:.2f} EUR", ha="center", fontweight="bold")
        plt.ylim(0, max(monthly_costs.values)*1.15)
        plt.tight_layout()
