function EDASL({information, informer}) {
    async function uploadFile() {
        const data = new FormData();
        const f = document.getElementById('uploadFile');
        data.append('dataset', f.files[0]);
        await fetch('/upload', {
            method: 'POST',
            body: data
        }).then(async response => {
            await response.json().then(result => {
                informer(result);
            });
        });
    }

    var nullField = null;
    if(information) {
        information['cols'].every(col => {
            if(information['null values'][col] != 0) {
                nullField = 
                            <div>
                                <span>How to deal with null values: </span>
                                <select>
                                    <option>Drop</option>
                                    <optgroup label = "Fill With">
                                        <option>Mean</option>
                                        <option>Median</option>
                                        <option>Mode</option>
                                        <option>FFill</option>
                                        <option>BFill</option>
                                    </optgroup>
                                </select>
                            </div>

            return false;
            }
            return true;
        });
    }

    return (
        <form>
            <div>
                <input type = "file" id = "uploadFile" />
                <input type = "button" value = "Upload" onClick = {uploadFile}/>
            </div>
            {information && <Details info = {information} />}
            {nullField}
        </form>
    );
}

function Details({info}) {
    var rows = [];

    var colinfo;
    info['cols'].forEach(col => {
        colinfo = info['describe'][col];

        rows.push(
            <tr key = {col}>
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

    return(
        <>
        <p>{info['shape'][0]} rows X {info['shape'][1]} columns</p>
        <p>{info['duplicate(s)']} duplicates were found.</p>
        <table>
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
            <tbody>
                {rows}
            </tbody>
        </table>
        </>
    );
}