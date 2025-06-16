function EDASL({ information, informer }) {
    const [selectedColumn, setSelectedColumn] = React.useState('');
    const [dataType, setDataType] = React.useState('categorical');
    const [plotType, setPlotType] = React.useState('countplot');
    const [plotData, setPlotData] = React.useState(null);

    // Upload CSV and get descriptive statistics
    async function uploadFile() {
        const data = new FormData();
        const f = document.getElementById('uploadFile');
        data.append('dataset', f.files[0]);
        const response = await fetch('/upload', {
            method: 'POST',
            body: data
        });
        const result = await response.json();
        informer(result);
    }

    // Generate Univariate Plot
    async function generateUnivariatePlot() {
        const response = await fetch('/univariate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                column: selectedColumn,
                type1: dataType,
                type2: plotType
            })
        });

        const result = await response.json();
        setPlotData(result);
    }

    // Render chart after receiving data
    React.useEffect(() => {
        if (!plotData || !plotData.type) return;

        const layout = {
            title: `${plotData.type} of ${selectedColumn}`,
            margin: { t: 40 },
        };

        if (plotData.type === 'countplot' || plotData.type === 'piechart') {
            const labels = Object.keys(plotData.data);
            const values = Object.values(plotData.data);

            if (plotData.type === 'countplot') {
                Plotly.newPlot("plotDiv", [{
                    x: labels,
                    y: values,
                    type: 'bar',
                    marker: { color: '#003366' }
                }], layout);
            } else {
                Plotly.newPlot("plotDiv", [{
                    labels,
                    values,
                    type: 'pie'
                }], layout);
            }

        } else if (plotData.type === 'histogram') {
            Plotly.newPlot("plotDiv", [{
                x: plotData.bins,
                y: plotData.counts,
                type: 'bar',
                marker: { color: '#0066cc' }
            }], layout);

        } else if (plotData.type === 'distplot') {
            Plotly.newPlot("plotDiv", [{
                x: plotData.data,
                type: 'scatter',
                mode: 'lines',
                line: { color: '#28a745' }
            }], layout);

        } else if (plotData.type === 'boxplot') {
            Plotly.newPlot("plotDiv", [{
                y: [...plotData.outliers, plotData.min, plotData.q1, plotData.median, plotData.q3, plotData.max],
                type: 'box',
                boxpoints: 'outliers',
                marker: { color: '#dc3545' }
            }], layout);
        }
    }, [plotData]);

    // Prepare null handling section
    let nullField = null;
    if (information) {
        for (let col of information.cols) {
            if (information['null values'][col] !== 0) {
                nullField = (
                    <div className="null-handler ...">
                        <h3>Handle Null Values</h3>
                        <p>Column: <strong>{col}</strong> has <strong>{information['null values'][col]}</strong> null values.</p>
                        <MissingValues columns={information.cols} />
                    </div>
                );
                break;
            }
        }
    }


    return (
        <form className="eda-form space-y-6 p-4">
            <div className="upload-section">
                <input type="file" id="uploadFile" />
                <input type="button" value="Upload" onClick={uploadFile} className="ml-2 px-4 py-1 bg-blue-600 text-white rounded" />
            </div>

            {information && <Details info={information} />}
            {nullField}

            {/* === Univariate Analysis Section === */}
            {information &&
                <div className="variate-ui">
                    <h3 className="font-semibold text-lg">Univariate Analysis</h3>

                    <select value={selectedColumn} onChange={(e) => setSelectedColumn(e.target.value)}>
                        <option value="">-- Select Column --</option>
                        {information.cols.map(col => (
                            <option key={col} value={col}>{col}</option>
                        ))}
                    </select>

                    <select value={dataType} onChange={(e) => {
                        setDataType(e.target.value);
                        setPlotType(e.target.value === 'categorical' ? 'countplot' : 'histogram');
                    }}>
                        <option value="categorical">Categorical</option>
                        <option value="numerical">Numerical</option>
                    </select>

                    <select value={plotType} onChange={(e) => setPlotType(e.target.value)}>
                        {dataType === 'categorical' ? (
                            <>
                                <option value="countplot">Count Plot</option>
                                <option value="piechart">Pie Chart</option>
                            </>
                        ) : (
                            <>
                                <option value="histogram">Histogram</option>
                                <option value="distplot">Dist Plot</option>
                                <option value="boxplot">Box Plot</option>
                            </>
                        )}
                    </select>

                    <button type="button" onClick={generateUnivariatePlot} className="ml-4 px-3 py-1 bg-green-600 text-white rounded">
                        Generate Plot
                    </button>

                    <div id="plotDiv" style={{ marginTop: '30px' }}></div>
                </div>
            }

            {/* === Bivariate Analysis Section === */}
            {information && <MultivariateTool columns={information.cols} />}
        </form>
    );
}


