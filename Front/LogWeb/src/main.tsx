import 'bootstrap/dist/css/bootstrap.min.css';

import { createRoot } from 'react-dom/client';
import App from "./App";
import * as React from 'react';


const container = document.getElementById('root');
if (!container) {
    throw new Error ('Root container missing in index.html')
}
createRoot(container).render(  
        <App />
    
);