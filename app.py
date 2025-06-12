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