function Details({ info }) {
    const rows = info['cols'].map(col => {
        const colinfo = info['describe'][col];
        return (
            <tr key={col}>
                <td>{col}</td>
                <td>{colinfo['25%']}</td>
                <td>{colinfo['50%']}</td>
                <td>{colinfo['75%']}</td>
                <td>{colinfo['count']}</td>
                <td>{colinfo['freq']}</td>
                <td>{colinfo['max']}</td>
                <td>{colinfo['mean']}</td>
                <td>{colinfo['min']}</td>
                <td>{colinfo['std']}</td>
                <td>{colinfo['top']}</td>
                <td>{colinfo['unique']}</td>
                <td>{info['null values'][col]}</td>
            </tr>
        );
    });

    return (
        <div className="eda-details">
            <h3><strong>Data Overview</strong></h3>
            <p><strong>{info['shape'][0]}</strong> rows × <strong>{info['shape'][1]}</strong> columns</p>
            <p><strong>{info['duplicates']}</strong> duplicate(s) were found.</p>
            <div className="table-container">
                <table className="eda-table">
                    <thead>
                        <tr>
                            <th>Column</th>
                            <th>25%</th>
                            <th>50%</th>
                            <th>75%</th>
                            <th>Count</th>
                            <th>Frequency</th>
                            <th>Max</th>
                            <th>Mean</th>
                            <th>Min</th>
                            <th>Standard Deviation</th>
                            <th>Top</th>
                            <th>Unique</th>
                            <th>Null Values</th>
                        </tr>
                    </thead>
                    <tbody>{rows}</tbody>
                </table>
            </div>
        </div>
    );
}


