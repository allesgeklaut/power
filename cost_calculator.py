"""
PowerCostCalculator module.

Calculates electricity costs based on consumption and market price data by merging on timestamps,
applying market and provider fees, and summarizing monthly costs.

Data sources:
- Market prices: https://markt.apg.at/transparenz/uebertragung/day-ahead-preise/
- Consumption: https://mein.oekostrom.at/a-p/
"""

import pandas as pd
import matplotlib.pyplot as plt


class PowerCostCalculator:
    """
    Calculate actual power costs from consumption and market price data.

    Merges time series data, applies market and provider fees, and summarizes by month.

    Parameters
    ----------
    consumption_df : pd.DataFrame
        Consumption data with timestamp column.
    price_df : pd.DataFrame
        Market price data with timestamp column.
    price_col : str, optional
        Name of column in price_df containing prices in EUR/MWh. Default: 'Preis MC Auktion [EUR/MWh]'.
    consumption_col : str, optional
        Name of column in consumption_df with consumption in kWh. Default: 'Verbrauch'.
    timestamp_col : str, optional
        Name of column (common to both frames) with timestamps. Default: 'timestamp'.
    fixed_fee : float, optional
        Monthly fixed provider fee in EUR. Default: 2.16.
    variable_fee_per_kwh : float, optional
        Variable fee per kWh from provider in EUR. Default: 0.018.
    """

    def __init__(
        self,
        consumption_df: pd.DataFrame,
        price_df: pd.DataFrame,
        price_col: str = 'Preis MC Auktion [EUR/MWh]',
        consumption_col: str = 'Verbrauch',
        timestamp_col: str = 'timestamp',
        fixed_fee: float = 2.16,
        variable_fee_per_kwh: float = 0.018,
    ):
        """
        Initialize a PowerCostCalculator.

        See class docstring for parameter details.
        """
        self.consumption_df = consumption_df.copy()
        self.price_df = price_df.copy()
        self.price_col = price_col
        self.consumption_col = consumption_col
        self.timestamp_col = timestamp_col
        self.fixed_fee = fixed_fee
        self.variable_fee_per_kwh = variable_fee_per_kwh
        self.merged_df: pd.DataFrame = pd.DataFrame()

    def merge_data(self):
        """
        Merge consumption and price on timestamp.

        Ensures timestamps are datetime and performs inner join on timestamp.

        Returns
        -------
        None
        """
        self.consumption_df[self.timestamp_col] = pd.to_datetime(
            self.consumption_df[self.timestamp_col])
        self.price_df[self.timestamp_col] = pd.to_datetime(
            self.price_df[self.timestamp_col])
        self.merged_df = pd.merge(
            self.consumption_df,
            self.price_df[[self.timestamp_col, self.price_col]],
            on=self.timestamp_col,
            how='inner'
        )

    def calculate_costs(self) -> pd.DataFrame:
        """
        Calculate market, provider variable, and total costs for each row.

        Returns
        -------
        pd.DataFrame
            Merged dataframe with columns: market_cost, variable_fee, total_cost.
        """
        if self.merged_df.empty:
            self.merge_data()
        df = self.merged_df
        df['market_cost'] = df[self.consumption_col] * \
            (df[self.price_col] / 1000)
        df['variable_fee'] = df[self.consumption_col] * self.variable_fee_per_kwh
        df['total_cost'] = df['market_cost'] + df['variable_fee']
        return df

    def monthly_total(self) -> pd.Series:
        """
        Calculate total monthly power cost including provider fees.

        Returns
        -------
        pd.Series
            Total cost per month (including fixed fee), indexed by month.
        """
        df = self.calculate_costs()
        df['month'] = df[self.timestamp_col].dt.to_period('M')
        monthly = df.groupby('month')['total_cost'].sum()
        monthly += self.fixed_fee
        return monthly

    def print_monthly_costs(self):
        """
        Print monthly electricity costs (EUR) including provider fees.
        """
        monthly_cost = self.monthly_total()
        monthly_avg_price = monthly_cost / \
            self.merged_df.groupby('month')[self.consumption_col].sum()
        print('Monatliche Stromkosten inkl. Gebühren:')
        for month, cost in monthly_cost.items():
            print(f'{month}: {cost:.2f} EUR | average cost: {
                  monthly_avg_price[month]:.3f} c/kWh')

    def plot_monthly_costs(self):
        """
        Plot monthly costs as stacked bars: market, provider fixed and variable.

        Returns
        -------
        None
        """
        df = self.calculate_costs()
        df['month'] = df[self.timestamp_col].dt.to_period('M')
        monthly_market = df.groupby('month')['market_cost'].sum()
        monthly_variable = df.groupby('month')['variable_fee'].sum()
        months = monthly_market.index.astype(str)
        monthly_fixed = pd.Series([self.fixed_fee]*len(months), index=months)
        plt.figure(figsize=(10, 6))
        plt.bar(months, monthly_market, label='Marktpreis', color='skyblue')
        plt.bar(months, monthly_variable, bottom=monthly_market,
                label='Variabler Anbieterpreis', color='orange')
        plt.bar(
            months,
            monthly_fixed,
            bottom=monthly_market + monthly_variable,
            label='Fixer Anbieterpreis',
            color='lightgreen'
        )
        plt.ylabel('Kosten (EUR)')
        plt.title('Monatliche Stromkosten: Markt, Anbieter Fix & Variabel')
        plt.legend()
        plt.tight_layout()
        monthly_costs = self.monthly_total()
        for i, v in enumerate(monthly_costs.values):
            plt.text(i, v + max(monthly_costs.values) * 0.02 + 0.5,
                     f"{v:.2f} EUR", ha="center", fontweight="bold")
        plt.ylim(0, max(monthly_costs.values) * 1.15)
        plt.tight_layout()
