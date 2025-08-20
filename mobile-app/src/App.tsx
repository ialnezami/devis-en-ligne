import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from 'react-query';
import { PaperProvider } from 'react-native-paper';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'react-native';

// Store and context
import { store } from './store';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';

// Navigation
import RootNavigator from './navigation/RootNavigator';

// Theme
import { theme } from './constants/theme';

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const App = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <PaperProvider theme={theme}>
            <SafeAreaProvider>
              <ThemeProvider>
                <AuthProvider>
                  <NavigationContainer>
                    <StatusBar
                      barStyle="dark-content"
                      backgroundColor="transparent"
                      translucent
                    />
                    <RootNavigator />
                  </NavigationContainer>
                </AuthProvider>
              </ThemeProvider>
            </SafeAreaProvider>
          </PaperProvider>
        </QueryClientProvider>
      </Provider>
    </GestureHandlerRootView>
  );
};

export default App;
