"""
Power Consumption Analysis GUI Application

This GUI application provides interactive visualization and analysis of power 
consumption data with the following features:
- Date range selection for filtering data
- Consumption profile comparison (selected period vs overall)
- Monthly cost breakdown with fees separation
- Average electricity price calculation per month

Dependencies:
- tkinter (built-in)
- tkcalendar (pip install tkcalendar)
- matplotlib
- pandas
- numpy

Usage:
    python power_consumption_gui.py
"""

import tkinter as tk
from tkinter import ttk, messagebox
from tkcalendar import DateEntry
import matplotlib.pyplot as plt
from matplotlib.backends.backend_tkagg import FigureCanvasTkAgg
from matplotlib.figure import Figure
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from cost_calculator import PowerCostCalculator


class PowerConsumptionGUI:
    """Main GUI application for power consumption analysis."""

    def __init__(self, root, consumption_file, price_file):
        """
        Initialize the GUI application.

        Parameters
        ----------
        root : tk.Tk
            Main tkinter window
        consumption_file : str
            Path to consumption data Excel file
        price_file : str
            Path to price data CSV file
        """
        self.root = root
        self.root.title("Power Consumption Analysis Tool")
        self.root.geometry("1400x900")

        # File paths
        self.consumption_file = consumption_file
        self.price_file = price_file

        # Data storage
        self.df_consumption_full = None
        self.df_price_full = None
        self.cost_calculator = None

        # Load data
        self.load_data()

        # Create GUI components
        self.create_widgets()

        # Initial plot
        self.update_analysis()

    def load_data(self):
        """Load and preprocess consumption and price data."""
        try:
            # Load consumption data
            self.df_consumption_full = pd.read_excel(self.consumption_file)
            self.df_consumption_full['timestamp'] = pd.to_datetime(
                self.df_consumption_full['Timestamp'], unit='s', errors='coerce'
            )
            self.df_consumption_full['Verbrauch'] = (
                self.df_consumption_full['Verbrauch']
                .astype(str).str.replace(',', '.').astype(float)
            )
            self.df_consumption_full = self.df_consumption_full.dropna(
                subset=['timestamp', 'Verbrauch']
            )

            # Load price data
            self.df_price_full = pd.read_csv(
                self.price_file, sep=';', decimal=','
            )
            # Handle BOM in column name
            time_col = [col for col in self.df_price_full.columns 
                       if 'Zeit von' in col][0]
            self.df_price_full['timestamp'] = pd.to_datetime(
                self.df_price_full[time_col], 
                format='%d.%m.%Y %H:%M:%S', 
                errors='coerce'
            )

            # Get date range
            self.min_date = self.df_consumption_full['timestamp'].min().date()
            self.max_date = self.df_consumption_full['timestamp'].max().date()

        except Exception as e:
            messagebox.showerror("Error Loading Data", 
                               f"Failed to load data files:\n{str(e)}")
            self.root.destroy()

    def _on_mousewheel(self, event):
        """Handle mouse wheel scrolling."""
        # Windows and MacOS have different event.delta values
        if event.delta:
            # Windows or MacOS
            self.canvas.yview_scroll(int(-1*(event.delta/120)), "units")
        else:
            # Linux
            if event.num == 4:
                self.canvas.yview_scroll(-1, "units")
            elif event.num == 5:
                self.canvas.yview_scroll(1, "units")

    def _bind_mousewheel(self, event):
        """Bind mouse wheel to canvas scrolling."""
        # Windows and MacOS
        self.canvas.bind_all("<MouseWheel>", self._on_mousewheel)
        # Linux
        self.canvas.bind_all("<Button-4>", self._on_mousewheel)
        self.canvas.bind_all("<Button-5>", self._on_mousewheel)

    def _unbind_mousewheel(self, event):
        """Unbind mouse wheel from canvas scrolling."""
        self.canvas.unbind_all("<MouseWheel>")
        self.canvas.unbind_all("<Button-4>")
        self.canvas.unbind_all("<Button-5>")

    def create_widgets(self):
        """Create all GUI widgets."""
        # Title frame
        title_frame = tk.Frame(self.root, bg='#2c3e50', height=50)
        title_frame.pack(fill=tk.X, side=tk.TOP)

        title_label = tk.Label(
            title_frame, 
            text="⚡ Power Consumption Analysis Tool",
            font=('Arial', 18, 'bold'),
            bg='#2c3e50',
            fg='white',
            pady=10
        )
        title_label.pack()

        # Control frame for date selection
        control_frame = tk.Frame(self.root, bg='#ecf0f1', padx=20, pady=15)
        control_frame.pack(fill=tk.X, side=tk.TOP)

        # Date range label
        tk.Label(
            control_frame, 
            text="Date Range Selection:",
            font=('Arial', 12, 'bold'),
            bg='#ecf0f1'
        ).grid(row=0, column=0, columnspan=4, sticky='w', pady=(0, 10))

        # Start date
        tk.Label(
            control_frame, 
            text="Start Date:",
            font=('Arial', 10),
            bg='#ecf0f1'
        ).grid(row=1, column=0, padx=(0, 10))

        self.start_date_entry = DateEntry(
            control_frame,
            width=15,
            background='darkblue',
            foreground='white',
            borderwidth=2,
            date_pattern='yyyy-mm-dd',
            mindate=self.min_date,
            maxdate=self.max_date
        )
        self.start_date_entry.set_date(self.min_date)
        self.start_date_entry.grid(row=1, column=1, padx=(0, 30))

        # End date
        tk.Label(
            control_frame, 
            text="End Date:",
            font=('Arial', 10),
            bg='#ecf0f1'
        ).grid(row=1, column=2, padx=(0, 10))

        self.end_date_entry = DateEntry(
            control_frame,
            width=15,
            background='darkblue',
            foreground='white',
            borderwidth=2,
            date_pattern='yyyy-mm-dd',
            mindate=self.min_date,
            maxdate=self.max_date
        )
        self.end_date_entry.set_date(self.max_date)
        self.end_date_entry.grid(row=1, column=3, padx=(0, 30))

        # Update button
        self.update_button = tk.Button(
            control_frame,
            text="🔄 Update Analysis",
            font=('Arial', 11, 'bold'),
            bg='#3498db',
            fg='white',
            activebackground='#2980b9',
            activeforeground='white',
            command=self.update_analysis,
            padx=20,
            pady=8,
            cursor='hand2'
        )
        self.update_button.grid(row=1, column=4, padx=20)

        # Status label
        self.status_label = tk.Label(
            control_frame,
            text="Ready",
            font=('Arial', 9),
            bg='#ecf0f1',
            fg='#7f8c8d'
        )
        self.status_label.grid(row=1, column=5, padx=10)

        # Main content frame with scrollbar
        main_frame = tk.Frame(self.root)
        main_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)

        # Canvas for scrolling
        self.canvas = tk.Canvas(main_frame)
        scrollbar = ttk.Scrollbar(main_frame, orient="vertical", command=self.canvas.yview)
        self.scrollable_frame = tk.Frame(self.canvas)

        self.scrollable_frame.bind(
            "<Configure>",
            lambda e: self.canvas.configure(scrollregion=self.canvas.bbox("all"))
        )

        self.canvas.create_window((0, 0), window=self.scrollable_frame, anchor="nw")
        self.canvas.configure(yscrollcommand=scrollbar.set)

        # Bind mouse wheel events
        self.canvas.bind("<Enter>", self._bind_mousewheel)
        self.canvas.bind("<Leave>", self._unbind_mousewheel)

        self.canvas.pack(side="left", fill="both", expand=True)
        scrollbar.pack(side="right", fill="y")

        # Consumption profile plot
        profile_frame = tk.LabelFrame(
            self.scrollable_frame,
            text="Consumption Profile: Selected Period vs Overall",
            font=('Arial', 12, 'bold'),
            padx=10,
            pady=10
        )
        profile_frame.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)

        self.fig_profile = Figure(figsize=(12, 5), dpi=100)
        self.ax_profile = self.fig_profile.add_subplot(111)
        self.canvas_profile = FigureCanvasTkAgg(self.fig_profile, profile_frame)
        self.canvas_profile.get_tk_widget().pack(fill=tk.BOTH, expand=True)

        # Monthly costs plot
        costs_frame = tk.LabelFrame(
            self.scrollable_frame,
            text="Monthly Cost Breakdown",
            font=('Arial', 12, 'bold'),
            padx=10,
            pady=10
        )
        costs_frame.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)

        self.fig_costs = Figure(figsize=(12, 5), dpi=100)
        self.ax_costs = self.fig_costs.add_subplot(111)
        self.canvas_costs = FigureCanvasTkAgg(self.fig_costs, costs_frame)
        self.canvas_costs.get_tk_widget().pack(fill=tk.BOTH, expand=True)

        # Statistics frame
        stats_frame = tk.Frame(
            self.scrollable_frame,
            bg='#ecf0f1',
            relief=tk.RIDGE,
            borderwidth=2
        )
        stats_frame.pack(fill=tk.X, padx=5, pady=10)

        tk.Label(
            stats_frame,
            text="📊 Statistics Summary",
            font=('Arial', 12, 'bold'),
            bg='#ecf0f1'
        ).pack(pady=10)

        # Statistics labels - Updated to show monthly averages
        self.stats_labels = {}
        stats_info = [
            ('total_consumption', 'Total Consumption:'),
            ('total_cost', 'Total Cost:'),
            ('avg_monthly_consumption', 'Average Monthly Consumption:'),
            ('avg_monthly_cost', 'Average Monthly Cost:'),
            ('avg_price', 'Average Price (Overall):')
        ]

        for key, label_text in stats_info:
            frame = tk.Frame(stats_frame, bg='#ecf0f1')
            frame.pack(fill=tk.X, padx=20, pady=5)

            tk.Label(
                frame,
                text=label_text,
                font=('Arial', 10, 'bold'),
                bg='#ecf0f1',
                width=30,
                anchor='w'
            ).pack(side=tk.LEFT)

            label = tk.Label(
                frame,
                text="—",
                font=('Arial', 10),
                bg='#ecf0f1',
                fg='#2c3e50',
                anchor='w'
            )
            label.pack(side=tk.LEFT)
            self.stats_labels[key] = label

    def update_analysis(self):
        """Update all plots and statistics based on selected date range."""
        try:
            self.status_label.config(text="Processing...", fg='#e67e22')
            self.root.update()

            # Get selected dates
            start_date = self.start_date_entry.get_date()
            end_date = self.end_date_entry.get_date()

            # Validate date range
            if start_date > end_date:
                messagebox.showwarning(
                    "Invalid Date Range",
                    "Start date must be before or equal to end date."
                )
                self.status_label.config(text="Error: Invalid date range", fg='#e74c3c')
                return

            # Filter data
            df_selected = self.df_consumption_full[
                (self.df_consumption_full['timestamp'].dt.date >= start_date) &
                (self.df_consumption_full['timestamp'].dt.date <= end_date)
            ].copy()

            if df_selected.empty:
                messagebox.showwarning(
                    "No Data",
                    "No data available for the selected date range."
                )
                self.status_label.config(text="Error: No data", fg='#e74c3c')
                return

            # Update consumption profile plot
            self.plot_consumption_profile(df_selected)

            # Update monthly costs plot
            self.plot_monthly_costs(df_selected, start_date, end_date)

            # Update statistics
            self.update_statistics(df_selected)

            self.status_label.config(text="✓ Analysis updated", fg='#27ae60')

        except Exception as e:
            messagebox.showerror("Error", f"An error occurred:\n{str(e)}")
            self.status_label.config(text="Error occurred", fg='#e74c3c')

    def plot_consumption_profile(self, df_selected):
        """Plot consumption profile comparison."""
        # Clear previous plot
        self.ax_profile.clear()

        # Create time-of-day profile for selected period
        df_selected['hhmm'] = df_selected['timestamp'].dt.strftime('%H:%M')
        profile_selected = df_selected.groupby('hhmm')['Verbrauch'].sum().sort_index()

        # Create time-of-day profile for full dataset
        df_full = self.df_consumption_full.copy()
        df_full['hhmm'] = df_full['timestamp'].dt.strftime('%H:%M')
        profile_full = df_full.groupby('hhmm')['Verbrauch'].sum().sort_index()

        # Normalize full profile to selected period scale
        scaling_factor = (
            profile_selected.sum() / profile_full.sum() 
            if profile_full.sum() > 0 else 1
        )
        profile_full_normalized = profile_full * scaling_factor

        # Plot
        x_pos = np.arange(len(profile_selected))
        self.ax_profile.bar(
            x_pos, 
            profile_selected.values,
            color='skyblue',
            edgecolor='black',
            alpha=0.7,
            label='Selected Period'
        )
        self.ax_profile.plot(
            x_pos,
            profile_full_normalized.values,
            color='red',
            linestyle='--',
            linewidth=2,
            marker='o',
            markersize=3,
            alpha=0.7,
            label='Overall (normalized)'
        )

        self.ax_profile.set_xlabel('Time of Day (HH:MM)', fontsize=11, fontweight='bold')
        self.ax_profile.set_ylabel('Consumption (kWh)', fontsize=11, fontweight='bold')
        self.ax_profile.set_title(
            'Daily Consumption Profile Comparison',
            fontsize=13,
            fontweight='bold',
            pad=15
        )

        # Set x-ticks (show every 8th label to avoid crowding)
        tick_positions = x_pos[::8]
        tick_labels = profile_selected.index[::8]
        self.ax_profile.set_xticks(tick_positions)
        self.ax_profile.set_xticklabels(tick_labels, rotation=45, ha='right')

        self.ax_profile.legend(loc='upper left', fontsize=10)
        self.ax_profile.grid(axis='y', linestyle='--', alpha=0.3)

        self.fig_profile.tight_layout()
        self.canvas_profile.draw()

    def plot_monthly_costs(self, df_selected, start_date, end_date):
        """Plot monthly cost breakdown."""
        # Clear previous plot
        self.ax_costs.clear()

        # Filter price data for same period
        df_price_filtered = self.df_price_full[
            (self.df_price_full['timestamp'].dt.date >= start_date) &
            (self.df_price_full['timestamp'].dt.date <= end_date)
        ].copy()

        # Initialize cost calculator
        self.cost_calculator = PowerCostCalculator(
            consumption_df=df_selected,
            price_df=df_price_filtered,
            price_col='Preis MC Auktion [EUR/MWh]',
            consumption_col='Verbrauch',
            timestamp_col='timestamp',
            fixed_fee=2.16,
            variable_fee_per_kwh=0.018
        )

        # Calculate costs
        df_costs = self.cost_calculator.calculate_costs()
        df_costs['month'] = df_costs['timestamp'].dt.to_period('M')

        # Group by month
        monthly_market = df_costs.groupby('month')['market_cost'].sum()
        monthly_variable = df_costs.groupby('month')['variable_fee'].sum()
        monthly_consumption = df_costs.groupby('month')['Verbrauch'].sum()

        months = monthly_market.index.astype(str)
        fixed_fee = self.cost_calculator.fixed_fee

        # Calculate average price per month (cents/kWh)
        monthly_total = monthly_market + monthly_variable + fixed_fee
        avg_price_per_month = (monthly_total / monthly_consumption) * 100  # to cents/kWh

        # Plot stacked bar chart
        x_pos = np.arange(len(months))
        width = 0.6

        p1 = self.ax_costs.bar(
            x_pos, monthly_market, width,
            label='Market Cost', color='#3498db'
        )
        p2 = self.ax_costs.bar(
            x_pos, monthly_variable, width,
            bottom=monthly_market,
            label='Variable Fee', color='#e67e22'
        )
        p3 = self.ax_costs.bar(
            x_pos, [fixed_fee] * len(months), width,
            bottom=monthly_market + monthly_variable,
            label='Fixed Fee', color='#2ecc71'
        )

        self.ax_costs.set_xlabel('Month', fontsize=11, fontweight='bold')
        self.ax_costs.set_ylabel('Cost (EUR)', fontsize=11, fontweight='bold')
        self.ax_costs.set_title(
            'Monthly Cost Breakdown by Component',
            fontsize=13,
            fontweight='bold',
            pad=15
        )
        self.ax_costs.set_xticks(x_pos)
        self.ax_costs.set_xticklabels(months, rotation=45, ha='right')
        self.ax_costs.legend(loc='upper left', fontsize=10)
        self.ax_costs.grid(axis='y', linestyle='--', alpha=0.3)

        # Add total cost labels on top of bars
        for i, (market, variable) in enumerate(zip(monthly_market.values, 
                                                    monthly_variable.values)):
            total = market + variable + fixed_fee
            avg_price = avg_price_per_month.iloc[i]
            self.ax_costs.text(
                i, total + max(monthly_total) * 0.02,
                f'{total:.2f} EUR\n({avg_price:.2f} c/kWh)',
                ha='center', va='bottom',
                fontsize=9, fontweight='bold'
            )

        self.ax_costs.set_ylim(0, max(monthly_total.values) * 1.2)

        self.fig_costs.tight_layout()
        self.canvas_costs.draw()

    def update_statistics(self, df_selected):
        """Update statistics labels with monthly averages."""
        # Calculate statistics
        total_consumption = df_selected['Verbrauch'].sum()

        # Calculate date range
        start_date = df_selected['timestamp'].min()
        end_date = df_selected['timestamp'].max()

        # Calculate number of months
        num_months = ((end_date.year - start_date.year) * 12 + 
                     end_date.month - start_date.month + 1)

        # Calculate total cost if cost calculator exists
        if self.cost_calculator:
            monthly_total = self.cost_calculator.monthly_total()
            total_cost = monthly_total.sum()
            avg_price = (total_cost / total_consumption) * 100  # cents/kWh

            # Monthly averages
            avg_monthly_consumption = total_consumption / num_months if num_months > 0 else 0
            avg_monthly_cost = total_cost / num_months if num_months > 0 else 0
        else:
            total_cost = 0
            avg_price = 0
            avg_monthly_consumption = 0
            avg_monthly_cost = 0

        # Update labels
        self.stats_labels['total_consumption'].config(
            text=f"{total_consumption:.2f} kWh"
        )
        self.stats_labels['total_cost'].config(
            text=f"{total_cost:.2f} EUR"
        )
        self.stats_labels['avg_monthly_consumption'].config(
            text=f"{avg_monthly_consumption:.2f} kWh/month"
        )
        self.stats_labels['avg_monthly_cost'].config(
            text=f"{avg_monthly_cost:.2f} EUR/month"
        )
        self.stats_labels['avg_price'].config(
            text=f"{avg_price:.3f} cents/kWh"
        )


def main():
    """Main entry point for the application."""
    root = tk.Tk()

    # File paths - update these to match your file names
    consumption_file = 'verbrauch_anlage_919667_short.xlsx'
    price_file = 'EXAAD1P_2024-12-31T23_00_00Z_2025-12-31T23_00_00Z_15M_de_2025-10-22T20_37_02Z_short.csv'

    app = PowerConsumptionGUI(root, consumption_file, price_file)
    root.mainloop()


if __name__ == '__main__':
    main()
