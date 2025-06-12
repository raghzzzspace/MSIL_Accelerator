function Navigation({navigator}) {
    
    return (
        <ul>
            <li onClick={() => navigator('edasl')}>Exploratory Data Analysis Supervised Learning</li>
            <li onClick={() => navigator('edaul')}>Exploratory Data Analysis Unsupervised Learning</li>
            <li onClick={() => navigator('classification')}>Classification</li>
            <li onClick={() => navigator('regression')}>Regression</li>
            <li onClick={() => navigator('timeseries')}>Time Series</li>
            <li onClick={() => navigator('clustering')}>Clustering</li>
        </ul>
    );
}