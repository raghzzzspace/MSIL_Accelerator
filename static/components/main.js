function Main({view}) {
    var content;
    const [info, setInfo] = useState(null);

    switch(view) {
        case 'edasl':
            content = <EDASL information = {info} informer = {setInfo}/> 
            break;
        case 'edaul':
            content = <EDAUL />
            break;
        case 'classification':
            content = <Classification />
            break;
        case 'regression':
            content = <Regression />
            break;
        case 'timeseries':
            content = <TimeSeries /> 
            break;
        case 'clustering':
            content = <Clustering /> 
            break;
    }

    return(content);
}