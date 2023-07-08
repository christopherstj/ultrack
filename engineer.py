import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import PolynomialFeatures

# Example data inputs and output
inputs = np.array([[1], [3], [5], [7]])  # Replace with your own data
output = np.array([4, 9, 25, 49])  # Replace with your own data

# Apply polynomial transformation to the inputs
degree = 2  # Change the degree of the polynomial as needed
poly_features = PolynomialFeatures(degree=degree)
poly_inputs = poly_features.fit_transform(inputs)

# Create and train the polynomial regression model
model = LinearRegression()
model.fit(poly_inputs, output)

# Predict the output for new inputs
new_inputs = np.array([[2], [4]])  # Replace with your own data
new_poly_inputs = poly_features.transform(new_inputs)
predictions = model.predict(new_poly_inputs)

print("Predictions:")
for i, prediction in enumerate(predictions):
    print(f"Input: {new_inputs[i]}, Predicted Output: {prediction}")