function MultivariateTool({ columns }) {
    const [type1, setType1] = React.useState('numerical');
    const [type2, setType2] = React.useState('numerical');
    const [type3, setType3] = React.useState('scatterplot');
    const [x, setX] = React.useState('');
    const [y, setY] = React.useState('');
    const [cols, setCols] = React.useState([]);
    const [plotData, setPlotData] = React.useState(null);

    async function fetchMultivariate() {
        const payload = {
            type3,
            no_of_col_to_do_analysis: cols.length,
            chosen_cols: {}
        };

        if (type3 === 'pairplot') {
            payload.chosen_cols.cols = cols;
        } else {
            payload.type1 = type1;
            payload.type2 = type2;
            payload.chosen_cols.x = x;
            payload.chosen_cols.y = y;
        }

        const response = await fetch('/multivariate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await response.json();
        setPlotData(result);
    }

    React.useEffect(() => {
        if (!plotData || !plotData.type) return;
        const container = document.getElementById("multiPlotDiv");
        container.innerHTML = "";

        const layout = { title: `${plotData.type}` };

        if (plotData.type === 'scatterplot' || plotData.type === 'lineplot') {
            Plotly.newPlot("multiPlotDiv", [{
                x: plotData.x,
                y: plotData.y,
                type: 'scatter',
                mode: plotData.type === 'scatterplot' ? 'markers' : 'lines+markers',
                marker: { color: '#007bff' }
            }], layout);

        } else if (plotData.type === 'barplot') {
            Plotly.newPlot("multiPlotDiv", [{
                x: plotData.labels,
                y: plotData.values,
                type: 'bar',
                marker: { color: '#28a745' }
            }], layout);

        } else if (plotData.type === 'boxplot' || plotData.type === 'displot') {
            const traces = plotData.series.map((arr, i) => ({
                y: arr,
                name: plotData.labels[i],
                type: plotData.type === 'boxplot' ? 'box' : 'scatter',
                mode: 'lines',
            }));
            Plotly.newPlot("multiPlotDiv", traces, layout);

        } else if (plotData.type === 'pairplot') {
            plotData.cols.forEach(colX => {
                plotData.cols.forEach(colY => {
                    const xData = plotData.rows.map(row => row[colX]);
                    const yData = plotData.rows.map(row => row[colY]);

                    const plotId = `${colX}_${colY}_plot`;
                    const plotDiv = document.createElement("div");
                    plotDiv.id = plotId;
                    plotDiv.style.marginBottom = "40px";
                    container.appendChild(plotDiv);

                    Plotly.newPlot(plotId, [{
                        x: xData,
                        y: yData,
                        mode: 'markers',
                        type: 'scatter',
                        name: `${colX} vs ${colY}`,
                        marker: { color: '#17a2b8' }
                    }], {
                        title: `${colX} vs ${colY}`,
                        height: 400,
                        width: 400
                    });
                });
            });

        } else if (plotData.type === 'heatmap') {
            Plotly.newPlot("multiPlotDiv", [{
                z: plotData.matrix,
                x: plotData.xLabels,
                y: plotData.yLabels,
                type: 'heatmap',
                colorscale: 'Viridis'
            }], layout);

        } else if (plotData.type === 'clustermap') {
            Plotly.newPlot("multiPlotDiv", [{
                z: plotData.matrix,
                x: plotData.xLabels,
                y: plotData.yLabels,
                type: 'heatmap',
                colorscale: 'Cividis'
            }], layout);
        }

    }, [plotData]);

    return (
        <div className="variate-ui">
            <h3>Bivariate Analysis</h3>

            <label>Type 3 (Plot Type):</label>
            <select value={type3} onChange={(e) => {
                setType3(e.target.value);
                setX('');
                setY('');
                setCols([]);
            }}>
                <option value="scatterplot">Scatterplot</option>
                <option value="lineplot">Lineplot</option>
                <option value="barplot">Barplot</option>
                <option value="boxplot">Boxplot</option>
                <option value="displot">Displot</option>
                <option value="pairplot">Pairplot</option>
                <option value="heatmap">Heatmap</option>
                <option value="clustermap">Clustermap</option>
            </select>

            {type3 !== 'pairplot' && (
                <>
                    <label>Type 1:</label>
                    <select value={type1} onChange={(e) => setType1(e.target.value)}>
                        <option value="numerical">Numerical</option>
                        <option value="categorical">Categorical</option>
                    </select>

                    <label>Type 2:</label>
                    <select value={type2} onChange={(e) => setType2(e.target.value)}>
                        <option value="numerical">Numerical</option>
                        <option value="categorical">Categorical</option>
                    </select>

                    <label>X Axis:</label>
                    <select value={x} onChange={(e) => setX(e.target.value)}>
                        <option value="">Select X</option>
                        {columns.map(col => <option key={col}>{col}</option>)}
                    </select>

                    <label>Y Axis:</label>
                    <select value={y} onChange={(e) => setY(e.target.value)}>
                        <option value="">Select Y</option>
                        {columns.map(col => <option key={col}>{col}</option>)}
                    </select>
                </>
            )}

            {type3 === 'pairplot' && (
                <>
                    <label>Select Columns for Pairplot:</label>
                    <select multiple onChange={(e) => {
                        const selected = Array.from(e.target.selectedOptions, o => o.value);
                        setCols(selected);
                    }}>
                        {columns.map(col => <option key={col}>{col}</option>)}
                    </select>
                </>
            )}

            <button
                type="button"
                onClick={(e) => {
                    e.preventDefault();
                    fetchMultivariate();
                }}
            >
                Generate Multivariate Plot
            </button>

            <div id="multiPlotDiv" style={{ marginTop: '30px' }}></div>
        </div>
    );
}


function MissingValues({ columns }) {
    const [selectedColumn, setSelectedColumn] = React.useState('');
    const [fillMethod, setFillMethod] = React.useState('mean');
    const [dataType, setDataType] = React.useState('numerical');

    async function handleFillMissing() {
        if (!selectedColumn || !dataType) {
            alert("Please select a column and data type.");
            return;
        }

        const response = await fetch('/fill_missing', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: dataType,
                column: selectedColumn,
                method: fillMethod
            })
        });

        const result = await response.json();
        alert(result.message);
    }

    return (
        <div className="p-4 bg-white shadow rounded-xl mt-4 space-y-4">
            <h2 className="text-xl font-semibold">Fill Missing Values</h2>

            <div className="flex flex-col gap-2">
                <label>Select Column:</label>
                <select value={selectedColumn} onChange={e => setSelectedColumn(e.target.value)} className="p-2 border rounded">
                    <option value="">-- Select Column --</option>
                    {columns.map((col, i) => (
                        <option key={i} value={col}>{col}</option>
                    ))}
                </select>
            </div>

            <div className="flex flex-col gap-2">
                <label>Data Type:</label>
                <select value={dataType} onChange={e => setDataType(e.target.value)} className="p-2 border rounded">
                    <option value="numerical">Numerical</option>
                    <option value="categorical">Categorical</option>
                </select>
            </div>

            <div className="flex flex-col gap-2">
                <label>Fill Method:</label>
                <select value={fillMethod} onChange={e => setFillMethod(e.target.value)} className="p-2 border rounded">
                    {dataType === 'numerical' ? (
                        <>
                            <option value="mean">Mean</option>
                            <option value="median">Median</option>
                            <option value="arbitrary">Arbitrary</option>
                            <option value="random">Random</option>
                            <option value="end_of_distribution">End of Distribution</option>
                            <option value="knn">KNN Imputation</option>
                            <option value="iterative">Iterative Imputation</option>
                        </>
                    ) : (
                        <>
                            <option value="mode">Mode</option>
                            <option value="missing">Fill with 'Missing'</option>
                            <option value="ffill">Forward Fill</option>
                            <option value="bfill">Backward Fill</option>
                            <option value="random">Random Imputation</option>
                            <option value="missing_indicator">Add Missing Indicator</option>
                            <option value="knn">KNN Imputation</option>
                            <option value="iterative">Iterative Imputation</option>
                        </>
                    )}
                </select>
            </div>

            <button onClick={handleFillMissing} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                Fill Missing Values
            </button>
        </div>
    );
}
