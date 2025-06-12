from flask import Flask, redirect, url_for, request
from eda import EDA
import pandas as pd
import numpy as np

df = None
eda = EDA()
app = Flask(__name__)

@app.route('/')
def index():
    return redirect(url_for('static', filename = 'index.html'))

@app.post('/upload')
def uploadFile():
    global df, eda
    df = pd.read_csv(request.files['dataset'])
    return eda.describe(df)

@app.post('/univariate')
def univariate():
    global df, eda
    req = request.get_json()
    column = req.get("column")
    type1 = req.get("type1")
    type2 = req.get("type2")

    if df is None or column not in df.columns:
        return {"error": "Invalid column or no data uploaded"}, 400
    #print(eda.univariate_analysis(df, type1, type2, column))
    return eda.univariate_analysis(df, type1, type2, column)


@app.post('/multivariate')
def multivariate():
    global df, eda
    req = request.get_json()
    no_of_col_to_do_analysis = req.get('no_of_col_to_do_analysis')
    type1 = req.get('type1')
    type2 = req.get('type2')
    type3 = req.get('type3')
    chosen_cols = req.get('chosen_cols')

    if df is None:
        return {'error': 'No dataset uploaded'}, 400

    try:
        return eda.multivariate_analysis(df, no_of_col_to_do_analysis, type1, type2, type3, chosen_cols)
    except Exception as e:
        print("Error in /multivariate:", e)
        return {"error": str(e)}, 500

if __name__ == '__main__':
    app.run(debug=True)
