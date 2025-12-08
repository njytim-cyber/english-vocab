
import { GameProvider } from './contexts/GameContext';
import { NavigationProvider } from './contexts/NavigationContext';
import Router from './Router';
import ErrorBoundary from './components/ErrorBoundary';

export default function App() {
    return (
        <ErrorBoundary>
            <GameProvider>
                <NavigationProvider>
                    <Router />
                </NavigationProvider>
            </GameProvider>
        </ErrorBoundary>
    );
}

