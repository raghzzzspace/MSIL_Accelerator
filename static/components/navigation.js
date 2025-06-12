// function Navigation({navigator}) {
    
//     return (
//         <ul>
//             <li onClick={() => navigator('edasl')}>Exploratory Data Analysis Supervised Learning</li>
//             <li onClick={() => navigator('edaul')}>Exploratory Data Analysis Unsupervised Learning</li>
//             <li onClick={() => navigator('classification')}>Classification</li>
//             <li onClick={() => navigator('regression')}>Regression</li>
//             <li onClick={() => navigator('timeseries')}>Time Series</li>
//             <li onClick={() => navigator('clustering')}>Clustering</li>
//         </ul>
//     );
// }


function Navigation({ navigator }) {
    return (
        <div className="sidebar">
            <h2>Analytics</h2>
            <ul className="nav-list">
                <li className="nav-item" onClick={() => navigator('edasl')}>
                    Exploratory Data Analysis Supervised Learning
                </li>
                <li className="nav-item" onClick={() => navigator('edaul')}>
                    Exploratory Data Analysis Unsupervised Learning
                </li>
                <li className="nav-item" onClick={() => navigator('classification')}>
                    Classification
                </li>
                <li className="nav-item" onClick={() => navigator('regression')}>
                    Regression
                </li>
                <li className="nav-item" onClick={() => navigator('timeseries')}>
                    Time Series
                </li>
                <li className="nav-item" onClick={() => navigator('clustering')}>
                    Clustering
                </li>
            </ul>
        </div>
    );
}

export default Navigation;
// import React, { useState } from 'react';