import pandas as pd
import numpy as np
from scipy.stats import zscore
import category_encoders as ce
import plotly.express as px
from sklearn.preprocessing import StandardScaler, MinMaxScaler, RobustScaler, MaxAbsScaler, Normalizer, LabelEncoder, OrdinalEncoder

class EDA:

    def __init__(self):
        pass
    
    def describe(self, data: pd.DataFrame):
        return{
            'cols': data.columns.to_list(),
            'shape': data.shape,
            'describe': data.describe(include = 'all').replace({np.nan: None}).to_dict(),
            'duplicates': int(data.duplicated().sum()),
            'null values': data.isna().sum().replace({np.nan: None}).to_dict()
        }
    def drop_duplicates(self, data):
        '''
        '''
        data.drop_duplicates()
        return data
    
    def na_values(self, data, method = 'drop', fill_with = None):
        if method == 'drop':
            data.dropna()
        elif method == 'fillwith':
            for column in data.columns:
                if data[column].isnull().any():
                    if fill_with == 'mean':
                        data[column] = data[column].fillna(data[column].mean())
                    elif fill_with == 'median':
                        data[column] = data[column].fillna(data[column].median())                        
                    elif fill_with == 'mode':
                        data[column] = data[column].fillna(data[column].mode().iloc[0])
                    elif fill_with == 'ffill':
                        data[column] = data[column].fillna(method='ffill')
                    elif fill_with == 'bfill':
                        data[column] = data[column].fillna(method='bfill')
                    elif isinstance(fill_with, dict):
                        data[column] = data[column].fillna(fill_with.get(column, 0))
                    else:
                        data[column] = data[column].fillna(fill_with)
        return data
    
    def remove_outliers(self, data, method = 'IQR', threshold = 3, upper = None, lower = None):
        '''
        '''
        outliers = {}
        numeric_cols = data.select_dtypes(include=np.number).columns
        if method == 'IQR':
            for col in numeric_cols:
                Q1 = data[col].quantile(0.25)
                Q3 = data[col].quantile(0.75)
                IQR = Q3 - Q1
                lower = Q1 - 1.5 * IQR
                upper = Q3 + 1.5 * IQR
                outliers[col] = int(((data[col] < lower) | (data[col] > upper)).sum())
                data = data[(data[col] >= lower) & (data[col] <= upper)]
        
        elif method == 'zscore':
            z_scores = np.abs(zscore(data[numeric_cols]))
            z_scores_df = pd.DataFrame(z_scores, columns=numeric_cols)
            for col in numeric_cols:
                outliers[col] = int((z_scores_df[col] > threshold).sum())
            mask = (z_scores_df < threshold).all(axis=1)
            data = data[mask]


        elif method == 'threshold':
            for col in numeric_cols:
                if lower == None:
                    data = data[(data[col] >=-upper) & (data[col] <= upper)]
                else: data = data[(data[col] >=lower) & (data[col] <= upper)]

        return data
    
    def normalize_data(self, data, method='minmax'):
        '''
        '''
        numeric_cols = data.select_dtypes(include=np.number).columns
        normed_df = data.copy()

        if method == 'minmax':
            normed_df[numeric_cols] = normed_df[numeric_cols].apply(lambda x: (x - x.min()) / (x.max() - x.min()))
        elif method == 'zscore':
            normed_df[numeric_cols] = normed_df[numeric_cols].apply(lambda x: (x - x.mean()) / x.std())
        elif method == 'log':
            normed_df[numeric_cols] = normed_df[numeric_cols].apply(lambda x: np.log1p(x))
        elif method == 'decimal':
            normed_df[numeric_cols] = normed_df[numeric_cols].apply(lambda x: x / (10 ** np.ceil(np.log10(x.abs().max() + 1e-10))))
        elif method == 'robust':
            scaler = RobustScaler()
            normed_df[numeric_cols] = scaler.fit_transform(normed_df[numeric_cols])
        else:
            raise ValueError(f"Unsupported normalization method: {method}")

        return normed_df
    
    def scale_data(self, data, method = 'standard'):
        '''
        '''
        numeric_cols = data.select_dtypes(include=np.number).columns
        scaler = None
        if method == 'standard':
            scaler = StandardScaler()
        elif method == 'minmax':
            scaler = MinMaxScaler()
        elif method == 'robust':
            scaler = RobustScaler()
        elif method == 'maxabs':
            scaler = MaxAbsScaler()
        elif method == 'normalize':
            scaler = Normalizer()
        else:
            raise ValueError(f"Unsupported scaling method: {method}")

        scaled_array = scaler.fit_transform(data[numeric_cols])
        scaled_df = pd.DataFrame(scaled_array, columns=numeric_cols)
        return scaled_df

    def encode_data(self, data, method='onehot', cardinality_threshold=10, hashing_components=10):
        encoded_data = data.copy()
        cat_cols = encoded_data.select_dtypes(include='object').columns

    # Report high-cardinality columns
        high_card_cols = [col for col in cat_cols if encoded_data[col].nunique() > cardinality_threshold]
        safe_cat_cols = [col for col in cat_cols if encoded_data[col].nunique() <= cardinality_threshold]

        if high_card_cols:
            print(f" Warning: High-cardinality columns detected and excluded from one-hot encoding: {high_card_cols}")

        if method == 'onehot':
            return pd.get_dummies(encoded_data, columns=safe_cat_cols, drop_first=True)

        elif method == 'label':
            le = LabelEncoder()
            for col in cat_cols:
                encoded_data[col] = le.fit_transform(encoded_data[col])
            return encoded_data

        elif method == 'ordinal':
            raise NotImplementedError("Ordinal encoding with custom ordering not yet implemented.")

        elif method == 'frequency':
            for col in cat_cols:
                freq = encoded_data[col].value_counts(normalize=True)
                encoded_data[col] = encoded_data[col].map(freq)
            return encoded_data

        elif method == 'hashing':
            encoder = ce.HashingEncoder(cols=cat_cols, n_components=hashing_components)
            encoded_data = encoder.fit_transform(encoded_data)
            return encoded_data

        else:
            raise ValueError(f"Unsupported encoding method: {method}")
        
    def visualize_univariate(self, data, graph = 'hist', x_var= None):
        try:
            if graph == 'hist':
                if not x_var:
                    raise ValueError("x_var must be specified for histogram")
                fig = px.histogram(data, x=x_var)

            elif graph == 'box':
                if not x_var:
                    raise ValueError("x_var must be specified for box plot")
                fig = px.box(data, y=x_var)

                
            elif graph == 'violin':
                if not x_var:
                    raise ValueError("x_var must be specified for violin plot")
                fig = px.violin(data, y=x_var, box=True, points="all")
            elif graph == 'heatmap':
                # For heatmap, if x_var and y_var are None, default to correlation matrix
                corr = data.corr()
                fig = px.imshow(corr,
                                text_auto=True,
                                color_continuous_scale='RdBu_r',
                                title='Correlation Heatmap')


            else:
                raise ValueError(f"Unsupported graph type: {graph}")
                    

            fig.update_layout(title=f"{graph.title()} Plot", title_x=0.5)
            fig.show()

        except Exception as e:
            print(f"Error generating {graph} plot: {e}")