# main.py
import os
import joblib
import pandas as pd
from typing import Optional, Dict, Any, List

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from sklearn.ensemble import RandomForestRegressor
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.impute import SimpleImputer
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error

# --------------------------
# Config
# --------------------------
CSV_PATH = "Data_1.csv"            # put your CSV in same directory or change this path
MODEL_PATH = "investment_model.pkl"
PIPELINE_PATH = "preprocessor_pipeline.pkl"
TARGET_COL = "5yr_Return"         # change if your target column has a different name
RANDOM_STATE = 42

# --------------------------
# FastAPI app + CORS
# --------------------------
app = FastAPI(title="Superannuation Chatbot Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080"],  # Lovable dev server, change for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --------------------------
# Pydantic request/response models
# --------------------------
class TrainResponse(BaseModel):
    message: str
    train_mae: float
    val_mae: float

class PredictRequest(BaseModel):
    features: Dict[str, Any]  # feature name -> value

class PredictResponse(BaseModel):
    predicted_5yr_return: float

class ChatRequest(BaseModel):
    message: str
    risk: Optional[str] = None
    goal: Optional[str] = None
    features: Optional[Dict[str, Any]] = None

class RecommendationItem(BaseModel):
    Investment_Name: str
    Risk_Level: Optional[str] = None
    FiveYearReturn: Optional[float] = None

class RecommendationsResponse(BaseModel):
    risk: str
    top_options: List[RecommendationItem]

# --------------------------
# Utilities: load CSV, detect cols
# --------------------------
def load_csv(path: str) -> pd.DataFrame:
    if not os.path.exists(path):
        raise FileNotFoundError(f"CSV file '{path}' not found. Put it in the project directory.")
    df = pd.read_csv(path)
    df.columns = df.columns.str.strip()
    return df

def create_preprocessing_pipeline(df: pd.DataFrame, target_col: str):
    # choose features = all except target and textual large fields
    feature_cols = [c for c in df.columns if c != target_col and c.lower() not in ("investment_name", "description", "notes")]
    # infer numeric vs categorical
    numeric_cols = df[feature_cols].select_dtypes(include=["int64", "float64"]).columns.tolist()
    categorical_cols = [c for c in feature_cols if c not in numeric_cols]
    # Build transformers
    numeric_transformer = Pipeline(steps=[
        ("imputer", SimpleImputer(strategy="median")),
        ("scaler", StandardScaler())
    ])
    categorical_transformer = Pipeline(steps=[
        ("imputer", SimpleImputer(strategy="constant", fill_value="missing")),
        ("onehot", OneHotEncoder(handle_unknown="ignore", sparse=False))
    ])
    preprocessor = ColumnTransformer(transformers=[
        ("num", numeric_transformer, numeric_cols),
        ("cat", categorical_transformer, categorical_cols)
    ], remainder="drop")
    return preprocessor, feature_cols, numeric_cols, categorical_cols

# --------------------------
# Model load at startup (if exists)
# --------------------------
model = None
preprocessor = None
feature_columns = None

if os.path.exists(MODEL_PATH) and os.path.exists(PIPELINE_PATH):
    try:
        model = joblib.load(MODEL_PATH)
        preprocessor = joblib.load(PIPELINE_PATH)
        # feature_columns saved inside pipeline metadata if available, else leave None
        if hasattr(preprocessor, "feature_names_in_"):
            feature_columns = list(preprocessor.feature_names_in_)
    except Exception as e:
        print("Warning: failed to load existing model/pipeline:", e)
        model = None
        preprocessor = None
        feature_columns = None

# --------------------------
# Endpoints
# --------------------------
@app.get("/")
def read_root():
    return {"status": "ok", "note": "Use /train, /predict, /recommendations, /chat endpoints"}

@app.post("/train", response_model=TrainResponse)
def train_model_endpoint(test_size: float = 0.2):
    """
    Train the model from CSV and save the model + preprocessing pipeline.
    Returns train and validation MAE.
    """
    global model, preprocessor, feature_columns

    # Load data
    try:
        df = load_csv(CSV_PATH)
    except FileNotFoundError as e:
        raise HTTPException(status_code=400, detail=str(e))

    if TARGET_COL not in df.columns:
        raise HTTPException(status_code=400, detail=f"Target column '{TARGET_COL}' not found in CSV.")

    # Drop rows with missing target
    df = df.dropna(subset=[TARGET_COL]).reset_index(drop=True)

    # Create pipeline
    preprocessor, feature_columns, num_cols, cat_cols = create_preprocessing_pipeline(df, TARGET_COL)

    X = df[feature_columns].copy()
    y = df[TARGET_COL].astype(float)

    # Split
    X_train, X_val, y_train, y_val = train_test_split(X, y, test_size=test_size, random_state=RANDOM_STATE)

    # Fit preprocessor on training data
    X_train_trans = preprocessor.fit_transform(X_train)
    X_val_trans = preprocessor.transform(X_val)

    # Train model
    mdl = RandomForestRegressor(n_estimators=200, random_state=RANDOM_STATE)
    mdl.fit(X_train_trans, y_train)

    # Evaluate
    train_pred = mdl.predict(X_train_trans)
    val_pred = mdl.predict(X_val_trans)
    train_mae = float(mean_absolute_error(y_train, train_pred))
    val_mae = float(mean_absolute_error(y_val, val_pred))

    # Save model and preprocessor + store feature_columns in a wrapper dict
    joblib.dump(mdl, MODEL_PATH)
    # To be able to reconstruct later we save a dict containing pipeline and feature list
    pipeline_wrapper = {"preprocessor": preprocessor, "feature_columns": feature_columns}
    joblib.dump(pipeline_wrapper, PIPELINE_PATH)

    # set global variables
    model = mdl
    preprocessor = preprocessor
    # feature_columns already set

    return {"message": "Model trained and saved.", "train_mae": train_mae, "val_mae": val_mae}

