import pandas as pd
import numpy as np

# Read the Excel file
file_path = '~/Desktop/AVGUST RAZDUZENJE_novi template.xlsx'
df = pd.read_excel(file_path)

print("=== EXCEL FILE ANALYSIS ===")
print(f"Total rows: {len(df)}")
print(f"Total columns: {len(df.columns)}")

print("\n=== COLUMN ANALYSIS ===")
for i, col in enumerate(df.columns):
    print(f"{i}: {col}")

print("\n=== FIRST 10 ROWS (more detailed) ===")
print(df.iloc[:10, :5].to_string())

print("\n=== LAST 10 ROWS ===")
print(df.iloc[-10:, :5].to_string())

print("\n=== DATA TYPES ===")
print(df.dtypes)

print("\n=== UNIQUE VALUES IN FIRST COLUMN ===")
first_col_values = df.iloc[:, 0].dropna().unique()
print(first_col_values[:20])  # Show first 20 unique values

print("\n=== UNIQUE VALUES IN SECOND COLUMN ===")
second_col_values = df.iloc[:, 1].dropna().unique()
print(second_col_values[:20])  # Show first 20 unique values

# Check if there are multiple sheets
try:
    xl_file = pd.ExcelFile(file_path)
    print(f"\n=== SHEET NAMES ===")
    print(xl_file.sheet_names)
except:
    print("\n=== SINGLE SHEET FILE ===")
