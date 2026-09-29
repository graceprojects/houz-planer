import React from 'react';
import {createRoot} from 'react-dom/client';
import Planner from '../app/planner/Planner';
import '../app/globals.css';
createRoot(document.getElementById('root')!).render(<Planner/>);