@app.post("/predict", response_model=PredictResponse)
def predict(request: PredictRequest):
    """
    Predict 5yr_Return for a single sample. Expects features matching training feature names.
    Example body:
    { "features": {"Risk_Level": "Medium", "Expense_Ratio": 0.2, "AUM_millions": 150} }
    """
    global model, preprocessor, feature_columns
    if model is None or not os.path.exists(MODEL_PATH):
        raise HTTPException(status_code=400, detail="Model not available. Call /train first.")

    # load wrapper pipeline to get preprocessor & feature list if globals missing
    if preprocessor is None:
        wrapper = joblib.load(PIPELINE_PATH)
        preprocessor = wrapper["preprocessor"]
        feature_columns = wrapper.get("feature_columns", None)

    # build DataFrame with a single row
    input_features = request.features or {}
    if feature_columns:
        # ensure all expected columns are present (fill missing with NaN)
        X_new = pd.DataFrame([{col: input_features.get(col, pd.NA) for col in feature_columns}])
    else:
        X_new = pd.DataFrame([input_features])

    # transform and predict
    try:
        X_new_trans = preprocessor.transform(X_new)
        pred = model.predict(X_new_trans)[0]
        return {"predicted_5yr_return": float(pred)}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Prediction failed: {e}")

@app.post("/recommendations", response_model=RecommendationsResponse)
def recommendations(risk: str):
    """
    Return top 3 investments from CSV for the given risk profile.
    """
    # Load CSV
    try:
        df = load_csv(CSV_PATH)
    except FileNotFoundError as e:
        raise HTTPException(status_code=400, detail=str(e))

    risk_norm = risk.strip().lower()

    if "Risk_Level" not in df.columns:
        raise HTTPException(status_code=400, detail="CSV is missing 'Risk_Level' column required for filtering.")

    candidates = df[df["Risk_Level"].str.strip().str.lower() == risk_norm]
    if candidates.empty:
        # relaxed matching: check if risk string appears in column values
        candidates = df[df["Risk_Level"].str.strip().str.lower().str.contains(risk_norm, na=False)]

    if candidates.empty:
        raise HTTPException(status_code=404, detail=f"No investments found for risk '{risk}'")

    # sort by return column if exists
    if TARGET_COL in candidates.columns:
        top = candidates.sort_values(by=TARGET_COL, ascending=False).head(3)
    else:
        top = candidates.head(3)

    response_items = []
    for _, r in top.iterrows():
        response_items.append({
            "Investment_Name": r.get("Investment_Name", "Unknown"),
            "Risk_Level": r.get("Risk_Level"),
            "FiveYearReturn": r.get(TARGET_COL) if TARGET_COL in r.index else None
        })
    return {"risk": risk, "top_options": response_items}

@app.post("/chat")
def chat_endpoint(req: ChatRequest):
    """
    Combination chat endpoint:
    - If risk provided, returns CSV-based top picks
    - If features provided, returns model prediction
    - Returns a friendly combined message
    """
    parts = []
    # 1) CSV recs if risk given
    if req.risk:
        try:
            recs_resp = recommendations(req.risk)
            recs = recs_resp["top_options"]
            parts.append(f"Based on a {req.risk} risk profile, top picks are:")
            for item in recs:
                parts.append(f"- {item['Investment_Name']} ({item.get('FiveYearReturn', 'N/A')}% 5yr)")
        except HTTPException as e:
            parts.append(f"Couldn't find CSV recommendations: {e.detail}")

    # 2) model prediction if features are provided
    if req.features:
        try:
            pred = predict(PredictRequest(features=req.features))
            parts.append(f"Model predicts a {pred['predicted_5yr_return']:.2f}% 5-year return for the provided inputs.")
        except HTTPException as e:
            parts.append(f"Prediction unavailable: {e.detail}")

    # 3) If nothing provided, reply with a help message
    if not parts:
        parts.append("Hi — I can provide recommendations and return predictions. "
                     "Send a `risk` (Low/Medium/High) for CSV-based recommendations, "
                     "or `features` dict to get a model prediction. Example payload:\n"
                     '{"message":"...","risk":"Medium","features":{"Risk_Level":"Medium","Expense_Ratio":0.25}}')

    return {"response": "\n".join(parts)}
