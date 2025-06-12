const {useState} = React;

function App() {
    const [nav, setNav] = useState('edasl');
 
    return(
        <>
            <header>MSIL Accelerator</header>
            <aside>
                <Navigation navigator = {setNav}/>
            </aside>
            <Main view = {nav}/>
        </>
    );
}

let rootNode = document.getElementById('root');
let root = ReactDOM.createRoot(rootNode);
root.render(<App />);