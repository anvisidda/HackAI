import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error
from joblib import dump
import matplotlib.pyplot as plt

# Load the dataset
df = pd.read_csv(r'C:\Users\Nihita\Downloads\Total Sales 2023-01-01 - 2023-12-31.csv', dtype={'Date': str})

# Fix the Date column (e.g., 'Jan 01' → datetime)
df['Date'] = pd.to_datetime(df['Date'].str.strip() + ' 2023', format='%b %d %Y')

# Sort by date
df = df.sort_values(by='Date')

# Clean monetary columns
money_columns = ['Gross', 'Subtotal', 'Tip', 'Net Sales', 'Tax', 'Discounts']
for col in money_columns:
    df[col] = df[col].replace('[\$,]', '', regex=True).astype(float)

# Feature engineering: extract useful date parts
df['Day'] = df['Date'].dt.day
df['Month'] = df['Date'].dt.month
df['DayOfWeek'] = df['Date'].dt.dayofweek

# Features and target
X = df[['Day', 'Month', 'DayOfWeek', 'Subtotal', 'Tax', 'Tip', 'Discounts']]  # add/remove as needed
y = df['Gross']  # or 'Net Sales'

# Train/test split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train the model
model = RandomForestRegressor(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# Evaluate
y_pred = model.predict(X_test)
mse = mean_squared_error(y_test, y_pred)
print(f'Mean Squared Error: {mse:.2f}')

# Save the model
dump(model, 'pizza_sales_model.joblib')
print("✅ Model saved as 'pizza_sales_model.joblib'")

# Optional: Plot predictions
plt.figure(figsize=(10, 5))
plt.plot(y_test.values, label='Actual')
plt.plot(y_pred, label='Predicted')
plt.title("Actual vs Predicted Pizza Sales")
plt.legend()
plt.show()
