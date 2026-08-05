from app.ai.model_loader import model_loader

print("\nHealth Model :", type(model_loader.health_model))
print("Clinical Model :", type(model_loader.clinical_model))

print()

print("Health Features :", len(model_loader.health_features))
print("Clinical Features :", len(model_loader.clinical_features))